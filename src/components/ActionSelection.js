import React, { Component } from 'react'

import RESOURCES from '../constants/resources'
import {CUSTOMACTIONS} from '../constants/customactions'
import CLASSES from "../constants/classes"
import UNITS from '../constants/units'
import STRUCTURES from '../constants/structures'
import UPGRADES from "../constants/upgrades"

// Importing json doesnt seem to work with `import` statements, but have to use `require`
const UNIT_ICONS = require("../icons/unit_icons.json")
const UPGRADE_ICONS = require("../icons/upgrade_icons.json")

export default class ActionsSelection extends Component {
    // TODO If a button is pressed, add item to build order
    constructor(props) {
        super(props)
        this.state = {}

        this.resources = RESOURCES
        this.customactions = CUSTOMACTIONS
        this.units = UNITS
        this.structures = STRUCTURES
        this.upgrades = UPGRADES
        // console.log(props.race)

        // Load unit icons
        this.unitIcons = {}
        Object.keys(UNIT_ICONS).forEach((item) => {
            this.unitIcons[item] = require(`../icons/png/${UNIT_ICONS[item]}`)
        });

        // Load upgrade icons
        this.upgradeIcons = {}
        Object.keys(UPGRADE_ICONS).forEach((item) => {
            this.upgradeIcons[item] = require(`../icons/png/${UPGRADE_ICONS[item]}`)
            // console.log(item);
            // console.log(this.upgradeIcons[item]);
        });
    }

    render() {
        const classString = `${CLASSES.icon}`

        const resources = this.resources.map((item, index) => {
            return <div key={item.name}>
                <img className={classString} src={require("../icons/png/" + item.path)} alt={item.name} />
            </div>
        });

        const customactions = this.customactions.all.concat(this.customactions[this.props.race]).map((item, index) => {
            return <div key={item.name} onClick={(e) => {this.props.actionClick(e, item)}}>
                <img className={classString} src={require("../icons/png/" + item.path)} alt={item.name} />
            </div>
        })

        const units = this.units[this.props.race].map((item, index) => {
            const icon = this.unitIcons[item.name.toUpperCase()]
            return <div key={item.name} onClick={(e) => {this.props.unitClick(e, item.name)}}>
                <img className={classString} src={icon} alt={item.name} />
            </div>
        });

        const structures = this.structures[this.props.race].map((item, index) => {
            const icon = this.unitIcons[item.name.toUpperCase()]
            return <div key={item.name} onClick={(e) => {this.props.structureClick(e, item.name)}}>
                <img className={classString} src={icon} alt={item.name} />
            </div>
        });
        
        const upgrades = this.upgrades[this.props.race].map((item, index) => {
            const icon = this.upgradeIcons[item.name.toUpperCase()]
            return <div key={item.name} onClick={(e) => {this.props.upgradeClick(e, item.name)}}>
                <img className={classString} src={icon} alt={item.name} />
            </div>
        });
        
        return (
            <div>
                <div className={CLASSES.actionContainer}>{resources}</div>
                <div className={CLASSES.actionContainer}>{customactions}</div>
                <div className={CLASSES.actionContainer}>{units}</div>
                <div className={CLASSES.actionContainer}>{structures}</div>
                <div className={CLASSES.actionContainer}>{upgrades}</div>
            </div>
        )
    }
}
