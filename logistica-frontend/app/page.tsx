"use client";

import { useState, useEffect } from "react";
import { ParticlesCanvas } from "@/components/landing/particles-canvas";
import { Nav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { LogosBar } from "@/components/landing/logos-bar";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Testimonials } from "@/components/landing/testimonials";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
    }
  }, [dark]);

  function toggleTheme() {
    setDark((d) => !d);
  }

  return (
    <main
      className="flex-1"
      style={{
        fontFamily: "var(--font-body)",
        background: "var(--color-design-bg)",
      }}
    >
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-40 animate-mesh"
            style={{
              background:
                "radial-gradient(circle, rgba(37,99,235,0.25) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-35 animate-mesh-delayed"
            style={{
              background:
                "radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute top-[40%] right-[20%] w-[30%] h-[30%] rounded-full opacity-30 animate-mesh"
            style={{
              background:
                "radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)",
            }}
          />
          <div className="absolute inset-0 grid-overlay" />
          <ParticlesCanvas />
        </div>

        <Nav dark={dark} onToggleTheme={toggleTheme} />
        <div className="relative z-10">
          <Hero />
        </div>
      </div>

      <div className="relative z-10">
        <LogosBar />
      </div>

      <div className="relative z-10">
        <Features />
      </div>

      <div className="relative z-10">
        <HowItWorks />
      </div>

      <div className="relative z-10">
        <Testimonials />
      </div>

      <div className="relative z-10">
        <CTASection />
      </div>

      <div className="relative z-10">
        <Footer />
      </div>
    </main>
  );
}
