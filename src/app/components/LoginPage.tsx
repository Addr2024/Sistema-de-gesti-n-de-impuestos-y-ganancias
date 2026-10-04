import { useState } from "react";
import logoImg from "../../imports/Logo.jpg";

// Credenciales leídas de variables de entorno (archivo .env, no versionado).
// Nota: al ser un sitio sin servidor, Vite las incluye en el bundle; esto NO
// sustituye una autenticación real en backend.
const ADMIN_EMAIL    = (import.meta.env.VITE_ADMIN_EMAIL    ?? "") as string;
const ADMIN_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD ?? "") as string;

interface LoginPageProps {
  onLogin: () => void;
}

type ModalTipo = "forgot" | "noCuenta" | null;

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [error,       setError]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [modal,       setModal]       = useState<ModalTipo>(null);
  const [emailTouched,setEmailTouched]= useState(false);

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simula un pequeño delay de verificación
    await new Promise(r => setTimeout(r, 700));

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      setError("Acceso no configurado. Defina VITE_ADMIN_EMAIL y VITE_ADMIN_PASSWORD en .env.");
    } else if (email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
      localStorage.setItem("invergica_auth", "true");
      onLogin();
    } else {
      setError("Correo o contraseña incorrectos. Solo el administrador puede acceder.");
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{ background: "#0d0300" }}
    >
      {/* Fondo con patrón decorativo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(224,123,0,0.12) 0%, transparent 70%)" }} />
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 50% 40% at 50% 100%, rgba(204,34,0,0.08) 0%, transparent 70%)" }} />
        {/* Círculos decorativos */}
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-5"
          style={{ background: "#e07b00" }} />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full opacity-5"
          style={{ background: "#cc2200" }} />
      </div>

      {/* Card de login */}
      <div
        className="relative w-full max-w-sm mx-4 rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #1a0800 0%, #0d0300 100%)",
          border: "1.5px solid #3a1200",
          boxShadow: "0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(224,123,0,0.08)",
        }}
      >
        {/* Barra superior naranja */}
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #cc2200, #e07b00, #f5a623)" }} />

        <div className="px-8 py-10">
          {/* Logo + nombre */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <img
                src={logoImg}
                alt="Logo Invergica"
                className="rounded-full object-cover"
                style={{ width: 72, height: 72, border: "2.5px solid #e07b00",
                  boxShadow: "0 0 24px rgba(224,123,0,0.35)" }}
              />
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: "#e07b00", border: "2px solid #0d0300" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                  stroke="#fff" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
            <h1 style={{ color: "#f5a623", fontSize: 20, fontWeight: 900, letterSpacing: 2 }}>
              INVERGICA
            </h1>
            <p style={{ color: "#6a3a10", fontSize: 11, letterSpacing: 1, marginTop: 2 }}>
              ACCESO ADMINISTRATIVO
            </p>
          </div>

          {/* Título del formulario */}
          <div className="mb-6">
            <h2 style={{ color: "#f5e0c0", fontSize: 22, fontWeight: 800 }}>
              Iniciar Sesión
            </h2>
            <p style={{ color: "#6a3a10", fontSize: 12, marginTop: 3 }}>
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Campo Email */}
            <div>
              <label style={{ color: "#8a5a30", fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>
                CORREO ELECTRÓNICO
              </label>
              <div className="relative mt-1.5">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke={emailTouched && emailValido ? "#4ade80" : "#6a3a10"} strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailTouched(true); setError(""); }}
                  required
                  className="w-full rounded-xl pl-10 pr-10 py-3 outline-none transition-all"
                  style={{
                    background: "#0d0300",
                    border: `1.5px solid ${emailTouched && !emailValido && email ? "#ef4444"
                      : emailTouched && emailValido ? "#22c55e" : "#3a1200"}`,
                    color: "#f5e0c0",
                    fontSize: 14,
                  }}
                />
                {/* Checkmark */}
                {emailTouched && emailValido && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: "#22c55e" }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                        stroke="#fff" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Campo Contraseña */}
            <div>
              <label style={{ color: "#8a5a30", fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>
                CONTRASEÑA
              </label>
              <div className="relative mt-1.5">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="#6a3a10" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  required
                  className="w-full rounded-xl pl-10 pr-10 py-3 outline-none transition-all"
                  style={{
                    background: "#0d0300",
                    border: `1.5px solid ${error ? "#ef4444" : "#3a1200"}`,
                    color: "#f5e0c0",
                    fontSize: 14,
                  }}
                />
                {/* Toggle mostrar/ocultar */}
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                >
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="#6a3a10" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="#6a3a10" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-xl px-4 py-3 flex items-start gap-2"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid #ef444444" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="#f87171" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <p style={{ color: "#f87171", fontSize: 12, lineHeight: 1.5 }}>{error}</p>
              </div>
            )}

            {/* Olvidé mi contraseña */}
            <div className="text-right -mt-1">
              <button
                type="button"
                onClick={() => setModal("forgot")}
                style={{ color: "#f5a623", fontSize: 12, fontWeight: 600 }}
                className="hover:opacity-75 transition-opacity"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Botón de acceso */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(90deg, #cc2200, #e07b00)", color: "#fff", fontSize: 15 }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Verificando…
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          {/* Divisor */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: "#2a0a00" }} />
            <span style={{ color: "#3a1200", fontSize: 11 }}>o</span>
            <div className="flex-1 h-px" style={{ background: "#2a0a00" }} />
          </div>

          {/* No tengo cuenta */}
          <button
            type="button"
            onClick={() => setModal("noCuenta")}
            className="w-full text-center transition-opacity hover:opacity-75"
            style={{ color: "#6a3a10", fontSize: 13 }}
          >
            ¿No tienes una cuenta?
          </button>
        </div>
      </div>

      {/* ── Modal: Olvidé mi contraseña ── */}
      {modal === "forgot" && (
        <ModalOverlay onClose={() => setModal(null)}>
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "rgba(224,123,0,0.15)", border: "2px solid #e07b00" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                stroke="#f5a623" strokeWidth="1.8">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
            </div>
            <h3 style={{ color: "#f5e0c0", fontSize: 18, fontWeight: 800 }}>
              Recuperar Contraseña
            </h3>
            <p style={{ color: "#8a5a30", fontSize: 13, lineHeight: 1.7 }}>
              Este sistema es de acceso privado.
              <br />
              Para recuperar tu contraseña, contacta
              <br />
              al administrador directamente:
            </p>
            <a
              href="https://wa.me/584141667535"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all hover:opacity-85"
              style={{ background: "#25d366", color: "#fff", fontSize: 14, width: "100%", justifyContent: "center" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Contactar por WhatsApp
            </a>
            <button onClick={() => setModal(null)}
              style={{ color: "#6a3a10", fontSize: 13 }}
              className="hover:opacity-75 transition-opacity">
              Cerrar
            </button>
          </div>
        </ModalOverlay>
      )}

      {/* ── Modal: No tengo cuenta ── */}
      {modal === "noCuenta" && (
        <ModalOverlay onClose={() => setModal(null)}>
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "rgba(204,34,0,0.15)", border: "2px solid #cc2200" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                stroke="#ff6b35" strokeWidth="1.8">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
            </div>
            <h3 style={{ color: "#f5e0c0", fontSize: 18, fontWeight: 800 }}>
              Sistema Privado
            </h3>
            <p style={{ color: "#8a5a30", fontSize: 13, lineHeight: 1.7 }}>
              El acceso a este sistema está
              <br />
              <strong style={{ color: "#f5a623" }}>reservado únicamente
              <br />
              para el administrador</strong>
              <br />
              de Invergica.
              <br /><br />
              Si eres el administrador y no tienes
              <br />
              tus credenciales, contacta al soporte técnico.
            </p>
            <div className="w-full rounded-xl p-4 text-left"
              style={{ background: "#1a0500", border: "1px solid #3a1200" }}>
              <p style={{ color: "#f5a623", fontSize: 11, fontWeight: 700, marginBottom: 2 }}>
                RIF J-413252619
              </p>
              <p style={{ color: "#6a3a10", fontSize: 12 }}>
                Invergica · Maracaibo, Venezuela
              </p>
            </div>
            <button onClick={() => setModal(null)}
              className="w-full py-2.5 rounded-xl font-bold transition-all hover:opacity-85"
              style={{ background: "#1a0500", color: "#f5a623", border: "1px solid #3a1200", fontSize: 14 }}>
              Entendido
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

// ── Modal reutilizable ────────────────────────────────────────────────────────
function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-xs rounded-2xl p-7 relative"
        style={{
          background: "linear-gradient(160deg, #1a0800 0%, #0d0300 100%)",
          border: "1.5px solid #3a1200",
          boxShadow: "0 24px 60px rgba(0,0,0,0.7)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center transition-opacity hover:opacity-70"
          style={{ background: "#2a0a00" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="#8a5a30" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
}
