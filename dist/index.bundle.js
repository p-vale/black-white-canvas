/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/canvas-sketch-util/lib/wrap.js":
/*!*****************************************************!*\
  !*** ./node_modules/canvas-sketch-util/lib/wrap.js ***!
  \*****************************************************/
/***/ ((module) => {

module.exports = wrap;
function wrap (value, from, to) {
  if (typeof from !== 'number' || typeof to !== 'number') {
    throw new TypeError('Must specify "to" and "from" arguments as numbers');
  }
  // algorithm from http://stackoverflow.com/a/5852628/599884
  if (from > to) {
    var t = from;
    from = to;
    to = t;
  }
  var cycle = to - from;
  if (cycle === 0) {
    return to;
  }
  return value - cycle * Math.floor((value - from) / cycle);
}


/***/ }),

/***/ "./node_modules/canvas-sketch-util/math.js":
/*!*************************************************!*\
  !*** ./node_modules/canvas-sketch-util/math.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var defined = __webpack_require__(/*! defined */ "./node_modules/defined/index.js");
var wrap = __webpack_require__(/*! ./lib/wrap */ "./node_modules/canvas-sketch-util/lib/wrap.js");
var EPSILON = Number.EPSILON;

function clamp (value, min, max) {
  return min < max
    ? (value < min ? min : value > max ? max : value)
    : (value < max ? max : value > min ? min : value);
}

function clamp01 (v) {
  return clamp(v, 0, 1);
}

function lerp (min, max, t) {
  return min * (1 - t) + max * t;
}

function inverseLerp (min, max, t) {
  if (Math.abs(min - max) < EPSILON) return 0;
  else return (t - min) / (max - min);
}

function smoothstep (min, max, t) {
  var x = clamp(inverseLerp(min, max, t), 0, 1);
  return x * x * (3 - 2 * x);
}

function toFinite (n, defaultValue) {
  defaultValue = defined(defaultValue, 0);
  return typeof n === 'number' && isFinite(n) ? n : defaultValue;
}

function expandVector (dims) {
  if (typeof dims !== 'number') throw new TypeError('Expected dims argument');
  return function (p, defaultValue) {
    defaultValue = defined(defaultValue, 0);
    var scalar;
    if (p == null) {
      // No vector, create a default one
      scalar = defaultValue;
    } else if (typeof p === 'number' && isFinite(p)) {
      // Expand single channel to multiple vector
      scalar = p;
    }

    var out = [];
    var i;
    if (scalar == null) {
      for (i = 0; i < dims; i++) {
        out[i] = toFinite(p[i], defaultValue);
      }
    } else {
      for (i = 0; i < dims; i++) {
        out[i] = scalar;
      }
    }
    return out;
  };
}

function lerpArray (min, max, t, out) {
  out = out || [];
  if (min.length !== max.length) {
    throw new TypeError('min and max array are expected to have the same length');
  }
  for (var i = 0; i < min.length; i++) {
    out[i] = lerp(min[i], max[i], t);
  }
  return out;
}

function newArray (n, initialValue) {
  n = defined(n, 0);
  if (typeof n !== 'number') throw new TypeError('Expected n argument to be a number');
  var out = [];
  for (var i = 0; i < n; i++) out.push(initialValue);
  return out;
}

function linspace (n, opts) {
  n = defined(n, 0);
  if (typeof n !== 'number') throw new TypeError('Expected n argument to be a number');
  opts = opts || {};
  if (typeof opts === 'boolean') {
    opts = { endpoint: true };
  }
  var offset = defined(opts.offset, 0);
  if (opts.endpoint) {
    return newArray(n).map(function (_, i) {
      return n <= 1 ? 0 : ((i + offset) / (n - 1));
    });
  } else {
    return newArray(n).map(function (_, i) {
      return (i + offset) / n;
    });
  }
}

function lerpFrames (values, t, out) {
  t = clamp(t, 0, 1);

  var len = values.length - 1;
  var whole = t * len;
  var frame = Math.floor(whole);
  var fract = whole - frame;

  var nextFrame = Math.min(frame + 1, len);
  var a = values[frame % values.length];
  var b = values[nextFrame % values.length];
  if (typeof a === 'number' && typeof b === 'number') {
    return lerp(a, b, fract);
  } else if (Array.isArray(a) && Array.isArray(b)) {
    return lerpArray(a, b, fract, out);
  } else {
    throw new TypeError('Mismatch in value type of two array elements: ' + frame + ' and ' + nextFrame);
  }
}

function mod (a, b) {
  return ((a % b) + b) % b;
}

function degToRad (n) {
  return n * Math.PI / 180;
}

function radToDeg (n) {
  return n * 180 / Math.PI;
}

function fract (n) {
  return n - Math.floor(n);
}

function sign (n) {
  if (n > 0) return 1;
  else if (n < 0) return -1;
  else return 0;
}

// Specific function from Unity / ofMath, not sure its needed?
// function lerpWrap (a, b, t, min, max) {
//   return wrap(a + wrap(b - a, min, max) * t, min, max)
// }

function pingPong (t, length) {
  t = mod(t, length * 2);
  return length - Math.abs(t - length);
}

function damp (a, b, lambda, dt) {
  return lerp(a, b, 1 - Math.exp(-lambda * dt));
}

function dampArray (a, b, lambda, dt, out) {
  out = out || [];
  for (var i = 0; i < a.length; i++) {
    out[i] = damp(a[i], b[i], lambda, dt);
  }
  return out;
}

function mapRange (value, inputMin, inputMax, outputMin, outputMax, clamp) {
  // Reference:
  // https://openframeworks.cc/documentation/math/ofMath/
  if (Math.abs(inputMin - inputMax) < EPSILON) {
    return outputMin;
  } else {
    var outVal = ((value - inputMin) / (inputMax - inputMin) * (outputMax - outputMin) + outputMin);
    if (clamp) {
      if (outputMax < outputMin) {
        if (outVal < outputMax) outVal = outputMax;
        else if (outVal > outputMin) outVal = outputMin;
      } else {
        if (outVal > outputMax) outVal = outputMax;
        else if (outVal < outputMin) outVal = outputMin;
      }
    }
    return outVal;
  }
}

module.exports = {
  mod: mod,
  fract: fract,
  sign: sign,
  degToRad: degToRad,
  radToDeg: radToDeg,
  wrap: wrap,
  pingPong: pingPong,
  linspace: linspace,
  lerp: lerp,
  lerpArray: lerpArray,
  inverseLerp: inverseLerp,
  lerpFrames: lerpFrames,
  clamp: clamp,
  clamp01: clamp01,
  smoothstep: smoothstep,
  damp: damp,
  dampArray: dampArray,
  mapRange: mapRange,
  expand2D: expandVector(2),
  expand3D: expandVector(3),
  expand4D: expandVector(4)
};


/***/ }),

/***/ "./node_modules/canvas-sketch-util/random.js":
/*!***************************************************!*\
  !*** ./node_modules/canvas-sketch-util/random.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var seedRandom = __webpack_require__(/*! seed-random */ "./node_modules/seed-random/index.js");
var SimplexNoise = __webpack_require__(/*! simplex-noise */ "./node_modules/simplex-noise/simplex-noise.js");
var defined = __webpack_require__(/*! defined */ "./node_modules/defined/index.js");

function createRandom (defaultSeed) {
  defaultSeed = defined(defaultSeed, null);
  var defaultRandom = Math.random;
  var currentSeed;
  var currentRandom;
  var noiseGenerator;
  var _nextGaussian = null;
  var _hasNextGaussian = false;

  setSeed(defaultSeed);

  return {
    value: value,
    createRandom: function (defaultSeed) {
      return createRandom(defaultSeed);
    },
    setSeed: setSeed,
    getSeed: getSeed,
    getRandomSeed: getRandomSeed,
    valueNonZero: valueNonZero,
    permuteNoise: permuteNoise,
    noise1D: noise1D,
    noise2D: noise2D,
    noise3D: noise3D,
    noise4D: noise4D,
    sign: sign,
    boolean: boolean,
    chance: chance,
    range: range,
    rangeFloor: rangeFloor,
    pick: pick,
    shuffle: shuffle,
    onCircle: onCircle,
    insideCircle: insideCircle,
    onSphere: onSphere,
    insideSphere: insideSphere,
    quaternion: quaternion,
    weighted: weighted,
    weightedSet: weightedSet,
    weightedSetIndex: weightedSetIndex,
    gaussian: gaussian
  };

  function setSeed (seed, opt) {
    if (typeof seed === 'number' || typeof seed === 'string') {
      currentSeed = seed;
      currentRandom = seedRandom(currentSeed, opt);
    } else {
      currentSeed = undefined;
      currentRandom = defaultRandom;
    }
    noiseGenerator = createNoise();
    _nextGaussian = null;
    _hasNextGaussian = false;
  }

  function value () {
    return currentRandom();
  }

  function valueNonZero () {
    var u = 0;
    while (u === 0) u = value();
    return u;
  }

  function getSeed () {
    return currentSeed;
  }

  function getRandomSeed () {
    var seed = String(Math.floor(Math.random() * 1000000));
    return seed;
  }

  function createNoise () {
    return new SimplexNoise(currentRandom);
  }

  function permuteNoise () {
    noiseGenerator = createNoise();
  }

  function noise1D (x, frequency, amplitude) {
    if (!isFinite(x)) throw new TypeError('x component for noise() must be finite');
    frequency = defined(frequency, 1);
    amplitude = defined(amplitude, 1);
    return amplitude * noiseGenerator.noise2D(x * frequency, 0);
  }

  function noise2D (x, y, frequency, amplitude) {
    if (!isFinite(x)) throw new TypeError('x component for noise() must be finite');
    if (!isFinite(y)) throw new TypeError('y component for noise() must be finite');
    frequency = defined(frequency, 1);
    amplitude = defined(amplitude, 1);
    return amplitude * noiseGenerator.noise2D(x * frequency, y * frequency);
  }

  function noise3D (x, y, z, frequency, amplitude) {
    if (!isFinite(x)) throw new TypeError('x component for noise() must be finite');
    if (!isFinite(y)) throw new TypeError('y component for noise() must be finite');
    if (!isFinite(z)) throw new TypeError('z component for noise() must be finite');
    frequency = defined(frequency, 1);
    amplitude = defined(amplitude, 1);
    return amplitude * noiseGenerator.noise3D(
      x * frequency,
      y * frequency,
      z * frequency
    );
  }

  function noise4D (x, y, z, w, frequency, amplitude) {
    if (!isFinite(x)) throw new TypeError('x component for noise() must be finite');
    if (!isFinite(y)) throw new TypeError('y component for noise() must be finite');
    if (!isFinite(z)) throw new TypeError('z component for noise() must be finite');
    if (!isFinite(w)) throw new TypeError('w component for noise() must be finite');
    frequency = defined(frequency, 1);
    amplitude = defined(amplitude, 1);
    return amplitude * noiseGenerator.noise4D(
      x * frequency,
      y * frequency,
      z * frequency,
      w * frequency
    );
  }

  function sign () {
    return boolean() ? 1 : -1;
  }

  function boolean () {
    return value() > 0.5;
  }

  function chance (n) {
    n = defined(n, 0.5);
    if (typeof n !== 'number') throw new TypeError('expected n to be a number');
    return value() < n;
  }

  function range (min, max) {
    if (max === undefined) {
      max = min;
      min = 0;
    }

    if (typeof min !== 'number' || typeof max !== 'number') {
      throw new TypeError('Expected all arguments to be numbers');
    }

    return value() * (max - min) + min;
  }

  function rangeFloor (min, max) {
    if (max === undefined) {
      max = min;
      min = 0;
    }

    if (typeof min !== 'number' || typeof max !== 'number') {
      throw new TypeError('Expected all arguments to be numbers');
    }

    return Math.floor(range(min, max));
  }

  function pick (array) {
    if (array.length === 0) return undefined;
    return array[rangeFloor(0, array.length)];
  }

  function shuffle (arr) {
    if (!Array.isArray(arr)) {
      throw new TypeError('Expected Array, got ' + typeof arr);
    }

    var rand;
    var tmp;
    var len = arr.length;
    var ret = arr.slice();
    while (len) {
      rand = Math.floor(value() * len--);
      tmp = ret[len];
      ret[len] = ret[rand];
      ret[rand] = tmp;
    }
    return ret;
  }

  function onCircle (radius, out) {
    radius = defined(radius, 1);
    out = out || [];
    var theta = value() * 2.0 * Math.PI;
    out[0] = radius * Math.cos(theta);
    out[1] = radius * Math.sin(theta);
    return out;
  }

  function insideCircle (radius, out) {
    radius = defined(radius, 1);
    out = out || [];
    onCircle(1, out);
    var r = radius * Math.sqrt(value());
    out[0] *= r;
    out[1] *= r;
    return out;
  }

  function onSphere (radius, out) {
    radius = defined(radius, 1);
    out = out || [];
    var u = value() * Math.PI * 2;
    var v = value() * 2 - 1;
    var phi = u;
    var theta = Math.acos(v);
    out[0] = radius * Math.sin(theta) * Math.cos(phi);
    out[1] = radius * Math.sin(theta) * Math.sin(phi);
    out[2] = radius * Math.cos(theta);
    return out;
  }

  function insideSphere (radius, out) {
    radius = defined(radius, 1);
    out = out || [];
    var u = value() * Math.PI * 2;
    var v = value() * 2 - 1;
    var k = value();

    var phi = u;
    var theta = Math.acos(v);
    var r = radius * Math.cbrt(k);
    out[0] = r * Math.sin(theta) * Math.cos(phi);
    out[1] = r * Math.sin(theta) * Math.sin(phi);
    out[2] = r * Math.cos(theta);
    return out;
  }

  function quaternion (out) {
    out = out || [];
    var u1 = value();
    var u2 = value();
    var u3 = value();

    var sq1 = Math.sqrt(1 - u1);
    var sq2 = Math.sqrt(u1);

    var theta1 = Math.PI * 2 * u2;
    var theta2 = Math.PI * 2 * u3;

    var x = Math.sin(theta1) * sq1;
    var y = Math.cos(theta1) * sq1;
    var z = Math.sin(theta2) * sq2;
    var w = Math.cos(theta2) * sq2;
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
  }

  function weightedSet (set) {
    set = set || [];
    if (set.length === 0) return null;
    return set[weightedSetIndex(set)].value;
  }

  function weightedSetIndex (set) {
    set = set || [];
    if (set.length === 0) return -1;
    return weighted(set.map(function (s) {
      return s.weight;
    }));
  }

  function weighted (weights) {
    weights = weights || [];
    if (weights.length === 0) return -1;
    var totalWeight = 0;
    var i;

    for (i = 0; i < weights.length; i++) {
      totalWeight += weights[i];
    }

    if (totalWeight <= 0) throw new Error('Weights must sum to > 0');

    var random = value() * totalWeight;
    for (i = 0; i < weights.length; i++) {
      if (random < weights[i]) {
        return i;
      }
      random -= weights[i];
    }
    return 0;
  }

  function gaussian (mean, standardDerivation) {
    mean = defined(mean, 0);
    standardDerivation = defined(standardDerivation, 1);

    // https://github.com/openjdk-mirror/jdk7u-jdk/blob/f4d80957e89a19a29bb9f9807d2a28351ed7f7df/src/share/classes/java/util/Random.java#L496
    if (_hasNextGaussian) {
      _hasNextGaussian = false;
      var result = _nextGaussian;
      _nextGaussian = null;
      return mean + standardDerivation * result;
    } else {
      var v1 = 0;
      var v2 = 0;
      var s = 0;
      do {
        v1 = value() * 2 - 1; // between -1 and 1
        v2 = value() * 2 - 1; // between -1 and 1
        s = v1 * v1 + v2 * v2;
      } while (s >= 1 || s === 0);
      var multiplier = Math.sqrt(-2 * Math.log(s) / s);
      _nextGaussian = (v2 * multiplier);
      _hasNextGaussian = true;
      return mean + standardDerivation * (v1 * multiplier);
    }
  }
}

module.exports = createRandom();


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/style.css":
/*!*************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/style.css ***!
  \*************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
___CSS_LOADER_EXPORT___.push([module.id, "@import url(https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;700&display=swap);"]);
// Module
___CSS_LOADER_EXPORT___.push([module.id, "* {\n    margin: 0;\n    padding: 0;\n}\n\nhtml::-webkit-scrollbar {\n    display: none;\n}\n  \n/* Hide scrollbar for IE, Edge and Firefox */\nhtml {\n    -ms-overflow-style: none;  /* IE and Edge */\n    scrollbar-width: none;  /* Firefox */\n}\n\nbody {\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n}\n\nh1 {\n    margin: 50px;\n    font-size: 50px;\n    font-family: 'Rajdhani', sans-serif;\n    font-weight: 700;\n}\n\n#container {\n    width: 750px;\n    padding-top: 50px;\n    /* padding-bottom: 50px; */ /*provided padding after <p>*/\n    box-shadow: 0px 0px 10px rgb(200, 200, 200);\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n}\n\np {\n    font-family: 'Rajdhani', sans-serif;\n    letter-spacing: 0.075em;\n}\n\n#container > p {\n    padding-top: 20px;\n    padding-bottom: 55px;\n    margin-right: 125px;\n    align-self: flex-end;\n}\n\na {\n    font-family: 'Rajdhani', sans-serif; \n    text-decoration: none;\n    color: rgb(192, 0, 0);\n}\n\n#footer {\n    margin-top: 75px;\n    padding: 25px;\n    text-align: center;\n}\n\n@media only screen and (max-width: 751px) {\n    h1 {\n        margin: 40px;\n        font-size: 40px;\n    }\n\n    #container {\n        width: 400px;\n        padding-top: 30px;\n        box-shadow: none;\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n    }\n\n    #container > p {\n        margin-right: 0px;\n        align-self: flex-end;\n    }\n}\n", "",{"version":3,"sources":["webpack://./src/style.css"],"names":[],"mappings":"AAEA;IACI,SAAS;IACT,UAAU;AACd;;AAEA;IACI,aAAa;AACjB;;AAEA,4CAA4C;AAC5C;IACI,wBAAwB,GAAG,gBAAgB;IAC3C,qBAAqB,GAAG,YAAY;AACxC;;AAEA;IACI,aAAa;IACb,sBAAsB;IACtB,mBAAmB;AACvB;;AAEA;IACI,YAAY;IACZ,eAAe;IACf,mCAAmC;IACnC,gBAAgB;AACpB;;AAEA;IACI,YAAY;IACZ,iBAAiB;IACjB,0BAA0B,EAAE,6BAA6B;IACzD,2CAA2C;IAC3C,aAAa;IACb,sBAAsB;IACtB,mBAAmB;AACvB;;AAEA;IACI,mCAAmC;IACnC,uBAAuB;AAC3B;;AAEA;IACI,iBAAiB;IACjB,oBAAoB;IACpB,mBAAmB;IACnB,oBAAoB;AACxB;;AAEA;IACI,mCAAmC;IACnC,qBAAqB;IACrB,qBAAqB;AACzB;;AAEA;IACI,gBAAgB;IAChB,aAAa;IACb,kBAAkB;AACtB;;AAEA;IACI;QACI,YAAY;QACZ,eAAe;IACnB;;IAEA;QACI,YAAY;QACZ,iBAAiB;QACjB,gBAAgB;QAChB,aAAa;QACb,sBAAsB;QACtB,mBAAmB;IACvB;;IAEA;QACI,iBAAiB;QACjB,oBAAoB;IACxB;AACJ","sourcesContent":["@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;700&display=swap');\n\n* {\n    margin: 0;\n    padding: 0;\n}\n\nhtml::-webkit-scrollbar {\n    display: none;\n}\n  \n/* Hide scrollbar for IE, Edge and Firefox */\nhtml {\n    -ms-overflow-style: none;  /* IE and Edge */\n    scrollbar-width: none;  /* Firefox */\n}\n\nbody {\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n}\n\nh1 {\n    margin: 50px;\n    font-size: 50px;\n    font-family: 'Rajdhani', sans-serif;\n    font-weight: 700;\n}\n\n#container {\n    width: 750px;\n    padding-top: 50px;\n    /* padding-bottom: 50px; */ /*provided padding after <p>*/\n    box-shadow: 0px 0px 10px rgb(200, 200, 200);\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n}\n\np {\n    font-family: 'Rajdhani', sans-serif;\n    letter-spacing: 0.075em;\n}\n\n#container > p {\n    padding-top: 20px;\n    padding-bottom: 55px;\n    margin-right: 125px;\n    align-self: flex-end;\n}\n\na {\n    font-family: 'Rajdhani', sans-serif; \n    text-decoration: none;\n    color: rgb(192, 0, 0);\n}\n\n#footer {\n    margin-top: 75px;\n    padding: 25px;\n    text-align: center;\n}\n\n@media only screen and (max-width: 751px) {\n    h1 {\n        margin: 40px;\n        font-size: 40px;\n    }\n\n    #container {\n        width: 400px;\n        padding-top: 30px;\n        box-shadow: none;\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n    }\n\n    #container > p {\n        margin-right: 0px;\n        align-self: flex-end;\n    }\n}\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";

      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }

      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }

      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }

      content += cssWithMappingToString(item);

      if (needLayer) {
        content += "}";
      }

      if (item[2]) {
        content += "}";
      }

      if (item[4]) {
        content += "}";
      }

      return content;
    }).join("");
  }; // import a list of modules into the list


  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }

      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }

      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }

      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }

      list.push(item);
    }
  };

  return list;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/sourceMaps.js":
/*!************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/sourceMaps.js ***!
  \************************************************************/
/***/ ((module) => {

"use strict";


module.exports = function (item) {
  var content = item[1];
  var cssMapping = item[3];

  if (!cssMapping) {
    return content;
  }

  if (typeof btoa === "function") {
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot || "").concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join("\n");
  }

  return [content].join("\n");
};

/***/ }),

/***/ "./node_modules/defined/index.js":
/*!***************************************!*\
  !*** ./node_modules/defined/index.js ***!
  \***************************************/
/***/ ((module) => {

module.exports = function () {
    for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] !== undefined) return arguments[i];
    }
};


/***/ }),

/***/ "./node_modules/seed-random/index.js":
/*!*******************************************!*\
  !*** ./node_modules/seed-random/index.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var width = 256;// each RC4 output is 0 <= x < 256
var chunks = 6;// at least six RC4 outputs for each double
var digits = 52;// there are 52 significant digits in a double
var pool = [];// pool: entropy pool starts empty
var GLOBAL = typeof __webpack_require__.g === 'undefined' ? window : __webpack_require__.g;

//
// The following constants are related to IEEE 754 limits.
//
var startdenom = Math.pow(width, chunks),
    significance = Math.pow(2, digits),
    overflow = significance * 2,
    mask = width - 1;


var oldRandom = Math.random;

//
// seedrandom()
// This is the seedrandom function described above.
//
module.exports = function(seed, options) {
  if (options && options.global === true) {
    options.global = false;
    Math.random = module.exports(seed, options);
    options.global = true;
    return Math.random;
  }
  var use_entropy = (options && options.entropy) || false;
  var key = [];

  // Flatten the seed string or build one from local entropy if needed.
  var shortseed = mixkey(flatten(
    use_entropy ? [seed, tostring(pool)] :
    0 in arguments ? seed : autoseed(), 3), key);

  // Use the seed to initialize an ARC4 generator.
  var arc4 = new ARC4(key);

  // Mix the randomness into accumulated entropy.
  mixkey(tostring(arc4.S), pool);

  // Override Math.random

  // This function returns a random double in [0, 1) that contains
  // randomness in every bit of the mantissa of the IEEE 754 value.

  return function() {         // Closure to return a random double:
    var n = arc4.g(chunks),             // Start with a numerator n < 2 ^ 48
        d = startdenom,                 //   and denominator d = 2 ^ 48.
        x = 0;                          //   and no 'extra last byte'.
    while (n < significance) {          // Fill up all significant digits by
      n = (n + x) * width;              //   shifting numerator and
      d *= width;                       //   denominator and generating a
      x = arc4.g(1);                    //   new least-significant-byte.
    }
    while (n >= overflow) {             // To avoid rounding up, before adding
      n /= 2;                           //   last byte, shift everything
      d /= 2;                           //   right using integer Math until
      x >>>= 1;                         //   we have exactly the desired bits.
    }
    return (n + x) / d;                 // Form the number within [0, 1).
  };
};

module.exports.resetGlobal = function () {
  Math.random = oldRandom;
};

//
// ARC4
//
// An ARC4 implementation.  The constructor takes a key in the form of
// an array of at most (width) integers that should be 0 <= x < (width).
//
// The g(count) method returns a pseudorandom integer that concatenates
// the next (count) outputs from ARC4.  Its return value is a number x
// that is in the range 0 <= x < (width ^ count).
//
/** @constructor */
function ARC4(key) {
  var t, keylen = key.length,
      me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];

  // The empty key [] is treated as [0].
  if (!keylen) { key = [keylen++]; }

  // Set up S using the standard key scheduling algorithm.
  while (i < width) {
    s[i] = i++;
  }
  for (i = 0; i < width; i++) {
    s[i] = s[j = mask & (j + key[i % keylen] + (t = s[i]))];
    s[j] = t;
  }

  // The "g" method returns the next (count) outputs as one number.
  (me.g = function(count) {
    // Using instance members instead of closure state nearly doubles speed.
    var t, r = 0,
        i = me.i, j = me.j, s = me.S;
    while (count--) {
      t = s[i = mask & (i + 1)];
      r = r * width + s[mask & ((s[i] = s[j = mask & (j + t)]) + (s[j] = t))];
    }
    me.i = i; me.j = j;
    return r;
    // For robust unpredictability discard an initial batch of values.
    // See http://www.rsa.com/rsalabs/node.asp?id=2009
  })(width);
}

//
// flatten()
// Converts an object tree to nested arrays of strings.
//
function flatten(obj, depth) {
  var result = [], typ = (typeof obj)[0], prop;
  if (depth && typ == 'o') {
    for (prop in obj) {
      try { result.push(flatten(obj[prop], depth - 1)); } catch (e) {}
    }
  }
  return (result.length ? result : typ == 's' ? obj : obj + '\0');
}

//
// mixkey()
// Mixes a string seed into a key that is an array of integers, and
// returns a shortened string seed that is equivalent to the result key.
//
function mixkey(seed, key) {
  var stringseed = seed + '', smear, j = 0;
  while (j < stringseed.length) {
    key[mask & j] =
      mask & ((smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++));
  }
  return tostring(key);
}

//
// autoseed()
// Returns an object for autoseeding, using window.crypto if available.
//
/** @param {Uint8Array=} seed */
function autoseed(seed) {
  try {
    GLOBAL.crypto.getRandomValues(seed = new Uint8Array(width));
    return tostring(seed);
  } catch (e) {
    return [+new Date, GLOBAL, GLOBAL.navigator && GLOBAL.navigator.plugins,
            GLOBAL.screen, tostring(pool)];
  }
}

//
// tostring()
// Converts an array of charcodes to a string
//
function tostring(a) {
  return String.fromCharCode.apply(0, a);
}

//
// When seedrandom.js is loaded, we immediately mix a few bits
// from the built-in RNG into the entropy pool.  Because we do
// not want to intefere with determinstic PRNG state later,
// seedrandom will not call Math.random on its own again after
// initialization.
//
mixkey(Math.random(), pool);


/***/ }),

