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
  }

  startMining() {
    this.mine().then(this.startMining.bind(this))
  }

  mine() {
    return new Promise((resolve, reject) => {
      this.date = new Date()
      if (!this.stopMining) {

        if (this.totalGamesMined%1000 == 0) console.log('avg:' + (this.date.getTime() - this.started.getTime()) / (this.totalGamesMined / 1000))

        this.tempGamesMined++
        this.totalGamesMined++
        this.reversi.mine()
        if(this.reversi.symmetrical) {
          if (this.reversi.RotSym) {
            this.RotSym++
            console.log('RotSym')
          }
          if (this.reversi.Y0Sym) {
            this.Y0Sym++
            console.log('Y0Sym')
          }
          if (this.reversi.X0Sym) {
            this.X0Sym++
            console.log('X0Sym')
          }
          if (this.reversi.XYSym) {
            this.XYSym++
            console.log('XYSym')
          }
          if (this.reversi.XnYSym) {
            this.XnYSym++
            console.log('XnYSym')
          }
          this.totalCloversFound++
          this.allGamesMined.push(this.tempGamesMined)
          console.log('time: ' + (this.date.getTime() - this.lastTime))
          this.lastTime = this.date.getTime()
          console.log('current: ' + this.tempGamesMined)
          console.log('average: ' + (this.totalGamesMined / this.totalCloversFound))
          console.log('total: ' + this.totalGamesMined)
          this.tempGamesMined = 0
          console.log(this.reversi.movesString)
        }
      }
      resolve()
    })
  }
}
export default new Miner()