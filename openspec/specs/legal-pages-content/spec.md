# legal-pages-content Specification

## Purpose

Defines the content and presentation requirements for TreeKart's legal pages (`/terms` and `/privacy`), ensuring they render the complete finalized legal copy, display a current last-updated date, source contact details from shared settings, and reuse the established design system.

## Requirements

### Requirement: Terms page presents the full Terms & Conditions
The `/terms` page (`app/(storefront)/terms/page.tsx`) SHALL render the complete finalized Terms & Conditions covering all fifteen clauses: Acceptance of Terms; Services Offered; Mango Tree Leasing (including Tree Ownership, Natural Farming Conditions, and Guaranteed Quantity); Orders & Payments; Delivery Policy; Farm Visits & Farm Stay; Refund & Cancellation Policy; Organic Farming Disclaimer; Intellectual Property; User Responsibilities; Limitation of Liability; Third-Party Services; Changes to Terms; Governing Law; and Contact Information. No clause from the supplied copy MAY be omitted.

#### Scenario: All clauses are rendered
- **WHEN** a visitor loads `/terms`
- **THEN** every one of the fifteen numbered clauses is present in the page content
- **AND** the Mango Tree Leasing sub-clauses (Tree Ownership, Natural Farming Conditions, Guaranteed Quantity) are each shown

#### Scenario: Governing law is stated
- **WHEN** a visitor reads the Terms page
- **THEN** it states the terms are governed by the laws of India with jurisdiction of courts in Andhra Pradesh

### Requirement: Legal pages show the current last-updated date
Both `/terms` and `/privacy` SHALL display the last-updated date of **May 21, 2026**. The stale "Effective Date: May 11, 2024" on the Terms page MUST be replaced.

#### Scenario: Terms date is current
- **WHEN** a visitor loads `/terms`
- **THEN** the displayed last-updated / effective date reads "May 21, 2026"
- **AND** no date of "May 11, 2024" appears

#### Scenario: Privacy date is current
- **WHEN** a visitor loads `/privacy`
- **THEN** the displayed last-updated date reads "May 21, 2026"

### Requirement: Privacy page presents contact details
The `/privacy` page SHALL include a Contact section (§12) that surfaces how users reach TreeKart with privacy requests, in addition to the existing eleven policy sections.

#### Scenario: Contact section is present
- **WHEN** a visitor loads `/privacy`
- **THEN** a contact section is shown with a reachable email, phone, and address

### Requirement: Contact details are sourced from shared settings
Contact details rendered on the legal pages (email, phone, address) SHALL be read from `constants/settings.ts` (`settings.EMAIL`, `settings.PHONE`, `settings.ADDRESS`) rather than hardcoded, so the legal pages stay consistent with the site footer and other surfaces.

#### Scenario: Settings drive the contact copy
- **WHEN** a value in `constants/settings.ts` (e.g. `EMAIL`) changes
- **THEN** the contact details shown on `/terms` and `/privacy` reflect the updated value without further edits to the page files

### Requirement: Legal pages reuse the existing presentation system
The updated pages SHALL keep the established layout, OKLCH design tokens, `lucide-react` iconography, and `AnimatedButton` CTA already used on these pages, without hardcoded hex/rgb colors and without editing `globals.css`.

#### Scenario: No new visual system introduced
- **WHEN** the pages are rendered after the change
- **THEN** they use existing design tokens and shared components consistent with the prior design
