import type React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface KPICardProps {
  title: string
  value: string
  subValue?: string
  change?: number
  changeLabel?: string
  icon: React.ReactNode
  trend?: "up" | "down" | "neutral"
  variant?: "teal" | "green" | "pink" | "gold" | "default"
}

export function KPICard({
  title,
  value,
  subValue,
  change,
  changeLabel,
  icon,
  trend = "neutral",
  variant = "default"
}: KPICardProps) {
  const variants = {
    teal: "bg-[#E6F6F4] text-[#00A79D]",
    green: "bg-[#E8F5E9] text-[#2E7D32]",
    pink: "bg-[#FCE4EC] text-[#D81B60]",
    gold: "bg-[#FFF8E1] text-[#F57F17]",
    default: "bg-black/5 text-black dark:bg-white/10 dark:text-white"
  }

  return (
    <Card className={cn(
      "border-none shadow-none",
      variant === "teal" && "bg-[#E6F6F4]/50",
      variant === "green" && "bg-[#E8F5E9]/50",
      variant === "pink" && "bg-[#FCE4EC]/50",
      variant === "gold" && "bg-[#FFF8E1]/50",
    )}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold tracking-tight">{value}</p>
              {subValue && (
                <span className="text-xs font-medium text-muted-foreground">
                  ({subValue})
                </span>
              )}
            </div>
            {change !== undefined && (
              <div className="flex items-center gap-1 text-[11px] font-bold mt-1">
                {trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
                {trend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
                {trend === "neutral" && <Minus className="h-3 w-3 text-muted-foreground" />}
                <span
                  className={cn(
                    trend === "up" && "text-green-500",
                    trend === "down" && "text-red-500",
                    trend === "neutral" && "text-muted-foreground",
                  )}
                >
                  {change > 0 ? "+" : ""}
                  {change}%
                </span>
                {changeLabel && <span className="text-muted-foreground font-medium ml-1">{changeLabel}</span>}
              </div>
            )}
          </div>
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm transition-transform hover:scale-105",
            variants[variant]
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
