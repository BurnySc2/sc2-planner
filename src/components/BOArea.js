import React, { Component } from 'react'
import CLASSES from '../constants/classes'

export default class BOArea extends Component {
    /**
     * Receives even items from WebPage.js, then recalcuates the items below
     * If an item is clicked, remove it from the build order and the BOArea
     * If an item is hovered, display some tooltip
     * If the time line is clicked, display the state at the current clicked time
     */
    getFillerElement(width) {
        if (width === 0) {
            return ""
        }
        const myStyle = {
            "width": `${width * this.props.gamelogic.htmlElementWidthFactor}px`,

        }
        return <div style={myStyle}></div>
    }
    
    render() {
        // console.log(this.props.gamelogic.eventLog)
        const widthFactor = this.props.gamelogic.htmlElementWidthFactor

        // Build vertical bars
        const barClasses = {}
        
        const verticalBars = ["worker", "action", "unit", "structure", "upgrade"].map((barType) => {
            barClasses[barType] = `${CLASSES.typeColor[barType]} ${CLASSES.boCol}`
            // Each bar contains another array
            const verticalCalc = []
            this.props.gamelogic.eventLog.forEach((item) => {
                if (item.type === barType) {
                    let addedItem = false
                    verticalCalc.forEach((row, index1) => {
                        const lastItem = row[row.length - 1]
                        if (!addedItem && lastItem.end <= item.start) {
                            verticalCalc[index1].push(item)
                            addedItem = true
                            return
                        }
                        
                    })
                    if (!addedItem) {
                        // Create new row
                        verticalCalc.push([item])
                    }
                }
            })

            // console.log(verticalCalc);

            const verticalBar = verticalCalc.map((row, index1) => {
                const rowJSX = row.map((item, index2) => {
                    // TODO Subtract border width
                    const myStyle = {width: widthFactor * (item.end - item.start)}
                    let fillerElement = ""
                    if (index2 > 0) {
                        const prevElementEnd = row[index2 - 1].end
                        fillerElement = this.getFillerElement(item.start - prevElementEnd)
                    } else if (item.start > 0) {
                        fillerElement = this.getFillerElement(item.start)
                    }
                    return (
                        <div key={`boArea${barType}${index1}${index2}`} className="flex flex-row">
                            {fillerElement}
                            <div style={myStyle} className={`${CLASSES.boElementContainer} ${CLASSES.hoverColor[barType]}`}>
                                <img className={CLASSES.boElementIcon} src={require("../icons/png/" + item.imageSource)} alt={item.name} />
                                <div className={CLASSES.boElementText}>{item.name}</div>
                            </div>
                        </div>
                    )
                })
                return (
                    <div key={`row${barType}${index1}`} className={CLASSES.boRow}>
                        {rowJSX}
                    </div>
                )
            })
            return <div>{verticalBar}</div>
        })
        
        return (
            <div className={CLASSES.boArea}>
                {/* TODO Time bar */}
                <div>time bar</div>
                <div className={barClasses.worker}>{verticalBars[0]}</div>
                <div className={barClasses.action}>{verticalBars[1]}</div>
                <div className={barClasses.unit}>{verticalBars[2]}</div>
                <div className={barClasses.structure}>{verticalBars[3]}</div>
                <div className={barClasses.upgrade}>{verticalBars[4]}</div>
            </div>
        )
    }
}