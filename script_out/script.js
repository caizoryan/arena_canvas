// scripts/auth.js
var auth = "";

// scripts/arena.ts
var host = "http://localhost:3000/api/";
var get_channel = async (slug) => {
  return await fetch(host + `channels/${slug}?per=100&force=true`, {
    headers: {
      Authorization: `Bearer ${auth}`,
      cache: "no-store",
      "Cache-Control": "max-age=0, no-cache",
      referrerPolicy: "no-referrer"
    }
  }).then((response) => {
    return response.json();
  }).then((data) => {
    return data;
  });
};

// scripts/panzoom/lib/bezier.js
var NEWTON_ITERATIONS = 4;
var NEWTON_MIN_SLOPE = 1e-3;
var SUBDIVISION_PRECISION = 1e-7;
var SUBDIVISION_MAX_ITERATIONS = 10;
var kSplineTableSize = 11;
var kSampleStepSize = 1 / (kSplineTableSize - 1);
var float32ArraySupported = typeof Float32Array === "function";
function A(aA1, aA2) {
  return 1 - 3 * aA2 + 3 * aA1;
}
function B(aA1, aA2) {
  return 3 * aA2 - 6 * aA1;
}
function C(aA1) {
  return 3 * aA1;
}
function calcBezier(aT, aA1, aA2) {
  return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
}
function getSlope(aT, aA1, aA2) {
  return 3 * A(aA1, aA2) * aT * aT + 2 * B(aA1, aA2) * aT + C(aA1);
}
function binarySubdivide(aX, aA, aB, mX1, mX2) {
  var currentX, currentT, i = 0;
  do {
    currentT = aA + (aB - aA) / 2;
    currentX = calcBezier(currentT, mX1, mX2) - aX;
    if (currentX > 0) {
      aB = currentT;
    } else {
      aA = currentT;
    }
  } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
  return currentT;
}
function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
  for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
    var currentSlope = getSlope(aGuessT, mX1, mX2);
    if (currentSlope === 0) {
      return aGuessT;
    }
    var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
    aGuessT -= currentX / currentSlope;
  }
  return aGuessT;
}
function LinearEasing(x) {
  return x;
}
function bezier(mX1, mY1, mX2, mY2) {
  if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) {
    throw new Error("bezier x values must be in [0, 1] range");
  }
  if (mX1 === mY1 && mX2 === mY2) {
    return LinearEasing;
  }
  var sampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);
  for (var i = 0; i < kSplineTableSize; ++i) {
    sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
  }
  function getTForX(aX) {
    var intervalStart = 0;
    var currentSample = 1;
    var lastSample = kSplineTableSize - 1;
    for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
      intervalStart += kSampleStepSize;
    }
    --currentSample;
    var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
    var guessForT = intervalStart + dist * kSampleStepSize;
    var initialSlope = getSlope(guessForT, mX1, mX2);
    if (initialSlope >= NEWTON_MIN_SLOPE) {
      return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
    } else if (initialSlope === 0) {
      return guessForT;
    } else {
      return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
    }
  }
  return function BezierEasing2(x) {
    if (x === 0 || x === 1) {
      return x;
    }
    return calcBezier(getTForX(x), mY1, mY2);
  };
}

// scripts/panzoom/lib/amator.js
var BezierEasing = bezier;
var animations = {
  ease: BezierEasing(0.25, 0.1, 0.25, 1),
  easeIn: BezierEasing(0.42, 0, 1, 1),
  easeOut: BezierEasing(0, 0, 0.58, 1),
  easeInOut: BezierEasing(0.42, 0, 0.58, 1),
  linear: BezierEasing(0, 0, 1, 1)
};
function animate(source, target, options) {
  var start = /* @__PURE__ */ Object.create(null);
  var diff = /* @__PURE__ */ Object.create(null);
  options = options || {};
  var easing = typeof options.easing === "function" ? options.easing : animations[options.easing];
  if (!easing) {
    if (options.easing) {
      console.warn("Unknown easing function in amator: " + options.easing);
    }
    easing = animations.ease;
  }
  var step = typeof options.step === "function" ? options.step : noop;
  var done = typeof options.done === "function" ? options.done : noop;
  var scheduler = getScheduler(options.scheduler);
  var keys = Object.keys(target);
  keys.forEach(function(key) {
    start[key] = source[key];
    diff[key] = target[key] - source[key];
  });
  var durationInMs = typeof options.duration === "number" ? options.duration : 400;
  var durationInFrames = Math.max(1, durationInMs * 0.06);
  var previousAnimationId;
  var frame = 0;
  previousAnimationId = scheduler.next(loop);
  return {
    cancel
  };
  function cancel() {
    scheduler.cancel(previousAnimationId);
    previousAnimationId = 0;
  }
  function loop() {
    var t = easing(frame / durationInFrames);
    frame += 1;
    setValues(t);
    if (frame <= durationInFrames) {
      previousAnimationId = scheduler.next(loop);
      step(source);
    } else {
      previousAnimationId = 0;
      setTimeout(function() {
        done(source);
      }, 0);
    }
  }
  function setValues(t) {
    keys.forEach(function(key) {
      source[key] = diff[key] * t + start[key];
    });
  }
}
function noop() {
}
function getScheduler(scheduler) {
  if (!scheduler) {
    var canRaf = typeof window !== "undefined" && window.requestAnimationFrame;
    return canRaf ? rafScheduler() : timeoutScheduler();
  }
  if (typeof scheduler.next !== "function") throw new Error("Scheduler is supposed to have next(cb) function");
  if (typeof scheduler.cancel !== "function") throw new Error("Scheduler is supposed to have cancel(handle) function");
  return scheduler;
}
function rafScheduler() {
  return {
    next: window.requestAnimationFrame.bind(window),
    cancel: window.cancelAnimationFrame.bind(window)
  };
}
function timeoutScheduler() {
  return {
    next: function(cb) {
      return setTimeout(cb, 1e3 / 60);
    },
    cancel: function(id) {
      return clearTimeout(id);
    }
  };
}
function makeAggregateRaf() {
  var frontBuffer = /* @__PURE__ */ new Set();
  var backBuffer = /* @__PURE__ */ new Set();
  var frameToken = 0;
  return {
    next,
    cancel: next,
    clearAll
  };
  function clearAll() {
    frontBuffer.clear();
    backBuffer.clear();
    cancelAnimationFrame(frameToken);
    frameToken = 0;
  }
  function next(callback) {
    backBuffer.add(callback);
    renderNextFrame();
  }
  function renderNextFrame() {
    if (!frameToken) frameToken = requestAnimationFrame(renderFrame);
  }
  function renderFrame() {
    frameToken = 0;
    var t = backBuffer;
    backBuffer = frontBuffer;
    frontBuffer = t;
    frontBuffer.forEach(function(callback) {
      callback();
    });
    frontBuffer.clear();
  }
  function cancel(callback) {
    backBuffer.delete(callback);
  }
}
animate.makeAggregateRaf = makeAggregateRaf;
animate.sharedScheduler = makeAggregateRaf();

// scripts/panzoom/lib/events.js
function eventify(subject) {
  validateSubject(subject);
  var eventsStorage = createEventsStorage(subject);
  subject.on = eventsStorage.on;
  subject.off = eventsStorage.off;
  subject.fire = eventsStorage.fire;
  return subject;
}
function createEventsStorage(subject) {
  var registeredEvents = /* @__PURE__ */ Object.create(null);
  return {
    on: function(eventName, callback, ctx) {
      if (typeof callback !== "function") {
        throw new Error("callback is expected to be a function");
      }
      var handlers = registeredEvents[eventName];
      if (!handlers) {
        handlers = registeredEvents[eventName] = [];
      }
      handlers.push({ callback, ctx });
      return subject;
    },
    off: function(eventName, callback) {
      var wantToRemoveAll = typeof eventName === "undefined";
      if (wantToRemoveAll) {
        registeredEvents = /* @__PURE__ */ Object.create(null);
        return subject;
      }
      if (registeredEvents[eventName]) {
        var deleteAllCallbacksForEvent = typeof callback !== "function";
        if (deleteAllCallbacksForEvent) {
          delete registeredEvents[eventName];
        } else {
          var callbacks = registeredEvents[eventName];
          for (var i = 0; i < callbacks.length; ++i) {
            if (callbacks[i].callback === callback) {
              callbacks.splice(i, 1);
            }
          }
        }
      }
      return subject;
    },
    fire: function(eventName) {
      var callbacks = registeredEvents[eventName];
      if (!callbacks) {
        return subject;
      }
      var fireArguments;
      if (arguments.length > 1) {
        fireArguments = Array.prototype.splice.call(arguments, 1);
      }
      for (var i = 0; i < callbacks.length; ++i) {
        var callbackInfo = callbacks[i];
        callbackInfo.callback.apply(callbackInfo.ctx, fireArguments);
      }
      return subject;
    }
  };
}
function validateSubject(subject) {
  if (!subject) {
    throw new Error("Eventify cannot use falsy object as events subject");
  }
  var reservedWords = ["on", "fire", "off"];
  for (var i = 0; i < reservedWords.length; ++i) {
    if (subject.hasOwnProperty(reservedWords[i])) {
      throw new Error("Subject cannot be eventified, since it already has property '" + reservedWords[i] + "'");
    }
  }
}

// scripts/panzoom/lib/makeTextSelectionInterceptor.js
function makeTextSelectionInterceptor(useFake) {
  if (useFake) {
    return {
      capture: noop2,
      release: noop2
    };
  }
  var dragObject;
  var prevSelectStart;
  var prevDragStart;
  var wasCaptured = false;
  return {
    capture,
    release
  };
  function capture(domObject) {
    wasCaptured = true;
    prevSelectStart = window.document.onselectstart;
    prevDragStart = window.document.ondragstart;
    window.document.onselectstart = disabled;
    dragObject = domObject;
    dragObject.ondragstart = disabled;
  }
  function release() {
    if (!wasCaptured) return;
    wasCaptured = false;
    window.document.onselectstart = prevSelectStart;
    if (dragObject) dragObject.ondragstart = prevDragStart;
  }
}
function disabled(e) {
  e.stopPropagation();
  return false;
}
function noop2() {
}

// scripts/panzoom/lib/transform.js
function Transform() {
  this.x = 0;
  this.y = 0;
  this.scale = 1;
}

// scripts/panzoom/lib/makeSvgController.js
function makeSvgController(svgElement, options) {
  if (!isSVGElement(svgElement)) {
    throw new Error("svg element is required for svg.panzoom to work");
  }
  var owner = svgElement.ownerSVGElement;
  if (!owner) {
    throw new Error(
      "Do not apply panzoom to the root <svg> element. Use its child instead (e.g. <g></g>). As of March 2016 only FireFox supported transform on the root element"
    );
  }
  if (!options.disableKeyboardInteraction) {
    owner.setAttribute("tabindex", 0);
  }
  var api = {
    getBBox,
    getScreenCTM,
    getOwner,
    applyTransform,
    initTransform
  };
  return api;
  function getOwner() {
    return owner;
  }
  function getBBox() {
    var boundingBox = svgElement.getBBox();
    return {
      left: boundingBox.x,
      top: boundingBox.y,
      width: boundingBox.width,
      height: boundingBox.height
    };
  }
  function getScreenCTM() {
    var ctm = owner.getCTM();
    if (!ctm) {
      return owner.getScreenCTM();
    }
    return ctm;
  }
  function initTransform(transform) {
    var screenCTM = svgElement.getCTM();
    if (screenCTM === null) {
      screenCTM = document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGMatrix();
    }
    transform.x = screenCTM.e;
    transform.y = screenCTM.f;
    transform.scale = screenCTM.a;
    owner.removeAttributeNS(null, "viewBox");
  }
  function applyTransform(transform) {
    svgElement.setAttribute("transform", "matrix(" + transform.scale + " 0 0 " + transform.scale + " " + transform.x + " " + transform.y + ")");
  }
}
function isSVGElement(element) {
  return element && element.ownerSVGElement && element.getCTM;
}
makeSvgController.canAttach = isSVGElement;

// scripts/panzoom/lib/makeDomController.js
function makeDomController(domElement, options) {
  var elementValid = isDomElement(domElement);
  if (!elementValid) {
    throw new Error("panzoom requires DOM element to be attached to the DOM tree");
  }
  var owner = domElement.parentElement;
  domElement.scrollTop = 0;
  if (!options.disableKeyboardInteraction) {
    owner.setAttribute("tabindex", 0);
  }
  var api = {
    getBBox,
    getOwner,
    applyTransform
  };
  return api;
  function getOwner() {
    return owner;
  }
  function getBBox() {
    return {
      left: 0,
      top: 0,
      width: domElement.clientWidth,
      height: domElement.clientHeight
    };
  }
  function applyTransform(transform) {
    domElement.style.transformOrigin = "0 0 0";
    domElement.style.transform = "matrix(" + transform.scale + ", 0, 0, " + transform.scale + ", " + transform.x + ", " + transform.y + ")";
  }
}
function isDomElement(element) {
  return element && element.parentElement && element.style;
}
makeDomController.canAttach = isDomElement;

