# auth-callback-routing Specification

## Purpose

Define how the Supabase auth callback endpoint is routed through the proxy/auth-gating layer so that code-exchange flows (password reset, signup confirmation) reach the callback route handler instead of being bounced to the sign-in page.

## Requirements

### Requirement: Callback endpoint is reachable without a session
The proxy layer (`proxy.ts` / `utils/supabase/proxy.ts`) SHALL allow requests to `/auth/callback` to reach the route handler regardless of authentication state. An unauthenticated request to the callback is the expected case, because the callback exists to exchange a code for a session; the proxy MUST NOT redirect it to `/auth/signin`.

#### Scenario: Unauthenticated callback with a code passes through
- **WHEN** an unauthenticated request arrives at `/auth/callback?code=<code>&next=/auth/reset-password`
- **THEN** the proxy does not redirect to `/auth/signin`
- **AND** the callback route handler runs `exchangeCodeForSession(code)`
- **AND** on success the user is redirected to the `next` destination (`/auth/reset-password`) with a valid session

#### Scenario: Callback allow-list is exact, not a broad prefix
- **WHEN** the proxy evaluates whether a path bypasses auth gating
- **THEN** only the callback endpoint path (and any dedicated confirmation endpoint) bypasses gating
- **AND** protected routes such as `/account` and `/checkout` remain gated for unauthenticated users

### Requirement: Password reset link resolves to the reset screen
Following the recovery email link SHALL result in the user viewing `/auth/reset-password` with an active recovery session, not the sign-in page.

#### Scenario: User completes reset from the email link
- **WHEN** a user clicks the reset link delivered by `requestPasswordReset`
- **THEN** the callback exchanges the code and redirects to `/auth/reset-password`
- **AND** the reset-password page loads with a session so `updatePassword` succeeds

### Requirement: Signup confirmation link resolves correctly
Following the signup confirmation email link SHALL exchange the code and land the user on the intended `next` destination, not the sign-in page.

#### Scenario: New user confirms email
- **WHEN** a newly registered user clicks the confirmation link pointing at `/auth/callback`
- **THEN** the callback exchanges the code and establishes the session
- **AND** the user is redirected to the `next` destination rather than bounced to `/auth/signin`
