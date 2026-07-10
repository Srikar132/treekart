## ADDED Requirements

### Requirement: New users complete their profile in a dialog after first verification
After a new user's first successful OTP verification, the system SHALL open a profile dialog collecting a **required full name** and an **optional email**, and persist them to `profiles`. Profile completeness is determined by `full_name` alone. The dialog MUST NOT appear for returning users whose profile is already complete.

#### Scenario: New user sees the profile dialog
- **WHEN** a newly created user finishes OTP verification and has no `full_name`
- **THEN** the profile dialog opens requesting name and email

#### Scenario: Returning user never sees the dialog
- **WHEN** an existing user with a saved `full_name` verifies their OTP
- **THEN** no dialog appears and they proceed to their destination

#### Scenario: Submitted details are stored
- **WHEN** the user submits a valid name, with or without an email
- **THEN** `profiles.full_name` is updated, and `profiles.email` is updated only when an email was provided
- **AND** the user is redirected to their original destination

### Requirement: The dialog explains why email is requested
The email field SHALL be accompanied by a short, plain-language explanation that the address is used to send order confirmations and delivery updates. The copy MUST make clear that providing it is optional at this point.

#### Scenario: Purpose of email is shown
- **WHEN** the profile dialog renders
- **THEN** helper text near the email field explains it is used for order confirmations and delivery updates
- **AND** the field is visibly marked optional

### Requirement: Email can be skipped without blocking sign-up
The user SHALL be able to complete onboarding by providing only their name. Skipping email MUST NOT block sign-in, and MUST NOT prevent browsing the site. An email supplied later (at checkout or from account settings) is stored on the same profile.

#### Scenario: User skips email and proceeds
- **WHEN** the user submits the dialog with a name and an empty email
- **THEN** onboarding completes, `profiles.email` remains null, and they are redirected to their destination

#### Scenario: Skipping does not restrict browsing
- **WHEN** a user with no email browses trees, the store, or their account
- **THEN** no email prompt blocks them

### Requirement: The profile dialog is responsive
The dialog SHALL present as a sheet that slides down from the **top** of the viewport on mobile, and as a **centered modal** on desktop. Both presentations MUST share the same fields, validation, and submit behaviour.

#### Scenario: Mobile presentation
- **WHEN** the profile dialog opens on a small viewport
- **THEN** it animates in from the top edge of the screen

#### Scenario: Desktop presentation
- **WHEN** the profile dialog opens on a large viewport
- **THEN** it appears centered in the viewport

### Requirement: Profile fields are validated
The dialog SHALL require a non-empty full name. Email is optional, but when a value is entered it MUST be a syntactically valid address. Invalid input MUST show an inline error and MUST NOT be persisted.

#### Scenario: Empty name is rejected
- **WHEN** the user submits with an empty name
- **THEN** an inline validation error is shown and nothing is saved

#### Scenario: Empty email is accepted
- **WHEN** the user submits a valid name and leaves email blank
- **THEN** the submission succeeds and `profiles.email` stays null

#### Scenario: Malformed email is rejected
- **WHEN** the user enters a non-empty email that fails validation
- **THEN** an inline validation error is shown and nothing is saved

### Requirement: Common email typos are surfaced as a suggestion
Because the email is never verified, a mistyped address silently discards every order confirmation. Any email input SHALL detect common misspelled domains and offer a correction the user can accept in one click. The suggestion MUST be advisory — it MUST NOT block submission or auto-rewrite the value.

#### Scenario: Misspelled domain offers a correction
- **WHEN** the user enters `name@gmial.com`
- **THEN** a suggestion offers `name@gmail.com`
- **AND** accepting it replaces the field value

#### Scenario: Suggestion never blocks submission
- **WHEN** the user ignores the suggestion and submits a syntactically valid address
- **THEN** the value is saved exactly as typed

### Requirement: The profile dialog is hosted on the sign-in route
Profile completion SHALL have a concrete URL the proxy can redirect to: the sign-in route (`/auth/signin`). When that route loads with an authenticated session whose profile lacks `full_name`, it SHALL render with the profile dialog open instead of the phone-entry step. No separate completion page is introduced.

#### Scenario: Sign-in route opens the dialog for an incomplete profile
- **WHEN** an authenticated user without a `full_name` loads `/auth/signin`
- **THEN** the page renders with the profile dialog open, not the phone-entry form

#### Scenario: Sign-in route shows phone entry when unauthenticated
- **WHEN** an unauthenticated visitor loads `/auth/signin`
- **THEN** the phone-entry step is shown and no dialog opens

### Requirement: Incomplete profiles cannot reach protected routes
Until a user's profile is complete, the proxy SHALL prevent access to protected routes and redirect the user to `/auth/signin` (which opens the dialog), preserving their intended destination as `redirectTo`. The dialog MUST NOT be dismissible into a protected area, and the redirect MUST NOT loop.

#### Scenario: Incomplete profile is gated
- **WHEN** an authenticated user without a `full_name` requests `/account` or `/checkout`
- **THEN** the proxy redirects them to `/auth/signin` with `redirectTo` set to the requested path

#### Scenario: Gate does not loop on the sign-in route
- **WHEN** an authenticated user without a `full_name` is redirected to `/auth/signin`
- **THEN** the proxy allows that request through rather than redirecting again

#### Scenario: Completion resumes the original destination
- **WHEN** the user submits the dialog successfully
- **THEN** they are redirected to the validated `redirectTo` destination

### Requirement: The dialog is accessible and consistent with the design system
The dialog SHALL use the project's shadcn/Base UI primitives (`render` prop, not `asChild`), OKLCH design tokens, and `AnimatedButton` for its primary action. It MUST trap focus, be dismissable by keyboard where permitted, and expose accessible labels.

#### Scenario: Uses existing primitives and tokens
- **WHEN** the dialog renders
- **THEN** it uses existing UI primitives and brand tokens rather than hardcoded colors or bespoke components
