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

### Requirement: The new-user trigger never aborts signup
The `handle_new_user` trigger SHALL tolerate conflicts — both on `profiles.id` and on the `profiles.phone` unique index — without raising, so a constraint collision can never roll back the `auth.users` insert and break signup.

#### Scenario: Duplicate profile id does not abort signup
- **WHEN** the trigger fires for an id that already has a `profiles` row
- **THEN** the insert is skipped and signup succeeds

#### Scenario: Conflicting phone does not abort signup
- **WHEN** the trigger attempts to insert a phone already held by an orphaned `profiles` row
- **THEN** the conflict is handled without raising and the `auth.users` insert is not rolled back

### Requirement: Existing users are migrated to phone identity
The migration SHALL normalize stored 10-digit numbers to E.164, set `auth.users.phone` and `phone_confirmed_at`, and resolve collisions before enforcing uniqueness. Accounts with no usable phone MUST be reported, never silently dropped.

#### Scenario: Existing 10-digit number is backfilled
- **WHEN** an existing profile has phone `9876543210`
- **THEN** migration sets `auth.users.phone = +919876543210` and `phone_confirmed_at`, enabling OTP sign-in

#### Scenario: Duplicate phones are nulled so the unique index can be created
- **WHEN** two or more existing profiles share the same normalized phone
- **THEN** every colliding row has its `phone` set to NULL and is recorded in the migration report
- **AND** no colliding row silently inherits the number
- **AND** the `UNIQUE` index is created successfully afterwards

#### Scenario: Un-normalizable phones are nulled, not left raw
- **WHEN** a profile's phone cannot be normalized to E.164
- **THEN** its `phone` is set to NULL and the row is reported
- **AND** no raw, un-normalized value remains that could violate the unique index

#### Scenario: Nulled users recover by signing in with OTP
- **WHEN** a user whose phone was nulled signs in with that number
- **THEN** they authenticate by OTP and are treated as a new profile requiring onboarding

#### Scenario: Missing or invalid phone is reported
- **WHEN** an existing profile has a null or un-normalizable phone
- **THEN** the account is listed in a migration report for manual handling rather than deleted
