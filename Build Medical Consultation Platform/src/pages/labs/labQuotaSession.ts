import {
  LAB_HEARTBEAT_SECONDS,
  LabQuotaClientError,
  type LabQuota,
  type LabQuotaClient,
  type LabQuotaErrorCode,
} from "./labQuotaClient.ts"

export type LabQuotaPhase = "loading" | "ready" | "starting" | "active" | "ending" | "locked" | "error"

export interface LabQuotaSessionState {
  phase: LabQuotaPhase
  quota: LabQuota | null
  errorCode: LabQuotaErrorCode | null
}

export interface LabIntervalScheduler {
  set(callback: () => void, delayMs: number): unknown
  clear(handle: unknown): void
}

export interface LabQuotaSession {
  getState(): LabQuotaSessionState
  subscribe(listener: (state: LabQuotaSessionState) => void): () => void
  refresh(): Promise<void>
  start(): Promise<void>
  heartbeatNow(): Promise<void>
  end(): Promise<void>
  dispose(): void
}

const defaultScheduler: LabIntervalScheduler = {
  set: (callback, delayMs) => globalThis.setInterval(callback, delayMs),
  clear: (handle) =>
    globalThis.clearInterval(handle as ReturnType<typeof setInterval>),
}

function stateForQuota(quota: LabQuota, active: boolean): LabQuotaSessionState {
  if (quota.kind === "exhausted") {
    return { phase: "locked", quota, errorCode: null }
  }
  return { phase: active ? "active" : "ready", quota, errorCode: null }
}

function errorCode(error: unknown): LabQuotaErrorCode {
  return error instanceof LabQuotaClientError ? error.code : "server"
}

export function createLabQuotaSession(
  client: LabQuotaClient,
  scheduler: LabIntervalScheduler = defaultScheduler,
): LabQuotaSession {
  let state: LabQuotaSessionState = {
    phase: "loading",
    quota: null,
    errorCode: null,
  }
  let intervalHandle: unknown
  let heartbeatInFlight = false
  let disposed = false
  let requestVersion = 0
  const listeners = new Set<(next: LabQuotaSessionState) => void>()

  const publish = (next: LabQuotaSessionState) => {
    if (disposed) return
    state = next
    for (const listener of listeners) listener({ ...state })
  }

  const stopHeartbeat = () => {
    if (intervalHandle !== undefined) {
      scheduler.clear(intervalHandle)
      intervalHandle = undefined
    }
  }

  const failClosed = (error: unknown) => {
    stopHeartbeat()
    publish({ phase: "error", quota: null, errorCode: errorCode(error) })
  }

  const heartbeatNow = async () => {
    if (disposed || state.phase !== "active" || heartbeatInFlight) return
    heartbeatInFlight = true
    try {
      const quota = await client.heartbeat()
      if (disposed) return
      publish(stateForQuota(quota, quota.kind !== "exhausted"))
      if (quota.kind === "exhausted") stopHeartbeat()
    } catch (error) {
      failClosed(error)
    } finally {
      heartbeatInFlight = false
    }
  }

  const startHeartbeat = () => {
    stopHeartbeat()
    intervalHandle = scheduler.set(
      () => void heartbeatNow(),
      LAB_HEARTBEAT_SECONDS * 1000,
    )
  }

  return {
    getState: () => ({ ...state }),
    subscribe(listener) {
      listeners.add(listener)
      listener({ ...state })
      return () => listeners.delete(listener)
    },
    async refresh() {
      if (disposed || state.phase === "starting" || state.phase === "ending") {
        return
      }
      const version = ++requestVersion
      stopHeartbeat()
      publish({ phase: "loading", quota: null, errorCode: null })
      try {
        const quota = await client.getStatus()
        if (disposed || version !== requestVersion) return
        publish(stateForQuota(quota, false))
      } catch (error) {
        if (version === requestVersion) failClosed(error)
      }
    },
    async start() {
      if (disposed || state.phase !== "ready") return
      const version = ++requestVersion
      publish({ phase: "starting", quota: state.quota, errorCode: null })
      try {
        const quota = await client.start()
        if (disposed || version !== requestVersion) return
        publish(stateForQuota(quota, quota.kind !== "exhausted"))
        if (quota.kind !== "exhausted") startHeartbeat()
      } catch (error) {
        if (version === requestVersion) failClosed(error)
      }
    },
    heartbeatNow,
    async end() {
      if (disposed || state.phase !== "active") return
      const version = ++requestVersion
      stopHeartbeat()
      publish({ phase: "ending", quota: state.quota, errorCode: null })
      try {
        const quota = await client.end()
        if (disposed || version !== requestVersion) return
        publish(stateForQuota(quota, false))
      } catch (error) {
        if (version === requestVersion) failClosed(error)
      }
    },
    dispose() {
      disposed = true
      requestVersion += 1
      stopHeartbeat()
      listeners.clear()
    },
  }
}
