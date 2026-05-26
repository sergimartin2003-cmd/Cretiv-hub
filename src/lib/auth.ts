// ─── Types ────────────────────────────────────────────────────────────────────

export type CreatorType =
  | "youtuber"
  | "photographer"
  | "designer"
  | "podcaster"
  | "streamer"
  | "filmmaker"
  | "other";

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  creatorType: CreatorType;
  avatar: string; // initials
  createdAt: string;
  savedResources: string[];
}

export interface Session {
  userId: string;
  email: string;
  name: string;
  username: string;
  avatar: string;
  creatorType: CreatorType;
  rememberMe: boolean;
}

// ─── Storage keys ──────────────────────────────────────────────────────────────

const USERS_KEY    = "ch_users";
const SESSION_KEY  = "ch_session";

// ─── Simple hash (NOT for production — no real DB yet) ────────────────────────

export function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = (Math.imul(31, hash) + password.charCodeAt(i)) | 0;
  }
  return `ch_${Math.abs(hash).toString(36)}`;
}

// ─── Users helpers ─────────────────────────────────────────────────────────────

export function getUsers(): User[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function getUserByUsername(username: string): User | undefined {
  return getUsers().find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
}

// ─── Register ─────────────────────────────────────────────────────────────────

export type RegisterError =
  | "email_taken"
  | "username_taken"
  | "weak_password"
  | "passwords_mismatch";

export interface RegisterPayload {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  creatorType: CreatorType;
  acceptTerms: boolean;
}

export function register(
  payload: RegisterPayload
): { ok: true; user: User } | { ok: false; error: RegisterError } {
  const { name, username, email, password, confirmPassword, creatorType } = payload;

  if (password !== confirmPassword) return { ok: false, error: "passwords_mismatch" };
  if (password.length < 8)           return { ok: false, error: "weak_password" };
  if (getUserByEmail(email))          return { ok: false, error: "email_taken" };
  if (getUserByUsername(username))    return { ok: false, error: "username_taken" };

  const user: User = {
    id: crypto.randomUUID(),
    name: name.trim(),
    username: username.trim().toLowerCase(),
    email: email.trim().toLowerCase(),
    passwordHash: hashPassword(password),
    creatorType,
    avatar: name
      .trim()
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    createdAt: new Date().toISOString(),
    savedResources: [],
  };

  saveUsers([...getUsers(), user]);
  return { ok: true, user };
}

// ─── Login ────────────────────────────────────────────────────────────────────

export type LoginError = "user_not_found" | "wrong_password";

export function login(
  email: string,
  password: string
): { ok: true; user: User } | { ok: false; error: LoginError } {
  const user = getUserByEmail(email);
  if (!user) return { ok: false, error: "user_not_found" };
  if (user.passwordHash !== hashPassword(password))
    return { ok: false, error: "wrong_password" };
  return { ok: true, user };
}

// ─── Session helpers ──────────────────────────────────────────────────────────

export function saveSession(user: User, rememberMe: boolean) {
  const session: Session = {
    userId:      user.id,
    email:       user.email,
    name:        user.name,
    username:    user.username,
    avatar:      user.avatar,
    creatorType: user.creatorType,
    rememberMe,
  };
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(SESSION_KEY, JSON.stringify(session));
  // Also store in the other to be safe
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function loadSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      sessionStorage.getItem(SESSION_KEY) ??
      localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

// ─── Saved resources ──────────────────────────────────────────────────────────

export function getSavedResources(userId: string): string[] {
  const user = getUsers().find((u) => u.id === userId);
  return user?.savedResources ?? [];
}

export function isResourceSaved(userId: string, resourceId: string): boolean {
  return getSavedResources(userId).includes(resourceId);
}

export function toggleSavedResource(userId: string, resourceId: string): boolean {
  const users = getUsers();
  const idx   = users.findIndex((u) => u.id === userId);
  if (idx === -1) return false;

  const saved = users[idx].savedResources;
  const isSaved = saved.includes(resourceId);

  users[idx].savedResources = isSaved
    ? saved.filter((id) => id !== resourceId)
    : [...saved, resourceId];

  localStorage.setItem("ch_users", JSON.stringify(users));
  return !isSaved; // returns new state
}

// ─── Password strength ────────────────────────────────────────────────────────

export type PasswordStrength = 0 | 1 | 2 | 3 | 4;

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8)                  score++;
  if (password.length >= 12)                 score++;
  if (/[A-Z]/.test(password))               score++;
  if (/[0-9]/.test(password))               score++;
  if (/[^A-Za-z0-9]/.test(password))        score++;
  return Math.min(4, score) as PasswordStrength;
}

export const strengthLabel: Record<PasswordStrength, string> = {
  0: "",
  1: "Muy débil",
  2: "Débil",
  3: "Buena",
  4: "Fuerte",
};

export const strengthColor: Record<PasswordStrength, string> = {
  0: "bg-transparent",
  1: "bg-red-500",
  2: "bg-orange-400",
  3: "bg-yellow-400",
  4: "bg-green-400",
};

export const creatorTypeLabels: Record<CreatorType, string> = {
  youtuber:     "YouTuber",
  photographer: "Fotógrafo/a",
  designer:     "Diseñador/a",
  podcaster:    "Podcaster",
  streamer:     "Streamer",
  filmmaker:    "Filmmaker",
  other:        "Otro",
};
