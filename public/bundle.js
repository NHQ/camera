(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var camera = require('film')

//var controls = require('./controls')()
var userMediaStream = require('./sources')//require('./getUserMedia.js')({audio: false, video: true})

//document.body.appendChild(controls)
//console.log(controls)
var ui = require('getids')()
var videoEl = document.getElementById('source')
var film = document.getElementById('film')
var mirror = document.getElementById('mirror')
var on = require('on-off')

var controller = null

var bjork

//mirror.style.display = 'none'
ui.display.removeChild(videoEl)

userMediaStream.on('stream', function(stream){
    
    var video = videoEl.cloneNode(true)

    bjork = window.URL.createObjectURL(stream) 

    video.src = bjork

    video.onloadedmetadata = function(){
      console.log(this.videoWidth, this.videoHeight)
    }

    video.play()

    if(controller) {// source reboot
    
      display.removeChild(document.body.querySelector('#source')) 
      
      controller.emit('update', stream, video, mirror, film)

      on.off(snap, clickSnap)

    }

    controller = camera(stream, video, mirror, film)

    display.insertBefore(video, film)

    controller.on('expose', function(data){
        var render = film.getContext('2d')
        render.putImageData(data, 0, 0)
        var url = film.toDataURL()
    })

    on(snap, 'click', clickSnap) 
    

/*
    setInterval(function(){
      controller.expose({shutterSpeed: 1000/16, filmSpeed:{
        r: 1,
        g: 1,
        b: 1 
      }})
    }, 1000/16)

    setInterval(function(){
//      controller.snapShot({shutterSpeed: 2000})
    }, 1000/16) 
*/  
})

function clickSnap (){
  controller.expose({shutterSpeed: 100, filmSpeed: 4.2})
}

},{"./sources":7,"film":2,"getids":4,"on-off":5}],2:[function(require,module,exports){
require('./reqFrame')
var emitter = require('events').EventEmitter
var Time = require('since-when')

module.exports = function(stream, video, mirror, film){
	
    
	var app = new emitter();

  app.on('update', function(s,v,m,f){
    stream = s
    video = v
    mirror = m
    film = f

  })

	app.snapShot = snapShot;
	app.record = record;
	app.expose = expose;

    var recording = false;
	var frames = [];
	
	return app // {snapShot: snapShot, record: record, expose: expose}
	
	function getTime(){
	    var t
	    
	    return
	    
	    window.requestAnimationFrame(timer)
	    
	    function timer(time){t = time}
	}
	
	function snapShot(){
    	var reflection = mirror.getContext('2d');
    	reflection.drawImage(video, 0, 0);
	    var p = reflection.getImageData(0, 0, mirror.width, mirror.height)
        app.emit('snapshot', p)
	}

    function record(){
        if(recording){
            app.emit('record', frames)
            recording = false
        }
        recording = true;
        frames = [];
        var reflection = mirror.getContext('2d');
        window.requestAnimationFrame(rec)		
    	
        function rec(time){
        	window.requestAnimationFrame(rec)
        	reflection.drawImage(video, 0, 0)
    	    var frame = reflection.getImageData(0, 0, mirror.width, mirror.height)
    	    frames.push(frame)
    	}
    	
    }
    
    function expose(params){
        
        var fps = 0
        var frames = []
        var time = Time()

console.log(time)
        var defaults = {
            shutterSpeed: 3,
            invert: false,
            filmSpeed: {
                r: 1,
                g: 1,
                b: 1
            },
            r: 0,
            g: 0,
            b: 0,
            a: 255
        }
        
        if(!params){
            params = defaults
        }
            	
        else {
            for (var attrname in defaults) {
                if(typeof params.filmSpeed == 'number'){
                    var n = params.filmSpeed;
                    params.filmSpeed = {
                        r: n,
                        g: n,
                        b: n
                    }
                }
                if(!params[attrname] && params[attrname] != 0) params[attrname] = defaults[attrname]
            }
        }
      var d = 0;
      var start = 0
    	var reflection = mirror.getContext('2d')
    	var render = film.getContext('2d')

    	var pos = render.getImageData(0,0,film.width, film.height)
        
        if(params.blob){
            var positive = params.blob           
        }
        else{
            var positive = new Uint8ClampedArray(pos.data.length)

        	for(var m = 0; m < mirror.width * mirror.height; m++){
        	    var index = m * 4;
        	    positive[index] = params.r;
        	    positive[index + 1] = params.g;
                positive[index + 2] = params.b;
                positive[index + 3] = params.a
        	}   
        }
        
    	window.requestAnimationFrame(function(_time){
          frames.push(time.sinceLast())
    	    d = _time + params.shutterSpeed
    	    window.requestAnimationFrame(f)
    	})
    	
        function f(_time){
        	frames.push(time.sinceLast())
          reflection.drawImage(video, 0, 0)
        	var negative = reflection.getImageData(0,0,mirror.width,mirror.height);  
                for(n=0; n<negative.width*negative.height; n++) {  
                    var index = n*4;   
                    positive[index+0] =  vert(positive[index+0], (negative.data[index] / params.filmSpeed.r));
                    positive[index+1] =  vert(positive[index+1], (negative.data[index+1] / params.filmSpeed.g));
                    positive[index+2] =  vert(positive[index+2], (negative.data[index+2] / params.filmSpeed.b));
                    positive[index + 3] = params.a;
                }
            pos.data.set(positive)
            reflection.putImageData(pos, 0, 0)
        	if(_time > d) {
              console.log(params.shutterSpeed / (frames.reduce(function(p,e){ return p + e[1] / 1e6}, 0)/frames.length))
        	    var p = reflection.getImageData(0,0,mirror.width, mirror.height)
              p.data.set(positive)
              app.emit('expose', p)
        	    window.cancelAnimationFrame(f)
    	        return
    	    }
          else window.requestAnimationFrame(f)
        }
        
        function vert(a, b){
            if(params.invert){
                return a - b
            }
            else return a + b
        }
    }
    
    function animate(time){
    	window.requestAnimationFrame(animate)
    	render = mirror.getContext('2d')
    	render.drawImage(video, 0, 0)	
	}    
	
		
}

},{"./reqFrame":3,"events":8,"since-when":6}],3:[function(require,module,exports){
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());
},{}],4:[function(require,module,exports){
module.exports = function(el){

    var ids = {};

    if('string' == typeof el) el = document.getElementById(el);

    if(!el) el = document;

    var children = el.getElementsByTagName('*');

    Array.prototype.forEach.call(children, function(e){

	if(e.id.length > 0){

	    ids[e.id] = e

	}

    })

    return ids

}

},{}],5:[function(require,module,exports){
module.exports = on;
module.exports.on = on;
module.exports.off = off;

function on (element, event, callback, capture) {
  (element.addEventListener || element.attachEvent).call(element, event, callback, capture);
  return callback;
}

function off (element, event, callback, capture) {
  (element.removeEventListener || element.detachEvent).call(element, event, callback, capture);
  return callback;
}

},{}],6:[function(require,module,exports){
(function (process){
var ms2s = 1.0 / 1000.0;
var ns2ms = 1.0 / 1000000.0
var ns2s = 1e-9

module.exports = T

function T(){
	if(!process.hrtime){ // browser fill

		process.hrtime = function(){

			if(arguments.length){
				arguments[1] = new Date().getTime();
				arguments[0] =  arguments[1] - millies(arguments[0])
			}

			else {
				arguments[0] = new Date().getTime();
			}
			
			return [parseInt(arguments[0] * ms2s), parseInt(((arguments[0] * ms2s) % 1) / ns2s)];
			
		}
	}
  if(!(this instanceof T)) return new T();
  var self = this;
  self.start = self.last = self.beat = process.hrtime();
  self.x = []
  self.end = []
  self.beats =  []
  self.averageSetSize = 333
  self.threshold = 1e6 // 10,000,000 ns ( 10 ms )
  self.skip = false
};

T.prototype.sinceBegin = function(){
  return process.hrtime(this.start)
};

T.prototype.sinceLast = function(){
  this.x = process.hrtime(this.last)
  this.last = process.hrtime()
  return this.x
}

T.prototype.sinceLastNS = function(){
  return nanos(this.sinceLast())
};

T.prototype.sinceBeginNS = function(){
  return nanos(this.sinceBegin())
};

T.prototype.avg = function(){
  var ns = nanos(this.sinceLast())
  this.beats.push(ns);
  this.beats = this.beats.splice(-this.averageSetSize)
  return avg(this.beats);
};

T.prototype.everyS = function(s, fn, go){
	this.every(s * 1e9, fn, go)
}

T.prototype.every = function(ns, fn, go){

  var self = new T();
  var timer = new T();

  var inter = ns || 0
    , fn = fn || function(t,c){c()}
    ;   
      
  function tick(){

    var ns = nanos(self.sinceLast());
//  unnecessary cuz no longer trying to optimize in loop()
//    self.beats.push(ns);
    loop()

  };

  function loop(){
    var d = inter - (nanos(process.hrtime()) - nanos(self.beat));

    if(d < 10000) {
      tock()
    }

    else if(self.skip) {
     setImmediate(loop)
    }

    else if(d < self.threshold) {
      // under the threshold, its nextTicks until the interval is up
      self.skip = true; setImmediate(loop) 
    }

    else {
      if(false && self.beats.length > 9) {
	var r = self.beats.length / self.averageSetSize;
        self.threshold = avg(self.beats) * .45 * r * 2
      }

      // for future reference:
      // console.log(avg(self.beats), self.beats.length, 'threshold = ' + self.threshold)

      self.skip = false; 
      setTimeout(loop, self.threshold / 1e6)
    }
  };

  function tock(){
    self.beat = process.hrtime();
    self.skip = false;
    fn(tick, nanos(timer.sinceLast()))
  };
  
  if(go) tock()

  else loop()

}

function millies(arr){
	return (arr[0] * 1e3) + (arr[1] * ns2ms)
}

function nanos(arr){
  return arr[0] * 1e9 + arr[1]
}

function add(a, b){
  var ns = a[1] + b[1];
  b[0] += a[0];
  b[1] = ns % 1e9;
  if(ns !== b[1]) b[0]++;
  return b
};

function avg(){

  return Array.prototype.slice.call(arguments[0]).reduce(function(a,i){return a += i },0) / arguments[0].length

}

}).call(this,require('_process'))
},{"_process":9}],7:[function(require,module,exports){
var em = require('events').EventEmitter
var om = new em
//var audioSelect = document.querySelector('select#audioSource');
var videoSelect = document.querySelector('select#videoSource');

navigator.getUserMedia = navigator.getUserMedia ||
  navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

module.exports = om

function gotSources(sourceInfos) {
  var audioSelections = 0
  var videoSelections = 0
  for (var i = 0; i !== sourceInfos.length; ++i) {
    var sourceInfo = sourceInfos[i];
    var option = document.createElement('option');
    option.value = sourceInfo.id;
    if (sourceInfo.kind === 'audioinput') {
      continue // no audio in baescam
      option.text = sourceInfo.label || 'microphone ' +
      ++audioSelections
      audioSelect.appendChild(option);
    } else if (sourceInfo.kind === 'videoinput') {
      option.text = sourceInfo.label || 'camera ' + (++videoSelections);
      ++videoSelections
      videoSelect.appendChild(option);
    } else {
      console.log('Some other kind of source: ', sourceInfo);
    }
  }
}

if (typeof MediaStreamTrack === 'undefined' ||
    typeof navigator.mediaDevices.enumerateDevices === 'undefined') {
  alert('This browser does not support MediaStreamTrack.\n\nTry Chrome.');
} else {
  navigator.mediaDevices.enumerateDevices().then(gotSources)
}

function successCallback(stream) {
  om.emit('stream', stream)
}

function errorCallback(error) {
//  document.body.innerText = JSON.stringify(error)
  om.emit('error', error);
}

function start() {
//  var audioSource = audioSelect.value;
  var videoSource = videoSelect.value;
  var constraints = {
    audio: false,
/*
    audio: !(Boolean(audioSource)) ? false : {
      optional: [{
        sourceId: audioSource
      }]
    },
*/
    video: !(Boolean(videoSource)) ? true : {
        width: 1280,
        height: 720,
        sourceId: videoSource
    }
  };
  navigator.getUserMedia(constraints, successCallback, errorCallback);
}

//audioSelect.onchange = start;
videoSelect.onchange = start;

//start();


},{"events":8}],8:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],9:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[1]);
