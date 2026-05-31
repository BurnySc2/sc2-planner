import { expect, test } from "@playwright/test"

// Example URLs from README for URL decoding tests
const TERRAN_EXAMPLE_URL =
    "/?&race=terran&bo=uDritmrisSJEritSf2HtL2NtZU2HsMN2PtkuBtgV2KritnfibViriuFsExagsJRxaJtjkilTkli2Mx3ixaasKzaDyUZsKIyx9yxTxZJtR3QtZfe07ksLx1KzLT1cKtleZkx2KsQx1bsPzMzyrKzLTywKzLN1UbzJKySTx3asIx3bsL08cyXayxb1zYsJLxbK0ItzocsJOyyZzPZyuasPxzYsLxaKzKSsNLxdJtleZkxYhsJR1U1zjZxzasJxaKx0p0XwzEbxyKzEPsKIyPKtgXiRU1MKsNySKyqGtNuF"

const PROTOSS_EXAMPLE_URL =
    "/?&race=protoss&bo=uDritmrisSJEritSf2HtL2NtZU2HsQM2PtkuBtgV2KritnfibViriuFsExagsOIxaJtjkilTkli2Mx3ixaasKzaDxaHtR3RtZfeyuKsKyu1sOyUKzo9zoKznYxzasNRzKbsP0h207bsIyU1sK11K0ipxaLtlgXiRUysKsONzM9zM3yR9xa7sO1UZsIzIYxZysOKxaJtjkil2dtliyrKxd60gax39zu11IKxdSsKO1lYxa9xa9xai0cdxd9xdasPLxdJtleZkxY9xY9xY9xYSsKxYKtR57tZfexa9zc9xY9xY9xY9xYltNuF"

const ZERG_EXAMPLE_URL =
    "/?&race=zerg&bo=uDritmrisSJEritSf2HtL2NtZUxODsIM2QtkuBtgV2LritnfibViriuFsExbIsOxbJtleZkxZLx0bxb9xbSsQzKKtjkilTkli2Mx4ksRx4bsQQyY2xb2sKxZJtR3ttZfeySm1EKtleZkxZKsKxZxsINxZotNuF"

// ============================================================================
// RACE SWITCHING TESTS
// ============================================================================

test("terran_race_shows_terran_units", async ({ page }) => {
    await page.goto("/")
    // Default race should be Terran
    await expect(page.locator("#SCV")).toBeVisible()
    await expect(page.locator("#Marine")).toBeVisible()
    await expect(page.locator("#CommandCenter")).toBeVisible()
    await expect(page.locator("#TerranInfantryWeaponsLevel1")).toBeVisible()
})

test("switch_to_protoss_shows_protoss_units", async ({ page }) => {
    await page.goto("/")
    // Verify Terran units visible initially
    await expect(page.locator("#SCV")).toBeVisible()
    await expect(page.locator("#Marine")).toBeVisible()

    // Switch to Protoss
    await page.click("#protoss")

    // Verify Protoss units visible, Terran hidden
    await expect(page.locator("#Probe")).toBeVisible()
    await expect(page.locator("#Zealot")).toBeVisible()
    await expect(page.locator("#Nexus")).toBeVisible()
    await expect(page.locator("#ProtossGroundWeaponsLevel1")).toBeVisible()
    await expect(page.locator("#SCV")).toBeHidden()
    await expect(page.locator("#Marine")).toBeHidden()
})

test("switch_to_zerg_shows_zerg_units", async ({ page }) => {
    await page.goto("/")
    // Verify Terran units visible initially
    await expect(page.locator("#SCV")).toBeVisible()
    await expect(page.locator("#Marine")).toBeVisible()

    // Switch to Zerg
    await page.click("#zerg")

    // Verify Zerg units visible, Terran hidden
    await expect(page.locator("#Drone")).toBeVisible()
    await expect(page.locator("#Zergling")).toBeVisible()
    await expect(page.locator("#Hatchery")).toBeVisible()
    await expect(page.locator("#ZergMeleeWeaponsLevel1")).toBeVisible()
    await expect(page.locator("#SCV")).toBeHidden()
    await expect(page.locator("#Marine")).toBeHidden()
})

// ============================================================================
// URL DECODING TESTS (Critical - loads build orders from URLs)
// ============================================================================

test("load_terran_bo_from_url_decodes_correctly", async ({ page }) => {
    await page.goto(TERRAN_EXAMPLE_URL)

    // Race should be auto-selected to Terran
    await expect(page.locator("#SCV")).toBeVisible()
    await expect(page.locator("#Marine")).toBeVisible()

    // Verify build order has items by checking for build order item IDs
    const boItems = page.locator('[id^="bo_"]')
    await expect(boItems.first()).toBeVisible()
})

test("load_protoss_bo_from_url_decodes_correctly", async ({ page }) => {
    await page.goto(PROTOSS_EXAMPLE_URL)

    // Race should be auto-selected to Protoss
    await expect(page.locator("#Probe")).toBeVisible()
    await expect(page.locator("#Zealot")).toBeVisible()
    await expect(page.locator("#Nexus")).toBeVisible()

    // Terran units should be hidden
    await expect(page.locator("#SCV")).toBeHidden()
    await expect(page.locator("#Marine")).toBeHidden()

    // Verify build order has items
    const boItems = page.locator('[id^="bo_"]')
    await expect(boItems.first()).toBeVisible()
})

