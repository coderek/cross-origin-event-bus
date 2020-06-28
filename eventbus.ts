let idSeq = 0

function nextId() {
  return idSeq ++
}

class OutPort {
  outPort

  constructor(outPort, callback) {
    this.outPort = outPort
    this.outPort.onmessage = callback
  }

  send(msg) {
    this.outPort.postMessage(msg)
  }
}

class EventBusController {
  private outPorts: OutPort[]

  constructor() {
    this.outPorts = []
    this.addChild(window)
  }

  addChild(context) {
    this.initChildContext(context)
  }

  private broadcast(msg) {  
    for (const out of this.outPorts) {
      out.send(msg)
    }
  } 

  private initChildContext(context) {
    const channel = new MessageChannel()
    if (context === window) {
      context.postMessage({ type: 'init', id: nextId() }, '*', [channel.port2]);
      this.outPorts.push(new OutPort(channel.port1, this.onControllerEvent.bind(this)))
    } else {
      context.addEventListener("load", () => {
        context.contentWindow.postMessage({ type: 'init', id: nextId() }, '*', [channel.port2]);
        this.outPorts.push(new OutPort(channel.port1, this.onControllerEvent.bind(this)))
      })
    }
  }

  private onControllerEvent(e) {
    const { data } = e
    if (data.type == 'ready') {
      console.log('ready')
    } else {
      this.broadcast(data)
    }
  }
}

type ICallback = (any) => void
type IResponder = (...any) => Promise<any>

interface IEventBus  {
  handshake: (MessageEvent) => void
  send: (any) => void
  request: (key: string, args?: any[]) => Promise<any>
  register: (key: string, IResponder) => void
  subscribe: (evName: string, ICallback) => void
  unsubscribe: (evName: string, ICallback) => void
}

interface IOption {
  callback?: ICallback
  name?: string
}

export class EventBus implements IEventBus {

  private id: number
  private callback?: (any) => void
  private outPort: OutPort
  private controller?: EventBusController
  private name: string
  private subscriptions: Map<string, ICallback[]>

  constructor({callback, name}: IOption = {} ) {
    if (this.isParent) {
      this.controller = new EventBusController()
    }
    this.callback = callback
    this.name = name
    this.subscriptions = new Map()
    window.addEventListener('message', this.handshake)
  }

  private get isParent () {
    return window.parent === window
  }

  handshake = (e) => {
    const { type, id } = e.data
    if (type === 'init') {
      this.id = id
      this.outPort = new OutPort(e.ports[0], this.onMessage.bind(this))
      this.outPort.send({
        type: 'ready',
        id,
      })
      window.removeEventListener('message', this.handshake)
    }
  }

  private onMessage(e) {
    const { type } = e.data
    if (this.subscriptions.has(type)) {
      this.subscriptions.get(type).forEach(cb => cb(e))
    }
    this.callback && this.callback(e)
  }

  send(msg) {
    this.outPort.send(msg)
  }

  request(key) {
    return Promise.resolve(true)
  }

  register(key, responder) {
  }

  subscribe(evName, cb) {
    if (!this.subscriptions.has(evName)) { 
      this.subscriptions.set(evName, [])
    }
    this.subscriptions.get(evName).push(cb)
  }

  unsubscribe(evName, cb) {
    if (!this.subscriptions.has(evName)) { 
      return false
    }
    const idx = this.subscriptions.get(evName).indexOf(cb)
    if (idx >= 0) {
      this.subscriptions.get(evName).splice(idx, 1)
    }
  }
}
