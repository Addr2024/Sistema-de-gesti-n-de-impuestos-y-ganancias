import { useState } from "react";
import { Navbar }            from "./components/Navbar";
import { HeroSection }       from "./components/HeroSection";
import { GallerySection }    from "./components/GallerySection";
import { DocumentsSection }  from "./components/DocumentsSection";
import { ImpuestosSection }  from "./components/ImpuestosSection";
import { ContactSection }    from "./components/ContactSection";
import { Footer }            from "./components/Footer";
import { LoginPage }         from "./components/LoginPage";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("invergica_auth") === "true";
  });

  const handleLogin  = () => setIsLoggedIn(true);
  const handleLogout = () => {
    localStorage.removeItem("invergica_auth");
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen w-full"
      style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#0d0300" }}>

      {/* ─── BARRA DE NAVEGACIÓN con logo real ─────────── */}
      <Navbar onLogout={handleLogout} />

      {/* ─── HERO — fachada exterior + eslogan ─────────── */}
      <HeroSection />

      {/* ─── BANDA DE ESTADÍSTICAS ──────────────────────── */}
      <div className="py-10 px-6" style={{ background: "#1a0500", borderBottom: "1px solid #3a1200" }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { valor: "100%",   etiqueta: "Productos garantizados" },
            { valor: "Rápido", etiqueta: "Atención por WhatsApp"  },
          ].map((stat) => (
            <div key={stat.etiqueta} className="text-center">
              <p style={{ color: "#f5a623", fontSize: 28, fontWeight: 900 }}>
                {stat.valor}
              </p>
              <p style={{ color: "#8a4a20", fontSize: 12, marginTop: 4 }}>
                {stat.etiqueta}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── GALERÍA — interior y exterior reales ───────── */}
      <GallerySection />

      {/* ─── DOCUMENTOS — solo reportes SIGA ───────────── */}
      <DocumentsSection />

      {/* ─── PAGO DE IMPUESTOS — IVA + IGTF → SENIAT ───── */}
      <ImpuestosSection />

      {/* ─── CONTACTO — WhatsApp + Google Maps ─────────── */}
      <ContactSection />

      {/* ─── PIE DE PÁGINA ──────────────────────────────── */}
      <Footer />

    </div>
  );
}
