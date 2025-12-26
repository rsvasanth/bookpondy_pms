"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ArrowRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface DashboardListItem {
    id: string
    title: string
    subtitle?: string
    status?: string
    statusColor?: "default" | "secondary" | "destructive" | "outline" | "emerald" | "amber" | "blue" | "slate"
    date?: string
    value?: string
    image?: string
    raw?: any
}

interface DashboardListWidgetProps {
    title: string
    icon: React.ReactNode
    items: DashboardListItem[]
    isLoading?: boolean
    className?: string
    renderItemActions?: (item: DashboardListItem) => React.ReactNode
}

export function DashboardListWidget({ title, icon, items, isLoading, className, renderItemActions }: DashboardListWidgetProps) {
    return (
        <Card className={cn("border border-slate-100 shadow-sm rounded-xl bg-white transition-all hover:shadow-md hover:border-[#ff3924]/30", className)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-50 p-3">
                <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-6 h-6 rounded flex items-center justify-center bg-slate-50 text-slate-500">
                        {icon}
                    </span>
                    {title} <span className="text-slate-400 font-medium">({items.length})</span>
                </CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:bg-slate-50 rounded-lg">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="p-3 pt-1">
                {isLoading ? (
                    <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs font-medium uppercase tracking-wide">
                        No items found
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {items.map((item, index) => (
                            <div
                                key={item.id}
                                className={cn(
                                    "flex items-center justify-between py-3",
                                    index !== items.length - 1 && "border-b border-slate-50"
                                )}
                            >
                                <div className="flex-1 min-w-0 pr-4">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h4 className="text-sm font-semibold text-slate-800 truncate">{item.title}</h4>
                                    </div>
                                    <p className="text-xs text-slate-400 truncate font-medium">{item.subtitle}</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    {item.status && (
                                        <Badge
                                            variant="secondary"
                                            className={cn(
                                                "rounded md:px-2 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide shadow-none border-none",
                                                item.status === "Urgent" && "bg-rose-50 text-rose-600",
                                                item.status === "High" && "bg-orange-50 text-orange-600",
                                                item.status === "Open" && "bg-amber-50 text-amber-600",
                                                item.status === "In Progress" && "bg-[#ff3924]/10 text-[#ff3924]",
                                                item.status === "Resolved" && "bg-emerald-50 text-emerald-600",
                                                item.status === "New" && "bg-purple-50 text-purple-600",
                                                !["Urgent", "High", "Open", "In Progress", "Resolved", "New"].includes(item.status) && "bg-slate-100 text-slate-500"
                                            )}
                                        >
                                            {item.status}
                                        </Badge>
                                    )}

                                    {item.value && (
                                        <span className="text-sm font-bold text-[#0f0f14] tabular-nums tracking-tight">
                                            {item.value}
                                        </span>
                                    )}

                                    {/* Action slot if needed, hidden on smaller screens usually or simplified */}
                                    {renderItemActions && (
                                        <div className="hidden sm:flex ml-2">
                                            {renderItemActions(item)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <Button
                    variant="ghost"
                    className="w-full mt-2 text-xs font-bold text-[#ff3924] hover:bg-slate-50 hover:text-[#d6301e] h-9 gap-1"
                >
                    View All <ArrowRight className="h-3 w-3" />
                </Button>
            </CardContent>
        </Card>
    )
}
