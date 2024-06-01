import * as Game from "./src/game"
import * as Wordlist from "./src/wordlist"
import * as fs from "fs"


const game = Game.createEmpty(10, 10)
Game.randomizeWalls(game)

const listTxt = fs.readFileSync("./wordlists/english.txt", "utf-8")
const wordlist = Wordlist.createFrom(listTxt)
Game.randomizeWords(game, wordlist)

console.log(Game.print(game))