"use client"

import { } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    AlertCircle,
    Clock,
    CheckCircle2,
    Plus,
    MessageSquare,
    History
} from "lucide-react"
import { cn } from "@/lib/utils"

const maintenanceIssues = [
    { id: "M-1001", title: "AC Leakage", room: "Room 105", priority: "Critical", status: "Reported", age: "2h ago", staff: "Unassigned" },
    { id: "M-1002", title: "Faucet Replacement", room: "Suite 302", priority: "Medium", status: "In Progress", age: "5h ago", staff: "Kumaran" },
    { id: "M-1003", title: "Wifi Router Connectivity", room: "Lobby", priority: "High", status: "Scheduled", age: "1d ago", staff: "IT Team" },
    { id: "M-1004", title: "Broken Balcony Door", room: "Room 408", priority: "Critical", status: "Reported", age: "10m ago", staff: "Unassigned" },
]

export default function MaintenancePage() {
    return (
        <DashboardLayout>
            <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-xl font-black tracking-tight text-secondary">Maintenance & Engineering</h1>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                        Track and resolve facility issues
                    </p>
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-white rounded-lg h-9 px-4 font-bold text-xs gap-2 shadow-sm">
                    <Plus className="h-4 w-4" /> Log New Issue
                </Button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <Card className="border-none shadow-sm rounded-xl overflow-hidden border-l-4 border-l-primary">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Open Issues</span>
                            <AlertCircle className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <p className="text-2xl font-black text-primary">12</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm rounded-xl overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Critical</span>
                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        </div>
                        <p className="text-2xl font-black">04</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm rounded-xl overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">In Progress</span>
                            <Clock className="h-3.5 w-3.5 text-secondary" />
                        </div>
                        <p className="text-2xl font-black text-secondary">03</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm rounded-xl overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Resolved Today</span>
                            <CheckCircle2 className="h-3.5 w-3.5 text-secondary" />
                        </div>
                        <p className="text-2xl font-black text-secondary">08</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {["Reported", "In Progress", "Completed"].map((status) => (
                    <div key={status} className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <span className={cn(
                                    "h-2 w-2 rounded-full",
                                    status === "Reported" ? "bg-primary" : "bg-secondary"
                                )} />
                                {status}
                            </h3>
                            <Badge variant="secondary" className="rounded-xl px-2.5 py-0.5 text-[10px] font-bold bg-muted text-secondary">
                                {maintenanceIssues.filter(i => i.status === status).length}
                            </Badge>
                        </div>

                        <div className="space-y-4 min-h-[400px]">
                            {maintenanceIssues.filter(i => i.status === status).map((issue) => (
                                <Card key={issue.id} className="border-none shadow-sm rounded-2xl hover:shadow-md transition-all group">
                                    <CardContent className="p-5 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-black text-secondary tracking-tight">#{issue.id}</span>
                                                <h4 className="font-bold text-sm leading-tight group-hover:text-primary transition-colors">{issue.title}</h4>
                                            </div>
                                            <Badge className={cn(
                                                "text-[9px] font-black px-2 py-0.5 rounded-md",
                                                issue.priority === "Critical" ? "bg-primary text-white" : "bg-muted text-secondary"
                                            )}>
                                                {issue.priority}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase">Location</span>
                                                <span className="text-xs font-bold text-secondary">{issue.room}</span>
                                            </div>
                                            <div className="flex flex-col gap-1 items-end">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase">Assigned To</span>
                                                <span className="text-xs font-black text-secondary">{issue.staff}</span>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-muted/30 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                <span>{issue.age}</span>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-muted/30 hover:bg-muted text-secondary">
                                                    <MessageSquare className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-secondary/5 hover:bg-secondary/10 text-secondary">
                                                    <History className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </DashboardLayout>
    )
}
