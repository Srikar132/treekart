# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server on port 3000
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test framework is configured.

## Architecture Overview

**TreeKart** is a mango tree rental + product e-commerce platform built on Next.js 16 (App Router), Supabase, and Tailwind CSS v4.

### Route Groups

| Group | Path prefix | Purpose |
|---|---|---|
| `(storefront)` | `/`, `/store`, `/trees`, `/rent`, `/blog`, `/account`, `/auth` | Public customer-facing |
| `(admin)` | `/admin` | Protected admin dashboard |
| `(checkout)` | `/checkout` | Cart and rental checkout |
| `(farmer)` | `/farmer` | Farmer portal (in progress) |

### Data & Auth (Supabase)

Supabase client lives in `utils/supabase/server.ts`. All server-side code uses the helper in `lib/auth.ts`:

- `getUser()` — merges `auth.users` + `profiles` table into one `AuthUser` object
- `requireUser()` — redirects to `/auth/signin` if not logged in
- `requireAdmin()` — redirects to `/admin/auth/login` if not admin
- `requireFarmer()` — redirects to `/` if not farmer/admin

Roles come from `profiles.role` (`user | farmer | admin`), not from JWT claims.

### Server Actions

All mutations live in `actions/` as Next.js Server Actions (`"use server"`). Return `ActionState<T>` — a discriminated union `{ success: true; data: T } | { success: false; error: string }`. Public read-only fetches are in `actions/public.actions.ts`.

- `auth.actions.ts` — sign up, sign in, password reset, logout
- `user.actions.ts` — profile updates
- `admin.actions.ts` — admin operations
- `tree.actions.ts` — tree CRUD
- `products.actions.ts` — product CRUD
- `order.actions.ts` — order creation and status
- `blog.actions.ts` — blog CRUD
- `contact.actions.ts` — contact form
- `public.actions.ts` — unauthenticated data fetching

### Key Domain Types (from `types/database.types.ts`)

```
trees          → plan_type: basic | standard | max; tree_status: available | rented | inactive
rentals        → rental_status: active | completed | cancelled
orders         → order_status: pending | confirmed | shipped | delivered
mango_products → product_status: available | out_of_stock | pre_order
profiles       → user_role: user | farmer | admin
```

Use the `Tables<'tablename'>` and `Enums<'enumname'>` helpers for raw Supabase types. The bottom of `types/database.types.ts` also exports named convenience types — prefer these in component props and action signatures:

```ts
// Row types
MangoProduct, Blog, Order, Profile, Rental, Tree, TreePlan, Farmer, HeroSlide, Testimonial

// Insert / Update types
MangoProductInsert, OrderInsert, RentalInsert, TreeInsert, ...

// Enum types
ProductStatus, OrderStatus, RentalStatus, TreeStatus, UserRole, TreeSource
```

`types/checkout.ts` holds `DeliveryAddress` and checkout-specific interfaces.

### Form Validation

Forms use `react-hook-form` + `zod`. Shared Zod schemas live in `lib/validations.ts` (auth forms, tree/product schemas). Checkout schemas are in `lib/checkout-validation.ts`. Use `@hookform/resolvers/zod` to wire them together.

### Styling

Tailwind v4 with OKLCH design tokens. Brand palette:

| Token | Color |
|---|---|
| `mango` | `oklch(0.78 0.18 85)` — mango yellow |
| `grove` | `oklch(0.42 0.14 145)` — deep green (maps to `primary`) |
| `grove-light` / `secondary` | `oklch(0.94 0.07 145)` — green mist |
| `leaf` | `oklch(0.62 0.16 145)` — mid green |

Use `bg-mango`, `text-grove`, etc. Never hardcode hex/rgb. Never edit `globals.css`.

### UI Components

shadcn/ui primitives are in `components/ui/`. **shadcn in this project is built on Base UI** — use the `render` prop pattern, not `asChild`.

Always use the `AnimatedButton` component (`components/shared/animated-button.tsx`) for all storefront CTAs. Check `components/shared/` and `components/storefront/` for existing components before building new ones.

### State Management

- **Server state** — React Query (`@tanstack/react-query`) via `components/providers/query-provider.tsx`
- **Client state** — Zustand stores in `store/`, all persisted to `localStorage`
- **URL state** — nuqs for search params (pagination, filters)

**Zustand stores:**

| File | Storage key | Purpose |
|---|---|---|
| `store/use-mango-cart.ts` | `treekart-mango-cart` | Product cart; `totalPrice()`, `deliveryFee()` (free above ₹999) |
| `store/use-rental-store.ts` | `treekart-rental-selection` | Single selected tree plan for rental |
| `store/use-delivery-address.ts` | `treekart-delivery-address` | Checkout address with deep-merge updates |
| `store/use-login-prompt.ts` | — (no persist) | Controls login modal visibility |

All persisted stores include a `_hasHydrated` guard — check it before reading store values in components to avoid SSR/CSR mismatch.

### Image Uploads

Images go through Cloudinary via `lib/cloudinary.ts`. Allowed remote hostnames in `next.config.ts`: `images.unsplash.com`, `res.cloudinary.com`, `img.youtube.com`.

### Payments

Razorpay integration is in `hooks/use-razorpay.ts`. The hook polls for the Razorpay script every 500 ms (15 s timeout). Orders are created server-side; signature verification happens via webhook at `app/(api)/webhooks/razorpay/`.

### Email

Transactional email uses **Resend** via `lib/email.ts`. Not SendGrid.

### Rate Limiting

`lib/arcjet.ts` configures Arcjet for rate limiting on sensitive routes (auth, contact form).

### Admin Data Tables

Admin list pages use `components/admin/data-table.tsx` (TanStack Table). Each entity has its own columns file under `components/admin/<entity>/columns.tsx`.

### Constants

`constants/` holds lookup tables used across the app (Indian states for address forms, plan metadata, etc.).

### Database Migrations

Supabase migrations live in `supabase/`. Run `supabase db push` to apply locally; do not hand-edit generated types — regenerate with `supabase gen types typescript`.

### Next.js 16 Notes

This project uses Next.js 16.2.4 — APIs may differ from training data. Before writing any Next.js-specific code, check `node_modules/next/dist/docs/` for the actual API surface. Heed deprecation notices.
