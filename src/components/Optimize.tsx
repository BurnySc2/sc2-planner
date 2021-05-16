import React, { Component, ChangeEvent } from "react"
import ReactTooltip from "react-tooltip"
import { filter } from "lodash"

import CLASSES from "../constants/classes"
import { ISettingsElement } from "../constants/interfaces"

interface MyProps {
    optimizeSettings: Array<ISettingsElement>
    updateOptimize: (fieldKey: string, fieldValue: number) => void
    applyOpitimization: (optimizationList: string[]) => void
}

interface MyState {
    show: boolean
    tooltipText: string | JSX.Element
}

export default class Optimize extends Component<MyProps, MyState> {
    /**
     * A small settings menu to enable and disable things
     * And to be able to adjust certain sizes
     */
    constructor(props: MyProps) {
        super(props)
        this.state = {
            show: false,
            tooltipText: "",
        }
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

    onChange = (e: ChangeEvent<HTMLInputElement>, itemShortName: string) => {
        const newValue =
            e.target.type === "checkbox"
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

    onApply = (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        optimizationName: string | number
    ) => {
        this.props.applyOpitimization([`${optimizationName}`])
    }

    mouseEnterFunc = (e: React.MouseEvent<HTMLElement, MouseEvent>, tooltip: string | number) => {
        this.onMouseEnter(e, <div>{tooltip}</div>)
    }

    createInput(item: ISettingsElement): JSX.Element {
        return item.min === 0 && item.max === 1 ? (
            <div key={item.n} className={CLASSES.dropDownSubContainer}>
                <label
                    htmlFor={item.n}
                    className={CLASSES.dropDownLabel}
                    data-tip
                    data-for="optimizeSettingsTooltip"
                    onMouseEnter={(e) => this.mouseEnterFunc(e, item.tooltip)}
                >
                    {item.name}
                </label>
                <input
                    className={CLASSES.dropDownInput}
                    name={item.n}
                    id={item.n}
                    type="checkbox"
                    checked={!!item.v}
                    onChange={(e) => {
                        this.onChange(e, item.n)
                    }}
                />
            </div>
        ) : (
            <div key={item.n} className={CLASSES.dropDownSubContainer}>
                <div
                    className={CLASSES.dropDownLabel}
                    data-tip
                    data-for="optimizeSettingsTooltip"
                    onMouseEnter={(e) => this.mouseEnterFunc(e, item.tooltip)}
                >
                    {item.name}
                </div>
                <input
                    className={CLASSES.dropDownInput}
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
            </div>
        )
    }

    render() {
        const classes = CLASSES.dropDown
        const classesDropdown = this.state.show ? `visible ${classes}` : `hidden ${classes}`
        const optionlessSettings = filter(
            this.props.optimizeSettings,
            (setting: ISettingsElement) => !/Option[0-9]+/.test(`${setting.variableName}`)
        )

        const settingsElements = optionlessSettings.map((item, index) => {
            const addiItems = filter(this.props.optimizeSettings, (setting) =>
                new RegExp(`^${item.variableName}Option[0-9]+$`).test(`${setting.variableName}`)
            )
            const additionalField = addiItems.map((item) => this.createInput(item))
            return (
                <div key={index} className={CLASSES.dropDownContainer + "flex flex-col"}>
                    {this.createInput(item)}
                    {additionalField}
                    <div
                        className={`${CLASSES.dropDownButton} pb-1`}
                        onClick={(e) => this.onApply(e, item.variableName)}
                    >
                        Apply
                    </div>
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
