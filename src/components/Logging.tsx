import React, { Component } from "react"
import CLASSES from "../constants/classes"
import { Log, WebPageState } from "../constants/interfaces"

interface MyProps {
    onLog: (callback: (log: Log | undefined, isRestoringLogs: boolean) => void) => void
    undoPush: (state: Partial<WebPageState>) => void
    undo: () => void
}

interface MyState {
    log: Log | undefined
    showLogs: boolean // Necessary for css transitions
}

export default class Logging extends Component<MyProps, MyState> {
    autoClose: ReturnType<typeof setTimeout> | undefined

    constructor(props: MyProps) {
        super(props)
        props.onLog((log, isRestoringLogs) => {
            if (this.autoClose !== undefined) {
                clearTimeout(this.autoClose)
            }
            if (this.state.log?.autoClose) {
                this.autoClose = setTimeout(() => this.onClose(), 5000)
            }
            if (!isRestoringLogs && this.state.log?.undo) {
                this.props.undoPush(this.state.log.undo)
            }
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
        }
        this.setState({
            showLogs: false,
        })
    }

    onUndo = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        this.props.undo()
        this.onClose()
    }

    onCancel = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        if (this.state.log?.cancel) {
            this.state.log.cancel()
        }
        this.onClose()
    }

    render() {
        const log = this.state.log
        const messages: JSX.Element[] = []
        if (log) {
            if (log.undo !== undefined) {
                const style = {
                    background: "none!important",
                    border: "none",
                    color: "#069",
                    textDecoration: "underline",
                    cursor: "pointer",
                }
                messages.push(
                    <button
                        key="undo"
                        style={style}
                        className={CLASSES.linkButton}
                        onClick={this.onUndo}
                    >
                        undo (ctrl+z)
                    </button>
                )
            }
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
            if (log.element) {
                messages.push(log.element)
            }
            if (log.cancel !== undefined) {
                const style = {
                    background: "none!important",
                    border: "none",
                    color: "#069",
                    textDecoration: "underline",
                    cursor: "pointer",
                }
                messages.push(
                    <button
                        key="cancel"
                        style={style}
                        className={CLASSES.linkButton}
                        onClick={this.onCancel}
                    >
                        cancel
                    </button>
                )
            }
            if (!log.hideCloseButton) {
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
