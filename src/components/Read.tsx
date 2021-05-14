import React, { Component } from "react"
import ReactTooltip from "react-tooltip"
import { find, countBy, uniq, last } from "lodash"

import CLASSES from "../constants/classes"
import { GameLogic } from "../game_logic/gamelogic"

type Instruction = [string[], number, boolean]

interface MyProps {
    gamelogic: GameLogic
}

interface MyState {
    show: boolean
    canStop: boolean
    tooltipText: string | JSX.Element
}

export default class Read extends Component<MyProps, MyState> {
    synth: SpeechSynthesis
    voices: SpeechSynthesisVoice[]
    lineHandlers: NodeJS.Timeout[]
    startTime: number
    /**
     * A small settings menu to enable and disable things
     * And to be able to adjust certain sizes
     */
    constructor(props: MyProps) {
        super(props)
        this.synth = window.speechSynthesis
        this.voices = this.synth.getVoices()
        this.state = {
            show: false,
            canStop: false,
            tooltipText: "",
        }
        this.lineHandlers = []
        this.startTime = 0
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

    onMouseEnter = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, item: JSX.Element) => {
        this.setState({
            tooltipText: item,
        })
    }

    readBuildOrder(startAt = 0) {
        this.setState({
            canStop: true,
        })
        //TODO1 remove joke
        //this.speak("Renaud, tu micro comme un ver de terre...", 0, false, "Google français")
        this.speak("3", 0)
        this.speak("2", 1)
        this.speak("1", 2)
        const instructionList: Instruction[] = []
        const lastEvent = this.props.gamelogic.eventLog[this.props.gamelogic.eventLog.length - 1]
        let prevInstruction: Instruction | undefined
        let boEndTime = 0
        for (let event of this.props.gamelogic.eventLog) {
            const time = (event.start * 1000) / 22.4 - startAt * 1000
            if (time >= 0) {
                const isLastMessage = event === lastEvent
                const text = event.name.replace(/_/g, " ")
                boEndTime = Math.max(boEndTime, event?.end || event.start)
                if (prevInstruction && prevInstruction[1] === time) {
                    prevInstruction[0].push(text)
                    prevInstruction[2] = isLastMessage
                } else {
                    prevInstruction = [[text], time, isLastMessage]
                    instructionList.push(prevInstruction)
                }
                if (isLastMessage) {
                    const minutes = Math.floor(boEndTime / 22.4 / 60)
                    const seconds = Math.floor(boEndTime / 22.4) % 60
                    prevInstruction[0].push(
                        `Then the build order ends at ${
                            minutes >= 1 ? `${minutes}:${seconds}` : `${seconds} seconds`
                        }`
                    )
                }
            }
        }
        this.lineHandlers.push(
            setTimeout(() => {
                instructionList.forEach((instruction) => {
                    const items = instruction[0]
                    const count = countBy(items)
                    const uniqItems = uniq(items)
                    const itemsWithPlurals = uniqItems.map((item) =>
                        count[item] === 1 ? item : `${count[item]} ${item}s`
                    )
                    const text =
                        itemsWithPlurals.length === 1
                            ? itemsWithPlurals[0]
                            : `${itemsWithPlurals.slice(0, -1).join(", ")}, and ${last(
                                  itemsWithPlurals
                              )}`
                    this.speak(text, instruction[1], instruction[2])
                })
            }, 3 * 1000)
        )
    }

    speak(
        whatToSay: string,
        when = 0,
        isLastMessage = false,
        language = "Google UK English Female"
    ) {
        if (this.synth.speaking) {
            this.stop()
        }
        this.lineHandlers.push(
            setTimeout(() => {
                const utterThis = new SpeechSynthesisUtterance(whatToSay)
                if (utterThis) {
                    if (!this.voices.length) {
                        // Insist on initializing this.voices, sometimes it doesn't work straight away
                        this.voices = this.synth.getVoices()
                    }
                    const voice = find(this.voices, { name: language })
                    if (voice) {
                        utterThis.voice = voice
                    }
                    this.synth.speak(utterThis)
                    if (isLastMessage) {
                        this.lineHandlers = []
                        this.setState({
                            canStop: false,
                        })
                    }
                }
            }, when)
        )
    }

    stop() {
        if (this.lineHandlers.length) {
            this.lineHandlers.forEach(clearTimeout)
            this.lineHandlers = []
            this.setState({
                canStop: false,
            })
            this.synth.cancel()
        }
    }

    render() {
        const classes = CLASSES.dropDown
        const classesDropdown = this.state.show ? `visible ${classes}` : `hidden ${classes}`
        const stopVisibility = `${CLASSES.buttons} ${
            this.state.canStop ? "visible" : "hidden"
        } cursor-pointer`

        const mouseEnterFunc = (tooltip: string) => (
            e: React.MouseEvent<HTMLDivElement, MouseEvent>
        ) => {
            this.onMouseEnter(e, <div>{tooltip}</div>)
        }

        const readButton = (
            <div
                className={CLASSES.buttons}
                onMouseEnter={this.showSettings}
                onMouseLeave={this.hideSettings}
            >
                Read BO&nbsp;&nbsp;▷
                <div className={classesDropdown}>
                    <div key="readStartTime" className={CLASSES.dropDownContainer}>
                        <div className={CLASSES.dropDownSubContainer}>
                            <div
                                className={CLASSES.dropDownLabel}
                                data-tip
                                data-for="readTooltip"
                                onMouseEnter={mouseEnterFunc(
                                    "Time at which the speaker should start describing the bo"
                                )}
                            >
                                Time at which to start
                            </div>
                            <input
                                className={CLASSES.dropDownInput}
                                type="number"
                                placeholder="0"
                                defaultValue="0"
                                step="10"
                                min="-20"
                                max="1000"
                                onChange={(e) => (this.startTime = parseFloat(e.target.value))}
                            />
                        </div>
                    </div>
                    <div className={CLASSES.dropDownContainer}>
                        <div
                            className={CLASSES.dropDownWideButton}
                            onClick={(e) => this.readBuildOrder(this.startTime)}
                        >
                            <span className={CLASSES.centeredButton}>Read</span>
                        </div>
                    </div>
                </div>
            </div>
        )
        const stopButton = (
            <div className={stopVisibility} onClick={(e) => this.stop()}>
                Stop □
            </div>
        )
        return (
            <div className="flex">
                <div>
                    <ReactTooltip place="bottom" id="readTooltip" className="max-w-xs">
                        {this.state.tooltipText}
                    </ReactTooltip>
                    {readButton}
                </div>

                {stopButton}
            </div>
        )
    }
}
