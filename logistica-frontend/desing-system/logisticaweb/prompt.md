```
Lee el archivo design-system/logisticaweb/MASTER.md y úsalo como fuente de verdad 
para colores y tipografía.
Luego construye una landing page completa con estas especificaciones:

## Tech Stack
- Next.js 16 con App Router
- TypeScript strict mode
- Tailwind CSS v4 (usando @import "tailwindcss" y CSS custom properties)
- Framer Motion v12 (latest version)
- next/font para tipografía

## Efectos Visuales

- Glassmorphism: backdrop-blur-xl, rgba(255,255,255,0.04), border rgba(255,255,255,0.08)
- Background: radial gradients + noise texture SVG + grid lines sutiles
- Canvas de partículas: 80-120 puntos flotantes conectados por líneas, responden al mouse
- Mesh gradients animados en el background

## Secciones

1. **Nav** — glass sticky, aparece al scroll 50px, logo + links + CTA
2. **Hero** — 100dvh, headline con stagger por palabra (y:60→0, blur:8px→0), 
   subheadline, 2 CTAs, social proof row, elemento visual glass con inner glow, 
   floating badges animados (y loop -8 a 8)
3. **Logos bar** — marquee infinito, logos al 30% opacity
4. **Features** — grid 3 columnas, glass cards con icon + título + descripción, 
   stagger on scroll, una card featured que ocupa 2 columnas
5. **How it works** — steps numerados alternados izq/der, animación on scroll
6. **Testimonials** — masonry 3 columnas, glass cards, tilt hover (rotateX/Y 5deg)
7. **CTA final** — glass panel full width, rotating gradient border, email input
8. **Footer** — 4 columnas, social icons con glow hover

## Animaciones (Framer Motion)

- Page load: stagger words con opacity + y + filter blur
- Scroll reveal: whileInView once, margin -100px
- Floating: animate y [0,-12,0] loop 4s
- Magnetic button: cursor tracking con useMotionValue + useSpring
- Card tilt: rotateX/Y en hover max 5deg

## Regla de Override

Los colores y tipografía de design-system/logisticaweb/MASTER.md tienen precedencia.
Los efectos (glassmorphism, particles, framer motion) siempre aplican.
## Producto

- Nombre: Logistica Web
- Tagline: "Mueve más, gestiona menos. Logística inteligente para empresas que no se detienen."
- Usuario objetivo: Gerentes de operaciones y supply chain de medianas y grandes empresas en Latinoamérica

- Features clave:
  1. Tracking en tiempo real de flotas y envíos con mapa interactivo
  2. Dashboard de operaciones con KPIs, alertas y reportes automáticos
  3. Gestión de rutas optimizadas con IA para reducir costos de combustible
  4. Integración con ERP, SAP y sistemas de facturación electrónica
  5. App móvil para conductores con firma digital y evidencia fotográfica

- CTA: Solicitar demo gratuita
```