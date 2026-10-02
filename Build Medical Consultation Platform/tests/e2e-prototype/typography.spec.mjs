import { expect, test } from "@playwright/test"

test("Zain renders body text and Thmanyah Display renders headings", async ({
  page,
}) => {
  for (const route of [
    "/",
    "/tanzeel",
    "/courses",
    "/library",
    "/courses/new",
    "/auth/login",
  ]) {
    await page.goto(route)
    await expect(page.locator("h1").first()).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    const exceptions = await page.evaluate(() =>
      [...document.querySelectorAll("body *")]
        .filter((element) =>
          [...element.childNodes].some(
            (node) => node.nodeType === 3 && node.textContent.trim(),
          ),
        )
        .filter((element) => element.getBoundingClientRect().height > 0)
        .filter(
          (element) =>
            !getComputedStyle(element).fontFamily.includes("Zain") &&
            !getComputedStyle(element).fontFamily.includes("Thmanyah Display"),
        )
        .map((element) => element.textContent.slice(0, 60)),
    )
    expect(exceptions, route).toEqual([])
    const loaded = await page.evaluate(() =>
      [...document.fonts].some(
        (face) => face.family === "Zain" && face.status === "loaded",
      ),
    )
    expect(loaded, route).toBe(true)
  }
  await page.goto("/")
  await page.evaluate(() => document.fonts.ready)
  const session = await page.context().newCDPSession(page)
  await session.send("DOM.enable")
  const { root } = await session.send("DOM.getDocument")
  const { nodeId } = await session.send("DOM.querySelector", {
    nodeId: root.nodeId,
    selector: "h1",
  })
  await session.send("CSS.enable")
  const { fonts } = await session.send("CSS.getPlatformFontsForNode", {
    nodeId,
  })
  expect(
    fonts.some(
      (font) =>
        font.isCustomFont &&
        /thmanyah serif display/i.test(font.familyName) &&
        font.glyphCount > 0,
    ),
  ).toBe(true)
  const paragraph = await session.send("DOM.querySelector", {
    nodeId: root.nodeId,
    selector: "p",
  })
  const bodyFonts = await session.send("CSS.getPlatformFontsForNode", {
    nodeId: paragraph.nodeId,
  })
  expect(
    bodyFonts.fonts.some(
      (font) =>
        font.isCustomFont &&
        /zain/i.test(font.familyName) &&
        font.glyphCount > 0,
    ),
  ).toBe(true)
})
