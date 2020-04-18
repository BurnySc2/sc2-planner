import React, { Component } from 'react'

import CLASSES from "../constants/classes"

export default class ErrorMessage extends Component {
    render() {
        return (
            <div>
                <label className={CLASSES.errorLabel}>{this.props.gamelogic.errorMessage}</label>
            </div>
        )
    }
}
