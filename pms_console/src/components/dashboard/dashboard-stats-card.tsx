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
        <Card className={cn("border border-border shadow-sm rounded-lg bg-card transition-all hover:shadow-md", className)}>
            <CardContent className="p-4">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</span>
                    <div className="flex items-end justify-between">
                        <span className="text-3xl font-black text-foreground tracking-tighter">{value}</span>
                        {trend && (
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                                isPositive && "bg-emerald-500/10 text-emerald-600",
                                !isPositive && !isNeutral && "bg-rose-500/10 text-rose-600",
                                isNeutral && "bg-muted text-muted-foreground"
                            )}>
                                {isPositive ? "↑" : isNeutral ? "-" : "↓"} {trendValue}
                            </span>
                        )}
                    </div>
                    {subtext && (
                        <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{subtext}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
