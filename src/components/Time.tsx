import React, { Component } from "react"
import RACES from "../icons/races"
import CLASSES from "../constants/classes"

import { CONVERT_SECONDS_TO_TIME_STRING } from "../constants/helper"
import { GameLogic } from "../game_logic/gamelogic"

interface MyProps {
    gamelogic: GameLogic
}

interface MyState {}

export default class Time extends Component<MyProps, MyState> {
    render() {
        const topTextCss = {
            top: "0%",
            left: "50%",
            transform: "translate(-50%, 25%)",
            /**
            font-size: small;
            font-size: medium;
            font-size: large;
            font-size: x-large;
            font-size: xx-large;
            font-size: xxx-large;
             */
            fontSize: "x-large",
        }
        const bottomTextCss = {
            bottom: "0%",
            left: "50%",
            transform: "translate(-50%, -25%)",
            fontSize: "x-large",
        }
        // Get the time in a 00:00 format
        const frameOfLastAction = this.props.gamelogic.unitsCountArray[
            this.props.gamelogic.unitsCountArray.length - 1
        ].frame
        const timeEndOfBO = CONVERT_SECONDS_TO_TIME_STRING(frameOfLastAction / 22.4)
        const timeEndOfEvents = CONVERT_SECONDS_TO_TIME_STRING(this.props.gamelogic.frame / 22.4)
        const item = RACES.time

        return (
            <div key={item.name} className="relative flex-shrink-0">
                <img
                    className={CLASSES.timeIcon}
                    src={require("../icons/png/" + item.path)}
                    alt={item.name}
                />
                <div className={CLASSES.timeText} style={topTextCss}>
                    {timeEndOfBO}
                </div>
                <div className={CLASSES.timeText} style={bottomTextCss}>
                    {timeEndOfEvents}
                </div>
            </div>
        )
    }
}
