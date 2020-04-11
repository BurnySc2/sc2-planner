import React, { Component } from 'react'

import STRUCTURES from '../icons/structures.js'
import UNITS from '../icons/units.js'
import UPGRADES from '../icons/upgrades.js'
import RESOURCES from '../icons/resources.js'
import CUSTOMACTIONS from '../icons/customactions.js'
import CLASSES from "../constants/classes"

export default class ActionsSelection extends Component {
    // TODO Receive race, then based on that build the actions selection
    // TODO If a button is pressed, add item to build order
    
    state = {
        iconSize: 10,
        race: "terran",
        resources: RESOURCES,
        customactions: CUSTOMACTIONS,
        units: UNITS,
        structures: STRUCTURES,
        upgrades: UPGRADES,
    }

    onClick = (e, itemName) => {
        console.log(e.target)
        console.log(`${itemName} was clicked`)
        // TODO add it to the build order
    }

    render() {
        const iconSize = `w-${this.state.iconSize} h-${this.state.iconSize}`
        const classString = `${iconSize} ${CLASSES.icon}`

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
            this.state.customactions[this.state.race].map((item, index) => {
                return <div key={item.name} onClick={(e) => {this.onClick(e, item.name)}}>
                    <img className={classString} src={require("../icons/png/" + item.path)} alt={item.name} />
                </div>
            })
        );

        const units = this.state.units[this.state.race].map((item, index) => {
            return <div key={item.name} onClick={(e) => {this.onClick(e, item.name)}}>
                <img className={classString} src={require("../icons/png/" + item.path)} alt={item.name} />
            </div>
        });

        const structures = this.state.structures[this.state.race].map((item, index) => {
            return <div key={item.name} onClick={(e) => {this.onClick(e, item.name)}}>
                <img className={classString} src={require("../icons/png/" + item.path)} alt={item.name} />
            </div>
        });

        const upgrades = this.state.upgrades[this.state.race].map((item, index) => {
            return <div key={item.name} onClick={(e) => {this.onClick(e, item.name)}}>
                <img className={classString} src={require("../icons/png/" + item.path)} alt={item.name} />
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
