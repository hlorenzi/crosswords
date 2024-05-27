import * as Game from "./game"


const game = Game.createEmpty(10, 10)
Game.randomizeWalls(game)
Game.randomizeWords(game)
console.log(Game.print(game))