/***/ "./node_modules/simplex-noise/simplex-noise.js":
/*!*****************************************************!*\
  !*** ./node_modules/simplex-noise/simplex-noise.js ***!
  \*****************************************************/
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;/*
 * A fast javascript implementation of simplex noise by Jonas Wagner

Based on a speed-improved simplex noise algorithm for 2D, 3D and 4D in Java.
Which is based on example code by Stefan Gustavson (stegu@itn.liu.se).
With Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
Better rank ordering method by Stefan Gustavson in 2012.


 Copyright (c) 2018 Jonas Wagner

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */
(function() {
  'use strict';

  var F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
  var G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
  var F3 = 1.0 / 3.0;
  var G3 = 1.0 / 6.0;
  var F4 = (Math.sqrt(5.0) - 1.0) / 4.0;
  var G4 = (5.0 - Math.sqrt(5.0)) / 20.0;

  function SimplexNoise(randomOrSeed) {
    var random;
    if (typeof randomOrSeed == 'function') {
      random = randomOrSeed;
    }
    else if (randomOrSeed) {
      random = alea(randomOrSeed);
    } else {
      random = Math.random;
    }
    this.p = buildPermutationTable(random);
    this.perm = new Uint8Array(512);
    this.permMod12 = new Uint8Array(512);
    for (var i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255];
      this.permMod12[i] = this.perm[i] % 12;
    }

  }
  SimplexNoise.prototype = {
    grad3: new Float32Array([1, 1, 0,
      -1, 1, 0,
      1, -1, 0,

      -1, -1, 0,
      1, 0, 1,
      -1, 0, 1,

      1, 0, -1,
      -1, 0, -1,
      0, 1, 1,

      0, -1, 1,
      0, 1, -1,
      0, -1, -1]),
    grad4: new Float32Array([0, 1, 1, 1, 0, 1, 1, -1, 0, 1, -1, 1, 0, 1, -1, -1,
      0, -1, 1, 1, 0, -1, 1, -1, 0, -1, -1, 1, 0, -1, -1, -1,
      1, 0, 1, 1, 1, 0, 1, -1, 1, 0, -1, 1, 1, 0, -1, -1,
      -1, 0, 1, 1, -1, 0, 1, -1, -1, 0, -1, 1, -1, 0, -1, -1,
      1, 1, 0, 1, 1, 1, 0, -1, 1, -1, 0, 1, 1, -1, 0, -1,
      -1, 1, 0, 1, -1, 1, 0, -1, -1, -1, 0, 1, -1, -1, 0, -1,
      1, 1, 1, 0, 1, 1, -1, 0, 1, -1, 1, 0, 1, -1, -1, 0,
      -1, 1, 1, 0, -1, 1, -1, 0, -1, -1, 1, 0, -1, -1, -1, 0]),
    noise2D: function(xin, yin) {
      var permMod12 = this.permMod12;
      var perm = this.perm;
      var grad3 = this.grad3;
      var n0 = 0; // Noise contributions from the three corners
      var n1 = 0;
      var n2 = 0;
      // Skew the input space to determine which simplex cell we're in
      var s = (xin + yin) * F2; // Hairy factor for 2D
      var i = Math.floor(xin + s);
      var j = Math.floor(yin + s);
      var t = (i + j) * G2;
      var X0 = i - t; // Unskew the cell origin back to (x,y) space
      var Y0 = j - t;
      var x0 = xin - X0; // The x,y distances from the cell origin
      var y0 = yin - Y0;
      // For the 2D case, the simplex shape is an equilateral triangle.
      // Determine which simplex we are in.
      var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
      if (x0 > y0) {
        i1 = 1;
        j1 = 0;
      } // lower triangle, XY order: (0,0)->(1,0)->(1,1)
      else {
        i1 = 0;
        j1 = 1;
      } // upper triangle, YX order: (0,0)->(0,1)->(1,1)
      // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
      // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
      // c = (3-sqrt(3))/6
      var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
      var y1 = y0 - j1 + G2;
      var x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords
      var y2 = y0 - 1.0 + 2.0 * G2;
      // Work out the hashed gradient indices of the three simplex corners
      var ii = i & 255;
      var jj = j & 255;
      // Calculate the contribution from the three corners
      var t0 = 0.5 - x0 * x0 - y0 * y0;
      if (t0 >= 0) {
        var gi0 = permMod12[ii + perm[jj]] * 3;
        t0 *= t0;
        n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0); // (x,y) of grad3 used for 2D gradient
      }
      var t1 = 0.5 - x1 * x1 - y1 * y1;
      if (t1 >= 0) {
        var gi1 = permMod12[ii + i1 + perm[jj + j1]] * 3;
        t1 *= t1;
        n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1);
      }
      var t2 = 0.5 - x2 * x2 - y2 * y2;
      if (t2 >= 0) {
        var gi2 = permMod12[ii + 1 + perm[jj + 1]] * 3;
        t2 *= t2;
        n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2);
      }
      // Add contributions from each corner to get the final noise value.
      // The result is scaled to return values in the interval [-1,1].
      return 70.0 * (n0 + n1 + n2);
    },
    // 3D simplex noise
    noise3D: function(xin, yin, zin) {
      var permMod12 = this.permMod12;
      var perm = this.perm;
      var grad3 = this.grad3;
      var n0, n1, n2, n3; // Noise contributions from the four corners
      // Skew the input space to determine which simplex cell we're in
      var s = (xin + yin + zin) * F3; // Very nice and simple skew factor for 3D
      var i = Math.floor(xin + s);
      var j = Math.floor(yin + s);
      var k = Math.floor(zin + s);
      var t = (i + j + k) * G3;
      var X0 = i - t; // Unskew the cell origin back to (x,y,z) space
      var Y0 = j - t;
      var Z0 = k - t;
      var x0 = xin - X0; // The x,y,z distances from the cell origin
      var y0 = yin - Y0;
      var z0 = zin - Z0;
      // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
      // Determine which simplex we are in.
      var i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords
      var i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords
      if (x0 >= y0) {
        if (y0 >= z0) {
          i1 = 1;
          j1 = 0;
          k1 = 0;
          i2 = 1;
          j2 = 1;
          k2 = 0;
        } // X Y Z order
        else if (x0 >= z0) {
          i1 = 1;
          j1 = 0;
          k1 = 0;
          i2 = 1;
          j2 = 0;
          k2 = 1;
        } // X Z Y order
        else {
          i1 = 0;
          j1 = 0;
          k1 = 1;
          i2 = 1;
          j2 = 0;
          k2 = 1;
        } // Z X Y order
      }
      else { // x0<y0
        if (y0 < z0) {
          i1 = 0;
          j1 = 0;
          k1 = 1;
          i2 = 0;
          j2 = 1;
          k2 = 1;
        } // Z Y X order
        else if (x0 < z0) {
          i1 = 0;
          j1 = 1;
          k1 = 0;
          i2 = 0;
          j2 = 1;
          k2 = 1;
        } // Y Z X order
        else {
          i1 = 0;
          j1 = 1;
          k1 = 0;
          i2 = 1;
          j2 = 1;
          k2 = 0;
        } // Y X Z order
      }
      // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
      // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
      // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
      // c = 1/6.
      var x1 = x0 - i1 + G3; // Offsets for second corner in (x,y,z) coords
      var y1 = y0 - j1 + G3;
      var z1 = z0 - k1 + G3;
      var x2 = x0 - i2 + 2.0 * G3; // Offsets for third corner in (x,y,z) coords
      var y2 = y0 - j2 + 2.0 * G3;
      var z2 = z0 - k2 + 2.0 * G3;
      var x3 = x0 - 1.0 + 3.0 * G3; // Offsets for last corner in (x,y,z) coords
      var y3 = y0 - 1.0 + 3.0 * G3;
      var z3 = z0 - 1.0 + 3.0 * G3;
      // Work out the hashed gradient indices of the four simplex corners
      var ii = i & 255;
      var jj = j & 255;
      var kk = k & 255;
      // Calculate the contribution from the four corners
      var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
      if (t0 < 0) n0 = 0.0;
      else {
        var gi0 = permMod12[ii + perm[jj + perm[kk]]] * 3;
        t0 *= t0;
        n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0 + grad3[gi0 + 2] * z0);
      }
      var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
      if (t1 < 0) n1 = 0.0;
      else {
        var gi1 = permMod12[ii + i1 + perm[jj + j1 + perm[kk + k1]]] * 3;
        t1 *= t1;
        n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1 + grad3[gi1 + 2] * z1);
      }
      var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
      if (t2 < 0) n2 = 0.0;
      else {
        var gi2 = permMod12[ii + i2 + perm[jj + j2 + perm[kk + k2]]] * 3;
        t2 *= t2;
        n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2 + grad3[gi2 + 2] * z2);
      }
      var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
      if (t3 < 0) n3 = 0.0;
      else {
        var gi3 = permMod12[ii + 1 + perm[jj + 1 + perm[kk + 1]]] * 3;
        t3 *= t3;
        n3 = t3 * t3 * (grad3[gi3] * x3 + grad3[gi3 + 1] * y3 + grad3[gi3 + 2] * z3);
      }
      // Add contributions from each corner to get the final noise value.
      // The result is scaled to stay just inside [-1,1]
      return 32.0 * (n0 + n1 + n2 + n3);
    },
    // 4D simplex noise, better simplex rank ordering method 2012-03-09
    noise4D: function(x, y, z, w) {
      var perm = this.perm;
      var grad4 = this.grad4;

      var n0, n1, n2, n3, n4; // Noise contributions from the five corners
      // Skew the (x,y,z,w) space to determine which cell of 24 simplices we're in
      var s = (x + y + z + w) * F4; // Factor for 4D skewing
      var i = Math.floor(x + s);
      var j = Math.floor(y + s);
      var k = Math.floor(z + s);
      var l = Math.floor(w + s);
      var t = (i + j + k + l) * G4; // Factor for 4D unskewing
      var X0 = i - t; // Unskew the cell origin back to (x,y,z,w) space
      var Y0 = j - t;
      var Z0 = k - t;
      var W0 = l - t;
      var x0 = x - X0; // The x,y,z,w distances from the cell origin
      var y0 = y - Y0;
      var z0 = z - Z0;
      var w0 = w - W0;
      // For the 4D case, the simplex is a 4D shape I won't even try to describe.
      // To find out which of the 24 possible simplices we're in, we need to
      // determine the magnitude ordering of x0, y0, z0 and w0.
      // Six pair-wise comparisons are performed between each possible pair
      // of the four coordinates, and the results are used to rank the numbers.
      var rankx = 0;
      var ranky = 0;
      var rankz = 0;
      var rankw = 0;
      if (x0 > y0) rankx++;
      else ranky++;
      if (x0 > z0) rankx++;
      else rankz++;
      if (x0 > w0) rankx++;
      else rankw++;
      if (y0 > z0) ranky++;
      else rankz++;
      if (y0 > w0) ranky++;
      else rankw++;
      if (z0 > w0) rankz++;
      else rankw++;
      var i1, j1, k1, l1; // The integer offsets for the second simplex corner
      var i2, j2, k2, l2; // The integer offsets for the third simplex corner
      var i3, j3, k3, l3; // The integer offsets for the fourth simplex corner
      // simplex[c] is a 4-vector with the numbers 0, 1, 2 and 3 in some order.
      // Many values of c will never occur, since e.g. x>y>z>w makes x<z, y<w and x<w
      // impossible. Only the 24 indices which have non-zero entries make any sense.
      // We use a thresholding to set the coordinates in turn from the largest magnitude.
      // Rank 3 denotes the largest coordinate.
      i1 = rankx >= 3 ? 1 : 0;
      j1 = ranky >= 3 ? 1 : 0;
      k1 = rankz >= 3 ? 1 : 0;
      l1 = rankw >= 3 ? 1 : 0;
      // Rank 2 denotes the second largest coordinate.
      i2 = rankx >= 2 ? 1 : 0;
      j2 = ranky >= 2 ? 1 : 0;
      k2 = rankz >= 2 ? 1 : 0;
      l2 = rankw >= 2 ? 1 : 0;
      // Rank 1 denotes the second smallest coordinate.
      i3 = rankx >= 1 ? 1 : 0;
      j3 = ranky >= 1 ? 1 : 0;
      k3 = rankz >= 1 ? 1 : 0;
      l3 = rankw >= 1 ? 1 : 0;
      // The fifth corner has all coordinate offsets = 1, so no need to compute that.
      var x1 = x0 - i1 + G4; // Offsets for second corner in (x,y,z,w) coords
      var y1 = y0 - j1 + G4;
      var z1 = z0 - k1 + G4;
      var w1 = w0 - l1 + G4;
      var x2 = x0 - i2 + 2.0 * G4; // Offsets for third corner in (x,y,z,w) coords
      var y2 = y0 - j2 + 2.0 * G4;
      var z2 = z0 - k2 + 2.0 * G4;
      var w2 = w0 - l2 + 2.0 * G4;
      var x3 = x0 - i3 + 3.0 * G4; // Offsets for fourth corner in (x,y,z,w) coords
      var y3 = y0 - j3 + 3.0 * G4;
      var z3 = z0 - k3 + 3.0 * G4;
      var w3 = w0 - l3 + 3.0 * G4;
      var x4 = x0 - 1.0 + 4.0 * G4; // Offsets for last corner in (x,y,z,w) coords
      var y4 = y0 - 1.0 + 4.0 * G4;
      var z4 = z0 - 1.0 + 4.0 * G4;
      var w4 = w0 - 1.0 + 4.0 * G4;
      // Work out the hashed gradient indices of the five simplex corners
      var ii = i & 255;
      var jj = j & 255;
      var kk = k & 255;
      var ll = l & 255;
      // Calculate the contribution from the five corners
      var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0 - w0 * w0;
      if (t0 < 0) n0 = 0.0;
      else {
        var gi0 = (perm[ii + perm[jj + perm[kk + perm[ll]]]] % 32) * 4;
        t0 *= t0;
        n0 = t0 * t0 * (grad4[gi0] * x0 + grad4[gi0 + 1] * y0 + grad4[gi0 + 2] * z0 + grad4[gi0 + 3] * w0);
      }
      var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1 - w1 * w1;
      if (t1 < 0) n1 = 0.0;
      else {
        var gi1 = (perm[ii + i1 + perm[jj + j1 + perm[kk + k1 + perm[ll + l1]]]] % 32) * 4;
        t1 *= t1;
        n1 = t1 * t1 * (grad4[gi1] * x1 + grad4[gi1 + 1] * y1 + grad4[gi1 + 2] * z1 + grad4[gi1 + 3] * w1);
      }
      var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2 - w2 * w2;
      if (t2 < 0) n2 = 0.0;
      else {
        var gi2 = (perm[ii + i2 + perm[jj + j2 + perm[kk + k2 + perm[ll + l2]]]] % 32) * 4;
        t2 *= t2;
        n2 = t2 * t2 * (grad4[gi2] * x2 + grad4[gi2 + 1] * y2 + grad4[gi2 + 2] * z2 + grad4[gi2 + 3] * w2);
      }
      var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3 - w3 * w3;
      if (t3 < 0) n3 = 0.0;
      else {
        var gi3 = (perm[ii + i3 + perm[jj + j3 + perm[kk + k3 + perm[ll + l3]]]] % 32) * 4;
        t3 *= t3;
        n3 = t3 * t3 * (grad4[gi3] * x3 + grad4[gi3 + 1] * y3 + grad4[gi3 + 2] * z3 + grad4[gi3 + 3] * w3);
      }
      var t4 = 0.6 - x4 * x4 - y4 * y4 - z4 * z4 - w4 * w4;
      if (t4 < 0) n4 = 0.0;
      else {
        var gi4 = (perm[ii + 1 + perm[jj + 1 + perm[kk + 1 + perm[ll + 1]]]] % 32) * 4;
        t4 *= t4;
        n4 = t4 * t4 * (grad4[gi4] * x4 + grad4[gi4 + 1] * y4 + grad4[gi4 + 2] * z4 + grad4[gi4 + 3] * w4);
      }
      // Sum up and scale the result to cover the range [-1,1]
      return 27.0 * (n0 + n1 + n2 + n3 + n4);
    }
  };

  function buildPermutationTable(random) {
    var i;
    var p = new Uint8Array(256);
    for (i = 0; i < 256; i++) {
      p[i] = i;
    }
    for (i = 0; i < 255; i++) {
      var r = i + ~~(random() * (256 - i));
      var aux = p[i];
      p[i] = p[r];
      p[r] = aux;
    }
    return p;
  }
  SimplexNoise._buildPermutationTable = buildPermutationTable;

  function alea() {
    // Johannes Baagøe <baagoe@baagoe.com>, 2010
    var s0 = 0;
    var s1 = 0;
    var s2 = 0;
    var c = 1;

    var mash = masher();
    s0 = mash(' ');
    s1 = mash(' ');
    s2 = mash(' ');

    for (var i = 0; i < arguments.length; i++) {
      s0 -= mash(arguments[i]);
      if (s0 < 0) {
        s0 += 1;
      }
      s1 -= mash(arguments[i]);
      if (s1 < 0) {
        s1 += 1;
      }
      s2 -= mash(arguments[i]);
      if (s2 < 0) {
        s2 += 1;
      }
    }
    mash = null;
    return function() {
      var t = 2091639 * s0 + c * 2.3283064365386963e-10; // 2^-32
      s0 = s1;
      s1 = s2;
      return s2 = t - (c = t | 0);
    };
  }
  function masher() {
    var n = 0xefc8249d;
    return function(data) {
      data = data.toString();
      for (var i = 0; i < data.length; i++) {
        n += data.charCodeAt(i);
        var h = 0.02519603282416938 * n;
        n = h >>> 0;
        h -= n;
        h *= n;
        n = h >>> 0;
        h -= n;
        n += h * 0x100000000; // 2^32
      }
      return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
    };
  }

  // amd
  if (true) !(__WEBPACK_AMD_DEFINE_RESULT__ = (function() {return SimplexNoise;}).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  // common js
  if (true) exports.SimplexNoise = SimplexNoise;
  // browser
  else {}
  // nodejs
  if (true) {
    module.exports = SimplexNoise;
  }

})();


/***/ }),

/***/ "./src/style.css":
/*!***********************!*\
  !*** ./src/style.css ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../node_modules/css-loader/dist/cjs.js!./style.css */ "./node_modules/css-loader/dist/cjs.js!./src/style.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ ((module) => {

"use strict";


var stylesInDOM = [];

function getIndexByIdentifier(identifier) {
  var result = -1;

  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };

    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);

  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }

      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };

  return updater;
}

module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];

    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }

    var newLastIdentifiers = modulesToDom(newList, options);

    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];

      var _index = getIndexByIdentifier(_identifier);

      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();

        stylesInDOM.splice(_index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertBySelector.js":
/*!********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertBySelector.js ***!
  \********************************************************************/
/***/ ((module) => {

"use strict";


var memo = {};
/* istanbul ignore next  */

function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }

    memo[target] = styleTarget;
  }

  return memo[target];
}
/* istanbul ignore next  */


function insertBySelector(insert, style) {
  var target = getTarget(insert);

  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }

  target.appendChild(style);
}

module.exports = insertBySelector;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertStyleElement.js":
/*!**********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertStyleElement.js ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}

module.exports = insertStyleElement;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js ***!
  \**********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;

  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}

module.exports = setAttributesWithoutAttributes;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleDomAPI.js":
/*!***************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleDomAPI.js ***!
  \***************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";

  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }

  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }

  var needLayer = typeof obj.layer !== "undefined";

  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }

  css += obj.css;

  if (needLayer) {
    css += "}";
  }

  if (obj.media) {
    css += "}";
  }

  if (obj.supports) {
    css += "}";
  }

  var sourceMap = obj.sourceMap;

  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  options.styleTagTransform(css, styleElement, options.options);
}

function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }

  styleElement.parentNode.removeChild(styleElement);
}
/* istanbul ignore next  */


function domAPI(options) {
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}

module.exports = domAPI;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleTagTransform.js":
/*!*********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleTagTransform.js ***!
  \*********************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }

    styleElement.appendChild(document.createTextNode(css));
  }
}

module.exports = styleTagTransform;

/***/ }),

/***/ "./src/designs/bitmap.js":
/*!*******************************!*\
  !*** ./src/designs/bitmap.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _setCanvas__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../setCanvas */ "./src/setCanvas.js");


let fontSize
let fontFamily = 'serif'

let [canvas, context, canvasW, canvasH] = (0,_setCanvas__WEBPACK_IMPORTED_MODULE_0__["default"])()

const typeCanvas = document.createElement('canvas')
const typeContext = typeCanvas.getContext('2d')
const cell = 10
const cols = Math.floor(canvasW / cell)
const rows = Math.floor(canvasH / cell)
const numCells = cols * rows
typeCanvas.width = cols
typeCanvas.height = rows

function bitmap (text) {
  if (text === '') text = 'A'

  typeContext.fillStyle = 'white'
  typeContext.fillRect(0, 0, cols, rows)

  typeContext.fillStyle = 'black'
  fontSize = cols * 1.2
  if (text === 'Q' || text === 'W' || text === 'M') fontSize = cols
  typeContext.font = `${fontSize}px ${fontFamily}`
  typeContext.textBaseline = 'top'

  const metrics = typeContext.measureText(text)
  const mX = metrics.actualBoundingBoxLeft * -1
  const mY = metrics.actualBoundingBoxAscent * -1
  const mW = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight
  const mH = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent

  const typeX = (cols - mW) * 0.5 - mX
  const typeY = (rows - mH) * 0.5 - mY

  typeContext.save()
  typeContext.translate(typeX, typeY)
  typeContext.fillText(text, 0, 0)
  typeContext.restore()

  const typeData = typeContext.getImageData(0, 0, cols, rows).data // only the data array of the Image data object

  // canvas
  context.fillStyle = 'white' // two lines to clean up the canvas, 
  context.fillRect(0, 0, canvasW, canvasH) //otherwise the shadow of the previous letter will appear

  for (let i = 0; i< numCells; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)

    const canvasX = col * cell
    const canvasY = row * cell

    const r = typeData[i * 4 + 0]
    const g = typeData[i * 4 + 1]
    const b = typeData[i * 4 + 2]
    const a = typeData[i * 4 + 3]

    context.fillStyle = `rgb(${r}, ${g}, ${b})`
    context.save()
    context.translate(canvasX, canvasY)
    context.translate(cell / 2, cell / 2) // draw circle from center
    context.beginPath()
    context.arc(0, 0, cell / 2.1, 0, Math.PI * 2)
    context.fill()
    context.restore()
  }
  return canvas
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (bitmap);


/***/ }),

/***/ "./src/designs/circle.js":
/*!*******************************!*\
  !*** ./src/designs/circle.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _setCanvas__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../setCanvas */ "./src/setCanvas.js");
const c_math = __webpack_require__(/*! canvas-sketch-util/math */ "./node_modules/canvas-sketch-util/math.js")
const c_random = __webpack_require__(/*! canvas-sketch-util/random */ "./node_modules/canvas-sketch-util/random.js")
;

let [canvas, context, canvasW, canvasH] = (0,_setCanvas__WEBPACK_IMPORTED_MODULE_0__["default"])()

const cx = canvasW / 2
const cy = canvasH / 2
let x, y;
const w = canvasW / 100
const h = canvasH / 10

const ticks = 12
const radius = canvasW / 3

function circle () {
  for (let i = 0; i < ticks; i++) {
    const slice = c_math.degToRad(360 / ticks)
    const angle = slice * i

    x = cx + radius * Math.sin(angle)
    y = cy + radius * Math.cos(angle)

    context.save()
      context.translate(x, y)
      context.rotate(-angle)
      context.scale(c_random.range(0.5, 2), c_random.range(0.5, 2))
      
      context.fillStyle = 'black'
      context.beginPath()
      context.rect(-w / 2, -h / 2, w, h)
      context.fill()
    context.restore()

    context.save()
      context.lineWidth = c_random.range(1, 10)
      context.translate(cx, cy)
      context.rotate(-angle)
      context.beginPath()
      context.arc(0, 0, radius * c_random.range(0.75, 1.25), slice * c_random.range(1, -8), slice * c_random.range(1, 2))
      context.stroke()
    context.restore()
  }
  return canvas
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (circle);


/***/ }),

/***/ "./src/designs/glyph.js":
/*!******************************!*\
  !*** ./src/designs/glyph.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _setCanvas__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../setCanvas */ "./src/setCanvas.js");


let fontSize = 0
let fontFamily = 'serif'

let [canvas, context, canvasW, canvasH] = (0,_setCanvas__WEBPACK_IMPORTED_MODULE_0__["default"])()

const typeCanvas = document.createElement('canvas')
const typeContext = typeCanvas.getContext('2d')
const cell = 10
const cols = Math.floor(canvasW / cell)
const rows = Math.floor(canvasH / cell)
const numCells = cols * rows
typeCanvas.width = cols
typeCanvas.height = rows

function glyph (text) {
  if (text === '') text = 'A'

  typeContext.fillStyle = 'white'
  typeContext.fillRect(0, 0, cols, rows)

  typeContext.fillStyle = 'black'
  fontSize = cols * 1.3
  typeContext.font = `${fontSize}px ${fontFamily}`
  typeContext.textBaseline = 'top'

  const metrics = typeContext.measureText(text)
  const mX = metrics.actualBoundingBoxLeft * -1
  const mY = metrics.actualBoundingBoxAscent * -1
  const mW = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight
  const mH = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent

  const typeX = (cols - mW) * 0.5 - mX
  const typeY = (rows - mH) * 0.5 - mY

  typeContext.save()
  typeContext.translate(typeX, typeY)
  typeContext.fillText(text, 0, 0)
  typeContext.restore()

  const typeData = typeContext.getImageData(0, 0, cols, rows).data

  // canvas
  for (let i = 0; i < numCells; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)

    const canvasX = col * cell
    const canvasY = row * cell

    // color = typeData[n]
    // to invert color use 255 - typeData [i]
    const r = typeData[i * 4 + 0]
    const g = typeData[i * 4 + 1]
    const b = typeData[i * 4 + 2]
    const a = typeData[i * 4 + 3]


    context.fillStyle = `rgb(${r}, ${g}, ${b})`
    context.save()
    context.translate(canvasX, canvasY)
    context.translate(cell / 2, cell / 2) // draw circle from center
    context.fillText(text, 0, 0)
    context.restore()
  }
  return canvas
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (glyph);


/***/ }),

/***/ "./src/designs/glyphs.js":
/*!*******************************!*\
  !*** ./src/designs/glyphs.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _setCanvas__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../setCanvas */ "./src/setCanvas.js");

const c_random = __webpack_require__(/*! canvas-sketch-util/random */ "./node_modules/canvas-sketch-util/random.js")

let fontSize
let fontFamily = 'serif'

let [canvas, context, canvasW, canvasH] = (0,_setCanvas__WEBPACK_IMPORTED_MODULE_0__["default"])()

const typeCanvas = document.createElement('canvas')
const typeContext = typeCanvas.getContext('2d')
const cell = 10
const cols = Math.floor(canvasW / cell)
const rows = Math.floor(canvasH / cell)
const numCells = cols * rows
typeCanvas.width = cols
typeCanvas.height = rows

const getGlyph = (v) => {
  if (v < 50) return '';
  if (v < 100) return '.';
  if (v < 150) return '-';
  if (v < 200) return '+';
  const els = ['_', '=', ' ', '/']

  return c_random.pick(els)
}

function glyphs (text) {
  if (text === '') text = 'A'

  typeContext.fillStyle = 'black'
  typeContext.fillRect(0, 0, cols, rows)

  typeContext.fillStyle = 'white'
  fontSize = cols * 1.2
  typeContext.font = `${fontSize}px ${fontFamily}`
  typeContext.textBaseline = 'top'

  const metrics = typeContext.measureText(text)
  const mX = metrics.actualBoundingBoxLeft * -1
  const mY = metrics.actualBoundingBoxAscent * -1
  const mW = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight
  const mH = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent

  const typeX = (cols - mW) * 0.5 - mX
  const typeY = (rows - mH) * 0.5 - mY

  typeContext.save()
  typeContext.translate(typeX, typeY)
  typeContext.fillText(text, 0, 0)
  typeContext.restore()

  const typeData = typeContext.getImageData(0, 0, cols, rows).data

  // canvas
  context.textBaseline = 'middle'
  context.textAlign = 'center'

  for (let i = 0; i < numCells; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)

    const canvasX = col * cell
    const canvasY = row * cell

    const r = typeData[i * 4 + 0]
    const g = typeData[i * 4 + 1]
    const b = typeData[i * 4 + 2]
    const a = typeData[i * 4 + 3]

    const glyph = getGlyph(r) // b&w can get brightness from any channel
    context.font = `${cell}px ${fontFamily}`
    if (Math.random() < 0.15) context.font = `${cell * 3}px ${fontFamily}`
    context.save()
    context.translate(canvasX, canvasY)
    context.translate(cell / 2, cell / 2) // draw circle from center
    context.fillText(glyph, 0, 0)
    context.restore()
  }
  return canvas
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (glyphs);


/***/ }),

/***/ "./src/designs/netpoints.js":
/*!**********************************!*\
  !*** ./src/designs/netpoints.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _setCanvas__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../setCanvas */ "./src/setCanvas.js");
const c_random = __webpack_require__(/*! canvas-sketch-util/random */ "./node_modules/canvas-sketch-util/random.js")
const c_math = __webpack_require__(/*! canvas-sketch-util/math */ "./node_modules/canvas-sketch-util/math.js")
;

let [canvas, context, canvasW, canvasH] = (0,_setCanvas__WEBPACK_IMPORTED_MODULE_0__["default"])()

function netpoints () {

  class Vector {
    constructor(x, y) {
      this.x = x
      this.y = y
    }

    getDistance(v) {
      const dx = this.x - v.x
      const dy = this.y - v.y
      return Math.sqrt(dx * dx + dy * dy) //hypotenuse
    }
  }
  
  class Agent {
    constructor(x, y) {
      this.pos = new Vector(x, y)
      this.vel = new Vector(c_random.range(-0.5, 0.5), c_random.range(-0.5, 0.5))
      this.radius = c_random.range(2, 8)
    }

    update() {
      this.pos.x += this.vel.x
      this.pos.y += this.vel.y
    }

    bounce(w, h) {
      if (this.pos.x <= 0 || this.pos.x >= w) this.vel.x *= -1
      if (this.pos.y <= 0 || this.pos.y >= h) this.vel.y *= -1
    }

    draw(context) {
      context.save()
      context.translate(this.pos.x, this.pos.y)

      context.beginPath()
      context.arc(0, 0, this.radius, 0, Math.PI * 2)
      context.fill()
      context.stroke()

      context.restore()
    }
  }
  
  const agents = []
  context.fillStyle = "white"
  context.lineWidth = 2
  
  for (let i = 0; i < 40; i++) {
    const x = c_random.range(0, canvasW)
    const y = c_random.range(0, canvasH)
    agents.push(new Agent(x, y))
  }
  
  function animate () {
    window.requestAnimationFrame(animate)
    context.clearRect(0, 0, canvasW, canvasH)

    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i]
      for(let j = i + 1; j < agents.length; j++) { //half lines (not two lines on top of each other)
        const other = agents[j]
        const dist = agent.pos.getDistance(other.pos)
        if (dist < 100) {
          context.save()
          context.lineWidth = c_math.mapRange(dist, 0, 100, 2.2, 0.2)

          context.beginPath()
          context.moveTo(agent.pos.x, agent.pos.y)
          context.lineTo(other.pos.x, other.pos.y)
          context.stroke()
          context.restore()
        }
      }
    }

    agents.forEach(point => {
      point.update()
      point.bounce(canvasW, canvasH)
      point.draw(context)
      }
    )
  
  }
  
  animate()

  return canvas
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (netpoints);


/***/ }),

/***/ "./src/designs/noise.js":
/*!******************************!*\
  !*** ./src/designs/noise.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _setCanvas__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../setCanvas */ "./src/setCanvas.js");

const c_random = __webpack_require__(/*! canvas-sketch-util/random */ "./node_modules/canvas-sketch-util/random.js")
const c_math = __webpack_require__(/*! canvas-sketch-util/math */ "./node_modules/canvas-sketch-util/math.js")

let [canvas, context, canvasW, canvasH] = (0,_setCanvas__WEBPACK_IMPORTED_MODULE_0__["default"])()

const cols = 25
const rows = 25
const cellNum = cols * rows
const gridW = canvasW * 0.8
const gridH = canvasH * 0.8
const cellW = gridW / cols
const cellH = gridH / rows
const marginX = (canvasW - gridW) / 2
const marginY = (canvasH - gridH) / 2

let frame = 0

function noise () {
  window.requestAnimationFrame(noise)
  context.clearRect(0, 0, canvasW, canvasH)
  frame = frame + 5

  for (let i = 0; i < cellNum; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)

    const x = col * cellW
    const y = row * cellH
    const w = cellW * 0.8
    const h = cellH * 0.8

    const n = c_random.noise2D(x + frame, y, 0.001) // values of x and y too big by themselves, give lower frequency
    const angle = n * Math.PI * 0.3 //using this for the amplitude would mess the results of n (-1 to 1 now)
    //thus, it is moved in the angle
    const scale = c_math.mapRange(n, -1, 1, 0.5, cellW)

    context.save()
    context.translate(x, y) //cell space begin
    context.translate(cellW * 0.5, cellH * 0.5) // go to the center of the cell
    context.translate(marginX, marginY) //add canvas margin
    context.rotate(angle) //rotate context "equals" to rotating the lines
    
    context.lineWidth = scale

    context.beginPath()
    context.moveTo(w * -0.5, 0)
    context.lineTo(w * 0.5, 0)
    context.stroke()

    context.restore()    
  }
  return canvas
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (noise);


/***/ }),

/***/ "./src/designs/pois.js":
/*!*****************************!*\
  !*** ./src/designs/pois.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _setCanvas__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../setCanvas */ "./src/setCanvas.js");
const c_random = __webpack_require__(/*! canvas-sketch-util/random */ "./node_modules/canvas-sketch-util/random.js")
;

let [canvas, context, canvasW, canvasH] = (0,_setCanvas__WEBPACK_IMPORTED_MODULE_0__["default"])()

function pois () {
  class Vector {
    constructor(x, y) {
      this.x = x
      this.y = y
    }
  }
  
  class Agent {
    constructor(x, y) {
      this.pos = new Vector(x, y)
      this.vel = new Vector(c_random.range(-1, 1), c_random.range(-1, 1))
      this.radius = c_random.range(2, 8)
    }

    update() {
      this.pos.x += this.vel.x
      this.pos.y += this.vel.y
    }

    bounce(w, h) {
      if (this.pos.x <= 0 || this.pos.x >= w) this.vel.x *= -1
      if (this.pos.y <= 0 || this.pos.y >= h) this.vel.y *= -1
    }

    draw(context) {
      context.save()
      context.translate(this.pos.x, this.pos.y)

      context.beginPath()
      context.arc(0, 0, this.radius, 0, Math.PI * 2)
      context.fill()
      context.stroke()

      context.restore()
    }
  }
  
  const agents = []
  context.fillStyle = 'white'
  context.lineWidth = 2
  
  for (let i = 0; i < 50; i++) {
    const x = c_random.range(0, canvasW)
    const y = c_random.range(0, canvasH)
    agents.push(new Agent(x, y))
  }
  
  function animate () {
    window.requestAnimationFrame(animate)
    context.clearRect(0, 0, canvasW, canvasH)
    agents.forEach(point => {
      point.update()
      point.bounce(canvasW, canvasH)
      point.draw(context)
      }
    )
  }
  animate()

  return canvas
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (pois);


/***/ }),

/***/ "./src/designs/squares.js":
/*!********************************!*\
  !*** ./src/designs/squares.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _setCanvas__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../setCanvas */ "./src/setCanvas.js");


let [canvas, context, canvasW, canvasH] = (0,_setCanvas__WEBPACK_IMPORTED_MODULE_0__["default"])()
    
const width = canvasW / 7.5
const height = canvasH / 7.5
const border = canvasW / 71
const gap = canvasW / 14.2
const off = canvasW / 45
const offD = off * 2
let x, y;
context.lineWidth = border

function squares () {
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      x = border * 2 + (width + gap) * i
      y = border * 2 + (height + gap) * j

      context.beginPath()
      context.rect(x, y, width, height)
      context.stroke()

      if (Math.random() > 0.5) {
        context.beginPath()
        context.rect(x +off, y +off, width -offD, height -offD)
        context.stroke()
      }
    }
  }
  return canvas
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (squares);


/***/ }),

/***/ "./src/setCanvas.js":
/*!**************************!*\
  !*** ./src/setCanvas.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
function setCanvas () {
  let canvas = document.createElement('canvas')
  let context = canvas.getContext('2d')
  let canvasW = 500
  let canvasH = 500
  let screenWidth = window.screen.width
  if (screenWidth < 600) {
    canvasW = 400
    canvasH = 400
  } else if (screenWidth < 400) {
    canvasW = 300
    canvasH = 300
  }
  canvas.width = canvasW
  canvas.height = canvasH

  return [canvas, context, canvasW, canvasH]
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (setCanvas);


/***/ }),

