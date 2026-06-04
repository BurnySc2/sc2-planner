import type React from "react"
import { Component } from "react"
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