// scripts/panzoom/panzoom.js
var domTextSelectionInterceptor = makeTextSelectionInterceptor();
var fakeTextSelectorInterceptor = makeTextSelectionInterceptor(true);
var defaultZoomSpeed = 1;
var defaultDoubleTapZoomSpeed = 1.75;
var doubleTapSpeedInMS = 300;
var clickEventTimeInMS = 200;
function createPanZoom(domElement, options) {
  options = options || {};
  var panController = options.controller;
  if (!panController) {
    if (makeSvgController.canAttach(domElement)) {
      panController = makeSvgController(domElement, options);
    } else if (makeDomController.canAttach(domElement)) {
      panController = makeDomController(domElement, options);
    }
  }
  if (!panController) {
    throw new Error(
      "Cannot create panzoom for the current type of dom element"
    );
  }
  var owner = panController.getOwner();
  var storedCTMResult = { x: 0, y: 0 };
  var isDirty = false;
  var transform = new Transform();
  if (panController.initTransform) {
    panController.initTransform(transform);
  }
  var filterKey = typeof options.filterKey === "function" ? options.filterKey : noop3;
  var pinchSpeed = typeof options.pinchSpeed === "number" ? options.pinchSpeed : 1;
  var bounds = options.bounds;
  var maxZoom = typeof options.maxZoom === "number" ? options.maxZoom : Number.POSITIVE_INFINITY;
  var minZoom = typeof options.minZoom === "number" ? options.minZoom : 0;
  var boundsPadding = typeof options.boundsPadding === "number" ? options.boundsPadding : 0.05;
  var zoomDoubleClickSpeed = typeof options.zoomDoubleClickSpeed === "number" ? options.zoomDoubleClickSpeed : defaultDoubleTapZoomSpeed;
  var beforeWheel = options.beforeWheel || noop3;
  var beforeMouseDown = options.beforeMouseDown || noop3;
  var speed = typeof options.zoomSpeed === "number" ? options.zoomSpeed : defaultZoomSpeed;
  var transformOrigin = parseTransformOrigin(options.transformOrigin);
  var textSelection = options.enableTextSelection ? fakeTextSelectorInterceptor : domTextSelectionInterceptor;
  validateBounds(bounds);
  if (options.autocenter) {
    autocenter();
  }
  var frameAnimation;
  var lastTouchEndTime = 0;
  var lastTouchStartTime = 0;
  var pendingClickEventTimeout = 0;
  var lastMouseDownedEvent = null;
  var lastMouseDownTime = /* @__PURE__ */ new Date();
  var lastSingleFingerOffset;
  var touchInProgress = false;
  var panstartFired = false;
  var mouseX;
  var mouseY;
  var clickX;
  var clickY;
  var pinchZoomLength;
  var moveByAnimation;
  var zoomToAnimation;
  var multiTouch;
  var paused = false;
  var smoothScroll = rigidScroll();
  listenForEvents();
  var api = {
    dispose: dispose2,
    moveBy: internalMoveBy,
    moveTo,
    smoothMoveTo,
    centerOn,
    zoomTo: publicZoomTo,
    zoomAbs,
    smoothZoom,
    smoothZoomAbs,
    showRectangle,
    pause,
    resume,
    isPaused,
    getTransform: getTransformModel,
    getMinZoom,
    setMinZoom,
    getMaxZoom,
    setMaxZoom,
    getTransformOrigin,
    setTransformOrigin,
    getZoomSpeed,
    setZoomSpeed
  };
  eventify(api);
  var initialX = typeof options.initialX === "number" ? options.initialX : transform.x;
  var initialY = typeof options.initialY === "number" ? options.initialY : transform.y;
  var initialZoom = typeof options.initialZoom === "number" ? options.initialZoom : transform.scale;
  if (initialX != transform.x || initialY != transform.y || initialZoom != transform.scale) {
    zoomAbs(initialX, initialY, initialZoom);
  }
  return api;
  function pause() {
    releaseEvents();
    paused = true;
  }
  function resume() {
    if (paused) {
      listenForEvents();
      paused = false;
    }
  }
  function isPaused() {
    return paused;
  }
  function showRectangle(rect) {
    var clientRect = owner.getBoundingClientRect();
    var size = transformToScreen(clientRect.width, clientRect.height);
    var rectWidth = rect.right - rect.left;
    var rectHeight = rect.bottom - rect.top;
    if (!Number.isFinite(rectWidth) || !Number.isFinite(rectHeight)) {
      throw new Error("Invalid rectangle");
    }
    var dw = size.x / rectWidth;
    var dh = size.y / rectHeight;
    var scale = Math.min(dw, dh);
    transform.x = -(rect.left + rectWidth / 2) * scale + size.x / 2;
    transform.y = -(rect.top + rectHeight / 2) * scale + size.y / 2;
    transform.scale = scale;
  }
  function transformToScreen(x, y) {
    if (panController.getScreenCTM) {
      var parentCTM = panController.getScreenCTM();
      var parentScaleX = parentCTM.a;
      var parentScaleY = parentCTM.d;
      var parentOffsetX = parentCTM.e;
      var parentOffsetY = parentCTM.f;
      storedCTMResult.x = x * parentScaleX - parentOffsetX;
      storedCTMResult.y = y * parentScaleY - parentOffsetY;
    } else {
      storedCTMResult.x = x;
      storedCTMResult.y = y;
    }
    return storedCTMResult;
  }
  function autocenter() {
    var w;
    var h3;
    var left = 0;
    var top = 0;
    var sceneBoundingBox = getBoundingBox();
    if (sceneBoundingBox) {
      left = sceneBoundingBox.left;
      top = sceneBoundingBox.top;
      w = sceneBoundingBox.right - sceneBoundingBox.left;
      h3 = sceneBoundingBox.bottom - sceneBoundingBox.top;
    } else {
      var ownerRect = owner.getBoundingClientRect();
      w = ownerRect.width;
      h3 = ownerRect.height;
    }
    var bbox = panController.getBBox();
    if (bbox.width === 0 || bbox.height === 0) {
      return;
    }
    var dh = h3 / bbox.height;
    var dw = w / bbox.width;
    var scale = Math.min(dw, dh);
    transform.x = -(bbox.left + bbox.width / 2) * scale + w / 2 + left;
    transform.y = -(bbox.top + bbox.height / 2) * scale + h3 / 2 + top;
    transform.scale = scale;
  }
  function getTransformModel() {
    return transform;
  }
  function getMinZoom() {
    return minZoom;
  }
  function setMinZoom(newMinZoom) {
    minZoom = newMinZoom;
  }
  function getMaxZoom() {
    return maxZoom;
  }
  function setMaxZoom(newMaxZoom) {
    maxZoom = newMaxZoom;
  }
  function getTransformOrigin() {
    return transformOrigin;
  }
  function setTransformOrigin(newTransformOrigin) {
    transformOrigin = parseTransformOrigin(newTransformOrigin);
  }
  function getZoomSpeed() {
    return speed;
  }
  function setZoomSpeed(newSpeed) {
    if (!Number.isFinite(newSpeed)) {
      throw new Error("Zoom speed should be a number");
    }
    speed = newSpeed;
  }
  function getPoint() {
    return {
      x: transform.x,
      y: transform.y
    };
  }
  function moveTo(x, y) {
    transform.x = x;
    transform.y = y;
    keepTransformInsideBounds();
    triggerEvent("pan");
    makeDirty();
  }
  function moveBy(dx, dy) {
    moveTo(transform.x + dx, transform.y + dy);
  }
  function keepTransformInsideBounds() {
    var boundingBox = getBoundingBox();
    if (!boundingBox) return;
    var adjusted = false;
    var clientRect = getClientRect();
    var diff = boundingBox.left - clientRect.right;
    if (diff > 0) {
      transform.x += diff;
      adjusted = true;
    }
    diff = boundingBox.right - clientRect.left;
    if (diff < 0) {
      transform.x += diff;
      adjusted = true;
    }
    diff = boundingBox.top - clientRect.bottom;
    if (diff > 0) {
      transform.y += diff;
      adjusted = true;
    }
    diff = boundingBox.bottom - clientRect.top;
    if (diff < 0) {
      transform.y += diff;
      adjusted = true;
    }
    return adjusted;
  }
  function getBoundingBox() {
    if (!bounds) return;
    if (typeof bounds === "boolean") {
      var ownerRect = owner.getBoundingClientRect();
      var sceneWidth = ownerRect.width;
      var sceneHeight = ownerRect.height;
      return {
        left: sceneWidth * boundsPadding,
        top: sceneHeight * boundsPadding,
        right: sceneWidth * (1 - boundsPadding),
        bottom: sceneHeight * (1 - boundsPadding)
      };
    }
    return bounds;
  }
  function getClientRect() {
    var bbox = panController.getBBox();
    var leftTop = client(bbox.left, bbox.top);
    return {
      left: leftTop.x,
      top: leftTop.y,
      right: bbox.width * transform.scale + leftTop.x,
      bottom: bbox.height * transform.scale + leftTop.y
    };
  }
  function client(x, y) {
    return {
      x: x * transform.scale + transform.x,
      y: y * transform.scale + transform.y
    };
  }
  function makeDirty() {
    isDirty = true;
    frameAnimation = window.requestAnimationFrame(frame);
  }
  function zoomByRatio(clientX, clientY, ratio) {
    if (isNaN(clientX) || isNaN(clientY) || isNaN(ratio)) {
      throw new Error("zoom requires valid numbers");
    }
    var newScale = transform.scale * ratio;
    if (newScale < minZoom) {
      if (transform.scale === minZoom) return;
      ratio = minZoom / transform.scale;
    }
    if (newScale > maxZoom) {
      if (transform.scale === maxZoom) return;
      ratio = maxZoom / transform.scale;
    }
    var size = transformToScreen(clientX, clientY);
    transform.x = size.x - ratio * (size.x - transform.x);
    transform.y = size.y - ratio * (size.y - transform.y);
    if (bounds && boundsPadding === 1 && minZoom === 1) {
      transform.scale *= ratio;
      keepTransformInsideBounds();
    } else {
      var transformAdjusted = keepTransformInsideBounds();
      if (!transformAdjusted) transform.scale *= ratio;
    }
    triggerEvent("zoom");
    makeDirty();
  }
  function zoomAbs(clientX, clientY, zoomLevel) {
    var ratio = zoomLevel / transform.scale;
    zoomByRatio(clientX, clientY, ratio);
  }
  function centerOn(ui) {
    var parent = ui.ownerSVGElement;
    if (!parent)
      throw new Error("ui element is required to be within the scene");
    var clientRect = ui.getBoundingClientRect();
    var cx = clientRect.left + clientRect.width / 2;
    var cy = clientRect.top + clientRect.height / 2;
    var container = parent.getBoundingClientRect();
    var dx = container.width / 2 - cx;
    var dy = container.height / 2 - cy;
    internalMoveBy(dx, dy, true);
  }
  function smoothMoveTo(x, y) {
    internalMoveBy(x - transform.x, y - transform.y, true);
  }
  function internalMoveBy(dx, dy, smooth) {
    if (!smooth) {
      return moveBy(dx, dy);
    }
    if (moveByAnimation) moveByAnimation.cancel();
    var from = { x: 0, y: 0 };
    var to = { x: dx, y: dy };
    var lastX = 0;
    var lastY = 0;
    moveByAnimation = animate(from, to, {
      step: function(v) {
        moveBy(v.x - lastX, v.y - lastY);
        lastX = v.x;
        lastY = v.y;
      }
    });
  }
  function scroll(x, y) {
    cancelZoomAnimation();
    moveTo(x, y);
  }
  function dispose2() {
    releaseEvents();
  }
  function listenForEvents() {
    owner.addEventListener("mousedown", onMouseDown, { passive: false });
    owner.addEventListener("dblclick", onDoubleClick, { passive: false });
    owner.addEventListener("touchstart", onTouch, { passive: false });
    owner.addEventListener("keydown", onKeyDown, { passive: false });
    owner.addEventListener("wheel", onMouseWheel, { passive: false });
    makeDirty();
  }
  function releaseEvents() {
    owner.removeEventListener("mousedown", onMouseDown);
    owner.removeEventListener("keydown", onKeyDown);
    owner.removeEventListener("dblclick", onDoubleClick);
    owner.removeEventListener("touchstart", onTouch);
    owner.removeEventListener("wheel", onMouseWheel);
    if (frameAnimation) {
      window.cancelAnimationFrame(frameAnimation);
      frameAnimation = 0;
    }
    smoothScroll.cancel();
    releaseDocumentMouse();
    releaseTouches();
    textSelection.release();
    triggerPanEnd();
  }
  function frame() {
    if (isDirty) applyTransform();
  }
  function applyTransform() {
    isDirty = false;
    panController.applyTransform(transform);
    triggerEvent("transform");
    frameAnimation = 0;
  }
  function onKeyDown(e) {
    var x = 0, y = 0, z = 0;
    if (e.keyCode === 38) {
      y = 1;
    } else if (e.keyCode === 40) {
      y = -1;
    } else if (e.keyCode === 37) {
      x = 1;
    } else if (e.keyCode === 39) {
      x = -1;
    } else if (e.keyCode === 189 || e.keyCode === 109) {
      z = 1;
    } else if (e.keyCode === 187 || e.keyCode === 107) {
      z = -1;
    }
    if (filterKey(e, x, y, z)) {
      return;
    }
    if (x || y) {
      e.preventDefault();
      e.stopPropagation();
      var clientRect = owner.getBoundingClientRect();
      var offset = Math.min(clientRect.width, clientRect.height);
      var moveSpeedRatio = 0.05;
      var dx = offset * moveSpeedRatio * x;
      var dy = offset * moveSpeedRatio * y;
      internalMoveBy(dx, dy);
    }
    if (z) {
      var scaleMultiplier = getScaleMultiplier(z * 100);
      var offset = transformOrigin ? getTransformOriginOffset() : midPoint();
      publicZoomTo(offset.x, offset.y, scaleMultiplier);
    }
  }
  function midPoint() {
    var ownerRect = owner.getBoundingClientRect();
    return {
      x: ownerRect.width / 2,
      y: ownerRect.height / 2
    };
  }
  function onTouch(e) {
    beforeTouch(e);
    clearPendingClickEventTimeout();
    if (e.touches.length === 1) {
      return handleSingleFingerTouch(e, e.touches[0]);
    } else if (e.touches.length === 2) {
      pinchZoomLength = getPinchZoomLength(e.touches[0], e.touches[1]);
      multiTouch = true;
      startTouchListenerIfNeeded();
    }
  }
  function beforeTouch(e) {
    if (options.onTouch && !options.onTouch(e)) {
      return;
    }
    e.stopPropagation();
    e.preventDefault();
  }
  function beforeDoubleClick(e) {
    clearPendingClickEventTimeout();
    if (options.onDoubleClick && !options.onDoubleClick(e)) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
  }
  function handleSingleFingerTouch(e) {
    lastTouchStartTime = /* @__PURE__ */ new Date();
    var touch = e.touches[0];
    var offset = getOffsetXY(touch);
    lastSingleFingerOffset = offset;
    var point = transformToScreen(offset.x, offset.y);
    mouseX = point.x;
    mouseY = point.y;
    clickX = mouseX;
    clickY = mouseY;
    smoothScroll.cancel();
    startTouchListenerIfNeeded();
  }
  function startTouchListenerIfNeeded() {
    if (touchInProgress) {
      return;
    }
    touchInProgress = true;
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);
    document.addEventListener("touchcancel", handleTouchEnd);
  }
  function handleTouchMove(e) {
    if (e.touches.length === 1) {
      e.stopPropagation();
      var touch = e.touches[0];
      var offset = getOffsetXY(touch);
      var point = transformToScreen(offset.x, offset.y);
      var dx = point.x - mouseX;
      var dy = point.y - mouseY;
      if (dx !== 0 && dy !== 0) {
        triggerPanStart();
      }
      mouseX = point.x;
      mouseY = point.y;
      internalMoveBy(dx, dy);
    } else if (e.touches.length === 2) {
      multiTouch = true;
      var t1 = e.touches[0];
      var t2 = e.touches[1];
      var currentPinchLength = getPinchZoomLength(t1, t2);
      var scaleMultiplier = 1 + (currentPinchLength / pinchZoomLength - 1) * pinchSpeed;
      var firstTouchPoint = getOffsetXY(t1);
      var secondTouchPoint = getOffsetXY(t2);
      mouseX = (firstTouchPoint.x + secondTouchPoint.x) / 2;
      mouseY = (firstTouchPoint.y + secondTouchPoint.y) / 2;
      if (transformOrigin) {
        var offset = getTransformOriginOffset();
        mouseX = offset.x;
        mouseY = offset.y;
      }
      publicZoomTo(mouseX, mouseY, scaleMultiplier);
      pinchZoomLength = currentPinchLength;
      e.stopPropagation();
      e.preventDefault();
    }
  }
  function clearPendingClickEventTimeout() {
    if (pendingClickEventTimeout) {
      clearTimeout(pendingClickEventTimeout);
      pendingClickEventTimeout = 0;
    }
  }
  function handlePotentialClickEvent(e) {
    if (!options.onClick) return;
    clearPendingClickEventTimeout();
    var dx = mouseX - clickX;
    var dy = mouseY - clickY;
    var l = Math.sqrt(dx * dx + dy * dy);
    if (l > 5) return;
    pendingClickEventTimeout = setTimeout(function() {
      pendingClickEventTimeout = 0;
      options.onClick(e);
    }, doubleTapSpeedInMS);
  }
  function handleTouchEnd(e) {
    clearPendingClickEventTimeout();
    if (e.touches.length > 0) {
      var offset = getOffsetXY(e.touches[0]);
      var point = transformToScreen(offset.x, offset.y);
      mouseX = point.x;
      mouseY = point.y;
    } else {
      var now = /* @__PURE__ */ new Date();
      if (now - lastTouchEndTime < doubleTapSpeedInMS) {
        if (transformOrigin) {
          var offset = getTransformOriginOffset();
          smoothZoom(offset.x, offset.y, zoomDoubleClickSpeed);
        } else {
          smoothZoom(lastSingleFingerOffset.x, lastSingleFingerOffset.y, zoomDoubleClickSpeed);
        }
      } else if (now - lastTouchStartTime < clickEventTimeInMS) {
        handlePotentialClickEvent(e);
      }
      lastTouchEndTime = now;
      triggerPanEnd();
      releaseTouches();
    }
  }
  function getPinchZoomLength(finger1, finger2) {
    var dx = finger1.clientX - finger2.clientX;
    var dy = finger1.clientY - finger2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
  function onDoubleClick(e) {
    beforeDoubleClick(e);
    var offset = getOffsetXY(e);
    if (transformOrigin) {
      offset = getTransformOriginOffset();
    }
    smoothZoom(offset.x, offset.y, zoomDoubleClickSpeed);
  }
  function onMouseDown(e) {
    clearPendingClickEventTimeout();
    if (beforeMouseDown(e)) return;
    lastMouseDownedEvent = e;
    lastMouseDownTime = /* @__PURE__ */ new Date();
    if (touchInProgress) {
      e.stopPropagation();
      return false;
    }
    var isLeftButton = e.button === 1 && window.event !== null || e.button === 0;
    if (!isLeftButton) return;
    smoothScroll.cancel();
    var offset = getOffsetXY(e);
    var point = transformToScreen(offset.x, offset.y);
    clickX = mouseX = point.x;
    clickY = mouseY = point.y;
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    textSelection.capture(e.target || e.srcElement);
    return false;
  }
  function onMouseMove(e) {
    if (touchInProgress) return;
    triggerPanStart();
    var offset = getOffsetXY(e);
    var point = transformToScreen(offset.x, offset.y);
    var dx = point.x - mouseX;
    var dy = point.y - mouseY;
    mouseX = point.x;
    mouseY = point.y;
    internalMoveBy(dx, dy);
  }
  function onMouseUp() {
    var now = /* @__PURE__ */ new Date();
    if (now - lastMouseDownTime < clickEventTimeInMS) handlePotentialClickEvent(lastMouseDownedEvent);
    textSelection.release();
    triggerPanEnd();
    releaseDocumentMouse();
  }
  function releaseDocumentMouse() {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    panstartFired = false;
  }
  function releaseTouches() {
    document.removeEventListener("touchmove", handleTouchMove);
    document.removeEventListener("touchend", handleTouchEnd);
    document.removeEventListener("touchcancel", handleTouchEnd);
    panstartFired = false;
    multiTouch = false;
    touchInProgress = false;
  }
  function onMouseWheel(e) {
    if (beforeWheel(e)) return;
    smoothScroll.cancel();
    var delta = e.deltaY;
    if (e.deltaMode > 0) delta *= 100;
    var scaleMultiplier = getScaleMultiplier(delta);
    if (scaleMultiplier !== 1) {
      var offset = transformOrigin ? getTransformOriginOffset() : getOffsetXY(e);
      publicZoomTo(offset.x, offset.y, scaleMultiplier);
      e.preventDefault();
    }
  }
  function getOffsetXY(e) {
    var offsetX, offsetY;
    var ownerRect = owner.getBoundingClientRect();
    offsetX = e.clientX - ownerRect.left;
    offsetY = e.clientY - ownerRect.top;
    return { x: offsetX, y: offsetY };
  }
  function smoothZoom(clientX, clientY, scaleMultiplier) {
    var fromValue = transform.scale;
    var from = { scale: fromValue };
    var to = { scale: scaleMultiplier * fromValue };
    smoothScroll.cancel();
    cancelZoomAnimation();
    zoomToAnimation = animate(from, to, {
      step: function(v) {
        zoomAbs(clientX, clientY, v.scale);
      },
      done: triggerZoomEnd
    });
  }
  function smoothZoomAbs(clientX, clientY, toScaleValue) {
    var fromValue = transform.scale;
    var from = { scale: fromValue };
    var to = { scale: toScaleValue };
    smoothScroll.cancel();
    cancelZoomAnimation();
    zoomToAnimation = animate(from, to, {
      step: function(v) {
        zoomAbs(clientX, clientY, v.scale);
      }
    });
  }
  function getTransformOriginOffset() {
    var ownerRect = owner.getBoundingClientRect();
    return {
      x: ownerRect.width * transformOrigin.x,
      y: ownerRect.height * transformOrigin.y
    };
  }
  function publicZoomTo(clientX, clientY, scaleMultiplier) {
    smoothScroll.cancel();
    cancelZoomAnimation();
    return zoomByRatio(clientX, clientY, scaleMultiplier);
  }
  function cancelZoomAnimation() {
    if (zoomToAnimation) {
      zoomToAnimation.cancel();
      zoomToAnimation = null;
    }
  }
  function getScaleMultiplier(delta) {
    var sign = Math.sign(delta);
    var deltaAdjustedSpeed = Math.min(0.25, Math.abs(speed * delta / 128));
    return 1 - sign * deltaAdjustedSpeed;
  }
  function triggerPanStart() {
    if (!panstartFired) {
      triggerEvent("panstart");
      panstartFired = true;
      smoothScroll.start();
    }
  }
  function triggerPanEnd() {
    if (panstartFired) {
      if (!multiTouch) smoothScroll.stop();
      triggerEvent("panend");
    }
  }
  function triggerZoomEnd() {
    triggerEvent("zoomend");
  }
  function triggerEvent(name) {
    api.fire(name, api);
  }
}
function parseTransformOrigin(options) {
  if (!options) return;
  if (typeof options === "object") {
    if (!isNumber(options.x) || !isNumber(options.y))
      failTransformOrigin(options);
    return options;
  }
  failTransformOrigin();
}
function failTransformOrigin(options) {
  console.error(options);
  throw new Error(
    [
      "Cannot parse transform origin.",
      "Some good examples:",
      '  "center center" can be achieved with {x: 0.5, y: 0.5}',
      '  "top center" can be achieved with {x: 0.5, y: 0}',
      '  "bottom right" can be achieved with {x: 1, y: 1}'
    ].join("\n")
  );
}
function noop3() {
}
function validateBounds(bounds) {
  var boundsType = typeof bounds;
  if (boundsType === "undefined" || boundsType === "boolean") return;
  var validBounds = isNumber(bounds.left) && isNumber(bounds.top) && isNumber(bounds.bottom) && isNumber(bounds.right);
  if (!validBounds)
    throw new Error(
      "Bounds object is not valid. It can be: undefined, boolean (true|false) or an object {left, top, right, bottom}"
    );
}
function isNumber(x) {
  return Number.isFinite(x);
}
function isNaN(value) {
  if (Number.isNaN) {
    return Number.isNaN(value);
  }
  return value !== value;
}
function rigidScroll() {
  return {
    start: noop3,
    stop: noop3,
    cancel: noop3
  };
}

