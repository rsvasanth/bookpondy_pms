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
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground group-hover:text-primary transition-colors">{title}</span>
                    <div className="h-7 w-7 rounded-md flex items-center justify-center bg-muted/50 border border-border/50 group-hover:scale-110 transition-transform">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                </div>

                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-foreground tracking-tighter leading-none">{value}</span>
                    {trend && (
                        <span className={cn(
                            "text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm border",
                            isPositive && "bg-emerald-500/5 text-emerald-600 border-emerald-500/10",
                            !isPositive && !isNeutral && "bg-rose-500/5 text-rose-600 border-rose-500/10",
                            isNeutral && "bg-muted/50 text-muted-foreground border-border/50"
                        )}>
                            {isPositive ? "↑" : isNeutral ? "" : "↓"} {trendValue}
                        </span>
                    )}
                </div>

                {subtext && (
                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-2 opacity-60 leading-tight">{subtext}</p>
                )}

                <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary group-hover:w-full transition-all duration-500" />
            </CardContent>
        </Card>
    )
}
