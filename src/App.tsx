import React, { Component } from "react"
// @ts-ignore
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
