import React, { Component } from "react"

import RACES from "../icons/races"
import CLASSES from "../constants/classes"
import { IAllRaces } from "../constants/interfaces"

interface MyProps {
    onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, race: IAllRaces) => void
}

export default class RaceSelection extends Component<MyProps> {
    /**
     * If a race was selected, clear BOArea and BuildOrder and reset everything
     * Then load the right race in ActionSelection
     */
    // constructor(props) {
    //     super(props)
    // }

    onClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, race: IAllRaces): void => {
        this.props.onClick(e, race)
    }

    render(): JSX.Element {
        const classString = `${CLASSES.raceIcon}`

        const allRaces: Array<IAllRaces> = ["protoss", "terran", "zerg"]
        const races = allRaces.map((race, _index) => {
            const item: { name: string; path: string } = RACES[race]
            return (
                <div key={item.name} className={classString} onClick={(e) => this.onClick(e, race)}>
                    <img src={require("../icons/png/" + item.path).default} alt={item.name} />
                </div>
            )
        })

        return <div>{races}</div>
    }
}
