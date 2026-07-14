import { test, expect } from '@playwright/test';
import {
  phoneSchema,
  otpSchema,
  profileCompletionSchema,
  orderEmailSchema,
  recoveryCodeSchema,
  contactSchema,
} from '@/lib/validations';
import { validateAddress } from '@/lib/checkout-validation';
import type { DeliveryAddress } from '@/types/checkout';

/**
 * Boundary-value tests for the shared Zod schemas (lib/validations.ts) and
 * the plain-function checkout validator (lib/checkout-validation.ts).
 *
 * These import the schemas directly and run in the Playwright *Node* process
 * (not the browser) — Playwright Test resolves the `@/*` path alias from
 * tsconfig.json automatically, and neither file has any Next.js-server-only
 * import (no "use server", no next/headers), so they're safely importable
 * here without a running page. This is deliberately chosen over driving the
 * full sign-in / checkout / admin UIs for every boundary case: it's faster,
 * fully deterministic, and avoids duplicating coverage the auth-flow and
 * account/checkout suites already own for the actual form UX. One live-form
 * boundary check is kept for the contact form at the bottom, since that page
 * belongs to no other named suite.
 */

test.describe('phoneSchema — Indian mobile number boundary formats', () => {
  const valid = ['6000000000', '7999999999', '8123456789', '9876543210'];
  const invalid = [
    '5000000000', // leading digit must be 6-9
    '600000000', // 9 digits — too short
    '60000000000', // 11 digits — too long
    '9876543a10', // non-numeric
    '+919876543210', // must be bare 10-digit, not E.164 here
    '', // empty
    ' 9876543210', // leading whitespace not stripped by the regex
  ];

  for (const phone of valid) {
    test(`accepts valid 10-digit number "${phone}"`, () => {
      expect(phoneSchema.safeParse({ phone }).success).toBe(true);
    });
  }

  for (const phone of invalid) {
    test(`rejects invalid number "${phone}"`, () => {
      expect(phoneSchema.safeParse({ phone }).success).toBe(false);
    });
  }
});

test.describe('otpSchema — exactly 6 digits', () => {
  test('accepts a 6-digit code', () => {
    expect(otpSchema.safeParse({ otp: '123456' }).success).toBe(true);
  });

  for (const otp of ['12345', '1234567', 'abcdef', '123 456', '']) {
    test(`rejects "${otp}"`, () => {
      expect(otpSchema.safeParse({ otp }).success).toBe(false);
    });
  }
});

test.describe('profileCompletionSchema — fullName required, email optional', () => {
  test('accepts a name with no email at all', () => {
    const result = profileCompletionSchema.safeParse({ fullName: 'A' });
    expect(result.success).toBe(true);
  });

  test('accepts an explicit empty-string email (the literal("") escape hatch)', () => {
    const result = profileCompletionSchema.safeParse({ fullName: 'A', email: '' });
    expect(result.success).toBe(true);
  });

  test('rejects an empty fullName (min length 1)', () => {
    const result = profileCompletionSchema.safeParse({ fullName: '' });
    expect(result.success).toBe(false);
  });

  test('rejects a whitespace-only fullName (trimmed before the min check)', () => {
    const result = profileCompletionSchema.safeParse({ fullName: '   ' });
    expect(result.success).toBe(false);
  });

  test('rejects a malformed email when one IS provided', () => {
    const result = profileCompletionSchema.safeParse({ fullName: 'A', email: 'not-an-email' });
    expect(result.success).toBe(false);
  });
});

test.describe('orderEmailSchema — mandatory before an order can be created', () => {
  test('rejects a missing email', () => {
    expect(orderEmailSchema.safeParse({}).success).toBe(false);
  });

  test('rejects an empty-string email (no literal("") escape hatch here, unlike onboarding)', () => {
    expect(orderEmailSchema.safeParse({ email: '' }).success).toBe(false);
  });

  test('accepts a well-formed email', () => {
    expect(orderEmailSchema.safeParse({ email: 'buyer@example.com' }).success).toBe(true);
  });
});

test.describe('recoveryCodeSchema — admin MFA recovery code, min length 8', () => {
  test('rejects a 7-character code (one under the boundary)', () => {
    expect(recoveryCodeSchema.safeParse({ code: '1234567' }).success).toBe(false);
  });

  test('accepts exactly 8 characters', () => {
    expect(recoveryCodeSchema.safeParse({ code: '12345678' }).success).toBe(true);
  });

  test('trims surrounding whitespace before checking length', () => {
    // 6 real chars + padding whitespace would fail the trimmed check.
    expect(recoveryCodeSchema.safeParse({ code: '  1234  ' }).success).toBe(false);
    expect(recoveryCodeSchema.safeParse({ code: '  12345678  ' }).success).toBe(true);
  });
});

