import assert from "node:assert/strict"
import test from "node:test"
import {
  LAB_HEARTBEAT_SECONDS,
  LabQuotaClientError,
  createLabQuotaClient,
  createRouteLabQuotaClient,
  createSupabaseLabRpcTransport,
} from "../src/pages/labs/labQuotaClient.ts"
import { createLabQuotaSession } from "../src/pages/labs/labQuotaSession.ts"

const expectCode = async (promise, code) => {
  await assert.rejects(promise, (error) => {
    assert.ok(error instanceof LabQuotaClientError)
    assert.equal(error.code, code)
    return true
  })
}

test("route client fails closed when configuration is absent", async () => {
  const client = createRouteLabQuotaClient({ env: {} })
  await expectCode(client.getStatus(), "unconfigured")
})

test("route client fails closed without a real authenticated session", async () => {
  const client = createRouteLabQuotaClient({
    env: {
      VITE_SUPABASE_URL: "https://example.supabase.co",
      VITE_SUPABASE_ANON_KEY: "public-browser-key",
    },
  })
  await expectCode(client.getStatus(), "unauthenticated")
})

test("typed client normalizes subscription, remaining, and exhausted states", async () => {
  const values = [-1, 125, 0]
  const client = createLabQuotaClient({
    async invoke() {
      return values.shift()
    },
  })

  assert.deepEqual(await client.getStatus(), {
    kind: "unlimited",
    remainingSeconds: null,
  })
  assert.deepEqual(await client.start(), {
    kind: "limited",
    remainingSeconds: 125,
  })
  assert.deepEqual(await client.heartbeat(), {
    kind: "exhausted",
    remainingSeconds: 0,
  })
})

test("heartbeat and module calls use only the reviewed RPC contract", async () => {
  const calls = []
  const client = createLabQuotaClient({
    async invoke(name, parameters) {
      calls.push([name, parameters])
      return name === "get_lab_module_content" ? [] : 60
    },
  })

  await client.heartbeat()
  await client.getModuleContent("123e4567-e89b-42d3-a456-426614174000")
  assert.deepEqual(calls, [
    ["record_lab_heartbeat", { p_seconds: LAB_HEARTBEAT_SECONDS }],
    [
      "get_lab_module_content",
      { p_module_id: "123e4567-e89b-42d3-a456-426614174000" },
    ],
  ])
})

test("HTTP transport keeps authentication in memory and maps network failure", async () => {
  let request
  const transport = createSupabaseLabRpcTransport({
    supabaseUrl: "https://example.supabase.co",
    anonKey: "public-browser-key",
    getAccessToken: async () => "ephemeral-access-token",
    fetchImpl: async (url, options) => {
      request = { url, options }
      return new Response("120", {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    },
  })

  const client = createLabQuotaClient(transport)
  assert.equal((await client.getStatus()).remainingSeconds, 120)
  assert.equal(
    request.url,
    "https://example.supabase.co/rest/v1/rpc/get_lab_quota_status",
  )
  assert.equal(
    request.options.headers.authorization,
    "Bearer ephemeral-access-token",
  )
  assert.equal(request.options.headers.apikey, "public-browser-key")

  const offlineClient = createLabQuotaClient(
    createSupabaseLabRpcTransport({
      supabaseUrl: "https://example.supabase.co",
      anonKey: "public-browser-key",
      getAccessToken: async () => "ephemeral-access-token",
      fetchImpl: async () => {
        throw new TypeError("offline")
      },
    }),
  )
  await expectCode(offlineClient.getStatus(), "network")
})

test("refresh and a second tab always re-read the shared server value", async () => {
  let serverRemaining = 180
  const sharedClient = createLabQuotaClient({
    async invoke(name) {
      if (name === "start_lab_session") serverRemaining -= 30
      return serverRemaining
    },
  })
  const tabOne = createLabQuotaSession(sharedClient)
  const tabTwo = createLabQuotaSession(sharedClient)

  await tabOne.refresh()
  await tabOne.start()
  await tabTwo.refresh()

  assert.equal(tabOne.getState().quota.remainingSeconds, 150)
  assert.equal(tabTwo.getState().quota.remainingSeconds, 150)
  tabOne.dispose()
  tabTwo.dispose()
})

test("active sessions heartbeat every 45 seconds and lock at server zero", async () => {
  let heartbeatCount = 0
  const handles = new Set()
  const scheduler = {
    set(callback, delayMs) {
      const handle = { callback, delayMs }
      handles.add(handle)
      return handle
    },
    clear(handle) {
      handles.delete(handle)
    },
  }
  const client = createLabQuotaClient({
    async invoke(name) {
      if (name === "start_lab_session") return 90
      if (name === "record_lab_heartbeat") {
        heartbeatCount += 1
        return 0
      }
      return 90
    },
  })
  const session = createLabQuotaSession(client, scheduler)

  await session.refresh()
  await session.start()
  assert.equal(session.getState().phase, "active")
  assert.equal([...handles][0].delayMs, 45_000)

  await session.heartbeatNow()
  assert.equal(heartbeatCount, 1)
  assert.equal(session.getState().phase, "locked")
  assert.equal(handles.size, 0)
  session.dispose()
})

test("network errors stop activity and keep the UI fail-closed", async () => {
  let shouldFail = false
  const client = createLabQuotaClient({
    async invoke(name) {
      if (name === "record_lab_heartbeat" && shouldFail) {
        throw new LabQuotaClientError("network", "offline")
      }
      return 90
    },
  })
  const session = createLabQuotaSession(client)

  await session.refresh()
  await session.start()
  shouldFail = true
  await session.heartbeatNow()

  assert.deepEqual(session.getState(), {
    phase: "error",
    quota: null,
    errorCode: "network",
  })
  session.dispose()
})
