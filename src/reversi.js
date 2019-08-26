import BN from 'bn.js'
class Reversi {
  constructor(startVal) {
    this.STARTMOVE = [2, 3] // C4
    this.BOARDDIM = 8
    this.EMPTY = 3
    this.BLACK = 1
    this.WHITE = 2
    this.clearAttrs()
    if (startVal) {
      Object.assign(this, startVal)
    }
  }

  clearAttrs() {
    this.error = false
    this.complete = false
    this.symmetrical = false
    this.RotSym = false
    this.Y0Sym = false
    this.X0Sym = false
    this.XYSym = false
    this.XnYSym = false
    this.currentPlayer = this.BLACK
    this.blackScore = 0
    this.whiteScore = 0
    // this.board is an array of columns, visually the board should be arranged by arrays of rows
    this.board = new Array(this.BOARDDIM)
      .fill(0)
      .map(c => new Array(this.BOARDDIM).fill(this.EMPTY))
    this.rowBoard = new Array(this.BOARDDIM)
      .fill(0)
      .map(c => new Array(this.BOARDDIM).fill(this.EMPTY))
    this.visualBoard = []
    this.board[this.BOARDDIM / 2 - 1][this.BOARDDIM / 2 - 1] = this.WHITE
    this.board[this.BOARDDIM / 2][this.BOARDDIM / 2] = this.WHITE
    this.board[this.BOARDDIM / 2 - 1][this.BOARDDIM / 2] = this.BLACK
    this.board[this.BOARDDIM / 2][this.BOARDDIM / 2 - 1] = this.BLACK

    this.rowBoard[this.BOARDDIM / 2 - 1][this.BOARDDIM / 2 - 1] = this.BLACK
    this.rowBoard[this.BOARDDIM / 2][this.BOARDDIM / 2] = this.BLACK
    this.rowBoard[this.BOARDDIM / 2 - 1][this.BOARDDIM / 2] = this.WHITE
    this.rowBoard[this.BOARDDIM / 2][this.BOARDDIM / 2 - 1] = this.WHITE

    this.moves = []
    this.movesString = ''
    this.byteBoard = ''
    this.byteFirst32Moves = ''
    this.byteLastMoves = ''
    this.moveKey = 0
    this.msg = ''
  }

  thisMovesToByteMoves(moves = this.moves) {
    moves = this.stringMovesToBinaryMoves(moves.join('')).match(/.{1,224}/g)
    let foo = new BN(moves[0], 2)
    let bar = new BN(moves[1], 2)
    this.byteFirst32Moves = foo.toString(16)
    this.byteLastMoves = bar.toString(16)
  }

  thisBoardToByteBoard() {
    this.byteBoard = this.colArrayBoardToByteBoard(this.board)
  }

  makeMove(move) {
    let col = move[0]
    let row = move[1]
    if (this.board[col][row] !== this.EMPTY) {
      this.error = true
      this.msg = 'Invalid Game (square is already occupied)'
      return
    }

    let possibleDirections = this.possibleDirections(col, row)
    if (possibleDirections.length === 0) {
      this.error = true
      this.msg = 'Invalid Game (doesnt border other tiles)'
      return
    }
    let flipped = false
    for (let i = 0; i < possibleDirections.length; i++) {
      let possibleDirection = possibleDirections[i]
      let flips = this.traverseDirection(possibleDirection, col, row)
      for (let j = 0; j < flips.length; j++) {
        flipped = true
        this.board[flips[j][0]][flips[j][1]] = this.currentPlayer
        this.rowBoard[flips[j][1]][flips[j][0]] = this.currentPlayer
      }
    }
    if (flipped) {
      this.board[col][row] = this.currentPlayer
      this.rowBoard[row][col] = this.currentPlayer
    } else {
      this.error = true
      this.msg = 'Invalid Game (doesnt flip any other tiles)'
      return
    }
    this.currentPlayer =
      this.currentPlayer === this.BLACK ? this.WHITE : this.BLACK
  }

