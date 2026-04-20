import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    href?: string;
    label: React.ReactNode;
    icon?: React.ReactNode;
    className?: string;
    fillClassName?: string;
    hoverTextClassName?: string;
    hideArrow?: boolean;
}

export function AnimatedButton({ 
    href, 
    label, 
    icon,
    className, 
    fillClassName = "bg-white", 
    hoverTextClassName = "hover:text-foreground", 
    hideArrow, 
    disabled, 
    ...props 
}: AnimatedButtonProps) {
    
    const content = (
        <>
            <span
                className={cn(
                    "absolute inset-0 -z-0 translate-y-full transition-transform duration-300 ease-out",
                    !disabled && "group-hover:translate-y-0",
                    fillClassName
                )}
            />
            {icon && <span className="relative z-10">{icon}</span>}
            <span className="relative z-10">{label}</span>
            {!hideArrow && (
                <ArrowRight
                    className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                    strokeWidth={2}
                />
            )}
        </>
    );

    const baseClasses = cn(
        "group relative inline-flex w-full justify-center items-center gap-3 overflow-hidden border px-8 py-4 text-[0.8125rem] font-bold uppercase tracking-[0.2em] transition-colors duration-300",
        disabled && "opacity-60 cursor-not-allowed bg-muted text-muted-foreground border-transparent",
        !disabled && hoverTextClassName,
        className
    );

    if (href && !disabled) {
        return (
            <Link href={href} className={baseClasses}>
                {content}
            </Link>
        );
    }

    return (
        <button disabled={disabled} className={baseClasses} {...props}>
            {content}
        </button>
    );
}

