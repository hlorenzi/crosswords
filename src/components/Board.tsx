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
                    game={props.game}
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
    game: Game.Game,
    cell: Game.Cell,
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

    const clueNumber = Solid.createMemo(() => {
        const acrossClue =
            props.cell.acrossClueIndex === undefined ? undefined :
            props.game.clueNumbers[props.cell.acrossClueIndex]

        const downClue =
            props.cell.downClueIndex === undefined ? undefined :
            props.game.clueNumbers[props.cell.downClueIndex]

        if (acrossClue &&
            acrossClue.cellIndex.x == props.x &&
            acrossClue.cellIndex.y == props.y)
            return acrossClue.number
        
        if (downClue &&
            downClue.cellIndex.x == props.x &&
            downClue.cellIndex.y == props.y)
            return downClue.number

        return undefined
    })

        
    return <GameCellDiv
        isWall={props.cell.contents === Game.CELL_WALL}
        hasCursor={
            props.x == props.editor.cursor.x &&
            props.y == props.editor.cursor.y
        }
        isInCursorsRange={
            Editor.isInCursorsRange(props.editor, props.x, props.y)
        }
        onClick={setCursor}
    >
        <GameCellLayout>
            <GameCellClueNumber>
                {clueNumber()}
            </GameCellClueNumber>
            <GameCellContents>
                {props.cell.contents === Game.CELL_WALL ? "" : props.cell.contents}
            </GameCellContents>
        </GameCellLayout>
    </GameCellDiv>
}


const GameBoardRoot = styled.div`
    width: fit-content;
    line-height: 0;
    border: 3px solid #000;
    font-size: 1.5em;
`


const GameCellDiv = styled.div<{
    isWall: boolean,
    hasCursor: boolean,
    isInCursorsRange: boolean,
}>`
    contain: content;
    display: inline-block;
    width: 1.5em;
    height: 1.5em;
    margin: 0;
    margin-right: -1px;
    margin-bottom: -1px;
    padding: 0;
    border: 1px solid #696969;
    background-color: ${ props => 
        props.hasCursor && props.isWall ? "#bea300" :
        props.hasCursor ? "#ffda00" :
        props.isInCursorsRange ? "#a7d8ff" :
        props.isWall ? "#000" :
        "white"
    };
    user-select: none;
`


const GameCellLayout = styled.div`
    display: grid;
    grid-template: 1fr / 1fr;
    align-content: stretch;
    justify-content: stretch;
    align-items: center;
    justify-items: center;
    width: 100%;
    height: 100%;
    line-height: 1em;
`


const GameCellClueNumber = styled.div`
    grid-column: 1;
    grid-row: 1;
    z-index: 1;
    align-self: stretch;
    justify-self: start;
    text-align: left;
    margin-top: -0.45em;
    padding-left: 0.05em;
    font-size: 0.5em;
`


const GameCellContents = styled.div`
    grid-column: 1;
    grid-row: 1;
    display: flex;
    align-self: center;
    justify-self: center;
    text-align: center;
    padding-top: 0.35em;
`