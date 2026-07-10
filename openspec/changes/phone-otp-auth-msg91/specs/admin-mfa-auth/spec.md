## ADDED Requirements

### Requirement: Admin authentication requires phone OTP plus a TOTP second factor
Admin accounts SHALL authenticate with phone + OTP **and** a TOTP code from an authenticator app. Passwords MUST NOT be used. A session that has passed OTP but not TOTP MUST NOT reach any admin route.

#### Scenario: Admin completes both factors
- **WHEN** an admin verifies their phone OTP and then a valid TOTP code
- **THEN** the session reaches AAL2 and `/admin` is accessible

#### Scenario: Admin stopped at one factor
- **WHEN** an admin passes OTP but does not complete the TOTP challenge
- **THEN** admin routes are denied and the TOTP challenge is presented

### Requirement: Admin routes require assurance level AAL2
The proxy SHALL read the session's authenticator assurance level and require `aal2` for every route under `/admin`, excluding the admin login page itself. Below AAL2 the request MUST be redirected to the admin login to complete the second factor.

#### Scenario: AAL1 session is blocked from admin routes
- **WHEN** a request for `/admin/orders` carries a session at `aal1`
- **THEN** the proxy redirects to the admin login page

#### Scenario: Admin login page stays reachable at AAL1
- **WHEN** an admin at `aal1` requests the admin login page
- **THEN** the proxy allows it through so they can complete or enrol their second factor
- **AND** no redirect loop occurs

### Requirement: First-time admins enrol a TOTP factor via QR code
When an authenticated admin has no verified TOTP factor, the system SHALL enrol one — displaying a QR code encoding the `otpauth://` URI — and SHALL confirm enrolment by verifying a code from the authenticator app before granting AAL2.

#### Scenario: Admin without a factor is shown a QR code
- **WHEN** an admin passes OTP and has no enrolled TOTP factor
- **THEN** a QR code is displayed for scanning in an authenticator app

#### Scenario: Enrolment is confirmed by a correct code
- **WHEN** the admin submits a code matching the newly enrolled secret
- **THEN** the factor becomes verified and the session is elevated to AAL2

#### Scenario: Enrolment fails on a wrong code
- **WHEN** the admin submits an incorrect code during enrolment
- **THEN** the factor remains unverified, the session stays at AAL1, and they may retry

### Requirement: Recovery codes are issued once at TOTP enrolment
When an admin enrols a TOTP factor, the system SHALL generate a fixed set of single-use recovery codes, display them exactly once, and store only their hashes. Plaintext codes MUST NOT be recoverable from the database or logs.

#### Scenario: Codes are shown once at enrolment
- **WHEN** an admin completes TOTP enrolment
- **THEN** a set of recovery codes is displayed once with instructions to save them
- **AND** only hashes are persisted

#### Scenario: Codes cannot be retrieved later
- **WHEN** an admin revisits their account after enrolment
- **THEN** the plaintext codes are not retrievable and may only be regenerated (invalidating the old set)

### Requirement: A recovery code authorizes a factor reset, not a session upgrade
A recovery code SHALL NOT by itself elevate a session to AAL2. Redeeming a valid code SHALL unenrol the admin's existing TOTP factor, after which the admin MUST enrol a new factor and verify it to reach AAL2.

#### Scenario: Redeeming a code resets the factor
- **WHEN** an admin redeems a valid recovery code
- **THEN** their existing TOTP factor is removed
- **AND** they are taken to enrolment to scan a new QR code

#### Scenario: Redeeming a code does not grant admin access
- **WHEN** a recovery code is redeemed
- **THEN** the session remains below AAL2 until a new TOTP factor is enrolled and verified
- **AND** no admin route is reachable in the meantime

### Requirement: Recovery codes are only redeemable from an authenticated first factor
Redemption SHALL require an active session that has already passed phone OTP (assurance level `aal1`) and belongs to an account whose role is `admin`. A recovery code presented without such a session MUST be rejected.

#### Scenario: Code without a session is rejected
- **WHEN** a recovery code is submitted with no authenticated session
- **THEN** it is rejected and no factor is unenrolled

#### Scenario: Code from a non-admin session is rejected
- **WHEN** a recovery code is submitted by a session whose role is not `admin`
- **THEN** it is rejected and no factor is unenrolled

### Requirement: Recovery codes are single-use and rate-limited
Each code SHALL be consumed on first successful redemption and never accepted again. Redemption attempts MUST be rate-limited to resist brute force, and a failed attempt MUST NOT reveal whether the code exists.

#### Scenario: A consumed code cannot be reused
- **WHEN** a previously redeemed code is submitted again
- **THEN** it is rejected

#### Scenario: Repeated failed redemptions are throttled
- **WHEN** redemption attempts exceed the configured limit
- **THEN** further attempts are denied for a cooldown window

### Requirement: Only admins may pass the admin login
After OTP verification on the admin login, the system SHALL confirm `profiles.role = 'admin'` and, if not, immediately sign the session out and deny access.

#### Scenario: Non-admin is rejected and signed out
- **WHEN** a user whose role is not `admin` completes OTP on the admin login
- **THEN** the session is signed out and an access-denied message is shown

### Requirement: The admin OTP send shares the storefront's abuse controls
The admin OTP-send SHALL be protected by the same Turnstile CAPTCHA and Arcjet rate limiting as the storefront, and MUST NOT create accounts (`shouldCreateUser: false`).

#### Scenario: Unknown number cannot create an admin account
- **WHEN** an unregistered phone number requests an OTP at the admin login
- **THEN** no account is created

### Requirement: The admin login does not leak account existence
Because `shouldCreateUser: false` makes Supabase return a distinct error for unregistered numbers, the admin login SHALL normalize its response so an unregistered number is indistinguishable from a registered one. The provider error MUST NOT be surfaced verbatim.

#### Scenario: Unregistered number yields the same response
- **WHEN** an unregistered phone number requests an OTP at the admin login
- **THEN** the response is identical to that for a registered admin number
- **AND** the underlying "signups not allowed" error is not shown to the client

### Requirement: Gate order is admin MFA before profile completion
For a user whose role is `admin`, the proxy SHALL evaluate the AAL2 requirement **before** the profile-completion gate, so an admin with an incomplete profile is not bounced between the admin login and the sign-in route. Profile completion for admins is enforced only after AAL2 is reached.

#### Scenario: Admin with incomplete profile is not looped
- **WHEN** an admin without a `full_name` and below AAL2 requests an admin route
- **THEN** they are sent to the admin login to complete MFA
- **AND** they are not redirected to `/auth/signin` for profile completion first

#### Scenario: Admin completes profile after reaching AAL2
- **WHEN** an admin reaches AAL2 but still has no `full_name`
- **THEN** the profile-completion gate applies as it does for other users
