import React, { Component } from "react"
import CLASSES from "../constants/classes"

import { includes } from "lodash"
import { getImageOfItem } from "../constants/helper"
import { GameLogic } from "../game_logic/gamelogic"
import Event from "../game_logic/event"
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd"
import { IBuildOrderElement, ISettingsElement, IAllRaces } from "../constants/interfaces"

// A function to help us with reordering the result
// https://www.npmjs.com/package/react-beautiful-dnd
// Stolen from the horizontal list example https://github.com/atlassian/react-beautiful-dnd/blob/HEAD/docs/about/examples.md
const reorder = (list: Array<IBuildOrderElement>, startIndex: number, endIndex: number) => {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)

    return result
}

interface MyProps {
    gamelogic: GameLogic
    hoverIndex: number
    highlightedIndexes: number[]
    insertIndex: number
    removeClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => void
    rerunBuildOrder: (buildOrder: IBuildOrderElement[]) => void
    updateUrl: (
        race: IAllRaces | undefined,
        buildOrder: IBuildOrderElement[],
        settings: ISettingsElement[] | undefined,
        optimizeSettings: ISettingsElement[] | undefined
    ) => void
    changeHoverIndex: (index: number) => void
    changeHighlight: (item?: Event) => void
    changeInsertIndex: (index: number) => void
    multilineBuildOrder: boolean
}

interface MyState {
    items: Array<IBuildOrderElement>
}

export default class BuildOrder extends Component<MyProps, MyState> {
    /**
     * Lists the tooltip order
     * If a build order item is pressed, remove it and recalculate the events in WebPage.js
     * If dragged, reorder the build order and then update game logic in WebPage.js
     */
    constructor(props: MyProps) {
        super(props)
        this.onDragEnd = this.onDragEnd.bind(this)
    }

    onMouseEnter(index: number): void {
        this.props.changeHoverIndex(index)
        this.props.changeHighlight(this.props.gamelogic.eventLog[index])
    }
    onMouseLeave(): void {
        this.props.changeHoverIndex(-1)
        this.props.changeHighlight()
    }

    onDragEnd(result: DropResult): void {
        // Dropped outside the list
        if (!result.destination) {
            return
        }

        const items: Array<IBuildOrderElement> = reorder(
            this.props.gamelogic.bo,
            result.source.index,
            result.destination.index
        )

        this.props.rerunBuildOrder(items)

        this.props.updateUrl(
            this.props.gamelogic.race,
            items,
            this.props.gamelogic.exportSettings(),
            this.props.gamelogic.exportOptimizeSettings()
        )
    }

    render(): JSX.Element {
        // Convert build order items to div elements

        // Hide element if no build order items are present
        if (this.props.gamelogic.bo.length === 0) {
            return <div />
        }

        const buildOrder = this.props.gamelogic.bo.map((item, index) => {
            const image = getImageOfItem(item)
            return <img key={`${item.name}_${index}`} src={image} alt={item.name} />
        })

        const getItemClass = (dragging: boolean, index: number) => {
            // Build order is invalid after this index, mark background or border red
            // Set color based on if it is dragging
            const classes: string[] = []
            if (dragging) {
                if (index >= this.props.gamelogic.boIndex) {
                    classes.push(CLASSES.boItemInvalidDragging)
                } else {
                    classes.push(CLASSES.boItemDragging)
                }
            } else if (index === this.props.hoverIndex) {
                classes.push(CLASSES.boItemHighlighting)
            } else {
                if (index >= this.props.gamelogic.boIndex) {
                    classes.push(CLASSES.boItemInvalid)
                }
                classes.push(CLASSES.boItem)
            }
            if (includes(this.props.highlightedIndexes, index)) {
                classes.push(CLASSES.boItemDim)
            }
            return classes.join(" ")
        }

        const buildOrderItems: JSX.Element[] = []
        let separatorClass =
            this.props.insertIndex === 0 ? CLASSES.boItemSeparatorSelected : CLASSES.boItemSeparator
        buildOrderItems.push(
            <div
                key={"separator0"}
                className={separatorClass}
                onClick={(_e) => {
                    this.props.changeInsertIndex(0)
                }}
            />
        )

        this.props.gamelogic.bo.forEach((item, index) => {
            buildOrderItems.push(
                <Draggable key={`${index}`} draggableId={`${index}`} index={index}>
                    {(provided, snapshot) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={getItemClass(snapshot.isDragging, index)}
                            onMouseEnter={(_e) => this.onMouseEnter(index)}
                            onMouseLeave={(_e) => this.onMouseLeave()}
                            onClick={(e) => {
                                this.props.removeClick(e, index)
                            }}
                        >
                            {buildOrder[index]}
                        </div>
                    )}
                </Draggable>
            )

            separatorClass =
                this.props.insertIndex === index + 1
                    ? CLASSES.boItemSeparatorSelected
                    : CLASSES.boItemSeparator
            buildOrderItems.push(
                <div
                    key={`separator${index + 1}`}
                    className={separatorClass}
                    onClick={(_e) => {
                        this.props.changeInsertIndex(index + 1)
                    }}
                />
            )
        })

        return (
            <div className={CLASSES.bo}>
                <DragDropContext onDragEnd={this.onDragEnd}>
                    <Droppable droppableId="droppable" direction="horizontal">
                        {(provided, _snapshot) => (
                            <div
                                className={
                                    (this.props.multilineBuildOrder ? "flex-wrap flex-row" : "") +
                                    " flex"
                                }
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                {buildOrderItems}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
        )
    }
}
