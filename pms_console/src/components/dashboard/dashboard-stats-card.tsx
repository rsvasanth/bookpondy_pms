import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface DashboardStatsCardProps {
    title: string
    value: string
    subtext?: string
    icon: LucideIcon
    trend?: "up" | "down" | "neutral"
    trendValue?: string
    className?: string
}

export function DashboardStatsCard({
    title,
    value,
    subtext,
    icon: Icon,
    trend,
    trendValue,
    className
}: DashboardStatsCardProps) {
    const isPositive = trend === "up"
    const isNeutral = trend === "neutral"

    return (
        <Card className={cn("border border-border/50 shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden group hover:border-primary/30 transition-all duration-300", className)}>
            <CardContent className="p-4 relative">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">{title}</span>
                    <div className="h-7 w-7 rounded-md flex items-center justify-center bg-muted/50 border border-border/50 transition-colors">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                </div>

                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground tracking-tight leading-none">{value}</span>
                    {trend && (
                        <span className={cn(
                            "text-[10px] font-medium px-1.5 py-0.5 rounded-sm border",
                            isPositive && "bg-success/10 text-success border-success/20",
                            !isPositive && !isNeutral && "bg-error/10 text-error border-error/20",
                            isNeutral && "bg-muted text-muted-foreground border-border/50"
                        )}>
                            {isPositive ? "↑" : isNeutral ? "" : "↓"} {trendValue}
                        </span>
                    )}
                </div>

                {subtext && (
                    <p className="text-xs text-muted-foreground font-medium mt-2 leading-tight">{subtext}</p>
                )}
            </CardContent>
        </Card>
    )
}
