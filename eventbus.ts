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
    this.getAllChildContexts().forEach(this.initChildContext.bind(this))
  }

  broadcast(msg) {  
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

  private getAllChildContexts() {
    return [...document.querySelectorAll('iframe'), window]
  }
}


export class EventBus {
  private get isParent () {
    return window.parent === window
  }

  private id: number
  private callback: (any) => void
  private outPort: OutPort
  private controller: EventBusController

  constructor({callback}) {
    if (this.isParent) {
      this.controller = new EventBusController()
    }
    this.callback = callback
    window.addEventListener('message', this.handshake)
  }

  handshake = (e) => {
    const { type, id } = e.data
    if (type === 'init') {
      this.id = id
      this.outPort = new OutPort(e.ports[0], this.callback)
      this.outPort.send({
        type: 'ready',
        id,
      })
      window.removeEventListener('message', this.handshake)
    }
  }

  send(msg) {
    this.outPort.send(msg)
  }
}
