import base from "./playwright.config.mjs"

export default {
  ...base,
  testDir: "./tests/public-preview-e2e",
  reporter: process.env.CI
    ? [["line"], ["html", { outputFolder: "playwright-preview-report", open: "never" }]]
    : "list",
}
