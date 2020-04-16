import { pick } from "lodash"
import Base64 from "compact-base64"

import {CUSTOMACTIONS_BY_NAME} from '../constants/customactions'
import UNIT_ICONS from "../icons/unit_icons"
import UPGRADE_ICONS from "../icons/upgrade_icons"

const CONVERT_SECONDS_TO_TIME_STRING = ((totalSeconds) => {
    totalSeconds = Math.floor(totalSeconds)
    const minutes = `${Math.floor(totalSeconds / 60)}`.padStart(2, "0")
    const seconds = `${totalSeconds % 60}`.padStart(2, "0")
    const timeFormatted = `${minutes}:${seconds}`
    return timeFormatted
})

const defaultSettings = [
    // TODO Specificy a min and max limit, e.g. min=0, max=10000
    {
        name: "Worker start delay",
        tooltip: "idk some tooltip",
        n: "wsd",
        v: 2
    },
    {
        name: "Worker build delay",
        tooltip: "idk some tooltip",
        n: "wbd",
        v: 2
    },
    {
        name: "Worker return delay",
        tooltip: "idk some tooltip",
        n: "wrd",
        v: 2
    },
    {
        name: "Idle limit",
        tooltip: "idk some tooltip",
        n: "il",
        v: 40 * 22.4
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
    const encoded = Base64.encode(jsonString)
    // console.log(encoded);
    // console.log(encoded.length);
    return encoded
})

const decodeSettings = ((settingsEncoded) => {
    const decodedString = Base64.decode(settingsEncoded)
    const jsonObj = JSON.parse(decodedString)
    // console.log(jsonObj);
    return jsonObj
})

const encodeBuildOrder = ((buildOrderObject) => {
    console.log(buildOrderObject);
    let strippedObject = buildOrderObject.map((item) => {
        return pick(item, ["name", "type"])
    })
    const jsonString = JSON.stringify(strippedObject)
    const encoded = Base64.encode(jsonString)
    return encoded
})

const decodeBuildOrder = ((buildOrderEncoded) => {
    const decodedString = Base64.decode(buildOrderEncoded)
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