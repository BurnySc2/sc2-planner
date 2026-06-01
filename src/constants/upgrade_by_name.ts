// npx tsx src/constants/upgrade_by_name.ts
import { convertUpgrade, type IRawUpgrade } from "./converters"
import data from "./data.json"
import type { IDataUpgrade } from "./interfaces"

// Arrange data in a way that it can be accessed by name
// {name: upgrade_data}
const UPGRADES_BY_NAME: { [name: string]: IDataUpgrade } = {}
;(Object.values(data.Upgrades) as IRawUpgrade[]).forEach((upgrade) => {
    UPGRADES_BY_NAME[upgrade.name] = convertUpgrade(upgrade)
})

export default UPGRADES_BY_NAME
