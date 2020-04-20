import data from "./data.json"

import { IDataUnit } from "./interfaces"

// Arrange data in a way that it can be accessed by name
// {name: unit_or_upgrade_data}
const UNITS_BY_NAME: { [name: string]: IDataUnit } = {}
data.Unit.forEach((unit) => {
    UNITS_BY_NAME[unit.name] = unit
})

export default UNITS_BY_NAME
