## Event Bus for Cross Origin/Context Communication

Cross origin event bus (COEB)

### Inspiration

Good foundation library for building [Microfrontend](https://martinfowler.com/articles/micro-frontends.html) architecture.

### Usage

Just load it in your html or import in your module.

```javascript
// index.html
const eb = new CrossOriginEventBus()

eb.subscribe('added', (e) => {
  console.log('added received')
})

eb.registerService('test', () => {
  return new Promise(res => {
    setTimeout(() => res('this is test service'))
  })
})
```

```javascript
// page1.html
const eb = new CrossOriginEventBus({name: 'page3'})

// print done, this is test service
eb.request('test').then((resp) => console.log('done', resp))
eb.send({type: 'added'})
```

### API

```typescript
interface IEventBus  {
  send: (any) => void
  request: (key: string, args: any) => Promise<any>
  registerService: (key: string, IResponder) => void
  unregisterService: (key: string) => void
  subscribe: (evName: string, ICallback) => void
  unsubscribe: (evName: string, ICallback) => void
}
```

## How secure is this
Security is achieved by enforcing host selecting frames to be added. 

## How is this different from web APIs

### [BroadcastChannel](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel)
BroadcastChannel is restricted to the same origin while COEB is unrestricted.
