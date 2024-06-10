import * as Solid from "solid-js"
import { styled } from "solid-styled-components"
import * as Game from "../game"
import * as Editor from "../editor"
import { GameBoard } from "./Board"


export function EditPanel(props: {
    editor: Editor.Editor,
    setEditor: () => void,
})
{
    Solid.createEffect(() => {
        const onKeyDown = (ev: KeyboardEvent) =>
            handleKeyDown(ev, props.editor, props.setEditor)

        window.addEventListener("keydown", onKeyDown)

        Solid.onCleanup(() => {
            window.removeEventListener("keydown", onKeyDown)
        })
    })

    const currentClue = Solid.createMemo(() => {
        const board = Editor.getBoard(props.editor)
        const cell = Game.getCell(board, props.editor.cursor.x, props.editor.cursor.y)
        const clueIndex =
            props.editor.cursorVertical ? cell.downClueIndex :
            cell.acrossClueIndex

        if (clueIndex === undefined)
            return undefined

        const clueNumber = board.clueNumbers[clueIndex]
        const clue =
            props.editor.cursorVertical ? clueNumber.down :
            clueNumber.across

        if (clue === undefined)
            return undefined

        return {
            index: clueIndex,
            number: clueNumber.number,
            isDown: props.editor.cursorVertical,
            clue,
        }
    })

    const rewriteCluePrompt = Solid.createMemo(() => () => {
        const clue = currentClue()
        if (!clue)
            return

        const clueNumber = clue.number + "-" + (clue.isDown ? "D" : "A")
        const prompt = window.prompt(`Clue for ${clueNumber}?`, clue.clue.prompt)
        if (prompt === null)
            return

        Editor.setCluePrompt(
            props.editor,
            clue.index,
            clue.isDown,
            prompt)
        props.setEditor()
    })

    return <EditPanelRoot>
        <GameBoard
            game={Editor.getBoard(props.editor)}
            editor={props.editor}
            setEditor={props.setEditor}
        />

        <ClueStripRoot onClick={rewriteCluePrompt()}>
            { currentClue() === undefined ? null :
                <>
                <ClueNumber>
                    { currentClue()!.number.toString() + "-" +
                        (currentClue()!.isDown ? "D" : "A") }
                </ClueNumber>
                <br/>
                { currentClue()!.clue.prompt }
                </>
            }
        </ClueStripRoot>

        <button onClick={() => {
            Editor.clearBoard(props.editor)
            props.setEditor()
        }}>
            Clear
        </button>
        
        <button onClick={() => {
            Editor.undo(props.editor)
            props.setEditor()
        }}>
            &lt;&lt; Undo
        </button>
        
        <button onClick={() => {
            Editor.redo(props.editor)
            props.setEditor()
        }}>
            Redo &gt;&gt;
        </button>

    </EditPanelRoot>
}


function handleKeyDown(
    ev: KeyboardEvent,
    editor: Editor.Editor,
    setEditor: () => void)
{
    const letter = ev.key.toUpperCase()

    if (ev.key.length === 1 &&
        RegExp(/^\p{L}/, "u").test(letter))
    {
        Editor.typeInCell(editor, letter)
        setEditor()
        return
    }
    
    if (ev.key === ".")
    {
        Editor.typeInCell(editor, Game.CELL_WALL)
        setEditor()
        return
    }

    if (ev.key === "Backspace")
    {
        Editor.eraseFromCell(editor)
        setEditor()
        return
    }
    
    if (ev.key === " ")
    {
        Editor.moveCursorToNext(editor, false)
        setEditor()
        return
    }
    
    if (ev.key === "Enter")
    {
        editor.cursorVertical = !editor.cursorVertical
        setEditor()
        return
    }
    
    if (ev.key === "ArrowUp")
    {
        Editor.moveCursor(editor, 0, -1)
        setEditor()
        return
    }
    
    if (ev.key === "ArrowDown")
    {
        Editor.moveCursor(editor, 0, 1)
        setEditor()
        return
    }
    
    if (ev.key === "ArrowLeft")
    {
        Editor.moveCursor(editor, -1, 0)
        setEditor()
        return
    }
    
    if (ev.key === "ArrowRight")
    {
        Editor.moveCursor(editor, 1, 0)
        setEditor()
        return
    }
}


const EditPanelRoot = styled.div`
    margin-top: 1em;
    margin-left: auto;
    margin-right: auto;
`


const ClueStripRoot = styled.div`
    width: 100%;
    min-height: 3em;
    margin-top: 1em;
    margin-bottom: 1em;
    padding: 0.5em 1em;
    background-color: #dcefff;
`


const ClueNumber = styled.span`
    font-weight: bold;
`