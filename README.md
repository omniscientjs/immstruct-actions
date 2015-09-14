immstruct-actions [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][depstat-image]][depstat-url] [![Gitter][gitter-image]][gitter-url]
=========

A library helping structure functions intended as actions in a React or [Omniscient.js](https://github.com/omniscientjs/omniscient) architecture, for providing opinionated helpers and tools for easier use.

Install `immstruct-actions` through npm

```shell
$ npm install --save immstruct-actions
```

## Example Usage

```js

// New empty actions
var actions = require('immstruct-actions');

// Immutable action dispatchers. Returns new ones
var myActions = actions.register(function double (n) {
  return n * 2;
});

var otherActions = actions.register('plus2', (n) => n + 2);

// Combine two actions
var combined = myActions.combine(otherActions);

// invoke one action
var num = combined.invoke('double', 4); //> 8

// Create composed invoker
var numPlus2 = combined.createComposedInvoker('double', 'plus2')(4); //> 10

```

## Example In Omniscient

```js
// Passing to components in React or Omniscient.js

var actions = require('immstruct-actions');
var component = require('omniscient');

var MyButton = component(({text, changeSomething}) =>
  <button onClick={changeSomething}>{text}</button>
);

// Use destructuring to unwrap changeSomething
var App = component({text, actions: { changeSomething }} =>
  <MyButton text={text} changeSomething={changeSomething} />
);

var myActions = actions.register(function changeSomething () {
  // Change some state.
});

myActions = myActions.subscribe(render);
render();
function render () {
  // Fetch all functions from myActions
  React.render(<Button text="Click me" actions={myActions.fn} />, el);
}
```


## API Reference

### `actions`

Returned when requiring the module.

Create a pocket of actions as defined by initial optional actions and
optional subscribers. Used to create new immutable action dispatchers.

### Example

```js
var actions = require('immstruct-actions');
var myActions = actions.register(function double (i) { return i * 2; });
var double2 = myActions.invoke('double', 2); //> 4
var double = myActions.fn.double;
```


### Properties

| property      | type                      | description                 |
| ------------- | ------------------------- | --------------------------- |
| `actions`     | Object.<String, Function> | attached to the dispatcher  |
| `subscribers` | Array.<Function>          | attached to the dispatcher  |
| `fns`         | Array.<Function>          | attached to the dispatcher  |



### `actions.invoke(actionName, rest)`

Create a pocket of actions as defined by initial optional actions and
optional subscribers. Used to create new immutable action dispatchers.

### Example

```js
var double2 = actions.invoke('double', 2); //> 4
```


### Parameters

| param        | type                  | description                          |
| ------------ | --------------------- | ------------------------------------ |
| `actionName` | Array.<String>,String | Invoke a named function              |
| `rest`       | Object                | Optional arguments passed to action  |



**Returns** `Any`,


### `actions.subscribe(fn)`

Add subscriber. Is triggered when any action is invoked. This returns
a new actions dispatcher, as action dispatchers are immutable.

### Example

```js
var newActionsWithSubscriber = actions.subscribe(function subscriber () {
 // ...
});
```


### Parameters

| param | type     | description          |
| ----- | -------- | -------------------- |
| `fn`  | Function | Subscriber function  |



**Returns** `actions`,


### `actions.unsubscribe(fn)`

Remove subscriber. This returns a new actions dispatcher, as action
dispatchers are immutable.

### Example

```js
function subscriber () {
 // ...
}
var newActionsWithoutSubscriber = actions.unsubscribe(subscriber);
```


### Parameters

| param | type     | description          |
| ----- | -------- | -------------------- |
| `fn`  | Function | Subscriber function  |



**Returns** `actions`,


### `actions.register([actionName], fn)`

Register new action. This returns a new actions dispatcher, as action
dispatchers are immutable.

If not `actionName` is defined, it uses name of function passed in.

### Example

```js
var actions = require('immstruct-actions');
var myActions = actions.register(function double (i) { return i * 2; });
var double2 = myActions.invoke('double', 2); //> 4
var double = myActions.fn.double;

```


### Parameters

| param          | type     | description                         |
| -------------- | -------- | ----------------------------------- |
| `[actionName]` | String   | _optional:_ Name of action function |
| `fn`           | Function | Subscriber function                 |



**Returns** `actions`,


### `actions.remove(fn)`

Remove existing action. This returns a new actions dispatcher, as action
dispatchers are immutable.

### Example

```js
var actions = require('immstruct-actions');
var myActions = actions.register(function double (i) { return i * 2; });
myActions = myActions.remove('double');
```


### Parameters

| param | type     | description          |
| ----- | -------- | -------------------- |
| `fn`  | Function | Subscriber function  |



**Returns** `actions`,


### `actions.createComposedInvoker(functions)`

Create a composed invoker of two or more actions.

### Example

```js
var actions = require('immstruct-actions');
var myActions = actions.register(function double (i) { return i * 2; });
myActions = actions.register(function plus2 (i) { return i + 2; });
var doublePlus2 = myActions.createComposedInvoker('double', 'plus2');
```


### Parameters

| param       | type           | description                            |
| ----------- | -------------- | -------------------------------------- |
| `functions` | Array.<String> | Functions names of actions to compose  |



**Returns** `Function`,


### `undefined`

fns


### `actions.combine(functions)`

Combine one or more action dispatchers. Returns a new action dispatcher
which has all the actions and subscribers of the action dispatchers passed
as input.

### Example

```js
var actions = require('immstruct-actions');
var myAction1 = actions.register(function double (i) { return i * 2; });
var myAction2 = actions.register(function plus2 (i) { return i + 2; });
var myActions = myAction1.combine(myAction2);
doublePlus2 = myActions.createComposedInvoker('double', 'plus2');
```


### Parameters

| param       | type           | description                            |
| ----------- | -------------- | -------------------------------------- |
| `functions` | Array.<String> | Functions names of actions to compose  |



**Returns** `Actions`,


### `actions.fn`

Property getting all functions added as actions. Will trigger subscribers
but can be used as standalone functions.

### Example

```js
var actions = require('immstruct-actions');
var myAction1 = actions.register(function double (i) { return i * 2; });
var double = myActions.fn.double;
// or with destructuring
var {double} = myActions.fn;
```

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)

[npm-url]: https://npmjs.org/package/immstruct-actions
[npm-image]: http://img.shields.io/npm/v/immstruct-actions.svg?style=flat

[travis-url]: http://travis-ci.org/omniscientjs/immstruct-actions
[travis-image]: http://img.shields.io/travis/omniscientjs/immstruct-actions.svg?style=flat

[depstat-url]: https://gemnasium.com/omniscientjs/immstruct-actions
[depstat-image]: http://img.shields.io/gemnasium/omniscientjs/immstruct-actions.svg?style=flat

[gitter-url]: https://gitter.im/omniscientjs/omniscient?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[gitter-image]: https://badges.gitter.im/Join%20Chat.svg
