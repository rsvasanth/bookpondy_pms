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
    teal: "bg-info/10 text-info",
    green: "bg-success/10 text-success",
    pink: "bg-error/10 text-error",
    gold: "bg-warning/10 text-warning",
    default: "bg-muted text-muted-foreground"
  }

  return (
    <Card className={cn(
      "border border-border shadow-sm rounded-lg bg-card overflow-hidden"
    )}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
              {subValue && (
                <span className="text-xs font-medium text-muted-foreground">
                  {subValue}
                </span>
              )}
            </div>
            {change !== undefined && (
              <div className="flex items-center gap-1.5 text-xs font-medium mt-2">
                {trend === "up" && <TrendingUp className="h-3 w-3 text-success" />}
                {trend === "down" && <TrendingDown className="h-3 w-3 text-error" />}
                {trend === "neutral" && <Minus className="h-3 w-3 text-muted-foreground" />}
                <span
                  className={cn(
                    "font-semibold",
                    trend === "up" && "text-success",
                    trend === "down" && "text-error",
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
            "flex h-10 w-10 items-center justify-center rounded-md border border-border transition-colors",
            variant === "teal" ? "bg-info/10 text-info" :
              variant === "green" ? "bg-success/10 text-success" :
                variant === "pink" ? "bg-error/10 text-error" :
                  variant === "gold" ? "bg-warning/10 text-warning" :
                    "bg-muted text-muted-foreground"
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
