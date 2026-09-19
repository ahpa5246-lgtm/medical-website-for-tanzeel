import { authorize, json } from "../_shared/authorize.ts"

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return json({}, 200)
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
    if (
      caller.role !== "owner" &&
      (target.role === "admin" || role === "admin")
    )
      return json({ error: "FORBIDDEN_ROLE" }, 403)
    const update =
      operation === "set_role"
        ? { role }
        : { status: operation === "enable" ? "active" : "disabled" }
    const { error } = await admin
      .from("profiles")
      .update(update)
      .eq("id", targetId)
    if (error) return json({ error: error.message }, 400)
    if (operation === "disable")
      await admin.auth.admin.signOut(targetId, "global")
    return json({ message: "تم تحديث الحساب." })
  } catch (error) {
    const code = error instanceof Error ? error.message : "SERVER_ERROR"
    return json(
      { error: code },
      code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 : 500,
    )
  }
})
