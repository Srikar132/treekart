## ADDED Requirements

### Requirement: New users complete their profile in a dialog after first verification
After a new user's first successful OTP verification, the system SHALL open a profile dialog collecting **full name** and **email**, and persist both to `profiles`. The dialog MUST NOT appear for returning users whose profile is already complete.

#### Scenario: New user sees the profile dialog
- **WHEN** a newly created user finishes OTP verification and has no `full_name`
- **THEN** the profile dialog opens requesting name and email

#### Scenario: Returning user never sees the dialog
- **WHEN** an existing user with a saved `full_name` verifies their OTP
- **THEN** no dialog appears and they proceed to their destination

#### Scenario: Submitted details are stored
- **WHEN** the user submits a valid name and email
- **THEN** `profiles.full_name` and `profiles.email` are updated for that user
- **AND** the user is redirected to their original destination

### Requirement: The profile dialog is responsive
The dialog SHALL present as a sheet that slides down from the **top** of the viewport on mobile, and as a **centered modal** on desktop. Both presentations MUST share the same fields, validation, and submit behaviour.

#### Scenario: Mobile presentation
- **WHEN** the profile dialog opens on a small viewport
- **THEN** it animates in from the top edge of the screen

#### Scenario: Desktop presentation
- **WHEN** the profile dialog opens on a large viewport
- **THEN** it appears centered in the viewport

### Requirement: Profile fields are validated
The dialog SHALL require a non-empty full name and a syntactically valid email address before submission is accepted. Invalid input MUST show an inline error and MUST NOT be persisted.

#### Scenario: Empty name is rejected
- **WHEN** the user submits with an empty name
- **THEN** an inline validation error is shown and nothing is saved

#### Scenario: Malformed email is rejected
- **WHEN** the user submits an email that fails validation
- **THEN** an inline validation error is shown and nothing is saved

### Requirement: Incomplete profiles cannot reach protected routes
Until a user's profile is complete, the proxy SHALL prevent access to protected routes and route the user back to profile completion. The dialog MUST NOT be dismissible into a protected area.

#### Scenario: Incomplete profile is gated
- **WHEN** an authenticated user without a `full_name` requests `/account` or `/checkout`
- **THEN** the proxy redirects them to complete their profile first

### Requirement: The dialog is accessible and consistent with the design system
The dialog SHALL use the project's shadcn/Base UI primitives (`render` prop, not `asChild`), OKLCH design tokens, and `AnimatedButton` for its primary action. It MUST trap focus, be dismissable by keyboard where permitted, and expose accessible labels.

#### Scenario: Uses existing primitives and tokens
- **WHEN** the dialog renders
- **THEN** it uses existing UI primitives and brand tokens rather than hardcoded colors or bespoke components
