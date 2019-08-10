'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _reversi = require('./reversi');

var _reversi2 = _interopRequireDefault(_reversi);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _cloversContracts = require('clovers-contracts');

var contracts = _interopRequireWildcard(_cloversContracts);

var _ethers = require('ethers');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require('fs');


require('dotenv').config();

function padRight(val, number) {
  var base = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 16;

  var diff = parseInt(number) - val.length;
  if (diff === 0) return val;
  return val.toString(base) + '0'.repeat(diff);
}

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
    this.lastTime = this.date.getTime();

    this.RotSym = 0;
    this.Y0Sym = 0;
    this.X0Sym = 0;
    this.XYSym = 0;
    this.XnYSym = 0;
    this.log = 'output.log';
    this.symms = 'symms2.json';
    this.provider = null;
    this.contract = null;
    this.wallet = null;
  }

  _createClass(Miner, [{
    key: 'startMining',
    value: function startMining(log) {
      var provider = _ethers.ethers.getDefaultProvider('rinkeby');
      this.wallet = _ethers.ethers.Wallet.fromMnemonic(process.env.rinkeby).connect(provider);
      this.contract = new _ethers.ethers.Contract(contracts.CloversController.networks[4].address, contracts.CloversController.abi, this.wallet);
      console.log('start as ' + this.started);
      if (log && log !== this.log) this.log = log;
      setInterval(this.mine.bind(this), 0);
      // this.mine()
      // console.log('done')
    }
  }, {
    key: 'mine',
    value: function mine() {
      var _this = this;

      this.date = new Date();
      if (!this.stopMining) {
        if (this.totalGamesMined % 1000 == 0 && this.totalGamesMined !== 0) fs.appendFileSync(this.log, 'avg:' + (this.date.getTime() - this.started.getTime()) / this.totalGamesMined + '\r\n');
        if (this.totalGamesMined == 1) fs.appendFileSync(this.log, 'time for first game:' + (this.date.getTime() - this.started.getTime()) + '\r\n');

        this.tempGamesMined++;
        this.totalGamesMined++;
        var reversi = new _reversi2.default();
        reversi.mine();
        // reversi.playGameMovesString('c4c5e6e3b5f4f3e7g4a5e2e1d1g2f2d2f1g1e8g5h3c1c6d7c2g3f5b6h5f6a6d3b7b2a4g6c8c3h1a7c7f7a2b3g7h7d8h6b8b1f8h2a8h4a3b4d6g8h8a1')
        this.totalGamesMined % 1000 === 0 && console.log(this.totalGamesMined);
        if (reversi.RotSym || reversi.Y0Sym || reversi.X0Sym || reversi.XYSym || reversi.XnYSym) {
          _axios2.default.get('https://api2.clovers.network/clovers/0x' + reversi.byteBoard).then(function () {
            console.log('clover ' + reversi.byteBoard + ' already exists');
          }).catch(function () {
            console.log(reversi);

            var moves = reversi.returnByteMoves();
            moves = moves.map(function (m) {
              return '0x' + padRight(m, 56);
            });
            var _tokenId = '0x' + reversi.byteBoard;
            var _symmetries = reversi.returnSymmetriesAsBN().toString(10);
            var _keep = false;
            console.log({ moves: moves, _tokenId: _tokenId, _symmetries: _symmetries, _keep: _keep });

            var txPromise = _this.contract.claimClover(moves, _tokenId, _symmetries, _keep);
            fs.appendFileSync(_this.symms, "\"" + reversi.movesString + "\",\n");
            txPromise.then(function (tx) {
              console.log(tx);
            });
            if (reversi.RotSym) {
              _this.RotSym++;
              fs.appendFileSync(_this.log, 'RotSym' + '\r\n');
            }
            if (reversi.Y0Sym) {
              _this.Y0Sym++;
              fs.appendFileSync(_this.log, 'Y0Sym' + '\r\n');
            }
            if (reversi.X0Sym) {
              _this.X0Sym++;
              fs.appendFileSync(_this.log, 'X0Sym' + '\r\n');
            }
            if (reversi.XYSym) {
              _this.XYSym++;
              fs.appendFileSync(_this.log, 'XYSym' + '\r\n');
            }
            if (reversi.XnYSym) {
              _this.XnYSym++;
              fs.appendFileSync(_this.log, 'XnYSym' + '\r\n');
            }
            _this.totalCloversFound++;
            _this.allGamesMined.push(_this.tempGamesMined);
            fs.appendFileSync(_this.log, 'time: ' + (_this.date.getTime() - _this.lastTime) + '\r\n');
            _this.lastTime = _this.date.getTime();
            fs.appendFileSync(_this.log, 'current: ' + _this.tempGamesMined + '\r\n');
            fs.appendFileSync(_this.log, 'average: ' + _this.totalGamesMined / _this.totalCloversFound + '\r\n');
            fs.appendFileSync(_this.log, 'symms: ' + _this.allGamesMined.length + '\r\n');
            fs.appendFileSync(_this.log, 'total: ' + _this.totalGamesMined + '\r\n');
            var totalAverage = _this.allGamesMined.reduce(function (a, b) {
              return a + b;
            }, 0) / _this.allGamesMined.length;
            fs.appendFileSync(_this.log, 'totalAverage: ' + totalAverage + '\r\n');

            _this.tempGamesMined = 0;
            fs.appendFileSync(_this.log, reversi.movesString + '\r\n');
          });
        }
      }
    }
  }]);

  return Miner;
}();

exports.default = new Miner();