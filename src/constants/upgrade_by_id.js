import data from "./data.json"

// Arrange data in a way that it can be accessed by name
// {name: unit_or_upgrade_data}
const UPGRADES_BY_ID = {}
data.Upgrade.forEach((upgrade) => {
    UPGRADES_BY_ID[upgrade.id] = upgrade
})

console.assert(Object.keys(UPGRADES_BY_ID).length === 123, `${Object.keys(UPGRADES_BY_ID).length} is not 123`)

export default UPGRADES_BY_ID