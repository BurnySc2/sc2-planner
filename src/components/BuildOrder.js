import React, { Component } from "react"
import CLASSES from "../constants/classes"

import { getImageOfItem } from "../constants/helper"

export default class BuildOrder extends Component {
    /**
     * Lists the tooltip order
     * If a build order item is pressed, remove it and recalculate the events in WebPage.js
     * If dragged, reorder the build order and then update game logic in WebPage.js
     */

    render() {
        // Convert build order items to div elements
        const invalidIndex = this.props.gamelogic.boIndex
        const buildOrder = this.props.gamelogic.bo.map((item, index) => {
            const image = getImageOfItem(item)
            let myClass = CLASSES.boItem
            // Build order is invalid after this index, mark background or border red
            if (index >= invalidIndex) {
                myClass = CLASSES.boItemInvalid
            }
            return (
                <div
                    key={`bo_${index}`}
                    className={myClass}
                    onClick={(e) => this.props.removeClick(e, index)}
                >
                    <img src={image} alt={item.name} />
                </div>
            )
        })

        // Hide element if no build order items are present
        const buildOrderArea = <div className={CLASSES.bo}>{buildOrder}</div>
        if (buildOrder.length === 0) {
            return ""
        }
        return (
            <div className="flex flex-row overflow-x-auto">
                {buildOrderArea}
            </div>
        )
    }
}
