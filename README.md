# TreeKart — Rent a Mango Tree

TreeKart is a premium, high-fidelity platform for managing heritage mango tree rentals and fresh harvest delivery. Built with Next.js, Supabase, and Framer Motion.

## 📂 Project Structure

```text
treekart/
├── actions/                # Server Actions (Supabase Logic)
│   ├── admin.actions.ts    # Dashboard & content management
│   ├── order.actions.ts    # Transaction & harvest logic
│   ├── products.actions.ts # Inventory & variants
│   └── tree.actions.ts     # Tree health & rental state
├── app/                    # Next.js App Router
│   ├── (admin)/            # Protected Administrative suite
│   ├── (api)/              # Webhooks & internal endpoints
│   ├── (checkout)/         # Editorial checkout flow
│   ├── (farmer)/           # Orchard concierge portal
│   ├── (storefront)/       # Public cinematic experience
│   └── globals.css         # OKLCH-based design system (Pebble)
├── components/             # Unified Component Library
│   ├── admin/              # Management UI components
│   ├── storefront/         # Cinematic customer-facing UI
│   ├── ui/                 # Shadcn/Base UI foundation
│   ├── shared/             # Reusable animated elements
│   └── providers/          # Context & Query providers
├── lib/                    # Shared Libraries
│   ├── validations.ts      # Zod schemas (Admin/Store)
│   ├── auth.ts             # Supabase Auth helpers
│   └── utils.ts            # Tailwind & CN helpers
├── types/                  # TypeScript Definitions
│   ├── database.types.ts   # Auto-generated Supabase types
│   └── orders.ts           # Order & Transaction interfaces
├── utils/                  # Utility Functions
│   └── supabase/           # Server/Client/Proxy clients
├── public/                 # Static Assets & Branding
├── supabase/               # Migrations & RLS policies
├── README.md               # Project documentation
├── SCHEMA_EXPLANATION.md   # Database architecture guide
├── next.config.ts          # Next.js configuration
├── package.json            # Dependencies & scripts
└── tsconfig.json           # TypeScript configuration
```

## 🚀 Getting Started

1. **Environment Setup**: Copy `.env.example` to `.env.local` and fill in your Supabase credentials.
2. **Install Dependencies**: `npm install`
3. **Run Locally**: `npm run dev`
4. **Database Migration**: Apply migrations from the `/supabase` folder using the Supabase CLI.

## 🎨 Design System
TreeKart uses the **Pebble** design language, characterized by:
- **OKLCH Color Tokens**: For ultra-vibrant and consistent color rendering.
- **Bricolage Grotesque & DM Sans**: For an editorial, premium typographic feel.
- **Cinematic Animations**: Powered by Framer Motion for a fluid user journey.
