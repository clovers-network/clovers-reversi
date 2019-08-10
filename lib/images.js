'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _reversi = require('./reversi');

var _reversi2 = _interopRequireDefault(_reversi);

var _assert = require('assert');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require('fs');

var QRCode = require("qrcode-svg");
var exec = require('child_process').exec,
    child;
var axios = require('axios');

var Image = function () {
    function Image() {
        _classCallCheck(this, Image);
    }

    _createClass(Image, [{
        key: 'start',
        value: async function start() {
            try {
                var symms = JSON.parse(fs.readFileSync('./symms.json', 'utf-8'));
                symms = await filterSyms(symms);

                await doOne(symms);
                console.log('make individual images complete');

                await groupTwelve(symms);
                console.log('make group images complete');
            } catch (error) {
                console.log(error);
            }
        }
    }]);

    return Image;
}();

async function filterSyms(symms) {
    var freshSyms = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var key = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

    if (key >= symms.length) {
        return freshSyms;
    }
    var sym = symms[key];
    var reversi = new _reversi2.default();
    reversi.playGameMovesString(sym);
    try {
        await axios.get('https://api2.clovers.network/clovers/0x' + reversi.byteBoard);
    } catch (_) {
        freshSyms.push(sym);
    }
    return filterSyms(symms, freshSyms, key + 1);
}

async function groupTwelve(symms) {
    var chunk = 12;
    var symGroups = [];
    for (var i = 0, j = symms.length; i < j; i += chunk) {
        symGroups.push(symms.slice(i, i + chunk));
    }
    await doOneTwelve(symGroups);
    console.log('done');
}

async function doOneTwelve(symGroups) {
    var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    if (key >= symGroups.length) {
        return;
    }
    var symGroup = symGroups[key];
    var reversi = new _reversi2.default();

    if (symGroup.length === 1) {
        fs.copyFileSync('./stickers/' + symGroup[0] + '.svg', './final/' + key + '.svg');
        return;
    }
    reversi.playGameMovesString(symGroup[0]);
    var one = reversi.byteBoard.toString();
    reversi.playGameMovesString(symGroup[1]);
    var two = reversi.byteBoard.toString();
    await makeImage('./stickers/' + one + '.svg', './stickers/' + two + '.svg', './tmp/one+two.svg');

    if (symGroup.length === 2) {
        fs.copyFileSync('./tmp/one+two.svg', './final/' + key + '.svg');
        return;
    }

    reversi.playGameMovesString(symGroup[2]);
    var three = reversi.byteBoard.toString();

    if (symGroup.length === 3) {
        await makeImage('./tmp/one+two.svg', './stickers/' + three + '.svg', './final/' + key + '.svg');
        return;
    }

    reversi.playGameMovesString(symGroup[3]);
    var four = reversi.byteBoard.toString();
    await makeImage('./stickers/' + three + '.svg', './stickers/' + four + '.svg', './tmp/three+four.svg');

    await makeImage('./tmp/one+two.svg', './tmp/three+four.svg', './tmp/one_to_four.svg');

    if (symGroup.length === 4) {
        fs.copyFileSync('./tmp/one_to_four.svg', './final/' + key + '.svg');
        return;
    }

    // ---------------------------------------------------------------------------------------------------------------
    // second row

    reversi.playGameMovesString(symGroup[4]);
    var five = reversi.byteBoard.toString();

    if (symGroup.length === 5) {

        await makeImage('./stickers/' + five + '.svg', './stickers/' + five + '.svg', './tmp/five+five.svg');
        await makeImage('./tmp/one_to_four.svg', './tmp/five+five.svg', './final/' + key + '.svg', 'v');
        return;
    }

    reversi.playGameMovesString(symGroup[5]);
    var six = reversi.byteBoard.toString();
    await makeImage('./stickers/' + five + '.svg', './stickers/' + six + '.svg', './tmp/five+six.svg');

    if (symGroup.length === 6) {
        await makeImage('./tmp/one_to_four.svg', './tmp/five+six.svg', './final/' + key + '.svg', 'v');
    }

    reversi.playGameMovesString(symGroup[6]);
    var seven = reversi.byteBoard.toString();

    if (symGroup.length === 7) {
        await makeImage('./stickers/' + seven + '.svg', './stickers/' + seven + '.svg', './tmp/seven+seven.svg');
        await makeImage('./tmp/five+six.svg', './tmp/seven+seven.svg', './tmp/five_to_seven.svg');
        await makeImage('./tmp/one_to_four.svg', './tmp/five_to_seven.svg', './final/' + key + '.svg', 'v');
    }

    reversi.playGameMovesString(symGroup[7]);
    var eight = reversi.byteBoard.toString();

    await makeImage('./stickers/' + seven + '.svg', './stickers/' + eight + '.svg', './tmp/seven+eight.svg');
    await makeImage('./tmp/five+six.svg', './tmp/seven+eight.svg', './tmp/five_to_eight.svg');
    await makeImage('./tmp/one_to_four.svg', './tmp/five_to_eight.svg', './tmp/one_to_eight.svg', 'v');

    if (symGroup.length === 8) {
        fs.copyFileSync('./tmp/one_to_eight.svg', './final/' + key + '.svg');
    }

    // ---------------------------------------------------------------------------------------------------------------
    // third row

    reversi.playGameMovesString(symGroup[8]);
    var nine = reversi.byteBoard.toString();

    if (symGroup.length === 9) {

        await makeImage('./stickers/' + nine + '.svg', './stickers/' + nine + '.svg', './tmp/nine+nine.svg');
        await makeImage('./tmp/one_to_eight.svg', './tmp/nine+nine.svg', './final/' + key + '.svg', 'v');

        return;
    }

    reversi.playGameMovesString(symGroup[9]);
    var ten = reversi.byteBoard.toString();
    await makeImage('./stickers/' + nine + '.svg', './stickers/' + ten + '.svg', './tmp/nine+ten.svg');

    if (symGroup.length === 10) {
        await makeImage('./tmp/one_to_eight.svg', './tmp/nine+ten.svg', './final/' + key + '.svg', 'v');
    }

    reversi.playGameMovesString(symGroup[10]);
    var eleven = reversi.byteBoard.toString();

    if (symGroup.length === 11) {
        await makeImage('./stickers/' + eleven + '.svg', './stickers/' + eleven + '.svg', './tmp/eleven+eleven.svg');
        await makeImage('./tmp/nine+ten.svg', './tmp/eleven+eleven.svg', './tmp/nine_to_eleven.svg');
        await makeImage('./tmp/one_to_eight.svg', './tmp/nine_to_eleven.svg', './final/' + key + '.svg', 'v');
    }

    reversi.playGameMovesString(symGroup[11]);
    var twelve = reversi.byteBoard.toString();
    await makeImage('./stickers/' + eleven + '.svg', './stickers/' + twelve + '.svg', './tmp/eleven+twelve.svg');

    await makeImage('./tmp/nine+ten.svg', './tmp/eleven+twelve.svg', './tmp/nine_to_twelve.svg');
    await makeImage('./tmp/one_to_eight.svg', './tmp/nine_to_twelve.svg', './final/' + key + '.svg', 'v');

    await doOneTwelve(symGroups, key + 1);
}

