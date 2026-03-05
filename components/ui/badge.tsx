import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/cn"

const badgeVariants = cva(
    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors gap-1",
    {
        variants: {
            variant: {
                default: "bg-white/10 text-white border border-white/15",
                secondary: "bg-white/5 text-white/60",
                destructive: "bg-red-500/20 text-red-300",
                outline: "border border-white/15 text-white/70",
                success: "bg-[#00C389]/15 text-[#00C389] border border-[#00C389]/20",
            },
        },
        defaultVariants: { variant: "default" },
    },
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