  possibleDirections(col, row) {
    let dirs = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1]
    ]
    let possibleDirections = []
    for (let i = 0; i < dirs.length; i++) {
      let dir = dirs[i]
      let fooCol = col + dir[0]
      let fooRow = row + dir[1]
      if (!(fooCol > 7 || fooCol < 0 || fooRow > 7 || fooRow < 0)) {
        let fooTile = this.board[fooCol][fooRow]
        if (fooTile !== this.currentPlayer && fooTile !== this.EMPTY) {
          possibleDirections.push(dir)
        }
      }
    }
    return possibleDirections
  }

  traverseDirection(possibleDirection, col, row) {
    let flips = []
    let skip = false
    let opponentPlayer =
      this.currentPlayer === this.BLACK ? this.WHITE : this.BLACK
    for (let i = 1; i < this.BOARDDIM + 1 && !skip; i++) {
      let fooCol = i * possibleDirection[0] + col
      let fooRow = i * possibleDirection[1] + row
      if (fooCol > 7 || fooCol < 0 || fooRow > 7 || fooRow < 0) {
        // ran off the board before hitting your own tile
        skip = true
        flips = []
      } else {
        let fooTile = this.board[fooCol][fooRow]
        if (fooTile === opponentPlayer) {
          // if tile is opposite color it could be flipped, so add to potential flip array
          flips.push([fooCol, fooRow])
        } else if (fooTile === this.currentPlayer && i > 1) {
          // hit current players tile which means capture is complete
          skip = true
        } else {
          // either hit current players own color before hitting an opponent's
          // or hit an empty space
          flips = []
          skip = true
        }
      }
    }
    return flips
  }

  isComplete() {
    if (this.moveKey === 60) {
      this.complete = true
      this.msg = 'good game'
      return
    }
    let empties = []
    for (let i = 0; i < this.BOARDDIM; i++) {
      for (let j = 0; j < this.BOARDDIM; j++) {
        if (this.board[i][j] === this.EMPTY) {
          empties.push([i, j])
        }
      }
    }
    let validMovesRemain = false
    if (empties.length) {
      for (let i = 0; i < empties.length && !validMovesRemain; i++) {
        let gameCopy = new Reversi(this)
        // Object.assign(gameCopy, JSON.parse(JSON.stringify(this)))
        gameCopy.currentPlayer = this.BLACK
        gameCopy.makeMove(empties[i])
        if (!gameCopy.error) {
          validMovesRemain = true
        }
        gameCopy = new Reversi(this)
        // Object.assign(gameCopy, JSON.parse(JSON.stringify(this)))
        gameCopy.currentPlayer = this.WHITE
        gameCopy.makeMove(empties[i])
        if (!gameCopy.error) {
          validMovesRemain = true
        }
        gameCopy = undefined
      }
    }
    if (validMovesRemain) {
      this.error = true
      this.msg = 'Invalid Game (moves still available)'
    } else {
      this.complete = true
      this.msg = 'good game'
    }
  }

  calcWinners() {
    this.isComplete()
    if (this.error) return new Error('Game not complete')
    let w = 0
    let b = 0
    for (let i = 0; i < 64; i++) {
      let row = Math.floor(i / 8)
      let col = i % 8
      w += this.board[col][row] === this.WHITE ? 1 : 0
      b += this.board[col][row] === this.BLACK ? 1 : 0
    }
    this.whiteScore = w
    this.blackScore = b
  }

  isSymmetrical() {
    let RotSym = true
    let Y0Sym = true
    let X0Sym = true
    let XYSym = true
    let XnYSym = true
    for (
      let i = 0;
      i < this.BOARDDIM && (RotSym || Y0Sym || X0Sym || XYSym || XnYSym);
      i++
    ) {
      for (
        let j = 0;
        j < this.BOARDDIM && (RotSym || Y0Sym || X0Sym || XYSym || XnYSym);
        j++
      ) {
        // rotational symmetry
        if (this.board[i][j] != this.board[7 - i][7 - j]) {
          RotSym = false
        }
        // symmetry on y = 0
        if (this.board[i][j] != this.board[i][7 - j]) {
          Y0Sym = false
        }
        // symetry on x = 0
        if (this.board[i][j] != this.board[7 - i][j]) {
          X0Sym = false
        }
        // symmetry on x = y
        if (this.board[i][j] != this.board[7 - j][7 - i]) {
          XYSym = false
        }
        // symmetry on x = -y
        if (this.board[i][j] != this.board[j][i]) {
          XnYSym = false
        }
      }
    }
    if (RotSym || Y0Sym || X0Sym || XYSym || XnYSym) {
      this.symmetrical = true
      this.RotSym = RotSym
      this.Y0Sym = Y0Sym
      this.X0Sym = X0Sym
      this.XYSym = XYSym
      this.XnYSym = XnYSym
    }
  }

  buildMovesString() {
    this.movesString = this.moves
      .map(move => {
        return this.arrayToMove(move[0], move[1])
      })
      .join('')
  }

  pickRandomMove() {
    let validMoves = this.getValidMoves()
    if (!validMoves.length) {
      this.currentPlayer =
        this.currentPlayer === this.BLACK ? this.WHITE : this.BLACK
      validMoves = this.getValidMoves()
    }
    return (
      validMoves.length !== 0 &&
      validMoves[Math.floor(Math.random() * validMoves.length)]
    )
  }

  mine() {
    this.clearAttrs()
    let skip = false
    for (let i = 0; i < 60 && !skip; i++) {
      let move = i == 0 ? this.STARTMOVE : this.pickRandomMove() // first move is always C4 to prevent translation solutions
      if (move) {
        this.moves.push(move)
        this.buildMovesString()
        this.moveKey++
        this.makeMove(move)
        if (this.error) {
          this.error = false
          this.currentPlayer =
            this.currentPlayer === this.BLACK ? this.WHITE : this.BLACK
          this.makeMove(move)
          if (this.error) {
            skip = true
          }
        }
      } else {
        skip = true
      }
    }
    this.thisBoardToByteBoard()
    this.isComplete()
    this.calcWinners()
    this.isSymmetrical()
    this.thisMovesToByteMoves()
  }

  getValidMoves() {
    let validMoves = []
    for (let i = 0; i < this.BOARDDIM; i++) {
      for (let j = 0; j < this.BOARDDIM; j++) {
        if (this.board[i][j] === this.EMPTY) {
          let move = [i, j]
          let testGame = new Reversi(JSON.parse(JSON.stringify(this)))
          testGame.makeMove(move)
          if (!testGame.error) {
            validMoves.push(move)
          }
        }
      }
    }
    return validMoves
  }

  makeVisualBoard() {
    this.visualBoard = this.arrayBoardToRows(
      this.board
        .map(c => c.map(t => (t === 1 ? 'b' : t === 2 ? 'w' : '-')).join(''))
        .join('')
        .match(/.{1,1}/g)
    ).map(r => {
      return r.map(t => (t === 'b' ? '⬛️' : t === 'w' ? '⬜️' : '❎'))
    })
    return this.visualBoard
  }

  moveToArray(moveArray) {
    return [
      moveArray[0].toLowerCase().charCodeAt(0) - 97 + 0,
      parseInt(moveArray[1]) - 1 + 0
    ]
  }

  stringMovesToBinaryMoves(stringMoves = false) {
    if (!stringMoves) return
    stringMoves = stringMoves
      .match(/.{1,2}/g)
      .map(move => {
        if (move.length < 2) return
        let moveArray = move.match(/.{1,1}/g)
        let m = this.moveToArray(moveArray)
        let foo = new BN(m[0] + m[1] * 8 + 64)
        return foo.toString(2)
      })
      .join('')
    if (stringMoves.length < 64 * 7) {
      let padding = 64 * 7 - stringMoves.length
      padding = new Array(padding)
      padding = padding.fill('0').join('')
      stringMoves += padding
    }
    return stringMoves
  }

  playGameMovesString(moves = null) {
    return this.playGameMovesArray(this.stringMovesToArrayMoves(moves))
  }

  playGameByteMoves(
    byteFirst32Moves = this.byteFirst32Moves,
    byteLastMoves = this.byteLastMoves
  ) {
    this.playGameMovesString(
      this.byteMovesToStringMoves(byteFirst32Moves, byteLastMoves)
    )
    return this
  }

  playMove(moveKey = 0, moves = this.moves) {
    if (typeof moves[moveKey] === 'undefined') return true
    let move = moves[moveKey]
    this.movesString += move
    let skip = false
    this.moveKey++
    let validMoves = this.getValidMoves()
    let moveArray = this.moveToArray(move)
    let contained = validMoves.findIndex((m) => m[0] === moveArray[0] && m[1] === moveArray[1])
    if (contained < 0 && validMoves.length > 0) {
      this.error = 'invalid move'
      return true
    }
    this.makeMove(moveArray)
    if (this.error) {
      this.error = false
      this.currentPlayer =
        this.currentPlayer === this.BLACK ? this.WHITE : this.BLACK
      this.makeMove(moveArray)
      if (this.error) {
        skip = true
      }
    }
    return skip
  }

  playGameMovesArray(moves = this.moves) {
    if (moves.length === 0) return
    this.clearAttrs()
    this.moves = moves
    this.thisMovesToByteMoves()
    let skip = false
    for (let i = 0; i < this.moves.length && !skip; i++) {
      skip = this.playMove(i)
    }
    this.thisBoardToByteBoard()
    if (!this.error) {
      this.isComplete()
      this.calcWinners()
      this.isSymmetrical()
    }
    return this
    // this.makeVisualBoard()
  }

  colArrayBoardToBinaryBoard(colArrayBoard = []) {
    if (!colArrayBoard.length) return
    let boardString = ''
    for (let col = 0; col < colArrayBoard.length; col++) {
      for (let row = 0; row < colArrayBoard[col].length; row++) {
        let tile = colArrayBoard[col][row]
        boardString += tile === 1 ? '01' : tile === 2 ? '10' : '11'
      }
    }
    return boardString
  }

  colArrayBoardToByteBoard(colArrayBoard = []) {
    if (!colArrayBoard.length) return
    return this.binaryBoardToByteBoard(
      this.colArrayBoardToBinaryBoard(colArrayBoard)
    )
  }

  binaryBoardToByteBoard(binaryBoard) {
    let foo = new BN(binaryBoard, 2)
    return foo.toString(16)
  }

  sliceBinaryMovesToBytes(binaryMoves) {
    let len = binaryMoves.length
    if (len < 64 * 7) {
      let padding = 64 * 7 - len
      padding = new Array(padding)
      padding = padding.fill('0').join('')
      binaryMoves = binaryMoves + padding
    }
    return [
      this.binaryMovesToByteMoves(binaryMoves.slice(0, 224)),
      this.binaryMovesToByteMoves(binaryMoves.slice(224))
    ]
  }

  byteBoardPopulateBoard(byteBoard = this.byteBoard) {
    this.board = this.arrayBoardToCols(
      this.byteBoardToArrayBoard(byteBoard).map(t => {
        return t === 'b' ? 1 : t === 'w' ? 2 : 3
      })
    )
  }

  byteBoardToArrayBoard(byteBoard = this.byteBoard) {
    if (byteBoard.slice(0, 2) === '0x') {
      byteBoard = byteBoard.slice(2)
    }
    byteBoard = new BN(byteBoard, 16)
    byteBoard = byteBoard.toString(2)
    let len = byteBoard.length
    if (len < 128) {
      let padding = 128 - len
      padding = new Array(padding)
      padding = padding.fill('0').join('')
      byteBoard = padding + byteBoard
    }
    return byteBoard.match(/.{1,2}/g).map(tile => {
      return tile === '01' ? 'b' : tile === '10' ? 'w' : '-'
    })
  }

  byteBoardToRowArray(byteBoard = this.byteBoard) {
    return this.arrayBoardToRows(this.byteBoardToArrayBoard(byteBoard))
  }

  byteBoardToColArray(byteBoard = this.byteBoard) {
    return this.arrayBoardToCols(this.byteBoardToArrayBoard(byteBoard))
  }

  multiArrayBoardToRows(arrayBoard = []) {
    return this.arrayBoardToRows2D(
      arrayBoard.map(r =>
        r.map(t => (t === this.BLACK ? 'b' : t === this.WHITE ? 'w' : '-'))
      )
    )
  }

  arrayBoardToRows2D(arrayBoard = []) {
    let rowsArray = []
    for (let col = 0; col < arrayBoard.length; col++) {
      for (let i = 0; i < arrayBoard[col].length; i++) {
        if (!rowsArray[col]) rowsArray[col] = []
        rowsArray[col].push(arrayBoard[i][col])
      }
    }
    return rowsArray
  }

  arrayBoardToRows(arrayBoard = []) {
    let rowsArray = []
    for (let i = 0; i < 64; i++) {
      let row = i % 8
      if (!rowsArray[row]) rowsArray[row] = []
      rowsArray[row].push(arrayBoard[i])
    }
    return rowsArray
  }

  arrayBoardToCols(arrayBoard = []) {
    let colsArray = []
    for (let i = 0; i < 64; i++) {
      let col = Math.floor(i / 8)
      if (!colsArray[col]) colsArray[col] = []
      colsArray[col].push(arrayBoard[i])
    }
    return colsArray
  }

  stringBoardToArrayBoard(stringBoard = false) {
    return (
      stringBoard &&
      stringBoard
        .match(/.{1,1}/g)
        .map(spot => {
          return spot === 'b' ? '01' : spot === 'w' ? '10' : '11'
        })
        .join('')
    )
  }

  stringMovesToArrayMoves(stringMoves = false) {
    if (!stringMoves) return
    return stringMoves.match(/.{1,2}/g)
  }

  pickRandomMove() {
    let validMoves = this.getValidMoves()
    if (!validMoves.length) {
      this.currentPlayer =
        this.currentPlayer === this.BLACK ? this.WHITE : this.BLACK
      validMoves = this.getValidMoves()
    }
    return (
      validMoves.length !== 0 &&
      validMoves[Math.floor(Math.random() * validMoves.length)]
    )
  }

  byteMovesToStringMoves(byteFirst32Moves = 0, byteLastMoves = 0) {
    if (byteFirst32Moves.slice(0, 2) === '0x') {
      byteFirst32Moves = byteFirst32Moves.slice(2)
    }
    if (byteLastMoves.slice(0, 2) === '0x') {
      byteLastMoves = byteLastMoves.slice(2)
    }
    let byteMoves = byteFirst32Moves + byteLastMoves
    byteMoves = new BN(byteMoves, 16)
    let binaryMoves = byteMoves.toString(2)
    return this.binaryMovesToStringMoves(binaryMoves)
  }

  returnByteMoves() {
    return [this.byteFirst32Moves, this.byteLastMoves]
  }

  binaryMovesToByteMoves(binaryMoves = 0) {
    if (!binaryMoves) return
    let foo = new BN(binaryMoves, 2)
    return foo.toString(16)
  }

  stringMovesToByteMoves(stringMoves) {
    return this.binaryMovesToByteMoves(
      this.stringMovesToBinaryMoves(stringMoves)
    )
  }

  binaryMovesToStringMoves(binaryMoves = 0) {
    binaryMoves = binaryMoves && new BN(binaryMoves, 2)
    binaryMoves = binaryMoves.toString(2)
    if (binaryMoves.length < 64 * 7) {
      let padding = 64 * 7 - binaryMoves.length
      padding = new Array(padding)
      padding = padding.fill('0').join('')
      binaryMoves += padding
    }
    return binaryMoves
      .match(/.{1,7}/g)
      .map(move => {
        move = new BN(move, 2).toNumber(10)
        if (move < 64) {
          return false
        } else {
          move -= 64
          let col = move % 8
          move -= col
          let row = move / 8
          return this.arrayToMove(col, row)
        }
      })
      .filter(move => move)
      .join('')
      .toUpperCase()
  }

  translateToC4Version(moves = this.moves) {
    if (!moves.length) return new Error('No Moves')
    let translated = []
    for (let i = 0; i < moves.length; i++) {
      let move = moves[i]
      move = this.moveToArray(move)

      switch (moves[0].toLowerCase()) {
        case 'f5':
          move = move.map(m => 7 - m)
          break
        case 'd3':
          move = [move[1], move[0]]
          break
        case 'e6':
          move = [7 - move[1], 7 - move[0]]
          break
        case 'c4':
          break
        default:
          throw new Error('impossibru!!!' + moves[0].toLowerCase())
      }

      move = this.arrayToMove(move[0], move[1])
      translated[i] = move
    }
    this.moves = translated
    this.playGameMovesArray()
  }

  arrayToMove(col, row) {
    return 'abcdefghijklmnopqrstuvwxyz'[col] + (row + 1)
  }

  sliceMovesStringToBytes(moves = '') {
    return this.sliceBinaryMovesToBytes(this.vesToBinaryMoves(moves))
  }

  returnSymmetriesAsBN() {
    var symmetries = 0
    if (this.RotSym) symmetries += 0b10000
    if (this.Y0Sym) symmetries += 0b01000
    if (this.X0Sym) symmetries += 0b00100
    if (this.XYSym) symmetries += 0b00010
    if (this.XnYSym) symmetries += 0b00001
    return new BN(symmetries)
  }
}

export default Reversi
