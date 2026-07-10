## ADDED Requirements

### Requirement: An email address is required to place an order
A user SHALL have a non-empty `profiles.email` before a mango order or a tree rental can be created. Email is optional to sign up and browse, but mandatory at the point of purchase, because order confirmations and delivery updates are sent by email.

#### Scenario: User with an email orders normally
- **WHEN** a user whose profile has an email places an order
- **THEN** the order is created without any additional prompt

#### Scenario: User without an email is asked before ordering
- **WHEN** a user whose profile has no email attempts to place an order
- **THEN** they are asked for an email before the order is created

### Requirement: The order server actions enforce the email requirement
Order creation SHALL be rejected server-side when the authenticated user's profile has no email. The check MUST NOT rely on the client, so a request bypassing the UI cannot create an order without an email.

#### Scenario: Direct action call without an email is rejected
- **WHEN** the mango-order or rental-order creation action is invoked for a user whose profile has no email
- **THEN** the action returns an error and no order, rental, or payment order is created

#### Scenario: Reservation is not left dangling
- **WHEN** rental creation is rejected for a missing email
- **THEN** any tree reservation taken for that attempt is released

### Requirement: Checkout prompts for the missing email in context
When a signed-in user without an email reaches checkout, the system SHALL prompt for it using the same responsive dialog used at onboarding — top sheet on mobile, centered modal on desktop — explaining that the address receives order confirmations and delivery updates.

#### Scenario: Prompt appears at checkout
- **WHEN** a user with no email opens checkout or attempts to pay
- **THEN** the email dialog opens, explaining why the address is needed

#### Scenario: Saving the email resumes checkout
- **WHEN** the user submits a valid email in the checkout prompt
- **THEN** `profiles.email` is saved and the checkout flow continues from where it paused

#### Scenario: Typo suggestion is offered at checkout too
- **WHEN** the user enters an address with a commonly misspelled domain
- **THEN** the same advisory correction offered at onboarding is shown

#### Scenario: Declining the email blocks only the order
- **WHEN** the user dismisses the checkout email prompt
- **THEN** no order is created
- **AND** the user remains on checkout with their cart and address intact, free to browse away

### Requirement: A stored email is reusable and editable
An email captured at checkout SHALL be written to the same `profiles.email` field used at onboarding, so it is not requested again on subsequent orders, and it MUST be editable from account settings.

#### Scenario: Second order does not re-prompt
- **WHEN** a user who supplied an email at checkout places another order
- **THEN** no email prompt appears

#### Scenario: Email can be changed later
- **WHEN** the user updates their email in account settings
- **THEN** the new address is stored and used for subsequent order communication

### Requirement: Email is a contact field, not a credential
The stored email SHALL NOT be used for authentication, account lookup, or identity. It is not verified as part of sign-in, and it MUST NOT be uniquely constrained in a way that prevents a legitimate user from signing up by phone.

#### Scenario: Email never authenticates
- **WHEN** any authentication flow runs
- **THEN** `profiles.email` is not consulted for identity or login
