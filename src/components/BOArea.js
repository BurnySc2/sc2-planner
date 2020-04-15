import React, { Component } from 'react'
import CLASSES from '../constants/classes'
import {CONVERT_SECONDS_TO_TIME_STRING} from '../constants/helper'

export default class BOArea extends Component {
    /**
     * Receives even items from WebPage.js, then recalcuates the items below
     * If an item is clicked, remove it from the build order and the BOArea
     * If an item is hovered, display some tooltip
     * If the time line is clicked, display the state at the current clicked time
     */
    constructor(props) {
        super(props)
        // TODO Perhaps set time interval as props?
        this.timeInterval = 20
    }

    getFillerElement(width, key) {
        if (width === 0) {
            return ""
        }
        const myStyle = {
            "width": `${width * this.props.gamelogic.htmlElementWidthFactor}px`,
        }
        return <div key={key} style={myStyle}></div>
    }
    
    render() {
        // console.log(this.props.gamelogic.eventLog)
        const widthFactor = this.props.gamelogic.htmlElementWidthFactor

        // Build vertical bars
        const barBgClasses = {}
        const barClasses = {}
        
        // console.log(this.props.gamelogic.eventLog);

        const verticalBarNames = ["worker", "action", "unit", "structure", "upgrade"]

        const verticalContent = []

        verticalBarNames.forEach((barType) => {
            barBgClasses[barType] = `${CLASSES.bgColor[barType]} ${CLASSES.boCol}`
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
                const rowContent = []
                row.forEach((item, index2) => {
                    // No need to subtract border width because it is part of the html element
                    const myStyle = {width: widthFactor * (item.end - item.start)}
                    if (index2 > 0) {
                        const key = `filler${index1}${index2}`
                        const prevElementEnd = row[index2 - 1].end
                        const fillerElement = this.getFillerElement(item.start - prevElementEnd, key)
                        rowContent.push(fillerElement)
                    } else if (item.start > 0) {
                        const key = `filler${index1}${index2}`
                        const fillerElement = this.getFillerElement(item.start, key)
                        rowContent.push(fillerElement)
                    }
                    rowContent.push(
                        <div key={`boArea${barType}${index1}${index2}`} className="flex flex-row">
                            <div style={myStyle} className={`${CLASSES.boElementContainer} ${CLASSES.typeColor[barType]} ${CLASSES.hoverColor[barType]}`}>
                                <img className={CLASSES.boElementIcon} src={require("../icons/png/" + item.imageSource)} alt={item.name} />
                                <div className={CLASSES.boElementText}>{item.name}</div>
                            </div>
                        </div>
                    )
                })
                return (
                    <div key={`row${barType}${index1}`} className={CLASSES.boRow}>
                        {rowContent}
                    </div>
                )
            })
            verticalContent.push(verticalBar)
            return <div>{verticalBar}</div>
        })

        const verticalBarsContent = verticalBarNames.map((barName, index) => {
            // console.log(verticalContent);
            const bar = verticalContent[index]
            // Hide bar if it has no content to show
            if (bar.length > 0){
                return <div key={`verticalBar ${barName}`} className={barBgClasses[barName]}>{bar}</div>
            }
            return ""
        })

        // Generate time bar
        let maxTime = 0
        this.props.gamelogic.eventLog.forEach((item) => {
            maxTime = Math.max(item.end, maxTime)
        })
        const timeBarCalc = []
        for (let i = 0; i < maxTime / 22.4; i += this.timeInterval) {
            timeBarCalc.push({
                start: i,
                end: i + this.timeInterval
            })
        }
        
        const timeIntervalContent = timeBarCalc.map((item, index) => {
            const myStyle = {
                "width": `${this.timeInterval * this.props.gamelogic.htmlElementWidthFactor * 22.4}px`
            }
            const timeString = CONVERT_SECONDS_TO_TIME_STRING(item.start)
            return <div key={`timeInterval${item.start}`} className={`${CLASSES.boTimeElement} ${CLASSES.typeColor.time} ${CLASSES.hoverColor.time}`} style={myStyle}>{timeString}</div>
        })

        return (
            <div className={CLASSES.boArea}>
                <div className={`${CLASSES.boCol} ${CLASSES.bgColor.time}`}>
                    <div className={CLASSES.boRow}>
                        {timeIntervalContent}
                    </div>
                </div>
                {verticalBarsContent}
            </div>
        )
    }
}