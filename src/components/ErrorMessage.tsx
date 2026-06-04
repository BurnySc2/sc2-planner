import type React from "react"
import { Component } from "react"

import CLASSES from "../constants/classes"
import type { GameLogic } from "../game_logic/gamelogic"

interface MyProps {
    gamelogic: GameLogic
}

export default class ErrorMessage extends Component<MyProps> {
    render(): React.ReactElement {
        return (
            <div>
                <span className={CLASSES.errorLabel}>{this.props.gamelogic.errorMessage}</span>
            </div>
        )
    }
}
