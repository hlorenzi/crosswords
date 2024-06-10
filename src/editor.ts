import * as Game from "./game"


export interface Editor
{
    history: Game.Game[]
    historyPointer: number

    cursor: { x: number, y: number }
    cursorVertical: boolean
}


export function createEmpty(): Editor
{
    const game = Game.createEmpty(10, 10)
    Game.randomizeWalls(game)

    return {
        history: [game],
        historyPointer: 0,

        cursor: { x: 0, y: 0 },
        cursorVertical: false,
    }
}


export function undo(editor: Editor)
{
    if (editor.historyPointer == 0)
        return

    editor.historyPointer -= 1
}


export function redo(editor: Editor)
{
    if (editor.historyPointer == editor.history.length - 1)
        return
    
    editor.historyPointer += 1
}


export function getBoard(editor: Editor): Game.Game
{
    return editor.history[editor.historyPointer]
}


export function setBoard(editor: Editor, game: Game.Game)
{
    editor.history.splice(editor.historyPointer + 1, editor.history.length)
    editor.history.push(game)
    editor.historyPointer = editor.history.length - 1
}


export function clearBoard(editor: Editor)
{
    setBoard(editor, Game.createEmpty(10, 10))
}


export function typeInCell(editor: Editor, contents: string)
{
    const board = Game.clone(getBoard(editor))
    Game.setCell(board, editor.cursor.x, editor.cursor.y, contents)
    moveCursorToNext(editor, true)
    setBoard(editor, board)
}


export function eraseFromCell(editor: Editor)
{
    const board = Game.clone(getBoard(editor))
    
    if (Game.getCell(board, editor.cursor.x, editor.cursor.y).contents === Game.CELL_EMPTY)
        moveCursorToPrevious(editor, true)

    Game.setCell(board, editor.cursor.x, editor.cursor.y, Game.CELL_EMPTY)

    setBoard(editor, board)
}


export function setCluePrompt(
    editor: Editor,
    clueIndex: number,
    isDown: boolean,
    prompt: string)
{
    const board = Game.clone(getBoard(editor))
    const clueNumber = board.clueNumbers[clueIndex]
    const clue = isDown ? clueNumber.down : clueNumber.across
    if (!clue)
        return

    clue.prompt = prompt
    setBoard(editor, board)
}


export function isInCursorsRange(
    editor: Editor,
    x: number,
    y: number)
    : boolean
{
    if (x === editor.cursor.x &&
        editor.cursorVertical)
    {
        const game = getBoard(editor)
        const toTop = Game.getWordLengthTowards(game, editor.cursor.x, editor.cursor.y, 0, -1)
        const toBottom = Game.getWordLengthTowards(game, editor.cursor.x, editor.cursor.y, 0, 1)
        return y > editor.cursor.y - toTop &&
            y < editor.cursor.y + toBottom
    }
    
    if (y === editor.cursor.y &&
        !editor.cursorVertical)
    {
        const game = getBoard(editor)
        const toLeft = Game.getWordLengthTowards(game, editor.cursor.x, editor.cursor.y, -1, 0)
        const toRight = Game.getWordLengthTowards(game, editor.cursor.x, editor.cursor.y, 1, 0)
        return x > editor.cursor.x - toLeft &&
            x < editor.cursor.x + toRight
    } 
    
    return false
}


export function moveCursor(editor: Editor, xDelta: number, yDelta: number)
{
    const board = getBoard(editor)

    editor.cursor.x += xDelta
    editor.cursor.y += yDelta
    
    if (editor.cursor.x < 0)
        editor.cursor.x = board.width - 1

    if (editor.cursor.x >= board.width)
        editor.cursor.x = 0

    if (editor.cursor.y < 0)
        editor.cursor.y = board.height - 1

    if (editor.cursor.y >= board.height)
        editor.cursor.y = 0
}


export function moveCursorToNext(editor: Editor, skipWalls: boolean)
{
    const board = getBoard(editor)

    let budget = board.width * board.height
    while (budget > 0)
    {
        budget -= 1

        if (editor.cursorVertical)
        {
            editor.cursor.y += 1
            if (editor.cursor.y >= board.height)
            {
                editor.cursor.y = 0
                editor.cursor.x += 1
                if (editor.cursor.x >= board.width)
                {
                    editor.cursor.x = 0
                    editor.cursor.y = 0
                    editor.cursorVertical = false
                }
            }
        }
        else
        {
            editor.cursor.x += 1
            if (editor.cursor.x >= board.width)
            {
                editor.cursor.x = 0
                editor.cursor.y += 1
                if (editor.cursor.y >= board.height)
                {
                    editor.cursor.x = 0
                    editor.cursor.y = 0
                    editor.cursorVertical = true
                }
            }
        }

        if (!skipWalls ||
            Game.getCell(board, editor.cursor.x, editor.cursor.y).contents !== Game.CELL_WALL)
            break
    }
}


export function moveCursorToPrevious(editor: Editor, skipWalls: boolean)
{
    const board = getBoard(editor)

    let budget = board.width * board.height
    while (budget > 0)
    {
        budget -= 1

        if (editor.cursorVertical)
        {
            editor.cursor.y -= 1
            if (editor.cursor.y < 0)
            {
                editor.cursor.y = board.height - 1
                if (editor.cursor.x < 0)
                {
                    editor.cursor.x = board.width - 1
                    editor.cursorVertical = false
                }
            }
        }
        else
        {
            editor.cursor.x -= 1
            if (editor.cursor.x < 0)
            {
                editor.cursor.x = board.width - 1
                editor.cursor.y -= 1
                if (editor.cursor.y < 0)
                {
                    editor.cursor.y = board.height - 1
                    editor.cursorVertical = true
                }
            }
        }

        if (!skipWalls ||
            Game.getCell(board, editor.cursor.x, editor.cursor.y).contents !== Game.CELL_WALL)
            break
    }
}