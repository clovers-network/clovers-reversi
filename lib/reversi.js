'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bn = require('bn.js');

var _bn2 = _interopRequireDefault(_bn);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Reversi = function () {
  function Reversi(startVal) {
    _classCallCheck(this, Reversi);

    this.STARTMOVE = [2, 3]; // C4
    this.BOARDDIM = 8;
    this.EMPTY = 3;
    this.BLACK = 1;
    this.WHITE = 2;
    this.clearAttrs();
    if (startVal) {
      Object.assign(this, startVal);
    }
  }

  _createClass(Reversi, [{
    key: 'clearAttrs',
    value: function clearAttrs() {
      var _this = this;

      this.error = false;
      this.complete = false;
      this.symmetrical = false;
      this.RotSym = false;
      this.Y0Sym = false;
      this.X0Sym = false;
      this.XYSym = false;
      this.XnYSym = false;
      this.currentPlayer = this.BLACK;
      this.blackScore = 0;
      this.whiteScore = 0;
      // this.board is an array of columns, visually the board should be arranged by arrays of rows
      this.board = new Array(this.BOARDDIM).fill(0).map(function (c) {
        return new Array(_this.BOARDDIM).fill(_this.EMPTY);
      });
      this.rowBoard = new Array(this.BOARDDIM).fill(0).map(function (c) {
        return new Array(_this.BOARDDIM).fill(_this.EMPTY);
      });
      this.visualBoard = [];
      this.board[this.BOARDDIM / 2 - 1][this.BOARDDIM / 2 - 1] = this.WHITE;
      this.board[this.BOARDDIM / 2][this.BOARDDIM / 2] = this.WHITE;
      this.board[this.BOARDDIM / 2 - 1][this.BOARDDIM / 2] = this.BLACK;
      this.board[this.BOARDDIM / 2][this.BOARDDIM / 2 - 1] = this.BLACK;

      this.rowBoard[this.BOARDDIM / 2 - 1][this.BOARDDIM / 2 - 1] = this.BLACK;
      this.rowBoard[this.BOARDDIM / 2][this.BOARDDIM / 2] = this.BLACK;
      this.rowBoard[this.BOARDDIM / 2 - 1][this.BOARDDIM / 2] = this.WHITE;
      this.rowBoard[this.BOARDDIM / 2][this.BOARDDIM / 2 - 1] = this.WHITE;

      this.moves = [];
      this.movesString = '';
      this.byteBoard = '';
      this.byteFirst32Moves = '';
      this.byteLastMoves = '';
      this.moveKey = 0;
      this.msg = '';
    }
  }, {
    key: 'thisMovesToByteMoves',
    value: function thisMovesToByteMoves() {
      var moves = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.moves;

      moves = this.stringMovesToBinaryMoves(moves.join('')).match(/.{1,224}/g);
      var foo = new _bn2.default(moves[0], 2);
      var bar = new _bn2.default(moves[1], 2);
      this.byteFirst32Moves = foo.toString(16);
      this.byteLastMoves = bar.toString(16);
    }
  }, {
    key: 'thisBoardToByteBoard',
    value: function thisBoardToByteBoard() {
      this.byteBoard = this.colArrayBoardToByteBoard(this.board);
    }
  }, {
    key: 'makeMove',
    value: function makeMove(move) {
      var col = move[0];
      var row = move[1];
      if (this.board[col][row] !== this.EMPTY) {
        this.error = true;
        this.msg = 'Invalid Game (square is already occupied)';
        return;
      }

      var possibleDirections = this.possibleDirections(col, row);
      if (possibleDirections.length === 0) {
        this.error = true;
        this.msg = 'Invalid Game (doesnt border other tiles)';
        return;
      }
      var flipped = false;
      for (var i = 0; i < possibleDirections.length; i++) {
        var possibleDirection = possibleDirections[i];
        var flips = this.traverseDirection(possibleDirection, col, row);
        for (var j = 0; j < flips.length; j++) {
          flipped = true;
          this.board[flips[j][0]][flips[j][1]] = this.currentPlayer;
          this.rowBoard[flips[j][1]][flips[j][0]] = this.currentPlayer;
        }
      }
      if (flipped) {
        this.board[col][row] = this.currentPlayer;
        this.rowBoard[row][col] = this.currentPlayer;
      } else {
        this.error = true;
        this.msg = 'Invalid Game (doesnt flip any other tiles)';
        return;
      }
      this.currentPlayer = this.currentPlayer === this.BLACK ? this.WHITE : this.BLACK;
    }
  }, {
    key: 'possibleDirections',
    value: function possibleDirections(col, row) {
      var dirs = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
      var possibleDirections = [];
      for (var i = 0; i < dirs.length; i++) {
        var dir = dirs[i];
        var fooCol = col + dir[0];
        var fooRow = row + dir[1];
        if (!(fooCol > 7 || fooCol < 0 || fooRow > 7 || fooRow < 0)) {
          var fooTile = this.board[fooCol][fooRow];
          if (fooTile !== this.currentPlayer && fooTile !== this.EMPTY) {
            possibleDirections.push(dir);
          }
        }
      }
      return possibleDirections;
    }
  }, {
    key: 'traverseDirection',
    value: function traverseDirection(possibleDirection, col, row) {
      var flips = [];
      var skip = false;
      var opponentPlayer = this.currentPlayer === this.BLACK ? this.WHITE : this.BLACK;
      for (var i = 1; i < this.BOARDDIM + 1 && !skip; i++) {
        var fooCol = i * possibleDirection[0] + col;
        var fooRow = i * possibleDirection[1] + row;
        if (fooCol > 7 || fooCol < 0 || fooRow > 7 || fooRow < 0) {
          // ran off the board before hitting your own tile
          skip = true;
          flips = [];
        } else {
          var fooTile = this.board[fooCol][fooRow];
          if (fooTile === opponentPlayer) {
            // if tile is opposite color it could be flipped, so add to potential flip array
            flips.push([fooCol, fooRow]);
          } else if (fooTile === this.currentPlayer && i > 1) {
            // hit current players tile which means capture is complete
            skip = true;
          } else {
            // either hit current players own color before hitting an opponent's
            // or hit an empty space
            flips = [];
            skip = true;
          }
        }
      }
      return flips;
    }
  }, {
    key: 'isComplete',
    value: function isComplete() {
      if (this.moveKey === 60) {
        this.complete = true;
        this.msg = 'good game';
        return;
      }
      var empties = [];
      for (var i = 0; i < this.BOARDDIM; i++) {
        for (var j = 0; j < this.BOARDDIM; j++) {
          if (this.board[i][j] === this.EMPTY) {
            empties.push([i, j]);
          }
        }
      }
      var validMovesRemain = false;
      if (empties.length) {
        for (var _i = 0; _i < empties.length && !validMovesRemain; _i++) {
          var gameCopy = new Reversi(this);
          // Object.assign(gameCopy, JSON.parse(JSON.stringify(this)))
          gameCopy.currentPlayer = this.BLACK;
          gameCopy.makeMove(empties[_i]);
          if (!gameCopy.error) {
            validMovesRemain = true;
          }
          gameCopy = new Reversi(this);
          // Object.assign(gameCopy, JSON.parse(JSON.stringify(this)))
          gameCopy.currentPlayer = this.WHITE;
          gameCopy.makeMove(empties[_i]);
          if (!gameCopy.error) {
            validMovesRemain = true;
          }
          gameCopy = undefined;
        }
      }
      if (validMovesRemain) {
        this.error = true;
        this.msg = 'Invalid Game (moves still available)';
      } else {
        this.complete = true;
        this.msg = 'good game';
      }
    }
  }, {
    key: 'calcWinners',
    value: function calcWinners() {
      this.isComplete();
      if (this.error) return new Error('Game not complete');
      var w = 0;
      var b = 0;
      for (var i = 0; i < 64; i++) {
        var row = Math.floor(i / 8);
        var col = i % 8;
        w += this.board[col][row] === this.WHITE ? 1 : 0;
        b += this.board[col][row] === this.BLACK ? 1 : 0;
      }
      this.whiteScore = w;
      this.blackScore = b;
    }
  }, {
    key: 'isSymmetrical',
    value: function isSymmetrical() {
      var RotSym = true;
      var Y0Sym = true;
      var X0Sym = true;
      var XYSym = true;
      var XnYSym = true;
      for (var i = 0; i < this.BOARDDIM && (RotSym || Y0Sym || X0Sym || XYSym || XnYSym); i++) {
        for (var j = 0; j < this.BOARDDIM && (RotSym || Y0Sym || X0Sym || XYSym || XnYSym); j++) {
          // rotational symmetry
          if (this.board[i][j] != this.board[7 - i][7 - j]) {
            RotSym = false;
          }
          // symmetry on y = 0
          if (this.board[i][j] != this.board[i][7 - j]) {
            Y0Sym = false;
          }
          // symetry on x = 0
          if (this.board[i][j] != this.board[7 - i][j]) {
            X0Sym = false;
          }
          // symmetry on x = y
          if (this.board[i][j] != this.board[7 - j][7 - i]) {
            XYSym = false;
          }
          // symmetry on x = -y
          if (this.board[i][j] != this.board[j][i]) {
            XnYSym = false;
          }
        }
      }
      if (RotSym || Y0Sym || X0Sym || XYSym || XnYSym) {
        this.symmetrical = true;
        this.RotSym = RotSym;
        this.Y0Sym = Y0Sym;
        this.X0Sym = X0Sym;
        this.XYSym = XYSym;
        this.XnYSym = XnYSym;
      }
    }
  }, {
    key: 'buildMovesString',
    value: function buildMovesString() {
      var _this2 = this;

      this.movesString = this.moves.map(function (move) {
        return _this2.arrayToMove(move[0], move[1]);
      }).join('');
    }
  }, {
    key: 'pickRandomMove',
    value: function pickRandomMove() {
      var validMoves = this.getValidMoves();
      if (!validMoves.length) {
        this.currentPlayer = this.currentPlayer === this.BLACK ? this.WHITE : this.BLACK;
        validMoves = this.getValidMoves();
      }
      return validMoves.length !== 0 && validMoves[Math.floor(Math.random() * validMoves.length)];
    }
  }, {
    key: 'mine',
    value: function mine() {
      this.clearAttrs();
      var skip = false;
      for (var i = 0; i < 60 && !skip; i++) {
        var move = i == 0 ? this.STARTMOVE : this.pickRandomMove(); // first move is always C4 to prevent translation solutions
        if (move) {
          this.moves.push(move);
          this.buildMovesString();
          this.moveKey++;
          this.makeMove(move);
          if (this.error) {
            this.error = false;
            this.currentPlayer = this.currentPlayer === this.BLACK ? this.WHITE : this.BLACK;
            this.makeMove(move);
            if (this.error) {
              skip = true;
            }
          }
        } else {
          skip = true;
        }
      }
      this.thisBoardToByteBoard();
      this.isComplete();
      this.calcWinners();
      this.isSymmetrical();
      this.thisMovesToByteMoves();
    }
  }, {
    key: 'getValidMoves',
    value: function getValidMoves() {
      var validMoves = [];
      for (var i = 0; i < this.BOARDDIM; i++) {
        for (var j = 0; j < this.BOARDDIM; j++) {
          if (this.board[i][j] === this.EMPTY) {
            var move = [i, j];
            var testGame = new Reversi(JSON.parse(JSON.stringify(this)));
            testGame.makeMove(move);
            if (!testGame.error) {
              validMoves.push(move);
            }
          }
        }
      }
      return validMoves;
    }
  }, {
    key: 'makeVisualBoard',
    value: function makeVisualBoard() {
      this.visualBoard = this.arrayBoardToRows(this.board.map(function (c) {
        return c.map(function (t) {
          return t === 1 ? 'b' : t === 2 ? 'w' : '-';
        }).join('');
      }).join('').match(/.{1,1}/g)).map(function (r) {
        return r.map(function (t) {
          return t === 'b' ? '⬛️' : t === 'w' ? '⬜️' : '❎';
        });
      });
      return this.visualBoard;
    }
  }, {
    key: 'moveToArray',
    value: function moveToArray(moveArray) {
      return [moveArray[0].toLowerCase().charCodeAt(0) - 97 + 0, parseInt(moveArray[1]) - 1 + 0];
    }
  }, {
    key: 'stringMovesToBinaryMoves',
    value: function stringMovesToBinaryMoves() {
      var _this3 = this;

      var stringMoves = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      if (!stringMoves) return;
      stringMoves = stringMoves.match(/.{1,2}/g).map(function (move) {
        if (move.length < 2) return;
        var moveArray = move.match(/.{1,1}/g);
        var m = _this3.moveToArray(moveArray);
        var foo = new _bn2.default(m[0] + m[1] * 8 + 64);
        return foo.toString(2);
      }).join('');
      if (stringMoves.length < 64 * 7) {
        var padding = 64 * 7 - stringMoves.length;
        padding = new Array(padding);
        padding = padding.fill('0').join('');
        stringMoves += padding;
      }
      return stringMoves;
    }
  }, {
    key: 'playGameMovesString',
    value: function playGameMovesString() {
      var moves = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      return this.playGameMovesArray(this.stringMovesToArrayMoves(moves));
    }
  }, {
    key: 'playGameByteMoves',
    value: function playGameByteMoves() {
      var byteFirst32Moves = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.byteFirst32Moves;
      var byteLastMoves = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.byteLastMoves;

      this.playGameMovesString(this.byteMovesToStringMoves(byteFirst32Moves, byteLastMoves));
      return this;
    }
  }, {
    key: 'playMove',
    value: function playMove() {
      var moveKey = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var moves = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.moves;

      if (typeof moves[moveKey] === 'undefined') return true;
      var move = moves[moveKey];
      this.movesString += move;
      var skip = false;
      this.moveKey++;
      var validMoves = this.getValidMoves();
      var moveArray = this.moveToArray(move);
      var contained = validMoves.findIndex(function (m) {
        return m[0] === moveArray[0] && m[1] === moveArray[1];
      });
      if (contained < 0 && validMoves.length > 0) {
        this.error = 'invalid move';
        return true;
      }
      this.makeMove(moveArray);
      if (this.error) {
        this.error = false;
        this.currentPlayer = this.currentPlayer === this.BLACK ? this.WHITE : this.BLACK;
        this.makeMove(moveArray);
        if (this.error) {
          skip = true;
        }
      }
      return skip;
    }
  }, {
    key: 'playGameMovesArray',
    value: function playGameMovesArray() {
      var moves = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.moves;

      if (moves.length === 0) return;
      this.clearAttrs();
      this.moves = moves;
      this.thisMovesToByteMoves();
      var skip = false;
      for (var i = 0; i < this.moves.length && !skip; i++) {
        skip = this.playMove(i);
      }
      this.thisBoardToByteBoard();
      if (!this.error) {
        this.isComplete();
        this.calcWinners();
        this.isSymmetrical();
      }
      return this;
      // this.makeVisualBoard()
    }
  }, {
    key: 'colArrayBoardToBinaryBoard',
    value: function colArrayBoardToBinaryBoard() {
      var colArrayBoard = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (!colArrayBoard.length) return;
      var boardString = '';
      for (var col = 0; col < colArrayBoard.length; col++) {
        for (var row = 0; row < colArrayBoard[col].length; row++) {
          var tile = colArrayBoard[col][row];
          boardString += tile === 1 ? '01' : tile === 2 ? '10' : '11';
        }
      }
      return boardString;
    }
  }, {
    key: 'colArrayBoardToByteBoard',
    value: function colArrayBoardToByteBoard() {
      var colArrayBoard = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (!colArrayBoard.length) return;
      return this.binaryBoardToByteBoard(this.colArrayBoardToBinaryBoard(colArrayBoard));
    }
  }, {
    key: 'binaryBoardToByteBoard',
    value: function binaryBoardToByteBoard(binaryBoard) {
      var foo = new _bn2.default(binaryBoard, 2);
      return foo.toString(16);
    }
  }, {
    key: 'sliceBinaryMovesToBytes',
    value: function sliceBinaryMovesToBytes(binaryMoves) {
      var len = binaryMoves.length;
      if (len < 64 * 7) {
        var padding = 64 * 7 - len;
        padding = new Array(padding);
        padding = padding.fill('0').join('');
        binaryMoves = binaryMoves + padding;
      }
      return [this.binaryMovesToByteMoves(binaryMoves.slice(0, 224)), this.binaryMovesToByteMoves(binaryMoves.slice(224))];
    }
  }, {
    key: 'byteBoardPopulateBoard',
    value: function byteBoardPopulateBoard() {
      var byteBoard = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.byteBoard;

      this.board = this.arrayBoardToCols(this.byteBoardToArrayBoard(byteBoard).map(function (t) {
        return t === 'b' ? 1 : t === 'w' ? 2 : 3;
      }));
    }
  }, {
    key: 'byteBoardToArrayBoard',
    value: function byteBoardToArrayBoard() {
      var byteBoard = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.byteBoard;

      if (byteBoard.slice(0, 2) === '0x') {
        byteBoard = byteBoard.slice(2);
      }
      byteBoard = new _bn2.default(byteBoard, 16);
      byteBoard = byteBoard.toString(2);
      var len = byteBoard.length;
      if (len < 128) {
        var padding = 128 - len;
        padding = new Array(padding);
        padding = padding.fill('0').join('');
        byteBoard = padding + byteBoard;
      }
      return byteBoard.match(/.{1,2}/g).map(function (tile) {
        return tile === '01' ? 'b' : tile === '10' ? 'w' : '-';
      });
    }
  }, {
    key: 'byteBoardToRowArray',
    value: function byteBoardToRowArray() {
      var byteBoard = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.byteBoard;

      return this.arrayBoardToRows(this.byteBoardToArrayBoard(byteBoard));
    }
  }, {
    key: 'byteBoardToColArray',
    value: function byteBoardToColArray() {
      var byteBoard = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.byteBoard;

      return this.arrayBoardToCols(this.byteBoardToArrayBoard(byteBoard));
    }
  }, {
    key: 'multiArrayBoardToRows',
    value: function multiArrayBoardToRows() {
      var _this4 = this;

      var arrayBoard = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      return this.arrayBoardToRows2D(arrayBoard.map(function (r) {
        return r.map(function (t) {
          return t === _this4.BLACK ? 'b' : t === _this4.WHITE ? 'w' : '-';
        });
      }));
    }
  }, {
    key: 'arrayBoardToRows2D',
    value: function arrayBoardToRows2D() {
      var arrayBoard = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      var rowsArray = [];
      for (var col = 0; col < arrayBoard.length; col++) {
        for (var i = 0; i < arrayBoard[col].length; i++) {
          if (!rowsArray[col]) rowsArray[col] = [];
          rowsArray[col].push(arrayBoard[i][col]);
        }
      }
      return rowsArray;
    }
  }, {
    key: 'arrayBoardToRows',
    value: function arrayBoardToRows() {
      var arrayBoard = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      var rowsArray = [];
      for (var i = 0; i < 64; i++) {
        var row = i % 8;
        if (!rowsArray[row]) rowsArray[row] = [];
        rowsArray[row].push(arrayBoard[i]);
      }
      return rowsArray;
    }
  }, {
    key: 'arrayBoardToCols',
    value: function arrayBoardToCols() {
      var arrayBoard = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      var colsArray = [];
      for (var i = 0; i < 64; i++) {
        var col = Math.floor(i / 8);
        if (!colsArray[col]) colsArray[col] = [];
        colsArray[col].push(arrayBoard[i]);
      }
      return colsArray;
    }
  }, {
    key: 'stringBoardToArrayBoard',
    value: function stringBoardToArrayBoard() {
      var stringBoard = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      return stringBoard && stringBoard.match(/.{1,1}/g).map(function (spot) {
        return spot === 'b' ? '01' : spot === 'w' ? '10' : '11';
      }).join('');
    }
  }, {
    key: 'stringMovesToArrayMoves',
    value: function stringMovesToArrayMoves() {
      var stringMoves = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      if (!stringMoves) return;
      return stringMoves.match(/.{1,2}/g);
    }
  }, {
    key: 'pickRandomMove',
    value: function pickRandomMove() {
      var validMoves = this.getValidMoves();
      if (!validMoves.length) {
        this.currentPlayer = this.currentPlayer === this.BLACK ? this.WHITE : this.BLACK;
        validMoves = this.getValidMoves();
      }
      return validMoves.length !== 0 && validMoves[Math.floor(Math.random() * validMoves.length)];
    }
  }, {
    key: 'byteMovesToStringMoves',
    value: function byteMovesToStringMoves() {
      var byteFirst32Moves = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var byteLastMoves = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      if (byteFirst32Moves.slice(0, 2) === '0x') {
        byteFirst32Moves = byteFirst32Moves.slice(2);
      }
      if (byteLastMoves.slice(0, 2) === '0x') {
        byteLastMoves = byteLastMoves.slice(2);
      }
      var byteMoves = byteFirst32Moves + byteLastMoves;
      byteMoves = new _bn2.default(byteMoves, 16);
      var binaryMoves = byteMoves.toString(2);
      return this.binaryMovesToStringMoves(binaryMoves);
    }
  }, {
    key: 'returnByteMoves',
    value: function returnByteMoves() {
      return [this.byteFirst32Moves, this.byteLastMoves];
    }
  }, {
    key: 'binaryMovesToByteMoves',
    value: function binaryMovesToByteMoves() {
      var binaryMoves = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      if (!binaryMoves) return;
      var foo = new _bn2.default(binaryMoves, 2);
      return foo.toString(16);
    }
  }, {
    key: 'stringMovesToByteMoves',
    value: function stringMovesToByteMoves(stringMoves) {
      return this.binaryMovesToByteMoves(this.stringMovesToBinaryMoves(stringMoves));
    }
  }, {
    key: 'binaryMovesToStringMoves',
    value: function binaryMovesToStringMoves() {
      var _this5 = this;

      var binaryMoves = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      binaryMoves = binaryMoves && new _bn2.default(binaryMoves, 2);
      binaryMoves = binaryMoves.toString(2);
      if (binaryMoves.length < 64 * 7) {
        var padding = 64 * 7 - binaryMoves.length;
        padding = new Array(padding);
        padding = padding.fill('0').join('');
        binaryMoves += padding;
      }
      return binaryMoves.match(/.{1,7}/g).map(function (move) {
        move = new _bn2.default(move, 2).toNumber(10);
        if (move < 64) {
          return false;
        } else {
          move -= 64;
          var col = move % 8;
          move -= col;
          var row = move / 8;
          return _this5.arrayToMove(col, row);
        }
      }).filter(function (move) {
        return move;
      }).join('').toUpperCase();
    }
  }, {
    key: 'translateToC4Version',
    value: function translateToC4Version() {
      var moves = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.moves;

      if (!moves.length) return new Error('No Moves');
      var translated = [];
      for (var i = 0; i < moves.length; i++) {
        var move = moves[i];
        move = this.moveToArray(move);

        switch (moves[0].toLowerCase()) {
          case 'f5':
            move = move.map(function (m) {
              return 7 - m;
            });
            break;
          case 'd3':
            move = [move[1], move[0]];
            break;
          case 'e6':
            move = [7 - move[1], 7 - move[0]];
            break;
          case 'c4':
            break;
          default:
            throw new Error('impossibru!!!' + moves[0].toLowerCase());
        }

        move = this.arrayToMove(move[0], move[1]);
        translated[i] = move;
      }
      this.moves = translated;
      this.playGameMovesArray();
    }
  }, {
    key: 'arrayToMove',
    value: function arrayToMove(col, row) {
      return 'abcdefghijklmnopqrstuvwxyz'[col] + (row + 1);
    }
  }, {
    key: 'sliceMovesStringToBytes',
    value: function sliceMovesStringToBytes() {
      var moves = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      return this.sliceBinaryMovesToBytes(this.vesToBinaryMoves(moves));
    }
  }, {
    key: 'returnSymmetriesAsBN',
    value: function returnSymmetriesAsBN() {
      var symmetries = 0;
      console.log({ symmetries: symmetries });
      if (this.RotSym) symmetries += 16;
      console.log({ symmetries: symmetries });
      if (this.Y0Sym) symmetries += 8;
      console.log({ symmetries: symmetries });
      if (this.X0Sym) symmetries += 4;
      console.log({ symmetries: symmetries });
      if (this.XYSym) symmetries += 2;
      console.log({ symmetries: symmetries });
      if (this.XnYSym) symmetries += 1;
      console.log({ symmetries: symmetries });
      return new _bn2.default(symmetries);
    }
  }]);

  return Reversi;
}();

exports.default = Reversi;