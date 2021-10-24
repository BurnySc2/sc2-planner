import React, { Component } from "react"
import ReactTooltip from "react-tooltip"

import RESOURCES from "../constants/resources"
import { CUSTOMACTIONS } from "../constants/customactions"
import CLASSES from "../constants/classes"
import { UNITS, UNIT_NAMES_BY_RACE } from "../constants/units"
import { STRUCTURES, STRUCTURE_NAMES_BY_RACE } from "../constants/structures"
import { UPGRADES, UPGRADE_NAMES_BY_RACE } from "../constants/upgrades"
import { getImageOfItem } from "../constants/helper"
import { GameLogic } from "../game_logic/gamelogic"
import { ICustomAction, IAllRaces } from "../constants/interfaces"

interface MyProps {
    gamelogic: GameLogic
    race: IAllRaces
    insertIndex: number
    actionClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, action: ICustomAction) => void
    unitClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, unit: string) => void
    structureClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, unit: string) => void
    upgradeClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, unit: string) => void
}

interface MyState {
    tooltipText: JSX.Element | string
}

export default class ActionsSelection extends Component<MyProps, MyState> {
    classString: string

    constructor(props: MyProps) {
        super(props)
        this.classString = `${CLASSES.actionIconContainer}`
        this.state = {
            tooltipText: "",
        }
    }

    onMouseEnter = (
        _e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
        item: JSX.Element
    ): void => {
        this.setState({
            tooltipText: item,
        })
    }

    render(): JSX.Element {
        const gameLogic: GameLogic = this.props.gamelogic
        // If the build order has more items than the gamelogic was able to parse (e.g. requirement not met of some item), then the insertIndex might be higher than max allowed, = bug
        const infoIndex = Math.min(this.props.insertIndex, gameLogic.unitsCountArray.length - 1)
        const unitsCount = gameLogic.unitsCountArray[infoIndex]

        const actionIconTextStyle = {
            bottom: "0%",
            right: "0%",
        }

        const resourcesAvailble = RESOURCES.filter((item) => {
            if (["Minerals", "Vespene"].includes(item.name)) {
                return true
            }
            if (
                this.props.race === "zerg" &&
                (item.name === "Larva" || item.name === "SupplyZerg")
            ) {
                return true
            }
            if (
                this.props.race === "terran" &&
                (item.name === "SupplyTerran" || item.name === "MULE")
            ) {
                return true
            }
            if (this.props.race === "protoss" && item.name === "SupplyProtoss") {
                return true
            }
            return false
        })
        const resources = resourcesAvailble.map((item, _index) => {
            // Instead of getting the status when the last element finished, get the state after the last build order index was started
            let value: number | string = ""
            if (item.name.includes("Supply")) {
                value = `${unitsCount["supplyused"]}/${unitsCount["supplycap"]}`
            } else if (["Larva", "MULE"].includes(item.name)) {
                value = unitsCount[item.name]
            } else {
                // Minerals and vespene
                value = `${Math.round(unitsCount[item.name.toLowerCase()])}`
            }

            return (
                <div key={item.name} className={this.classString}>
                    <img src={require("../icons/png/" + item.path).default} alt={item.name} />
                    <div className={CLASSES.actionIconText} style={actionIconTextStyle}>
                        {value}
                    </div>
                </div>
            )
        })

        const customactions = CUSTOMACTIONS.map((item, _index) => {
            // Update tooltip function
            const mouseEnterFunc = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                this.onMouseEnter(
                    e,
                    <div className="flex flex-col">
                        <div>{item.name}</div>
                    </div>
                )
            }
            const value: number | undefined = unitsCount[item.internal_name]
            let icon = ""
            icon = getImageOfItem({
                name: item.internal_name,
                type: "action",
            })

            const hidden = item.race === undefined || item.race === this.props.race ? "" : "hidden"
            return (
                <button
                    id={item.name}
                    data-tip=""
                    data-for="actionTooltip"
                    key={item.name}
                    className={`${this.classString} ${hidden}`}
                    onMouseEnter={mouseEnterFunc}
                    onClick={(e) => {
                        this.props.actionClick(e, item)
                    }}
                >
                    <img src={icon} alt={item.name} />
                    <div className={CLASSES.actionIconText} style={actionIconTextStyle}>
                        {value}
                    </div>
                </button>
            )
        })

