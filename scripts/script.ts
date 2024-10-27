import { get_channel } from "./arena";
import { createPanZoom } from "./panzoom/panzoom.js"
import { render, mut, mem, sig, html, mounted, eff_on } from "./solid_monke/solid_monke.js"
import { drag } from "./drag.js";

let channel_slug = "reading-week-fall-2024"

let selected = sig([])
let channel = mut({ contents: [] })
let size = 500

let small_box = document.querySelector(".small-box")
let recter = document.querySelector(".small-box-recter") as HTMLElement

let panzoom = createPanZoom(small_box, {})

type RectEvent = (x: number, y: number, w: number, h: number) => void
let rect_event: (null | RectEvent) = null

let rectange_maker = (elem) => {
	// For panning (translate)
	let lastPosX: number, lastPosY: number;					// Needed because of decimals 
	let parentScale: number; 						// Needed for avoid calculate every pointermove
	let ogX: number, ogY: number;							// Needed for avoid calculate every pointermove

	let rect: HTMLElement | null = null

	elem.addEventListener("pointerdown", handle_pointerdown);
	elem.addEventListener("pointerup", handle_pointerup);
	elem.addEventListener("pointermove", handle_pointermove);

	function do_move(deltaX: number, deltaY: number) {
		lastPosX += deltaX;		// Needed because of decimals
		lastPosY += deltaY;		// Needed because of decimals
		let w: number, h: number, x: number, y: number

		if (lastPosX > ogX) { w = lastPosX - ogX; x = ogX }
		else { w = ogX - lastPosX; x = lastPosX }

		if (lastPosY > ogY) { h = lastPosY - ogY; y = ogY }
		else { h = ogY - lastPosY; y = lastPosY }

		if (rect) {
			rect.style.width = w + "px"
			rect.style.height = h + "px"
			rect.style.left = x + "px"
			rect.style.top = y + "px"
		}
	}


	function handle_pointerdown(e) {
		if (e.target !== e.currentTarget) return;
		e.preventDefault(); e.stopPropagation();

		e.target.style.cursor = 'crosshair'

		ogX = e.offsetX; ogY = e.offsetY;
		lastPosX = ogX; lastPosY = ogY;

		const { width: pwidth1 } = e.target.parentNode.getBoundingClientRect();
		const pwidth2 = e.target.parentNode.offsetWidth;
		parentScale = pwidth1 / pwidth2;

		let bor = 10

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

		if (rect) {
			let x = parseFloat(rect.style.left)
			let y = parseFloat(rect.style.top)
			let w = parseFloat(rect.style.width)
			let h = parseFloat(rect.style.height)

			rect?.remove()
			rect = null

			recter.style.display = "none"
			panzoom.resume()

			if ("function" == typeof rect_event) rect_event(x, y, w, h)
		}

	}
}

rectange_maker(recter)

type BlockCache = {
	pos: {
		x: number,
		y: number
	}
}

get_channel(channel_slug).then((c) => {
	let blocks_cache = localStorage.getItem(channel_slug)
	if (blocks_cache) {
		let blocks: BlockCache = JSON.parse(blocks_cache)
		Object.entries(blocks).forEach(([id, pos]) => {
			let block = c.contents.find((b) => b.id == parseInt(id))
			block.x = pos.x
			block.y = pos.y
		})
	}

	channel.contents = c.contents

})

let panning = sig(true);

function intersecting(a, b) {
	return (a.left <= b.right &&
		b.left <= a.right &&
		a.top <= b.bottom &&
		b.top <= a.bottom)
}

let intersecting_blocks = (x, y, w, h) => {
	channel.contents.forEach((block) => {
		let elem = document.getElementById("block-" + block.id)
		if (!elem) return

		let rect = {
			left: parseFloat(elem.style.left),
			top: parseFloat(elem.style.top),
			right: parseFloat(elem.style.left) + size,
			bottom: parseFloat(elem.style.top) + size
		}

		let other = {
			left: x,
			top: y,
			right: x + w,
			bottom: y + h
		}

		if (intersecting(rect, other)) selected.set([...selected(), block.id])

	})
	group_selected()
}

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

	let block_selected = mem(() => selected().includes(block.id))
	let style = mem(() => `left:${x()}px; top:${y()}px; width:${size}px; height:${size}px;background-color:${block_selected() ? "red" : "white"}`)

	if (block.class == "Text") return TextBlock(block, style, onmount)
	if (block.class == "Image" || block.class == "Link") return ImageBlock(block, style, onmount)
}

const ImageBlock = (block, style: Function, onmount: () => void) => {
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
	}

	if (e.key === "z") {
		if (recter.style.display == "block") {
			recter.style.display = "none"
			panzoom.resume()
		} else {
			rect_event = (x, y, w, h) => {
				let r = {
					top: y,
					left: x,
					right: x + w,
					bottom: y + h
				}

				panzoom.showRectangle(r)
			}
			recter.style.display = "block"
			panzoom.pause()
		}
	}

	if (e.key === "v") {
		if (recter.style.display == "block") {
			recter.style.display = "none"
			panzoom.resume()
		} else {
			rect_event = intersecting_blocks
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

	if (e.key === "Escape") {
		selected.set([])
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

function group_selected() {
	let group_elem = document.createElement('div');
	group_elem.style.position = 'absolute';

	//TODO: Grouping works but have to consider also already grouped blocks will have position relative to the group
	let selected_elems = selected().map((id) => document.getElementById("block-" + id));
	selected.set([])

	let lefts = selected_elems.map((elem) => parseFloat(elem.style.left));
	let tops = selected_elems.map((elem) => parseFloat(elem.style.top));

	let lowest_x = Math.min(...lefts);
	let lowest_y = Math.min(...tops);

	let end_xs = selected_elems.map((elem) => parseFloat(elem.style.left) + parseFloat(elem.style.width));
	let end_ys = selected_elems.map((elem) => parseFloat(elem.style.top) + parseFloat(elem.style.height));

	let highest_x = Math.max(...end_xs);
	let highest_y = Math.max(...end_ys);

	group_elem.style.left = lowest_x + "px";
	group_elem.style.top = lowest_y + "px";
	group_elem.style.width = highest_x - lowest_x + "px";
	group_elem.style.height = highest_y - lowest_y + "px";
	group_elem.style.backgroundColor = "rgba(0, 0, 0, 0.1)";

	selected_elems.forEach((elem) => {
		elem.style.left = parseFloat(elem.style.left) - lowest_x + "px";
		elem.style.top = parseFloat(elem.style.top) - lowest_y + "px";
		group_elem.appendChild(elem);
	});

	small_box?.appendChild(group_elem);
	drag(group_elem, { set_left: (left) => { group_elem.style.left = left + "px"; }, set_top: (top) => { group_elem.style.top = top + "px"; } });
}

render(Channel, document.querySelector(".small-box"))
