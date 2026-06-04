import { convertUnit, type IRawUnit } from "./converters"
import data from "./data.json"
import type { IDataUnit } from "./interfaces"

// Arrange data in a way that it can be accessed by id
// {id: unit_data}
const UNITS_BY_ID: { [id: number]: IDataUnit } = {}
;(Object.values(data.Units) as IRawUnit[]).forEach((unit) => {
    const converted = convertUnit(unit)
    UNITS_BY_ID[converted.id] = converted
})

export default UNITS_BY_ID
