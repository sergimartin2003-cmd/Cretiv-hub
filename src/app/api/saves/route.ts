import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseServer";

// GET /api/saves — get list of resource IDs saved by current user
export async function GET(req: NextRequest) {
  const supabase = createServerClient();
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return NextResponse.json({ saves: [] });

  const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
  if (!user) return NextResponse.json({ saves: [] });

  const { data } = await supabase
    .from("user_saves")
    .select("resource_id")
    .eq("user_id", user.id);

  return NextResponse.json({ saves: data?.map((s) => s.resource_id) ?? [] });
}

// POST /api/saves — toggle save for a resource
export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { resourceId } = await req.json();
  if (!resourceId) return NextResponse.json({ error: "resourceId required" }, { status: 400 });

  const { data: saved, error } = await supabase.rpc("toggle_save", {
    p_user_id: user.id,
    p_resource_id: resourceId,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ saved });
}
