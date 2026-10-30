import assert from "node:assert/strict"
import test from "node:test"
import { readRuntimeConfig } from "../src/lib/runtimeConfig.mjs"
import {
  ALL_STAGES,
  getStageAvailability,
  getTrainingProgress,
  findTrainingStage,
} from "../src/pages/training/trainingPath.mjs"
import {
  createLabQuotaClient,
  createSupabaseLabRpcTransport,
  LabQuotaClientError,
} from "../src/pages/labs/labQuotaClient.ts"
import { detectEmergency } from "../src/lib/emergency.ts"

// Each row is a distinct input or operation contract, not a repeated run.
for (const [index, stage] of ALL_STAGES.entries()) {
  test(`training ${stage.id}: initial availability`, () => {
    assert.equal(
      getStageAvailability(stage.id, []),
      index === 0 ? "active" : "locked",
    )
  })
  test(`training ${stage.id}: completed state`, () => {
    assert.equal(getStageAvailability(stage.id, [stage.id]), "complete")
  })
  test(`training ${stage.id}: predecessor progression`, () => {
    const completed = ALL_STAGES.slice(0, index).map((s) => s.id)
    assert.equal(getStageAvailability(stage.id, completed), "active")
  })
  test(`training ${stage.id}: lookup and XP accounting`, () => {
    assert.equal(findTrainingStage(stage.id), stage)
    assert.deepEqual(getTrainingProgress([stage.id, stage.id, "unknown"]), {
      completed: 1,
      total: 9,
      percent: 11,
      xp: stage.xp,
    })
  })
}
for (let count = 0; count <= ALL_STAGES.length; count++) {
  test(`training cumulative progress at ${count} completed stages`, () => {
    const selected = ALL_STAGES.slice(0, count)
    assert.deepEqual(getTrainingProgress(selected.map((s) => s.id)), {
      completed: count,
      total: 9,
      percent: Math.round((count / 9) * 100),
      xp: selected.reduce((sum, s) => sum + s.xp, 0),
    })
  })
}

const runtimeCases = [
  ["no settings", {}, "blocked"],
  ["prototype opt-in", { VITE_ENABLE_PROTOTYPE: "true" }, "prototype"],
  ["prototype disabled", { VITE_ENABLE_PROTOTYPE: "false" }, "blocked"],
  [
    "prototype uppercase is not opt-in",
    { VITE_ENABLE_PROTOTYPE: "TRUE" },
    "blocked",
  ],
  [
    "URL alone",
    { VITE_SUPABASE_URL: "https://example.supabase.co" },
    "blocked",
  ],
  ["key alone", { VITE_SUPABASE_ANON_KEY: "public-key" }, "blocked"],
  [
    "whitespace URL",
    { VITE_SUPABASE_URL: "  ", VITE_SUPABASE_ANON_KEY: "key" },
    "blocked",
  ],
  [
    "whitespace key",
    {
      VITE_SUPABASE_URL: "https://example.supabase.co",
      VITE_SUPABASE_ANON_KEY: "  ",
    },
    "blocked",
  ],
  [
    "HTTP remote rejected",
    {
      VITE_SUPABASE_URL: "http://example.supabase.co",
      VITE_SUPABASE_ANON_KEY: "key",
    },
    "blocked",
  ],
  [
    "invalid URL",
    { VITE_SUPABASE_URL: "not a URL", VITE_SUPABASE_ANON_KEY: "key" },
    "blocked",
  ],
  [
    "valid pair",
    {
      VITE_SUPABASE_URL: "https://example.supabase.co",
      VITE_SUPABASE_ANON_KEY: "key",
    },
    "connected",
  ],
  [
    "trimmed valid pair",
    {
      VITE_SUPABASE_URL: " https://example.supabase.co ",
      VITE_SUPABASE_ANON_KEY: " key ",
    },
    "connected",
  ],
  [
    "partial config cannot bypass through prototype",
    {
      VITE_ENABLE_PROTOTYPE: "true",
      VITE_SUPABASE_URL: "https://example.supabase.co",
    },
    "blocked",
  ],
  [
    "FTP rejected",
    {
      VITE_SUPABASE_URL: "ftp://example.supabase.co",
      VITE_SUPABASE_ANON_KEY: "key",
    },
    "blocked",
  ],
]
for (const [name, env, expected] of runtimeCases) {
  test(`runtime: ${name}`, () => {
    const result = readRuntimeConfig(env)
    assert.equal(result.mode, expected)
    assert.equal(result.issues.length > 0, expected === "blocked")
    if (expected === "connected") assert.equal(result.supabaseAnonKey, "key")
  })
}

