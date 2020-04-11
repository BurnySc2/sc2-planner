import React, { Component } from 'react'
import RACES from "../icons/races"


export default class Time extends Component {
    /**
     * Keep track of the current selected time, if
     */

    render() {
        const item = RACES.time
        const time = <div key={item.name}>
            <img src={require("../icons/png/" + item.path)} alt={item.name} />
        </div>

        return (
            <div>{time}</div>
        )
    }
}