function makeImage(input_one, input_two, output) {
    var direction = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'h';

    return new Promise(function (resolve, reject) {
        var command = 'python svg_stack.py --direction=' + direction + ' --margin=20 ' + input_one + ' ' + input_two + ' > ' + output;
        exec(command, function (error, stdout, stderr) {
            if (error || stderr || stdout) {
                reject(error || stderr || stdout);
            } else {
                resolve();
            }
        });
    });
}
// 1.350337584396099

async function doOne(symms) {
    var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;


    if (key >= symms.length) {
        return;
    } else {
        var sym = symms[key];
        var reversi = new _reversi2.default();
        reversi.playGameMovesString(sym);
        // const content = 'https://dev.clovers.network/field?pick=' + sym
        var content = 'https://clovers.network/garden?pick=' + sym;
        var qr = new QRCode({
            content: content,
            padding: 1,
            width: 400,
            height: 400,
            color: reversi.blackScore > reversi.whiteScore ? "#000000" : reversi.blackScore < reversi.whiteScore ? "#ffffff" : "#808080",
            background: reversi.blackScore > reversi.whiteScore ? "#ffffff" : reversi.blackScore < reversi.whiteScore ? "#000000" : "#ffffff",
            ecl: "L"
        }).svg();

        try {
            fs.writeFileSync('./svgs/' + reversi.byteBoard + '-qr.svg', qr);
            var clover = await reversi.toSVG();
            fs.writeFileSync('./svgs/' + reversi.byteBoard + '-clover.svg', clover);
        } catch (error) {
            console.error(error);
        }
        await new Promise(function (resolve, reject) {
            exec('python svg_stack.py --direction=v --margin=0 ./svgs/' + reversi.byteBoard + '-qr.svg ./svgs/' + reversi.byteBoard + '-clover.svg > ./stickers/' + reversi.byteBoard + '.svg', function (error, stdout, stderr) {
                if (error || stderr || stdout) {
                    reject(error || stderr || stdout);
                } else {
                    doOne(symms, key + 1).then(resolve);
                }
            });
        });
        return;
        // child();
    }
}

exports.default = new Image();