// scripts/solid_monke/mini-solid.js
var equalFn = (a, b) => a === b;
var $PROXY = Symbol("solid-proxy");
var $TRACK = Symbol("solid-track");
var signalOptions = {
  equals: equalFn
};
var runEffects = runQueue;
var STALE = 1;
var PENDING = 2;
var UNOWNED = {
  owned: null,
  cleanups: null,
  context: null,
  owner: null
};
var Owner = null;
var Transition = null;
var Listener = null;
var Updates = null;
var Effects = null;
var ExecCount = 0;
function createRoot(fn, detachedOwner) {
  const listener = Listener, owner = Owner, unowned = fn.length === 0, current = detachedOwner === void 0 ? owner : detachedOwner, root = unowned ? UNOWNED : {
    owned: null,
    cleanups: null,
    context: current ? current.context : null,
    owner: current
  }, updateFn = unowned ? fn : () => fn(() => untrack(() => cleanNode(root)));
  Owner = root;
  Listener = null;
  try {
    return runUpdates(updateFn, true);
  } finally {
    Listener = listener;
    Owner = owner;
  }
}
function createSignal(value, options) {
  options = options ? Object.assign({}, signalOptions, options) : signalOptions;
  const s = {
    value,
    observers: null,
    observerSlots: null,
    comparator: options.equals || void 0
  };
  const setter = (value2) => {
    if (typeof value2 === "function") {
      value2 = value2(s.value);
    }
    return writeSignal(s, value2);
  };
  return [readSignal.bind(s), setter];
}
function createRenderEffect(fn, value, options) {
  const c = createComputation(fn, value, false, STALE);
  updateComputation(c);
}
function createEffect(fn, value, options) {
  runEffects = runUserEffects;
  const c = createComputation(fn, value, false, STALE);
  if (!options || !options.render) c.user = true;
  Effects ? Effects.push(c) : updateComputation(c);
}
function createMemo(fn, value, options) {
  options = options ? Object.assign({}, signalOptions, options) : signalOptions;
  const c = createComputation(fn, value, true, 0);
  c.observers = null;
  c.observerSlots = null;
  c.comparator = options.equals || void 0;
  updateComputation(c);
  return readSignal.bind(c);
}
function batch(fn) {
  return runUpdates(fn, false);
}
function untrack(fn) {
  if (Listener === null) return fn();
  const listener = Listener;
  Listener = null;
  try {
    return fn();
  } finally {
    Listener = listener;
  }
}
function onMount(fn) {
  createEffect(() => untrack(fn));
}
function onCleanup(fn) {
  if (Owner === null) ;
  else if (Owner.cleanups === null) Owner.cleanups = [fn];
  else Owner.cleanups.push(fn);
  return fn;
}
function getListener() {
  return Listener;
}
function children(fn) {
  const children2 = createMemo(fn);
  const memo = createMemo(() => resolveChildren(children2()));
  memo.toArray = () => {
    const c = memo();
    return Array.isArray(c) ? c : c != null ? [c] : [];
  };
  return memo;
}
function readSignal() {
  if (this.sources && this.state) {
    if (this.state === STALE)
      updateComputation(this);
    else {
      const updates = Updates;
      Updates = null;
      runUpdates(() => lookUpstream(this), false);
      Updates = updates;
    }
  }
  if (Listener) {
    const sSlot = this.observers ? this.observers.length : 0;
    if (!Listener.sources) {
      Listener.sources = [this];
      Listener.sourceSlots = [sSlot];
    } else {
      Listener.sources.push(this);
      Listener.sourceSlots.push(sSlot);
    }
    if (!this.observers) {
      this.observers = [Listener];
      this.observerSlots = [Listener.sources.length - 1];
    } else {
      this.observers.push(Listener);
      this.observerSlots.push(Listener.sources.length - 1);
    }
  }
  return this.value;
}
function writeSignal(node, value, isComp) {
  let current = node.value;
  if (!node.comparator || !node.comparator(current, value)) {
    node.value = value;
    if (node.observers && node.observers.length) {
      runUpdates(() => {
        for (let i = 0; i < node.observers.length; i += 1) {
          const o = node.observers[i];
          const TransitionRunning = Transition && Transition.running;
          if (TransitionRunning && Transition.disposed.has(o)) ;
          if (TransitionRunning ? !o.tState : !o.state) {
            if (o.pure) Updates.push(o);
            else Effects.push(o);
            if (o.observers) markDownstream(o);
          }
          if (!TransitionRunning) o.state = STALE;
        }
        if (Updates.length > 1e6) {
          Updates = [];
          if (false) ;
          throw new Error();
        }
      }, false);
    }
  }
  return value;
}
function updateComputation(node) {
  if (!node.fn) return;
  cleanNode(node);
  const owner = Owner, listener = Listener, time = ExecCount;
  Listener = Owner = node;
  runComputation(
    node,
    node.value,
    time
  );
  Listener = listener;
  Owner = owner;
}
function runComputation(node, value, time) {
  let nextValue;
  try {
    nextValue = node.fn(value);
  } catch (err) {
    if (node.pure) {
      {
        node.state = STALE;
        node.owned && node.owned.forEach(cleanNode);
        node.owned = null;
      }
    }
    node.updatedAt = time + 1;
    return handleError(err);
  }
  if (!node.updatedAt || node.updatedAt <= time) {
    if (node.updatedAt != null && "observers" in node) {
      writeSignal(node, nextValue);
    } else node.value = nextValue;
    node.updatedAt = time;
  }
}
function createComputation(fn, init, pure, state = STALE, options) {
  const c = {
    fn,
    state,
    updatedAt: null,
    owned: null,
    sources: null,
    sourceSlots: null,
    cleanups: null,
    value: init,
    owner: Owner,
    context: Owner ? Owner.context : null,
    pure
  };
  if (Owner === null) ;
  else if (Owner !== UNOWNED) {
    {
      if (!Owner.owned) Owner.owned = [c];
      else Owner.owned.push(c);
    }
  }
  return c;
}
function runTop(node) {
  if (node.state === 0) return;
  if (node.state === PENDING)
    return lookUpstream(node);
  if (node.suspense && untrack(node.suspense.inFallback))
    return node.suspense.effects.push(node);
  const ancestors = [node];
  while ((node = node.owner) && (!node.updatedAt || node.updatedAt < ExecCount)) {
    if (node.state) ancestors.push(node);
  }
  for (let i = ancestors.length - 1; i >= 0; i--) {
    node = ancestors[i];
    if (node.state === STALE) {
      updateComputation(node);
    } else if (node.state === PENDING) {
      const updates = Updates;
      Updates = null;
      runUpdates(() => lookUpstream(node, ancestors[0]), false);
      Updates = updates;
    }
  }
}
function runUpdates(fn, init) {
  if (Updates) return fn();
  let wait = false;
  if (!init) Updates = [];
  if (Effects) wait = true;
  else Effects = [];
  ExecCount++;
  try {
    const res = fn();
    completeUpdates(wait);
    return res;
  } catch (err) {
    if (!wait) Effects = null;
    Updates = null;
    handleError(err);
  }
}
function completeUpdates(wait) {
  if (Updates) {
    runQueue(Updates);
    Updates = null;
  }
  if (wait) return;
  const e = Effects;
  Effects = null;
  if (e.length) runUpdates(() => runEffects(e), false);
}
function runQueue(queue) {
  for (let i = 0; i < queue.length; i++) runTop(queue[i]);
}
function runUserEffects(queue) {
  let i, userLength = 0;
  for (i = 0; i < queue.length; i++) {
    const e = queue[i];
    if (!e.user) runTop(e);
    else queue[userLength++] = e;
  }
  for (i = 0; i < userLength; i++) runTop(queue[i]);
}
function lookUpstream(node, ignore) {
  node.state = 0;
  for (let i = 0; i < node.sources.length; i += 1) {
    const source = node.sources[i];
    if (source.sources) {
      const state = source.state;
      if (state === STALE) {
        if (source !== ignore && (!source.updatedAt || source.updatedAt < ExecCount))
          runTop(source);
      } else if (state === PENDING) lookUpstream(source, ignore);
    }
  }
}
function markDownstream(node) {
  for (let i = 0; i < node.observers.length; i += 1) {
    const o = node.observers[i];
    if (!o.state) {
      o.state = PENDING;
      if (o.pure) Updates.push(o);
      else Effects.push(o);
      o.observers && markDownstream(o);
    }
  }
}
function cleanNode(node) {
  let i;
  if (node.sources) {
    while (node.sources.length) {
      const source = node.sources.pop(), index = node.sourceSlots.pop(), obs = source.observers;
      if (obs && obs.length) {
        const n = obs.pop(), s = source.observerSlots.pop();
        if (index < obs.length) {
          n.sourceSlots[s] = index;
          obs[index] = n;
          source.observerSlots[index] = s;
        }
      }
    }
  }
  if (node.owned) {
    for (i = node.owned.length - 1; i >= 0; i--) cleanNode(node.owned[i]);
    node.owned = null;
  }
  if (node.cleanups) {
    for (i = node.cleanups.length - 1; i >= 0; i--) node.cleanups[i]();
    node.cleanups = null;
  }
  node.state = 0;
}
function castError(err) {
  if (err instanceof Error) return err;
  return new Error(typeof err === "string" ? err : "Unknown error", {
    cause: err
  });
}
function handleError(err, owner = Owner) {
  const error = castError(err);
  throw error;
}
function resolveChildren(children2) {
  if (typeof children2 === "function" && !children2.length)
    return resolveChildren(children2());
  if (Array.isArray(children2)) {
    const results = [];
    for (let i = 0; i < children2.length; i++) {
      const result = resolveChildren(children2[i]);
      Array.isArray(result) ? results.push.apply(results, result) : results.push(result);
    }
    return results;
  }
  return children2;
}
var FALLBACK = Symbol("fallback");
function dispose(d) {
  for (let i = 0; i < d.length; i++) d[i]();
}
function mapArray(list, mapFn, options = {}) {
  let items = [], mapped = [], disposers = [], len = 0, indexes = mapFn.length > 1 ? [] : null;
  onCleanup(() => dispose(disposers));
  return () => {
    let newItems = list() || [], i, j;
    newItems[$TRACK];
    return untrack(() => {
      let newLen = newItems.length, newIndices, newIndicesNext, temp, tempdisposers, tempIndexes, start, end, newEnd, item;
      if (newLen === 0) {
        if (len !== 0) {
          dispose(disposers);
          disposers = [];
          items = [];
          mapped = [];
          len = 0;
          indexes && (indexes = []);
        }
        if (options.fallback) {
          items = [FALLBACK];
          mapped[0] = createRoot((disposer) => {
            disposers[0] = disposer;
            return options.fallback();
          });
          len = 1;
        }
      } else if (len === 0) {
        mapped = new Array(newLen);
        for (j = 0; j < newLen; j++) {
          items[j] = newItems[j];
          mapped[j] = createRoot(mapper);
        }
        len = newLen;
      } else {
        temp = new Array(newLen);
        tempdisposers = new Array(newLen);
        indexes && (tempIndexes = new Array(newLen));
        for (start = 0, end = Math.min(len, newLen); start < end && items[start] === newItems[start]; start++) ;
        for (end = len - 1, newEnd = newLen - 1; end >= start && newEnd >= start && items[end] === newItems[newEnd]; end--, newEnd--) {
          temp[newEnd] = mapped[end];
          tempdisposers[newEnd] = disposers[end];
          indexes && (tempIndexes[newEnd] = indexes[end]);
        }
        newIndices = /* @__PURE__ */ new Map();
        newIndicesNext = new Array(newEnd + 1);
        for (j = newEnd; j >= start; j--) {
          item = newItems[j];
          i = newIndices.get(item);
          newIndicesNext[j] = i === void 0 ? -1 : i;
          newIndices.set(item, j);
        }
        for (i = start; i <= end; i++) {
          item = items[i];
          j = newIndices.get(item);
          if (j !== void 0 && j !== -1) {
            temp[j] = mapped[i];
            tempdisposers[j] = disposers[i];
            indexes && (tempIndexes[j] = indexes[i]);
            j = newIndicesNext[j];
            newIndices.set(item, j);
          } else disposers[i]();
        }
        for (j = start; j < newLen; j++) {
          if (j in temp) {
            mapped[j] = temp[j];
            disposers[j] = tempdisposers[j];
            if (indexes) {
              indexes[j] = tempIndexes[j];
              indexes[j](j);
            }
          } else mapped[j] = createRoot(mapper);
        }
        mapped = mapped.slice(0, len = newLen);
        items = newItems.slice(0);
      }
      return mapped;
    });
    function mapper(disposer) {
      disposers[j] = disposer;
      if (indexes) {
        const [s, set] = createSignal(j);
        indexes[j] = set;
        return mapFn(newItems[j], s);
      }
      return mapFn(newItems[j]);
    }
  };
}
function createComponent(Comp, props) {
  return untrack(() => Comp(props || {}));
}
var narrowedError = (name) => `Stale read from <${name}>.`;
function For(props) {
  const fallback = "fallback" in props && {
    fallback: () => props.fallback
  };
  return createMemo(
    mapArray(() => props.each, props.children, fallback || void 0)
  );
}
function Switch(props) {
  let keyed = false;
  const equals = (a, b) => a[0] === b[0] && (keyed ? a[1] === b[1] : !a[1] === !b[1]) && a[2] === b[2];
  const conditions = children(() => props.children), evalConditions = createMemo(
    () => {
      let conds = conditions();
      if (!Array.isArray(conds)) conds = [conds];
      for (let i = 0; i < conds.length; i++) {
        let c = conds[i].when;
        if (typeof c === "function") c = c();
        if (c) {
          keyed = !!conds[i].keyed;
          return [i, c, conds[i]];
        }
      }
      return [-1];
    },
    void 0,
    {
      equals
    }
  );
  return createMemo(
    () => {
      const [index, when, cond] = evalConditions();
      if (index < 0) return props.fallback;
      const c = cond.children;
      const fn = typeof c === "function" && c.length > 0;
      return fn ? untrack(
        () => c(
          keyed ? when : () => {
            if (untrack(evalConditions)[0] !== index)
              throw narrowedError("Match");
            return cond.when;
          }
        )
      ) : c;
    },
    void 0,
    void 0
  );
}
var booleans = [
  "allowfullscreen",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "controls",
  "default",
  "disabled",
  "formnovalidate",
  "hidden",
  "indeterminate",
  "ismap",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "seamless",
  "selected"
];
var Properties = /* @__PURE__ */ new Set([
  "className",
  "value",
  "readOnly",
  "formNoValidate",
  "isMap",
  "noModule",
  "playsInline",
  ...booleans
]);
var ChildProperties = /* @__PURE__ */ new Set([
  "innerHTML",
  "textContent",
  "innerText",
  "children"
]);
var Aliases = /* @__PURE__ */ Object.assign(/* @__PURE__ */ Object.create(null), {
  className: "class",
  htmlFor: "for"
});
var PropAliases = /* @__PURE__ */ Object.assign(/* @__PURE__ */ Object.create(null), {
  class: "className",
  formnovalidate: {
    $: "formNoValidate",
    BUTTON: 1,
    INPUT: 1
  },
  ismap: {
    $: "isMap",
    IMG: 1
  },
  nomodule: {
    $: "noModule",
    SCRIPT: 1
  },
  playsinline: {
    $: "playsInline",
    VIDEO: 1
  },
  readonly: {
    $: "readOnly",
    INPUT: 1,
    TEXTAREA: 1
  }
});
function getPropAlias(prop, tagName) {
  const a = PropAliases[prop];
  return typeof a === "object" ? a[tagName] ? a["$"] : void 0 : a;
}
var DelegatedEvents = /* @__PURE__ */ new Set([
  "beforeinput",
  "click",
  "dblclick",
  "contextmenu",
  "focusin",
  "focusout",
  "input",
  "keydown",
  "keyup",
  "mousedown",
  "mousemove",
  "mouseout",
  "mouseover",
  "mouseup",
  "pointerdown",
  "pointermove",
  "pointerout",
  "pointerover",
  "pointerup",
  "touchend",
  "touchmove",
  "touchstart"
]);
var SVGElements = /* @__PURE__ */ new Set([
  "altGlyph",
  "altGlyphDef",
  "altGlyphItem",
  "animate",
  "animateColor",
  "animateMotion",
  "animateTransform",
  "circle",
  "clipPath",
  "color-profile",
  "cursor",
  "defs",
  "desc",
  "ellipse",
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feDistantLight",
  "feFlood",
  "feFuncA",
  "feFuncB",
  "feFuncG",
  "feFuncR",
  "feGaussianBlur",
  "feImage",
  "feMerge",
  "feMergeNode",
  "feMorphology",
  "feOffset",
  "fePointLight",
  "feSpecularLighting",
  "feSpotLight",
  "feTile",
  "feTurbulence",
  "filter",
  "font",
  "font-face",
  "font-face-format",
  "font-face-name",
  "font-face-src",
  "font-face-uri",
  "foreignObject",
  "g",
  "glyph",
  "glyphRef",
  "hkern",
  "image",
  "line",
  "linearGradient",
  "marker",
  "mask",
  "metadata",
  "missing-glyph",
  "mpath",
  "path",
  "pattern",
  "polygon",
  "polyline",
  "radialGradient",
  "rect",
  "set",
  "stop",
  "svg",
  "switch",
  "symbol",
  "text",
  "textPath",
  "tref",
  "tspan",
  "use",
  "view",
  "vkern"
]);
var SVGNamespace = {
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace"
};
function reconcileArrays(parentNode, a, b) {
  let bLength = b.length, aEnd = a.length, bEnd = bLength, aStart = 0, bStart = 0, after = a[aEnd - 1].nextSibling, map = null;
  while (aStart < aEnd || bStart < bEnd) {
    if (a[aStart] === b[bStart]) {
      aStart++;
      bStart++;
      continue;
    }
    while (a[aEnd - 1] === b[bEnd - 1]) {
      aEnd--;
      bEnd--;
    }
    if (aEnd === aStart) {
      const node = bEnd < bLength ? bStart ? b[bStart - 1].nextSibling : b[bEnd - bStart] : after;
      while (bStart < bEnd) parentNode.insertBefore(b[bStart++], node);
    } else if (bEnd === bStart) {
      while (aStart < aEnd) {
        if (!map || !map.has(a[aStart])) a[aStart].remove();
        aStart++;
      }
    } else if (a[aStart] === b[bEnd - 1] && b[bStart] === a[aEnd - 1]) {
      const node = a[--aEnd].nextSibling;
      parentNode.insertBefore(b[bStart++], a[aStart++].nextSibling);
      parentNode.insertBefore(b[--bEnd], node);
      a[aEnd] = b[bEnd];
    } else {
      if (!map) {
        map = /* @__PURE__ */ new Map();
        let i = bStart;
        while (i < bEnd) map.set(b[i], i++);
      }
      const index = map.get(a[aStart]);
      if (index != null) {
        if (bStart < index && index < bEnd) {
          let i = aStart, sequence = 1, t;
          while (++i < aEnd && i < bEnd) {
            if ((t = map.get(a[i])) == null || t !== index + sequence) break;
            sequence++;
          }
          if (sequence > index - bStart) {
            const node = a[aStart];
            while (bStart < index) parentNode.insertBefore(b[bStart++], node);
          } else parentNode.replaceChild(b[bStart++], a[aStart++]);
        } else aStart++;
      } else a[aStart++].remove();
    }
  }
}
var $$EVENTS = "_$DX_DELEGATE";
function render(code, element, init, options = {}) {
  let disposer;
  createRoot((dispose2) => {
    disposer = dispose2;
    element === document ? code() : insert(element, code(), element.firstChild ? null : void 0, init);
  }, options.owner);
  return () => {
    disposer();
    element.textContent = "";
  };
}
function delegateEvents(eventNames, document2 = window.document) {
  const e = document2[$$EVENTS] || (document2[$$EVENTS] = /* @__PURE__ */ new Set());
  for (let i = 0, l = eventNames.length; i < l; i++) {
    const name = eventNames[i];
    if (!e.has(name)) {
      e.add(name);
      document2.addEventListener(name, eventHandler);
    }
  }
}
function setAttribute(node, name, value) {
  if (value == null) node.removeAttribute(name);
  else node.setAttribute(name, value);
}
function setAttributeNS(node, namespace, name, value) {
  if (value == null) node.removeAttributeNS(namespace, name);
  else node.setAttributeNS(namespace, name, value);
}
function className(node, value) {
  if (value == null) node.removeAttribute("class");
  else node.className = value;
}
function addEventListener(node, name, handler, delegate) {
  if (delegate) {
    if (Array.isArray(handler)) {
      node[`$$${name}`] = handler[0];
      node[`$$${name}Data`] = handler[1];
    } else node[`$$${name}`] = handler;
  } else if (Array.isArray(handler)) {
    const handlerFn = handler[0];
    node.addEventListener(
      name,
      handler[0] = (e) => handlerFn.call(node, handler[1], e)
    );
  } else node.addEventListener(name, handler);
}
function classList(node, value, prev = {}) {
  const classKeys = Object.keys(value || {}), prevKeys = Object.keys(prev);
  let i, len;
  for (i = 0, len = prevKeys.length; i < len; i++) {
    const key = prevKeys[i];
    if (!key || key === "undefined" || value[key]) continue;
    toggleClassKey(node, key, false);
    delete prev[key];
  }
  for (i = 0, len = classKeys.length; i < len; i++) {
    const key = classKeys[i], classValue = !!value[key];
    if (!key || key === "undefined" || prev[key] === classValue || !classValue)
      continue;
    toggleClassKey(node, key, true);
    prev[key] = classValue;
  }
  return prev;
}
function style(node, value, prev) {
  if (!value) return prev ? setAttribute(node, "style") : value;
  const nodeStyle = node.style;
  if (typeof value === "string") return nodeStyle.cssText = value;
  typeof prev === "string" && (nodeStyle.cssText = prev = void 0);
  prev || (prev = {});
  value || (value = {});
  let v, s;
  for (s in prev) {
    value[s] == null && nodeStyle.removeProperty(s);
    delete prev[s];
  }
  for (s in value) {
    v = value[s];
    if (v !== prev[s]) {
      nodeStyle.setProperty(s, v);
      prev[s] = v;
    }
  }
  return prev;
}
function spread(node, props = {}, isSVG, skipChildren) {
  const prevProps = {};
  if (!skipChildren) {
    createRenderEffect(
      () => prevProps.children = insertExpression(
        node,
        props.children,
        prevProps.children
      )
    );
  }
  createRenderEffect(() => props.ref && props.ref(node));
  createRenderEffect(() => assign(node, props, isSVG, true, prevProps, true));
  return prevProps;
}
function dynamicProperty(props, key) {
  const src = props[key];
  Object.defineProperty(props, key, {
    get() {
      return src();
    },
    enumerable: true
  });
  return props;
}
function insert(parent, accessor, marker, initial) {
  if (marker !== void 0 && !initial) initial = [];
  if (typeof accessor !== "function")
    return insertExpression(parent, accessor, initial, marker);
  createRenderEffect(
    (current) => insertExpression(parent, accessor(), current, marker),
    initial
  );
}
function assign(node, props, isSVG, skipChildren, prevProps = {}, skipRef = false) {
  props || (props = {});
  for (const prop in prevProps) {
    if (!(prop in props)) {
      if (prop === "children") continue;
      prevProps[prop] = assignProp(
        node,
        prop,
        null,
        prevProps[prop],
        isSVG,
        skipRef
      );
    }
  }
  for (const prop in props) {
    if (prop === "children") {
      if (!skipChildren) insertExpression(node, props.children);
      continue;
    }
    const value = props[prop];
    prevProps[prop] = assignProp(
      node,
      prop,
      value,
      prevProps[prop],
      isSVG,
      skipRef
    );
  }
}
function toPropertyName(name) {
  return name.toLowerCase().replace(/-([a-z])/g, (_, w) => w.toUpperCase());
}
function toggleClassKey(node, key, value) {
  const classNames = key.trim().split(/\s+/);
  for (let i = 0, nameLen = classNames.length; i < nameLen; i++)
    node.classList.toggle(classNames[i], value);
}
function assignProp(node, prop, value, prev, isSVG, skipRef) {
  let isCE, isProp, isChildProp, propAlias, forceProp;
  if (prop === "style") return style(node, value, prev);
  if (prop === "classList") return classList(node, value, prev);
  if (value === prev) return prev;
  if (prop === "ref") {
    if (!skipRef) value(node);
  } else if (prop.slice(0, 3) === "on:") {
    const e = prop.slice(3);
    prev && node.removeEventListener(e, prev);
    value && node.addEventListener(e, value);
  } else if (prop.slice(0, 10) === "oncapture:") {
    const e = prop.slice(10);
    prev && node.removeEventListener(e, prev, true);
    value && node.addEventListener(e, value, true);
  } else if (prop.slice(0, 2) === "on") {
    const name = prop.slice(2).toLowerCase();
    const delegate = DelegatedEvents.has(name);
    if (!delegate && prev) {
      const h3 = Array.isArray(prev) ? prev[0] : prev;
      node.removeEventListener(name, h3);
    }
    if (delegate || value) {
      addEventListener(node, name, value, delegate);
      delegate && delegateEvents([name]);
    }
  } else if (prop.slice(0, 5) === "attr:") {
    setAttribute(node, prop.slice(5), value);
  } else if ((forceProp = prop.slice(0, 5) === "prop:") || (isChildProp = ChildProperties.has(prop)) || !isSVG && ((propAlias = getPropAlias(prop, node.tagName)) || (isProp = Properties.has(prop))) || (isCE = node.nodeName.includes("-"))) {
    if (forceProp) {
      prop = prop.slice(5);
      isProp = true;
    }
    if (prop === "class" || prop === "className") className(node, value);
    else if (isCE && !isProp && !isChildProp)
      node[toPropertyName(prop)] = value;
    else node[propAlias || prop] = value;
  } else {
    const ns = isSVG && prop.indexOf(":") > -1 && SVGNamespace[prop.split(":")[0]];
    if (ns) setAttributeNS(node, ns, prop, value);
    else setAttribute(node, Aliases[prop] || prop, value);
  }
  return value;
}
function eventHandler(e) {
  const key = `$$${e.type}`;
  let node = e.composedPath && e.composedPath()[0] || e.target;
  if (e.target !== node) {
    Object.defineProperty(e, "target", {
      configurable: true,
      value: node
    });
  }
  Object.defineProperty(e, "currentTarget", {
    configurable: true,
    get() {
      return node || document;
    }
  });
  while (node) {
    const handler = node[key];
    if (handler && !node.disabled) {
      const data = node[`${key}Data`];
      data !== void 0 ? handler.call(node, data, e) : handler.call(node, e);
      if (e.cancelBubble) return;
    }
    node = node._$host || node.parentNode || node.host;
  }
}
function insertExpression(parent, value, current, marker, unwrapArray) {
  while (typeof current === "function") current = current();
  if (value === current) return current;
  const t = typeof value, multi = marker !== void 0;
  parent = multi && current[0] && current[0].parentNode || parent;
  if (t === "string" || t === "number") {
    if (t === "number") value = value.toString();
    if (multi) {
      let node = current[0];
      if (node && node.nodeType === 3) {
        node.data = value;
      } else node = document.createTextNode(value);
      current = cleanChildren(parent, current, marker, node);
    } else {
      if (current !== "" && typeof current === "string") {
        current = parent.firstChild.data = value;
      } else current = parent.textContent = value;
    }
  } else if (value == null || t === "boolean") {
    current = cleanChildren(parent, current, marker);
  } else if (t === "function") {
    createRenderEffect(() => {
      let v = value();
      while (typeof v === "function") v = v();
      current = insertExpression(parent, v, current, marker);
    });
    return () => current;
  } else if (Array.isArray(value)) {
    const array = [];
    const currentArray = current && Array.isArray(current);
    if (normalizeIncomingArray(array, value, current, unwrapArray)) {
      createRenderEffect(
        () => current = insertExpression(parent, array, current, marker, true)
      );
      return () => current;
    }
    if (array.length === 0) {
      current = cleanChildren(parent, current, marker);
      if (multi) return current;
    } else if (currentArray) {
      if (current.length === 0) {
        appendNodes(parent, array, marker);
      } else reconcileArrays(parent, current, array);
    } else {
      current && cleanChildren(parent);
      appendNodes(parent, array);
    }
    current = array;
  } else if (value.nodeType) {
    if (Array.isArray(current)) {
      if (multi)
        return current = cleanChildren(parent, current, marker, value);
      cleanChildren(parent, current, null, value);
    } else if (current == null || current === "" || !parent.firstChild) {
      parent.appendChild(value);
    } else parent.replaceChild(value, parent.firstChild);
    current = value;
  } else console.warn(`Unrecognized value. Skipped inserting`, value);
  return current;
}
function normalizeIncomingArray(normalized, array, current, unwrap2) {
  let dynamic = false;
  for (let i = 0, len = array.length; i < len; i++) {
    let item = array[i], prev = current && current[i], t;
    if (item == null || item === true || item === false) ;
    else if ((t = typeof item) === "object" && item.nodeType) {
      normalized.push(item);
    } else if (Array.isArray(item)) {
      dynamic = normalizeIncomingArray(normalized, item, prev) || dynamic;
    } else if (t === "function") {
      if (unwrap2) {
        while (typeof item === "function") item = item();
        dynamic = normalizeIncomingArray(
          normalized,
          Array.isArray(item) ? item : [item],
          Array.isArray(prev) ? prev : [prev]
        ) || dynamic;
      } else {
        normalized.push(item);
        dynamic = true;
      }
    } else {
      const value = String(item);
      if (prev && prev.nodeType === 3 && prev.data === value)
        normalized.push(prev);
      else normalized.push(document.createTextNode(value));
    }
  }
  return dynamic;
}
function appendNodes(parent, array, marker = null) {
  for (let i = 0, len = array.length; i < len; i++)
    parent.insertBefore(array[i], marker);
}
function cleanChildren(parent, current, marker, replacement) {
  if (marker === void 0) return parent.textContent = "";
  const node = replacement || document.createTextNode("");
  if (current.length) {
    let inserted = false;
    for (let i = current.length - 1; i >= 0; i--) {
      const el = current[i];
      if (node !== el) {
        const isParent = el.parentNode === parent;
        if (!inserted && !i)
          isParent ? parent.replaceChild(node, el) : parent.insertBefore(node, marker);
        else isParent && el.remove();
      } else inserted = true;
    }
  } else parent.insertBefore(node, marker);
  return [node];
}
var $ELEMENT = Symbol("hyper-element");
function createHyperScript(r) {
  function h3() {
    let args = [].slice.call(arguments), e, multiExpression = false;
    while (Array.isArray(args[0])) args = args[0];
    if (args[0][$ELEMENT]) args.unshift(h3.Fragment);
    typeof args[0] === "string" && detectMultiExpression(args);
    const ret = () => {
      while (args.length) item(args.shift());
      return e;
    };
    ret[$ELEMENT] = true;
    return ret;
    function item(l) {
      const type = typeof l;
      if (l == null) ;
      else if ("string" === type) {
        if (!e) parseClass(l);
        else e.appendChild(document.createTextNode(l));
      } else if ("number" === type || "boolean" === type || l instanceof Date || l instanceof RegExp) {
        e.appendChild(document.createTextNode(l.toString()));
      } else if (Array.isArray(l)) {
        for (let i = 0; i < l.length; i++) item(l[i]);
      } else if (l instanceof Element) {
        r.insert(e, l, multiExpression ? null : void 0);
      } else if ("object" === type) {
        let dynamic = false;
        const d = Object.getOwnPropertyDescriptors(l);
        for (const k in d) {
          if (k !== "ref" && k.slice(0, 2) !== "on" && typeof d[k].value === "function") {
            r.dynamicProperty(l, k);
            dynamic = true;
          } else if (d[k].get) dynamic = true;
        }
        dynamic ? r.spread(e, l, e instanceof SVGElement, !!args.length) : r.assign(e, l, e instanceof SVGElement, !!args.length);
      } else if ("function" === type) {
        if (!e) {
          let props, next = args[0];
          if (next == null || typeof next === "object" && !Array.isArray(next) && !(next instanceof Element))
            props = args.shift();
          props || (props = {});
          if (args.length) {
            props.children = args.length > 1 ? args : args[0];
          }
          const d = Object.getOwnPropertyDescriptors(props);
          for (const k in d) {
            if (Array.isArray(d[k].value)) {
              const list = d[k].value;
              props[k] = () => {
                for (let i = 0; i < list.length; i++) {
                  while (list[i][$ELEMENT]) list[i] = list[i]();
                }
                return list;
              };
              r.dynamicProperty(props, k);
            } else if (typeof d[k].value === "function" && !d[k].value.length)
              r.dynamicProperty(props, k);
          }
          e = r.createComponent(l, props);
          args = [];
        } else {
          while (l[$ELEMENT]) l = l();
          r.insert(e, l, multiExpression ? null : void 0);
        }
      }
    }
    function parseClass(string) {
      const m = string.split(/([\.#]?[^\s#.]+)/);
      if (/^\.|#/.test(m[1])) e = document.createElement("div");
      for (let i = 0; i < m.length; i++) {
        const v = m[i], s = v.substring(1, v.length);
        if (!v) continue;
        if (!e)
          e = r.SVGElements.has(v) ? document.createElementNS("http://www.w3.org/2000/svg", v) : document.createElement(v);
        else if (v[0] === ".") e.classList.add(s);
        else if (v[0] === "#") e.setAttribute("id", s);
      }
    }
    function detectMultiExpression(list) {
      for (let i = 1; i < list.length; i++) {
        if (typeof list[i] === "function") {
          multiExpression = true;
          return;
        } else if (Array.isArray(list[i])) {
          detectMultiExpression(list[i]);
        }
      }
    }
  }
  h3.Fragment = (props) => props.children;
  return h3;
}
var h = createHyperScript({
  spread,
  assign,
  insert,
  createComponent,
  dynamicProperty,
  SVGElements
});
var $RAW = Symbol("store-raw");
var $NODE = Symbol("store-node");
var $HAS = Symbol("store-has");
var $SELF = Symbol("store-self");
function isWrappable(obj) {
  let proto;
  return obj != null && typeof obj === "object" && (obj[$PROXY] || !(proto = Object.getPrototypeOf(obj)) || proto === Object.prototype || Array.isArray(obj));
}
function unwrap(item, set = /* @__PURE__ */ new Set()) {
  let result, unwrapped, v, prop;
  if (result = item != null && item[$RAW]) return result;
  if (!isWrappable(item) || set.has(item)) return item;
  if (Array.isArray(item)) {
    if (Object.isFrozen(item)) item = item.slice(0);
    else set.add(item);
    for (let i = 0, l = item.length; i < l; i++) {
      v = item[i];
      if ((unwrapped = unwrap(v, set)) !== v) item[i] = unwrapped;
    }
  } else {
    if (Object.isFrozen(item)) item = Object.assign({}, item);
    else set.add(item);
    const keys = Object.keys(item), desc = Object.getOwnPropertyDescriptors(item);
    for (let i = 0, l = keys.length; i < l; i++) {
      prop = keys[i];
      if (desc[prop].get) continue;
      v = item[prop];
      if ((unwrapped = unwrap(v, set)) !== v) item[prop] = unwrapped;
    }
  }
  return item;
}
function getNodes(target, symbol) {
  let nodes = target[symbol];
  if (!nodes)
    Object.defineProperty(target, symbol, {
      value: nodes = /* @__PURE__ */ Object.create(null)
    });
  return nodes;
}
function getNode(nodes, property, value) {
  if (nodes[property]) return nodes[property];
  const [s, set] = createSignal(value, {
    equals: false,
    internal: true
  });
  s.$ = set;
  return nodes[property] = s;
}
function trackSelf(target) {
  getListener() && getNode(getNodes(target, $NODE), $SELF)();
}
function ownKeys(target) {
  trackSelf(target);
  return Reflect.ownKeys(target);
}
function setProperty(state, property, value, deleting = false) {
  if (!deleting && state[property] === value) return;
  const prev = state[property], len = state.length;
  if (value === void 0) {
    delete state[property];
    if (state[$HAS] && state[$HAS][property] && prev !== void 0)
      state[$HAS][property].$();
  } else {
    state[property] = value;
    if (state[$HAS] && state[$HAS][property] && prev === void 0)
      state[$HAS][property].$();
  }
  let nodes = getNodes(state, $NODE), node;
  if (node = getNode(nodes, property, prev)) node.$(() => value);
  if (Array.isArray(state) && state.length !== len) {
    for (let i = state.length; i < len; i++) (node = nodes[i]) && node.$();
    (node = getNode(nodes, "length", len)) && node.$(state.length);
  }
  (node = nodes[$SELF]) && node.$();
}
function proxyDescriptor(target, property) {
  const desc = Reflect.getOwnPropertyDescriptor(target, property);
  if (!desc || desc.get || desc.set || !desc.configurable || property === $PROXY || property === $NODE)
    return desc;
  delete desc.value;
  delete desc.writable;
  desc.get = () => target[$PROXY][property];
  desc.set = (v) => target[$PROXY][property] = v;
  return desc;
}
var proxyTraps = {
  get(target, property, receiver) {
    if (property === $RAW) return target;
    if (property === $PROXY) return receiver;
    if (property === $TRACK) {
      trackSelf(target);
      return receiver;
    }
    const nodes = getNodes(target, $NODE);
    const tracked = nodes[property];
    let value = tracked ? tracked() : target[property];
    if (property === $NODE || property === $HAS || property === "__proto__")
      return value;
    if (!tracked) {
      const desc = Object.getOwnPropertyDescriptor(target, property);
      const isFunction = typeof value === "function";
      if (getListener() && (!isFunction || target.hasOwnProperty(property)) && !(desc && desc.get))
        value = getNode(nodes, property, value)();
      else if (value != null && isFunction && value === Array.prototype[property]) {
        return (...args) => batch(() => Array.prototype[property].apply(receiver, args));
      }
    }
    return isWrappable(value) ? wrap(value) : value;
  },
  has(target, property) {
    if (property === $RAW || property === $PROXY || property === $TRACK || property === $NODE || property === $HAS || property === "__proto__")
      return true;
    getListener() && getNode(getNodes(target, $HAS), property)();
    return property in target;
  },
  set(target, property, value) {
    batch(() => setProperty(target, property, unwrap(value)));
    return true;
  },
  deleteProperty(target, property) {
    batch(() => setProperty(target, property, void 0, true));
    return true;
  },
  ownKeys,
  getOwnPropertyDescriptor: proxyDescriptor
};
function wrap(value) {
  let p = value[$PROXY];
  if (!p) {
    Object.defineProperty(value, $PROXY, {
      value: p = new Proxy(value, proxyTraps)
    });
    const keys = Object.keys(value), desc = Object.getOwnPropertyDescriptors(value);
    for (let i = 0, l = keys.length; i < l; i++) {
      const prop = keys[i];
      if (desc[prop].get) {
        const get = desc[prop].get.bind(p);
        Object.defineProperty(value, prop, {
          get
        });
      }
      if (desc[prop].set) {
        const og = desc[prop].set, set = (v) => batch(() => og.call(p, v));
        Object.defineProperty(value, prop, {
          set
        });
      }
    }
  }
  return p;
}
function createMutable(state, options) {
  const unwrappedStore = unwrap(state || {});
  const wrappedStore = wrap(unwrappedStore);
  return wrappedStore;
}

// scripts/solid_monke/concise_html/index.js
function h2(strings, ...values) {
  let arr = strings.reduce((acc, str, i) => {
    acc.push(str);
    if (values[i]) {
      acc.push({ value: values[i], type: "expression" });
    }
    return acc;
  }, []);
  let parser = new Parser(arr);
  let ast = parser.parse();
  return converAstToHyperscript(ast);
}
var hyper = h;
function converAstToHyperscript(ast) {
  let ret = [];
  ast.forEach((element) => {
    let children2 = element.children.length > 0 ? converAstToHyperscript(element.children) : [];
    if (element.tag == "text" || element.tag == "expression") {
      ret.push(element.value);
    } else if (element.tag == "each") {
      let of = element.children.find((child) => child.tag === "of");
      let children3 = element.children.find((child) => child.tag === "children" || child.tag === "as");
      if (of && children3 && (of === null || of === void 0 ? void 0 : of.value) && (children3 === null || children3 === void 0 ? void 0 : children3.value)) {
        let e = () => each(of.value, children3.value);
        ret.push(e);
      } else {
        let f = of === null || of === void 0 ? void 0 : of.children.find((e2) => e2.tag === "expression");
        let c = children3 === null || children3 === void 0 ? void 0 : children3.children.find((e2) => e2.tag === "expression");
        if (!f || !c)
          throw new Error("Invalid each block");
        let e = () => each(f.value, c.value);
        ret.push(e);
      }
    } else if (element.tag == "when") {
      let w = element.children.find((e2) => e2.tag === "condition");
      let t = element.children.find((e2) => e2.tag === "then");
      if (!w || !t)
        throw new Error("Invalid when block");
      let e = () => if_then({ if: w.value, then: t.value });
    } else {
      ret.push(hyper(element.tag, element.attrs, children2));
    }
  });
  return ret;
}
var Parser = class {
  constructor(data) {
    this.data = data;
    this.index = 0;
    this.current = this.data[this.index];
    this.ast = [];
    this.cursor = 0;
  }
  peekNext() {
    if (this.index >= this.data.length)
      return void 0;
    else {
      let i = this.index;
      let peek = i + 1;
      let peeked = this.data[peek];
      return peeked;
    }
  }
  ended() {
    if (!this.char() && !this.peekNext())
      return true;
    else
      return false;
  }
  next() {
    if (this.index >= this.data.length)
      return void 0;
    else {
      this.index++;
      this.current = this.data[this.index];
      this.cursor = 0;
      return this.current;
    }
  }
  recursivelyCheckChildrenIndentAndAdd(element, last) {
    let compare = last;
    while (compare.children.length > 0) {
      let compareBuffer = compare.children[compare.children.length - 1];
      if (!compareBuffer)
        break;
      if (element.indent > compareBuffer.indent) {
        compare = compareBuffer;
      } else {
        break;
      }
    }
    compare.children.push(element);
  }
  parse() {
    while (!this.ended()) {
      let element = this.parseElement();
      let ast_last = this.ast[this.ast.length - 1];
      if (element) {
        if (ast_last && element.indent > ast_last.indent) {
          this.recursivelyCheckChildrenIndentAndAdd(element, ast_last);
        } else {
          this.ast.push(element);
        }
      } else
        break;
    }
    return this.ast;
  }
  parseElement() {
    let indent = 0;
    let tag = "";
    let attrs = {};
    let children2 = [];
    if (this.ended())
      return void 0;
    if (typeof this.current === "string") {
      indent = this.parseIndent();
    }
    if (typeof this.current === "string") {
      this.eatEmpty();
      tag = this.parseTag();
      if (tag === "")
        return void 0;
    } else if (this.current.type === "expression") {
    }
    attrs = this.parseAttrs();
    if (tag === "when" || tag === "each") {
      if (tag === "each") {
        children2 = this.parseEach(indent);
      }
      if (tag === "when") {
        children2 = this.parseWhen(indent);
      }
    } else
      children2 = this.parseText();
    if (tag === "#each")
      tag = "each";
    return {
      tag,
      attrs,
      children: children2,
      indent
    };
  }
  // pattern -> when [expression] then [expression]
  parseWhen(indent = 0) {
    let when = this.next();
    if (when === void 0)
      throw new Error("Invalid when [when]: WHEN needs to be an expression");
    if (typeof when !== "string") {
      if (when.type !== "expression")
        throw new Error("Invalid when [when]: WHEN needs to be an expression");
    } else
      throw new Error("Invalid when [when]: WHEN cannot be string");
    let then = this.next();
    if (then === void 0)
      throw new Error("Invalid when [then]: THEN needs to be an expression");
    if (typeof then == "string") {
      if (then.trim() !== "then")
        throw new Error("Invalid when [then]: THEN needs to be an expression");
    } else
      throw new Error("Invalid when [then]: THEN cannot be string");
    let value = this.next();
    if (value === void 0)
      throw new Error("Invalid when block");
    if (value.type !== "expression")
      throw new Error("Invalid when [when]: WHEN needs to be an expression");
    let next = this.next();
    if (next === void 0) {
    } else
      this.eatWhitespace();
    return [
      { tag: "condition", value: when.value, attrs: {}, children: [], indent: indent + 2 },
      { tag: "then", value: value.value, attrs: {}, children: [], indent: indent + 2 }
    ];
  }
  // ** If this is called, then we are sure that the tag is "each"
  // the pattern should be -> each [expression] as [expression]
  // if its not this we fail
  // if it is, we create a each block with children elements tag with of and children
  parseEach(indent = 0) {
    let of = this.next();
    if (of === void 0)
      throw new Error("Invalid each [of]: OF needs to be an expression");
    if (typeof of !== "string") {
      if (of.type !== "expression")
        throw new Error("Invalid each [of]: OF needs to be an expression");
    } else
      throw new Error("Invalid each [of]: OF cannot be string");
    let ofValue = this.next();
    if (ofValue === void 0)
      throw new Error("invalid each of [as]: as keyword missing");
    if (typeof ofValue === "string") {
      if (ofValue.trim() !== "as")
        throw new Error("invalid each of [as]: as keyword missing");
    } else
      throw new Error("ofValue is not a string");
    let asValue = this.next();
    if (asValue === void 0)
      throw new Error("Invalid each block");
    if (typeof asValue.value !== "function")
      throw new Error("Invalid d");
    let next = this.next();
    if (next === void 0) {
    } else
      this.eatWhitespace();
    return [
      { tag: "of", value: of.value, attrs: {}, children: [], indent: indent + 2 },
      { tag: "children", value: asValue.value, attrs: {}, children: [], indent: indent + 2 }
    ];
  }
  parseSingleLineText() {
    let ret = [];
    let text = "";
    while (this.char() !== `
`) {
      if (this.char() === void 0) {
        ret.push(this.makeTextElement(text));
        text = "";
        let next = this.next();
        if (next === void 0)
          break;
        if (typeof next !== "string") {
          ret.push(this.makeExpressionElement(next.value));
          this.next();
        }
      } else {
        text += this.eat();
      }
    }
    if (text !== "")
      ret.push(this.makeTextElement(text));
    return ret;
  }
  lookAhead(n = 1) {
    let c = this.cursor;
    let current = this.current;
    return current[c + n];
  }
  isThreeHyphens() {
    return this.lookAhead(0) === "-" && this.lookAhead(1) === "-" && this.lookAhead(2) === "-";
  }
  parseMultiLineText() {
    let ret = [];
    let text = "";
    while (!this.isThreeHyphens()) {
      if (this.char() === void 0) {
        ret.push(this.makeTextElement(text));
        text = "";
        let next = this.next();
        if (next === void 0)
          break;
        if (typeof next !== "string") {
          ret.push(this.makeExpressionElement(next.value));
          this.next();
        }
      } else {
        text += this.eat();
      }
    }
    if (this.isThreeHyphens()) {
      this.eat();
      this.eat();
      this.eat();
    }
    if (text !== "")
      ret.push(this.makeTextElement(text));
    return ret;
  }
  parseText() {
    let ret = [];
    this.eatWhitespace();
    if (this.char() === "-") {
      this.eat();
      if (this.char() === "-") {
        if (this.lookAhead() === "-") {
          this.eat();
          this.eat();
          this.eatWhitespace();
          ret = this.parseMultiLineText();
        } else {
          this.eat();
          this.eatWhitespace();
          ret = this.parseSingleLineText();
        }
      }
    }
    return ret;
  }
  makeExpressionElement(value) {
    return {
      tag: "expression",
      children: [],
      indent: 0,
      attrs: {},
      value
    };
  }
  makeTextElement(value) {
    return {
      tag: "text",
      children: [],
      indent: 0,
      attrs: {},
      value
    };
  }
  eatWhitespace() {
    while (this.current[this.cursor] === " ") {
      this.cursor++;
    }
  }
  eatNewline() {
  }
  eatEmpty() {
    while (this.char() === " " || this.char() === "\n" || this.char() === "	") {
      this.eat();
    }
  }
  char() {
    return this.current ? this.current[this.cursor] : void 0;
  }
  eat() {
    let char = this.current[this.cursor];
    this.cursor++;
    return char;
  }
  parseAttrs() {
    this.eatWhitespace();
    if (this.current[this.cursor] !== "[")
      return {};
    else {
      let attrs = {};
      this.cursor++;
      this.eatEmpty();
      while (this.char() !== "]") {
        let key = "";
        let value = "";
        this.eatEmpty();
        if (this.char() === void 0) {
          let next = this.next();
          if (next === void 0)
            throw new Error("Invalid attribute");
          if (typeof next !== "string") {
            key = next.value;
            this.next();
            if (this.char() === "=")
              this.eat();
            else
              throw new Error("Should have =");
          } else {
            key = this.parseKey();
          }
        } else {
          key = this.parseKey();
        }
        this.eatEmpty();
        if (this.char() === void 0) {
          let next = this.next();
          if (next === void 0)
            throw new Error("Invalid attribute");
          if (typeof next !== "string") {
            value = next.value;
            this.next();
          } else {
            value = this.parseValue();
          }
        } else {
          value = this.parseValue();
        }
        this.eatEmpty();
        attrs[key] = value;
      }
      this.eat();
      return attrs;
    }
  }
  parseKey() {
    let key = "";
    this.eatWhitespace();
    while (this.char() !== "=" && this.current.length > this.cursor) {
      key += this.eat();
    }
    this.eat();
    this.eatWhitespace();
    return key.trim();
  }
  parseValue() {
    let value = "";
    this.eatWhitespace();
    while (this.char() !== " ") {
      if (this.char() === void 0)
        break;
      if (this.char() === "]") {
        this.eat;
        break;
      }
      value += this.eat();
    }
    this.eatWhitespace();
    return value.trim();
  }
  parseIndent() {
    let i = 0;
    while (this.char() === " " || this.char() === "	" || this.char() === "\n") {
      if (this.char() === " ")
        i++;
      if (this.char() === "	")
        i += 2;
      if (this.char() === "\n")
        i = 0;
      this.cursor++;
    }
    return i;
  }
  parseTag() {
    let tag = "";
    while (this.char() !== " " && this.char() !== "\n" && this.char() !== "	" && this.char() !== "[" && this.char() !== void 0) {
      tag += this.eat();
    }
    return tag;
  }
  cursorCheck() {
    if (this.cursor >= this.current.length) {
      this.next();
    }
  }
};

// scripts/solid_monke/solid_monke.js
var sig = (val) => {
  const [getter, setter] = createSignal(val);
  getter.set = setter;
  return getter;
};
var mem = (callback) => createMemo(callback);
var each = (dep, children2) => () => For({ each: typeof dep === "function" ? dep() : /* @__PURE__ */ (() => dep)(), children: children2 });
var if_then = (...etc) => {
  const kids = etc.map((item) => {
    const [when, children2] = Array.isArray(item) ? item : if_then_object(item);
    return () => ({ when, children: children2 });
  });
  return Switch({
    fallback: null,
    children: kids
  });
};
var mounted = onMount;
var mut = createMutable;
var if_then_object = (obj) => {
  let cond = obj.if;
  let child = obj.then;
  return [cond, child];
};

// scripts/drag.js
var drag = (elem, options = {}) => {
  const pan = options.pan !== false;
  const pan_switch = options.pan_switch ? options.pan_switch : true;
  const bound = ["inner", "outer", "none"].includes(options.bound) ? options.bound : "inner";
  const set_left = options.set_left ? options.set_left : (left) => {
    elem.style.left = left + "px";
  };
  const set_top = options.set_top ? options.set_top : (top) => {
    elem.style.top = top + "px";
  };
  let lastPosX, lastPosY;
  let posX_min, posY_min, posX_max, posY_max;
  let parentScale;
  let isValid = normalize(elem);
  if (!isValid) return;
  elem.do_move = do_move;
  if (pan) {
    elem.addEventListener("pointerdown", handle_pointerdown);
    elem.addEventListener("pointerup", handle_pointerup);
    elem.addEventListener("pointermove", handle_pointermove);
    elem.style.position = "absolute";
  }
  function normalize(elem2) {
    const width = elem2.offsetWidth;
    const widthp = elem2.parentNode.offsetWidth;
    const height = elem2.offsetHeight;
    const heightp = elem2.parentNode.offsetHeight;
    if (width > widthp) {
      if (bound == "inner" && (width > widthp || height > heightp)) {
        console.error("panzoom() error: In the 'inner' mode, with or height must be smaller than its container (parent)");
        return false;
      } else if (bound == "outer" && (width < widthp || height < heightp)) {
        console.error("panzoom() error: In the 'outer' mode, with or height must be larger than its container (parent)");
        return false;
      }
    }
    return true;
  }
  function do_move(deltaX, deltaY) {
    lastPosX += deltaX;
    lastPosY += deltaY;
    if (bound !== "none") {
      lastPosX = Math.min(Math.max(posX_min, lastPosX), posX_max);
      lastPosY = Math.min(Math.max(posY_min, lastPosY), posY_max);
    }
    set_left(lastPosX);
    set_top(lastPosY);
  }
  function handle_pointerdown(e) {
    if (e.target !== e.currentTarget) return;
    let pann = typeof pan_switch === "function" ? pan_switch() : pan_switch;
    if (!pann) return;
    e.preventDefault();
    e.stopPropagation();
    e.target.style.cursor = "none";
    lastPosX = e.target.offsetLeft;
    lastPosY = e.target.offsetTop;
    const matrix = new WebKitCSSMatrix(getComputedStyle(e.target).getPropertyValue("transform"));
    const { a: scaleX, b: skewY, c: skewX, d: scaleY, e: translateX, f: translateY } = matrix;
    const scale = scaleX;
    if (bound == "inner") {
      posX_min = e.target.offsetWidth / 2 * (scale - 1) - translateX;
      posY_min = e.target.offsetHeight / 2 * (scale - 1) - translateY;
      posX_max = e.target.parentNode.offsetWidth - e.target.offsetWidth - e.target.offsetWidth / 2 * (scale - 1) - translateX;
      posY_max = e.target.parentNode.offsetHeight - e.target.offsetHeight - e.target.offsetHeight / 2 * (scale - 1) - translateY;
    } else if (bound == "outer") {
      posX_max = e.target.offsetWidth / 2 * (scale - 1) - translateX;
      posY_max = e.target.offsetHeight / 2 * (scale - 1) - translateY;
      posX_min = e.target.parentNode.offsetWidth - e.target.offsetWidth - e.target.offsetWidth / 2 * (scale - 1) - translateX;
      posY_min = e.target.parentNode.offsetHeight - e.target.offsetHeight - e.target.offsetHeight / 2 * (scale - 1) - translateY;
    }
    const { x: px1, y: py1, width: pwidth1, height: pheight1 } = e.target.parentNode.getBoundingClientRect();
    const pwidth2 = e.target.parentNode.offsetWidth;
    parentScale = pwidth1 / pwidth2;
    e.target.setPointerCapture(e.pointerId);
  }
  function handle_pointermove(e) {
    if (e.target !== e.currentTarget) return;
    if (!e.target.hasPointerCapture(e.pointerId)) return;
    let pann = typeof pan_switch === "function" ? pan_switch() : pan_switch;
    if (!pann) return;
    e.preventDefault();
    e.stopPropagation();
    const deltaX = e.movementX / parentScale;
    const deltaY = e.movementY / parentScale;
    do_move(deltaX, deltaY);
  }
  function handle_pointerup(e) {
    e.preventDefault();
    e.stopPropagation();
    e.target.style.cursor = "";
    e.target.releasePointerCapture(e.pointerId);
  }
  return { do_move };
};

// scripts/canvas_store.ts
var CanvasStore = class {
  contents;
  max_x = 2500;
  default_width = 300;
  default_height = 300;
  constructor() {
    this.contents = [];
  }
  check_if_node_exists(id) {
    return this.contents.every((node) => node.id !== id);
  }
  get_position_after_previous() {
    const last_node = this.contents[this.contents.length - 1];
    if (last_node === void 0) {
      return { x: 0, y: 0 };
    }
    const x = last_node.x + last_node.width + 10;
    const y = last_node.y;
    if (x > this.max_x) {
      return { x: 0, y: y + last_node.height + 10 };
    } else {
      return { x, y };
    }
  }
  add_block_as_node(block, position) {
    if (this.check_if_node_exists(block.id)) {
      const pos = position ? position : this.get_position_after_previous();
      const node = {
        id: block.id,
        class: block.class,
        base_class: "Block",
        x: pos.x,
        y: pos.y,
        width: this.default_width,
        height: this.default_height,
        children: [],
        source: block
      };
      this.contents.push(node);
      return node;
    }
  }
  add_channel_as_node(channel2, position) {
    if (this.check_if_node_exists(channel2.id)) {
      const pos = position ? position : this.get_position_after_previous();
      const node = {
        id: channel2.id,
        class: "Channel",
        base_class: "Channel",
        x: pos.x,
        y: pos.y,
        width: this.default_width,
        height: this.default_height,
        children: [],
        source: channel2
      };
      this.contents.push(node);
      return node;
    }
  }
  add_group_as_node(id, children2, position, dimension) {
    if (this.check_if_node_exists(id)) {
      console.log(children2);
      const node = {
        id,
        class: "Group",
        base_class: "Group",
        x: position.x,
        y: position.y,
        width: dimension.width,
        height: dimension.height,
        children: children2
      };
      this.contents.push(node);
      return node;
    }
  }
  get_node(id) {
    return this.contents.find((node) => node.id === id);
  }
  get_children(id) {
    return this.contents.filter((node) => node.children.includes(id));
  }
  get_position(id) {
    const node = this.get_node(id);
    if (node) {
      return { x: node.x, y: node.y };
    }
  }
  check_if_node_in_group(node_id) {
    let returning_group;
    this.contents.forEach((node) => {
      if (node.class === "Group") {
        const group = node;
        if (group.children.includes(node_id)) {
          returning_group = group;
        }
      }
    });
    return returning_group;
  }
  get_global_position(id) {
    const node = this.get_node(id);
    if (node) {
      const group = this.check_if_node_in_group(id);
      if (group) {
        console.log("is in a group", group);
        return { x: node.x + group.x, y: node.y + group.y };
      } else {
        return { x: node.x, y: node.y };
      }
    }
  }
  get_dimensions(id) {
    const node = this.get_node(id);
    if (node) {
      return { width: node.width, height: node.height };
    }
  }
  get_box(id) {
    const position = this.get_global_position(id);
    const dimensions = this.get_dimensions(id);
    if (position && dimensions) {
      return {
        top: position.y,
        left: position.x,
        right: position.x + dimensions.width,
        bottom: position.y + dimensions.height
      };
    }
  }
};

// scripts/script.ts
var channel_slug = "reading-week-fall-2024";
var selected = sig([]);
var channel = mut(new CanvasStore());
var small_box = document.querySelector(".small-box");
var recter = document.querySelector(".small-box-recter");
var panzoom = createPanZoom(small_box, {});
var rect_event = null;
var rectange_maker = (elem) => {
  let lastPosX, lastPosY;
  let parentScale;
  let ogX, ogY;
  let rect = null;
  elem.addEventListener("pointerdown", handle_pointerdown);
  elem.addEventListener("pointerup", handle_pointerup);
  elem.addEventListener("pointermove", handle_pointermove);
  function do_move(deltaX, deltaY) {
    lastPosX += deltaX;
    lastPosY += deltaY;
    let w, h3, x, y;
    if (lastPosX > ogX) {
      w = lastPosX - ogX;
      x = ogX;
    } else {
      w = ogX - lastPosX;
      x = lastPosX;
    }
    if (lastPosY > ogY) {
      h3 = lastPosY - ogY;
      y = ogY;
    } else {
      h3 = ogY - lastPosY;
      y = lastPosY;
    }
    if (rect) {
      rect.style.width = w + "px";
      rect.style.height = h3 + "px";
      rect.style.left = x + "px";
      rect.style.top = y + "px";
    }
  }
  function handle_pointerdown(e) {
    if (e.target !== e.currentTarget) return;
    e.preventDefault();
    e.stopPropagation();
    e.target.style.cursor = "crosshair";
    ogX = e.offsetX;
    ogY = e.offsetY;
    lastPosX = ogX;
    lastPosY = ogY;
    const { width: pwidth1 } = e.target.parentNode.getBoundingClientRect();
    const pwidth2 = e.target.parentNode.offsetWidth;
    parentScale = pwidth1 / pwidth2;
    let bor = 10;
    rect = document.createElement("div");
    rect.style.position = "absolute";
    rect.style.left = e.offsetX + "px";
    rect.style.top = e.offsetY + "px";
    rect.style.width = "0px";
    rect.style.height = "0px";
    rect.style.border = bor + "px solid black";
    rect.id = "rect";
    small_box?.appendChild(rect);
    e.target.setPointerCapture(e.pointerId);
  }
  function handle_pointermove(e) {
    if (e.target !== e.currentTarget) return;
    if (!e.target.hasPointerCapture(e.pointerId)) return;
    e.preventDefault();
    e.stopPropagation();
    const deltaX = e.movementX / parentScale;
    const deltaY = e.movementY / parentScale;
    do_move(deltaX, deltaY);
  }
  function handle_pointerup(e) {
    e.preventDefault();
    e.stopPropagation();
    e.target.style.cursor = "";
    e.target.releasePointerCapture(e.pointerId);
    if (rect) {
      let x = parseFloat(rect.style.left);
      let y = parseFloat(rect.style.top);
      let w = parseFloat(rect.style.width);
      let h3 = parseFloat(rect.style.height);
      rect?.remove();
      rect = null;
      recter.style.display = "none";
      panzoom.resume();
      if ("function" == typeof rect_event) rect_event(x, y, w, h3);
    }
  }
};
rectange_maker(recter);
get_channel(channel_slug).then((c) => {
  let blocks_cache = localStorage.getItem(channel_slug);
  if (blocks_cache) {
    let blocks = JSON.parse(blocks_cache);
    c.contents.forEach((block) => {
      let pos;
      if (blocks[block.id]) {
        console.log("found block", blocks[block.id]);
        let x = blocks[block.id].x;
        let y = blocks[block.id].y;
        pos = { x, y };
      }
      if (block.class == "Channel") {
        channel.add_channel_as_node(block, pos);
      } else if (block.base_class == "Block") {
        console.log("adding block pos", pos);
        channel.add_block_as_node(block);
      }
    });
  }
});
var panning = sig(true);
function intersecting(a, b) {
  return a.left <= b.right && b.left <= a.right && a.top <= b.bottom && b.top <= a.bottom;
}
var intersecting_blocks = (x, y, w, h3) => {
  channel.contents.forEach((block) => {
    if (block.class == "Group") return;
    let id = block.id;
    let in_group = channel.check_if_node_in_group(id);
    let global_pos = channel.get_global_position(id);
    let dimension = channel.get_dimensions(id);
    if (!global_pos || !dimension || in_group) return;
    let rect = {
      left: global_pos.x,
      top: global_pos.y,
      right: global_pos.x + dimension.width,
      bottom: global_pos.y + dimension.height
    };
    let other = {
      left: x,
      top: y,
      right: x + w,
      bottom: y + h3
    };
    if (intersecting(rect, other)) selected.set([...selected(), block.id]);
  });
  console.log("intersecting blocks", selected());
};
var Group = (group) => {
  let x = mem(() => group.x);
  let y = mem(() => group.y);
  let width = mem(() => group.width);
  let height = mem(() => group.height);
  let children_nodes = mem(() => group.children.map((id) => channel.get_node(id)));
  let onmount = () => {
    let elem = document.getElementById("group-" + group.id);
    drag(elem, { set_left: (x2) => {
      group.x = x2;
    }, set_top: (y2) => {
      group.y = y2;
    } });
  };
  mounted(onmount);
  let style2 = mem(() => `left:${x()}px; top:${y()}px; width:${width()}px; height:${height()}px;background-color:rgba(0, 0, 0, 0.1)`);
  return h2`
	.block.group [style=${style2} id=${"group-" + group.id}] 
		each of ${children_nodes} as ${(b) => Block(b, true)}`;
};
var Block = (block, grouped = false) => {
  if (channel.check_if_node_in_group(block.id) && !grouped) {
    return null;
  }
  if (block.base_class == "Group") return Group(block);
  let node = channel.get_node(block.id);
  if (!node) return;
  let x = mem(() => node.x);
  let y = mem(() => node.y);
  let width = mem(() => node.width);
  let height = mem(() => node.height);
  let set_x = (x2) => node.x = x2;
  let set_y = (y2) => node.y = y2;
  let onmount = () => {
    let elem = document.getElementById("block-" + block.id);
    drag(elem, { set_left: set_x, set_top: set_y });
  };
  let block_selected = mem(() => selected().includes(block.id));
  let style2 = mem(() => `left:${x()}px; top:${y()}px; width:${width()}px; height:${height()}px;background-color:${block_selected() ? "red" : "white"}`);
  if (block.class == "Text") return TextBlock(block, style2, onmount);
  if (block.class == "Image" || block.class == "Link") return ImageBlock(block, style2, onmount);
};
var ImageBlock = (block, style2, onmount) => {
  let image = block.source.image;
  mounted(onmount);
  let s = "width:100%";
  return h2`
	.block.image [style=${style2} id=${"block-" + block.id}] 
		img [src=${image.display.url} style=${s}]`;
};
var TextBlock = (block, style2, onmount) => {
  let content = block.source.content;
  mounted(onmount);
  return h2`.block.text [style=${style2} id=${"block-" + block.id}] -- ${content}`;
};
var Channel = () => {
  return h2`each of ${mem(() => channel.contents)} as ${Block}`;
};
function save_block_coordinates() {
  let blocks = {};
  document.querySelectorAll(".block").forEach((block) => {
    let id = block.id.split("-")[1];
    blocks[id] = { x: block.style.left, y: block.style.top };
  });
  localStorage.setItem(channel_slug, JSON.stringify(blocks));
}
document.addEventListener("keydown", (e) => {
  if (e.key === "g") {
    group_selected();
  }
  if (e.key === "z") {
    if (recter.style.display == "block") {
      recter.style.display = "none";
      panzoom.resume();
    } else {
      rect_event = (x, y, w, h3) => {
        let r = {
          top: y,
          left: x,
          right: x + w,
          bottom: y + h3
        };
        panzoom.showRectangle(r);
      };
      recter.style.display = "block";
      panzoom.pause();
    }
  }
  if (e.key === "v") {
    if (recter.style.display == "block") {
      recter.style.display = "none";
      panzoom.resume();
    } else {
      rect_event = intersecting_blocks;
      recter.style.display = "block";
      panzoom.pause();
    }
  }
  if (e.key == "=" && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
  }
  if (e.key == "-" && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
  }
  if (e.key === "1") {
  }
  if (e.key === "2") {
  }
  if (e.key === "Escape") {
    selected.set([]);
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
    save_block_coordinates();
  }
});
function uid() {
  return Date.now() + Math.floor(Math.random() * 1e3);
}
function group_selected() {
  let group_elem = document.createElement("div");
  group_elem.style.position = "absolute";
  let selected_elems = [...selected()];
  selected.set([]);
  let lefts = selected_elems.map((id) => channel.get_global_position(id)?.x).filter((x) => x !== void 0);
  let tops = selected_elems.map((id) => channel.get_global_position(id)?.y).filter((y) => y !== void 0);
  let lowest_x = Math.min(...lefts);
  let lowest_y = Math.min(...tops);
  let end_xs = selected_elems.map((id) => {
    let node = channel.get_box(id);
    return node?.right;
  }).filter((x) => x !== void 0);
  let end_ys = selected_elems.map((id) => {
    let node = channel.get_box(id);
    return node?.bottom;
  }).filter((y) => y !== void 0);
  let highest_x = Math.max(...end_xs);
  let highest_y = Math.max(...end_ys);
  channel.add_group_as_node(
    uid(),
    selected_elems,
    { x: lowest_x, y: lowest_y },
    { width: highest_x - lowest_x, height: highest_y - lowest_y }
  );
  selected_elems.forEach((id) => {
    let node = channel.get_node(id);
    if (!node) return;
    node.x = node.x - lowest_x;
    node.y = node.y - lowest_y;
  });
}
render(Channel, document.querySelector(".small-box"));
