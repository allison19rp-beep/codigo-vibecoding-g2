"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section id="cta" className="relative py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="relative rounded-3xl overflow-hidden p-8 sm:p-12 lg:p-16 text-center"
          style={{
            background: "var(--color-design-card)",
            border: "1px solid var(--color-design-card-border)",
            backdropFilter: "blur(32px)",
            WebkitBackdropFilter: "blur(32px)",
          }}
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                "radial-gradient(circle at 30% 50%, rgba(37,99,235,0.15), transparent 60%), radial-gradient(circle at 70% 50%, rgba(249,115,22,0.1), transparent 60%)",
            }}
          />

          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background:
                "conic-gradient(from 0deg at 50% 50%, transparent, rgba(37,99,235,0.08), transparent, rgba(249,115,22,0.08), transparent)",
              backgroundSize: "200% 200%",
              animation: "gradient-rotate 6s linear infinite",
            }}
          />

          <div className="relative z-10">
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5"
              style={{
                color: "var(--color-design-text)",
                fontFamily: "var(--font-lexend)",
              }}
            >
              ¿Listo para transformar tu logística?
            </h2>
            <p
              className="text-lg mb-8 max-w-lg mx-auto"
              style={{ color: "var(--color-design-secondary)" }}
            >
              Descubre cómo Logistica Web puede optimizar tus operaciones.
              Agenda una demo personalizada sin compromiso.
            </p>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto"
            >
              <div className="relative flex-1 w-full">
                <input
                  type="email"
                  placeholder="tu@empresa.com"
                  required
                  className="w-full px-5 py-3.5 rounded-xl text-sm transition-all duration-200"
                  style={{
                    background: "var(--color-input-bg)",
                    border: "1px solid var(--color-input-border)",
                    color: "var(--color-design-text)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--color-design-primary)";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(37,99,235,0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--color-input-border)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 cursor-pointer whitespace-nowrap hover:opacity-90 hover:-translate-y-0.5 flex-shrink-0"
                style={{ background: "var(--color-design-cta)" }}
              >
                Solicitar demo <ArrowRight size={18} />
              </button>
            </form>

            <p
              className="mt-4 text-xs"
              style={{ color: "var(--color-design-secondary)" }}
            >
              Sin compromiso · Demo personalizada · Soporte incluido
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
