const fs = require('fs');
import Reversi from './reversi'
var QRCode = require("qrcode-svg");
var exec = require('child_process').exec, child;

class Image {
    constructor() {
        
    }

    start() {
        const symms = JSON.parse(fs.readFileSync('./symms.json', 'utf-8'))
        symms.forEach(sym => {
            const reversi = new Reversi()
            reversi.playGameMovesString(sym)

            // const content = 'https://dev.clovers.network/field?pick=' + sym
            const content = 'https://clovers.network/keep/' + sym
            const qr = new QRCode({
                content,
                padding: 1,
                width: 400,
                height: 400,
                color: reversi.blackScore > reversi.whiteScore ? "#000000" : reversi.blackScore < reversi.whiteScore ? "#ffffff" : "#808080",
                background: reversi.blackScore > reversi.whiteScore ? "#ffffff" : reversi.blackScore < reversi.whiteScore ? "#000000" : "#ffffff" ,
                ecl: "L"
            }).svg();

            fs.writeFileSync(`./svgs/${ reversi.byteBoard }-qr.svg`, qr);


            reversi.toSVG().then((clover) => {
                fs.writeFileSync(`./svgs/${ reversi.byteBoard }-clover.svg`, clover);

                child = exec(`python svg_stack.py --direction=v --margin=0 ./svgs/${ reversi.byteBoard }-qr.svg ./svgs/${ reversi.byteBoard }-clover.svg > ./stickers/${ reversi.byteBoard }.svg`,
                function (error, stdout, stderr) {
                    console.log('stdout: ' + stdout);
                    console.log('stderr: ' + stderr);
                    if (error !== null) {
                         console.log('exec error: ' + error);
                    }
                });
                child();
            })
        });
    }
}
export default new Image()