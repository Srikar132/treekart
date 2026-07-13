import { requireUser } from "@/lib/auth";

export default async function AccountTabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();

  return (
    <div
      className="w-full max-w-full overflow-x-hidden pb-16"
      style={{ overflowX: "hidden", maxWidth: "100vw" }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="animate-in overflow-x-hidden fade-in slide-in-from-bottom-4 duration-700 min-h-[400px]">
          {children}
        </div>
      </div>
    </div>
  );
}
