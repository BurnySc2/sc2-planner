import React, { Component } from 'react'
import CLASSES from '../constants/classes'

export default class BuildOrder extends Component {
    /**
     * Lists the tooltip order
     * If a build order item is pressed, remove it and recalculate the events in WebPage.js
     * If dragged, reorder the build order and then update game logic in WebPage.js
     */

    render() {
        console.log(this.props.bo);
        
        // Convert build order items to div elements
        const buildOrder = this.props.bo.map((item, index) => {
            return <div key={`bo_${index}`} onClick={(e) => (this.props.removeClick(e, index))}>
                <img className={CLASSES.boItem} src={item.image} alt={item.name} />
            </div>
        })
        
        // Hide element if no build order items are present
        const buildOrderArea = buildOrder.length > 0 ? (
            <div className={CLASSES.bo}>
                {buildOrder}
            </div>
        ) : ""
        return (
            <div>
                {buildOrderArea}
            </div>
        )
    }
}
