const PLAN_COLORS: { match: string[]; cls: string }[] = [
    { match: ["max"],                  cls: "bg-amber-500" },
    { match: ["standard"],             cls: "bg-indigo-600" },
    { match: ["base", "basic"],        cls: "bg-sky-600"   },
];

export function getPlanBadgeClass(planName: string): string {
    const lower = planName.toLowerCase();
    return PLAN_COLORS.find(({ match }) => match.some(m => lower.includes(m)))?.cls ?? "bg-slate-500";
}
