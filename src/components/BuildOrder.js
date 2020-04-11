import React, { Component } from 'react'

export default class BuildOrder extends Component {
    /**
     * Lists the tooltip order
     * If a build order item is pressed, remove it and recalculate the events in WebPage.js
     * If dragged, reorder the build order and then update game logic in WebPage.js
     */
    render() {
        return (
            <div>
                <div>
                    Build Order
                </div>
            </div>
        )
    }
}
