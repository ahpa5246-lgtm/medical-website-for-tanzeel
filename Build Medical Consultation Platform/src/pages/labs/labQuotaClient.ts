export const LAB_HEARTBEAT_SECONDS = 45

export interface UnlimitedLabQuota {
  kind: "unlimited"
  remainingSeconds: null
}

export interface LimitedLabQuota {
  kind: "limited"
  remainingSeconds: number
}

export interface ExhaustedLabQuota {
  kind: "exhausted"
  remainingSeconds: 0
}

export type LabQuota = UnlimitedLabQuota | LimitedLabQuota | ExhaustedLabQuota

export type LabQuotaErrorCode = "unconfigured" | "unauthenticated" | "network" | "server" | "invalid-response" | "invalid-argument"

export class LabQuotaClientError extends Error {
  readonly code: LabQuotaErrorCode

  constructor(code: LabQuotaErrorCode, message: string) {
    super(message)
    this.name = "LabQuotaClientError"
    this.code = code
  }
}

export type LabRpcName = "get_lab_quota_status" | "start_lab_session" | "record_lab_heartbeat" | "end_lab_session" | "get_lab_module_content"

export interface LabRpcTransport {
  invoke<T>(
    functionName: LabRpcName,
    parameters?: Record<string, unknown>,
  ): Promise<T>
}

export interface LabQuotaClient {
  getStatus(): Promise<LabQuota>
  start(): Promise<LabQuota>
  heartbeat(): Promise<LabQuota>
  end(): Promise<LabQuota>
  getModuleContent(moduleId: string): Promise<Record<string, unknown>[]>
}

export interface LabRuntimeEnvironment {
  VITE_SUPABASE_URL?: string
  VITE_SUPABASE_ANON_KEY?: string
}

export type LabAccessTokenProvider = () => Promise<string | null>

interface SupabaseRpcOptions {
  supabaseUrl: string
  anonKey: string
  getAccessToken: LabAccessTokenProvider
  fetchImpl?: typeof fetch
}

interface RouteClientOptions {
  env?: LabRuntimeEnvironment
  accessTokenProvider?: LabAccessTokenProvider
  fetchImpl?: typeof fetch
}

let registeredAccessTokenProvider: LabAccessTokenProvider | undefined

export function registerLabAccessTokenProvider(
  provider: LabAccessTokenProvider,
) {
  registeredAccessTokenProvider = provider
  return () => {
    if (registeredAccessTokenProvider === provider) {
      registeredAccessTokenProvider = undefined
    }
  }
}

function unavailableClient(
  code: Extract<LabQuotaErrorCode, "unconfigured" | "unauthenticated">,
  message: string,
): LabQuotaClient {
  const reject = async (): Promise<never> => {
    throw new LabQuotaClientError(code, message)
  }

  return {
    getStatus: reject,
    start: reject,
    heartbeat: reject,
    end: reject,
    getModuleContent: reject,
  }
}

function normalizeBaseUrl(value: string) {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new LabQuotaClientError("unconfigured", "Supabase URL is not valid.")
  }

  const localHost = url.hostname === "localhost" || url.hostname === "127.0.0.1"
  if (url.protocol !== "https:" && !(localHost && url.protocol === "http:")) {
    throw new LabQuotaClientError(
      "unconfigured",
      "Supabase URL must use HTTPS outside local development.",
    )
  }

  return url.toString().replace(/\/$/, "")
}

function errorMessage(payload: unknown) {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>
    for (const key of ["message", "error_description", "hint", "details"]) {
      if (typeof record[key] === "string" && record[key]) return record[key]
    }
  }
  return typeof payload === "string" ? payload : "Supabase RPC failed."
}

async function parseResponse(response: Response) {
  const body = await response.text()
  if (!body) return null

  try {
    return JSON.parse(body) as unknown
  } catch {
    if (response.ok) {
      throw new LabQuotaClientError(
        "invalid-response",
        "Supabase returned a non-JSON response.",
      )
    }
    return body
  }
}

