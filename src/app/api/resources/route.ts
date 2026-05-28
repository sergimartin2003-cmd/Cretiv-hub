import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseServer";

// GET /api/resources?status=approved&category=Video&page=1&limit=9
export async function GET(req: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = req.nextUrl;

  const status   = searchParams.get("status")   ?? "approved";
  const category = searchParams.get("category");
  const page     = Number(searchParams.get("page")  ?? "1");
  const limit    = Number(searchParams.get("limit") ?? "9");
  const search   = searchParams.get("q");

  let query = supabase
    .from("resources")
    .select("*", { count: "exact" })
    .eq("status", status)
    .order("downloads", { ascending: false });

  if (category && category !== "Todos") query = query.eq("category", category);
  if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ resources: data, total: count ?? 0, page, limit });
}

// POST /api/resources — submit new resource
export async function POST(req: NextRequest) {
  const supabase = createServerClient();

  const { data: { user } } = await supabase.auth.getUser(
    req.headers.get("authorization")?.replace("Bearer ", "") ?? ""
  );
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, category, thumbnail, tags, type, badge, download_url } = body;

  if (!title?.trim() || !description?.trim() || !category || !thumbnail) {
    return NextResponse.json({ error: "Campos requeridos incompletos" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, avatar, verified")
    .eq("id", user.id)
    .single();

  const { data, error } = await supabase.from("resources").insert({
    title: title.trim(),
    description: description.trim(),
    category,
    thumbnail,
    tags: tags ?? [],
    type: type ?? "free",
    badge: badge ?? null,
    download_url: download_url?.trim() || null,
    author_id: user.id,
    author_name: profile?.display_name ?? profile?.username ?? user.email?.split("@")[0] ?? "User",
    author_avatar: profile?.avatar ?? "U",
    author_verified: profile?.verified ?? false,
    status: "pending",
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ resource: data }, { status: 201 });
}
