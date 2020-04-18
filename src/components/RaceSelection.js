import React, { Component } from "react"

import RACES from "../icons/races"
import CLASSES from "../constants/classes"

export default class RaceSelection extends Component {
    /**
     * If a race was selected, clear BOArea and BuildOrder and reset everything
     * Then load the right race in ActionSelection
     */
    // constructor(props) {
    //     super(props)
    // }

    onClick = (e, race) => {
        this.props.onClick(e, race)
    }

    render() {
        const classString = `${CLASSES.raceIcon}`

        const races = ["protoss", "terran", "zerg"].map((race, index) => {
            const item = RACES[race]
            return (
                <div
                    key={item.name}
                    className={classString}
                    onClick={(e) => this.onClick(e, race)}
                >
                    <img
                        race={item}
                        src={require("../icons/png/" + item.path)}
                        alt={item.name}
                    />
                </div>
            )
        })

        return <div>{races}</div>
    }
}
