const fs = require('fs');
import Reversi from './reversi'
import { doesNotReject } from 'assert';
var QRCode = require("qrcode-svg");
var exec = require('child_process').exec, child;
var axios = require('axios')
class Image {
    constructor() {
        
    }

    async start() {
        try  {
            let symms = JSON.parse(fs.readFileSync('./symms.json', 'utf-8'))
            symms = await filterSyms(symms)

            await doOne(symms)
            console.log('make individual images complete')

            await groupTwelve(symms)
            console.log('make group images complete')
        } catch (error) {
            console.log(error)
        }
    }
}

async function filterSyms(symms, freshSyms = [], key = 0) {
    if (key >= symms.length) {
        return freshSyms
    }
    const sym = symms[key]
    const reversi = new Reversi()
    reversi.playGameMovesString(sym)
    try {
        await axios.get('https://api2.clovers.network/clovers/0x' + reversi.byteBoard)
    } catch (_) {
        freshSyms.push(sym)
    }
    return filterSyms(symms, freshSyms, key + 1)
}

async function groupTwelve(symms) {
    var chunk = 12;
    var symGroups = []
    for (var i=0, j=symms.length; i<j; i+=chunk) {
        symGroups.push(symms.slice(i,i+chunk))
    }
    await doOneTwelve(symGroups)
    console.log('done')
}

async function doOneTwelve(symGroups, key = 0) {
    if (key >= symGroups.length) {
        return
    }
    const symGroup = symGroups[key]
    const reversi = new Reversi()


    if (symGroup.length === 1) {
        fs.copyFileSync(`./stickers/${symGroup[0]}.svg`, `./final/${key}.svg`)
        return
    }
    reversi.playGameMovesString(symGroup[0])
    var one = reversi.byteBoard.toString()
    reversi.playGameMovesString(symGroup[1])
    var two = reversi.byteBoard.toString()
    await makeImage(`./stickers/${one}.svg`, `./stickers/${two}.svg`, `./tmp/one+two.svg`)

    if (symGroup.length === 2) {
        fs.copyFileSync(`./tmp/one+two.svg`, `./final/${key}.svg`)
        return
    }

    reversi.playGameMovesString(symGroup[2])
    var three = reversi.byteBoard.toString()

    if (symGroup.length === 3) {
        await makeImage('./tmp/one+two.svg', `./stickers/${three}.svg`, `./final/${key}.svg`)
        return
    }

    reversi.playGameMovesString(symGroup[3])
    var four = reversi.byteBoard.toString()
    await makeImage(`./stickers/${three}.svg`, `./stickers/${four}.svg`, `./tmp/three+four.svg`)

    await makeImage('./tmp/one+two.svg', './tmp/three+four.svg', './tmp/one_to_four.svg')

    if (symGroup.length === 4) {
        fs.copyFileSync(`./tmp/one_to_four.svg`, `./final/${key}.svg`)
        return
    }

    // ---------------------------------------------------------------------------------------------------------------
    // second row

    reversi.playGameMovesString(symGroup[4])
    var five = reversi.byteBoard.toString()

    if (symGroup.length === 5) {

        await makeImage(`./stickers/${five}.svg`, `./stickers/${five}.svg`, `./tmp/five+five.svg`)
        await makeImage(`./tmp/one_to_four.svg`, `./tmp/five+five.svg`, `./final/${key}.svg`, 'v')
        return
    }

    reversi.playGameMovesString(symGroup[5])
    var six = reversi.byteBoard.toString()
    await makeImage(`./stickers/${five}.svg`, `./stickers/${six}.svg`, './tmp/five+six.svg')

    if (symGroup.length === 6) {
        await makeImage('./tmp/one_to_four.svg', './tmp/five+six.svg', `./final/${key}.svg`, 'v')
    }

    reversi.playGameMovesString(symGroup[6])
    var seven = reversi.byteBoard.toString()

    if (symGroup.length === 7) {
        await makeImage(`./stickers/${seven}.svg`, `./stickers/${seven}.svg`, './tmp/seven+seven.svg')
        await makeImage('./tmp/five+six.svg', './tmp/seven+seven.svg', `./tmp/five_to_seven.svg`)
        await makeImage('./tmp/one_to_four.svg', './tmp/five_to_seven.svg', `./final/${key}.svg`, 'v')
    }

    reversi.playGameMovesString(symGroup[7])
    var eight = reversi.byteBoard.toString()

    await makeImage(`./stickers/${seven}.svg`, `./stickers/${eight}.svg`, './tmp/seven+eight.svg')
    await makeImage('./tmp/five+six.svg', './tmp/seven+eight.svg', `./tmp/five_to_eight.svg`)
    await makeImage('./tmp/one_to_four.svg', './tmp/five_to_eight.svg', `./tmp/one_to_eight.svg`, 'v')

    if (symGroup.length === 8) {
        fs.copyFileSync(`./tmp/one_to_eight.svg`, `./final/${key}.svg`)
    }

    // ---------------------------------------------------------------------------------------------------------------
    // third row

    reversi.playGameMovesString(symGroup[8])
    var nine = reversi.byteBoard.toString()

    if (symGroup.length === 9) {

        await makeImage(`./stickers/${nine}.svg`, `./stickers/${nine}.svg`, `./tmp/nine+nine.svg`)
        await makeImage(`./tmp/one_to_eight.svg`, `./tmp/nine+nine.svg`, `./final/${key}.svg`, 'v')

        return
    }

    reversi.playGameMovesString(symGroup[9])
    var ten = reversi.byteBoard.toString()
    await makeImage(`./stickers/${nine}.svg`, `./stickers/${ten}.svg`, './tmp/nine+ten.svg')

    if (symGroup.length === 10) {
        await makeImage(`./tmp/one_to_eight.svg`, `./tmp/nine+ten.svg`, `./final/${key}.svg`, 'v')
    }

    reversi.playGameMovesString(symGroup[10])
    var eleven = reversi.byteBoard.toString()

    if (symGroup.length === 11) {
        await makeImage(`./stickers/${eleven}.svg`, `./stickers/${eleven}.svg`, './tmp/eleven+eleven.svg')
        await makeImage('./tmp/nine+ten.svg', './tmp/eleven+eleven.svg', `./tmp/nine_to_eleven.svg`)
        await makeImage('./tmp/one_to_eight.svg', './tmp/nine_to_eleven.svg', `./final/${key}.svg`, 'v')
    }

    reversi.playGameMovesString(symGroup[11])
    var twelve = reversi.byteBoard.toString()
    await makeImage(`./stickers/${eleven}.svg`, `./stickers/${twelve}.svg`, './tmp/eleven+twelve.svg')

    await makeImage('./tmp/nine+ten.svg', './tmp/eleven+twelve.svg', `./tmp/nine_to_twelve.svg`)
    await makeImage('./tmp/one_to_eight.svg', './tmp/nine_to_twelve.svg', `./final/${key}.svg`, 'v')

    await doOneTwelve(symGroups, key + 1)
}

