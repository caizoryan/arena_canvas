import { get_channel } from "./arena.ts";
import { createPanZoom } from "./panzoom/panzoom.js"
import { render, mut, mem, sig, html, mounted, eff_on } from "./solid_monke/solid_monke.js"
import { drag } from "./drag.js";
import { CanvasPolyline, CanvasStore } from "./canvas_store.ts";
import { MD } from "./md.js";

let channel_slug = "isp-presenting"

let selected = sig([])

let store: CanvasStore = mut(new CanvasStore())

let current_block_id = sig(null)
let current_group_id = sig(null)
let current_line_id = sig(null)

let selector = (type, id) => {
	if (type == "block") {
		current_block_id.set(id)
		current_group_id.set(null)
		current_line_id.set(null)
	}
	if (type == "group") {
		current_group_id.set(id)
		current_block_id.set(null)
		current_line_id.set(null)
	}
	if (type == "line") {
		current_line_id.set(id)
		current_group_id.set(null)
		current_block_id.set(null)
	}
}

let current_block = mem(() => store.get_node(current_block_id()))

let small_box = document.querySelector(".small-box")

let recter = document.querySelector(".small-box-recter") as HTMLElement
let recter_on = sig(false)

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
			recter_on.set(false)

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
	console.log("", c)
	let blocks: BlockCache
	if (blocks_cache) {
		blocks = JSON.parse(blocks_cache)
	}

	c.contents.forEach((block) => {
		let pos

		if (blocks) {
			let x = blocks[block.id].x
			let y = blocks[block.id].y
			pos = { x: parseInt(x), y: parseInt(y) }
		}

		if (block.class == "Channel") {
			store.add_channel_as_node(block, pos)
		} else if (block.base_class == "Block") {
			console.log("adding block pos", pos)
			store.add_block_as_node(block)
		}
	})

})

let panning = sig(true);
let edit = sig(true)

function intersecting(a, b) {
	return (a.left <= b.right &&
		b.left <= a.right &&
		a.top <= b.bottom &&
		b.top <= a.bottom)
}

