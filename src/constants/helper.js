import { pick } from "lodash"
import lzbase62 from 'lzbase62';

const {CUSTOMACTIONS_BY_NAME} = require('../constants/customactions')
const UNIT_ICONS = require("../icons/unit_icons.json")
const UPGRADE_ICONS = require("../icons/upgrade_icons.json")

const CONVERT_SECONDS_TO_TIME_STRING = ((totalSeconds) => {
    totalSeconds = Math.floor(totalSeconds)
    const minutes = `${Math.floor(totalSeconds / 60)}`.padStart(2, "0")
    const seconds = `${totalSeconds % 60}`.padStart(2, "0")
    const timeFormatted = `${minutes}:${seconds}`
    return timeFormatted
})

const defaultSettings = [
    {
        // Pretty name displayed in gui
        name: "Worker start delay",
        // Tooltip popup that shows some information text
        tooltip: "idk some tooltip",
        // Internal long variable name used by gamelogic.js
        variableName: "workerStartDelay",
        // Short name for base64 string
        n: "wsd",
        // The given value
        v: 2,
        // Min value in GUI
        min: 0,
        // Max value in GUI
        max: 100,
        // Step size of values in GUI if you press the arrow things
        step: 0.5,
    },
    {
        name: "Worker build delay",
        tooltip: "idk some tooltip",
        variableName: "workerBuildDelay",
        n: "wbd",
        v: 2,
        min: 0,
        max: 100,
        step: 0.5,
    },
    {
        name: "Worker return delay",
        tooltip: "idk some tooltip",
        variableName: "workerReturnDelay",
        n: "wrd",
        v: 2,
        min: 0,
        max: 100,
        step: 0.5,
    },
    {
        name: "Idle limit",
        tooltip: "idk some tooltip",
        variableName: "idleLimit",
        n: "il",
        v: 40,
        min: 0,
        max: 600,
        step: 10,
    },
]

const settingsDefaultValues = {}
defaultSettings.forEach((item) => {
    settingsDefaultValues[item.n] = item.v
})

const encodeSettings = ((settingsObject) => {
    // console.log(settingsObject);
    // Strip away unwanted values
    let strippedObject = settingsObject.map((item) => {
        return pick(item, ["n", "v"])
    })
    // If they are default values, strip them away
    strippedObject = strippedObject.filter((item) => {
        return settingsDefaultValues[item.n] !== item.v
    })
    // console.log(strippedObject);
    const jsonString = JSON.stringify(strippedObject)
    // console.log(jsonString);
    const encoded = lzbase62.compress(jsonString)
    // console.log(encoded);
    // console.log(encoded.length);
    return encoded
})

const decodeSettings = ((settingsEncoded) => {
    const decodedString = lzbase62.decompress(settingsEncoded)
    const jsonObj = JSON.parse(decodedString)
    // console.log(jsonObj);
    return jsonObj
})

const encodeBuildOrder = ((buildOrderObject) => {
    // console.log(buildOrderObject);
    let strippedObject = buildOrderObject.map((item) => {
        return pick(item, ["name", "type"])
    })
    const jsonString = JSON.stringify(strippedObject)
    const encoded = lzbase62.compress(jsonString)
    return encoded
})

const decodeBuildOrder = ((buildOrderEncoded) => {
    const decodedString = lzbase62.decompress(buildOrderEncoded)
    const jsonObj = JSON.parse(decodedString)
    // Load image
    jsonObj.forEach((item) => {
        if (["worker", "unit", "structure"].includes(item.type)) {
            item.image = require(`../icons/png/${UNIT_ICONS[item.name.toUpperCase()]}`)
        }
        if (["upgrade"].includes(item.type)) {
            item.image = require(`../icons/png/${UPGRADE_ICONS[item.name.toUpperCase()]}`)
        }
        if (["action"].includes(item.type)) {
            item.image = require(`../icons/png/${CUSTOMACTIONS_BY_NAME[item.name].imageSource}`)
        }
    })
    return jsonObj
})

export {defaultSettings, CONVERT_SECONDS_TO_TIME_STRING, encodeSettings, decodeSettings, encodeBuildOrder, decodeBuildOrder}