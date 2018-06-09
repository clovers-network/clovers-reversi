'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _reversi = require('./reversi');

var _reversi2 = _interopRequireDefault(_reversi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require('fs');

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
    this.log = 'output.log';
  }

  _createClass(Miner, [{
    key: 'startMining',
    value: function startMining(log) {
      if (log && log !== this.log) this.log = log;
      this.mine();
    }
  }, {
    key: 'mine',
    value: function mine() {
      this.date = new Date();
      if (!this.stopMining) {
        // if (this.totalGamesMined%1000 == 0) fs.appendFileSync(this.log, 'avg:' + (this.date.getTime() - this.started.getTime()) / (this.totalGamesMined / 1000))
        if (this.totalGamesMined == 0) fs.appendFileSync(this.log, 'avg:' + (this.date.getTime() - this.started.getTime()) / (this.totalGamesMined / 1000) + '\r\n');
        if (this.totalGamesMined == 1) fs.appendFileSync(this.log, 'avg:' + (this.date.getTime() - this.started.getTime()) / (this.totalGamesMined / 1000) + '\r\n');

        this.tempGamesMined++;
        this.totalGamesMined++;
        this.reversi.mine();
        if (this.reversi.symmetrical) {
          if (this.reversi.RotSym) {
            this.RotSym++;
            fs.appendFileSync(this.log, 'RotSym' + '\r\n');
          }
          if (this.reversi.Y0Sym) {
            this.Y0Sym++;
            fs.appendFileSync(this.log, 'Y0Sym' + '\r\n');
          }
          if (this.reversi.X0Sym) {
            this.X0Sym++;
            fs.appendFileSync(this.log, 'X0Sym' + '\r\n');
          }
          if (this.reversi.XYSym) {
            this.XYSym++;
            fs.appendFileSync(this.log, 'XYSym' + '\r\n');
          }
          if (this.reversi.XnYSym) {
            this.XnYSym++;
            fs.appendFileSync(this.log, 'XnYSym' + '\r\n');
          }
          this.totalCloversFound++;
          this.allGamesMined.push(this.tempGamesMined);
          fs.appendFileSync(this.log, 'time: ' + (this.date.getTime() - this.lastTime) + '\r\n');
          this.lastTime = this.date.getTime();
          fs.appendFileSync(this.log, 'current: ' + this.tempGamesMined + '\r\n');
          fs.appendFileSync(this.log, 'average: ' + this.totalGamesMined / this.totalCloversFound + '\r\n');
          fs.appendFileSync(this.log, 'total: ' + this.totalGamesMined + '\r\n');
          this.tempGamesMined = 0;
          fs.appendFileSync(this.log, this.reversi.movesString + '\r\n');
        }
      }
      setTimeout(this.mine().bind(this));
    }
  }]);

  return Miner;
}();

exports.default = new Miner();