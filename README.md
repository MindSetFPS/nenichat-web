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

## 🏭 Vertical Expansion Strategy

Same core platform, per-industry domain templates. The shared infrastructure (auth, WhatsApp containers, contacts, chat, payments, subscriptions, analytics, NL→SQL) applies to all verticals — only the domain model and UI templates change per industry.

### Product-based (sell things)

| Industry | Features Needed |
|----------|-----------------|
| **Restaurants / food** | Menu categories, modifiers (sizes/extras), delivery area, prep time |
| **Bakery / homemade food** | Daily specials, pre-order cutoff, pickup/delivery toggle |
| **Florists** | Image-heavy catalog, delivery scheduling |
| **Clothing / boutiques** | Sizes, colors, SKU variants |
| **Electronics / phone repair** | Device selector, repair status tracking, parts inventory |
| **Pharmacies** | Prescription upload, delivery radius, stock alerts |
| **Pet supplies** | Subscription reordering, weight-based pricing |
| **Liquor stores** | Age verification, fast delivery window |
| **Grocery / abarrotes** | Category browsing, unit pricing (kg/pieza), delivery min order |

### Time-based (sell appointments) — Calendly competitor

| Industry | Features Needed |
|----------|-----------------|
| **Barbers / salons** | Stylist selection, service menu with duration, waitlist |
| **Medical / dental** | Specialty selector, forms pre-fill, insurance handling |
| **Veterinarians** | Pet profiles (breed/age/weight), vaccination reminders |
| **Massage / spa** | Room/ambiance selection, add-ons, gift certificates |
| **Tattoo artists** | Portfolio gallery, design deposit, flash sale flash bookings |
| **Personal trainers** | Session packages (10x), recurring weekly slots, progress notes |
| **Photographers** | Portfolio, location-based booking, session type (event/portrait) |
| **Tutors / teachers** | Subject/level, recurring weekly slots, material upload |
| **Consultants / coaches** | Discovery call → paid session flow, package upsell |

### Home services (hybrid — time + materials)

| Industry | Features Needed |
|----------|-----------------|
| **Mechanics** | Multi-step flow (diagnosis → quote → approve), parts catalog, labor pricing |
| **Plumbers / electricians** | Travel fee, emergency pricing, before/after photos, material costs |
| **Cleaning services** | Home size × frequency pricing, recurring schedules, deep clean add-on |
| **AC / repair services** | Brand/model selector, diagnostic fee, warranty tracking |
| **Delivery / courier** | Package dimensions/weight, route tracking, proof of delivery photo |
| **Pest control** | Treatment type, property size, recurring plan |

### Professional services

| Industry | Features Needed |
|----------|-----------------|
| **Lawyers** | Confidential document upload, billable hours, case management |
| **Accountants** | Fiscal year scheduling, file upload with labels, tax deadline reminders |
| **Therapists / psychologists** | Recurring weekly sessions, cancellation policy, intake forms |
| **Architects** | Project phases, revision tracking, milestone billing |

### Rental / subscription

| Industry | Features Needed |
|----------|-----------------|
| **Car rental** | Deposit, mileage tiers, insurance options, damage reporting |
| **Equipment rental** | Daily/weekly/monthly pricing, damage deposit, availability calendar |
| **Coworking** | Room/desk selection, day pass vs membership, meeting room booking |
| **Meal plans** | Menu rotation, delivery day selection, pause/resume, allergy notes |
| **Gym / fitness** | Freeze/unfreeze, referral codes, class signup, guest passes |

### Platform advantage
Once a business adopts Nenichat, switching costs are high because their customers interact through it. A single restaurant+catering business or a salon+product shop can use the same platform for both verticals. The NL→SQL analytics (P2) applies universally across all verticals.

---

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
