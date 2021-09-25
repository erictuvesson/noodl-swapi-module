/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@noodl/noodl-sdk/index.js":
/*!************************************************!*\
  !*** ./node_modules/@noodl/noodl-sdk/index.js ***!
  \************************************************/
/***/ ((module) => {

const _colors = {
    "purple":"component",
    "green":"data",
    "default":"default",
    "grey":"default"
}

Noodl.defineNode = function(def) {
    const _def = {};

    _def.name = def.name;
    _def.displayNodeName = def.displayName;
    _def.usePortAsLabel = def.useInputAsLabel;
    _def.color = _colors[def.color || 'default'];
    _def.category = def.category || 'Modules';
    _def.getInspectInfo = def.getInspectInfo;
    _def.docs = def.docs;
    
    _def.initialize = function() {
        this.inputs = {};
        var _outputs = this.outputs = {};
        var _this = this;

        // Function for quickly setting outputs
        this.setOutputs = function(o) {
            for(var key in o) {
                _outputs[key] = o[key];
                _this.flagOutputDirty(key);
            }
        }

        // Sending warnings
        this.clearWarnings = (function() {
            if(this.context.editorConnection && this.nodeScope && this.nodeScope.componentOwner)
                this.context.editorConnection.clearWarnings(this.nodeScope.componentOwner.name, this.id);
        }).bind(this);

        this.sendWarning = (function(name,message) {
            if(this.context.editorConnection && this.nodeScope && this.nodeScope.componentOwner)
                this.context.editorConnection.sendWarning(this.nodeScope.componentOwner.name, this.id, name, {
                    message: message
                });
        }).bind(this);

        if(typeof def.initialize === 'function')
            def.initialize.apply(this);
    }
    _def.inputs = {};
    _def.outputs = {};

    for(var key in def.inputs) {
        _def.inputs[key] = {
            type:(typeof def.inputs[key] === 'object')?def.inputs[key].type:def.inputs[key],
            displayName:(typeof def.inputs[key] === 'object')?def.inputs[key].displayName:undefined,
            group:(typeof def.inputs[key] === 'object')?def.inputs[key].group:undefined,
            default:(typeof def.inputs[key] === 'object')?def.inputs[key].default:undefined,
            set:(function() { const _key = key; return function(value) {
                this.inputs[_key] = value;
                if(def.changed && typeof def.changed[_key] === 'function') {
                    def.changed[_key].apply(this,[value]);
                }
            }})()
        }
    }

    for(var key in def.signals) {
        _def.inputs[key] = {
            type:'signal',
            displayName:(typeof def.signals[key] === 'object')?def.signals[key].displayName:undefined,
            group:(typeof def.signals[key] === 'object')?def.signals[key].group:undefined,
            valueChangedToTrue:(function() { const _key = key; return function() {
                const _fn = (typeof def.signals[_key] === 'object')?def.signals[_key].signal:def.signals[_key]
                if(typeof _fn === 'function') {
                    this.scheduleAfterInputsHaveUpdated(() => {
                        _fn.apply(this);
                    }) 
                }
            }})()
        }
    }

    for(var key in def.outputs) {
        if(def.outputs[key] === 'signal') {
            _def.outputs[key] = {
                type:'signal',
            }
        }
        else {
            _def.outputs[key] = {
                type:(typeof def.outputs[key] === 'object')?def.outputs[key].type:def.outputs[key],
                displayName:(typeof def.outputs[key] === 'object')?def.outputs[key].displayName:undefined,
                group:(typeof def.outputs[key] === 'object')?def.outputs[key].group:undefined,
                getter:(function() { const _key = key; return function() {
                    return this.outputs[_key];
                }})()
            }
        }
    }

    _def.methods = _def.prototypeExtensions = {};
    for(var key in def.methods) {
        _def.prototypeExtensions[key] = def.methods[key];
    }
    if(_def.methods.onNodeDeleted) { // Override the onNodeDeleted if required
        _def.methods._onNodeDeleted = function() {
            this.__proto__.__proto__._onNodeDeleted.call(this);
            _def.methods.onNodeDeleted.value.call(this);
        }
    }

    return {node:_def,setup:def.setup};
}

Noodl.defineCollectionNode = function(def) {
    const _def = {
        name:def.name,
        category:def.category,
        color:'data',
        inputs:def.inputs,
        outputs:Object.assign({
            Items:'array',
            'Fetch Started':'signal',
            'Fetch Completed':'signal'
        },def.outputs||{}),
        signals:Object.assign({
            Fetch:function() {
                var _this = this;
                this.sendSignalOnOutput('Fetch Started');
                var a = def.fetch.call(this,function() {
                    _this.sendSignalOnOutput('Fetch Completed');
                });
                this.setOutputs({
                    Items:a
                })
            }
        },def.signals||{})
    }

    return Noodl.defineNode(_def);
}

Noodl.defineModelNode = function(def) {
    const _def = {
        name:def.name,
        category:def.category,
        color:'data',
        inputs:{
            Id:'string'
        },
        outputs:{
            Fetched:'signal'
        },
        changed:{
            Id:function(value) {
                if(this._object && this._changeListener)
                    this._object.off('change',this._changeListener)
                
                this._object = Noodl.Object.get(value);
                this._changeListener = (name,value) => {
                    const _o = {}
                    _o[name] = value;
                    this.setOutputs(_o)
                }
                this._object.on('change',this._changeListener)

                this.setOutputs(this._object.data);
                this.sendSignalOnOutput('Fetched');
            }
        },
        initialize:function() {

        }
    }

    for(var key in def.properties) {
        _def.inputs[key] = def.properties[key];
        _def.outputs[key] = def.properties[key];
        _def.changed[key] = (function() { const _key = key; return function(value) {
            if(!this._object) return;
            this._object.set(_key,value);
        }})()
    }
 
    return Noodl.defineNode(_def);
}

Noodl.defineReactNode = function(def) {
    var _def = Noodl.defineNode(def);

    _def.node.getReactComponent = def.getReactComponent;
    _def.node.inputProps = def.inputProps;
    _def.node.inputCss = def.inputCss;
    _def.node.outputProps = def.outputProps;
    _def.node.setup = def.setup;
    _def.node.frame = def.frame;

    return _def.node;
}

module.exports = Noodl;

/***/ }),

