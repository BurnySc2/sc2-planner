import type React from "react"
import { Component } from "react"
import { BrowserRouter as Router } from "react-router-dom"

import WebPage from "./WebPage"

export default class MyRouter extends Component {
    render(): React.ReactElement {
        return (
            <div>
                <Router>
                    <WebPage />
                </Router>
            </div>
        )
    }
}
