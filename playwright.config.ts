import type { PlaywrightTestConfig } from "@playwright/test"

const config: PlaywrightTestConfig = {
    testDir: './tests',
    webServer: {
        command: "npm run build && npx serve -s build -p 2987",
        port: 2987,
    },
    repeatEach: 1,
    timeout: 5000,
}

export default config
