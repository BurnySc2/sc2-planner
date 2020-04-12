import React, { Component } from 'react'

import RESOURCES from '../constants/resources'
import CUSTOMACTIONS from '../constants/customactions'
import CLASSES from "../constants/classes"
import UNITS from '../constants/units'
import STRUCTURES from '../constants/structures'
import UPGRADES from "../constants/upgrades"

// Importing json doesnt seem to work with `import` statements, but have to use `require`
const UNIT_ICONS = require("../icons/unit_icons.json")
const UPGRADE_ICONS = require("../icons/upgrade_icons.json")

export default class ActionsSelection extends Component {
    // TODO Receive race, then based on that build the actions selection
    // TODO If a button is pressed, add item to build order
    constructor(props) {
        super(props)
        this.state = {
            resources: RESOURCES,
            customactions: CUSTOMACTIONS,
            units: UNITS,
            structures: STRUCTURES,
            upgrades: UPGRADES,
        }
        // console.log(this.state.race)

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

    onClick = (e, itemName) => {
        // console.log(e.target)
        console.log(`${itemName}: 1,`)
        // TODO add it to the build order
    }

    render() {
        const classString = `${CLASSES.icon}`

        const resources = this.state.resources.map((item, index) => {
            return <div key={item.name} onClick={(e) => {this.onClick(e, item.name)}}>
                <img className={classString} src={require("../icons/png/" + item.path)} alt={item.name} />
            </div>
        });

        const customactions = this.state.customactions.all.map((item, index) => {
            return <div key={item.name} onClick={(e) => {this.onClick(e, item.name)}}>
                <img className={classString} src={require("../icons/png/" + item.path)} alt={item.name} />
            </div>
        }).concat(
            this.state.customactions[this.props.race].map((item, index) => {
                return <div key={item.name} onClick={(e) => {this.onClick(e, item.name)}}>
                    <img className={classString} src={require("../icons/png/" + item.path)} alt={item.name} />
                </div>
            })
        );

        const units = this.state.units[this.props.race].map((item, index) => {
            const icon = this.unitIcons[item.name.toUpperCase()]
            return <div key={item.name} onClick={(e) => {this.onClick(e, item.name)}}>
                <img className={classString} src={icon} alt={item.name} />
            </div>
        });

        const structures = this.state.structures[this.props.race].map((item, index) => {
            const icon = this.unitIcons[item.name.toUpperCase()]
            return <div key={item.name} onClick={(e) => {this.onClick(e, item.name)}}>
                <img className={classString} src={icon} alt={item.name} />
            </div>
        });
        
        const upgrades = this.state.upgrades[this.props.race].map((item, index) => {
            const icon = this.upgradeIcons[item.name.toUpperCase()]
            return <div key={item.name} onClick={(e) => {this.onClick(e, item.name)}}>
                <img className={classString} src={icon} alt={item.name} />
            </div>
        });

        return (
            <div>
                <div className="flex flex-wrap">{resources}</div>
                <div className="flex flex-wrap">{customactions}</div>
                <div className="flex flex-wrap">{units}</div>
                <div className="flex flex-wrap">{structures}</div>
                <div className="flex flex-wrap">{upgrades}</div>
            </div>
        )
    }
}
