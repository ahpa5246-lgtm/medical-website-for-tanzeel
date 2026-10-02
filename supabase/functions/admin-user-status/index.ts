import { authorize, json } from "../_shared/authorize.ts"
import { validateAccountChange } from "../_shared/accountChanges.mjs"

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return json({}, 200)
  if (request.method !== "POST") return json({ error: "METHOD_NOT_ALLOWED" }, 405)
  try {
    const { admin, caller } = await authorize(request, ["owner", "admin"])
    const { targetId, operation, role } = await request.json()
    if (
      typeof targetId !== "string" ||
      !["enable", "disable", "set_role"].includes(operation)
    )
      return json({ error: "INVALID_INPUT" }, 400)
    if (targetId === caller.id)
      return json({ error: "SELF_CHANGE_DENIED" }, 400)
    const { data: target, error: targetError } = await admin
      .from("profiles")
      .select("id, role, status")
      .eq("id", targetId)
      .single()
    if (targetError) return json({ error: "NOT_FOUND" }, 404)
    if (target.role === "owner") return json({ error: "OWNER_PROTECTED" }, 403)
    const denied = validateAccountChange(caller.role, target.role, operation, role)
    if (denied) return json({ error: denied }, denied === "INVALID_ROLE" ? 400 : 403)
    const update =
      operation === "set_role"
        ? { role }
        : { status: operation === "enable" ? "active" : "disabled" }
    const { error } = await admin
      .from("profiles")
      .update(update)
      .eq("id", targetId)
    if (error) return json({ error: error.message }, 400)
    // Deny retained JWTs in RLS before attempting the retryable Auth operation.
    if (operation !== "set_role") {
      const { error: authError } = await admin.auth.admin.updateUserById(targetId, {
        ban_duration: operation === "disable" ? "876000h" : "none",
      })
      if (authError) return json({ error: "AUTH_STATUS_UPDATE_FAILED_RETRY" }, 500)
    }
    return json({ message: "تم تحديث الحساب." })
  } catch (error) {
    const code = error instanceof Error ? error.message : "SERVER_ERROR"
    return json(
      { error: code },
      code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 : 500,
    )
  }
})
