import { authorize, json } from "../_shared/authorize.ts"

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return json({}, 200)
  try {
    const { admin, caller } = await authorize(request, ["owner", "admin"])
    const { email, role } = await request.json()
    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !["admin", "editor"].includes(role)
    )
      return json({ error: "INVALID_INPUT" }, 400)
    if (caller.role !== "owner" && role !== "editor")
      return json({ error: "FORBIDDEN_ROLE" }, 403)
    // Invitations need an explicit, approved application origin; never trust
    // a caller-supplied redirect URL.
    const siteUrl = Deno.env.get("APP_SITE_URL")
    if (!siteUrl) return json({ error: "APP_SITE_URL_NOT_CONFIGURED" }, 503)
    let redirectTo: string
    try {
      const origin = new URL(siteUrl)
      if (origin.protocol !== "https:" || origin.username || origin.password)
        throw new Error("INVALID_SITE_URL")
      redirectTo = new URL("/auth/accept-invite", origin.origin).toString()
    } catch {
      return json({ error: "APP_SITE_URL_INVALID" }, 503)
    }
    const token = crypto.randomUUID()
    const tokenHash = Array.from(
      new Uint8Array(
        await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token)),
      ),
    )
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("")
    const expires_at = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
    const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(
      email.toLowerCase(),
      { data: { requested_role: role, invitation_token: token }, redirectTo },
    )
    if (inviteError) return json({ error: inviteError.message }, 400)
    const { error } = await admin
      .from("invitations")
      .insert({
        email: email.toLowerCase(),
        role,
        token_hash: tokenHash,
        expires_at,
        invited_by: caller.id,
      })
    if (error) return json({ error: error.message }, 400)
    return json({ message: "تم إرسال الدعوة بنجاح." })
  } catch (error) {
    const code = error instanceof Error ? error.message : "SERVER_ERROR"
    return json(
      { error: code },
      code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 : 500,
    )
  }
})
