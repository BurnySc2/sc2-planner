import React, { Component } from "react"
import ReactTooltip from "react-tooltip"

import CLASSES from "../constants/classes"

export default class Settings extends Component {
    /**
     * A small settings menu to enable and disable things
     * And to be able to adjust certain sizes
     */
    constructor(props) {
        super(props)
        this.state = {
            show: false,
            tooltipText: "",
        }
    }

    showSettings = (e) => {
        this.setState({
            show: true,
        })
    }

    hideSettings = (e) => {
        this.setState({
            show: false,
        })
    }

    onChange = (e, itemShortName) => {
        const newValue = parseFloat(e.target.value)
        this.props.updateSettings(e, itemShortName, newValue)
    }

    onMouseEnter = (e, item) => {
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
            const mouseEnterFunc = (e) => {
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
                        placeholder={item.v}
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
