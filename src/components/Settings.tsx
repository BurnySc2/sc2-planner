import React, { Component, ChangeEvent } from "react"
import ReactTooltip from "react-tooltip"

import CLASSES from "../constants/classes"
import { ISettingsElement } from "../constants/interfaces"

interface MyProps {
    settings: Array<ISettingsElement>
    updateSettings: (fieldKey: string, fieldValue: number) => void
}

interface MyState {
    show: boolean
    tooltipText: string | JSX.Element
}

export default class Settings extends Component<MyProps, MyState> {
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

    onChange = (
        e: ChangeEvent<HTMLInputElement>,
        itemShortName: string
    ) => {
        const newValue = parseFloat(e.target.value)
        this.props.updateSettings(itemShortName, newValue)
    }

    onMouseEnter = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, item: JSX.Element) => {
        this.setState({
            tooltipText: item,
        })
    }

    render() {
        const classes = CLASSES.dropDown
        const classesDropdown = this.state.show
            ? `visible ${classes}`
            : `hidden ${classes}`

        const settingsElements = this.props.settings.map((item, index) => {
            const mouseEnterFunc = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                this.onMouseEnter(e, <div>{item.tooltip}</div>)
            }
            return (
                <div key={index} className={CLASSES.dropDownContainer}>
                    <div
                        className={CLASSES.dropDownLabel}
                        data-tip
                        data-for="settingsTooltip"
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
                Settings
                <div className={classesDropdown}>{settingsElements}</div>
            </div>
        )
        return (
            <div>
                <ReactTooltip
                    place="bottom"
                    id="settingsTooltip"
                    className="max-w-xs"
                >
                    {this.state.tooltipText}
                </ReactTooltip>
                {settingsButton}
            </div>
        )
    }
}
