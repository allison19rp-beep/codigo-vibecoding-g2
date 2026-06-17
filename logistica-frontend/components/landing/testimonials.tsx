"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    quote:
      "Redujimos costos de combustible en un 22% durante el primer trimestre. Las rutas optimizadas con IA transformaron nuestra operación.",
    author: "Carlos Mendoza",
    role: "Director de Operaciones",
    company: "TransGlobal Logistics",
    avatar: "CM",
    color: "#2563EB",
    height: "h-[200px]",
  },
  {
    quote:
      "El dashboard nos da visibilidad total de punta a punta. Antes era imposible saber dónde estaba cada envío sin llamar al conductor.",
    author: "Ana Rivas",
    role: "Supply Chain Manager",
    company: "QuickShip",
    avatar: "AR",
    color: "#F97316",
    height: "h-[240px]",
  },
  {
    quote:
      "La integración con SAP fue increíblemente fluida. En dos semanas estábamos operando con datos en tiempo real.",
    author: "Roberto Vega",
    role: "CTO",
    company: "DistriMax",
    avatar: "RV",
    color: "#8B5CF6",
    height: "h-[220px]",
  },
  {
    quote:
      "La app para conductores nos eliminó por completo el papeleo. Las firmas digitales y fotos de evidencia son un game changer.",
    author: "Laura Castillo",
    role: "Gerente de Flota",
    company: "CargoFast",
    avatar: "LC",
    color: "#3B82F6",
    height: "h-[260px]",
  },
  {
    quote:
      "Pasamos de 3 sistemas distintos a una sola plataforma. El ahorro en licencias solo ya justifica la inversión.",
    author: "Miguel Ángel Paz",
    role: "CEO",
    company: "MegaLog",
    avatar: "MP",
    color: "#10B981",
    height: "h-[200px]",
  },
];

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="relative py-24 px-4 overflow-hidden"
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
            Testimonios
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold mt-3"
            style={{
              color: "var(--color-design-text)",
              fontFamily: "var(--font-lexend)",
            }}
          >
            Lo que dicen nuestros clientes
          </h2>
          <p
            className="mt-4 text-lg max-w-xl mx-auto"
            style={{ color: "var(--color-design-secondary)" }}
          >
            Empresas de toda Latinoamérica confían en Logistica Web.
          </p>
        </motion.div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="break-inside-avoid"
            >
              <TiltCard testimonial={t} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TiltCard({ testimonial: t }: { testimonial: (typeof testimonials)[0] }) {
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }

  function handleMouseLeave(e: React.MouseEvent<HTMLDivElement>) {
    e.currentTarget.style.transform =
      "perspective(1000px) rotateX(0deg) rotateY(0deg)";
  }

  return (
    <div
      className="relative rounded-2xl p-6 transition-all duration-200 cursor-pointer"
      style={{
        background: "var(--color-design-card)",
        border: "1px solid var(--color-design-card-border)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            className="w-4 h-4"
            fill="#F97316"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <p
        className="text-sm leading-relaxed mb-5"
        style={{ color: "var(--color-design-secondary)" }}
      >
        &ldquo;{t.quote}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          style={{ background: t.color }}
        >
          {t.avatar}
        </div>
        <div>
          <p
            className="text-sm font-semibold"
            style={{
              color: "var(--color-design-text)",
              fontFamily: "var(--font-lexend)",
            }}
          >
            {t.author}
          </p>
          <p className="text-xs" style={{ color: "var(--color-design-secondary)" }}>
            {t.role}, {t.company}
          </p>
        </div>
      </div>
    </div>
  );
}
