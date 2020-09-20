import React, { Component } from "react"

import CLASSES from "../constants/classes"

export default class Title extends Component {
    render() {
        return (
            <div>
                <a
                    className={CLASSES.title}
                    href="https://burnysc2.github.io/sc2-planner/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    SC2-Planner - The StarCraft II Build Planner
                </a>
                <div className={CLASSES.titleVersion}>For patch 5.0.3</div>
            </div>
        )
    }
}
