(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

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
    var currentX, currentT, i6 = 0;
    do {
      currentT = aA + (aB - aA) / 2;
      currentX = calcBezier(currentT, mX1, mX2) - aX;
      if (currentX > 0) {
        aB = currentT;
      } else {
        aA = currentT;
      }
    } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i6 < SUBDIVISION_MAX_ITERATIONS);
    return currentT;
  }
  function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
    for (var i6 = 0; i6 < NEWTON_ITERATIONS; ++i6) {
      var currentSlope = getSlope(aGuessT, mX1, mX2);
      if (currentSlope === 0) {
        return aGuessT;
      }
      var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
      aGuessT -= currentX / currentSlope;
    }
    return aGuessT;
  }
  function LinearEasing(x3) {
    return x3;
  }
  function bezier(mX1, mY1, mX2, mY2) {
    if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) {
      throw new Error("bezier x values must be in [0, 1] range");
    }
    if (mX1 === mY1 && mX2 === mY2) {
      return LinearEasing;
    }
    var sampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);
    for (var i6 = 0; i6 < kSplineTableSize; ++i6) {
      sampleValues[i6] = calcBezier(i6 * kSampleStepSize, mX1, mX2);
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
    return function BezierEasing2(x3) {
      if (x3 === 0 || x3 === 1) {
        return x3;
      }
      return calcBezier(getTForX(x3), mY1, mY2);
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
      var t4 = easing(frame / durationInFrames);
      frame += 1;
      setValues(t4);
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
    function setValues(t4) {
      keys.forEach(function(key) {
        source[key] = diff[key] * t4 + start[key];
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
      var t4 = backBuffer;
      backBuffer = frontBuffer;
      frontBuffer = t4;
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
            for (var i6 = 0; i6 < callbacks.length; ++i6) {
              if (callbacks[i6].callback === callback) {
                callbacks.splice(i6, 1);
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
        for (var i6 = 0; i6 < callbacks.length; ++i6) {
          var callbackInfo = callbacks[i6];
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
    for (var i6 = 0; i6 < reservedWords.length; ++i6) {
      if (subject.hasOwnProperty(reservedWords[i6])) {
        throw new Error("Subject cannot be eventified, since it already has property '" + reservedWords[i6] + "'");
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
  function disabled(e4) {
    e4.stopPropagation();
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
    function transformToScreen(x3, y2) {
      if (panController.getScreenCTM) {
        var parentCTM = panController.getScreenCTM();
        var parentScaleX = parentCTM.a;
        var parentScaleY = parentCTM.d;
        var parentOffsetX = parentCTM.e;
        var parentOffsetY = parentCTM.f;
        storedCTMResult.x = x3 * parentScaleX - parentOffsetX;
        storedCTMResult.y = y2 * parentScaleY - parentOffsetY;
      } else {
        storedCTMResult.x = x3;
        storedCTMResult.y = y2;
      }
      return storedCTMResult;
    }
    function autocenter() {
      var w4;
      var h8;
      var left = 0;
      var top = 0;
      var sceneBoundingBox = getBoundingBox();
      if (sceneBoundingBox) {
        left = sceneBoundingBox.left;
        top = sceneBoundingBox.top;
        w4 = sceneBoundingBox.right - sceneBoundingBox.left;
        h8 = sceneBoundingBox.bottom - sceneBoundingBox.top;
      } else {
        var ownerRect = owner.getBoundingClientRect();
        w4 = ownerRect.width;
        h8 = ownerRect.height;
      }
      var bbox = panController.getBBox();
      if (bbox.width === 0 || bbox.height === 0) {
        return;
      }
      var dh = h8 / bbox.height;
      var dw = w4 / bbox.width;
      var scale = Math.min(dw, dh);
      transform.x = -(bbox.left + bbox.width / 2) * scale + w4 / 2 + left;
      transform.y = -(bbox.top + bbox.height / 2) * scale + h8 / 2 + top;
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
    function moveTo(x3, y2) {
      transform.x = x3;
      transform.y = y2;
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
    function client(x3, y2) {
      return {
        x: x3 * transform.scale + transform.x,
        y: y2 * transform.scale + transform.y
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
    function smoothMoveTo(x3, y2) {
      internalMoveBy(x3 - transform.x, y2 - transform.y, true);
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
        step: function(v3) {
          moveBy(v3.x - lastX, v3.y - lastY);
          lastX = v3.x;
          lastY = v3.y;
        }
      });
    }
    function scroll(x3, y2) {
      cancelZoomAnimation();
      moveTo(x3, y2);
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
    function onKeyDown(e4) {
      var x3 = 0, y2 = 0, z2 = 0;
      if (e4.keyCode === 38) {
        y2 = 1;
      } else if (e4.keyCode === 40) {
        y2 = -1;
      } else if (e4.keyCode === 37) {
        x3 = 1;
      } else if (e4.keyCode === 39) {
        x3 = -1;
      } else if (e4.keyCode === 189 || e4.keyCode === 109) {
        z2 = 1;
      } else if (e4.keyCode === 187 || e4.keyCode === 107) {
        z2 = -1;
      }
      if (filterKey(e4, x3, y2, z2)) {
        return;
      }
      if (x3 || y2) {
        e4.preventDefault();
        e4.stopPropagation();
        var clientRect = owner.getBoundingClientRect();
        var offset = Math.min(clientRect.width, clientRect.height);
        var moveSpeedRatio = 0.05;
        var dx = offset * moveSpeedRatio * x3;
        var dy = offset * moveSpeedRatio * y2;
        internalMoveBy(dx, dy);
      }
      if (z2) {
        var scaleMultiplier = getScaleMultiplier(z2 * 100);
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
    function onTouch(e4) {
      beforeTouch(e4);
      clearPendingClickEventTimeout();
      if (e4.touches.length === 1) {
        return handleSingleFingerTouch(e4, e4.touches[0]);
      } else if (e4.touches.length === 2) {
        pinchZoomLength = getPinchZoomLength(e4.touches[0], e4.touches[1]);
        multiTouch = true;
        startTouchListenerIfNeeded();
      }
    }
    function beforeTouch(e4) {
      if (options.onTouch && !options.onTouch(e4)) {
        return;
      }
      e4.stopPropagation();
      e4.preventDefault();
    }
    function beforeDoubleClick(e4) {
      clearPendingClickEventTimeout();
      if (options.onDoubleClick && !options.onDoubleClick(e4)) {
        return;
      }
      e4.preventDefault();
      e4.stopPropagation();
    }
    function handleSingleFingerTouch(e4) {
      lastTouchStartTime = /* @__PURE__ */ new Date();
      var touch = e4.touches[0];
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
    function handleTouchMove(e4) {
      if (e4.touches.length === 1) {
        e4.stopPropagation();
        var touch = e4.touches[0];
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
      } else if (e4.touches.length === 2) {
        multiTouch = true;
        var t1 = e4.touches[0];
        var t22 = e4.touches[1];
        var currentPinchLength = getPinchZoomLength(t1, t22);
        var scaleMultiplier = 1 + (currentPinchLength / pinchZoomLength - 1) * pinchSpeed;
        var firstTouchPoint = getOffsetXY(t1);
        var secondTouchPoint = getOffsetXY(t22);
        mouseX = (firstTouchPoint.x + secondTouchPoint.x) / 2;
        mouseY = (firstTouchPoint.y + secondTouchPoint.y) / 2;
        if (transformOrigin) {
          var offset = getTransformOriginOffset();
          mouseX = offset.x;
          mouseY = offset.y;
        }
        publicZoomTo(mouseX, mouseY, scaleMultiplier);
        pinchZoomLength = currentPinchLength;
        e4.stopPropagation();
        e4.preventDefault();
      }
    }
    function clearPendingClickEventTimeout() {
      if (pendingClickEventTimeout) {
        clearTimeout(pendingClickEventTimeout);
        pendingClickEventTimeout = 0;
      }
    }
    function handlePotentialClickEvent(e4) {
      if (!options.onClick) return;
      clearPendingClickEventTimeout();
      var dx = mouseX - clickX;
      var dy = mouseY - clickY;
      var l6 = Math.sqrt(dx * dx + dy * dy);
      if (l6 > 5) return;
      pendingClickEventTimeout = setTimeout(function() {
        pendingClickEventTimeout = 0;
        options.onClick(e4);
      }, doubleTapSpeedInMS);
    }
    function handleTouchEnd(e4) {
      clearPendingClickEventTimeout();
      if (e4.touches.length > 0) {
        var offset = getOffsetXY(e4.touches[0]);
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
          handlePotentialClickEvent(e4);
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
    function onDoubleClick(e4) {
      beforeDoubleClick(e4);
      var offset = getOffsetXY(e4);
      if (transformOrigin) {
        offset = getTransformOriginOffset();
      }
      smoothZoom(offset.x, offset.y, zoomDoubleClickSpeed);
    }
    function onMouseDown(e4) {
      clearPendingClickEventTimeout();
      if (beforeMouseDown(e4)) return;
      lastMouseDownedEvent = e4;
      lastMouseDownTime = /* @__PURE__ */ new Date();
      if (touchInProgress) {
        e4.stopPropagation();
        return false;
      }
      var isLeftButton = e4.button === 1 && window.event !== null || e4.button === 0;
      if (!isLeftButton) return;
      smoothScroll.cancel();
      var offset = getOffsetXY(e4);
      var point = transformToScreen(offset.x, offset.y);
      clickX = mouseX = point.x;
      clickY = mouseY = point.y;
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      textSelection.capture(e4.target || e4.srcElement);
      return false;
    }
    function onMouseMove(e4) {
      if (touchInProgress) return;
      triggerPanStart();
      var offset = getOffsetXY(e4);
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
    function onMouseWheel(e4) {
      if (beforeWheel(e4)) return;
      smoothScroll.cancel();
      var delta = e4.deltaY;
      if (e4.deltaMode > 0) delta *= 100;
      var scaleMultiplier = getScaleMultiplier(delta);
      if (scaleMultiplier !== 1) {
        var offset = transformOrigin ? getTransformOriginOffset() : getOffsetXY(e4);
        publicZoomTo(offset.x, offset.y, scaleMultiplier);
        e4.preventDefault();
      }
    }
    function getOffsetXY(e4) {
      var offsetX, offsetY;
      var ownerRect = owner.getBoundingClientRect();
      offsetX = e4.clientX - ownerRect.left;
      offsetY = e4.clientY - ownerRect.top;
      return { x: offsetX, y: offsetY };
    }
    function smoothZoom(clientX, clientY, scaleMultiplier) {
      var fromValue = transform.scale;
      var from = { scale: fromValue };
      var to = { scale: scaleMultiplier * fromValue };
      smoothScroll.cancel();
      cancelZoomAnimation();
      zoomToAnimation = animate(from, to, {
        step: function(v3) {
          zoomAbs(clientX, clientY, v3.scale);
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
        step: function(v3) {
          zoomAbs(clientX, clientY, v3.scale);
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
  function isNumber(x3) {
    return Number.isFinite(x3);
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
  var equalFn = (a6, b2) => a6 === b2;
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
    const s4 = {
      value,
      observers: null,
      observerSlots: null,
      comparator: options.equals || void 0
    };
    const setter = (value2) => {
      if (typeof value2 === "function") {
        value2 = value2(s4.value);
      }
      return writeSignal(s4, value2);
    };
    return [readSignal.bind(s4), setter];
  }
  function createRenderEffect(fn, value, options) {
    const c6 = createComputation(fn, value, false, STALE);
    updateComputation(c6);
  }
  function createEffect(fn, value, options) {
    runEffects = runUserEffects;
    const c6 = createComputation(fn, value, false, STALE);
    if (!options || !options.render) c6.user = true;
    Effects ? Effects.push(c6) : updateComputation(c6);
  }
  function createMemo(fn, value, options) {
    options = options ? Object.assign({}, signalOptions, options) : signalOptions;
    const c6 = createComputation(fn, value, true, 0);
    c6.observers = null;
    c6.observerSlots = null;
    c6.comparator = options.equals || void 0;
    updateComputation(c6);
    return readSignal.bind(c6);
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
      const c6 = memo();
      return Array.isArray(c6) ? c6 : c6 != null ? [c6] : [];
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
          for (let i6 = 0; i6 < node.observers.length; i6 += 1) {
            const o6 = node.observers[i6];
            const TransitionRunning = Transition && Transition.running;
            if (TransitionRunning && Transition.disposed.has(o6)) ;
            if (TransitionRunning ? !o6.tState : !o6.state) {
              if (o6.pure) Updates.push(o6);
              else Effects.push(o6);
              if (o6.observers) markDownstream(o6);
            }
            if (!TransitionRunning) o6.state = STALE;
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
    const c6 = {
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
        if (!Owner.owned) Owner.owned = [c6];
        else Owner.owned.push(c6);
      }
    }
    return c6;
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
    for (let i6 = ancestors.length - 1; i6 >= 0; i6--) {
      node = ancestors[i6];
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
    const e4 = Effects;
    Effects = null;
    if (e4.length) runUpdates(() => runEffects(e4), false);
  }
  function runQueue(queue) {
    for (let i6 = 0; i6 < queue.length; i6++) runTop(queue[i6]);
  }
  function runUserEffects(queue) {
    let i6, userLength = 0;
    for (i6 = 0; i6 < queue.length; i6++) {
      const e4 = queue[i6];
      if (!e4.user) runTop(e4);
      else queue[userLength++] = e4;
    }
    for (i6 = 0; i6 < userLength; i6++) runTop(queue[i6]);
  }
  function lookUpstream(node, ignore) {
    node.state = 0;
    for (let i6 = 0; i6 < node.sources.length; i6 += 1) {
      const source = node.sources[i6];
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
    for (let i6 = 0; i6 < node.observers.length; i6 += 1) {
      const o6 = node.observers[i6];
      if (!o6.state) {
        o6.state = PENDING;
        if (o6.pure) Updates.push(o6);
        else Effects.push(o6);
        o6.observers && markDownstream(o6);
      }
    }
  }
  function cleanNode(node) {
    let i6;
    if (node.sources) {
      while (node.sources.length) {
        const source = node.sources.pop(), index = node.sourceSlots.pop(), obs = source.observers;
        if (obs && obs.length) {
          const n5 = obs.pop(), s4 = source.observerSlots.pop();
          if (index < obs.length) {
            n5.sourceSlots[s4] = index;
            obs[index] = n5;
            source.observerSlots[index] = s4;
          }
        }
      }
    }
    if (node.owned) {
      for (i6 = node.owned.length - 1; i6 >= 0; i6--) cleanNode(node.owned[i6]);
      node.owned = null;
    }
    if (node.cleanups) {
      for (i6 = node.cleanups.length - 1; i6 >= 0; i6--) node.cleanups[i6]();
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
      for (let i6 = 0; i6 < children2.length; i6++) {
        const result = resolveChildren(children2[i6]);
        Array.isArray(result) ? results.push.apply(results, result) : results.push(result);
      }
      return results;
    }
    return children2;
  }
  var FALLBACK = Symbol("fallback");
  function dispose(d6) {
    for (let i6 = 0; i6 < d6.length; i6++) d6[i6]();
  }
  function mapArray(list, mapFn, options = {}) {
    let items = [], mapped = [], disposers = [], len = 0, indexes = mapFn.length > 1 ? [] : null;
    onCleanup(() => dispose(disposers));
    return () => {
      let newItems = list() || [], i6, j2;
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
          for (j2 = 0; j2 < newLen; j2++) {
            items[j2] = newItems[j2];
            mapped[j2] = createRoot(mapper);
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
          for (j2 = newEnd; j2 >= start; j2--) {
            item = newItems[j2];
            i6 = newIndices.get(item);
            newIndicesNext[j2] = i6 === void 0 ? -1 : i6;
            newIndices.set(item, j2);
          }
          for (i6 = start; i6 <= end; i6++) {
            item = items[i6];
            j2 = newIndices.get(item);
            if (j2 !== void 0 && j2 !== -1) {
              temp[j2] = mapped[i6];
              tempdisposers[j2] = disposers[i6];
              indexes && (tempIndexes[j2] = indexes[i6]);
              j2 = newIndicesNext[j2];
              newIndices.set(item, j2);
            } else disposers[i6]();
          }
          for (j2 = start; j2 < newLen; j2++) {
            if (j2 in temp) {
              mapped[j2] = temp[j2];
              disposers[j2] = tempdisposers[j2];
              if (indexes) {
                indexes[j2] = tempIndexes[j2];
                indexes[j2](j2);
              }
            } else mapped[j2] = createRoot(mapper);
          }
          mapped = mapped.slice(0, len = newLen);
          items = newItems.slice(0);
        }
        return mapped;
      });
      function mapper(disposer) {
        disposers[j2] = disposer;
        if (indexes) {
          const [s4, set] = createSignal(j2);
          indexes[j2] = set;
          return mapFn(newItems[j2], s4);
        }
        return mapFn(newItems[j2]);
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
    const equals = (a6, b2) => a6[0] === b2[0] && (keyed ? a6[1] === b2[1] : !a6[1] === !b2[1]) && a6[2] === b2[2];
    const conditions = children(() => props.children), evalConditions = createMemo(
      () => {
        let conds = conditions();
        if (!Array.isArray(conds)) conds = [conds];
        for (let i6 = 0; i6 < conds.length; i6++) {
          let c6 = conds[i6].when;
          if (typeof c6 === "function") c6 = c6();
          if (c6) {
            keyed = !!conds[i6].keyed;
            return [i6, c6, conds[i6]];
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
        const c6 = cond.children;
        const fn = typeof c6 === "function" && c6.length > 0;
        return fn ? untrack(
          () => c6(
            keyed ? when : () => {
              if (untrack(evalConditions)[0] !== index)
                throw narrowedError("Match");
              return cond.when;
            }
          )
        ) : c6;
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
    const a6 = PropAliases[prop];
    return typeof a6 === "object" ? a6[tagName] ? a6["$"] : void 0 : a6;
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
  function reconcileArrays(parentNode, a6, b2) {
    let bLength = b2.length, aEnd = a6.length, bEnd = bLength, aStart = 0, bStart = 0, after = a6[aEnd - 1].nextSibling, map = null;
    while (aStart < aEnd || bStart < bEnd) {
      if (a6[aStart] === b2[bStart]) {
        aStart++;
        bStart++;
        continue;
      }
      while (a6[aEnd - 1] === b2[bEnd - 1]) {
        aEnd--;
        bEnd--;
      }
      if (aEnd === aStart) {
        const node = bEnd < bLength ? bStart ? b2[bStart - 1].nextSibling : b2[bEnd - bStart] : after;
        while (bStart < bEnd) parentNode.insertBefore(b2[bStart++], node);
      } else if (bEnd === bStart) {
        while (aStart < aEnd) {
          if (!map || !map.has(a6[aStart])) a6[aStart].remove();
          aStart++;
        }
      } else if (a6[aStart] === b2[bEnd - 1] && b2[bStart] === a6[aEnd - 1]) {
        const node = a6[--aEnd].nextSibling;
        parentNode.insertBefore(b2[bStart++], a6[aStart++].nextSibling);
        parentNode.insertBefore(b2[--bEnd], node);
        a6[aEnd] = b2[bEnd];
      } else {
        if (!map) {
          map = /* @__PURE__ */ new Map();
          let i6 = bStart;
          while (i6 < bEnd) map.set(b2[i6], i6++);
        }
        const index = map.get(a6[aStart]);
        if (index != null) {
          if (bStart < index && index < bEnd) {
            let i6 = aStart, sequence = 1, t4;
            while (++i6 < aEnd && i6 < bEnd) {
              if ((t4 = map.get(a6[i6])) == null || t4 !== index + sequence) break;
              sequence++;
            }
            if (sequence > index - bStart) {
              const node = a6[aStart];
              while (bStart < index) parentNode.insertBefore(b2[bStart++], node);
            } else parentNode.replaceChild(b2[bStart++], a6[aStart++]);
          } else aStart++;
        } else a6[aStart++].remove();
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
    const e4 = document2[$$EVENTS] || (document2[$$EVENTS] = /* @__PURE__ */ new Set());
    for (let i6 = 0, l6 = eventNames.length; i6 < l6; i6++) {
      const name = eventNames[i6];
      if (!e4.has(name)) {
        e4.add(name);
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
        handler[0] = (e4) => handlerFn.call(node, handler[1], e4)
      );
    } else node.addEventListener(name, handler);
  }
  function classList(node, value, prev = {}) {
    const classKeys = Object.keys(value || {}), prevKeys = Object.keys(prev);
    let i6, len;
    for (i6 = 0, len = prevKeys.length; i6 < len; i6++) {
      const key = prevKeys[i6];
      if (!key || key === "undefined" || value[key]) continue;
      toggleClassKey(node, key, false);
      delete prev[key];
    }
    for (i6 = 0, len = classKeys.length; i6 < len; i6++) {
      const key = classKeys[i6], classValue = !!value[key];
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
    let v3, s4;
    for (s4 in prev) {
      value[s4] == null && nodeStyle.removeProperty(s4);
      delete prev[s4];
    }
    for (s4 in value) {
      v3 = value[s4];
      if (v3 !== prev[s4]) {
        nodeStyle.setProperty(s4, v3);
        prev[s4] = v3;
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
    return name.toLowerCase().replace(/-([a-z])/g, (_2, w4) => w4.toUpperCase());
  }
  function toggleClassKey(node, key, value) {
    const classNames = key.trim().split(/\s+/);
    for (let i6 = 0, nameLen = classNames.length; i6 < nameLen; i6++)
      node.classList.toggle(classNames[i6], value);
  }
  function assignProp(node, prop, value, prev, isSVG, skipRef) {
    let isCE, isProp, isChildProp, propAlias, forceProp;
    if (prop === "style") return style(node, value, prev);
    if (prop === "classList") return classList(node, value, prev);
    if (value === prev) return prev;
    if (prop === "ref") {
      if (!skipRef) value(node);
    } else if (prop.slice(0, 3) === "on:") {
      const e4 = prop.slice(3);
      prev && node.removeEventListener(e4, prev);
      value && node.addEventListener(e4, value);
    } else if (prop.slice(0, 10) === "oncapture:") {
      const e4 = prop.slice(10);
      prev && node.removeEventListener(e4, prev, true);
      value && node.addEventListener(e4, value, true);
    } else if (prop.slice(0, 2) === "on") {
      const name = prop.slice(2).toLowerCase();
      const delegate = DelegatedEvents.has(name);
      if (!delegate && prev) {
        const h8 = Array.isArray(prev) ? prev[0] : prev;
        node.removeEventListener(name, h8);
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
  function eventHandler(e4) {
    const key = `$$${e4.type}`;
    let node = e4.composedPath && e4.composedPath()[0] || e4.target;
    if (e4.target !== node) {
      Object.defineProperty(e4, "target", {
        configurable: true,
        value: node
      });
    }
    Object.defineProperty(e4, "currentTarget", {
      configurable: true,
      get() {
        return node || document;
      }
    });
    while (node) {
      const handler = node[key];
      if (handler && !node.disabled) {
        const data = node[`${key}Data`];
        data !== void 0 ? handler.call(node, data, e4) : handler.call(node, e4);
        if (e4.cancelBubble) return;
      }
      node = node._$host || node.parentNode || node.host;
    }
  }
  function insertExpression(parent, value, current, marker, unwrapArray) {
    while (typeof current === "function") current = current();
    if (value === current) return current;
    const t4 = typeof value, multi = marker !== void 0;
    parent = multi && current[0] && current[0].parentNode || parent;
    if (t4 === "string" || t4 === "number") {
      if (t4 === "number") value = value.toString();
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
    } else if (value == null || t4 === "boolean") {
      current = cleanChildren(parent, current, marker);
    } else if (t4 === "function") {
      createRenderEffect(() => {
        let v3 = value();
        while (typeof v3 === "function") v3 = v3();
        current = insertExpression(parent, v3, current, marker);
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
    for (let i6 = 0, len = array.length; i6 < len; i6++) {
      let item = array[i6], prev = current && current[i6], t4;
      if (item == null || item === true || item === false) ;
      else if ((t4 = typeof item) === "object" && item.nodeType) {
        normalized.push(item);
      } else if (Array.isArray(item)) {
        dynamic = normalizeIncomingArray(normalized, item, prev) || dynamic;
      } else if (t4 === "function") {
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
    for (let i6 = 0, len = array.length; i6 < len; i6++)
      parent.insertBefore(array[i6], marker);
  }
  function cleanChildren(parent, current, marker, replacement) {
    if (marker === void 0) return parent.textContent = "";
    const node = replacement || document.createTextNode("");
    if (current.length) {
      let inserted = false;
      for (let i6 = current.length - 1; i6 >= 0; i6--) {
        const el = current[i6];
        if (node !== el) {
          const isParent = el.parentNode === parent;
          if (!inserted && !i6)
            isParent ? parent.replaceChild(node, el) : parent.insertBefore(node, marker);
          else isParent && el.remove();
        } else inserted = true;
      }
    } else parent.insertBefore(node, marker);
    return [node];
  }
  var $ELEMENT = Symbol("hyper-element");
  function createHyperScript(r5) {
    function h8() {
      let args = [].slice.call(arguments), e4, multiExpression = false;
      while (Array.isArray(args[0])) args = args[0];
      if (args[0][$ELEMENT]) args.unshift(h8.Fragment);
      typeof args[0] === "string" && detectMultiExpression(args);
      const ret = () => {
        while (args.length) item(args.shift());
        return e4;
      };
      ret[$ELEMENT] = true;
      return ret;
      function item(l6) {
        const type = typeof l6;
        if (l6 == null) ;
        else if ("string" === type) {
          if (!e4) parseClass(l6);
          else e4.appendChild(document.createTextNode(l6));
        } else if ("number" === type || "boolean" === type || l6 instanceof Date || l6 instanceof RegExp) {
          e4.appendChild(document.createTextNode(l6.toString()));
        } else if (Array.isArray(l6)) {
          for (let i6 = 0; i6 < l6.length; i6++) item(l6[i6]);
        } else if (l6 instanceof Element) {
          r5.insert(e4, l6, multiExpression ? null : void 0);
        } else if ("object" === type) {
          let dynamic = false;
          const d6 = Object.getOwnPropertyDescriptors(l6);
          for (const k2 in d6) {
            if (k2 !== "ref" && k2.slice(0, 2) !== "on" && typeof d6[k2].value === "function") {
              r5.dynamicProperty(l6, k2);
              dynamic = true;
            } else if (d6[k2].get) dynamic = true;
          }
          dynamic ? r5.spread(e4, l6, e4 instanceof SVGElement, !!args.length) : r5.assign(e4, l6, e4 instanceof SVGElement, !!args.length);
        } else if ("function" === type) {
          if (!e4) {
            let props, next = args[0];
            if (next == null || typeof next === "object" && !Array.isArray(next) && !(next instanceof Element))
              props = args.shift();
            props || (props = {});
            if (args.length) {
              props.children = args.length > 1 ? args : args[0];
            }
            const d6 = Object.getOwnPropertyDescriptors(props);
            for (const k2 in d6) {
              if (Array.isArray(d6[k2].value)) {
                const list = d6[k2].value;
                props[k2] = () => {
                  for (let i6 = 0; i6 < list.length; i6++) {
                    while (list[i6][$ELEMENT]) list[i6] = list[i6]();
                  }
                  return list;
                };
                r5.dynamicProperty(props, k2);
              } else if (typeof d6[k2].value === "function" && !d6[k2].value.length)
                r5.dynamicProperty(props, k2);
            }
            e4 = r5.createComponent(l6, props);
            args = [];
          } else {
            while (l6[$ELEMENT]) l6 = l6();
            r5.insert(e4, l6, multiExpression ? null : void 0);
          }
        }
      }
      function parseClass(string) {
        const m5 = string.split(/([\.#]?[^\s#.]+)/);
        if (/^\.|#/.test(m5[1])) e4 = document.createElement("div");
        for (let i6 = 0; i6 < m5.length; i6++) {
          const v3 = m5[i6], s4 = v3.substring(1, v3.length);
          if (!v3) continue;
          if (!e4)
            e4 = r5.SVGElements.has(v3) ? document.createElementNS("http://www.w3.org/2000/svg", v3) : document.createElement(v3);
          else if (v3[0] === ".") e4.classList.add(s4);
          else if (v3[0] === "#") e4.setAttribute("id", s4);
        }
      }
      function detectMultiExpression(list) {
        for (let i6 = 1; i6 < list.length; i6++) {
          if (typeof list[i6] === "function") {
            multiExpression = true;
            return;
          } else if (Array.isArray(list[i6])) {
            detectMultiExpression(list[i6]);
          }
        }
      }
    }
    h8.Fragment = (props) => props.children;
    return h8;
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
    let result, unwrapped, v3, prop;
    if (result = item != null && item[$RAW]) return result;
    if (!isWrappable(item) || set.has(item)) return item;
    if (Array.isArray(item)) {
      if (Object.isFrozen(item)) item = item.slice(0);
      else set.add(item);
      for (let i6 = 0, l6 = item.length; i6 < l6; i6++) {
        v3 = item[i6];
        if ((unwrapped = unwrap(v3, set)) !== v3) item[i6] = unwrapped;
      }
    } else {
      if (Object.isFrozen(item)) item = Object.assign({}, item);
      else set.add(item);
      const keys = Object.keys(item), desc = Object.getOwnPropertyDescriptors(item);
      for (let i6 = 0, l6 = keys.length; i6 < l6; i6++) {
        prop = keys[i6];
        if (desc[prop].get) continue;
        v3 = item[prop];
        if ((unwrapped = unwrap(v3, set)) !== v3) item[prop] = unwrapped;
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
    const [s4, set] = createSignal(value, {
      equals: false,
      internal: true
    });
    s4.$ = set;
    return nodes[property] = s4;
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
      for (let i6 = state.length; i6 < len; i6++) (node = nodes[i6]) && node.$();
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
    desc.set = (v3) => target[$PROXY][property] = v3;
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
    let p6 = value[$PROXY];
    if (!p6) {
      Object.defineProperty(value, $PROXY, {
        value: p6 = new Proxy(value, proxyTraps)
      });
      const keys = Object.keys(value), desc = Object.getOwnPropertyDescriptors(value);
      for (let i6 = 0, l6 = keys.length; i6 < l6; i6++) {
        const prop = keys[i6];
        if (desc[prop].get) {
          const get = desc[prop].get.bind(p6);
          Object.defineProperty(value, prop, {
            get
          });
        }
        if (desc[prop].set) {
          const og = desc[prop].set, set = (v3) => batch(() => og.call(p6, v3));
          Object.defineProperty(value, prop, {
            set
          });
        }
      }
    }
    return p6;
  }
  function createMutable(state, options) {
    const unwrappedStore = unwrap(state || {});
    const wrappedStore = wrap(unwrappedStore);
    return wrappedStore;
  }

  // scripts/solid_monke/concise_html/index.js
  function h2(strings, ...values) {
    let arr = strings.reduce((acc, str, i6) => {
      acc.push(str);
      if (values[i6]) {
        acc.push({ value: values[i6], type: "expression" });
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
          let e4 = () => each(of.value, children3.value);
          ret.push(e4);
        } else {
          let f5 = of === null || of === void 0 ? void 0 : of.children.find((e5) => e5.tag === "expression");
          let c6 = children3 === null || children3 === void 0 ? void 0 : children3.children.find((e5) => e5.tag === "expression");
          if (!f5 || !c6)
            throw new Error("Invalid each block");
          let e4 = () => each(f5.value, c6.value);
          ret.push(e4);
        }
      } else if (element.tag == "when") {
        let w4 = element.children.find((e5) => e5.tag === "condition");
        let t4 = element.children.find((e5) => e5.tag === "then");
        if (!w4 || !t4)
          throw new Error("Invalid when block");
        let e4 = () => if_then({ if: w4.value, then: t4.value });
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
        let i6 = this.index;
        let peek = i6 + 1;
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
      let attrs2 = {};
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
      attrs2 = this.parseAttrs();
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
        attrs: attrs2,
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
    lookAhead(n5 = 1) {
      let c6 = this.cursor;
      let current = this.current;
      return current[c6 + n5];
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
        let attrs2 = {};
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
          attrs2[key] = value;
        }
        this.eat();
        return attrs2;
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
      let i6 = 0;
      while (this.char() === " " || this.char() === "	" || this.char() === "\n") {
        if (this.char() === " ")
          i6++;
        if (this.char() === "	")
          i6 += 2;
        if (this.char() === "\n")
          i6 = 0;
        this.cursor++;
      }
      return i6;
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
    function handle_pointerdown(e4) {
      let target = check_target(e4.target, e4.currentTarget);
      if (!target) return;
      let pann = typeof pan_switch === "function" ? pan_switch() : pan_switch;
      if (!pann) return;
      e4.preventDefault();
      e4.stopPropagation();
      target.style.cursor = "none";
      lastPosX = target.offsetLeft;
      lastPosY = target.offsetTop;
      const matrix = new WebKitCSSMatrix(getComputedStyle(e4.target).getPropertyValue("transform"));
      const { a: scaleX, b: skewY, c: skewX, d: scaleY, e: translateX, f: translateY } = matrix;
      const scale = scaleX;
      if (bound == "inner") {
        posX_min = target.offsetWidth / 2 * (scale - 1) - translateX;
        posY_min = target.offsetHeight / 2 * (scale - 1) - translateY;
        posX_max = target.parentNode.offsetWidth - target.offsetWidth - target.offsetWidth / 2 * (scale - 1) - translateX;
        posY_max = target.parentNode.offsetHeight - target.offsetHeight - target.offsetHeight / 2 * (scale - 1) - translateY;
      } else if (bound == "outer") {
        posX_max = target.offsetWidth / 2 * (scale - 1) - translateX;
        posY_max = target.offsetHeight / 2 * (scale - 1) - translateY;
        posX_min = target.parentNode.offsetWidth - target.offsetWidth - target.offsetWidth / 2 * (scale - 1) - translateX;
        posY_min = target.parentNode.offsetHeight - target.offsetHeight - target.offsetHeight / 2 * (scale - 1) - translateY;
      }
      const { x: px1, y: py1, width: pwidth1, height: pheight1 } = target.parentNode.getBoundingClientRect();
      const pwidth2 = target.parentNode.offsetWidth;
      parentScale = pwidth1 / pwidth2;
      target.setPointerCapture(e4.pointerId);
    }
    function check_target(elem2, target) {
      if (elem2 !== target) {
        let buffer = target;
        while (buffer !== document.body) {
          if (buffer === target) {
            return buffer;
          } else buffer = buffer.parentNode;
        }
        return false;
      }
      if (elem2 === target) return elem2;
    }
    function handle_pointermove(e4) {
      let target = check_target(e4.target, e4.currentTarget);
      if (!target) return;
      if (!target.hasPointerCapture(e4.pointerId)) return;
      let pann = typeof pan_switch === "function" ? pan_switch() : pan_switch;
      if (!pann) return;
      e4.preventDefault();
      e4.stopPropagation();
      const deltaX = e4.movementX / parentScale;
      const deltaY = e4.movementY / parentScale;
      do_move(deltaX, deltaY);
    }
    function handle_pointerup(e4) {
      let target = check_target(e4.target, e4.currentTarget);
      if (!target) return;
      e4.preventDefault();
      e4.stopPropagation();
      target.style.cursor = "";
      target.releasePointerCapture(e4.pointerId);
    }
    return { do_move };
  };

  // scripts/canvas_store.ts
  var CanvasStore = class {
    contents;
    lines = [];
    max_x = 2500;
    default_width = 300;
    default_height = 300;
    constructor() {
      this.contents = [];
      this.lines.push(mut({
        id: 1,
        class: "Path",
        base_class: "Path",
        points: mut({ list: [{ x: 250, y: 500 }, { x: 100, y: 150 }, { x: 350, y: 100 }, { x: 200, y: 500 }] })
      }));
    }
    get_lines() {
      return this.lines;
    }
    check_if_node_exists(id) {
      return this.contents.every((node) => node.id !== id);
    }
    get_position_after_previous() {
      const last_node = this.contents[this.contents.length - 1];
      if (last_node === void 0) {
        return { x: 0, y: 0 };
      }
      const x3 = last_node.x + last_node.width + 10;
      const y2 = last_node.y;
      if (x3 > this.max_x) {
        return { x: 0, y: y2 + last_node.height + 10 };
      } else {
        return { x: x3, y: y2 };
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
    add_channel_as_node(channel, position) {
      if (this.check_if_node_exists(channel.id)) {
        const pos = position ? position : this.get_position_after_previous();
        const node = {
          id: channel.id,
          class: "Channel",
          base_class: "Channel",
          x: pos.x,
          y: pos.y,
          width: this.default_width,
          height: this.default_height,
          children: [],
          source: channel
        };
        this.contents.push(node);
        return node;
      }
    }
    add_group_as_node(id, children2, position, dimension) {
      if (this.check_if_node_exists(id)) {
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
      return this.contents.filter((node) => node.children ? node.children.includes(id) : false);
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

  // scripts/markdown-it/mdurl.js
  var mdurl_exports = {};
  __export(mdurl_exports, {
    decode: () => e,
    default: () => mdurl_default,
    encode: () => n,
    format: () => o,
    parse: () => d
  });
  var t = {};
  function e(s4, n5) {
    "string" != typeof n5 && (n5 = e.defaultChars);
    const o6 = function(e4) {
      let s5 = t[e4];
      if (s5) return s5;
      s5 = t[e4] = [];
      for (let t4 = 0; t4 < 128; t4++) {
        const e5 = String.fromCharCode(t4);
        s5.push(e5);
      }
      for (let t4 = 0; t4 < e4.length; t4++) {
        const n6 = e4.charCodeAt(t4);
        s5[n6] = "%" + ("0" + n6.toString(16).toUpperCase()).slice(-2);
      }
      return s5;
    }(n5);
    return s4.replace(/(%[a-f0-9]{2})+/gi, function(t4) {
      let e4 = "";
      for (let s5 = 0, n6 = t4.length; s5 < n6; s5 += 3) {
        const h8 = parseInt(t4.slice(s5 + 1, s5 + 3), 16);
        if (h8 < 128) e4 += o6[h8];
        else {
          if (192 == (224 & h8) && s5 + 3 < n6) {
            const n7 = parseInt(t4.slice(s5 + 4, s5 + 6), 16);
            if (128 == (192 & n7)) {
              const t5 = h8 << 6 & 1984 | 63 & n7;
              e4 += t5 < 128 ? "\uFFFD\uFFFD" : String.fromCharCode(t5), s5 += 3;
              continue;
            }
          }
          if (224 == (240 & h8) && s5 + 6 < n6) {
            const n7 = parseInt(t4.slice(s5 + 4, s5 + 6), 16), o7 = parseInt(t4.slice(s5 + 7, s5 + 9), 16);
            if (128 == (192 & n7) && 128 == (192 & o7)) {
              const t5 = h8 << 12 & 61440 | n7 << 6 & 4032 | 63 & o7;
              e4 += t5 < 2048 || t5 >= 55296 && t5 <= 57343 ? "\uFFFD\uFFFD\uFFFD" : String.fromCharCode(t5), s5 += 6;
              continue;
            }
          }
          if (240 == (248 & h8) && s5 + 9 < n6) {
            const n7 = parseInt(t4.slice(s5 + 4, s5 + 6), 16), o7 = parseInt(t4.slice(s5 + 7, s5 + 9), 16), i6 = parseInt(t4.slice(s5 + 10, s5 + 12), 16);
            if (128 == (192 & n7) && 128 == (192 & o7) && 128 == (192 & i6)) {
              let t5 = h8 << 18 & 1835008 | n7 << 12 & 258048 | o7 << 6 & 4032 | 63 & i6;
              t5 < 65536 || t5 > 1114111 ? e4 += "\uFFFD\uFFFD\uFFFD\uFFFD" : (t5 -= 65536, e4 += String.fromCharCode(
                55296 + (t5 >> 10),
                56320 + (1023 & t5)
              )), s5 += 9;
              continue;
            }
          }
          e4 += "\uFFFD";
        }
      }
      return e4;
    });
  }
  e.defaultChars = ";/?:@&=+$,#", e.componentChars = "";
  var s = {};
  function n(t4, e4, o6) {
    "string" != typeof e4 && (o6 = e4, e4 = n.defaultChars), void 0 === o6 && (o6 = true);
    const h8 = function(t5) {
      let e5 = s[t5];
      if (e5) return e5;
      e5 = s[t5] = [];
      for (let t6 = 0; t6 < 128; t6++) {
        const s4 = String.fromCharCode(t6);
        /^[0-9a-z]$/i.test(s4) ? e5.push(s4) : e5.push("%" + ("0" + t6.toString(16).toUpperCase()).slice(-2));
      }
      for (let s4 = 0; s4 < t5.length; s4++) e5[t5.charCodeAt(s4)] = t5[s4];
      return e5;
    }(e4);
    let i6 = "";
    for (let e5 = 0, s4 = t4.length; e5 < s4; e5++) {
      const n5 = t4.charCodeAt(e5);
      if (o6 && 37 === n5 && e5 + 2 < s4 && /^[0-9a-f]{2}$/i.test(t4.slice(e5 + 1, e5 + 3)))
        i6 += t4.slice(e5, e5 + 3), e5 += 2;
      else if (n5 < 128) i6 += h8[n5];
      else if (n5 >= 55296 && n5 <= 57343) {
        if (n5 >= 55296 && n5 <= 56319 && e5 + 1 < s4) {
          const s5 = t4.charCodeAt(e5 + 1);
          if (s5 >= 56320 && s5 <= 57343) {
            i6 += encodeURIComponent(t4[e5] + t4[e5 + 1]), e5++;
            continue;
          }
        }
        i6 += "%EF%BF%BD";
      } else i6 += encodeURIComponent(t4[e5]);
    }
    return i6;
  }
  function o(t4) {
    let e4 = "";
    return e4 += t4.protocol || "", e4 += t4.slashes ? "//" : "", e4 += t4.auth ? t4.auth + "@" : "", t4.hostname && -1 !== t4.hostname.indexOf(":") ? e4 += "[" + t4.hostname + "]" : e4 += t4.hostname || "", e4 += t4.port ? ":" + t4.port : "", e4 += t4.pathname || "", e4 += t4.search || "", e4 += t4.hash || "", e4;
  }
  function h3() {
    this.protocol = null, this.slashes = null, this.auth = null, this.port = null, this.hostname = null, this.hash = null, this.search = null, this.pathname = null;
  }
  n.defaultChars = ";/?:@&=+$,-_.!~*'()#", n.componentChars = "-_.!~*'()";
  var i = /^([a-z0-9.+-]+:)/i;
  var r = /:[0-9]*$/;
  var a = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/;
  var l = ["{", "}", "|", "\\", "^", "`"].concat([
    "<",
    ">",
    '"',
    "`",
    " ",
    "\r",
    "\n",
    "	"
  ]);
  var c = ["'"].concat(l);
  var f = ["%", "/", "?", ";", "#"].concat(c);
  var p = ["/", "?", "#"];
  var u = /^[+a-z0-9A-Z_-]{0,63}$/;
  var m = /^([+a-z0-9A-Z_-]{0,63})(.*)$/;
  var g = { javascript: true, "javascript:": true };
  var C2 = {
    http: true,
    https: true,
    ftp: true,
    gopher: true,
    file: true,
    "http:": true,
    "https:": true,
    "ftp:": true,
    "gopher:": true,
    "file:": true
  };
  function d(t4, e4) {
    if (t4 && t4 instanceof h3) return t4;
    const s4 = new h3();
    return s4.parse(t4, e4), s4;
  }
  h3.prototype.parse = function(t4, e4) {
    let s4, n5, o6, h8 = t4;
    if (h8 = h8.trim(), !e4 && 1 === t4.split("#").length) {
      const t5 = a.exec(h8);
      if (t5) return this.pathname = t5[1], t5[2] && (this.search = t5[2]), this;
    }
    let r5 = i.exec(h8);
    if (r5 && (r5 = r5[0], s4 = r5.toLowerCase(), this.protocol = r5, h8 = h8.substr(r5.length)), (e4 || r5 || h8.match(/^\/\/[^@\/]+@[^@\/]+/)) && (o6 = "//" === h8.substr(0, 2), !o6 || r5 && g[r5] || (h8 = h8.substr(2), this.slashes = true)), !g[r5] && (o6 || r5 && !C2[r5])) {
      let t5, e5, s5 = -1;
      for (let t6 = 0; t6 < p.length; t6++)
        n5 = h8.indexOf(p[t6]), -1 !== n5 && (-1 === s5 || n5 < s5) && (s5 = n5);
      e5 = -1 === s5 ? h8.lastIndexOf("@") : h8.lastIndexOf("@", s5), -1 !== e5 && (t5 = h8.slice(0, e5), h8 = h8.slice(e5 + 1), this.auth = t5), s5 = -1;
      for (let t6 = 0; t6 < f.length; t6++)
        n5 = h8.indexOf(f[t6]), -1 !== n5 && (-1 === s5 || n5 < s5) && (s5 = n5);
      -1 === s5 && (s5 = h8.length), ":" === h8[s5 - 1] && s5--;
      const o7 = h8.slice(0, s5);
      h8 = h8.slice(s5), this.parseHost(o7), this.hostname = this.hostname || "";
      const i6 = "[" === this.hostname[0] && "]" === this.hostname[this.hostname.length - 1];
      if (!i6) {
        const t6 = this.hostname.split(/\./);
        for (let e6 = 0, s6 = t6.length; e6 < s6; e6++) {
          const s7 = t6[e6];
          if (s7 && !s7.match(u)) {
            let n6 = "";
            for (let t7 = 0, e7 = s7.length; t7 < e7; t7++)
              s7.charCodeAt(t7) > 127 ? n6 += "x" : n6 += s7[t7];
            if (!n6.match(u)) {
              const n7 = t6.slice(0, e6), o8 = t6.slice(e6 + 1), i7 = s7.match(m);
              i7 && (n7.push(i7[1]), o8.unshift(i7[2])), o8.length && (h8 = o8.join(".") + h8), this.hostname = n7.join(".");
              break;
            }
          }
        }
      }
      this.hostname.length > 255 && (this.hostname = ""), i6 && (this.hostname = this.hostname.substr(1, this.hostname.length - 2));
    }
    const l6 = h8.indexOf("#");
    -1 !== l6 && (this.hash = h8.substr(l6), h8 = h8.slice(0, l6));
    const c6 = h8.indexOf("?");
    return -1 !== c6 && (this.search = h8.substr(c6), h8 = h8.slice(0, c6)), h8 && (this.pathname = h8), C2[s4] && this.hostname && !this.pathname && (this.pathname = ""), this;
  }, h3.prototype.parseHost = function(t4) {
    let e4 = r.exec(t4);
    e4 && (e4 = e4[0], ":" !== e4 && (this.port = e4.substr(1)), t4 = t4.substr(0, t4.length - e4.length)), t4 && (this.hostname = t4);
  };
  var mdurl_default = null;

  // scripts/markdown-it/uc-micro.js
  var uc_micro_exports = {};
  __export(uc_micro_exports, {
    Any: () => u2,
    Cc: () => D,
    Cf: () => F,
    P: () => E,
    S: () => C3,
    Z: () => A2,
    default: () => uc_micro_default
  });
  var u2 = /[\0-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
  var D = /[\0-\x1F\x7F-\x9F]/;
  var F = /[\xAD\u0600-\u0605\u061C\u06DD\u070F\u0890\u0891\u08E2\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF\uFFF9-\uFFFB]|\uD804[\uDCBD\uDCCD]|\uD80D[\uDC30-\uDC3F]|\uD82F[\uDCA0-\uDCA3]|\uD834[\uDD73-\uDD7A]|\uDB40[\uDC01\uDC20-\uDC7F]/;
  var E = /[!-#%-\*,-\/:;\?@\[-\]_\{\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061D-\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C77\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1B7D\u1B7E\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4F\u2E52-\u2E5D\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD803[\uDEAD\uDF55-\uDF59\uDF86-\uDF89]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC8\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDC4B-\uDC4F\uDC5A\uDC5B\uDC5D\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDE60-\uDE6C\uDEB9\uDF3C-\uDF3E]|\uD806[\uDC3B\uDD44-\uDD46\uDDE2\uDE3F-\uDE46\uDE9A-\uDE9C\uDE9E-\uDEA2\uDF00-\uDF09]|\uD807[\uDC41-\uDC45\uDC70\uDC71\uDEF7\uDEF8\uDF43-\uDF4F\uDFFF]|\uD809[\uDC70-\uDC74]|\uD80B[\uDFF1\uDFF2]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD81B[\uDE97-\uDE9A\uDFE2]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]|\uD83A[\uDD5E\uDD5F]/;
  var C3 = /[\$\+<->\^`\|~\xA2-\xA6\xA8\xA9\xAC\xAE-\xB1\xB4\xB8\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u02FF\u0375\u0384\u0385\u03F6\u0482\u058D-\u058F\u0606-\u0608\u060B\u060E\u060F\u06DE\u06E9\u06FD\u06FE\u07F6\u07FE\u07FF\u0888\u09F2\u09F3\u09FA\u09FB\u0AF1\u0B70\u0BF3-\u0BFA\u0C7F\u0D4F\u0D79\u0E3F\u0F01-\u0F03\u0F13\u0F15-\u0F17\u0F1A-\u0F1F\u0F34\u0F36\u0F38\u0FBE-\u0FC5\u0FC7-\u0FCC\u0FCE\u0FCF\u0FD5-\u0FD8\u109E\u109F\u1390-\u1399\u166D\u17DB\u1940\u19DE-\u19FF\u1B61-\u1B6A\u1B74-\u1B7C\u1FBD\u1FBF-\u1FC1\u1FCD-\u1FCF\u1FDD-\u1FDF\u1FED-\u1FEF\u1FFD\u1FFE\u2044\u2052\u207A-\u207C\u208A-\u208C\u20A0-\u20C0\u2100\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F\u218A\u218B\u2190-\u2307\u230C-\u2328\u232B-\u2426\u2440-\u244A\u249C-\u24E9\u2500-\u2767\u2794-\u27C4\u27C7-\u27E5\u27F0-\u2982\u2999-\u29D7\u29DC-\u29FB\u29FE-\u2B73\u2B76-\u2B95\u2B97-\u2BFF\u2CE5-\u2CEA\u2E50\u2E51\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u2FF0-\u2FFF\u3004\u3012\u3013\u3020\u3036\u3037\u303E\u303F\u309B\u309C\u3190\u3191\u3196-\u319F\u31C0-\u31E3\u31EF\u3200-\u321E\u322A-\u3247\u3250\u3260-\u327F\u328A-\u32B0\u32C0-\u33FF\u4DC0-\u4DFF\uA490-\uA4C6\uA700-\uA716\uA720\uA721\uA789\uA78A\uA828-\uA82B\uA836-\uA839\uAA77-\uAA79\uAB5B\uAB6A\uAB6B\uFB29\uFBB2-\uFBC2\uFD40-\uFD4F\uFDCF\uFDFC-\uFDFF\uFE62\uFE64-\uFE66\uFE69\uFF04\uFF0B\uFF1C-\uFF1E\uFF3E\uFF40\uFF5C\uFF5E\uFFE0-\uFFE6\uFFE8-\uFFEE\uFFFC\uFFFD]|\uD800[\uDD37-\uDD3F\uDD79-\uDD89\uDD8C-\uDD8E\uDD90-\uDD9C\uDDA0\uDDD0-\uDDFC]|\uD802[\uDC77\uDC78\uDEC8]|\uD805\uDF3F|\uD807[\uDFD5-\uDFF1]|\uD81A[\uDF3C-\uDF3F\uDF45]|\uD82F\uDC9C|\uD833[\uDF50-\uDFC3]|\uD834[\uDC00-\uDCF5\uDD00-\uDD26\uDD29-\uDD64\uDD6A-\uDD6C\uDD83\uDD84\uDD8C-\uDDA9\uDDAE-\uDDEA\uDE00-\uDE41\uDE45\uDF00-\uDF56]|\uD835[\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3]|\uD836[\uDC00-\uDDFF\uDE37-\uDE3A\uDE6D-\uDE74\uDE76-\uDE83\uDE85\uDE86]|\uD838[\uDD4F\uDEFF]|\uD83B[\uDCAC\uDCB0\uDD2E\uDEF0\uDEF1]|\uD83C[\uDC00-\uDC2B\uDC30-\uDC93\uDCA0-\uDCAE\uDCB1-\uDCBF\uDCC1-\uDCCF\uDCD1-\uDCF5\uDD0D-\uDDAD\uDDE6-\uDE02\uDE10-\uDE3B\uDE40-\uDE48\uDE50\uDE51\uDE60-\uDE65\uDF00-\uDFFF]|\uD83D[\uDC00-\uDED7\uDEDC-\uDEEC\uDEF0-\uDEFC\uDF00-\uDF76\uDF7B-\uDFD9\uDFE0-\uDFEB\uDFF0]|\uD83E[\uDC00-\uDC0B\uDC10-\uDC47\uDC50-\uDC59\uDC60-\uDC87\uDC90-\uDCAD\uDCB0\uDCB1\uDD00-\uDE53\uDE60-\uDE6D\uDE70-\uDE7C\uDE80-\uDE88\uDE90-\uDEBD\uDEBF-\uDEC5\uDECE-\uDEDB\uDEE0-\uDEE8\uDEF0-\uDEF8\uDF00-\uDF92\uDF94-\uDFCA]/;
  var A2 = /[ \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/;
  var uc_micro_default = null;

  // scripts/markdown-it/entities.js
  var r2;
  var e2 = new Uint16Array('\u1D41<\xD5\u0131\u028A\u049D\u057B\u05D0\u0675\u06DE\u07A2\u07D6\u080F\u0A4A\u0A91\u0DA1\u0E6D\u0F09\u0F26\u10CA\u1228\u12E1\u1415\u149D\u14C3\u14DF\u1525\0\0\0\0\0\0\u156B\u16CD\u198D\u1C12\u1DDD\u1F7E\u2060\u21B0\u228D\u23C0\u23FB\u2442\u2824\u2912\u2D08\u2E48\u2FCE\u3016\u32BA\u3639\u37AC\u38FE\u3A28\u3A71\u3AE0\u3B2E\u0800EMabcfglmnoprstu\\bfms\x7F\x84\x8B\x90\x95\x98\xA6\xB3\xB9\xC8\xCFlig\u803B\xC6\u40C6P\u803B&\u4026cute\u803B\xC1\u40C1reve;\u4102\u0100iyx}rc\u803B\xC2\u40C2;\u4410r;\uC000\u{1D504}rave\u803B\xC0\u40C0pha;\u4391acr;\u4100d;\u6A53\u0100gp\x9D\xA1on;\u4104f;\uC000\u{1D538}plyFunction;\u6061ing\u803B\xC5\u40C5\u0100cs\xBE\xC3r;\uC000\u{1D49C}ign;\u6254ilde\u803B\xC3\u40C3ml\u803B\xC4\u40C4\u0400aceforsu\xE5\xFB\xFE\u0117\u011C\u0122\u0127\u012A\u0100cr\xEA\xF2kslash;\u6216\u0176\xF6\xF8;\u6AE7ed;\u6306y;\u4411\u0180crt\u0105\u010B\u0114ause;\u6235noullis;\u612Ca;\u4392r;\uC000\u{1D505}pf;\uC000\u{1D539}eve;\u42D8c\xF2\u0113mpeq;\u624E\u0700HOacdefhilorsu\u014D\u0151\u0156\u0180\u019E\u01A2\u01B5\u01B7\u01BA\u01DC\u0215\u0273\u0278\u027Ecy;\u4427PY\u803B\xA9\u40A9\u0180cpy\u015D\u0162\u017Aute;\u4106\u0100;i\u0167\u0168\u62D2talDifferentialD;\u6145leys;\u612D\u0200aeio\u0189\u018E\u0194\u0198ron;\u410Cdil\u803B\xC7\u40C7rc;\u4108nint;\u6230ot;\u410A\u0100dn\u01A7\u01ADilla;\u40B8terDot;\u40B7\xF2\u017Fi;\u43A7rcle\u0200DMPT\u01C7\u01CB\u01D1\u01D6ot;\u6299inus;\u6296lus;\u6295imes;\u6297o\u0100cs\u01E2\u01F8kwiseContourIntegral;\u6232eCurly\u0100DQ\u0203\u020FoubleQuote;\u601Duote;\u6019\u0200lnpu\u021E\u0228\u0247\u0255on\u0100;e\u0225\u0226\u6237;\u6A74\u0180git\u022F\u0236\u023Aruent;\u6261nt;\u622FourIntegral;\u622E\u0100fr\u024C\u024E;\u6102oduct;\u6210nterClockwiseContourIntegral;\u6233oss;\u6A2Fcr;\uC000\u{1D49E}p\u0100;C\u0284\u0285\u62D3ap;\u624D\u0580DJSZacefios\u02A0\u02AC\u02B0\u02B4\u02B8\u02CB\u02D7\u02E1\u02E6\u0333\u048D\u0100;o\u0179\u02A5trahd;\u6911cy;\u4402cy;\u4405cy;\u440F\u0180grs\u02BF\u02C4\u02C7ger;\u6021r;\u61A1hv;\u6AE4\u0100ay\u02D0\u02D5ron;\u410E;\u4414l\u0100;t\u02DD\u02DE\u6207a;\u4394r;\uC000\u{1D507}\u0100af\u02EB\u0327\u0100cm\u02F0\u0322ritical\u0200ADGT\u0300\u0306\u0316\u031Ccute;\u40B4o\u0174\u030B\u030D;\u42D9bleAcute;\u42DDrave;\u4060ilde;\u42DCond;\u62C4ferentialD;\u6146\u0470\u033D\0\0\0\u0342\u0354\0\u0405f;\uC000\u{1D53B}\u0180;DE\u0348\u0349\u034D\u40A8ot;\u60DCqual;\u6250ble\u0300CDLRUV\u0363\u0372\u0382\u03CF\u03E2\u03F8ontourIntegra\xEC\u0239o\u0274\u0379\0\0\u037B\xBB\u0349nArrow;\u61D3\u0100eo\u0387\u03A4ft\u0180ART\u0390\u0396\u03A1rrow;\u61D0ightArrow;\u61D4e\xE5\u02CAng\u0100LR\u03AB\u03C4eft\u0100AR\u03B3\u03B9rrow;\u67F8ightArrow;\u67FAightArrow;\u67F9ight\u0100AT\u03D8\u03DErrow;\u61D2ee;\u62A8p\u0241\u03E9\0\0\u03EFrrow;\u61D1ownArrow;\u61D5erticalBar;\u6225n\u0300ABLRTa\u0412\u042A\u0430\u045E\u047F\u037Crrow\u0180;BU\u041D\u041E\u0422\u6193ar;\u6913pArrow;\u61F5reve;\u4311eft\u02D2\u043A\0\u0446\0\u0450ightVector;\u6950eeVector;\u695Eector\u0100;B\u0459\u045A\u61BDar;\u6956ight\u01D4\u0467\0\u0471eeVector;\u695Fector\u0100;B\u047A\u047B\u61C1ar;\u6957ee\u0100;A\u0486\u0487\u62A4rrow;\u61A7\u0100ct\u0492\u0497r;\uC000\u{1D49F}rok;\u4110\u0800NTacdfglmopqstux\u04BD\u04C0\u04C4\u04CB\u04DE\u04E2\u04E7\u04EE\u04F5\u0521\u052F\u0536\u0552\u055D\u0560\u0565G;\u414AH\u803B\xD0\u40D0cute\u803B\xC9\u40C9\u0180aiy\u04D2\u04D7\u04DCron;\u411Arc\u803B\xCA\u40CA;\u442Dot;\u4116r;\uC000\u{1D508}rave\u803B\xC8\u40C8ement;\u6208\u0100ap\u04FA\u04FEcr;\u4112ty\u0253\u0506\0\0\u0512mallSquare;\u65FBerySmallSquare;\u65AB\u0100gp\u0526\u052Aon;\u4118f;\uC000\u{1D53C}silon;\u4395u\u0100ai\u053C\u0549l\u0100;T\u0542\u0543\u6A75ilde;\u6242librium;\u61CC\u0100ci\u0557\u055Ar;\u6130m;\u6A73a;\u4397ml\u803B\xCB\u40CB\u0100ip\u056A\u056Fsts;\u6203onentialE;\u6147\u0280cfios\u0585\u0588\u058D\u05B2\u05CCy;\u4424r;\uC000\u{1D509}lled\u0253\u0597\0\0\u05A3mallSquare;\u65FCerySmallSquare;\u65AA\u0370\u05BA\0\u05BF\0\0\u05C4f;\uC000\u{1D53D}All;\u6200riertrf;\u6131c\xF2\u05CB\u0600JTabcdfgorst\u05E8\u05EC\u05EF\u05FA\u0600\u0612\u0616\u061B\u061D\u0623\u066C\u0672cy;\u4403\u803B>\u403Emma\u0100;d\u05F7\u05F8\u4393;\u43DCreve;\u411E\u0180eiy\u0607\u060C\u0610dil;\u4122rc;\u411C;\u4413ot;\u4120r;\uC000\u{1D50A};\u62D9pf;\uC000\u{1D53E}eater\u0300EFGLST\u0635\u0644\u064E\u0656\u065B\u0666qual\u0100;L\u063E\u063F\u6265ess;\u62DBullEqual;\u6267reater;\u6AA2ess;\u6277lantEqual;\u6A7Eilde;\u6273cr;\uC000\u{1D4A2};\u626B\u0400Aacfiosu\u0685\u068B\u0696\u069B\u069E\u06AA\u06BE\u06CARDcy;\u442A\u0100ct\u0690\u0694ek;\u42C7;\u405Eirc;\u4124r;\u610ClbertSpace;\u610B\u01F0\u06AF\0\u06B2f;\u610DizontalLine;\u6500\u0100ct\u06C3\u06C5\xF2\u06A9rok;\u4126mp\u0144\u06D0\u06D8ownHum\xF0\u012Fqual;\u624F\u0700EJOacdfgmnostu\u06FA\u06FE\u0703\u0707\u070E\u071A\u071E\u0721\u0728\u0744\u0778\u078B\u078F\u0795cy;\u4415lig;\u4132cy;\u4401cute\u803B\xCD\u40CD\u0100iy\u0713\u0718rc\u803B\xCE\u40CE;\u4418ot;\u4130r;\u6111rave\u803B\xCC\u40CC\u0180;ap\u0720\u072F\u073F\u0100cg\u0734\u0737r;\u412AinaryI;\u6148lie\xF3\u03DD\u01F4\u0749\0\u0762\u0100;e\u074D\u074E\u622C\u0100gr\u0753\u0758ral;\u622Bsection;\u62C2isible\u0100CT\u076C\u0772omma;\u6063imes;\u6062\u0180gpt\u077F\u0783\u0788on;\u412Ef;\uC000\u{1D540}a;\u4399cr;\u6110ilde;\u4128\u01EB\u079A\0\u079Ecy;\u4406l\u803B\xCF\u40CF\u0280cfosu\u07AC\u07B7\u07BC\u07C2\u07D0\u0100iy\u07B1\u07B5rc;\u4134;\u4419r;\uC000\u{1D50D}pf;\uC000\u{1D541}\u01E3\u07C7\0\u07CCr;\uC000\u{1D4A5}rcy;\u4408kcy;\u4404\u0380HJacfos\u07E4\u07E8\u07EC\u07F1\u07FD\u0802\u0808cy;\u4425cy;\u440Cppa;\u439A\u0100ey\u07F6\u07FBdil;\u4136;\u441Ar;\uC000\u{1D50E}pf;\uC000\u{1D542}cr;\uC000\u{1D4A6}\u0580JTaceflmost\u0825\u0829\u082C\u0850\u0863\u09B3\u09B8\u09C7\u09CD\u0A37\u0A47cy;\u4409\u803B<\u403C\u0280cmnpr\u0837\u083C\u0841\u0844\u084Dute;\u4139bda;\u439Bg;\u67EAlacetrf;\u6112r;\u619E\u0180aey\u0857\u085C\u0861ron;\u413Ddil;\u413B;\u441B\u0100fs\u0868\u0970t\u0500ACDFRTUVar\u087E\u08A9\u08B1\u08E0\u08E6\u08FC\u092F\u095B\u0390\u096A\u0100nr\u0883\u088FgleBracket;\u67E8row\u0180;BR\u0899\u089A\u089E\u6190ar;\u61E4ightArrow;\u61C6eiling;\u6308o\u01F5\u08B7\0\u08C3bleBracket;\u67E6n\u01D4\u08C8\0\u08D2eeVector;\u6961ector\u0100;B\u08DB\u08DC\u61C3ar;\u6959loor;\u630Aight\u0100AV\u08EF\u08F5rrow;\u6194ector;\u694E\u0100er\u0901\u0917e\u0180;AV\u0909\u090A\u0910\u62A3rrow;\u61A4ector;\u695Aiangle\u0180;BE\u0924\u0925\u0929\u62B2ar;\u69CFqual;\u62B4p\u0180DTV\u0937\u0942\u094CownVector;\u6951eeVector;\u6960ector\u0100;B\u0956\u0957\u61BFar;\u6958ector\u0100;B\u0965\u0966\u61BCar;\u6952ight\xE1\u039Cs\u0300EFGLST\u097E\u098B\u0995\u099D\u09A2\u09ADqualGreater;\u62DAullEqual;\u6266reater;\u6276ess;\u6AA1lantEqual;\u6A7Dilde;\u6272r;\uC000\u{1D50F}\u0100;e\u09BD\u09BE\u62D8ftarrow;\u61DAidot;\u413F\u0180npw\u09D4\u0A16\u0A1Bg\u0200LRlr\u09DE\u09F7\u0A02\u0A10eft\u0100AR\u09E6\u09ECrrow;\u67F5ightArrow;\u67F7ightArrow;\u67F6eft\u0100ar\u03B3\u0A0Aight\xE1\u03BFight\xE1\u03CAf;\uC000\u{1D543}er\u0100LR\u0A22\u0A2CeftArrow;\u6199ightArrow;\u6198\u0180cht\u0A3E\u0A40\u0A42\xF2\u084C;\u61B0rok;\u4141;\u626A\u0400acefiosu\u0A5A\u0A5D\u0A60\u0A77\u0A7C\u0A85\u0A8B\u0A8Ep;\u6905y;\u441C\u0100dl\u0A65\u0A6FiumSpace;\u605Flintrf;\u6133r;\uC000\u{1D510}nusPlus;\u6213pf;\uC000\u{1D544}c\xF2\u0A76;\u439C\u0480Jacefostu\u0AA3\u0AA7\u0AAD\u0AC0\u0B14\u0B19\u0D91\u0D97\u0D9Ecy;\u440Acute;\u4143\u0180aey\u0AB4\u0AB9\u0ABEron;\u4147dil;\u4145;\u441D\u0180gsw\u0AC7\u0AF0\u0B0Eative\u0180MTV\u0AD3\u0ADF\u0AE8ediumSpace;\u600Bhi\u0100cn\u0AE6\u0AD8\xEB\u0AD9eryThi\xEE\u0AD9ted\u0100GL\u0AF8\u0B06reaterGreate\xF2\u0673essLes\xF3\u0A48Line;\u400Ar;\uC000\u{1D511}\u0200Bnpt\u0B22\u0B28\u0B37\u0B3Areak;\u6060BreakingSpace;\u40A0f;\u6115\u0680;CDEGHLNPRSTV\u0B55\u0B56\u0B6A\u0B7C\u0BA1\u0BEB\u0C04\u0C5E\u0C84\u0CA6\u0CD8\u0D61\u0D85\u6AEC\u0100ou\u0B5B\u0B64ngruent;\u6262pCap;\u626DoubleVerticalBar;\u6226\u0180lqx\u0B83\u0B8A\u0B9Bement;\u6209ual\u0100;T\u0B92\u0B93\u6260ilde;\uC000\u2242\u0338ists;\u6204reater\u0380;EFGLST\u0BB6\u0BB7\u0BBD\u0BC9\u0BD3\u0BD8\u0BE5\u626Fqual;\u6271ullEqual;\uC000\u2267\u0338reater;\uC000\u226B\u0338ess;\u6279lantEqual;\uC000\u2A7E\u0338ilde;\u6275ump\u0144\u0BF2\u0BFDownHump;\uC000\u224E\u0338qual;\uC000\u224F\u0338e\u0100fs\u0C0A\u0C27tTriangle\u0180;BE\u0C1A\u0C1B\u0C21\u62EAar;\uC000\u29CF\u0338qual;\u62ECs\u0300;EGLST\u0C35\u0C36\u0C3C\u0C44\u0C4B\u0C58\u626Equal;\u6270reater;\u6278ess;\uC000\u226A\u0338lantEqual;\uC000\u2A7D\u0338ilde;\u6274ested\u0100GL\u0C68\u0C79reaterGreater;\uC000\u2AA2\u0338essLess;\uC000\u2AA1\u0338recedes\u0180;ES\u0C92\u0C93\u0C9B\u6280qual;\uC000\u2AAF\u0338lantEqual;\u62E0\u0100ei\u0CAB\u0CB9verseElement;\u620CghtTriangle\u0180;BE\u0CCB\u0CCC\u0CD2\u62EBar;\uC000\u29D0\u0338qual;\u62ED\u0100qu\u0CDD\u0D0CuareSu\u0100bp\u0CE8\u0CF9set\u0100;E\u0CF0\u0CF3\uC000\u228F\u0338qual;\u62E2erset\u0100;E\u0D03\u0D06\uC000\u2290\u0338qual;\u62E3\u0180bcp\u0D13\u0D24\u0D4Eset\u0100;E\u0D1B\u0D1E\uC000\u2282\u20D2qual;\u6288ceeds\u0200;EST\u0D32\u0D33\u0D3B\u0D46\u6281qual;\uC000\u2AB0\u0338lantEqual;\u62E1ilde;\uC000\u227F\u0338erset\u0100;E\u0D58\u0D5B\uC000\u2283\u20D2qual;\u6289ilde\u0200;EFT\u0D6E\u0D6F\u0D75\u0D7F\u6241qual;\u6244ullEqual;\u6247ilde;\u6249erticalBar;\u6224cr;\uC000\u{1D4A9}ilde\u803B\xD1\u40D1;\u439D\u0700Eacdfgmoprstuv\u0DBD\u0DC2\u0DC9\u0DD5\u0DDB\u0DE0\u0DE7\u0DFC\u0E02\u0E20\u0E22\u0E32\u0E3F\u0E44lig;\u4152cute\u803B\xD3\u40D3\u0100iy\u0DCE\u0DD3rc\u803B\xD4\u40D4;\u441Eblac;\u4150r;\uC000\u{1D512}rave\u803B\xD2\u40D2\u0180aei\u0DEE\u0DF2\u0DF6cr;\u414Cga;\u43A9cron;\u439Fpf;\uC000\u{1D546}enCurly\u0100DQ\u0E0E\u0E1AoubleQuote;\u601Cuote;\u6018;\u6A54\u0100cl\u0E27\u0E2Cr;\uC000\u{1D4AA}ash\u803B\xD8\u40D8i\u016C\u0E37\u0E3Cde\u803B\xD5\u40D5es;\u6A37ml\u803B\xD6\u40D6er\u0100BP\u0E4B\u0E60\u0100ar\u0E50\u0E53r;\u603Eac\u0100ek\u0E5A\u0E5C;\u63DEet;\u63B4arenthesis;\u63DC\u0480acfhilors\u0E7F\u0E87\u0E8A\u0E8F\u0E92\u0E94\u0E9D\u0EB0\u0EFCrtialD;\u6202y;\u441Fr;\uC000\u{1D513}i;\u43A6;\u43A0usMinus;\u40B1\u0100ip\u0EA2\u0EADncareplan\xE5\u069Df;\u6119\u0200;eio\u0EB9\u0EBA\u0EE0\u0EE4\u6ABBcedes\u0200;EST\u0EC8\u0EC9\u0ECF\u0EDA\u627Aqual;\u6AAFlantEqual;\u627Cilde;\u627Eme;\u6033\u0100dp\u0EE9\u0EEEuct;\u620Fortion\u0100;a\u0225\u0EF9l;\u621D\u0100ci\u0F01\u0F06r;\uC000\u{1D4AB};\u43A8\u0200Ufos\u0F11\u0F16\u0F1B\u0F1FOT\u803B"\u4022r;\uC000\u{1D514}pf;\u611Acr;\uC000\u{1D4AC}\u0600BEacefhiorsu\u0F3E\u0F43\u0F47\u0F60\u0F73\u0FA7\u0FAA\u0FAD\u1096\u10A9\u10B4\u10BEarr;\u6910G\u803B\xAE\u40AE\u0180cnr\u0F4E\u0F53\u0F56ute;\u4154g;\u67EBr\u0100;t\u0F5C\u0F5D\u61A0l;\u6916\u0180aey\u0F67\u0F6C\u0F71ron;\u4158dil;\u4156;\u4420\u0100;v\u0F78\u0F79\u611Cerse\u0100EU\u0F82\u0F99\u0100lq\u0F87\u0F8Eement;\u620Builibrium;\u61CBpEquilibrium;\u696Fr\xBB\u0F79o;\u43A1ght\u0400ACDFTUVa\u0FC1\u0FEB\u0FF3\u1022\u1028\u105B\u1087\u03D8\u0100nr\u0FC6\u0FD2gleBracket;\u67E9row\u0180;BL\u0FDC\u0FDD\u0FE1\u6192ar;\u61E5eftArrow;\u61C4eiling;\u6309o\u01F5\u0FF9\0\u1005bleBracket;\u67E7n\u01D4\u100A\0\u1014eeVector;\u695Dector\u0100;B\u101D\u101E\u61C2ar;\u6955loor;\u630B\u0100er\u102D\u1043e\u0180;AV\u1035\u1036\u103C\u62A2rrow;\u61A6ector;\u695Biangle\u0180;BE\u1050\u1051\u1055\u62B3ar;\u69D0qual;\u62B5p\u0180DTV\u1063\u106E\u1078ownVector;\u694FeeVector;\u695Cector\u0100;B\u1082\u1083\u61BEar;\u6954ector\u0100;B\u1091\u1092\u61C0ar;\u6953\u0100pu\u109B\u109Ef;\u611DndImplies;\u6970ightarrow;\u61DB\u0100ch\u10B9\u10BCr;\u611B;\u61B1leDelayed;\u69F4\u0680HOacfhimoqstu\u10E4\u10F1\u10F7\u10FD\u1119\u111E\u1151\u1156\u1161\u1167\u11B5\u11BB\u11BF\u0100Cc\u10E9\u10EEHcy;\u4429y;\u4428FTcy;\u442Ccute;\u415A\u0280;aeiy\u1108\u1109\u110E\u1113\u1117\u6ABCron;\u4160dil;\u415Erc;\u415C;\u4421r;\uC000\u{1D516}ort\u0200DLRU\u112A\u1134\u113E\u1149ownArrow\xBB\u041EeftArrow\xBB\u089AightArrow\xBB\u0FDDpArrow;\u6191gma;\u43A3allCircle;\u6218pf;\uC000\u{1D54A}\u0272\u116D\0\0\u1170t;\u621Aare\u0200;ISU\u117B\u117C\u1189\u11AF\u65A1ntersection;\u6293u\u0100bp\u118F\u119Eset\u0100;E\u1197\u1198\u628Fqual;\u6291erset\u0100;E\u11A8\u11A9\u6290qual;\u6292nion;\u6294cr;\uC000\u{1D4AE}ar;\u62C6\u0200bcmp\u11C8\u11DB\u1209\u120B\u0100;s\u11CD\u11CE\u62D0et\u0100;E\u11CD\u11D5qual;\u6286\u0100ch\u11E0\u1205eeds\u0200;EST\u11ED\u11EE\u11F4\u11FF\u627Bqual;\u6AB0lantEqual;\u627Dilde;\u627FTh\xE1\u0F8C;\u6211\u0180;es\u1212\u1213\u1223\u62D1rset\u0100;E\u121C\u121D\u6283qual;\u6287et\xBB\u1213\u0580HRSacfhiors\u123E\u1244\u1249\u1255\u125E\u1271\u1276\u129F\u12C2\u12C8\u12D1ORN\u803B\xDE\u40DEADE;\u6122\u0100Hc\u124E\u1252cy;\u440By;\u4426\u0100bu\u125A\u125C;\u4009;\u43A4\u0180aey\u1265\u126A\u126Fron;\u4164dil;\u4162;\u4422r;\uC000\u{1D517}\u0100ei\u127B\u1289\u01F2\u1280\0\u1287efore;\u6234a;\u4398\u0100cn\u128E\u1298kSpace;\uC000\u205F\u200ASpace;\u6009lde\u0200;EFT\u12AB\u12AC\u12B2\u12BC\u623Cqual;\u6243ullEqual;\u6245ilde;\u6248pf;\uC000\u{1D54B}ipleDot;\u60DB\u0100ct\u12D6\u12DBr;\uC000\u{1D4AF}rok;\u4166\u0AE1\u12F7\u130E\u131A\u1326\0\u132C\u1331\0\0\0\0\0\u1338\u133D\u1377\u1385\0\u13FF\u1404\u140A\u1410\u0100cr\u12FB\u1301ute\u803B\xDA\u40DAr\u0100;o\u1307\u1308\u619Fcir;\u6949r\u01E3\u1313\0\u1316y;\u440Eve;\u416C\u0100iy\u131E\u1323rc\u803B\xDB\u40DB;\u4423blac;\u4170r;\uC000\u{1D518}rave\u803B\xD9\u40D9acr;\u416A\u0100di\u1341\u1369er\u0100BP\u1348\u135D\u0100ar\u134D\u1350r;\u405Fac\u0100ek\u1357\u1359;\u63DFet;\u63B5arenthesis;\u63DDon\u0100;P\u1370\u1371\u62C3lus;\u628E\u0100gp\u137B\u137Fon;\u4172f;\uC000\u{1D54C}\u0400ADETadps\u1395\u13AE\u13B8\u13C4\u03E8\u13D2\u13D7\u13F3rrow\u0180;BD\u1150\u13A0\u13A4ar;\u6912ownArrow;\u61C5ownArrow;\u6195quilibrium;\u696Eee\u0100;A\u13CB\u13CC\u62A5rrow;\u61A5own\xE1\u03F3er\u0100LR\u13DE\u13E8eftArrow;\u6196ightArrow;\u6197i\u0100;l\u13F9\u13FA\u43D2on;\u43A5ing;\u416Ecr;\uC000\u{1D4B0}ilde;\u4168ml\u803B\xDC\u40DC\u0480Dbcdefosv\u1427\u142C\u1430\u1433\u143E\u1485\u148A\u1490\u1496ash;\u62ABar;\u6AEBy;\u4412ash\u0100;l\u143B\u143C\u62A9;\u6AE6\u0100er\u1443\u1445;\u62C1\u0180bty\u144C\u1450\u147Aar;\u6016\u0100;i\u144F\u1455cal\u0200BLST\u1461\u1465\u146A\u1474ar;\u6223ine;\u407Ceparator;\u6758ilde;\u6240ThinSpace;\u600Ar;\uC000\u{1D519}pf;\uC000\u{1D54D}cr;\uC000\u{1D4B1}dash;\u62AA\u0280cefos\u14A7\u14AC\u14B1\u14B6\u14BCirc;\u4174dge;\u62C0r;\uC000\u{1D51A}pf;\uC000\u{1D54E}cr;\uC000\u{1D4B2}\u0200fios\u14CB\u14D0\u14D2\u14D8r;\uC000\u{1D51B};\u439Epf;\uC000\u{1D54F}cr;\uC000\u{1D4B3}\u0480AIUacfosu\u14F1\u14F5\u14F9\u14FD\u1504\u150F\u1514\u151A\u1520cy;\u442Fcy;\u4407cy;\u442Ecute\u803B\xDD\u40DD\u0100iy\u1509\u150Drc;\u4176;\u442Br;\uC000\u{1D51C}pf;\uC000\u{1D550}cr;\uC000\u{1D4B4}ml;\u4178\u0400Hacdefos\u1535\u1539\u153F\u154B\u154F\u155D\u1560\u1564cy;\u4416cute;\u4179\u0100ay\u1544\u1549ron;\u417D;\u4417ot;\u417B\u01F2\u1554\0\u155BoWidt\xE8\u0AD9a;\u4396r;\u6128pf;\u6124cr;\uC000\u{1D4B5}\u0BE1\u1583\u158A\u1590\0\u15B0\u15B6\u15BF\0\0\0\0\u15C6\u15DB\u15EB\u165F\u166D\0\u1695\u169B\u16B2\u16B9\0\u16BEcute\u803B\xE1\u40E1reve;\u4103\u0300;Ediuy\u159C\u159D\u15A1\u15A3\u15A8\u15AD\u623E;\uC000\u223E\u0333;\u623Frc\u803B\xE2\u40E2te\u80BB\xB4\u0306;\u4430lig\u803B\xE6\u40E6\u0100;r\xB2\u15BA;\uC000\u{1D51E}rave\u803B\xE0\u40E0\u0100ep\u15CA\u15D6\u0100fp\u15CF\u15D4sym;\u6135\xE8\u15D3ha;\u43B1\u0100ap\u15DFc\u0100cl\u15E4\u15E7r;\u4101g;\u6A3F\u0264\u15F0\0\0\u160A\u0280;adsv\u15FA\u15FB\u15FF\u1601\u1607\u6227nd;\u6A55;\u6A5Clope;\u6A58;\u6A5A\u0380;elmrsz\u1618\u1619\u161B\u161E\u163F\u164F\u1659\u6220;\u69A4e\xBB\u1619sd\u0100;a\u1625\u1626\u6221\u0461\u1630\u1632\u1634\u1636\u1638\u163A\u163C\u163E;\u69A8;\u69A9;\u69AA;\u69AB;\u69AC;\u69AD;\u69AE;\u69AFt\u0100;v\u1645\u1646\u621Fb\u0100;d\u164C\u164D\u62BE;\u699D\u0100pt\u1654\u1657h;\u6222\xBB\xB9arr;\u637C\u0100gp\u1663\u1667on;\u4105f;\uC000\u{1D552}\u0380;Eaeiop\u12C1\u167B\u167D\u1682\u1684\u1687\u168A;\u6A70cir;\u6A6F;\u624Ad;\u624Bs;\u4027rox\u0100;e\u12C1\u1692\xF1\u1683ing\u803B\xE5\u40E5\u0180cty\u16A1\u16A6\u16A8r;\uC000\u{1D4B6};\u402Amp\u0100;e\u12C1\u16AF\xF1\u0288ilde\u803B\xE3\u40E3ml\u803B\xE4\u40E4\u0100ci\u16C2\u16C8onin\xF4\u0272nt;\u6A11\u0800Nabcdefiklnoprsu\u16ED\u16F1\u1730\u173C\u1743\u1748\u1778\u177D\u17E0\u17E6\u1839\u1850\u170D\u193D\u1948\u1970ot;\u6AED\u0100cr\u16F6\u171Ek\u0200ceps\u1700\u1705\u170D\u1713ong;\u624Cpsilon;\u43F6rime;\u6035im\u0100;e\u171A\u171B\u623Dq;\u62CD\u0176\u1722\u1726ee;\u62BDed\u0100;g\u172C\u172D\u6305e\xBB\u172Drk\u0100;t\u135C\u1737brk;\u63B6\u0100oy\u1701\u1741;\u4431quo;\u601E\u0280cmprt\u1753\u175B\u1761\u1764\u1768aus\u0100;e\u010A\u0109ptyv;\u69B0s\xE9\u170Cno\xF5\u0113\u0180ahw\u176F\u1771\u1773;\u43B2;\u6136een;\u626Cr;\uC000\u{1D51F}g\u0380costuvw\u178D\u179D\u17B3\u17C1\u17D5\u17DB\u17DE\u0180aiu\u1794\u1796\u179A\xF0\u0760rc;\u65EFp\xBB\u1371\u0180dpt\u17A4\u17A8\u17ADot;\u6A00lus;\u6A01imes;\u6A02\u0271\u17B9\0\0\u17BEcup;\u6A06ar;\u6605riangle\u0100du\u17CD\u17D2own;\u65BDp;\u65B3plus;\u6A04e\xE5\u1444\xE5\u14ADarow;\u690D\u0180ako\u17ED\u1826\u1835\u0100cn\u17F2\u1823k\u0180lst\u17FA\u05AB\u1802ozenge;\u69EBriangle\u0200;dlr\u1812\u1813\u1818\u181D\u65B4own;\u65BEeft;\u65C2ight;\u65B8k;\u6423\u01B1\u182B\0\u1833\u01B2\u182F\0\u1831;\u6592;\u65914;\u6593ck;\u6588\u0100eo\u183E\u184D\u0100;q\u1843\u1846\uC000=\u20E5uiv;\uC000\u2261\u20E5t;\u6310\u0200ptwx\u1859\u185E\u1867\u186Cf;\uC000\u{1D553}\u0100;t\u13CB\u1863om\xBB\u13CCtie;\u62C8\u0600DHUVbdhmptuv\u1885\u1896\u18AA\u18BB\u18D7\u18DB\u18EC\u18FF\u1905\u190A\u1910\u1921\u0200LRlr\u188E\u1890\u1892\u1894;\u6557;\u6554;\u6556;\u6553\u0280;DUdu\u18A1\u18A2\u18A4\u18A6\u18A8\u6550;\u6566;\u6569;\u6564;\u6567\u0200LRlr\u18B3\u18B5\u18B7\u18B9;\u655D;\u655A;\u655C;\u6559\u0380;HLRhlr\u18CA\u18CB\u18CD\u18CF\u18D1\u18D3\u18D5\u6551;\u656C;\u6563;\u6560;\u656B;\u6562;\u655Fox;\u69C9\u0200LRlr\u18E4\u18E6\u18E8\u18EA;\u6555;\u6552;\u6510;\u650C\u0280;DUdu\u06BD\u18F7\u18F9\u18FB\u18FD;\u6565;\u6568;\u652C;\u6534inus;\u629Flus;\u629Eimes;\u62A0\u0200LRlr\u1919\u191B\u191D\u191F;\u655B;\u6558;\u6518;\u6514\u0380;HLRhlr\u1930\u1931\u1933\u1935\u1937\u1939\u193B\u6502;\u656A;\u6561;\u655E;\u653C;\u6524;\u651C\u0100ev\u0123\u1942bar\u803B\xA6\u40A6\u0200ceio\u1951\u1956\u195A\u1960r;\uC000\u{1D4B7}mi;\u604Fm\u0100;e\u171A\u171Cl\u0180;bh\u1968\u1969\u196B\u405C;\u69C5sub;\u67C8\u016C\u1974\u197El\u0100;e\u1979\u197A\u6022t\xBB\u197Ap\u0180;Ee\u012F\u1985\u1987;\u6AAE\u0100;q\u06DC\u06DB\u0CE1\u19A7\0\u19E8\u1A11\u1A15\u1A32\0\u1A37\u1A50\0\0\u1AB4\0\0\u1AC1\0\0\u1B21\u1B2E\u1B4D\u1B52\0\u1BFD\0\u1C0C\u0180cpr\u19AD\u19B2\u19DDute;\u4107\u0300;abcds\u19BF\u19C0\u19C4\u19CA\u19D5\u19D9\u6229nd;\u6A44rcup;\u6A49\u0100au\u19CF\u19D2p;\u6A4Bp;\u6A47ot;\u6A40;\uC000\u2229\uFE00\u0100eo\u19E2\u19E5t;\u6041\xEE\u0693\u0200aeiu\u19F0\u19FB\u1A01\u1A05\u01F0\u19F5\0\u19F8s;\u6A4Don;\u410Ddil\u803B\xE7\u40E7rc;\u4109ps\u0100;s\u1A0C\u1A0D\u6A4Cm;\u6A50ot;\u410B\u0180dmn\u1A1B\u1A20\u1A26il\u80BB\xB8\u01ADptyv;\u69B2t\u8100\xA2;e\u1A2D\u1A2E\u40A2r\xE4\u01B2r;\uC000\u{1D520}\u0180cei\u1A3D\u1A40\u1A4Dy;\u4447ck\u0100;m\u1A47\u1A48\u6713ark\xBB\u1A48;\u43C7r\u0380;Ecefms\u1A5F\u1A60\u1A62\u1A6B\u1AA4\u1AAA\u1AAE\u65CB;\u69C3\u0180;el\u1A69\u1A6A\u1A6D\u42C6q;\u6257e\u0261\u1A74\0\0\u1A88rrow\u0100lr\u1A7C\u1A81eft;\u61BAight;\u61BB\u0280RSacd\u1A92\u1A94\u1A96\u1A9A\u1A9F\xBB\u0F47;\u64C8st;\u629Birc;\u629Aash;\u629Dnint;\u6A10id;\u6AEFcir;\u69C2ubs\u0100;u\u1ABB\u1ABC\u6663it\xBB\u1ABC\u02EC\u1AC7\u1AD4\u1AFA\0\u1B0Aon\u0100;e\u1ACD\u1ACE\u403A\u0100;q\xC7\xC6\u026D\u1AD9\0\0\u1AE2a\u0100;t\u1ADE\u1ADF\u402C;\u4040\u0180;fl\u1AE8\u1AE9\u1AEB\u6201\xEE\u1160e\u0100mx\u1AF1\u1AF6ent\xBB\u1AE9e\xF3\u024D\u01E7\u1AFE\0\u1B07\u0100;d\u12BB\u1B02ot;\u6A6Dn\xF4\u0246\u0180fry\u1B10\u1B14\u1B17;\uC000\u{1D554}o\xE4\u0254\u8100\xA9;s\u0155\u1B1Dr;\u6117\u0100ao\u1B25\u1B29rr;\u61B5ss;\u6717\u0100cu\u1B32\u1B37r;\uC000\u{1D4B8}\u0100bp\u1B3C\u1B44\u0100;e\u1B41\u1B42\u6ACF;\u6AD1\u0100;e\u1B49\u1B4A\u6AD0;\u6AD2dot;\u62EF\u0380delprvw\u1B60\u1B6C\u1B77\u1B82\u1BAC\u1BD4\u1BF9arr\u0100lr\u1B68\u1B6A;\u6938;\u6935\u0270\u1B72\0\0\u1B75r;\u62DEc;\u62DFarr\u0100;p\u1B7F\u1B80\u61B6;\u693D\u0300;bcdos\u1B8F\u1B90\u1B96\u1BA1\u1BA5\u1BA8\u622Arcap;\u6A48\u0100au\u1B9B\u1B9Ep;\u6A46p;\u6A4Aot;\u628Dr;\u6A45;\uC000\u222A\uFE00\u0200alrv\u1BB5\u1BBF\u1BDE\u1BE3rr\u0100;m\u1BBC\u1BBD\u61B7;\u693Cy\u0180evw\u1BC7\u1BD4\u1BD8q\u0270\u1BCE\0\0\u1BD2re\xE3\u1B73u\xE3\u1B75ee;\u62CEedge;\u62CFen\u803B\xA4\u40A4earrow\u0100lr\u1BEE\u1BF3eft\xBB\u1B80ight\xBB\u1BBDe\xE4\u1BDD\u0100ci\u1C01\u1C07onin\xF4\u01F7nt;\u6231lcty;\u632D\u0980AHabcdefhijlorstuwz\u1C38\u1C3B\u1C3F\u1C5D\u1C69\u1C75\u1C8A\u1C9E\u1CAC\u1CB7\u1CFB\u1CFF\u1D0D\u1D7B\u1D91\u1DAB\u1DBB\u1DC6\u1DCDr\xF2\u0381ar;\u6965\u0200glrs\u1C48\u1C4D\u1C52\u1C54ger;\u6020eth;\u6138\xF2\u1133h\u0100;v\u1C5A\u1C5B\u6010\xBB\u090A\u016B\u1C61\u1C67arow;\u690Fa\xE3\u0315\u0100ay\u1C6E\u1C73ron;\u410F;\u4434\u0180;ao\u0332\u1C7C\u1C84\u0100gr\u02BF\u1C81r;\u61CAtseq;\u6A77\u0180glm\u1C91\u1C94\u1C98\u803B\xB0\u40B0ta;\u43B4ptyv;\u69B1\u0100ir\u1CA3\u1CA8sht;\u697F;\uC000\u{1D521}ar\u0100lr\u1CB3\u1CB5\xBB\u08DC\xBB\u101E\u0280aegsv\u1CC2\u0378\u1CD6\u1CDC\u1CE0m\u0180;os\u0326\u1CCA\u1CD4nd\u0100;s\u0326\u1CD1uit;\u6666amma;\u43DDin;\u62F2\u0180;io\u1CE7\u1CE8\u1CF8\u40F7de\u8100\xF7;o\u1CE7\u1CF0ntimes;\u62C7n\xF8\u1CF7cy;\u4452c\u026F\u1D06\0\0\u1D0Arn;\u631Eop;\u630D\u0280lptuw\u1D18\u1D1D\u1D22\u1D49\u1D55lar;\u4024f;\uC000\u{1D555}\u0280;emps\u030B\u1D2D\u1D37\u1D3D\u1D42q\u0100;d\u0352\u1D33ot;\u6251inus;\u6238lus;\u6214quare;\u62A1blebarwedg\xE5\xFAn\u0180adh\u112E\u1D5D\u1D67ownarrow\xF3\u1C83arpoon\u0100lr\u1D72\u1D76ef\xF4\u1CB4igh\xF4\u1CB6\u0162\u1D7F\u1D85karo\xF7\u0F42\u026F\u1D8A\0\0\u1D8Ern;\u631Fop;\u630C\u0180cot\u1D98\u1DA3\u1DA6\u0100ry\u1D9D\u1DA1;\uC000\u{1D4B9};\u4455l;\u69F6rok;\u4111\u0100dr\u1DB0\u1DB4ot;\u62F1i\u0100;f\u1DBA\u1816\u65BF\u0100ah\u1DC0\u1DC3r\xF2\u0429a\xF2\u0FA6angle;\u69A6\u0100ci\u1DD2\u1DD5y;\u445Fgrarr;\u67FF\u0900Dacdefglmnopqrstux\u1E01\u1E09\u1E19\u1E38\u0578\u1E3C\u1E49\u1E61\u1E7E\u1EA5\u1EAF\u1EBD\u1EE1\u1F2A\u1F37\u1F44\u1F4E\u1F5A\u0100Do\u1E06\u1D34o\xF4\u1C89\u0100cs\u1E0E\u1E14ute\u803B\xE9\u40E9ter;\u6A6E\u0200aioy\u1E22\u1E27\u1E31\u1E36ron;\u411Br\u0100;c\u1E2D\u1E2E\u6256\u803B\xEA\u40EAlon;\u6255;\u444Dot;\u4117\u0100Dr\u1E41\u1E45ot;\u6252;\uC000\u{1D522}\u0180;rs\u1E50\u1E51\u1E57\u6A9Aave\u803B\xE8\u40E8\u0100;d\u1E5C\u1E5D\u6A96ot;\u6A98\u0200;ils\u1E6A\u1E6B\u1E72\u1E74\u6A99nters;\u63E7;\u6113\u0100;d\u1E79\u1E7A\u6A95ot;\u6A97\u0180aps\u1E85\u1E89\u1E97cr;\u4113ty\u0180;sv\u1E92\u1E93\u1E95\u6205et\xBB\u1E93p\u01001;\u1E9D\u1EA4\u0133\u1EA1\u1EA3;\u6004;\u6005\u6003\u0100gs\u1EAA\u1EAC;\u414Bp;\u6002\u0100gp\u1EB4\u1EB8on;\u4119f;\uC000\u{1D556}\u0180als\u1EC4\u1ECE\u1ED2r\u0100;s\u1ECA\u1ECB\u62D5l;\u69E3us;\u6A71i\u0180;lv\u1EDA\u1EDB\u1EDF\u43B5on\xBB\u1EDB;\u43F5\u0200csuv\u1EEA\u1EF3\u1F0B\u1F23\u0100io\u1EEF\u1E31rc\xBB\u1E2E\u0269\u1EF9\0\0\u1EFB\xED\u0548ant\u0100gl\u1F02\u1F06tr\xBB\u1E5Dess\xBB\u1E7A\u0180aei\u1F12\u1F16\u1F1Als;\u403Dst;\u625Fv\u0100;D\u0235\u1F20D;\u6A78parsl;\u69E5\u0100Da\u1F2F\u1F33ot;\u6253rr;\u6971\u0180cdi\u1F3E\u1F41\u1EF8r;\u612Fo\xF4\u0352\u0100ah\u1F49\u1F4B;\u43B7\u803B\xF0\u40F0\u0100mr\u1F53\u1F57l\u803B\xEB\u40EBo;\u60AC\u0180cip\u1F61\u1F64\u1F67l;\u4021s\xF4\u056E\u0100eo\u1F6C\u1F74ctatio\xEE\u0559nential\xE5\u0579\u09E1\u1F92\0\u1F9E\0\u1FA1\u1FA7\0\0\u1FC6\u1FCC\0\u1FD3\0\u1FE6\u1FEA\u2000\0\u2008\u205Allingdotse\xF1\u1E44y;\u4444male;\u6640\u0180ilr\u1FAD\u1FB3\u1FC1lig;\u8000\uFB03\u0269\u1FB9\0\0\u1FBDg;\u8000\uFB00ig;\u8000\uFB04;\uC000\u{1D523}lig;\u8000\uFB01lig;\uC000fj\u0180alt\u1FD9\u1FDC\u1FE1t;\u666Dig;\u8000\uFB02ns;\u65B1of;\u4192\u01F0\u1FEE\0\u1FF3f;\uC000\u{1D557}\u0100ak\u05BF\u1FF7\u0100;v\u1FFC\u1FFD\u62D4;\u6AD9artint;\u6A0D\u0100ao\u200C\u2055\u0100cs\u2011\u2052\u03B1\u201A\u2030\u2038\u2045\u2048\0\u2050\u03B2\u2022\u2025\u2027\u202A\u202C\0\u202E\u803B\xBD\u40BD;\u6153\u803B\xBC\u40BC;\u6155;\u6159;\u615B\u01B3\u2034\0\u2036;\u6154;\u6156\u02B4\u203E\u2041\0\0\u2043\u803B\xBE\u40BE;\u6157;\u615C5;\u6158\u01B6\u204C\0\u204E;\u615A;\u615D8;\u615El;\u6044wn;\u6322cr;\uC000\u{1D4BB}\u0880Eabcdefgijlnorstv\u2082\u2089\u209F\u20A5\u20B0\u20B4\u20F0\u20F5\u20FA\u20FF\u2103\u2112\u2138\u0317\u213E\u2152\u219E\u0100;l\u064D\u2087;\u6A8C\u0180cmp\u2090\u2095\u209Dute;\u41F5ma\u0100;d\u209C\u1CDA\u43B3;\u6A86reve;\u411F\u0100iy\u20AA\u20AErc;\u411D;\u4433ot;\u4121\u0200;lqs\u063E\u0642\u20BD\u20C9\u0180;qs\u063E\u064C\u20C4lan\xF4\u0665\u0200;cdl\u0665\u20D2\u20D5\u20E5c;\u6AA9ot\u0100;o\u20DC\u20DD\u6A80\u0100;l\u20E2\u20E3\u6A82;\u6A84\u0100;e\u20EA\u20ED\uC000\u22DB\uFE00s;\u6A94r;\uC000\u{1D524}\u0100;g\u0673\u061Bmel;\u6137cy;\u4453\u0200;Eaj\u065A\u210C\u210E\u2110;\u6A92;\u6AA5;\u6AA4\u0200Eaes\u211B\u211D\u2129\u2134;\u6269p\u0100;p\u2123\u2124\u6A8Arox\xBB\u2124\u0100;q\u212E\u212F\u6A88\u0100;q\u212E\u211Bim;\u62E7pf;\uC000\u{1D558}\u0100ci\u2143\u2146r;\u610Am\u0180;el\u066B\u214E\u2150;\u6A8E;\u6A90\u8300>;cdlqr\u05EE\u2160\u216A\u216E\u2173\u2179\u0100ci\u2165\u2167;\u6AA7r;\u6A7Aot;\u62D7Par;\u6995uest;\u6A7C\u0280adels\u2184\u216A\u2190\u0656\u219B\u01F0\u2189\0\u218Epro\xF8\u209Er;\u6978q\u0100lq\u063F\u2196les\xF3\u2088i\xED\u066B\u0100en\u21A3\u21ADrtneqq;\uC000\u2269\uFE00\xC5\u21AA\u0500Aabcefkosy\u21C4\u21C7\u21F1\u21F5\u21FA\u2218\u221D\u222F\u2268\u227Dr\xF2\u03A0\u0200ilmr\u21D0\u21D4\u21D7\u21DBrs\xF0\u1484f\xBB\u2024il\xF4\u06A9\u0100dr\u21E0\u21E4cy;\u444A\u0180;cw\u08F4\u21EB\u21EFir;\u6948;\u61ADar;\u610Firc;\u4125\u0180alr\u2201\u220E\u2213rts\u0100;u\u2209\u220A\u6665it\xBB\u220Alip;\u6026con;\u62B9r;\uC000\u{1D525}s\u0100ew\u2223\u2229arow;\u6925arow;\u6926\u0280amopr\u223A\u223E\u2243\u225E\u2263rr;\u61FFtht;\u623Bk\u0100lr\u2249\u2253eftarrow;\u61A9ightarrow;\u61AAf;\uC000\u{1D559}bar;\u6015\u0180clt\u226F\u2274\u2278r;\uC000\u{1D4BD}as\xE8\u21F4rok;\u4127\u0100bp\u2282\u2287ull;\u6043hen\xBB\u1C5B\u0AE1\u22A3\0\u22AA\0\u22B8\u22C5\u22CE\0\u22D5\u22F3\0\0\u22F8\u2322\u2367\u2362\u237F\0\u2386\u23AA\u23B4cute\u803B\xED\u40ED\u0180;iy\u0771\u22B0\u22B5rc\u803B\xEE\u40EE;\u4438\u0100cx\u22BC\u22BFy;\u4435cl\u803B\xA1\u40A1\u0100fr\u039F\u22C9;\uC000\u{1D526}rave\u803B\xEC\u40EC\u0200;ino\u073E\u22DD\u22E9\u22EE\u0100in\u22E2\u22E6nt;\u6A0Ct;\u622Dfin;\u69DCta;\u6129lig;\u4133\u0180aop\u22FE\u231A\u231D\u0180cgt\u2305\u2308\u2317r;\u412B\u0180elp\u071F\u230F\u2313in\xE5\u078Ear\xF4\u0720h;\u4131f;\u62B7ed;\u41B5\u0280;cfot\u04F4\u232C\u2331\u233D\u2341are;\u6105in\u0100;t\u2338\u2339\u621Eie;\u69DDdo\xF4\u2319\u0280;celp\u0757\u234C\u2350\u235B\u2361al;\u62BA\u0100gr\u2355\u2359er\xF3\u1563\xE3\u234Darhk;\u6A17rod;\u6A3C\u0200cgpt\u236F\u2372\u2376\u237By;\u4451on;\u412Ff;\uC000\u{1D55A}a;\u43B9uest\u803B\xBF\u40BF\u0100ci\u238A\u238Fr;\uC000\u{1D4BE}n\u0280;Edsv\u04F4\u239B\u239D\u23A1\u04F3;\u62F9ot;\u62F5\u0100;v\u23A6\u23A7\u62F4;\u62F3\u0100;i\u0777\u23AElde;\u4129\u01EB\u23B8\0\u23BCcy;\u4456l\u803B\xEF\u40EF\u0300cfmosu\u23CC\u23D7\u23DC\u23E1\u23E7\u23F5\u0100iy\u23D1\u23D5rc;\u4135;\u4439r;\uC000\u{1D527}ath;\u4237pf;\uC000\u{1D55B}\u01E3\u23EC\0\u23F1r;\uC000\u{1D4BF}rcy;\u4458kcy;\u4454\u0400acfghjos\u240B\u2416\u2422\u2427\u242D\u2431\u2435\u243Bppa\u0100;v\u2413\u2414\u43BA;\u43F0\u0100ey\u241B\u2420dil;\u4137;\u443Ar;\uC000\u{1D528}reen;\u4138cy;\u4445cy;\u445Cpf;\uC000\u{1D55C}cr;\uC000\u{1D4C0}\u0B80ABEHabcdefghjlmnoprstuv\u2470\u2481\u2486\u248D\u2491\u250E\u253D\u255A\u2580\u264E\u265E\u2665\u2679\u267D\u269A\u26B2\u26D8\u275D\u2768\u278B\u27C0\u2801\u2812\u0180art\u2477\u247A\u247Cr\xF2\u09C6\xF2\u0395ail;\u691Barr;\u690E\u0100;g\u0994\u248B;\u6A8Bar;\u6962\u0963\u24A5\0\u24AA\0\u24B1\0\0\0\0\0\u24B5\u24BA\0\u24C6\u24C8\u24CD\0\u24F9ute;\u413Amptyv;\u69B4ra\xEE\u084Cbda;\u43BBg\u0180;dl\u088E\u24C1\u24C3;\u6991\xE5\u088E;\u6A85uo\u803B\xAB\u40ABr\u0400;bfhlpst\u0899\u24DE\u24E6\u24E9\u24EB\u24EE\u24F1\u24F5\u0100;f\u089D\u24E3s;\u691Fs;\u691D\xEB\u2252p;\u61ABl;\u6939im;\u6973l;\u61A2\u0180;ae\u24FF\u2500\u2504\u6AABil;\u6919\u0100;s\u2509\u250A\u6AAD;\uC000\u2AAD\uFE00\u0180abr\u2515\u2519\u251Drr;\u690Crk;\u6772\u0100ak\u2522\u252Cc\u0100ek\u2528\u252A;\u407B;\u405B\u0100es\u2531\u2533;\u698Bl\u0100du\u2539\u253B;\u698F;\u698D\u0200aeuy\u2546\u254B\u2556\u2558ron;\u413E\u0100di\u2550\u2554il;\u413C\xEC\u08B0\xE2\u2529;\u443B\u0200cqrs\u2563\u2566\u256D\u257Da;\u6936uo\u0100;r\u0E19\u1746\u0100du\u2572\u2577har;\u6967shar;\u694Bh;\u61B2\u0280;fgqs\u258B\u258C\u0989\u25F3\u25FF\u6264t\u0280ahlrt\u2598\u25A4\u25B7\u25C2\u25E8rrow\u0100;t\u0899\u25A1a\xE9\u24F6arpoon\u0100du\u25AF\u25B4own\xBB\u045Ap\xBB\u0966eftarrows;\u61C7ight\u0180ahs\u25CD\u25D6\u25DErrow\u0100;s\u08F4\u08A7arpoon\xF3\u0F98quigarro\xF7\u21F0hreetimes;\u62CB\u0180;qs\u258B\u0993\u25FAlan\xF4\u09AC\u0280;cdgs\u09AC\u260A\u260D\u261D\u2628c;\u6AA8ot\u0100;o\u2614\u2615\u6A7F\u0100;r\u261A\u261B\u6A81;\u6A83\u0100;e\u2622\u2625\uC000\u22DA\uFE00s;\u6A93\u0280adegs\u2633\u2639\u263D\u2649\u264Bppro\xF8\u24C6ot;\u62D6q\u0100gq\u2643\u2645\xF4\u0989gt\xF2\u248C\xF4\u099Bi\xED\u09B2\u0180ilr\u2655\u08E1\u265Asht;\u697C;\uC000\u{1D529}\u0100;E\u099C\u2663;\u6A91\u0161\u2669\u2676r\u0100du\u25B2\u266E\u0100;l\u0965\u2673;\u696Alk;\u6584cy;\u4459\u0280;acht\u0A48\u2688\u268B\u2691\u2696r\xF2\u25C1orne\xF2\u1D08ard;\u696Bri;\u65FA\u0100io\u269F\u26A4dot;\u4140ust\u0100;a\u26AC\u26AD\u63B0che\xBB\u26AD\u0200Eaes\u26BB\u26BD\u26C9\u26D4;\u6268p\u0100;p\u26C3\u26C4\u6A89rox\xBB\u26C4\u0100;q\u26CE\u26CF\u6A87\u0100;q\u26CE\u26BBim;\u62E6\u0400abnoptwz\u26E9\u26F4\u26F7\u271A\u272F\u2741\u2747\u2750\u0100nr\u26EE\u26F1g;\u67ECr;\u61FDr\xEB\u08C1g\u0180lmr\u26FF\u270D\u2714eft\u0100ar\u09E6\u2707ight\xE1\u09F2apsto;\u67FCight\xE1\u09FDparrow\u0100lr\u2725\u2729ef\xF4\u24EDight;\u61AC\u0180afl\u2736\u2739\u273Dr;\u6985;\uC000\u{1D55D}us;\u6A2Dimes;\u6A34\u0161\u274B\u274Fst;\u6217\xE1\u134E\u0180;ef\u2757\u2758\u1800\u65CAnge\xBB\u2758ar\u0100;l\u2764\u2765\u4028t;\u6993\u0280achmt\u2773\u2776\u277C\u2785\u2787r\xF2\u08A8orne\xF2\u1D8Car\u0100;d\u0F98\u2783;\u696D;\u600Eri;\u62BF\u0300achiqt\u2798\u279D\u0A40\u27A2\u27AE\u27BBquo;\u6039r;\uC000\u{1D4C1}m\u0180;eg\u09B2\u27AA\u27AC;\u6A8D;\u6A8F\u0100bu\u252A\u27B3o\u0100;r\u0E1F\u27B9;\u601Arok;\u4142\u8400<;cdhilqr\u082B\u27D2\u2639\u27DC\u27E0\u27E5\u27EA\u27F0\u0100ci\u27D7\u27D9;\u6AA6r;\u6A79re\xE5\u25F2mes;\u62C9arr;\u6976uest;\u6A7B\u0100Pi\u27F5\u27F9ar;\u6996\u0180;ef\u2800\u092D\u181B\u65C3r\u0100du\u2807\u280Dshar;\u694Ahar;\u6966\u0100en\u2817\u2821rtneqq;\uC000\u2268\uFE00\xC5\u281E\u0700Dacdefhilnopsu\u2840\u2845\u2882\u288E\u2893\u28A0\u28A5\u28A8\u28DA\u28E2\u28E4\u0A83\u28F3\u2902Dot;\u623A\u0200clpr\u284E\u2852\u2863\u287Dr\u803B\xAF\u40AF\u0100et\u2857\u2859;\u6642\u0100;e\u285E\u285F\u6720se\xBB\u285F\u0100;s\u103B\u2868to\u0200;dlu\u103B\u2873\u2877\u287Bow\xEE\u048Cef\xF4\u090F\xF0\u13D1ker;\u65AE\u0100oy\u2887\u288Cmma;\u6A29;\u443Cash;\u6014asuredangle\xBB\u1626r;\uC000\u{1D52A}o;\u6127\u0180cdn\u28AF\u28B4\u28C9ro\u803B\xB5\u40B5\u0200;acd\u1464\u28BD\u28C0\u28C4s\xF4\u16A7ir;\u6AF0ot\u80BB\xB7\u01B5us\u0180;bd\u28D2\u1903\u28D3\u6212\u0100;u\u1D3C\u28D8;\u6A2A\u0163\u28DE\u28E1p;\u6ADB\xF2\u2212\xF0\u0A81\u0100dp\u28E9\u28EEels;\u62A7f;\uC000\u{1D55E}\u0100ct\u28F8\u28FDr;\uC000\u{1D4C2}pos\xBB\u159D\u0180;lm\u2909\u290A\u290D\u43BCtimap;\u62B8\u0C00GLRVabcdefghijlmoprstuvw\u2942\u2953\u297E\u2989\u2998\u29DA\u29E9\u2A15\u2A1A\u2A58\u2A5D\u2A83\u2A95\u2AA4\u2AA8\u2B04\u2B07\u2B44\u2B7F\u2BAE\u2C34\u2C67\u2C7C\u2CE9\u0100gt\u2947\u294B;\uC000\u22D9\u0338\u0100;v\u2950\u0BCF\uC000\u226B\u20D2\u0180elt\u295A\u2972\u2976ft\u0100ar\u2961\u2967rrow;\u61CDightarrow;\u61CE;\uC000\u22D8\u0338\u0100;v\u297B\u0C47\uC000\u226A\u20D2ightarrow;\u61CF\u0100Dd\u298E\u2993ash;\u62AFash;\u62AE\u0280bcnpt\u29A3\u29A7\u29AC\u29B1\u29CCla\xBB\u02DEute;\u4144g;\uC000\u2220\u20D2\u0280;Eiop\u0D84\u29BC\u29C0\u29C5\u29C8;\uC000\u2A70\u0338d;\uC000\u224B\u0338s;\u4149ro\xF8\u0D84ur\u0100;a\u29D3\u29D4\u666El\u0100;s\u29D3\u0B38\u01F3\u29DF\0\u29E3p\u80BB\xA0\u0B37mp\u0100;e\u0BF9\u0C00\u0280aeouy\u29F4\u29FE\u2A03\u2A10\u2A13\u01F0\u29F9\0\u29FB;\u6A43on;\u4148dil;\u4146ng\u0100;d\u0D7E\u2A0Aot;\uC000\u2A6D\u0338p;\u6A42;\u443Dash;\u6013\u0380;Aadqsx\u0B92\u2A29\u2A2D\u2A3B\u2A41\u2A45\u2A50rr;\u61D7r\u0100hr\u2A33\u2A36k;\u6924\u0100;o\u13F2\u13F0ot;\uC000\u2250\u0338ui\xF6\u0B63\u0100ei\u2A4A\u2A4Ear;\u6928\xED\u0B98ist\u0100;s\u0BA0\u0B9Fr;\uC000\u{1D52B}\u0200Eest\u0BC5\u2A66\u2A79\u2A7C\u0180;qs\u0BBC\u2A6D\u0BE1\u0180;qs\u0BBC\u0BC5\u2A74lan\xF4\u0BE2i\xED\u0BEA\u0100;r\u0BB6\u2A81\xBB\u0BB7\u0180Aap\u2A8A\u2A8D\u2A91r\xF2\u2971rr;\u61AEar;\u6AF2\u0180;sv\u0F8D\u2A9C\u0F8C\u0100;d\u2AA1\u2AA2\u62FC;\u62FAcy;\u445A\u0380AEadest\u2AB7\u2ABA\u2ABE\u2AC2\u2AC5\u2AF6\u2AF9r\xF2\u2966;\uC000\u2266\u0338rr;\u619Ar;\u6025\u0200;fqs\u0C3B\u2ACE\u2AE3\u2AEFt\u0100ar\u2AD4\u2AD9rro\xF7\u2AC1ightarro\xF7\u2A90\u0180;qs\u0C3B\u2ABA\u2AEAlan\xF4\u0C55\u0100;s\u0C55\u2AF4\xBB\u0C36i\xED\u0C5D\u0100;r\u0C35\u2AFEi\u0100;e\u0C1A\u0C25i\xE4\u0D90\u0100pt\u2B0C\u2B11f;\uC000\u{1D55F}\u8180\xAC;in\u2B19\u2B1A\u2B36\u40ACn\u0200;Edv\u0B89\u2B24\u2B28\u2B2E;\uC000\u22F9\u0338ot;\uC000\u22F5\u0338\u01E1\u0B89\u2B33\u2B35;\u62F7;\u62F6i\u0100;v\u0CB8\u2B3C\u01E1\u0CB8\u2B41\u2B43;\u62FE;\u62FD\u0180aor\u2B4B\u2B63\u2B69r\u0200;ast\u0B7B\u2B55\u2B5A\u2B5Flle\xEC\u0B7Bl;\uC000\u2AFD\u20E5;\uC000\u2202\u0338lint;\u6A14\u0180;ce\u0C92\u2B70\u2B73u\xE5\u0CA5\u0100;c\u0C98\u2B78\u0100;e\u0C92\u2B7D\xF1\u0C98\u0200Aait\u2B88\u2B8B\u2B9D\u2BA7r\xF2\u2988rr\u0180;cw\u2B94\u2B95\u2B99\u619B;\uC000\u2933\u0338;\uC000\u219D\u0338ghtarrow\xBB\u2B95ri\u0100;e\u0CCB\u0CD6\u0380chimpqu\u2BBD\u2BCD\u2BD9\u2B04\u0B78\u2BE4\u2BEF\u0200;cer\u0D32\u2BC6\u0D37\u2BC9u\xE5\u0D45;\uC000\u{1D4C3}ort\u026D\u2B05\0\0\u2BD6ar\xE1\u2B56m\u0100;e\u0D6E\u2BDF\u0100;q\u0D74\u0D73su\u0100bp\u2BEB\u2BED\xE5\u0CF8\xE5\u0D0B\u0180bcp\u2BF6\u2C11\u2C19\u0200;Ees\u2BFF\u2C00\u0D22\u2C04\u6284;\uC000\u2AC5\u0338et\u0100;e\u0D1B\u2C0Bq\u0100;q\u0D23\u2C00c\u0100;e\u0D32\u2C17\xF1\u0D38\u0200;Ees\u2C22\u2C23\u0D5F\u2C27\u6285;\uC000\u2AC6\u0338et\u0100;e\u0D58\u2C2Eq\u0100;q\u0D60\u2C23\u0200gilr\u2C3D\u2C3F\u2C45\u2C47\xEC\u0BD7lde\u803B\xF1\u40F1\xE7\u0C43iangle\u0100lr\u2C52\u2C5Ceft\u0100;e\u0C1A\u2C5A\xF1\u0C26ight\u0100;e\u0CCB\u2C65\xF1\u0CD7\u0100;m\u2C6C\u2C6D\u43BD\u0180;es\u2C74\u2C75\u2C79\u4023ro;\u6116p;\u6007\u0480DHadgilrs\u2C8F\u2C94\u2C99\u2C9E\u2CA3\u2CB0\u2CB6\u2CD3\u2CE3ash;\u62ADarr;\u6904p;\uC000\u224D\u20D2ash;\u62AC\u0100et\u2CA8\u2CAC;\uC000\u2265\u20D2;\uC000>\u20D2nfin;\u69DE\u0180Aet\u2CBD\u2CC1\u2CC5rr;\u6902;\uC000\u2264\u20D2\u0100;r\u2CCA\u2CCD\uC000<\u20D2ie;\uC000\u22B4\u20D2\u0100At\u2CD8\u2CDCrr;\u6903rie;\uC000\u22B5\u20D2im;\uC000\u223C\u20D2\u0180Aan\u2CF0\u2CF4\u2D02rr;\u61D6r\u0100hr\u2CFA\u2CFDk;\u6923\u0100;o\u13E7\u13E5ear;\u6927\u1253\u1A95\0\0\0\0\0\0\0\0\0\0\0\0\0\u2D2D\0\u2D38\u2D48\u2D60\u2D65\u2D72\u2D84\u1B07\0\0\u2D8D\u2DAB\0\u2DC8\u2DCE\0\u2DDC\u2E19\u2E2B\u2E3E\u2E43\u0100cs\u2D31\u1A97ute\u803B\xF3\u40F3\u0100iy\u2D3C\u2D45r\u0100;c\u1A9E\u2D42\u803B\xF4\u40F4;\u443E\u0280abios\u1AA0\u2D52\u2D57\u01C8\u2D5Alac;\u4151v;\u6A38old;\u69BClig;\u4153\u0100cr\u2D69\u2D6Dir;\u69BF;\uC000\u{1D52C}\u036F\u2D79\0\0\u2D7C\0\u2D82n;\u42DBave\u803B\xF2\u40F2;\u69C1\u0100bm\u2D88\u0DF4ar;\u69B5\u0200acit\u2D95\u2D98\u2DA5\u2DA8r\xF2\u1A80\u0100ir\u2D9D\u2DA0r;\u69BEoss;\u69BBn\xE5\u0E52;\u69C0\u0180aei\u2DB1\u2DB5\u2DB9cr;\u414Dga;\u43C9\u0180cdn\u2DC0\u2DC5\u01CDron;\u43BF;\u69B6pf;\uC000\u{1D560}\u0180ael\u2DD4\u2DD7\u01D2r;\u69B7rp;\u69B9\u0380;adiosv\u2DEA\u2DEB\u2DEE\u2E08\u2E0D\u2E10\u2E16\u6228r\xF2\u1A86\u0200;efm\u2DF7\u2DF8\u2E02\u2E05\u6A5Dr\u0100;o\u2DFE\u2DFF\u6134f\xBB\u2DFF\u803B\xAA\u40AA\u803B\xBA\u40BAgof;\u62B6r;\u6A56lope;\u6A57;\u6A5B\u0180clo\u2E1F\u2E21\u2E27\xF2\u2E01ash\u803B\xF8\u40F8l;\u6298i\u016C\u2E2F\u2E34de\u803B\xF5\u40F5es\u0100;a\u01DB\u2E3As;\u6A36ml\u803B\xF6\u40F6bar;\u633D\u0AE1\u2E5E\0\u2E7D\0\u2E80\u2E9D\0\u2EA2\u2EB9\0\0\u2ECB\u0E9C\0\u2F13\0\0\u2F2B\u2FBC\0\u2FC8r\u0200;ast\u0403\u2E67\u2E72\u0E85\u8100\xB6;l\u2E6D\u2E6E\u40B6le\xEC\u0403\u0269\u2E78\0\0\u2E7Bm;\u6AF3;\u6AFDy;\u443Fr\u0280cimpt\u2E8B\u2E8F\u2E93\u1865\u2E97nt;\u4025od;\u402Eil;\u6030enk;\u6031r;\uC000\u{1D52D}\u0180imo\u2EA8\u2EB0\u2EB4\u0100;v\u2EAD\u2EAE\u43C6;\u43D5ma\xF4\u0A76ne;\u660E\u0180;tv\u2EBF\u2EC0\u2EC8\u43C0chfork\xBB\u1FFD;\u43D6\u0100au\u2ECF\u2EDFn\u0100ck\u2ED5\u2EDDk\u0100;h\u21F4\u2EDB;\u610E\xF6\u21F4s\u0480;abcdemst\u2EF3\u2EF4\u1908\u2EF9\u2EFD\u2F04\u2F06\u2F0A\u2F0E\u402Bcir;\u6A23ir;\u6A22\u0100ou\u1D40\u2F02;\u6A25;\u6A72n\u80BB\xB1\u0E9Dim;\u6A26wo;\u6A27\u0180ipu\u2F19\u2F20\u2F25ntint;\u6A15f;\uC000\u{1D561}nd\u803B\xA3\u40A3\u0500;Eaceinosu\u0EC8\u2F3F\u2F41\u2F44\u2F47\u2F81\u2F89\u2F92\u2F7E\u2FB6;\u6AB3p;\u6AB7u\xE5\u0ED9\u0100;c\u0ECE\u2F4C\u0300;acens\u0EC8\u2F59\u2F5F\u2F66\u2F68\u2F7Eppro\xF8\u2F43urlye\xF1\u0ED9\xF1\u0ECE\u0180aes\u2F6F\u2F76\u2F7Approx;\u6AB9qq;\u6AB5im;\u62E8i\xED\u0EDFme\u0100;s\u2F88\u0EAE\u6032\u0180Eas\u2F78\u2F90\u2F7A\xF0\u2F75\u0180dfp\u0EEC\u2F99\u2FAF\u0180als\u2FA0\u2FA5\u2FAAlar;\u632Eine;\u6312urf;\u6313\u0100;t\u0EFB\u2FB4\xEF\u0EFBrel;\u62B0\u0100ci\u2FC0\u2FC5r;\uC000\u{1D4C5};\u43C8ncsp;\u6008\u0300fiopsu\u2FDA\u22E2\u2FDF\u2FE5\u2FEB\u2FF1r;\uC000\u{1D52E}pf;\uC000\u{1D562}rime;\u6057cr;\uC000\u{1D4C6}\u0180aeo\u2FF8\u3009\u3013t\u0100ei\u2FFE\u3005rnion\xF3\u06B0nt;\u6A16st\u0100;e\u3010\u3011\u403F\xF1\u1F19\xF4\u0F14\u0A80ABHabcdefhilmnoprstux\u3040\u3051\u3055\u3059\u30E0\u310E\u312B\u3147\u3162\u3172\u318E\u3206\u3215\u3224\u3229\u3258\u326E\u3272\u3290\u32B0\u32B7\u0180art\u3047\u304A\u304Cr\xF2\u10B3\xF2\u03DDail;\u691Car\xF2\u1C65ar;\u6964\u0380cdenqrt\u3068\u3075\u3078\u307F\u308F\u3094\u30CC\u0100eu\u306D\u3071;\uC000\u223D\u0331te;\u4155i\xE3\u116Emptyv;\u69B3g\u0200;del\u0FD1\u3089\u308B\u308D;\u6992;\u69A5\xE5\u0FD1uo\u803B\xBB\u40BBr\u0580;abcfhlpstw\u0FDC\u30AC\u30AF\u30B7\u30B9\u30BC\u30BE\u30C0\u30C3\u30C7\u30CAp;\u6975\u0100;f\u0FE0\u30B4s;\u6920;\u6933s;\u691E\xEB\u225D\xF0\u272El;\u6945im;\u6974l;\u61A3;\u619D\u0100ai\u30D1\u30D5il;\u691Ao\u0100;n\u30DB\u30DC\u6236al\xF3\u0F1E\u0180abr\u30E7\u30EA\u30EEr\xF2\u17E5rk;\u6773\u0100ak\u30F3\u30FDc\u0100ek\u30F9\u30FB;\u407D;\u405D\u0100es\u3102\u3104;\u698Cl\u0100du\u310A\u310C;\u698E;\u6990\u0200aeuy\u3117\u311C\u3127\u3129ron;\u4159\u0100di\u3121\u3125il;\u4157\xEC\u0FF2\xE2\u30FA;\u4440\u0200clqs\u3134\u3137\u313D\u3144a;\u6937dhar;\u6969uo\u0100;r\u020E\u020Dh;\u61B3\u0180acg\u314E\u315F\u0F44l\u0200;ips\u0F78\u3158\u315B\u109Cn\xE5\u10BBar\xF4\u0FA9t;\u65AD\u0180ilr\u3169\u1023\u316Esht;\u697D;\uC000\u{1D52F}\u0100ao\u3177\u3186r\u0100du\u317D\u317F\xBB\u047B\u0100;l\u1091\u3184;\u696C\u0100;v\u318B\u318C\u43C1;\u43F1\u0180gns\u3195\u31F9\u31FCht\u0300ahlrst\u31A4\u31B0\u31C2\u31D8\u31E4\u31EErrow\u0100;t\u0FDC\u31ADa\xE9\u30C8arpoon\u0100du\u31BB\u31BFow\xEE\u317Ep\xBB\u1092eft\u0100ah\u31CA\u31D0rrow\xF3\u0FEAarpoon\xF3\u0551ightarrows;\u61C9quigarro\xF7\u30CBhreetimes;\u62CCg;\u42DAingdotse\xF1\u1F32\u0180ahm\u320D\u3210\u3213r\xF2\u0FEAa\xF2\u0551;\u600Foust\u0100;a\u321E\u321F\u63B1che\xBB\u321Fmid;\u6AEE\u0200abpt\u3232\u323D\u3240\u3252\u0100nr\u3237\u323Ag;\u67EDr;\u61FEr\xEB\u1003\u0180afl\u3247\u324A\u324Er;\u6986;\uC000\u{1D563}us;\u6A2Eimes;\u6A35\u0100ap\u325D\u3267r\u0100;g\u3263\u3264\u4029t;\u6994olint;\u6A12ar\xF2\u31E3\u0200achq\u327B\u3280\u10BC\u3285quo;\u603Ar;\uC000\u{1D4C7}\u0100bu\u30FB\u328Ao\u0100;r\u0214\u0213\u0180hir\u3297\u329B\u32A0re\xE5\u31F8mes;\u62CAi\u0200;efl\u32AA\u1059\u1821\u32AB\u65B9tri;\u69CEluhar;\u6968;\u611E\u0D61\u32D5\u32DB\u32DF\u332C\u3338\u3371\0\u337A\u33A4\0\0\u33EC\u33F0\0\u3428\u3448\u345A\u34AD\u34B1\u34CA\u34F1\0\u3616\0\0\u3633cute;\u415Bqu\xEF\u27BA\u0500;Eaceinpsy\u11ED\u32F3\u32F5\u32FF\u3302\u330B\u330F\u331F\u3326\u3329;\u6AB4\u01F0\u32FA\0\u32FC;\u6AB8on;\u4161u\xE5\u11FE\u0100;d\u11F3\u3307il;\u415Frc;\u415D\u0180Eas\u3316\u3318\u331B;\u6AB6p;\u6ABAim;\u62E9olint;\u6A13i\xED\u1204;\u4441ot\u0180;be\u3334\u1D47\u3335\u62C5;\u6A66\u0380Aacmstx\u3346\u334A\u3357\u335B\u335E\u3363\u336Drr;\u61D8r\u0100hr\u3350\u3352\xEB\u2228\u0100;o\u0A36\u0A34t\u803B\xA7\u40A7i;\u403Bwar;\u6929m\u0100in\u3369\xF0nu\xF3\xF1t;\u6736r\u0100;o\u3376\u2055\uC000\u{1D530}\u0200acoy\u3382\u3386\u3391\u33A0rp;\u666F\u0100hy\u338B\u338Fcy;\u4449;\u4448rt\u026D\u3399\0\0\u339Ci\xE4\u1464ara\xEC\u2E6F\u803B\xAD\u40AD\u0100gm\u33A8\u33B4ma\u0180;fv\u33B1\u33B2\u33B2\u43C3;\u43C2\u0400;deglnpr\u12AB\u33C5\u33C9\u33CE\u33D6\u33DE\u33E1\u33E6ot;\u6A6A\u0100;q\u12B1\u12B0\u0100;E\u33D3\u33D4\u6A9E;\u6AA0\u0100;E\u33DB\u33DC\u6A9D;\u6A9Fe;\u6246lus;\u6A24arr;\u6972ar\xF2\u113D\u0200aeit\u33F8\u3408\u340F\u3417\u0100ls\u33FD\u3404lsetm\xE9\u336Ahp;\u6A33parsl;\u69E4\u0100dl\u1463\u3414e;\u6323\u0100;e\u341C\u341D\u6AAA\u0100;s\u3422\u3423\u6AAC;\uC000\u2AAC\uFE00\u0180flp\u342E\u3433\u3442tcy;\u444C\u0100;b\u3438\u3439\u402F\u0100;a\u343E\u343F\u69C4r;\u633Ff;\uC000\u{1D564}a\u0100dr\u344D\u0402es\u0100;u\u3454\u3455\u6660it\xBB\u3455\u0180csu\u3460\u3479\u349F\u0100au\u3465\u346Fp\u0100;s\u1188\u346B;\uC000\u2293\uFE00p\u0100;s\u11B4\u3475;\uC000\u2294\uFE00u\u0100bp\u347F\u348F\u0180;es\u1197\u119C\u3486et\u0100;e\u1197\u348D\xF1\u119D\u0180;es\u11A8\u11AD\u3496et\u0100;e\u11A8\u349D\xF1\u11AE\u0180;af\u117B\u34A6\u05B0r\u0165\u34AB\u05B1\xBB\u117Car\xF2\u1148\u0200cemt\u34B9\u34BE\u34C2\u34C5r;\uC000\u{1D4C8}tm\xEE\xF1i\xEC\u3415ar\xE6\u11BE\u0100ar\u34CE\u34D5r\u0100;f\u34D4\u17BF\u6606\u0100an\u34DA\u34EDight\u0100ep\u34E3\u34EApsilo\xEE\u1EE0h\xE9\u2EAFs\xBB\u2852\u0280bcmnp\u34FB\u355E\u1209\u358B\u358E\u0480;Edemnprs\u350E\u350F\u3511\u3515\u351E\u3523\u352C\u3531\u3536\u6282;\u6AC5ot;\u6ABD\u0100;d\u11DA\u351Aot;\u6AC3ult;\u6AC1\u0100Ee\u3528\u352A;\u6ACB;\u628Alus;\u6ABFarr;\u6979\u0180eiu\u353D\u3552\u3555t\u0180;en\u350E\u3545\u354Bq\u0100;q\u11DA\u350Feq\u0100;q\u352B\u3528m;\u6AC7\u0100bp\u355A\u355C;\u6AD5;\u6AD3c\u0300;acens\u11ED\u356C\u3572\u3579\u357B\u3326ppro\xF8\u32FAurlye\xF1\u11FE\xF1\u11F3\u0180aes\u3582\u3588\u331Bppro\xF8\u331Aq\xF1\u3317g;\u666A\u0680123;Edehlmnps\u35A9\u35AC\u35AF\u121C\u35B2\u35B4\u35C0\u35C9\u35D5\u35DA\u35DF\u35E8\u35ED\u803B\xB9\u40B9\u803B\xB2\u40B2\u803B\xB3\u40B3;\u6AC6\u0100os\u35B9\u35BCt;\u6ABEub;\u6AD8\u0100;d\u1222\u35C5ot;\u6AC4s\u0100ou\u35CF\u35D2l;\u67C9b;\u6AD7arr;\u697Bult;\u6AC2\u0100Ee\u35E4\u35E6;\u6ACC;\u628Blus;\u6AC0\u0180eiu\u35F4\u3609\u360Ct\u0180;en\u121C\u35FC\u3602q\u0100;q\u1222\u35B2eq\u0100;q\u35E7\u35E4m;\u6AC8\u0100bp\u3611\u3613;\u6AD4;\u6AD6\u0180Aan\u361C\u3620\u362Drr;\u61D9r\u0100hr\u3626\u3628\xEB\u222E\u0100;o\u0A2B\u0A29war;\u692Alig\u803B\xDF\u40DF\u0BE1\u3651\u365D\u3660\u12CE\u3673\u3679\0\u367E\u36C2\0\0\0\0\0\u36DB\u3703\0\u3709\u376C\0\0\0\u3787\u0272\u3656\0\0\u365Bget;\u6316;\u43C4r\xEB\u0E5F\u0180aey\u3666\u366B\u3670ron;\u4165dil;\u4163;\u4442lrec;\u6315r;\uC000\u{1D531}\u0200eiko\u3686\u369D\u36B5\u36BC\u01F2\u368B\0\u3691e\u01004f\u1284\u1281a\u0180;sv\u3698\u3699\u369B\u43B8ym;\u43D1\u0100cn\u36A2\u36B2k\u0100as\u36A8\u36AEppro\xF8\u12C1im\xBB\u12ACs\xF0\u129E\u0100as\u36BA\u36AE\xF0\u12C1rn\u803B\xFE\u40FE\u01EC\u031F\u36C6\u22E7es\u8180\xD7;bd\u36CF\u36D0\u36D8\u40D7\u0100;a\u190F\u36D5r;\u6A31;\u6A30\u0180eps\u36E1\u36E3\u3700\xE1\u2A4D\u0200;bcf\u0486\u36EC\u36F0\u36F4ot;\u6336ir;\u6AF1\u0100;o\u36F9\u36FC\uC000\u{1D565}rk;\u6ADA\xE1\u3362rime;\u6034\u0180aip\u370F\u3712\u3764d\xE5\u1248\u0380adempst\u3721\u374D\u3740\u3751\u3757\u375C\u375Fngle\u0280;dlqr\u3730\u3731\u3736\u3740\u3742\u65B5own\xBB\u1DBBeft\u0100;e\u2800\u373E\xF1\u092E;\u625Cight\u0100;e\u32AA\u374B\xF1\u105Aot;\u65ECinus;\u6A3Alus;\u6A39b;\u69CDime;\u6A3Bezium;\u63E2\u0180cht\u3772\u377D\u3781\u0100ry\u3777\u377B;\uC000\u{1D4C9};\u4446cy;\u445Brok;\u4167\u0100io\u378B\u378Ex\xF4\u1777head\u0100lr\u3797\u37A0eftarro\xF7\u084Fightarrow\xBB\u0F5D\u0900AHabcdfghlmoprstuw\u37D0\u37D3\u37D7\u37E4\u37F0\u37FC\u380E\u381C\u3823\u3834\u3851\u385D\u386B\u38A9\u38CC\u38D2\u38EA\u38F6r\xF2\u03EDar;\u6963\u0100cr\u37DC\u37E2ute\u803B\xFA\u40FA\xF2\u1150r\u01E3\u37EA\0\u37EDy;\u445Eve;\u416D\u0100iy\u37F5\u37FArc\u803B\xFB\u40FB;\u4443\u0180abh\u3803\u3806\u380Br\xF2\u13ADlac;\u4171a\xF2\u13C3\u0100ir\u3813\u3818sht;\u697E;\uC000\u{1D532}rave\u803B\xF9\u40F9\u0161\u3827\u3831r\u0100lr\u382C\u382E\xBB\u0957\xBB\u1083lk;\u6580\u0100ct\u3839\u384D\u026F\u383F\0\0\u384Arn\u0100;e\u3845\u3846\u631Cr\xBB\u3846op;\u630Fri;\u65F8\u0100al\u3856\u385Acr;\u416B\u80BB\xA8\u0349\u0100gp\u3862\u3866on;\u4173f;\uC000\u{1D566}\u0300adhlsu\u114B\u3878\u387D\u1372\u3891\u38A0own\xE1\u13B3arpoon\u0100lr\u3888\u388Cef\xF4\u382Digh\xF4\u382Fi\u0180;hl\u3899\u389A\u389C\u43C5\xBB\u13FAon\xBB\u389Aparrows;\u61C8\u0180cit\u38B0\u38C4\u38C8\u026F\u38B6\0\0\u38C1rn\u0100;e\u38BC\u38BD\u631Dr\xBB\u38BDop;\u630Eng;\u416Fri;\u65F9cr;\uC000\u{1D4CA}\u0180dir\u38D9\u38DD\u38E2ot;\u62F0lde;\u4169i\u0100;f\u3730\u38E8\xBB\u1813\u0100am\u38EF\u38F2r\xF2\u38A8l\u803B\xFC\u40FCangle;\u69A7\u0780ABDacdeflnoprsz\u391C\u391F\u3929\u392D\u39B5\u39B8\u39BD\u39DF\u39E4\u39E8\u39F3\u39F9\u39FD\u3A01\u3A20r\xF2\u03F7ar\u0100;v\u3926\u3927\u6AE8;\u6AE9as\xE8\u03E1\u0100nr\u3932\u3937grt;\u699C\u0380eknprst\u34E3\u3946\u394B\u3952\u395D\u3964\u3996app\xE1\u2415othin\xE7\u1E96\u0180hir\u34EB\u2EC8\u3959op\xF4\u2FB5\u0100;h\u13B7\u3962\xEF\u318D\u0100iu\u3969\u396Dgm\xE1\u33B3\u0100bp\u3972\u3984setneq\u0100;q\u397D\u3980\uC000\u228A\uFE00;\uC000\u2ACB\uFE00setneq\u0100;q\u398F\u3992\uC000\u228B\uFE00;\uC000\u2ACC\uFE00\u0100hr\u399B\u399Fet\xE1\u369Ciangle\u0100lr\u39AA\u39AFeft\xBB\u0925ight\xBB\u1051y;\u4432ash\xBB\u1036\u0180elr\u39C4\u39D2\u39D7\u0180;be\u2DEA\u39CB\u39CFar;\u62BBq;\u625Alip;\u62EE\u0100bt\u39DC\u1468a\xF2\u1469r;\uC000\u{1D533}tr\xE9\u39AEsu\u0100bp\u39EF\u39F1\xBB\u0D1C\xBB\u0D59pf;\uC000\u{1D567}ro\xF0\u0EFBtr\xE9\u39B4\u0100cu\u3A06\u3A0Br;\uC000\u{1D4CB}\u0100bp\u3A10\u3A18n\u0100Ee\u3980\u3A16\xBB\u397En\u0100Ee\u3992\u3A1E\xBB\u3990igzag;\u699A\u0380cefoprs\u3A36\u3A3B\u3A56\u3A5B\u3A54\u3A61\u3A6Airc;\u4175\u0100di\u3A40\u3A51\u0100bg\u3A45\u3A49ar;\u6A5Fe\u0100;q\u15FA\u3A4F;\u6259erp;\u6118r;\uC000\u{1D534}pf;\uC000\u{1D568}\u0100;e\u1479\u3A66at\xE8\u1479cr;\uC000\u{1D4CC}\u0AE3\u178E\u3A87\0\u3A8B\0\u3A90\u3A9B\0\0\u3A9D\u3AA8\u3AAB\u3AAF\0\0\u3AC3\u3ACE\0\u3AD8\u17DC\u17DFtr\xE9\u17D1r;\uC000\u{1D535}\u0100Aa\u3A94\u3A97r\xF2\u03C3r\xF2\u09F6;\u43BE\u0100Aa\u3AA1\u3AA4r\xF2\u03B8r\xF2\u09EBa\xF0\u2713is;\u62FB\u0180dpt\u17A4\u3AB5\u3ABE\u0100fl\u3ABA\u17A9;\uC000\u{1D569}im\xE5\u17B2\u0100Aa\u3AC7\u3ACAr\xF2\u03CEr\xF2\u0A01\u0100cq\u3AD2\u17B8r;\uC000\u{1D4CD}\u0100pt\u17D6\u3ADCr\xE9\u17D4\u0400acefiosu\u3AF0\u3AFD\u3B08\u3B0C\u3B11\u3B15\u3B1B\u3B21c\u0100uy\u3AF6\u3AFBte\u803B\xFD\u40FD;\u444F\u0100iy\u3B02\u3B06rc;\u4177;\u444Bn\u803B\xA5\u40A5r;\uC000\u{1D536}cy;\u4457pf;\uC000\u{1D56A}cr;\uC000\u{1D4CE}\u0100cm\u3B26\u3B29y;\u444El\u803B\xFF\u40FF\u0500acdefhiosw\u3B42\u3B48\u3B54\u3B58\u3B64\u3B69\u3B6D\u3B74\u3B7A\u3B80cute;\u417A\u0100ay\u3B4D\u3B52ron;\u417E;\u4437ot;\u417C\u0100et\u3B5D\u3B61tr\xE6\u155Fa;\u43B6r;\uC000\u{1D537}cy;\u4436grarr;\u61DDpf;\uC000\u{1D56B}cr;\uC000\u{1D4CF}\u0100jn\u3B85\u3B87;\u600Dj;\u600C'.split("").map((r5) => r5.charCodeAt(0)));
  var t2 = new Uint16Array("\u0200aglq	\x1B\u026D\0\0p;\u4026os;\u4027t;\u403Et;\u403Cuot;\u4022".split("").map((r5) => r5.charCodeAt(0)));
  var a2 = /* @__PURE__ */ new Map([[0, 65533], [128, 8364], [130, 8218], [131, 402], [132, 8222], [133, 8230], [134, 8224], [135, 8225], [136, 710], [137, 8240], [138, 352], [139, 8249], [140, 338], [142, 381], [145, 8216], [146, 8217], [147, 8220], [148, 8221], [149, 8226], [150, 8211], [151, 8212], [152, 732], [153, 8482], [154, 353], [155, 8250], [156, 339], [158, 382], [159, 376]]);
  var o2 = null !== (r2 = String.fromCodePoint) && void 0 !== r2 ? r2 : function(r5) {
    let e4 = "";
    return r5 > 65535 && (r5 -= 65536, e4 += String.fromCharCode(r5 >>> 10 & 1023 | 55296), r5 = 56320 | 1023 & r5), e4 += String.fromCharCode(r5), e4;
  };
  var i2;
  !function(r5) {
    r5[r5.NUM = 35] = "NUM", r5[r5.SEMI = 59] = "SEMI", r5[r5.EQUALS = 61] = "EQUALS", r5[r5.ZERO = 48] = "ZERO", r5[r5.NINE = 57] = "NINE", r5[r5.LOWER_A = 97] = "LOWER_A", r5[r5.LOWER_F = 102] = "LOWER_F", r5[r5.LOWER_X = 120] = "LOWER_X", r5[r5.LOWER_Z = 122] = "LOWER_Z", r5[r5.UPPER_A = 65] = "UPPER_A", r5[r5.UPPER_F = 70] = "UPPER_F", r5[r5.UPPER_Z = 90] = "UPPER_Z";
  }(i2 || (i2 = {}));
  var c2;
  var s2;
  var n2;
  function l2(r5) {
    return r5 >= i2.ZERO && r5 <= i2.NINE;
  }
  function u3(r5) {
    return r5 === i2.EQUALS || function(r6) {
      return r6 >= i2.UPPER_A && r6 <= i2.UPPER_Z || r6 >= i2.LOWER_A && r6 <= i2.LOWER_Z || l2(r6);
    }(r5);
  }
  !function(r5) {
    r5[r5.VALUE_LENGTH = 49152] = "VALUE_LENGTH", r5[r5.BRANCH_LENGTH = 16256] = "BRANCH_LENGTH", r5[r5.JUMP_TABLE = 127] = "JUMP_TABLE";
  }(c2 || (c2 = {})), function(r5) {
    r5[r5.EntityStart = 0] = "EntityStart", r5[r5.NumericStart = 1] = "NumericStart", r5[r5.NumericDecimal = 2] = "NumericDecimal", r5[r5.NumericHex = 3] = "NumericHex", r5[r5.NamedEntity = 4] = "NamedEntity";
  }(s2 || (s2 = {})), function(r5) {
    r5[r5.Legacy = 0] = "Legacy", r5[r5.Strict = 1] = "Strict", r5[r5.Attribute = 2] = "Attribute";
  }(n2 || (n2 = {}));
  var d2 = class {
    constructor(r5, e4, t4) {
      this.decodeTree = r5, this.emitCodePoint = e4, this.errors = t4, this.state = s2.EntityStart, this.consumed = 1, this.result = 0, this.treeIndex = 0, this.excess = 1, this.decodeMode = n2.Strict;
    }
    startEntity(r5) {
      this.decodeMode = r5, this.state = s2.EntityStart, this.result = 0, this.treeIndex = 0, this.excess = 1, this.consumed = 1;
    }
    write(r5, e4) {
      switch (this.state) {
        case s2.EntityStart:
          return r5.charCodeAt(e4) === i2.NUM ? (this.state = s2.NumericStart, this.consumed += 1, this.stateNumericStart(r5, e4 + 1)) : (this.state = s2.NamedEntity, this.stateNamedEntity(r5, e4));
        case s2.NumericStart:
          return this.stateNumericStart(r5, e4);
        case s2.NumericDecimal:
          return this.stateNumericDecimal(r5, e4);
        case s2.NumericHex:
          return this.stateNumericHex(r5, e4);
        case s2.NamedEntity:
          return this.stateNamedEntity(r5, e4);
      }
    }
    stateNumericStart(r5, e4) {
      return e4 >= r5.length ? -1 : (32 | r5.charCodeAt(e4)) === i2.LOWER_X ? (this.state = s2.NumericHex, this.consumed += 1, this.stateNumericHex(r5, e4 + 1)) : (this.state = s2.NumericDecimal, this.stateNumericDecimal(r5, e4));
    }
    addToNumericResult(r5, e4, t4, a6) {
      if (e4 !== t4) {
        const o6 = t4 - e4;
        this.result = this.result * Math.pow(a6, o6) + parseInt(r5.substr(e4, o6), a6), this.consumed += o6;
      }
    }
    stateNumericHex(r5, e4) {
      const t4 = e4;
      for (; e4 < r5.length; ) {
        const o6 = r5.charCodeAt(e4);
        if (!(l2(o6) || (a6 = o6, a6 >= i2.UPPER_A && a6 <= i2.UPPER_F || a6 >= i2.LOWER_A && a6 <= i2.LOWER_F))) return this.addToNumericResult(r5, t4, e4, 16), this.emitNumericEntity(o6, 3);
        e4 += 1;
      }
      var a6;
      return this.addToNumericResult(r5, t4, e4, 16), -1;
    }
    stateNumericDecimal(r5, e4) {
      const t4 = e4;
      for (; e4 < r5.length; ) {
        const a6 = r5.charCodeAt(e4);
        if (!l2(a6)) return this.addToNumericResult(r5, t4, e4, 10), this.emitNumericEntity(a6, 2);
        e4 += 1;
      }
      return this.addToNumericResult(r5, t4, e4, 10), -1;
    }
    emitNumericEntity(r5, e4) {
      var t4;
      if (this.consumed <= e4) return null === (t4 = this.errors) || void 0 === t4 || t4.absenceOfDigitsInNumericCharacterReference(this.consumed), 0;
      if (r5 === i2.SEMI) this.consumed += 1;
      else if (this.decodeMode === n2.Strict) return 0;
      return this.emitCodePoint(function(r6) {
        var e5;
        return r6 >= 55296 && r6 <= 57343 || r6 > 1114111 ? 65533 : null !== (e5 = a2.get(r6)) && void 0 !== e5 ? e5 : r6;
      }(this.result), this.consumed), this.errors && (r5 !== i2.SEMI && this.errors.missingSemicolonAfterCharacterReference(), this.errors.validateNumericCharacterReference(this.result)), this.consumed;
    }
    stateNamedEntity(r5, e4) {
      const { decodeTree: t4 } = this;
      let a6 = t4[this.treeIndex], o6 = (a6 & c2.VALUE_LENGTH) >> 14;
      for (; e4 < r5.length; e4++, this.excess++) {
        const s4 = r5.charCodeAt(e4);
        if (this.treeIndex = m2(t4, a6, this.treeIndex + Math.max(1, o6), s4), this.treeIndex < 0) return 0 === this.result || this.decodeMode === n2.Attribute && (0 === o6 || u3(s4)) ? 0 : this.emitNotTerminatedNamedEntity();
        if (a6 = t4[this.treeIndex], o6 = (a6 & c2.VALUE_LENGTH) >> 14, 0 !== o6) {
          if (s4 === i2.SEMI) return this.emitNamedEntityData(this.treeIndex, o6, this.consumed + this.excess);
          this.decodeMode !== n2.Strict && (this.result = this.treeIndex, this.consumed += this.excess, this.excess = 0);
        }
      }
      return -1;
    }
    emitNotTerminatedNamedEntity() {
      var r5;
      const { result: e4, decodeTree: t4 } = this, a6 = (t4[e4] & c2.VALUE_LENGTH) >> 14;
      return this.emitNamedEntityData(e4, a6, this.consumed), null === (r5 = this.errors) || void 0 === r5 || r5.missingSemicolonAfterCharacterReference(), this.consumed;
    }
    emitNamedEntityData(r5, e4, t4) {
      const { decodeTree: a6 } = this;
      return this.emitCodePoint(1 === e4 ? a6[r5] & ~c2.VALUE_LENGTH : a6[r5 + 1], t4), 3 === e4 && this.emitCodePoint(a6[r5 + 2], t4), t4;
    }
    end() {
      var r5;
      switch (this.state) {
        case s2.NamedEntity:
          return 0 === this.result || this.decodeMode === n2.Attribute && this.result !== this.treeIndex ? 0 : this.emitNotTerminatedNamedEntity();
        case s2.NumericDecimal:
          return this.emitNumericEntity(0, 2);
        case s2.NumericHex:
          return this.emitNumericEntity(0, 3);
        case s2.NumericStart:
          return null === (r5 = this.errors) || void 0 === r5 || r5.absenceOfDigitsInNumericCharacterReference(this.consumed), 0;
        case s2.EntityStart:
          return 0;
      }
    }
  };
  function p2(r5) {
    let e4 = "";
    const t4 = new d2(r5, (r6) => e4 += o2(r6));
    return function(r6, a6) {
      let o6 = 0, i6 = 0;
      for (; (i6 = r6.indexOf("&", i6)) >= 0; ) {
        e4 += r6.slice(o6, i6), t4.startEntity(a6);
        const c7 = t4.write(r6, i6 + 1);
        if (c7 < 0) {
          o6 = i6 + t4.end();
          break;
        }
        o6 = i6 + c7, i6 = 0 === c7 ? o6 + 1 : o6;
      }
      const c6 = e4 + r6.slice(o6);
      return e4 = "", c6;
    };
  }
  function m2(r5, e4, t4, a6) {
    const o6 = (e4 & c2.BRANCH_LENGTH) >> 7, i6 = e4 & c2.JUMP_TABLE;
    if (0 === o6) return 0 !== i6 && a6 === i6 ? t4 : -1;
    if (i6) {
      const e5 = a6 - i6;
      return e5 < 0 || e5 >= o6 ? -1 : r5[t4 + e5] - 1;
    }
    let s4 = t4, n5 = s4 + o6 - 1;
    for (; s4 <= n5; ) {
      const e5 = s4 + n5 >>> 1, t5 = r5[e5];
      if (t5 < a6) s4 = e5 + 1;
      else {
        if (!(t5 > a6)) return r5[e5 + o6];
        n5 = e5 - 1;
      }
    }
    return -1;
  }
  var f2 = p2(e2);
  var g2 = p2(t2);
  function h4(r5, e4 = n2.Legacy) {
    return f2(r5, e4);
  }
  function E2(r5) {
    for (let e4 = 1; e4 < r5.length; e4++) r5[e4][0] += r5[e4 - 1][0] + 1;
    return r5;
  }
  var w = new Map(E2([[9, "&Tab;"], [0, "&NewLine;"], [22, "&excl;"], [0, "&quot;"], [0, "&num;"], [0, "&dollar;"], [0, "&percnt;"], [0, "&amp;"], [0, "&apos;"], [0, "&lpar;"], [0, "&rpar;"], [0, "&ast;"], [0, "&plus;"], [0, "&comma;"], [1, "&period;"], [0, "&sol;"], [10, "&colon;"], [0, "&semi;"], [0, { v: "&lt;", n: 8402, o: "&nvlt;" }], [0, { v: "&equals;", n: 8421, o: "&bne;" }], [0, { v: "&gt;", n: 8402, o: "&nvgt;" }], [0, "&quest;"], [0, "&commat;"], [26, "&lbrack;"], [0, "&bsol;"], [0, "&rbrack;"], [0, "&Hat;"], [0, "&lowbar;"], [0, "&DiacriticalGrave;"], [5, { n: 106, o: "&fjlig;" }], [20, "&lbrace;"], [0, "&verbar;"], [0, "&rbrace;"], [34, "&nbsp;"], [0, "&iexcl;"], [0, "&cent;"], [0, "&pound;"], [0, "&curren;"], [0, "&yen;"], [0, "&brvbar;"], [0, "&sect;"], [0, "&die;"], [0, "&copy;"], [0, "&ordf;"], [0, "&laquo;"], [0, "&not;"], [0, "&shy;"], [0, "&circledR;"], [0, "&macr;"], [0, "&deg;"], [0, "&PlusMinus;"], [0, "&sup2;"], [0, "&sup3;"], [0, "&acute;"], [0, "&micro;"], [0, "&para;"], [0, "&centerdot;"], [0, "&cedil;"], [0, "&sup1;"], [0, "&ordm;"], [0, "&raquo;"], [0, "&frac14;"], [0, "&frac12;"], [0, "&frac34;"], [0, "&iquest;"], [0, "&Agrave;"], [0, "&Aacute;"], [0, "&Acirc;"], [0, "&Atilde;"], [0, "&Auml;"], [0, "&angst;"], [0, "&AElig;"], [0, "&Ccedil;"], [0, "&Egrave;"], [0, "&Eacute;"], [0, "&Ecirc;"], [0, "&Euml;"], [0, "&Igrave;"], [0, "&Iacute;"], [0, "&Icirc;"], [0, "&Iuml;"], [0, "&ETH;"], [0, "&Ntilde;"], [0, "&Ograve;"], [0, "&Oacute;"], [0, "&Ocirc;"], [0, "&Otilde;"], [0, "&Ouml;"], [0, "&times;"], [0, "&Oslash;"], [0, "&Ugrave;"], [0, "&Uacute;"], [0, "&Ucirc;"], [0, "&Uuml;"], [0, "&Yacute;"], [0, "&THORN;"], [0, "&szlig;"], [0, "&agrave;"], [0, "&aacute;"], [0, "&acirc;"], [0, "&atilde;"], [0, "&auml;"], [0, "&aring;"], [0, "&aelig;"], [0, "&ccedil;"], [0, "&egrave;"], [0, "&eacute;"], [0, "&ecirc;"], [0, "&euml;"], [0, "&igrave;"], [0, "&iacute;"], [0, "&icirc;"], [0, "&iuml;"], [0, "&eth;"], [0, "&ntilde;"], [0, "&ograve;"], [0, "&oacute;"], [0, "&ocirc;"], [0, "&otilde;"], [0, "&ouml;"], [0, "&div;"], [0, "&oslash;"], [0, "&ugrave;"], [0, "&uacute;"], [0, "&ucirc;"], [0, "&uuml;"], [0, "&yacute;"], [0, "&thorn;"], [0, "&yuml;"], [0, "&Amacr;"], [0, "&amacr;"], [0, "&Abreve;"], [0, "&abreve;"], [0, "&Aogon;"], [0, "&aogon;"], [0, "&Cacute;"], [0, "&cacute;"], [0, "&Ccirc;"], [0, "&ccirc;"], [0, "&Cdot;"], [0, "&cdot;"], [0, "&Ccaron;"], [0, "&ccaron;"], [0, "&Dcaron;"], [0, "&dcaron;"], [0, "&Dstrok;"], [0, "&dstrok;"], [0, "&Emacr;"], [0, "&emacr;"], [2, "&Edot;"], [0, "&edot;"], [0, "&Eogon;"], [0, "&eogon;"], [0, "&Ecaron;"], [0, "&ecaron;"], [0, "&Gcirc;"], [0, "&gcirc;"], [0, "&Gbreve;"], [0, "&gbreve;"], [0, "&Gdot;"], [0, "&gdot;"], [0, "&Gcedil;"], [1, "&Hcirc;"], [0, "&hcirc;"], [0, "&Hstrok;"], [0, "&hstrok;"], [0, "&Itilde;"], [0, "&itilde;"], [0, "&Imacr;"], [0, "&imacr;"], [2, "&Iogon;"], [0, "&iogon;"], [0, "&Idot;"], [0, "&imath;"], [0, "&IJlig;"], [0, "&ijlig;"], [0, "&Jcirc;"], [0, "&jcirc;"], [0, "&Kcedil;"], [0, "&kcedil;"], [0, "&kgreen;"], [0, "&Lacute;"], [0, "&lacute;"], [0, "&Lcedil;"], [0, "&lcedil;"], [0, "&Lcaron;"], [0, "&lcaron;"], [0, "&Lmidot;"], [0, "&lmidot;"], [0, "&Lstrok;"], [0, "&lstrok;"], [0, "&Nacute;"], [0, "&nacute;"], [0, "&Ncedil;"], [0, "&ncedil;"], [0, "&Ncaron;"], [0, "&ncaron;"], [0, "&napos;"], [0, "&ENG;"], [0, "&eng;"], [0, "&Omacr;"], [0, "&omacr;"], [2, "&Odblac;"], [0, "&odblac;"], [0, "&OElig;"], [0, "&oelig;"], [0, "&Racute;"], [0, "&racute;"], [0, "&Rcedil;"], [0, "&rcedil;"], [0, "&Rcaron;"], [0, "&rcaron;"], [0, "&Sacute;"], [0, "&sacute;"], [0, "&Scirc;"], [0, "&scirc;"], [0, "&Scedil;"], [0, "&scedil;"], [0, "&Scaron;"], [0, "&scaron;"], [0, "&Tcedil;"], [0, "&tcedil;"], [0, "&Tcaron;"], [0, "&tcaron;"], [0, "&Tstrok;"], [0, "&tstrok;"], [0, "&Utilde;"], [0, "&utilde;"], [0, "&Umacr;"], [0, "&umacr;"], [0, "&Ubreve;"], [0, "&ubreve;"], [0, "&Uring;"], [0, "&uring;"], [0, "&Udblac;"], [0, "&udblac;"], [0, "&Uogon;"], [0, "&uogon;"], [0, "&Wcirc;"], [0, "&wcirc;"], [0, "&Ycirc;"], [0, "&ycirc;"], [0, "&Yuml;"], [0, "&Zacute;"], [0, "&zacute;"], [0, "&Zdot;"], [0, "&zdot;"], [0, "&Zcaron;"], [0, "&zcaron;"], [19, "&fnof;"], [34, "&imped;"], [63, "&gacute;"], [65, "&jmath;"], [142, "&circ;"], [0, "&caron;"], [16, "&breve;"], [0, "&DiacriticalDot;"], [0, "&ring;"], [0, "&ogon;"], [0, "&DiacriticalTilde;"], [0, "&dblac;"], [51, "&DownBreve;"], [127, "&Alpha;"], [0, "&Beta;"], [0, "&Gamma;"], [0, "&Delta;"], [0, "&Epsilon;"], [0, "&Zeta;"], [0, "&Eta;"], [0, "&Theta;"], [0, "&Iota;"], [0, "&Kappa;"], [0, "&Lambda;"], [0, "&Mu;"], [0, "&Nu;"], [0, "&Xi;"], [0, "&Omicron;"], [0, "&Pi;"], [0, "&Rho;"], [1, "&Sigma;"], [0, "&Tau;"], [0, "&Upsilon;"], [0, "&Phi;"], [0, "&Chi;"], [0, "&Psi;"], [0, "&ohm;"], [7, "&alpha;"], [0, "&beta;"], [0, "&gamma;"], [0, "&delta;"], [0, "&epsi;"], [0, "&zeta;"], [0, "&eta;"], [0, "&theta;"], [0, "&iota;"], [0, "&kappa;"], [0, "&lambda;"], [0, "&mu;"], [0, "&nu;"], [0, "&xi;"], [0, "&omicron;"], [0, "&pi;"], [0, "&rho;"], [0, "&sigmaf;"], [0, "&sigma;"], [0, "&tau;"], [0, "&upsi;"], [0, "&phi;"], [0, "&chi;"], [0, "&psi;"], [0, "&omega;"], [7, "&thetasym;"], [0, "&Upsi;"], [2, "&phiv;"], [0, "&piv;"], [5, "&Gammad;"], [0, "&digamma;"], [18, "&kappav;"], [0, "&rhov;"], [3, "&epsiv;"], [0, "&backepsilon;"], [10, "&IOcy;"], [0, "&DJcy;"], [0, "&GJcy;"], [0, "&Jukcy;"], [0, "&DScy;"], [0, "&Iukcy;"], [0, "&YIcy;"], [0, "&Jsercy;"], [0, "&LJcy;"], [0, "&NJcy;"], [0, "&TSHcy;"], [0, "&KJcy;"], [1, "&Ubrcy;"], [0, "&DZcy;"], [0, "&Acy;"], [0, "&Bcy;"], [0, "&Vcy;"], [0, "&Gcy;"], [0, "&Dcy;"], [0, "&IEcy;"], [0, "&ZHcy;"], [0, "&Zcy;"], [0, "&Icy;"], [0, "&Jcy;"], [0, "&Kcy;"], [0, "&Lcy;"], [0, "&Mcy;"], [0, "&Ncy;"], [0, "&Ocy;"], [0, "&Pcy;"], [0, "&Rcy;"], [0, "&Scy;"], [0, "&Tcy;"], [0, "&Ucy;"], [0, "&Fcy;"], [0, "&KHcy;"], [0, "&TScy;"], [0, "&CHcy;"], [0, "&SHcy;"], [0, "&SHCHcy;"], [0, "&HARDcy;"], [0, "&Ycy;"], [0, "&SOFTcy;"], [0, "&Ecy;"], [0, "&YUcy;"], [0, "&YAcy;"], [0, "&acy;"], [0, "&bcy;"], [0, "&vcy;"], [0, "&gcy;"], [0, "&dcy;"], [0, "&iecy;"], [0, "&zhcy;"], [0, "&zcy;"], [0, "&icy;"], [0, "&jcy;"], [0, "&kcy;"], [0, "&lcy;"], [0, "&mcy;"], [0, "&ncy;"], [0, "&ocy;"], [0, "&pcy;"], [0, "&rcy;"], [0, "&scy;"], [0, "&tcy;"], [0, "&ucy;"], [0, "&fcy;"], [0, "&khcy;"], [0, "&tscy;"], [0, "&chcy;"], [0, "&shcy;"], [0, "&shchcy;"], [0, "&hardcy;"], [0, "&ycy;"], [0, "&softcy;"], [0, "&ecy;"], [0, "&yucy;"], [0, "&yacy;"], [1, "&iocy;"], [0, "&djcy;"], [0, "&gjcy;"], [0, "&jukcy;"], [0, "&dscy;"], [0, "&iukcy;"], [0, "&yicy;"], [0, "&jsercy;"], [0, "&ljcy;"], [0, "&njcy;"], [0, "&tshcy;"], [0, "&kjcy;"], [1, "&ubrcy;"], [0, "&dzcy;"], [7074, "&ensp;"], [0, "&emsp;"], [0, "&emsp13;"], [0, "&emsp14;"], [1, "&numsp;"], [0, "&puncsp;"], [0, "&ThinSpace;"], [0, "&hairsp;"], [0, "&NegativeMediumSpace;"], [0, "&zwnj;"], [0, "&zwj;"], [0, "&lrm;"], [0, "&rlm;"], [0, "&dash;"], [2, "&ndash;"], [0, "&mdash;"], [0, "&horbar;"], [0, "&Verbar;"], [1, "&lsquo;"], [0, "&CloseCurlyQuote;"], [0, "&lsquor;"], [1, "&ldquo;"], [0, "&CloseCurlyDoubleQuote;"], [0, "&bdquo;"], [1, "&dagger;"], [0, "&Dagger;"], [0, "&bull;"], [2, "&nldr;"], [0, "&hellip;"], [9, "&permil;"], [0, "&pertenk;"], [0, "&prime;"], [0, "&Prime;"], [0, "&tprime;"], [0, "&backprime;"], [3, "&lsaquo;"], [0, "&rsaquo;"], [3, "&oline;"], [2, "&caret;"], [1, "&hybull;"], [0, "&frasl;"], [10, "&bsemi;"], [7, "&qprime;"], [7, { v: "&MediumSpace;", n: 8202, o: "&ThickSpace;" }], [0, "&NoBreak;"], [0, "&af;"], [0, "&InvisibleTimes;"], [0, "&ic;"], [72, "&euro;"], [46, "&tdot;"], [0, "&DotDot;"], [37, "&complexes;"], [2, "&incare;"], [4, "&gscr;"], [0, "&hamilt;"], [0, "&Hfr;"], [0, "&Hopf;"], [0, "&planckh;"], [0, "&hbar;"], [0, "&imagline;"], [0, "&Ifr;"], [0, "&lagran;"], [0, "&ell;"], [1, "&naturals;"], [0, "&numero;"], [0, "&copysr;"], [0, "&weierp;"], [0, "&Popf;"], [0, "&Qopf;"], [0, "&realine;"], [0, "&real;"], [0, "&reals;"], [0, "&rx;"], [3, "&trade;"], [1, "&integers;"], [2, "&mho;"], [0, "&zeetrf;"], [0, "&iiota;"], [2, "&bernou;"], [0, "&Cayleys;"], [1, "&escr;"], [0, "&Escr;"], [0, "&Fouriertrf;"], [1, "&Mellintrf;"], [0, "&order;"], [0, "&alefsym;"], [0, "&beth;"], [0, "&gimel;"], [0, "&daleth;"], [12, "&CapitalDifferentialD;"], [0, "&dd;"], [0, "&ee;"], [0, "&ii;"], [10, "&frac13;"], [0, "&frac23;"], [0, "&frac15;"], [0, "&frac25;"], [0, "&frac35;"], [0, "&frac45;"], [0, "&frac16;"], [0, "&frac56;"], [0, "&frac18;"], [0, "&frac38;"], [0, "&frac58;"], [0, "&frac78;"], [49, "&larr;"], [0, "&ShortUpArrow;"], [0, "&rarr;"], [0, "&darr;"], [0, "&harr;"], [0, "&updownarrow;"], [0, "&nwarr;"], [0, "&nearr;"], [0, "&LowerRightArrow;"], [0, "&LowerLeftArrow;"], [0, "&nlarr;"], [0, "&nrarr;"], [1, { v: "&rarrw;", n: 824, o: "&nrarrw;" }], [0, "&Larr;"], [0, "&Uarr;"], [0, "&Rarr;"], [0, "&Darr;"], [0, "&larrtl;"], [0, "&rarrtl;"], [0, "&LeftTeeArrow;"], [0, "&mapstoup;"], [0, "&map;"], [0, "&DownTeeArrow;"], [1, "&hookleftarrow;"], [0, "&hookrightarrow;"], [0, "&larrlp;"], [0, "&looparrowright;"], [0, "&harrw;"], [0, "&nharr;"], [1, "&lsh;"], [0, "&rsh;"], [0, "&ldsh;"], [0, "&rdsh;"], [1, "&crarr;"], [0, "&cularr;"], [0, "&curarr;"], [2, "&circlearrowleft;"], [0, "&circlearrowright;"], [0, "&leftharpoonup;"], [0, "&DownLeftVector;"], [0, "&RightUpVector;"], [0, "&LeftUpVector;"], [0, "&rharu;"], [0, "&DownRightVector;"], [0, "&dharr;"], [0, "&dharl;"], [0, "&RightArrowLeftArrow;"], [0, "&udarr;"], [0, "&LeftArrowRightArrow;"], [0, "&leftleftarrows;"], [0, "&upuparrows;"], [0, "&rightrightarrows;"], [0, "&ddarr;"], [0, "&leftrightharpoons;"], [0, "&Equilibrium;"], [0, "&nlArr;"], [0, "&nhArr;"], [0, "&nrArr;"], [0, "&DoubleLeftArrow;"], [0, "&DoubleUpArrow;"], [0, "&DoubleRightArrow;"], [0, "&dArr;"], [0, "&DoubleLeftRightArrow;"], [0, "&DoubleUpDownArrow;"], [0, "&nwArr;"], [0, "&neArr;"], [0, "&seArr;"], [0, "&swArr;"], [0, "&lAarr;"], [0, "&rAarr;"], [1, "&zigrarr;"], [6, "&larrb;"], [0, "&rarrb;"], [15, "&DownArrowUpArrow;"], [7, "&loarr;"], [0, "&roarr;"], [0, "&hoarr;"], [0, "&forall;"], [0, "&comp;"], [0, { v: "&part;", n: 824, o: "&npart;" }], [0, "&exist;"], [0, "&nexist;"], [0, "&empty;"], [1, "&Del;"], [0, "&Element;"], [0, "&NotElement;"], [1, "&ni;"], [0, "&notni;"], [2, "&prod;"], [0, "&coprod;"], [0, "&sum;"], [0, "&minus;"], [0, "&MinusPlus;"], [0, "&dotplus;"], [1, "&Backslash;"], [0, "&lowast;"], [0, "&compfn;"], [1, "&radic;"], [2, "&prop;"], [0, "&infin;"], [0, "&angrt;"], [0, { v: "&ang;", n: 8402, o: "&nang;" }], [0, "&angmsd;"], [0, "&angsph;"], [0, "&mid;"], [0, "&nmid;"], [0, "&DoubleVerticalBar;"], [0, "&NotDoubleVerticalBar;"], [0, "&and;"], [0, "&or;"], [0, { v: "&cap;", n: 65024, o: "&caps;" }], [0, { v: "&cup;", n: 65024, o: "&cups;" }], [0, "&int;"], [0, "&Int;"], [0, "&iiint;"], [0, "&conint;"], [0, "&Conint;"], [0, "&Cconint;"], [0, "&cwint;"], [0, "&ClockwiseContourIntegral;"], [0, "&awconint;"], [0, "&there4;"], [0, "&becaus;"], [0, "&ratio;"], [0, "&Colon;"], [0, "&dotminus;"], [1, "&mDDot;"], [0, "&homtht;"], [0, { v: "&sim;", n: 8402, o: "&nvsim;" }], [0, { v: "&backsim;", n: 817, o: "&race;" }], [0, { v: "&ac;", n: 819, o: "&acE;" }], [0, "&acd;"], [0, "&VerticalTilde;"], [0, "&NotTilde;"], [0, { v: "&eqsim;", n: 824, o: "&nesim;" }], [0, "&sime;"], [0, "&NotTildeEqual;"], [0, "&cong;"], [0, "&simne;"], [0, "&ncong;"], [0, "&ap;"], [0, "&nap;"], [0, "&ape;"], [0, { v: "&apid;", n: 824, o: "&napid;" }], [0, "&backcong;"], [0, { v: "&asympeq;", n: 8402, o: "&nvap;" }], [0, { v: "&bump;", n: 824, o: "&nbump;" }], [0, { v: "&bumpe;", n: 824, o: "&nbumpe;" }], [0, { v: "&doteq;", n: 824, o: "&nedot;" }], [0, "&doteqdot;"], [0, "&efDot;"], [0, "&erDot;"], [0, "&Assign;"], [0, "&ecolon;"], [0, "&ecir;"], [0, "&circeq;"], [1, "&wedgeq;"], [0, "&veeeq;"], [1, "&triangleq;"], [2, "&equest;"], [0, "&ne;"], [0, { v: "&Congruent;", n: 8421, o: "&bnequiv;" }], [0, "&nequiv;"], [1, { v: "&le;", n: 8402, o: "&nvle;" }], [0, { v: "&ge;", n: 8402, o: "&nvge;" }], [0, { v: "&lE;", n: 824, o: "&nlE;" }], [0, { v: "&gE;", n: 824, o: "&ngE;" }], [0, { v: "&lnE;", n: 65024, o: "&lvertneqq;" }], [0, { v: "&gnE;", n: 65024, o: "&gvertneqq;" }], [0, { v: "&ll;", n: new Map(E2([[824, "&nLtv;"], [7577, "&nLt;"]])) }], [0, { v: "&gg;", n: new Map(E2([[824, "&nGtv;"], [7577, "&nGt;"]])) }], [0, "&between;"], [0, "&NotCupCap;"], [0, "&nless;"], [0, "&ngt;"], [0, "&nle;"], [0, "&nge;"], [0, "&lesssim;"], [0, "&GreaterTilde;"], [0, "&nlsim;"], [0, "&ngsim;"], [0, "&LessGreater;"], [0, "&gl;"], [0, "&NotLessGreater;"], [0, "&NotGreaterLess;"], [0, "&pr;"], [0, "&sc;"], [0, "&prcue;"], [0, "&sccue;"], [0, "&PrecedesTilde;"], [0, { v: "&scsim;", n: 824, o: "&NotSucceedsTilde;" }], [0, "&NotPrecedes;"], [0, "&NotSucceeds;"], [0, { v: "&sub;", n: 8402, o: "&NotSubset;" }], [0, { v: "&sup;", n: 8402, o: "&NotSuperset;" }], [0, "&nsub;"], [0, "&nsup;"], [0, "&sube;"], [0, "&supe;"], [0, "&NotSubsetEqual;"], [0, "&NotSupersetEqual;"], [0, { v: "&subne;", n: 65024, o: "&varsubsetneq;" }], [0, { v: "&supne;", n: 65024, o: "&varsupsetneq;" }], [1, "&cupdot;"], [0, "&UnionPlus;"], [0, { v: "&sqsub;", n: 824, o: "&NotSquareSubset;" }], [0, { v: "&sqsup;", n: 824, o: "&NotSquareSuperset;" }], [0, "&sqsube;"], [0, "&sqsupe;"], [0, { v: "&sqcap;", n: 65024, o: "&sqcaps;" }], [0, { v: "&sqcup;", n: 65024, o: "&sqcups;" }], [0, "&CirclePlus;"], [0, "&CircleMinus;"], [0, "&CircleTimes;"], [0, "&osol;"], [0, "&CircleDot;"], [0, "&circledcirc;"], [0, "&circledast;"], [1, "&circleddash;"], [0, "&boxplus;"], [0, "&boxminus;"], [0, "&boxtimes;"], [0, "&dotsquare;"], [0, "&RightTee;"], [0, "&dashv;"], [0, "&DownTee;"], [0, "&bot;"], [1, "&models;"], [0, "&DoubleRightTee;"], [0, "&Vdash;"], [0, "&Vvdash;"], [0, "&VDash;"], [0, "&nvdash;"], [0, "&nvDash;"], [0, "&nVdash;"], [0, "&nVDash;"], [0, "&prurel;"], [1, "&LeftTriangle;"], [0, "&RightTriangle;"], [0, { v: "&LeftTriangleEqual;", n: 8402, o: "&nvltrie;" }], [0, { v: "&RightTriangleEqual;", n: 8402, o: "&nvrtrie;" }], [0, "&origof;"], [0, "&imof;"], [0, "&multimap;"], [0, "&hercon;"], [0, "&intcal;"], [0, "&veebar;"], [1, "&barvee;"], [0, "&angrtvb;"], [0, "&lrtri;"], [0, "&bigwedge;"], [0, "&bigvee;"], [0, "&bigcap;"], [0, "&bigcup;"], [0, "&diam;"], [0, "&sdot;"], [0, "&sstarf;"], [0, "&divideontimes;"], [0, "&bowtie;"], [0, "&ltimes;"], [0, "&rtimes;"], [0, "&leftthreetimes;"], [0, "&rightthreetimes;"], [0, "&backsimeq;"], [0, "&curlyvee;"], [0, "&curlywedge;"], [0, "&Sub;"], [0, "&Sup;"], [0, "&Cap;"], [0, "&Cup;"], [0, "&fork;"], [0, "&epar;"], [0, "&lessdot;"], [0, "&gtdot;"], [0, { v: "&Ll;", n: 824, o: "&nLl;" }], [0, { v: "&Gg;", n: 824, o: "&nGg;" }], [0, { v: "&leg;", n: 65024, o: "&lesg;" }], [0, { v: "&gel;", n: 65024, o: "&gesl;" }], [2, "&cuepr;"], [0, "&cuesc;"], [0, "&NotPrecedesSlantEqual;"], [0, "&NotSucceedsSlantEqual;"], [0, "&NotSquareSubsetEqual;"], [0, "&NotSquareSupersetEqual;"], [2, "&lnsim;"], [0, "&gnsim;"], [0, "&precnsim;"], [0, "&scnsim;"], [0, "&nltri;"], [0, "&NotRightTriangle;"], [0, "&nltrie;"], [0, "&NotRightTriangleEqual;"], [0, "&vellip;"], [0, "&ctdot;"], [0, "&utdot;"], [0, "&dtdot;"], [0, "&disin;"], [0, "&isinsv;"], [0, "&isins;"], [0, { v: "&isindot;", n: 824, o: "&notindot;" }], [0, "&notinvc;"], [0, "&notinvb;"], [1, { v: "&isinE;", n: 824, o: "&notinE;" }], [0, "&nisd;"], [0, "&xnis;"], [0, "&nis;"], [0, "&notnivc;"], [0, "&notnivb;"], [6, "&barwed;"], [0, "&Barwed;"], [1, "&lceil;"], [0, "&rceil;"], [0, "&LeftFloor;"], [0, "&rfloor;"], [0, "&drcrop;"], [0, "&dlcrop;"], [0, "&urcrop;"], [0, "&ulcrop;"], [0, "&bnot;"], [1, "&profline;"], [0, "&profsurf;"], [1, "&telrec;"], [0, "&target;"], [5, "&ulcorn;"], [0, "&urcorn;"], [0, "&dlcorn;"], [0, "&drcorn;"], [2, "&frown;"], [0, "&smile;"], [9, "&cylcty;"], [0, "&profalar;"], [7, "&topbot;"], [6, "&ovbar;"], [1, "&solbar;"], [60, "&angzarr;"], [51, "&lmoustache;"], [0, "&rmoustache;"], [2, "&OverBracket;"], [0, "&bbrk;"], [0, "&bbrktbrk;"], [37, "&OverParenthesis;"], [0, "&UnderParenthesis;"], [0, "&OverBrace;"], [0, "&UnderBrace;"], [2, "&trpezium;"], [4, "&elinters;"], [59, "&blank;"], [164, "&circledS;"], [55, "&boxh;"], [1, "&boxv;"], [9, "&boxdr;"], [3, "&boxdl;"], [3, "&boxur;"], [3, "&boxul;"], [3, "&boxvr;"], [7, "&boxvl;"], [7, "&boxhd;"], [7, "&boxhu;"], [7, "&boxvh;"], [19, "&boxH;"], [0, "&boxV;"], [0, "&boxdR;"], [0, "&boxDr;"], [0, "&boxDR;"], [0, "&boxdL;"], [0, "&boxDl;"], [0, "&boxDL;"], [0, "&boxuR;"], [0, "&boxUr;"], [0, "&boxUR;"], [0, "&boxuL;"], [0, "&boxUl;"], [0, "&boxUL;"], [0, "&boxvR;"], [0, "&boxVr;"], [0, "&boxVR;"], [0, "&boxvL;"], [0, "&boxVl;"], [0, "&boxVL;"], [0, "&boxHd;"], [0, "&boxhD;"], [0, "&boxHD;"], [0, "&boxHu;"], [0, "&boxhU;"], [0, "&boxHU;"], [0, "&boxvH;"], [0, "&boxVh;"], [0, "&boxVH;"], [19, "&uhblk;"], [3, "&lhblk;"], [3, "&block;"], [8, "&blk14;"], [0, "&blk12;"], [0, "&blk34;"], [13, "&square;"], [8, "&blacksquare;"], [0, "&EmptyVerySmallSquare;"], [1, "&rect;"], [0, "&marker;"], [2, "&fltns;"], [1, "&bigtriangleup;"], [0, "&blacktriangle;"], [0, "&triangle;"], [2, "&blacktriangleright;"], [0, "&rtri;"], [3, "&bigtriangledown;"], [0, "&blacktriangledown;"], [0, "&dtri;"], [2, "&blacktriangleleft;"], [0, "&ltri;"], [6, "&loz;"], [0, "&cir;"], [32, "&tridot;"], [2, "&bigcirc;"], [8, "&ultri;"], [0, "&urtri;"], [0, "&lltri;"], [0, "&EmptySmallSquare;"], [0, "&FilledSmallSquare;"], [8, "&bigstar;"], [0, "&star;"], [7, "&phone;"], [49, "&female;"], [1, "&male;"], [29, "&spades;"], [2, "&clubs;"], [1, "&hearts;"], [0, "&diamondsuit;"], [3, "&sung;"], [2, "&flat;"], [0, "&natural;"], [0, "&sharp;"], [163, "&check;"], [3, "&cross;"], [8, "&malt;"], [21, "&sext;"], [33, "&VerticalSeparator;"], [25, "&lbbrk;"], [0, "&rbbrk;"], [84, "&bsolhsub;"], [0, "&suphsol;"], [28, "&LeftDoubleBracket;"], [0, "&RightDoubleBracket;"], [0, "&lang;"], [0, "&rang;"], [0, "&Lang;"], [0, "&Rang;"], [0, "&loang;"], [0, "&roang;"], [7, "&longleftarrow;"], [0, "&longrightarrow;"], [0, "&longleftrightarrow;"], [0, "&DoubleLongLeftArrow;"], [0, "&DoubleLongRightArrow;"], [0, "&DoubleLongLeftRightArrow;"], [1, "&longmapsto;"], [2, "&dzigrarr;"], [258, "&nvlArr;"], [0, "&nvrArr;"], [0, "&nvHarr;"], [0, "&Map;"], [6, "&lbarr;"], [0, "&bkarow;"], [0, "&lBarr;"], [0, "&dbkarow;"], [0, "&drbkarow;"], [0, "&DDotrahd;"], [0, "&UpArrowBar;"], [0, "&DownArrowBar;"], [2, "&Rarrtl;"], [2, "&latail;"], [0, "&ratail;"], [0, "&lAtail;"], [0, "&rAtail;"], [0, "&larrfs;"], [0, "&rarrfs;"], [0, "&larrbfs;"], [0, "&rarrbfs;"], [2, "&nwarhk;"], [0, "&nearhk;"], [0, "&hksearow;"], [0, "&hkswarow;"], [0, "&nwnear;"], [0, "&nesear;"], [0, "&seswar;"], [0, "&swnwar;"], [8, { v: "&rarrc;", n: 824, o: "&nrarrc;" }], [1, "&cudarrr;"], [0, "&ldca;"], [0, "&rdca;"], [0, "&cudarrl;"], [0, "&larrpl;"], [2, "&curarrm;"], [0, "&cularrp;"], [7, "&rarrpl;"], [2, "&harrcir;"], [0, "&Uarrocir;"], [0, "&lurdshar;"], [0, "&ldrushar;"], [2, "&LeftRightVector;"], [0, "&RightUpDownVector;"], [0, "&DownLeftRightVector;"], [0, "&LeftUpDownVector;"], [0, "&LeftVectorBar;"], [0, "&RightVectorBar;"], [0, "&RightUpVectorBar;"], [0, "&RightDownVectorBar;"], [0, "&DownLeftVectorBar;"], [0, "&DownRightVectorBar;"], [0, "&LeftUpVectorBar;"], [0, "&LeftDownVectorBar;"], [0, "&LeftTeeVector;"], [0, "&RightTeeVector;"], [0, "&RightUpTeeVector;"], [0, "&RightDownTeeVector;"], [0, "&DownLeftTeeVector;"], [0, "&DownRightTeeVector;"], [0, "&LeftUpTeeVector;"], [0, "&LeftDownTeeVector;"], [0, "&lHar;"], [0, "&uHar;"], [0, "&rHar;"], [0, "&dHar;"], [0, "&luruhar;"], [0, "&ldrdhar;"], [0, "&ruluhar;"], [0, "&rdldhar;"], [0, "&lharul;"], [0, "&llhard;"], [0, "&rharul;"], [0, "&lrhard;"], [0, "&udhar;"], [0, "&duhar;"], [0, "&RoundImplies;"], [0, "&erarr;"], [0, "&simrarr;"], [0, "&larrsim;"], [0, "&rarrsim;"], [0, "&rarrap;"], [0, "&ltlarr;"], [1, "&gtrarr;"], [0, "&subrarr;"], [1, "&suplarr;"], [0, "&lfisht;"], [0, "&rfisht;"], [0, "&ufisht;"], [0, "&dfisht;"], [5, "&lopar;"], [0, "&ropar;"], [4, "&lbrke;"], [0, "&rbrke;"], [0, "&lbrkslu;"], [0, "&rbrksld;"], [0, "&lbrksld;"], [0, "&rbrkslu;"], [0, "&langd;"], [0, "&rangd;"], [0, "&lparlt;"], [0, "&rpargt;"], [0, "&gtlPar;"], [0, "&ltrPar;"], [3, "&vzigzag;"], [1, "&vangrt;"], [0, "&angrtvbd;"], [6, "&ange;"], [0, "&range;"], [0, "&dwangle;"], [0, "&uwangle;"], [0, "&angmsdaa;"], [0, "&angmsdab;"], [0, "&angmsdac;"], [0, "&angmsdad;"], [0, "&angmsdae;"], [0, "&angmsdaf;"], [0, "&angmsdag;"], [0, "&angmsdah;"], [0, "&bemptyv;"], [0, "&demptyv;"], [0, "&cemptyv;"], [0, "&raemptyv;"], [0, "&laemptyv;"], [0, "&ohbar;"], [0, "&omid;"], [0, "&opar;"], [1, "&operp;"], [1, "&olcross;"], [0, "&odsold;"], [1, "&olcir;"], [0, "&ofcir;"], [0, "&olt;"], [0, "&ogt;"], [0, "&cirscir;"], [0, "&cirE;"], [0, "&solb;"], [0, "&bsolb;"], [3, "&boxbox;"], [3, "&trisb;"], [0, "&rtriltri;"], [0, { v: "&LeftTriangleBar;", n: 824, o: "&NotLeftTriangleBar;" }], [0, { v: "&RightTriangleBar;", n: 824, o: "&NotRightTriangleBar;" }], [11, "&iinfin;"], [0, "&infintie;"], [0, "&nvinfin;"], [4, "&eparsl;"], [0, "&smeparsl;"], [0, "&eqvparsl;"], [5, "&blacklozenge;"], [8, "&RuleDelayed;"], [1, "&dsol;"], [9, "&bigodot;"], [0, "&bigoplus;"], [0, "&bigotimes;"], [1, "&biguplus;"], [1, "&bigsqcup;"], [5, "&iiiint;"], [0, "&fpartint;"], [2, "&cirfnint;"], [0, "&awint;"], [0, "&rppolint;"], [0, "&scpolint;"], [0, "&npolint;"], [0, "&pointint;"], [0, "&quatint;"], [0, "&intlarhk;"], [10, "&pluscir;"], [0, "&plusacir;"], [0, "&simplus;"], [0, "&plusdu;"], [0, "&plussim;"], [0, "&plustwo;"], [1, "&mcomma;"], [0, "&minusdu;"], [2, "&loplus;"], [0, "&roplus;"], [0, "&Cross;"], [0, "&timesd;"], [0, "&timesbar;"], [1, "&smashp;"], [0, "&lotimes;"], [0, "&rotimes;"], [0, "&otimesas;"], [0, "&Otimes;"], [0, "&odiv;"], [0, "&triplus;"], [0, "&triminus;"], [0, "&tritime;"], [0, "&intprod;"], [2, "&amalg;"], [0, "&capdot;"], [1, "&ncup;"], [0, "&ncap;"], [0, "&capand;"], [0, "&cupor;"], [0, "&cupcap;"], [0, "&capcup;"], [0, "&cupbrcap;"], [0, "&capbrcup;"], [0, "&cupcup;"], [0, "&capcap;"], [0, "&ccups;"], [0, "&ccaps;"], [2, "&ccupssm;"], [2, "&And;"], [0, "&Or;"], [0, "&andand;"], [0, "&oror;"], [0, "&orslope;"], [0, "&andslope;"], [1, "&andv;"], [0, "&orv;"], [0, "&andd;"], [0, "&ord;"], [1, "&wedbar;"], [6, "&sdote;"], [3, "&simdot;"], [2, { v: "&congdot;", n: 824, o: "&ncongdot;" }], [0, "&easter;"], [0, "&apacir;"], [0, { v: "&apE;", n: 824, o: "&napE;" }], [0, "&eplus;"], [0, "&pluse;"], [0, "&Esim;"], [0, "&Colone;"], [0, "&Equal;"], [1, "&ddotseq;"], [0, "&equivDD;"], [0, "&ltcir;"], [0, "&gtcir;"], [0, "&ltquest;"], [0, "&gtquest;"], [0, { v: "&leqslant;", n: 824, o: "&nleqslant;" }], [0, { v: "&geqslant;", n: 824, o: "&ngeqslant;" }], [0, "&lesdot;"], [0, "&gesdot;"], [0, "&lesdoto;"], [0, "&gesdoto;"], [0, "&lesdotor;"], [0, "&gesdotol;"], [0, "&lap;"], [0, "&gap;"], [0, "&lne;"], [0, "&gne;"], [0, "&lnap;"], [0, "&gnap;"], [0, "&lEg;"], [0, "&gEl;"], [0, "&lsime;"], [0, "&gsime;"], [0, "&lsimg;"], [0, "&gsiml;"], [0, "&lgE;"], [0, "&glE;"], [0, "&lesges;"], [0, "&gesles;"], [0, "&els;"], [0, "&egs;"], [0, "&elsdot;"], [0, "&egsdot;"], [0, "&el;"], [0, "&eg;"], [2, "&siml;"], [0, "&simg;"], [0, "&simlE;"], [0, "&simgE;"], [0, { v: "&LessLess;", n: 824, o: "&NotNestedLessLess;" }], [0, { v: "&GreaterGreater;", n: 824, o: "&NotNestedGreaterGreater;" }], [1, "&glj;"], [0, "&gla;"], [0, "&ltcc;"], [0, "&gtcc;"], [0, "&lescc;"], [0, "&gescc;"], [0, "&smt;"], [0, "&lat;"], [0, { v: "&smte;", n: 65024, o: "&smtes;" }], [0, { v: "&late;", n: 65024, o: "&lates;" }], [0, "&bumpE;"], [0, { v: "&PrecedesEqual;", n: 824, o: "&NotPrecedesEqual;" }], [0, { v: "&sce;", n: 824, o: "&NotSucceedsEqual;" }], [2, "&prE;"], [0, "&scE;"], [0, "&precneqq;"], [0, "&scnE;"], [0, "&prap;"], [0, "&scap;"], [0, "&precnapprox;"], [0, "&scnap;"], [0, "&Pr;"], [0, "&Sc;"], [0, "&subdot;"], [0, "&supdot;"], [0, "&subplus;"], [0, "&supplus;"], [0, "&submult;"], [0, "&supmult;"], [0, "&subedot;"], [0, "&supedot;"], [0, { v: "&subE;", n: 824, o: "&nsubE;" }], [0, { v: "&supE;", n: 824, o: "&nsupE;" }], [0, "&subsim;"], [0, "&supsim;"], [2, { v: "&subnE;", n: 65024, o: "&varsubsetneqq;" }], [0, { v: "&supnE;", n: 65024, o: "&varsupsetneqq;" }], [2, "&csub;"], [0, "&csup;"], [0, "&csube;"], [0, "&csupe;"], [0, "&subsup;"], [0, "&supsub;"], [0, "&subsub;"], [0, "&supsup;"], [0, "&suphsub;"], [0, "&supdsub;"], [0, "&forkv;"], [0, "&topfork;"], [0, "&mlcp;"], [8, "&Dashv;"], [1, "&Vdashl;"], [0, "&Barv;"], [0, "&vBar;"], [0, "&vBarv;"], [1, "&Vbar;"], [0, "&Not;"], [0, "&bNot;"], [0, "&rnmid;"], [0, "&cirmid;"], [0, "&midcir;"], [0, "&topcir;"], [0, "&nhpar;"], [0, "&parsim;"], [9, { v: "&parsl;", n: 8421, o: "&nparsl;" }], [44343, { n: new Map(E2([[56476, "&Ascr;"], [1, "&Cscr;"], [0, "&Dscr;"], [2, "&Gscr;"], [2, "&Jscr;"], [0, "&Kscr;"], [2, "&Nscr;"], [0, "&Oscr;"], [0, "&Pscr;"], [0, "&Qscr;"], [1, "&Sscr;"], [0, "&Tscr;"], [0, "&Uscr;"], [0, "&Vscr;"], [0, "&Wscr;"], [0, "&Xscr;"], [0, "&Yscr;"], [0, "&Zscr;"], [0, "&ascr;"], [0, "&bscr;"], [0, "&cscr;"], [0, "&dscr;"], [1, "&fscr;"], [1, "&hscr;"], [0, "&iscr;"], [0, "&jscr;"], [0, "&kscr;"], [0, "&lscr;"], [0, "&mscr;"], [0, "&nscr;"], [1, "&pscr;"], [0, "&qscr;"], [0, "&rscr;"], [0, "&sscr;"], [0, "&tscr;"], [0, "&uscr;"], [0, "&vscr;"], [0, "&wscr;"], [0, "&xscr;"], [0, "&yscr;"], [0, "&zscr;"], [52, "&Afr;"], [0, "&Bfr;"], [1, "&Dfr;"], [0, "&Efr;"], [0, "&Ffr;"], [0, "&Gfr;"], [2, "&Jfr;"], [0, "&Kfr;"], [0, "&Lfr;"], [0, "&Mfr;"], [0, "&Nfr;"], [0, "&Ofr;"], [0, "&Pfr;"], [0, "&Qfr;"], [1, "&Sfr;"], [0, "&Tfr;"], [0, "&Ufr;"], [0, "&Vfr;"], [0, "&Wfr;"], [0, "&Xfr;"], [0, "&Yfr;"], [1, "&afr;"], [0, "&bfr;"], [0, "&cfr;"], [0, "&dfr;"], [0, "&efr;"], [0, "&ffr;"], [0, "&gfr;"], [0, "&hfr;"], [0, "&ifr;"], [0, "&jfr;"], [0, "&kfr;"], [0, "&lfr;"], [0, "&mfr;"], [0, "&nfr;"], [0, "&ofr;"], [0, "&pfr;"], [0, "&qfr;"], [0, "&rfr;"], [0, "&sfr;"], [0, "&tfr;"], [0, "&ufr;"], [0, "&vfr;"], [0, "&wfr;"], [0, "&xfr;"], [0, "&yfr;"], [0, "&zfr;"], [0, "&Aopf;"], [0, "&Bopf;"], [1, "&Dopf;"], [0, "&Eopf;"], [0, "&Fopf;"], [0, "&Gopf;"], [1, "&Iopf;"], [0, "&Jopf;"], [0, "&Kopf;"], [0, "&Lopf;"], [0, "&Mopf;"], [1, "&Oopf;"], [3, "&Sopf;"], [0, "&Topf;"], [0, "&Uopf;"], [0, "&Vopf;"], [0, "&Wopf;"], [0, "&Xopf;"], [0, "&Yopf;"], [1, "&aopf;"], [0, "&bopf;"], [0, "&copf;"], [0, "&dopf;"], [0, "&eopf;"], [0, "&fopf;"], [0, "&gopf;"], [0, "&hopf;"], [0, "&iopf;"], [0, "&jopf;"], [0, "&kopf;"], [0, "&lopf;"], [0, "&mopf;"], [0, "&nopf;"], [0, "&oopf;"], [0, "&popf;"], [0, "&qopf;"], [0, "&ropf;"], [0, "&sopf;"], [0, "&topf;"], [0, "&uopf;"], [0, "&vopf;"], [0, "&wopf;"], [0, "&xopf;"], [0, "&yopf;"], [0, "&zopf;"]])) }], [8906, "&fflig;"], [0, "&filig;"], [0, "&fllig;"], [0, "&ffilig;"], [0, "&ffllig;"]]));
  var A3 = /* @__PURE__ */ new Map([[34, "&quot;"], [38, "&amp;"], [39, "&apos;"], [60, "&lt;"], [62, "&gt;"]]);
  var L = null != String.prototype.codePointAt ? (r5, e4) => r5.codePointAt(e4) : (r5, e4) => 55296 == (64512 & r5.charCodeAt(e4)) ? 1024 * (r5.charCodeAt(e4) - 55296) + r5.charCodeAt(e4 + 1) - 56320 + 65536 : r5.charCodeAt(e4);
  function N(r5, e4) {
    return function(t4) {
      let a6, o6 = 0, i6 = "";
      for (; a6 = r5.exec(t4); ) o6 !== a6.index && (i6 += t4.substring(o6, a6.index)), i6 += e4.get(a6[0].charCodeAt(0)), o6 = a6.index + 1;
      return i6 + t4.substring(o6);
    };
  }
  var T = N(/[&<>'"]/g, A3);
  var x = N(/["&\u00A0]/g, /* @__PURE__ */ new Map([[34, "&quot;"], [38, "&amp;"], [160, "&nbsp;"]]));
  var S = N(/[&<>\u00A0]/g, /* @__PURE__ */ new Map([[38, "&amp;"], [60, "&lt;"], [62, "&gt;"], [160, "&nbsp;"]]));
  var V;
  var B2;
  !function(r5) {
    r5[r5.XML = 0] = "XML", r5[r5.HTML = 1] = "HTML";
  }(V || (V = {})), function(r5) {
    r5[r5.UTF8 = 0] = "UTF8", r5[r5.ASCII = 1] = "ASCII", r5[r5.Extensive = 2] = "Extensive", r5[r5.Attribute = 3] = "Attribute", r5[r5.Text = 4] = "Text";
  }(B2 || (B2 = {}));

  // scripts/markdown-it/linkify.js
  function r3(t4) {
    return Array.prototype.slice.call(arguments, 1).forEach(function(_2) {
      _2 && Object.keys(_2).forEach(function(e4) {
        t4[e4] = _2[e4];
      });
    }), t4;
  }
  function i3(t4) {
    return Object.prototype.toString.call(t4);
  }
  function c3(t4) {
    return "[object Function]" === i3(t4);
  }
  function n3(t4) {
    return t4.replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
  }
  var o3 = { fuzzyLink: true, fuzzyEmail: true, fuzzyIP: false };
  var h5 = { "http:": { validate: function(t4, _2, e4) {
    const s4 = t4.slice(_2);
    return e4.re.http || (e4.re.http = new RegExp("^\\/\\/" + e4.re.src_auth + e4.re.src_host_port_strict + e4.re.src_path, "i")), e4.re.http.test(s4) ? s4.match(e4.re.http)[0].length : 0;
  } }, "https:": "http:", "ftp:": "http:", "//": { validate: function(t4, _2, e4) {
    const s4 = t4.slice(_2);
    return e4.re.no_http || (e4.re.no_http = new RegExp("^" + e4.re.src_auth + "(?:localhost|(?:(?:" + e4.re.src_domain + ")\\.)+" + e4.re.src_domain_root + ")" + e4.re.src_port + e4.re.src_host_terminator + e4.re.src_path, "i")), e4.re.no_http.test(s4) ? _2 >= 3 && ":" === t4[_2 - 3] || _2 >= 3 && "/" === t4[_2 - 3] ? 0 : s4.match(e4.re.no_http)[0].length : 0;
  } }, "mailto:": { validate: function(t4, _2, e4) {
    const s4 = t4.slice(_2);
    return e4.re.mailto || (e4.re.mailto = new RegExp("^" + e4.re.src_email_name + "@" + e4.re.src_host_strict, "i")), e4.re.mailto.test(s4) ? s4.match(e4.re.mailto)[0].length : 0;
  } } };
  var l3 = "a[cdefgilmnoqrstuwxz]|b[abdefghijmnorstvwyz]|c[acdfghiklmnoruvwxyz]|d[ejkmoz]|e[cegrstu]|f[ijkmor]|g[abdefghilmnpqrstuwy]|h[kmnrtu]|i[delmnoqrst]|j[emop]|k[eghimnprwyz]|l[abcikrstuvy]|m[acdeghklmnopqrstuvwxyz]|n[acefgilopruz]|om|p[aefghklmnrstwy]|qa|r[eosuw]|s[abcdeghijklmnortuvxyz]|t[cdfghjklmnortvwz]|u[agksyz]|v[aceginu]|w[fs]|y[et]|z[amw]";
  var a3 = "biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|\u0440\u0444".split("|");
  function u4(r5) {
    const o6 = r5.re = function(r6) {
      const i6 = {};
      r6 = r6 || {}, i6.src_Any = u2.source, i6.src_Cc = D.source, i6.src_Z = A2.source, i6.src_P = E.source, i6.src_ZPCc = [i6.src_Z, i6.src_P, i6.src_Cc].join("|"), i6.src_ZCc = [i6.src_Z, i6.src_Cc].join("|");
      const c6 = "[><\uFF5C]";
      return i6.src_pseudo_letter = "(?:(?![><\uFF5C]|" + i6.src_ZPCc + ")" + i6.src_Any + ")", i6.src_ip4 = "(?:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)", i6.src_auth = "(?:(?:(?!" + i6.src_ZCc + "|[@/\\[\\]()]).)+@)?", i6.src_port = "(?::(?:6(?:[0-4]\\d{3}|5(?:[0-4]\\d{2}|5(?:[0-2]\\d|3[0-5])))|[1-5]?\\d{1,4}))?", i6.src_host_terminator = "(?=$|[><\uFF5C]|" + i6.src_ZPCc + ")(?!" + (r6["---"] ? "-(?!--)|" : "-|") + "_|:\\d|\\.-|\\.(?!$|" + i6.src_ZPCc + "))", i6.src_path = "(?:[/?#](?:(?!" + i6.src_ZCc + "|" + c6 + `|[()[\\]{}.,"'?!\\-;]).|\\[(?:(?!` + i6.src_ZCc + "|\\]).)*\\]|\\((?:(?!" + i6.src_ZCc + "|[)]).)*\\)|\\{(?:(?!" + i6.src_ZCc + '|[}]).)*\\}|\\"(?:(?!' + i6.src_ZCc + `|["]).)+\\"|\\'(?:(?!` + i6.src_ZCc + "|[']).)+\\'|\\'(?=" + i6.src_pseudo_letter + "|[-])|\\.{2,}[a-zA-Z0-9%/&]|\\.(?!" + i6.src_ZCc + "|[.]|$)|" + (r6["---"] ? "\\-(?!--(?:[^-]|$))(?:-*)|" : "\\-+|") + ",(?!" + i6.src_ZCc + "|$)|;(?!" + i6.src_ZCc + "|$)|\\!+(?!" + i6.src_ZCc + "|[!]|$)|\\?(?!" + i6.src_ZCc + "|[?]|$))+|\\/)?", i6.src_email_name = '[\\-;:&=\\+\\$,\\.a-zA-Z0-9_][\\-;:&=\\+\\$,\\"\\.a-zA-Z0-9_]*', i6.src_xn = "xn--[a-z0-9\\-]{1,59}", i6.src_domain_root = "(?:" + i6.src_xn + "|" + i6.src_pseudo_letter + "{1,63})", i6.src_domain = "(?:" + i6.src_xn + "|(?:" + i6.src_pseudo_letter + ")|(?:" + i6.src_pseudo_letter + "(?:-|" + i6.src_pseudo_letter + "){0,61}" + i6.src_pseudo_letter + "))", i6.src_host = "(?:(?:(?:(?:" + i6.src_domain + ")\\.)*" + i6.src_domain + "))", i6.tpl_host_fuzzy = "(?:" + i6.src_ip4 + "|(?:(?:(?:" + i6.src_domain + ")\\.)+(?:%TLDS%)))", i6.tpl_host_no_ip_fuzzy = "(?:(?:(?:" + i6.src_domain + ")\\.)+(?:%TLDS%))", i6.src_host_strict = i6.src_host + i6.src_host_terminator, i6.tpl_host_fuzzy_strict = i6.tpl_host_fuzzy + i6.src_host_terminator, i6.src_host_port_strict = i6.src_host + i6.src_port + i6.src_host_terminator, i6.tpl_host_port_fuzzy_strict = i6.tpl_host_fuzzy + i6.src_port + i6.src_host_terminator, i6.tpl_host_port_no_ip_fuzzy_strict = i6.tpl_host_no_ip_fuzzy + i6.src_port + i6.src_host_terminator, i6.tpl_host_fuzzy_test = "localhost|www\\.|\\.\\d{1,3}\\.|(?:\\.(?:%TLDS%)(?:" + i6.src_ZPCc + "|>|$))", i6.tpl_email_fuzzy = '(^|[><\uFF5C]|"|\\(|' + i6.src_ZCc + ")(" + i6.src_email_name + "@" + i6.tpl_host_fuzzy_strict + ")", i6.tpl_link_fuzzy = "(^|(?![.:/\\-_@])(?:[$+<=>^`|\uFF5C]|" + i6.src_ZPCc + "))((?![$+<=>^`|\uFF5C])" + i6.tpl_host_port_fuzzy_strict + i6.src_path + ")", i6.tpl_link_no_ip_fuzzy = "(^|(?![.:/\\-_@])(?:[$+<=>^`|\uFF5C]|" + i6.src_ZPCc + "))((?![$+<=>^`|\uFF5C])" + i6.tpl_host_port_no_ip_fuzzy_strict + i6.src_path + ")", i6;
    }(r5.__opts__), h8 = r5.__tlds__.slice();
    function a6(t4) {
      return t4.replace("%TLDS%", o6.src_tlds);
    }
    r5.onCompile(), r5.__tlds_replaced__ || h8.push(l3), h8.push(o6.src_xn), o6.src_tlds = h8.join("|"), o6.email_fuzzy = RegExp(a6(o6.tpl_email_fuzzy), "i"), o6.link_fuzzy = RegExp(a6(o6.tpl_link_fuzzy), "i"), o6.link_no_ip_fuzzy = RegExp(a6(o6.tpl_link_no_ip_fuzzy), "i"), o6.host_fuzzy_test = RegExp(a6(o6.tpl_host_fuzzy_test), "i");
    const u7 = [];
    function p6(t4, _2) {
      throw new Error('(LinkifyIt) Invalid schema "' + t4 + '": ' + _2);
    }
    r5.__compiled__ = {}, Object.keys(r5.__schemas__).forEach(function(t4) {
      const _2 = r5.__schemas__[t4];
      if (null === _2) return;
      const e4 = { validate: null, link: null };
      if (r5.__compiled__[t4] = e4, "[object Object]" === i3(_2)) return !function(t5) {
        return "[object RegExp]" === i3(t5);
      }(_2.validate) ? c3(_2.validate) ? e4.validate = _2.validate : p6(t4, _2) : e4.validate = /* @__PURE__ */ function(t5) {
        return function(_3, e5) {
          const s4 = _3.slice(e5);
          return t5.test(s4) ? s4.match(t5)[0].length : 0;
        };
      }(_2.validate), void (c3(_2.normalize) ? e4.normalize = _2.normalize : _2.normalize ? p6(t4, _2) : e4.normalize = function(t5, _3) {
        _3.normalize(t5);
      });
      !function(t5) {
        return "[object String]" === i3(t5);
      }(_2) ? p6(t4, _2) : u7.push(t4);
    }), u7.forEach(function(t4) {
      r5.__compiled__[r5.__schemas__[t4]] && (r5.__compiled__[t4].validate = r5.__compiled__[r5.__schemas__[t4]].validate, r5.__compiled__[t4].normalize = r5.__compiled__[r5.__schemas__[t4]].normalize);
    }), r5.__compiled__[""] = { validate: null, normalize: function(t4, _2) {
      _2.normalize(t4);
    } };
    const m5 = Object.keys(r5.__compiled__).filter(function(t4) {
      return t4.length > 0 && r5.__compiled__[t4];
    }).map(n3).join("|");
    r5.re.schema_test = RegExp("(^|(?!_)(?:[><\uFF5C]|" + o6.src_ZPCc + "))(" + m5 + ")", "i"), r5.re.schema_search = RegExp("(^|(?!_)(?:[><\uFF5C]|" + o6.src_ZPCc + "))(" + m5 + ")", "ig"), r5.re.schema_at_start = RegExp("^" + r5.re.schema_search.source, "i"), r5.re.pretest = RegExp("(" + r5.re.schema_test.source + ")|(" + r5.re.host_fuzzy_test.source + ")|@", "i"), function(t4) {
      t4.__index__ = -1, t4.__text_cache__ = "";
    }(r5);
  }
  function p3(t4, _2) {
    const e4 = t4.__index__, s4 = t4.__last_index__, r5 = t4.__text_cache__.slice(e4, s4);
    this.schema = t4.__schema__.toLowerCase(), this.index = e4 + _2, this.lastIndex = s4 + _2, this.raw = r5, this.text = r5, this.url = r5;
  }
  function m3(t4, _2) {
    const e4 = new p3(t4, _2);
    return t4.__compiled__[e4.schema].normalize(e4, t4), e4;
  }
  function d3(t4, _2) {
    if (!(this instanceof d3)) return new d3(t4, _2);
    var e4;
    _2 || (e4 = t4, Object.keys(e4 || {}).reduce(function(t5, _3) {
      return t5 || o3.hasOwnProperty(_3);
    }, false) && (_2 = t4, t4 = {})), this.__opts__ = r3({}, o3, _2), this.__index__ = -1, this.__last_index__ = -1, this.__schema__ = "", this.__text_cache__ = "", this.__schemas__ = r3({}, h5, t4), this.__compiled__ = {}, this.__tlds__ = a3, this.__tlds_replaced__ = false, this.re = {}, u4(this);
  }
  d3.prototype.add = function(t4, _2) {
    return this.__schemas__[t4] = _2, u4(this), this;
  }, d3.prototype.set = function(t4) {
    return this.__opts__ = r3(this.__opts__, t4), this;
  }, d3.prototype.test = function(t4) {
    if (this.__text_cache__ = t4, this.__index__ = -1, !t4.length) return false;
    let _2, e4, s4, r5, i6, c6, n5, o6, h8;
    if (this.re.schema_test.test(t4)) {
      for (n5 = this.re.schema_search, n5.lastIndex = 0; null !== (_2 = n5.exec(t4)); ) if (r5 = this.testSchemaAt(t4, _2[2], n5.lastIndex), r5) {
        this.__schema__ = _2[2], this.__index__ = _2.index + _2[1].length, this.__last_index__ = _2.index + _2[0].length + r5;
        break;
      }
    }
    return this.__opts__.fuzzyLink && this.__compiled__["http:"] && (o6 = t4.search(this.re.host_fuzzy_test), o6 >= 0 && (this.__index__ < 0 || o6 < this.__index__) && null !== (e4 = t4.match(this.__opts__.fuzzyIP ? this.re.link_fuzzy : this.re.link_no_ip_fuzzy)) && (i6 = e4.index + e4[1].length, (this.__index__ < 0 || i6 < this.__index__) && (this.__schema__ = "", this.__index__ = i6, this.__last_index__ = e4.index + e4[0].length))), this.__opts__.fuzzyEmail && this.__compiled__["mailto:"] && (h8 = t4.indexOf("@"), h8 >= 0 && null !== (s4 = t4.match(this.re.email_fuzzy)) && (i6 = s4.index + s4[1].length, c6 = s4.index + s4[0].length, (this.__index__ < 0 || i6 < this.__index__ || i6 === this.__index__ && c6 > this.__last_index__) && (this.__schema__ = "mailto:", this.__index__ = i6, this.__last_index__ = c6))), this.__index__ >= 0;
  }, d3.prototype.pretest = function(t4) {
    return this.re.pretest.test(t4);
  }, d3.prototype.testSchemaAt = function(t4, _2, e4) {
    return this.__compiled__[_2.toLowerCase()] ? this.__compiled__[_2.toLowerCase()].validate(t4, e4, this) : 0;
  }, d3.prototype.match = function(t4) {
    const _2 = [];
    let e4 = 0;
    this.__index__ >= 0 && this.__text_cache__ === t4 && (_2.push(m3(this, e4)), e4 = this.__last_index__);
    let s4 = e4 ? t4.slice(e4) : t4;
    for (; this.test(s4); ) _2.push(m3(this, e4)), s4 = s4.slice(this.__last_index__), e4 += this.__last_index__;
    return _2.length ? _2 : null;
  }, d3.prototype.matchAtStart = function(t4) {
    if (this.__text_cache__ = t4, this.__index__ = -1, !t4.length) return null;
    const _2 = this.re.schema_at_start.exec(t4);
    if (!_2) return null;
    const e4 = this.testSchemaAt(t4, _2[2], _2[0].length);
    return e4 ? (this.__schema__ = _2[2], this.__index__ = _2.index + _2[1].length, this.__last_index__ = _2.index + _2[0].length + e4, m3(this, 0)) : null;
  }, d3.prototype.tlds = function(t4, _2) {
    return t4 = Array.isArray(t4) ? t4 : [t4], _2 ? (this.__tlds__ = this.__tlds__.concat(t4).sort().filter(function(t5, _3, e4) {
      return t5 !== e4[_3 - 1];
    }).reverse(), u4(this), this) : (this.__tlds__ = t4.slice(), this.__tlds_replaced__ = true, u4(this), this);
  }, d3.prototype.normalize = function(t4) {
    t4.schema || (t4.url = "http://" + t4.url), "mailto:" !== t4.schema || /^mailto:/i.test(t4.url) || (t4.url = "mailto:" + t4.url);
  }, d3.prototype.onCompile = function() {
  };

  // scripts/markdown-it/punycode.js
  var t3 = 2147483647;
  var o4 = 36;
  var n4 = /^xn--/;
  var e3 = /[^\0-\x7F]/;
  var r4 = /[\x2E\u3002\uFF0E\uFF61]/g;
  var c4 = { overflow: "Overflow: input needs wider integers to process", "not-basic": "Illegal input >= 0x80 (not a basic code point)", "invalid-input": "Invalid input" };
  var s3 = Math.floor;
  var i4 = String.fromCharCode;
  function f3(t4) {
    throw new RangeError(c4[t4]);
  }
  function l4(t4, o6) {
    const n5 = t4.split("@");
    let e4 = "";
    n5.length > 1 && (e4 = n5[0] + "@", t4 = n5[1]);
    const c6 = function(t5, o7) {
      const n6 = [];
      let e5 = t5.length;
      for (; e5--; ) n6[e5] = o7(t5[e5]);
      return n6;
    }((t4 = t4.replace(r4, ".")).split("."), o6).join(".");
    return e4 + c6;
  }
  function u5(t4) {
    const o6 = [];
    let n5 = 0;
    const e4 = t4.length;
    for (; n5 < e4; ) {
      const r5 = t4.charCodeAt(n5++);
      if (r5 >= 55296 && r5 <= 56319 && n5 < e4) {
        const e5 = t4.charCodeAt(n5++);
        56320 == (64512 & e5) ? o6.push(((1023 & r5) << 10) + (1023 & e5) + 65536) : (o6.push(r5), n5--);
      } else o6.push(r5);
    }
    return o6;
  }
  var a4 = (t4) => String.fromCodePoint(...t4);
  var d4 = function(t4, o6) {
    return t4 + 22 + 75 * (t4 < 26) - ((0 != o6) << 5);
  };
  var h6 = function(t4, n5, e4) {
    let r5 = 0;
    for (t4 = e4 ? s3(t4 / 700) : t4 >> 1, t4 += s3(t4 / n5); t4 > 455; r5 += o4) t4 = s3(t4 / 35);
    return s3(r5 + 36 * t4 / (t4 + 38));
  };
  var p4 = function(n5) {
    const e4 = [], r5 = n5.length;
    let c6 = 0, i6 = 128, l6 = 72, u7 = n5.lastIndexOf("-");
    u7 < 0 && (u7 = 0);
    for (let t4 = 0; t4 < u7; ++t4) n5.charCodeAt(t4) >= 128 && f3("not-basic"), e4.push(n5.charCodeAt(t4));
    for (let d6 = u7 > 0 ? u7 + 1 : 0; d6 < r5; ) {
      const u8 = c6;
      for (let e5 = 1, i7 = o4; ; i7 += o4) {
        d6 >= r5 && f3("invalid-input");
        const u9 = (a6 = n5.charCodeAt(d6++)) >= 48 && a6 < 58 ? a6 - 48 + 26 : a6 >= 65 && a6 < 91 ? a6 - 65 : a6 >= 97 && a6 < 123 ? a6 - 97 : o4;
        u9 >= o4 && f3("invalid-input"), u9 > s3((t3 - c6) / e5) && f3("overflow"), c6 += u9 * e5;
        const h8 = i7 <= l6 ? 1 : i7 >= l6 + 26 ? 26 : i7 - l6;
        if (u9 < h8) break;
        const p7 = o4 - h8;
        e5 > s3(t3 / p7) && f3("overflow"), e5 *= p7;
      }
      const p6 = e4.length + 1;
      l6 = h6(c6 - u8, p6, 0 == u8), s3(c6 / p6) > t3 - i6 && f3("overflow"), i6 += s3(c6 / p6), c6 %= p6, e4.splice(c6++, 0, i6);
    }
    var a6;
    return String.fromCodePoint(...e4);
  };
  var g3 = function(n5) {
    const e4 = [], r5 = (n5 = u5(n5)).length;
    let c6 = 128, l6 = 0, a6 = 72;
    for (const t4 of n5) t4 < 128 && e4.push(i4(t4));
    const p6 = e4.length;
    let g5 = p6;
    for (p6 && e4.push("-"); g5 < r5; ) {
      let r6 = t3;
      for (const t4 of n5) t4 >= c6 && t4 < r6 && (r6 = t4);
      const u7 = g5 + 1;
      r6 - c6 > s3((t3 - l6) / u7) && f3("overflow"), l6 += (r6 - c6) * u7, c6 = r6;
      for (const r7 of n5) if (r7 < c6 && ++l6 > t3 && f3("overflow"), r7 === c6) {
        let t4 = l6;
        for (let n6 = o4; ; n6 += o4) {
          const r8 = n6 <= a6 ? 1 : n6 >= a6 + 26 ? 26 : n6 - a6;
          if (t4 < r8) break;
          const c7 = t4 - r8, f5 = o4 - r8;
          e4.push(i4(d4(r8 + c7 % f5, 0))), t4 = s3(c7 / f5);
        }
        e4.push(i4(d4(t4, 0))), a6 = h6(l6, u7, g5 === p6), l6 = 0, ++g5;
      }
      ++l6, ++c6;
    }
    return e4.join("");
  };
  var v = function(t4) {
    return l4(t4, function(t5) {
      return n4.test(t5) ? p4(t5.slice(4).toLowerCase()) : t5;
    });
  };
  var w2 = function(t4) {
    return l4(t4, function(t5) {
      return e3.test(t5) ? "xn--" + g3(t5) : t5;
    });
  };
  var C4 = { version: "2.3.1", ucs2: { decode: u5, encode: a4 }, decode: p4, encode: g3, toASCII: w2, toUnicode: v };

  // scripts/markdown-it/markdown-it.js
  function o5(t4) {
    return "[object String]" === function(t5) {
      return Object.prototype.toString.call(t5);
    }(t4);
  }
  var i5 = Object.prototype.hasOwnProperty;
  function c5(t4) {
    return Array.prototype.slice.call(arguments, 1).forEach(function(e4) {
      if (e4) {
        if ("object" != typeof e4) throw new TypeError(e4 + "must be object");
        Object.keys(e4).forEach(function(n5) {
          t4[n5] = e4[n5];
        });
      }
    }), t4;
  }
  function l5(t4, e4, n5) {
    return [].concat(t4.slice(0, e4), n5, t4.slice(e4 + 1));
  }
  function a5(t4) {
    return !(t4 >= 55296 && t4 <= 57343) && (!(t4 >= 64976 && t4 <= 65007) && (65535 != (65535 & t4) && 65534 != (65535 & t4) && (!(t4 >= 0 && t4 <= 8) && (11 !== t4 && (!(t4 >= 14 && t4 <= 31) && (!(t4 >= 127 && t4 <= 159) && !(t4 > 1114111)))))));
  }
  function h7(t4) {
    if (t4 > 65535) {
      const e4 = 55296 + ((t4 -= 65536) >> 10), n5 = 56320 + (1023 & t4);
      return String.fromCharCode(e4, n5);
    }
    return String.fromCharCode(t4);
  }
  var u6 = /\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g;
  var p5 = new RegExp(u6.source + "|" + /&([a-z#][a-z0-9]{1,31});/gi.source, "gi");
  var f4 = /^#((?:x[a-f0-9]{1,8}|[0-9]{1,8}))$/i;
  function d5(t4) {
    return t4.indexOf("\\") < 0 && t4.indexOf("&") < 0 ? t4 : t4.replace(p5, function(t5, e4, r5) {
      return e4 || function(t6, e5) {
        if (35 === e5.charCodeAt(0) && f4.test(e5)) {
          const n5 = "x" === e5[1].toLowerCase() ? parseInt(e5.slice(2), 16) : parseInt(e5.slice(1), 10);
          return a5(n5) ? h7(n5) : t6;
        }
        const r6 = h4(t6);
        return r6 !== t6 ? r6 : t6;
      }(t5, r5);
    });
  }
  var k = /[&<>"]/;
  var m4 = /[&<>"]/g;
  var g4 = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
  function b(t4) {
    return g4[t4];
  }
  function _(t4) {
    return k.test(t4) ? t4.replace(m4, b) : t4;
  }
  var C5 = /[.?*+^$[\]\\(){}|-]/g;
  function y(t4) {
    switch (t4) {
      case 9:
      case 32:
        return true;
    }
    return false;
  }
  function A4(t4) {
    if (t4 >= 8192 && t4 <= 8202) return true;
    switch (t4) {
      case 9:
      case 10:
      case 11:
      case 12:
      case 13:
      case 32:
      case 160:
      case 5760:
      case 8239:
      case 8287:
      case 12288:
        return true;
    }
    return false;
  }
  function x2(t4) {
    return E.test(t4) || C3.test(t4);
  }
  function M(t4) {
    switch (t4) {
      case 33:
      case 34:
      case 35:
      case 36:
      case 37:
      case 38:
      case 39:
      case 40:
      case 41:
      case 42:
      case 43:
      case 44:
      case 45:
      case 46:
      case 47:
      case 58:
      case 59:
      case 60:
      case 61:
      case 62:
      case 63:
      case 64:
      case 91:
      case 92:
      case 93:
      case 94:
      case 95:
      case 96:
      case 123:
      case 124:
      case 125:
      case 126:
        return true;
      default:
        return false;
    }
  }
  function v2(t4) {
    return t4 = t4.trim().replace(/\s+/g, " "), "\u1E7E" === "\u1E9E".toLowerCase() && (t4 = t4.replace(/ẞ/g, "\xDF")), t4.toLowerCase().toUpperCase();
  }
  var w3 = { mdurl: mdurl_exports, ucmicro: uc_micro_exports };
  var S2 = Object.freeze({ __proto__: null, lib: w3, assign: c5, isString: o5, has: function(t4, e4) {
    return i5.call(t4, e4);
  }, unescapeMd: function(t4) {
    return t4.indexOf("\\") < 0 ? t4 : t4.replace(u6, "$1");
  }, unescapeAll: d5, isValidEntityCode: a5, fromCodePoint: h7, escapeHtml: _, arrayReplaceAt: l5, isSpace: y, isWhiteSpace: A4, isMdAsciiPunct: M, isPunctChar: x2, escapeRE: function(t4) {
    return t4.replace(C5, "\\$&");
  }, normalizeReference: v2 });
  var I = Object.freeze({ __proto__: null, parseLinkLabel: function(t4, e4, n5) {
    let r5, s4, o6, i6;
    const c6 = t4.posMax, l6 = t4.pos;
    for (t4.pos = e4 + 1, r5 = 1; t4.pos < c6; ) {
      if (o6 = t4.src.charCodeAt(t4.pos), 93 === o6 && (r5--, 0 === r5)) {
        s4 = true;
        break;
      }
      if (i6 = t4.pos, t4.md.inline.skipToken(t4), 91 === o6) {
        if (i6 === t4.pos - 1) r5++;
        else if (n5) return t4.pos = l6, -1;
      }
    }
    let a6 = -1;
    return s4 && (a6 = t4.pos), t4.pos = l6, a6;
  }, parseLinkDestination: function(t4, e4, n5) {
    let r5, s4 = e4;
    const o6 = { ok: false, pos: 0, str: "" };
    if (60 === t4.charCodeAt(s4)) {
      for (s4++; s4 < n5; ) {
        if (r5 = t4.charCodeAt(s4), 10 === r5) return o6;
        if (60 === r5) return o6;
        if (62 === r5) return o6.pos = s4 + 1, o6.str = d5(t4.slice(e4 + 1, s4)), o6.ok = true, o6;
        92 === r5 && s4 + 1 < n5 ? s4 += 2 : s4++;
      }
      return o6;
    }
    let i6 = 0;
    for (; s4 < n5 && (r5 = t4.charCodeAt(s4), 32 !== r5) && !(r5 < 32 || 127 === r5); ) if (92 === r5 && s4 + 1 < n5) {
      if (32 === t4.charCodeAt(s4 + 1)) break;
      s4 += 2;
    } else {
      if (40 === r5 && (i6++, i6 > 32)) return o6;
      if (41 === r5) {
        if (0 === i6) break;
        i6--;
      }
      s4++;
    }
    return e4 === s4 || 0 !== i6 || (o6.str = d5(t4.slice(e4, s4)), o6.pos = s4, o6.ok = true), o6;
  }, parseLinkTitle: function(t4, e4, n5, r5) {
    let s4, o6 = e4;
    const i6 = { ok: false, can_continue: false, pos: 0, str: "", marker: 0 };
    if (r5) i6.str = r5.str, i6.marker = r5.marker;
    else {
      if (o6 >= n5) return i6;
      let r6 = t4.charCodeAt(o6);
      if (34 !== r6 && 39 !== r6 && 40 !== r6) return i6;
      e4++, o6++, 40 === r6 && (r6 = 41), i6.marker = r6;
    }
    for (; o6 < n5; ) {
      if (s4 = t4.charCodeAt(o6), s4 === i6.marker) return i6.pos = o6 + 1, i6.str += d5(t4.slice(e4, o6)), i6.ok = true, i6;
      if (40 === s4 && 41 === i6.marker) return i6;
      92 === s4 && o6 + 1 < n5 && o6++, o6++;
    }
    return i6.can_continue = true, i6.str += d5(t4.slice(e4, o6)), i6;
  } });
  var L2 = {};
  function z() {
    this.rules = c5({}, L2);
  }
  function T2() {
    this.__rules__ = [], this.__cache__ = null;
  }
  function E3(t4, e4, n5) {
    this.type = t4, this.tag = e4, this.attrs = null, this.map = null, this.nesting = n5, this.level = 0, this.children = null, this.content = "", this.markup = "", this.info = "", this.meta = null, this.block = false, this.hidden = false;
  }
  function $(t4, e4, n5) {
    this.src = t4, this.env = n5, this.tokens = [], this.inlineMode = false, this.md = e4;
  }
  L2.code_inline = function(t4, e4, n5, r5, s4) {
    const o6 = t4[e4];
    return "<code" + s4.renderAttrs(o6) + ">" + _(o6.content) + "</code>";
  }, L2.code_block = function(t4, e4, n5, r5, s4) {
    const o6 = t4[e4];
    return "<pre" + s4.renderAttrs(o6) + "><code>" + _(t4[e4].content) + "</code></pre>\n";
  }, L2.fence = function(t4, e4, n5, r5, s4) {
    const o6 = t4[e4], i6 = o6.info ? d5(o6.info).trim() : "";
    let c6, l6 = "", a6 = "";
    if (i6) {
      const t5 = i6.split(/(\s+)/g);
      l6 = t5[0], a6 = t5.slice(2).join("");
    }
    if (c6 = n5.highlight && n5.highlight(o6.content, l6, a6) || _(o6.content), 0 === c6.indexOf("<pre")) return c6 + "\n";
    if (i6) {
      const t5 = o6.attrIndex("class"), e5 = o6.attrs ? o6.attrs.slice() : [];
      t5 < 0 ? e5.push(["class", n5.langPrefix + l6]) : (e5[t5] = e5[t5].slice(), e5[t5][1] += " " + n5.langPrefix + l6);
      const r6 = { attrs: e5 };
      return `<pre><code${s4.renderAttrs(r6)}>${c6}</code></pre>
`;
    }
    return `<pre><code${s4.renderAttrs(o6)}>${c6}</code></pre>
`;
  }, L2.image = function(t4, e4, n5, r5, s4) {
    const o6 = t4[e4];
    return o6.attrs[o6.attrIndex("alt")][1] = s4.renderInlineAsText(o6.children, n5, r5), s4.renderToken(t4, e4, n5);
  }, L2.hardbreak = function(t4, e4, n5) {
    return n5.xhtmlOut ? "<br />\n" : "<br>\n";
  }, L2.softbreak = function(t4, e4, n5) {
    return n5.breaks ? n5.xhtmlOut ? "<br />\n" : "<br>\n" : "\n";
  }, L2.text = function(t4, e4) {
    return _(t4[e4].content);
  }, L2.html_block = function(t4, e4) {
    return t4[e4].content;
  }, L2.html_inline = function(t4, e4) {
    return t4[e4].content;
  }, z.prototype.renderAttrs = function(t4) {
    let e4, n5, r5;
    if (!t4.attrs) return "";
    for (r5 = "", e4 = 0, n5 = t4.attrs.length; e4 < n5; e4++) r5 += " " + _(t4.attrs[e4][0]) + '="' + _(t4.attrs[e4][1]) + '"';
    return r5;
  }, z.prototype.renderToken = function(t4, e4, n5) {
    const r5 = t4[e4];
    let s4 = "";
    if (r5.hidden) return "";
    r5.block && -1 !== r5.nesting && e4 && t4[e4 - 1].hidden && (s4 += "\n"), s4 += (-1 === r5.nesting ? "</" : "<") + r5.tag, s4 += this.renderAttrs(r5), 0 === r5.nesting && n5.xhtmlOut && (s4 += " /");
    let o6 = false;
    if (r5.block && (o6 = true, 1 === r5.nesting && e4 + 1 < t4.length)) {
      const n6 = t4[e4 + 1];
      ("inline" === n6.type || n6.hidden || -1 === n6.nesting && n6.tag === r5.tag) && (o6 = false);
    }
    return s4 += o6 ? ">\n" : ">", s4;
  }, z.prototype.renderInline = function(t4, e4, n5) {
    let r5 = "";
    const s4 = this.rules;
    for (let o6 = 0, i6 = t4.length; o6 < i6; o6++) {
      const i7 = t4[o6].type;
      void 0 !== s4[i7] ? r5 += s4[i7](t4, o6, e4, n5, this) : r5 += this.renderToken(t4, o6, e4);
    }
    return r5;
  }, z.prototype.renderInlineAsText = function(t4, e4, n5) {
    let r5 = "";
    for (let s4 = 0, o6 = t4.length; s4 < o6; s4++) switch (t4[s4].type) {
      case "text":
      case "html_inline":
      case "html_block":
        r5 += t4[s4].content;
        break;
      case "image":
        r5 += this.renderInlineAsText(t4[s4].children, e4, n5);
        break;
      case "softbreak":
      case "hardbreak":
        r5 += "\n";
    }
    return r5;
  }, z.prototype.render = function(t4, e4, n5) {
    let r5 = "";
    const s4 = this.rules;
    for (let o6 = 0, i6 = t4.length; o6 < i6; o6++) {
      const i7 = t4[o6].type;
      "inline" === i7 ? r5 += this.renderInline(t4[o6].children, e4, n5) : void 0 !== s4[i7] ? r5 += s4[i7](t4, o6, e4, n5, this) : r5 += this.renderToken(t4, o6, e4, n5);
    }
    return r5;
  }, T2.prototype.__find__ = function(t4) {
    for (let e4 = 0; e4 < this.__rules__.length; e4++) if (this.__rules__[e4].name === t4) return e4;
    return -1;
  }, T2.prototype.__compile__ = function() {
    const t4 = this, e4 = [""];
    t4.__rules__.forEach(function(t5) {
      t5.enabled && t5.alt.forEach(function(t6) {
        e4.indexOf(t6) < 0 && e4.push(t6);
      });
    }), t4.__cache__ = {}, e4.forEach(function(e5) {
      t4.__cache__[e5] = [], t4.__rules__.forEach(function(n5) {
        n5.enabled && (e5 && n5.alt.indexOf(e5) < 0 || t4.__cache__[e5].push(n5.fn));
      });
    });
  }, T2.prototype.at = function(t4, e4, n5) {
    const r5 = this.__find__(t4), s4 = n5 || {};
    if (-1 === r5) throw new Error("Parser rule not found: " + t4);
    this.__rules__[r5].fn = e4, this.__rules__[r5].alt = s4.alt || [], this.__cache__ = null;
  }, T2.prototype.before = function(t4, e4, n5, r5) {
    const s4 = this.__find__(t4), o6 = r5 || {};
    if (-1 === s4) throw new Error("Parser rule not found: " + t4);
    this.__rules__.splice(s4, 0, { name: e4, enabled: true, fn: n5, alt: o6.alt || [] }), this.__cache__ = null;
  }, T2.prototype.after = function(t4, e4, n5, r5) {
    const s4 = this.__find__(t4), o6 = r5 || {};
    if (-1 === s4) throw new Error("Parser rule not found: " + t4);
    this.__rules__.splice(s4 + 1, 0, { name: e4, enabled: true, fn: n5, alt: o6.alt || [] }), this.__cache__ = null;
  }, T2.prototype.push = function(t4, e4, n5) {
    const r5 = n5 || {};
    this.__rules__.push({ name: t4, enabled: true, fn: e4, alt: r5.alt || [] }), this.__cache__ = null;
  }, T2.prototype.enable = function(t4, e4) {
    Array.isArray(t4) || (t4 = [t4]);
    const n5 = [];
    return t4.forEach(function(t5) {
      const r5 = this.__find__(t5);
      if (r5 < 0) {
        if (e4) return;
        throw new Error("Rules manager: invalid rule name " + t5);
      }
      this.__rules__[r5].enabled = true, n5.push(t5);
    }, this), this.__cache__ = null, n5;
  }, T2.prototype.enableOnly = function(t4, e4) {
    Array.isArray(t4) || (t4 = [t4]), this.__rules__.forEach(function(t5) {
      t5.enabled = false;
    }), this.enable(t4, e4);
  }, T2.prototype.disable = function(t4, e4) {
    Array.isArray(t4) || (t4 = [t4]);
    const n5 = [];
    return t4.forEach(function(t5) {
      const r5 = this.__find__(t5);
      if (r5 < 0) {
        if (e4) return;
        throw new Error("Rules manager: invalid rule name " + t5);
      }
      this.__rules__[r5].enabled = false, n5.push(t5);
    }, this), this.__cache__ = null, n5;
  }, T2.prototype.getRules = function(t4) {
    return null === this.__cache__ && this.__compile__(), this.__cache__[t4] || [];
  }, E3.prototype.attrIndex = function(t4) {
    if (!this.attrs) return -1;
    const e4 = this.attrs;
    for (let n5 = 0, r5 = e4.length; n5 < r5; n5++) if (e4[n5][0] === t4) return n5;
    return -1;
  }, E3.prototype.attrPush = function(t4) {
    this.attrs ? this.attrs.push(t4) : this.attrs = [t4];
  }, E3.prototype.attrSet = function(t4, e4) {
    const n5 = this.attrIndex(t4), r5 = [t4, e4];
    n5 < 0 ? this.attrPush(r5) : this.attrs[n5] = r5;
  }, E3.prototype.attrGet = function(t4) {
    const e4 = this.attrIndex(t4);
    let n5 = null;
    return e4 >= 0 && (n5 = this.attrs[e4][1]), n5;
  }, E3.prototype.attrJoin = function(t4, e4) {
    const n5 = this.attrIndex(t4);
    n5 < 0 ? this.attrPush([t4, e4]) : this.attrs[n5][1] = this.attrs[n5][1] + " " + e4;
  }, $.prototype.Token = E3;
  var O = /\r\n?|\n/g;
  var q = /\0/g;
  function P(t4) {
    return /^<\/a\s*>/i.test(t4);
  }
  var j = /\+-|\.\.|\?\?\?\?|!!!!|,,|--/;
  var R = /\((c|tm|r)\)/i;
  var Z = /\((c|tm|r)\)/gi;
  var D2 = { c: "\xA9", r: "\xAE", tm: "\u2122" };
  function N2(t4, e4) {
    return D2[e4.toLowerCase()];
  }
  function B3(t4) {
    let e4 = 0;
    for (let n5 = t4.length - 1; n5 >= 0; n5--) {
      const r5 = t4[n5];
      "text" !== r5.type || e4 || (r5.content = r5.content.replace(Z, N2)), "link_open" === r5.type && "auto" === r5.info && e4--, "link_close" === r5.type && "auto" === r5.info && e4++;
    }
  }
  function W(t4) {
    let e4 = 0;
    for (let n5 = t4.length - 1; n5 >= 0; n5--) {
      const r5 = t4[n5];
      "text" !== r5.type || e4 || j.test(r5.content) && (r5.content = r5.content.replace(/\+-/g, "\xB1").replace(/\.{2,}/g, "\u2026").replace(/([?!])…/g, "$1..").replace(/([?!]){4,}/g, "$1$1$1").replace(/,{2,}/g, ",").replace(/(^|[^-])---(?=[^-]|$)/gm, "$1\u2014").replace(/(^|\s)--(?=\s|$)/gm, "$1\u2013").replace(/(^|[^-\s])--(?=[^-\s]|$)/gm, "$1\u2013")), "link_open" === r5.type && "auto" === r5.info && e4--, "link_close" === r5.type && "auto" === r5.info && e4++;
    }
  }
  var F2 = /['"]/;
  var U = /['"]/g;
  var G = "\u2019";
  function H(t4, e4, n5) {
    return t4.slice(0, e4) + n5 + t4.slice(e4 + 1);
  }
  function J(t4, e4) {
    let n5;
    const r5 = [];
    for (let s4 = 0; s4 < t4.length; s4++) {
      const o6 = t4[s4], i6 = t4[s4].level;
      for (n5 = r5.length - 1; n5 >= 0 && !(r5[n5].level <= i6); n5--) ;
      if (r5.length = n5 + 1, "text" !== o6.type) continue;
      let c6 = o6.content, l6 = 0, a6 = c6.length;
      t: for (; l6 < a6; ) {
        U.lastIndex = l6;
        const h8 = U.exec(c6);
        if (!h8) break;
        let u7 = true, p6 = true;
        l6 = h8.index + 1;
        const f5 = "'" === h8[0];
        let d6 = 32;
        if (h8.index - 1 >= 0) d6 = c6.charCodeAt(h8.index - 1);
        else for (n5 = s4 - 1; n5 >= 0 && ("softbreak" !== t4[n5].type && "hardbreak" !== t4[n5].type); n5--) if (t4[n5].content) {
          d6 = t4[n5].content.charCodeAt(t4[n5].content.length - 1);
          break;
        }
        let k2 = 32;
        if (l6 < a6) k2 = c6.charCodeAt(l6);
        else for (n5 = s4 + 1; n5 < t4.length && ("softbreak" !== t4[n5].type && "hardbreak" !== t4[n5].type); n5++) if (t4[n5].content) {
          k2 = t4[n5].content.charCodeAt(0);
          break;
        }
        const m5 = M(d6) || x2(String.fromCharCode(d6)), g5 = M(k2) || x2(String.fromCharCode(k2)), b2 = A4(d6), _2 = A4(k2);
        if (_2 ? u7 = false : g5 && (b2 || m5 || (u7 = false)), b2 ? p6 = false : m5 && (_2 || g5 || (p6 = false)), 34 === k2 && '"' === h8[0] && d6 >= 48 && d6 <= 57 && (p6 = u7 = false), u7 && p6 && (u7 = m5, p6 = g5), u7 || p6) {
          if (p6) for (n5 = r5.length - 1; n5 >= 0; n5--) {
            let u8 = r5[n5];
            if (r5[n5].level < i6) break;
            if (u8.single === f5 && r5[n5].level === i6) {
              let i7, p7;
              u8 = r5[n5], f5 ? (i7 = e4.md.options.quotes[2], p7 = e4.md.options.quotes[3]) : (i7 = e4.md.options.quotes[0], p7 = e4.md.options.quotes[1]), o6.content = H(o6.content, h8.index, p7), t4[u8.token].content = H(t4[u8.token].content, u8.pos, i7), l6 += p7.length - 1, u8.token === s4 && (l6 += i7.length - 1), c6 = o6.content, a6 = c6.length, r5.length = n5;
              continue t;
            }
          }
          u7 ? r5.push({ token: s4, pos: h8.index, single: f5, level: i6 }) : p6 && f5 && (o6.content = H(o6.content, h8.index, G));
        } else f5 && (o6.content = H(o6.content, h8.index, G));
      }
    }
  }
  var V2 = [["normalize", function(t4) {
    let e4;
    e4 = t4.src.replace(O, "\n"), e4 = e4.replace(q, "\uFFFD"), t4.src = e4;
  }], ["block", function(t4) {
    let e4;
    t4.inlineMode ? (e4 = new t4.Token("inline", "", 0), e4.content = t4.src, e4.map = [0, 1], e4.children = [], t4.tokens.push(e4)) : t4.md.block.parse(t4.src, t4.md, t4.env, t4.tokens);
  }], ["inline", function(t4) {
    const e4 = t4.tokens;
    for (let n5 = 0, r5 = e4.length; n5 < r5; n5++) {
      const r6 = e4[n5];
      "inline" === r6.type && t4.md.inline.parse(r6.content, t4.md, t4.env, r6.children);
    }
  }], ["linkify", function(t4) {
    const e4 = t4.tokens;
    var n5;
    if (t4.md.options.linkify) for (let r5 = 0, s4 = e4.length; r5 < s4; r5++) {
      if ("inline" !== e4[r5].type || !t4.md.linkify.pretest(e4[r5].content)) continue;
      let s5 = e4[r5].children, o6 = 0;
      for (let i6 = s5.length - 1; i6 >= 0; i6--) {
        const c6 = s5[i6];
        if ("link_close" !== c6.type) {
          if ("html_inline" === c6.type && (n5 = c6.content, /^<a[>\s]/i.test(n5) && o6 > 0 && o6--, P(c6.content) && o6++), !(o6 > 0) && "text" === c6.type && t4.md.linkify.test(c6.content)) {
            const n6 = c6.content;
            let o7 = t4.md.linkify.match(n6);
            const a6 = [];
            let h8 = c6.level, u7 = 0;
            o7.length > 0 && 0 === o7[0].index && i6 > 0 && "text_special" === s5[i6 - 1].type && (o7 = o7.slice(1));
            for (let e5 = 0; e5 < o7.length; e5++) {
              const r6 = o7[e5].url, s6 = t4.md.normalizeLink(r6);
              if (!t4.md.validateLink(s6)) continue;
              let i7 = o7[e5].text;
              i7 = o7[e5].schema ? "mailto:" !== o7[e5].schema || /^mailto:/i.test(i7) ? t4.md.normalizeLinkText(i7) : t4.md.normalizeLinkText("mailto:" + i7).replace(/^mailto:/, "") : t4.md.normalizeLinkText("http://" + i7).replace(/^http:\/\//, "");
              const c7 = o7[e5].index;
              if (c7 > u7) {
                const e6 = new t4.Token("text", "", 0);
                e6.content = n6.slice(u7, c7), e6.level = h8, a6.push(e6);
              }
              const l6 = new t4.Token("link_open", "a", 1);
              l6.attrs = [["href", s6]], l6.level = h8++, l6.markup = "linkify", l6.info = "auto", a6.push(l6);
              const p6 = new t4.Token("text", "", 0);
              p6.content = i7, p6.level = h8, a6.push(p6);
              const f5 = new t4.Token("link_close", "a", -1);
              f5.level = --h8, f5.markup = "linkify", f5.info = "auto", a6.push(f5), u7 = o7[e5].lastIndex;
            }
            if (u7 < n6.length) {
              const e5 = new t4.Token("text", "", 0);
              e5.content = n6.slice(u7), e5.level = h8, a6.push(e5);
            }
            e4[r5].children = s5 = l5(s5, i6, a6);
          }
        } else for (i6--; s5[i6].level !== c6.level && "link_open" !== s5[i6].type; ) i6--;
      }
    }
  }], ["replacements", function(t4) {
    let e4;
    if (t4.md.options.typographer) for (e4 = t4.tokens.length - 1; e4 >= 0; e4--) "inline" === t4.tokens[e4].type && (R.test(t4.tokens[e4].content) && B3(t4.tokens[e4].children), j.test(t4.tokens[e4].content) && W(t4.tokens[e4].children));
  }], ["smartquotes", function(t4) {
    if (t4.md.options.typographer) for (let e4 = t4.tokens.length - 1; e4 >= 0; e4--) "inline" === t4.tokens[e4].type && F2.test(t4.tokens[e4].content) && J(t4.tokens[e4].children, t4);
  }], ["text_join", function(t4) {
    let e4, n5;
    const r5 = t4.tokens, s4 = r5.length;
    for (let t5 = 0; t5 < s4; t5++) {
      if ("inline" !== r5[t5].type) continue;
      const s5 = r5[t5].children, o6 = s5.length;
      for (e4 = 0; e4 < o6; e4++) "text_special" === s5[e4].type && (s5[e4].type = "text");
      for (e4 = n5 = 0; e4 < o6; e4++) "text" === s5[e4].type && e4 + 1 < o6 && "text" === s5[e4 + 1].type ? s5[e4 + 1].content = s5[e4].content + s5[e4 + 1].content : (e4 !== n5 && (s5[n5] = s5[e4]), n5++);
      e4 !== n5 && (s5.length = n5);
    }
  }]];
  function K() {
    this.ruler = new T2();
    for (let t4 = 0; t4 < V2.length; t4++) this.ruler.push(V2[t4][0], V2[t4][1]);
  }
  function Q(t4, e4, n5, r5) {
    this.src = t4, this.md = e4, this.env = n5, this.tokens = r5, this.bMarks = [], this.eMarks = [], this.tShift = [], this.sCount = [], this.bsCount = [], this.blkIndent = 0, this.line = 0, this.lineMax = 0, this.tight = false, this.ddIndent = -1, this.listIndent = -1, this.parentType = "root", this.level = 0;
    const s4 = this.src;
    for (let t5 = 0, e5 = 0, n6 = 0, r6 = 0, o6 = s4.length, i6 = false; e5 < o6; e5++) {
      const c6 = s4.charCodeAt(e5);
      if (!i6) {
        if (y(c6)) {
          n6++, 9 === c6 ? r6 += 4 - r6 % 4 : r6++;
          continue;
        }
        i6 = true;
      }
      10 !== c6 && e5 !== o6 - 1 || (10 !== c6 && e5++, this.bMarks.push(t5), this.eMarks.push(e5), this.tShift.push(n6), this.sCount.push(r6), this.bsCount.push(0), i6 = false, n6 = 0, r6 = 0, t5 = e5 + 1);
    }
    this.bMarks.push(s4.length), this.eMarks.push(s4.length), this.tShift.push(0), this.sCount.push(0), this.bsCount.push(0), this.lineMax = this.bMarks.length - 1;
  }
  K.prototype.process = function(t4) {
    const e4 = this.ruler.getRules("");
    for (let n5 = 0, r5 = e4.length; n5 < r5; n5++) e4[n5](t4);
  }, K.prototype.State = $, Q.prototype.push = function(t4, e4, n5) {
    const r5 = new E3(t4, e4, n5);
    return r5.block = true, n5 < 0 && this.level--, r5.level = this.level, n5 > 0 && this.level++, this.tokens.push(r5), r5;
  }, Q.prototype.isEmpty = function(t4) {
    return this.bMarks[t4] + this.tShift[t4] >= this.eMarks[t4];
  }, Q.prototype.skipEmptyLines = function(t4) {
    for (let e4 = this.lineMax; t4 < e4 && !(this.bMarks[t4] + this.tShift[t4] < this.eMarks[t4]); t4++) ;
    return t4;
  }, Q.prototype.skipSpaces = function(t4) {
    for (let e4 = this.src.length; t4 < e4; t4++) {
      if (!y(this.src.charCodeAt(t4))) break;
    }
    return t4;
  }, Q.prototype.skipSpacesBack = function(t4, e4) {
    if (t4 <= e4) return t4;
    for (; t4 > e4; ) if (!y(this.src.charCodeAt(--t4))) return t4 + 1;
    return t4;
  }, Q.prototype.skipChars = function(t4, e4) {
    for (let n5 = this.src.length; t4 < n5 && this.src.charCodeAt(t4) === e4; t4++) ;
    return t4;
  }, Q.prototype.skipCharsBack = function(t4, e4, n5) {
    if (t4 <= n5) return t4;
    for (; t4 > n5; ) if (e4 !== this.src.charCodeAt(--t4)) return t4 + 1;
    return t4;
  }, Q.prototype.getLines = function(t4, e4, n5, r5) {
    if (t4 >= e4) return "";
    const s4 = new Array(e4 - t4);
    for (let o6 = 0, i6 = t4; i6 < e4; i6++, o6++) {
      let t5 = 0;
      const c6 = this.bMarks[i6];
      let l6, a6 = c6;
      for (l6 = i6 + 1 < e4 || r5 ? this.eMarks[i6] + 1 : this.eMarks[i6]; a6 < l6 && t5 < n5; ) {
        const e5 = this.src.charCodeAt(a6);
        if (y(e5)) 9 === e5 ? t5 += 4 - (t5 + this.bsCount[i6]) % 4 : t5++;
        else {
          if (!(a6 - c6 < this.tShift[i6])) break;
          t5++;
        }
        a6++;
      }
      s4[o6] = t5 > n5 ? new Array(t5 - n5 + 1).join(" ") + this.src.slice(a6, l6) : this.src.slice(a6, l6);
    }
    return s4.join("");
  }, Q.prototype.Token = E3;
  function X(t4, e4) {
    const n5 = t4.bMarks[e4] + t4.tShift[e4], r5 = t4.eMarks[e4];
    return t4.src.slice(n5, r5);
  }
  function Y(t4) {
    const e4 = [], n5 = t4.length;
    let r5 = 0, s4 = t4.charCodeAt(r5), o6 = false, i6 = 0, c6 = "";
    for (; r5 < n5; ) 124 === s4 && (o6 ? (c6 += t4.substring(i6, r5 - 1), i6 = r5) : (e4.push(c6 + t4.substring(i6, r5)), c6 = "", i6 = r5 + 1)), o6 = 92 === s4, r5++, s4 = t4.charCodeAt(r5);
    return e4.push(c6 + t4.substring(i6)), e4;
  }
  function tt(t4, e4) {
    const n5 = t4.eMarks[e4];
    let r5 = t4.bMarks[e4] + t4.tShift[e4];
    const s4 = t4.src.charCodeAt(r5++);
    if (42 !== s4 && 45 !== s4 && 43 !== s4) return -1;
    if (r5 < n5) {
      if (!y(t4.src.charCodeAt(r5))) return -1;
    }
    return r5;
  }
  function et(t4, e4) {
    const n5 = t4.bMarks[e4] + t4.tShift[e4], r5 = t4.eMarks[e4];
    let s4 = n5;
    if (s4 + 1 >= r5) return -1;
    let o6 = t4.src.charCodeAt(s4++);
    if (o6 < 48 || o6 > 57) return -1;
    for (; ; ) {
      if (s4 >= r5) return -1;
      if (o6 = t4.src.charCodeAt(s4++), !(o6 >= 48 && o6 <= 57)) {
        if (41 === o6 || 46 === o6) break;
        return -1;
      }
      if (s4 - n5 >= 10) return -1;
    }
    return s4 < r5 && (o6 = t4.src.charCodeAt(s4), !y(o6)) ? -1 : s4;
  }
  var nt = `<[A-Za-z][A-Za-z0-9\\-]*(?:\\s+[a-zA-Z_:][a-zA-Z0-9:._-]*(?:\\s*=\\s*(?:[^"'=<>\`\\x00-\\x20]+|'[^']*'|"[^"]*"))?)*\\s*\\/?>`;
  var rt = "<\\/[A-Za-z][A-Za-z0-9\\-]*\\s*>";
  var st = new RegExp("^(?:" + nt + "|" + rt + "|<!---?>|<!--(?:[^-]|-[^-]|--[^>])*-->|<[?][\\s\\S]*?[?]>|<![A-Za-z][^>]*>|<!\\[CDATA\\[[\\s\\S]*?\\]\\]>)");
  var ot = new RegExp("^(?:" + nt + "|" + rt + ")");
  var it = [[/^<(script|pre|style|textarea)(?=(\s|>|$))/i, /<\/(script|pre|style|textarea)>/i, true], [/^<!--/, /-->/, true], [/^<\?/, /\?>/, true], [/^<![A-Z]/, />/, true], [/^<!\[CDATA\[/, /\]\]>/, true], [new RegExp("^</?(" + ["address", "article", "aside", "base", "basefont", "blockquote", "body", "caption", "center", "col", "colgroup", "dd", "details", "dialog", "dir", "div", "dl", "dt", "fieldset", "figcaption", "figure", "footer", "form", "frame", "frameset", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hr", "html", "iframe", "legend", "li", "link", "main", "menu", "menuitem", "nav", "noframes", "ol", "optgroup", "option", "p", "param", "search", "section", "summary", "table", "tbody", "td", "tfoot", "th", "thead", "title", "tr", "track", "ul"].join("|") + ")(?=(\\s|/?>|$))", "i"), /^$/, true], [new RegExp(ot.source + "\\s*$"), /^$/, false]];
  var ct = [["table", function(t4, e4, n5, r5) {
    if (e4 + 2 > n5) return false;
    let s4 = e4 + 1;
    if (t4.sCount[s4] < t4.blkIndent) return false;
    if (t4.sCount[s4] - t4.blkIndent >= 4) return false;
    let o6 = t4.bMarks[s4] + t4.tShift[s4];
    if (o6 >= t4.eMarks[s4]) return false;
    const i6 = t4.src.charCodeAt(o6++);
    if (124 !== i6 && 45 !== i6 && 58 !== i6) return false;
    if (o6 >= t4.eMarks[s4]) return false;
    const c6 = t4.src.charCodeAt(o6++);
    if (124 !== c6 && 45 !== c6 && 58 !== c6 && !y(c6)) return false;
    if (45 === i6 && y(c6)) return false;
    for (; o6 < t4.eMarks[s4]; ) {
      const e5 = t4.src.charCodeAt(o6);
      if (124 !== e5 && 45 !== e5 && 58 !== e5 && !y(e5)) return false;
      o6++;
    }
    let l6 = X(t4, e4 + 1), a6 = l6.split("|");
    const h8 = [];
    for (let t5 = 0; t5 < a6.length; t5++) {
      const e5 = a6[t5].trim();
      if (!e5) {
        if (0 === t5 || t5 === a6.length - 1) continue;
        return false;
      }
      if (!/^:?-+:?$/.test(e5)) return false;
      58 === e5.charCodeAt(e5.length - 1) ? h8.push(58 === e5.charCodeAt(0) ? "center" : "right") : 58 === e5.charCodeAt(0) ? h8.push("left") : h8.push("");
    }
    if (l6 = X(t4, e4).trim(), -1 === l6.indexOf("|")) return false;
    if (t4.sCount[e4] - t4.blkIndent >= 4) return false;
    a6 = Y(l6), a6.length && "" === a6[0] && a6.shift(), a6.length && "" === a6[a6.length - 1] && a6.pop();
    const u7 = a6.length;
    if (0 === u7 || u7 !== h8.length) return false;
    if (r5) return true;
    const p6 = t4.parentType;
    t4.parentType = "table";
    const f5 = t4.md.block.ruler.getRules("blockquote"), d6 = [e4, 0];
    t4.push("table_open", "table", 1).map = d6, t4.push("thead_open", "thead", 1).map = [e4, e4 + 1], t4.push("tr_open", "tr", 1).map = [e4, e4 + 1];
    for (let e5 = 0; e5 < a6.length; e5++) {
      const n6 = t4.push("th_open", "th", 1);
      h8[e5] && (n6.attrs = [["style", "text-align:" + h8[e5]]]);
      const r6 = t4.push("inline", "", 0);
      r6.content = a6[e5].trim(), r6.children = [], t4.push("th_close", "th", -1);
    }
    let k2;
    t4.push("tr_close", "tr", -1), t4.push("thead_close", "thead", -1);
    let m5 = 0;
    for (s4 = e4 + 2; s4 < n5 && !(t4.sCount[s4] < t4.blkIndent); s4++) {
      let r6 = false;
      for (let e5 = 0, o7 = f5.length; e5 < o7; e5++) if (f5[e5](t4, s4, n5, true)) {
        r6 = true;
        break;
      }
      if (r6) break;
      if (l6 = X(t4, s4).trim(), !l6) break;
      if (t4.sCount[s4] - t4.blkIndent >= 4) break;
      if (a6 = Y(l6), a6.length && "" === a6[0] && a6.shift(), a6.length && "" === a6[a6.length - 1] && a6.pop(), m5 += u7 - a6.length, m5 > 65536) break;
      if (s4 === e4 + 2) {
        t4.push("tbody_open", "tbody", 1).map = k2 = [e4 + 2, 0];
      }
      t4.push("tr_open", "tr", 1).map = [s4, s4 + 1];
      for (let e5 = 0; e5 < u7; e5++) {
        const n6 = t4.push("td_open", "td", 1);
        h8[e5] && (n6.attrs = [["style", "text-align:" + h8[e5]]]);
        const r7 = t4.push("inline", "", 0);
        r7.content = a6[e5] ? a6[e5].trim() : "", r7.children = [], t4.push("td_close", "td", -1);
      }
      t4.push("tr_close", "tr", -1);
    }
    return k2 && (t4.push("tbody_close", "tbody", -1), k2[1] = s4), t4.push("table_close", "table", -1), d6[1] = s4, t4.parentType = p6, t4.line = s4, true;
  }, ["paragraph", "reference"]], ["code", function(t4, e4, n5) {
    if (t4.sCount[e4] - t4.blkIndent < 4) return false;
    let r5 = e4 + 1, s4 = r5;
    for (; r5 < n5; ) if (t4.isEmpty(r5)) r5++;
    else {
      if (!(t4.sCount[r5] - t4.blkIndent >= 4)) break;
      r5++, s4 = r5;
    }
    t4.line = s4;
    const o6 = t4.push("code_block", "code", 0);
    return o6.content = t4.getLines(e4, s4, 4 + t4.blkIndent, false) + "\n", o6.map = [e4, t4.line], true;
  }], ["fence", function(t4, e4, n5, r5) {
    let s4 = t4.bMarks[e4] + t4.tShift[e4], o6 = t4.eMarks[e4];
    if (t4.sCount[e4] - t4.blkIndent >= 4) return false;
    if (s4 + 3 > o6) return false;
    const i6 = t4.src.charCodeAt(s4);
    if (126 !== i6 && 96 !== i6) return false;
    let c6 = s4;
    s4 = t4.skipChars(s4, i6);
    let l6 = s4 - c6;
    if (l6 < 3) return false;
    const a6 = t4.src.slice(c6, s4), h8 = t4.src.slice(s4, o6);
    if (96 === i6 && h8.indexOf(String.fromCharCode(i6)) >= 0) return false;
    if (r5) return true;
    let u7 = e4, p6 = false;
    for (; (u7++, !(u7 >= n5)) && (s4 = c6 = t4.bMarks[u7] + t4.tShift[u7], o6 = t4.eMarks[u7], !(s4 < o6 && t4.sCount[u7] < t4.blkIndent)); ) if (t4.src.charCodeAt(s4) === i6 && !(t4.sCount[u7] - t4.blkIndent >= 4 || (s4 = t4.skipChars(s4, i6), s4 - c6 < l6 || (s4 = t4.skipSpaces(s4), s4 < o6)))) {
      p6 = true;
      break;
    }
    l6 = t4.sCount[e4], t4.line = u7 + (p6 ? 1 : 0);
    const f5 = t4.push("fence", "code", 0);
    return f5.info = h8, f5.content = t4.getLines(e4 + 1, u7, l6, true), f5.markup = a6, f5.map = [e4, t4.line], true;
  }, ["paragraph", "reference", "blockquote", "list"]], ["blockquote", function(t4, e4, n5, r5) {
    let s4 = t4.bMarks[e4] + t4.tShift[e4], o6 = t4.eMarks[e4];
    const i6 = t4.lineMax;
    if (t4.sCount[e4] - t4.blkIndent >= 4) return false;
    if (62 !== t4.src.charCodeAt(s4)) return false;
    if (r5) return true;
    const c6 = [], l6 = [], a6 = [], h8 = [], u7 = t4.md.block.ruler.getRules("blockquote"), p6 = t4.parentType;
    t4.parentType = "blockquote";
    let f5, d6 = false;
    for (f5 = e4; f5 < n5; f5++) {
      const e5 = t4.sCount[f5] < t4.blkIndent;
      if (s4 = t4.bMarks[f5] + t4.tShift[f5], o6 = t4.eMarks[f5], s4 >= o6) break;
      if (62 === t4.src.charCodeAt(s4++) && !e5) {
        let e6, n6, r7 = t4.sCount[f5] + 1;
        32 === t4.src.charCodeAt(s4) ? (s4++, r7++, n6 = false, e6 = true) : 9 === t4.src.charCodeAt(s4) ? (e6 = true, (t4.bsCount[f5] + r7) % 4 == 3 ? (s4++, r7++, n6 = false) : n6 = true) : e6 = false;
        let i7 = r7;
        for (c6.push(t4.bMarks[f5]), t4.bMarks[f5] = s4; s4 < o6; ) {
          const e7 = t4.src.charCodeAt(s4);
          if (!y(e7)) break;
          9 === e7 ? i7 += 4 - (i7 + t4.bsCount[f5] + (n6 ? 1 : 0)) % 4 : i7++, s4++;
        }
        d6 = s4 >= o6, l6.push(t4.bsCount[f5]), t4.bsCount[f5] = t4.sCount[f5] + 1 + (e6 ? 1 : 0), a6.push(t4.sCount[f5]), t4.sCount[f5] = i7 - r7, h8.push(t4.tShift[f5]), t4.tShift[f5] = s4 - t4.bMarks[f5];
        continue;
      }
      if (d6) break;
      let r6 = false;
      for (let e6 = 0, s5 = u7.length; e6 < s5; e6++) if (u7[e6](t4, f5, n5, true)) {
        r6 = true;
        break;
      }
      if (r6) {
        t4.lineMax = f5, 0 !== t4.blkIndent && (c6.push(t4.bMarks[f5]), l6.push(t4.bsCount[f5]), h8.push(t4.tShift[f5]), a6.push(t4.sCount[f5]), t4.sCount[f5] -= t4.blkIndent);
        break;
      }
      c6.push(t4.bMarks[f5]), l6.push(t4.bsCount[f5]), h8.push(t4.tShift[f5]), a6.push(t4.sCount[f5]), t4.sCount[f5] = -1;
    }
    const k2 = t4.blkIndent;
    t4.blkIndent = 0;
    const m5 = t4.push("blockquote_open", "blockquote", 1);
    m5.markup = ">";
    const g5 = [e4, 0];
    m5.map = g5, t4.md.block.tokenize(t4, e4, f5), t4.push("blockquote_close", "blockquote", -1).markup = ">", t4.lineMax = i6, t4.parentType = p6, g5[1] = t4.line;
    for (let n6 = 0; n6 < h8.length; n6++) t4.bMarks[n6 + e4] = c6[n6], t4.tShift[n6 + e4] = h8[n6], t4.sCount[n6 + e4] = a6[n6], t4.bsCount[n6 + e4] = l6[n6];
    return t4.blkIndent = k2, true;
  }, ["paragraph", "reference", "blockquote", "list"]], ["hr", function(t4, e4, n5, r5) {
    const s4 = t4.eMarks[e4];
    if (t4.sCount[e4] - t4.blkIndent >= 4) return false;
    let o6 = t4.bMarks[e4] + t4.tShift[e4];
    const i6 = t4.src.charCodeAt(o6++);
    if (42 !== i6 && 45 !== i6 && 95 !== i6) return false;
    let c6 = 1;
    for (; o6 < s4; ) {
      const e5 = t4.src.charCodeAt(o6++);
      if (e5 !== i6 && !y(e5)) return false;
      e5 === i6 && c6++;
    }
    if (c6 < 3) return false;
    if (r5) return true;
    t4.line = e4 + 1;
    const l6 = t4.push("hr", "hr", 0);
    return l6.map = [e4, t4.line], l6.markup = Array(c6 + 1).join(String.fromCharCode(i6)), true;
  }, ["paragraph", "reference", "blockquote", "list"]], ["list", function(t4, e4, n5, r5) {
    let s4, o6, i6, c6, l6 = e4, a6 = true;
    if (t4.sCount[l6] - t4.blkIndent >= 4) return false;
    if (t4.listIndent >= 0 && t4.sCount[l6] - t4.listIndent >= 4 && t4.sCount[l6] < t4.blkIndent) return false;
    let h8, u7, p6, f5 = false;
    if (r5 && "paragraph" === t4.parentType && t4.sCount[l6] >= t4.blkIndent && (f5 = true), (p6 = et(t4, l6)) >= 0) {
      if (h8 = true, i6 = t4.bMarks[l6] + t4.tShift[l6], u7 = Number(t4.src.slice(i6, p6 - 1)), f5 && 1 !== u7) return false;
    } else {
      if (!((p6 = tt(t4, l6)) >= 0)) return false;
      h8 = false;
    }
    if (f5 && t4.skipSpaces(p6) >= t4.eMarks[l6]) return false;
    if (r5) return true;
    const d6 = t4.src.charCodeAt(p6 - 1), k2 = t4.tokens.length;
    h8 ? (c6 = t4.push("ordered_list_open", "ol", 1), 1 !== u7 && (c6.attrs = [["start", u7]])) : c6 = t4.push("bullet_list_open", "ul", 1);
    const m5 = [l6, 0];
    c6.map = m5, c6.markup = String.fromCharCode(d6);
    let g5 = false;
    const b2 = t4.md.block.ruler.getRules("list"), _2 = t4.parentType;
    for (t4.parentType = "list"; l6 < n5; ) {
      o6 = p6, s4 = t4.eMarks[l6];
      const e5 = t4.sCount[l6] + p6 - (t4.bMarks[l6] + t4.tShift[l6]);
      let r6 = e5;
      for (; o6 < s4; ) {
        const e6 = t4.src.charCodeAt(o6);
        if (9 === e6) r6 += 4 - (r6 + t4.bsCount[l6]) % 4;
        else {
          if (32 !== e6) break;
          r6++;
        }
        o6++;
      }
      const u8 = o6;
      let f6;
      f6 = u8 >= s4 ? 1 : r6 - e5, f6 > 4 && (f6 = 1);
      const k3 = e5 + f6;
      c6 = t4.push("list_item_open", "li", 1), c6.markup = String.fromCharCode(d6);
      const m6 = [l6, 0];
      c6.map = m6, h8 && (c6.info = t4.src.slice(i6, p6 - 1));
      const _3 = t4.tight, C6 = t4.tShift[l6], y2 = t4.sCount[l6], A5 = t4.listIndent;
      if (t4.listIndent = t4.blkIndent, t4.blkIndent = k3, t4.tight = true, t4.tShift[l6] = u8 - t4.bMarks[l6], t4.sCount[l6] = r6, u8 >= s4 && t4.isEmpty(l6 + 1) ? t4.line = Math.min(t4.line + 2, n5) : t4.md.block.tokenize(t4, l6, n5, true), t4.tight && !g5 || (a6 = false), g5 = t4.line - l6 > 1 && t4.isEmpty(t4.line - 1), t4.blkIndent = t4.listIndent, t4.listIndent = A5, t4.tShift[l6] = C6, t4.sCount[l6] = y2, t4.tight = _3, c6 = t4.push("list_item_close", "li", -1), c6.markup = String.fromCharCode(d6), l6 = t4.line, m6[1] = l6, l6 >= n5) break;
      if (t4.sCount[l6] < t4.blkIndent) break;
      if (t4.sCount[l6] - t4.blkIndent >= 4) break;
      let x3 = false;
      for (let e6 = 0, r7 = b2.length; e6 < r7; e6++) if (b2[e6](t4, l6, n5, true)) {
        x3 = true;
        break;
      }
      if (x3) break;
      if (h8) {
        if (p6 = et(t4, l6), p6 < 0) break;
        i6 = t4.bMarks[l6] + t4.tShift[l6];
      } else if (p6 = tt(t4, l6), p6 < 0) break;
      if (d6 !== t4.src.charCodeAt(p6 - 1)) break;
    }
    return c6 = h8 ? t4.push("ordered_list_close", "ol", -1) : t4.push("bullet_list_close", "ul", -1), c6.markup = String.fromCharCode(d6), m5[1] = l6, t4.line = l6, t4.parentType = _2, a6 && function(t5, e5) {
      const n6 = t5.level + 2;
      for (let r6 = e5 + 2, s5 = t5.tokens.length - 2; r6 < s5; r6++) t5.tokens[r6].level === n6 && "paragraph_open" === t5.tokens[r6].type && (t5.tokens[r6 + 2].hidden = true, t5.tokens[r6].hidden = true, r6 += 2);
    }(t4, k2), true;
  }, ["paragraph", "reference", "blockquote"]], ["reference", function(t4, e4, n5, r5) {
    let s4 = t4.bMarks[e4] + t4.tShift[e4], o6 = t4.eMarks[e4], i6 = e4 + 1;
    if (t4.sCount[e4] - t4.blkIndent >= 4) return false;
    if (91 !== t4.src.charCodeAt(s4)) return false;
    function c6(e5) {
      const n6 = t4.lineMax;
      if (e5 >= n6 || t4.isEmpty(e5)) return null;
      let r6 = false;
      if (t4.sCount[e5] - t4.blkIndent > 3 && (r6 = true), t4.sCount[e5] < 0 && (r6 = true), !r6) {
        const r7 = t4.md.block.ruler.getRules("reference"), s6 = t4.parentType;
        t4.parentType = "reference";
        let o8 = false;
        for (let s7 = 0, i7 = r7.length; s7 < i7; s7++) if (r7[s7](t4, e5, n6, true)) {
          o8 = true;
          break;
        }
        if (t4.parentType = s6, o8) return null;
      }
      const s5 = t4.bMarks[e5] + t4.tShift[e5], o7 = t4.eMarks[e5];
      return t4.src.slice(s5, o7 + 1);
    }
    let l6 = t4.src.slice(s4, o6 + 1);
    o6 = l6.length;
    let a6 = -1;
    for (s4 = 1; s4 < o6; s4++) {
      const t5 = l6.charCodeAt(s4);
      if (91 === t5) return false;
      if (93 === t5) {
        a6 = s4;
        break;
      }
      if (10 === t5) {
        const t6 = c6(i6);
        null !== t6 && (l6 += t6, o6 = l6.length, i6++);
      } else if (92 === t5 && (s4++, s4 < o6 && 10 === l6.charCodeAt(s4))) {
        const t6 = c6(i6);
        null !== t6 && (l6 += t6, o6 = l6.length, i6++);
      }
    }
    if (a6 < 0 || 58 !== l6.charCodeAt(a6 + 1)) return false;
    for (s4 = a6 + 2; s4 < o6; s4++) {
      const t5 = l6.charCodeAt(s4);
      if (10 === t5) {
        const t6 = c6(i6);
        null !== t6 && (l6 += t6, o6 = l6.length, i6++);
      } else if (!y(t5)) break;
    }
    const h8 = t4.md.helpers.parseLinkDestination(l6, s4, o6);
    if (!h8.ok) return false;
    const u7 = t4.md.normalizeLink(h8.str);
    if (!t4.md.validateLink(u7)) return false;
    s4 = h8.pos;
    const p6 = s4, f5 = i6, d6 = s4;
    for (; s4 < o6; s4++) {
      const t5 = l6.charCodeAt(s4);
      if (10 === t5) {
        const t6 = c6(i6);
        null !== t6 && (l6 += t6, o6 = l6.length, i6++);
      } else if (!y(t5)) break;
    }
    let k2, m5 = t4.md.helpers.parseLinkTitle(l6, s4, o6);
    for (; m5.can_continue; ) {
      const e5 = c6(i6);
      if (null === e5) break;
      l6 += e5, s4 = o6, o6 = l6.length, i6++, m5 = t4.md.helpers.parseLinkTitle(l6, s4, o6, m5);
    }
    for (s4 < o6 && d6 !== s4 && m5.ok ? (k2 = m5.str, s4 = m5.pos) : (k2 = "", s4 = p6, i6 = f5); s4 < o6; ) {
      if (!y(l6.charCodeAt(s4))) break;
      s4++;
    }
    if (s4 < o6 && 10 !== l6.charCodeAt(s4) && k2) for (k2 = "", s4 = p6, i6 = f5; s4 < o6; ) {
      if (!y(l6.charCodeAt(s4))) break;
      s4++;
    }
    if (s4 < o6 && 10 !== l6.charCodeAt(s4)) return false;
    const g5 = v2(l6.slice(1, a6));
    return !!g5 && (r5 || (void 0 === t4.env.references && (t4.env.references = {}), void 0 === t4.env.references[g5] && (t4.env.references[g5] = { title: k2, href: u7 }), t4.line = i6), true);
  }], ["html_block", function(t4, e4, n5, r5) {
    let s4 = t4.bMarks[e4] + t4.tShift[e4], o6 = t4.eMarks[e4];
    if (t4.sCount[e4] - t4.blkIndent >= 4) return false;
    if (!t4.md.options.html) return false;
    if (60 !== t4.src.charCodeAt(s4)) return false;
    let i6 = t4.src.slice(s4, o6), c6 = 0;
    for (; c6 < it.length && !it[c6][0].test(i6); c6++) ;
    if (c6 === it.length) return false;
    if (r5) return it[c6][2];
    let l6 = e4 + 1;
    if (!it[c6][1].test(i6)) {
      for (; l6 < n5 && !(t4.sCount[l6] < t4.blkIndent); l6++) if (s4 = t4.bMarks[l6] + t4.tShift[l6], o6 = t4.eMarks[l6], i6 = t4.src.slice(s4, o6), it[c6][1].test(i6)) {
        0 !== i6.length && l6++;
        break;
      }
    }
    t4.line = l6;
    const a6 = t4.push("html_block", "", 0);
    return a6.map = [e4, l6], a6.content = t4.getLines(e4, l6, t4.blkIndent, true), true;
  }, ["paragraph", "reference", "blockquote"]], ["heading", function(t4, e4, n5, r5) {
    let s4 = t4.bMarks[e4] + t4.tShift[e4], o6 = t4.eMarks[e4];
    if (t4.sCount[e4] - t4.blkIndent >= 4) return false;
    let i6 = t4.src.charCodeAt(s4);
    if (35 !== i6 || s4 >= o6) return false;
    let c6 = 1;
    for (i6 = t4.src.charCodeAt(++s4); 35 === i6 && s4 < o6 && c6 <= 6; ) c6++, i6 = t4.src.charCodeAt(++s4);
    if (c6 > 6 || s4 < o6 && !y(i6)) return false;
    if (r5) return true;
    o6 = t4.skipSpacesBack(o6, s4);
    const l6 = t4.skipCharsBack(o6, 35, s4);
    l6 > s4 && y(t4.src.charCodeAt(l6 - 1)) && (o6 = l6), t4.line = e4 + 1;
    const a6 = t4.push("heading_open", "h" + String(c6), 1);
    a6.markup = "########".slice(0, c6), a6.map = [e4, t4.line];
    const h8 = t4.push("inline", "", 0);
    return h8.content = t4.src.slice(s4, o6).trim(), h8.map = [e4, t4.line], h8.children = [], t4.push("heading_close", "h" + String(c6), -1).markup = "########".slice(0, c6), true;
  }, ["paragraph", "reference", "blockquote"]], ["lheading", function(t4, e4, n5) {
    const r5 = t4.md.block.ruler.getRules("paragraph");
    if (t4.sCount[e4] - t4.blkIndent >= 4) return false;
    const s4 = t4.parentType;
    t4.parentType = "paragraph";
    let o6, i6 = 0, c6 = e4 + 1;
    for (; c6 < n5 && !t4.isEmpty(c6); c6++) {
      if (t4.sCount[c6] - t4.blkIndent > 3) continue;
      if (t4.sCount[c6] >= t4.blkIndent) {
        let e6 = t4.bMarks[c6] + t4.tShift[c6];
        const n6 = t4.eMarks[c6];
        if (e6 < n6 && (o6 = t4.src.charCodeAt(e6), (45 === o6 || 61 === o6) && (e6 = t4.skipChars(e6, o6), e6 = t4.skipSpaces(e6), e6 >= n6))) {
          i6 = 61 === o6 ? 1 : 2;
          break;
        }
      }
      if (t4.sCount[c6] < 0) continue;
      let e5 = false;
      for (let s5 = 0, o7 = r5.length; s5 < o7; s5++) if (r5[s5](t4, c6, n5, true)) {
        e5 = true;
        break;
      }
      if (e5) break;
    }
    if (!i6) return false;
    const l6 = t4.getLines(e4, c6, t4.blkIndent, false).trim();
    t4.line = c6 + 1;
    const a6 = t4.push("heading_open", "h" + String(i6), 1);
    a6.markup = String.fromCharCode(o6), a6.map = [e4, t4.line];
    const h8 = t4.push("inline", "", 0);
    return h8.content = l6, h8.map = [e4, t4.line - 1], h8.children = [], t4.push("heading_close", "h" + String(i6), -1).markup = String.fromCharCode(o6), t4.parentType = s4, true;
  }], ["paragraph", function(t4, e4, n5) {
    const r5 = t4.md.block.ruler.getRules("paragraph"), s4 = t4.parentType;
    let o6 = e4 + 1;
    for (t4.parentType = "paragraph"; o6 < n5 && !t4.isEmpty(o6); o6++) {
      if (t4.sCount[o6] - t4.blkIndent > 3) continue;
      if (t4.sCount[o6] < 0) continue;
      let e5 = false;
      for (let s5 = 0, i7 = r5.length; s5 < i7; s5++) if (r5[s5](t4, o6, n5, true)) {
        e5 = true;
        break;
      }
      if (e5) break;
    }
    const i6 = t4.getLines(e4, o6, t4.blkIndent, false).trim();
    t4.line = o6, t4.push("paragraph_open", "p", 1).map = [e4, t4.line];
    const c6 = t4.push("inline", "", 0);
    return c6.content = i6, c6.map = [e4, t4.line], c6.children = [], t4.push("paragraph_close", "p", -1), t4.parentType = s4, true;
  }]];
  function lt() {
    this.ruler = new T2();
    for (let t4 = 0; t4 < ct.length; t4++) this.ruler.push(ct[t4][0], ct[t4][1], { alt: (ct[t4][2] || []).slice() });
  }
  function at(t4, e4, n5, r5) {
    this.src = t4, this.env = n5, this.md = e4, this.tokens = r5, this.tokens_meta = Array(r5.length), this.pos = 0, this.posMax = this.src.length, this.level = 0, this.pending = "", this.pendingLevel = 0, this.cache = {}, this.delimiters = [], this._prev_delimiters = [], this.backticks = {}, this.backticksScanned = false, this.linkLevel = 0;
  }
  function ht(t4) {
    switch (t4) {
      case 10:
      case 33:
      case 35:
      case 36:
      case 37:
      case 38:
      case 42:
      case 43:
      case 45:
      case 58:
      case 60:
      case 61:
      case 62:
      case 64:
      case 91:
      case 92:
      case 93:
      case 94:
      case 95:
      case 96:
      case 123:
      case 125:
      case 126:
        return true;
      default:
        return false;
    }
  }
  lt.prototype.tokenize = function(t4, e4, n5) {
    const r5 = this.ruler.getRules(""), s4 = r5.length, o6 = t4.md.options.maxNesting;
    let i6 = e4, c6 = false;
    for (; i6 < n5 && (t4.line = i6 = t4.skipEmptyLines(i6), !(i6 >= n5)) && !(t4.sCount[i6] < t4.blkIndent); ) {
      if (t4.level >= o6) {
        t4.line = n5;
        break;
      }
      const e5 = t4.line;
      let l6 = false;
      for (let o7 = 0; o7 < s4; o7++) if (l6 = r5[o7](t4, i6, n5, false), l6) {
        if (e5 >= t4.line) throw new Error("block rule didn't increment state.line");
        break;
      }
      if (!l6) throw new Error("none of the block rules matched");
      t4.tight = !c6, t4.isEmpty(t4.line - 1) && (c6 = true), i6 = t4.line, i6 < n5 && t4.isEmpty(i6) && (c6 = true, i6++, t4.line = i6);
    }
  }, lt.prototype.parse = function(t4, e4, n5, r5) {
    if (!t4) return;
    const s4 = new this.State(t4, e4, n5, r5);
    this.tokenize(s4, s4.line, s4.lineMax);
  }, lt.prototype.State = Q, at.prototype.pushPending = function() {
    const t4 = new E3("text", "", 0);
    return t4.content = this.pending, t4.level = this.pendingLevel, this.tokens.push(t4), this.pending = "", t4;
  }, at.prototype.push = function(t4, e4, n5) {
    this.pending && this.pushPending();
    const r5 = new E3(t4, e4, n5);
    let s4 = null;
    return n5 < 0 && (this.level--, this.delimiters = this._prev_delimiters.pop()), r5.level = this.level, n5 > 0 && (this.level++, this._prev_delimiters.push(this.delimiters), this.delimiters = [], s4 = { delimiters: this.delimiters }), this.pendingLevel = this.level, this.tokens.push(r5), this.tokens_meta.push(s4), r5;
  }, at.prototype.scanDelims = function(t4, e4) {
    const n5 = this.posMax, r5 = this.src.charCodeAt(t4), s4 = t4 > 0 ? this.src.charCodeAt(t4 - 1) : 32;
    let o6 = t4;
    for (; o6 < n5 && this.src.charCodeAt(o6) === r5; ) o6++;
    const i6 = o6 - t4, c6 = o6 < n5 ? this.src.charCodeAt(o6) : 32, l6 = M(s4) || x2(String.fromCharCode(s4)), a6 = M(c6) || x2(String.fromCharCode(c6)), h8 = A4(s4), u7 = A4(c6), p6 = !u7 && (!a6 || h8 || l6), f5 = !h8 && (!l6 || u7 || a6);
    return { can_open: p6 && (e4 || !f5 || l6), can_close: f5 && (e4 || !p6 || a6), length: i6 };
  }, at.prototype.Token = E3;
  var ut = /(?:^|[^a-z0-9.+-])([a-z][a-z0-9.+-]*)$/i;
  var pt = [];
  for (let t4 = 0; t4 < 256; t4++) pt.push(0);
  function ft(t4, e4) {
    let n5;
    const r5 = [], s4 = e4.length;
    for (let o6 = 0; o6 < s4; o6++) {
      const s5 = e4[o6];
      if (126 !== s5.marker) continue;
      if (-1 === s5.end) continue;
      const i6 = e4[s5.end];
      n5 = t4.tokens[s5.token], n5.type = "s_open", n5.tag = "s", n5.nesting = 1, n5.markup = "~~", n5.content = "", n5 = t4.tokens[i6.token], n5.type = "s_close", n5.tag = "s", n5.nesting = -1, n5.markup = "~~", n5.content = "", "text" === t4.tokens[i6.token - 1].type && "~" === t4.tokens[i6.token - 1].content && r5.push(i6.token - 1);
    }
    for (; r5.length; ) {
      const e5 = r5.pop();
      let s5 = e5 + 1;
      for (; s5 < t4.tokens.length && "s_close" === t4.tokens[s5].type; ) s5++;
      s5--, e5 !== s5 && (n5 = t4.tokens[s5], t4.tokens[s5] = t4.tokens[e5], t4.tokens[e5] = n5);
    }
  }
  "\\!\"#$%&'()*+,./:;<=>?@[]^_`{|}~-".split("").forEach(function(t4) {
    pt[t4.charCodeAt(0)] = 1;
  });
  var dt = { tokenize: function(t4, e4) {
    const n5 = t4.pos, r5 = t4.src.charCodeAt(n5);
    if (e4) return false;
    if (126 !== r5) return false;
    const s4 = t4.scanDelims(t4.pos, true);
    let o6 = s4.length;
    const i6 = String.fromCharCode(r5);
    if (o6 < 2) return false;
    let c6;
    o6 % 2 && (c6 = t4.push("text", "", 0), c6.content = i6, o6--);
    for (let e5 = 0; e5 < o6; e5 += 2) c6 = t4.push("text", "", 0), c6.content = i6 + i6, t4.delimiters.push({ marker: r5, length: 0, token: t4.tokens.length - 1, end: -1, open: s4.can_open, close: s4.can_close });
    return t4.pos += s4.length, true;
  }, postProcess: function(t4) {
    const e4 = t4.tokens_meta, n5 = t4.tokens_meta.length;
    ft(t4, t4.delimiters);
    for (let r5 = 0; r5 < n5; r5++) e4[r5] && e4[r5].delimiters && ft(t4, e4[r5].delimiters);
  } };
  function kt(t4, e4) {
    for (let n5 = e4.length - 1; n5 >= 0; n5--) {
      const r5 = e4[n5];
      if (95 !== r5.marker && 42 !== r5.marker) continue;
      if (-1 === r5.end) continue;
      const s4 = e4[r5.end], o6 = n5 > 0 && e4[n5 - 1].end === r5.end + 1 && e4[n5 - 1].marker === r5.marker && e4[n5 - 1].token === r5.token - 1 && e4[r5.end + 1].token === s4.token + 1, i6 = String.fromCharCode(r5.marker), c6 = t4.tokens[r5.token];
      c6.type = o6 ? "strong_open" : "em_open", c6.tag = o6 ? "strong" : "em", c6.nesting = 1, c6.markup = o6 ? i6 + i6 : i6, c6.content = "";
      const l6 = t4.tokens[s4.token];
      l6.type = o6 ? "strong_close" : "em_close", l6.tag = o6 ? "strong" : "em", l6.nesting = -1, l6.markup = o6 ? i6 + i6 : i6, l6.content = "", o6 && (t4.tokens[e4[n5 - 1].token].content = "", t4.tokens[e4[r5.end + 1].token].content = "", n5--);
    }
  }
  var mt = { tokenize: function(t4, e4) {
    const n5 = t4.pos, r5 = t4.src.charCodeAt(n5);
    if (e4) return false;
    if (95 !== r5 && 42 !== r5) return false;
    const s4 = t4.scanDelims(t4.pos, 42 === r5);
    for (let e5 = 0; e5 < s4.length; e5++) {
      t4.push("text", "", 0).content = String.fromCharCode(r5), t4.delimiters.push({ marker: r5, length: s4.length, token: t4.tokens.length - 1, end: -1, open: s4.can_open, close: s4.can_close });
    }
    return t4.pos += s4.length, true;
  }, postProcess: function(t4) {
    const e4 = t4.tokens_meta, n5 = t4.tokens_meta.length;
    kt(t4, t4.delimiters);
    for (let r5 = 0; r5 < n5; r5++) e4[r5] && e4[r5].delimiters && kt(t4, e4[r5].delimiters);
  } };
  var gt = /^([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)$/;
  var bt = /^([a-zA-Z][a-zA-Z0-9+.-]{1,31}):([^<>\x00-\x20]*)$/;
  var _t = /^&#((?:x[a-f0-9]{1,6}|[0-9]{1,7}));/i;
  var Ct = /^&([a-z][a-z0-9]{1,31});/i;
  function yt(t4) {
    const e4 = {}, n5 = t4.length;
    if (!n5) return;
    let r5 = 0, s4 = -2;
    const o6 = [];
    for (let i6 = 0; i6 < n5; i6++) {
      const n6 = t4[i6];
      if (o6.push(0), t4[r5].marker === n6.marker && s4 === n6.token - 1 || (r5 = i6), s4 = n6.token, n6.length = n6.length || 0, !n6.close) continue;
      e4.hasOwnProperty(n6.marker) || (e4[n6.marker] = [-1, -1, -1, -1, -1, -1]);
      const c6 = e4[n6.marker][(n6.open ? 3 : 0) + n6.length % 3];
      let l6 = r5 - o6[r5] - 1, a6 = l6;
      for (; l6 > c6; l6 -= o6[l6] + 1) {
        const e5 = t4[l6];
        if (e5.marker === n6.marker && (e5.open && e5.end < 0)) {
          let r6 = false;
          if ((e5.close || n6.open) && (e5.length + n6.length) % 3 == 0 && (e5.length % 3 == 0 && n6.length % 3 == 0 || (r6 = true)), !r6) {
            const r7 = l6 > 0 && !t4[l6 - 1].open ? o6[l6 - 1] + 1 : 0;
            o6[i6] = i6 - l6 + r7, o6[l6] = r7, n6.open = false, e5.end = i6, e5.close = false, a6 = -1, s4 = -2;
            break;
          }
        }
      }
      -1 !== a6 && (e4[n6.marker][(n6.open ? 3 : 0) + (n6.length || 0) % 3] = a6);
    }
  }
  var At = [["text", function(t4, e4) {
    let n5 = t4.pos;
    for (; n5 < t4.posMax && !ht(t4.src.charCodeAt(n5)); ) n5++;
    return n5 !== t4.pos && (e4 || (t4.pending += t4.src.slice(t4.pos, n5)), t4.pos = n5, true);
  }], ["linkify", function(t4, e4) {
    if (!t4.md.options.linkify) return false;
    if (t4.linkLevel > 0) return false;
    const n5 = t4.pos;
    if (n5 + 3 > t4.posMax) return false;
    if (58 !== t4.src.charCodeAt(n5)) return false;
    if (47 !== t4.src.charCodeAt(n5 + 1)) return false;
    if (47 !== t4.src.charCodeAt(n5 + 2)) return false;
    const r5 = t4.pending.match(ut);
    if (!r5) return false;
    const s4 = r5[1], o6 = t4.md.linkify.matchAtStart(t4.src.slice(n5 - s4.length));
    if (!o6) return false;
    let i6 = o6.url;
    if (i6.length <= s4.length) return false;
    i6 = i6.replace(/\*+$/, "");
    const c6 = t4.md.normalizeLink(i6);
    if (!t4.md.validateLink(c6)) return false;
    if (!e4) {
      t4.pending = t4.pending.slice(0, -s4.length);
      const e5 = t4.push("link_open", "a", 1);
      e5.attrs = [["href", c6]], e5.markup = "linkify", e5.info = "auto";
      t4.push("text", "", 0).content = t4.md.normalizeLinkText(i6);
      const n6 = t4.push("link_close", "a", -1);
      n6.markup = "linkify", n6.info = "auto";
    }
    return t4.pos += i6.length - s4.length, true;
  }], ["newline", function(t4, e4) {
    let n5 = t4.pos;
    if (10 !== t4.src.charCodeAt(n5)) return false;
    const r5 = t4.pending.length - 1, s4 = t4.posMax;
    if (!e4) if (r5 >= 0 && 32 === t4.pending.charCodeAt(r5)) if (r5 >= 1 && 32 === t4.pending.charCodeAt(r5 - 1)) {
      let e5 = r5 - 1;
      for (; e5 >= 1 && 32 === t4.pending.charCodeAt(e5 - 1); ) e5--;
      t4.pending = t4.pending.slice(0, e5), t4.push("hardbreak", "br", 0);
    } else t4.pending = t4.pending.slice(0, -1), t4.push("softbreak", "br", 0);
    else t4.push("softbreak", "br", 0);
    for (n5++; n5 < s4 && y(t4.src.charCodeAt(n5)); ) n5++;
    return t4.pos = n5, true;
  }], ["escape", function(t4, e4) {
    let n5 = t4.pos;
    const r5 = t4.posMax;
    if (92 !== t4.src.charCodeAt(n5)) return false;
    if (n5++, n5 >= r5) return false;
    let s4 = t4.src.charCodeAt(n5);
    if (10 === s4) {
      for (e4 || t4.push("hardbreak", "br", 0), n5++; n5 < r5 && (s4 = t4.src.charCodeAt(n5), y(s4)); ) n5++;
      return t4.pos = n5, true;
    }
    let o6 = t4.src[n5];
    if (s4 >= 55296 && s4 <= 56319 && n5 + 1 < r5) {
      const e5 = t4.src.charCodeAt(n5 + 1);
      e5 >= 56320 && e5 <= 57343 && (o6 += t4.src[n5 + 1], n5++);
    }
    const i6 = "\\" + o6;
    if (!e4) {
      const e5 = t4.push("text_special", "", 0);
      s4 < 256 && 0 !== pt[s4] ? e5.content = o6 : e5.content = i6, e5.markup = i6, e5.info = "escape";
    }
    return t4.pos = n5 + 1, true;
  }], ["backticks", function(t4, e4) {
    let n5 = t4.pos;
    if (96 !== t4.src.charCodeAt(n5)) return false;
    const r5 = n5;
    n5++;
    const s4 = t4.posMax;
    for (; n5 < s4 && 96 === t4.src.charCodeAt(n5); ) n5++;
    const o6 = t4.src.slice(r5, n5), i6 = o6.length;
    if (t4.backticksScanned && (t4.backticks[i6] || 0) <= r5) return e4 || (t4.pending += o6), t4.pos += i6, true;
    let c6, l6 = n5;
    for (; -1 !== (c6 = t4.src.indexOf("`", l6)); ) {
      for (l6 = c6 + 1; l6 < s4 && 96 === t4.src.charCodeAt(l6); ) l6++;
      const r6 = l6 - c6;
      if (r6 === i6) {
        if (!e4) {
          const e5 = t4.push("code_inline", "code", 0);
          e5.markup = o6, e5.content = t4.src.slice(n5, c6).replace(/\n/g, " ").replace(/^ (.+) $/, "$1");
        }
        return t4.pos = l6, true;
      }
      t4.backticks[r6] = c6;
    }
    return t4.backticksScanned = true, e4 || (t4.pending += o6), t4.pos += i6, true;
  }], ["strikethrough", dt.tokenize], ["emphasis", mt.tokenize], ["link", function(t4, e4) {
    let n5, r5, s4, o6, i6 = "", c6 = "", l6 = t4.pos, a6 = true;
    if (91 !== t4.src.charCodeAt(t4.pos)) return false;
    const h8 = t4.pos, u7 = t4.posMax, p6 = t4.pos + 1, f5 = t4.md.helpers.parseLinkLabel(t4, t4.pos, true);
    if (f5 < 0) return false;
    let d6 = f5 + 1;
    if (d6 < u7 && 40 === t4.src.charCodeAt(d6)) {
      for (a6 = false, d6++; d6 < u7 && (n5 = t4.src.charCodeAt(d6), y(n5) || 10 === n5); d6++) ;
      if (d6 >= u7) return false;
      if (l6 = d6, s4 = t4.md.helpers.parseLinkDestination(t4.src, d6, t4.posMax), s4.ok) {
        for (i6 = t4.md.normalizeLink(s4.str), t4.md.validateLink(i6) ? d6 = s4.pos : i6 = "", l6 = d6; d6 < u7 && (n5 = t4.src.charCodeAt(d6), y(n5) || 10 === n5); d6++) ;
        if (s4 = t4.md.helpers.parseLinkTitle(t4.src, d6, t4.posMax), d6 < u7 && l6 !== d6 && s4.ok) for (c6 = s4.str, d6 = s4.pos; d6 < u7 && (n5 = t4.src.charCodeAt(d6), y(n5) || 10 === n5); d6++) ;
      }
      (d6 >= u7 || 41 !== t4.src.charCodeAt(d6)) && (a6 = true), d6++;
    }
    if (a6) {
      if (void 0 === t4.env.references) return false;
      if (d6 < u7 && 91 === t4.src.charCodeAt(d6) ? (l6 = d6 + 1, d6 = t4.md.helpers.parseLinkLabel(t4, d6), d6 >= 0 ? r5 = t4.src.slice(l6, d6++) : d6 = f5 + 1) : d6 = f5 + 1, r5 || (r5 = t4.src.slice(p6, f5)), o6 = t4.env.references[v2(r5)], !o6) return t4.pos = h8, false;
      i6 = o6.href, c6 = o6.title;
    }
    if (!e4) {
      t4.pos = p6, t4.posMax = f5;
      const e5 = [["href", i6]];
      t4.push("link_open", "a", 1).attrs = e5, c6 && e5.push(["title", c6]), t4.linkLevel++, t4.md.inline.tokenize(t4), t4.linkLevel--, t4.push("link_close", "a", -1);
    }
    return t4.pos = d6, t4.posMax = u7, true;
  }], ["image", function(t4, e4) {
    let n5, r5, s4, o6, i6, c6, l6, a6, h8 = "";
    const u7 = t4.pos, p6 = t4.posMax;
    if (33 !== t4.src.charCodeAt(t4.pos)) return false;
    if (91 !== t4.src.charCodeAt(t4.pos + 1)) return false;
    const f5 = t4.pos + 2, d6 = t4.md.helpers.parseLinkLabel(t4, t4.pos + 1, false);
    if (d6 < 0) return false;
    if (o6 = d6 + 1, o6 < p6 && 40 === t4.src.charCodeAt(o6)) {
      for (o6++; o6 < p6 && (n5 = t4.src.charCodeAt(o6), y(n5) || 10 === n5); o6++) ;
      if (o6 >= p6) return false;
      for (a6 = o6, c6 = t4.md.helpers.parseLinkDestination(t4.src, o6, t4.posMax), c6.ok && (h8 = t4.md.normalizeLink(c6.str), t4.md.validateLink(h8) ? o6 = c6.pos : h8 = ""), a6 = o6; o6 < p6 && (n5 = t4.src.charCodeAt(o6), y(n5) || 10 === n5); o6++) ;
      if (c6 = t4.md.helpers.parseLinkTitle(t4.src, o6, t4.posMax), o6 < p6 && a6 !== o6 && c6.ok) for (l6 = c6.str, o6 = c6.pos; o6 < p6 && (n5 = t4.src.charCodeAt(o6), y(n5) || 10 === n5); o6++) ;
      else l6 = "";
      if (o6 >= p6 || 41 !== t4.src.charCodeAt(o6)) return t4.pos = u7, false;
      o6++;
    } else {
      if (void 0 === t4.env.references) return false;
      if (o6 < p6 && 91 === t4.src.charCodeAt(o6) ? (a6 = o6 + 1, o6 = t4.md.helpers.parseLinkLabel(t4, o6), o6 >= 0 ? s4 = t4.src.slice(a6, o6++) : o6 = d6 + 1) : o6 = d6 + 1, s4 || (s4 = t4.src.slice(f5, d6)), i6 = t4.env.references[v2(s4)], !i6) return t4.pos = u7, false;
      h8 = i6.href, l6 = i6.title;
    }
    if (!e4) {
      r5 = t4.src.slice(f5, d6);
      const e5 = [];
      t4.md.inline.parse(r5, t4.md, t4.env, e5);
      const n6 = t4.push("image", "img", 0), s5 = [["src", h8], ["alt", ""]];
      n6.attrs = s5, n6.children = e5, n6.content = r5, l6 && s5.push(["title", l6]);
    }
    return t4.pos = o6, t4.posMax = p6, true;
  }], ["autolink", function(t4, e4) {
    let n5 = t4.pos;
    if (60 !== t4.src.charCodeAt(n5)) return false;
    const r5 = t4.pos, s4 = t4.posMax;
    for (; ; ) {
      if (++n5 >= s4) return false;
      const e5 = t4.src.charCodeAt(n5);
      if (60 === e5) return false;
      if (62 === e5) break;
    }
    const o6 = t4.src.slice(r5 + 1, n5);
    if (bt.test(o6)) {
      const n6 = t4.md.normalizeLink(o6);
      if (!t4.md.validateLink(n6)) return false;
      if (!e4) {
        const e5 = t4.push("link_open", "a", 1);
        e5.attrs = [["href", n6]], e5.markup = "autolink", e5.info = "auto";
        t4.push("text", "", 0).content = t4.md.normalizeLinkText(o6);
        const r6 = t4.push("link_close", "a", -1);
        r6.markup = "autolink", r6.info = "auto";
      }
      return t4.pos += o6.length + 2, true;
    }
    if (gt.test(o6)) {
      const n6 = t4.md.normalizeLink("mailto:" + o6);
      if (!t4.md.validateLink(n6)) return false;
      if (!e4) {
        const e5 = t4.push("link_open", "a", 1);
        e5.attrs = [["href", n6]], e5.markup = "autolink", e5.info = "auto";
        t4.push("text", "", 0).content = t4.md.normalizeLinkText(o6);
        const r6 = t4.push("link_close", "a", -1);
        r6.markup = "autolink", r6.info = "auto";
      }
      return t4.pos += o6.length + 2, true;
    }
    return false;
  }], ["html_inline", function(t4, e4) {
    if (!t4.md.options.html) return false;
    const n5 = t4.posMax, r5 = t4.pos;
    if (60 !== t4.src.charCodeAt(r5) || r5 + 2 >= n5) return false;
    const s4 = t4.src.charCodeAt(r5 + 1);
    if (33 !== s4 && 63 !== s4 && 47 !== s4 && !function(t5) {
      const e5 = 32 | t5;
      return e5 >= 97 && e5 <= 122;
    }(s4)) return false;
    const o6 = t4.src.slice(r5).match(st);
    if (!o6) return false;
    if (!e4) {
      const e5 = t4.push("html_inline", "", 0);
      e5.content = o6[0], i6 = e5.content, /^<a[>\s]/i.test(i6) && t4.linkLevel++, function(t5) {
        return /^<\/a\s*>/i.test(t5);
      }(e5.content) && t4.linkLevel--;
    }
    var i6;
    return t4.pos += o6[0].length, true;
  }], ["entity", function(t4, e4) {
    const r5 = t4.pos, s4 = t4.posMax;
    if (38 !== t4.src.charCodeAt(r5)) return false;
    if (r5 + 1 >= s4) return false;
    if (35 === t4.src.charCodeAt(r5 + 1)) {
      const n5 = t4.src.slice(r5).match(_t);
      if (n5) {
        if (!e4) {
          const e5 = "x" === n5[1][0].toLowerCase() ? parseInt(n5[1].slice(1), 16) : parseInt(n5[1], 10), r6 = t4.push("text_special", "", 0);
          r6.content = a5(e5) ? h7(e5) : h7(65533), r6.markup = n5[0], r6.info = "entity";
        }
        return t4.pos += n5[0].length, true;
      }
    } else {
      const s5 = t4.src.slice(r5).match(Ct);
      if (s5) {
        const r6 = h4(s5[0]);
        if (r6 !== s5[0]) {
          if (!e4) {
            const e5 = t4.push("text_special", "", 0);
            e5.content = r6, e5.markup = s5[0], e5.info = "entity";
          }
          return t4.pos += s5[0].length, true;
        }
      }
    }
    return false;
  }]];
  var xt = [["balance_pairs", function(t4) {
    const e4 = t4.tokens_meta, n5 = t4.tokens_meta.length;
    yt(t4.delimiters);
    for (let t5 = 0; t5 < n5; t5++) e4[t5] && e4[t5].delimiters && yt(e4[t5].delimiters);
  }], ["strikethrough", dt.postProcess], ["emphasis", mt.postProcess], ["fragments_join", function(t4) {
    let e4, n5, r5 = 0;
    const s4 = t4.tokens, o6 = t4.tokens.length;
    for (e4 = n5 = 0; e4 < o6; e4++) s4[e4].nesting < 0 && r5--, s4[e4].level = r5, s4[e4].nesting > 0 && r5++, "text" === s4[e4].type && e4 + 1 < o6 && "text" === s4[e4 + 1].type ? s4[e4 + 1].content = s4[e4].content + s4[e4 + 1].content : (e4 !== n5 && (s4[n5] = s4[e4]), n5++);
    e4 !== n5 && (s4.length = n5);
  }]];
  function Mt() {
    this.ruler = new T2();
    for (let t4 = 0; t4 < At.length; t4++) this.ruler.push(At[t4][0], At[t4][1]);
    this.ruler2 = new T2();
    for (let t4 = 0; t4 < xt.length; t4++) this.ruler2.push(xt[t4][0], xt[t4][1]);
  }
  Mt.prototype.skipToken = function(t4) {
    const e4 = t4.pos, n5 = this.ruler.getRules(""), r5 = n5.length, s4 = t4.md.options.maxNesting, o6 = t4.cache;
    if (void 0 !== o6[e4]) return void (t4.pos = o6[e4]);
    let i6 = false;
    if (t4.level < s4) {
      for (let s5 = 0; s5 < r5; s5++) if (t4.level++, i6 = n5[s5](t4, true), t4.level--, i6) {
        if (e4 >= t4.pos) throw new Error("inline rule didn't increment state.pos");
        break;
      }
    } else t4.pos = t4.posMax;
    i6 || t4.pos++, o6[e4] = t4.pos;
  }, Mt.prototype.tokenize = function(t4) {
    const e4 = this.ruler.getRules(""), n5 = e4.length, r5 = t4.posMax, s4 = t4.md.options.maxNesting;
    for (; t4.pos < r5; ) {
      const o6 = t4.pos;
      let i6 = false;
      if (t4.level < s4) {
        for (let r6 = 0; r6 < n5; r6++) if (i6 = e4[r6](t4, false), i6) {
          if (o6 >= t4.pos) throw new Error("inline rule didn't increment state.pos");
          break;
        }
      }
      if (i6) {
        if (t4.pos >= r5) break;
      } else t4.pending += t4.src[t4.pos++];
    }
    t4.pending && t4.pushPending();
  }, Mt.prototype.parse = function(t4, e4, n5, r5) {
    const s4 = new this.State(t4, e4, n5, r5);
    this.tokenize(s4);
    const o6 = this.ruler2.getRules(""), i6 = o6.length;
    for (let t5 = 0; t5 < i6; t5++) o6[t5](s4);
  }, Mt.prototype.State = at;
  var vt = { default: { options: { html: false, xhtmlOut: false, breaks: false, langPrefix: "language-", linkify: false, typographer: false, quotes: "\u201C\u201D\u2018\u2019", highlight: null, maxNesting: 100 }, components: { core: {}, block: {}, inline: {} } }, zero: { options: { html: false, xhtmlOut: false, breaks: false, langPrefix: "language-", linkify: false, typographer: false, quotes: "\u201C\u201D\u2018\u2019", highlight: null, maxNesting: 20 }, components: { core: { rules: ["normalize", "block", "inline", "text_join"] }, block: { rules: ["paragraph"] }, inline: { rules: ["text"], rules2: ["balance_pairs", "fragments_join"] } } }, commonmark: { options: { html: true, xhtmlOut: true, breaks: false, langPrefix: "language-", linkify: false, typographer: false, quotes: "\u201C\u201D\u2018\u2019", highlight: null, maxNesting: 20 }, components: { core: { rules: ["normalize", "block", "inline", "text_join"] }, block: { rules: ["blockquote", "code", "fence", "heading", "hr", "html_block", "lheading", "list", "reference", "paragraph"] }, inline: { rules: ["autolink", "backticks", "emphasis", "entity", "escape", "html_inline", "image", "link", "newline", "text"], rules2: ["balance_pairs", "emphasis", "fragments_join"] } } } };
  var wt = /^(vbscript|javascript|file|data):/;
  var St = /^data:image\/(gif|png|jpeg|webp);/;
  function It(t4) {
    const e4 = t4.trim().toLowerCase();
    return !wt.test(e4) || St.test(e4);
  }
  var Lt = ["http:", "https:", "mailto:"];
  function zt(e4) {
    const n5 = d(e4, true);
    if (n5.hostname && (!n5.protocol || Lt.indexOf(n5.protocol) >= 0)) try {
      n5.hostname = C4.toASCII(n5.hostname);
    } catch (t4) {
    }
    return n(o(n5));
  }
  function Tt(e4) {
    const n5 = d(e4, true);
    if (n5.hostname && (!n5.protocol || Lt.indexOf(n5.protocol) >= 0)) try {
      n5.hostname = C4.toUnicode(n5.hostname);
    } catch (t4) {
    }
    return e(o(n5), e.defaultChars + "%");
  }
  function Et(t4, e4) {
    if (!(this instanceof Et)) return new Et(t4, e4);
    e4 || o5(t4) || (e4 = t4 || {}, t4 = "default"), this.inline = new Mt(), this.block = new lt(), this.core = new K(), this.renderer = new z(), this.linkify = new d3(), this.validateLink = It, this.normalizeLink = zt, this.normalizeLinkText = Tt, this.utils = S2, this.helpers = c5({}, I), this.options = {}, this.configure(t4), e4 && this.set(e4);
  }
  Et.prototype.set = function(t4) {
    return c5(this.options, t4), this;
  }, Et.prototype.configure = function(t4) {
    const e4 = this;
    if (o5(t4)) {
      const e5 = t4;
      if (!(t4 = vt[e5])) throw new Error('Wrong `markdown-it` preset "' + e5 + '", check name');
    }
    if (!t4) throw new Error("Wrong `markdown-it` preset, can't be empty");
    return t4.options && e4.set(t4.options), t4.components && Object.keys(t4.components).forEach(function(n5) {
      t4.components[n5].rules && e4[n5].ruler.enableOnly(t4.components[n5].rules), t4.components[n5].rules2 && e4[n5].ruler2.enableOnly(t4.components[n5].rules2);
    }), this;
  }, Et.prototype.enable = function(t4, e4) {
    let n5 = [];
    Array.isArray(t4) || (t4 = [t4]), ["core", "block", "inline"].forEach(function(e5) {
      n5 = n5.concat(this[e5].ruler.enable(t4, true));
    }, this), n5 = n5.concat(this.inline.ruler2.enable(t4, true));
    const r5 = t4.filter(function(t5) {
      return n5.indexOf(t5) < 0;
    });
    if (r5.length && !e4) throw new Error("MarkdownIt. Failed to enable unknown rule(s): " + r5);
    return this;
  }, Et.prototype.disable = function(t4, e4) {
    let n5 = [];
    Array.isArray(t4) || (t4 = [t4]), ["core", "block", "inline"].forEach(function(e5) {
      n5 = n5.concat(this[e5].ruler.disable(t4, true));
    }, this), n5 = n5.concat(this.inline.ruler2.disable(t4, true));
    const r5 = t4.filter(function(t5) {
      return n5.indexOf(t5) < 0;
    });
    if (r5.length && !e4) throw new Error("MarkdownIt. Failed to disable unknown rule(s): " + r5);
    return this;
  }, Et.prototype.use = function(t4) {
    const e4 = [this].concat(Array.prototype.slice.call(arguments, 1));
    return t4.apply(t4, e4), this;
  }, Et.prototype.parse = function(t4, e4) {
    if ("string" != typeof t4) throw new Error("Input data should be a String");
    const n5 = new this.core.State(t4, this, e4);
    return this.core.process(n5), n5.tokens;
  }, Et.prototype.render = function(t4, e4) {
    return e4 = e4 || {}, this.renderer.render(this.parse(t4, e4), this.options, e4);
  }, Et.prototype.parseInline = function(t4, e4) {
    const n5 = new this.core.State(t4, this, e4);
    return n5.inlineMode = true, this.core.process(n5), n5.tokens;
  }, Et.prototype.renderInline = function(t4, e4) {
    return e4 = e4 || {}, this.renderer.render(this.parseInline(t4, e4), this.options, e4);
  };

  // scripts/markdown-it/markdown-it-mark.js
  function ins_plugin(md2) {
    function tokenize(state, silent) {
      const start = state.pos;
      const marker = state.src.charCodeAt(start);
      if (silent) {
        return false;
      }
      if (marker !== 61) {
        return false;
      }
      const scanned = state.scanDelims(state.pos, true);
      let len = scanned.length;
      const ch = String.fromCharCode(marker);
      if (len < 2) {
        return false;
      }
      if (len % 2) {
        const token = state.push("text", "", 0);
        token.content = ch;
        len--;
      }
      for (let i6 = 0; i6 < len; i6 += 2) {
        const token = state.push("text", "", 0);
        token.content = ch + ch;
        if (!scanned.can_open && !scanned.can_close) {
          continue;
        }
        state.delimiters.push({
          marker,
          length: 0,
          // disable "rule of 3" length checks meant for emphasis
          jump: i6 / 2,
          // 1 delimiter = 2 characters
          token: state.tokens.length - 1,
          end: -1,
          open: scanned.can_open,
          close: scanned.can_close
        });
      }
      state.pos += scanned.length;
      return true;
    }
    function postProcess(state, delimiters) {
      const loneMarkers = [];
      const max = delimiters.length;
      for (let i6 = 0; i6 < max; i6++) {
        const startDelim = delimiters[i6];
        if (startDelim.marker !== 61) {
          continue;
        }
        if (startDelim.end === -1) {
          continue;
        }
        const endDelim = delimiters[startDelim.end];
        const token_o = state.tokens[startDelim.token];
        token_o.type = "mark_open";
        token_o.tag = "mark";
        token_o.nesting = 1;
        token_o.markup = "==";
        token_o.content = "";
        const token_c = state.tokens[endDelim.token];
        token_c.type = "mark_close";
        token_c.tag = "mark";
        token_c.nesting = -1;
        token_c.markup = "==";
        token_c.content = "";
        if (state.tokens[endDelim.token - 1].type === "text" && state.tokens[endDelim.token - 1].content === "=") {
          loneMarkers.push(endDelim.token - 1);
        }
      }
      while (loneMarkers.length) {
        const i6 = loneMarkers.pop();
        let j2 = i6 + 1;
        while (j2 < state.tokens.length && state.tokens[j2].type === "mark_close") {
          j2++;
        }
        j2--;
        if (i6 !== j2) {
          const token = state.tokens[j2];
          state.tokens[j2] = state.tokens[i6];
          state.tokens[i6] = token;
        }
      }
    }
    md2.inline.ruler.before("emphasis", "mark", tokenize);
    md2.inline.ruler2.before("emphasis", "mark", function(state) {
      let curr;
      const tokens_meta = state.tokens_meta;
      const max = (state.tokens_meta || []).length;
      postProcess(state, state.delimiters);
      for (curr = 0; curr < max; curr++) {
        if (tokens_meta[curr] && tokens_meta[curr].delimiters) {
          postProcess(state, tokens_meta[curr].delimiters);
        }
      }
    });
  }

  // scripts/md.js
  var md = new Et().use(ins_plugin);
  var attrs = (item) => {
    let attrs2 = item.attrs;
    if (!attrs2) return "";
    return Object.fromEntries(attrs2);
  };
  function eat(tree) {
    let ret = [];
    if (!tree) return "";
    while (tree.length > 0) {
      let item = tree.shift();
      if (item.nesting === 1) {
        let at2 = attrs(item);
        ret.push(h(item.tag, at2, eat(tree)));
      }
      if (item.nesting === 0) {
        if (!item.children || item.children.length === 0) {
          let p6 = item.type === "softbreak" ? h("br") : item.content;
          ret.push(p6);
        } else ret.push(eat(item.children));
      }
      if (item.nesting === -1) {
        break;
      }
    }
    return ret;
  }
  var safe_parse = (content) => {
    try {
      return md.parse(content, { html: true });
    } catch (e4) {
      console.log(e4);
      return void 0;
    }
  };
  var stupid_fix = (content) => {
    content = decodeHTML(content);
    if (content.charAt(0) === "#" && (content.charAt(1) !== " " || content.charAt(1) !== "#")) {
      let e4 = content.slice(1);
      return "# " + e4;
    }
    return content;
  };
  var MD = (content) => {
    content = stupid_fix(content);
    let tree = safe_parse(content);
    let body;
    if (tree) body = eat(tree);
    else body = content;
    return body;
  };
  var decodeHTML = function(str) {
    var map = {
      quot: '"',
      amp: "&",
      lt: "<",
      gt: ">",
      OElig: "\u0152",
      oelig: "\u0153",
      Scaron: "\u0160",
      scaron: "\u0161",
      Yuml: "\u0178",
      circ: "\u02C6",
      tilde: "\u02DC",
      ensp: "\u2002",
      emsp: "\u2003",
      thinsp: "\u2009",
      zwnj: "\u200C",
      zwj: "\u200D",
      lrm: "\u200E",
      rlm: "\u200F",
      ndash: "\u2013",
      mdash: "\u2014",
      lsquo: "\u2018",
      rsquo: "\u2019",
      sbquo: "\u201A",
      ldquo: "\u201C",
      rdquo: "\u201D",
      bdquo: "\u201E",
      dagger: "\u2020",
      Dagger: "\u2021",
      permil: "\u2030",
      lsaquo: "\u2039",
      rsaquo: "\u203A",
      fnof: "\u0192",
      Alpha: "\u0391",
      Beta: "\u0392",
      Gamma: "\u0393",
      Delta: "\u0394",
      Epsilon: "\u0395",
      Zeta: "\u0396",
      Eta: "\u0397",
      Theta: "\u0398",
      Iota: "\u0399",
      Kappa: "\u039A",
      Lambda: "\u039B",
      Mu: "\u039C",
      Nu: "\u039D",
      Xi: "\u039E",
      Omicron: "\u039F",
      Pi: "\u03A0",
      Rho: "\u03A1",
      Sigma: "\u03A3",
      Tau: "\u03A4",
      Upsilon: "\u03A5",
      Phi: "\u03A6",
      Chi: "\u03A7",
      Psi: "\u03A8",
      Omega: "\u03A9",
      alpha: "\u03B1",
      beta: "\u03B2",
      gamma: "\u03B3",
      delta: "\u03B4",
      epsilon: "\u03B5",
      zeta: "\u03B6",
      eta: "\u03B7",
      theta: "\u03B8",
      iota: "\u03B9",
      kappa: "\u03BA",
      lambda: "\u03BB",
      mu: "\u03BC",
      nu: "\u03BD",
      xi: "\u03BE",
      omicron: "\u03BF",
      pi: "\u03C0",
      rho: "\u03C1",
      sigmaf: "\u03C2",
      sigma: "\u03C3",
      tau: "\u03C4",
      upsilon: "\u03C5",
      phi: "\u03C6",
      chi: "\u03C7",
      psi: "\u03C8",
      omega: "\u03C9",
      thetasym: "\u03D1",
      upsih: "\u03D2",
      piv: "\u03D6",
      bull: "\u2022",
      hellip: "\u2026",
      prime: "\u2032",
      Prime: "\u2033",
      oline: "\u203E",
      frasl: "\u2044",
      weierp: "\u2118",
      image: "\u2111",
      real: "\u211C",
      trade: "\u2122",
      alefsym: "\u2135",
      larr: "\u2190",
      uarr: "\u2191",
      rarr: "\u2192",
      darr: "\u2193",
      harr: "\u2194",
      crarr: "\u21B5",
      lArr: "\u21D0",
      uArr: "\u21D1",
      rArr: "\u21D2",
      dArr: "\u21D3",
      hArr: "\u21D4",
      forall: "\u2200",
      part: "\u2202",
      exist: "\u2203",
      empty: "\u2205",
      nabla: "\u2207",
      isin: "\u2208",
      notin: "\u2209",
      ni: "\u220B",
      prod: "\u220F",
      sum: "\u2211",
      minus: "\u2212",
      lowast: "\u2217",
      radic: "\u221A",
      prop: "\u221D",
      infin: "\u221E",
      ang: "\u2220",
      and: "\u22A5",
      or: "\u22A6",
      cap: "\u2229",
      cup: "\u222A",
      int: "\u222B",
      there4: "\u2234",
      sim: "\u223C",
      cong: "\u2245",
      asymp: "\u2248",
      ne: "\u2260",
      equiv: "\u2261",
      le: "\u2264",
      ge: "\u2265",
      sub: "\u2282",
      sup: "\u2283",
      nsub: "\u2284",
      sube: "\u2286",
      supe: "\u2287",
      oplus: "\u2295",
      otimes: "\u2297",
      perp: "\u22A5",
      sdot: "\u22C5",
      lceil: "\u2308",
      rceil: "\u2309",
      lfloor: "\u230A",
      rfloor: "\u230B",
      lang: "\u3008",
      rang: "\u3009",
      loz: "\u25CA",
      spades: "\u2660",
      clubs: "\u2663",
      hearts: "\u2665",
      diams: "\u2666",
      nbsp: " ",
      iexcl: "\xA1",
      cent: "\xA2",
      pound: "\xA3",
      curren: "\xA4",
      yen: "\xA5",
      brvbar: "\xA6",
      sect: "\xA7",
      uml: "\xA8",
      copy: "\xA9",
      ordf: "\xAA",
      laquo: "\xAB",
      not: "\xAC",
      shy: "\xAD",
      reg: "\xAE",
      macr: "\xAF",
      deg: "\xB0",
      plusmn: "\xB1",
      sup2: "\xB2",
      sup3: "\xB3",
      acute: "\xB4",
      micro: "\xB5",
      para: "\xB6",
      middot: "\xB7",
      cedil: "\xB8",
      sup1: "\xB9",
      ordm: "\xBA",
      raquo: "\xBB",
      frac14: "\xBC",
      frac12: "\xBD",
      frac34: "\xBE",
      iquest: "\xBF",
      Agrave: "\xC0",
      Aacute: "\xC1",
      Acirc: "\xC2",
      Atilde: "\xC3",
      Auml: "\xC4",
      Aring: "\xC5",
      AElig: "\xC6",
      Ccedil: "\xC7",
      Egrave: "\xC8",
      Eacute: "\xC9",
      Ecirc: "\xCA",
      Euml: "\xCB",
      Igrave: "\xCC",
      Iacute: "\xCD",
      Icirc: "\xCE",
      Iuml: "\xCF",
      ETH: "\xD0",
      Ntilde: "\xD1",
      Ograve: "\xD2",
      Oacute: "\xD3",
      Ocirc: "\xD4",
      Otilde: "\xD5",
      Ouml: "\xD6",
      times: "\xD7",
      Oslash: "\xD8",
      Ugrave: "\xD9",
      Uacute: "\xDA",
      Ucirc: "\xDB",
      Uuml: "\xDC",
      Yacute: "\xDD",
      THORN: "\xDE",
      szlig: "\xDF",
      agrave: "\xE0",
      aacute: "\xE1",
      acirc: "\xE2",
      atilde: "\xE3",
      auml: "\xE4",
      aring: "\xE5",
      aelig: "\xE6",
      ccedil: "\xE7",
      egrave: "\xE8",
      eacute: "\xE9",
      ecirc: "\xEA",
      euml: "\xEB",
      igrave: "\xEC",
      iacute: "\xED",
      icirc: "\xEE",
      iuml: "\xEF",
      eth: "\xF0",
      ntilde: "\xF1",
      ograve: "\xF2",
      oacute: "\xF3",
      ocirc: "\xF4",
      otilde: "\xF5",
      ouml: "\xF6",
      divide: "\xF7",
      oslash: "\xF8",
      ugrave: "\xF9",
      uacute: "\xFA",
      ucirc: "\xFB",
      uuml: "\xFC",
      yacute: "\xFD",
      thorn: "\xFE",
      yuml: "\xFF"
    };
    return str.replace(/&(#(?:x[0-9a-f]+|\d+)|[a-z]+);?/gi, function($0, $1) {
      if ($1[0] === "#") {
        return String.fromCharCode(
          $1[1].toLowerCase() === "x" ? parseInt($1.substr(2), 16) : parseInt($1.substr(1), 10)
        );
      } else {
        return map.hasOwnProperty($1) ? map[$1] : $0;
      }
    });
  };

  // scripts/script.ts
  var channel_slug = "isp-presenting";
  var selected = sig([]);
  var current_block_id = sig(null);
  var store = mut(new CanvasStore());
  var current_block = mem(() => store.get_node(current_block_id()));
  var small_box = document.querySelector(".small-box");
  var recter = document.querySelector(".small-box-recter");
  var recter_on = sig(false);
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
      let w4, h8, x3, y2;
      if (lastPosX > ogX) {
        w4 = lastPosX - ogX;
        x3 = ogX;
      } else {
        w4 = ogX - lastPosX;
        x3 = lastPosX;
      }
      if (lastPosY > ogY) {
        h8 = lastPosY - ogY;
        y2 = ogY;
      } else {
        h8 = ogY - lastPosY;
        y2 = lastPosY;
      }
      if (rect) {
        rect.style.width = w4 + "px";
        rect.style.height = h8 + "px";
        rect.style.left = x3 + "px";
        rect.style.top = y2 + "px";
      }
    }
    function handle_pointerdown(e4) {
      if (e4.target !== e4.currentTarget) return;
      e4.preventDefault();
      e4.stopPropagation();
      e4.target.style.cursor = "crosshair";
      ogX = e4.offsetX;
      ogY = e4.offsetY;
      lastPosX = ogX;
      lastPosY = ogY;
      const { width: pwidth1 } = e4.target.parentNode.getBoundingClientRect();
      const pwidth2 = e4.target.parentNode.offsetWidth;
      parentScale = pwidth1 / pwidth2;
      let bor = 10;
      rect = document.createElement("div");
      rect.style.position = "absolute";
      rect.style.left = e4.offsetX + "px";
      rect.style.top = e4.offsetY + "px";
      rect.style.width = "0px";
      rect.style.height = "0px";
      rect.style.border = bor + "px solid black";
      rect.id = "rect";
      small_box?.appendChild(rect);
      e4.target.setPointerCapture(e4.pointerId);
    }
    function handle_pointermove(e4) {
      if (e4.target !== e4.currentTarget) return;
      if (!e4.target.hasPointerCapture(e4.pointerId)) return;
      e4.preventDefault();
      e4.stopPropagation();
      const deltaX = e4.movementX / parentScale;
      const deltaY = e4.movementY / parentScale;
      do_move(deltaX, deltaY);
    }
    function handle_pointerup(e4) {
      e4.preventDefault();
      e4.stopPropagation();
      e4.target.style.cursor = "";
      e4.target.releasePointerCapture(e4.pointerId);
      if (rect) {
        let x3 = parseFloat(rect.style.left);
        let y2 = parseFloat(rect.style.top);
        let w4 = parseFloat(rect.style.width);
        let h8 = parseFloat(rect.style.height);
        rect?.remove();
        rect = null;
        recter.style.display = "none";
        recter_on.set(false);
        panzoom.resume();
        if ("function" == typeof rect_event) rect_event(x3, y2, w4, h8);
      }
    }
  };
  rectange_maker(recter);
  get_channel(channel_slug).then((c6) => {
    let blocks_cache = localStorage.getItem(channel_slug);
    console.log("", c6);
    let blocks;
    if (blocks_cache) {
      blocks = JSON.parse(blocks_cache);
    }
    c6.contents.forEach((block) => {
      let pos;
      if (blocks) {
        let x3 = blocks[block.id].x;
        let y2 = blocks[block.id].y;
        pos = { x: parseInt(x3), y: parseInt(y2) };
      }
      if (block.class == "Channel") {
        store.add_channel_as_node(block, pos);
      } else if (block.base_class == "Block") {
        console.log("adding block pos", pos);
        store.add_block_as_node(block);
      }
    });
  });
  var panning = sig(true);
  function intersecting(a6, b2) {
    return a6.left <= b2.right && b2.left <= a6.right && a6.top <= b2.bottom && b2.top <= a6.bottom;
  }
  var intersecting_blocks = (x3, y2, w4, h8) => {
    store.contents.forEach((block) => {
      if (block.class == "Group") return;
      let id = block.id;
      let in_group = store.check_if_node_in_group(id);
      let global_pos = store.get_global_position(id);
      let dimension = store.get_dimensions(id);
      if (!global_pos || !dimension || in_group) return;
      let rect = {
        left: global_pos.x,
        top: global_pos.y,
        right: global_pos.x + dimension.width,
        bottom: global_pos.y + dimension.height
      };
      let other = {
        left: x3,
        top: y2,
        right: x3 + w4,
        bottom: y2 + h8
      };
      if (intersecting(rect, other)) selected.set([...selected(), block.id]);
    });
  };
  var Group = (group) => {
    let x3 = mem(() => group.x);
    let y2 = mem(() => group.y);
    let width = mem(() => group.width);
    let height = mem(() => group.height);
    let children_nodes = mem(() => group.children.map((id) => store.get_node(id)));
    let onmount = () => {
      let elem = document.getElementById("group-" + group.id);
      drag(elem, { set_left: (x4) => {
        group.x = x4;
      }, set_top: (y3) => {
        group.y = y3;
      } });
    };
    mounted(onmount);
    let style2 = mem(() => `
		left: ${x3()}px;
		top: ${y2()}px;
		width: ${width()}px;
		height: ${height()}px;
		background-color: rgba(0, 0, 0, 0.1)
	`);
    return h2`
	.block.group [style=${style2} id=${"group-" + group.id}] 
		each of ${children_nodes} as ${(b2) => Block(b2, true)}`;
  };
  var State = () => {
    let mode = mem(() => panning() ? "Panning" : "Selecting");
    let recter_on_is = mem(() => recter_on() ? "on" : "off");
    return h2`
		.state
			p -- Mode (v): ${mode}
			p -- Recter (z/s):${recter_on_is}
			p -- ${current_block_id}
		`;
  };
  var Block = (block, grouped = false) => {
    if (store.check_if_node_in_group(block.id) && !grouped) {
      return null;
    }
    if (block.base_class == "Group") return Group(block);
    let node = store.get_node(block.id);
    if (!node) return;
    let x3 = mem(() => node.x);
    let y2 = mem(() => node.y);
    let width = mem(() => node.width);
    let height = mem(() => node.height);
    let set_x = (x4) => node.x = x4;
    let set_y = (y3) => node.y = y3;
    let onmount = () => {
      let elem = document.getElementById("block-" + block.id);
      drag(elem, { set_left: set_x, set_top: set_y, pan_switch: panning });
      elem.onmouseover = () => {
        current_block_id.set(block.id);
      };
    };
    let block_selected = mem(() => selected().includes(block.id));
    let current_block2 = mem(() => current_block_id() == block.id);
    let style2 = mem(() => `left:${x3()}px; top:${y2()}px; width:${width()}px; height:${height()}px;background-color:${block_selected() ? "red" : "white"}; border: ${current_block2() ? "2px solid black" : "none"}`);
    if (block.class == "Text") return TextBlock(block, style2, onmount);
    if (block.class == "Image" || block.class == "Link") return ImageBlock(block, style2, onmount);
    if (block.class == "Attachment") return AttachmentBlock(block, style2, onmount);
  };
  var AttachmentBlock = (block, style2, onmount) => {
    if (!block.source.attachment) return null;
    console.log("attaches block", block.source.attachment);
    console.log("attaches block url", block.source.attachment.url);
    mounted(onmount);
    let s4 = "width:100%";
    return h2`
		.block.attachment [style=${style2} id=${"block-" + block.id}]
			video [style=${s4} src=${block.source.attachment.url} controls=true autoplay=true loop=true]`;
  };
  var ImageBlock = (block, style2, onmount) => {
    let image = block.source.image;
    mounted(onmount);
    let s4 = "width:100%";
    return h2`
		.block.image[style = ${style2} id = ${"block-" + block.id}]
			img[src = ${image.display.url} style = ${s4}]`;
  };
  var TextBlock = (block, style2, onmount) => {
    let content = block.source.content;
    mounted(onmount);
    return h2`.block.text[style = ${style2} id = ${"block-" + block.id}]--${MD(content)} `;
  };
  var Line = (line) => {
    let coords = mem(() => line.points.list.map((point) => {
      return `${point.x},${point.y}`;
    }).join(" "));
    return h2`polyline [points=${coords} style=fill:none;stroke:black;stroke-width:2 ]`;
  };
  var LineEditor = (line) => {
    return h2`
		each of ${line.points.list} as ${(point) => PointRect(point)}
`;
  };
  var PointRect = (point) => {
    let x3 = mem(() => point.x);
    let y2 = mem(() => point.y);
    let id = uid();
    let onmount = () => {
      let elem = document.getElementById("point-" + id);
      drag(elem, { bound: "none", set_left: (x4) => {
        point.x = x4;
      }, set_top: (y3) => {
        point.y = y3;
      } });
    };
    mounted(onmount);
    return h2`div.box [id=${"point-" + id} style=${mem(() => `position:absolute; left:${x3()}px; top:${y2()}px; width:10px; height:10px; background-color:red; border: 1px solid black`)}]`;
  };
  var Channel = () => {
    return h2`
		each of ${mem(() => store.contents)} as ${Block}`;
  };
  var Lines = () => {
    let width = small_box.clientWidth;
    let height = small_box.clientHeight;
    return h2`
		div
			svg [width=${width} height=${height}]
				each of ${mem(() => store.lines)} as ${Line}
			div
				each of ${mem(() => store.lines)} as ${LineEditor}`;
  };
  function save_block_coordinates() {
    let blocks = {};
    let nodes = store.contents;
    nodes.forEach((node) => {
      if (node.base_class == "Group") return;
      let id = node.id;
      let pos = store.get_global_position(id);
      if (!pos) return;
      blocks[id] = { x: pos.x, y: pos.y, width: node.width, height: node.height };
    });
    localStorage.setItem(channel_slug, JSON.stringify(blocks));
  }
  document.addEventListener("keydown", (e4) => {
    if (e4.key === "H") {
      current_block().width = current_block().width - 10;
    }
    if (e4.key === "L") {
      current_block().width = current_block().width + 10;
    }
    if (e4.key === "K") {
      current_block().height = current_block().height - 10;
    }
    if (e4.key === "J") {
      current_block().height = current_block().height + 10;
    }
    if (e4.key === "g") {
      group_selected();
    }
    if (e4.key === "d") {
      let selected_elems = selected();
      selected_elems.forEach((id) => {
        let node = store.get_node(id);
        if (!node) return;
        let new_node = { ...node, id: uid() };
        store.contents.push(new_node);
      });
    }
    if (e4.key === "z") {
      if (recter.style.display == "block") {
        recter.style.display = "none";
        panzoom.resume();
        recter_on.set(false);
      } else {
        rect_event = (x3, y2, w4, h8) => {
          let r5 = {
            top: y2,
            left: x3,
            right: x3 + w4,
            bottom: y2 + h8
          };
          panzoom.showRectangle(r5);
        };
        recter.style.display = "block";
        panzoom.pause();
        recter_on.set(true);
      }
    }
    if (e4.key === "v") {
      panning.set(!panning());
    }
    if (e4.key === "s") {
      if (recter.style.display == "block") {
        recter.style.display = "none";
        recter_on.set(false);
        panzoom.resume();
      } else {
        rect_event = intersecting_blocks;
        recter.style.display = "block";
        recter_on.set(true);
        panzoom.pause();
      }
    }
    if (e4.key == "=" && (e4.metaKey || e4.ctrlKey)) {
      e4.preventDefault();
    }
    if (e4.key == "-" && (e4.metaKey || e4.ctrlKey)) {
      e4.preventDefault();
    }
    if (e4.key === "1") {
    }
    if (e4.key === "2") {
    }
    if (e4.key === "Escape") {
      selected.set([]);
    }
    if (e4.key === "ArrowRight") {
    }
    if (e4.key === "ArrowLeft") {
    }
    if (e4.key === "ArrowDown") {
    }
    if (e4.key === "ArrowUp") {
    }
    if (e4.key === "s") {
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
    let lefts = selected_elems.map((id) => store.get_global_position(id)?.x).filter((x3) => x3 !== void 0);
    let tops = selected_elems.map((id) => store.get_global_position(id)?.y).filter((y2) => y2 !== void 0);
    let lowest_x = Math.min(...lefts);
    let lowest_y = Math.min(...tops);
    let end_xs = selected_elems.map((id) => {
      let node = store.get_box(id);
      return node?.right;
    }).filter((x3) => x3 !== void 0);
    let end_ys = selected_elems.map((id) => {
      let node = store.get_box(id);
      return node?.bottom;
    }).filter((y2) => y2 !== void 0);
    let highest_x = Math.max(...end_xs);
    let highest_y = Math.max(...end_ys);
    store.add_group_as_node(
      uid(),
      selected_elems,
      { x: lowest_x, y: lowest_y },
      { width: highest_x - lowest_x, height: highest_y - lowest_y }
    );
    selected_elems.forEach((id) => {
      let node = store.get_node(id);
      if (!node) return;
      node.x = node.x - lowest_x;
      node.y = node.y - lowest_y;
    });
  }
  render(Channel, document.querySelector(".small-box"));
  render(Lines, document.querySelector(".small-box"));
  render(State, document.body);
})();
