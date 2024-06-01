export const MATCH_ANY = "*"


export interface Wordlist
{
    wordsByLength: string[][]
    cache: Map<string, string[]>
}


export function createFrom(str: string): Wordlist
{
    const wordlist: Wordlist = {
        wordsByLength: [],
        cache: new Map<string, string[]>(),
    }

    for (const line of str.split("\n"))
    {
        const word = line.trim()

        while (wordlist.wordsByLength.length <= word.length)
            wordlist.wordsByLength.push([])

        wordlist.wordsByLength[word.length].push(word)
    }

    return wordlist
}


export function getWords(
    wordlist: Wordlist,
    length: number,
    wantedCells?: string[])
    : string[]
{
    if (length <= 0 ||
        length >= wordlist.wordsByLength.length)
        return []

    const list = wordlist.wordsByLength[length]

    if (list.length === 0)
        return []

    if (wantedCells === undefined ||
        wantedCells.every(m => m === MATCH_ANY))
        return list

    const cacheKey = wantedCells.join("")
    const cached = wordlist.cache.get(cacheKey)
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
    
    wordlist.cache.set(cacheKey, matches)
    return matches
}


export function getWord(
    wordlist: Wordlist,
    length: number,
    wantedCells?: string[])
    : string | undefined
{
    const list = getWords(wordlist, length, wantedCells)
    if (list.length === 0)
        return undefined

    return list[Math.floor(Math.random() * list.length)]
}