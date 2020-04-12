import React, { Component } from 'react'
import RACES from "../icons/races"
import CLASSES from '../constants/classes'


export default class Time extends Component {
    render() {
        const timeTextCss = {
            bottom: "0%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            /**
            font-size: small;
            font-size: medium;
            font-size: large;
            font-size: x-large;
            font-size: xx-large;
            font-size: xxx-large;
             */
            "fontSize": "x-large",
        }
        // Get the time in a 00:00 format
        // console.log(this.props.time)
        const totalSeconds = Math.floor(this.props.time)
        const minutes = `${Math.floor(totalSeconds / 60)}`.padStart(2, "0")
        const seconds = `${totalSeconds % 60}`.padStart(2, "0")
        const timeFormatted = `${minutes}:${seconds}`
        const item = RACES.time

        return (
            <div key={item.name} className="relative">
                <img className={CLASSES.timeIcon} src={require("../icons/png/" + item.path)} alt={item.name} />
                <div className={CLASSES.timeText} style={timeTextCss}>{timeFormatted}</div>
            </div>
        )
    }
}
