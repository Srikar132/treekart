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
