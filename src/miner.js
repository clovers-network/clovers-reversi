const fs = require('fs');
import Reversi from './reversi'
class Miner {

  constructor() {
    this.stopMining = false
    this.tempGamesMined = 0
    this.totalGamesMined = 0
    this.allGamesMined = []
    this.totalCloversFound = 0
    this.started = new Date()
    this.date = new Date()
    this.lastTime = new Date()
    this.reversi = new Reversi()
    this.RotSym = 0
    this.Y0Sym = 0
    this.X0Sym = 0
    this.XYSym = 0
    this.XnYSym = 0
    this.log = 'output.log'
  }

  startMining(log) {
    if (log !== this.log) this.log = log
    this.mine()
  }

  mine() {
      this.date = new Date()
      if (!this.stopMining) {

        if (this.totalGamesMined%1000 == 0) console.log('avg:' + (this.date.getTime() - this.started.getTime()) / (this.totalGamesMined / 1000))
        if (this.totalGamesMined == 1) console.log('avg:' + (this.date.getTime() - this.started.getTime()) / (this.totalGamesMined / 1000))

        this.tempGamesMined++
        this.totalGamesMined++
        this.reversi.mine()
        if(this.reversi.symmetrical) {
          if (this.reversi.RotSym) {
            this.RotSym++
            fs.appendFileSync(this.log, 'RotSym');
          }
          if (this.reversi.Y0Sym) {
            this.Y0Sym++
            fs.appendFileSync(this.log, 'Y0Sym');
          }
          if (this.reversi.X0Sym) {
            this.X0Sym++
            fs.appendFileSync(this.log, 'X0Sym');
          }
          if (this.reversi.XYSym) {
            this.XYSym++
            fs.appendFileSync(this.log, 'XYSym');
          }
          if (this.reversi.XnYSym) {
            this.XnYSym++
            fs.appendFileSync(this.log, 'XnYSym');
          }
          this.totalCloversFound++
          this.allGamesMined.push(this.tempGamesMined)
          fs.appendFileSync(this.log, 'time: ' + (this.date.getTime() - this.lastTime));
          this.lastTime = this.date.getTime()
          fs.appendFileSync(this.log, 'current: ' + this.tempGamesMined);
          fs.appendFileSync(this.log, 'average: ' + (this.totalGamesMined / this.totalCloversFound));
          fs.appendFileSync(this.log, 'total: ' + this.totalGamesMined);
          this.tempGamesMined = 0
          fs.appendFileSync(this.log, this.reversi.movesString);
        }
      }
      setTimeout(this.mine().bind(this))
  }
}
export default new Miner()