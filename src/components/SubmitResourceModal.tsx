"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Upload, Link, CheckCircle, Loader2, FileArchive, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";

const CATEGORIES = ["Video", "Audio", "Foto", "Diseño", "IA", "Templates"];
const THUMBNAILS  = ["luts", "motion", "ai", "audio", "templates", "photo", "fonts", "color", "stock", "plugins", "tutorials"];
const TAGS_BY_CAT: Record<string, string[]> = {
  Video:     ["video", "luts", "cinematic", "motion", "effects", "stock"],
  Audio:     ["audio", "music", "sfx", "free"],
  Foto:      ["photo", "presets", "lightroom"],
  Diseño:    ["design", "social", "fonts", "color"],
  IA:        ["ai", "automation"],
  Templates: ["templates", "youtube", "social", "tiktok"],
};

type UploadMode = "link" | "zip";

interface Props {
  onClose: () => void;
}

export default function SubmitResourceModal({ onClose }: Props) {
  const { user, isSupabase } = useAuth();
  const { success, error: toastError } = useToast();
  const [mounted, setMounted] = useState(false);

  const [mode,        setMode]        = useState<UploadMode>("link");
  const [title,       setTitle]       = useState("");
  const [desc,        setDesc]        = useState("");
  const [category,    setCategory]    = useState("Video");
  const [thumbnail,   setThumbnail]   = useState("motion");
  const [type,        setType]        = useState<"free" | "premium">("free");
  const [link,        setLink]        = useState("");
  const [tags,        setTags]        = useState<string[]>([]);
  const [file,        setFile]        = useState<File | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [done,        setDone]        = useState(false);
  const [errors,      setErrors]      = useState<Record<string, string>>({});

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    lockScroll();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { unlockScroll(); window.removeEventListener("keydown", onKey); };
  }, [onClose]);

  // Reset tags when category changes
  useEffect(() => { setTags([]); }, [category]);

  function toggleTag(tag: string) {
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!title.trim())        e.title    = "Título requerido";
    if (!desc.trim())         e.desc     = "Descripción requerida";
    if (mode === "link" && !link.trim()) e.link = "URL requerida";
    if (mode === "zip"  && !file)        e.file = "Selecciona un archivo ZIP";
    if (tags.length === 0)    e.tags     = "Selecciona al menos 1 tag";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    if (!isSupabase || !user) {
      toastError("Requiere cuenta real", "Conéctate con Supabase para enviar recursos.");
      return;
    }

    setLoading(true);
    try {
      let filePath: string | null = null;

      // Upload ZIP if file mode
      if (mode === "zip" && file) {
        const ext  = file.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("resources")
          .upload(path, file, { contentType: "application/zip", upsert: false });
        if (uploadError) throw new Error("Error subiendo archivo: " + uploadError.message);
        filePath = path;
      }

      // Get auth token
      const { data: { session: sb } } = await supabase.auth.getSession();
      const token = sb?.access_token;

      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: title.trim(),
          description: desc.trim(),
          category,
          thumbnail,
          tags,
          type,
          download_url: mode === "link" ? link.trim() : null,
          file_path: filePath,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Error desconocido");
      }

      setDone(true);
      success("¡Recurso enviado! 🎉", "Será revisado por el equipo de CretivHub. Te avisaremos cuando esté aprobado.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toastError("Error al enviar", msg);
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;

  const content = done ? (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-green-500/15 border border-green-500/25 flex items-center justify-center">
        <CheckCircle size={32} className="text-green-400" />
      </div>
      <div>
        <h3 className="text-white font-bold text-lg mb-1">¡Recurso enviado!</h3>
        <p className="text-[#8b949e] text-sm leading-relaxed">
          El equipo revisará tu envío en las próximas 24-48 horas. Si es aprobado aparecerá en CretivHub.
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="btn-gradient px-6 py-2.5 rounded-xl text-sm font-bold text-white"
      >
        Cerrar
      </button>
    </div>
  ) : (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

        {/* Mode toggle */}
        <div className="flex gap-2 p-1 bg-[#0d1117] rounded-xl border border-[#30363d]">
          {(["link", "zip"] as UploadMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mode === m
                  ? "bg-gradient-to-r from-violet-600 to-pink-600 text-white"
                  : "text-[#6e7681] hover:text-white"
              }`}
            >
              {m === "link" ? <><Link size={14} /> Link externo</> : <><FileArchive size={14} /> Subir ZIP</>}
            </button>
          ))}
        </div>

        {!isSupabase && (
          <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl text-xs text-amber-300">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>Supabase no está configurado. Configura las claves en <code>.env.local</code> para activar los envíos reales.</span>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-1.5">
            Título *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: "" })); }}
            placeholder="Pack de LUTs cinematográficos..."
            maxLength={80}
            className={`w-full bg-[#0d1117] border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#6e7681] outline-none transition-colors ${
              errors.title ? "border-red-500/50" : "border-[#30363d] focus:border-violet-500/50"
            }`}
          />
          {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-1.5">
            Descripción *
          </label>
          <textarea
            value={desc}
            onChange={(e) => { setDesc(e.target.value); setErrors((p) => ({ ...p, desc: "" })); }}
            placeholder="Qué incluye, cómo se usa, requisitos..."
            rows={3}
            maxLength={300}
            className={`w-full bg-[#0d1117] border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#6e7681] outline-none transition-colors resize-none ${
              errors.desc ? "border-red-500/50" : "border-[#30363d] focus:border-violet-500/50"
            }`}
          />
          <div className="flex justify-between items-center mt-0.5">
            {errors.desc && <p className="text-red-400 text-xs">{errors.desc}</p>}
            <p className="text-[#6e7681] text-xs ml-auto">{desc.length}/300</p>
          </div>
        </div>

        {/* Category + Thumbnail */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-1.5">Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] text-white text-sm rounded-xl px-3 py-2.5 outline-none focus:border-violet-500/50 cursor-pointer"
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-1.5">Miniatura</label>
            <select
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] text-white text-sm rounded-xl px-3 py-2.5 outline-none focus:border-violet-500/50 cursor-pointer"
            >
              {THUMBNAILS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Type */}
        <div>
          <label className="block text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-1.5">Tipo</label>
          <div className="flex gap-2">
            {(["free", "premium"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${
                  type === t
                    ? t === "free"
                      ? "bg-green-500/15 border-green-500/40 text-green-400"
                      : "bg-amber-500/15 border-amber-500/40 text-amber-400"
                    : "bg-[#0d1117] border-[#30363d] text-[#6e7681]"
                }`}
              >
                {t === "free" ? "✦ Gratis" : "⭐ Premium"}
              </button>
            ))}
          </div>
        </div>

        {/* Link or ZIP */}
        {mode === "link" ? (
          <div>
            <label className="block text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-1.5">
              URL de descarga *
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => { setLink(e.target.value); setErrors((p) => ({ ...p, link: "" })); }}
              placeholder="https://gumroad.com/l/... o https://github.com/..."
              className={`w-full bg-[#0d1117] border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#6e7681] outline-none transition-colors ${
                errors.link ? "border-red-500/50" : "border-[#30363d] focus:border-violet-500/50"
              }`}
            />
            {errors.link && <p className="text-red-400 text-xs mt-1">{errors.link}</p>}
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-1.5">
              Archivo ZIP * (máx. 100 MB)
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className={`w-full border-2 border-dashed rounded-xl px-4 py-6 cursor-pointer flex flex-col items-center gap-2 transition-colors ${
                errors.file
                  ? "border-red-500/40 bg-red-500/5"
                  : file
                  ? "border-violet-500/40 bg-violet-500/5"
                  : "border-[#30363d] hover:border-violet-500/40 hover:bg-violet-500/5"
              }`}
            >
              <Upload size={20} className={file ? "text-violet-400" : "text-[#6e7681]"} />
              {file ? (
                <div className="text-center">
                  <p className="text-sm text-violet-300 font-medium">{file.name}</p>
                  <p className="text-xs text-[#6e7681]">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                </div>
              ) : (
                <p className="text-sm text-[#6e7681]">Haz clic para seleccionar ZIP</p>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".zip,application/zip"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f && f.size > 100 * 1024 * 1024) {
                  setErrors((p) => ({ ...p, file: "El archivo supera los 100 MB" }));
                  return;
                }
                setFile(f ?? null);
                setErrors((p) => ({ ...p, file: "" }));
              }}
            />
            {errors.file && <p className="text-red-400 text-xs mt-1">{errors.file}</p>}
          </div>
        )}

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-1.5">
            Tags * (selecciona los que apliquen)
          </label>
          <div className="flex gap-1.5 flex-wrap">
            {(TAGS_BY_CAT[category] ?? []).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => { toggleTag(tag); setErrors((p) => ({ ...p, tags: "" })); }}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  tags.includes(tag)
                    ? "bg-violet-600/20 border-violet-500/50 text-violet-300"
                    : "bg-[#161b22] border-[#30363d] text-[#8b949e] hover:border-violet-500/40"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          {errors.tags && <p className="text-red-400 text-xs mt-1">{errors.tags}</p>}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[#30363d] flex gap-3 flex-shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl border border-[#30363d] text-[#8b949e] text-sm hover:text-white hover:border-white/20 transition-all"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-gradient flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading
            ? <><Loader2 size={14} className="animate-spin" /> Enviando...</>
            : <><Upload size={14} /> Enviar recurso</>
          }
        </button>
      </div>
    </form>
  );

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Enviar recurso"
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <div
        className="relative z-10 w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col"
        style={{
          width: "min(520px, calc(100vw - 2rem))",
          maxHeight: "min(720px, calc(100vh - 3rem))",
          backgroundColor: "#161b22",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#30363d] flex-shrink-0">
          <div>
            <h2 className="text-white font-bold text-base">Enviar recurso</h2>
            <p className="text-[#6e7681] text-xs mt-0.5">
              Se revisará antes de publicarse en CretivHub
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#6e7681] hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {content}
      </div>
    </div>,
    document.body
  );
}
