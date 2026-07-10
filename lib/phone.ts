// Phone helpers — India (+91) only.
//
// The UI works with bare 10-digit Indian mobile numbers; Supabase Auth and
// profiles.phone store the E.164 form (+91XXXXXXXXXX). Normalize at the boundary
// so a single representation reaches the database and the auth provider.

const INDIAN_MOBILE = /^[6-9]\d{9}$/;
const E164_IN = /^\+91[6-9]\d{9}$/;

/** Reduce any accepted input to its 10 significant digits, dropping +91 / 91 / leading 0. */
export function extractDigits(raw: string): string {
    const digits = (raw ?? "").replace(/\D/g, "");
    if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
    if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
    return digits;
}

/** True when the input resolves to a valid Indian mobile (10 digits, leading 6-9). */
export function isValidIndianMobile(raw: string): boolean {
    return INDIAN_MOBILE.test(extractDigits(raw));
}

/**
 * Normalize any accepted input to E.164 (+91XXXXXXXXXX).
 * Returns null when the input is not a valid Indian mobile — callers must handle null
 * rather than passing a malformed number to Supabase.
 */
export function toE164(raw: string): string | null {
    const digits = extractDigits(raw);
    return INDIAN_MOBILE.test(digits) ? `+91${digits}` : null;
}

/** True when the value is already a valid +91 E.164 number. */
export function isE164(value: string): boolean {
    return E164_IN.test(value);
}

/** Display form for a stored E.164 number: +91 98765 43210 */
export function formatE164ForDisplay(value: string): string {
    if (!isE164(value)) return value;
    const d = value.slice(3);
    return `+91 ${d.slice(0, 5)} ${d.slice(5)}`;
}
