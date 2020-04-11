import React, { Component } from 'react'

export default class RaceSelection extends Component {
    /**
     * If a race was selected, clear BOArea and BuildOrder and reset everything
     * Then load the right race in ActionSelection
     */
    render() {
        return (
            <div>
                <div>Terran</div>
                <div>Protoss</div>
                <div>Zerg</div>
            </div>
        )
    }
}
