"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    CheckCircle2,
    Clock,
    LayoutGrid,
    Plus,
    List,
    Timer,
    Check,
    Loader2,
    User,
    Home,
    Search
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLocalDocList, useLocalMutation } from "@/hooks/use-local-data"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"

export default function HousekeepingPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const { data: tasks, isLoading } = useLocalDocList("Housekeeping Task", {
        sort: [{ creation: 'desc' }]
    })

    const { mutate, isSaving } = useLocalMutation()

    const handleMarkReady = async (name: string) => {
        try {
            await mutate("Housekeeping Task", name, { status: "Completed" })
            toast.success("Task marked as completed")
        } catch (e) {
            toast.error("Failed to update task")
        }
    }

    const filteredTasks = tasks?.filter(t =>
        t.unit?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.task_type?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const stats = [
        { label: "Total Tasks", value: tasks?.length || 0, icon: LayoutGrid, color: "text-blue-500", bg: "bg-blue-50" },
        { label: "Pending", value: tasks?.filter(t => t.status === "Pending").length || 0, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
        { label: "In Progress", value: tasks?.filter(t => t.status === "In Progress").length || 0, icon: Timer, color: "text-primary", bg: "bg-primary/10" },
        { label: "Completed", value: tasks?.filter(t => t.status === "Completed").length || 0, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50" },
    ]

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">Housekeeping</h1>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            Monitor and manage unit cleanliness and maintenance tasks.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search unit or type..."
                                className="pl-10 rounded-lg border-border w-64 h-10 bg-card shadow-sm focus:ring-primary/20 text-xs font-bold uppercase tracking-wider"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-10 px-4 font-bold text-[10px] uppercase tracking-widest gap-2 shadow-sm">
                            <Plus className="h-4 w-4" /> Assign Task
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat) => (
                        <Card key={stat.label} className="border border-border shadow-sm rounded-lg bg-card overflow-hidden hover:scale-[1.01] transition-all">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</span>
                                    <div className={cn("h-8 w-8 rounded-md flex items-center justify-center border border-border", stat.bg, stat.color)}>
                                        <stat.icon className="h-4 w-4" />
                                    </div>
                                </div>
                                <p className="text-3xl font-black text-foreground tracking-tight">{stat.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Tabs defaultValue="kanban" className="w-full space-y-6">
                    <div className="flex items-center justify-between">
                        <TabsList className="bg-muted/50 p-1 rounded-lg h-10 border border-border">
                            <TabsTrigger value="kanban" className="rounded-md h-8 px-4 font-bold text-[10px] uppercase tracking-widest gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm text-muted-foreground data-[state=active]:text-foreground">
                                <LayoutGrid className="h-3.5 w-3.5" /> Board
                            </TabsTrigger>
                            <TabsTrigger value="list" className="rounded-md h-8 px-4 font-bold text-[10px] uppercase tracking-widest gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm text-muted-foreground data-[state=active]:text-foreground">
                                <List className="h-3.5 w-3.5" /> List
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="kanban" className="m-0 pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {["Pending", "In Progress", "Completed"].map((column) => (
                                <div key={column} className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between px-3 py-2 bg-muted/20 border-b border-border rounded-t-lg">
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "h-2.5 w-2.5 rounded-full",
                                                column === "Pending" ? "bg-amber-400" :
                                                    column === "In Progress" ? "bg-primary" : "bg-emerald-500"
                                            )} />
                                            <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{column}</h3>
                                        </div>
                                        <Badge variant="secondary" className="rounded-sm px-1.5 py-0 text-[10px] font-black bg-muted text-muted-foreground border border-border shadow-none">
                                            {filteredTasks?.filter(t => t.status === column).length || 0}
                                        </Badge>
                                    </div>
                                    <div className="flex flex-col gap-4 min-h-[500px] bg-muted/10 p-3 rounded-lg border border-dashed border-border/60 transition-colors hover:border-border">
                                        {filteredTasks?.filter(t => t.status === column).map((task) => (
                                            <Card key={task.name} className="border border-border shadow-sm rounded-lg hover:shadow-md transition-all group bg-card overflow-hidden">
                                                <CardContent className="p-4 space-y-4">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center border border-border group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                                <Home className="h-4 w-4" />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-black text-sm text-foreground uppercase tracking-tight">{task.unit}</span>
                                                                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">{task.task_type}</span>
                                                            </div>
                                                        </div>
                                                        <Badge className={cn(
                                                            "text-[8px] font-bold uppercase rounded-sm px-1.5 py-0.5 tracking-widest border-none shadow-none",
                                                            task.priority === "Urgent" || task.priority === "High" ? "bg-rose-500 text-white" : "bg-muted text-muted-foreground"
                                                        )}>
                                                            {task.priority || "Normal"}
                                                        </Badge>
                                                    </div>

                                                    <div className="pt-4 border-t border-border flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-8 w-8 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground">
                                                                <User className="h-3.5 w-3.5" />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-[8px] font-black uppercase text-muted-foreground tracking-tighter">Assigned To</span>
                                                                <span className="text-[10px] font-bold text-foreground uppercase tracking-tight">{task.assigned_to || "Unassigned"}</span>
                                                            </div>
                                                        </div>
                                                        {task.status !== "Completed" && (
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-9 w-9 rounded-md hover:bg-emerald-500/10 hover:text-emerald-500 border-border transition-all"
                                                                onClick={() => handleMarkReady(task.name)}
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                        {isLoading && <div className="h-40 flex items-center justify-center opacity-20"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                                        {filteredTasks?.filter(t => t.status === column).length === 0 && !isLoading && (
                                            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground/30">
                                                <CheckCircle2 className="h-12 w-12 mb-3 stroke-1" />
                                                <p className="text-[10px] uppercase font-black tracking-[0.3em]">All Clean</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="list" className="m-0 pt-0">
                        <Card className="border border-border shadow-sm rounded-lg bg-card overflow-hidden">
                            <div className="p-0 overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-muted/50">
                                        <tr className="border-b border-border">
                                            <th className="text-left py-4 px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Unit / Task</th>
                                            <th className="text-left py-4 px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Assigned To</th>
                                            <th className="text-left py-4 px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Priority</th>
                                            <th className="text-left py-4 px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Status</th>
                                            <th className="text-right py-4 px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {filteredTasks?.map((task) => (
                                            <tr key={task.name} className="hover:bg-muted/30 transition-colors group">
                                                <td className="py-5 px-6">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-black text-sm text-foreground uppercase tracking-tight">{task.unit}</span>
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{task.task_type}</span>
                                                    </div>
                                                </td>
                                                <td className="py-5 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground border border-border shadow-sm">
                                                            <User className="h-4 w-4" />
                                                        </div>
                                                        <span className="text-xs font-bold text-foreground uppercase tracking-tight">{task.assigned_to || "Unassigned"}</span>
                                                    </div>
                                                </td>
                                                <td className="py-5 px-6">
                                                    <Badge className={cn(
                                                        "text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest border-none shadow-none",
                                                        task.priority === "Urgent" || task.priority === "High" ? "bg-rose-500 text-white" : "bg-muted text-muted-foreground"
                                                    )}>
                                                        {task.priority || "Normal"}
                                                    </Badge>
                                                </td>
                                                <td className="py-5 px-6">
                                                    <Badge className={cn(
                                                        "text-[10px] font-bold px-3 py-1 rounded-sm uppercase tracking-[0.15em] border-none shadow-none",
                                                        task.status === "Completed" ? "bg-emerald-500 text-white" :
                                                            task.status === "In Progress" ? "bg-primary text-white" : "bg-amber-400 text-white"
                                                    )}>
                                                        {task.status}
                                                    </Badge>
                                                </td>
                                                <td className="py-5 px-6 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" className="h-9 px-4 rounded-md text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted">
                                                            Details
                                                        </Button>
                                                        {task.status !== "Completed" && (
                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                className="h-9 w-9 rounded-md border-border text-emerald-500 hover:bg-emerald-500/10"
                                                                onClick={() => handleMarkReady(task.name)}
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredTasks?.length === 0 && !isLoading && (
                                    <div className="py-16 text-center flex flex-col items-center gap-3">
                                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center border border-border shadow-sm mb-2">
                                            <Search className="h-6 w-6 text-muted-foreground/40" />
                                        </div>
                                        <h3 className="text-foreground font-black text-sm uppercase tracking-tight">No tasks found</h3>
                                        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em]">Adjust filters or search criteria</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    )
}
