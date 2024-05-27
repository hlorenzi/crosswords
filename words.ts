import fs from "fs"


export const MATCH_ANY = "*"


const wordsByLength: string[][] = []


export function init()
{
    if (wordsByLength.length !== 0)
        return

    const words = fs.readFileSync("./words.txt", "utf-8").split("\n")
    for (const word of words)
    {
        while (wordsByLength.length <= word.length)
            wordsByLength.push([])

        wordsByLength[word.length].push(word)
    }
}


const cache = new Map<string, string[]>


export function getWordList(
    length: number,
    wantedCells?: string[])
    : string[]
{
    init()

    if (length <= 0 ||
        length >= wordsByLength.length)
        return []

    const list = wordsByLength[length]

    if (list.length === 0)
        return []

    if (wantedCells === undefined ||
        wantedCells.every(m => m === MATCH_ANY))
        return list

    const cacheKey = wantedCells.join("")
    const cached = cache.get(cacheKey)
    if (cached !== undefined)
        return cached
    
    const matches: string[] = []
    for (const word of list)
    {
        let isMatch = true

        for (let c = 0; c < length; c++)
        {
            if (wantedCells[c] === MATCH_ANY)
                continue

            if (wantedCells[c] !== word[c])
                isMatch = false
        }

        if (!isMatch)
            continue

        matches.push(word)
    }
    
    cache.set(cacheKey, matches)
    return matches
}


export function getWord(
    length: number,
    wantedCells?: string[])
    : string | undefined
{
    const list = getWordList(length, wantedCells)
    if (list.length === 0)
        return undefined

    return list[Math.floor(Math.random() * list.length)]
}