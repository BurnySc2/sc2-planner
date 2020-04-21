import React, { Component } from "react"
import CLASSES from "../constants/classes"
import { CONVERT_SECONDS_TO_TIME_STRING } from "../constants/helper"
import { GameLogic } from "../game_logic/gamelogic"
import Event from "../game_logic/event"
import { IBarTypes } from "../constants/interfaces"

interface MyProps {
    gamelogic: GameLogic
    removeClick: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        index: number
    ) => void
}

interface MyState {}

export default class BOArea extends Component<MyProps, MyState> {
    timeInterval: number
    /**
     * Receives even items from WebPage.js, then recalcuates the items below
     * If an item is clicked, remove it from the build order and the BOArea
     * If an item is hovered, display some tooltip
     * If the time line is clicked, display the state at the current clicked time
     */
    constructor(props: MyProps) {
        super(props)
        // TODO Perhaps set time interval as props so it can be set in settings?
        this.timeInterval = 20
    }

    getFillerElement(width: number, key: string) {
        if (width === 0) {
            return ""
        }
        const myStyle = {
            width: `${
                width * this.props.gamelogic.settings.htmlElementWidthFactor
            }px`,
        }
        return <div key={key} style={myStyle}></div>
    }

    render() {
        // console.log(this.props.gamelogic.eventLog)
        const widthFactor = this.props.gamelogic.settings.htmlElementWidthFactor

        // Build vertical bars
        const barBgClasses: { [name: string]: string } = {}
        const barClasses: { [name: string]: string } = {}

        // console.log(this.props.gamelogic.eventLog);

        const verticalBarNames: Array<IBarTypes> = [
            "worker",
            "action",
            "unit",
            "structure",
            "upgrade",
        ]

        const verticalContent: Array<Array<JSX.Element>> = []

        verticalBarNames.forEach((barType) => {
            const bgColor: string = CLASSES.bgColor[barType]
            barBgClasses[barType] = `${bgColor} ${CLASSES.boCol}`
            const typeColor: string = CLASSES.typeColor[barType]
            barClasses[barType] = `${typeColor} ${CLASSES.boCol}`
            // Each bar contains another array
            const verticalCalc: Array<Array<Event>> = []
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
                const rowContent: Array<JSX.Element | string> = []
                row.forEach((item, index2) => {
                    // No need to subtract border width because it is part of the html element
                    const myStyle = {
                        width: widthFactor * (item.end - item.start),
                    }
                    if (index2 > 0) {
                        const key = `filler${index1}${index2}`
                        const prevElementEnd = row[index2 - 1].end
                        const fillerElement = this.getFillerElement(
                            item.start - prevElementEnd,
                            key
                        )
                        rowContent.push(fillerElement)
                    } else if (item.start > 0) {
                        const key = `filler${index1}${index2}`
                        const fillerElement = this.getFillerElement(
                            item.start,
                            key
                        )
                        rowContent.push(fillerElement)
                    }

                    rowContent.push(
                        <div
                            key={`boArea${barType}${index1}${index2}`}
                            className="flex flex-row"
                            onClick={(e) => this.props.removeClick(e, item.id)}
                        >
                            <div
                                style={myStyle}
                                className={`${CLASSES.boElementContainer} ${CLASSES.typeColor[barType]} ${CLASSES.hoverColor[barType]}`}
                            >
                                <img
                                    className={CLASSES.boElementIcon}
                                    src={require("../icons/png/" +
                                        item.imageSource)}
                                    alt={item.name}
                                />
                                <div className={CLASSES.boElementText}>
                                    {item.name}
                                </div>
                            </div>
                        </div>
                    )
                })
                return (
                    <div
                        key={`row${barType}${index1}`}
                        className={CLASSES.boRow}
                    >
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
            if (bar.length > 0) {
                return (
                    <div
                        key={`verticalBar ${barName}`}
                        className={barBgClasses[barName]}
                    >
                        {bar}
                    </div>
                )
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
                end: i + this.timeInterval,
            })
        }
        // Generate HTML for time bar
        const timeIntervalContent = timeBarCalc.map((item, index) => {
            const myStyle = {
                width: `${
                    this.timeInterval *
                    this.props.gamelogic.settings.htmlElementWidthFactor *
                    22.4
                }px`,
            }
            const timeString = CONVERT_SECONDS_TO_TIME_STRING(item.start)
            return (
                <div
                    key={`timeInterval${item.start}`}
                    className={`${CLASSES.boTimeElement} ${CLASSES.typeColor.time} ${CLASSES.hoverColor.time}`}
                    style={myStyle}
                >
                    {timeString}
                </div>
            )
        })
        // Only show time bar if there are any events to display
        const timeBarContent = (
            <div className={`${CLASSES.boCol} ${CLASSES.bgColor.time}`}>
                <div className={CLASSES.boRow}>{timeIntervalContent}</div>
            </div>
        )

        if (this.props.gamelogic.eventLog.length === 0) {
            return <div></div>
        }
        return (
            <div className={CLASSES.boArea}>
                {timeBarContent}
                {verticalBarsContent}
            </div>
        )
    }
}
