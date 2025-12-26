"use client"

import { } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    CheckCircle2,
    Clock,
    AlertTriangle,
    Plus,
    LayoutGrid,
    List,
    Timer,
    MoreVertical,
    Check
} from "lucide-react"
import { cn } from "@/lib/utils"

const housekeepingStats = [
    { label: "Total Rooms", value: "48", icon: LayoutGrid, color: "text-secondary", bg: "bg-secondary/10" },
    { label: "Cleaned", value: "32", icon: CheckCircle2, color: "text-secondary", bg: "bg-secondary/10" },
    { label: "Pending", value: "12", icon: Clock, color: "text-primary", bg: "bg-primary/10" },
    { label: "Maintenance", value: "4", icon: AlertTriangle, color: "text-primary", bg: "bg-primary/10" },
]

const tasks = [
    { id: "101", room: "Suite 101", type: "Stayover", status: "In Progress", staff: "Anitha", priority: "High" },
    { id: "204", room: "Deluxe 204", type: "Checkout", status: "Not Ready", staff: "Selvam", priority: "Urgent" },
    { id: "305", room: "Standard 305", type: "Ready", staff: "Ravi", priority: "Low" },
    { id: "102", room: "Suite 102", type: "Checkout", status: "In Progress", staff: "Anitha", priority: "High" },
]

export default function HousekeepingPage() {
    return (
        <DashboardLayout>
            <div className="mb-8 flex flex-col gap-2">
                <h1 className="text-2xl font-black tracking-tight text-secondary">Housekeeping Management</h1>
                <p className="text-muted-foreground font-medium flex items-center gap-2">
                    Track room cleaning statuses and staff assignments in real-time.
                </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {housekeepingStats.map((stat) => (
                    <Card key={stat.label} className="border-none shadow-sm rounded-3xl overflow-hidden group">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                                <div className={cn("p-2 rounded-xl transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                                    <stat.icon className="h-4 w-4" />
                                </div>
                            </div>
                            <p className="text-3xl font-black">{stat.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs defaultValue="kanban" className="space-y-4">
                <div className="flex items-center justify-between bg-white p-1.5 rounded-xl shadow-sm border border-muted">
                    <TabsList className="bg-muted/50 p-1 rounded-lg h-9">
                        <TabsTrigger value="kanban" className="rounded-md px-3 h-7 data-[state=active]:bg-sidebar-primary data-[state=active]:text-white data-[state=active]:shadow-sm text-[10px] font-bold uppercase tracking-tight gap-1.5">
                            <LayoutGrid className="h-3 w-3" /> Kanban
                        </TabsTrigger>
                        <TabsTrigger value="list" className="rounded-md px-3 h-7 data-[state=active]:bg-sidebar-primary data-[state=active]:text-white data-[state=active]:shadow-sm text-[10px] font-bold uppercase tracking-tight gap-1.5">
                            <List className="h-3 w-3" /> List View
                        </TabsTrigger>
                    </TabsList>
                    <Button className="bg-primary hover:bg-primary/90 text-white rounded-lg h-8 px-4 font-bold text-[10px] gap-1.5 shadow-sm uppercase tracking-wider">
                        <Plus className="h-3 w-3" /> Assign Task
                    </Button>
                </div>

                <TabsContent value="kanban" className="m-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {["Not Ready", "In Progress", "Ready"].map((column) => (
                            <div key={column} className="space-y-3">
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="font-black text-xs uppercase tracking-widest text-muted-foreground">{column}</h3>
                                    <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px] bg-muted/50 border-none font-bold">
                                        {tasks.filter(t => t.status === column).length}
                                    </Badge>
                                </div>
                                <div className="space-y-2.5 min-h-[400px]">
                                    {tasks.filter(t => t.status === column).map((task) => (
                                        <Card key={task.room} className="border-none shadow-sm rounded-xl hover:shadow-md transition-all cursor-grab active:cursor-grabbing border-l-4 border-l-primary/30">
                                            <CardContent className="p-3 space-y-2.5">
                                                <div className="flex justify-between items-start">
                                                    <span className="font-black text-sm">{task.room}</span>
                                                    <Badge className={cn(
                                                        "text-[9px] uppercase font-black px-2 py-0.5 rounded-md",
                                                        task.priority === "Urgent" ? "bg-primary text-white" : "bg-muted text-secondary"
                                                    )}>
                                                        {task.priority}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
                                                    <Timer className="h-3 w-3" />
                                                    <span>{task.type}</span>
                                                </div>
                                                <div className="pt-2 border-t border-muted/30 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-6 w-6 rounded-full bg-secondary/10 flex items-center justify-center text-secondary text-[10px] font-bold">
                                                            {task.staff[0]}
                                                        </div>
                                                        <span className="text-[10px] font-bold text-muted-foreground">{task.staff}</span>
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md">
                                                        <MoreVertical className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="list" className="m-0">
                    <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
                        <CardContent className="p-0">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-muted/30 border-b border-muted">
                                        <th className="text-left py-2.5 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Room</th>
                                        <th className="text-left py-2.5 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type</th>
                                        <th className="text-left py-2.5 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Assigned To</th>
                                        <th className="text-left py-2.5 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Priority</th>
                                        <th className="text-left py-2.5 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                                        <th className="text-right py-2.5 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-muted/30">
                                    {tasks.map((task) => (
                                        <tr key={task.room} className="hover:bg-muted/10 transition-colors">
                                            <td className="py-2.5 px-4 font-bold text-sm">{task.room}</td>
                                            <td className="py-2.5 px-4 text-xs font-medium text-muted-foreground">{task.type}</td>
                                            <td className="py-2.5 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-7 w-7 rounded-full bg-secondary/10 flex items-center justify-center text-secondary text-xs font-bold">
                                                        {task.staff[0]}
                                                    </div>
                                                    <span className="text-xs font-bold">{task.staff}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <Badge variant="outline" className="text-[10px] font-bold px-3 py-1 rounded-full border-muted text-secondary">
                                                    {task.priority}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <Badge className={cn(
                                                    "text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wider",
                                                    task.status === "Ready" ? "bg-secondary text-white" : "bg-primary text-white"
                                                )}>
                                                    {task.status}
                                                </Badge>
                                            </td>
                                            <td className="p-4 text-right">
                                                <Button variant="ghost" size="sm" className="rounded-xl font-bold text-xs gap-2 group hover:text-primary">
                                                    <Check className="h-3 w-3" /> Mark Ready
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </DashboardLayout>
    )
}
