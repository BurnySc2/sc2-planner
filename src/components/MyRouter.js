import React, { Component } from "react"
import { BrowserRouter as Router } from "react-router-dom"

import WebPage from "./WebPage"

export default class MyRouter extends Component {
    render() {
        return (
            <div>
                <Router>
                    <WebPage />
                </Router>
            </div>
        )
    }
}
