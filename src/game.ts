import * as Wordlist from "./wordlist"


export const MIN_WORD_LENGHT = 3

export const CELL_EMPTY = " "
export const CELL_WALL = "."


export interface Game
{
    width: number
    height: number
    cells: Cell[][]
    clueNumbers: ClueNumber[]
}


export interface Cell
{
    contents: string
    acrossClueIndex?: number
    downClueIndex?: number
}


export interface CellIndex
{
    x: number
    y: number
}


export interface ClueNumber
{
    number: number
    cellIndex: CellIndex
    across?: Clue
    down?: Clue
}


export interface Clue
{
    prompt: string
    answerLength: number
}


export function createEmpty(
    width: number,
    height: number)
    : Game
{
    const cells: Cell[][] = []
    for (let j = 0; j < height; j++)
    {
        const row: Cell[] = []
        for (let i = 0; i < width; i++)
        {
            row.push({
                contents: CELL_EMPTY,
                acrossClueIndex: 0,
                downClueIndex: 0,
            })
        }

        cells.push(row)
    }

    const game: Game = {
        width,
        height,
        cells,
        clueNumbers: [],
    }

    redistributeClues(game)

    return game
}


export function clone(
    game: Game)
    : Game
{
    const cells: Cell[][] = []
    for (let j = 0; j < game.height; j++)
    {
        const row: Cell[] = []
        for (let i = 0; i < game.width; i++)
        {
            row.push({ ...getCell(game, i, j) })
        }

        cells.push(row)
    }

    const newGame: Game = {
        width: game.width,
        height: game.height,
        cells,
        clueNumbers: [...game.clueNumbers],
    }

    redistributeClues(newGame)

    return newGame
}


export function isValidCell(
    game: Game,
    x: number,
    y: number)
    : boolean
{
    return x >= 0 && y >= 0 && x < game.width && y < game.height
}


export function getCell(
    game: Game,
    x: number,
    y: number)
    : Cell
{
    return game.cells[y][x]
}


export function setCell(
    game: Game,
    x: number,
    y: number,
    contents: string)
{
    const cell = getCell(game, x, y)
    const prevContents = cell.contents

    cell.contents = contents

    if (contents === CELL_WALL ||
        prevContents === CELL_WALL)
    {
        redistributeClues(game)
    }
}


export function print(
    game: Game)
{
    let result = ""

    for (let j = 0; j < game.height; j++)
    {
        result += "|"

        for (let i = 0; i < game.width; i++)
            result += getCell(game, i, j) + "|"

        result += "\n"
    }

    return result
}


export function calculateClueNumbers(
    game: Game)
    : ClueNumber[]
{
    const clueNumbers: ClueNumber[] = []

    for (let y = 0; y < game.width; y++)
    {
        for (let x = 0; x < game.height; x++)
        {
            if (getCell(game, x, y).contents === CELL_WALL)
                continue

            const hasAcross =
                !isValidCell(game, x - 1, y) ||
                getCell(game, x - 1, y).contents === CELL_WALL
            
            const hasDown =
                !isValidCell(game, x, y - 1) ||
                getCell(game, x, y - 1).contents === CELL_WALL

            if (!hasAcross && !hasDown)
                continue

            clueNumbers.push({
                number: clueNumbers.length + 1,
                cellIndex: { x, y },
                across: !hasAcross ? undefined : {
                    prompt: "",
                    answerLength: getWordLengthTowards(game, x, y, 1, 0),
                },
                down: !hasDown ? undefined : {
                    prompt: "",
                    answerLength: getWordLengthTowards(game, x, y, 0, 1),
                },
            })
        }
    }

    return clueNumbers
}


export function redistributeClues(
    game: Game)
{
    const oldClueNumbers = game.clueNumbers

    game.clueNumbers = calculateClueNumbers(game)

    // Integrate previous clue prompts
    for (let c = 0; c < oldClueNumbers.length; c++)
    {
        const old = oldClueNumbers[c]

        if (old.across)
        {
            const newAcross = game.clueNumbers.find(clue =>
                clue.across &&
                clue.cellIndex.x === old.cellIndex.x &&
                clue.cellIndex.y === old.cellIndex.y)

            if (newAcross)
                newAcross.across!.prompt = old.across.prompt
        }

        if (old.down)
        {
            const newDown = game.clueNumbers.find(clue =>
                clue.down &&
                clue.cellIndex.x === old.cellIndex.x &&
                clue.cellIndex.y === old.cellIndex.y)

            if (newDown)
                newDown.down!.prompt = old.down.prompt
        }
    }

    // Clear cell references
    for (let y = 0; y < game.width; y++)
    {
        for (let x = 0; x < game.height; x++)
        {
            const cell = getCell(game, x, y)
            cell.acrossClueIndex = undefined
            cell.downClueIndex = undefined
        }
    }

    // Set up cell references
    for (let c = 0; c < game.clueNumbers.length; c++)
    {
        const clue = game.clueNumbers[c]
        const start = clue.cellIndex

        if (clue.across)
        {
            for (let l = 0; l < clue.across.answerLength; l++)
                getCell(game, start.x + l, start.y).acrossClueIndex = c
        }

        if (clue.down)
        {
            for (let l = 0; l < clue.down.answerLength; l++)
                getCell(game, start.x, start.y + l).downClueIndex = c
        }
    }
}