        const units = UNITS.map((item, _index) => {
            // Update tooltip function
            const mouseEnterFunc = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                this.onMouseEnter(
                    e,
                    <div className="flex flex-col text-center">
                        <div>Build unit</div>
                        <div>{item.name}</div>
                        <div>Minerals: {GameLogic.getCost(item.name).minerals}</div>
                        <div>Vespene: {GameLogic.getCost(item.name).vespene}</div>
                        <div>Supply: {GameLogic.getCost(item.name).supply}</div>
                        <div>Train time: {Math.round(item.time / 22.4)}s</div>
                    </div>
                )
            }
            const icon = getImageOfItem({ name: item.name, type: "unit" })

            const value = unitsCount[item.name]
            const hidden = UNIT_NAMES_BY_RACE[this.props.race].has(item.name) ? "" : "hidden"
            return (
                <button
                    id={item.name}
                    data-tip=""
                    data-for="actionTooltip"
                    key={item.name}
                    className={`${this.classString} ${hidden}`}
                    onMouseEnter={mouseEnterFunc}
                    onClick={(e) => {
                        this.props.unitClick(e, item.name)
                    }}
                >
                    <img src={icon} alt={item.name} />
                    <div className={CLASSES.actionIconText} style={actionIconTextStyle}>
                        {value}
                    </div>
                </button>
            )
        })

        const structures = STRUCTURES.map((item, _index) => {
            // Update tooltip function
            const mouseEnterFunc = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                this.onMouseEnter(
                    e,
                    <div className="flex flex-col text-center">
                        <div>Build structure</div>
                        <div>{item.name}</div>
                        <div>Minerals: {GameLogic.getCost(item.name).minerals}</div>
                        <div>Vespene: {GameLogic.getCost(item.name).vespene}</div>
                        <div>Build time: {Math.round(item.time / 22.4)}s</div>
                    </div>
                )
            }
            const icon = getImageOfItem({ name: item.name, type: "structure" })
            const value = unitsCount[item.name]
            const hidden = STRUCTURE_NAMES_BY_RACE[this.props.race].has(item.name) ? "" : "hidden"
            return (
                <button
                    id={item.name}
                    data-tip=""
                    data-for="actionTooltip"
                    key={item.name}
                    className={`${this.classString} ${hidden}`}
                    onMouseEnter={mouseEnterFunc}
                    onClick={(e) => {
                        this.props.structureClick(e, item.name)
                    }}
                >
                    <img src={icon} alt={item.name} />
                    <div className={CLASSES.actionIconText} style={actionIconTextStyle}>
                        {value}
                    </div>
                </button>
            )
        })

        const upgrades = UPGRADES.map((item, _index) => {
            // Update tooltip function
            const mouseEnterFunc = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                this.onMouseEnter(
                    e,
                    <div className="flex flex-col text-center">
                        <div>Research upgrade</div>
                        <div>{item.name}</div>
                        <div>Minerals: {item.cost.minerals}</div>
                        <div>Vespene: {item.cost.gas}</div>
                        <div>Research time: {Math.round(item.cost.time / 22.4)}s</div>
                    </div>
                )
            }
            const icon = getImageOfItem({ name: item.name, type: "upgrade" })
            const value = unitsCount[item.name]
            const hidden = UPGRADE_NAMES_BY_RACE[this.props.race].has(item.name) ? "" : "hidden"
            const upgradeDisabled = this.props.gamelogic.upgrades.has(item.name)
                ? "filter grayscale"
                : ""
            return (
                <button
                    id={item.name}
                    data-tip=""
                    data-for="actionTooltip"
                    key={item.name}
                    className={`${this.classString} ${hidden} ${upgradeDisabled}`}
                    onMouseEnter={mouseEnterFunc}
                    onClick={(e) => {
                        this.props.upgradeClick(e, item.name)
                    }}
                >
                    <img src={icon} alt={item.name} />
                    <div className={CLASSES.actionIconText} style={actionIconTextStyle}>
                        {value}
                    </div>
                </button>
            )
        })

        return (
            <div>
                <ReactTooltip place="left" id="actionTooltip">
                    {this.state.tooltipText}
                </ReactTooltip>
                <div className={CLASSES.actionContainer}>{resources}</div>
                <div className={CLASSES.actionContainer}>{customactions}</div>
                <div className={CLASSES.actionContainer}>{units}</div>
                <div className={CLASSES.actionContainer}>{structures}</div>
                <div className={CLASSES.actionContainer}>{upgrades}</div>
            </div>
        )
    }
}
