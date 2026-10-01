export default {
  testDir: "./tests/e2e-prototype",
  timeout: 30_000,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4174",
    browserName: "chromium",
    viewport: { width: 1366, height: 768 },
  },
  webServer: {
    command: "node scripts/start-prototype-preview.mjs",
    url: "http://127.0.0.1:4174",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
}
