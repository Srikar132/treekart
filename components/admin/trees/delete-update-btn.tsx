"use client"

import { useTransition } from "react"
import { Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { adminDeleteTreeUpdate } from "@/actions/admin.actions"
import { toast } from "sonner"

interface DeleteUpdateBtnProps {
    updateId: string;
    rentalId: string;
}

export function DeleteUpdateBtn({ updateId, rentalId }: DeleteUpdateBtnProps) {
    const [isPending, startTransition] = useTransition()

    const handleDelete = () => {
        if (!confirm("Are you sure you want to delete this log entry?")) return

        startTransition(async () => {
            try {
                await adminDeleteTreeUpdate(updateId, rentalId)
                toast.success("Log entry deleted")
            } catch (err: any) {
                toast.error(err?.message || "Failed to delete log entry")
            }
        })
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={isPending}
            className="h-8 w-8 text-slate-300 hover:text-destructive hover:bg-destructive/5 rounded-lg transition-colors"
        >
            {isPending ? (
                <Loader2 size={14} className="animate-spin text-destructive" />
            ) : (
                <Trash2 size={14} />
            )}
        </Button>
    )
}
