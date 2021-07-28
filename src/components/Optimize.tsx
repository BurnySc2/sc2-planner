import React, { Component, ChangeEvent } from "react"
import ReactTooltip from "react-tooltip"
import { filter, remove, sortedIndexBy } from "lodash"

import CLASSES from "../constants/classes"
import { ISettingsElement, Log, IAllRaces } from "../constants/interfaces"
import {
    Constraint,
    TimeConstraint,
    ConstraintType,
    getConstraintList,
    setConstraintList,
} from "../game_logic/optimize"
import { GameLogic } from "../game_logic/gamelogic"

interface MyProps {
    race: IAllRaces
    optimizeSettings: Array<ISettingsElement>
    updateOptimize: (fieldKey: string, fieldValue: number | string, doRerunBO?: boolean) => void
    applyOpitimization: (optimizationList: string[]) => Promise<Log | undefined>
    gamelogic: GameLogic
    getOnAddConstraint: (callback: (index: number, action: ConstraintType) => void) => void
    log: (log: Log | undefined) => void
}

interface MyState {
    show: boolean
    tooltipText: string | JSX.Element
    constraintsChangeCount: number
}

export class Optimize extends Component<MyProps, MyState> {
    /**
     * A small settings menu to enable and disable things
     * And to be able to adjust certain sizes
     */
    constructor(props: MyProps) {
        super(props)
        this.state = {
            show: false,
            tooltipText: "",
            constraintsChangeCount: 0,
        }
        props.getOnAddConstraint(this.onAddConstraint.bind(this))
    }

