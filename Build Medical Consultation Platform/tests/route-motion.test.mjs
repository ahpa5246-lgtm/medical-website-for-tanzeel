import test from "node:test"
import assert from "node:assert/strict"
import { animateRouteEntry } from "../src/components/system/routeMotion.mjs"

function preference(reduced = false) {
  const listeners = new Set()
  return {
    matches: reduced,
    addEventListener: (_, fn) => listeners.add(fn),
    removeEventListener: (_, fn) => listeners.delete(fn),
    change(value) {
      this.matches = value
      for (const fn of listeners) fn(this)
    },
    listeners,
  }
}

test("committed route enters with the specified lightweight keyframes", () => {
  let frames,
    options,
    canceled = 0
  const cleanup = animateRouteEntry(
    {
      animate(f, o) {
        frames = f
        options = o
        return {
          cancel() {
            canceled++
          },
        }
      },
    },
    preference(),
  )
  assert.equal(options.duration, 180)
  assert.equal(frames[0].transform, "translateY(6px)")
  assert.equal(frames[0].opacity, 0.2)
  assert.equal(frames[1].opacity, 1)
  assert.equal(options.fill, undefined)
  cleanup()
  assert.equal(canceled, 1)
})
test("reduced motion skips animation entirely", () => {
  let started = false
  animateRouteEntry(
    {
      animate() {
        started = true
      },
    },
    preference(true),
  )()
  assert.equal(started, false)
})
test("preference changes cancel active animation and cleanup removes listener", () => {
  const media = preference()
  let canceled = 0
  const cleanup = animateRouteEntry(
    {
      animate() {
        return {
          cancel() {
            canceled++
          },
        }
      },
    },
    media,
  )
  media.change(true)
  assert.equal(canceled, 1)
  cleanup()
  assert.equal(media.listeners.size, 0)
})
test("unsupported animation APIs leave a usable route", () => {
  assert.doesNotThrow(() => animateRouteEntry({}, preference())())
})
