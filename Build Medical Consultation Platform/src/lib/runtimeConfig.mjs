const missingKeyMessage = "أضيفي VITE_SUPABASE_ANON_KEY لإكمال اتصال Supabase."
const missingUrlMessage = "أضيفي VITE_SUPABASE_URL لإكمال اتصال Supabase."

export function readRuntimeConfig(env) {
  const supabaseUrl = env.VITE_SUPABASE_URL?.trim()
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY?.trim()
  const issues = []

  // A public, nonclinical preview must never carry live backend credentials.
  if (env.VITE_PUBLIC_PREVIEW === "true") {
    if (supabaseUrl || supabaseAnonKey) {
      return {
        mode: "blocked",
        issues: ["أزيلي إعدادات Supabase من نسخة العرض العامة."],
      }
    }
    return { mode: "public-preview", issues: [] }
  }

  if (supabaseUrl && !supabaseAnonKey) issues.push(missingKeyMessage)
  if (!supabaseUrl && supabaseAnonKey) issues.push(missingUrlMessage)

  if (!supabaseUrl && !supabaseAnonKey) {
    if (env.VITE_ENABLE_PROTOTYPE === "true") {
      return { mode: "prototype", issues: [] }
    }

    return {
      mode: "blocked",
      issues: ["أضيفي إعدادات Supabase لتشغيل المنصة المتصلة."],
    }
  }

  if (issues.length) return { mode: "blocked", issues }

  try {
    const url = new URL(supabaseUrl)
    if (url.protocol !== "https:") throw new Error("invalid")
  } catch {
    return {
      mode: "blocked",
      issues: ["رابط Supabase غير صالح أو لا يستخدم HTTPS."],
    }
  }

  return {
    mode: "connected",
    supabaseUrl,
    supabaseAnonKey,
    issues: [],
  }
}
