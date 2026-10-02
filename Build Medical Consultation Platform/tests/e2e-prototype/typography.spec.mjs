import { expect, test } from "@playwright/test"

test("Thmanyah renders all text including controls and home numbers", async ({
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
            !getComputedStyle(element).fontFamily.startsWith('"Thmanyah Sans"'),
        )
        .map((element) => element.textContent.slice(0, 60)),
    )
    expect(exceptions, route).toEqual([])
    const loaded = await page.evaluate(() =>
      [...document.fonts].some(
        (face) => face.family === "Thmanyah Sans" && face.status === "loaded",
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
        /thmanyah/i.test(font.familyName) &&
        font.glyphCount > 0,
    ),
  ).toBe(true)
})
