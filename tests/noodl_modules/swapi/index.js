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
function makeRequest(method, url, queryParameters = undefined, body = undefined) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        let finalUrl = url;
        if (queryParameters) {
            const urlParams = new URLSearchParams(queryParameters).toString();
            if (urlParams.length > 0) {
                finalUrl += "?" + urlParams;
            }
        }
        xhr.open(method, finalUrl);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve({
                    content: xhr.responseText,
                    json: updateResponse(JSON.parse(xhr.responseText)),
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
function extractNumber(value) {
    return Number(value.match(/\d+/g).join(''));
}
/**
 * This is a very very bad function,
 * but since everything is generated this was
 * a quick solution to get it working.
 *
 * @param json
 */
function updateResponse(json) {
    json = updatePartialResponse(json);
    if (json.results) {
        // @ts-ignore
        json.results = json.results.map(x => updatePartialResponse(x));
    }
    return json;
}
function updatePartialResponse(value) {
    if (value.url) {
        value.id = extractNumber(value.url);
    }
    // homeworld
    if (Array.isArray(value.characters) && value.characters.length > 0) {
        value.characters = value.characters.map(extractNumber);
    }
    if (Array.isArray(value.planets) && value.planets.length > 0) {
        value.planets = value.planets.map(extractNumber);
    }
    if (Array.isArray(value.species) && value.species.length > 0) {
        value.species = value.species.map(extractNumber);
    }
    if (Array.isArray(value.vehicles) && value.vehicles.length > 0) {
        value.vehicles = value.vehicles.map(extractNumber);
    }
    if (Array.isArray(value.starships) && value.starships.length > 0) {
        value.starships = value.starships.map(extractNumber);
    }
    if (Array.isArray(value.people) && value.people.length > 0) {
        value.people = value.people.map(extractNumber);
    }
    if (Array.isArray(value.residents) && value.residents.length > 0) {
        value.residents = value.residents.map(extractNumber);
    }
    if (Array.isArray(value.pilots) && value.pilots.length > 0) {
        value.pilots = value.pilots.map(extractNumber);
    }
    if (Array.isArray(value.films) && value.films.length > 0) {
        value.films = value.films.map(extractNumber);
    }
    return value;
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
    category: 'Star Wars API',
    name: 'Get all films',
    color: 'green',
    initialize: function () {
        this.result = _noodl_noodl_sdk__WEBPACK_IMPORTED_MODULE_2__.Object.create(null);
    },
    inputs: {
        Search: {
            group: 'Query',
            type: 'string'
        },
    },
    outputs: {
        /**
         *
         **/
        Fetched: {
            group: 'Events',
            type: 'signal'
        },
        /**
         *
         **/
        Error: {
            group: 'Events',
            type: 'signal'
        },
        /**
         *
         *
         * name: count
         * type: integer
         **/
        Count: {
            group: 'Response',
            type: 'number'
        },
        /**
         *
         *
         * name: next
         * type: integer
         **/
        Next: {
            group: 'Response',
            type: 'number'
        },
        /**
         *
         *
         * name: previous
         * type: integer
         **/
        Previous: {
            group: 'Response',
            type: 'number'
        },
        /**
         *
         *
         * name: results
         * type: array
         **/
        Results: {
            group: 'Response',
            type: 'array'
        },
    },
    signals: {
        Fetch: function () {
            let path = '/api/films';
            let body = null;
            let queryParameters = {};
            if (this.inputs['Search']) {
                queryParameters['search'] = this.inputs['Search'];
            }
            (0,_helper__WEBPACK_IMPORTED_MODULE_0__.makeRequest)('GET', _config__WEBPACK_IMPORTED_MODULE_1__.domain + path, queryParameters, body)
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
    },
    methods: {
        getResult() {
            return this.result;
        }
    }
});
const getFilm = _noodl_noodl_sdk__WEBPACK_IMPORTED_MODULE_2__.defineNode({
    category: 'Star Wars API',
    name: 'Get film by id',
    color: 'green',
    initialize: function () {
        this.result = _noodl_noodl_sdk__WEBPACK_IMPORTED_MODULE_2__.Object.create(null);
    },
    inputs: {
        Id: {
            group: 'Query',
            type: 'string'
        },
    },
    outputs: {
        /**
         *
         **/
        Fetched: {
            group: 'Events',
            type: 'signal'
        },
        /**
         *
         **/
        Error: {
            group: 'Events',
            type: 'signal'
        },
        /**
         * The title of this film
         *
         * name: title
         * type: string
         **/
        Title: {
            group: 'Response',
            type: 'string'
        },
        /**
         * The episode number of this film.
         *
         * name: episode_id
         * type: integer
         **/
        Episode_id: {
            group: 'Response',
            type: 'number'
        },
        /**
         * The opening paragraphs at the beginning of this film.
         *
         * name: opening_crawl
         * type: string
         **/
        Opening_crawl: {
            group: 'Response',
            type: 'string'
        },
        /**
         * The name of the director of this film.
         *
         * name: director
         * type: string
         **/
        Director: {
            group: 'Response',
            type: 'string'
        },
        /**
         * The name(s) of the producer(s) of this film. Comma separated.
         *
         * name: producer
         * type: string
         **/
        Producer: {
            group: 'Response',
            type: 'string'
        },
        /**
         * The ISO 8601 date format of film release at original creator country.
         *
         * name: release_date
         * type: string
         **/
        Release_date: {
            group: 'Response',
            type: 'string'
        },
        /**
         * An array of species resource URLs that are in this film.
         *
         * name: species
         * type: array
         **/
        Species: {
            group: 'Response',
            type: 'array'
        },
        /**
         * An array of starship resource URLs that are in this film.
         *
         * name: starships
         * type: array
         **/
        Starships: {
            group: 'Response',
            type: 'array'
        },
        /**
         * An array of vehicle resource URLs that are in this film.
         *
         * name: vehicles
         * type: array
         **/
        Vehicles: {
            group: 'Response',
            type: 'array'
        },
        /**
         * An array of people resource URLs that are in this film.
         *
         * name: characters
         * type: array
         **/
        Characters: {
            group: 'Response',
            type: 'array'
        },
        /**
         * An array of planet resource URLs that are in this film.
         *
         * name: planets
         * type: array
         **/
        Planets: {
            group: 'Response',
            type: 'array'
        },
        /**
         * the hypermedia URL of this resource.
         *
         * name: url
         * type: string
         **/
        Url: {
            group: 'Response',
            type: 'string'
        },
        /**
         * Extracted from url.
         *
         * name: id
         * type: number
         **/
        Id: {
            group: 'Response',
            type: 'number'
        },
        /**
         * the ISO 8601 date format of the time that this resource was created.
         *
         * name: created
         * type: string
         **/
        Created: {
            group: 'Response',
            type: 'string'
        },
        /**
         * the ISO 8601 date format of the time that this resource was edited.
         *
         * name: edited
         * type: string
         **/
        Edited: {
            group: 'Response',
            type: 'string'
        },
    },
    signals: {
        Fetch: function () {
            let path = '/api/films/{id}';
            let body = null;
            let queryParameters = {};
            path = path.replace('{id}', `${encodeURIComponent(this.inputs['Id']).toString()}`);
            (0,_helper__WEBPACK_IMPORTED_MODULE_0__.makeRequest)('GET', _config__WEBPACK_IMPORTED_MODULE_1__.domain + path, queryParameters, body)
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
    },
    methods: {
        getResult() {
            return this.result;
        }
    }
});
const getPeople = _noodl_noodl_sdk__WEBPACK_IMPORTED_MODULE_2__.defineNode({
    category: 'Star Wars API',
    name: 'Get all people',
    color: 'green',
    initialize: function () {
        this.result = _noodl_noodl_sdk__WEBPACK_IMPORTED_MODULE_2__.Object.create(null);
    },
    inputs: {},
    outputs: {
        /**
         *
         **/
        Fetched: {
            group: 'Events',
            type: 'signal'
        },
        /**
         *
         **/
        Error: {
            group: 'Events',
            type: 'signal'
        },
        /**
         *
         *
         * name: count
         * type: integer
         **/
        Count: {
            group: 'Response',
            type: 'number'
        },
        /**
         *
         *
         * name: next
         * type: integer
         **/
        Next: {
            group: 'Response',
            type: 'number'
        },
        /**
         *
         *
         * name: previous
         * type: integer
         **/
        Previous: {
            group: 'Response',
            type: 'number'
        },
        /**
         *
         *
         * name: results
         * type: array
         **/
        Results: {
            group: 'Response',
            type: 'array'
        },
    },
    signals: {
        Fetch: function () {
            let path = '/api/people';
            let body = null;
            let queryParameters = {};
            (0,_helper__WEBPACK_IMPORTED_MODULE_0__.makeRequest)('GET', _config__WEBPACK_IMPORTED_MODULE_1__.domain + path, queryParameters, body)
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
    },
    methods: {
        getResult() {
            return this.result;
        }
    }
});
const getPerson = _noodl_noodl_sdk__WEBPACK_IMPORTED_MODULE_2__.defineNode({
    category: 'Star Wars API',
    name: 'Get person by id',
    color: 'green',
    initialize: function () {
        this.result = _noodl_noodl_sdk__WEBPACK_IMPORTED_MODULE_2__.Object.create(null);
    },
    inputs: {
        Id: {
            group: 'Query',
            type: 'string'
        },
    },
    outputs: {
        /**
         *
         **/
        Fetched: {
            group: 'Events',
            type: 'signal'
        },
        /**
         *
         **/
        Error: {
            group: 'Events',
            type: 'signal'
        },
        /**
         * Unique identifier representing a specific person for a given character persona.
         *
         * name: id
         * type: number
         **/
        Id: {
            group: 'Response',
            type: 'number'
        },
        /**
         * Display name of person.
         *
         * name: name
         * type: string
         **/
        Name: {
            group: 'Response',
            type: 'string'
        },
        /**
         * Indetifier of the planet the person is from.
         *
         * name: homeWorldId
         * type: integer
         **/
        HomeWorldId: {
            group: 'Response',
            type: 'number'
        },
        /**
         * Which side or team the person has an allegiance.
         *
         * name: allegiance
         * type: string
         **/
        Allegiance: {
            group: 'Response',
            type: 'string'
        },
    },
    signals: {
        Fetch: function () {
            let path = '/api/people/{id}';
            let body = null;
            let queryParameters = {};
            path = path.replace('{id}', `${encodeURIComponent(this.inputs['Id']).toString()}`);
            (0,_helper__WEBPACK_IMPORTED_MODULE_0__.makeRequest)('GET', _config__WEBPACK_IMPORTED_MODULE_1__.domain + path, queryParameters, body)
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
    },
    methods: {
        getResult() {
            return this.result;
        }
    }
});
const getPlanets = _noodl_noodl_sdk__WEBPACK_IMPORTED_MODULE_2__.defineNode({
    category: 'Star Wars API',
    name: 'Get all planets',
    color: 'green',
    initialize: function () {
        this.result = _noodl_noodl_sdk__WEBPACK_IMPORTED_MODULE_2__.Object.create(null);
    },
    inputs: {},
    outputs: {
        /**
         *
         **/
        Fetched: {
            group: 'Events',
            type: 'signal'
        },
        /**
         *
         **/
        Error: {
            group: 'Events',
            type: 'signal'
        },
        /**
         *
         *
         * name: count
         * type: integer
         **/
        Count: {
            group: 'Response',
            type: 'number'
        },
        /**
         *
         *
         * name: next
         * type: integer
         **/
        Next: {
            group: 'Response',
            type: 'number'
        },
        /**
         *
         *
         * name: previous
         * type: integer
         **/
        Previous: {
            group: 'Response',
            type: 'number'
        },
        /**
         *
         *
         * name: results
         * type: array
         **/
        Results: {
            group: 'Response',
            type: 'array'
        },
    },
    signals: {
        Fetch: function () {
            let path = '/api/planets';
            let body = null;
            let queryParameters = {};
            (0,_helper__WEBPACK_IMPORTED_MODULE_0__.makeRequest)('GET', _config__WEBPACK_IMPORTED_MODULE_1__.domain + path, queryParameters, body)
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
    },
    methods: {
        getResult() {
            return this.result;
        }
    }
});
const getPlanet = _noodl_noodl_sdk__WEBPACK_IMPORTED_MODULE_2__.defineNode({
    category: 'Star Wars API',
    name: 'Get planet by id',
    color: 'green',
    initialize: function () {
        this.result = _noodl_noodl_sdk__WEBPACK_IMPORTED_MODULE_2__.Object.create(null);
    },
    inputs: {
        Id: {
            group: 'Query',
            type: 'string'
        },
    },
    outputs: {
        /**
         *
         **/
        Fetched: {
            group: 'Events',
            type: 'signal'
        },
        /**
         *
         **/
        Error: {
            group: 'Events',
            type: 'signal'
        },
        /**
         * Unique identifier representing a specific planet.
         *
         * name: id
         * type: integer
         **/
        Id: {
            group: 'Response',
            type: 'number'
        },
        /**
         * Display name of planet.
         *
         * name: name
         * type: string
         **/
        Name: {
            group: 'Response',
            type: 'string'
        },
    },
    signals: {
        Fetch: function () {
            let path = '/api/planets/{id}';
            let body = null;
            let queryParameters = {};
            path = path.replace('{id}', `${encodeURIComponent(this.inputs['Id']).toString()}`);
            (0,_helper__WEBPACK_IMPORTED_MODULE_0__.makeRequest)('GET', _config__WEBPACK_IMPORTED_MODULE_1__.domain + path, queryParameters, body)
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
    },
    methods: {
        getResult() {
            return this.result;
        }
    }
});
_noodl_noodl_sdk__WEBPACK_IMPORTED_MODULE_2__.defineModule({
    nodes: [
        debugLog,
        getFilms,
        getFilm,
        getPeople,
        getPerson,
        getPlanets,
        getPlanet,
    ],
    setup() {
        // this is called once on startup
    }
});

})();

/******/ })()
;
//# sourceMappingURL=index.js.map