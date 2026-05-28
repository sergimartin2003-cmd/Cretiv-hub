import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseServer";

// POST /api/resources/[id]/download — log download and return URL
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServerClient();

  // Get resource
  const { data: resource, error } = await supabase
    .from("resources")
    .select("id, download_url, file_path, status, type")
    .eq("id", id)
    .single();

  if (error || !resource) return NextResponse.json({ error: "Recurso no encontrado" }, { status: 404 });
  if (resource.status !== "approved") return NextResponse.json({ error: "Recurso no disponible" }, { status: 403 });

  // Get user from auth header (optional)
  const authHeader = req.headers.get("authorization");
  let userId: string | null = null;
  if (authHeader) {
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    userId = user?.id ?? null;
  }

  // Log download
  await supabase.from("downloads").insert({ user_id: userId, resource_id: id });

  // Increment counter
  await supabase.rpc("increment_downloads", { resource_id: id });

  // Resolve download URL
  let url = resource.download_url;
  if (!url && resource.file_path) {
    const { data } = supabase.storage.from("resources").getPublicUrl(resource.file_path);
    url = data.publicUrl;
  }

  return NextResponse.json({ url, resourceId: id });
}
