export const drag = (elem, options = {}) => {
	// Default Parameters
	const pan = options.pan !== false;
	const pan_switch = options.pan_switch ? options.pan_switch : true;	// Default: true
	const bound = (['inner', 'outer', 'none'].includes(options.bound)) ? options.bound : 'inner';

	// For panning (translate)
	let lastPosX, lastPosY;					// Needed because of decimals 
	let posX_min, posY_min, posX_max, posY_max;
	let parentScale; 						// Needed for avoid calculate every pointermove

	// Attach event listeners
	let isValid = normalize(elem);
	if (!isValid) return;

	elem.do_move = do_move;
	elem.set_pos == undefined ?
		elem.set_pos = (left, top) => {
			// elem.style.transform = `translate(${left}px, ${top}px)`;
			elem.style.left = left + "px";
			elem.style.top = top + "px";
		} : null

	if (pan) {
		// Pointer events, needed for move
		elem.addEventListener("pointerdown", handle_pointerdown);
		elem.addEventListener("pointerup", handle_pointerup);
		elem.addEventListener("pointermove", handle_pointermove);
		elem.style.position = 'absolute';
	}

	function normalize(elem) {
		const width = elem.offsetWidth;
		const widthp = elem.parentNode.offsetWidth;
		const height = elem.offsetHeight;
		const heightp = elem.parentNode.offsetHeight;

		if (width > widthp)
			if (bound == "inner" && (width > widthp || height > heightp)) {
				console.error("panzoom() error: In the 'inner' mode, with or height must be smaller than its container (parent)");
				return false;
			}
			else if (bound == "outer" && (width < widthp || height < heightp)) {
				console.error("panzoom() error: In the 'outer' mode, with or height must be larger than its container (parent)");
				return false;
			}
		return true;
	}

	function do_move(deltaX, deltaY) {
		lastPosX += deltaX;		// Needed because of decimals
		lastPosY += deltaY;		// Needed because of decimals

		if (bound !== 'none') {
			lastPosX = Math.min(Math.max(posX_min, lastPosX), posX_max);	// Restrict Pos X
			lastPosY = Math.min(Math.max(posY_min, lastPosY), posY_max);	// Restrict Pos Y	
		}
		elem.set_pos(lastPosX, lastPosY);
	}


	function handle_pointerdown(e) {
		if (e.target !== e.currentTarget) return;
		let pann = typeof pan_switch === 'function' ? pan_switch() : pan_switch;
		if (!pann) return;
		e.preventDefault();
		e.stopPropagation();

		e.target.style.cursor = 'none'

		// Set Last Element Position. Needed because event offset doesn't have decimals. And decimals will be needed when dragging
		lastPosX = e.target.offsetLeft;
		lastPosY = e.target.offsetTop;

		// Set Position Bounds
		const matrix = new WebKitCSSMatrix(getComputedStyle(e.target).getPropertyValue("transform"));
		const { a: scaleX, b: skewY, c: skewX, d: scaleY, e: translateX, f: translateY } = matrix;
		const scale = scaleX;

		// Set Position Bounds
		if (bound == 'inner') {
			posX_min = e.target.offsetWidth / 2 * (scale - 1) - translateX;
			posY_min = e.target.offsetHeight / 2 * (scale - 1) - translateY;
			posX_max = e.target.parentNode.offsetWidth - e.target.offsetWidth - e.target.offsetWidth / 2 * (scale - 1) - translateX;
			posY_max = e.target.parentNode.offsetHeight - e.target.offsetHeight - e.target.offsetHeight / 2 * (scale - 1) - translateY;
		}
		else if (bound == 'outer') {
			posX_max = e.target.offsetWidth / 2 * (scale - 1) - translateX;
			posY_max = e.target.offsetHeight / 2 * (scale - 1) - translateY;
			posX_min = e.target.parentNode.offsetWidth - e.target.offsetWidth - e.target.offsetWidth / 2 * (scale - 1) - translateX;
			posY_min = e.target.parentNode.offsetHeight - e.target.offsetHeight - e.target.offsetHeight / 2 * (scale - 1) - translateY;
		}

		const { x: px1, y: py1, width: pwidth1, height: pheight1 } = e.target.parentNode.getBoundingClientRect();
		const pwidth2 = e.target.parentNode.offsetWidth;
		parentScale = pwidth1 / pwidth2;

		e.target.setPointerCapture(e.pointerId);	// https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API
	}

	function handle_pointermove(e) {
		if (e.target !== e.currentTarget) return;
		if (!e.target.hasPointerCapture(e.pointerId)) return;
		let pann = typeof pan_switch === 'function' ? pan_switch() : pan_switch;
		if (!pann) return;
		e.preventDefault();
		e.stopPropagation();

		const deltaX = e.movementX / parentScale;// vvpScale It's pinch default gesture zoom (Android). Ignore in Desktop
		const deltaY = e.movementY / parentScale;// vvpScale It's pinch default gesture zoom (Android). Ignore in Desktop

		do_move(deltaX, deltaY);
	}

	function handle_pointerup(e) {
		e.preventDefault();
		e.stopPropagation();
		e.target.releasePointerCapture(e.pointerId);
	}


	return { do_move };
};

