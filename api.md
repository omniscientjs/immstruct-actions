
### `actions`

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



**Returns** `Object`,


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
