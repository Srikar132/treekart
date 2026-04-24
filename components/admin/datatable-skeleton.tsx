// components/admin/data-table-skeleton.tsx
export function DataTableSkeleton({ cols = 5, rows = 8 }: { cols?: number; rows?: number }) {
    return (
        <div className="data-card overflow-hidden !p-0">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="admin-table-header border-b border-border">
                            {Array.from({ length: cols }).map((_, i) => (
                                <th key={i} className="py-5 px-6">
                                    <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {Array.from({ length: rows }).map((_, i) => (
                            <tr key={i}>
                                {Array.from({ length: cols }).map((_, j) => (
                                    <td key={j} className="py-5 px-6">
                                        <div className="h-4 bg-muted/50 rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}