/***/ "./src/wrapper.js":
/*!************************!*\
  !*** ./src/wrapper.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
function wrapper (parent, child, descr, ref, prevBro) {
  child.style.backgroundColor = 'white'
  child.style.filter = 'drop-shadow(0 0 10px rgb(200, 200, 200))'
  
  const box = document.createElement('div')
  box.classList.add('box')

  const description = document.createElement('p')
  description.innerHTML = descr

  if (ref) { //delete previous animateBitmap
    box.classList.add(ref)
    description.classList.add(ref)
  }

  box.appendChild(child)

  if (prevBro !== undefined) { //keep animateBitmap in the same place
    const before = parent.children[prevBro]
    before.insertAdjacentElement('afterend', box)
    box.insertAdjacentElement('afterend', description)
    return
  }

  parent.appendChild(box)
  parent.appendChild(description)
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (wrapper);


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _style_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./style.css */ "./src/style.css");
/* harmony import */ var _wrapper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./wrapper */ "./src/wrapper.js");
/* harmony import */ var _designs_squares__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./designs/squares */ "./src/designs/squares.js");
/* harmony import */ var _designs_circle__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./designs/circle */ "./src/designs/circle.js");
/* harmony import */ var _designs_pois__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./designs/pois */ "./src/designs/pois.js");
/* harmony import */ var _designs_netpoints__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./designs/netpoints */ "./src/designs/netpoints.js");
/* harmony import */ var _designs_noise__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./designs/noise */ "./src/designs/noise.js");
/* harmony import */ var _designs_bitmap__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./designs/bitmap */ "./src/designs/bitmap.js");
/* harmony import */ var _designs_glyph__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./designs/glyph */ "./src/designs/glyph.js");
/* harmony import */ var _designs_glyphs__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./designs/glyphs */ "./src/designs/glyphs.js");











// title
const title = document.createElement('h1')
title.innerHTML = 'Javascript cerative coding examples'

// exercices
let text = ''
const squaresDescr = 'Grid of squares with random smaller squares.'
const circleDescr = 'Random arch and graduations.'
const poisDescr = 'Bouncing pois.'
const netpointsDescr = 'Bouncing pois with connectors.'
const noiseDescr = 'Angle and height noise animation.'
const bitmapDescr = 'Click on a keyboard letter to change bitmap.'
const glyphDescr = 'Static glyph brightness map.'
const glyphsDescr = 'Static glyphs brightness map.'

const animateBitmap = (p) => {
  const ref = 'bitmap'
  let prevRefs = document.querySelectorAll(`.${ref}`)
  if (prevRefs) {
    prevRefs.forEach(prevRef => prevRef.remove())
  }
  (0,_wrapper__WEBPACK_IMPORTED_MODULE_1__["default"])(p, (0,_designs_bitmap__WEBPACK_IMPORTED_MODULE_7__["default"])(text), bitmapDescr, ref, 9)
}

function component () {
  const el = document.createElement('div')
  el.setAttribute('id', 'container')

  ;(0,_wrapper__WEBPACK_IMPORTED_MODULE_1__["default"])(el, (0,_designs_squares__WEBPACK_IMPORTED_MODULE_2__["default"])(), squaresDescr)
  ;(0,_wrapper__WEBPACK_IMPORTED_MODULE_1__["default"])(el, (0,_designs_circle__WEBPACK_IMPORTED_MODULE_3__["default"])(), circleDescr)
  ;(0,_wrapper__WEBPACK_IMPORTED_MODULE_1__["default"])(el, (0,_designs_pois__WEBPACK_IMPORTED_MODULE_4__["default"])(), poisDescr)
  ;(0,_wrapper__WEBPACK_IMPORTED_MODULE_1__["default"])(el, (0,_designs_netpoints__WEBPACK_IMPORTED_MODULE_5__["default"])(), netpointsDescr)
  ;(0,_wrapper__WEBPACK_IMPORTED_MODULE_1__["default"])(el, (0,_designs_noise__WEBPACK_IMPORTED_MODULE_6__["default"])(), noiseDescr)
  animateBitmap(el)
  ;(0,_wrapper__WEBPACK_IMPORTED_MODULE_1__["default"])(el, (0,_designs_glyph__WEBPACK_IMPORTED_MODULE_8__["default"])('B'), glyphDescr)
  ;(0,_wrapper__WEBPACK_IMPORTED_MODULE_1__["default"])(el, (0,_designs_glyphs__WEBPACK_IMPORTED_MODULE_9__["default"])('C'), glyphsDescr)


  document.addEventListener('keyup', (e) => {
    text = e.key
    text = text.toUpperCase()
    animateBitmap(el)
  })
  
  return el;
}

// credits
const footer = document.createElement('div')
footer.setAttribute('id', 'footer')

const profile = document.createElement('a')
const link = document.createTextNode('p-vale') // can't use innerHTML or title with <a>
profile.appendChild(link)
profile.href = 'https://github.com/p-vale/black-white-canvas'
const credits = document.createElement('p')
credits.innerHTML = 'made by '
credits. appendChild(profile)

footer.appendChild(credits)

