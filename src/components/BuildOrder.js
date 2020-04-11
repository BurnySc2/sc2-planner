import React, { Component } from 'react'
import CLASSES from '../constants/classes'

export default class BuildOrder extends Component {
    /**
     * Lists the tooltip order
     * If a build order item is pressed, remove it and recalculate the events in WebPage.js
     * If dragged, reorder the build order and then update game logic in WebPage.js
     */

    state = {
        // Each element needs to have an .image attached and tooltip with: name, minerals, vespene, time
        bo: []
    }

    onClick = (e) => {
        // Remove element from build order and BOArea
    }

    render() {
        const build_order = this.state.bo.map((item, index) => {
            return <div>
                <img className={CLASSES.boItem} src={item.image} />
            </div>
        })

        return (
            <div className={CLASSES.bo}>
                {build_order}
            </div>
        )
    }
}
