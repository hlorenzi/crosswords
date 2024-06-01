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

    return <EditPanelRoot>
        <GameBoard
            game={Editor.getBoard(props.editor)}
            editor={props.editor}
            setEditor={props.setEditor}
        />

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
    const letterCode = ev.key.toUpperCase().charCodeAt(0)

    if (ev.key.length === 1 &&
        letterCode >= "A".charCodeAt(0) &&
        letterCode <= "Z".charCodeAt(0))
    {
        Editor.typeInCell(editor, String.fromCharCode(letterCode))
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
}


const EditPanelRoot = styled.div`
    
`