// render
document.body.appendChild(title)
document.body.appendChild(component())
document.body.appendChild(footer)

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsZ0JBQWdCLG9CQUFvQjtBQUNwQztBQUNBOztBQUVBOztBQUVBO0FBQ0EsZ0JBQWdCLG9CQUFvQjtBQUNwQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSwrQ0FBK0MsSUFBSTtBQUNuRDtBQUNBO0FBQ0E7QUFDQSxFQUFFLG9EQUFPLElBQUksMkRBQU07QUFDbkI7O0FBRUE7QUFDQTtBQUNBOztBQUVBLEVBQUUscURBQU8sS0FBSyw0REFBTztBQUNyQixFQUFFLHFEQUFPLEtBQUssMkRBQU07QUFDcEIsRUFBRSxxREFBTyxLQUFLLHlEQUFJO0FBQ2xCLEVBQUUscURBQU8sS0FBSyw4REFBUztBQUN2QixFQUFFLHFEQUFPLEtBQUssMERBQUs7QUFDbkI7QUFDQSxFQUFFLHFEQUFPLEtBQUssMERBQUs7QUFDbkIsRUFBRSxxREFBTyxLQUFLLDJEQUFNOzs7QUFHcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL2pzY2MvLi9ub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC11dGlsL2xpYi93cmFwLmpzIiwid2VicGFjazovL2pzY2MvLi9ub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC11dGlsL21hdGguanMiLCJ3ZWJwYWNrOi8vanNjYy8uL25vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoLXV0aWwvcmFuZG9tLmpzIiwid2VicGFjazovL2pzY2MvLi9zcmMvc3R5bGUuY3NzIiwid2VicGFjazovL2pzY2MvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzIiwid2VicGFjazovL2pzY2MvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qcyIsIndlYnBhY2s6Ly9qc2NjLy4vbm9kZV9tb2R1bGVzL2RlZmluZWQvaW5kZXguanMiLCJ3ZWJwYWNrOi8vanNjYy8uL25vZGVfbW9kdWxlcy9zZWVkLXJhbmRvbS9pbmRleC5qcyIsIndlYnBhY2s6Ly9qc2NjLy4vbm9kZV9tb2R1bGVzL3NpbXBsZXgtbm9pc2Uvc2ltcGxleC1ub2lzZS5qcyIsIndlYnBhY2s6Ly9qc2NjLy4vc3JjL3N0eWxlLmNzcz83MTYzIiwid2VicGFjazovL2pzY2MvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanMiLCJ3ZWJwYWNrOi8vanNjYy8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanMiLCJ3ZWJwYWNrOi8vanNjYy8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydFN0eWxlRWxlbWVudC5qcyIsIndlYnBhY2s6Ly9qc2NjLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzIiwid2VicGFjazovL2pzY2MvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZURvbUFQSS5qcyIsIndlYnBhY2s6Ly9qc2NjLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVUYWdUcmFuc2Zvcm0uanMiLCJ3ZWJwYWNrOi8vanNjYy8uL3NyYy9kZXNpZ25zL2JpdG1hcC5qcyIsIndlYnBhY2s6Ly9qc2NjLy4vc3JjL2Rlc2lnbnMvY2lyY2xlLmpzIiwid2VicGFjazovL2pzY2MvLi9zcmMvZGVzaWducy9nbHlwaC5qcyIsIndlYnBhY2s6Ly9qc2NjLy4vc3JjL2Rlc2lnbnMvZ2x5cGhzLmpzIiwid2VicGFjazovL2pzY2MvLi9zcmMvZGVzaWducy9uZXRwb2ludHMuanMiLCJ3ZWJwYWNrOi8vanNjYy8uL3NyYy9kZXNpZ25zL25vaXNlLmpzIiwid2VicGFjazovL2pzY2MvLi9zcmMvZGVzaWducy9wb2lzLmpzIiwid2VicGFjazovL2pzY2MvLi9zcmMvZGVzaWducy9zcXVhcmVzLmpzIiwid2VicGFjazovL2pzY2MvLi9zcmMvc2V0Q2FudmFzLmpzIiwid2VicGFjazovL2pzY2MvLi9zcmMvd3JhcHBlci5qcyIsIndlYnBhY2s6Ly9qc2NjL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2pzY2Mvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vanNjYy93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vanNjYy93ZWJwYWNrL3J1bnRpbWUvZ2xvYmFsIiwid2VicGFjazovL2pzY2Mvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9qc2NjL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vanNjYy8uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHdyYXA7XG5mdW5jdGlvbiB3cmFwICh2YWx1ZSwgZnJvbSwgdG8pIHtcbiAgaWYgKHR5cGVvZiBmcm9tICE9PSAnbnVtYmVyJyB8fCB0eXBlb2YgdG8gIT09ICdudW1iZXInKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTXVzdCBzcGVjaWZ5IFwidG9cIiBhbmQgXCJmcm9tXCIgYXJndW1lbnRzIGFzIG51bWJlcnMnKTtcbiAgfVxuICAvLyBhbGdvcml0aG0gZnJvbSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS81ODUyNjI4LzU5OTg4NFxuICBpZiAoZnJvbSA+IHRvKSB7XG4gICAgdmFyIHQgPSBmcm9tO1xuICAgIGZyb20gPSB0bztcbiAgICB0byA9IHQ7XG4gIH1cbiAgdmFyIGN5Y2xlID0gdG8gLSBmcm9tO1xuICBpZiAoY3ljbGUgPT09IDApIHtcbiAgICByZXR1cm4gdG87XG4gIH1cbiAgcmV0dXJuIHZhbHVlIC0gY3ljbGUgKiBNYXRoLmZsb29yKCh2YWx1ZSAtIGZyb20pIC8gY3ljbGUpO1xufVxuIiwidmFyIGRlZmluZWQgPSByZXF1aXJlKCdkZWZpbmVkJyk7XG52YXIgd3JhcCA9IHJlcXVpcmUoJy4vbGliL3dyYXAnKTtcbnZhciBFUFNJTE9OID0gTnVtYmVyLkVQU0lMT047XG5cbmZ1bmN0aW9uIGNsYW1wICh2YWx1ZSwgbWluLCBtYXgpIHtcbiAgcmV0dXJuIG1pbiA8IG1heFxuICAgID8gKHZhbHVlIDwgbWluID8gbWluIDogdmFsdWUgPiBtYXggPyBtYXggOiB2YWx1ZSlcbiAgICA6ICh2YWx1ZSA8IG1heCA/IG1heCA6IHZhbHVlID4gbWluID8gbWluIDogdmFsdWUpO1xufVxuXG5mdW5jdGlvbiBjbGFtcDAxICh2KSB7XG4gIHJldHVybiBjbGFtcCh2LCAwLCAxKTtcbn1cblxuZnVuY3Rpb24gbGVycCAobWluLCBtYXgsIHQpIHtcbiAgcmV0dXJuIG1pbiAqICgxIC0gdCkgKyBtYXggKiB0O1xufVxuXG5mdW5jdGlvbiBpbnZlcnNlTGVycCAobWluLCBtYXgsIHQpIHtcbiAgaWYgKE1hdGguYWJzKG1pbiAtIG1heCkgPCBFUFNJTE9OKSByZXR1cm4gMDtcbiAgZWxzZSByZXR1cm4gKHQgLSBtaW4pIC8gKG1heCAtIG1pbik7XG59XG5cbmZ1bmN0aW9uIHNtb290aHN0ZXAgKG1pbiwgbWF4LCB0KSB7XG4gIHZhciB4ID0gY2xhbXAoaW52ZXJzZUxlcnAobWluLCBtYXgsIHQpLCAwLCAxKTtcbiAgcmV0dXJuIHggKiB4ICogKDMgLSAyICogeCk7XG59XG5cbmZ1bmN0aW9uIHRvRmluaXRlIChuLCBkZWZhdWx0VmFsdWUpIHtcbiAgZGVmYXVsdFZhbHVlID0gZGVmaW5lZChkZWZhdWx0VmFsdWUsIDApO1xuICByZXR1cm4gdHlwZW9mIG4gPT09ICdudW1iZXInICYmIGlzRmluaXRlKG4pID8gbiA6IGRlZmF1bHRWYWx1ZTtcbn1cblxuZnVuY3Rpb24gZXhwYW5kVmVjdG9yIChkaW1zKSB7XG4gIGlmICh0eXBlb2YgZGltcyAhPT0gJ251bWJlcicpIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGRpbXMgYXJndW1lbnQnKTtcbiAgcmV0dXJuIGZ1bmN0aW9uIChwLCBkZWZhdWx0VmFsdWUpIHtcbiAgICBkZWZhdWx0VmFsdWUgPSBkZWZpbmVkKGRlZmF1bHRWYWx1ZSwgMCk7XG4gICAgdmFyIHNjYWxhcjtcbiAgICBpZiAocCA9PSBudWxsKSB7XG4gICAgICAvLyBObyB2ZWN0b3IsIGNyZWF0ZSBhIGRlZmF1bHQgb25lXG4gICAgICBzY2FsYXIgPSBkZWZhdWx0VmFsdWU7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgcCA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUocCkpIHtcbiAgICAgIC8vIEV4cGFuZCBzaW5nbGUgY2hhbm5lbCB0byBtdWx0aXBsZSB2ZWN0b3JcbiAgICAgIHNjYWxhciA9IHA7XG4gICAgfVxuXG4gICAgdmFyIG91dCA9IFtdO1xuICAgIHZhciBpO1xuICAgIGlmIChzY2FsYXIgPT0gbnVsbCkge1xuICAgICAgZm9yIChpID0gMDsgaSA8IGRpbXM7IGkrKykge1xuICAgICAgICBvdXRbaV0gPSB0b0Zpbml0ZShwW2ldLCBkZWZhdWx0VmFsdWUpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgZGltczsgaSsrKSB7XG4gICAgICAgIG91dFtpXSA9IHNjYWxhcjtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG91dDtcbiAgfTtcbn1cblxuZnVuY3Rpb24gbGVycEFycmF5IChtaW4sIG1heCwgdCwgb3V0KSB7XG4gIG91dCA9IG91dCB8fCBbXTtcbiAgaWYgKG1pbi5sZW5ndGggIT09IG1heC5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdtaW4gYW5kIG1heCBhcnJheSBhcmUgZXhwZWN0ZWQgdG8gaGF2ZSB0aGUgc2FtZSBsZW5ndGgnKTtcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IG1pbi5sZW5ndGg7IGkrKykge1xuICAgIG91dFtpXSA9IGxlcnAobWluW2ldLCBtYXhbaV0sIHQpO1xuICB9XG4gIHJldHVybiBvdXQ7XG59XG5cbmZ1bmN0aW9uIG5ld0FycmF5IChuLCBpbml0aWFsVmFsdWUpIHtcbiAgbiA9IGRlZmluZWQobiwgMCk7XG4gIGlmICh0eXBlb2YgbiAhPT0gJ251bWJlcicpIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIG4gYXJndW1lbnQgdG8gYmUgYSBudW1iZXInKTtcbiAgdmFyIG91dCA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG47IGkrKykgb3V0LnB1c2goaW5pdGlhbFZhbHVlKTtcbiAgcmV0dXJuIG91dDtcbn1cblxuZnVuY3Rpb24gbGluc3BhY2UgKG4sIG9wdHMpIHtcbiAgbiA9IGRlZmluZWQobiwgMCk7XG4gIGlmICh0eXBlb2YgbiAhPT0gJ251bWJlcicpIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIG4gYXJndW1lbnQgdG8gYmUgYSBudW1iZXInKTtcbiAgb3B0cyA9IG9wdHMgfHwge307XG4gIGlmICh0eXBlb2Ygb3B0cyA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgb3B0cyA9IHsgZW5kcG9pbnQ6IHRydWUgfTtcbiAgfVxuICB2YXIgb2Zmc2V0ID0gZGVmaW5lZChvcHRzLm9mZnNldCwgMCk7XG4gIGlmIChvcHRzLmVuZHBvaW50KSB7XG4gICAgcmV0dXJuIG5ld0FycmF5KG4pLm1hcChmdW5jdGlvbiAoXywgaSkge1xuICAgICAgcmV0dXJuIG4gPD0gMSA/IDAgOiAoKGkgKyBvZmZzZXQpIC8gKG4gLSAxKSk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG5ld0FycmF5KG4pLm1hcChmdW5jdGlvbiAoXywgaSkge1xuICAgICAgcmV0dXJuIChpICsgb2Zmc2V0KSAvIG47XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gbGVycEZyYW1lcyAodmFsdWVzLCB0LCBvdXQpIHtcbiAgdCA9IGNsYW1wKHQsIDAsIDEpO1xuXG4gIHZhciBsZW4gPSB2YWx1ZXMubGVuZ3RoIC0gMTtcbiAgdmFyIHdob2xlID0gdCAqIGxlbjtcbiAgdmFyIGZyYW1lID0gTWF0aC5mbG9vcih3aG9sZSk7XG4gIHZhciBmcmFjdCA9IHdob2xlIC0gZnJhbWU7XG5cbiAgdmFyIG5leHRGcmFtZSA9IE1hdGgubWluKGZyYW1lICsgMSwgbGVuKTtcbiAgdmFyIGEgPSB2YWx1ZXNbZnJhbWUgJSB2YWx1ZXMubGVuZ3RoXTtcbiAgdmFyIGIgPSB2YWx1ZXNbbmV4dEZyYW1lICUgdmFsdWVzLmxlbmd0aF07XG4gIGlmICh0eXBlb2YgYSA9PT0gJ251bWJlcicgJiYgdHlwZW9mIGIgPT09ICdudW1iZXInKSB7XG4gICAgcmV0dXJuIGxlcnAoYSwgYiwgZnJhY3QpO1xuICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoYSkgJiYgQXJyYXkuaXNBcnJheShiKSkge1xuICAgIHJldHVybiBsZXJwQXJyYXkoYSwgYiwgZnJhY3QsIG91dCk7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTWlzbWF0Y2ggaW4gdmFsdWUgdHlwZSBvZiB0d28gYXJyYXkgZWxlbWVudHM6ICcgKyBmcmFtZSArICcgYW5kICcgKyBuZXh0RnJhbWUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIG1vZCAoYSwgYikge1xuICByZXR1cm4gKChhICUgYikgKyBiKSAlIGI7XG59XG5cbmZ1bmN0aW9uIGRlZ1RvUmFkIChuKSB7XG4gIHJldHVybiBuICogTWF0aC5QSSAvIDE4MDtcbn1cblxuZnVuY3Rpb24gcmFkVG9EZWcgKG4pIHtcbiAgcmV0dXJuIG4gKiAxODAgLyBNYXRoLlBJO1xufVxuXG5mdW5jdGlvbiBmcmFjdCAobikge1xuICByZXR1cm4gbiAtIE1hdGguZmxvb3Iobik7XG59XG5cbmZ1bmN0aW9uIHNpZ24gKG4pIHtcbiAgaWYgKG4gPiAwKSByZXR1cm4gMTtcbiAgZWxzZSBpZiAobiA8IDApIHJldHVybiAtMTtcbiAgZWxzZSByZXR1cm4gMDtcbn1cblxuLy8gU3BlY2lmaWMgZnVuY3Rpb24gZnJvbSBVbml0eSAvIG9mTWF0aCwgbm90IHN1cmUgaXRzIG5lZWRlZD9cbi8vIGZ1bmN0aW9uIGxlcnBXcmFwIChhLCBiLCB0LCBtaW4sIG1heCkge1xuLy8gICByZXR1cm4gd3JhcChhICsgd3JhcChiIC0gYSwgbWluLCBtYXgpICogdCwgbWluLCBtYXgpXG4vLyB9XG5cbmZ1bmN0aW9uIHBpbmdQb25nICh0LCBsZW5ndGgpIHtcbiAgdCA9IG1vZCh0LCBsZW5ndGggKiAyKTtcbiAgcmV0dXJuIGxlbmd0aCAtIE1hdGguYWJzKHQgLSBsZW5ndGgpO1xufVxuXG5mdW5jdGlvbiBkYW1wIChhLCBiLCBsYW1iZGEsIGR0KSB7XG4gIHJldHVybiBsZXJwKGEsIGIsIDEgLSBNYXRoLmV4cCgtbGFtYmRhICogZHQpKTtcbn1cblxuZnVuY3Rpb24gZGFtcEFycmF5IChhLCBiLCBsYW1iZGEsIGR0LCBvdXQpIHtcbiAgb3V0ID0gb3V0IHx8IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGEubGVuZ3RoOyBpKyspIHtcbiAgICBvdXRbaV0gPSBkYW1wKGFbaV0sIGJbaV0sIGxhbWJkYSwgZHQpO1xuICB9XG4gIHJldHVybiBvdXQ7XG59XG5cbmZ1bmN0aW9uIG1hcFJhbmdlICh2YWx1ZSwgaW5wdXRNaW4sIGlucHV0TWF4LCBvdXRwdXRNaW4sIG91dHB1dE1heCwgY2xhbXApIHtcbiAgLy8gUmVmZXJlbmNlOlxuICAvLyBodHRwczovL29wZW5mcmFtZXdvcmtzLmNjL2RvY3VtZW50YXRpb24vbWF0aC9vZk1hdGgvXG4gIGlmIChNYXRoLmFicyhpbnB1dE1pbiAtIGlucHV0TWF4KSA8IEVQU0lMT04pIHtcbiAgICByZXR1cm4gb3V0cHV0TWluO1xuICB9IGVsc2Uge1xuICAgIHZhciBvdXRWYWwgPSAoKHZhbHVlIC0gaW5wdXRNaW4pIC8gKGlucHV0TWF4IC0gaW5wdXRNaW4pICogKG91dHB1dE1heCAtIG91dHB1dE1pbikgKyBvdXRwdXRNaW4pO1xuICAgIGlmIChjbGFtcCkge1xuICAgICAgaWYgKG91dHB1dE1heCA8IG91dHB1dE1pbikge1xuICAgICAgICBpZiAob3V0VmFsIDwgb3V0cHV0TWF4KSBvdXRWYWwgPSBvdXRwdXRNYXg7XG4gICAgICAgIGVsc2UgaWYgKG91dFZhbCA+IG91dHB1dE1pbikgb3V0VmFsID0gb3V0cHV0TWluO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKG91dFZhbCA+IG91dHB1dE1heCkgb3V0VmFsID0gb3V0cHV0TWF4O1xuICAgICAgICBlbHNlIGlmIChvdXRWYWwgPCBvdXRwdXRNaW4pIG91dFZhbCA9IG91dHB1dE1pbjtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG91dFZhbDtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbW9kOiBtb2QsXG4gIGZyYWN0OiBmcmFjdCxcbiAgc2lnbjogc2lnbixcbiAgZGVnVG9SYWQ6IGRlZ1RvUmFkLFxuICByYWRUb0RlZzogcmFkVG9EZWcsXG4gIHdyYXA6IHdyYXAsXG4gIHBpbmdQb25nOiBwaW5nUG9uZyxcbiAgbGluc3BhY2U6IGxpbnNwYWNlLFxuICBsZXJwOiBsZXJwLFxuICBsZXJwQXJyYXk6IGxlcnBBcnJheSxcbiAgaW52ZXJzZUxlcnA6IGludmVyc2VMZXJwLFxuICBsZXJwRnJhbWVzOiBsZXJwRnJhbWVzLFxuICBjbGFtcDogY2xhbXAsXG4gIGNsYW1wMDE6IGNsYW1wMDEsXG4gIHNtb290aHN0ZXA6IHNtb290aHN0ZXAsXG4gIGRhbXA6IGRhbXAsXG4gIGRhbXBBcnJheTogZGFtcEFycmF5LFxuICBtYXBSYW5nZTogbWFwUmFuZ2UsXG4gIGV4cGFuZDJEOiBleHBhbmRWZWN0b3IoMiksXG4gIGV4cGFuZDNEOiBleHBhbmRWZWN0b3IoMyksXG4gIGV4cGFuZDREOiBleHBhbmRWZWN0b3IoNClcbn07XG4iLCJ2YXIgc2VlZFJhbmRvbSA9IHJlcXVpcmUoJ3NlZWQtcmFuZG9tJyk7XG52YXIgU2ltcGxleE5vaXNlID0gcmVxdWlyZSgnc2ltcGxleC1ub2lzZScpO1xudmFyIGRlZmluZWQgPSByZXF1aXJlKCdkZWZpbmVkJyk7XG5cbmZ1bmN0aW9uIGNyZWF0ZVJhbmRvbSAoZGVmYXVsdFNlZWQpIHtcbiAgZGVmYXVsdFNlZWQgPSBkZWZpbmVkKGRlZmF1bHRTZWVkLCBudWxsKTtcbiAgdmFyIGRlZmF1bHRSYW5kb20gPSBNYXRoLnJhbmRvbTtcbiAgdmFyIGN1cnJlbnRTZWVkO1xuICB2YXIgY3VycmVudFJhbmRvbTtcbiAgdmFyIG5vaXNlR2VuZXJhdG9yO1xuICB2YXIgX25leHRHYXVzc2lhbiA9IG51bGw7XG4gIHZhciBfaGFzTmV4dEdhdXNzaWFuID0gZmFsc2U7XG5cbiAgc2V0U2VlZChkZWZhdWx0U2VlZCk7XG5cbiAgcmV0dXJuIHtcbiAgICB2YWx1ZTogdmFsdWUsXG4gICAgY3JlYXRlUmFuZG9tOiBmdW5jdGlvbiAoZGVmYXVsdFNlZWQpIHtcbiAgICAgIHJldHVybiBjcmVhdGVSYW5kb20oZGVmYXVsdFNlZWQpO1xuICAgIH0sXG4gICAgc2V0U2VlZDogc2V0U2VlZCxcbiAgICBnZXRTZWVkOiBnZXRTZWVkLFxuICAgIGdldFJhbmRvbVNlZWQ6IGdldFJhbmRvbVNlZWQsXG4gICAgdmFsdWVOb25aZXJvOiB2YWx1ZU5vblplcm8sXG4gICAgcGVybXV0ZU5vaXNlOiBwZXJtdXRlTm9pc2UsXG4gICAgbm9pc2UxRDogbm9pc2UxRCxcbiAgICBub2lzZTJEOiBub2lzZTJELFxuICAgIG5vaXNlM0Q6IG5vaXNlM0QsXG4gICAgbm9pc2U0RDogbm9pc2U0RCxcbiAgICBzaWduOiBzaWduLFxuICAgIGJvb2xlYW46IGJvb2xlYW4sXG4gICAgY2hhbmNlOiBjaGFuY2UsXG4gICAgcmFuZ2U6IHJhbmdlLFxuICAgIHJhbmdlRmxvb3I6IHJhbmdlRmxvb3IsXG4gICAgcGljazogcGljayxcbiAgICBzaHVmZmxlOiBzaHVmZmxlLFxuICAgIG9uQ2lyY2xlOiBvbkNpcmNsZSxcbiAgICBpbnNpZGVDaXJjbGU6IGluc2lkZUNpcmNsZSxcbiAgICBvblNwaGVyZTogb25TcGhlcmUsXG4gICAgaW5zaWRlU3BoZXJlOiBpbnNpZGVTcGhlcmUsXG4gICAgcXVhdGVybmlvbjogcXVhdGVybmlvbixcbiAgICB3ZWlnaHRlZDogd2VpZ2h0ZWQsXG4gICAgd2VpZ2h0ZWRTZXQ6IHdlaWdodGVkU2V0LFxuICAgIHdlaWdodGVkU2V0SW5kZXg6IHdlaWdodGVkU2V0SW5kZXgsXG4gICAgZ2F1c3NpYW46IGdhdXNzaWFuXG4gIH07XG5cbiAgZnVuY3Rpb24gc2V0U2VlZCAoc2VlZCwgb3B0KSB7XG4gICAgaWYgKHR5cGVvZiBzZWVkID09PSAnbnVtYmVyJyB8fCB0eXBlb2Ygc2VlZCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGN1cnJlbnRTZWVkID0gc2VlZDtcbiAgICAgIGN1cnJlbnRSYW5kb20gPSBzZWVkUmFuZG9tKGN1cnJlbnRTZWVkLCBvcHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjdXJyZW50U2VlZCA9IHVuZGVmaW5lZDtcbiAgICAgIGN1cnJlbnRSYW5kb20gPSBkZWZhdWx0UmFuZG9tO1xuICAgIH1cbiAgICBub2lzZUdlbmVyYXRvciA9IGNyZWF0ZU5vaXNlKCk7XG4gICAgX25leHRHYXVzc2lhbiA9IG51bGw7XG4gICAgX2hhc05leHRHYXVzc2lhbiA9IGZhbHNlO1xuICB9XG5cbiAgZnVuY3Rpb24gdmFsdWUgKCkge1xuICAgIHJldHVybiBjdXJyZW50UmFuZG9tKCk7XG4gIH1cblxuICBmdW5jdGlvbiB2YWx1ZU5vblplcm8gKCkge1xuICAgIHZhciB1ID0gMDtcbiAgICB3aGlsZSAodSA9PT0gMCkgdSA9IHZhbHVlKCk7XG4gICAgcmV0dXJuIHU7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRTZWVkICgpIHtcbiAgICByZXR1cm4gY3VycmVudFNlZWQ7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRSYW5kb21TZWVkICgpIHtcbiAgICB2YXIgc2VlZCA9IFN0cmluZyhNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDAwMDAwKSk7XG4gICAgcmV0dXJuIHNlZWQ7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVOb2lzZSAoKSB7XG4gICAgcmV0dXJuIG5ldyBTaW1wbGV4Tm9pc2UoY3VycmVudFJhbmRvbSk7XG4gIH1cblxuICBmdW5jdGlvbiBwZXJtdXRlTm9pc2UgKCkge1xuICAgIG5vaXNlR2VuZXJhdG9yID0gY3JlYXRlTm9pc2UoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vaXNlMUQgKHgsIGZyZXF1ZW5jeSwgYW1wbGl0dWRlKSB7XG4gICAgaWYgKCFpc0Zpbml0ZSh4KSkgdGhyb3cgbmV3IFR5cGVFcnJvcigneCBjb21wb25lbnQgZm9yIG5vaXNlKCkgbXVzdCBiZSBmaW5pdGUnKTtcbiAgICBmcmVxdWVuY3kgPSBkZWZpbmVkKGZyZXF1ZW5jeSwgMSk7XG4gICAgYW1wbGl0dWRlID0gZGVmaW5lZChhbXBsaXR1ZGUsIDEpO1xuICAgIHJldHVybiBhbXBsaXR1ZGUgKiBub2lzZUdlbmVyYXRvci5ub2lzZTJEKHggKiBmcmVxdWVuY3ksIDApO1xuICB9XG5cbiAgZnVuY3Rpb24gbm9pc2UyRCAoeCwgeSwgZnJlcXVlbmN5LCBhbXBsaXR1ZGUpIHtcbiAgICBpZiAoIWlzRmluaXRlKHgpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCd4IGNvbXBvbmVudCBmb3Igbm9pc2UoKSBtdXN0IGJlIGZpbml0ZScpO1xuICAgIGlmICghaXNGaW5pdGUoeSkpIHRocm93IG5ldyBUeXBlRXJyb3IoJ3kgY29tcG9uZW50IGZvciBub2lzZSgpIG11c3QgYmUgZmluaXRlJyk7XG4gICAgZnJlcXVlbmN5ID0gZGVmaW5lZChmcmVxdWVuY3ksIDEpO1xuICAgIGFtcGxpdHVkZSA9IGRlZmluZWQoYW1wbGl0dWRlLCAxKTtcbiAgICByZXR1cm4gYW1wbGl0dWRlICogbm9pc2VHZW5lcmF0b3Iubm9pc2UyRCh4ICogZnJlcXVlbmN5LCB5ICogZnJlcXVlbmN5KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vaXNlM0QgKHgsIHksIHosIGZyZXF1ZW5jeSwgYW1wbGl0dWRlKSB7XG4gICAgaWYgKCFpc0Zpbml0ZSh4KSkgdGhyb3cgbmV3IFR5cGVFcnJvcigneCBjb21wb25lbnQgZm9yIG5vaXNlKCkgbXVzdCBiZSBmaW5pdGUnKTtcbiAgICBpZiAoIWlzRmluaXRlKHkpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCd5IGNvbXBvbmVudCBmb3Igbm9pc2UoKSBtdXN0IGJlIGZpbml0ZScpO1xuICAgIGlmICghaXNGaW5pdGUoeikpIHRocm93IG5ldyBUeXBlRXJyb3IoJ3ogY29tcG9uZW50IGZvciBub2lzZSgpIG11c3QgYmUgZmluaXRlJyk7XG4gICAgZnJlcXVlbmN5ID0gZGVmaW5lZChmcmVxdWVuY3ksIDEpO1xuICAgIGFtcGxpdHVkZSA9IGRlZmluZWQoYW1wbGl0dWRlLCAxKTtcbiAgICByZXR1cm4gYW1wbGl0dWRlICogbm9pc2VHZW5lcmF0b3Iubm9pc2UzRChcbiAgICAgIHggKiBmcmVxdWVuY3ksXG4gICAgICB5ICogZnJlcXVlbmN5LFxuICAgICAgeiAqIGZyZXF1ZW5jeVxuICAgICk7XG4gIH1cblxuICBmdW5jdGlvbiBub2lzZTREICh4LCB5LCB6LCB3LCBmcmVxdWVuY3ksIGFtcGxpdHVkZSkge1xuICAgIGlmICghaXNGaW5pdGUoeCkpIHRocm93IG5ldyBUeXBlRXJyb3IoJ3ggY29tcG9uZW50IGZvciBub2lzZSgpIG11c3QgYmUgZmluaXRlJyk7XG4gICAgaWYgKCFpc0Zpbml0ZSh5KSkgdGhyb3cgbmV3IFR5cGVFcnJvcigneSBjb21wb25lbnQgZm9yIG5vaXNlKCkgbXVzdCBiZSBmaW5pdGUnKTtcbiAgICBpZiAoIWlzRmluaXRlKHopKSB0aHJvdyBuZXcgVHlwZUVycm9yKCd6IGNvbXBvbmVudCBmb3Igbm9pc2UoKSBtdXN0IGJlIGZpbml0ZScpO1xuICAgIGlmICghaXNGaW5pdGUodykpIHRocm93IG5ldyBUeXBlRXJyb3IoJ3cgY29tcG9uZW50IGZvciBub2lzZSgpIG11c3QgYmUgZmluaXRlJyk7XG4gICAgZnJlcXVlbmN5ID0gZGVmaW5lZChmcmVxdWVuY3ksIDEpO1xuICAgIGFtcGxpdHVkZSA9IGRlZmluZWQoYW1wbGl0dWRlLCAxKTtcbiAgICByZXR1cm4gYW1wbGl0dWRlICogbm9pc2VHZW5lcmF0b3Iubm9pc2U0RChcbiAgICAgIHggKiBmcmVxdWVuY3ksXG4gICAgICB5ICogZnJlcXVlbmN5LFxuICAgICAgeiAqIGZyZXF1ZW5jeSxcbiAgICAgIHcgKiBmcmVxdWVuY3lcbiAgICApO1xuICB9XG5cbiAgZnVuY3Rpb24gc2lnbiAoKSB7XG4gICAgcmV0dXJuIGJvb2xlYW4oKSA/IDEgOiAtMTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGJvb2xlYW4gKCkge1xuICAgIHJldHVybiB2YWx1ZSgpID4gMC41O1xuICB9XG5cbiAgZnVuY3Rpb24gY2hhbmNlIChuKSB7XG4gICAgbiA9IGRlZmluZWQobiwgMC41KTtcbiAgICBpZiAodHlwZW9mIG4gIT09ICdudW1iZXInKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdleHBlY3RlZCBuIHRvIGJlIGEgbnVtYmVyJyk7XG4gICAgcmV0dXJuIHZhbHVlKCkgPCBuO1xuICB9XG5cbiAgZnVuY3Rpb24gcmFuZ2UgKG1pbiwgbWF4KSB7XG4gICAgaWYgKG1heCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBtYXggPSBtaW47XG4gICAgICBtaW4gPSAwO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgbWluICE9PSAnbnVtYmVyJyB8fCB0eXBlb2YgbWF4ICE9PSAnbnVtYmVyJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgYWxsIGFyZ3VtZW50cyB0byBiZSBudW1iZXJzJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbHVlKCkgKiAobWF4IC0gbWluKSArIG1pbjtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJhbmdlRmxvb3IgKG1pbiwgbWF4KSB7XG4gICAgaWYgKG1heCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBtYXggPSBtaW47XG4gICAgICBtaW4gPSAwO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgbWluICE9PSAnbnVtYmVyJyB8fCB0eXBlb2YgbWF4ICE9PSAnbnVtYmVyJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgYWxsIGFyZ3VtZW50cyB0byBiZSBudW1iZXJzJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIE1hdGguZmxvb3IocmFuZ2UobWluLCBtYXgpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBpY2sgKGFycmF5KSB7XG4gICAgaWYgKGFycmF5Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICByZXR1cm4gYXJyYXlbcmFuZ2VGbG9vcigwLCBhcnJheS5sZW5ndGgpXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNodWZmbGUgKGFycikge1xuICAgIGlmICghQXJyYXkuaXNBcnJheShhcnIpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBBcnJheSwgZ290ICcgKyB0eXBlb2YgYXJyKTtcbiAgICB9XG5cbiAgICB2YXIgcmFuZDtcbiAgICB2YXIgdG1wO1xuICAgIHZhciBsZW4gPSBhcnIubGVuZ3RoO1xuICAgIHZhciByZXQgPSBhcnIuc2xpY2UoKTtcbiAgICB3aGlsZSAobGVuKSB7XG4gICAgICByYW5kID0gTWF0aC5mbG9vcih2YWx1ZSgpICogbGVuLS0pO1xuICAgICAgdG1wID0gcmV0W2xlbl07XG4gICAgICByZXRbbGVuXSA9IHJldFtyYW5kXTtcbiAgICAgIHJldFtyYW5kXSA9IHRtcDtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uQ2lyY2xlIChyYWRpdXMsIG91dCkge1xuICAgIHJhZGl1cyA9IGRlZmluZWQocmFkaXVzLCAxKTtcbiAgICBvdXQgPSBvdXQgfHwgW107XG4gICAgdmFyIHRoZXRhID0gdmFsdWUoKSAqIDIuMCAqIE1hdGguUEk7XG4gICAgb3V0WzBdID0gcmFkaXVzICogTWF0aC5jb3ModGhldGEpO1xuICAgIG91dFsxXSA9IHJhZGl1cyAqIE1hdGguc2luKHRoZXRhKTtcbiAgICByZXR1cm4gb3V0O1xuICB9XG5cbiAgZnVuY3Rpb24gaW5zaWRlQ2lyY2xlIChyYWRpdXMsIG91dCkge1xuICAgIHJhZGl1cyA9IGRlZmluZWQocmFkaXVzLCAxKTtcbiAgICBvdXQgPSBvdXQgfHwgW107XG4gICAgb25DaXJjbGUoMSwgb3V0KTtcbiAgICB2YXIgciA9IHJhZGl1cyAqIE1hdGguc3FydCh2YWx1ZSgpKTtcbiAgICBvdXRbMF0gKj0gcjtcbiAgICBvdXRbMV0gKj0gcjtcbiAgICByZXR1cm4gb3V0O1xuICB9XG5cbiAgZnVuY3Rpb24gb25TcGhlcmUgKHJhZGl1cywgb3V0KSB7XG4gICAgcmFkaXVzID0gZGVmaW5lZChyYWRpdXMsIDEpO1xuICAgIG91dCA9IG91dCB8fCBbXTtcbiAgICB2YXIgdSA9IHZhbHVlKCkgKiBNYXRoLlBJICogMjtcbiAgICB2YXIgdiA9IHZhbHVlKCkgKiAyIC0gMTtcbiAgICB2YXIgcGhpID0gdTtcbiAgICB2YXIgdGhldGEgPSBNYXRoLmFjb3Modik7XG4gICAgb3V0WzBdID0gcmFkaXVzICogTWF0aC5zaW4odGhldGEpICogTWF0aC5jb3MocGhpKTtcbiAgICBvdXRbMV0gPSByYWRpdXMgKiBNYXRoLnNpbih0aGV0YSkgKiBNYXRoLnNpbihwaGkpO1xuICAgIG91dFsyXSA9IHJhZGl1cyAqIE1hdGguY29zKHRoZXRhKTtcbiAgICByZXR1cm4gb3V0O1xuICB9XG5cbiAgZnVuY3Rpb24gaW5zaWRlU3BoZXJlIChyYWRpdXMsIG91dCkge1xuICAgIHJhZGl1cyA9IGRlZmluZWQocmFkaXVzLCAxKTtcbiAgICBvdXQgPSBvdXQgfHwgW107XG4gICAgdmFyIHUgPSB2YWx1ZSgpICogTWF0aC5QSSAqIDI7XG4gICAgdmFyIHYgPSB2YWx1ZSgpICogMiAtIDE7XG4gICAgdmFyIGsgPSB2YWx1ZSgpO1xuXG4gICAgdmFyIHBoaSA9IHU7XG4gICAgdmFyIHRoZXRhID0gTWF0aC5hY29zKHYpO1xuICAgIHZhciByID0gcmFkaXVzICogTWF0aC5jYnJ0KGspO1xuICAgIG91dFswXSA9IHIgKiBNYXRoLnNpbih0aGV0YSkgKiBNYXRoLmNvcyhwaGkpO1xuICAgIG91dFsxXSA9IHIgKiBNYXRoLnNpbih0aGV0YSkgKiBNYXRoLnNpbihwaGkpO1xuICAgIG91dFsyXSA9IHIgKiBNYXRoLmNvcyh0aGV0YSk7XG4gICAgcmV0dXJuIG91dDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHF1YXRlcm5pb24gKG91dCkge1xuICAgIG91dCA9IG91dCB8fCBbXTtcbiAgICB2YXIgdTEgPSB2YWx1ZSgpO1xuICAgIHZhciB1MiA9IHZhbHVlKCk7XG4gICAgdmFyIHUzID0gdmFsdWUoKTtcblxuICAgIHZhciBzcTEgPSBNYXRoLnNxcnQoMSAtIHUxKTtcbiAgICB2YXIgc3EyID0gTWF0aC5zcXJ0KHUxKTtcblxuICAgIHZhciB0aGV0YTEgPSBNYXRoLlBJICogMiAqIHUyO1xuICAgIHZhciB0aGV0YTIgPSBNYXRoLlBJICogMiAqIHUzO1xuXG4gICAgdmFyIHggPSBNYXRoLnNpbih0aGV0YTEpICogc3ExO1xuICAgIHZhciB5ID0gTWF0aC5jb3ModGhldGExKSAqIHNxMTtcbiAgICB2YXIgeiA9IE1hdGguc2luKHRoZXRhMikgKiBzcTI7XG4gICAgdmFyIHcgPSBNYXRoLmNvcyh0aGV0YTIpICogc3EyO1xuICAgIG91dFswXSA9IHg7XG4gICAgb3V0WzFdID0geTtcbiAgICBvdXRbMl0gPSB6O1xuICAgIG91dFszXSA9IHc7XG4gICAgcmV0dXJuIG91dDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHdlaWdodGVkU2V0IChzZXQpIHtcbiAgICBzZXQgPSBzZXQgfHwgW107XG4gICAgaWYgKHNldC5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuICAgIHJldHVybiBzZXRbd2VpZ2h0ZWRTZXRJbmRleChzZXQpXS52YWx1ZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHdlaWdodGVkU2V0SW5kZXggKHNldCkge1xuICAgIHNldCA9IHNldCB8fCBbXTtcbiAgICBpZiAoc2V0Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIC0xO1xuICAgIHJldHVybiB3ZWlnaHRlZChzZXQubWFwKGZ1bmN0aW9uIChzKSB7XG4gICAgICByZXR1cm4gcy53ZWlnaHQ7XG4gICAgfSkpO1xuICB9XG5cbiAgZnVuY3Rpb24gd2VpZ2h0ZWQgKHdlaWdodHMpIHtcbiAgICB3ZWlnaHRzID0gd2VpZ2h0cyB8fCBbXTtcbiAgICBpZiAod2VpZ2h0cy5sZW5ndGggPT09IDApIHJldHVybiAtMTtcbiAgICB2YXIgdG90YWxXZWlnaHQgPSAwO1xuICAgIHZhciBpO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IHdlaWdodHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRvdGFsV2VpZ2h0ICs9IHdlaWdodHNbaV07XG4gICAgfVxuXG4gICAgaWYgKHRvdGFsV2VpZ2h0IDw9IDApIHRocm93IG5ldyBFcnJvcignV2VpZ2h0cyBtdXN0IHN1bSB0byA+IDAnKTtcblxuICAgIHZhciByYW5kb20gPSB2YWx1ZSgpICogdG90YWxXZWlnaHQ7XG4gICAgZm9yIChpID0gMDsgaSA8IHdlaWdodHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChyYW5kb20gPCB3ZWlnaHRzW2ldKSB7XG4gICAgICAgIHJldHVybiBpO1xuICAgICAgfVxuICAgICAgcmFuZG9tIC09IHdlaWdodHNbaV07XG4gICAgfVxuICAgIHJldHVybiAwO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2F1c3NpYW4gKG1lYW4sIHN0YW5kYXJkRGVyaXZhdGlvbikge1xuICAgIG1lYW4gPSBkZWZpbmVkKG1lYW4sIDApO1xuICAgIHN0YW5kYXJkRGVyaXZhdGlvbiA9IGRlZmluZWQoc3RhbmRhcmREZXJpdmF0aW9uLCAxKTtcblxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9vcGVuamRrLW1pcnJvci9qZGs3dS1qZGsvYmxvYi9mNGQ4MDk1N2U4OWExOWEyOWJiOWY5ODA3ZDJhMjgzNTFlZDdmN2RmL3NyYy9zaGFyZS9jbGFzc2VzL2phdmEvdXRpbC9SYW5kb20uamF2YSNMNDk2XG4gICAgaWYgKF9oYXNOZXh0R2F1c3NpYW4pIHtcbiAgICAgIF9oYXNOZXh0R2F1c3NpYW4gPSBmYWxzZTtcbiAgICAgIHZhciByZXN1bHQgPSBfbmV4dEdhdXNzaWFuO1xuICAgICAgX25leHRHYXVzc2lhbiA9IG51bGw7XG4gICAgICByZXR1cm4gbWVhbiArIHN0YW5kYXJkRGVyaXZhdGlvbiAqIHJlc3VsdDtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHYxID0gMDtcbiAgICAgIHZhciB2MiA9IDA7XG4gICAgICB2YXIgcyA9IDA7XG4gICAgICBkbyB7XG4gICAgICAgIHYxID0gdmFsdWUoKSAqIDIgLSAxOyAvLyBiZXR3ZWVuIC0xIGFuZCAxXG4gICAgICAgIHYyID0gdmFsdWUoKSAqIDIgLSAxOyAvLyBiZXR3ZWVuIC0xIGFuZCAxXG4gICAgICAgIHMgPSB2MSAqIHYxICsgdjIgKiB2MjtcbiAgICAgIH0gd2hpbGUgKHMgPj0gMSB8fCBzID09PSAwKTtcbiAgICAgIHZhciBtdWx0aXBsaWVyID0gTWF0aC5zcXJ0KC0yICogTWF0aC5sb2cocykgLyBzKTtcbiAgICAgIF9uZXh0R2F1c3NpYW4gPSAodjIgKiBtdWx0aXBsaWVyKTtcbiAgICAgIF9oYXNOZXh0R2F1c3NpYW4gPSB0cnVlO1xuICAgICAgcmV0dXJuIG1lYW4gKyBzdGFuZGFyZERlcml2YXRpb24gKiAodjEgKiBtdWx0aXBsaWVyKTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVSYW5kb20oKTtcbiIsIi8vIEltcG9ydHNcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fIGZyb20gXCIuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyBmcm9tIFwiLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qc1wiO1xudmFyIF9fX0NTU19MT0FERVJfRVhQT1JUX19fID0gX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fKF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18pO1xuX19fQ1NTX0xPQURFUl9FWFBPUlRfX18ucHVzaChbbW9kdWxlLmlkLCBcIkBpbXBvcnQgdXJsKGh0dHBzOi8vZm9udHMuZ29vZ2xlYXBpcy5jb20vY3NzMj9mYW1pbHk9UmFqZGhhbmk6d2dodEA0MDA7NzAwJmRpc3BsYXk9c3dhcCk7XCJdKTtcbi8vIE1vZHVsZVxuX19fQ1NTX0xPQURFUl9FWFBPUlRfX18ucHVzaChbbW9kdWxlLmlkLCBcIioge1xcbiAgICBtYXJnaW46IDA7XFxuICAgIHBhZGRpbmc6IDA7XFxufVxcblxcbmh0bWw6Oi13ZWJraXQtc2Nyb2xsYmFyIHtcXG4gICAgZGlzcGxheTogbm9uZTtcXG59XFxuICBcXG4vKiBIaWRlIHNjcm9sbGJhciBmb3IgSUUsIEVkZ2UgYW5kIEZpcmVmb3ggKi9cXG5odG1sIHtcXG4gICAgLW1zLW92ZXJmbG93LXN0eWxlOiBub25lOyAgLyogSUUgYW5kIEVkZ2UgKi9cXG4gICAgc2Nyb2xsYmFyLXdpZHRoOiBub25lOyAgLyogRmlyZWZveCAqL1xcbn1cXG5cXG5ib2R5IHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG59XFxuXFxuaDEge1xcbiAgICBtYXJnaW46IDUwcHg7XFxuICAgIGZvbnQtc2l6ZTogNTBweDtcXG4gICAgZm9udC1mYW1pbHk6ICdSYWpkaGFuaScsIHNhbnMtc2VyaWY7XFxuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XFxufVxcblxcbiNjb250YWluZXIge1xcbiAgICB3aWR0aDogNzUwcHg7XFxuICAgIHBhZGRpbmctdG9wOiA1MHB4O1xcbiAgICAvKiBwYWRkaW5nLWJvdHRvbTogNTBweDsgKi8gLypwcm92aWRlZCBwYWRkaW5nIGFmdGVyIDxwPiovXFxuICAgIGJveC1zaGFkb3c6IDBweCAwcHggMTBweCByZ2IoMjAwLCAyMDAsIDIwMCk7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxufVxcblxcbnAge1xcbiAgICBmb250LWZhbWlseTogJ1JhamRoYW5pJywgc2Fucy1zZXJpZjtcXG4gICAgbGV0dGVyLXNwYWNpbmc6IDAuMDc1ZW07XFxufVxcblxcbiNjb250YWluZXIgPiBwIHtcXG4gICAgcGFkZGluZy10b3A6IDIwcHg7XFxuICAgIHBhZGRpbmctYm90dG9tOiA1NXB4O1xcbiAgICBtYXJnaW4tcmlnaHQ6IDEyNXB4O1xcbiAgICBhbGlnbi1zZWxmOiBmbGV4LWVuZDtcXG59XFxuXFxuYSB7XFxuICAgIGZvbnQtZmFtaWx5OiAnUmFqZGhhbmknLCBzYW5zLXNlcmlmOyBcXG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgICBjb2xvcjogcmdiKDE5MiwgMCwgMCk7XFxufVxcblxcbiNmb290ZXIge1xcbiAgICBtYXJnaW4tdG9wOiA3NXB4O1xcbiAgICBwYWRkaW5nOiAyNXB4O1xcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxufVxcblxcbkBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNzUxcHgpIHtcXG4gICAgaDEge1xcbiAgICAgICAgbWFyZ2luOiA0MHB4O1xcbiAgICAgICAgZm9udC1zaXplOiA0MHB4O1xcbiAgICB9XFxuXFxuICAgICNjb250YWluZXIge1xcbiAgICAgICAgd2lkdGg6IDQwMHB4O1xcbiAgICAgICAgcGFkZGluZy10b3A6IDMwcHg7XFxuICAgICAgICBib3gtc2hhZG93OiBub25lO1xcbiAgICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICB9XFxuXFxuICAgICNjb250YWluZXIgPiBwIHtcXG4gICAgICAgIG1hcmdpbi1yaWdodDogMHB4O1xcbiAgICAgICAgYWxpZ24tc2VsZjogZmxleC1lbmQ7XFxuICAgIH1cXG59XFxuXCIsIFwiXCIse1widmVyc2lvblwiOjMsXCJzb3VyY2VzXCI6W1wid2VicGFjazovLy4vc3JjL3N0eWxlLmNzc1wiXSxcIm5hbWVzXCI6W10sXCJtYXBwaW5nc1wiOlwiQUFFQTtJQUNJLFNBQVM7SUFDVCxVQUFVO0FBQ2Q7O0FBRUE7SUFDSSxhQUFhO0FBQ2pCOztBQUVBLDRDQUE0QztBQUM1QztJQUNJLHdCQUF3QixHQUFHLGdCQUFnQjtJQUMzQyxxQkFBcUIsR0FBRyxZQUFZO0FBQ3hDOztBQUVBO0lBQ0ksYUFBYTtJQUNiLHNCQUFzQjtJQUN0QixtQkFBbUI7QUFDdkI7O0FBRUE7SUFDSSxZQUFZO0lBQ1osZUFBZTtJQUNmLG1DQUFtQztJQUNuQyxnQkFBZ0I7QUFDcEI7O0FBRUE7SUFDSSxZQUFZO0lBQ1osaUJBQWlCO0lBQ2pCLDBCQUEwQixFQUFFLDZCQUE2QjtJQUN6RCwyQ0FBMkM7SUFDM0MsYUFBYTtJQUNiLHNCQUFzQjtJQUN0QixtQkFBbUI7QUFDdkI7O0FBRUE7SUFDSSxtQ0FBbUM7SUFDbkMsdUJBQXVCO0FBQzNCOztBQUVBO0lBQ0ksaUJBQWlCO0lBQ2pCLG9CQUFvQjtJQUNwQixtQkFBbUI7SUFDbkIsb0JBQW9CO0FBQ3hCOztBQUVBO0lBQ0ksbUNBQW1DO0lBQ25DLHFCQUFxQjtJQUNyQixxQkFBcUI7QUFDekI7O0FBRUE7SUFDSSxnQkFBZ0I7SUFDaEIsYUFBYTtJQUNiLGtCQUFrQjtBQUN0Qjs7QUFFQTtJQUNJO1FBQ0ksWUFBWTtRQUNaLGVBQWU7SUFDbkI7O0lBRUE7UUFDSSxZQUFZO1FBQ1osaUJBQWlCO1FBQ2pCLGdCQUFnQjtRQUNoQixhQUFhO1FBQ2Isc0JBQXNCO1FBQ3RCLG1CQUFtQjtJQUN2Qjs7SUFFQTtRQUNJLGlCQUFpQjtRQUNqQixvQkFBb0I7SUFDeEI7QUFDSlwiLFwic291cmNlc0NvbnRlbnRcIjpbXCJAaW1wb3J0IHVybCgnaHR0cHM6Ly9mb250cy5nb29nbGVhcGlzLmNvbS9jc3MyP2ZhbWlseT1SYWpkaGFuaTp3Z2h0QDQwMDs3MDAmZGlzcGxheT1zd2FwJyk7XFxuXFxuKiB7XFxuICAgIG1hcmdpbjogMDtcXG4gICAgcGFkZGluZzogMDtcXG59XFxuXFxuaHRtbDo6LXdlYmtpdC1zY3JvbGxiYXIge1xcbiAgICBkaXNwbGF5OiBub25lO1xcbn1cXG4gIFxcbi8qIEhpZGUgc2Nyb2xsYmFyIGZvciBJRSwgRWRnZSBhbmQgRmlyZWZveCAqL1xcbmh0bWwge1xcbiAgICAtbXMtb3ZlcmZsb3ctc3R5bGU6IG5vbmU7ICAvKiBJRSBhbmQgRWRnZSAqL1xcbiAgICBzY3JvbGxiYXItd2lkdGg6IG5vbmU7ICAvKiBGaXJlZm94ICovXFxufVxcblxcbmJvZHkge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbn1cXG5cXG5oMSB7XFxuICAgIG1hcmdpbjogNTBweDtcXG4gICAgZm9udC1zaXplOiA1MHB4O1xcbiAgICBmb250LWZhbWlseTogJ1JhamRoYW5pJywgc2Fucy1zZXJpZjtcXG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcXG59XFxuXFxuI2NvbnRhaW5lciB7XFxuICAgIHdpZHRoOiA3NTBweDtcXG4gICAgcGFkZGluZy10b3A6IDUwcHg7XFxuICAgIC8qIHBhZGRpbmctYm90dG9tOiA1MHB4OyAqLyAvKnByb3ZpZGVkIHBhZGRpbmcgYWZ0ZXIgPHA+Ki9cXG4gICAgYm94LXNoYWRvdzogMHB4IDBweCAxMHB4IHJnYigyMDAsIDIwMCwgMjAwKTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG59XFxuXFxucCB7XFxuICAgIGZvbnQtZmFtaWx5OiAnUmFqZGhhbmknLCBzYW5zLXNlcmlmO1xcbiAgICBsZXR0ZXItc3BhY2luZzogMC4wNzVlbTtcXG59XFxuXFxuI2NvbnRhaW5lciA+IHAge1xcbiAgICBwYWRkaW5nLXRvcDogMjBweDtcXG4gICAgcGFkZGluZy1ib3R0b206IDU1cHg7XFxuICAgIG1hcmdpbi1yaWdodDogMTI1cHg7XFxuICAgIGFsaWduLXNlbGY6IGZsZXgtZW5kO1xcbn1cXG5cXG5hIHtcXG4gICAgZm9udC1mYW1pbHk6ICdSYWpkaGFuaScsIHNhbnMtc2VyaWY7IFxcbiAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICAgIGNvbG9yOiByZ2IoMTkyLCAwLCAwKTtcXG59XFxuXFxuI2Zvb3RlciB7XFxuICAgIG1hcmdpbi10b3A6IDc1cHg7XFxuICAgIHBhZGRpbmc6IDI1cHg7XFxuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcXG59XFxuXFxuQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA3NTFweCkge1xcbiAgICBoMSB7XFxuICAgICAgICBtYXJnaW46IDQwcHg7XFxuICAgICAgICBmb250LXNpemU6IDQwcHg7XFxuICAgIH1cXG5cXG4gICAgI2NvbnRhaW5lciB7XFxuICAgICAgICB3aWR0aDogNDAwcHg7XFxuICAgICAgICBwYWRkaW5nLXRvcDogMzBweDtcXG4gICAgICAgIGJveC1zaGFkb3c6IG5vbmU7XFxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIH1cXG5cXG4gICAgI2NvbnRhaW5lciA+IHAge1xcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAwcHg7XFxuICAgICAgICBhbGlnbi1zZWxmOiBmbGV4LWVuZDtcXG4gICAgfVxcbn1cXG5cIl0sXCJzb3VyY2VSb290XCI6XCJcIn1dKTtcbi8vIEV4cG9ydHNcbmV4cG9ydCBkZWZhdWx0IF9fX0NTU19MT0FERVJfRVhQT1JUX19fO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4gIE1JVCBMaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gIEF1dGhvciBUb2JpYXMgS29wcGVycyBAc29rcmFcbiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKSB7XG4gIHZhciBsaXN0ID0gW107IC8vIHJldHVybiB0aGUgbGlzdCBvZiBtb2R1bGVzIGFzIGNzcyBzdHJpbmdcblxuICBsaXN0LnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICB2YXIgY29udGVudCA9IFwiXCI7XG4gICAgICB2YXIgbmVlZExheWVyID0gdHlwZW9mIGl0ZW1bNV0gIT09IFwidW5kZWZpbmVkXCI7XG5cbiAgICAgIGlmIChpdGVtWzRdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGl0ZW1bMl0pIHtcbiAgICAgICAgY29udGVudCArPSBcIkBtZWRpYSBcIi5jb25jYXQoaXRlbVsyXSwgXCIge1wiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG5lZWRMYXllcikge1xuICAgICAgICBjb250ZW50ICs9IFwiQGxheWVyXCIuY29uY2F0KGl0ZW1bNV0ubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChpdGVtWzVdKSA6IFwiXCIsIFwiIHtcIik7XG4gICAgICB9XG5cbiAgICAgIGNvbnRlbnQgKz0gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtKTtcblxuICAgICAgaWYgKG5lZWRMYXllcikge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXRlbVs0XSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY29udGVudDtcbiAgICB9KS5qb2luKFwiXCIpO1xuICB9OyAvLyBpbXBvcnQgYSBsaXN0IG9mIG1vZHVsZXMgaW50byB0aGUgbGlzdFxuXG5cbiAgbGlzdC5pID0gZnVuY3Rpb24gaShtb2R1bGVzLCBtZWRpYSwgZGVkdXBlLCBzdXBwb3J0cywgbGF5ZXIpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZXMgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIG1vZHVsZXMgPSBbW251bGwsIG1vZHVsZXMsIHVuZGVmaW5lZF1dO1xuICAgIH1cblxuICAgIHZhciBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzID0ge307XG5cbiAgICBpZiAoZGVkdXBlKSB7XG4gICAgICBmb3IgKHZhciBrID0gMDsgayA8IHRoaXMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgdmFyIGlkID0gdGhpc1trXVswXTtcblxuICAgICAgICBpZiAoaWQgIT0gbnVsbCkge1xuICAgICAgICAgIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaWRdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIF9rID0gMDsgX2sgPCBtb2R1bGVzLmxlbmd0aDsgX2srKykge1xuICAgICAgdmFyIGl0ZW0gPSBbXS5jb25jYXQobW9kdWxlc1tfa10pO1xuXG4gICAgICBpZiAoZGVkdXBlICYmIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaXRlbVswXV0pIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgbGF5ZXIgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpdGVtWzVdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgaXRlbVs1XSA9IGxheWVyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBsYXllclwiLmNvbmNhdChpdGVtWzVdLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQoaXRlbVs1XSkgOiBcIlwiLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVs1XSA9IGxheWVyO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChtZWRpYSkge1xuICAgICAgICBpZiAoIWl0ZW1bMl0pIHtcbiAgICAgICAgICBpdGVtWzJdID0gbWVkaWE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChzdXBwb3J0cykge1xuICAgICAgICBpZiAoIWl0ZW1bNF0pIHtcbiAgICAgICAgICBpdGVtWzRdID0gXCJcIi5jb25jYXQoc3VwcG9ydHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KGl0ZW1bNF0sIFwiKSB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVs0XSA9IHN1cHBvcnRzO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGxpc3QucHVzaChpdGVtKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIGxpc3Q7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdGVtKSB7XG4gIHZhciBjb250ZW50ID0gaXRlbVsxXTtcbiAgdmFyIGNzc01hcHBpbmcgPSBpdGVtWzNdO1xuXG4gIGlmICghY3NzTWFwcGluZykge1xuICAgIHJldHVybiBjb250ZW50O1xuICB9XG5cbiAgaWYgKHR5cGVvZiBidG9hID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICB2YXIgYmFzZTY0ID0gYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoY3NzTWFwcGluZykpKSk7XG4gICAgdmFyIGRhdGEgPSBcInNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LFwiLmNvbmNhdChiYXNlNjQpO1xuICAgIHZhciBzb3VyY2VNYXBwaW5nID0gXCIvKiMgXCIuY29uY2F0KGRhdGEsIFwiICovXCIpO1xuICAgIHZhciBzb3VyY2VVUkxzID0gY3NzTWFwcGluZy5zb3VyY2VzLm1hcChmdW5jdGlvbiAoc291cmNlKSB7XG4gICAgICByZXR1cm4gXCIvKiMgc291cmNlVVJMPVwiLmNvbmNhdChjc3NNYXBwaW5nLnNvdXJjZVJvb3QgfHwgXCJcIikuY29uY2F0KHNvdXJjZSwgXCIgKi9cIik7XG4gICAgfSk7XG4gICAgcmV0dXJuIFtjb250ZW50XS5jb25jYXQoc291cmNlVVJMcykuY29uY2F0KFtzb3VyY2VNYXBwaW5nXSkuam9pbihcIlxcblwiKTtcbiAgfVxuXG4gIHJldHVybiBbY29udGVudF0uam9pbihcIlxcblwiKTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50c1tpXSAhPT0gdW5kZWZpbmVkKSByZXR1cm4gYXJndW1lbnRzW2ldO1xuICAgIH1cbn07XG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgd2lkdGggPSAyNTY7Ly8gZWFjaCBSQzQgb3V0cHV0IGlzIDAgPD0geCA8IDI1NlxyXG52YXIgY2h1bmtzID0gNjsvLyBhdCBsZWFzdCBzaXggUkM0IG91dHB1dHMgZm9yIGVhY2ggZG91YmxlXHJcbnZhciBkaWdpdHMgPSA1MjsvLyB0aGVyZSBhcmUgNTIgc2lnbmlmaWNhbnQgZGlnaXRzIGluIGEgZG91YmxlXHJcbnZhciBwb29sID0gW107Ly8gcG9vbDogZW50cm9weSBwb29sIHN0YXJ0cyBlbXB0eVxyXG52YXIgR0xPQkFMID0gdHlwZW9mIGdsb2JhbCA9PT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiBnbG9iYWw7XHJcblxyXG4vL1xyXG4vLyBUaGUgZm9sbG93aW5nIGNvbnN0YW50cyBhcmUgcmVsYXRlZCB0byBJRUVFIDc1NCBsaW1pdHMuXHJcbi8vXHJcbnZhciBzdGFydGRlbm9tID0gTWF0aC5wb3cod2lkdGgsIGNodW5rcyksXHJcbiAgICBzaWduaWZpY2FuY2UgPSBNYXRoLnBvdygyLCBkaWdpdHMpLFxyXG4gICAgb3ZlcmZsb3cgPSBzaWduaWZpY2FuY2UgKiAyLFxyXG4gICAgbWFzayA9IHdpZHRoIC0gMTtcclxuXHJcblxyXG52YXIgb2xkUmFuZG9tID0gTWF0aC5yYW5kb207XHJcblxyXG4vL1xyXG4vLyBzZWVkcmFuZG9tKClcclxuLy8gVGhpcyBpcyB0aGUgc2VlZHJhbmRvbSBmdW5jdGlvbiBkZXNjcmliZWQgYWJvdmUuXHJcbi8vXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2VlZCwgb3B0aW9ucykge1xyXG4gIGlmIChvcHRpb25zICYmIG9wdGlvbnMuZ2xvYmFsID09PSB0cnVlKSB7XHJcbiAgICBvcHRpb25zLmdsb2JhbCA9IGZhbHNlO1xyXG4gICAgTWF0aC5yYW5kb20gPSBtb2R1bGUuZXhwb3J0cyhzZWVkLCBvcHRpb25zKTtcclxuICAgIG9wdGlvbnMuZ2xvYmFsID0gdHJ1ZTtcclxuICAgIHJldHVybiBNYXRoLnJhbmRvbTtcclxuICB9XHJcbiAgdmFyIHVzZV9lbnRyb3B5ID0gKG9wdGlvbnMgJiYgb3B0aW9ucy5lbnRyb3B5KSB8fCBmYWxzZTtcclxuICB2YXIga2V5ID0gW107XHJcblxyXG4gIC8vIEZsYXR0ZW4gdGhlIHNlZWQgc3RyaW5nIG9yIGJ1aWxkIG9uZSBmcm9tIGxvY2FsIGVudHJvcHkgaWYgbmVlZGVkLlxyXG4gIHZhciBzaG9ydHNlZWQgPSBtaXhrZXkoZmxhdHRlbihcclxuICAgIHVzZV9lbnRyb3B5ID8gW3NlZWQsIHRvc3RyaW5nKHBvb2wpXSA6XHJcbiAgICAwIGluIGFyZ3VtZW50cyA/IHNlZWQgOiBhdXRvc2VlZCgpLCAzKSwga2V5KTtcclxuXHJcbiAgLy8gVXNlIHRoZSBzZWVkIHRvIGluaXRpYWxpemUgYW4gQVJDNCBnZW5lcmF0b3IuXHJcbiAgdmFyIGFyYzQgPSBuZXcgQVJDNChrZXkpO1xyXG5cclxuICAvLyBNaXggdGhlIHJhbmRvbW5lc3MgaW50byBhY2N1bXVsYXRlZCBlbnRyb3B5LlxyXG4gIG1peGtleSh0b3N0cmluZyhhcmM0LlMpLCBwb29sKTtcclxuXHJcbiAgLy8gT3ZlcnJpZGUgTWF0aC5yYW5kb21cclxuXHJcbiAgLy8gVGhpcyBmdW5jdGlvbiByZXR1cm5zIGEgcmFuZG9tIGRvdWJsZSBpbiBbMCwgMSkgdGhhdCBjb250YWluc1xyXG4gIC8vIHJhbmRvbW5lc3MgaW4gZXZlcnkgYml0IG9mIHRoZSBtYW50aXNzYSBvZiB0aGUgSUVFRSA3NTQgdmFsdWUuXHJcblxyXG4gIHJldHVybiBmdW5jdGlvbigpIHsgICAgICAgICAvLyBDbG9zdXJlIHRvIHJldHVybiBhIHJhbmRvbSBkb3VibGU6XHJcbiAgICB2YXIgbiA9IGFyYzQuZyhjaHVua3MpLCAgICAgICAgICAgICAvLyBTdGFydCB3aXRoIGEgbnVtZXJhdG9yIG4gPCAyIF4gNDhcclxuICAgICAgICBkID0gc3RhcnRkZW5vbSwgICAgICAgICAgICAgICAgIC8vICAgYW5kIGRlbm9taW5hdG9yIGQgPSAyIF4gNDguXHJcbiAgICAgICAgeCA9IDA7ICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGFuZCBubyAnZXh0cmEgbGFzdCBieXRlJy5cclxuICAgIHdoaWxlIChuIDwgc2lnbmlmaWNhbmNlKSB7ICAgICAgICAgIC8vIEZpbGwgdXAgYWxsIHNpZ25pZmljYW50IGRpZ2l0cyBieVxyXG4gICAgICBuID0gKG4gKyB4KSAqIHdpZHRoOyAgICAgICAgICAgICAgLy8gICBzaGlmdGluZyBudW1lcmF0b3IgYW5kXHJcbiAgICAgIGQgKj0gd2lkdGg7ICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGRlbm9taW5hdG9yIGFuZCBnZW5lcmF0aW5nIGFcclxuICAgICAgeCA9IGFyYzQuZygxKTsgICAgICAgICAgICAgICAgICAgIC8vICAgbmV3IGxlYXN0LXNpZ25pZmljYW50LWJ5dGUuXHJcbiAgICB9XHJcbiAgICB3aGlsZSAobiA+PSBvdmVyZmxvdykgeyAgICAgICAgICAgICAvLyBUbyBhdm9pZCByb3VuZGluZyB1cCwgYmVmb3JlIGFkZGluZ1xyXG4gICAgICBuIC89IDI7ICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICBsYXN0IGJ5dGUsIHNoaWZ0IGV2ZXJ5dGhpbmdcclxuICAgICAgZCAvPSAyOyAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgcmlnaHQgdXNpbmcgaW50ZWdlciBNYXRoIHVudGlsXHJcbiAgICAgIHggPj4+PSAxOyAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIHdlIGhhdmUgZXhhY3RseSB0aGUgZGVzaXJlZCBiaXRzLlxyXG4gICAgfVxyXG4gICAgcmV0dXJuIChuICsgeCkgLyBkOyAgICAgICAgICAgICAgICAgLy8gRm9ybSB0aGUgbnVtYmVyIHdpdGhpbiBbMCwgMSkuXHJcbiAgfTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzLnJlc2V0R2xvYmFsID0gZnVuY3Rpb24gKCkge1xyXG4gIE1hdGgucmFuZG9tID0gb2xkUmFuZG9tO1xyXG59O1xyXG5cclxuLy9cclxuLy8gQVJDNFxyXG4vL1xyXG4vLyBBbiBBUkM0IGltcGxlbWVudGF0aW9uLiAgVGhlIGNvbnN0cnVjdG9yIHRha2VzIGEga2V5IGluIHRoZSBmb3JtIG9mXHJcbi8vIGFuIGFycmF5IG9mIGF0IG1vc3QgKHdpZHRoKSBpbnRlZ2VycyB0aGF0IHNob3VsZCBiZSAwIDw9IHggPCAod2lkdGgpLlxyXG4vL1xyXG4vLyBUaGUgZyhjb3VudCkgbWV0aG9kIHJldHVybnMgYSBwc2V1ZG9yYW5kb20gaW50ZWdlciB0aGF0IGNvbmNhdGVuYXRlc1xyXG4vLyB0aGUgbmV4dCAoY291bnQpIG91dHB1dHMgZnJvbSBBUkM0LiAgSXRzIHJldHVybiB2YWx1ZSBpcyBhIG51bWJlciB4XHJcbi8vIHRoYXQgaXMgaW4gdGhlIHJhbmdlIDAgPD0geCA8ICh3aWR0aCBeIGNvdW50KS5cclxuLy9cclxuLyoqIEBjb25zdHJ1Y3RvciAqL1xyXG5mdW5jdGlvbiBBUkM0KGtleSkge1xyXG4gIHZhciB0LCBrZXlsZW4gPSBrZXkubGVuZ3RoLFxyXG4gICAgICBtZSA9IHRoaXMsIGkgPSAwLCBqID0gbWUuaSA9IG1lLmogPSAwLCBzID0gbWUuUyA9IFtdO1xyXG5cclxuICAvLyBUaGUgZW1wdHkga2V5IFtdIGlzIHRyZWF0ZWQgYXMgWzBdLlxyXG4gIGlmICgha2V5bGVuKSB7IGtleSA9IFtrZXlsZW4rK107IH1cclxuXHJcbiAgLy8gU2V0IHVwIFMgdXNpbmcgdGhlIHN0YW5kYXJkIGtleSBzY2hlZHVsaW5nIGFsZ29yaXRobS5cclxuICB3aGlsZSAoaSA8IHdpZHRoKSB7XHJcbiAgICBzW2ldID0gaSsrO1xyXG4gIH1cclxuICBmb3IgKGkgPSAwOyBpIDwgd2lkdGg7IGkrKykge1xyXG4gICAgc1tpXSA9IHNbaiA9IG1hc2sgJiAoaiArIGtleVtpICUga2V5bGVuXSArICh0ID0gc1tpXSkpXTtcclxuICAgIHNbal0gPSB0O1xyXG4gIH1cclxuXHJcbiAgLy8gVGhlIFwiZ1wiIG1ldGhvZCByZXR1cm5zIHRoZSBuZXh0IChjb3VudCkgb3V0cHV0cyBhcyBvbmUgbnVtYmVyLlxyXG4gIChtZS5nID0gZnVuY3Rpb24oY291bnQpIHtcclxuICAgIC8vIFVzaW5nIGluc3RhbmNlIG1lbWJlcnMgaW5zdGVhZCBvZiBjbG9zdXJlIHN0YXRlIG5lYXJseSBkb3VibGVzIHNwZWVkLlxyXG4gICAgdmFyIHQsIHIgPSAwLFxyXG4gICAgICAgIGkgPSBtZS5pLCBqID0gbWUuaiwgcyA9IG1lLlM7XHJcbiAgICB3aGlsZSAoY291bnQtLSkge1xyXG4gICAgICB0ID0gc1tpID0gbWFzayAmIChpICsgMSldO1xyXG4gICAgICByID0gciAqIHdpZHRoICsgc1ttYXNrICYgKChzW2ldID0gc1tqID0gbWFzayAmIChqICsgdCldKSArIChzW2pdID0gdCkpXTtcclxuICAgIH1cclxuICAgIG1lLmkgPSBpOyBtZS5qID0gajtcclxuICAgIHJldHVybiByO1xyXG4gICAgLy8gRm9yIHJvYnVzdCB1bnByZWRpY3RhYmlsaXR5IGRpc2NhcmQgYW4gaW5pdGlhbCBiYXRjaCBvZiB2YWx1ZXMuXHJcbiAgICAvLyBTZWUgaHR0cDovL3d3dy5yc2EuY29tL3JzYWxhYnMvbm9kZS5hc3A/aWQ9MjAwOVxyXG4gIH0pKHdpZHRoKTtcclxufVxyXG5cclxuLy9cclxuLy8gZmxhdHRlbigpXHJcbi8vIENvbnZlcnRzIGFuIG9iamVjdCB0cmVlIHRvIG5lc3RlZCBhcnJheXMgb2Ygc3RyaW5ncy5cclxuLy9cclxuZnVuY3Rpb24gZmxhdHRlbihvYmosIGRlcHRoKSB7XHJcbiAgdmFyIHJlc3VsdCA9IFtdLCB0eXAgPSAodHlwZW9mIG9iailbMF0sIHByb3A7XHJcbiAgaWYgKGRlcHRoICYmIHR5cCA9PSAnbycpIHtcclxuICAgIGZvciAocHJvcCBpbiBvYmopIHtcclxuICAgICAgdHJ5IHsgcmVzdWx0LnB1c2goZmxhdHRlbihvYmpbcHJvcF0sIGRlcHRoIC0gMSkpOyB9IGNhdGNoIChlKSB7fVxyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gKHJlc3VsdC5sZW5ndGggPyByZXN1bHQgOiB0eXAgPT0gJ3MnID8gb2JqIDogb2JqICsgJ1xcMCcpO1xyXG59XHJcblxyXG4vL1xyXG4vLyBtaXhrZXkoKVxyXG4vLyBNaXhlcyBhIHN0cmluZyBzZWVkIGludG8gYSBrZXkgdGhhdCBpcyBhbiBhcnJheSBvZiBpbnRlZ2VycywgYW5kXHJcbi8vIHJldHVybnMgYSBzaG9ydGVuZWQgc3RyaW5nIHNlZWQgdGhhdCBpcyBlcXVpdmFsZW50IHRvIHRoZSByZXN1bHQga2V5LlxyXG4vL1xyXG5mdW5jdGlvbiBtaXhrZXkoc2VlZCwga2V5KSB7XHJcbiAgdmFyIHN0cmluZ3NlZWQgPSBzZWVkICsgJycsIHNtZWFyLCBqID0gMDtcclxuICB3aGlsZSAoaiA8IHN0cmluZ3NlZWQubGVuZ3RoKSB7XHJcbiAgICBrZXlbbWFzayAmIGpdID1cclxuICAgICAgbWFzayAmICgoc21lYXIgXj0ga2V5W21hc2sgJiBqXSAqIDE5KSArIHN0cmluZ3NlZWQuY2hhckNvZGVBdChqKyspKTtcclxuICB9XHJcbiAgcmV0dXJuIHRvc3RyaW5nKGtleSk7XHJcbn1cclxuXHJcbi8vXHJcbi8vIGF1dG9zZWVkKClcclxuLy8gUmV0dXJucyBhbiBvYmplY3QgZm9yIGF1dG9zZWVkaW5nLCB1c2luZyB3aW5kb3cuY3J5cHRvIGlmIGF2YWlsYWJsZS5cclxuLy9cclxuLyoqIEBwYXJhbSB7VWludDhBcnJheT19IHNlZWQgKi9cclxuZnVuY3Rpb24gYXV0b3NlZWQoc2VlZCkge1xyXG4gIHRyeSB7XHJcbiAgICBHTE9CQUwuY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhzZWVkID0gbmV3IFVpbnQ4QXJyYXkod2lkdGgpKTtcclxuICAgIHJldHVybiB0b3N0cmluZyhzZWVkKTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICByZXR1cm4gWytuZXcgRGF0ZSwgR0xPQkFMLCBHTE9CQUwubmF2aWdhdG9yICYmIEdMT0JBTC5uYXZpZ2F0b3IucGx1Z2lucyxcclxuICAgICAgICAgICAgR0xPQkFMLnNjcmVlbiwgdG9zdHJpbmcocG9vbCldO1xyXG4gIH1cclxufVxyXG5cclxuLy9cclxuLy8gdG9zdHJpbmcoKVxyXG4vLyBDb252ZXJ0cyBhbiBhcnJheSBvZiBjaGFyY29kZXMgdG8gYSBzdHJpbmdcclxuLy9cclxuZnVuY3Rpb24gdG9zdHJpbmcoYSkge1xyXG4gIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KDAsIGEpO1xyXG59XHJcblxyXG4vL1xyXG4vLyBXaGVuIHNlZWRyYW5kb20uanMgaXMgbG9hZGVkLCB3ZSBpbW1lZGlhdGVseSBtaXggYSBmZXcgYml0c1xyXG4vLyBmcm9tIHRoZSBidWlsdC1pbiBSTkcgaW50byB0aGUgZW50cm9weSBwb29sLiAgQmVjYXVzZSB3ZSBkb1xyXG4vLyBub3Qgd2FudCB0byBpbnRlZmVyZSB3aXRoIGRldGVybWluc3RpYyBQUk5HIHN0YXRlIGxhdGVyLFxyXG4vLyBzZWVkcmFuZG9tIHdpbGwgbm90IGNhbGwgTWF0aC5yYW5kb20gb24gaXRzIG93biBhZ2FpbiBhZnRlclxyXG4vLyBpbml0aWFsaXphdGlvbi5cclxuLy9cclxubWl4a2V5KE1hdGgucmFuZG9tKCksIHBvb2wpO1xyXG4iLCIvKlxuICogQSBmYXN0IGphdmFzY3JpcHQgaW1wbGVtZW50YXRpb24gb2Ygc2ltcGxleCBub2lzZSBieSBKb25hcyBXYWduZXJcblxuQmFzZWQgb24gYSBzcGVlZC1pbXByb3ZlZCBzaW1wbGV4IG5vaXNlIGFsZ29yaXRobSBmb3IgMkQsIDNEIGFuZCA0RCBpbiBKYXZhLlxuV2hpY2ggaXMgYmFzZWQgb24gZXhhbXBsZSBjb2RlIGJ5IFN0ZWZhbiBHdXN0YXZzb24gKHN0ZWd1QGl0bi5saXUuc2UpLlxuV2l0aCBPcHRpbWlzYXRpb25zIGJ5IFBldGVyIEVhc3RtYW4gKHBlYXN0bWFuQGRyaXp6bGUuc3RhbmZvcmQuZWR1KS5cbkJldHRlciByYW5rIG9yZGVyaW5nIG1ldGhvZCBieSBTdGVmYW4gR3VzdGF2c29uIGluIDIwMTIuXG5cblxuIENvcHlyaWdodCAoYykgMjAxOCBKb25hcyBXYWduZXJcblxuIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG4gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG4gY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuIFNPRlRXQVJFLlxuICovXG4oZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICB2YXIgRjIgPSAwLjUgKiAoTWF0aC5zcXJ0KDMuMCkgLSAxLjApO1xuICB2YXIgRzIgPSAoMy4wIC0gTWF0aC5zcXJ0KDMuMCkpIC8gNi4wO1xuICB2YXIgRjMgPSAxLjAgLyAzLjA7XG4gIHZhciBHMyA9IDEuMCAvIDYuMDtcbiAgdmFyIEY0ID0gKE1hdGguc3FydCg1LjApIC0gMS4wKSAvIDQuMDtcbiAgdmFyIEc0ID0gKDUuMCAtIE1hdGguc3FydCg1LjApKSAvIDIwLjA7XG5cbiAgZnVuY3Rpb24gU2ltcGxleE5vaXNlKHJhbmRvbU9yU2VlZCkge1xuICAgIHZhciByYW5kb207XG4gICAgaWYgKHR5cGVvZiByYW5kb21PclNlZWQgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmFuZG9tID0gcmFuZG9tT3JTZWVkO1xuICAgIH1cbiAgICBlbHNlIGlmIChyYW5kb21PclNlZWQpIHtcbiAgICAgIHJhbmRvbSA9IGFsZWEocmFuZG9tT3JTZWVkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmFuZG9tID0gTWF0aC5yYW5kb207XG4gICAgfVxuICAgIHRoaXMucCA9IGJ1aWxkUGVybXV0YXRpb25UYWJsZShyYW5kb20pO1xuICAgIHRoaXMucGVybSA9IG5ldyBVaW50OEFycmF5KDUxMik7XG4gICAgdGhpcy5wZXJtTW9kMTIgPSBuZXcgVWludDhBcnJheSg1MTIpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNTEyOyBpKyspIHtcbiAgICAgIHRoaXMucGVybVtpXSA9IHRoaXMucFtpICYgMjU1XTtcbiAgICAgIHRoaXMucGVybU1vZDEyW2ldID0gdGhpcy5wZXJtW2ldICUgMTI7XG4gICAgfVxuXG4gIH1cbiAgU2ltcGxleE5vaXNlLnByb3RvdHlwZSA9IHtcbiAgICBncmFkMzogbmV3IEZsb2F0MzJBcnJheShbMSwgMSwgMCxcbiAgICAgIC0xLCAxLCAwLFxuICAgICAgMSwgLTEsIDAsXG5cbiAgICAgIC0xLCAtMSwgMCxcbiAgICAgIDEsIDAsIDEsXG4gICAgICAtMSwgMCwgMSxcblxuICAgICAgMSwgMCwgLTEsXG4gICAgICAtMSwgMCwgLTEsXG4gICAgICAwLCAxLCAxLFxuXG4gICAgICAwLCAtMSwgMSxcbiAgICAgIDAsIDEsIC0xLFxuICAgICAgMCwgLTEsIC0xXSksXG4gICAgZ3JhZDQ6IG5ldyBGbG9hdDMyQXJyYXkoWzAsIDEsIDEsIDEsIDAsIDEsIDEsIC0xLCAwLCAxLCAtMSwgMSwgMCwgMSwgLTEsIC0xLFxuICAgICAgMCwgLTEsIDEsIDEsIDAsIC0xLCAxLCAtMSwgMCwgLTEsIC0xLCAxLCAwLCAtMSwgLTEsIC0xLFxuICAgICAgMSwgMCwgMSwgMSwgMSwgMCwgMSwgLTEsIDEsIDAsIC0xLCAxLCAxLCAwLCAtMSwgLTEsXG4gICAgICAtMSwgMCwgMSwgMSwgLTEsIDAsIDEsIC0xLCAtMSwgMCwgLTEsIDEsIC0xLCAwLCAtMSwgLTEsXG4gICAgICAxLCAxLCAwLCAxLCAxLCAxLCAwLCAtMSwgMSwgLTEsIDAsIDEsIDEsIC0xLCAwLCAtMSxcbiAgICAgIC0xLCAxLCAwLCAxLCAtMSwgMSwgMCwgLTEsIC0xLCAtMSwgMCwgMSwgLTEsIC0xLCAwLCAtMSxcbiAgICAgIDEsIDEsIDEsIDAsIDEsIDEsIC0xLCAwLCAxLCAtMSwgMSwgMCwgMSwgLTEsIC0xLCAwLFxuICAgICAgLTEsIDEsIDEsIDAsIC0xLCAxLCAtMSwgMCwgLTEsIC0xLCAxLCAwLCAtMSwgLTEsIC0xLCAwXSksXG4gICAgbm9pc2UyRDogZnVuY3Rpb24oeGluLCB5aW4pIHtcbiAgICAgIHZhciBwZXJtTW9kMTIgPSB0aGlzLnBlcm1Nb2QxMjtcbiAgICAgIHZhciBwZXJtID0gdGhpcy5wZXJtO1xuICAgICAgdmFyIGdyYWQzID0gdGhpcy5ncmFkMztcbiAgICAgIHZhciBuMCA9IDA7IC8vIE5vaXNlIGNvbnRyaWJ1dGlvbnMgZnJvbSB0aGUgdGhyZWUgY29ybmVyc1xuICAgICAgdmFyIG4xID0gMDtcbiAgICAgIHZhciBuMiA9IDA7XG4gICAgICAvLyBTa2V3IHRoZSBpbnB1dCBzcGFjZSB0byBkZXRlcm1pbmUgd2hpY2ggc2ltcGxleCBjZWxsIHdlJ3JlIGluXG4gICAgICB2YXIgcyA9ICh4aW4gKyB5aW4pICogRjI7IC8vIEhhaXJ5IGZhY3RvciBmb3IgMkRcbiAgICAgIHZhciBpID0gTWF0aC5mbG9vcih4aW4gKyBzKTtcbiAgICAgIHZhciBqID0gTWF0aC5mbG9vcih5aW4gKyBzKTtcbiAgICAgIHZhciB0ID0gKGkgKyBqKSAqIEcyO1xuICAgICAgdmFyIFgwID0gaSAtIHQ7IC8vIFVuc2tldyB0aGUgY2VsbCBvcmlnaW4gYmFjayB0byAoeCx5KSBzcGFjZVxuICAgICAgdmFyIFkwID0gaiAtIHQ7XG4gICAgICB2YXIgeDAgPSB4aW4gLSBYMDsgLy8gVGhlIHgseSBkaXN0YW5jZXMgZnJvbSB0aGUgY2VsbCBvcmlnaW5cbiAgICAgIHZhciB5MCA9IHlpbiAtIFkwO1xuICAgICAgLy8gRm9yIHRoZSAyRCBjYXNlLCB0aGUgc2ltcGxleCBzaGFwZSBpcyBhbiBlcXVpbGF0ZXJhbCB0cmlhbmdsZS5cbiAgICAgIC8vIERldGVybWluZSB3aGljaCBzaW1wbGV4IHdlIGFyZSBpbi5cbiAgICAgIHZhciBpMSwgajE7IC8vIE9mZnNldHMgZm9yIHNlY29uZCAobWlkZGxlKSBjb3JuZXIgb2Ygc2ltcGxleCBpbiAoaSxqKSBjb29yZHNcbiAgICAgIGlmICh4MCA+IHkwKSB7XG4gICAgICAgIGkxID0gMTtcbiAgICAgICAgajEgPSAwO1xuICAgICAgfSAvLyBsb3dlciB0cmlhbmdsZSwgWFkgb3JkZXI6ICgwLDApLT4oMSwwKS0+KDEsMSlcbiAgICAgIGVsc2Uge1xuICAgICAgICBpMSA9IDA7XG4gICAgICAgIGoxID0gMTtcbiAgICAgIH0gLy8gdXBwZXIgdHJpYW5nbGUsIFlYIG9yZGVyOiAoMCwwKS0+KDAsMSktPigxLDEpXG4gICAgICAvLyBBIHN0ZXAgb2YgKDEsMCkgaW4gKGksaikgbWVhbnMgYSBzdGVwIG9mICgxLWMsLWMpIGluICh4LHkpLCBhbmRcbiAgICAgIC8vIGEgc3RlcCBvZiAoMCwxKSBpbiAoaSxqKSBtZWFucyBhIHN0ZXAgb2YgKC1jLDEtYykgaW4gKHgseSksIHdoZXJlXG4gICAgICAvLyBjID0gKDMtc3FydCgzKSkvNlxuICAgICAgdmFyIHgxID0geDAgLSBpMSArIEcyOyAvLyBPZmZzZXRzIGZvciBtaWRkbGUgY29ybmVyIGluICh4LHkpIHVuc2tld2VkIGNvb3Jkc1xuICAgICAgdmFyIHkxID0geTAgLSBqMSArIEcyO1xuICAgICAgdmFyIHgyID0geDAgLSAxLjAgKyAyLjAgKiBHMjsgLy8gT2Zmc2V0cyBmb3IgbGFzdCBjb3JuZXIgaW4gKHgseSkgdW5za2V3ZWQgY29vcmRzXG4gICAgICB2YXIgeTIgPSB5MCAtIDEuMCArIDIuMCAqIEcyO1xuICAgICAgLy8gV29yayBvdXQgdGhlIGhhc2hlZCBncmFkaWVudCBpbmRpY2VzIG9mIHRoZSB0aHJlZSBzaW1wbGV4IGNvcm5lcnNcbiAgICAgIHZhciBpaSA9IGkgJiAyNTU7XG4gICAgICB2YXIgamogPSBqICYgMjU1O1xuICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBjb250cmlidXRpb24gZnJvbSB0aGUgdGhyZWUgY29ybmVyc1xuICAgICAgdmFyIHQwID0gMC41IC0geDAgKiB4MCAtIHkwICogeTA7XG4gICAgICBpZiAodDAgPj0gMCkge1xuICAgICAgICB2YXIgZ2kwID0gcGVybU1vZDEyW2lpICsgcGVybVtqal1dICogMztcbiAgICAgICAgdDAgKj0gdDA7XG4gICAgICAgIG4wID0gdDAgKiB0MCAqIChncmFkM1tnaTBdICogeDAgKyBncmFkM1tnaTAgKyAxXSAqIHkwKTsgLy8gKHgseSkgb2YgZ3JhZDMgdXNlZCBmb3IgMkQgZ3JhZGllbnRcbiAgICAgIH1cbiAgICAgIHZhciB0MSA9IDAuNSAtIHgxICogeDEgLSB5MSAqIHkxO1xuICAgICAgaWYgKHQxID49IDApIHtcbiAgICAgICAgdmFyIGdpMSA9IHBlcm1Nb2QxMltpaSArIGkxICsgcGVybVtqaiArIGoxXV0gKiAzO1xuICAgICAgICB0MSAqPSB0MTtcbiAgICAgICAgbjEgPSB0MSAqIHQxICogKGdyYWQzW2dpMV0gKiB4MSArIGdyYWQzW2dpMSArIDFdICogeTEpO1xuICAgICAgfVxuICAgICAgdmFyIHQyID0gMC41IC0geDIgKiB4MiAtIHkyICogeTI7XG4gICAgICBpZiAodDIgPj0gMCkge1xuICAgICAgICB2YXIgZ2kyID0gcGVybU1vZDEyW2lpICsgMSArIHBlcm1bamogKyAxXV0gKiAzO1xuICAgICAgICB0MiAqPSB0MjtcbiAgICAgICAgbjIgPSB0MiAqIHQyICogKGdyYWQzW2dpMl0gKiB4MiArIGdyYWQzW2dpMiArIDFdICogeTIpO1xuICAgICAgfVxuICAgICAgLy8gQWRkIGNvbnRyaWJ1dGlvbnMgZnJvbSBlYWNoIGNvcm5lciB0byBnZXQgdGhlIGZpbmFsIG5vaXNlIHZhbHVlLlxuICAgICAgLy8gVGhlIHJlc3VsdCBpcyBzY2FsZWQgdG8gcmV0dXJuIHZhbHVlcyBpbiB0aGUgaW50ZXJ2YWwgWy0xLDFdLlxuICAgICAgcmV0dXJuIDcwLjAgKiAobjAgKyBuMSArIG4yKTtcbiAgICB9LFxuICAgIC8vIDNEIHNpbXBsZXggbm9pc2VcbiAgICBub2lzZTNEOiBmdW5jdGlvbih4aW4sIHlpbiwgemluKSB7XG4gICAgICB2YXIgcGVybU1vZDEyID0gdGhpcy5wZXJtTW9kMTI7XG4gICAgICB2YXIgcGVybSA9IHRoaXMucGVybTtcbiAgICAgIHZhciBncmFkMyA9IHRoaXMuZ3JhZDM7XG4gICAgICB2YXIgbjAsIG4xLCBuMiwgbjM7IC8vIE5vaXNlIGNvbnRyaWJ1dGlvbnMgZnJvbSB0aGUgZm91ciBjb3JuZXJzXG4gICAgICAvLyBTa2V3IHRoZSBpbnB1dCBzcGFjZSB0byBkZXRlcm1pbmUgd2hpY2ggc2ltcGxleCBjZWxsIHdlJ3JlIGluXG4gICAgICB2YXIgcyA9ICh4aW4gKyB5aW4gKyB6aW4pICogRjM7IC8vIFZlcnkgbmljZSBhbmQgc2ltcGxlIHNrZXcgZmFjdG9yIGZvciAzRFxuICAgICAgdmFyIGkgPSBNYXRoLmZsb29yKHhpbiArIHMpO1xuICAgICAgdmFyIGogPSBNYXRoLmZsb29yKHlpbiArIHMpO1xuICAgICAgdmFyIGsgPSBNYXRoLmZsb29yKHppbiArIHMpO1xuICAgICAgdmFyIHQgPSAoaSArIGogKyBrKSAqIEczO1xuICAgICAgdmFyIFgwID0gaSAtIHQ7IC8vIFVuc2tldyB0aGUgY2VsbCBvcmlnaW4gYmFjayB0byAoeCx5LHopIHNwYWNlXG4gICAgICB2YXIgWTAgPSBqIC0gdDtcbiAgICAgIHZhciBaMCA9IGsgLSB0O1xuICAgICAgdmFyIHgwID0geGluIC0gWDA7IC8vIFRoZSB4LHkseiBkaXN0YW5jZXMgZnJvbSB0aGUgY2VsbCBvcmlnaW5cbiAgICAgIHZhciB5MCA9IHlpbiAtIFkwO1xuICAgICAgdmFyIHowID0gemluIC0gWjA7XG4gICAgICAvLyBGb3IgdGhlIDNEIGNhc2UsIHRoZSBzaW1wbGV4IHNoYXBlIGlzIGEgc2xpZ2h0bHkgaXJyZWd1bGFyIHRldHJhaGVkcm9uLlxuICAgICAgLy8gRGV0ZXJtaW5lIHdoaWNoIHNpbXBsZXggd2UgYXJlIGluLlxuICAgICAgdmFyIGkxLCBqMSwgazE7IC8vIE9mZnNldHMgZm9yIHNlY29uZCBjb3JuZXIgb2Ygc2ltcGxleCBpbiAoaSxqLGspIGNvb3Jkc1xuICAgICAgdmFyIGkyLCBqMiwgazI7IC8vIE9mZnNldHMgZm9yIHRoaXJkIGNvcm5lciBvZiBzaW1wbGV4IGluIChpLGosaykgY29vcmRzXG4gICAgICBpZiAoeDAgPj0geTApIHtcbiAgICAgICAgaWYgKHkwID49IHowKSB7XG4gICAgICAgICAgaTEgPSAxO1xuICAgICAgICAgIGoxID0gMDtcbiAgICAgICAgICBrMSA9IDA7XG4gICAgICAgICAgaTIgPSAxO1xuICAgICAgICAgIGoyID0gMTtcbiAgICAgICAgICBrMiA9IDA7XG4gICAgICAgIH0gLy8gWCBZIFogb3JkZXJcbiAgICAgICAgZWxzZSBpZiAoeDAgPj0gejApIHtcbiAgICAgICAgICBpMSA9IDE7XG4gICAgICAgICAgajEgPSAwO1xuICAgICAgICAgIGsxID0gMDtcbiAgICAgICAgICBpMiA9IDE7XG4gICAgICAgICAgajIgPSAwO1xuICAgICAgICAgIGsyID0gMTtcbiAgICAgICAgfSAvLyBYIFogWSBvcmRlclxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBpMSA9IDA7XG4gICAgICAgICAgajEgPSAwO1xuICAgICAgICAgIGsxID0gMTtcbiAgICAgICAgICBpMiA9IDE7XG4gICAgICAgICAgajIgPSAwO1xuICAgICAgICAgIGsyID0gMTtcbiAgICAgICAgfSAvLyBaIFggWSBvcmRlclxuICAgICAgfVxuICAgICAgZWxzZSB7IC8vIHgwPHkwXG4gICAgICAgIGlmICh5MCA8IHowKSB7XG4gICAgICAgICAgaTEgPSAwO1xuICAgICAgICAgIGoxID0gMDtcbiAgICAgICAgICBrMSA9IDE7XG4gICAgICAgICAgaTIgPSAwO1xuICAgICAgICAgIGoyID0gMTtcbiAgICAgICAgICBrMiA9IDE7XG4gICAgICAgIH0gLy8gWiBZIFggb3JkZXJcbiAgICAgICAgZWxzZSBpZiAoeDAgPCB6MCkge1xuICAgICAgICAgIGkxID0gMDtcbiAgICAgICAgICBqMSA9IDE7XG4gICAgICAgICAgazEgPSAwO1xuICAgICAgICAgIGkyID0gMDtcbiAgICAgICAgICBqMiA9IDE7XG4gICAgICAgICAgazIgPSAxO1xuICAgICAgICB9IC8vIFkgWiBYIG9yZGVyXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGkxID0gMDtcbiAgICAgICAgICBqMSA9IDE7XG4gICAgICAgICAgazEgPSAwO1xuICAgICAgICAgIGkyID0gMTtcbiAgICAgICAgICBqMiA9IDE7XG4gICAgICAgICAgazIgPSAwO1xuICAgICAgICB9IC8vIFkgWCBaIG9yZGVyXG4gICAgICB9XG4gICAgICAvLyBBIHN0ZXAgb2YgKDEsMCwwKSBpbiAoaSxqLGspIG1lYW5zIGEgc3RlcCBvZiAoMS1jLC1jLC1jKSBpbiAoeCx5LHopLFxuICAgICAgLy8gYSBzdGVwIG9mICgwLDEsMCkgaW4gKGksaixrKSBtZWFucyBhIHN0ZXAgb2YgKC1jLDEtYywtYykgaW4gKHgseSx6KSwgYW5kXG4gICAgICAvLyBhIHN0ZXAgb2YgKDAsMCwxKSBpbiAoaSxqLGspIG1lYW5zIGEgc3RlcCBvZiAoLWMsLWMsMS1jKSBpbiAoeCx5LHopLCB3aGVyZVxuICAgICAgLy8gYyA9IDEvNi5cbiAgICAgIHZhciB4MSA9IHgwIC0gaTEgKyBHMzsgLy8gT2Zmc2V0cyBmb3Igc2Vjb25kIGNvcm5lciBpbiAoeCx5LHopIGNvb3Jkc1xuICAgICAgdmFyIHkxID0geTAgLSBqMSArIEczO1xuICAgICAgdmFyIHoxID0gejAgLSBrMSArIEczO1xuICAgICAgdmFyIHgyID0geDAgLSBpMiArIDIuMCAqIEczOyAvLyBPZmZzZXRzIGZvciB0aGlyZCBjb3JuZXIgaW4gKHgseSx6KSBjb29yZHNcbiAgICAgIHZhciB5MiA9IHkwIC0gajIgKyAyLjAgKiBHMztcbiAgICAgIHZhciB6MiA9IHowIC0gazIgKyAyLjAgKiBHMztcbiAgICAgIHZhciB4MyA9IHgwIC0gMS4wICsgMy4wICogRzM7IC8vIE9mZnNldHMgZm9yIGxhc3QgY29ybmVyIGluICh4LHkseikgY29vcmRzXG4gICAgICB2YXIgeTMgPSB5MCAtIDEuMCArIDMuMCAqIEczO1xuICAgICAgdmFyIHozID0gejAgLSAxLjAgKyAzLjAgKiBHMztcbiAgICAgIC8vIFdvcmsgb3V0IHRoZSBoYXNoZWQgZ3JhZGllbnQgaW5kaWNlcyBvZiB0aGUgZm91ciBzaW1wbGV4IGNvcm5lcnNcbiAgICAgIHZhciBpaSA9IGkgJiAyNTU7XG4gICAgICB2YXIgamogPSBqICYgMjU1O1xuICAgICAgdmFyIGtrID0gayAmIDI1NTtcbiAgICAgIC8vIENhbGN1bGF0ZSB0aGUgY29udHJpYnV0aW9uIGZyb20gdGhlIGZvdXIgY29ybmVyc1xuICAgICAgdmFyIHQwID0gMC42IC0geDAgKiB4MCAtIHkwICogeTAgLSB6MCAqIHowO1xuICAgICAgaWYgKHQwIDwgMCkgbjAgPSAwLjA7XG4gICAgICBlbHNlIHtcbiAgICAgICAgdmFyIGdpMCA9IHBlcm1Nb2QxMltpaSArIHBlcm1bamogKyBwZXJtW2trXV1dICogMztcbiAgICAgICAgdDAgKj0gdDA7XG4gICAgICAgIG4wID0gdDAgKiB0MCAqIChncmFkM1tnaTBdICogeDAgKyBncmFkM1tnaTAgKyAxXSAqIHkwICsgZ3JhZDNbZ2kwICsgMl0gKiB6MCk7XG4gICAgICB9XG4gICAgICB2YXIgdDEgPSAwLjYgLSB4MSAqIHgxIC0geTEgKiB5MSAtIHoxICogejE7XG4gICAgICBpZiAodDEgPCAwKSBuMSA9IDAuMDtcbiAgICAgIGVsc2Uge1xuICAgICAgICB2YXIgZ2kxID0gcGVybU1vZDEyW2lpICsgaTEgKyBwZXJtW2pqICsgajEgKyBwZXJtW2trICsgazFdXV0gKiAzO1xuICAgICAgICB0MSAqPSB0MTtcbiAgICAgICAgbjEgPSB0MSAqIHQxICogKGdyYWQzW2dpMV0gKiB4MSArIGdyYWQzW2dpMSArIDFdICogeTEgKyBncmFkM1tnaTEgKyAyXSAqIHoxKTtcbiAgICAgIH1cbiAgICAgIHZhciB0MiA9IDAuNiAtIHgyICogeDIgLSB5MiAqIHkyIC0gejIgKiB6MjtcbiAgICAgIGlmICh0MiA8IDApIG4yID0gMC4wO1xuICAgICAgZWxzZSB7XG4gICAgICAgIHZhciBnaTIgPSBwZXJtTW9kMTJbaWkgKyBpMiArIHBlcm1bamogKyBqMiArIHBlcm1ba2sgKyBrMl1dXSAqIDM7XG4gICAgICAgIHQyICo9IHQyO1xuICAgICAgICBuMiA9IHQyICogdDIgKiAoZ3JhZDNbZ2kyXSAqIHgyICsgZ3JhZDNbZ2kyICsgMV0gKiB5MiArIGdyYWQzW2dpMiArIDJdICogejIpO1xuICAgICAgfVxuICAgICAgdmFyIHQzID0gMC42IC0geDMgKiB4MyAtIHkzICogeTMgLSB6MyAqIHozO1xuICAgICAgaWYgKHQzIDwgMCkgbjMgPSAwLjA7XG4gICAgICBlbHNlIHtcbiAgICAgICAgdmFyIGdpMyA9IHBlcm1Nb2QxMltpaSArIDEgKyBwZXJtW2pqICsgMSArIHBlcm1ba2sgKyAxXV1dICogMztcbiAgICAgICAgdDMgKj0gdDM7XG4gICAgICAgIG4zID0gdDMgKiB0MyAqIChncmFkM1tnaTNdICogeDMgKyBncmFkM1tnaTMgKyAxXSAqIHkzICsgZ3JhZDNbZ2kzICsgMl0gKiB6Myk7XG4gICAgICB9XG4gICAgICAvLyBBZGQgY29udHJpYnV0aW9ucyBmcm9tIGVhY2ggY29ybmVyIHRvIGdldCB0aGUgZmluYWwgbm9pc2UgdmFsdWUuXG4gICAgICAvLyBUaGUgcmVzdWx0IGlzIHNjYWxlZCB0byBzdGF5IGp1c3QgaW5zaWRlIFstMSwxXVxuICAgICAgcmV0dXJuIDMyLjAgKiAobjAgKyBuMSArIG4yICsgbjMpO1xuICAgIH0sXG4gICAgLy8gNEQgc2ltcGxleCBub2lzZSwgYmV0dGVyIHNpbXBsZXggcmFuayBvcmRlcmluZyBtZXRob2QgMjAxMi0wMy0wOVxuICAgIG5vaXNlNEQ6IGZ1bmN0aW9uKHgsIHksIHosIHcpIHtcbiAgICAgIHZhciBwZXJtID0gdGhpcy5wZXJtO1xuICAgICAgdmFyIGdyYWQ0ID0gdGhpcy5ncmFkNDtcblxuICAgICAgdmFyIG4wLCBuMSwgbjIsIG4zLCBuNDsgLy8gTm9pc2UgY29udHJpYnV0aW9ucyBmcm9tIHRoZSBmaXZlIGNvcm5lcnNcbiAgICAgIC8vIFNrZXcgdGhlICh4LHkseix3KSBzcGFjZSB0byBkZXRlcm1pbmUgd2hpY2ggY2VsbCBvZiAyNCBzaW1wbGljZXMgd2UncmUgaW5cbiAgICAgIHZhciBzID0gKHggKyB5ICsgeiArIHcpICogRjQ7IC8vIEZhY3RvciBmb3IgNEQgc2tld2luZ1xuICAgICAgdmFyIGkgPSBNYXRoLmZsb29yKHggKyBzKTtcbiAgICAgIHZhciBqID0gTWF0aC5mbG9vcih5ICsgcyk7XG4gICAgICB2YXIgayA9IE1hdGguZmxvb3IoeiArIHMpO1xuICAgICAgdmFyIGwgPSBNYXRoLmZsb29yKHcgKyBzKTtcbiAgICAgIHZhciB0ID0gKGkgKyBqICsgayArIGwpICogRzQ7IC8vIEZhY3RvciBmb3IgNEQgdW5za2V3aW5nXG4gICAgICB2YXIgWDAgPSBpIC0gdDsgLy8gVW5za2V3IHRoZSBjZWxsIG9yaWdpbiBiYWNrIHRvICh4LHkseix3KSBzcGFjZVxuICAgICAgdmFyIFkwID0gaiAtIHQ7XG4gICAgICB2YXIgWjAgPSBrIC0gdDtcbiAgICAgIHZhciBXMCA9IGwgLSB0O1xuICAgICAgdmFyIHgwID0geCAtIFgwOyAvLyBUaGUgeCx5LHosdyBkaXN0YW5jZXMgZnJvbSB0aGUgY2VsbCBvcmlnaW5cbiAgICAgIHZhciB5MCA9IHkgLSBZMDtcbiAgICAgIHZhciB6MCA9IHogLSBaMDtcbiAgICAgIHZhciB3MCA9IHcgLSBXMDtcbiAgICAgIC8vIEZvciB0aGUgNEQgY2FzZSwgdGhlIHNpbXBsZXggaXMgYSA0RCBzaGFwZSBJIHdvbid0IGV2ZW4gdHJ5IHRvIGRlc2NyaWJlLlxuICAgICAgLy8gVG8gZmluZCBvdXQgd2hpY2ggb2YgdGhlIDI0IHBvc3NpYmxlIHNpbXBsaWNlcyB3ZSdyZSBpbiwgd2UgbmVlZCB0b1xuICAgICAgLy8gZGV0ZXJtaW5lIHRoZSBtYWduaXR1ZGUgb3JkZXJpbmcgb2YgeDAsIHkwLCB6MCBhbmQgdzAuXG4gICAgICAvLyBTaXggcGFpci13aXNlIGNvbXBhcmlzb25zIGFyZSBwZXJmb3JtZWQgYmV0d2VlbiBlYWNoIHBvc3NpYmxlIHBhaXJcbiAgICAgIC8vIG9mIHRoZSBmb3VyIGNvb3JkaW5hdGVzLCBhbmQgdGhlIHJlc3VsdHMgYXJlIHVzZWQgdG8gcmFuayB0aGUgbnVtYmVycy5cbiAgICAgIHZhciByYW5reCA9IDA7XG4gICAgICB2YXIgcmFua3kgPSAwO1xuICAgICAgdmFyIHJhbmt6ID0gMDtcbiAgICAgIHZhciByYW5rdyA9IDA7XG4gICAgICBpZiAoeDAgPiB5MCkgcmFua3grKztcbiAgICAgIGVsc2UgcmFua3krKztcbiAgICAgIGlmICh4MCA+IHowKSByYW5reCsrO1xuICAgICAgZWxzZSByYW5reisrO1xuICAgICAgaWYgKHgwID4gdzApIHJhbmt4Kys7XG4gICAgICBlbHNlIHJhbmt3Kys7XG4gICAgICBpZiAoeTAgPiB6MCkgcmFua3krKztcbiAgICAgIGVsc2UgcmFua3orKztcbiAgICAgIGlmICh5MCA+IHcwKSByYW5reSsrO1xuICAgICAgZWxzZSByYW5rdysrO1xuICAgICAgaWYgKHowID4gdzApIHJhbmt6Kys7XG4gICAgICBlbHNlIHJhbmt3Kys7XG4gICAgICB2YXIgaTEsIGoxLCBrMSwgbDE7IC8vIFRoZSBpbnRlZ2VyIG9mZnNldHMgZm9yIHRoZSBzZWNvbmQgc2ltcGxleCBjb3JuZXJcbiAgICAgIHZhciBpMiwgajIsIGsyLCBsMjsgLy8gVGhlIGludGVnZXIgb2Zmc2V0cyBmb3IgdGhlIHRoaXJkIHNpbXBsZXggY29ybmVyXG4gICAgICB2YXIgaTMsIGozLCBrMywgbDM7IC8vIFRoZSBpbnRlZ2VyIG9mZnNldHMgZm9yIHRoZSBmb3VydGggc2ltcGxleCBjb3JuZXJcbiAgICAgIC8vIHNpbXBsZXhbY10gaXMgYSA0LXZlY3RvciB3aXRoIHRoZSBudW1iZXJzIDAsIDEsIDIgYW5kIDMgaW4gc29tZSBvcmRlci5cbiAgICAgIC8vIE1hbnkgdmFsdWVzIG9mIGMgd2lsbCBuZXZlciBvY2N1ciwgc2luY2UgZS5nLiB4Pnk+ej53IG1ha2VzIHg8eiwgeTx3IGFuZCB4PHdcbiAgICAgIC8vIGltcG9zc2libGUuIE9ubHkgdGhlIDI0IGluZGljZXMgd2hpY2ggaGF2ZSBub24temVybyBlbnRyaWVzIG1ha2UgYW55IHNlbnNlLlxuICAgICAgLy8gV2UgdXNlIGEgdGhyZXNob2xkaW5nIHRvIHNldCB0aGUgY29vcmRpbmF0ZXMgaW4gdHVybiBmcm9tIHRoZSBsYXJnZXN0IG1hZ25pdHVkZS5cbiAgICAgIC8vIFJhbmsgMyBkZW5vdGVzIHRoZSBsYXJnZXN0IGNvb3JkaW5hdGUuXG4gICAgICBpMSA9IHJhbmt4ID49IDMgPyAxIDogMDtcbiAgICAgIGoxID0gcmFua3kgPj0gMyA/IDEgOiAwO1xuICAgICAgazEgPSByYW5reiA+PSAzID8gMSA6IDA7XG4gICAgICBsMSA9IHJhbmt3ID49IDMgPyAxIDogMDtcbiAgICAgIC8vIFJhbmsgMiBkZW5vdGVzIHRoZSBzZWNvbmQgbGFyZ2VzdCBjb29yZGluYXRlLlxuICAgICAgaTIgPSByYW5reCA+PSAyID8gMSA6IDA7XG4gICAgICBqMiA9IHJhbmt5ID49IDIgPyAxIDogMDtcbiAgICAgIGsyID0gcmFua3ogPj0gMiA/IDEgOiAwO1xuICAgICAgbDIgPSByYW5rdyA+PSAyID8gMSA6IDA7XG4gICAgICAvLyBSYW5rIDEgZGVub3RlcyB0aGUgc2Vjb25kIHNtYWxsZXN0IGNvb3JkaW5hdGUuXG4gICAgICBpMyA9IHJhbmt4ID49IDEgPyAxIDogMDtcbiAgICAgIGozID0gcmFua3kgPj0gMSA/IDEgOiAwO1xuICAgICAgazMgPSByYW5reiA+PSAxID8gMSA6IDA7XG4gICAgICBsMyA9IHJhbmt3ID49IDEgPyAxIDogMDtcbiAgICAgIC8vIFRoZSBmaWZ0aCBjb3JuZXIgaGFzIGFsbCBjb29yZGluYXRlIG9mZnNldHMgPSAxLCBzbyBubyBuZWVkIHRvIGNvbXB1dGUgdGhhdC5cbiAgICAgIHZhciB4MSA9IHgwIC0gaTEgKyBHNDsgLy8gT2Zmc2V0cyBmb3Igc2Vjb25kIGNvcm5lciBpbiAoeCx5LHosdykgY29vcmRzXG4gICAgICB2YXIgeTEgPSB5MCAtIGoxICsgRzQ7XG4gICAgICB2YXIgejEgPSB6MCAtIGsxICsgRzQ7XG4gICAgICB2YXIgdzEgPSB3MCAtIGwxICsgRzQ7XG4gICAgICB2YXIgeDIgPSB4MCAtIGkyICsgMi4wICogRzQ7IC8vIE9mZnNldHMgZm9yIHRoaXJkIGNvcm5lciBpbiAoeCx5LHosdykgY29vcmRzXG4gICAgICB2YXIgeTIgPSB5MCAtIGoyICsgMi4wICogRzQ7XG4gICAgICB2YXIgejIgPSB6MCAtIGsyICsgMi4wICogRzQ7XG4gICAgICB2YXIgdzIgPSB3MCAtIGwyICsgMi4wICogRzQ7XG4gICAgICB2YXIgeDMgPSB4MCAtIGkzICsgMy4wICogRzQ7IC8vIE9mZnNldHMgZm9yIGZvdXJ0aCBjb3JuZXIgaW4gKHgseSx6LHcpIGNvb3Jkc1xuICAgICAgdmFyIHkzID0geTAgLSBqMyArIDMuMCAqIEc0O1xuICAgICAgdmFyIHozID0gejAgLSBrMyArIDMuMCAqIEc0O1xuICAgICAgdmFyIHczID0gdzAgLSBsMyArIDMuMCAqIEc0O1xuICAgICAgdmFyIHg0ID0geDAgLSAxLjAgKyA0LjAgKiBHNDsgLy8gT2Zmc2V0cyBmb3IgbGFzdCBjb3JuZXIgaW4gKHgseSx6LHcpIGNvb3Jkc1xuICAgICAgdmFyIHk0ID0geTAgLSAxLjAgKyA0LjAgKiBHNDtcbiAgICAgIHZhciB6NCA9IHowIC0gMS4wICsgNC4wICogRzQ7XG4gICAgICB2YXIgdzQgPSB3MCAtIDEuMCArIDQuMCAqIEc0O1xuICAgICAgLy8gV29yayBvdXQgdGhlIGhhc2hlZCBncmFkaWVudCBpbmRpY2VzIG9mIHRoZSBmaXZlIHNpbXBsZXggY29ybmVyc1xuICAgICAgdmFyIGlpID0gaSAmIDI1NTtcbiAgICAgIHZhciBqaiA9IGogJiAyNTU7XG4gICAgICB2YXIga2sgPSBrICYgMjU1O1xuICAgICAgdmFyIGxsID0gbCAmIDI1NTtcbiAgICAgIC8vIENhbGN1bGF0ZSB0aGUgY29udHJpYnV0aW9uIGZyb20gdGhlIGZpdmUgY29ybmVyc1xuICAgICAgdmFyIHQwID0gMC42IC0geDAgKiB4MCAtIHkwICogeTAgLSB6MCAqIHowIC0gdzAgKiB3MDtcbiAgICAgIGlmICh0MCA8IDApIG4wID0gMC4wO1xuICAgICAgZWxzZSB7XG4gICAgICAgIHZhciBnaTAgPSAocGVybVtpaSArIHBlcm1bamogKyBwZXJtW2trICsgcGVybVtsbF1dXV0gJSAzMikgKiA0O1xuICAgICAgICB0MCAqPSB0MDtcbiAgICAgICAgbjAgPSB0MCAqIHQwICogKGdyYWQ0W2dpMF0gKiB4MCArIGdyYWQ0W2dpMCArIDFdICogeTAgKyBncmFkNFtnaTAgKyAyXSAqIHowICsgZ3JhZDRbZ2kwICsgM10gKiB3MCk7XG4gICAgICB9XG4gICAgICB2YXIgdDEgPSAwLjYgLSB4MSAqIHgxIC0geTEgKiB5MSAtIHoxICogejEgLSB3MSAqIHcxO1xuICAgICAgaWYgKHQxIDwgMCkgbjEgPSAwLjA7XG4gICAgICBlbHNlIHtcbiAgICAgICAgdmFyIGdpMSA9IChwZXJtW2lpICsgaTEgKyBwZXJtW2pqICsgajEgKyBwZXJtW2trICsgazEgKyBwZXJtW2xsICsgbDFdXV1dICUgMzIpICogNDtcbiAgICAgICAgdDEgKj0gdDE7XG4gICAgICAgIG4xID0gdDEgKiB0MSAqIChncmFkNFtnaTFdICogeDEgKyBncmFkNFtnaTEgKyAxXSAqIHkxICsgZ3JhZDRbZ2kxICsgMl0gKiB6MSArIGdyYWQ0W2dpMSArIDNdICogdzEpO1xuICAgICAgfVxuICAgICAgdmFyIHQyID0gMC42IC0geDIgKiB4MiAtIHkyICogeTIgLSB6MiAqIHoyIC0gdzIgKiB3MjtcbiAgICAgIGlmICh0MiA8IDApIG4yID0gMC4wO1xuICAgICAgZWxzZSB7XG4gICAgICAgIHZhciBnaTIgPSAocGVybVtpaSArIGkyICsgcGVybVtqaiArIGoyICsgcGVybVtrayArIGsyICsgcGVybVtsbCArIGwyXV1dXSAlIDMyKSAqIDQ7XG4gICAgICAgIHQyICo9IHQyO1xuICAgICAgICBuMiA9IHQyICogdDIgKiAoZ3JhZDRbZ2kyXSAqIHgyICsgZ3JhZDRbZ2kyICsgMV0gKiB5MiArIGdyYWQ0W2dpMiArIDJdICogejIgKyBncmFkNFtnaTIgKyAzXSAqIHcyKTtcbiAgICAgIH1cbiAgICAgIHZhciB0MyA9IDAuNiAtIHgzICogeDMgLSB5MyAqIHkzIC0gejMgKiB6MyAtIHczICogdzM7XG4gICAgICBpZiAodDMgPCAwKSBuMyA9IDAuMDtcbiAgICAgIGVsc2Uge1xuICAgICAgICB2YXIgZ2kzID0gKHBlcm1baWkgKyBpMyArIHBlcm1bamogKyBqMyArIHBlcm1ba2sgKyBrMyArIHBlcm1bbGwgKyBsM11dXV0gJSAzMikgKiA0O1xuICAgICAgICB0MyAqPSB0MztcbiAgICAgICAgbjMgPSB0MyAqIHQzICogKGdyYWQ0W2dpM10gKiB4MyArIGdyYWQ0W2dpMyArIDFdICogeTMgKyBncmFkNFtnaTMgKyAyXSAqIHozICsgZ3JhZDRbZ2kzICsgM10gKiB3Myk7XG4gICAgICB9XG4gICAgICB2YXIgdDQgPSAwLjYgLSB4NCAqIHg0IC0geTQgKiB5NCAtIHo0ICogejQgLSB3NCAqIHc0O1xuICAgICAgaWYgKHQ0IDwgMCkgbjQgPSAwLjA7XG4gICAgICBlbHNlIHtcbiAgICAgICAgdmFyIGdpNCA9IChwZXJtW2lpICsgMSArIHBlcm1bamogKyAxICsgcGVybVtrayArIDEgKyBwZXJtW2xsICsgMV1dXV0gJSAzMikgKiA0O1xuICAgICAgICB0NCAqPSB0NDtcbiAgICAgICAgbjQgPSB0NCAqIHQ0ICogKGdyYWQ0W2dpNF0gKiB4NCArIGdyYWQ0W2dpNCArIDFdICogeTQgKyBncmFkNFtnaTQgKyAyXSAqIHo0ICsgZ3JhZDRbZ2k0ICsgM10gKiB3NCk7XG4gICAgICB9XG4gICAgICAvLyBTdW0gdXAgYW5kIHNjYWxlIHRoZSByZXN1bHQgdG8gY292ZXIgdGhlIHJhbmdlIFstMSwxXVxuICAgICAgcmV0dXJuIDI3LjAgKiAobjAgKyBuMSArIG4yICsgbjMgKyBuNCk7XG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIGJ1aWxkUGVybXV0YXRpb25UYWJsZShyYW5kb20pIHtcbiAgICB2YXIgaTtcbiAgICB2YXIgcCA9IG5ldyBVaW50OEFycmF5KDI1Nik7XG4gICAgZm9yIChpID0gMDsgaSA8IDI1NjsgaSsrKSB7XG4gICAgICBwW2ldID0gaTtcbiAgICB9XG4gICAgZm9yIChpID0gMDsgaSA8IDI1NTsgaSsrKSB7XG4gICAgICB2YXIgciA9IGkgKyB+fihyYW5kb20oKSAqICgyNTYgLSBpKSk7XG4gICAgICB2YXIgYXV4ID0gcFtpXTtcbiAgICAgIHBbaV0gPSBwW3JdO1xuICAgICAgcFtyXSA9IGF1eDtcbiAgICB9XG4gICAgcmV0dXJuIHA7XG4gIH1cbiAgU2ltcGxleE5vaXNlLl9idWlsZFBlcm11dGF0aW9uVGFibGUgPSBidWlsZFBlcm11dGF0aW9uVGFibGU7XG5cbiAgZnVuY3Rpb24gYWxlYSgpIHtcbiAgICAvLyBKb2hhbm5lcyBCYWFnw7hlIDxiYWFnb2VAYmFhZ29lLmNvbT4sIDIwMTBcbiAgICB2YXIgczAgPSAwO1xuICAgIHZhciBzMSA9IDA7XG4gICAgdmFyIHMyID0gMDtcbiAgICB2YXIgYyA9IDE7XG5cbiAgICB2YXIgbWFzaCA9IG1hc2hlcigpO1xuICAgIHMwID0gbWFzaCgnICcpO1xuICAgIHMxID0gbWFzaCgnICcpO1xuICAgIHMyID0gbWFzaCgnICcpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHMwIC09IG1hc2goYXJndW1lbnRzW2ldKTtcbiAgICAgIGlmIChzMCA8IDApIHtcbiAgICAgICAgczAgKz0gMTtcbiAgICAgIH1cbiAgICAgIHMxIC09IG1hc2goYXJndW1lbnRzW2ldKTtcbiAgICAgIGlmIChzMSA8IDApIHtcbiAgICAgICAgczEgKz0gMTtcbiAgICAgIH1cbiAgICAgIHMyIC09IG1hc2goYXJndW1lbnRzW2ldKTtcbiAgICAgIGlmIChzMiA8IDApIHtcbiAgICAgICAgczIgKz0gMTtcbiAgICAgIH1cbiAgICB9XG4gICAgbWFzaCA9IG51bGw7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHQgPSAyMDkxNjM5ICogczAgKyBjICogMi4zMjgzMDY0MzY1Mzg2OTYzZS0xMDsgLy8gMl4tMzJcbiAgICAgIHMwID0gczE7XG4gICAgICBzMSA9IHMyO1xuICAgICAgcmV0dXJuIHMyID0gdCAtIChjID0gdCB8IDApO1xuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gbWFzaGVyKCkge1xuICAgIHZhciBuID0gMHhlZmM4MjQ5ZDtcbiAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgZGF0YSA9IGRhdGEudG9TdHJpbmcoKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICBuICs9IGRhdGEuY2hhckNvZGVBdChpKTtcbiAgICAgICAgdmFyIGggPSAwLjAyNTE5NjAzMjgyNDE2OTM4ICogbjtcbiAgICAgICAgbiA9IGggPj4+IDA7XG4gICAgICAgIGggLT0gbjtcbiAgICAgICAgaCAqPSBuO1xuICAgICAgICBuID0gaCA+Pj4gMDtcbiAgICAgICAgaCAtPSBuO1xuICAgICAgICBuICs9IGggKiAweDEwMDAwMDAwMDsgLy8gMl4zMlxuICAgICAgfVxuICAgICAgcmV0dXJuIChuID4+PiAwKSAqIDIuMzI4MzA2NDM2NTM4Njk2M2UtMTA7IC8vIDJeLTMyXG4gICAgfTtcbiAgfVxuXG4gIC8vIGFtZFxuICBpZiAodHlwZW9mIGRlZmluZSAhPT0gJ3VuZGVmaW5lZCcgJiYgZGVmaW5lLmFtZCkgZGVmaW5lKGZ1bmN0aW9uKCkge3JldHVybiBTaW1wbGV4Tm9pc2U7fSk7XG4gIC8vIGNvbW1vbiBqc1xuICBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSBleHBvcnRzLlNpbXBsZXhOb2lzZSA9IFNpbXBsZXhOb2lzZTtcbiAgLy8gYnJvd3NlclxuICBlbHNlIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykgd2luZG93LlNpbXBsZXhOb2lzZSA9IFNpbXBsZXhOb2lzZTtcbiAgLy8gbm9kZWpzXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gU2ltcGxleE5vaXNlO1xuICB9XG5cbn0pKCk7XG4iLCJcbiAgICAgIGltcG9ydCBBUEkgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanNcIjtcbiAgICAgIGltcG9ydCBkb21BUEkgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZURvbUFQSS5qc1wiO1xuICAgICAgaW1wb3J0IGluc2VydEZuIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0QnlTZWxlY3Rvci5qc1wiO1xuICAgICAgaW1wb3J0IHNldEF0dHJpYnV0ZXMgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRTdHlsZUVsZW1lbnQgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRTdHlsZUVsZW1lbnQuanNcIjtcbiAgICAgIGltcG9ydCBzdHlsZVRhZ1RyYW5zZm9ybUZuIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVUYWdUcmFuc2Zvcm0uanNcIjtcbiAgICAgIGltcG9ydCBjb250ZW50LCAqIGFzIG5hbWVkRXhwb3J0IGZyb20gXCIhIS4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vc3R5bGUuY3NzXCI7XG4gICAgICBcbiAgICAgIFxuXG52YXIgb3B0aW9ucyA9IHt9O1xuXG5vcHRpb25zLnN0eWxlVGFnVHJhbnNmb3JtID0gc3R5bGVUYWdUcmFuc2Zvcm1Gbjtcbm9wdGlvbnMuc2V0QXR0cmlidXRlcyA9IHNldEF0dHJpYnV0ZXM7XG5cbiAgICAgIG9wdGlvbnMuaW5zZXJ0ID0gaW5zZXJ0Rm4uYmluZChudWxsLCBcImhlYWRcIik7XG4gICAgXG5vcHRpb25zLmRvbUFQSSA9IGRvbUFQSTtcbm9wdGlvbnMuaW5zZXJ0U3R5bGVFbGVtZW50ID0gaW5zZXJ0U3R5bGVFbGVtZW50O1xuXG52YXIgdXBkYXRlID0gQVBJKGNvbnRlbnQsIG9wdGlvbnMpO1xuXG5cblxuZXhwb3J0ICogZnJvbSBcIiEhLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi9zdHlsZS5jc3NcIjtcbiAgICAgICBleHBvcnQgZGVmYXVsdCBjb250ZW50ICYmIGNvbnRlbnQubG9jYWxzID8gY29udGVudC5sb2NhbHMgOiB1bmRlZmluZWQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHN0eWxlc0luRE9NID0gW107XG5cbmZ1bmN0aW9uIGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpIHtcbiAgdmFyIHJlc3VsdCA9IC0xO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3R5bGVzSW5ET00ubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoc3R5bGVzSW5ET01baV0uaWRlbnRpZmllciA9PT0gaWRlbnRpZmllcikge1xuICAgICAgcmVzdWx0ID0gaTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIG1vZHVsZXNUb0RvbShsaXN0LCBvcHRpb25zKSB7XG4gIHZhciBpZENvdW50TWFwID0ge307XG4gIHZhciBpZGVudGlmaWVycyA9IFtdO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gbGlzdFtpXTtcbiAgICB2YXIgaWQgPSBvcHRpb25zLmJhc2UgPyBpdGVtWzBdICsgb3B0aW9ucy5iYXNlIDogaXRlbVswXTtcbiAgICB2YXIgY291bnQgPSBpZENvdW50TWFwW2lkXSB8fCAwO1xuICAgIHZhciBpZGVudGlmaWVyID0gXCJcIi5jb25jYXQoaWQsIFwiIFwiKS5jb25jYXQoY291bnQpO1xuICAgIGlkQ291bnRNYXBbaWRdID0gY291bnQgKyAxO1xuICAgIHZhciBpbmRleEJ5SWRlbnRpZmllciA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgIHZhciBvYmogPSB7XG4gICAgICBjc3M6IGl0ZW1bMV0sXG4gICAgICBtZWRpYTogaXRlbVsyXSxcbiAgICAgIHNvdXJjZU1hcDogaXRlbVszXSxcbiAgICAgIHN1cHBvcnRzOiBpdGVtWzRdLFxuICAgICAgbGF5ZXI6IGl0ZW1bNV1cbiAgICB9O1xuXG4gICAgaWYgKGluZGV4QnlJZGVudGlmaWVyICE9PSAtMSkge1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhCeUlkZW50aWZpZXJdLnJlZmVyZW5jZXMrKztcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4QnlJZGVudGlmaWVyXS51cGRhdGVyKG9iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB1cGRhdGVyID0gYWRkRWxlbWVudFN0eWxlKG9iaiwgb3B0aW9ucyk7XG4gICAgICBvcHRpb25zLmJ5SW5kZXggPSBpO1xuICAgICAgc3R5bGVzSW5ET00uc3BsaWNlKGksIDAsIHtcbiAgICAgICAgaWRlbnRpZmllcjogaWRlbnRpZmllcixcbiAgICAgICAgdXBkYXRlcjogdXBkYXRlcixcbiAgICAgICAgcmVmZXJlbmNlczogMVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWRlbnRpZmllcnMucHVzaChpZGVudGlmaWVyKTtcbiAgfVxuXG4gIHJldHVybiBpZGVudGlmaWVycztcbn1cblxuZnVuY3Rpb24gYWRkRWxlbWVudFN0eWxlKG9iaiwgb3B0aW9ucykge1xuICB2YXIgYXBpID0gb3B0aW9ucy5kb21BUEkob3B0aW9ucyk7XG4gIGFwaS51cGRhdGUob2JqKTtcblxuICB2YXIgdXBkYXRlciA9IGZ1bmN0aW9uIHVwZGF0ZXIobmV3T2JqKSB7XG4gICAgaWYgKG5ld09iaikge1xuICAgICAgaWYgKG5ld09iai5jc3MgPT09IG9iai5jc3MgJiYgbmV3T2JqLm1lZGlhID09PSBvYmoubWVkaWEgJiYgbmV3T2JqLnNvdXJjZU1hcCA9PT0gb2JqLnNvdXJjZU1hcCAmJiBuZXdPYmouc3VwcG9ydHMgPT09IG9iai5zdXBwb3J0cyAmJiBuZXdPYmoubGF5ZXIgPT09IG9iai5sYXllcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGFwaS51cGRhdGUob2JqID0gbmV3T2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXBpLnJlbW92ZSgpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gdXBkYXRlcjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobGlzdCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgbGlzdCA9IGxpc3QgfHwgW107XG4gIHZhciBsYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucyk7XG4gIHJldHVybiBmdW5jdGlvbiB1cGRhdGUobmV3TGlzdCkge1xuICAgIG5ld0xpc3QgPSBuZXdMaXN0IHx8IFtdO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBpZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW2ldO1xuICAgICAgdmFyIGluZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleF0ucmVmZXJlbmNlcy0tO1xuICAgIH1cblxuICAgIHZhciBuZXdMYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obmV3TGlzdCwgb3B0aW9ucyk7XG5cbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgX2krKykge1xuICAgICAgdmFyIF9pZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW19pXTtcblxuICAgICAgdmFyIF9pbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKF9pZGVudGlmaWVyKTtcblxuICAgICAgaWYgKHN0eWxlc0luRE9NW19pbmRleF0ucmVmZXJlbmNlcyA9PT0gMCkge1xuICAgICAgICBzdHlsZXNJbkRPTVtfaW5kZXhdLnVwZGF0ZXIoKTtcblxuICAgICAgICBzdHlsZXNJbkRPTS5zcGxpY2UoX2luZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsYXN0SWRlbnRpZmllcnMgPSBuZXdMYXN0SWRlbnRpZmllcnM7XG4gIH07XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgbWVtbyA9IHt9O1xuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5cbmZ1bmN0aW9uIGdldFRhcmdldCh0YXJnZXQpIHtcbiAgaWYgKHR5cGVvZiBtZW1vW3RhcmdldF0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICB2YXIgc3R5bGVUYXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCk7IC8vIFNwZWNpYWwgY2FzZSB0byByZXR1cm4gaGVhZCBvZiBpZnJhbWUgaW5zdGVhZCBvZiBpZnJhbWUgaXRzZWxmXG5cbiAgICBpZiAod2luZG93LkhUTUxJRnJhbWVFbGVtZW50ICYmIHN0eWxlVGFyZ2V0IGluc3RhbmNlb2Ygd2luZG93LkhUTUxJRnJhbWVFbGVtZW50KSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBUaGlzIHdpbGwgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIGFjY2VzcyB0byBpZnJhbWUgaXMgYmxvY2tlZFxuICAgICAgICAvLyBkdWUgdG8gY3Jvc3Mtb3JpZ2luIHJlc3RyaWN0aW9uc1xuICAgICAgICBzdHlsZVRhcmdldCA9IHN0eWxlVGFyZ2V0LmNvbnRlbnREb2N1bWVudC5oZWFkO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBpc3RhbmJ1bCBpZ25vcmUgbmV4dFxuICAgICAgICBzdHlsZVRhcmdldCA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbWVtb1t0YXJnZXRdID0gc3R5bGVUYXJnZXQ7XG4gIH1cblxuICByZXR1cm4gbWVtb1t0YXJnZXRdO1xufVxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5cblxuZnVuY3Rpb24gaW5zZXJ0QnlTZWxlY3RvcihpbnNlcnQsIHN0eWxlKSB7XG4gIHZhciB0YXJnZXQgPSBnZXRUYXJnZXQoaW5zZXJ0KTtcblxuICBpZiAoIXRhcmdldCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkbid0IGZpbmQgYSBzdHlsZSB0YXJnZXQuIFRoaXMgcHJvYmFibHkgbWVhbnMgdGhhdCB0aGUgdmFsdWUgZm9yIHRoZSAnaW5zZXJ0JyBwYXJhbWV0ZXIgaXMgaW52YWxpZC5cIik7XG4gIH1cblxuICB0YXJnZXQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGluc2VydEJ5U2VsZWN0b3I7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpIHtcbiAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG4gIG9wdGlvbnMuc2V0QXR0cmlidXRlcyhlbGVtZW50LCBvcHRpb25zLmF0dHJpYnV0ZXMpO1xuICBvcHRpb25zLmluc2VydChlbGVtZW50LCBvcHRpb25zLm9wdGlvbnMpO1xuICByZXR1cm4gZWxlbWVudDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzKHN0eWxlRWxlbWVudCkge1xuICB2YXIgbm9uY2UgPSB0eXBlb2YgX193ZWJwYWNrX25vbmNlX18gIT09IFwidW5kZWZpbmVkXCIgPyBfX3dlYnBhY2tfbm9uY2VfXyA6IG51bGw7XG5cbiAgaWYgKG5vbmNlKSB7XG4gICAgc3R5bGVFbGVtZW50LnNldEF0dHJpYnV0ZShcIm5vbmNlXCIsIG5vbmNlKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlczsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBhcHBseShzdHlsZUVsZW1lbnQsIG9wdGlvbnMsIG9iaikge1xuICB2YXIgY3NzID0gXCJcIjtcblxuICBpZiAob2JqLnN1cHBvcnRzKSB7XG4gICAgY3NzICs9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQob2JqLnN1cHBvcnRzLCBcIikge1wiKTtcbiAgfVxuXG4gIGlmIChvYmoubWVkaWEpIHtcbiAgICBjc3MgKz0gXCJAbWVkaWEgXCIuY29uY2F0KG9iai5tZWRpYSwgXCIge1wiKTtcbiAgfVxuXG4gIHZhciBuZWVkTGF5ZXIgPSB0eXBlb2Ygb2JqLmxheWVyICE9PSBcInVuZGVmaW5lZFwiO1xuXG4gIGlmIChuZWVkTGF5ZXIpIHtcbiAgICBjc3MgKz0gXCJAbGF5ZXJcIi5jb25jYXQob2JqLmxheWVyLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQob2JqLmxheWVyKSA6IFwiXCIsIFwiIHtcIik7XG4gIH1cblxuICBjc3MgKz0gb2JqLmNzcztcblxuICBpZiAobmVlZExheWVyKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG5cbiAgaWYgKG9iai5tZWRpYSkge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuXG4gIGlmIChvYmouc3VwcG9ydHMpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cblxuICB2YXIgc291cmNlTWFwID0gb2JqLnNvdXJjZU1hcDtcblxuICBpZiAoc291cmNlTWFwICYmIHR5cGVvZiBidG9hICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgY3NzICs9IFwiXFxuLyojIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxcIi5jb25jYXQoYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoc291cmNlTWFwKSkpKSwgXCIgKi9cIik7XG4gIH0gLy8gRm9yIG9sZCBJRVxuXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAgKi9cblxuXG4gIG9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0oY3NzLCBzdHlsZUVsZW1lbnQsIG9wdGlvbnMub3B0aW9ucyk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpIHtcbiAgLy8gaXN0YW5idWwgaWdub3JlIGlmXG4gIGlmIChzdHlsZUVsZW1lbnQucGFyZW50Tm9kZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHN0eWxlRWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudCk7XG59XG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cblxuXG5mdW5jdGlvbiBkb21BUEkob3B0aW9ucykge1xuICB2YXIgc3R5bGVFbGVtZW50ID0gb3B0aW9ucy5pbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucyk7XG4gIHJldHVybiB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUob2JqKSB7XG4gICAgICBhcHBseShzdHlsZUVsZW1lbnQsIG9wdGlvbnMsIG9iaik7XG4gICAgfSxcbiAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpO1xuICAgIH1cbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkb21BUEk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gc3R5bGVUYWdUcmFuc2Zvcm0oY3NzLCBzdHlsZUVsZW1lbnQpIHtcbiAgaWYgKHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0KSB7XG4gICAgc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcbiAgfSBlbHNlIHtcbiAgICB3aGlsZSAoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpIHtcbiAgICAgIHN0eWxlRWxlbWVudC5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gICAgfVxuXG4gICAgc3R5bGVFbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcykpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3R5bGVUYWdUcmFuc2Zvcm07IiwiaW1wb3J0IHNldENhbnZhcyBmcm9tICcuLi9zZXRDYW52YXMnXG5cbmxldCBmb250U2l6ZVxubGV0IGZvbnRGYW1pbHkgPSAnc2VyaWYnXG5cbmxldCBbY2FudmFzLCBjb250ZXh0LCBjYW52YXNXLCBjYW52YXNIXSA9IHNldENhbnZhcygpXG5cbmNvbnN0IHR5cGVDYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKVxuY29uc3QgdHlwZUNvbnRleHQgPSB0eXBlQ2FudmFzLmdldENvbnRleHQoJzJkJylcbmNvbnN0IGNlbGwgPSAxMFxuY29uc3QgY29scyA9IE1hdGguZmxvb3IoY2FudmFzVyAvIGNlbGwpXG5jb25zdCByb3dzID0gTWF0aC5mbG9vcihjYW52YXNIIC8gY2VsbClcbmNvbnN0IG51bUNlbGxzID0gY29scyAqIHJvd3NcbnR5cGVDYW52YXMud2lkdGggPSBjb2xzXG50eXBlQ2FudmFzLmhlaWdodCA9IHJvd3NcblxuZnVuY3Rpb24gYml0bWFwICh0ZXh0KSB7XG4gIGlmICh0ZXh0ID09PSAnJykgdGV4dCA9ICdBJ1xuXG4gIHR5cGVDb250ZXh0LmZpbGxTdHlsZSA9ICd3aGl0ZSdcbiAgdHlwZUNvbnRleHQuZmlsbFJlY3QoMCwgMCwgY29scywgcm93cylcblxuICB0eXBlQ29udGV4dC5maWxsU3R5bGUgPSAnYmxhY2snXG4gIGZvbnRTaXplID0gY29scyAqIDEuMlxuICBpZiAodGV4dCA9PT0gJ1EnIHx8IHRleHQgPT09ICdXJyB8fCB0ZXh0ID09PSAnTScpIGZvbnRTaXplID0gY29sc1xuICB0eXBlQ29udGV4dC5mb250ID0gYCR7Zm9udFNpemV9cHggJHtmb250RmFtaWx5fWBcbiAgdHlwZUNvbnRleHQudGV4dEJhc2VsaW5lID0gJ3RvcCdcblxuICBjb25zdCBtZXRyaWNzID0gdHlwZUNvbnRleHQubWVhc3VyZVRleHQodGV4dClcbiAgY29uc3QgbVggPSBtZXRyaWNzLmFjdHVhbEJvdW5kaW5nQm94TGVmdCAqIC0xXG4gIGNvbnN0IG1ZID0gbWV0cmljcy5hY3R1YWxCb3VuZGluZ0JveEFzY2VudCAqIC0xXG4gIGNvbnN0IG1XID0gbWV0cmljcy5hY3R1YWxCb3VuZGluZ0JveExlZnQgKyBtZXRyaWNzLmFjdHVhbEJvdW5kaW5nQm94UmlnaHRcbiAgY29uc3QgbUggPSBtZXRyaWNzLmFjdHVhbEJvdW5kaW5nQm94QXNjZW50ICsgbWV0cmljcy5hY3R1YWxCb3VuZGluZ0JveERlc2NlbnRcblxuICBjb25zdCB0eXBlWCA9IChjb2xzIC0gbVcpICogMC41IC0gbVhcbiAgY29uc3QgdHlwZVkgPSAocm93cyAtIG1IKSAqIDAuNSAtIG1ZXG5cbiAgdHlwZUNvbnRleHQuc2F2ZSgpXG4gIHR5cGVDb250ZXh0LnRyYW5zbGF0ZSh0eXBlWCwgdHlwZVkpXG4gIHR5cGVDb250ZXh0LmZpbGxUZXh0KHRleHQsIDAsIDApXG4gIHR5cGVDb250ZXh0LnJlc3RvcmUoKVxuXG4gIGNvbnN0IHR5cGVEYXRhID0gdHlwZUNvbnRleHQuZ2V0SW1hZ2VEYXRhKDAsIDAsIGNvbHMsIHJvd3MpLmRhdGEgLy8gb25seSB0aGUgZGF0YSBhcnJheSBvZiB0aGUgSW1hZ2UgZGF0YSBvYmplY3RcblxuICAvLyBjYW52YXNcbiAgY29udGV4dC5maWxsU3R5bGUgPSAnd2hpdGUnIC8vIHR3byBsaW5lcyB0byBjbGVhbiB1cCB0aGUgY2FudmFzLCBcbiAgY29udGV4dC5maWxsUmVjdCgwLCAwLCBjYW52YXNXLCBjYW52YXNIKSAvL290aGVyd2lzZSB0aGUgc2hhZG93IG9mIHRoZSBwcmV2aW91cyBsZXR0ZXIgd2lsbCBhcHBlYXJcblxuICBmb3IgKGxldCBpID0gMDsgaTwgbnVtQ2VsbHM7IGkrKykge1xuICAgIGNvbnN0IGNvbCA9IGkgJSBjb2xzXG4gICAgY29uc3Qgcm93ID0gTWF0aC5mbG9vcihpIC8gY29scylcblxuICAgIGNvbnN0IGNhbnZhc1ggPSBjb2wgKiBjZWxsXG4gICAgY29uc3QgY2FudmFzWSA9IHJvdyAqIGNlbGxcblxuICAgIGNvbnN0IHIgPSB0eXBlRGF0YVtpICogNCArIDBdXG4gICAgY29uc3QgZyA9IHR5cGVEYXRhW2kgKiA0ICsgMV1cbiAgICBjb25zdCBiID0gdHlwZURhdGFbaSAqIDQgKyAyXVxuICAgIGNvbnN0IGEgPSB0eXBlRGF0YVtpICogNCArIDNdXG5cbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9IGByZ2IoJHtyfSwgJHtnfSwgJHtifSlgXG4gICAgY29udGV4dC5zYXZlKClcbiAgICBjb250ZXh0LnRyYW5zbGF0ZShjYW52YXNYLCBjYW52YXNZKVxuICAgIGNvbnRleHQudHJhbnNsYXRlKGNlbGwgLyAyLCBjZWxsIC8gMikgLy8gZHJhdyBjaXJjbGUgZnJvbSBjZW50ZXJcbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpXG4gICAgY29udGV4dC5hcmMoMCwgMCwgY2VsbCAvIDIuMSwgMCwgTWF0aC5QSSAqIDIpXG4gICAgY29udGV4dC5maWxsKClcbiAgICBjb250ZXh0LnJlc3RvcmUoKVxuICB9XG4gIHJldHVybiBjYW52YXNcbn1cblxuZXhwb3J0IGRlZmF1bHQgYml0bWFwXG4iLCJjb25zdCBjX21hdGggPSByZXF1aXJlKCdjYW52YXMtc2tldGNoLXV0aWwvbWF0aCcpXG5jb25zdCBjX3JhbmRvbSA9IHJlcXVpcmUoJ2NhbnZhcy1za2V0Y2gtdXRpbC9yYW5kb20nKVxuaW1wb3J0IHNldENhbnZhcyBmcm9tICcuLi9zZXRDYW52YXMnXG5cbmxldCBbY2FudmFzLCBjb250ZXh0LCBjYW52YXNXLCBjYW52YXNIXSA9IHNldENhbnZhcygpXG5cbmNvbnN0IGN4ID0gY2FudmFzVyAvIDJcbmNvbnN0IGN5ID0gY2FudmFzSCAvIDJcbmxldCB4LCB5O1xuY29uc3QgdyA9IGNhbnZhc1cgLyAxMDBcbmNvbnN0IGggPSBjYW52YXNIIC8gMTBcblxuY29uc3QgdGlja3MgPSAxMlxuY29uc3QgcmFkaXVzID0gY2FudmFzVyAvIDNcblxuZnVuY3Rpb24gY2lyY2xlICgpIHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aWNrczsgaSsrKSB7XG4gICAgY29uc3Qgc2xpY2UgPSBjX21hdGguZGVnVG9SYWQoMzYwIC8gdGlja3MpXG4gICAgY29uc3QgYW5nbGUgPSBzbGljZSAqIGlcblxuICAgIHggPSBjeCArIHJhZGl1cyAqIE1hdGguc2luKGFuZ2xlKVxuICAgIHkgPSBjeSArIHJhZGl1cyAqIE1hdGguY29zKGFuZ2xlKVxuXG4gICAgY29udGV4dC5zYXZlKClcbiAgICAgIGNvbnRleHQudHJhbnNsYXRlKHgsIHkpXG4gICAgICBjb250ZXh0LnJvdGF0ZSgtYW5nbGUpXG4gICAgICBjb250ZXh0LnNjYWxlKGNfcmFuZG9tLnJhbmdlKDAuNSwgMiksIGNfcmFuZG9tLnJhbmdlKDAuNSwgMikpXG4gICAgICBcbiAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJ2JsYWNrJ1xuICAgICAgY29udGV4dC5iZWdpblBhdGgoKVxuICAgICAgY29udGV4dC5yZWN0KC13IC8gMiwgLWggLyAyLCB3LCBoKVxuICAgICAgY29udGV4dC5maWxsKClcbiAgICBjb250ZXh0LnJlc3RvcmUoKVxuXG4gICAgY29udGV4dC5zYXZlKClcbiAgICAgIGNvbnRleHQubGluZVdpZHRoID0gY19yYW5kb20ucmFuZ2UoMSwgMTApXG4gICAgICBjb250ZXh0LnRyYW5zbGF0ZShjeCwgY3kpXG4gICAgICBjb250ZXh0LnJvdGF0ZSgtYW5nbGUpXG4gICAgICBjb250ZXh0LmJlZ2luUGF0aCgpXG4gICAgICBjb250ZXh0LmFyYygwLCAwLCByYWRpdXMgKiBjX3JhbmRvbS5yYW5nZSgwLjc1LCAxLjI1KSwgc2xpY2UgKiBjX3JhbmRvbS5yYW5nZSgxLCAtOCksIHNsaWNlICogY19yYW5kb20ucmFuZ2UoMSwgMikpXG4gICAgICBjb250ZXh0LnN0cm9rZSgpXG4gICAgY29udGV4dC5yZXN0b3JlKClcbiAgfVxuICByZXR1cm4gY2FudmFzXG59XG5cbmV4cG9ydCBkZWZhdWx0IGNpcmNsZVxuIiwiaW1wb3J0IHNldENhbnZhcyBmcm9tICcuLi9zZXRDYW52YXMnXG5cbmxldCBmb250U2l6ZSA9IDBcbmxldCBmb250RmFtaWx5ID0gJ3NlcmlmJ1xuXG5sZXQgW2NhbnZhcywgY29udGV4dCwgY2FudmFzVywgY2FudmFzSF0gPSBzZXRDYW52YXMoKVxuXG5jb25zdCB0eXBlQ2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJylcbmNvbnN0IHR5cGVDb250ZXh0ID0gdHlwZUNhbnZhcy5nZXRDb250ZXh0KCcyZCcpXG5jb25zdCBjZWxsID0gMTBcbmNvbnN0IGNvbHMgPSBNYXRoLmZsb29yKGNhbnZhc1cgLyBjZWxsKVxuY29uc3Qgcm93cyA9IE1hdGguZmxvb3IoY2FudmFzSCAvIGNlbGwpXG5jb25zdCBudW1DZWxscyA9IGNvbHMgKiByb3dzXG50eXBlQ2FudmFzLndpZHRoID0gY29sc1xudHlwZUNhbnZhcy5oZWlnaHQgPSByb3dzXG5cbmZ1bmN0aW9uIGdseXBoICh0ZXh0KSB7XG4gIGlmICh0ZXh0ID09PSAnJykgdGV4dCA9ICdBJ1xuXG4gIHR5cGVDb250ZXh0LmZpbGxTdHlsZSA9ICd3aGl0ZSdcbiAgdHlwZUNvbnRleHQuZmlsbFJlY3QoMCwgMCwgY29scywgcm93cylcblxuICB0eXBlQ29udGV4dC5maWxsU3R5bGUgPSAnYmxhY2snXG4gIGZvbnRTaXplID0gY29scyAqIDEuM1xuICB0eXBlQ29udGV4dC5mb250ID0gYCR7Zm9udFNpemV9cHggJHtmb250RmFtaWx5fWBcbiAgdHlwZUNvbnRleHQudGV4dEJhc2VsaW5lID0gJ3RvcCdcblxuICBjb25zdCBtZXRyaWNzID0gdHlwZUNvbnRleHQubWVhc3VyZVRleHQodGV4dClcbiAgY29uc3QgbVggPSBtZXRyaWNzLmFjdHVhbEJvdW5kaW5nQm94TGVmdCAqIC0xXG4gIGNvbnN0IG1ZID0gbWV0cmljcy5hY3R1YWxCb3VuZGluZ0JveEFzY2VudCAqIC0xXG4gIGNvbnN0IG1XID0gbWV0cmljcy5hY3R1YWxCb3VuZGluZ0JveExlZnQgKyBtZXRyaWNzLmFjdHVhbEJvdW5kaW5nQm94UmlnaHRcbiAgY29uc3QgbUggPSBtZXRyaWNzLmFjdHVhbEJvdW5kaW5nQm94QXNjZW50ICsgbWV0cmljcy5hY3R1YWxCb3VuZGluZ0JveERlc2NlbnRcblxuICBjb25zdCB0eXBlWCA9IChjb2xzIC0gbVcpICogMC41IC0gbVhcbiAgY29uc3QgdHlwZVkgPSAocm93cyAtIG1IKSAqIDAuNSAtIG1ZXG5cbiAgdHlwZUNvbnRleHQuc2F2ZSgpXG4gIHR5cGVDb250ZXh0LnRyYW5zbGF0ZSh0eXBlWCwgdHlwZVkpXG4gIHR5cGVDb250ZXh0LmZpbGxUZXh0KHRleHQsIDAsIDApXG4gIHR5cGVDb250ZXh0LnJlc3RvcmUoKVxuXG4gIGNvbnN0IHR5cGVEYXRhID0gdHlwZUNvbnRleHQuZ2V0SW1hZ2VEYXRhKDAsIDAsIGNvbHMsIHJvd3MpLmRhdGFcblxuICAvLyBjYW52YXNcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1DZWxsczsgaSsrKSB7XG4gICAgY29uc3QgY29sID0gaSAlIGNvbHNcbiAgICBjb25zdCByb3cgPSBNYXRoLmZsb29yKGkgLyBjb2xzKVxuXG4gICAgY29uc3QgY2FudmFzWCA9IGNvbCAqIGNlbGxcbiAgICBjb25zdCBjYW52YXNZID0gcm93ICogY2VsbFxuXG4gICAgLy8gY29sb3IgPSB0eXBlRGF0YVtuXVxuICAgIC8vIHRvIGludmVydCBjb2xvciB1c2UgMjU1IC0gdHlwZURhdGEgW2ldXG4gICAgY29uc3QgciA9IHR5cGVEYXRhW2kgKiA0ICsgMF1cbiAgICBjb25zdCBnID0gdHlwZURhdGFbaSAqIDQgKyAxXVxuICAgIGNvbnN0IGIgPSB0eXBlRGF0YVtpICogNCArIDJdXG4gICAgY29uc3QgYSA9IHR5cGVEYXRhW2kgKiA0ICsgM11cblxuXG4gICAgY29udGV4dC5maWxsU3R5bGUgPSBgcmdiKCR7cn0sICR7Z30sICR7Yn0pYFxuICAgIGNvbnRleHQuc2F2ZSgpXG4gICAgY29udGV4dC50cmFuc2xhdGUoY2FudmFzWCwgY2FudmFzWSlcbiAgICBjb250ZXh0LnRyYW5zbGF0ZShjZWxsIC8gMiwgY2VsbCAvIDIpIC8vIGRyYXcgY2lyY2xlIGZyb20gY2VudGVyXG4gICAgY29udGV4dC5maWxsVGV4dCh0ZXh0LCAwLCAwKVxuICAgIGNvbnRleHQucmVzdG9yZSgpXG4gIH1cbiAgcmV0dXJuIGNhbnZhc1xufVxuXG5leHBvcnQgZGVmYXVsdCBnbHlwaFxuIiwiaW1wb3J0IHNldENhbnZhcyBmcm9tICcuLi9zZXRDYW52YXMnXG5jb25zdCBjX3JhbmRvbSA9IHJlcXVpcmUoJ2NhbnZhcy1za2V0Y2gtdXRpbC9yYW5kb20nKVxuXG5sZXQgZm9udFNpemVcbmxldCBmb250RmFtaWx5ID0gJ3NlcmlmJ1xuXG5sZXQgW2NhbnZhcywgY29udGV4dCwgY2FudmFzVywgY2FudmFzSF0gPSBzZXRDYW52YXMoKVxuXG5jb25zdCB0eXBlQ2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJylcbmNvbnN0IHR5cGVDb250ZXh0ID0gdHlwZUNhbnZhcy5nZXRDb250ZXh0KCcyZCcpXG5jb25zdCBjZWxsID0gMTBcbmNvbnN0IGNvbHMgPSBNYXRoLmZsb29yKGNhbnZhc1cgLyBjZWxsKVxuY29uc3Qgcm93cyA9IE1hdGguZmxvb3IoY2FudmFzSCAvIGNlbGwpXG5jb25zdCBudW1DZWxscyA9IGNvbHMgKiByb3dzXG50eXBlQ2FudmFzLndpZHRoID0gY29sc1xudHlwZUNhbnZhcy5oZWlnaHQgPSByb3dzXG5cbmNvbnN0IGdldEdseXBoID0gKHYpID0+IHtcbiAgaWYgKHYgPCA1MCkgcmV0dXJuICcnO1xuICBpZiAodiA8IDEwMCkgcmV0dXJuICcuJztcbiAgaWYgKHYgPCAxNTApIHJldHVybiAnLSc7XG4gIGlmICh2IDwgMjAwKSByZXR1cm4gJysnO1xuICBjb25zdCBlbHMgPSBbJ18nLCAnPScsICcgJywgJy8nXVxuXG4gIHJldHVybiBjX3JhbmRvbS5waWNrKGVscylcbn1cblxuZnVuY3Rpb24gZ2x5cGhzICh0ZXh0KSB7XG4gIGlmICh0ZXh0ID09PSAnJykgdGV4dCA9ICdBJ1xuXG4gIHR5cGVDb250ZXh0LmZpbGxTdHlsZSA9ICdibGFjaydcbiAgdHlwZUNvbnRleHQuZmlsbFJlY3QoMCwgMCwgY29scywgcm93cylcblxuICB0eXBlQ29udGV4dC5maWxsU3R5bGUgPSAnd2hpdGUnXG4gIGZvbnRTaXplID0gY29scyAqIDEuMlxuICB0eXBlQ29udGV4dC5mb250ID0gYCR7Zm9udFNpemV9cHggJHtmb250RmFtaWx5fWBcbiAgdHlwZUNvbnRleHQudGV4dEJhc2VsaW5lID0gJ3RvcCdcblxuICBjb25zdCBtZXRyaWNzID0gdHlwZUNvbnRleHQubWVhc3VyZVRleHQodGV4dClcbiAgY29uc3QgbVggPSBtZXRyaWNzLmFjdHVhbEJvdW5kaW5nQm94TGVmdCAqIC0xXG4gIGNvbnN0IG1ZID0gbWV0cmljcy5hY3R1YWxCb3VuZGluZ0JveEFzY2VudCAqIC0xXG4gIGNvbnN0IG1XID0gbWV0cmljcy5hY3R1YWxCb3VuZGluZ0JveExlZnQgKyBtZXRyaWNzLmFjdHVhbEJvdW5kaW5nQm94UmlnaHRcbiAgY29uc3QgbUggPSBtZXRyaWNzLmFjdHVhbEJvdW5kaW5nQm94QXNjZW50ICsgbWV0cmljcy5hY3R1YWxCb3VuZGluZ0JveERlc2NlbnRcblxuICBjb25zdCB0eXBlWCA9IChjb2xzIC0gbVcpICogMC41IC0gbVhcbiAgY29uc3QgdHlwZVkgPSAocm93cyAtIG1IKSAqIDAuNSAtIG1ZXG5cbiAgdHlwZUNvbnRleHQuc2F2ZSgpXG4gIHR5cGVDb250ZXh0LnRyYW5zbGF0ZSh0eXBlWCwgdHlwZVkpXG4gIHR5cGVDb250ZXh0LmZpbGxUZXh0KHRleHQsIDAsIDApXG4gIHR5cGVDb250ZXh0LnJlc3RvcmUoKVxuXG4gIGNvbnN0IHR5cGVEYXRhID0gdHlwZUNvbnRleHQuZ2V0SW1hZ2VEYXRhKDAsIDAsIGNvbHMsIHJvd3MpLmRhdGFcblxuICAvLyBjYW52YXNcbiAgY29udGV4dC50ZXh0QmFzZWxpbmUgPSAnbWlkZGxlJ1xuICBjb250ZXh0LnRleHRBbGlnbiA9ICdjZW50ZXInXG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1DZWxsczsgaSsrKSB7XG4gICAgY29uc3QgY29sID0gaSAlIGNvbHNcbiAgICBjb25zdCByb3cgPSBNYXRoLmZsb29yKGkgLyBjb2xzKVxuXG4gICAgY29uc3QgY2FudmFzWCA9IGNvbCAqIGNlbGxcbiAgICBjb25zdCBjYW52YXNZID0gcm93ICogY2VsbFxuXG4gICAgY29uc3QgciA9IHR5cGVEYXRhW2kgKiA0ICsgMF1cbiAgICBjb25zdCBnID0gdHlwZURhdGFbaSAqIDQgKyAxXVxuICAgIGNvbnN0IGIgPSB0eXBlRGF0YVtpICogNCArIDJdXG4gICAgY29uc3QgYSA9IHR5cGVEYXRhW2kgKiA0ICsgM11cblxuICAgIGNvbnN0IGdseXBoID0gZ2V0R2x5cGgocikgLy8gYiZ3IGNhbiBnZXQgYnJpZ2h0bmVzcyBmcm9tIGFueSBjaGFubmVsXG4gICAgY29udGV4dC5mb250ID0gYCR7Y2VsbH1weCAke2ZvbnRGYW1pbHl9YFxuICAgIGlmIChNYXRoLnJhbmRvbSgpIDwgMC4xNSkgY29udGV4dC5mb250ID0gYCR7Y2VsbCAqIDN9cHggJHtmb250RmFtaWx5fWBcbiAgICBjb250ZXh0LnNhdmUoKVxuICAgIGNvbnRleHQudHJhbnNsYXRlKGNhbnZhc1gsIGNhbnZhc1kpXG4gICAgY29udGV4dC50cmFuc2xhdGUoY2VsbCAvIDIsIGNlbGwgLyAyKSAvLyBkcmF3IGNpcmNsZSBmcm9tIGNlbnRlclxuICAgIGNvbnRleHQuZmlsbFRleHQoZ2x5cGgsIDAsIDApXG4gICAgY29udGV4dC5yZXN0b3JlKClcbiAgfVxuICByZXR1cm4gY2FudmFzXG59XG5cbmV4cG9ydCBkZWZhdWx0IGdseXBoc1xuIiwiY29uc3QgY19yYW5kb20gPSByZXF1aXJlKCdjYW52YXMtc2tldGNoLXV0aWwvcmFuZG9tJylcbmNvbnN0IGNfbWF0aCA9IHJlcXVpcmUoJ2NhbnZhcy1za2V0Y2gtdXRpbC9tYXRoJylcbmltcG9ydCBzZXRDYW52YXMgZnJvbSAnLi4vc2V0Q2FudmFzJ1xuXG5sZXQgW2NhbnZhcywgY29udGV4dCwgY2FudmFzVywgY2FudmFzSF0gPSBzZXRDYW52YXMoKVxuXG5mdW5jdGlvbiBuZXRwb2ludHMgKCkge1xuXG4gIGNsYXNzIFZlY3RvciB7XG4gICAgY29uc3RydWN0b3IoeCwgeSkge1xuICAgICAgdGhpcy54ID0geFxuICAgICAgdGhpcy55ID0geVxuICAgIH1cblxuICAgIGdldERpc3RhbmNlKHYpIHtcbiAgICAgIGNvbnN0IGR4ID0gdGhpcy54IC0gdi54XG4gICAgICBjb25zdCBkeSA9IHRoaXMueSAtIHYueVxuICAgICAgcmV0dXJuIE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSkgLy9oeXBvdGVudXNlXG4gICAgfVxuICB9XG4gIFxuICBjbGFzcyBBZ2VudCB7XG4gICAgY29uc3RydWN0b3IoeCwgeSkge1xuICAgICAgdGhpcy5wb3MgPSBuZXcgVmVjdG9yKHgsIHkpXG4gICAgICB0aGlzLnZlbCA9IG5ldyBWZWN0b3IoY19yYW5kb20ucmFuZ2UoLTAuNSwgMC41KSwgY19yYW5kb20ucmFuZ2UoLTAuNSwgMC41KSlcbiAgICAgIHRoaXMucmFkaXVzID0gY19yYW5kb20ucmFuZ2UoMiwgOClcbiAgICB9XG5cbiAgICB1cGRhdGUoKSB7XG4gICAgICB0aGlzLnBvcy54ICs9IHRoaXMudmVsLnhcbiAgICAgIHRoaXMucG9zLnkgKz0gdGhpcy52ZWwueVxuICAgIH1cblxuICAgIGJvdW5jZSh3LCBoKSB7XG4gICAgICBpZiAodGhpcy5wb3MueCA8PSAwIHx8IHRoaXMucG9zLnggPj0gdykgdGhpcy52ZWwueCAqPSAtMVxuICAgICAgaWYgKHRoaXMucG9zLnkgPD0gMCB8fCB0aGlzLnBvcy55ID49IGgpIHRoaXMudmVsLnkgKj0gLTFcbiAgICB9XG5cbiAgICBkcmF3KGNvbnRleHQpIHtcbiAgICAgIGNvbnRleHQuc2F2ZSgpXG4gICAgICBjb250ZXh0LnRyYW5zbGF0ZSh0aGlzLnBvcy54LCB0aGlzLnBvcy55KVxuXG4gICAgICBjb250ZXh0LmJlZ2luUGF0aCgpXG4gICAgICBjb250ZXh0LmFyYygwLCAwLCB0aGlzLnJhZGl1cywgMCwgTWF0aC5QSSAqIDIpXG4gICAgICBjb250ZXh0LmZpbGwoKVxuICAgICAgY29udGV4dC5zdHJva2UoKVxuXG4gICAgICBjb250ZXh0LnJlc3RvcmUoKVxuICAgIH1cbiAgfVxuICBcbiAgY29uc3QgYWdlbnRzID0gW11cbiAgY29udGV4dC5maWxsU3R5bGUgPSBcIndoaXRlXCJcbiAgY29udGV4dC5saW5lV2lkdGggPSAyXG4gIFxuICBmb3IgKGxldCBpID0gMDsgaSA8IDQwOyBpKyspIHtcbiAgICBjb25zdCB4ID0gY19yYW5kb20ucmFuZ2UoMCwgY2FudmFzVylcbiAgICBjb25zdCB5ID0gY19yYW5kb20ucmFuZ2UoMCwgY2FudmFzSClcbiAgICBhZ2VudHMucHVzaChuZXcgQWdlbnQoeCwgeSkpXG4gIH1cbiAgXG4gIGZ1bmN0aW9uIGFuaW1hdGUgKCkge1xuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZSlcbiAgICBjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCBjYW52YXNXLCBjYW52YXNIKVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhZ2VudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGFnZW50ID0gYWdlbnRzW2ldXG4gICAgICBmb3IobGV0IGogPSBpICsgMTsgaiA8IGFnZW50cy5sZW5ndGg7IGorKykgeyAvL2hhbGYgbGluZXMgKG5vdCB0d28gbGluZXMgb24gdG9wIG9mIGVhY2ggb3RoZXIpXG4gICAgICAgIGNvbnN0IG90aGVyID0gYWdlbnRzW2pdXG4gICAgICAgIGNvbnN0IGRpc3QgPSBhZ2VudC5wb3MuZ2V0RGlzdGFuY2Uob3RoZXIucG9zKVxuICAgICAgICBpZiAoZGlzdCA8IDEwMCkge1xuICAgICAgICAgIGNvbnRleHQuc2F2ZSgpXG4gICAgICAgICAgY29udGV4dC5saW5lV2lkdGggPSBjX21hdGgubWFwUmFuZ2UoZGlzdCwgMCwgMTAwLCAyLjIsIDAuMilcblxuICAgICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKClcbiAgICAgICAgICBjb250ZXh0Lm1vdmVUbyhhZ2VudC5wb3MueCwgYWdlbnQucG9zLnkpXG4gICAgICAgICAgY29udGV4dC5saW5lVG8ob3RoZXIucG9zLngsIG90aGVyLnBvcy55KVxuICAgICAgICAgIGNvbnRleHQuc3Ryb2tlKClcbiAgICAgICAgICBjb250ZXh0LnJlc3RvcmUoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgYWdlbnRzLmZvckVhY2gocG9pbnQgPT4ge1xuICAgICAgcG9pbnQudXBkYXRlKClcbiAgICAgIHBvaW50LmJvdW5jZShjYW52YXNXLCBjYW52YXNIKVxuICAgICAgcG9pbnQuZHJhdyhjb250ZXh0KVxuICAgICAgfVxuICAgIClcbiAgXG4gIH1cbiAgXG4gIGFuaW1hdGUoKVxuXG4gIHJldHVybiBjYW52YXNcbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV0cG9pbnRzXG4iLCJpbXBvcnQgc2V0Q2FudmFzIGZyb20gJy4uL3NldENhbnZhcydcbmNvbnN0IGNfcmFuZG9tID0gcmVxdWlyZSgnY2FudmFzLXNrZXRjaC11dGlsL3JhbmRvbScpXG5jb25zdCBjX21hdGggPSByZXF1aXJlKCdjYW52YXMtc2tldGNoLXV0aWwvbWF0aCcpXG5cbmxldCBbY2FudmFzLCBjb250ZXh0LCBjYW52YXNXLCBjYW52YXNIXSA9IHNldENhbnZhcygpXG5cbmNvbnN0IGNvbHMgPSAyNVxuY29uc3Qgcm93cyA9IDI1XG5jb25zdCBjZWxsTnVtID0gY29scyAqIHJvd3NcbmNvbnN0IGdyaWRXID0gY2FudmFzVyAqIDAuOFxuY29uc3QgZ3JpZEggPSBjYW52YXNIICogMC44XG5jb25zdCBjZWxsVyA9IGdyaWRXIC8gY29sc1xuY29uc3QgY2VsbEggPSBncmlkSCAvIHJvd3NcbmNvbnN0IG1hcmdpblggPSAoY2FudmFzVyAtIGdyaWRXKSAvIDJcbmNvbnN0IG1hcmdpblkgPSAoY2FudmFzSCAtIGdyaWRIKSAvIDJcblxubGV0IGZyYW1lID0gMFxuXG5mdW5jdGlvbiBub2lzZSAoKSB7XG4gIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobm9pc2UpXG4gIGNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIGNhbnZhc1csIGNhbnZhc0gpXG4gIGZyYW1lID0gZnJhbWUgKyA1XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjZWxsTnVtOyBpKyspIHtcbiAgICBjb25zdCBjb2wgPSBpICUgY29sc1xuICAgIGNvbnN0IHJvdyA9IE1hdGguZmxvb3IoaSAvIGNvbHMpXG5cbiAgICBjb25zdCB4ID0gY29sICogY2VsbFdcbiAgICBjb25zdCB5ID0gcm93ICogY2VsbEhcbiAgICBjb25zdCB3ID0gY2VsbFcgKiAwLjhcbiAgICBjb25zdCBoID0gY2VsbEggKiAwLjhcblxuICAgIGNvbnN0IG4gPSBjX3JhbmRvbS5ub2lzZTJEKHggKyBmcmFtZSwgeSwgMC4wMDEpIC8vIHZhbHVlcyBvZiB4IGFuZCB5IHRvbyBiaWcgYnkgdGhlbXNlbHZlcywgZ2l2ZSBsb3dlciBmcmVxdWVuY3lcbiAgICBjb25zdCBhbmdsZSA9IG4gKiBNYXRoLlBJICogMC4zIC8vdXNpbmcgdGhpcyBmb3IgdGhlIGFtcGxpdHVkZSB3b3VsZCBtZXNzIHRoZSByZXN1bHRzIG9mIG4gKC0xIHRvIDEgbm93KVxuICAgIC8vdGh1cywgaXQgaXMgbW92ZWQgaW4gdGhlIGFuZ2xlXG4gICAgY29uc3Qgc2NhbGUgPSBjX21hdGgubWFwUmFuZ2UobiwgLTEsIDEsIDAuNSwgY2VsbFcpXG5cbiAgICBjb250ZXh0LnNhdmUoKVxuICAgIGNvbnRleHQudHJhbnNsYXRlKHgsIHkpIC8vY2VsbCBzcGFjZSBiZWdpblxuICAgIGNvbnRleHQudHJhbnNsYXRlKGNlbGxXICogMC41LCBjZWxsSCAqIDAuNSkgLy8gZ28gdG8gdGhlIGNlbnRlciBvZiB0aGUgY2VsbFxuICAgIGNvbnRleHQudHJhbnNsYXRlKG1hcmdpblgsIG1hcmdpblkpIC8vYWRkIGNhbnZhcyBtYXJnaW5cbiAgICBjb250ZXh0LnJvdGF0ZShhbmdsZSkgLy9yb3RhdGUgY29udGV4dCBcImVxdWFsc1wiIHRvIHJvdGF0aW5nIHRoZSBsaW5lc1xuICAgIFxuICAgIGNvbnRleHQubGluZVdpZHRoID0gc2NhbGVcblxuICAgIGNvbnRleHQuYmVnaW5QYXRoKClcbiAgICBjb250ZXh0Lm1vdmVUbyh3ICogLTAuNSwgMClcbiAgICBjb250ZXh0LmxpbmVUbyh3ICogMC41LCAwKVxuICAgIGNvbnRleHQuc3Ryb2tlKClcblxuICAgIGNvbnRleHQucmVzdG9yZSgpICAgIFxuICB9XG4gIHJldHVybiBjYW52YXNcbn1cblxuZXhwb3J0IGRlZmF1bHQgbm9pc2VcbiIsImNvbnN0IGNfcmFuZG9tID0gcmVxdWlyZSgnY2FudmFzLXNrZXRjaC11dGlsL3JhbmRvbScpXG5pbXBvcnQgc2V0Q2FudmFzIGZyb20gJy4uL3NldENhbnZhcydcblxubGV0IFtjYW52YXMsIGNvbnRleHQsIGNhbnZhc1csIGNhbnZhc0hdID0gc2V0Q2FudmFzKClcblxuZnVuY3Rpb24gcG9pcyAoKSB7XG4gIGNsYXNzIFZlY3RvciB7XG4gICAgY29uc3RydWN0b3IoeCwgeSkge1xuICAgICAgdGhpcy54ID0geFxuICAgICAgdGhpcy55ID0geVxuICAgIH1cbiAgfVxuICBcbiAgY2xhc3MgQWdlbnQge1xuICAgIGNvbnN0cnVjdG9yKHgsIHkpIHtcbiAgICAgIHRoaXMucG9zID0gbmV3IFZlY3Rvcih4LCB5KVxuICAgICAgdGhpcy52ZWwgPSBuZXcgVmVjdG9yKGNfcmFuZG9tLnJhbmdlKC0xLCAxKSwgY19yYW5kb20ucmFuZ2UoLTEsIDEpKVxuICAgICAgdGhpcy5yYWRpdXMgPSBjX3JhbmRvbS5yYW5nZSgyLCA4KVxuICAgIH1cblxuICAgIHVwZGF0ZSgpIHtcbiAgICAgIHRoaXMucG9zLnggKz0gdGhpcy52ZWwueFxuICAgICAgdGhpcy5wb3MueSArPSB0aGlzLnZlbC55XG4gICAgfVxuXG4gICAgYm91bmNlKHcsIGgpIHtcbiAgICAgIGlmICh0aGlzLnBvcy54IDw9IDAgfHwgdGhpcy5wb3MueCA+PSB3KSB0aGlzLnZlbC54ICo9IC0xXG4gICAgICBpZiAodGhpcy5wb3MueSA8PSAwIHx8IHRoaXMucG9zLnkgPj0gaCkgdGhpcy52ZWwueSAqPSAtMVxuICAgIH1cblxuICAgIGRyYXcoY29udGV4dCkge1xuICAgICAgY29udGV4dC5zYXZlKClcbiAgICAgIGNvbnRleHQudHJhbnNsYXRlKHRoaXMucG9zLngsIHRoaXMucG9zLnkpXG5cbiAgICAgIGNvbnRleHQuYmVnaW5QYXRoKClcbiAgICAgIGNvbnRleHQuYXJjKDAsIDAsIHRoaXMucmFkaXVzLCAwLCBNYXRoLlBJICogMilcbiAgICAgIGNvbnRleHQuZmlsbCgpXG4gICAgICBjb250ZXh0LnN0cm9rZSgpXG5cbiAgICAgIGNvbnRleHQucmVzdG9yZSgpXG4gICAgfVxuICB9XG4gIFxuICBjb25zdCBhZ2VudHMgPSBbXVxuICBjb250ZXh0LmZpbGxTdHlsZSA9ICd3aGl0ZSdcbiAgY29udGV4dC5saW5lV2lkdGggPSAyXG4gIFxuICBmb3IgKGxldCBpID0gMDsgaSA8IDUwOyBpKyspIHtcbiAgICBjb25zdCB4ID0gY19yYW5kb20ucmFuZ2UoMCwgY2FudmFzVylcbiAgICBjb25zdCB5ID0gY19yYW5kb20ucmFuZ2UoMCwgY2FudmFzSClcbiAgICBhZ2VudHMucHVzaChuZXcgQWdlbnQoeCwgeSkpXG4gIH1cbiAgXG4gIGZ1bmN0aW9uIGFuaW1hdGUgKCkge1xuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZSlcbiAgICBjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCBjYW52YXNXLCBjYW52YXNIKVxuICAgIGFnZW50cy5mb3JFYWNoKHBvaW50ID0+IHtcbiAgICAgIHBvaW50LnVwZGF0ZSgpXG4gICAgICBwb2ludC5ib3VuY2UoY2FudmFzVywgY2FudmFzSClcbiAgICAgIHBvaW50LmRyYXcoY29udGV4dClcbiAgICAgIH1cbiAgICApXG4gIH1cbiAgYW5pbWF0ZSgpXG5cbiAgcmV0dXJuIGNhbnZhc1xufVxuXG5leHBvcnQgZGVmYXVsdCBwb2lzXG4iLCJpbXBvcnQgc2V0Q2FudmFzIGZyb20gJy4uL3NldENhbnZhcydcblxubGV0IFtjYW52YXMsIGNvbnRleHQsIGNhbnZhc1csIGNhbnZhc0hdID0gc2V0Q2FudmFzKClcbiAgICBcbmNvbnN0IHdpZHRoID0gY2FudmFzVyAvIDcuNVxuY29uc3QgaGVpZ2h0ID0gY2FudmFzSCAvIDcuNVxuY29uc3QgYm9yZGVyID0gY2FudmFzVyAvIDcxXG5jb25zdCBnYXAgPSBjYW52YXNXIC8gMTQuMlxuY29uc3Qgb2ZmID0gY2FudmFzVyAvIDQ1XG5jb25zdCBvZmZEID0gb2ZmICogMlxubGV0IHgsIHk7XG5jb250ZXh0LmxpbmVXaWR0aCA9IGJvcmRlclxuXG5mdW5jdGlvbiBzcXVhcmVzICgpIHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCA1OyBpKyspIHtcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IDU7IGorKykge1xuICAgICAgeCA9IGJvcmRlciAqIDIgKyAod2lkdGggKyBnYXApICogaVxuICAgICAgeSA9IGJvcmRlciAqIDIgKyAoaGVpZ2h0ICsgZ2FwKSAqIGpcblxuICAgICAgY29udGV4dC5iZWdpblBhdGgoKVxuICAgICAgY29udGV4dC5yZWN0KHgsIHksIHdpZHRoLCBoZWlnaHQpXG4gICAgICBjb250ZXh0LnN0cm9rZSgpXG5cbiAgICAgIGlmIChNYXRoLnJhbmRvbSgpID4gMC41KSB7XG4gICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKClcbiAgICAgICAgY29udGV4dC5yZWN0KHggK29mZiwgeSArb2ZmLCB3aWR0aCAtb2ZmRCwgaGVpZ2h0IC1vZmZEKVxuICAgICAgICBjb250ZXh0LnN0cm9rZSgpXG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBjYW52YXNcbn1cblxuZXhwb3J0IGRlZmF1bHQgc3F1YXJlc1xuIiwiZnVuY3Rpb24gc2V0Q2FudmFzICgpIHtcbiAgbGV0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXG4gIGxldCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJylcbiAgbGV0IGNhbnZhc1cgPSA1MDBcbiAgbGV0IGNhbnZhc0ggPSA1MDBcbiAgbGV0IHNjcmVlbldpZHRoID0gd2luZG93LnNjcmVlbi53aWR0aFxuICBpZiAoc2NyZWVuV2lkdGggPCA2MDApIHtcbiAgICBjYW52YXNXID0gNDAwXG4gICAgY2FudmFzSCA9IDQwMFxuICB9IGVsc2UgaWYgKHNjcmVlbldpZHRoIDwgNDAwKSB7XG4gICAgY2FudmFzVyA9IDMwMFxuICAgIGNhbnZhc0ggPSAzMDBcbiAgfVxuICBjYW52YXMud2lkdGggPSBjYW52YXNXXG4gIGNhbnZhcy5oZWlnaHQgPSBjYW52YXNIXG5cbiAgcmV0dXJuIFtjYW52YXMsIGNvbnRleHQsIGNhbnZhc1csIGNhbnZhc0hdXG59XG5cbmV4cG9ydCBkZWZhdWx0IHNldENhbnZhc1xuIiwiZnVuY3Rpb24gd3JhcHBlciAocGFyZW50LCBjaGlsZCwgZGVzY3IsIHJlZiwgcHJldkJybykge1xuICBjaGlsZC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnd2hpdGUnXG4gIGNoaWxkLnN0eWxlLmZpbHRlciA9ICdkcm9wLXNoYWRvdygwIDAgMTBweCByZ2IoMjAwLCAyMDAsIDIwMCkpJ1xuICBcbiAgY29uc3QgYm94ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgYm94LmNsYXNzTGlzdC5hZGQoJ2JveCcpXG5cbiAgY29uc3QgZGVzY3JpcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJylcbiAgZGVzY3JpcHRpb24uaW5uZXJIVE1MID0gZGVzY3JcblxuICBpZiAocmVmKSB7IC8vZGVsZXRlIHByZXZpb3VzIGFuaW1hdGVCaXRtYXBcbiAgICBib3guY2xhc3NMaXN0LmFkZChyZWYpXG4gICAgZGVzY3JpcHRpb24uY2xhc3NMaXN0LmFkZChyZWYpXG4gIH1cblxuICBib3guYXBwZW5kQ2hpbGQoY2hpbGQpXG5cbiAgaWYgKHByZXZCcm8gIT09IHVuZGVmaW5lZCkgeyAvL2tlZXAgYW5pbWF0ZUJpdG1hcCBpbiB0aGUgc2FtZSBwbGFjZVxuICAgIGNvbnN0IGJlZm9yZSA9IHBhcmVudC5jaGlsZHJlbltwcmV2QnJvXVxuICAgIGJlZm9yZS5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2FmdGVyZW5kJywgYm94KVxuICAgIGJveC5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2FmdGVyZW5kJywgZGVzY3JpcHRpb24pXG4gICAgcmV0dXJuXG4gIH1cblxuICBwYXJlbnQuYXBwZW5kQ2hpbGQoYm94KVxuICBwYXJlbnQuYXBwZW5kQ2hpbGQoZGVzY3JpcHRpb24pXG59XG5cbmV4cG9ydCBkZWZhdWx0IHdyYXBwZXJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0aWQ6IG1vZHVsZUlkLFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiAobW9kdWxlWydkZWZhdWx0J10pIDpcblx0XHQoKSA9PiAobW9kdWxlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18uZyA9IChmdW5jdGlvbigpIHtcblx0aWYgKHR5cGVvZiBnbG9iYWxUaGlzID09PSAnb2JqZWN0JykgcmV0dXJuIGdsb2JhbFRoaXM7XG5cdHRyeSB7XG5cdFx0cmV0dXJuIHRoaXMgfHwgbmV3IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHJldHVybiB3aW5kb3c7XG5cdH1cbn0pKCk7IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCAnLi9zdHlsZS5jc3MnXG5pbXBvcnQgd3JhcHBlciBmcm9tICcuL3dyYXBwZXInXG5pbXBvcnQgc3F1YXJlcyBmcm9tICcuL2Rlc2lnbnMvc3F1YXJlcydcbmltcG9ydCBjaXJjbGUgZnJvbSAnLi9kZXNpZ25zL2NpcmNsZSdcbmltcG9ydCBwb2lzIGZyb20gJy4vZGVzaWducy9wb2lzJ1xuaW1wb3J0IG5ldHBvaW50cyBmcm9tICcuL2Rlc2lnbnMvbmV0cG9pbnRzJ1xuaW1wb3J0IG5vaXNlIGZyb20gJy4vZGVzaWducy9ub2lzZSdcbmltcG9ydCBiaXRtYXAgZnJvbSAnLi9kZXNpZ25zL2JpdG1hcCdcbmltcG9ydCBnbHlwaCBmcm9tICcuL2Rlc2lnbnMvZ2x5cGgnXG5pbXBvcnQgZ2x5cGhzIGZyb20gJy4vZGVzaWducy9nbHlwaHMnXG5cbi8vIHRpdGxlXG5jb25zdCB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gxJylcbnRpdGxlLmlubmVySFRNTCA9ICdKYXZhc2NyaXB0IGNlcmF0aXZlIGNvZGluZyBleGFtcGxlcydcblxuLy8gZXhlcmNpY2VzXG5sZXQgdGV4dCA9ICcnXG5jb25zdCBzcXVhcmVzRGVzY3IgPSAnR3JpZCBvZiBzcXVhcmVzIHdpdGggcmFuZG9tIHNtYWxsZXIgc3F1YXJlcy4nXG5jb25zdCBjaXJjbGVEZXNjciA9ICdSYW5kb20gYXJjaCBhbmQgZ3JhZHVhdGlvbnMuJ1xuY29uc3QgcG9pc0Rlc2NyID0gJ0JvdW5jaW5nIHBvaXMuJ1xuY29uc3QgbmV0cG9pbnRzRGVzY3IgPSAnQm91bmNpbmcgcG9pcyB3aXRoIGNvbm5lY3RvcnMuJ1xuY29uc3Qgbm9pc2VEZXNjciA9ICdBbmdsZSBhbmQgaGVpZ2h0IG5vaXNlIGFuaW1hdGlvbi4nXG5jb25zdCBiaXRtYXBEZXNjciA9ICdDbGljayBvbiBhIGtleWJvYXJkIGxldHRlciB0byBjaGFuZ2UgYml0bWFwLidcbmNvbnN0IGdseXBoRGVzY3IgPSAnU3RhdGljIGdseXBoIGJyaWdodG5lc3MgbWFwLidcbmNvbnN0IGdseXBoc0Rlc2NyID0gJ1N0YXRpYyBnbHlwaHMgYnJpZ2h0bmVzcyBtYXAuJ1xuXG5jb25zdCBhbmltYXRlQml0bWFwID0gKHApID0+IHtcbiAgY29uc3QgcmVmID0gJ2JpdG1hcCdcbiAgbGV0IHByZXZSZWZzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChgLiR7cmVmfWApXG4gIGlmIChwcmV2UmVmcykge1xuICAgIHByZXZSZWZzLmZvckVhY2gocHJldlJlZiA9PiBwcmV2UmVmLnJlbW92ZSgpKVxuICB9XG4gIHdyYXBwZXIocCwgYml0bWFwKHRleHQpLCBiaXRtYXBEZXNjciwgcmVmLCA5KVxufVxuXG5mdW5jdGlvbiBjb21wb25lbnQgKCkge1xuICBjb25zdCBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gIGVsLnNldEF0dHJpYnV0ZSgnaWQnLCAnY29udGFpbmVyJylcblxuICB3cmFwcGVyKGVsLCBzcXVhcmVzKCksIHNxdWFyZXNEZXNjcilcbiAgd3JhcHBlcihlbCwgY2lyY2xlKCksIGNpcmNsZURlc2NyKVxuICB3cmFwcGVyKGVsLCBwb2lzKCksIHBvaXNEZXNjcilcbiAgd3JhcHBlcihlbCwgbmV0cG9pbnRzKCksIG5ldHBvaW50c0Rlc2NyKVxuICB3cmFwcGVyKGVsLCBub2lzZSgpLCBub2lzZURlc2NyKVxuICBhbmltYXRlQml0bWFwKGVsKVxuICB3cmFwcGVyKGVsLCBnbHlwaCgnQicpLCBnbHlwaERlc2NyKVxuICB3cmFwcGVyKGVsLCBnbHlwaHMoJ0MnKSwgZ2x5cGhzRGVzY3IpXG5cblxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIChlKSA9PiB7XG4gICAgdGV4dCA9IGUua2V5XG4gICAgdGV4dCA9IHRleHQudG9VcHBlckNhc2UoKVxuICAgIGFuaW1hdGVCaXRtYXAoZWwpXG4gIH0pXG4gIFxuICByZXR1cm4gZWw7XG59XG5cbi8vIGNyZWRpdHNcbmNvbnN0IGZvb3RlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG5mb290ZXIuc2V0QXR0cmlidXRlKCdpZCcsICdmb290ZXInKVxuXG5jb25zdCBwcm9maWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpXG5jb25zdCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJ3AtdmFsZScpIC8vIGNhbid0IHVzZSBpbm5lckhUTUwgb3IgdGl0bGUgd2l0aCA8YT5cbnByb2ZpbGUuYXBwZW5kQ2hpbGQobGluaylcbnByb2ZpbGUuaHJlZiA9ICdodHRwczovL2dpdGh1Yi5jb20vcC12YWxlL2JsYWNrLXdoaXRlLWNhbnZhcydcbmNvbnN0IGNyZWRpdHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJylcbmNyZWRpdHMuaW5uZXJIVE1MID0gJ21hZGUgYnkgJ1xuY3JlZGl0cy4gYXBwZW5kQ2hpbGQocHJvZmlsZSlcblxuZm9vdGVyLmFwcGVuZENoaWxkKGNyZWRpdHMpXG5cbi8vIHJlbmRlclxuZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aXRsZSlcbmRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY29tcG9uZW50KCkpXG5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGZvb3RlcilcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==