export function createSupabaseLabRpcTransport(
  options: SupabaseRpcOptions,
): LabRpcTransport {
  const baseUrl = normalizeBaseUrl(options.supabaseUrl.trim())
  const anonKey = options.anonKey.trim()
  if (!anonKey) {
    throw new LabQuotaClientError(
      "unconfigured",
      "Supabase browser key is missing.",
    )
  }

  const fetchImpl = options.fetchImpl ?? globalThis.fetch
  if (typeof fetchImpl !== "function") {
    throw new LabQuotaClientError(
      "unconfigured",
      "Fetch is unavailable in this browser.",
    )
  }

  return {
    async invoke<T,>(
      functionName: LabRpcName,
      parameters: Record<string, unknown> = {},
    ) {
      const accessToken = (await options.getAccessToken())?.trim()
      if (!accessToken) {
        throw new LabQuotaClientError(
          "unauthenticated",
          "An authenticated Supabase session is required.",
        )
      }

      let response: Response
      try {
        response = await fetchImpl(
          `${baseUrl}/rest/v1/rpc/${encodeURIComponent(functionName)}`,
          {
            method: "POST",
            headers: {
              accept: "application/json",
              apikey: anonKey,
              authorization: `Bearer ${accessToken}`,
              "content-type": "application/json",
            },
            body: JSON.stringify(parameters),
          },
        )
      } catch (error) {
        if (error instanceof LabQuotaClientError) throw error
        throw new LabQuotaClientError(
          "network",
          "The quota server could not be reached.",
        )
      }

      const payload = await parseResponse(response)
      if (!response.ok) {
        const message = errorMessage(payload)
        const authenticationFailure =
          response.status === 401 ||
          response.status === 403 ||
          message.includes("authentication_required")
        throw new LabQuotaClientError(
          authenticationFailure ? "unauthenticated" : "server",
          message,
        )
      }

      return payload as T
    },
  }
}

export function normalizeLabQuota(value: unknown): LabQuota {
  if (value === -1) return { kind: "unlimited", remainingSeconds: null }
  if (value === 0) return { kind: "exhausted", remainingSeconds: 0 }
  if (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value > 0 &&
    value <= 3600
  ) {
    return { kind: "limited", remainingSeconds: value }
  }

  throw new LabQuotaClientError(
    "invalid-response",
    "The quota server returned an invalid remaining-time value.",
  )
}

export function createLabQuotaClient(
  transport: LabRpcTransport,
): LabQuotaClient {
  return {
    async getStatus() {
      return normalizeLabQuota(
        await transport.invoke<unknown>("get_lab_quota_status"),
      )
    },
    async start() {
      return normalizeLabQuota(
        await transport.invoke<unknown>("start_lab_session"),
      )
    },
    async heartbeat() {
      return normalizeLabQuota(
        await transport.invoke<unknown>("record_lab_heartbeat", {
          p_seconds: LAB_HEARTBEAT_SECONDS,
        }),
      )
    },
    async end() {
      return normalizeLabQuota(
        await transport.invoke<unknown>("end_lab_session"),
      )
    },
    async getModuleContent(moduleId: string) {
      if (
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          moduleId,
        )
      ) {
        throw new LabQuotaClientError(
          "invalid-argument",
          "A valid module UUID is required.",
        )
      }
      const result = await transport.invoke<unknown>("get_lab_module_content", {
        p_module_id: moduleId,
      })
      if (!Array.isArray(result)) {
        throw new LabQuotaClientError(
          "invalid-response",
          "The module server returned an invalid content response.",
        )
      }
      return result as Record<string, unknown>[]
    },
  }
}

export function createRouteLabQuotaClient(
  options: RouteClientOptions = {},
): LabQuotaClient {
  const bundledEnvironment = (import.meta as ImportMeta & {
    readonly env?: LabRuntimeEnvironment
  }).env
  const env = options.env ?? bundledEnvironment ?? {}
  const supabaseUrl = env.VITE_SUPABASE_URL?.trim()
  const anonKey = env.VITE_SUPABASE_ANON_KEY?.trim()

  if (!supabaseUrl || !anonKey) {
    return unavailableClient(
      "unconfigured",
      "The lab server is not configured for this build.",
    )
  }

  const accessTokenProvider =
    options.accessTokenProvider ?? registeredAccessTokenProvider
  if (!accessTokenProvider) {
    return unavailableClient(
      "unauthenticated",
      "A real authenticated session must be connected before lab access.",
    )
  }

  try {
    return createLabQuotaClient(
      createSupabaseLabRpcTransport({
        supabaseUrl,
        anonKey,
        getAccessToken: accessTokenProvider,
        fetchImpl: options.fetchImpl,
      }),
    )
  } catch (error) {
    if (error instanceof LabQuotaClientError) {
      return unavailableClient("unconfigured", error.message)
    }
    return unavailableClient(
      "unconfigured",
      "The lab server configuration is invalid.",
    )
  }
}
