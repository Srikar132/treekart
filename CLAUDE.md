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

All mutations live in `actions/` as Next.js Server Actions (`"use server"`):

- `auth.actions.ts` — sign up, sign in, password reset, logout
- `user.actions.ts` — profile updates
- `admin.actions.ts` — admin operations
- `tree.actions.ts` — tree CRUD
- `products.actions.ts` — product CRUD
- `order.actions.ts` — order creation and status
- `blog.actions.ts` — blog CRUD
- `contact.actions.ts` — contact form

### Key Domain Types (from `types/database.types.ts`)

```
trees          → plan_type: basic | standard | max; tree_status: available | rented | inactive
rentals        → rental_status: active | completed | cancelled
orders         → order_status: pending | confirmed | shipped | delivered
mango_products → product_status: available | out_of_stock | pre_order
profiles       → user_role: user | farmer | admin
```

Always use the `Tables<'tablename'>` and `Enums<'enumname'>` helpers exported from `types/database.types.ts` rather than writing manual interfaces.

### Styling

Tailwind v4 with OKLCH design tokens. Brand palette:

| Token | Color |
|---|---|
| `mango` | `oklch(0.78 0.18 85)` — mango yellow |
| `grove` | `oklch(0.42 0.14 145)` — deep green (maps to `primary`) |
| `grove-light` / `secondary` | `oklch(0.94 0.07 145)` — green mist |
| `leaf` | `oklch(0.62 0.16 145)` — mid green |

Use `bg-mango`, `text-grove`, etc. Never hardcode hex/rgb. Never edit `globals.css`.

### Image Uploads

Images go through Cloudinary via `lib/cloudinary.ts`. Allowed remote hostnames in `next.config.ts`: `images.unsplash.com`, `res.cloudinary.com`, `img.youtube.com`.

### Payments

Razorpay integration is in `hooks/use-razorpay.ts`. Used in checkout flows.

### State Management

- **Server state** — React Query (`@tanstack/react-query`) via `components/providers/query-provider.tsx`
- **Client state** — Zustand stores
- **URL state** — nuqs for search params

### Admin Data Tables

Admin list pages use `components/admin/data-table.tsx` (TanStack Table). Each entity has its own columns file under `components/admin/<entity>/columns.tsx`.

### Next.js 16 Notes

This project uses Next.js 16.2.4 — APIs may differ from training data. Before writing any Next.js-specific code, check `node_modules/next/dist/docs/` for the actual API surface. Heed deprecation notices.
