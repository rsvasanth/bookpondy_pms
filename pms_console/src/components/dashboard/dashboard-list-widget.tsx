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
    onViewAll?: () => void
    renderItemActions?: (item: DashboardListItem) => React.ReactNode
}

export function DashboardListWidget({ title, icon, items, isLoading, className, renderItemActions, onViewAll }: DashboardListWidgetProps) {
    return (
        <Card className={cn("border border-border shadow-sm rounded-lg bg-card transition-all hover:shadow-md", className)}>
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border p-4 bg-muted/30">
                <CardTitle className="text-[10px] font-black text-muted-foreground flex items-center gap-2 uppercase tracking-[0.2em]">
                    <span className="w-5 h-5 rounded flex items-center justify-center bg-card border border-border text-foreground shadow-sm">
                        {icon}
                    </span>
                    {title} <span className="text-muted-foreground/50">({items.length})</span>
                </CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted rounded-md">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="p-4 pt-2">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-primary/20" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground/40 text-[10px] font-bold uppercase tracking-[0.3em]">
                        NO RECORDS FOUND
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {items.map((item, index) => (
                            <div
                                key={item.id}
                                className={cn(
                                    "flex items-center justify-between py-4 group",
                                    index !== items.length - 1 && "border-b border-border/50"
                                )}
                            >
                                <div className="flex-1 min-w-0 pr-4">
                                    <h4 className="text-xs font-black text-foreground truncate uppercase tracking-tight group-hover:text-primary transition-colors">{item.title}</h4>
                                    <p className="text-[10px] text-muted-foreground truncate font-bold uppercase tracking-widest mt-0.5 opacity-70">{item.subtitle}</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    {item.status && (
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "rounded-md px-2 py-0.5 text-[8px] font-black uppercase tracking-tight shadow-none border-none",
                                                item.status === "Urgent" && "bg-rose-500/10 text-rose-500",
                                                item.status === "High" && "bg-orange-500/10 text-orange-500",
                                                item.status === "Open" && "bg-amber-500/10 text-amber-500",
                                                item.status === "In Progress" && "bg-blue-500/10 text-blue-500",
                                                item.status === "Resolved" && "bg-emerald-500/10 text-emerald-500",
                                                item.status === "New" && "bg-indigo-500/10 text-indigo-500",
                                                !["Urgent", "High", "Open", "In Progress", "Resolved", "New"].includes(item.status) && "bg-muted text-muted-foreground"
                                            )}
                                        >
                                            {item.status}
                                        </Badge>
                                    )}

                                    {item.value && (
                                        <span className="text-sm font-bold text-foreground tabular-nums tracking-tight">
                                            {item.value}
                                        </span>
                                    )}

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
                    className="w-full mt-2 text-xs font-bold text-foreground hover:bg-muted h-9 gap-1"
                    onClick={onViewAll}
                >
                    View All <ArrowRight className="h-3 w-3" />
                </Button>
            </CardContent>
        </Card>
    )
}
