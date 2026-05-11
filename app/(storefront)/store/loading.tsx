import { Skeleton } from "@/components/ui/skeleton";

export default function StoreLoading() {
  return (
    <main className="section container">
      <div className="section-header text-center mb-10 flex flex-col items-center">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-6 w-full max-w-2xl" />
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b">
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24 rounded-md" />
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>

        <div className="text-sm">
          <Skeleton className="h-5 w-40" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden h-full flex flex-col">
              <Skeleton className="aspect-[4/3] w-full" />
              <div className="p-5 space-y-4 flex-1">
                <Skeleton className="h-5 w-3/4" />
                <div className="h-px bg-border/40 w-full" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="flex justify-between items-end pt-2">
                  <div className="space-y-1">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-2 w-12" />
                  </div>
                  <Skeleton className="h-6 w-12 rounded-md" />
                </div>
              </div>
              <div className="px-5 pb-5 lg:hidden">
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
