import React, { Component } from "react"
import CLASSES from "../constants/classes"
import { includes } from "lodash"
import { CONVERT_SECONDS_TO_TIME_STRING } from "../constants/helper"
import { GameLogic } from "../game_logic/gamelogic"
import Event from "../game_logic/event"
import { IBarTypes, IResourceHistory } from "../constants/interfaces"
import { CUSTOMACTIONS_BY_NAME } from "../constants/customactions"
import ReactTooltip from "react-tooltip"

interface MyProps {
    gamelogic: GameLogic
    hoverIndex: number
    highlightedIndexes: number[]
    removeClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => void
    changeHoverIndex: (index: number) => void
    changeHighlight: (item?: Event) => void
}

interface MyState {
    showTooltip: boolean //Needed to force render() when removing the ReactTooltip
    highlightStart: number
    highlightEnd: number
}

export default class BOArea extends Component<MyProps, MyState> {
    timeInterval: number

    // Resource constants
    resourceTypes: {
        resourceType: keyof IResourceHistory
        resourceName: string
        icon: string
    }[] = []
    quantityRoundings: { [resourceType: string]: number } = {
        minerals: 5,
        vespene: 4,
        supplyLeft: 1,
        raceSpecificResource: 1,
    }
    histogramRoundings: { [resourceType: string]: number } = {
        minerals: 25,
        vespene: 25,
        supplyLeft: 1,
        raceSpecificResource: 1,
    }
    quantityMaxes: { [resourceType: string]: number } = {}
    tooltipPrevQuantity: number | undefined
    prevTooltipResourceType: keyof IResourceHistory | undefined
    tooltipContent: JSX.Element | undefined

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

