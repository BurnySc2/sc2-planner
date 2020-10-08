// @ts-ignore
import lzbase62 from "lzbase62"
import { isEqual, pick } from "lodash"

import { ISettingsElement, IBuildOrderElement, IAllRaces } from "./interfaces"
import UNITS_BY_NAME from "./units_by_name"
import UPGRADES_BY_NAME from "./upgrade_by_name"
import UPGRADES_BY_ID from "./upgrade_by_id"
import { CUSTOMACTIONS_BY_ID } from "./customactions"
import UNITS_BY_ID from "./units_by_id"

const jsonpack = require("jsonpack")
const pako = require("pako")

const { CUSTOMACTIONS_BY_NAME } = require("./customactions")
const UNIT_ICONS = require("../icons/unit_icons.json")
const UPGRADE_ICONS = require("../icons/upgrade_icons.json")

const CONVERT_SECONDS_TO_TIME_STRING = (totalSeconds: number) => {
    totalSeconds = Math.floor(totalSeconds)
    const minutes = `${Math.floor(totalSeconds / 60)}`.padStart(2, "0")
    const seconds = `${totalSeconds % 60}`.padStart(2, "0")
    const timeFormatted = `${minutes}:${seconds}`
    return timeFormatted
}

const getImageOfItem = (item: { name: string; type: string }): string => {
    let image = ""
    try {
        if (item.type === "upgrade") {
            image = require(`../icons/png/${
                UPGRADE_ICONS[item.name.toUpperCase()]
            }`)
        } else if (item.type === "action") {
            image = require(`../icons/png/${
                CUSTOMACTIONS_BY_NAME[item.name].imageSource
            }`)
        } else {
            image = require(`../icons/png/${
                UNIT_ICONS[item.name.toUpperCase()]
            }`)
        }
    } catch {
        console.error(`Missing image for: ${item.name}`)
    } finally {
    }
    return image
}

