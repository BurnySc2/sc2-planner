import type { PlaywrightTestConfig } from "@playwright/test"

const config: PlaywrightTestConfig = {
    testDir: "./tests",
    webServer: {
        command: "NODE_OPTIONS=--openssl-legacy-provider npm run build && npx serve -s build -p 2987",
        port: 2987,
        timeout: 180000, // 3 minutes for build
    },
    use: {
        headless: true,
        viewport: { width: 1280, height: 720 },
    },
    projects: [
        {
            name: "chromium",
            use: {
                browserName: "chromium",
            },
        },
    ],
    repeatEach: 1,
    timeout: 30000,
    retries: 1,
}

export default config
