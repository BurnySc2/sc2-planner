import React, { Component } from "react"
import CLASSES from "../constants/classes"

import { getImageOfItem } from "../constants/helper"
import { GameLogic } from "../game_logic/gamelogic"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { IBuildOrderElement, ISettingsElement } from "../constants/interfaces"

// A function to help us with reordering the result
// https://www.npmjs.com/package/react-beautiful-dnd
// Stolen from the horizontal list example https://github.com/atlassian/react-beautiful-dnd/blob/HEAD/docs/about/examples.md
const reorder = (
    list: Array<IBuildOrderElement>,
    startIndex: number,
    endIndex: number
) => {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)

    return result
}

interface MyProps {
    gamelogic: GameLogic
    removeClick: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        index: number
    ) => void
    rerunBuildOrder: (
        race: string | undefined,
        buildOrder: IBuildOrderElement[],
        settings: ISettingsElement[] | undefined
    ) => void
    updateUrl: (
        race: string | undefined,
        buildOrder: IBuildOrderElement[],
        settings: ISettingsElement[] | undefined
    ) => void
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

    onDragEnd(result: any) {
        // Dropped outside the list
        if (!result.destination) {
            return
        }

        const items: Array<IBuildOrderElement> = reorder(
            this.props.gamelogic.bo,
            result.source.index,
            result.destination.index
        )

        this.props.rerunBuildOrder(
            this.props.gamelogic.race,
            items,
            undefined
        )

        this.props.updateUrl(
            this.props.gamelogic.race,
            items,
            undefined
        )
    }

    render() {
        // Convert build order items to div elements
        if (this.props.gamelogic.bo.length === 0) {
            return ""
        }

        const buildOrder = this.props.gamelogic.bo.map((item, index) => {
            const image = getImageOfItem(item)
            return (
                <div onClick={(e: any) => this.props.removeClick(e, index)}>
                    <img src={image} alt={item.name} />
                </div>
            )
        })

        const getItemClass = (dragging: boolean, index: number) => {
            // Build order is invalid after this index, mark background or border red
            // Set color based on if it is dragging
            if (dragging) {
                if (index >= this.props.gamelogic.boIndex) {
                    return CLASSES.boItemInvalidDragging
                }
                return CLASSES.boItemDragging
            } else {
                if (index >= this.props.gamelogic.boIndex) {
                    return CLASSES.boItemInvalid
                }
                return CLASSES.boItem
            }
        }

        // Hide element if no build order items are present
        return (
            <div className={CLASSES.bo}>
                <DragDropContext onDragEnd={this.onDragEnd}>
                    <Droppable droppableId="droppable" direction="horizontal">
                        {(provided, snapshot) => (
                            <div
                                className="flex flex-shrink-0"
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                {this.props.gamelogic.bo.map((item, index) => (
                                    <Draggable
                                        key={`${index}`}
                                        draggableId={`${index}`}
                                        index={index}
                                    >
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className={getItemClass(
                                                    snapshot.isDragging,
                                                    index
                                                )}
                                            >
                                                {buildOrder[index]}
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
        )
    }
}
