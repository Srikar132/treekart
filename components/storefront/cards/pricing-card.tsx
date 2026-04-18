import { Check } from "lucide-react";
import { AnimatedButton } from "@/components/shared/animated-button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export type Feature = {
    text: string;
    isHighlight?: boolean;
    highlightColor?: string;
};

export type Package = {
    title: string;
    badge?: string;
    badgeColor?: string;
    status?: string;
    statusColor?: string;
    features: Feature[];
    buttonText: string;
    disabled: boolean;
    isCustom?: boolean;
    pricingText?: string;
    pricingSub?: string;
};

export function PricingCard({ pkg }: { pkg: Package }) {
    return (
        <Card className={`flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${pkg.disabled ? 'opacity-85' : 'hover:ring-1 hover:ring-primary/20'}`}>
            <CardHeader className="flex flex-row justify-between items-start pb-4">
                <div>
                    <CardTitle className="mb-2 text-foreground/90">{pkg.title}</CardTitle>
                    {pkg.isCustom ? (
                        <div className="flex items-baseline gap-1.5 mt-2">
                            <span className="text-[1.75rem] font-bold text-foreground">{pkg.pricingText}</span>
                            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{pkg.pricingSub}</span>
                        </div>
                    ) : (
                        <div className={`font-semibold tracking-wide mt-2 ${pkg.statusColor}`}>
                            {pkg.status}
                        </div>
                    )}
                </div>
                {pkg.badge && (
                    <span className={`px-2.5 py-1 text-[0.6875rem] uppercase tracking-wider font-bold rounded-md text-white shadow-sm ${pkg.badgeColor || 'bg-slate-600'}`}>
                        {pkg.badge}
                    </span>
                )}
            </CardHeader>

            <CardContent className="flex-1">
                <ul className="space-y-4">
                    {pkg.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                            <Check className="w-4 h-4 mt-0.5 text-primary shrink-0" strokeWidth={2.5} />
                            <span className={`text-[0.9375rem] leading-snug ${feature.isHighlight ? `${feature.highlightColor} px-2.5 py-1 rounded-md font-semibold text-foreground` : 'text-muted-foreground font-medium'}`}>
                                {feature.text}
                            </span>
                        </li>
                    ))}
                </ul>
            </CardContent>

            <CardFooter className="pt-6">
                <AnimatedButton
                    disabled={pkg.disabled}
                    label={pkg.buttonText}
                    href={pkg.isCustom ? "/contact" : undefined}
                    hideArrow
                    className={pkg.disabled
                        ? "w-full border-transparent"
                        : "w-full border-foreground bg-foreground text-background"}
                    fillClassName="bg-white"
                    hoverTextClassName="hover:text-foreground"
                />
            </CardFooter>
        </Card>
    );
}
