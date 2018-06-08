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