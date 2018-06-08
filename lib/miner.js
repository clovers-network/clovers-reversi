'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _reversi = require('./reversi');

var _reversi2 = _interopRequireDefault(_reversi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Miner = function () {
  function Miner() {
    _classCallCheck(this, Miner);

    this.stopMining = false;
    this.tempGamesMined = 0;
    this.totalGamesMined = 0;
    this.allGamesMined = [];
    this.totalCloversFound = 0;
    this.started = new Date();
    this.date = new Date();
    this.lastTime = new Date();
    this.reversi = new _reversi2.default();
    this.RotSym = 0;
    this.Y0Sym = 0;
    this.X0Sym = 0;
    this.XYSym = 0;
    this.XnYSym = 0;
  }

  _createClass(Miner, [{
    key: 'startMining',
    value: function startMining() {
      this.mine().then(this.startMining.bind(this));
    }
  }, {
    key: 'mine',
    value: function mine() {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _this.date = new Date();
        if (!_this.stopMining) {

          if (_this.totalGamesMined % 1000 == 0) console.log('avg:' + (_this.date.getTime() - _this.started.getTime()) / (_this.totalGamesMined / 1000));

          _this.tempGamesMined++;
          _this.totalGamesMined++;
          _this.reversi.mine();
          if (_this.reversi.symmetrical) {
            if (_this.reversi.RotSym) {
              _this.RotSym++;
              console.log('RotSym');
            }
            if (_this.reversi.Y0Sym) {
              _this.Y0Sym++;
              console.log('Y0Sym');
            }
            if (_this.reversi.X0Sym) {
              _this.X0Sym++;
              console.log('X0Sym');
            }
            if (_this.reversi.XYSym) {
              _this.XYSym++;
              console.log('XYSym');
            }
            if (_this.reversi.XnYSym) {
              _this.XnYSym++;
              console.log('XnYSym');
            }
            _this.totalCloversFound++;
            _this.allGamesMined.push(_this.tempGamesMined);
            console.log('time: ' + (_this.date.getTime() - _this.lastTime));
            _this.lastTime = _this.date.getTime();
            console.log('current: ' + _this.tempGamesMined);
            console.log('average: ' + _this.totalGamesMined / _this.totalCloversFound);
            console.log('total: ' + _this.totalGamesMined);
            _this.tempGamesMined = 0;
            console.log(_this.reversi.movesString);
          }
        }
        resolve();
      });
    }
  }]);

  return Miner;
}();

exports.default = new Miner();