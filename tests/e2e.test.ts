import { expect, test } from "@playwright/test"

test("test_frontend_server_available", async ({ page }) => {
    await page.goto("/")
    // await page.waitForTimeout(100)
    // https://github.com/microsoft/playwright-python/issues/1513#issuecomment-1219362738
    expect(await page.locator("doesnotexist").isHidden())
    expect(await page.locator("#doesnotexist").isHidden())
    expect(await page.locator("#SCV").isVisible())
    expect(await page.locator("#Marine").isVisible())
    expect(await page.locator("#CommandCenter").isVisible())
    expect(await page.locator("#TerranInfantryWeaponsLevel1").isVisible())
    // TODO loop over all actions, units, structures and upgrades that should be available for terran
})

test("test_protoss_page_loads", async ({ page }) => {
    await page.goto("/")
    expect(await page.locator("#SCV").isVisible())
    expect(await page.locator("#Marine").isVisible())
    // Load protoss page
    await page.click("#protoss")
    expect(await page.locator("#SCV").isHidden())
    expect(await page.locator("#Marine").isHidden())
    expect(await page.locator("#Probe").isVisible())
    expect(await page.locator("#Zealot").isVisible())
    expect(await page.locator("#Nexus").isVisible())
    expect(await page.locator("#ProtossGroundWeaponsLevel1").isVisible())
})

test("test_zerg_page_loads", async ({ page }) => {
    await page.goto("/")
    expect(await page.locator("#SCV").isVisible())
    expect(await page.locator("#Marine").isVisible())
    // Load zerg page
    await page.click("#zerg")
    expect(await page.locator("#SCV").isHidden())
    expect(await page.locator("#Marine").isHidden())
    expect(await page.locator("#Drone").isVisible())
    expect(await page.locator("#Zergling").isVisible())
    expect(await page.locator("#Hatchery").isVisible())
    expect(await page.locator("#ZergMeleeWeaponsLevel1").isVisible())
})

// TODO Other test ideas:
// Add and remmove an item by clicking on it
// Drag and drop example
// Load a specific url to load a build order from encoded string

// TODO Add benchmark to check how long the page needs to load
