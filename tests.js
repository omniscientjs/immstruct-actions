'use strict';

var chai = require('chai');
var should = chai.should();

var actionsCreator = require('./');
var immstruct = require('immstruct');

describe('actions', function () {

  describe('without immstruct', function () {
    var actions;
    beforeEach(function () {
      actions = actionsCreator;
    });

    describe('api', function () {

      var defaultApiMethods = [
        'register', 'remove', 'invoke', 'createComposedInvoker',
        'combine', 'subscribe', 'unsubscribe'
      ];

      it('should expose an empty, clean store', function () {
        actions.actions.should.eql({});
        shouldHaveFunctions(actions, defaultApiMethods);
      });

      it('should return same API on added action', function () {
        var newUnstore = actions.register(noop);
        shouldHaveFunctions(newUnstore, defaultApiMethods);
      });

      it('should return same API on remove action', function () {
        var newUnstore = actions.register('foo', noop);
        shouldHaveFunctions(newUnstore, defaultApiMethods);
        newUnstore = newUnstore.remove('foo');
        shouldHaveFunctions(newUnstore, defaultApiMethods);
      });

    });

    describe('register', function () {

      it('should have immutable register method, returning new actions with added action', function () {
        var fnName = 'fnName';
        var newUnstore = actions.register(fnName, noop);
        actions.actions.should.eql({});
        shouldHaveFunction(newUnstore.actions, fnName);
      });

      it('should use function name implicitly', function () {
        var fnName = 'fnName';
        var newUnstore = actions.register(function fnName () { });
        shouldHaveFunction(newUnstore.actions, fnName);
      });

      it('should use defined name if explicitly defined, even though function has name', function () {
        var fnName = 'fnName';
        var newUnstore = actions.register(fnName, function anotherFnName () { });
        shouldHaveFunction(newUnstore.actions, fnName);
      });

    });

    describe('invoke', function () {

      it('should be able to invoke registered function', function (done) {
        var newUnstore = actions.register('done', done);
        newUnstore.invoke('done');
      });

      it('should be able to pass arguments on single invoke', function (done) {
        var newUnstore = actions.register('done', function (a, b) {
          a.should.equal('foo');
          b.should.equal('bar');
          done();
        });
        newUnstore.invoke('done', 'foo', 'bar');
      });

      it('should be able to invoke bulk functions', function () {
        var numCalls = 0;
        var increment = function () { numCalls++ };
        var newUnstore = actions
          .register('1', increment)
          .register('2', increment);

        newUnstore.invoke(['1', '2']);
        numCalls.should.equal(2);
      });


      it('should be able to invoke bulk functions with arguments', function (done) {
        var numCalls = 0;
        var update = function (a, b) {
          a.should.equal('foo');
          b.should.equal('bar');

          if (++numCalls === 2) done();
        };

        var newUnstore = actions
          .register('1', update)
          .register('2', update);

        newUnstore.invoke(['1', '2'], 'foo', 'bar');
      });

    });

    describe('remove', function () {

      it('should return new actions on remove, not altering the existing one', function () {

        var fnName = 'fnName', otherFnName = 'shouldKeep';
        var newUnstore = actions.register(fnName, noop).register(otherFnName, noop);
        shouldHaveFunction(newUnstore.actions, fnName);

        var reducedUnstore = newUnstore.remove(fnName);
        shouldHaveFunction(newUnstore.actions, fnName);
        shouldNotHaveFunction(reducedUnstore.actions, fnName);
        shouldHaveFunction(reducedUnstore.actions, otherFnName);
      });

      it('should remove multiple actions at once', function () {
        var newUnstore = actions.register('1', noop).register('2', noop).register('3', noop);
        shouldHaveFunctions(newUnstore.actions, ['1', '2']);

        var reducedUnstore = newUnstore.remove(['1', '2']);
        shouldHaveFunctions(newUnstore.actions, ['1', '2']);
        shouldNotHaveFunctions(reducedUnstore.actions, ['1', '2']);
        shouldHaveFunction(reducedUnstore.actions, '3');
      });

    });

    describe('combine', function () {

      it('should combine one actions with another', function () {
        var newUnstore = actions.register('1', noop).register('2', noop)
        var anotherUnstore = actions.register('3', noop);

        var combinedUnstore = newUnstore.combine(anotherUnstore);
        Object.keys(combinedUnstore.actions).length.should.equal(3);

        shouldHaveFunctions(combinedUnstore.actions, ['1', '2', '3']);
        shouldNotHaveFunctions(anotherUnstore.actions, ['1', '2']);
        shouldNotHaveFunction(newUnstore.actions, '3');
      });

      it('should combine multiple actions', function () {
        var newUnstore = actions.register('1', noop).register('2', noop)
        var anotherUnstore = actions.register('3', noop);

        var combinedUnstore = actions.combine(newUnstore, anotherUnstore);
        Object.keys(combinedUnstore.actions).length.should.equal(3);

        shouldHaveFunctions(combinedUnstore.actions, ['1', '2', '3']);
        shouldNotHaveFunctions(anotherUnstore.actions, ['1', '2']);
        shouldNotHaveFunction(newUnstore.actions, '3');
      });

    });

    describe('createComposedInvoker', function () {

      it('should create a composed invoker', function () {
        var newUnstore = actions
          .register('square', function (input) {
            return input * input;
          })
          .register('timesTwo', function (input) {
            return input * 2;
          });

        var invoker = newUnstore.createComposedInvoker('square', 'timesTwo');
        invoker(4).should.equal( 8 * (4 * 2) );
      });

    });

  });

  describe('subscriber', function () {
    it('should trigger subscriber', function (done) {
      var myActions = actionsCreator.subscribe(done);
      myActions.subscribers[0].should.equal(done);

      myActions = myActions.register(function myFunction () {  });
      myActions.subscribers[0].should.equal(done);

      myActions.invoke('myFunction');
    });

    it('should remember subscribers when creating new', function (done) {
      var numCalls = 0;
      var increment = function () { numCalls++ };

      var myActions = actionsCreator
        .subscribe(increment)
        .subscribe(increment)
        .subscribe(increment)
        .subscribe(function () {
          numCalls.should.equal(3);
          done();
        })
        .register(function myFunction () {  });
      myActions.invoke('myFunction');
    });

    it('should keep subscribers when combining', function (done) {
      var numCalls = 0;
      var increment = function () { numCalls++ };

      var myActions1 = actionsCreator
        .subscribe(increment);

      var myActions2 = actionsCreator
        .subscribe(increment)
        .subscribe(increment)
        .subscribe(function () {
          numCalls.should.equal(3);
          done();
        })
        .register(function myFunction () {  });

      var myActions = myActions1.combine(myActions2);

      myActions.invoke('myFunction');
    });

    it('should remove subscribers', function (done) {
      var numCalls = 0;
      var increment = function () { numCalls++ };

      var myActions = actionsCreator
        .subscribe(increment)
        .unsubscribe(increment)
        .subscribe(function () {
          numCalls.should.equal(0);
          done();
        })
        .register(function myFunction () {  });
      myActions.invoke('myFunction');

    });
  });

  describe('immstruct cursors', function () {
    var actions, structure;
    beforeEach(function () {
      structure = immstruct({
        foo: 4
      });
      actions = actionsCreator;
    });

    it('should invoke single action', function () {
      var structure = immstruct({ foo: 4 });
      var newUnstore = actions
        .register('square', function (cursor) {
          return cursor.update(function (input) {
            return input * input;
          });
        })
        .register('timesTwo', function (cursor) {
          return cursor.update(function (input) {
            return input * 2;
          })
        });

      var cursor = structure.cursor('foo');
      var newCursor = newUnstore.invoke('square', cursor);
      newCursor.valueOf().should.equal( 4 * 4 );

      newCursor = newUnstore.invoke('timesTwo', cursor);
      newCursor.valueOf().should.equal( 4 * 2 );
    });

  });

  function shouldHaveFunction (inst, fn) {
    return shouldHaveFunctions(inst, [fn]);
  }

  function shouldHaveFunctions (inst, functions) {
    functions.forEach(function (fnName) {
      inst.should.have.property(fnName).that.is.a('function');
    });
  }

  function shouldNotHaveFunction (inst, fn) {
    return shouldNotHaveFunctions(inst, [fn]);
  }

  function shouldNotHaveFunctions (inst, functions) {
    functions.forEach(function (fnName) {
      inst.should.not.have.property(fnName).that.is.a('function');
    });
  }

  function noop () { }

});