export function getWordLengthTowards(
    game: Game,
    x: number,
    y: number,
    xStep: number,
    yStep: number)
{
    let length = 0

    while (true)
    {
        const xCell = x + length * xStep
        const yCell = y + length * yStep

        if (!isValidCell(game, xCell, yCell))
            break

        if (getCell(game, xCell, yCell).contents === CELL_WALL)
            break

        length += 1
    }

    return length
}


export function randomizeWalls(
    game: Game)
{
    const hasEnoughLengthTowards = (x: number, y: number, xStep: number, yStep: number) => {
        const length = getWordLengthTowards(game, x + xStep, y + yStep, xStep, yStep)
        return length === 0 || length >= MIN_WORD_LENGHT
    }

    const checkEnoughLengths = (x: number, y: number) =>
    {
        return hasEnoughLengthTowards(x, y, 1, 0) &&
            hasEnoughLengthTowards(x, y, -1, 0) &&
            hasEnoughLengthTowards(x, y, 0, 1) &&
            hasEnoughLengthTowards(x, y, 0, -1)
    }

    const numWalls = Math.ceil(
        (game.width + game.height) / 2 * (0.5 + Math.random()))

    for (let w = 0; w < numWalls; w++)
    {
        let wallX, wallY;

        let budget = 1000
        while (true)
        {
            budget -= 1
            if (budget <= 0)
                return

            wallX = Math.floor(Math.random() * game.width)
            wallY = Math.floor(Math.random() * game.height)
            
            if (getCell(game, wallX, wallY).contents === CELL_WALL)
                continue

            if (!checkEnoughLengths(wallX, wallY) ||
                !checkEnoughLengths(game.width - 1 - wallX, game.height - 1 - wallY))
                continue

            break
        }

        setCell(game, wallX, wallY, CELL_WALL)
        setCell(game, game.width - 1 - wallX, game.height - 1 - wallY, CELL_WALL)
    }
}


export function randomizeWords(
    game: Game,
    wordlist: Wordlist.Wordlist)
    : boolean
{
    return randomizeWordsRecursive(game, wordlist, 0, 0)
}


function randomizeWordsRecursive(
    game: Game,
    wordlist: Wordlist.Wordlist,
    x: number,
    y: number)
    : boolean
{
    let xNext = x + 1
    let yNext = y
    if (xNext >= game.width)
    {
        xNext = 0
        yNext += 1
        if (yNext >= game.height)
        {
            //console.log("success!")
            return true
        }
    }

    if (getCell(game, x, y).contents === CELL_WALL)
        return randomizeWordsRecursive(game, wordlist, xNext, yNext)

    if (isValidCell(game, x - 1, y) &&
        getCell(game, x - 1, y).contents !== CELL_WALL)
        return randomizeWordsRecursive(game, wordlist, xNext, yNext)

    const length = getWordLengthTowards(game, x, y, 1, 0)

    const matches = new Array<string>(length)
    for (let across = 0; across < length; across++)
    {
        const acrossLetter = getCell(game, x + across, y).contents
        matches[across] =
            acrossLetter === CELL_EMPTY ? Wordlist.MATCH_ANY :
            acrossLetter
    }

    const wordList = [...Wordlist.getWords(wordlist, length, matches)]

    while (wordList.length > 0)
    {
        const index = Math.floor(Math.random() * wordList.length)
        const word = wordList[index]
        wordList.splice(index, 1)

        let hasDownMatch = true
        let downLists: string[][] = []

        for (let letter = 0; letter < length; letter++)
        {
            const toTop = getWordLengthTowards(game, x + letter, y, 0, -1) - 1
            const downLength = getWordLengthTowards(game, x + letter, y - toTop, 0, 1)
            const downMatches = new Array<string>(downLength)
            for (let down = 0; down < downLength; down++)
            {
                const downLetter = getCell(game, x + letter, y - toTop + down).contents
                downMatches[down] =
                    downLetter === CELL_EMPTY ? Wordlist.MATCH_ANY :
                    downLetter

                if (down === toTop)
                    downMatches[down] = word[letter]
            }

            const downWords = Wordlist.getWords(wordlist, downLength, downMatches)
            if (downWords.length === 0)
                hasDownMatch = false
            
            downLists.push(downWords)
        }

        if (!hasDownMatch)
            continue

        for (let letter = 0; letter < length; letter++)
        {
            setCell(game, x + letter, y, word[letter])
    
            if (downLists[letter].length === 1)
            {
                const downWord = downLists[letter][0]
                const toTop = getWordLengthTowards(game, x + letter, y, 0, -1) - 1
                for (let downLetter = 0; downLetter < downWord.length; downLetter++)
                    setCell(game, x + letter, y - toTop + downLetter, downWord[downLetter])
            }
        }

        //console.log(`try: ${word}`)
        //console.log(`- down matches [${downLists.map(d => d.length).join(",")}] ex.: [${downLists.map(d => d[0]).join(", ")}]`)
        //console.log(print(game))

        const result = randomizeWordsRecursive(game, wordlist, xNext, yNext)
        if (result)
            return true
        
        for (let letter = 0; letter < length; letter++)
        {
            setCell(game, x + letter, y, CELL_EMPTY)
    
            if (downLists[letter].length === 1)
            {
                const downWord = downLists[letter][0]
                const toTop = getWordLengthTowards(game, x + letter, y, 0, -1) - 1
                for (let downLetter = 0; downLetter < downWord.length; downLetter++)
                {
                    const yDown = y - toTop + downLetter
                    if (yDown > y)
                        setCell(game, x + letter, yDown, CELL_EMPTY)
                }
            }
        }
    }

    return false
}