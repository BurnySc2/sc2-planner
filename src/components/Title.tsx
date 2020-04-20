import React, { Component } from "react"

import CLASSES from "../constants/classes"

export default class Title extends Component {
    render() {
        return (
            <div className={CLASSES.title}>
                SC2-Planner - The StarCraft II Build Planner
            </div>
        )
    }
}
