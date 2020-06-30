let idSeq = 0

function nextId() {
  return idSeq ++
}

// padding with 0
function p(n: number, size=2) {
  return (n/Math.pow(10, size)).toFixed(10).substring(2, 2+size)
}

/**
 * Simple UUID
 */
function UUID(contextId: number) {
  let id = 'Cn-xxxx-MMddhhmmss'
  id = id.replace('n', p(contextId, 4))

  const now = new Date()
  id = id.replace('MM', p(now.getMonth()))
  id = id.replace('dd', p(now.getDate()))
  id = id.replace('hh', p(now.getHours()))
  id = id.replace('mm', p(now.getMinutes()))
  id = id.replace('ss', p(now.getSeconds()))

  // 4 random ch
  const length = Math.pow(26, 4)
  let randOffset = Math.floor(Math.random() * length)
  let text = ''
  while (randOffset > 0) {
    const alpha = randOffset % 26
    text += String.fromCharCode(65 + alpha)
    randOffset = Math.floor(randOffset / 26)
  }
  id = id.replace('xxxx', text)
  return id
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
  request: (key: string, args: any) => Promise<any>
  registerService: (key: string, IResponder) => void
  unregisterService: (key: string) => void
  subscribe: (evName: string, ICallback) => void
  unsubscribe: (evName: string, ICallback) => void
}

interface IOption {
  callback?: ICallback
  name?: string
}

type IServiceFn = (any) => Promise<any>
type IRequestFn = (string, any) => Promise<any>

export class CrossOriginEventBus implements IEventBus {

  private id: number
  private callback?: (any) => void
  private outPort: OutPort
  private _controller?: EventBusController
  private name: string
  private subscriptions: Map<string, ICallback[]>
  private tasks: Map<string, ICallback[]>
  private services: Map<string, IServiceFn>
  private pendingTasks: Function[]
  private state: string

  constructor({callback, name}: IOption = {} ) {
    if (this.isParent) {
      this._controller = new EventBusController()
    }
    this.callback = callback
    this.name = name
    this.subscriptions = new Map()
    this.tasks = new Map()
    this.services = new Map()
    this.pendingTasks = []
    this.state = 'uninitialized'
    window.addEventListener('message', this.handshake)
  }

  private get isParent () : boolean {
    return window.parent === window
  }

  private get isReady () : boolean {
    return this.state === 'ready'
  }

  private get controller () {
    if (this.isParent) {
      return this._controller
    } else {
      throw "Controller only exists in the parent window"
    }
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
      this.state = 'ready'
      this.clearBuffers()
    }
  }

  clearBuffers() {
    while (this.pendingTasks.length) {
      this.pendingTasks.pop()()
    }
  }

  private onMessage(e) {
    const { type } = e.data
    switch (type) {
      case 'response': {
        const { uuid, response } = e.data
        if (this.tasks.has(uuid)) {
          this.tasks.get(uuid)[0](response)
          this.tasks.delete(uuid)
        }
        break
      }
      case 'request': {
        const { key, uuid, payload } = e.data
        if (this.services.has(key)) {
          const serviceFn = this.services.get(key)
          const doRespondFail = this.doRespond.bind(this, uuid, false)
          serviceFn(payload)
            .then(this.doRespond.bind(this, uuid, true), doRespondFail)
            .catch(doRespondFail)
        }
        break
      }
    }
    if (this.subscriptions.has(type)) {
      this.subscriptions.get(type).forEach(cb => cb(e))
    }
    this.callback && this.callback(e)
  }

  private doRespond(uuid, success, response) {
    this.send({
      type: 'response',
      uuid,
      response,
      success
    })
  }

  send(msg) {
    const req = () => this.outPort.send(msg)
    if (this.isReady) {
      req()
    } else {
      this.pendingTasks.push(req.bind(this))
    }
  }

  request(key: string, args: any) {
    const uuid = UUID(this.id)
    const req = () => {
      this.send({
        type: 'request',
        key,
        uuid,
        payload: args
      })
    }
    if (this.isReady) {
      req()
    } else {
      this.pendingTasks.push(req.bind(this))
    }

    return new Promise((resolve, reject) => {
      this.tasks.set(uuid, [resolve])
    })
  }

  registerService(key, responder) {
    this.services.set(key, responder)
  }

  unregisterService(key) {
    this.services.delete(key)
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
