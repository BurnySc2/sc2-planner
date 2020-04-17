import React, { Component } from 'react'
import ReactTooltip from 'react-tooltip';

import CLASSES from '../constants/classes'

export default class Footer extends Component {
    constructor(props){
        super(props)
        this.state = {
            tooltipText: ""
        }
    }

    redirect = {
        "donate": {
            name: "Donate",
            url: "https://www.google.de", // paypal url?
            tooltip: "Paypal"
        },
        "contribute": {
            name: "Contribute",
            url: "https://github.com/BurnySc2/sc2-planner", // github url
            tooltip: "https://github.com/BurnySc2/sc2-planner"
        },
        "report_bugs": {
            name: "Report Bugs",
            url: "https://github.com/BurnySc2/sc2-planner/issues/new", // github issues url
            tooltip: "https://github.com/BurnySc2/sc2-planner/issues/new"
        },
        "contact": {
            name: "Contact",
            url: "", // popup with discord#tag
            tooltip: <div>
                <div>Discord: BuRny#8752</div>
                <div>Twitter?</div>
                <div>Email?</div>
                <div>Reddit?</div>
                <div>Idk?</div>
            </div>
        }
    }

    onMouseEnter = (e, item) => {
        this.setState({
            tooltipText: item
        })
    }
    
    render() {
        const buttons = ["donate", "contribute", "report_bugs", "contact"].map((myKey, index) => {
            const item = this.redirect[myKey]
            const mouseEnterFunc = (e) => {
                this.onMouseEnter(e, 
                    item.tooltip
                )
            }
            if (item.url === "") {
                return <a key={item.name} data-tip data-for='footerTooltip' onMouseEnter={mouseEnterFunc} className={CLASSES.buttons}>
                    {item.name}
                </a>
            } else {
                return <a key={item.name} data-tip data-for='footerTooltip' onMouseEnter={mouseEnterFunc} className={CLASSES.buttons} href={item.url}>
                    {item.name}
                </a>
            }
        })

        return (
            <div className="flex flex-row">
                <ReactTooltip place="top" id="footerTooltip">{this.state.tooltipText}</ReactTooltip>
                {buttons}
            </div>
        )
    }
}
