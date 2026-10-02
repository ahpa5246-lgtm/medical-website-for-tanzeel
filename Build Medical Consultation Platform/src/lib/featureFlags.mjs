// Disabled by default. Opt in only when the medical service is ready.
export function consultationsEnabled(env = {}) {
  return env.VITE_ENABLE_CONSULTATIONS === "true"
}
