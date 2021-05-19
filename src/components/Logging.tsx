import React, { Component } from "react"
import CLASSES from "../constants/classes"
import { Log } from "../constants/interfaces"

interface MyProps {
    onLog: (callback: (log: Log | undefined) => void) => void
}

interface MyState {
    log: Log | undefined
    showLogs: boolean // Necessary for css transitions
}

export default class Logging extends Component<MyProps, MyState> {
    autoClose: ReturnType<typeof setTimeout> | undefined

    constructor(props: MyProps) {
        super(props)
        props.onLog((log) => {
            if (this.autoClose !== undefined) {
                clearTimeout(this.autoClose)
            }
            this.autoClose = setTimeout(() => this.onClose(), 5000)
            this.setState({ log, showLogs: !!log })
        })
        this.state = {
            log: undefined,
            showLogs: false,
        }
    }

    onClose(): void {
        if (this.autoClose !== undefined) {
            clearTimeout(this.autoClose)
            this.setState({
                showLogs: false,
            })
        }
    }

    render() {
        const log = this.state.log
        const messages: JSX.Element[] = []
        if (log) {
            const types: { name: keyof Log; color: string; icon: string }[] = [
                { name: "error", color: "red", icon: "☢" },
                { name: "warning", color: "yellow", icon: "⚠" },
                { name: "notice", color: "gray", icon: "🛈" },
                { name: "success", color: "green", icon: "✓" },
                { name: "failure", color: "pink", icon: "✗" },
            ]
            types.forEach((type) => {
                const { name, color, icon } = type
                if (log[name] !== undefined) {
                    messages.push(
                        <div key={name} className={`ml-2 text-${color}-800`}>
                            {icon} {log[name]}
                        </div>
                    )
                }
            })
            messages.push(
                <div
                    key="closeButton"
                    className={CLASSES.tinyButtons + " ml-2"}
                    onClick={() => this.onClose()}
                >
                    ✖
                </div>
            )
        }

        const style = {
            opacity: log && this.state.showLogs ? 1 : 0,
            transition: "all 250ms linear",
        }
        return (
            <div className="flex" style={style}>
                {messages}
            </div>
        )
    }
}
