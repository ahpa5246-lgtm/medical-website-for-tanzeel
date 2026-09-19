export interface RuntimeConfigResult {
  mode: "blocked" | "prototype" | "connected"
  supabaseUrl?: string
  supabaseAnonKey?: string
  issues: string[]
}

export function readRuntimeConfig(
  env: Record<string, string | undefined>,
): RuntimeConfigResult
