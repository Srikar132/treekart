## ADDED Requirements

### Requirement: OTP SMS is delivered via MSG91 through a custom Send SMS Hook
Because MSG91 is not a Supabase-native SMS provider, the system SHALL deliver OTPs by registering a custom **Send SMS Hook** (a Supabase Edge Function) that receives Supabase's OTP payload and calls the MSG91 API. Supabase MUST remain the authority that generates and verifies the OTP; MSG91 is transport only.

#### Scenario: Supabase generates, MSG91 delivers
- **WHEN** Supabase Auth needs to deliver an OTP
- **THEN** the Send SMS Hook is invoked with the destination number and code
- **AND** the hook calls MSG91 to send the SMS
- **AND** verification of the submitted code is still performed by Supabase

#### Scenario: No native provider is configured
- **WHEN** SMS delivery is configured
- **THEN** it routes through the Send SMS Hook, not a native `[auth.sms.<provider>]` block

### Requirement: The hook authenticates requests from Supabase
The Send SMS Hook SHALL verify the Supabase hook secret on every invocation and reject unauthenticated requests. An attacker MUST NOT be able to trigger SMS sends by calling the function directly.

#### Scenario: Unsigned request is rejected
- **WHEN** the hook endpoint receives a request without a valid hook secret
- **THEN** it returns an error and sends no SMS

### Requirement: SMS templates are DLT-registered
All OTP SMS content SHALL use a DLT-registered sender ID and message template as required by Indian TRAI regulation, and the message MUST match the registered template exactly.

#### Scenario: Registered template is used
- **WHEN** an OTP SMS is sent
- **THEN** it uses the DLT-registered sender ID and approved template text

### Requirement: Delivery failures are handled and surfaced
When MSG91 reports a delivery failure, or the hook errors, the OTP-send SHALL fail gracefully — the user sees a retry option and no session is issued. Delivery failures MUST NOT crash the auth flow.

#### Scenario: Delivery failure shows retry
- **WHEN** MSG91 returns a failure for an OTP request
- **THEN** the user sees an error with the option to retry
- **AND** no partial session is created

### Requirement: Provider credentials are server-side secrets
The MSG91 auth key, template ID, sender ID, and the hook secret SHALL be stored as server-side secrets (environment variables) and MUST NOT be committed to the repository or exposed to the client.

#### Scenario: Secrets are not client-exposed
- **WHEN** the client bundle is inspected
- **THEN** no MSG91 credential or hook secret is present