    showSettings = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        this.setState({
            show: true,
        })
    }

    hideSettings = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        this.setState({
            show: false,
        })
    }

    onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, itemShortName: string) => {
        const newValue =
            e.target.constructor === HTMLTextAreaElement
                ? e.target.value
                : e.target.type === "checkbox"
                ? (e.target as any).checked
                    ? 1
                    : 0
                : parseFloat(e.target.value)
        this.props.updateOptimize(itemShortName, newValue)
    }

    onMouseEnter = (e: React.MouseEvent<HTMLElement, MouseEvent>, item: JSX.Element) => {
        this.setState({
            tooltipText: item,
        })
    }

    onApply = async (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        optimizationName: string | number
    ) => {
        const log = await this.props.applyOpitimization([`${optimizationName}`])
        this.props.log(log)
    }

    mouseEnterFunc = (e: React.MouseEvent<HTMLElement, MouseEvent>, tooltip: string | number) => {
        this.onMouseEnter(e, <div>{tooltip}</div>)
    }

    resizeTextArea(element: HTMLTextAreaElement) {
        element.style.height = "inherit"
        element.style.height = `${Math.max(50, element.scrollHeight)}px`
    }

    onAddConstraint(index: number, action: ConstraintType): void {
        let didChangeConstraints = false
        index = index === -1 ? this.props.gamelogic.bo.length - 1 : index
        const name = this.props.gamelogic.bo[index].name
        const pos = filter(this.props.gamelogic.bo.slice(0, index), { name }).length
        const eventLog = filter(this.props.gamelogic.eventLog, { name })[pos]
        const itemEndFrame = eventLog?.end || eventLog?.start
        const endTime = Math.floor(itemEndFrame / 22.4)
        if (endTime === undefined) {
            return
        }
        const list: Constraint[] = getConstraintList(this.props.optimizeSettings)

        if (action === "remove") {
            didChangeConstraints = remove(list, { name, pos }).length > 0
        } else {
            const toRemoveList: Constraint[] = []
            let foundName = false
            for (let constraint of list) {
                if (
                    constraint.type === "time" &&
                    constraint.name === name &&
                    constraint.pos === pos
                ) {
                    if (action === "after" || action === "at") {
                        foundName = true
                        if (constraint.after !== endTime) {
                            didChangeConstraints = true
                            constraint.after = endTime
                        }
                    }
                    if (action === "after" && constraint.before <= endTime) {
                        foundName = true
                        didChangeConstraints = true
                        constraint.before = Infinity
                    }
                    if (action === "before" || action === "at") {
                        foundName = true
                        if (constraint.before !== endTime) {
                            didChangeConstraints = true
                            constraint.before = endTime
                        }
                    }
                    if (action === "before" && constraint.after >= endTime) {
                        foundName = true
                        didChangeConstraints = true
                        constraint.after = -Infinity
                    }
                }
            }
            for (let toRemove of toRemoveList) {
                remove(list, toRemove)
            }
            if (!foundName) {
                didChangeConstraints = true
                const newConstraint: TimeConstraint = {
                    type: "time",
                    name,
                    pos,
                    after: action === "after" || action === "at" ? endTime : -Infinity,
                    before: action === "before" || action === "at" ? endTime : Infinity,
                }
                const whereToInsert = sortedIndexBy(
                    list,
                    newConstraint,
                    (constraint) => `${constraint.name}#${constraint.pos}`
                )
                list.splice(whereToInsert, 0, newConstraint)
            }
        }

        if (didChangeConstraints) {
            const constraints: string = setConstraintList(list)
            this.props.log({
                autoClose: true,
                notice: `New optimize constraints: ${constraints ? constraints : "none!"}`,
                temporary: true,
            })
            this.props.updateOptimize("c", constraints, false)
            this.setState({
                constraintsChangeCount: this.state.constraintsChangeCount + 1,
            })
        }
    }

    componentDidMount() {
        const textAreas = document.getElementsByTagName("textarea")
        for (let textArea of textAreas) {
            this.resizeTextArea(textArea)
        }
    }

    createInput(item: ISettingsElement): JSX.Element {
        if (item.v === undefined) {
            return <></>
        }
        let inputElement: JSX.Element

        const isTextarea = typeof item.v === "string"
        if (isTextarea) {
            inputElement = (
                <textarea
                    className={CLASSES.dropDownInputMultiline}
                    name={item.n}
                    key={item.n}
                    id={item.n}
                    value={item.v}
                    placeholder="Add constraints by moving your cursor on an item and press e, r, t, or y. Then edit constraints here."
                    onChange={(e) => {
                        this.onChange(e, item.n)
                    }}
                ></textarea>
            )
        } else if (item.min === 0 && item.max === 1) {
            inputElement = (
                <input
                    className={CLASSES.dropDownInput}
                    name={item.n}
                    key={item.n}
                    id={item.n}
                    type="checkbox"
                    checked={!!item.v}
                    onChange={(e) => {
                        this.onChange(e, item.n)
                    }}
                />
            )
        } else {
            inputElement = (
                <input
                    className={CLASSES.dropDownInput}
                    name={item.n}
                    key={item.n}
                    id={item.n}
                    type="number"
                    placeholder={`${item.v}`}
                    defaultValue={item.v}
                    step={item.step}
                    min={item.min}
                    max={item.max}
                    onChange={(e) => {
                        this.onChange(e, item.n)
                    }}
                />
            )
        }
        return (
            <div
                key={item.n}
                className={
                    isTextarea
                        ? CLASSES.dropDownSubContainerMultiline
                        : CLASSES.dropDownSubContainer
                }
            >
                <div
                    className={CLASSES.dropDownLabelMultiline}
                    data-tip
                    data-for="optimizeSettingsTooltip"
                    onMouseEnter={(e) => this.mouseEnterFunc(e, item.tooltip)}
                >
                    {`${item.name}`.split("\n").map((item, key) => {
                        return <div key={key}>{item}</div>
                    })}
                </div>
                {inputElement}
            </div>
        )
    }

    render() {
        const classes = CLASSES.dropDown
        const classesDropdown = this.state.show ? `visible ${classes}` : `hidden ${classes}`
        if (this.state.show) {
            setTimeout(() => this.componentDidMount())
        }
        const optionlessSettings = filter(
            this.props.optimizeSettings,
            (setting: ISettingsElement) =>
                !/Option[0-9]+/.test(`${setting.variableName}`) &&
                (setting.races === undefined || `${setting.races}`.indexOf(this.props.race) >= 0)
        )

        const settingsElements = optionlessSettings.map((item, index) => {
            const addiItems = filter(this.props.optimizeSettings, (setting) =>
                new RegExp(`^${item.variableName}Option[0-9]+$`).test(`${setting.variableName}`)
            )
            const additionalField = addiItems.map((item) => this.createInput(item))
            const classes = [
                CLASSES.dropDownContainer,
                "flex flex-col",
                index > 0 ? "border-t border-black pt-3" : "",
            ]
            const applyButton: JSX.Element | undefined = item.apply ? (
                <div
                    className={`${CLASSES.dropDownButton} m-2 p-2`}
                    onClick={(e) => this.onApply(e, item.variableName)}
                    onMouseEnter={(e) => this.mouseEnterFunc(e, item.tooltip)}
                    data-tip
                    data-for="optimizeSettingsTooltip"
                >
                    {item.apply}
                </div>
            ) : undefined
            return (
                <div key={index} className={classes.join(" ")}>
                    {this.createInput(item)}
                    {additionalField}
                    {applyButton}
                </div>
            )
        })

        // TODO Add apply button because onChange doesnt work reliably (laggy behavior)

        const settingsButton = (
            <div
                className={CLASSES.buttons}
                onMouseEnter={this.showSettings}
                onMouseLeave={this.hideSettings}
            >
                Optimize
                <div className={classesDropdown}>{settingsElements}</div>
            </div>
        )
        return (
            <div>
                <ReactTooltip place="bottom" id="optimizeSettingsTooltip" className="max-w-xs">
                    {this.state.tooltipText}
                </ReactTooltip>
                {settingsButton}
            </div>
        )
    }
}
