import data from "./data.json"

import type { IDataUnit } from "./interfaces"

// Arrange data in a way that it can be accessed by name
// {name: unit_or_upgrade_data}
const UNITS_BY_ID: { [name: number]: IDataUnit } = {}
Object.values(data.Units).forEach((unit) => {
    // @ts-expect-error
    UNITS_BY_ID[unit.id] = unit
})

export default UNITS_BY_ID
