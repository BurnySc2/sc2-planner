import { incomeMinerals, incomeVespene } from "./income"

test("Get mineral income of one Worker", () => {
    expect(incomeMinerals(1, 1)).toBeCloseTo(1.073)
    expect(incomeMinerals(1, 1) * 60).toBeCloseTo(64.4)
})

test("Get mineral income of 16 Workers", () => {
    // Benchmark: 16 workers on minerals mining for 4 minutes: 3640 minerals
    expect(incomeMinerals(16, 1) * 4 * 60).toBeGreaterThan(3620)
    expect(incomeMinerals(16, 1) * 4 * 60).toBeLessThan(3660)
})

test("Get mineral income of 24 Workers", () => {
    expect(incomeMinerals(24, 1) * 4 * 60).toBeGreaterThan(3620)
    expect(incomeMinerals(24, 1) * 4 * 60).toBeLessThan(1.25 * 3660)
})

test("Get mineral income of 48 Workers on 3 bases", () => {
    expect(incomeMinerals(48, 3) * 4 * 60).toBeGreaterThan(3 * 3620)
    expect(incomeMinerals(48, 3) * 4 * 60).toBeLessThan(3 * 3660)
})

test("Get mineral income of 72 Workers on 3 bases", () => {
    expect(incomeMinerals(72, 3 * 1) * 4 * 60).toBeGreaterThan(3 * 3620)
    expect(incomeMinerals(72, 3 * 1) * 4 * 60).toBeLessThan(1.25 * 3 * 3660)
})

test("Get mineral income of one MULE", () => {
    expect(incomeMinerals(0, 1, 1)).toBeCloseTo(3.516)
    expect(incomeMinerals(0, 1, 1)).toBeCloseTo(225 / 64)
    expect(incomeMinerals(0, 1, 1) * 64).toBeCloseTo(225)
})

test("Get gas income of one Worker", () => {
    expect(incomeVespene(1, 1)).toBeCloseTo(0.888)
})

test("Get gas income of three Workers", () => {
    // Benchmark: 3 workers for 5 minutes: 812 gas
    expect(incomeVespene(3, 1) * 5 * 60).toBeGreaterThan(810)
    expect(incomeVespene(3, 1) * 5 * 60).toBeLessThan(814)
})
