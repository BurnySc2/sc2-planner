import React, { Component } from 'react'

export default class BOArea extends Component {
    /**
     * Receives even items from WebPage.js, then recalcuates the items below
     * If an item is clicked, remove it from the build order and the BOArea
     * If an item is hovered, display some tooltip
     * If the time line is clicked, display the state at the current clicked time
     */

    render() {
        return (
            <div>
                <div>time bar</div>
                <div>worker bar</div>
                <div>actions bar</div>
                <div>units bar</div>
                <div>structures bar</div>
                <div>upgrades bar</div>
            </div>
        )
    }
}
