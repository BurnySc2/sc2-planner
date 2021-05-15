import React, { Component, ChangeEvent } from "react"
import ReactTooltip from "react-tooltip"
import { find, filter } from "lodash"

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

    onMouseEnter = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, item: JSX.Element) => {
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

    render() {
        const classes = CLASSES.dropDown
        const classesDropdown = this.state.show ? `visible ${classes}` : `hidden ${classes}`
        const optionlessSettings = filter(
            this.props.optimizeSettings,
            (item: ISettingsElement) => !/Option1/.test(`${item.variableName}`)
        )

        const settingsElements = optionlessSettings.map((item, index) => {
            const mouseEnterFunc = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                this.onMouseEnter(e, <div>{item.tooltip}</div>)
            }
            const addiItem = find(this.props.optimizeSettings, {
                variableName: `${item.variableName}Option1`,
            })
            const additionalField = !addiItem ? (
                ""
            ) : (
                <label>
                    <input
                        name={addiItem.n}
                        type="checkbox"
                        checked={!!addiItem.v}
                        onChange={(e) => {
                            this.onChange(e, addiItem.n)
                        }}
                    />
                    {addiItem.name}&nbsp;
                </label>
            )
            return (
                <div key={index} className={CLASSES.dropDownContainer}>
                    <div className={CLASSES.dropDownSubContainer}>
                        <div
                            className={CLASSES.dropDownLabel}
                            data-tip
                            data-for="optimizeSettingsTooltip"
                            onMouseEnter={mouseEnterFunc}
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
                        {additionalField}
                    </div>
                    <div
                        className={CLASSES.dropDownButton}
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
