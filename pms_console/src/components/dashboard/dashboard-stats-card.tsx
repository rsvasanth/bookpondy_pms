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
        <Card className={cn("border border-slate-100 shadow-sm rounded-xl bg-white transition-all hover:translate-y-[-1px] hover:shadow-md", className)}>
            <CardContent className="p-4">
                <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{title}</span>
                    <div className="flex items-end justify-between mt-1">
                        <span className="text-2xl font-black text-[#0f0f14] tracking-tight">{value}</span>
                        {trend && (
                            <span className={cn(
                                "text-[10px] font-bold mb-1",
                                isPositive && "text-[#10b981]",
                                !isPositive && !isNeutral && "text-[#ef4444]",
                                isNeutral && "text-slate-400"
                            )}>
                                {isPositive ? "↑" : isNeutral ? "-" : "↓"} {trendValue}
                            </span>
                        )}
                    </div>
                    {subtext && (
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5 opacity-90">{subtext}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
