## 1. Terms page rewrite (`app/(storefront)/terms/page.tsx`)

- [x] 1.1 Import `settings` from `constants/settings.ts` and pick a `lucide-react` icon per clause.
- [x] 1.2 Replace the four-item `points` array with a typed `sections[]` array holding all 15 clauses (id, title, icon, `body` or `items[]`), including clause 3's sub-sections (Tree Ownership, Natural Farming Conditions, Guaranteed Quantity).
- [x] 1.3 Transcribe the supplied Terms & Conditions copy verbatim into the array (clauses 1–14); do not paraphrase legal text.
- [x] 1.4 Build clause 15 (Contact Information) from `settings.EMAIL` (as `mailto:`), `settings.PHONE`, and `settings.ADDRESS`.
- [x] 1.5 Render the array with the numbered section-card layout matching `privacy/page.tsx` (same tokens, icon treatment, `body`/`items` handling).
- [x] 1.6 Update the footer date to "Last Updated: May 21, 2026"; remove "Effective Date: May 11, 2024".

## 2. Privacy page contact section (`app/(storefront)/privacy/page.tsx`)

- [x] 2.1 Import `settings` from `constants/settings.ts`.
- [x] 2.2 Add a §12 "Contact Us" section rendering `settings.EMAIL` (as `mailto:`), `settings.PHONE`, and `settings.ADDRESS`, keeping the existing `AnimatedButton` CTA to `/contact`.
- [x] 2.3 Confirm the displayed "Last Updated: May 21, 2026" is present (already set) and consistent with the Terms page.

## 3. Verify

- [x] 3.1 `npm run build` (or `npm run lint`) passes with no type/lint errors in either page.
- [x] 3.2 Load `/terms` — confirm all 15 clauses render, clause 3 sub-sections present, governing-law + contact shown, date reads May 21, 2026.
- [x] 3.3 Load `/privacy` — confirm the new contact section renders `settings` values and no layout regression.
- [x] 3.4 Grep both files for hardcoded hex/rgb and stray hardcoded contact strings; confirm none (tokens + `settings` only).
