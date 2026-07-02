## Context

`/terms` and `/privacy` live in the `(storefront)` route group as static Server Components — no data fetching, no Supabase, no Server Actions. `terms/page.tsx` renders four summary cards + a generic "Agreement Overview" and a stale "Effective Date: May 11, 2024". `privacy/page.tsx` already renders the 11 policy sections from a local `sections[]` array and ends with an `AnimatedButton` contact CTA to `/contact`, but shows no explicit contact details. Contact facts already exist in `constants/settings.ts` (`EMAIL`, `PHONE`, `ADDRESS`, `WEB`) and are consumed by `components/storefront/footer.tsx`.

## Goals / Non-Goals

**Goals:**
- Publish the full 15-clause Terms & Conditions on `/terms`.
- Add a contact section to `/privacy` (§12) and bring both dates to May 21, 2026.
- Keep the existing card/section layout, tokens, icons, and `AnimatedButton`.
- Source contact details from `constants/settings.ts`, not hardcoded strings.

**Non-Goals:**
- No CMS/DB-backed legal content; copy stays in the page files (data arrays).
- No terms-acceptance tracking, versioning, i18n, or layout redesign.
- No changes to routing, Supabase schema/RLS, auth, or Server Actions.

## Decisions

- **Data-driven arrays over inline JSX.** Model the Terms clauses as a typed `sections[]` array (id, title, icon, and either `body` or `items[]`, plus optional `subSections[]` for clause 3), mirroring the pattern already in `privacy/page.tsx`. This keeps the 15 clauses maintainable and lets both pages share one visual language. Alternative — hand-writing 15 JSX blocks — was rejected as repetitive and error-prone.
- **Reuse the privacy page's section-card renderer.** The Terms rewrite adopts the same numbered-card layout privacy already uses, so the two legal pages read as one system. The current four-icon summary is dropped in favor of the complete clause list.
- **Contact from `settings`.** Import `settings` from `constants/settings.ts` and render `settings.EMAIL` (as a `mailto:`), `settings.PHONE`, and `settings.ADDRESS` in the Terms §15 and Privacy §12 contact blocks. Rejected hardcoding because the supplied copy truncated the contact details and the footer already treats `settings` as the single source of truth.
- **Server Components, no `"use client"`.** Both pages remain static RSC; the change is presentational. `AnimatedButton` (already used on privacy) stays for the contact CTA.

## Risks / Trade-offs

- **Legal-text fidelity** → The rendered clauses must match the supplied copy exactly; paraphrasing legal terms is a correctness risk. Mitigation: transcribe verbatim, verify clause-by-clause against the source during implementation.
- **Static prerender staleness** → These pages are prerendered; a later `settings.ts` change requires a rebuild to appear. Acceptable — legal/contact data changes rarely, and this already matches how the footer behaves.
- **Icon selection for 15 clauses** → `lucide-react` must supply a sensible icon per clause. Low risk; fall back to a neutral document icon where no obvious match exists.

## Migration Plan

Pure content/presentation edit to two files. Deploy with the normal build. Rollback = revert the two page files; no data or schema migration involved.
