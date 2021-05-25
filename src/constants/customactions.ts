import { ICustomAction } from "./interfaces"
import customactions from "./customactions.json"

const CUSTOMACTIONS: Array<ICustomAction> = customactions

// Create an object with customaction.name as key and the action as value for quick lookup
const CUSTOMACTIONS_BY_NAME: { [name: string]: ICustomAction } = {}
const CUSTOMACTIONS_BY_ID: { [name: number]: ICustomAction } = {}
CUSTOMACTIONS.forEach((customAction) => {
    CUSTOMACTIONS_BY_NAME[customAction.internal_name] = customAction
    CUSTOMACTIONS_BY_ID[customAction.id] = customAction
    // Load image from path
    // customAction["image"] = require(`../icons/png/${customAction.path}`)
})
export { CUSTOMACTIONS, CUSTOMACTIONS_BY_NAME, CUSTOMACTIONS_BY_ID }
