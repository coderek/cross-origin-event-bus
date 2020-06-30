(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/eventbus.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/eventbus.ts":
/*!*************************!*\
  !*** ./src/eventbus.ts ***!
  \*************************/
/*! exports provided: CrossOriginEventBus */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"CrossOriginEventBus\", function() { return CrossOriginEventBus; });\nvar idSeq = 0;\nfunction nextId() {\n    return idSeq++;\n}\n// padding with 0\nfunction p(n, size) {\n    if (size === void 0) { size = 2; }\n    return (n / Math.pow(10, size)).toFixed(10).substring(2, 2 + size);\n}\n/**\n * Simple UUID\n */\nfunction UUID(contextId) {\n    var id = 'Cn-xxxx-MMddhhmmss';\n    id = id.replace('n', p(contextId, 4));\n    var now = new Date();\n    id = id.replace('MM', p(now.getMonth()));\n    id = id.replace('dd', p(now.getDate()));\n    id = id.replace('hh', p(now.getHours()));\n    id = id.replace('mm', p(now.getMinutes()));\n    id = id.replace('ss', p(now.getSeconds()));\n    // 4 random ch\n    var length = Math.pow(26, 4);\n    var randOffset = Math.floor(Math.random() * length);\n    var text = '';\n    while (randOffset > 0) {\n        var alpha = randOffset % 26;\n        text += String.fromCharCode(65 + alpha);\n        randOffset = Math.floor(randOffset / 26);\n    }\n    id = id.replace('xxxx', text);\n    return id;\n}\nvar OutPort = /** @class */ (function () {\n    function OutPort(outPort, callback) {\n        this.outPort = outPort;\n        this.outPort.onmessage = callback;\n    }\n    OutPort.prototype.send = function (msg) {\n        this.outPort.postMessage(msg);\n    };\n    return OutPort;\n}());\nvar EventBusController = /** @class */ (function () {\n    function EventBusController() {\n        this.outPorts = [];\n        this.addChild(window);\n    }\n    EventBusController.prototype.addChild = function (context) {\n        this.initChildContext(context);\n    };\n    EventBusController.prototype.broadcast = function (msg) {\n        for (var _i = 0, _a = this.outPorts; _i < _a.length; _i++) {\n            var out = _a[_i];\n            out.send(msg);\n        }\n    };\n    EventBusController.prototype.initChildContext = function (context) {\n        var _this = this;\n        var channel = new MessageChannel();\n        if (context === window) {\n            context.postMessage({ type: 'init', id: nextId() }, '*', [channel.port2]);\n            this.outPorts.push(new OutPort(channel.port1, this.onControllerEvent.bind(this)));\n        }\n        else {\n            context.addEventListener(\"load\", function () {\n                context.contentWindow.postMessage({ type: 'init', id: nextId() }, '*', [channel.port2]);\n                _this.outPorts.push(new OutPort(channel.port1, _this.onControllerEvent.bind(_this)));\n            });\n        }\n    };\n    EventBusController.prototype.onControllerEvent = function (e) {\n        var data = e.data;\n        if (data.type == 'ready') {\n            console.log('ready');\n        }\n        else {\n            this.broadcast(data);\n        }\n    };\n    return EventBusController;\n}());\nvar CrossOriginEventBus = /** @class */ (function () {\n    function CrossOriginEventBus(_a) {\n        var _this = this;\n        var _b = _a === void 0 ? {} : _a, callback = _b.callback, name = _b.name;\n        this.handshake = function (e) {\n            var _a = e.data, type = _a.type, id = _a.id;\n            if (type === 'init') {\n                _this.id = id;\n                _this.outPort = new OutPort(e.ports[0], _this.onMessage.bind(_this));\n                _this.outPort.send({\n                    type: 'ready',\n                    id: id,\n                });\n                window.removeEventListener('message', _this.handshake);\n                _this.state = 'ready';\n                _this.clearBuffers();\n            }\n        };\n        if (this.isParent) {\n            this._controller = new EventBusController();\n        }\n        this.callback = callback;\n        this.name = name;\n        this.subscriptions = new Map();\n        this.tasks = new Map();\n        this.services = new Map();\n        this.pendingTasks = [];\n        this.state = 'uninitialized';\n        window.addEventListener('message', this.handshake);\n    }\n    Object.defineProperty(CrossOriginEventBus.prototype, \"isParent\", {\n        get: function () {\n            return window.parent === window;\n        },\n        enumerable: false,\n        configurable: true\n    });\n    Object.defineProperty(CrossOriginEventBus.prototype, \"isReady\", {\n        get: function () {\n            return this.state === 'ready';\n        },\n        enumerable: false,\n        configurable: true\n    });\n    Object.defineProperty(CrossOriginEventBus.prototype, \"controller\", {\n        get: function () {\n            if (this.isParent) {\n                return this._controller;\n            }\n            else {\n                throw \"Controller only exists in the parent window\";\n            }\n        },\n        enumerable: false,\n        configurable: true\n    });\n    CrossOriginEventBus.prototype.clearBuffers = function () {\n        while (this.pendingTasks.length) {\n            this.pendingTasks.pop()();\n        }\n    };\n    CrossOriginEventBus.prototype.onMessage = function (e) {\n        var type = e.data.type;\n        switch (type) {\n            case 'response': {\n                var _a = e.data, uuid = _a.uuid, response = _a.response;\n                if (this.tasks.has(uuid)) {\n                    this.tasks.get(uuid)[0](response);\n                    this.tasks.delete(uuid);\n                }\n                break;\n            }\n            case 'request': {\n                var _b = e.data, key = _b.key, uuid = _b.uuid, payload = _b.payload;\n                if (this.services.has(key)) {\n                    var serviceFn = this.services.get(key);\n                    var doRespondFail = this.doRespond.bind(this, uuid, false);\n                    serviceFn(payload)\n                        .then(this.doRespond.bind(this, uuid, true), doRespondFail)\n                        .catch(doRespondFail);\n                }\n                break;\n            }\n        }\n        if (this.subscriptions.has(type)) {\n            this.subscriptions.get(type).forEach(function (cb) { return cb(e); });\n        }\n        this.callback && this.callback(e);\n    };\n    CrossOriginEventBus.prototype.doRespond = function (uuid, success, response) {\n        this.send({\n            type: 'response',\n            uuid: uuid,\n            response: response,\n            success: success\n        });\n    };\n    CrossOriginEventBus.prototype.send = function (msg) {\n        var _this = this;\n        var req = function () { return _this.outPort.send(msg); };\n        if (this.isReady) {\n            req();\n        }\n        else {\n            this.pendingTasks.push(req.bind(this));\n        }\n    };\n    CrossOriginEventBus.prototype.request = function (key, args) {\n        var _this = this;\n        var uuid = UUID(this.id);\n        var req = function () {\n            _this.send({\n                type: 'request',\n                key: key,\n                uuid: uuid,\n                payload: args\n            });\n        };\n        if (this.isReady) {\n            req();\n        }\n        else {\n            this.pendingTasks.push(req.bind(this));\n        }\n        return new Promise(function (resolve, reject) {\n            _this.tasks.set(uuid, [resolve]);\n        });\n    };\n    CrossOriginEventBus.prototype.registerService = function (key, responder) {\n        this.services.set(key, responder);\n    };\n    CrossOriginEventBus.prototype.unregisterService = function (key) {\n        this.services.delete(key);\n    };\n    CrossOriginEventBus.prototype.subscribe = function (evName, cb) {\n        if (!this.subscriptions.has(evName)) {\n            this.subscriptions.set(evName, []);\n        }\n        this.subscriptions.get(evName).push(cb);\n    };\n    CrossOriginEventBus.prototype.unsubscribe = function (evName, cb) {\n        if (!this.subscriptions.has(evName)) {\n            return false;\n        }\n        var idx = this.subscriptions.get(evName).indexOf(cb);\n        if (idx >= 0) {\n            this.subscriptions.get(evName).splice(idx, 1);\n        }\n    };\n    return CrossOriginEventBus;\n}());\n\n\n\n//# sourceURL=webpack:///./src/eventbus.ts?");

/***/ })

/******/ });
});