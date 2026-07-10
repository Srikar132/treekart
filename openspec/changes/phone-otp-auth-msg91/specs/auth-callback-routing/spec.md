## REMOVED Requirements

### Requirement: Callback endpoint is reachable without a session
**Reason**: `/auth/callback` existed to exchange an email-link code for a session (password reset, signup confirmation). Phone + OTP verifies inline via `verifyOtp` and issues the session directly, so there is no code-exchange callback to route.
**Migration**: Delete `app/(api)/auth/callback/route.ts` and its exact-path bypass in `utils/supabase/proxy.ts`. No user-facing migration is needed — OTP verification replaces the callback entirely.

### Requirement: Password reset link resolves to the reset screen
**Reason**: Passwords are removed; there is no reset link and no reset screen.
**Migration**: Delete `/auth/reset-password` plus `requestPasswordReset` and `updatePassword`. A user who cannot sign in simply requests a new OTP.

### Requirement: Signup confirmation link resolves correctly
**Reason**: Email confirmation is removed; signup completes on OTP verification, not via an emailed link.
**Migration**: Delete the signup confirmation flow and `resendVerificationEmail`. Account creation is confirmed by possession of the phone.

## ADDED Requirements

### Requirement: Proxy gates the phone-OTP auth screens
The proxy SHALL treat the phone-OTP sign-in screens as the only auth pages, allowing unauthenticated access and bouncing already-authenticated users away. There MUST be no remaining special-case bypass for `/auth/callback` or `/auth/reset-password`.

#### Scenario: Authenticated user is redirected off the auth screen
- **WHEN** an authenticated user with a complete profile requests the sign-in page
- **THEN** the proxy redirects them to their role-appropriate destination

#### Scenario: Unauthenticated user reaches the sign-in screen
- **WHEN** an unauthenticated user requests the sign-in page
- **THEN** the proxy allows the request through
