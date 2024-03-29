import React, { Component } from "react"
import ReactTooltip from "react-tooltip"
import { find, countBy, uniqBy, last } from "lodash"

import { getImageOfItem } from "../constants/helper"
import CLASSES from "../constants/classes"
import { GameLogic, Event } from "../game_logic/gamelogic"
import { Log } from "../constants/interfaces"

interface Instruction {
    events: Event[]
    when: number
    isLastMessage: boolean
    ingameWhen: number
}

interface MyProps {
    gamelogic: GameLogic
    log: (log?: Log) => void
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
    // @ts-ignore
    recognition: SpeechRecognition | undefined
    ingameTime = 0
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
        // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        const anyWindow = window as any
        // @ts-ignore
        let speechRecognitionList: SpeechGrammarList | undefined
        for (const prefix of ["", "webkit", "moz", "ms", "o"]) {
            const speechRecognition = anyWindow[`${prefix}SpeechRecognition`]
            if (speechRecognition) {
                this.recognition = new speechRecognition()
            }
            const grammarList = anyWindow[`${prefix}SpeechGrammarList`]
            if (grammarList) {
                speechRecognitionList = new grammarList()
            }
            if (speechRecognition && speechRecognitionList) {
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

    showSettings = (_e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
        this.setState({
            show: true,
        })
    }

    hideSettings = (_e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
        this.setState({
            show: false,
        })
    }

    onMouseEnter = (_e: React.MouseEvent<HTMLElement, MouseEvent>, item: JSX.Element): void => {
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

        const a = words
            .toString()
            .toLowerCase()
            .split(/[\s-]+/)
        const n = 0
        let g = 0
        a.forEach((w) => {
            const x = /^[0-9]+$/.test(w) ? +w : small[w]
            if (x != null) {
                g = g + x
            } else if (w === "hundred" || w === "100" || /^minutes?$/.test(w)) {
                g = g * 100
            }
        })
        return n + g
    }

    startReading(startAt: number): void {
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

        // @ts-ignore
        this.recognition.onresult = (event: { results: { transcript }[][] }) => {
            const voice = event.results[0][0].transcript
            let startTime = startAt
            if (/^stop$/.test(voice)) {
                this.stopReading()
                this.speak("Stopping")
            } else if (/^pause$/.test(voice)) {
                this.pauseSpeach()
                this.speak(`Pausing at ${this.timeToWords(this.ingameTime)}`)
            } else if (/^resume$/.test(voice)) {
                this.speak(`Resuming at ${this.timeToWords(this.ingameTime)}`)
                this.readBuildOrder(this.ingameTime)
            } else if (/^go\b/.test(voice)) {
                this.stop()
                const numberWords = voice.replace(/^go\s+/, "")
                const time = this.wordsToNumber(numberWords)
                if (time) {
                    const speach = this.timeToWords(time)
                    if (time >= 60) {
                        const minutes = Math.floor(time / 100)
                        const seconds = time % 100
                        startTime = minutes * 60 + seconds
                    } else {
                        startTime = time
                    }
                    this.speak(speach)
                }
                this.readBuildOrder(startTime)
            }
        }

        this.recognition.onnomatch = () => {
            this.props.log({
                error: "I didn't recognise what was said.",
            })
        }

        // On chromium it is: SpeechRecognitionErrorEvent
        this.recognition.onerror = (event: { error: string }) => {
            if (event.error && event.error !== "no-speech") {
                this.stopReading()
            }
        }

        this.recognition.onend = () => {
            if (this.listeningToSpeach) {
                this.recognition?.start()
            }
        }
    }

    timeToWords(time: number): string {
        if (time >= 60) {
            const minutes = Math.floor(time / 100)
            const seconds = time % 100
            if (seconds === 0) {
                return `${minutes} minutes`
            } else {
                return `${minutes}:${seconds}`
            }
        } else {
            return `${time} seconds`
        }
    }

    readBuildOrder(startAt = 0): void {
        if (!this.state.startAtSpeach) {
            this.speak("3", 0)
            this.speak("2", 1)
            this.speak("1", 2)
            this.lineHandlers.push(setTimeout(() => this.readBuildOrderWithoutTimer(startAt), 3000))
        } else {
            this.readBuildOrderWithoutTimer(startAt)
        }
    }

    readBuildOrderWithoutTimer(startAt = 0): void {
        // Prepare BO instructions
        const instructionList: Instruction[] = []
        const lastEvent = this.props.gamelogic.eventLog[this.props.gamelogic.eventLog.length - 1]
        let prevInstruction: Instruction | undefined
        let boEndTime = 0
        for (const event of this.props.gamelogic.eventLog) {
            const when = (event.start * 1000) / 22.4 - startAt * 1000
            if (when >= 0) {
                const isLastMessage = event === lastEvent
                boEndTime = Math.max(boEndTime, event?.end || event.start)
                if (prevInstruction && prevInstruction.when === when) {
                    prevInstruction.events.push(event)
                    prevInstruction.isLastMessage = isLastMessage
                } else {
                    prevInstruction = {
                        events: [event],
                        when,
                        ingameWhen: Math.floor(event.start / 22.4),
                        isLastMessage,
                    }
                    instructionList.push(prevInstruction)
                }
            }
        }

        const shownInstructions: JSX.Element[][] = []
        instructionList.forEach((instruction, i) => {
            const events = instruction.events
            const counts = countBy(events, "name")
            const uniqItems = uniqBy(events, "name")

            // Set voice timers
            const eventsWithPlurals = uniqItems.map((event) => {
                const name = event.name.replace(/_/g, " ")
                const count = counts[event.name]
                return count === 1 ? name : `${count} ${name}s`
            })
            let text =
                eventsWithPlurals.length === 1
                    ? eventsWithPlurals[0]
                    : `${eventsWithPlurals.slice(0, -1).join(", ")}, and ${last(eventsWithPlurals)}`
            if (instruction.isLastMessage) {
                text += ` Then the build order ends at ${this.secondsToTimestamp(
                    Math.floor(boEndTime / 22.4),
                    "seconds"
                )}`
            }

            this.speak(text, instruction.when, instruction.isLastMessage)

            // Prepare logs
            const eventElements: JSX.Element[] = uniqItems.map((event, j) => {
                const count = counts[event.name]
                const image = getImageOfItem(event)
                const element = <img key={`read_icon_${i}_${j}`} src={image} alt={event.name} />
                return count === 1 ? (
                    element
                ) : (
                    <span key={`read_group_${i}_${j}`} className={CLASSES.readIcon}>
                        {element} ✖{count}
                    </span>
                )
            })
            const elements = (
                <div key={`instruc_${i}`} className={CLASSES.readInstruction}>
                    <div className={CLASSES.readIconGroup}>{eventElements}</div>
                    <div className={CLASSES.readTime}>
                        {this.secondsToTimestamp(instruction.ingameWhen)}
                    </div>
                </div>
            )
            for (
                let ingameTime = instructionList[i - 2]?.ingameWhen || 0;
                ingameTime < instruction.ingameWhen;
                ingameTime++
            ) {
                if (shownInstructions[ingameTime] === undefined) {
                    shownInstructions[ingameTime] = []
                }
                shownInstructions[ingameTime].push(elements)
            }
        })

        // Set log timers
        this.ingameTime = startAt
        for (let ingameTime = startAt; shownInstructions[ingameTime]; ingameTime++) {
            this.lineHandlers.push(
                setTimeout(() => {
                    this.ingameTime = ingameTime
                    this.props.log({
                        element: (
                            <div key="instructions" className={CLASSES.readContainer}>
                                <div className={CLASSES.readCurrentTime}>
                                    {this.secondsToTimestamp(ingameTime)}
                                </div>
                                <div className={CLASSES.readInstructionList}>
                                    {shownInstructions[ingameTime]}
                                </div>
                            </div>
                        ),
                        hideCloseButton: true,
                    })
                }, (ingameTime - startAt) * 1000)
            )
        }
        this.lineHandlers.push(
            setTimeout(() => this.props.log(), (shownInstructions.length - startAt + 7) * 1000)
        )
    }

    secondsToTimestamp(time: number, secondsText = "s"): string {
        const minutes = Math.floor(time / 60)
        const seconds = time % 60
        return minutes >= 1
            ? `${minutes}:${seconds > 9 ? "" : "0"}${seconds}`
            : `${seconds}${secondsText}`
    }

    speak(
        events: string,
        when = 0,
        isLastMessage = false,
        language = "Google UK English Female"
    ): void {
        if (this.synth.speaking) {
            this.stop()
        }
        this.lineHandlers.push(
            setTimeout(() => {
                const utterThis = new SpeechSynthesisUtterance(events)
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

    stopReading(): void {
        this.listeningToSpeach = false
        this.recognition?.stop()
        this.stop()
        this.setState({
            canStop: false,
        })
    }

    stop(): void {
        this.pauseSpeach()
        this.props.log()
        this.synth.cancel()
    }

    pauseSpeach(): void {
        this.lineHandlers.forEach(clearTimeout)
        this.lineHandlers = []
        this.synth.cancel()
    }

    onStartAtSpeachChange(): void {
        this.setState({
            startAtSpeach: !this.state.startAtSpeach,
        })
    }

    render(): JSX.Element {
        const classes = CLASSES.dropDown
        const classesDropdown = this.state.show ? `visible ${classes}` : `hidden ${classes}`
        const stopVisibility = `${CLASSES.buttons} ${
            this.state.canStop ? "visible" : "hidden"
        } cursor-pointer`

        const mouseEnterFunc =
            (tooltip: string) => (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
                this.onMouseEnter(e, <div>{tooltip}</div>)
            }

        const speachStart = !this.recognition ? (
            ""
        ) : (
            <div className={CLASSES.dropDownContainer}>
                <div className={CLASSES.dropDownSubContainer}>
                    <label
                        htmlFor="voiceCommand"
                        className={CLASSES.dropDownLabel}
                        data-tip
                        data-for="readTooltip"
                        onMouseEnter={mouseEnterFunc(
                            "Start reading the BO right when you say 'Go' in your microphone"
                        )}
                    >
                        Start reading when you say &quot;Go&quot;
                        <br />
                        or &quot;Go 2:15&quot;. React to &quot;Stop&quot;,
                        <br />
                        &quot;Pause&quot; and &quot;Resume&quot;
                    </label>
                    <input
                        name="voiceCommand"
                        id="voiceCommand"
                        className={CLASSES.dropDownInput}
                        type="checkbox"
                        checked={this.state.startAtSpeach}
                        onChange={(_e) => this.onStartAtSpeachChange()}
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
                            onClick={(_e) => this.startReading(this.startTime)}
                        >
                            <span className={CLASSES.centeredButton}>Read (Beta)</span>
                        </div>
                    </div>
                </div>
            </div>
        )
        const stopButton = (
            <div className={stopVisibility} onClick={(_e) => this.stopReading()}>
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
