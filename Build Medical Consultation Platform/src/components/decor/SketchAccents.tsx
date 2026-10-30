import { useEffect, useRef } from "react"

type Motif = "hero" | "cards" | "specialties" | "auth" | "cta"

const colors = {
  teal: "#118c98",
  ink: "#173e47",
  coral: "#ef8d7f",
  yellow: "#eaae4f",
}

export default function SketchAccents({
  motif,
  className = "",
}: {
  motif: Motif
  className?: string
}) {
  const ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    let cancelled = false
    const svg = ref.current
    if (!svg) return
    void import("roughjs")
      .then(({ default: rough }) => {
        if (cancelled || !ref.current) return
        svg.replaceChildren()
        const sketch = rough.svg(svg)
        const options = {
          roughness: 1.35,
          bowing: 1.1,
          strokeWidth: 2.6,
          fillStyle: "hachure" as const,
        }
        const add = (node: SVGElement) => svg.appendChild(node)
        if (motif === "hero") {
          add(
            sketch.ellipse(365, 100, 210, 100, {
              ...options,
              seed: 11,
              stroke: colors.yellow,
            }),
          )
          add(
            sketch.path("M 430 300 Q 350 210 258 278", {
              ...options,
              seed: 12,
              stroke: colors.coral,
            }),
          )
          add(
            sketch.path("M 258 278 l 23 -2 m -23 2 l 13 -18", {
              ...options,
              seed: 13,
              stroke: colors.coral,
            }),
          )
          add(
            sketch.path(
              "M 60 110 l 18 0 m -9 -10 l 0 20 M 95 140 l 10 -8 M 95 132 l 10 8",
              { ...options, seed: 14, stroke: colors.teal },
            ),
          )
          add(
            sketch.circle(125, 325, 24, {
              ...options,
              seed: 15,
              stroke: colors.yellow,
            }),
          )
        } else if (motif === "cards") {
          add(
            sketch.path("M 28 45 Q 150 4 270 40", {
              ...options,
              seed: 21,
              stroke: colors.coral,
            }),
          )
          add(
            sketch.ellipse(490, 240, 130, 100, {
              ...options,
              seed: 22,
              stroke: colors.yellow,
            }),
          )
          add(
            sketch.path("M 440 30 l 12 15 14 -17 M 30 220 l 20 -15 10 20", {
              ...options,
              seed: 23,
              stroke: colors.teal,
            }),
          )
        } else if (motif === "specialties") {
          add(
            sketch.path("M 22 140 Q 90 55 180 85", {
              ...options,
              seed: 31,
              stroke: colors.teal,
            }),
          )
          add(
            sketch.path("M 180 85 l -20 -10 m 20 10 l -18 12", {
              ...options,
              seed: 32,
              stroke: colors.teal,
            }),
          )
          add(
            sketch.ellipse(505, 80, 120, 52, {
              ...options,
              seed: 33,
              stroke: colors.coral,
            }),
          )
        } else if (motif === "auth") {
          add(
            sketch.ellipse(350, 142, 240, 115, {
              ...options,
              seed: 41,
              stroke: colors.yellow,
            }),
          )
          add(
            sketch.path("M 76 300 Q 220 240 420 345", {
              ...options,
              seed: 42,
              stroke: colors.teal,
            }),
          )
          add(
            sketch.path(
              "M 20 170 l 35 0 m -18 -17 l 0 34 M 480 270 l 18 0 m -9 -10 l 0 20",
              { ...options, seed: 43, stroke: colors.coral },
            ),
          )
        } else {
          add(
            sketch.path("M 18 70 Q 110 12 220 80", {
              ...options,
              seed: 51,
              stroke: colors.yellow,
            }),
          )
          add(
            sketch.ellipse(465, 145, 146, 96, {
              ...options,
              seed: 52,
              stroke: colors.coral,
            }),
          )
          add(
            sketch.path("M 292 250 l 40 0 m -20 -20 l 0 40", {
              ...options,
              seed: 53,
              stroke: colors.teal,
            }),
          )
        }
      })
      .catch(() => {
        // Visual enhancement only: the semantic UI remains functional.
      })
    return () => {
      cancelled = true
      svg.replaceChildren()
    }
  }, [motif])

  return (
    <svg
      ref={ref}
      className={`sketch-accents ${className}`}
      viewBox="0 0 540 400"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
    />
  )
}
