import { pick } from "lodash"
import lzbase62 from 'lzbase62';
import {isEqual} from 'lodash'

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
        tooltip: "How many seconds delay there is before the workers start mining minerals at game start.",
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
        tooltip: "Time for workers before they arrive at the target build location to start construction.",
        variableName: "workerBuildDelay",
        n: "wbd",
        v: 1,
        min: 0,
        max: 100,
        step: 0.5,
    },
    {
        name: "Worker return delay",
        tooltip: "Time for terran and protoss workers until they arrive back at the minerals after they received a build task.",
        variableName: "workerReturnDelay",
        n: "wrd",
        v: 3,
        min: 0,
        max: 100,
        step: 0.5,
    },
    {
        name: "Addon swap delay",
        tooltip: "How much time needs to pass before a terran production structure is useable again after swapping it off (or onto) an addon.",
        variableName: "addonSwapDelay",
        n: "asd",
        v: 3,
        min: 0,
        max: 100,
        step: 0.5,
    },
    {
        name: "Idle limit",
        tooltip: "How many seconds until the simulation detected that it got stuck. For example when going '12 pool', workers need to gather a lot of minerals first (simulation is then 'idle' for about 15 seconds). This setting has a huge performance impact on detecting invalid build orders.",
        variableName: "idleLimit",
        n: "il",
        v: 15,
        min: 0,
        max: 600,
        step: 5,
    },
    {
        name: "Item width",
        tooltip: "The with of the item elements displayed in the browser.",
        variableName: "htmlElementWidthFactor",
        n: "iw",
        v: 0.3,
        min: 0,
        max: 10,
        step: 0.01,
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

const createUrlParams = (race, settings, buildOrder=[]) => {
    let newUrl = `?race=${race}`

    if (!isEqual(settings, defaultSettings)) {
        // Encode the settings
        const settingsEncoded = encodeSettings(settings)
        // const decoded = decodeSettings(settingsEncoded)
        newUrl += `&settings=${settingsEncoded}`
    }

    if (buildOrder.length > 0) {
        // Encode the build order
        const buildOrderEncoded = encodeBuildOrder(buildOrder)
        // const buildOrderDecoded = decodebuildOrder(buildOrderEncoded)
        newUrl += `&bo=${buildOrderEncoded}`
    }
    return newUrl
}

export {defaultSettings, CONVERT_SECONDS_TO_TIME_STRING, encodeSettings, decodeSettings, encodeBuildOrder, decodeBuildOrder, createUrlParams}