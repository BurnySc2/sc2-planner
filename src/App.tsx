import React, { Component } from "react"
import "./index.css"

import MyRouter from "./components/MyRouter"

class App extends Component {
    render(): JSX.Element {
        return (
            <div>
                <MyRouter />
            </div>
        )
    }
}

export default App
