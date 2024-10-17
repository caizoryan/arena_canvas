import { panzoom } from "./panzoom.js";
import { get_channel } from "./arena.js";
import { render, mut, mem, sig, html, eff_on } from "./solid_monke/solid_monke.js"

let channel_slug = "log-spending"
let channel = mut({ contents: [] })

get_channel(channel_slug).then((c) => {
	channel.contents = c.contents
	panzoom(".block", { zoom: false, pan_switch: () => !panning })
})

let panning = true;

const panzoomInstance = panzoom(".small-box", { bound: "none", scale_max: 50, pan_switch: () => panning })

const Block = (block, i) => {
	if (block.class != "Text") return

	let x = i() % 10 * 100
	let y = Math.floor(i() / 10) * 100

	let style = `left: ${x}px; top: ${y}px;`

	let content = block.content
	return html`.block [style=${style} id=${"block-" + block.id}] -- ${content}`
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
})

render(Channel, document.querySelector(".small-box"))
