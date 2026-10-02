export function validateAccountChange(actorRole, targetRole, operation, role) {
  if (!["owner", "admin"].includes(actorRole)) return "FORBIDDEN_ROLE"
  if (!["enable", "disable", "set_role"].includes(operation)) return "INVALID_INPUT"
  if (targetRole === "owner") return "OWNER_PROTECTED"
  if (operation === "set_role" && !["member", "editor", "admin"].includes(role))
    return "INVALID_ROLE"
  if (actorRole !== "owner" && (targetRole === "admin" || role === "admin"))
    return "FORBIDDEN_ROLE"
  return null
}
