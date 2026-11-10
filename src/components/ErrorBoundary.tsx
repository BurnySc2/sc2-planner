import type React from "react"
import { Component } from "react"

interface ErrorBoundaryProps {
    children: React.ReactNode
}

interface ErrorBoundaryState {
    hasError: boolean
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(): ErrorBoundaryState {
        return { hasError: true }
    }

    componentDidCatch(error: Error, info: React.ErrorInfo): void {
        console.error(error, info.componentStack)
    }

    render(): React.ReactNode {
        if (this.state.hasError) {
            return <div>Something went wrong.</div>
        }
        return this.props.children
    }
}
