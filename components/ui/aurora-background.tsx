"use client"

import type React from "react"
import type { ReactNode } from "react"
import { cn } from "@/lib/cn"

interface AuroraBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  showRadialGradient?: boolean
  /** Animation duration in seconds. Default 60s — higher = slower = cheaper. */
  animationSpeed?: number
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  animationSpeed = 60,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center bg-zinc-900",
        className,
      )}
      {...props}
    >
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          contain: "layout style paint",
          // CSS variables must use real spaces — underscores are only for Tailwind class strings
          "--aurora":
            "repeating-linear-gradient(100deg,#10b981 10%,#34d399 15%,#6ee7b7 20%,#2dd4bf 25%,#14b8a6 30%)",
          "--dark-gradient":
            "repeating-linear-gradient(100deg,#000 0%,#000 7%,transparent 10%,transparent 12%,#000 16%)",
          "--black": "#000",
          "--transparent": "transparent",
          "--animation-speed": `${animationSpeed}s`,
        } as React.CSSProperties}
      >
        <div
          className={cn(
            `pointer-events-none absolute -inset-[10px]`,
            `[background-image:var(--dark-gradient),var(--aurora)]`,
            `[background-size:50%,_30%] [background-position:50%_50%,50%_50%]`,
            `opacity-70 blur-[3px] filter will-change-transform`,
            `after:absolute after:inset-0 after:content-[""]`,
            `after:[background-image:var(--dark-gradient),var(--aurora)]`,
            `after:[background-size:40%,_20%]`,
            `after:[animation:aurora_var(--animation-speed)_linear_infinite]`,
            showRadialGradient &&
              "[mask-image:radial-gradient(ellipse_at_100%_0%,black_40%,transparent_100%)]",
          )}
        />
      </div>
      {children}
    </div>
  )
}

export default AuroraBackground
