import React, { Component } from "react"
import ReactTooltip from "react-tooltip"
import { find } from "lodash"

import CLASSES from "../constants/classes"
import { GameLogic } from "../game_logic/gamelogic"

interface MyProps {
    gamelogic: GameLogic
}

interface MyState {
    show: boolean
    canStop: boolean
    tooltipText: string | JSX.Element
}

export default class Play extends Component<MyProps, MyState> {
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

    playBuildOrder(startAt = 0) {
        //TODO1 remove joke
        //this.speak("Renaud, tu micro comme un ver de terre...", 0, false, "Google français")

        const lastEvent = this.props.gamelogic.eventLog[this.props.gamelogic.eventLog.length - 1]
        this.setState({
            canStop: true,
        })
        for (let event of this.props.gamelogic.eventLog) {
            const time = (event.start * 1000) / 24 - startAt
            if (time >= 0) {
                const isLastMessage = event === lastEvent
                this.speak(event.name.replace(/_/g, " "), time, isLastMessage)
            }
        }
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

        const playButton = (
            <div
                className={CLASSES.buttons}
                onMouseEnter={this.showSettings}
                onMouseLeave={this.hideSettings}
            >
                Play ▷
                <div className={classesDropdown}>
                    <div key="playStartTime" className={CLASSES.dropDownContainer}>
                        <div className={CLASSES.dropDownSubContainer}>
                            <div
                                className={CLASSES.dropDownLabel}
                                data-tip
                                data-for="playTooltip"
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
                            onClick={(e) => this.playBuildOrder(this.startTime)}
                        >
                            <span className={CLASSES.centeredButton}>Play</span>
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
                    <ReactTooltip place="bottom" id="playTooltip" className="max-w-xs">
                        {this.state.tooltipText}
                    </ReactTooltip>
                    {playButton}
                </div>

                {stopButton}
            </div>
        )
    }
}
