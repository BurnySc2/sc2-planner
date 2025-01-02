import React, { Component } from "react"

import CLASSES from "../constants/classes"

export default class Title extends Component {
    render(): JSX.Element {
        return (
            <div>
                <div>
                    <a
                        className={CLASSES.title}
                        href="https://burnysc2.github.io/sc2-planner/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        SC2-Planner - The StarCraft II Build Planner
                    </a>
                </div>
                <div>
                    <a
                        className={CLASSES.titleVersion}
                        href="https://liquipedia.net/starcraft2/Patch_5.0.14"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        For patch 5.0.14
                    </a>
                </div>
            </div>
        )
    }
}
