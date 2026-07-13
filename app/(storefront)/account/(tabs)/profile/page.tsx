import { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { ProfileSettings } from "@/components/storefront/account/profile-settings";

export const metadata: Metadata = {
  title: "Profile Settings — TreeKart",
  robots: { index: false, follow: false },
};

export default async function AccountProfilePage() {
  const user = await requireUser();

  return <ProfileSettings user={user} />;
}
