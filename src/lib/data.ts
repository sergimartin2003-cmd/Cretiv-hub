export const categories = [
  { id: "video", label: "Video Editing", icon: "🎬", color: "from-red-500/20 to-orange-500/20", border: "border-red-500/20", count: 1240 },
  { id: "photo", label: "Photo Editing", icon: "📷", color: "from-cyan-500/20 to-blue-500/20", border: "border-cyan-500/20", count: 980 },
  { id: "motion", label: "Motion Graphics", icon: "✨", color: "from-indigo-500/20 to-purple-500/20", border: "border-indigo-500/20", count: 654 },
  { id: "audio", label: "Sound Design", icon: "🎵", color: "from-green-500/20 to-emerald-500/20", border: "border-green-500/20", count: 432 },
  { id: "ai", label: "AI Tools", icon: "🤖", color: "from-pink-500/20 to-rose-500/20", border: "border-pink-500/20", count: 876 },
  { id: "templates", label: "Templates", icon: "🗂️", color: "from-yellow-500/20 to-amber-500/20", border: "border-yellow-500/20", count: 2100 },
  { id: "fonts", label: "Fonts", icon: "🔤", color: "from-purple-500/20 to-violet-500/20", border: "border-purple-500/20", count: 340 },
  { id: "color", label: "Color Palettes", icon: "🎨", color: "from-orange-500/20 to-red-500/20", border: "border-orange-500/20", count: 567 },
  { id: "luts", label: "LUTs & Presets", icon: "🎞️", color: "from-teal-500/20 to-cyan-500/20", border: "border-teal-500/20", count: 890 },
  { id: "stock", label: "Stock Media", icon: "🖼️", color: "from-blue-500/20 to-indigo-500/20", border: "border-blue-500/20", count: 3200 },
  { id: "plugins", label: "Plugins", icon: "🔌", color: "from-violet-500/20 to-purple-500/20", border: "border-violet-500/20", count: 478 },
  { id: "tutorials", label: "Tutorials", icon: "📚", color: "from-emerald-500/20 to-green-500/20", border: "border-emerald-500/20", count: 1560 },
];

export type Resource = {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  badge?: "trending" | "new" | "official";
  stars: number;
  saves: number;
  downloads: number;
  author: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  thumbnail: string;
  type: "free" | "premium";
  preview?: string;
};

