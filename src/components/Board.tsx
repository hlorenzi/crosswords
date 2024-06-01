import * as Solid from "solid-js"
import { styled } from "solid-styled-components"
import * as Game from "../game"
import * as Editor from "../editor"


export function GameBoard(props: {
    game: Game.Game,
    editor: Editor.Editor,
    setEditor: () => void,
})
{
    return <GameBoardRoot>
        <Solid.Index each={props.game.cells}>
        { (row, y) =>
            <>
            <Solid.Index each={row()}>
            { (cell, x) =>
                <GameCell
                    editor={props.editor}
                    setEditor={props.setEditor}
                    cell={cell()}
                    x={x}
                    y={y}
                />
            }
            </Solid.Index>
            <br/>
            </>
        }
        </Solid.Index>
    </GameBoardRoot>
}


export function GameCell(props: {
    editor: Editor.Editor,
    setEditor: () => void,
    x: number,
    y: number,
    cell: string,
})
{
    const setCursor = () => {
        if (props.x == props.editor.cursor.x &&
            props.y == props.editor.cursor.y)
        {
            props.editor.cursorVertical = !props.editor.cursorVertical
        }
        else
        {
            props.editor.cursor.x = props.x
            props.editor.cursor.y = props.y
        }
        props.setEditor()
    }

    return <GameCellDiv
        isWall={props.cell == Game.CELL_WALL}
        hasCursor={
            props.x == props.editor.cursor.x &&
            props.y == props.editor.cursor.y
        }
        isInCursorsRange={
            Editor.isInCursorsRange(props.editor, props.x, props.y)
        }
        onClick={setCursor}
    >
        <GameCellContents>
            {props.cell == Game.CELL_WALL ? "" : props.cell}
        </GameCellContents>
    </GameCellDiv>
}


const GameBoardRoot = styled.div`
    line-height: 0;
`


const GameCellDiv = styled.div<{
    isWall: boolean,
    hasCursor: boolean,
    isInCursorsRange: boolean,
}>`
    contain: content;
    display: inline-block;
    width: 2em;
    height: 2em;
    margin: 0;
    padding: 0;
    border: ${ props => 
        props.hasCursor ? "1px solid orange" :
        "1px solid black"
    };
    background-color: ${ props => 
        props.hasCursor ? "#ff8" :
        props.isInCursorsRange ? "#8ff" :
        props.isWall ? "#ccc" :
        "white"
    };
    user-select: none;
`


const GameCellContents = styled.div`
    display: flex;
    width: 100%;
    height: 100%;
    align-content: center;
    justify-content: center;
    align-items: center;
    justify-items: center;
    text-align: center;
`