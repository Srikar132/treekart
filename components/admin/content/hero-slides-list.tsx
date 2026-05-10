// components/admin/content/hero-slides-list.tsx
"use client"

import { useState, useEffect, useTransition } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from "@dnd-kit/sortable"
import { HeroSlideCard } from "./hero-slide-card"
import { adminUpdateHeroSlidesOrder } from "@/actions/admin.actions"
import { toast } from "sonner"
import { Loader2, Save } from "lucide-react"

interface HeroSlidesListProps {
  initialSlides: any[]
}

export function HeroSlidesList({ initialSlides }: HeroSlidesListProps) {
  const [items, setItems] = useState(initialSlides)
  const [isPending, startTransition] = useTransition()
  const [isDirty, setIsDirty] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement required to start drag (prevents accidental clicks)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    setItems(initialSlides)
  }, [initialSlides])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        const newItems = arrayMove(items, oldIndex, newIndex)
        setIsDirty(true)
        return newItems
      })
    }
  }

  const saveNewOrder = () => {
    startTransition(async () => {
      try {
        const orderData = items.map((item, index) => ({
          id: item.id,
          order_index: index
        }))
        await adminUpdateHeroSlidesOrder(orderData)
        setIsDirty(false)
        toast.success("Sequence synchronized")
      } catch (err: any) {
        toast.error(err.message || "Failed to update sequence")
        setItems(initialSlides)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end bg-muted/30 p-4 rounded-2xl border border-border/50">
        <div>
          <h3 className="text-xs font-black uppercase tracking-tight text-foreground mb-1">Sequence Orchestrator</h3>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
            Adjust slide order. New sequence applies instantly to storefront.
          </p>
        </div>
        {isDirty && (
          <button
            onClick={saveNewOrder}
            disabled={isPending}
            className="admin-button-primary px-6 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
          >
            {isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Synchronize Sequence
          </button>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {items.map((slide) => (
              <HeroSlideCard key={slide.id} slide={slide} isSortable />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {items.length === 0 && (
        <div className="h-40 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-muted-foreground/30">
          <p className="text-[10px] font-black uppercase tracking-widest">No active slides</p>
        </div>
      )}
    </div>
  )
}
