import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

export interface Caller {
  id: string
  role: "owner" | "admin" | "editor"
  status: "active"
}

export async function authorize(request: Request, allowed: Caller["role"][]) {
  const authorization = request.headers.get("authorization")
  if (!authorization?.startsWith("Bearer ")) throw new Error("UNAUTHORIZED")
  const url = Deno.env.get("SUPABASE_URL")
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  if (!url || !serviceKey) throw new Error("SERVER_MISCONFIGURED")
  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false },
  })
  const token = authorization.slice(7)
  const { data: authData, error: authError } = await admin.auth.getUser(token)
  if (authError || !authData.user) throw new Error("UNAUTHORIZED")
  const { data: caller, error } = await admin
    .from("profiles")
    .select("id, role, status")
    .eq("id", authData.user.id)
    .single()
  if (error || caller.status !== "active" || !allowed.includes(caller.role))
    throw new Error("FORBIDDEN")
  return { admin, caller: caller as Caller }
}

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
    },
  })
