## ADDED Requirements

### Requirement: Phone + OTP is the sole authentication method
The system SHALL authenticate all users solely via phone number and a one-time password. There MUST be no password field, no password reset, and no email-confirmation flow anywhere in the application. Supabase SHALL remain the authority that generates, verifies, and issues sessions.

#### Scenario: User signs in with phone and OTP
- **WHEN** a user submits a valid phone number and then the correct OTP delivered to it
- **THEN** Supabase issues a session and the user is authenticated
- **AND** no password was requested at any point

#### Scenario: Legacy password routes are gone
- **WHEN** a client requests `/auth/forgot-password`, `/auth/reset-password`, or any password sign-in
- **THEN** the route does not exist and no password authentication path is reachable

### Requirement: Sign-in screen presents a single phone input
The sign-in screen SHALL present exactly one input — the phone number — with no other credential fields. On submit it SHALL advance to a dedicated OTP entry screen.

#### Scenario: One field, then OTP screen
- **WHEN** a visitor opens the sign-in screen
- **THEN** only a phone-number field is shown
- **AND** submitting a valid number advances to the OTP entry screen

### Requirement: Single flow serves sign-in and sign-up
The flow SHALL call `signInWithOtp({ phone, shouldCreateUser: true })` so that an unrecognized number creates an account on first successful verification. First-time and returning users MUST use the same two screens.

#### Scenario: New phone number creates an account
- **WHEN** an unrecognized phone number completes OTP verification
- **THEN** a new `auth.users` record and matching `profiles` row are created

#### Scenario: Known phone number signs in
- **WHEN** an existing user's phone number completes OTP verification
- **THEN** the existing account is signed in without creating a duplicate

### Requirement: Phone numbers are validated and normalized to E.164
The UI SHALL accept a 10-digit Indian mobile number (leading digit 6–9) and normalize it to E.164 (`+91XXXXXXXXXX`) before any Supabase call. Malformed numbers MUST be rejected on both client and server.

#### Scenario: 10-digit input is normalized
- **WHEN** a user enters `9876543210`
- **THEN** the system requests an OTP for `+919876543210`

#### Scenario: Invalid number is rejected
- **WHEN** a user enters a number failing the Indian mobile pattern
- **THEN** no OTP is sent and a validation error is shown

### Requirement: OTP verification issues a session
On correct OTP entry the system SHALL call `verifyOtp` and establish the Supabase session cookie via the existing `@supabase/ssr` server client. Incorrect or expired codes MUST be rejected without issuing a session.

#### Scenario: Correct OTP authenticates
- **WHEN** the user submits the 6-digit code matching the one sent
- **THEN** `verifyOtp` succeeds and the session cookie is set

#### Scenario: Incorrect or expired OTP is rejected
- **WHEN** the user submits a wrong or expired code
- **THEN** verification fails, no session is issued, and the user may request a new code

### Requirement: Returning users land where they came from
After a returning user (one with a complete profile) verifies their OTP, the system SHALL redirect them to the destination they originally attempted, carried through the flow as `redirectTo`.

#### Scenario: Deep link is preserved through sign-in
- **WHEN** an unauthenticated user attempts `/checkout` and is sent to sign-in
- **AND** they complete phone + OTP and already have a complete profile
- **THEN** they are redirected to `/checkout`, not the home page

### Requirement: OTP send is protected against abuse
The OTP-send action SHALL require a valid Cloudflare Turnstile token and be rate-limited by Arcjet, to prevent SMS pumping and toll fraud. Repeated sends MUST be throttled and a resend cooldown enforced in the UI.

#### Scenario: OTP send requires CAPTCHA
- **WHEN** a client requests an OTP without a valid Turnstile token
- **THEN** no OTP is sent

#### Scenario: Excessive OTP requests are throttled
- **WHEN** OTP-send requests exceed the configured rate limit
- **THEN** further requests are denied for the cooldown window

### Requirement: Phone enumeration is not possible
The OTP-send response SHALL be identical whether or not the number already has an account, so it cannot be used to discover registered numbers.

#### Scenario: Response does not reveal account existence
- **WHEN** an OTP is requested for any valid number
- **THEN** the response is the same regardless of whether that number is registered
