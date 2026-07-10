// An email is optional to sign up and browse, but required to place an order —
// confirmations, invoices and delivery updates are sent there.
//
// The checkout dialog is UX. THIS is the gate: order creation re-reads the
// profile server-side, so a request that bypasses the UI cannot create an
// order with no reachable contact channel.

export const EMAIL_REQUIRED_CODE = "EMAIL_REQUIRED";

export const EMAIL_REQUIRED_MESSAGE =
    "Please add an email address to receive your order confirmation.";

/** Thrown by order actions; the checkout client detects it and opens the prompt. */
export class EmailRequiredError extends Error {
    readonly code = EMAIL_REQUIRED_CODE;
    constructor() {
        super(EMAIL_REQUIRED_MESSAGE);
        this.name = "EmailRequiredError";
    }
}

export function isEmailRequiredError(err: unknown): boolean {
    if (err instanceof EmailRequiredError) return true;
    // Server Actions serialize errors across the boundary, so match on the message too.
    return err instanceof Error && err.message === EMAIL_REQUIRED_MESSAGE;
}

/** Call immediately after requireUser() in any order-creating action. */
export function assertContactEmail(email: string | null | undefined): asserts email is string {
    if (!email || !email.trim()) throw new EmailRequiredError();
}
