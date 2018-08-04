const Reversi = require("../lib/reversi").default;
let r;
let validC4Moves =
  "C4C5C6C3E3B5C2B2A4E2A2B3F5C7C8B6A6B1F3A7B7D6F2G2G3A5B4C1D2A3H2D1F4G5G4F1F6D8H4H3H1E1A1H5G1F7F8E7H6B8D3D7E6G6E8G8G7H7A8H8";
let validC4First32BytesMoves =
  "b58b552a986549b132451cbcbd69d106af0e3ae6cead82cc297427c3";
let validC4Last32BytesMoves =
  "bb9af45dbeefd78f120678dd7ef4dfe69f3d9bbe7eeddfc7f0000000";
let validC4ByteBoard = "55555aa5569955695569555955555555";
let validC4board = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 2, 2, 2, 2, 1, 1],
  [1, 1, 1, 2, 2, 1, 2, 1],
  [1, 1, 1, 1, 1, 2, 2, 1],
  [1, 1, 1, 1, 1, 2, 2, 1],
  [1, 1, 1, 1, 1, 1, 2, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1]
];

let validF5Moves =
  "F5F4F3F6D6G4F7G7H5D7H7G6C4F2F1G3H3G8C6H2G2E3C7B7B6H4G5F8E7H6A7E8C5B4B5C8C3E1A5A6A8D8H8A4B8C2C1D2A3G1E6E2D3B3D1B1B2A2H1A1";
let validD3Moves =
  "D3E3F3C3C5E2B3B2D1B5B1C2E6G3H3F2F1A2C6G1G2F4B6B7C7E1D2A3B4C1B8A4D6E7D7A6F6H4D8C8A8A5A1E8A7G6H6G5F8H2C4G4F5F7H5H7G7G8H1H8";
let validE6Moves =
  "E6D6C6F6F4D7G6G7E8G4G8F7D3B6A6C7C8H7F3B8B7C5G3G2F2D8E7H6G5F8G1H5E3D2E2H3C3A5E1F1H1H4H8D1H2B3A3B4C1A7F5B5C4C2A4A2B2B1A8A1";
beforeEach(() => {
  r = new Reversi();
});

test("thisMovesToByteMoves", () => {
  r.thisMovesToByteMoves(r.stringMovesToArrayMoves(validC4Moves));
  expect(r.byteFirst32Moves).toBe(validC4First32BytesMoves);
  expect(r.byteLastMoves).toBe(validC4Last32BytesMoves);
});

test("thisBoardToByteBoard", () => {
  r.playGameMovesString(validC4Moves);
  let board = r.board;
  r.thisBoardToByteBoard();
  expect(r.byteBoard).toBe(validC4ByteBoard);
});

test("makeMove", () => {
  let playerBefore = r.currentPlayer;
  expect(playerBefore).toBe(r.BLACK);

  let movesBefore = r.moves;
  expect(movesBefore.length).toBe(0);

  let moves = r.stringMovesToArrayMoves(validC4Moves);

  r.makeMove(r.moveToArray(moves[0]));

  let playerAfter = r.currentPlayer;
  expect(playerAfter).toBe(r.WHITE);
});

test("translateToC4Version", () => {
  r.playGameMovesString(validF5Moves);
  r.translateToC4Version();
  expect(r.movesString.toLowerCase()).toBe(validC4Moves.toLowerCase());

  r.playGameMovesString(validD3Moves);
  r.translateToC4Version();
  expect(r.movesString.toLowerCase()).toBe(validC4Moves.toLowerCase());

  r.playGameMovesString(validE6Moves);
  r.translateToC4Version();
  expect(r.movesString.toLowerCase()).toBe(validC4Moves.toLowerCase());
});

test("mine", () => {
  let moves = r.stringMovesToArrayMoves(validC4Moves);
  r.pickRandomMove = function() {
    return r.moveToArray(moves[this.moves.length]);
  };
  r.mine();
  expect(r.symmetrical).toBe(true);
});

test.skip("mine time", () => {
  let count = 0;
  while (!r.symmetrical) {
    count++;
    r.mine();
  }
  console.log("mine took " + count + " tries");
  console.log(r.movesString);
});
