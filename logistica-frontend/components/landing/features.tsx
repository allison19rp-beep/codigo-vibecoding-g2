"use client";

import { motion } from "framer-motion";
import {
  MapPin,
  LayoutDashboard,
  Route,
  Blocks,
  Smartphone,
  TrendingDown,
} from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "Tracking en tiempo real",
    description:
      "Monitorea flotas y envíos al instante con mapa interactivo. Geolocalización precisa y actualizaciones en vivo.",
    featured: true,
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard de operaciones",
    description:
      "KPIs, alertas inteligentes y reportes automáticos para tomar decisiones basadas en datos.",
    featured: false,
  },
  {
    icon: Route,
    title: "Rutas optimizadas con IA",
    description:
      "Algoritmos de inteligencia artificial que reducen costos de combustible hasta un 25%.",
    featured: false,
  },
  {
    icon: Blocks,
    title: "Integración con ERP y SAP",
    description:
      "Conecta con tus sistemas existentes: SAP, Oracle, facturación electrónica y más.",
    featured: false,
  },
  {
    icon: Smartphone,
    title: "App móvil para conductores",
    description:
      "Firma digital, evidencia fotográfica y navegación integrada desde el móvil.",
    featured: false,
  },
  {
    icon: TrendingDown,
    title: "Reducción de costos operativos",
    description:
      "Analítica avanzada para identificar ineficiencias y optimizar tu operación día a día.",
    featured: false,
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" as const },
  }),
};

export function Features() {
  return (
    <section
      id="features"
      className="relative py-24 px-4"
      style={{ background: "var(--color-design-bg)" }}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <span
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: "var(--color-design-cta)" }}
          >
            Funcionalidades
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold mt-3"
            style={{
              color: "var(--color-design-text)",
              fontFamily: "var(--font-lexend)",
            }}
          >
            Todo lo que necesitas en un solo lugar
          </h2>
          <p
            className="mt-4 text-lg max-w-2xl mx-auto"
            style={{ color: "var(--color-design-secondary)" }}
          >
            Una plataforma completa para gestionar cada aspecto de tu cadena de
            suministro.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className={`relative group cursor-pointer transition-all duration-200 ${
                f.featured
                  ? "md:col-span-2 lg:col-span-2"
                  : ""
              }`}
            >
              <div
                className="relative h-full rounded-2xl p-6 sm:p-8 transition-all duration-200 hover:-translate-y-1"
                style={{
                  background: "var(--color-design-card)",
                  border: "1px solid var(--color-design-card-border)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{
                    background: "rgba(37, 99, 235, 0.15)",
                    color: "var(--color-design-primary)",
                  }}
                >
                  <f.icon size={24} />
                </div>
                <h3
                  className="text-xl font-semibold mb-3"
                  style={{
                    color: "var(--color-design-text)",
                    fontFamily: "var(--font-lexend)",
                  }}
                >
                  {f.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--color-design-secondary)" }}
                >
                  {f.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
