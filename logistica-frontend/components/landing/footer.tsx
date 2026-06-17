"use client";

import { Globe, MessageSquare, Video, Code, Mail } from "lucide-react";

const footerLinks = {
  Producto: [
    { label: "Features", href: "#features" },
    { label: "Precios", href: "#" },
    { label: "Integraciones", href: "#" },
    { label: "API", href: "#" },
  ],
  Compañía: [
    { label: "Sobre nosotros", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Clientes", href: "#" },
    { label: "Contacto", href: "#" },
  ],
  Recursos: [
    { label: "Documentación", href: "#" },
    { label: "Centro de ayuda", href: "#" },
    { label: "Estado del servicio", href: "#" },
    { label: "Privacidad", href: "#" },
  ],
};

const socialIcons = [
  { icon: Globe, href: "#", label: "LinkedIn" },
  { icon: MessageSquare, href: "#", label: "Twitter" },
  { icon: Video, href: "#", label: "YouTube" },
  { icon: Code, href: "#", label: "GitHub" },
  { icon: Mail, href: "#", label: "Email" },
];

export function Footer() {
  return (
    <footer
      className="relative pt-16 pb-8 px-4"
      style={{ background: "var(--color-design-bg)" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <a href="#" className="flex items-center gap-2 mb-4 cursor-pointer">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "var(--color-design-primary)" }}
              >
                <span className="text-white font-bold text-sm">LW</span>
              </div>
              <span
                className="font-semibold text-lg"
                style={{
                  color: "var(--color-design-text)",
                  fontFamily: "var(--font-lexend)",
                }}
              >
                Logistica Web
              </span>
            </a>
            <p
              className="text-sm leading-relaxed max-w-xs mb-6"
              style={{ color: "var(--color-design-secondary)" }}
            >
              Logística inteligente para empresas que no se detienen. Tracking,
              rutas con IA y dashboards en una sola plataforma.
            </p>
            <div className="flex items-center gap-3">
              {socialIcons.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer"
                  style={{
                    color: "var(--color-design-secondary)",
                    background: "var(--color-design-card)",
                    border: "1px solid var(--color-design-card-border)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "var(--color-design-primary)";
                    e.currentTarget.style.color = "white";
                    e.currentTarget.style.boxShadow =
                      "0 0 20px rgba(37,99,235,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "var(--color-design-card)";
                    e.currentTarget.style.color =
                      "var(--color-design-secondary)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <s.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4
                className="text-sm font-semibold mb-4"
                style={{
                  color: "var(--color-design-text)",
                  fontFamily: "var(--font-lexend)",
                }}
              >
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm transition-colors duration-200 cursor-pointer"
                      style={{ color: "var(--color-design-secondary)" }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="pt-6 text-center text-xs"
          style={{
            borderTop: "1px solid var(--color-design-card-border)",
            color: "var(--color-design-secondary)",
          }}
        >
          &copy; {new Date().getFullYear()} Logistica Web. Todos los derechos
          reservados.
        </div>
      </div>
    </footer>
  );
}
