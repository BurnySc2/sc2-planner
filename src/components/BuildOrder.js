import React, { Component } from 'react'
import CLASSES from '../constants/classes'

export default class BuildOrder extends Component {
    /**
     * Lists the tooltip order
     * If a build order item is pressed, remove it and recalculate the events in WebPage.js
     * If dragged, reorder the build order and then update game logic in WebPage.js
     */
    onClick = (e) => {
        // Remove element from build order and BOArea
    }

    render() {
        // Convert build order items to div elements
        const buildOrder = this.props.bo.map((item, index) => {
            return <div onClick={this.onClick}>
                <img className={CLASSES.boItem} src={item.image} alt={item.name} />
            </div>
        })
        
        // Hide element if no build order items are present
        const buildOrderArea = (
            <div className={CLASSES.bo}>
                {buildOrder}
            </div>
        )   ? buildOrder > 0 : ""
        return (
            <div>
                {buildOrderArea}
            </div>
        )
    }
}
