import type React from "react"
import { Component } from "react"
// @ts-expect-error
import "./index.css"

import MyRouter from "./components/MyRouter"

class App extends Component {
    render(): React.JSX.Element {
        return (
            <div>
                <MyRouter />
            </div>
        )
    }
}

export default App