const defaultSettings = [
    {
        // Pretty name displayed in gui
        name: "Worker start delay",
        // Tooltip popup that shows some information text
        tooltip:
            "How many seconds delay there is before the workers start mining minerals at game start.",
        // Internal long variable name used by gamelogic.js
        variableName: "workerStartDelay",
        // Short name for base64 string
        n: "wsd",
        // The given value
        v: 6,
        // Min value in GUI
        min: 0,
        // Max value in GUI
        max: 100,
        // Step size of values in GUI if you press the arrow things
        step: 0.5,
    },
    {
        name: "Worker build delay",
        tooltip:
            "Time for workers before they arrive at the target build location to start construction.",
        variableName: "workerBuildDelay",
        n: "wbd",
        v: 1,
        min: 0,
        max: 1000,
        step: 0.5,
    },
    {
        name: "Worker return delay",
        tooltip:
            "Time for terran and protoss workers until they arrive back at the minerals after they received a build task.",
        variableName: "workerReturnDelay",
        n: "wrd",
        v: 5,
        min: 0,
        max: 1000,
        step: 0.5,
    },
    {
        name: "Addon swap delay",
        tooltip:
            "How much time needs to pass before a terran production structure is useable again after swapping it off (or onto) an addon.",
        variableName: "addonSwapDelay",
        n: "asd",
        v: 6,
        min: 0,
        max: 1000,
        step: 0.5,
    },
    {
        name: "Income factor",
        tooltip:
            "If you think the income calculation is not correct, then you should tweak this setting. Lower value means higher income.",
        variableName: "incomeFactor",
        n: "if",
        v: 22.4,
        min: 0,
        max: 1000,
        step: 0.1,
    },
    {
        name: "Idle limit",
        tooltip:
            "How many seconds until the simulation detected that it got stuck. For example when going '12 pool', workers need to gather a lot of minerals first (simulation is then 'idle' for about 15 seconds). This setting has a huge performance impact on detecting invalid build orders.",
        variableName: "idleLimit",
        n: "il",
        v: 60,
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
const settingsDefaultValues: { [name: string]: number } = {}
defaultSettings.forEach((item) => {
    // TODO Fix type annotation
    // @ts-ignor
    settingsDefaultValues[item.n] = item.v
})

const encodeSettings = (settingsObject: Array<ISettingsElement>): string => {
    // Strip away unwanted values
    let strippedObject = settingsObject.map((item) => {
        return pick(item, ["n", "v"])
    })
    // If they are default values, strip them away
    strippedObject = strippedObject.filter((item) => {
        return settingsDefaultValues[item.n] !== item.v
    })
    const jsonString = JSON.stringify(strippedObject)
    const encoded = lzbase62.compress(jsonString)
    return encoded
}

const decodeSettings = (settingsEncoded: string): Array<ISettingsElement> => {
    const decodedString = lzbase62.decompress(settingsEncoded)
    const jsonObj = JSON.parse(decodedString)
    return jsonObj
}

const encodeBuildOrder = (
    buildOrderObject: Array<IBuildOrderElement>
): string => {
    let compactArray: Array<{
        id: number
        type: string
    }> = []
    buildOrderObject.forEach((item) => {
        if (item.type === "action") {
            const action = CUSTOMACTIONS_BY_NAME[item.name]
            compactArray.push({ id: action.id, type: item.type })
        }
        if (["worker", "unit", "structure"].includes(item.type)) {
            const unit = UNITS_BY_NAME[item.name]
            compactArray.push({ id: unit.id, type: item.type })
        }
        if (item.type === "upgrade") {
            const upgrade = UPGRADES_BY_NAME[item.name]
            compactArray.push({ id: upgrade.id, type: item.type })
        }
    })

    /*
    Simple example of how to compress with zlib and gzip to get the same results as with python

    JS:
    import pako, Base64
    https://www.npmjs.com/package/pako 
    https://www.npmjs.com/package/js-base64
    let my_string = JSON.stringify({"version": 1})
    let zlib_compressed = pako.deflate(my_string)
    let gzip_compressed = pako.gzip(my_string)
    let zlib_b64 = Base64.fromUint8Array(zlib_compressed)
    let gzip_b64 = Base64.fromUint8Array(gzip_compressed)

    Python with same results:
    import json, zlib, gzip
    my_string = json.dumps({"version": 1}, separators=(',', ':'))
    zlib_compressed = zlib.compress(my_string.encode())
    gzip_compressed = glib.compress(my_string.encode())
    zlib_b64 = base64.b64encode(zlib_compressed)
    gzip_b64 = base64.b64encode(gzip_compressed)
    */

    // First version of encoding
    // const jsonString = JSON.stringify({ v: 1, bo: compactArray })
    // const encoded = lzbase62.compress(jsonString)

    // Encoding with jsonpack
    // let compressed = jsonpack.pack(compactArray)
    // let encoded = "001" + btoa(compressed)

    // Encoding with zlib
    let jsonString = JSON.stringify(compactArray)
    let compressed = pako.deflate(jsonString, { to: "string" })
    let encoded = "002" + btoa(compressed)

    return encoded
}

const decodeBuildOrder = (
    buildOrderEncoded: string
): Array<IBuildOrderElement> => {
    let buildOrderDecoded: Array<IBuildOrderElement> = []
    let bo: Array<{
        id: number
        type: string
    }> = []

    if (buildOrderEncoded.startsWith("001")) {
        // Versions with bytes "001" at the start
        const decoded = atob(buildOrderEncoded.substr(3))
        bo = jsonpack.unpack(decoded)
    } else if (buildOrderEncoded.startsWith("002")) {
        // Versions with bytes "002" at the start
        const zlib_b64 = buildOrderEncoded.substr(3)
        const zlib_compressed = atob(zlib_b64)
        const jsonString = pako.inflate(zlib_compressed, {
            to: "string",
        })
        bo = JSON.parse(jsonString)
    } else {
        // First published version
        const decodedString = lzbase62.decompress(buildOrderEncoded)
        const jsonObj: {
            v: number
            bo: Array<{
                id: number
                type: string
            }>
        } = JSON.parse(decodedString)
        bo = jsonObj.bo
    }

    // Decode
    // TODO Verify that each item in the build order is known
    bo.forEach((item) => {
        if (item.type === "action") {
            const action = CUSTOMACTIONS_BY_ID[item.id]
            buildOrderDecoded.push({
                name: action.internal_name,
                type: item.type,
            })
        }
        if (["worker", "unit", "structure"].includes(item.type)) {
            const unit = UNITS_BY_ID[item.id]
            buildOrderDecoded.push({ name: unit.name, type: item.type })
        }
        if (item.type === "upgrade") {
            const upgrade = UPGRADES_BY_ID[item.id]
            buildOrderDecoded.push({ name: upgrade.name, type: item.type })
        }
    })
    return buildOrderDecoded
}

const createUrlParams = (
    race: string | undefined,
    settings: Array<ISettingsElement> | undefined,
    buildOrder: Array<IBuildOrderElement> = []
): string => {
    let newUrl = `?`
    if (!race) {
        race = "terran"
    }
    newUrl += `&race=${race}`

    if (!settings) {
        settings = defaultSettings
    } else if (!isEqual(settings, defaultSettings)) {
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

const encodeSALT = (buildOrder: Array<IBuildOrderElement>): string => {
    // TODO Encode salt build order
    return "Some salt build order encoded"
}

const decodeSALT = (saltEncoding: string) => {
    // TODO Decode salt build order from string
    // TODO Also need to figure out which race the SALT build order is for?!
    let race: IAllRaces | undefined = undefined
    let bo = [
        { name: "SCV", type: "worker" },
        { name: "SupplyDepot", type: "structure" },
    ]
    // let bo = [
    //     {name: "Probe", type: "worker"},
    //     {name: "Pylon", type: "structure"}
    // ]

    // Figure out the race from the build order
    if (bo.length === 0 && !race) {
        race = "terran" as IAllRaces
    } else if (bo.length > 0 && !race) {
        for (const item of bo) {
            if (["worker", "unit", "structure"].includes(item.type)) {
                const unit = UNITS_BY_NAME[item.name]
                race = unit.race.toLowerCase() as IAllRaces
                break
            }
        }
    }

    return {
        race: race,
        bo: bo,
    }
}

export {
    defaultSettings,
    CONVERT_SECONDS_TO_TIME_STRING,
    getImageOfItem,
    encodeSettings,
    decodeSettings,
    encodeBuildOrder,
    decodeBuildOrder,
    createUrlParams,
    encodeSALT,
    decodeSALT,
}
