import React, { Component } from 'react'
import CLASSES from "../constants/classes"

export default class Settings extends Component {
    /**
     * A small settings menu to enable and disable things
     * And to be able to adjust certain sizes
     */
    state = {
        
    }

    render() {
        const settingsButton = <div className={CLASSES.buttons}  name="import" onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>Settings</div>
        return (
            <div>
                {settingsButton}
            </div>
        )
    }
}
