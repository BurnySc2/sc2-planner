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
    startAtSpeach: boolean
}

export default class Read extends Component<MyProps, MyState> {
    synth: SpeechSynthesis
    voices: SpeechSynthesisVoice[]
    lineHandlers: NodeJS.Timeout[]
    startTime: number
    listeningToSpeach: boolean
    recognition: SpeechRecognition | undefined
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
            startAtSpeach: true,
        }
        this.lineHandlers = []
        this.startTime = 0

        this.listeningToSpeach = false
        const wordList = ["go"]
        const grammar = `#JSGF V1.0; grammar colors; public <color> = ${wordList.join(" | ")} ;`
        const anyWindow = window as any
        let speechRecognitionList: SpeechGrammarList | undefined
        for (let prefix of ["", "webkit", "moz", "ms", "o"]) {
            this.recognition =
                anyWindow[`${prefix}SpeechRecognition`] &&
                new anyWindow[`${prefix}SpeechRecognition`]()
            speechRecognitionList =
                anyWindow[`${prefix}SpeechGrammarList`] &&
                new anyWindow[`${prefix}SpeechGrammarList`]()
            if (this.recognition && speechRecognitionList) {
                speechRecognitionList.addFromString(grammar, 1)
                this.recognition.grammars = speechRecognitionList
                this.recognition.continuous = false
                this.recognition.lang = "en-US"
                this.recognition.interimResults = false
                this.recognition.maxAlternatives = 1
                break
            }
        }
    }

    static isSupported(): boolean {
        return !!window.speechSynthesis
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

    wordsToNumber(words: string): number {
        const small: { [num: string]: number } = {
            zero: 0,
            one: 1,
            two: 2,
            three: 3,
            four: 4,
            five: 5,
            six: 6,
            seven: 7,
            eight: 8,
            nine: 9,
            ten: 10,
            eleven: 11,
            twelve: 12,
            thirteen: 13,
            fourteen: 14,
            fifteen: 15,
            sixteen: 16,
            seventeen: 17,
            eighteen: 18,
            nineteen: 19,
            twenty: 20,
            thirty: 30,
            forty: 40,
            fifty: 50,
            sixty: 60,
            seventy: 70,
            eighty: 80,
            ninety: 90,
        }

        let a = words
            .toString()
            .toLowerCase()
            .split(/[\s-]+/)
        let n = 0
        let g = 0
        a.forEach((w) => {
            var x = /^[0-9]+$/.test(w) ? +w : small[w]
            if (x != null) {
                g = g + x
            } else if (w === "hundred" || w === "100") {
                g = g * 100
            }
        })
        return n + g
    }

    startReading(startAt: number) {
        if (this.listeningToSpeach) {
            return
        }
        //else
        this.setState({
            canStop: true,
        })

        if (!this.state.startAtSpeach || !this.recognition) {
            this.readBuildOrder(startAt)
            return
        }
        //else

        this.recognition.start()
        this.listeningToSpeach = true

        this.recognition.onresult = (event) => {
            const voice = event.results[0][0].transcript
            let startTime = startAt
            if (/^stop$/.test(voice)) {
                this.stopReading()
                this.speak("Stopping")
            } else if (/^go\b/.test(voice)) {
                this.stop()
                const numberWords = voice.replace(/^go\s+/, "")
                const time = this.wordsToNumber(numberWords)
                if (time) {
                    if (time >= 60) {
                        const minutes = Math.floor(time / 100)
                        const seconds = time % 100
                        startTime = minutes * 60 + seconds
                        this.speak(`${minutes}:${seconds}`)
                    } else {
                        startTime = time
                        this.speak(`${startTime} seconds`)
                    }
                }
                this.readBuildOrder(startTime)
            }
        }

        this.recognition.onnomatch = (event) => {
            console.log("I didn't recognise what was said.")
        }

        this.recognition.onerror = (event) => {
            const error = (event as any).error
            console.log("Error occurred in recognition: " + error)
            if (error !== "no-speech") {
                this.stopReading()
            }
        }

        this.recognition.onend = (event) => {
            if (this.listeningToSpeach) {
                this.recognition?.start()
            }
        }
    }

    readBuildOrder(startAt = 0) {
        if (!this.state.startAtSpeach) {
            this.speak("3", 0)
            this.speak("2", 1)
            this.speak("1", 2)
            this.lineHandlers.push(setTimeout(() => this.readBuildOrderWithoutTimer(startAt), 3000))
        } else {
            this.readBuildOrderWithoutTimer(startAt)
        }
    }

    readBuildOrderWithoutTimer(startAt = 0) {
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
                    : `${itemsWithPlurals.slice(0, -1).join(", ")}, and ${last(itemsWithPlurals)}`
            this.speak(text, instruction[1], instruction[2])
        })
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

    stopReading() {
        this.listeningToSpeach = false
        this.recognition?.stop()
        this.stop()
        this.setState({
            canStop: false,
        })
    }

    stop() {
        this.lineHandlers.forEach(clearTimeout)
        this.lineHandlers = []
        this.synth.cancel()
    }

    onStartAtSpeachChange() {
        this.setState({
            startAtSpeach: !this.state.startAtSpeach,
        })
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

        const speachStart = !this.recognition ? (
            ""
        ) : (
            <div className={CLASSES.dropDownContainer}>
                <div className={CLASSES.dropDownSubContainer}>
                    <div
                        className={CLASSES.dropDownLabel}
                        data-tip
                        data-for="readTooltip"
                        onMouseEnter={mouseEnterFunc(
                            'Start reading the BO right when you say "Go" in your microphone'
                        )}
                    >
                        Start reading when you say "Go"
                        <br />
                        or e.g. "Go 2:15"
                        <br />
                        Stop listening at "Stop"
                    </div>
                    <input
                        className={CLASSES.dropDownInput}
                        type="checkbox"
                        checked={this.state.startAtSpeach}
                        onChange={(e) => this.onStartAtSpeachChange()}
                    />
                </div>
            </div>
        )

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
                    {speachStart}
                    <div className={CLASSES.dropDownContainer}>
                        <div
                            className={CLASSES.dropDownWideButton}
                            onClick={(e) => this.startReading(this.startTime)}
                        >
                            <span className={CLASSES.centeredButton}>Read</span>
                        </div>
                    </div>
                </div>
            </div>
        )
        const stopButton = (
            <div className={stopVisibility} onClick={(e) => this.stopReading()}>
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
