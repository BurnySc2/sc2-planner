import { incomeMinerals, incomeVespene } from "./income"

test("Get mineral income of one SCV", () => {
    expect(incomeMinerals(1, 1)).toBeCloseTo(1.05)
})

test("Get mineral income of one MULE", () => {
    expect(incomeMinerals(0, 1, 1)).toBeCloseTo(3.516)
})

test("Get gas income of one SCV", () => {
    expect(incomeVespene(1, 1)).toBeCloseTo(0.835)
})
