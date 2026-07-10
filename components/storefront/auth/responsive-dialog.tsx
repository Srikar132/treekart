"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

/**
 * One dialog, two presentations:
 *   mobile  → sheet sliding down from the top
 *   desktop → centered modal
 *
 * Shared by onboarding and the checkout email prompt so both look identical.
 *
 * `dismissible: false` prevents a click-outside or Escape from closing a dialog
 * the user must complete. Note this is UX only — the real gate is server-side
 * (proxy for onboarding, order actions for the email requirement).
 */
export function ResponsiveDialog({
    open,
    onOpenChange,
    title,
    description,
    icon,
    dismissible = true,
    children,
}: {
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    title: string;
    description?: string;
    icon?: React.ReactNode;
    dismissible?: boolean;
    children: React.ReactNode;
}) {
    const isMobile = useIsMobile();

    const handleOpenChange = (next: boolean) => {
        if (!dismissible && !next) return;
        onOpenChange?.(next);
    };

    const header = (
        <div className="flex flex-col items-center gap-4 text-center">
            {icon && (
                <div className="inline-flex items-center justify-center border border-primary/20 bg-primary/5 p-3">
                    {icon}
                </div>
            )}
        </div>
    );

    if (isMobile) {
        return (
            <Sheet open={open} onOpenChange={handleOpenChange}>
                <SheetContent
                    side="top"
                    showCloseButton={dismissible}
                    className="rounded-none border-b border-border bg-card px-6 pb-8 pt-10"
                >
                    {header}
                    <SheetHeader className="items-center gap-2 text-center">
                        <SheetTitle className="text-2xl font-bold uppercase tracking-tight text-foreground">
                            {title}
                        </SheetTitle>
                        {description && (
                            <SheetDescription className="p-sm max-w-sm">
                                {description}
                            </SheetDescription>
                        )}
                    </SheetHeader>
                    <div className="mt-6">{children}</div>
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                showCloseButton={dismissible}
                className="rounded-none border border-border bg-card p-card sm:max-w-md"
            >
                {header}
                <DialogHeader className="items-center gap-2 text-center">
                    <DialogTitle className="text-2xl font-bold uppercase tracking-tight text-foreground">
                        {title}
                    </DialogTitle>
                    {description && (
                        <DialogDescription className="p-sm">{description}</DialogDescription>
                    )}
                </DialogHeader>
                <div className="mt-4">{children}</div>
            </DialogContent>
        </Dialog>
    );
}
