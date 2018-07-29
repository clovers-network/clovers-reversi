# Reversi for Clovers

## install

```
npm install clovers-reversi --save
```

## build

```
npm run build # or just gulp
```

## use

```
var Reversi = require('clovers-reversi')
var reversi = new Reversi()
reversi.mine()
reversi.makeVisualBoard()
console.log(reversi.visualBoard)
```

## Globals

- `BLACK = 1`
- `BOARDDIM = 8`
- `EMPTY = 3`
- `STARTMOVE = [2, 3] // always starts w C4 to avoid translation repeats`
- `WHITE = 2`

## Attributes

- RotSym
- X0Sym
- XYSym
- XnYSym
- Y0Sym
- blackScore
- board
- byteBoard
- byteFirst32Moves
- byteLastMoves
- complete
- currentPlayer
- error
- moveKey
- moves
- movesString
- msg
- rowBoard
- symmetrical
- visualBoard
- whiteScore

## functions

- arrayBoardToCols()
- arrayBoardToRows()
- arrayBoardToRows2D()
- arrayToMove()
- binaryBoardToByteBoard()
- binaryMovesToByteMoves()
- binaryMovesToStringMoves()
- buildMovesString()
- byteBoardPopulateBoard()
- byteBoardToArrayBoard()
- byteBoardToColArray()
- byteBoardToRowArray()
- byteMovesToStringMoves()
- calcWinners()
- clearAttrs()
- colArrayBoardToBinaryBoard()
- colArrayBoardToByteBoard()
- getValidMoves()
- isComplete()
- isSymmetrical()
- makeMove()
- makeVisualBoard()
- mine()
- moveToArray()
- multiArrayBoardToRows()
- pickRandomMove()
- playGameByteMoves()
- playGameMovesArray()
- playGameMovesString()
- playMove()
- possibleDirections()
- sliceBinaryMovesToBytes()
- sliceMovesStringToBytes()
- stringBoardToArrayBoard()
- stringMovesToArrayMoves()
- stringMovesToBinaryMoves()
- stringMovesToByteMoves()
- thisBoardToByteBoard()
- thisMovesToByteMoves()
- translateToC4Version()
- traverseDirection()
