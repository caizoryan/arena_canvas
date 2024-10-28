import { get_channel } from "./arena.ts";
import { createPanZoom } from "./panzoom/panzoom.js"
import { render, mut, mem, sig, html, mounted, eff_on } from "./solid_monke/solid_monke.js"
import { drag } from "./drag.js";
import { CanvasStore } from "./canvas_store.ts";

let channel_slug = "reading-week-fall-2024"

let selected = sig([])
let channel: CanvasStore = mut(new CanvasStore())
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

		c.contents.forEach((block) => {
			let pos
			if (blocks[block.id]) {
				console.log("found block", blocks[block.id])
				let x = blocks[block.id].x
				let y = blocks[block.id].y
				pos = { x, y }
			}

			if (block.class == "Channel") {
				channel.add_channel_as_node(block, pos)
			} else if (block.base_class == "Block") {
				console.log("adding block pos", pos)
				channel.add_block_as_node(block)
			}
		})

	}

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
		if (block.class == "Group") return

		let id = block.id
		let in_group = channel.check_if_node_in_group(id)

		let global_pos = channel.get_global_position(id)
		let dimension = channel.get_dimensions(id)

		if (in_group) {
			console.log("in group")
			return
		}

		if (!global_pos || !dimension) return

		let rect = {
			left: global_pos.x,
			top: global_pos.y,
			right: global_pos.x + dimension.width,
			bottom: global_pos.y + dimension.height
		}

		let other = {
			left: x,
			top: y,
			right: x + w,
			bottom: y + h
		}

		if (intersecting(rect, other)) selected.set([...selected(), block.id])
	})

	console.log("intersecting blocks", selected())
}

const Group = (group) => {
	console.log("group", group)
	let x = mem(() => group.x)
	let y = mem(() => group.y)
	let width = mem(() => group.width)
	let height = mem(() => group.height)

	let children_nodes = mem(() => group.children.map((id) => channel.get_node(id)))

	let onmount = () => {
		let elem = document.getElementById("group-" + group.id)
		console.log("group elem", elem)
		drag(elem, { set_left: (x) => { group.x = x }, set_top: (y) => { group.y = y } })
	}

	mounted(onmount)

	let style = mem(() => `left:${x()}px; top:${y()}px; width:${width()}px; height:${height()}px;background-color:rgba(0, 0, 0, 0.1)`)

	return html`
	.block.group [style=${style} id=${"group-" + group.id}] 
		each of ${children_nodes} as ${b => Block(b, true)}`

}

const Block = (block, grouped = false) => {
	if (channel.check_if_node_in_group(block.id) && !grouped) {
		console.log("block exists in group", block.id)
		return null
	}

	if (block.base_class == "Group") return Group(block)
	let node = channel.get_node(block.id)
	if (!node) return

	let x = mem(() => node.x)
	let y = mem(() => node.y)
	let width = mem(() => node.width)
	let height = mem(() => node.height)

	let set_x = (x) => {
		let node = channel.get_node(block.id)
		if (node) { node.x = x }
	}

	let set_y = (y) => {
		let node = channel.get_node(block.id)
		if (node) { node.y = y }
	}

	let onmount = () => {
		let elem = document.getElementById("block-" + block.id)
		drag(elem, { set_left: set_x, set_top: set_y })
	}

	let block_selected = mem(() => selected().includes(block.id))
	let style = mem(() => `left:${x()}px; top:${y()}px; width:${width()}px; height:${height()}px;background-color:${block_selected() ? "red" : "white"}`)

	if (block.class == "Text") return TextBlock(block, style, onmount)
	if (block.class == "Image" || block.class == "Link") return ImageBlock(block, style, onmount)
}

const ImageBlock = (block, style: Function, onmount: () => void) => {
	let image = block.source.image

	mounted(onmount)

	let s = "width:100%"

	return html`
	.block.image [style=${style} id=${"block-" + block.id}] 
		img [src=${image.display.url} style=${s}]`
}

const TextBlock = (block, style, onmount) => {
	let content = block.source.content

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
	if (e.key === "g") {
		group_selected()

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

function uid() {
	return Date.now() + Math.floor(Math.random() * 1000)
}

function group_selected() {
	let group_elem = document.createElement('div');
	group_elem.style.position = 'absolute';

	//TODO: Grouping works but have to consider also already grouped blocks will have position relative to the group
	let selected_elems = [...selected()];
	console.log("selected elems", selected_elems)
	selected.set([])

	let lefts = selected_elems.map((id) => channel.get_global_position(id).x);
	let tops = selected_elems.map((id) => channel.get_global_position(id).y);

	let lowest_x = Math.min(...lefts);
	let lowest_y = Math.min(...tops);

	let end_xs = selected_elems.map((id) => {
		let node = channel.get_box(id);
		return node?.right
	});

	let end_ys = selected_elems.map((id) => {
		let node = channel.get_box(id);
		return node?.bottom
	});

	let highest_x = Math.max(...end_xs);
	let highest_y = Math.max(...end_ys);

	channel.add_group_as_node(
		uid(),
		selected_elems,
		{ x: lowest_x, y: lowest_y },
		{ width: highest_x - lowest_x, height: highest_y - lowest_y },
	)

	selected_elems.forEach((id) => {
		let node = channel.get_node(id);
		if (!node) return
		node.x = node.x - lowest_x;
		node.y = node.y - lowest_y;
	});
}

render(Channel, document.querySelector(".small-box"))
