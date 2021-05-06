import data from "./data.json"

import { IDataUnit } from "./interfaces"

// Arrange data in a way that it can be accessed by name
// {name: unit_or_upgrade_data}
const UNITS_BY_ID: { [name: number]: IDataUnit } = {}
data.Unit.forEach((unit) => {
    UNITS_BY_ID[unit.id] = unit
})

export default UNITS_BY_ID
