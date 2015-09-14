'use strict';

var assign = require('lodash.assign');

/**
 *
 * Create a pocket of actions as defined by initial optional actions and
 * optional subscribers. Used to create new immutable action dispatchers.
 *
 * ### Example
 *
 * ```js
 * var actions = require('immstruct-actions');
 * var myActions = actions.register(function double (i) { return i * 2; });
 * var double2 = myActions.invoke('double', 2); //> 4
 * var double = myActions.fn.double;
 * ```
 *
 * @property {Object<String, Function>} actions attached to the dispatcher
 * @property {Array<Function>} subscribers attached to the dispatcher
 *
 * @module actions
 * @returns {Object}
 * @api public
 */
function actions (initialActions, subscribers) {
  var storedActions = (initialActions || {});
  var storedSubscribers = (subscribers || []);

  var methods = {
    /**
     * Create a pocket of actions as defined by initial optional actions and
     * optional subscribers. Used to create new immutable action dispatchers.
     *
     * ### Example
     *
     * ```js
     * var double2 = actions.invoke('double', 2); //> 4
     * ```
     *
     * @param {Array<String>|String} actionName Invoke a named function
     * @param {...Object} rest Optional arguments passed to action
     *
     * @module actions.invoke
     * @returns {Any}
     * @api public
     */
    invoke: function (actionName) {
      var actions = pickActions(storedActions, arrify(actionName));
      var args = toArray(arguments).slice(1);

      var result = Object.keys(actions).reduce(function (acc, name) {
        acc[name] = actions[name].apply(null, args);
        return acc;
      }, {});

      if (!Array.isArray(actionName)) {
        triggerSubscribers(storedSubscribers, result[actionName]);
        return result[actionName];
      }

      triggerSubscribers(storedSubscribers, result);
      return result;
    },

    /**
     * Add subscriber. Is triggered when any action is invoked. This returns
     * a new actions dispatcher, as action dispatchers are immutable.
     *
     * ### Example
     *
     * ```js
     * var newActionsWithSubscriber = actions.subscribe(function subscriber () {
     *  // ...
     * });
     * ```
     *
     * @param {Function} fn Subscriber function
     *
     * @module actions.subscribe
     * @returns {actions}
     * @api public
     */
    subscribe: function (fn) {
      return actions(
        assign({}, storedActions),
        assign([], storedSubscribers.concat(fn))
      );
    },

    /**
     * Remove subscriber. This returns a new actions dispatcher, as action
     * dispatchers are immutable.
     *
     * ### Example
     *
     * ```js
     * function subscriber () {
     *  // ...
     * }
     * var newActionsWithoutSubscriber = actions.unsubscribe(subscriber);
     * ```
     *
     * @param {Function} fn Subscriber function
     *
     * @module actions.unsubscribe
     * @returns {actions}
     * @api public
     */
    unsubscribe: function (fn) {
      return actions(
        assign({}, storedActions),
        assign([], storedSubscribers.filter(function (fns) {
          return fns !== fn;
        }))
      );
    },

    /**
     * Register new action. This returns a new actions dispatcher, as action
     * dispatchers are immutable.
     *
     * If not `actionName` is defined, it uses name of function passed in.
     *
     * ### Example
     *
     * ```js
     * var actions = require('immstruct-actions');
     * var myActions = actions.register(function double (i) { return i * 2; });
     * var double2 = myActions.invoke('double', 2); //> 4
     * var double = myActions.fn.double;
     *
     * ```
     *
     * @param {String} [actionName] Name of action function
     * @param {Function} fn Subscriber function
     *
     * @module actions.register
     * @returns {actions}
     * @api public
     */
    register: function (actionName, action) {
      var newActionMerger = {};

      if (typeof actionName === 'function') {
        action = actionName;
        actionName = action.name;
      }

      if (!actionName) {
        return methods;
      }
      newActionMerger[actionName] = action;
      return actions(
        assign({}, storedActions, newActionMerger),
        assign([], storedSubscribers)
      );
    },

    /**
     * Remove existing action. This returns a new actions dispatcher, as action
     * dispatchers are immutable.
     *
     * ### Example
     *
     * ```js
     * var actions = require('immstruct-actions');
     * var myActions = actions.register(function double (i) { return i * 2; });
     * myActions = myActions.remove('double');
     * ```
     *
     * @param {Function} fn Subscriber function
     *
     * @module actions.remove
     * @returns {actions}
     * @api public
     */
    remove: function (actionName) {
      var actionNames = arrify(actionName);
      return actions(Object.keys(storedActions).reduce(function (acc, key) {
        if (actionNames.indexOf(key) !== -1) return acc;
        acc[key] = storedActions[key];
        return acc;
      }, {}));
    },

    /**
     * Create a composed invoker of two or more actions.
     *
     * ### Example
     *
     * ```js
     * var actions = require('immstruct-actions');
     * var myActions = actions.register(function double (i) { return i * 2; });
     * myActions = actions.register(function plus2 (i) { return i + 2; });
     * var doublePlus2 = myActions.createComposedInvoker('double', 'plus2');
     * ```
     *
     * @param {Array<String>} functions Functions names of actions to compose
     *
     * @module actions.createComposedInvoker
     * @returns {Function}
     * @api public
     */
    createComposedInvoker: function (/* fns */) {
      var actions = pickActions(storedActions, toArray(arguments));
      return function composedInvoker (args) {
        var outerContext = this;
        var result = updateOrInvoke(actions, args, outerContext);
        triggerSubscribers(storedSubscribers, result);
        return result;
      };
    },

    actions: storedActions,

    subscribers: storedSubscribers,

    /**
     * Combine one or more action dispatchers. Returns a new action dispatcher
     * which has all the actions and subscribers of the action dispatchers passed
     * as input.
     *
     * ### Example
     *
     * ```js
     * var actions = require('immstruct-actions');
     * var myAction1 = actions.register(function double (i) { return i * 2; });
     * var myAction2 = actions.register(function plus2 (i) { return i + 2; });
     * var myActions = myAction1.combine(myAction2);
     * doublePlus2 = myActions.createComposedInvoker('double', 'plus2');
     * ```
     *
     * @param {Array<String>} functions Functions names of actions to compose
     *
     * @module actions.combine
     * @returns {Actions}
     * @api public
     */
    combine: function (/* other stores */) {
      var newStoredActions = [storedActions]
        .concat(
          toArray(arguments)
          .map(function (store) {
            return store.actions;
          })
        );

      var newSubscribers = storedSubscribers
        .concat(
          toArray(arguments)
          .reduce(function (acc, store) {
            return acc.concat(store.subscribers);
          }, [])
        );

      return actions(
        assign.apply(null, [{}].concat(newStoredActions)),
        assign([], newSubscribers)
      );
    },
  };

  /**
   * Property getting all functions added as actions. Will trigger subscribers
   * but can be used as standalone functions.
   *
   * ### Example
   *
   * ```js
   * var actions = require('immstruct-actions');
   * var myAction1 = actions.register(function double (i) { return i * 2; });
   * var double = myActions.fn.double;
   * // or with destructuring
   * var {double} = myActions.fn;
   * ```
   */
  Object.defineProperty(methods, 'fn', {
    get: function () {
      return Object.keys(storedActions).reduce(function (acc, fnName) {
        acc[fnName] = methods.invoke.bind(methods, fnName);
        return acc;
      }, {});
    },
    enumerable: true,
    configurable: false,
  });

  return methods;
};

module.exports = actions();

function updateOrInvoke (actions, args, context) {
  var invoke = function (args) {
    return Object.keys(actions).reduceRight(function (result, name) {
      return actions[name].call(context, result);
    }, args);
  };

  if (args && args.deref && args.groupedOperations) {
    return args.groupedOperations(invoke);
  }

  return invoke(args);
}

function triggerSubscribers (subscribers, structure) {
  subscribers.forEach(function (fn) {
    fn(structure);
  });
}

function arrify (input) {
  if (Array.isArray(input)) {
    return input;
  }
  return [input];
}

function toArray (input) {
  return [].slice.apply(input);
}

function pickActions (actions, names) {
  return names.reduce(function (acc, name) {
    if (typeof name === 'function') {
      acc[name.name] = name;
    }
    if (!actions[name]) return acc;
    acc[name] = actions[name];
    return acc;
  }, {});
}
