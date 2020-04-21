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
    actionClick: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        action: ICustomAction
    ) => void
    unitClick: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        unit: string
    ) => void
    structureClick: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        unit: string
    ) => void
    upgradeClick: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        unit: string
    ) => void
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
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        item: JSX.Element
    ) => {
        this.setState({
            tooltipText: item,
        })
    }

    render() {
        let latestSnapshot: GameLogic | null = this.props.gamelogic.getLastSnapshot()
        // Is undefined on first frame = when build order is empty
        if (!latestSnapshot) {
            latestSnapshot = this.props.gamelogic
        }

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
            if (
                this.props.race === "protoss" &&
                item.name === "SupplyProtoss"
            ) {
                return true
            }
            return false
        })

        const resources = resourcesAvailble.map((item, index) => {
            // Instead of getting the status when the last element finished, get the state after the last build order index was started
            let value: number | string = ""
            if (latestSnapshot) {
                if (item.name.includes("Supply")) {
                    value = `${latestSnapshot.supplyUsed}/${latestSnapshot.supplyCap}`
                } else if (item.name === "Larva") {
                    value = latestSnapshot.unitsCount[item.name]
                        ? latestSnapshot.unitsCount[item.name]
                        : ""
                } else if (item.name === "MULE") {
                    value = latestSnapshot.unitsCount[item.name]
                        ? latestSnapshot.unitsCount[item.name]
                        : ""
                } else {
                    value = `${Math.round(
                        // TODO Fix me
                        // @ts-ignore
                        latestSnapshot[item.name.toLowerCase()]
                    )}`
                }
            }

            return (
                <div key={item.name} className={this.classString}>
                    <img
                        src={require("../icons/png/" + item.path)}
                        alt={item.name}
                    />
                    <div
                        className={CLASSES.actionIconText}
                        style={actionIconTextStyle}
                    >
                        {value}
                    </div>
                </div>
            )
        })

        const customactions = CUSTOMACTIONS.map((item, index) => {
            // Update tooltip function
            const mouseEnterFunc = (
                e: React.MouseEvent<HTMLDivElement, MouseEvent>
            ) => {
                this.onMouseEnter(
                    e,
                    <div className="flex flex-col">
                        <div>{item.name}</div>
                    </div>
                )
            }
            let value: number | string = ""
            let icon = ""
            if (latestSnapshot) {
                value = latestSnapshot.unitsCount[item.internal_name]
                    ? latestSnapshot.unitsCount[item.internal_name]
                    : ""
                icon = getImageOfItem({
                    name: item.name,
                    type: "action",
                })
            }
            const hidden =
                item.race === undefined || item.race === this.props.race
                    ? ""
                    : "hidden"
            return (
                <div
                    data-tip
                    data-for="actionTooltip"
                    key={item.name}
                    className={`${this.classString} ${hidden}`}
                    onMouseEnter={mouseEnterFunc}
                    onClick={(e) => {
                        this.props.actionClick(e, item)
                    }}
                >
                    <img src={icon} alt={item.name} />
                    <div
                        className={CLASSES.actionIconText}
                        style={actionIconTextStyle}
                    >
                        {value}
                    </div>
                </div>
            )
        })

        const units = UNITS.map((item, index) => {
            // Update tooltip function
            const mouseEnterFunc = (
                e: React.MouseEvent<HTMLDivElement, MouseEvent>
            ) => {
                this.onMouseEnter(
                    e,
                    <div className="flex flex-col text-center">
                        <div>Build unit</div>
                        <div>{item.name}</div>
                        <div>Minerals: {item.minerals}</div>
                        <div>Vespene: {item.gas}</div>
                        <div>Supply: {item.supply}</div>
                        <div>Train time: {Math.round(item.time / 22.4)}s</div>
                    </div>
                )
            }
            const icon = getImageOfItem({ name: item.name, type: "unit" })

            const value =
                latestSnapshot && latestSnapshot.unitsCount[item.name]
                    ? latestSnapshot.unitsCount[item.name]
                    : ""
            const hidden = UNIT_NAMES_BY_RACE[this.props.race].has(item.name)
                ? ""
                : "hidden"
            return (
                <div
                    data-tip
                    data-for="actionTooltip"
                    key={item.name}
                    className={`${this.classString} ${hidden}`}
                    onMouseEnter={mouseEnterFunc}
                    onClick={(e) => {
                        this.props.unitClick(e, item.name)
                    }}
                >
                    <img src={icon} alt={item.name} />
                    <div
                        className={CLASSES.actionIconText}
                        style={actionIconTextStyle}
                    >
                        {value}
                    </div>
                </div>
            )
        })

        const structures = STRUCTURES.map((item, index) => {
            // Update tooltip function
            const mouseEnterFunc = (
                e: React.MouseEvent<HTMLDivElement, MouseEvent>
            ) => {
                this.onMouseEnter(
                    e,
                    <div className="flex flex-col text-left">
                        <div>Build structure</div>
                        <div>{item.name}</div>
                        <div>Minerals: {item.minerals}</div>
                        <div>Vespene: {item.gas}</div>
                        <div>Build time: {Math.round(item.time / 22.4)}s</div>
                    </div>
                )
            }
            const icon = getImageOfItem({ name: item.name, type: "structure" })
            const value =
                latestSnapshot && latestSnapshot.unitsCount[item.name]
                    ? latestSnapshot.unitsCount[item.name]
                    : ""
            const hidden = STRUCTURE_NAMES_BY_RACE[this.props.race].has(
                item.name
            )
                ? ""
                : "hidden"
            return (
                <div
                    data-tip
                    data-for="actionTooltip"
                    key={item.name}
                    className={`${this.classString} ${hidden}`}
                    onMouseEnter={mouseEnterFunc}
                    onClick={(e) => {
                        this.props.structureClick(e, item.name)
                    }}
                >
                    <img src={icon} alt={item.name} />
                    <div
                        className={CLASSES.actionIconText}
                        style={actionIconTextStyle}
                    >
                        {value}
                    </div>
                </div>
            )
        })

        const upgrades = UPGRADES.map((item, index) => {
            // Update tooltip function
            const mouseEnterFunc = (
                e: React.MouseEvent<HTMLDivElement, MouseEvent>
            ) => {
                this.onMouseEnter(
                    e,
                    <div className="flex flex-col">
                        <div>Research upgrade</div>
                        <div>{item.name}</div>
                        <div>Minerals: {item.cost.minerals}</div>
                        <div>Vespene: {item.cost.gas}</div>
                        <div>
                            Research time: {Math.round(item.cost.time / 22.4)}s
                        </div>
                    </div>
                )
            }
            const icon = getImageOfItem({ name: item.name, type: "upgrade" })
            const value =
                latestSnapshot && latestSnapshot.unitsCount[item.name]
                    ? latestSnapshot.unitsCount[item.name]
                    : ""
            const hidden = UPGRADE_NAMES_BY_RACE[this.props.race].has(item.name)
                ? ""
                : "hidden"
            return (
                <div
                    data-tip
                    data-for="actionTooltip"
                    key={item.name}
                    className={`${this.classString} ${hidden}`}
                    onMouseEnter={mouseEnterFunc}
                    onClick={(e) => {
                        this.props.upgradeClick(e, item.name)
                    }}
                >
                    <img src={icon} alt={item.name} />
                    <div
                        className={CLASSES.actionIconText}
                        style={actionIconTextStyle}
                    >
                        {value}
                    </div>
                </div>
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
