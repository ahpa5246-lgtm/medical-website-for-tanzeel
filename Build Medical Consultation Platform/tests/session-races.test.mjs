import test from "node:test"
import assert from "node:assert/strict"
import { createLabQuotaSession } from "../src/pages/labs/labQuotaSession.ts"
const quota = (remainingSeconds) => ({ kind: "limited", remainingSeconds })
const deferred = () => {
  let resolve
  const promise = new Promise((r) => {
    resolve = r
  })
  return { promise, resolve }
}
for (const operation of ["end", "refresh"]) {
  test(`a late heartbeat cannot overwrite ${operation} state`, async () => {
    const pending = deferred()
    let timers = 0
    const session = createLabQuotaSession(
      {
        getStatus: async () => quota(90),
        start: async () => quota(90),
        heartbeat: () => pending.promise,
        end: async () => quota(80),
      },
      { set: () => ++timers, clear: () => --timers },
    )
    await session.refresh()
    await session.start()
    const heartbeat = session.heartbeatNow()
    await session[operation]()
    pending.resolve(quota(85))
    await heartbeat
    assert.equal(session.getState().phase, "ready")
    assert.equal(
      session.getState().quota.remainingSeconds,
      operation === "end" ? 80 : 90,
    )
    assert.equal(timers, 0)
    session.dispose()
  })
}
test("unknown completed IDs never unlock a nonexistent training stage", async () => {
  const { getStageAvailability } = await import(
    "../src/pages/training/trainingPath.mjs"
  )
  assert.equal(
    getStageAvailability("invented-stage", ["invented-stage"]),
    "locked",
  )
})

for (const operation of ["end", "refresh"]) {
  test(`a late failed heartbeat cannot overwrite ${operation} state`, async () => {
    let rejectHeartbeat
    const pending = new Promise((_, reject) => {
      rejectHeartbeat = reject
    })
    const session = createLabQuotaSession(
      {
        getStatus: async () => quota(90),
        start: async () => quota(90),
        heartbeat: () => pending,
        end: async () => quota(80),
      },
      { set: () => 1, clear: () => {} },
    )
    await session.refresh()
    await session.start()
    const heartbeat = session.heartbeatNow()
    await session[operation]()
    rejectHeartbeat(new Error("late network failure"))
    await heartbeat
    assert.equal(session.getState().phase, "ready")
    assert.equal(session.getState().errorCode, null)
    session.dispose()
  })
}