        this.state = {
            showTooltip: false,
            highlightStart: 0,
            highlightEnd: 0,
        }
    }

    onMouseEnter(item: Event): void {
        this.props.changeHoverIndex(item.id)
        const startTime = CONVERT_SECONDS_TO_TIME_STRING(item.start / 22.4)
        const endTime =
            item.type === "action" ? "" : CONVERT_SECONDS_TO_TIME_STRING(item.end / 22.4)
        // const itemName = item.type === "action" ? CUSTOMACTIONS_BY_NAME[item.name].name : item.name

        const finishText = endTime === "" ? "" : `Finish: ${endTime}`

        this.tooltipContent = (
            <div className="flex flex-col text-center">
                <div>Start: {startTime}</div>
                <div>{finishText}</div>
                <div>Supply: {item.supply}</div>
            </div>
        )
        this.props.changeHighlight(item)
        this.setState({
            showTooltip: true,
            highlightStart: item.start,
            highlightEnd: item.end,
        })
        ReactTooltip.rebuild()
    }

    onMouseLeave(): void {
        this.props.changeHoverIndex(-1)
        this.props.changeHighlight()
        this.tooltipContent = undefined
        this.setState({
            showTooltip: false,
            highlightStart: 0,
            highlightEnd: 0,
        })
        ReactTooltip.rebuild()
    }

    showResourceTooltip(
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
        resourceType: keyof IResourceHistory,
        resourceName: string,
        startFrame: number
    ): void {
        this.setResourceConstants()
        this.tooltipPrevQuantity = undefined
        this.prevTooltipResourceType = undefined
        this.updateResourceTooltip(event, resourceType, resourceName, startFrame)

        this.setState({
            showTooltip: true,
        })
        ReactTooltip.rebuild()
    }

    updateResourceTooltip(
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
        resourceType: keyof IResourceHistory,
        resourceName: string,
        startFrame: number
    ): void {
        const widthFactor = +this.props.gamelogic.settings.htmlElementWidthFactor
        const currentTargetRect = event.currentTarget.getBoundingClientRect()
        const eventOffsetX = event.pageX - currentTargetRect.left
        const frame = Math.floor(startFrame + eventOffsetX / widthFactor)
        const history = this.props.gamelogic.resourceHistory[resourceType]
        const quantityRounding: number = this.quantityRoundings[resourceType]
        const roundedQuantity =
            Math.floor(Math.round(history[frame]) / quantityRounding) * quantityRounding

        if (
            roundedQuantity !== this.tooltipPrevQuantity ||
            resourceType !== this.prevTooltipResourceType
        ) {
            this.tooltipPrevQuantity = roundedQuantity
            this.prevTooltipResourceType = resourceType
            this.tooltipContent = (
                <div className="flex flex-col text-center">
                    <div>
                        {resourceName}: {roundedQuantity}
                    </div>
                </div>
            )
        }
    }

    hideResourceTooltip(): void {
        this.tooltipContent = undefined

        this.setState({
            showTooltip: false,
        })
    }

    getFillerElement(width: number, key: string): JSX.Element {
        if (width === 0) {
            return <React.Fragment key={key} />
        }
        const myStyle = {
            width: `${width * +this.props.gamelogic.settings.htmlElementWidthFactor}px`,
        }
        return <div key={key} style={myStyle} />
    }

    getClass(barType: IBarTypes, index: number): string {
        const classes: string[] = []
        if (index === this.props.hoverIndex) {
            classes.push(`${CLASSES.boElementContainer} ${CLASSES.hoverColor[barType]}`)
        } else {
            classes.push(
                `${CLASSES.boElementContainer} ${CLASSES.typeColor[barType]} hover:${CLASSES.hoverColor[barType]}`
            )
        }

        if (includes(this.props.highlightedIndexes, index)) {
            classes.push(CLASSES.boItemDim)
        }
        return classes.join(" ")
    }

    setResourceConstants(): void {
        this.resourceTypes = [
            {
                resourceType: "minerals",
                resourceName: "Minerals",
                icon: "png/icon-mineral-nobg.png",
            },
            {
                resourceType: "vespene",
                resourceName: "Vespene gas",
                icon: "png/icon-gas-terran-nobg.png",
            },
            {
                resourceType: "supplyLeft",
                resourceName: "Supply left",
                icon: {
                    protoss: "png/btn-building-protoss-pylon.png",
                    terran: "png/btn-building-terran-supplydepot.png",
                    zerg: "png/btn-unit-zerg-overlord.png",
                }[this.props.gamelogic.race],
            },
            {
                resourceType: "raceSpecificResource",
                resourceName: {
                    protoss: "Available chronoboosts",
                    terran: "Available MULEs",
                    zerg: "Larva count",
                }[this.props.gamelogic.race],
                icon: {
                    protoss: "png/btn-ability-spearofadun-chronosurge.png",
                    terran: "png/btn-unit-terran-mule.png",
                    zerg: "png/btn-unit-zerg-larva.png",
                }[this.props.gamelogic.race],
            },
        ]
        this.quantityMaxes = {
            minerals: 400,
            vespene: 400,
            supplyLeft: 8,
            raceSpecificResource: {
                protoss: 4,
                terran: 3,
                zerg: 6,
            }[this.props.gamelogic.race],
        }
    }

    render(): JSX.Element {
        const widthFactor = +this.props.gamelogic.settings.htmlElementWidthFactor

        // Build vertical bars
        const barBgClasses: { [name: string]: string } = {}
        const barClasses: { [name: string]: string } = {}

        const verticalBarNames: Array<IBarTypes> = [
            "worker",
            "action",
            "unit",
            "structure",
            "upgrade",
        ]

        const verticalBarsContent = verticalBarNames.map((barType) => {
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

            const verticalBar = verticalCalc.map((row, index1) => {
                const rowContent: Array<JSX.Element | string> = []
                row.forEach((item, index2) => {
                    // No need to subtract border width because it is part of the html element
                    const myStyle = {
                        width: widthFactor * (item.end - item.start),
                    }
                    if (index2 > 0) {
                        const key = `filler_${index1}_${index2}`
                        const prevElementEnd = row[index2 - 1].end
                        const fillerElement = this.getFillerElement(
                            item.start - prevElementEnd,
                            key
                        )
                        rowContent.push(fillerElement)
                    } else if (item.start > 0) {
                        const key = `filler${index1}${index2}`
                        const fillerElement = this.getFillerElement(item.start, key)
                        rowContent.push(fillerElement)
                    }

                    let itemName = item.name
                    if (item.type === "action") {
                        itemName = CUSTOMACTIONS_BY_NAME[item.name].name
                    }
                    rowContent.push(
                        <div
                            id={`boarea_${item.name}_${index2}`}
                            key={`boArea${barType}${index1}${index2}${item.name}${item.id}`}
                            className="flex flex-row"
                            data-tip=""
                            data-for="boAreaTooltip"
                            onMouseEnter={(_e) => this.onMouseEnter(item)}
                            onMouseLeave={(_e) => this.onMouseLeave()}
                            onClick={(e) => this.props.removeClick(e, item.id)}
                        >
                            <div style={myStyle} className={this.getClass(barType, item.id)}>
                                <img
                                    className={CLASSES.boElementIcon}
                                    src={require("../icons/png/" + item.imageSource).default}
                                    alt={itemName}
                                />
                                <div className={CLASSES.boElementText}>{itemName}</div>
                            </div>
                        </div>
                    )
                })
                return (
                    <div key={`row_${barType}_${index1}`} className={CLASSES.boRow}>
                        {rowContent}
                    </div>
                )
            })

            // Hide bar if it has no content to show
            if (verticalBar.length <= 0) {
                return <React.Fragment key={`verticalBar_${barType}`} />
            }
            //else
            return (
                <div key={`verticalBar_${barType}`} className={barBgClasses[barType]}>
                    {verticalBar}
                </div>
            )
        })

        this.setResourceConstants()
        const resourceHeight = +this.props.gamelogic.settings.htmlResourceHeight
        const resourceBars = !resourceHeight
            ? []
            : this.resourceTypes.map((resourceDetails) => {
                  const { resourceType, resourceName, icon } = resourceDetails
                  const history = this.props.gamelogic.resourceHistory[resourceType]
                  if (!history.length) {
                      return <React.Fragment key={`row_${resourceType}`} />
                  }
                  //else

                  const histogramRounding: number = this.histogramRoundings[resourceType]
                  const quantityMax: number = this.quantityMaxes[resourceType]

                  // Concatenate same height quantities to add less DOM elements
                  const dimensions: [number, number, number][] = history.reduce<
                      [number, number, number][]
                  >((res, quantity: number, frame: number) => {
                      const previousDimension = res[res.length - 1]
                      const roundedHistogramQuantity =
                          Math.floor(quantity / histogramRounding) * histogramRounding
                      if (!previousDimension || previousDimension[1] !== roundedHistogramQuantity) {
                          res.push([widthFactor, roundedHistogramQuantity, frame])
                      } else {
                          previousDimension[0] += widthFactor
                      }
                      return res
                  }, [])

                  const rowContent: Array<JSX.Element | string> = dimensions.map(
                      ([width, roundedQuantity, startFrame], index1) => {
                          const height = Math.min(quantityMax, roundedQuantity)
                          const style = {
                              width,
                              borderTopWidth:
                                  resourceHeight - (height / quantityMax) * resourceHeight + "rem",
                              borderTopColor: "#7f9cf5",
                              backgroundColor:
                                  roundedQuantity > quantityMax
                                      ? "rgba(30%, 30%, 30%, 0.5)"
                                      : "rgba(0, 0, 0, 0)",
                          }
                          return (
                              <div
                                  key={`boArea_${resourceType}_${index1}`}
                                  style={style}
                                  className={CLASSES.boResource}
                                  data-tip=""
                                  data-for="boAreaTooltip"
                                  onMouseEnter={(e) =>
                                      this.showResourceTooltip(
                                          e,
                                          resourceType,
                                          resourceName,
                                          startFrame
                                      )
                                  }
                                  onMouseMove={(e) =>
                                      this.updateResourceTooltip(
                                          e,
                                          resourceType,
                                          resourceName,
                                          startFrame
                                      )
                                  }
                                  onMouseLeave={(_e) => this.hideResourceTooltip()}
                              />
                          )
                      }
                  )

                  const wideBarStyle = {
                      backgroundImage: `url(${require(`../icons/${resourceType}.jpg`).default})`,
                      backgroundSize: "contain",
                  }
                  const borderBarHeightStyle = {
                      height: resourceHeight + "rem",
                  }
                  return (
                      <div key={`row_${resourceType}`} className={CLASSES.boResourceBar}>
                          <img
                              className={CLASSES.boResourceIcon}
                              src={require("../icons/" + icon).default}
                              alt={resourceName}
                          />
                          <div className={CLASSES.boResourceWideBar} style={wideBarStyle}>
                              <div
                                  className={CLASSES.boResourceBorderBar}
                                  style={borderBarHeightStyle}
                              >
                                  {rowContent}
                              </div>
                          </div>
                      </div>
                  )
              })

        const highlightStyle = {
            left: widthFactor * this.state.highlightStart + 1,
            width: widthFactor * (this.state.highlightEnd - this.state.highlightStart),
        }
        const resourceHighlight = !highlightStyle.width ? (
            ""
        ) : (
            <div className={CLASSES.boAreaPadding}>
                <div className={CLASSES.boResourceHighlight} style={highlightStyle} />
            </div>
        )

        const resourceContent = <div className={CLASSES.boResourceContainer}>{resourceBars}</div>

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
                    this.timeInterval * +this.props.gamelogic.settings.htmlElementWidthFactor * 22.4
                }px`,
            }
            const timeString = CONVERT_SECONDS_TO_TIME_STRING(item.start)
            return (
                <div
                    key={`timeInterval_${item.start}_${index}`}
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
            return <React.Fragment />
        }
        return (
            <div className={`${CLASSES.boArea}`}>
                <ReactTooltip
                    place="bottom"
                    id="boAreaTooltip"
                    getContent={() => this.tooltipContent}
                />
                {resourceContent}
                {timeBarContent}
                {verticalBarsContent}
                {resourceHighlight}
            </div>
        )
    }
}
