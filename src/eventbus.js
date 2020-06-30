"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrossOriginEventBus = void 0;
var idSeq = 0;
function nextId() {
    return idSeq++;
}
// padding with 0
function p(n, size) {
    if (size === void 0) { size = 2; }
    return (n / Math.pow(10, size)).toFixed(10).substring(2, 2 + size);
}
/**
 * Simple UUID
 */
function UUID(contextId) {
    var id = 'Cn-xxxx-MMddhhmmss';
    id = id.replace('n', p(contextId, 4));
    var now = new Date();
    id = id.replace('MM', p(now.getMonth()));
    id = id.replace('dd', p(now.getDate()));
    id = id.replace('hh', p(now.getHours()));
    id = id.replace('mm', p(now.getMinutes()));
    id = id.replace('ss', p(now.getSeconds()));
    // 4 random ch
    var length = Math.pow(26, 4);
    var randOffset = Math.floor(Math.random() * length);
    var text = '';
    while (randOffset > 0) {
        var alpha = randOffset % 26;
        text += String.fromCharCode(65 + alpha);
        randOffset = Math.floor(randOffset / 26);
    }
    id = id.replace('xxxx', text);
    return id;
}
var OutPort = /** @class */ (function () {
    function OutPort(outPort, callback) {
        this.outPort = outPort;
        this.outPort.onmessage = callback;
    }
    OutPort.prototype.send = function (msg) {
        this.outPort.postMessage(msg);
    };
    return OutPort;
}());
var EventBusController = /** @class */ (function () {
    function EventBusController() {
        this.outPorts = [];
        this.addChild(window);
    }
    EventBusController.prototype.addChild = function (context) {
        this.initChildContext(context);
    };
    EventBusController.prototype.broadcast = function (msg) {
        for (var _i = 0, _a = this.outPorts; _i < _a.length; _i++) {
            var out = _a[_i];
            out.send(msg);
        }
    };
    EventBusController.prototype.initChildContext = function (context) {
        var _this = this;
        var channel = new MessageChannel();
        if (context === window) {
            context.postMessage({ type: 'init', id: nextId() }, '*', [channel.port2]);
            this.outPorts.push(new OutPort(channel.port1, this.onControllerEvent.bind(this)));
        }
        else {
            context.addEventListener("load", function () {
                context.contentWindow.postMessage({ type: 'init', id: nextId() }, '*', [channel.port2]);
                _this.outPorts.push(new OutPort(channel.port1, _this.onControllerEvent.bind(_this)));
            });
        }
    };
    EventBusController.prototype.onControllerEvent = function (e) {
        var data = e.data;
        if (data.type == 'ready') {
            console.log('ready');
        }
        else {
            this.broadcast(data);
        }
    };
    return EventBusController;
}());
var CrossOriginEventBus = /** @class */ (function () {
    function CrossOriginEventBus(_a) {
        var _this = this;
        var _b = _a === void 0 ? {} : _a, callback = _b.callback, name = _b.name;
        this.handshake = function (e) {
            var _a = e.data, type = _a.type, id = _a.id;
            if (type === 'init') {
                _this.id = id;
                _this.outPort = new OutPort(e.ports[0], _this.onMessage.bind(_this));
                _this.outPort.send({
                    type: 'ready',
                    id: id,
                });
                window.removeEventListener('message', _this.handshake);
                _this.state = 'ready';
                _this.clearBuffers();
            }
        };
        if (this.isParent) {
            this._controller = new EventBusController();
        }
        this.callback = callback;
        this.name = name;
        this.subscriptions = new Map();
        this.tasks = new Map();
        this.services = new Map();
        this.pendingTasks = [];
        this.state = 'uninitialized';
        window.addEventListener('message', this.handshake);
    }
    Object.defineProperty(CrossOriginEventBus.prototype, "isParent", {
        get: function () {
            return window.parent === window;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CrossOriginEventBus.prototype, "isReady", {
        get: function () {
            return this.state === 'ready';
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CrossOriginEventBus.prototype, "controller", {
        get: function () {
            if (this.isParent) {
                return this._controller;
            }
            else {
                throw "Controller only exists in the parent window";
            }
        },
        enumerable: false,
        configurable: true
    });
    CrossOriginEventBus.prototype.clearBuffers = function () {
        while (this.pendingTasks.length) {
            this.pendingTasks.pop()();
        }
    };
    CrossOriginEventBus.prototype.onMessage = function (e) {
        var type = e.data.type;
        switch (type) {
            case 'response': {
                var _a = e.data, uuid = _a.uuid, response = _a.response;
                if (this.tasks.has(uuid)) {
                    this.tasks.get(uuid)[0](response);
                    this.tasks.delete(uuid);
                }
                break;
            }
            case 'request': {
                var _b = e.data, key = _b.key, uuid = _b.uuid, payload = _b.payload;
                if (this.services.has(key)) {
                    var serviceFn = this.services.get(key);
                    var doRespondFail = this.doRespond.bind(this, uuid, false);
                    serviceFn(payload)
                        .then(this.doRespond.bind(this, uuid, true), doRespondFail)
                        .catch(doRespondFail);
                }
                break;
            }
        }
        if (this.subscriptions.has(type)) {
            this.subscriptions.get(type).forEach(function (cb) { return cb(e); });
        }
        this.callback && this.callback(e);
    };
    CrossOriginEventBus.prototype.doRespond = function (uuid, success, response) {
        this.send({
            type: 'response',
            uuid: uuid,
            response: response,
            success: success
        });
    };
    CrossOriginEventBus.prototype.send = function (msg) {
        var _this = this;
        var req;
        (function () { return _this.outPort.send(msg); });
        if (this.isReady) {
            req();
        }
        else {
            this.pendingTasks.push(req.bind(this));
        }
    };
    CrossOriginEventBus.prototype.request = function (key, args) {
        var _this = this;
        var uuid = UUID(this.id);
        var req = function () {
            _this.send({
                type: 'request',
                key: key,
                uuid: uuid,
                payload: args
            });
        };
        if (this.isReady) {
            req();
        }
        else {
            this.pendingTasks.push(req.bind(this));
        }
        return new Promise(function (resolve, reject) {
            _this.tasks.set(uuid, [resolve]);
        });
    };
    CrossOriginEventBus.prototype.registerService = function (key, responder) {
        this.services.set(key, responder);
    };
    CrossOriginEventBus.prototype.unregisterService = function (key) {
        this.services.delete(key);
    };
    CrossOriginEventBus.prototype.subscribe = function (evName, cb) {
        if (!this.subscriptions.has(evName)) {
            this.subscriptions.set(evName, []);
        }
        this.subscriptions.get(evName).push(cb);
    };
    CrossOriginEventBus.prototype.unsubscribe = function (evName, cb) {
        if (!this.subscriptions.has(evName)) {
            return false;
        }
        var idx = this.subscriptions.get(evName).indexOf(cb);
        if (idx >= 0) {
            this.subscriptions.get(evName).splice(idx, 1);
        }
    };
    return CrossOriginEventBus;
}());
exports.CrossOriginEventBus = CrossOriginEventBus;
