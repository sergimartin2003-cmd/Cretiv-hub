"use client";

import { useState, useEffect, useId } from "react";
import {
  X, Eye, EyeOff, Zap, CheckCircle, AlertCircle, Loader2, User as UserIcon, AtSign, Mail, Lock,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  register,
  login as authLogin,
  getPasswordStrength,
  strengthLabel,
  strengthColor,
  creatorTypeLabels,
  type CreatorType,
  type RegisterPayload,
} from "@/lib/auth";

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({
  id, label, type = "text", value, onChange, error, placeholder, icon: Icon, right,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  icon?: React.ElementType;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-[#8b949e]">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6e7681] pointer-events-none">
            <Icon size={14} />
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={type === "password" ? "current-password" : undefined}
          className={`w-full bg-[#0d1117] border rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#6e7681] outline-none transition-colors duration-200
            ${Icon ? "pl-9" : ""}
            ${right ? "pr-10" : ""}
            ${error
              ? "border-red-500/60 focus:border-red-500"
              : "border-[#30363d] focus:border-violet-500/60"
            }`}
        />
        {right && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">{right}</span>
        )}
      </div>
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-400">
          <AlertCircle size={11} />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Password strength bar ───────────────────────────────────────────────────

function StrengthBar({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  if (!password) return null;
  return (
    <div className="flex flex-col gap-1 mt-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= strength ? strengthColor[strength] : "bg-[#30363d]"
            }`}
          />
        ))}
      </div>
      {strength > 0 && (
        <p className={`text-[10px] font-medium ${
          strength <= 1 ? "text-red-400"
          : strength === 2 ? "text-orange-400"
          : strength === 3 ? "text-yellow-400"
          : "text-green-400"
        }`}>
          {strengthLabel[strength]}
        </p>
      )}
    </div>
  );
}

// ─── Register form ────────────────────────────────────────────────────────────

function RegisterForm() {
  const { login, setAuthTab, isSupabase, closeAuth } = useAuth();
  const { success, error: toastError, info } = useToast();
  const uid = useId();

  const [name,          setName]          = useState("");
  const [username,      setUsername]      = useState("");
  const [email,         setEmail]         = useState("");
  const [password,      setPassword]      = useState("");
  const [confirmPwd,    setConfirmPwd]    = useState("");
  const [creatorType,   setCreatorType]   = useState<CreatorType>("youtuber");
  const [acceptTerms,   setAcceptTerms]   = useState(false);
  const [showPwd,       setShowPwd]       = useState(false);
  const [showConfirm,   setShowConfirm]   = useState(false);
  const [errors,        setErrors]        = useState<Record<string, string>>({});
  const [loading,       setLoading]       = useState(false);
  const [registered,    setRegistered]    = useState(false);

  // Auto-generate username from name
  useEffect(() => {
    if (name && !username) {
      setUsername(
        name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "").slice(0, 20)
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim())               e.name = "El nombre es obligatorio";
    if (!username.trim())           e.username = "El username es obligatorio";
    if (!/^[a-z0-9_]{3,20}$/.test(username))
                                    e.username = "Solo letras, números y _ (3-20 caracteres)";
    if (!email.includes("@"))       e.email = "Email no válido";
    if (password.length < 8)        e.password = "Mínimo 8 caracteres";
    if (password !== confirmPwd)    e.confirmPwd = "Las contraseñas no coinciden";
    if (!acceptTerms)               e.terms = "Debes aceptar los términos";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    // ── Supabase auth ─────────────────────────────────────────────────────────
    if (isSupabase) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username, display_name: name } },
      });
      setLoading(false);
      if (error) {
        const msg = error.message.includes("already")
          ? "Este email ya está registrado"
          : error.message;
        setErrors({ email: msg });
        toastError("No se pudo crear la cuenta", msg);
        return;
      }
      setRegistered(true);
      success("¡Bienvenido/a a CretivHub! 🎉", `Cuenta creada como @${username}`);
      await new Promise((r) => setTimeout(r, 1200));
      closeAuth();
      return;
    }

    // ── LocalStorage fallback ─────────────────────────────────────────────────
    await new Promise((r) => setTimeout(r, 700));
    const payload: RegisterPayload = {
      name, username, email, password, confirmPassword: confirmPwd, creatorType, acceptTerms,
    };
    const result = register(payload);
    setLoading(false);

    if (!result.ok) {
      const map: Record<string, { field: string; msg: string }> = {
        email_taken:        { field: "email",      msg: "Este email ya está registrado" },
        username_taken:     { field: "username",   msg: "Este username ya está en uso" },
        passwords_mismatch: { field: "confirmPwd", msg: "Las contraseñas no coinciden" },
        weak_password:      { field: "password",   msg: "La contraseña es demasiado débil" },
      };
      const { field, msg } = map[result.error] ?? { field: "name", msg: "Error desconocido" };
      setErrors({ [field]: msg });
      toastError("No se pudo crear la cuenta", msg);
      return;
    }

    setRegistered(true);
    success("¡Bienvenido/a a CretivHub! 🎉", `Cuenta creada como @${result.user.username}`);
    await new Promise((r) => setTimeout(r, 900));
    login(result.user, false);
  }

  if (registered) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-10">
        <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
          <CheckCircle size={32} className="text-green-400" />
        </div>
        <p className="text-white font-bold text-lg">¡Cuenta creada!</p>
        <p className="text-[#8b949e] text-sm text-center">Bienvenido/a a CretivHub 🎉</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

      {/* Name + Username */}
      <div className="grid grid-cols-2 gap-3">
        <Field
          id={`${uid}-name`}
          label="Nombre completo"
          value={name}
          onChange={setName}
          error={errors.name}
          placeholder="Sergi Martín"
          icon={UserIcon}
        />
        <Field
          id={`${uid}-username`}
          label="Username"
          value={username}
          onChange={(v) => setUsername(v.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
          error={errors.username}
          placeholder="sergi_martin"
          icon={AtSign}
        />
      </div>

      {/* Email */}
      <Field
        id={`${uid}-email`}
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        error={errors.email}
        placeholder="tu@email.com"
        icon={Mail}
      />

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <Field
          id={`${uid}-password`}
          label="Contraseña"
          type={showPwd ? "text" : "password"}
          value={password}
          onChange={setPassword}
          error={errors.password}
          placeholder="Mínimo 8 caracteres"
          icon={Lock}
          right={
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="text-[#6e7681] hover:text-white transition-colors"
            >
              {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          }
        />
        <StrengthBar password={password} />
      </div>

      {/* Confirm password */}
      <Field
        id={`${uid}-confirm`}
        label="Confirmar contraseña"
        type={showConfirm ? "text" : "password"}
        value={confirmPwd}
        onChange={setConfirmPwd}
        error={errors.confirmPwd}
        placeholder="Repite la contraseña"
        icon={Lock}
        right={
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            aria-label={showConfirm ? "Ocultar" : "Mostrar"}
            className="text-[#6e7681] hover:text-white transition-colors"
          >
            {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        }
      />

      {/* Creator type */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${uid}-type`} className="text-xs font-medium text-[#8b949e]">
          Tipo de creador
        </label>
        <select
          id={`${uid}-type`}
          value={creatorType}
          onChange={(e) => setCreatorType(e.target.value as CreatorType)}
          className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/60 transition-colors cursor-pointer"
        >
          {(Object.entries(creatorTypeLabels) as [CreatorType, string][]).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Terms */}
      <div className="flex flex-col gap-1">
        <label className="flex items-start gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-0.5 accent-violet-500 w-4 h-4 shrink-0"
          />
          <span className="text-xs text-[#8b949e] leading-relaxed">
            Acepto los{" "}
            <button type="button" onClick={() => info("Términos de servicio", "Disponibles próximamente en cretivhub.dev/terms")} className="text-violet-400 hover:underline">Términos de servicio</button>
            {" "}y la{" "}
            <button type="button" onClick={() => info("Política de privacidad", "Disponibles próximamente en cretivhub.dev/privacy")} className="text-violet-400 hover:underline">Política de privacidad</button>
          </span>
        </label>
        {errors.terms && (
          <p className="flex items-center gap-1 text-xs text-red-400 pl-6">
            <AlertCircle size={11} />
            {errors.terms}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="btn-gradient w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
      >
        {loading ? (
          <><Loader2 size={15} className="animate-spin" /> Creando cuenta...</>
        ) : (
          "Crear cuenta gratis"
        )}
      </button>

      <p className="text-center text-xs text-[#6e7681]">
        ¿Ya tienes cuenta?{" "}
        <button type="button" onClick={() => setAuthTab("login")} className="text-violet-400 hover:underline font-medium">
          Inicia sesión
        </button>
      </p>
    </form>
  );
}

// ─── Login form ───────────────────────────────────────────────────────────────

function LoginForm() {
  const { login, setAuthTab, isSupabase, closeAuth } = useAuth();
  const { success, error: toastError, info } = useToast();
  const uid = useId();

  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPwd,    setShowPwd]    = useState(false);
  const [error,      setError]      = useState("");
  const [loading,    setLoading]    = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { setError("Completa todos los campos"); return; }
    setError("");
    setLoading(true);

    // ── Supabase auth ─────────────────────────────────────────────────────────
    if (isSupabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        const msg = "Email o contraseña incorrectos";
        setError(msg);
        toastError("Error al iniciar sesión", msg);
        return;
      }
      success("¡Bienvenido/a de nuevo! 👋");
      closeAuth();
      return;
    }

    // ── LocalStorage fallback ─────────────────────────────────────────────────
    await new Promise((r) => setTimeout(r, 600));
    const result = authLogin(email, password);
    setLoading(false);
    if (!result.ok) {
      const msg =
        result.error === "user_not_found"
          ? "No existe ninguna cuenta con ese email"
          : "Contraseña incorrecta";
      setError(msg);
      toastError("Error al iniciar sesión", msg);
      return;
    }
    success(`¡Hola de nuevo, ${result.user.name.split(" ")[0]}! 👋`);
    login(result.user, rememberMe);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

      <Field
        id={`${uid}-email`}
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="tu@email.com"
        icon={Mail}
      />

      <Field
        id={`${uid}-password`}
        label="Contraseña"
        type={showPwd ? "text" : "password"}
        value={password}
        onChange={setPassword}
        placeholder="Tu contraseña"
        icon={Lock}
        right={
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="text-[#6e7681] hover:text-white transition-colors"
          >
            {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        }
      />

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          <AlertCircle size={13} />
          {error}
        </p>
      )}

      {/* Remember me + forgot */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="accent-violet-500 w-4 h-4"
          />
          <span className="text-xs text-[#8b949e]">Recordarme</span>
        </label>
        <button
          type="button"
          onClick={() => info("Recuperar contraseña", "Introduce tu email registrado y te enviamos instrucciones. (Funcionalidad disponible próximamente)")}
          className="text-xs text-violet-400 hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="btn-gradient w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <><Loader2 size={15} className="animate-spin" /> Iniciando sesión...</>
        ) : (
          "Iniciar sesión"
        )}
      </button>

      <p className="text-center text-xs text-[#6e7681]">
        ¿No tienes cuenta?{" "}
        <button type="button" onClick={() => setAuthTab("register")} className="text-violet-400 hover:underline font-medium">
          Regístrate gratis
        </button>
      </p>
    </form>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export default function AuthModal() {
  const { authOpen, closeAuth, authTab, setAuthTab } = useAuth();

  // Close on Escape
  useEffect(() => {
    if (!authOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeAuth(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [authOpen, closeAuth]);

  // Lock body scroll
  useEffect(() => {
    if (authOpen) lockScroll();
    else unlockScroll();
    return () => unlockScroll();
  }, [authOpen]);

  if (!authOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={authTab === "login" ? "Iniciar sesión" : "Crear cuenta"}
      className="fixed inset-0 z-[73] flex items-center justify-center px-4 py-6"
      onClick={closeAuth}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full max-w-md glass rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Zap size={15} className="text-white" />
            </div>
            <span className="font-black text-white">
              Cretiv<span className="gradient-text-pp">Hub</span>
            </span>
          </div>
          <button
            type="button"
            onClick={closeAuth}
            aria-label="Cerrar"
            className="p-1.5 text-[#6e7681] hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex mx-6 mb-5 bg-[#0d1117] rounded-xl p-1 gap-1">
          {(["register", "login"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setAuthTab(tab)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                authTab === tab
                  ? "bg-violet-600/25 text-violet-300 shadow"
                  : "text-[#8b949e] hover:text-white"
              }`}
            >
              {tab === "register" ? "Registrarse" : "Iniciar sesión"}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="px-6 pb-6 overflow-y-auto max-h-[70vh]">
          {authTab === "register" ? <RegisterForm /> : <LoginForm />}
        </div>
      </div>
    </div>
  );
}