function makeImage(input_one, input_two, output, direction = 'h') {
    return new Promise((resolve, reject) => {
        const command = `python svg_stack.py --direction=${direction} --margin=20 ${input_one} ${input_two} > ${output}`
        exec(command, (error, stdout, stderr) => {
            if (error || stderr || stdout) {
                reject(error || stderr || stdout)
            } else {
                resolve()
            }
        })
    });
}
// 1.350337584396099

async function doOne(symms, key = 0) {

    if (key >= symms.length) {
        return
    } else {
        const sym = symms[key]
        const reversi = new Reversi()
        reversi.playGameMovesString(sym)
        // const content = 'https://dev.clovers.network/field?pick=' + sym
        const content = 'https://clovers.network/garden?pick=' + sym
        const qr = new QRCode({
            content,
            padding: 1,
            width: 400,
            height: 400,
            color: reversi.blackScore > reversi.whiteScore ? "#000000" : reversi.blackScore < reversi.whiteScore ? "#ffffff" : "#808080",
            background: reversi.blackScore > reversi.whiteScore ? "#ffffff" : reversi.blackScore < reversi.whiteScore ? "#000000" : "#ffffff" ,
            ecl: "L"
        }).svg();

        try {
            fs.writeFileSync(`./svgs/${ reversi.byteBoard }-qr.svg`, qr);
            const clover = await reversi.toSVG()
            fs.writeFileSync(`./svgs/${ reversi.byteBoard }-clover.svg`, clover);
        } catch (error) {
            console.error(error)
        }
        await new Promise((resolve, reject) => {
            exec(`python svg_stack.py --direction=v --margin=0 ./svgs/${ reversi.byteBoard }-qr.svg ./svgs/${ reversi.byteBoard }-clover.svg > ./stickers/${ reversi.byteBoard }.svg`,
            (error, stdout, stderr) => {
                if (error || stderr || stdout) {
                    reject(error || stderr || stdout)
                } else {
                    doOne(symms, key + 1).then(resolve)
                }
            })
        })
        return
        // child();

    }
}

export default new Image()