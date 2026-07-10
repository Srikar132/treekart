// Email typo suggestions.
//
// The email we collect is never verified — it is a contact field, not a credential.
// So a mistyped domain silently swallows every order confirmation and surfaces
// later as a support ticket. Catch the common cases at the point of entry.
//
// Advisory only: never rewrite the value, never block submission. A user with a
// legitimately unusual domain must always be able to submit what they typed.

const DOMAIN_CORRECTIONS: Record<string, string> = {
    // gmail
    "gmial.com": "gmail.com",
    "gmai.com": "gmail.com",
    "gmail.co": "gmail.com",
    "gmail.con": "gmail.com",
    "gmaill.com": "gmail.com",
    "gmail.cm": "gmail.com",
    "gnail.com": "gmail.com",
    // yahoo
    "yahooo.com": "yahoo.com",
    "yaho.com": "yahoo.com",
    "yahoo.co": "yahoo.com",
    "yahoo.con": "yahoo.com",
    // hotmail
    "hotmial.com": "hotmail.com",
    "hotmai.com": "hotmail.com",
    "hotmail.con": "hotmail.com",
    // outlook
    "outlok.com": "outlook.com",
    "outllok.com": "outlook.com",
    "outlook.con": "outlook.com",
    // rediff (common in India)
    "rediffmail.co": "rediffmail.com",
    "redifmail.com": "rediffmail.com",
};

/**
 * Returns a corrected address when the domain looks like a common typo,
 * otherwise null. Purely a suggestion for the user to accept or ignore.
 */
export function suggestEmailCorrection(email: string): string | null {
    const value = (email ?? "").trim();
    const at = value.lastIndexOf("@");
    if (at <= 0 || at === value.length - 1) return null;

    const local = value.slice(0, at);
    const domain = value.slice(at + 1).toLowerCase();

    const corrected = DOMAIN_CORRECTIONS[domain];
    if (!corrected || corrected === domain) return null;

    return `${local}@${corrected}`;
}
