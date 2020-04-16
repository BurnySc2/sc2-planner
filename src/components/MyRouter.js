import React, { Component } from 'react'
import {
    Redirect,
    BrowserRouter as Router,
    Switch,
    Route,
  } from "react-router-dom";

import WebPage from "./WebPage"

export default class MyRouter extends Component {
    render() {
        return (
            <div>
                <Router>
                    <Switch>
                        <Redirect exact from="/" to="terran" />
                        <Route path="/terran">
                            <WebPage race="terran" />
                        </Route>
                        <Route path="/protoss">
                            <WebPage race="protoss" />
                        </Route>
                        <Route path="/zerg">
                            <WebPage race="zerg" />
                        </Route>
                    </Switch>
                </Router>
            </div>
        )
    }
}
