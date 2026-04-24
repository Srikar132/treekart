"use client"

// import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="rounded-lg h-9 w-9">
        <div className="h-4 w-4 bg-muted animate-pulse rounded-full" />
      </Button>
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-lg h-9 w-9 hover:bg-accent transition-colors"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? (
        <Sun className="h-[1.1rem] w-[1.1rem] transition-all" />
      ) : (
        <Moon className="h-[1.1rem] w-[1.1rem] transition-all text-slate-900" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}