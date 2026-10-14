import test from "node:test"
import assert from "node:assert/strict"
import {
  validateContent,
  validateVerification,
  validateReport,
} from "../src/features/content/validation.mjs"
test("content requires bounded title, body and supported kind", () => {
  assert.equal(
    validateContent({
      kind: "article",
      title: "x",
      body: "body",
      category: "general",
    }).ok,
    false,
  )
  assert.equal(
    validateContent({
      kind: "script",
      title: "Valid title",
      body: "a".repeat(80),
      category: "general",
    }).ok,
    false,
  )
  assert.equal(
    validateContent({
      kind: "article",
      title: "Valid title",
      body: "a".repeat(80),
      category: "general",
    }).ok,
    true,
  )
})
test("verification rejects missing consent and invalid experience", () => {
  const input = {
    name: "Synthetic name",
    specialty: "11111111-1111-4111-8111-111111111111",
    license: "TEST-001",
    experience: 2,
    bio: "synthetic",
    consent: true,
  }
  assert.equal(validateVerification(input).ok, true)
  assert.equal(validateVerification({ ...input, consent: false }).ok, false)
  assert.equal(validateVerification({ ...input, experience: -1 }).ok, false)
})
test("reports contain a real bounded plain-text reason", () => {
  assert.equal(
    validateReport({
      contentId: "11111111-1111-4111-8111-111111111111",
      reason: "x",
    }).ok,
    false,
  )
  assert.equal(
    validateReport({
      contentId: "11111111-1111-4111-8111-111111111111",
      reason: "Please review this content",
    }).ok,
    true,
  )
})
