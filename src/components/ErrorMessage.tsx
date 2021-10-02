import React, { Component } from "react"

import CLASSES from "../constants/classes"
import { GameLogic } from "../game_logic/gamelogic"

interface MyProps {
    gamelogic: GameLogic
}

export default class ErrorMessage extends Component<MyProps> {
    render(): JSX.Element {
        return (
            <div>
                <label className={CLASSES.errorLabel}>{this.props.gamelogic.errorMessage}</label>
            </div>
        )
    }
}