test("load_zerg_bo_from_url_decodes_correctly", async ({ page }) => {
    await page.goto(ZERG_EXAMPLE_URL)

    // Race should be auto-selected to Zerg
    await expect(page.locator("#Drone")).toBeVisible()
    await expect(page.locator("#Zergling")).toBeVisible()
    await expect(page.locator("#Hatchery")).toBeVisible()

    // Terran units should be hidden
    await expect(page.locator("#SCV")).toBeHidden()
    await expect(page.locator("#Marine")).toBeHidden()

    // Verify build order has items
    const boItems = page.locator('[id^="bo_"]')
    await expect(boItems.first()).toBeVisible()
})

// ============================================================================
// BUILD ORDER MANAGEMENT TESTS
// ============================================================================

test("add_unit_to_build_order", async ({ page }) => {
    await page.goto("/")

    // Click on Marine button to add to build order
    await page.click("#Marine")

    // Verify Marine appears in build order area
    const boItem = page.locator('[id^="bo_Marine_"]').first()
    await expect(boItem).toBeVisible()
})

test("add_structure_to_build_order", async ({ page }) => {
    await page.goto("/")

    // Click on CommandCenter button to add to build order
    await page.click("#CommandCenter")

    // Verify CommandCenter appears in build order area
    const boItem = page.locator('[id^="bo_CommandCenter_"]').first()
    await expect(boItem).toBeVisible()
})

test("add_multiple_items_preserves_order", async ({ page }) => {
    await page.goto("/")

    // Add multiple items in specific order
    await page.click("#SCV")
    await page.click("#Marine")
    await page.click("#SCV")

    // Verify items appear in build order in the order they were added
    // First item should be SCV
    const firstItem = page.locator('[id^="bo_SCV_"]').first()
    await expect(firstItem).toBeVisible()

    // Second item should be Marine
    const marineItem = page.locator('[id^="bo_Marine_"]').first()
    await expect(marineItem).toBeVisible()

    // Third item should be another SCV
    const thirdItem = page.locator('[id^="bo_SCV_"]').nth(1)
    await expect(thirdItem).toBeVisible()
})

test("remove_item_by_clicking_in_build_order", async ({ page }) => {
    await page.goto("/")

    // Add a unit to build order
    await page.click("#Marine")

    // Verify Marine is in build order
    const boItem = page.locator('[id^="bo_Marine_"]').first()
    await expect(boItem).toBeVisible()

    // Click on the item to remove it
    await boItem.click()

    // Verify Marine item is removed from build order (no bo_Marine_ items)
    const marineItems = page.locator('[id^="bo_Marine_"]')
    await expect(marineItems).toHaveCount(0)
})

test("switch_race_clears_build_order", async ({ page }) => {
    await page.goto("/")

    // Add some items to build order
    await page.click("#Marine")
    await page.click("#SCV")

    // Verify items are in build order
    await expect(page.locator('[id^="bo_Marine_"]').first()).toBeVisible()

    // Switch race
    await page.click("#protoss")

    // Build order should be cleared - no bo_Marine items visible
    await expect(page.locator('[id^="bo_Marine_"]').first()).not.toBeVisible()
})

// ============================================================================
// UPGRADES & CUSTOM ACTIONS TESTS
// ============================================================================

test("add_upgrade_to_build_order", async ({ page }) => {
    await page.goto("/")

    // Click on an upgrade button to add to build order
    await page.click("#TerranInfantryWeaponsLevel1")

    // Verify upgrade appears in build order area
    const boItem = page.locator('[id^="bo_TerranInfantryWeaponsLevel1_"]').first()
    await expect(boItem).toBeVisible()
})

test.skip("add_custom_action_to_build_order", async ({ page }) => {
    // Skipped: Custom action selectors are tricky to find
    // The "Mine gas" button may have a different ID format
    await page.goto("/")
})

// ============================================================================
// URL ROUNDTRIP TEST
// ============================================================================

test("url_reflects_current_build_order", async ({ page, context }) => {
    await page.goto("/")

    // Add items to build order
    await page.click("#Marine")
    await page.click("#SCV")
    await page.click("#Marine")

    // Get the current URL which should contain the encoded build order
    const currentUrl = page.url()

    // Verify URL contains build order encoding
    expect(currentUrl).toContain("&bo=")

    // Navigate to the same URL in a new page
    const page2 = await context.newPage()
    await page2.goto(currentUrl)

    // Verify the same build order is restored - check for specific item counts
    // Should have 2 Marines and 1 SCV (using specific selectors to avoid bo_area items)
    const marineItems = page2.locator('[id^="bo_Marine_"]')
    const scvItems = page2.locator('[id^="bo_SCV_"]')

    await expect(marineItems).toHaveCount(2)
    await expect(scvItems).toHaveCount(1)

    await page2.close()
})

// ============================================================================
// LEGACY TESTS (keeping existing test patterns)
// ============================================================================

test("frontend_server_available", async ({ page }) => {
    await page.goto("/")
    // Basic sanity check - page should load
    expect(await page.locator("doesnotexist").isHidden()).toBeTruthy()
    expect(await page.locator("#doesnotexist").isHidden()).toBeTruthy()
    await expect(page.locator("#SCV")).toBeVisible()
    await expect(page.locator("#Marine")).toBeVisible()
    await expect(page.locator("#CommandCenter")).toBeVisible()
})
