'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var testFunc = function testFunc(a) {
  return a * 2;
};

exports.default = testFunc;

var Chain = function () {
  function Chain() {
    _classCallCheck(this, Chain);

    var _chain = this;

    this.stack = [];
    this.thens = [];
    this.catches = [];
  }

  _createClass(Chain, [{
    key: '_run',
    value: function _run(name, fn) {
      var args = Array.prototype.slice.call(arguments, 1);

      this.stack.push({
        name: name,
        fn: fn,
        args: args
      });

      return this;
    }
  }, {
    key: 'then',
    value: function then(fn) {
      this.thens.push(fn);

      return this;
    }
  }, {
    key: 'catch',
    value: function _catch(fn) {
      this.catches.push(fn);

      return this;
    }
  }, {
    key: 'go',
    value: function go() {
      var _this = this;

      var _chain = this;
      var isReady = false;
      var promise = new Promise(function (resolve, reject) {
        console.log('promise declaration');
        var handle = setInterval(function () {
          if (!isReady) return;

          console.log('boop');
          clearInterval(handle);

          _this.stack.forEach(function (fn) {
            try {
              fn.fn.apply(null, fn.args);
            } catch (e) {
              reject({ error: e, source: fn });
            }
          });
          resolve();
        }, 10);
      });
      console.log('setting thens');
      this.thens.forEach(function (thenFn) {
        return promise.then(thenFn);
      });
      console.log('setting catches');
      this.catches.forEach(function (catchFn) {
        return promise.catch(catchFn);
      });
      console.log('starting promise chain');
      isReady = true;
    }
  }]);

  return Chain;
}();

function fs() {
  return new Chain();
}

fs()._run('forceTypeError()', function () {
  return undefined.nonexistant;
}).then(function () {
  return console.log('done');
}).catch(function (err) {
  return console.log('error', err.error.name, err.source.name);
}).go();