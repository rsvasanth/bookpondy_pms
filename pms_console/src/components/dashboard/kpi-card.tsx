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
      "border border-border shadow-sm rounded-lg bg-card overflow-hidden"
    )}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black tracking-tight text-foreground">{value}</p>
              {subValue && (
                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                  {subValue}
                </span>
              )}
            </div>
            {change !== undefined && (
              <div className="flex items-center gap-1.5 text-[10px] font-bold mt-2">
                {trend === "up" && <TrendingUp className="h-3 w-3 text-emerald-500" />}
                {trend === "down" && <TrendingDown className="h-3 w-3 text-rose-500" />}
                {trend === "neutral" && <Minus className="h-3 w-3 text-muted-foreground" />}
                <span
                  className={cn(
                    "uppercase tracking-wider",
                    trend === "up" && "text-emerald-500",
                    trend === "down" && "text-rose-500",
                    trend === "neutral" && "text-muted-foreground",
                  )}
                >
                  {change > 0 ? "+" : ""}
                  {change}%
                </span>
                {changeLabel && <span className="text-muted-foreground font-bold uppercase ml-1 opacity-60">{changeLabel}</span>}
              </div>
            )}
          </div>
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-md border border-border transition-colors",
            variant === "teal" ? "bg-emerald-500/10 text-emerald-500" :
              variant === "green" ? "bg-green-500/10 text-green-500" :
                variant === "pink" ? "bg-rose-500/10 text-rose-500" :
                  variant === "gold" ? "bg-amber-500/10 text-amber-500" :
                    "bg-muted text-muted-foreground"
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
