import { convertUpgrade, type IRawUpgrade } from "./converters"
import data from "./data.json"
import type { IDataUpgrade } from "./interfaces"

// Arrange data in a way that it can be accessed by id
// {id: upgrade_data}
const UPGRADES_BY_ID: { [id: number]: IDataUpgrade } = {}
;(Object.values(data.Upgrades) as IRawUpgrade[]).forEach((upgrade) => {
    const converted = convertUpgrade(upgrade)
    UPGRADES_BY_ID[converted.id] = converted
})

console.assert(Object.keys(UPGRADES_BY_ID).length === 86, `${Object.keys(UPGRADES_BY_ID).length} is not 86`)

export default UPGRADES_BY_ID
