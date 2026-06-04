import type { DropResult } from "@hello-pangea/dnd"
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd"
import { includes } from "lodash"
import type React from "react"
import { Component } from "react"
import CLASSES from "../constants/classes"
import { getImageOfItem } from "../constants/helper"
import type { IAllRaces, IBuildOrderElement, ISettingsElement } from "../constants/interfaces"
import type Event from "../game_logic/event"
import type { GameLogic } from "../game_logic/gamelogic"

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
    removeClick: (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement, MouseEvent>, index: number) => void
    rerunBuildOrder: (buildOrder: IBuildOrderElement[]) => void
    updateUrl: (
        race: IAllRaces | undefined,
        buildOrder: IBuildOrderElement[],
        settings: ISettingsElement[] | undefined,
        optimizeSettings: ISettingsElement[] | undefined,
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
            result.destination.index,
        )

        this.props.rerunBuildOrder(items)

        this.props.updateUrl(
            this.props.gamelogic.race,
            items,
            this.props.gamelogic.exportSettings(),
            this.props.gamelogic.exportOptimizeSettings(),
        )
    }

    render(): React.ReactElement {
        // Convert build order items to div elements

        // Hide element if no build order items are present
        if (this.props.gamelogic.bo.length === 0) {
            return <div />
        }

        const buildOrder = this.props.gamelogic.bo.map((item, index) => {
            const image = getImageOfItem(item)
            // biome-ignore lint/suspicious/noArrayIndexKey: Build order may contain duplicate item names, index needed for unique keys
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

        const buildOrderItems: React.ReactElement[] = []
        let separatorClass = this.props.insertIndex === 0 ? CLASSES.boItemSeparatorSelected : CLASSES.boItemSeparator
        buildOrderItems.push(
            <button
                id={"separator_0"}
                key={"separator0"}
                className={`${separatorClass} ${CLASSES.buttonReset}`}
                onClick={(_e) => {
                    this.props.changeInsertIndex(0)
                }}
            />,
        )

        this.props.gamelogic.bo.forEach((item, index) => {
            buildOrderItems.push(
                // biome-ignore lint/suspicious/noArrayIndexKey: Required by DnD library for index-based reordering
                <Draggable key={`${index}`} draggableId={`${index}`} index={index}>
                    {(provided, snapshot) => (
                        // biome-ignore lint/a11y/useSemanticElements: Required by DnD library for drag-and-drop
                        <div
                            id={`bo_${item.name}_${index}`}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={getItemClass(snapshot.isDragging, index)}
                            role="button"
                            tabIndex={0}
                            onMouseEnter={(_e) => this.onMouseEnter(index)}
                            onMouseLeave={(_e) => this.onMouseLeave()}
                            onClick={(e) => {
                                this.props.removeClick(e, index)
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    this.props.removeClick(
                                        e as unknown as React.MouseEvent<
                                            HTMLDivElement | HTMLButtonElement,
                                            MouseEvent
                                        >,
                                        index,
                                    )
                                }
                            }}
                        >
                            {buildOrder[index]}
                        </div>
                    )}
                </Draggable>,
            )

            separatorClass =
                this.props.insertIndex === index + 1 ? CLASSES.boItemSeparatorSelected : CLASSES.boItemSeparator
            buildOrderItems.push(
                <button
                    id={`separator_${index + 1}`}
                    // biome-ignore lint/suspicious/noArrayIndexKey: Separator position inherently index-based
                    key={`separator${index + 1}`}
                    className={`${separatorClass} ${CLASSES.buttonReset}`}
                    onClick={(_e) => {
                        this.props.changeInsertIndex(index + 1)
                    }}
                />,
            )
        })

        return (
            <div id={"buildorder"} className={CLASSES.bo}>
                <DragDropContext onDragEnd={this.onDragEnd}>
                    <Droppable droppableId="droppable" direction="horizontal">
                        {(provided, _snapshot) => (
                            <div
                                className={`${this.props.multilineBuildOrder ? "flex-wrap flex-row" : ""} flex`}
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
