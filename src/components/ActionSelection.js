import React, { Component } from 'react'

import STRUCTURES from '../icons/structures.js'
import UNITS from '../icons/units.js'

export default class ActionsSelection extends Component {
    // TODO Receive race, then based on that build the actions selection
    // TODO If a button is pressed, add item to build order
    
    state = {
        units: UNITS.terran,
        structures: STRUCTURES.terran,
        iconSize: 10  
    }

    onClick = (e, itemName) => {
        console.log(e.target)
        console.log(`${itemName} was clicked`)
        // TODO add it to the build order
    }

    render() {
        const iconSize = `w-${this.state.iconSize} h-${this.state.iconSize}`
        const margin = 'm-0 p-0'
        const zValue = 'z-10'
        const hover = 'hover:bg-gray-400'
        const cursor = 'cursor-pointer'
        const classString = `${iconSize} ${margin} ${zValue} ${hover} ${cursor}`

        const units = this.state.units.map((item, index) => {
            return <div key={item.name} onClick={(e) => {this.onClick(e, item.name)}}>
                <img className={classString} src={require("../icons/sc2/" + item.path)} alt={item.name} />
            </div>
        });
        const structures = this.state.structures.map((item, index) => {
            return <div key={item.name} onClick={(e) => {this.onClick(e, item.name)}}>
                <img className={classString} src={require("../icons/sc2/" + item.path)} alt={item.name} />
            </div>
        });

        return (
            <div>
                <div className="flex flex-wrap">resources supply</div>
                <div className="flex flex-wrap">custom actions</div>
                <div className="flex flex-wrap">{units}</div>
                <div className="flex flex-wrap">{structures}</div>
                <div className="flex flex-wrap">upgrades</div>
            </div>
        )
    }
}
