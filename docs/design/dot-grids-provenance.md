# Fading SVG Dot Grids — 2026-10-30

Owner selected [SVG Dot Grids](https://www.svgbackgrounds.com/tools/dot-grids/) as the desired light, small-dot background direction. The design references the free Dot Grids editor; all SVG tiles in this repository were independently generated as simple repeating geometric dot patterns. **No downloaded, third-party premium graphic or unverified asset is copied.** The page footer visibly credits “SVG Dot Grids by SVGBackgrounds.com” and links the source.

The tool’s free assets require attribution and may be embedded in end products, with further license restrictions: https://www.svgbackgrounds.com/license/ . The website does not redistribute an SVGBackgrounds source asset or offer a graphic-generator product.

## Integration

- `public/patterns/dot-grid-teal.svg`: 20px-spaced, 1.15px dots
- `public/patterns/dot-grid-sky.svg`: 24px-spaced, 1.3px dots
- `src/components/decor/DotGridField.tsx`: re-usable `aria-hidden`, pointer-inert decorative surface
- `src/styles/dot-grids.css`: blue/green fades and responsive density. Explicit gradients mask dots around text and cards.
- Applied to Hero, service cards, specialties, article listing and auth illustration. Existing CSS-doodle and grain retained where intentional; **not** stacked as extra moving particles.
- Reduced-motion users receive static patterns. No JavaScript runtime patterns or network-loaded images.
- All images are original source-controlled SVG; screenshots are captured via Playwright before release.
