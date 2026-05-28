import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Untyped admin client — uses service role key for unrestricted access
function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return createClient(url, key, { auth: { persistSession: false } });
}

async function getAdminUser(req: NextRequest) {
  const supabase = adminClient();
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if ((profile as { role?: string } | null)?.role !== "admin") return null;

  return user;
}

// GET /api/admin/resources?status=pending
export async function GET(req: NextRequest) {
  const admin = await getAdminUser(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const supabase = adminClient();
  const status = req.nextUrl.searchParams.get("status") ?? "pending";

  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ resources: data });
}

// PATCH /api/admin/resources — approve or reject
export async function PATCH(req: NextRequest) {
  const admin = await getAdminUser(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const supabase = adminClient();
  const { id, status, badge } = await req.json();

  if (!id || !["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 });
  }

  const payload: Record<string, string | null> = { status };
  if (badge !== undefined) payload.badge = badge ?? null;

  const { data, error } = await supabase
    .from("resources")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ resource: data });
}
