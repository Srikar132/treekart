import { test, expect } from "@playwright/test";
import {
  mockAuthSession,
  MOCK_USER,
  seedDeliveryAddress,
  mockRazorpaySuccess,
  mockRazorpayDismiss,
  blockRazorpayScript,
  HAS_SEEDED_TEST_BACKEND,
} from "../helpers/mock-auth";

/**
 * Checkout → Tree rental (/checkout/rental/[id])
 *
 * SIMULATED AUTH: see tests/helpers/mock-auth.ts. `/checkout/rental/[id]`
 * (app/(checkout)/checkout/rental/[id]/page.tsx) is a Server Component
 * behind `requireUser()` that additionally fetches the tree
 * (`getTreeById(id)`) and, only if the tree is currently rented, the active
 * rental (`getActiveRental(id)`) before deciding whether to render checkout,
 * drop the user straight into the success screen, or call `notFound()`.
 * None of that branching is reachable without a real tree row in the DB, so
 * this file focuses on:
 *   (a) the one branch reproducible with ANY id — a tree that doesn't
 *       resolve at all — which is exactly the code path an already-rented
 *       tree ALSO falls into (see the second test below), and
 *   (b) the client-side behaviour of `<RentalCheckoutClient>` (address
 *       validation, the farm-visit toggle, the Razorpay hook), which is
 *       real, unmocked JS regardless of how the page's tree data arrived.
 *
 * Note: `RentalCheckoutClient` imports `useRentalStore` (store/use-rental-store.ts)
 * but does not actually read `selectedPlan` from it anywhere in the
 * component — the tree being checked out comes entirely from the `[id]`
 * route param via the server-side `getTreeById()` call. Seeding that store
 * would have no effect on this page, so these tests don't bother.
 */

const VALID_ADDRESS = {
  name: MOCK_USER.full_name,
  phone: "9876543210",
  line1: "12-3 Orchard Lane",
  locality: "Benz Circle",
  city: "Vijayawada",
  district: "NTR",
  state: "Andhra Pradesh",
  pincode: "520008",
};

test.describe("Rental checkout", () => {
  // NOTE: unlike the store checkout, most tests below are `test.fixme` — see
  // the file header. Razorpay mocking is applied per-test (not in a blanket
  // beforeEach) since the "stays disabled" test specifically needs the
  // opposite (no window.Razorpay stub) to be meaningful.
  test.beforeEach(async ({ context, page }) => {
    test.skip(!HAS_SEEDED_TEST_BACKEND, "needs a real authenticated render — see tests/helpers/mock-auth.ts");
    await mockAuthSession(context, page, MOCK_USER);
  });

  test("checking out a tree id that does not resolve renders Next's not-found page", async ({ page }) => {
    // getTreeById() throws for a nonexistent id → the page's catch block
    // calls notFound(). This is the SAME branch an already-rented tree hits
    // when `tree.status === "rented"` and the requesting user isn't the
    // active renter (page.tsx: `if (tree.status === "rented") return notFound();`).
    // In other words: TreeKart currently shows the shopper an identical
    // generic 404 for "this tree doesn't exist" and "someone else just
    // rented this tree" — there is no differentiated "already rented, please
    // pick another tree" message. Documented here as a UX observation as
    // much as a functional test.
    const nonExistentTreeId = "00000000-9999-4999-8999-000000000000";
    await page.goto(`/checkout/rental/${nonExistentTreeId}`);

    await expect(page.getByText(/lost in the orchard/i)).toBeVisible();
  });

  test("Rent Now is blocked by address validation until all required fields are valid", async ({ page }) => {
    // This still needs to reach a rendered checkout screen for a real,
    // available tree — server/DB-dependent (see file header). Run against a
    // seeded staging project; the assertions below describe the intended
    // contract of lib/checkout-validation.ts validateAddress().
    test.fixme(
      true,
      "Requires a seeded, available tree row — the [id] route param must resolve " +
      "server-side via getTreeById() before RentalCheckoutClient ever mounts."
    );

    await mockRazorpaySuccess(page);
    // NOTE: seeding a blank `name` here is not enough on its own —
    // RentalCheckoutClient's sync effect (`if (_hasHydrated && !address.name && user.full_name)`)
    // will fill it back in from the signed-in profile as soon as it mounts,
    // same as the store checkout's name/phone sync (see cart-checkout.spec.ts).
    // Once a real tree row unblocks this test, clear the name field live
    // (e.g. `page.locator('#name').fill('')`) right before submitting if the
    // "Full name is required" branch specifically needs to be reproduced.
    await seedDeliveryAddress(page, {
      name: "", phone: "", line1: "", city: "", state: "", pincode: "",
    });
    await page.goto("/checkout/rental/SEED-A-REAL-AVAILABLE-TREE-ID");

    await page.getByRole("button", { name: /complete rental/i }).click();
    await expect(page.getByText("Street address is required")).toBeVisible();
    await expect(page.getByText("Enter a valid 6-digit pincode")).toBeVisible();
  });

  test("toggling the Farm Visit switch updates the summary from Optional to Requested", async ({ page }) => {
    test.fixme(
      true,
      "Requires a seeded, available tree row — see the note on the previous test."
    );

    await mockRazorpaySuccess(page);
    await seedDeliveryAddress(page, VALID_ADDRESS);
    await page.goto("/checkout/rental/SEED-A-REAL-AVAILABLE-TREE-ID");

    const visitSwitch = page.getByRole("switch", { name: /request an orchard visit/i });
    await expect(page.getByText("Optional")).toBeVisible();
    await visitSwitch.click();
    await expect(page.getByText("Requested")).toBeVisible();
  });

  test("Complete Rental stays disabled while the Razorpay script has not loaded", async ({ page }) => {
    test.fixme(
      true,
      "Requires a seeded, available tree row — see the note on the previous tests."
    );

    await blockRazorpayScript(page);
    await seedDeliveryAddress(page, VALID_ADDRESS);
    await page.goto("/checkout/rental/SEED-A-REAL-AVAILABLE-TREE-ID");

    await expect(page.getByRole("button", { name: /complete rental/i })).toBeDisabled();
  });

  test("dismissing the Razorpay modal releases the tree reservation and re-enables the form", async ({ page }) => {
    // Exercises RentalCheckoutClient's onDismiss handler, which calls
    // releaseTreeReservation(tree.id) (a Server Action — server/DB-dependent)
    // and shows "Payment cancelled. You can try again whenever you're ready."
    test.fixme(
      true,
      "Requires a seeded, available tree row, and releaseTreeReservation() " +
      "is itself a server round-trip this suite cannot fake end-to-end."
    );

    await mockRazorpayDismiss(page);
    await seedDeliveryAddress(page, VALID_ADDRESS);
    await page.goto("/checkout/rental/SEED-A-REAL-AVAILABLE-TREE-ID");

    await page.getByRole("button", { name: /complete rental/i }).click();
    await expect(page.getByText(/payment cancelled/i)).toBeVisible();
  });
});
