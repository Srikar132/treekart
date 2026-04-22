<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->


# Points to Remember
1. Always use **shadcn/ui** components for UI elements.
2. Follow a strict **component-based architecture**.
3. Use existing **globals.css** styles and design tokens (OKLCH); never hardcode hex/rgb colors or modify `globals.css` directly.
4. Shadcn components are built with **Base UI**, so use the `render` prop pattern instead of `asChild`.
5. Refer to the **Oranda UI patterns** for style consistency.
6. Prefer the **Supabase skills** documentation for database and auth tasks.
7. Always check for **existing components** (e.g., `AnimatedButton`, `ProductCard`) before creating new ones.
8. Always use the **`AnimatedButton`** component for storefront call-to-actions (CTAs).
9. use the types written at the bottom of types/database.types.ts file at the time of creating the interface. 