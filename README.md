## Event Bus for Cross Origin/Context Communication

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
