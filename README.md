# NeniChat

Nenichat es una plataforma que permite a los comercios y restaurantes gestionar sus ventas a través de WhatsApp.
Convierte los mensajes entrantes en datos de ventas.
En la versión gratis, puedes conectar tu whatsapp a Nenichat, y dentro de cada chat puedes crear productos, ordenes manualmente, ver estatus, ver estadisticas de tus clientes y tus ventas.

> **Estado:** Pre-lanzamiento. Construyendo hacia MVP.

---

## 🎯 Launch Priorities

### 🔴 P1 — Core Product (must ship for launch)

| Estado | Item |
|--------|------|
| ⬜ | **WhatsApp container workflow** — Crear, desplegar, escanear QR, conectar dispositivo |
| ⬜ | **Fix critical bugs** — Profile API (datos falsos), contact sync (roto), IPs hardcodeadas |
| ⬜ | **Order management** — CRUD orders, estatus, items |
| ⬜ | **Product catalog** — CRUD productos, inventario |
| ⬜ | **Contact + chat management** — Conversaciones, enviar mensajes |
| ⬜ | **Subscription billing (Stripe)** — Ingresos recurrentes $2,499/mes |
| ⬜ | **Auth + multi-tenancy** — Login, registro, aislamiento de negocios |
| ⬜ | **ToS & Privacy pages** — Requisito legal |
| ⬜ | **Sentry / error monitoring** — Poder debuggear en producción |

### 🟡 P2 — Value Amplifiers (post-launch)

| Estado | Item |
|--------|------|
| ⬜ | **MercadoPago Connect (OAuth)** — Dueños conectan su MP con un click → links de pago |
| ⬜ | **Payment auto-detection webhook** — Cliente paga → orden se actualiza sola |
| ⬜ | **Send payment link via WhatsApp** — Un tap desde la orden → link en el chat |
| ⬜ | **Chat with your business (NL→SQL analytics)** — Pregunta en lenguaje natural: *"¿qué día de la semana es más rentable?"*, *"¿cuál es mi producto más vendido?"*, *"¿qué productos tienen menor ROI?"* |
| ⬜ | **Profitability dashboard** — Ingresos vs gastos, márgenes, desglose diario |
| ⬜ | **Campaign management** — Mensajes masivos a audiencias |
| ⬜ | **Expense tracking** — Registrar y categorizar gastos |
| ⬜ | **Paywalled Excel exports** — Exportar orders, productos, gastos a Excel (solo suscriptores) |
| ⬜ | **QR polish** — Countdown visual, botón reintentar, URLs firmadas |
| ⬜ | **AI chat suggestions** — Sugerencias de respuesta vía Ollama |

### 🟢 P3 — Nice to Have

| Estado | Item |
|--------|------|
| ⬜ | **Neni Flow auto-responder** — AI autónomo. Mantener "próximamente" |
| ⬜ | **Admin panel** — Gestionar usuarios/negocios (Stripe + Supabase dashboard por ahora) |
| ⬜ | **Email notifications** — WhatsApp es el canal por ahora |
| ⬜ | **Onboarding wizard** — Setup guiado |
| ⬜ | **Password reset** — Soporte manual para early adopters |
| ⬜ | **Data export (CSV)** |
| ⬜ | **Multi-language (EN)** — Mercado MX es Spanish-only |
| ⬜ | **Performance tuning** — Cuando el tráfico lo demande |
| ⬜ | **UI polish / animations** — Funcional > bonito para MVP |

---

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build (OpenNext Cloudflare) |
| `npm run lint` | ESLint |
| `npm run test` | Jest |
| `npm run start` | Start production server |
| `npm run deploy` | Build + deploy to Cloudflare Workers |
| `npm run preview` | Preview Cloudflare build locally |
| `npm run cf-typegen` | Generate Cloudflare env types |
