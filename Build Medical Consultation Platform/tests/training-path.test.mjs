import test from "node:test"
import assert from "node:assert/strict"
import {
  TRAINING_WORLDS,
  getStageAvailability,
  getTrainingProgress,
} from "../src/pages/training/trainingPath.mjs"

test("training path contains three worlds and nine stages", () => {
  assert.equal(TRAINING_WORLDS.length, 3)
  assert.equal(TRAINING_WORLDS.flatMap((world) => world.stages).length, 9)
})

test("only the first unfinished stage is active", () => {
  assert.equal(getStageAvailability("vital-signs", []), "active")
  assert.equal(getStageAvailability("patient-safety", []), "locked")
  assert.equal(
    getStageAvailability("patient-safety", ["vital-signs"]),
    "active",
  )
  assert.equal(
    getStageAvailability("vital-signs", ["vital-signs"]),
    "complete",
  )
})

test("progress reports completed stages and earned xp", () => {
  assert.deepEqual(getTrainingProgress(["vital-signs", "patient-safety"]), {
    completed: 2,
    total: 9,
    percent: 22,
    xp: 230,
  })
})
