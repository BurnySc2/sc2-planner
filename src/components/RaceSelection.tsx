import React, { Component } from "react"

import RACES from "../icons/races"
import CLASSES from "../constants/classes"

interface MyProps {
    onClick: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        race: string
    ) => void
}

interface MyState {}

export default class RaceSelection extends Component<MyProps, MyState> {
    /**
     * If a race was selected, clear BOArea and BuildOrder and reset everything
     * Then load the right race in ActionSelection
     */
    // constructor(props) {
    //     super(props)
    // }

    onClick = (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        race: string
    ) => {
        this.props.onClick(e, race)
    }

    render() {
        const classString = `${CLASSES.raceIcon}`

        const races = ["protoss", "terran", "zerg"].map((race, index) => {
            // TODO Fix me
            // @ts-ignore
            const item: { name: string; path: string } = RACES[race]
            return (
                <div
                    key={item.name}
                    className={classString}
                    onClick={(e) => this.onClick(e, race)}
                >
                    <img
                        src={require("../icons/png/" + item.path)}
                        alt={item.name}
                    />
                </div>
            )
        })

        return <div>{races}</div>
    }
}
