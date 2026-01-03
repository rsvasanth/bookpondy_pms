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
        <Card className={cn("border border-border/50 shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden group hover:border-primary/30 transition-all duration-300", className)}>
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50 p-4 bg-muted/20">
                <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center bg-background border border-border shadow-sm">
                        {icon}
                    </div>
                    <span>{title}</span>
                    <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
                        {items.length}
                    </Badge>
                </CardTitle>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:bg-muted rounded-md transition-colors">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="p-4 pt-1">
                {isLoading ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="h-5 w-5 animate-spin text-primary/30" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground/50 text-sm italic">
                        No records
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {items.map((item, index) => (
                            <div
                                key={item.id}
                                className={cn(
                                    "flex items-center justify-between py-2.5 group/item cursor-pointer",
                                    index !== items.length - 1 && "border-b border-border/30"
                                )}
                            >
                                <div className="flex-1 min-w-0 pr-4">
                                    <h4 className="text-sm font-semibold text-foreground truncate group-hover/item:text-primary transition-colors leading-tight">{item.title}</h4>
                                    <p className="text-xs text-muted-foreground truncate font-medium mt-0.5 leading-none">{item.subtitle}</p>
                                </div>

                                <div className="flex items-center gap-2.5">
                                    {item.status && (
                                        <Badge
                                            className={cn(
                                                "rounded-md px-1.5 py-0 text-[10px] font-medium shadow-none transition-all",
                                                item.status === "Urgent" && "bg-error text-white border-error/20",
                                                item.status === "High" && "bg-error/80 text-white",
                                                (item.status === "Open" || item.status === "New") && "bg-info text-white",
                                                item.status === "In Progress" && "bg-warning text-white",
                                                item.status === "Resolved" && "bg-success text-white",
                                                !["Urgent", "High", "Open", "In Progress", "Resolved", "New"].includes(item.status) && "bg-muted text-muted-foreground"
                                            )}
                                        >
                                            {item.status}
                                        </Badge>
                                    )}

                                    {item.value && (
                                        <span className="text-sm font-semibold text-foreground tabular-nums tracking-tight leading-none">
                                            {item.value}
                                        </span>
                                    )}

                                    {renderItemActions && (
                                        <div className="ml-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
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
                    className="w-full mt-2 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 h-8 gap-1.5 transition-all"
                    onClick={onViewAll}
                >
                    View All Activity <ArrowRight className="h-3 w-3" />
                </Button>
            </CardContent>
        </Card>
    )
}
