export const panzoom = (selector, options = {}) => {

	// Default Parameters
	const pan = options.pan !== false;
	const pan_switch = options.pan_switch ? options.pan_switch : true;	// Default: true
	const zoom = options.zoom !== false;		// Default: true	
	const bound = (['inner', 'outer', 'none'].includes(options.bound)) ? options.bound : 'inner';
	const wheel_step = (options.wheel_step > 0.01 && options.wheel_step < 4) ? options.wheel_step : 0.2;
	const scale_min = (options.scale_min > 0.01 && options.scale_min < 200) ? options.scale_min : 0.01;
	const scale_max = (options.scale_max > 0.01 && options.scale_max < 200) ? ((options.scale_max > scale_min) ? options.scale_max : scale_min) : 10;

	// For panning (translate)
	let lastPosX, lastPosY;					// Needed because of decimals 
	let posX_min, posY_min, posX_max, posY_max;
	let parentScale; 						// Needed for avoid calculate every pointermove
	let vvpScale, dprScale;			// Needed to take into account e.movementX in touch screens

	// Attach event listeners
	let elem = document.querySelector(selector);
	console.log(elem)
	let isValid = normalize(elem);
	if (!isValid) return;

	elem.addEventListener("wheel", handle_wheel, { passive: false });
	elem.just_handle_the_wheel = just_handle_the_wheel;
	elem.do_move = do_move;
	elem.do_zoom = do_zoom;
	elem.go_to = go_to;

	elem.set_left == undefined ?
		elem.set_left = (left) => { elem.style.left = left + 'px'; }
		: null
	elem.set_top == undefined ?
		elem.set_top = (top) => { elem.style.top = top + 'px'; }
		: null

	if (pan) {
		// Pointer events, needed for move
		elem.addEventListener("pointerdown", handle_pointerdown);
		elem.addEventListener("pointerup", handle_pointerup);
		elem.addEventListener("pointermove", handle_pointermove);
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

		elem.style.position = 'absolute';
		elem.style.removeProperty('margin');
		elem.style.backgroundSize = 'cover';
		return true;
	}

	function do_move(deltaX, deltaY) {
		lastPosX += deltaX;		// Needed because of decimals
		lastPosY += deltaY;		// Needed because of decimals

		if (bound !== 'none') {
			lastPosX = Math.min(Math.max(posX_min, lastPosX), posX_max);	// Restrict Pos X
			lastPosY = Math.min(Math.max(posY_min, lastPosY), posY_max);	// Restrict Pos Y	
		}

		elem.set_left(lastPosX);
		elem.set_top(lastPosY);
	}

	function go_to(x, y) {
		elem.set_left(-x);
		elem.set_top(-y);
	}


	function go_zoom(scale) {
		const matrix = new WebKitCSSMatrix(getComputedStyle(elem).getPropertyValue("transform"));
		const { a: scaleX, b: skewY, c: skewX, d: scaleY, e: translateX, f: translateY } = matrix;

		let posX, posY;

		posX = elem.offsetLeft + scale * (elem.offsetWidth / 2 - 15);
		posY = elem.offsetTop + scale * (elem.offsetHeight / 2 - 15);

		const transform = `matrix(${scale}, ${skewY}, ${skewX}, ${scale}, ${translateX}, ${translateY})`;
		elem.style.transform = transform;

		elem.set_left(posX);
		elem.set_top(posY);
	}

	function do_zoom(deltaScale, offsetX, offsetY) {
		const matrix = new WebKitCSSMatrix(getComputedStyle(elem).getPropertyValue("transform"));
		const { a: scaleX, b: skewY, c: skewX, d: scaleY, e: translateX, f: translateY } = matrix;
		const { x: xp, y: yp, width: widthp, height: heightp } = elem.parentNode.getBoundingClientRect();

		deltaScale *= scaleX;	// Smooth deltaScale 

		let newScale = scaleX + deltaScale;		// let newScale = scaleX + deltaScale/vvpScale/dprScale;

		let posX, posY;
		let maxScaleX, maxScaleY, maxScale;
		let minScaleX, minScaleY, minScale;
		if (bound == 'inner') {
			maxScaleX = widthp / elem.offsetWidth;
			maxScaleY = heightp / elem.offsetHeight;
			maxScale = Math.min(maxScaleX, maxScaleY, scale_max);
			if (newScale > maxScale) deltaScale = 0;
			newScale = Math.min(Math.max(scale_min, newScale), maxScale);
		}
		else if (bound == "outer") {
			minScaleX = widthp / elem.offsetWidth;
			minScaleY = heightp / elem.offsetHeight;
			minScale = Math.max(minScaleX, minScaleY, scale_min);
			if (newScale < minScale || newScale > scale_max) return; //deltaScale=0;
		}

		else if (bound == 'none') {
			if (newScale < scale_min || newScale > scale_max) deltaScale = 0;
			newScale = Math.min(Math.max(scale_min, newScale), scale_max);
		}

		if (!offsetX || !offsetY) {
			offsetX = 15;
			offsetY = 15;

			console.log("offsetX", offsetX)
			console.log("offsetY", offsetY)
		} else {
			console.log("offsetX", offsetX)
			console.log("offsetY", offsetY)
		}

		posX = elem.offsetLeft + deltaScale * (elem.offsetWidth / 2 - offsetX);
		posY = elem.offsetTop + deltaScale * (elem.offsetHeight / 2 - offsetY);

		// Set Position Bounds
		let posX_min, posY_min, posX_max, posY_max;
		if (bound == 'inner') {
			posX_min = elem.offsetWidth / 2 * (newScale - 1) - translateX;
			posY_min = elem.offsetHeight / 2 * (newScale - 1) - translateY;
			posX_max = elem.parentNode.offsetWidth - elem.offsetWidth - elem.offsetWidth / 2 * (newScale - 1) - translateX;
			posY_max = elem.parentNode.offsetHeight - elem.offsetHeight - elem.offsetHeight / 2 * (newScale - 1) - translateY;
			posX = Math.min(Math.max(posX_min, posX), posX_max);		// Restrict
			posY = Math.min(Math.max(posY_min, posY), posY_max);		// Restrict

		}
		else if (bound == 'outer') {
			posX_max = elem.offsetWidth / 2 * (newScale - 1) - translateX;
			posY_max = elem.offsetHeight / 2 * (newScale - 1) - translateY;
			posX_min = elem.parentNode.offsetWidth - elem.offsetWidth - elem.offsetWidth / 2 * (newScale - 1) - translateX;
			posY_min = elem.parentNode.offsetHeight - elem.offsetHeight - elem.offsetHeight / 2 * (newScale - 1) - translateY;
			posX = Math.min(Math.max(posX_min, posX), posX_max);		// Restrict
			posY = Math.min(Math.max(posY_min, posY), posY_max);		// Restrict
		}
		else if (bound == 'none') {

		}

		const transform = `matrix(${newScale}, ${skewY}, ${skewX}, ${newScale}, ${translateX}, ${translateY})`;
		elem.style.transform = transform;

		if (!offsetX || !offsetY) return;

		elem.set_left(posX);
		elem.set_top(posY);
	}

	function handle_pointerdown(e) {
		if (e.target !== e.currentTarget) return;
		let pann = typeof pan_switch === 'function' ? pan_switch() : pan_switch;
		if (!pann) return;
		e.preventDefault();
		e.stopPropagation();


		e.target.style.cursor = 'none'

		vvpScale = window.visualViewport.scale;		// It's pinch default gesture zoom (Android). Ignore in Desktop
		dprScale = window.devicePixelRatio;			// Needed if e.screenX is used. Ignore in Mobile

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

		e.target.style.cursor = ''
		e.target.releasePointerCapture(e.pointerId);
	}


	function handle_wheel(e) {
		e.preventDefault();
		e.stopPropagation();
		if (e.target !== e.currentTarget) return;
		if (!zoom) {
			console.log(e.target.parentNode)
			if (e.target.parentNode.just_handle_the_wheel) e.target.parentNode.just_handle_the_wheel(e);
		} else {
			const deltaScale = e.wheelDelta * wheel_step / 120;
			do_zoom(deltaScale, e.offsetX, e.offsetY);
		}

	}

	function just_handle_the_wheel(e) {
		console.log("called", e)
		e.preventDefault();
		const deltaScale = e.wheelDelta * wheel_step / 120;
		this.do_zoom(deltaScale, e.offsetX, e.offsetY);
	}


	return { go_to, do_move, do_zoom, go_zoom };
};

