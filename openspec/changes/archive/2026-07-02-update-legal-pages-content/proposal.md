## Why

The `/terms` and `/privacy` storefront pages do not reflect TreeKart's finalized legal text. `/terms` currently shows only four summary cards plus a generic "Agreement Overview" and a stale effective date (May 11, 2024) — it is missing the full 15-clause Terms & Conditions (tree-leasing terms, refund/cancellation policy, liability limits, governing law, contact). `/privacy` already carries the 11 policy sections but has no rendered contact block for privacy requests. The finalized copy (Last Updated: May 21, 2026) is now available and must be published so the site's legal commitments are accurate and enforceable.

## What Changes

- Rewrite `app/(storefront)/terms/page.tsx` to render all 15 Terms & Conditions clauses (Acceptance, Services, Mango Tree Leasing incl. ownership/natural-conditions/guaranteed-quantity, Orders & Payments, Delivery, Farm Visits & Stay, Refund & Cancellation, Organic Disclaimer, IP, User Responsibilities, Limitation of Liability, Third-Party Services, Changes to Terms, Governing Law, Contact).
- Update the Terms effective/updated date to **May 21, 2026** (from the stale May 11, 2024).
- Add a **Contact** section to `app/(storefront)/privacy/page.tsx` (§12) surfacing real contact details.
- Source all contact details (email, phone, address) from `constants/settings.ts` (`settings.EMAIL`, `settings.PHONE`, `settings.ADDRESS`) rather than hardcoding — keeps legal pages in sync with the footer.
- Reuse the existing card/section layout, OKLCH tokens, `lucide-react` icons, and `AnimatedButton` already established on these pages; no new visual system.

## Capabilities

### New Capabilities
- `legal-pages-content`: Defines what the public Terms of Service and Privacy Policy pages MUST present — the full clause set, the last-updated date, and contact details sourced from shared settings.

### Modified Capabilities
<!-- None — no existing spec governs these pages. -->

## Impact

- **Code**: `app/(storefront)/terms/page.tsx` (major rewrite), `app/(storefront)/privacy/page.tsx` (add contact section).
- **Shared data**: reads `constants/settings.ts`.
- **No** changes to routing, data model, server actions, or auth. Content/presentation only.
- **Non-goals**: no CMS/database-backed legal content, no versioning/acceptance-tracking of terms, no i18n, no redesign of the page layout, no new legal clauses beyond the supplied copy.
