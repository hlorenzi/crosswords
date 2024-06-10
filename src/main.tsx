import * as Solid from "solid-js"
import * as SolidWeb from "solid-js/web"
import { styled } from "solid-styled-components"
import * as Game from "./game"
import * as Editor from "./editor"
import { GameBoard } from "./components/Board"
import { EditPanel } from "./components/EditPanel"


function App()
{
    const [editor, setEditor] = Solid.createSignal(Editor.createEmpty())
    const forceSetEditor = () => setEditor({...editor()})

    return <AppRoot>
        <EditPanel
            editor={editor()}
            setEditor={forceSetEditor}
        />
    </AppRoot>
}


const AppRoot = styled.div`
    margin: auto;
    width: fit-content;
`


SolidWeb.render(
    App,
    document.getElementById("app")!)