// @ts-ignore
import lzbase62 from "lzbase62"
import { isEqual, pick } from "lodash"

import { ISettingsElement, IBuildOrderElement, IAllRaces } from "./interfaces"
import UNITS_BY_NAME from "./units_by_name"

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
    if (item.type === "upgrade") {
        image = require(`../icons/png/${
            UPGRADE_ICONS[item.name.toUpperCase()]
        }`)
    } else if (item.type === "action") {
        image = require(`../icons/png/${
            CUSTOMACTIONS_BY_NAME[item.name].imageSource
        }`)
    } else {
        image = require(`../icons/png/${UNIT_ICONS[item.name.toUpperCase()]}`)
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
        max: 100,
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
        max: 100,
        step: 0.5,
    },
    {
        name: "Addon swap delay",
        tooltip:
            "How much time needs to pass before a terran production structure is useable again after swapping it off (or onto) an addon.",
        variableName: "addonSwapDelay",
        n: "asd",
        v: 3,
        min: 0,
        max: 100,
        step: 0.5,
    },
    {
        name: "Income factor",
        tooltip:
            "If you think the income calculation is not correct, then you should tweak this setting. Lower value means higher income.",
        variableName: "incomeFactor",
        n: "if",
        v: 18,
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

const encodeSettings = (settingsObject: Array<ISettingsElement>) => {
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
}

const decodeSettings = (settingsEncoded: string): Array<ISettingsElement> => {
    const decodedString = lzbase62.decompress(settingsEncoded)
    const jsonObj = JSON.parse(decodedString)
    // console.log(jsonObj);
    return jsonObj
}

const encodeBuildOrder = (buildOrderObject: Array<IBuildOrderElement>) => {
    // console.log(buildOrderObject);
    let strippedObject = buildOrderObject.map((item) => {
        return pick(item, ["name", "type"])
    })
    const jsonString = JSON.stringify(strippedObject)
    const encoded = lzbase62.compress(jsonString)
    return encoded
}

const decodeBuildOrder = (
    buildOrderEncoded: string
): Array<IBuildOrderElement> => {
    const decodedString = lzbase62.decompress(buildOrderEncoded)
    const jsonObj: Array<IBuildOrderElement> = JSON.parse(decodedString)
    return jsonObj
}

const createUrlParams = (
    race: string | undefined,
    settings: Array<ISettingsElement> | undefined,
    buildOrder: Array<IBuildOrderElement> = []
) => {
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

const encodeSALT = (buildOrder: Array<IBuildOrderElement>) => {
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
