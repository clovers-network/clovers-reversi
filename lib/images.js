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

var QRCode = require("qrcode-svg");
var exec = require('child_process').exec,
    child;

var Image = function () {
    function Image() {
        _classCallCheck(this, Image);
    }

    _createClass(Image, [{
        key: 'start',
        value: function start() {
            var symms = JSON.parse(fs.readFileSync('./symms.json', 'utf-8'));
            symms.forEach(function (sym) {
                var reversi = new _reversi2.default();
                reversi.playGameMovesString(sym);

                // const content = 'https://dev.clovers.network/field?pick=' + sym
                var content = 'https://clovers.network/keep/' + sym;
                var qr = new QRCode({
                    content: content,
                    padding: 1,
                    width: 400,
                    height: 400,
                    color: reversi.blackScore > reversi.whiteScore ? "#000000" : reversi.blackScore < reversi.whiteScore ? "#ffffff" : "#808080",
                    background: reversi.blackScore > reversi.whiteScore ? "#ffffff" : reversi.blackScore < reversi.whiteScore ? "#000000" : "#ffffff",
                    ecl: "L"
                }).svg();

                fs.writeFileSync('./svgs/' + reversi.byteBoard + '-qr.svg', qr);

                reversi.toSVG().then(function (clover) {
                    fs.writeFileSync('./svgs/' + reversi.byteBoard + '-clover.svg', clover);

                    child = exec('python svg_stack.py --direction=v --margin=0 ./svgs/' + reversi.byteBoard + '-qr.svg ./svgs/' + reversi.byteBoard + '-clover.svg > ./stickers/' + reversi.byteBoard + '.svg', function (error, stdout, stderr) {
                        console.log('stdout: ' + stdout);
                        console.log('stderr: ' + stderr);
                        if (error !== null) {
                            console.log('exec error: ' + error);
                        }
                    });
                    child();
                });
            });
        }
    }]);

    return Image;
}();

exports.default = new Image();