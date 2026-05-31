import data from "./data.json"

import type { IDataUpgrade } from "./interfaces"

// Arrange data in a way that it can be accessed by name
// {name: unit_or_upgrade_data}
const UPGRADES_BY_NAME: { [name: string]: IDataUpgrade } = {}
Object.values(data.Upgrades).forEach((upgrade) => {
    UPGRADES_BY_NAME[upgrade.name] = upgrade
})

export default UPGRADES_BY_NAME
