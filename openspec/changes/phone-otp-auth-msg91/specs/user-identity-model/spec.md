## ADDED Requirements

### Requirement: Phone number is the canonical user identity
The system SHALL treat `profiles.phone`, stored in E.164 format, as the canonical identity for every user. The column MUST carry a `UNIQUE` constraint so no two accounts share a number. Multiple NULL phones MAY exist for legacy rows.

#### Scenario: Two accounts cannot share a number
- **WHEN** a phone number already tied to an account is used again
- **THEN** the existing account is signed in and no duplicate is created

#### Scenario: Phone stored in E.164
- **WHEN** a profile row is created or updated
- **THEN** `profiles.phone` holds the `+91XXXXXXXXXX` form

### Requirement: Supabase remains both the auth provider and the database
Authentication SHALL be issued by Supabase Auth and user data SHALL live in the Supabase database. No third-party identity provider is introduced, and `profiles.id` MUST remain a UUID referencing `auth.users(id)` so existing RLS policies keep working unchanged.

#### Scenario: RLS policies are untouched
- **WHEN** the migration completes
- **THEN** policies keyed on `auth.uid()` and `profiles.role` continue to enforce exactly as before

### Requirement: Passwords and email-based identity are removed
Passwords and email confirmation SHALL NOT be part of the identity model. `profiles.email` is retained as a **contact field captured during onboarding**, used for receipts and notifications, and MUST NOT be used for login, identity, or account lookup.

#### Scenario: Email is never an auth path
- **WHEN** any authentication or recovery flow runs
- **THEN** it uses phone + OTP only, and `profiles.email` is never consulted for identity

### Requirement: New-user trigger populates the profile from phone
The database SHALL provide a `handle_new_user` trigger on `auth.users` insert that creates the matching `profiles` row using the phone number and any provided metadata, defaulting `role` to `user` and leaving `email` and `full_name` to be filled by onboarding.

#### Scenario: Trigger creates profile on signup
- **WHEN** a new `auth.users` row is inserted with a phone number
- **THEN** a `profiles` row is created with that phone and default role `user`

### Requirement: Existing users are migrated to phone identity
The migration SHALL normalize stored 10-digit numbers to E.164, set `auth.users.phone` and `phone_confirmed_at`, and resolve collisions before enforcing uniqueness. Accounts with no usable phone MUST be reported, never silently dropped.

#### Scenario: Existing 10-digit number is backfilled
- **WHEN** an existing profile has phone `9876543210`
- **THEN** migration sets `auth.users.phone = +919876543210` and `phone_confirmed_at`, enabling OTP sign-in

#### Scenario: Duplicate phones are resolved before uniqueness is enforced
- **WHEN** two existing profiles share the same normalized phone
- **THEN** the collision is recorded and resolved before the `UNIQUE` constraint is applied
- **AND** applying the constraint does not fail

#### Scenario: Missing or invalid phone is reported
- **WHEN** an existing profile has a null or un-normalizable phone
- **THEN** the account is listed in a migration report for manual handling rather than deleted
