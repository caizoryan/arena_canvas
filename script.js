import { get_channel } from "./arena.js";
import { createPanZoom } from "./panzoom/panzoom.js"
import { render, mut, mem, sig, html, mounted } from "./solid_monke/solid_monke.js"
import { drag } from "./drag.js";

let channel_slug = "reading-week-fall-2024"
let channel = mut({ contents: [] })
let size = 300

let lastPosX = 0;
let lastPosY = 0;

let small_box = document.querySelector(".small-box")
let panzoom = createPanZoom(small_box)

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

	if (block.x) {
		x.set(parseFloat(block.x))
		console.log("setting x", block.x)
	}
	if (block.y) y.set(parseFloat(block.y))

	let onmount = () => {
		let elem = document.getElementById("block-" + block.id)
		drag(elem)
		elem.set_left = x.set
		elem.set_top = y.set
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
		panzoom.pause()
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
