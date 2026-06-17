"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Conecta tu operación",
    description:
      "Integra tu flota, almacenes y sistemas existentes en minutos. Conectamos con ERP, SAP y APIs abiertas.",
  },
  {
    number: "02",
    title: "Visualiza en tiempo real",
    description:
      "Accede a mapas interactivos, dashboards de KPIs y alertas automáticas desde cualquier dispositivo.",
  },
  {
    number: "03",
    title: "Optimiza con IA",
    description:
      "Nuestros algoritmos analizan rutas, costos y eficiencia para recomendarte la mejor decisión.",
  },
  {
    number: "04",
    title: "Escala sin límites",
    description:
      "A medida que creces, la plataforma se adapta. Desde 10 envíos hasta 10,000 por día.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-20"
        >
          <span
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: "var(--color-design-cta)" }}
          >
            Proceso
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold mt-3"
            style={{
              color: "var(--color-design-text)",
              fontFamily: "var(--font-lexend)",
            }}
          >
            Comienza en 4 pasos
          </h2>
          <p
            className="mt-4 text-lg max-w-xl mx-auto"
            style={{ color: "var(--color-design-secondary)" }}
          >
            De la integración a la optimización, en cuestión de días.
          </p>
        </motion.div>

        <div className="relative">
          <div
            className="absolute left-[19px] sm:left-1/2 sm:-translate-x-px top-0 bottom-0 w-0.5 hidden sm:block"
            style={{ background: "var(--color-design-primary)" }}
          />

          {steps.map((step, i) => {
            const isLeft = i % 2 === 0;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative flex items-start gap-6 sm:gap-0 mb-16 last:mb-0 ${
                  isLeft ? "sm:flex-row" : "sm:flex-row-reverse"
                }`}
              >
                <div className="hidden sm:flex sm:w-1/2" />

                <div
                  className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: "var(--color-design-primary)" }}
                >
                  <span className="sm:hidden">{step.number}</span>
                  <span className="hidden sm:inline">
                    {step.number}
                  </span>
                </div>

                <div
                  className={`flex-1 ${
                    isLeft ? "sm:pr-12 sm:text-right" : "sm:pl-12"
                  }`}
                >
                  <span
                    className="hidden sm:inline text-5xl font-bold"
                    style={{
                      color: "var(--color-design-primary)",
                      opacity: 0.08,
                      fontFamily: "var(--font-lexend)",
                    }}
                  >
                    {step.number}
                  </span>
                  <h3
                    className="text-xl font-semibold mt-1 sm:mt-0"
                    style={{
                      color: "var(--color-design-text)",
                      fontFamily: "var(--font-lexend)",
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="mt-2 text-sm leading-relaxed max-w-md"
                    style={{ color: "var(--color-design-secondary)" }}
                  >
                    {step.description}
                  </p>
                </div>

                <div className="hidden sm:flex sm:w-1/2" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
