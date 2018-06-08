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
      var _this = this;

      setTimeout(function () {
        _this.mine;
      }, 0);
    }
  }, {
    key: 'mine',
    value: function mine() {
      this.date = new Date();
      if (!this.stopMining) {

        if (this.totalGamesMined % 1000 == 0) console.log('avg:' + (this.date.getTime() - this.started.getTime()) / (this.totalGamesMined / 1000));

        this.tempGamesMined++;
        this.totalGamesMined++;
        this.reversi.mine();
        if (this.reversi.symmetrical) {
          if (this.reversi.RotSym) {
            this.RotSym++;
            console.log('RotSym');
          }
          if (this.reversi.Y0Sym) {
            this.Y0Sym++;
            console.log('Y0Sym');
          }
          if (this.reversi.X0Sym) {
            this.X0Sym++;
            console.log('X0Sym');
          }
          if (this.reversi.XYSym) {
            this.XYSym++;
            console.log('XYSym');
          }
          if (this.reversi.XnYSym) {
            this.XnYSym++;
            console.log('XnYSym');
          }
          this.totalCloversFound++;
          this.allGamesMined.push(this.tempGamesMined);
          console.log('time: ' + (this.date.getTime() - this.lastTime));
          this.lastTime = this.date.getTime();
          console.log('current: ' + this.tempGamesMined);
          console.log('average: ' + this.totalGamesMined / this.totalCloversFound);
          console.log('total: ' + this.totalGamesMined);
          this.tempGamesMined = 0;
          console.log(this.reversi.movesString);
        }
        this.mine();
      }
    }
  }]);

  return Miner;
}();

exports.default = new Miner();