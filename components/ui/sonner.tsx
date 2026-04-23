"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="bottom-center"
      closeButton={false}
      visibleToasts={3}
      toastOptions={{
        duration: 3000,
        classNames: {
          toast: [
            "!rounded-full !px-5 !py-3 !gap-2.5 !border !shadow-2xl",
            "!text-xs !font-black !uppercase !tracking-widest",
            "!min-w-0 !w-auto !max-w-sm",
          ].join(" "),
          title: "!font-black !text-xs !uppercase !tracking-widest",
          icon: "!size-3.5",
          success: "!bg-white !border-green-200 !text-green-700 [&>[data-icon]]:!text-green-500",
          error: "!bg-white !border-red-200   !text-red-700   [&>[data-icon]]:!text-red-500",
          warning: "!bg-white !border-amber-200 !text-amber-700 [&>[data-icon]]:!text-amber-500",
          info: "!bg-white !border-blue-200  !text-blue-700  [&>[data-icon]]:!text-blue-500",
          loading: "!bg-white !border-slate-200 !text-slate-700",
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-3.5" />,
        info: <InfoIcon className="size-3.5" />,
        warning: <TriangleAlertIcon className="size-3.5" />,
        error: <OctagonXIcon className="size-3.5" />,
        loading: <Loader2Icon className="size-3.5 animate-spin" />,
      }}
      {...props}
    />
  )
}

export { Toaster }