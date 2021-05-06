import data from "./data.json"

import { IDataUpgrade } from "./interfaces"

// Arrange data in a way that it can be accessed by name
// {name: unit_or_upgrade_data}
const UPGRADES_BY_NAME: { [name: string]: IDataUpgrade } = {}
data.Upgrade.forEach((upgrade) => {
    UPGRADES_BY_NAME[upgrade.name] = upgrade
})

export default UPGRADES_BY_NAME