const methods = {
  getStatus: "get_lab_quota_status",
  start: "start_lab_session",
  heartbeat: "record_lab_heartbeat",
  end: "end_lab_session",
}
const values = [
  [-1, "unlimited"],
  [0, "exhausted"],
  [1, "limited"],
  [45, "limited"],
  [3599, "limited"],
  [3600, "limited"],
  [-2, null],
  [3601, null],
  [1.5, null],
  ["45", null],
  [null, null],
  [NaN, null],
  [Infinity, null],
]
for (const [method, rpc] of Object.entries(methods)) {
  for (const [value, expected] of values) {
    test(`lab ${method}: quota ${String(value)} (${typeof value})`, async () => {
      const client = createLabQuotaClient({
        async invoke(name, args) {
          assert.equal(name, rpc)
          if (method === "heartbeat") assert.deepEqual(args, { p_seconds: 45 })
          return value
        },
      })
      if (!expected)
        await assert.rejects(
          client[method](),
          (e) =>
            e instanceof LabQuotaClientError && e.code === "invalid-response",
        )
      else
        assert.deepEqual(await client[method](), {
          kind: expected,
          remainingSeconds: value === -1 ? null : value,
        })
    })
  }
  for (const status of [401, 403, 404, 429, 500, 503]) {
    test(`lab ${method}: HTTP ${status} fails closed`, async () => {
      const transport = createSupabaseLabRpcTransport({
        supabaseUrl: "https://example.supabase.co",
        anonKey: "public-key",
        getAccessToken: async () => "user-token",
        async fetchImpl(url, options) {
          assert.equal(url, `https://example.supabase.co/rest/v1/rpc/${rpc}`)
          assert.equal(options.method, "POST")
          assert.equal(options.headers.authorization, "Bearer user-token")
          assert.equal(options.headers.apikey, "public-key")
          assert.deepEqual(
            JSON.parse(options.body),
            method === "heartbeat" ? { p_seconds: 45 } : {},
          )
          return new Response(JSON.stringify({ message: "request rejected" }), {
            status,
          })
        },
      })
      await assert.rejects(
        createLabQuotaClient(transport)[method](),
        (e) =>
          e.code ===
          ([401, 403].includes(status) ? "unauthenticated" : "server"),
      )
    })
  }
  for (const token of [null, "", "   "]) {
    test(`lab ${method}: missing token ${JSON.stringify(token)} prevents HTTP request`, async () => {
      const transport = createSupabaseLabRpcTransport({
        supabaseUrl: "https://example.supabase.co",
        anonKey: "key",
        getAccessToken: async () => token,
        fetchImpl: async () => {
          assert.fail("unauthenticated request must not leave client")
        },
      })
      await assert.rejects(
        createLabQuotaClient(transport)[method](),
        (e) => e.code === "unauthenticated",
      )
    })
  }
}

for (const phrase of [
  "chest pain",
  "CANNOT BREATHE",
  "difficulty breathing",
  "severe bleeding",
  "loss of consciousness",
  "cardiac arrest",
  "heart attack",
  "unconscious",
  "poisoning",
  "severe burn",
  "ألم في الصدر",
  "ضيق في التنفس",
  "نزيف شديد",
  "فقدان الوعي",
  "لا يتنفس",
  "توقف القلب",
  "شلل مفاجئ",
  "تشنجات",
  "إصابة بالغة",
  "طارئ",
]) {
  test(`existing emergency warning trigger: ${phrase}`, () =>
    assert.equal(detectEmergency(phrase), true))
}
for (const phrase of [
  "",
  " ",
  "hi",
  "موعد متابعة",
  "routine checkup",
  "general question",
]) {
  test(`non-trigger text: ${JSON.stringify(phrase)}`, () =>
    assert.equal(detectEmergency(phrase), false))
}
