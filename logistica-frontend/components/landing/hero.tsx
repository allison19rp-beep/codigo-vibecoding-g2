"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, Truck, Package, Zap } from "lucide-react";

const headline =
  "Mueve más, gestiona menos. Logística inteligente para empresas que no se detienen.";

const words = headline.split(/(\s+)/);

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.025, delayChildren: 0.2 },
  },
};

const wordVariants = {
  hidden: { y: 60, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

function CTAButton({
  children,
  href,
  variant = "primary",
}: {
  children: React.ReactNode;
  href: string;
  variant?: "primary" | "secondary";
}) {
  return (
    <motion.a
      href={href}
      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer w-full sm:w-auto justify-center"
      style={{
        background:
          variant === "primary" ? "var(--color-design-cta)" : "transparent",
        color:
          variant === "primary"
            ? "white"
            : "var(--color-design-primary)",
        border:
          variant === "secondary"
            ? "2px solid var(--color-design-primary)"
            : "none",
      }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.a>
  );
}

export function Hero() {
  return (
    <section className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden px-4 pt-28 pb-4 lg:pb-8">
      <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center gap-6 lg:gap-8">
        <motion.h1
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-[clamp(1.75rem,5vw,4.5rem)] font-bold leading-tight max-w-4xl"
          style={{
            fontFamily: "var(--font-lexend)",
            color: "var(--color-design-text)",
          }}
        >
          {words.map((word, i) =>
            word === " " ? (
              <span key={i}>&nbsp;</span>
            ) : (
              <motion.span
                key={i}
                variants={wordVariants}
                className="inline-block"
              >
                {word}
              </motion.span>
            )
          )}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-base sm:text-lg md:text-xl max-w-2xl"
          style={{ color: "var(--color-design-secondary)" }}
        >
          Optimiza tus operaciones logísticas con tracking en tiempo real,
          rutas inteligentes y dashboards que transforman datos en decisiones.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto"
        >
          <CTAButton href="#cta" variant="primary">
            Solicitar demo gratuita <ArrowRight size={18} />
          </CTAButton>
          <CTAButton href="#how-it-works" variant="secondary">
            <Play size={18} /> Ver cómo funciona
          </CTAButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm"
          style={{ color: "var(--color-design-secondary)" }}
        >
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block flex-shrink-0" />
            +500 empresas confían
          </span>
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block flex-shrink-0" />
            4.9/5 en G2
          </span>
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block flex-shrink-0" />
            99.9% uptime
          </span>
        </motion.div>
      </div>

      <div className="hidden lg:block absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="relative w-96 h-56 glass-strong rounded-2xl overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background:
                "radial-gradient(circle at 30% 40%, rgba(37,99,235,0.3), transparent 70%)",
            }}
          />
          <div className="relative z-10 p-5 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span
                className="text-xs font-medium"
                style={{ color: "var(--color-design-text)" }}
              >
                Envíos activos
              </span>
            </div>
            <span
              className="text-2xl font-bold"
              style={{
                color: "var(--color-design-primary)",
                fontFamily: "var(--font-lexend)",
              }}
            >
              1,284
            </span>
            <div
              className="flex items-center gap-1 text-xs"
              style={{ color: "var(--color-design-secondary)" }}
            >
              <span className="text-emerald-400">+12.5%</span> vs mes anterior
            </div>
            <div className="flex -space-x-2 mt-1">
              {["#2563EB", "#3B82F6", "#F97316", "#8B5CF6"].map((c, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-[var(--color-design-card)] flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: c }}
                >
                  {["JD", "MR", "AL", "CP"][i]}
                </div>
              ))}
              <div
                className="w-7 h-7 rounded-full border-2 border-[var(--color-design-card)] flex items-center justify-center text-[10px] font-bold"
                style={{
                  background: "var(--color-design-bg)",
                  color: "var(--color-design-text)",
                }}
              >
                +12
              </div>
            </div>
          </div>
          <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_60px_rgba(37,99,235,0.15)] pointer-events-none" />
        </div>

        <div className="absolute -top-3 -right-3 w-12 h-12 rounded-xl glass-strong flex items-center justify-center floating-icon-1"
          style={{ color: "var(--color-design-primary)" }}
        >
          <Truck size={20} />
        </div>
        <div className="absolute -bottom-2 -left-4 w-10 h-10 rounded-xl glass-strong flex items-center justify-center floating-icon-2"
          style={{ color: "var(--color-design-cta)" }}
        >
          <Package size={18} />
        </div>
        <div className="absolute top-6 -left-8 w-9 h-9 rounded-xl glass-strong flex items-center justify-center floating-icon-3"
          style={{ color: "var(--color-design-secondary)" }}
        >
          <Zap size={16} />
        </div>

        <div className="absolute -bottom-1 -right-6 px-3 py-1 rounded-full glass-strong flex items-center justify-center text-[10px] font-medium whitespace-nowrap floating-icon-4"
          style={{ color: "var(--color-design-text)" }}
        >
          En vivo · 12 rutas activas
        </div>
      </div>
    </section>
  );
}