export const resources: Resource[] = [
  {
    id: "1",
    title: "Cinematic LUT Pack Pro",
    description: "20 professional cinematic LUTs para darle un look Hollywood a tus vídeos. Compatible con Premiere, Resolve y FCPX.",
    category: "luts",
    tags: ["video", "luts", "cinematic"],
    badge: "trending",
    stars: 4.9,
    saves: 12400,
    downloads: 45200,
    author: { name: "VisualCraft", avatar: "VC", verified: true },
    thumbnail: "luts",
    type: "free",
  },
  {
    id: "2",
    title: "Motion Blur Transitions Pack",
    description: "50 transiciones con motion blur suave para Premiere Pro y After Effects. Instalación drag & drop.",
    category: "motion",
    tags: ["motion", "templates", "video"],
    badge: "new",
    stars: 4.8,
    saves: 8900,
    downloads: 31000,
    author: { name: "TransitionKing", avatar: "TK", verified: false },
    thumbnail: "motion",
    type: "free",
  },
  {
    id: "3",
    title: "AI Background Remover API",
    description: "Integración con IA para eliminar fondos automáticamente. Soporta imágenes en batch y vídeos en tiempo real.",
    category: "ai",
    tags: ["ai", "photo", "automation"],
    badge: "official",
    stars: 4.7,
    saves: 22100,
    downloads: 89000,
    author: { name: "AIStudio", avatar: "AI", verified: true },
    thumbnail: "ai",
    type: "premium",
  },
  {
    id: "4",
    title: "Lofi Music Pack — 30 tracks",
    description: "30 tracks de música lofi libre de derechos para YouTube, Twitch y podcast. 320kbps MP3 + WAV sin compresión.",
    category: "audio",
    tags: ["audio", "music", "free"],
    badge: "trending",
    stars: 4.9,
    saves: 31500,
    downloads: 120000,
    author: { name: "SoundForge", avatar: "SF", verified: true },
    thumbnail: "audio",
    type: "free",
  },
  {
    id: "5",
    title: "Minimal Instagram Templates",
    description: "100 templates para Stories e Instagram Feed con estética minimalista. Editables en Canva y Figma.",
    category: "templates",
    tags: ["templates", "design", "social"],
    badge: "new",
    stars: 4.6,
    saves: 14800,
    downloads: 67000,
    author: { name: "DesignBox", avatar: "DB", verified: false },
    thumbnail: "templates",
    type: "free",
  },
  {
    id: "6",
    title: "Lightroom Preset Collection",
    description: "200 presets para Lightroom con estilo editorial. Incluye filtros para outdoor, portrait, urban y food.",
    category: "photo",
    tags: ["photo", "presets", "lightroom"],
    badge: "official",
    stars: 4.8,
    saves: 19200,
    downloads: 78000,
    author: { name: "PhotoPro", avatar: "PP", verified: true },
    thumbnail: "photo",
    type: "premium",
  },
  {
    id: "7",
    title: "Glitch FX Overlay Pack",
    description: "80 overlays de glitch, ruido VHS y distorsión digital para After Effects y Premiere.",
    category: "motion",
    tags: ["motion", "video", "effects"],
    stars: 4.5,
    saves: 6700,
    downloads: 24000,
    author: { name: "GlitchLab", avatar: "GL", verified: false },
    thumbnail: "motion",
    type: "free",
  },
  {
    id: "8",
    title: "YouTube Thumbnail Templates",
    description: "50 plantillas de thumbnails para YouTube con alta tasa de click (CTR). Editables en Photoshop.",
    category: "templates",
    tags: ["templates", "youtube", "design"],
    badge: "trending",
    stars: 4.7,
    saves: 25000,
    downloads: 98000,
    author: { name: "ThumbnailPro", avatar: "TP", verified: true },
    thumbnail: "templates",
    type: "free",
  },
  {
    id: "9",
    title: "Sound FX Mega Pack",
    description: "500+ efectos de sonido categorizados: ambiente, impactos, UI, naturaleza y más. 48kHz/24bit.",
    category: "audio",
    tags: ["audio", "sfx", "free"],
    badge: "new",
    stars: 4.9,
    saves: 42000,
    downloads: 156000,
    author: { name: "AudioVault", avatar: "AV", verified: true },
    thumbnail: "audio",
    type: "free",
  },
];

export const collections = [
  {
    id: "1",
    title: "Starter Pack para YouTubers",
    description: "Todo lo que necesitas para empezar: templates, música, LUTs y herramientas esenciales.",
    resources: 24,
    saves: 8900,
    author: "ContentHub",
    cover: "youtube",
    official: true,
  },
  {
    id: "2",
    title: "Pack completo After Effects",
    description: "Los mejores presets, plugins y proyectos de After Effects organizados por categoría.",
    resources: 48,
    saves: 12400,
    author: "MotionLab",
    cover: "aftereffects",
    official: false,
  },
  {
    id: "3",
    title: "Creador de Podcasts Pro",
    description: "Recursos de audio, templates para portadas, plantillas de descripción y más.",
    resources: 32,
    saves: 5600,
    author: "PodcastKit",
    cover: "podcast",
    official: true,
  },
  {
    id: "4",
    title: "Estética Retro/VHS",
    description: "Filtros, overlays, fuentes y música para crear contenido con estética retro años 80-90.",
    resources: 36,
    saves: 7800,
    author: "RetroVibes",
    cover: "retro",
    official: false,
  },
];

export const trending = [
  { pos: 1, change: "up", title: "Cinematic LUT Pack Pro", category: "LUTs", stars: 4.9, downloads: 45200 },
  { pos: 2, change: "up", title: "Sound FX Mega Pack", category: "Audio", stars: 4.9, downloads: 156000 },
  { pos: 3, change: "same", title: "YouTube Thumbnail Templates", category: "Templates", stars: 4.7, downloads: 98000 },
  { pos: 4, change: "down", title: "Lofi Music Pack", category: "Audio", stars: 4.9, downloads: 120000 },
  { pos: 5, change: "up", title: "AI Background Remover API", category: "AI Tools", stars: 4.7, downloads: 89000 },
];
