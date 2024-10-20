import { panzoom } from "./panzoom.js";
import { get_channel } from "./arena.js";
import { render, mut, mem, sig, html, eff_on, mounted } from "./solid_monke/solid_monke.js"

let channel_slug = "log-weed"
let channel = mut({ contents: [] })
let size = 300

get_channel(channel_slug).then((c) => {
	channel.contents = c.contents
	panzoom(".block", { zoom: false, pan_switch: () => !panning })
})

let panning = true;

const panzoomInstance = panzoom(".small-box", { bound: "none", scale_max: 50, pan_switch: () => panning })
let css = {}

const Block = (block, i) => {

	let x = sig(i() % 10 * size + 10)
	let y = sig(Math.floor(i() / 10) * size)
	let onmount = () => {
		let elem = document.getElementById("block-" + block.id)
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

document.addEventListener("keydown", (e) => {
	if (e.key === "h") {
		panning = !panning
		if (panning) document.querySelector(".small-box").style.cursor = "grab"
		else document.querySelector(".small-box").style.cursor = "default"
	}

	if (e.key === "s") {
		let css_string = ""
		Object.entries(css).forEach(([id, style]) => {
			let elem = document.getElementById("block-" + id)
			elem.set_left(Math.random() * 1000)
			elem.set_top(Math.random() * 1000)

			css_string += `
#block-${id} {
	${style().split(";").join(`;\n\t`)}
}`
			css_string += `\n`
		})
		console.log(css_string)
	}
})

render(Channel, document.querySelector(".small-box"))