let intersecting_blocks = (x, y, w, h) => {
	store.contents.forEach((block) => {
		if (block.class == "Group") return

		let id = block.id
		let in_group = store.check_if_node_in_group(id)

		let global_pos = store.get_global_position(id)
		let dimension = store.get_dimensions(id)

		if (!global_pos || !dimension || in_group) return

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
}

const Group = (group) => {
	let x = mem(() => group.x)
	let y = mem(() => group.y)
	let width = mem(() => group.width)
	let height = mem(() => group.height)

	let children_nodes = mem(() => group.children.map((id) => store.get_node(id)))

	let onmount = () => {
		let elem = document.getElementById("group-" + group.id)
		drag(elem, { set_left: (x) => { group.x = x }, set_top: (y) => { group.y = y } })
		elem.onmouseover = () => { selector("group", group.id) }
	}

	mounted(onmount)

	let style = mem(() => `
		left: ${x()}px;
		top: ${y()}px;
		width: ${width()}px;
		height: ${height()}px;
		background-color: rgba(0, 0, 0, 0.1)
	`)

	return html`
	.block.group [style=${style} id=${"group-" + group.id}] 
		each of ${children_nodes} as ${b => Block(b, true)}`
}

const State = () => {
	let mode = mem(() => panning() ? "Panning" : "Selecting")
	let recter_on_is = mem(() => recter_on() ? "on" : "off")
	return html`
		.state
			p -- Mode (v): ${mode}
			p -- Recter (z/s):${recter_on_is}
			p -- ${current_block_id}
		`
}


const Block = (block, grouped = false) => {
	if (store.check_if_node_in_group(block.id) && !grouped) { return null }
	if (block.base_class == "Group") return Group(block)

	let node = store.get_node(block.id)
	if (!node) return

	let x = mem(() => node.x)
	let y = mem(() => node.y)
	let width = mem(() => node.width)
	let height = mem(() => node.height)

	let set_x = (x: number) => node.x = x
	let set_y = (y: number) => node.y = y

	let onmount = () => {
		let elem = document.getElementById("block-" + block.id)
		drag(elem, { set_left: set_x, set_top: set_y, pan_switch: panning })
		elem.onmouseover = () => { selector("block", block.id) }
	}

	let block_selected = mem(() => selected().includes(block.id))
	let current_block = mem(() => current_block_id() == block.id)
	let style = mem(() => `left:${x()}px; top:${y()}px; width:${width()}px; height:${height()}px;background-color:${block_selected() ? "red" : "white"}; border: ${current_block() ? "2px solid black" : "none"}`)

	if (block.class == "Text") return TextBlock(block, style, onmount)
	if (block.class == "Image" || block.class == "Link") return ImageBlock(block, style, onmount)
	if (block.class == "Attachment") return AttachmentBlock(block, style, onmount)
}

const AttachmentBlock = (block, style: Function, onmount: () => void) => {
	if (!block.source.attachment) return null
	console.log("attaches block", block.source.attachment)
	console.log("attaches block url", block.source.attachment.url)

	mounted(onmount)
	let s = "width:100%"

	return html`
		.block.attachment [style=${style} id=${"block-" + block.id}]
			video [style=${s} src=${block.source.attachment.url} controls=true autoplay=true loop=true]`
}

const ImageBlock = (block, style: Function, onmount: () => void) => {
	let image = block.source.image

	mounted(onmount)
	let s = "width:100%"

	return html`
		.block.image[style = ${style} id = ${"block-" + block.id}]
			img[src = ${image.display.url} style = ${s}]`
}

const TextBlock = (block, style, onmount) => {
	let content = block.source.content

	mounted(onmount)
	return html`.block.text[style = ${style} id = ${"block-" + block.id}]--${MD(content)} `
}

const Line = (line: CanvasPolyline) => {
	let selected = mem(() => current_line_id() == line.id)

	let coords = mem(() => line.points.list.map((point) => {
		return `${point.x},${point.y}`
	}).join(" "))

	let style = mem(() => `fill:none;stroke:black;stroke-width:2; stroke:${selected() ? "red" : "black"}`)

	return html`polyline [points=${coords}  style=${style} ]`
}

const LineEditor = (line: CanvasPolyline) => {
	return html`
		each of ${line.points.list} as ${(point, i) => PointRect(point, i, line)}
`
}

const PointRect = (point, i, line) => {
	let x = mem(() => point.x)
	let y = mem(() => point.y)
	let id = "point-" + i() + line.id

	let onmount = () => {
		let elem = document.getElementById(id)
		drag(elem, { bound: "none", set_left: (x) => { point.x = x }, set_top: (y) => { point.y = y } })
		elem.onmouseover = () => { selector("line", line.id) }
	}
	mounted(onmount)

	// return html`circle [id=${"point-" + id} cx=${x} cy=${y}   r=5 fill=red]`
	return html`div.box [id=${id} style=${mem(() => `position:absolute; left:${x()}px; top:${y()}px; width:10px; height:10px; background-color:red; border: 1px solid black`)}]`
}

const Channel = () => {
	return html`
		each of ${mem(() => store.contents)} as ${Block}`
}

const Lines = () => {
	let width = small_box.clientWidth
	let height = small_box.clientHeight
	let editor = mem(() => {
		if (edit())
			return html`
				div
					each of ${mem(() => store.lines)} as ${LineEditor}`
	})

	return html`
		div
			svg [width=${width} height=${height}]
				each of ${mem(() => store.lines)} as ${Line}
		div -- ${editor}
		`

}

function save_block_coordinates() {
	let blocks = {}
	let nodes = store.contents
	nodes.forEach((node) => {
		if (node.base_class == "Group") return

		let id = node.id
		let pos = store.get_global_position(id)
		if (!pos) return

		blocks[id] = { x: pos.x, y: pos.y, width: node.width, height: node.height }
	})

	localStorage.setItem(channel_slug, JSON.stringify(blocks))
}



document.addEventListener("keydown", (e) => {
	if (e.key === "H") {
		current_block().width = current_block().width - 10
	}

	if (e.key === "L") {
		current_block().width = current_block().width + 10
	}

	if (e.key === "K") {
		current_block().height = current_block().height - 10
	}

	if (e.key === "J") {
		current_block().height = current_block().height + 10
	}

	if (e.key === "g") {
		group_selected()
	}

	if (e.key === "d") {
		// duplicate selected

		let selected_elems = selected()
		selected_elems.forEach((id) => {
			let node = store.get_node(id)
			if (!node) return

			let new_node = { ...node, id: uid() }
			store.contents.push(new_node)
		})
	}

	if (e.key === "z") {
		if (recter.style.display == "block") {
			recter.style.display = "none"
			panzoom.resume()
			recter_on.set(false)
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
			recter_on.set(true)
		}
	}

	if (e.key === "e") {
		console.log("edit")
		edit.set(!edit())
	}

	if (e.key === "v") {
		panning.set(!panning())
	}

	if (e.key === "s") {
		if (recter.style.display == "block") {
			recter.style.display = "none"
			recter_on.set(false)
			panzoom.resume()
		} else {
			rect_event = intersecting_blocks
			recter.style.display = "block"
			recter_on.set(true)
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

	let selected_elems = [...selected()];
	selected.set([])

	let lefts = selected_elems.map((id) => store.get_global_position(id)?.x).filter((x) => x !== undefined);
	let tops = selected_elems.map((id) => store.get_global_position(id)?.y).filter((y) => y !== undefined);

	let lowest_x = Math.min(...lefts);
	let lowest_y = Math.min(...tops);

	let end_xs = selected_elems.map((id) => {
		let node = store.get_box(id);
		return node?.right
	}).filter((x) => x !== undefined);

	let end_ys = selected_elems.map((id) => {
		let node = store.get_box(id);
		return node?.bottom
	}).filter((y) => y !== undefined);

	let highest_x = Math.max(...end_xs);
	let highest_y = Math.max(...end_ys);

	store.add_group_as_node(
		uid(),
		selected_elems,
		{ x: lowest_x, y: lowest_y },
		{ width: highest_x - lowest_x, height: highest_y - lowest_y },
	)

	selected_elems.forEach((id) => {
		let node = store.get_node(id);
		if (!node) return
		node.x = node.x - lowest_x;
		node.y = node.y - lowest_y;
	});
}

render(Channel, document.querySelector(".small-box"))
render(Lines, document.querySelector(".small-box"))
render(State, document.body)