/***/ "./src/config.ts":
/*!***********************!*\
  !*** ./src/config.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "domain": () => (/* binding */ domain)
/* harmony export */ });
const domain = 'https://swapi.dev';


/***/ }),

/***/ "./src/helper.ts":
/*!***********************!*\
  !*** ./src/helper.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "makeRequest": () => (/* binding */ makeRequest),
/* harmony export */   "capitalize": () => (/* binding */ capitalize)
/* harmony export */ });
function makeRequest(method, url, body = undefined) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve({
                    content: xhr.responseText,
                    json: JSON.parse(xhr.responseText),
                    xhr
                });
            }
            else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send(JSON.stringify(body));
    });
}
function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}


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
/******/ 			// no module.id needed
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
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./helper */ "./src/helper.ts");
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./config */ "./src/config.ts");
/* harmony import */ var _noodl_noodl_sdk__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @noodl/noodl-sdk */ "./node_modules/@noodl/noodl-sdk/index.js");
/* harmony import */ var _noodl_noodl_sdk__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_noodl_noodl_sdk__WEBPACK_IMPORTED_MODULE_2__);



const defaultCategory = 'Star Wars API';
const debugLog = _noodl_noodl_sdk__WEBPACK_IMPORTED_MODULE_2__.defineNode({
    category: 'Debug',
    name: 'Log',
    color: 'purple',
    inputs: {
        Message: {
            group: 'Input',
            type: '*'
        },
    },
    signals: {
        LogMessage: function () {
            const input = this.inputs.Message;
            console.dir(input);
        }
    }
});
const getFilms = _noodl_noodl_sdk__WEBPACK_IMPORTED_MODULE_2__.defineNode({
    category: defaultCategory,
    name: 'Get all films',
    color: 'green',
    inputs: {
        Query: {
            group: 'Query',
            type: 'string'
        },
    },
    outputs: {
        Fetched: {
            group: 'Events',
            type: 'signal'
        },
        Error: {
            group: 'Events',
            type: 'signal'
        },
        Count: {
            group: 'Response',
            type: 'string'
        },
        Next: {
            group: 'Response',
            type: 'number'
        },
        Previous: {
            group: 'Response',
            type: 'number'
        },
        Results: {
            group: 'Response',
            type: 'array'
        }
    },
    signals: {
        Fetch: function () {
            let path = '/api/films';
            let body = null;
            let queryParameters = {};
            (0,_helper__WEBPACK_IMPORTED_MODULE_0__.makeRequest)('GET', _config__WEBPACK_IMPORTED_MODULE_1__.domain + path, body)
                .then(({ json }) => {
                for (const key of Object.keys(json)) {
                    // Capitalize to make it more user friendly
                    const newKey = (0,_helper__WEBPACK_IMPORTED_MODULE_0__.capitalize)(key);
                    // Check if we have something that is not registered
                    // then send a warning
                    if (!this.hasOutput(newKey)) {
                        this.sendWarning('swapi-warning', `Output pin is missing '${newKey}'`);
                    }
                    // Update the output pin
                    // @ts-ignore - bad solution, but nothing we should worry about
                    const newOutput = json[key];
                    if (Array.isArray(newOutput)) {
                        this.outputs[newKey] = _noodl_noodl_sdk__WEBPACK_IMPORTED_MODULE_2__.Array.create(newOutput);
                    }
                    else if (typeof newOutput === 'object') {
                        this.outputs[newKey] = _noodl_noodl_sdk__WEBPACK_IMPORTED_MODULE_2__.Object.create(newOutput);
                    }
                    else {
                        this.outputs[newKey] = newOutput;
                    }
                    // Flag that the output have been changed
                    this.flagOutputDirty(newKey);
                }
                // Send the signal that we just recieved a response
                this.sendSignalOnOutput('Fetched');
            })
                .catch(({ status, statusText }) => {
                // Send a warning and a signal that we got a http error
                this.sendWarning('swapi-error', `Http Error (${status}): ${statusText}`);
                this.sendSignalOnOutput('Error');
            });
        }
    }
});
_noodl_noodl_sdk__WEBPACK_IMPORTED_MODULE_2__.defineModule({
    nodes: [
        debugLog,
        getFilms,
    ],
    setup: function () {
        // this is called once on startup
    }
});

})();

/******/ })()
;
//# sourceMappingURL=index.js.map