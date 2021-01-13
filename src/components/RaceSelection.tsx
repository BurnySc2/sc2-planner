import React, { Component } from "react"

import RACES from "../icons/races"
import CLASSES from "../constants/classes"
import { IAllRaces } from "../constants/interfaces"

interface MyProps {
    onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, race: IAllRaces) => void
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

    onClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, race: IAllRaces) => {
        this.props.onClick(e, race)
    }

    render() {
        const classString = `${CLASSES.raceIcon}`

        const allRaces: Array<IAllRaces> = ["protoss", "terran", "zerg"]
        const races = allRaces.map((race, index) => {
            const item: { name: string; path: string } = RACES[race]
            return (
                <div key={item.name} className={classString} onClick={(e) => this.onClick(e, race)}>
                    <img src={require("../icons/png/" + item.path)} alt={item.name} />
                </div>
            )
        })

        return <div>{races}</div>
    }
}
