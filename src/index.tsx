import React from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
// @ts-expect-error
import "./index.css"

// eslint-disable-next-line
const root = createRoot(document.getElementById("root")!)
root.render(<App />)