test.describe('contactSchema — name/email/phone/subject/message boundaries', () => {
  const validBase = {
    name: 'Jo',
    email: 'jo@example.com',
    phone: '9876543210',
    subject: 'Hello',
    message: 'This is a test',
  };

  test('accepts values right at each documented minimum', () => {
    expect(contactSchema.safeParse(validBase).success).toBe(true);
  });

  test('rejects a name one character under the min(2)', () => {
    expect(contactSchema.safeParse({ ...validBase, name: 'J' }).success).toBe(false);
  });

  test('rejects a subject one character under the min(5)', () => {
    expect(contactSchema.safeParse({ ...validBase, subject: 'Hi' }).success).toBe(false);
  });

  test('rejects a message one character under the min(10)', () => {
    expect(contactSchema.safeParse({ ...validBase, message: 'short' }).success).toBe(false);
  });

  test('rejects a phone shorter than min(10) — note: unlike phoneSchema, this is a bare length check, not a regex', () => {
    expect(contactSchema.safeParse({ ...validBase, phone: '123' }).success).toBe(false);
  });

  test('accepts a non-Indian-shaped phone as long as it clears min(10) (contactSchema has no format regex)', () => {
    // Documents a real inconsistency: phoneSchema (auth) enforces the Indian
    // 6-9 leading digit + exact 10-digit shape; contactSchema (contact form)
    // only enforces a minimum length. A "0000000000" or an international
    // number both pass here even though they'd fail phoneSchema.
    expect(contactSchema.safeParse({ ...validBase, phone: '0000000000' }).success).toBe(true);
  });

  test('rejects a malformed email', () => {
    expect(contactSchema.safeParse({ ...validBase, email: 'not-an-email' }).success).toBe(false);
  });
});

test.describe('validateAddress (lib/checkout-validation.ts) — required vs optional fields', () => {
  const base: DeliveryAddress = {
    name: 'Test User',
    phone: '9876543210',
    line1: '123 Test Street',
    locality: 'Banjara Hills',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500034',
  };

  test('a fully-filled address is valid', () => {
    expect(validateAddress(base).isValid).toBe(true);
  });

  test('FINDING: locality is typed optional (DeliveryAddress.locality?) but validateAddress actually requires it', () => {
    // types/checkout.ts declares `locality?: string | null`, which reads as
    // optional. But lib/checkout-validation.ts unconditionally checks
    // `if (!addr.locality?.trim()) errors.locality = "Locality/Area is required"`
    // with no distinction from the other required fields — so in practice
    // locality is NOT optional at the validation layer. This test documents
    // the actual (stricter) runtime behavior rather than the type signature,
    // since that's what a real user hits.
    const { locality, ...rest } = base;
    const result = validateAddress({ ...rest, locality: undefined });
    expect(result.isValid).toBe(false);
    expect(result.errors.locality).toBeTruthy();
  });

  test('phone accepts a +91-prefixed or spaced number (stripped before the regex test)', () => {
    expect(validateAddress({ ...base, phone: '+91 98765 43210' }).isValid).toBe(true);
  });

  test('rejects a pincode that is not exactly 6 digits', () => {
    const short = validateAddress({ ...base, pincode: '50003' });
    expect(short.isValid).toBe(false);
    expect(short.errors.pincode).toBeTruthy();

    const long = validateAddress({ ...base, pincode: '5000345' });
    expect(long.isValid).toBe(false);
  });

  test('rejects a pincode with non-digit characters', () => {
    expect(validateAddress({ ...base, pincode: '50003A' }).isValid).toBe(false);
  });

  test('reports every missing required field at once, not just the first', () => {
    const result = validateAddress({
      name: '',
      phone: '',
      line1: '',
      city: '',
      state: '',
      pincode: '',
    });
    expect(result.isValid).toBe(false);
    expect(Object.keys(result.errors)).toEqual(
      expect.arrayContaining(['name', 'phone', 'line1', 'city', 'state', 'pincode'])
    );
  });
});

test.describe('contact form UI — schema wired end-to-end (real form, no other suite owns /contact)', () => {
  // This single submission passes through the REAL contactAj.protect() call
  // in actions/contact.actions.ts before validation ever runs (rate limiting
  // is checked first). One request per test run is expected to stay well
  // under contactAj's 5/hour ceiling, but this test does depend on
  // ARCJET_KEY being configured for the dev server — see rate-limiting.spec.ts
  // for why we don't drive the same form 6x here.
  test('submitting with a too-short subject shows the exact server-side fieldError', async ({ page }) => {
    await page.goto('/contact');
    await page.getByPlaceholder('Enter your name').fill('Jo');
    await page.getByPlaceholder('Enter Email Address').fill('jo@example.com');
    await page.getByPlaceholder('Enter Phone Number').fill('9876543210');
    await page.getByPlaceholder('What is this about?').fill('Hi'); // 2 chars, min is 5
    await page.getByPlaceholder('How can we help you today?').fill('A valid message body here.');
    await page.getByRole('button', { name: /Submit Message/i }).click();

    await expect(page.getByText(/Subject must be at least 5 characters/i)).toBeVisible({ timeout: 10_000 });
  });
});
