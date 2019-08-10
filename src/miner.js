const fs = require('fs');
import Reversi from './reversi'
import axios from 'axios'
import * as contracts from 'clovers-contracts'
import { ethers } from 'ethers';

require('dotenv').config();

function padRight (val, number, base = 16) {
  let diff = parseInt(number) - val.length
  if (diff === 0) return val
  return val.toString(base) + '0'.repeat(diff)
}
class Miner {

  constructor() {
    this.stopMining = false
    this.tempGamesMined = 0
    this.totalGamesMined = 0
    this.allGamesMined = []
    this.totalCloversFound = 0
    this.started = new Date()
    this.date = new Date()
    this.lastTime = this.date.getTime()
    
    this.RotSym = 0
    this.Y0Sym = 0
    this.X0Sym = 0
    this.XYSym = 0
    this.XnYSym = 0
    this.log = 'output.log'
    this.symms = 'symms2.json'
    this.provider = null
    this.contract = null
    this.wallet = null
  }

  startMining(log) {
    let provider = ethers.getDefaultProvider('rinkeby');
    this.wallet = ethers.Wallet.fromMnemonic(process.env.rinkeby).connect(provider);
    this.contract = new ethers.Contract(contracts.CloversController.networks[4].address, contracts.CloversController.abi, this.wallet);
    console.log('start as ' + this.started)
    if (log && log !== this.log) this.log = log
    setInterval(this.mine.bind(this), 0)
    // this.mine()
    // console.log('done')
  }

  mine() {
      this.date = new Date()
      if (!this.stopMining) {
        if (this.totalGamesMined % 1000 == 0 && this.totalGamesMined !== 0) fs.appendFileSync(this.log, 'avg:' + (this.date.getTime() - this.started.getTime()) / (this.totalGamesMined) + '\r\n')
        if (this.totalGamesMined == 1) fs.appendFileSync(this.log, 'time for first game:' + (this.date.getTime() - this.started.getTime()) + '\r\n')

        this.tempGamesMined++
        this.totalGamesMined++
        var reversi = new Reversi()
        reversi.mine()
        // reversi.playGameMovesString('c4c5e6e3b5f4f3e7g4a5e2e1d1g2f2d2f1g1e8g5h3c1c6d7c2g3f5b6h5f6a6d3b7b2a4g6c8c3h1a7c7f7a2b3g7h7d8h6b8b1f8h2a8h4a3b4d6g8h8a1')
        this.totalGamesMined % 1000 === 0 && console.log(this.totalGamesMined)
        if(reversi.RotSym || reversi.Y0Sym || reversi.X0Sym || reversi.XYSym || reversi.XnYSym) {
          axios.get('https://api2.clovers.network/clovers/0x' + reversi.byteBoard).then(() => {
            console.log(`clover ${reversi.byteBoard} already exists`)
          }).catch(() => {
            console.log(reversi)

            let moves = reversi.returnByteMoves()
            moves = moves.map(m => '0x' + padRight(m, 56))
            let _tokenId = '0x' + reversi.byteBoard
            let _symmetries = reversi.returnSymmetriesAsBN().toString(10)
            let _keep = false
            console.log({moves, _tokenId, _symmetries, _keep})

            let txPromise = this.contract.claimClover(moves, _tokenId, _symmetries, _keep)
            fs.appendFileSync(this.symms, "\"" + reversi.movesString + "\",\n")
            txPromise.then((tx) => {
              console.log(tx)
            })
            if (reversi.RotSym) {
              this.RotSym++
              fs.appendFileSync(this.log, 'RotSym' + '\r\n');
            }
            if (reversi.Y0Sym) {
              this.Y0Sym++
              fs.appendFileSync(this.log, 'Y0Sym' + '\r\n');
            }
            if (reversi.X0Sym) {
              this.X0Sym++
              fs.appendFileSync(this.log, 'X0Sym' + '\r\n');
            }
            if (reversi.XYSym) {
              this.XYSym++
              fs.appendFileSync(this.log, 'XYSym' + '\r\n');
            }
            if (reversi.XnYSym) {
              this.XnYSym++
              fs.appendFileSync(this.log, 'XnYSym' + '\r\n');
            }
            this.totalCloversFound++
            this.allGamesMined.push(this.tempGamesMined)
            fs.appendFileSync(this.log, 'time: ' + (this.date.getTime() - this.lastTime) + '\r\n');
            this.lastTime = this.date.getTime()
            fs.appendFileSync(this.log, 'current: ' + this.tempGamesMined + '\r\n');
            fs.appendFileSync(this.log, 'average: ' + (this.totalGamesMined / this.totalCloversFound) + '\r\n');
            fs.appendFileSync(this.log, 'symms: ' + this.allGamesMined.length + '\r\n');
            fs.appendFileSync(this.log, 'total: ' + this.totalGamesMined + '\r\n');
            let totalAverage = this.allGamesMined.reduce((a, b) => a + b, 0) / this.allGamesMined.length
            fs.appendFileSync(this.log, 'totalAverage: ' + totalAverage + '\r\n');

            this.tempGamesMined = 0
            fs.appendFileSync(this.log, reversi.movesString + '\r\n');
          })
        }
      }

  }
}
export default new Miner()