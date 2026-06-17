"use client";

const logos = [
  "TechCorp", "LogiSys", "TransGlobal", "QuickShip",
  "MegaLog", "ShipNow", "CargoFast", "DistriMax",
  "TechCorp", "LogiSys", "TransGlobal", "QuickShip",
  "MegaLog", "ShipNow", "CargoFast", "DistriMax",
];

export function LogosBar() {
  return (
    <section className="relative py-12 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 mb-6 text-center">
        <p
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: "var(--color-design-secondary)" }}
        >
          Empresas que confían en nosotros
        </p>
      </div>
      <div className="relative">
        <div className="flex animate-marquee gap-16 w-max">
          {logos.map((name, i) => (
            <div
              key={i}
              className="flex items-center gap-3 select-none"
              style={{ opacity: 0.3 }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                style={{ background: "var(--color-design-primary)" }}
              >
                {name.charAt(0)}
              </div>
              <span
                className="text-sm font-semibold whitespace-nowrap"
                style={{ color: "var(--color-design-text)" }}
              >
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
