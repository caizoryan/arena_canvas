import { get_channel } from "./arena.js";
import { createPanZoom } from "./panzoom/panzoom.js"
import { render, mut, mem, sig, html, mounted, eff_on } from "./solid_monke/solid_monke.js"
import { drag } from "./drag.js";

let channel_slug = "reading-week-fall-2024"

let channel = mut({ contents: [] })
let size = 500

let lastPosX = 0;
let lastPosY = 0;

let small_box = document.querySelector(".small-box")
let recter = document.querySelector(".small-box-recter") as HTMLElement
let panzoom = createPanZoom(small_box, {})
let rected = {
	x: 0,
	y: 0,
	width: 0,
	height: 0
}

let rectange_maker = (elem) => {
	// For panning (translate)
	let lastPosX, lastPosY;					// Needed because of decimals 
	let parentScale; 						// Needed for avoid calculate every pointermove
	let ogX, ogY;							// Needed for avoid calculate every pointermove

	let rect
	elem.addEventListener("pointerdown", handle_pointerdown);
	elem.addEventListener("pointerup", handle_pointerup);
	elem.addEventListener("pointermove", handle_pointermove);

	function do_move(deltaX, deltaY) {
		lastPosX += deltaX;		// Needed because of decimals
		lastPosY += deltaY;		// Needed because of decimals
		let w, h, x, y

		if (lastPosX > ogX) {
			w = lastPosX - ogX;
			x = ogX
		} else {
			w = ogX - lastPosX;
			x = lastPosX
		}
		if (lastPosY > ogY) {
			h = lastPosY - ogY;
			y = ogY
		} else {
			h = ogY - lastPosY;
			y = lastPosY
		}

		rect.style.width = w + "px"
		rect.style.height = h + "px"
		rect.style.left = x + "px"
		rect.style.top = y + "px"
	}


	function handle_pointerdown(e) {
		if (e.target !== e.currentTarget) return;
		e.preventDefault();
		e.stopPropagation();

		e.target.style.cursor = 'none'

		// Set Last Element Position. Needed because event offset doesn't have decimals. And decimals will be needed when dragging
		ogX = e.offsetX;
		ogY = e.offsetY;
		lastPosX = e.offsetX;
		lastPosY = e.offsetY;

		// Set Position Bounds
		const { width: pwidth1 } = e.target.parentNode.getBoundingClientRect();
		const pwidth2 = e.target.parentNode.offsetWidth;
		parentScale = pwidth1 / pwidth2;

		let bor = 5

		rect = document.createElement("div")
		rect.style.position = "absolute"
		rect.style.left = e.offsetX + "px"
		rect.style.top = e.offsetY + "px"
		rect.style.width = "0px"
		rect.style.height = "0px"
		rect.style.border = bor + "px solid black"
		rect.id = "rect"

		small_box?.appendChild(rect)

		e.target.setPointerCapture(e.pointerId);	// https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API
	}

	function handle_pointermove(e) {
		if (e.target !== e.currentTarget) return;
		if (!e.target.hasPointerCapture(e.pointerId)) return;
		e.preventDefault();
		e.stopPropagation();

		const deltaX = e.movementX / parentScale;// vvpScale It's pinch default gesture zoom (Android). Ignore in Desktop
		const deltaY = e.movementY / parentScale;// vvpScale It's pinch default gesture zoom (Android). Ignore in Desktop

		do_move(deltaX, deltaY);
	}

	function handle_pointerup(e) {
		e.preventDefault();
		e.stopPropagation();
		e.target.style.cursor = ''
		e.target.releasePointerCapture(e.pointerId);


		// display none for recter
		// panzoom resume
		// panzoom zoom to rect

		let x = parseFloat(rect.style.left)
		let y = parseFloat(rect.style.top)
		let w = parseFloat(rect.style.width)
		let h = parseFloat(rect.style.height)

		rect?.remove()
		rect = null

		recter.style.display = "none"
		panzoom.resume()
		panzoom.showRectangle({
			top: y,
			left: x,
			right: x + w,
			bottom: y + h
		})
	}
}

rectange_maker(recter)

get_channel(channel_slug).then((c) => {
	let blocks = localStorage.getItem(channel_slug)
	if (blocks) {
		blocks = JSON.parse(blocks)
		Object.entries(blocks).forEach(([id, pos]) => {
			let block = c.contents.find((b) => b.id == id)
			block.x = pos.x
			block.y = pos.y
		})
	}

	channel.contents = c.contents

})

let panning = sig(true);

let css = {}

const Block = (block, i) => {
	let x = sig(i() % 10 * size + 10)
	let y = sig(Math.floor(i() / 10) * size)

	if (block.x) x.set(parseFloat(block.x))
	if (block.y) y.set(parseFloat(block.y))

	let onmount = () => {
		let elem = document.getElementById("block-" + block.id)
		drag(elem, { set_left: x.set, set_top: y.set })
	}

	let style = mem(() => `left:${x()}px; top:${y()}px; width:${size}px; height:${size}px;`)

	if (block.class == "Text") return TextBlock(block, style, onmount)
	if (block.class == "Image" || block.class == "Link") return ImageBlock(block, style, onmount)
}

const ImageBlock = (block, style, onmount) => {
	let image = block.image
	css[block.id] = style
	mounted(onmount)
	let s = "width:" + size + "px;"
	return html`
.block.image [style=${style} id=${"block-" + block.id}] 
	img [src=${image.display.url} style=${s}]`
}

const TextBlock = (block, style, onmount) => {
	let content = block.content
	css[block.id] = style
	mounted(onmount)
	return html`.block.text [style=${style} id=${"block-" + block.id}] -- ${content}`
}

const Channel = () => {
	return html`each of ${mem(() => channel.contents)} as ${Block}`
}

function save_block_coordinates() {
	let blocks = {}
	document.querySelectorAll(".block").forEach((block) => {
		let id = block.id.split("-")[1]
		blocks[id] = { x: block.style.left, y: block.style.top }
	})

	localStorage.setItem(channel_slug, JSON.stringify(blocks))
}

document.addEventListener("keydown", (e) => {
	if (e.key === "h") {
		if (recter.style.display == "block") {
			recter.style.display = "none"
			panzoom.resume()
		} else {
			recter.style.display = "block"
			panzoom.pause()
		}
	}

	if (e.key == "=" && (e.metaKey || e.ctrlKey)) {
		e.preventDefault()
	}

	if (e.key == "-" && (e.metaKey || e.ctrlKey)) {
		e.preventDefault()
	}

	if (e.key === "1") {
	}

	if (e.key === "2") {
	}

	if (e.key === "ArrowRight") {
	}

	if (e.key === "ArrowLeft") {
	}

	if (e.key === "ArrowDown") {
	}

	if (e.key === "ArrowUp") {
	}

	if (e.key === "s") {
		save_block_coordinates()
	}
})

render(Channel, document.querySelector(".small-box"))
