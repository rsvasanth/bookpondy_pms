"use client"

import { useState } from "react"
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
        <div className="flex flex-col gap-6">
            {/* Header Area */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Home className="h-4 w-4 text-primary" />
                        </div>
                        <h1 className="text-xl font-black tracking-tight text-foreground uppercase">Housekeeping</h1>
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] decoration-primary/30 underline-offset-4 decoration-2">
                        Unit status & maintenance tasks management
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="SEARCH UNITS..."
                            className="pl-9 w-64 h-9 bg-card border-border shadow-sm focus:ring-1 focus:ring-primary/20 text-[10px] font-bold uppercase tracking-widest placeholder:text-muted-foreground/50 transition-all rounded-md"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button className="h-9 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[10px] uppercase tracking-[0.2em] gap-2 rounded-md shadow-lg shadow-primary/10 transition-all active:scale-95">
                        <Plus className="h-3.5 w-3.5" /> Assign Task
                    </Button>
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <Card key={stat.label} className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden group hover:border-primary/30 transition-all duration-300">
                        <CardContent className="p-4 relative">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground group-hover:text-primary transition-colors">{stat.label}</span>
                                <div className={cn("h-7 w-7 rounded-md flex items-center justify-center border border-border/50 group-hover:scale-110 transition-transform", stat.bg, stat.color)}>
                                    <stat.icon className="h-3.5 w-3.5" />
                                </div>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <p className="text-2xl font-black text-foreground tracking-tight">{stat.value}</p>
                                <div className="h-1 w-1 rounded-full bg-primary/20" />
                            </div>
                            <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary group-hover:w-full transition-all duration-500" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs defaultValue="kanban" className="w-full space-y-6">
                <div className="flex items-center justify-between border-b border-border/50 pb-4">
                    <TabsList className="bg-muted/30 p-1 rounded-md h-9 border border-border/50 shadow-inner">
                        <TabsTrigger value="kanban" className="rounded-sm h-7 px-4 font-bold text-[9px] uppercase tracking-widest gap-2 data-[state=active]:bg-card data-[state=active]:shadow-md text-muted-foreground data-[state=active]:text-foreground transition-all">
                            <LayoutGrid className="h-3 w-3" /> Kanban Board
                        </TabsTrigger>
                        <TabsTrigger value="list" className="rounded-sm h-7 px-4 font-bold text-[9px] uppercase tracking-widest gap-2 data-[state=active]:bg-card data-[state=active]:shadow-md text-muted-foreground data-[state=active]:text-foreground transition-all">
                            <List className="h-3 w-3" /> Table View
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
                                <div className="flex flex-col gap-4 min-h-[500px] bg-muted/5 p-3 rounded-lg border border-dashed border-border/80 transition-colors">
                                    {filteredTasks?.filter(t => t.status === column).map((task) => (
                                        <Card key={task.name} className="border-border shadow-sm rounded-md hover:shadow-lg hover:border-primary/30 transition-all group bg-card overflow-hidden cursor-pointer active:scale-[0.98]">
                                            <CardContent className="p-4 space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-md bg-muted/50 flex items-center justify-center border border-border group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all">
                                                            <Home className="h-4 w-4" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-black text-sm text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">{task.unit}</span>
                                                            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">{task.task_type}</span>
                                                        </div>
                                                    </div>
                                                    <Badge className={cn(
                                                        "text-[8px] font-bold uppercase rounded-sm px-2 py-0.5 tracking-[0.15em] border-none shadow-none",
                                                        task.priority === "Urgent" || task.priority === "High" ? "bg-rose-500 text-white animate-pulse" : "bg-muted text-muted-foreground"
                                                    )}>
                                                        {task.priority || "Normal"}
                                                    </Badge>
                                                </div>

                                                <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-6 w-6 rounded-full bg-muted/50 flex items-center justify-center border border-border">
                                                            <User className="h-3 w-3 text-muted-foreground" />
                                                        </div>
                                                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                                                            {task.assigned_to ? task.assigned_to.split('@')[0] : 'Unassigned'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/30 px-2 py-1 rounded-sm border border-border/30">
                                                        <Clock className="h-3 w-3" />
                                                        <span className="text-[9px] font-bold tracking-tighter uppercase">{task.arrival_date || "No Date"}</span>
                                                    </div>
                                                </div>

                                                {column !== "Completed" && (
                                                    <Button
                                                        size="sm"
                                                        disabled={isSaving}
                                                        onClick={() => handleMarkReady(task.name)}
                                                        className="w-full h-8 bg-muted hover:bg-emerald-500 hover:text-white border border-border text-muted-foreground font-black text-[9px] uppercase tracking-[0.2em] transition-all gap-2"
                                                    >
                                                        {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                                                        Mark as Ready
                                                    </Button>
                                                )}
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
                                        <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Unit / Task</th>
                                        <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Assigned To</th>
                                        <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Priority</th>
                                        <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Status</th>
                                        <th className="text-right py-3 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredTasks?.map((task) => (
                                        <tr key={task.name} className="hover:bg-muted/30 transition-colors group">
                                            <td className="py-3 px-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-black text-sm text-foreground uppercase tracking-tight">{task.unit}</span>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{task.task_type}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground border border-border shadow-sm">
                                                        <User className="h-4 w-4" />
                                                    </div>
                                                    <span className="text-xs font-bold text-foreground uppercase tracking-tight">{task.assigned_to || "Unassigned"}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge className={cn(
                                                    "text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest border-none shadow-none",
                                                    task.priority === "Urgent" || task.priority === "High" ? "bg-rose-500 text-white" : "bg-muted text-muted-foreground"
                                                )}>
                                                    {task.priority || "Normal"}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge className={cn(
                                                    "text-[10px] font-bold px-3 py-1 rounded-sm uppercase tracking-[0.15em] border-none shadow-none",
                                                    task.status === "Completed" ? "bg-emerald-500 text-white" :
                                                        task.status === "In Progress" ? "bg-primary text-white" : "bg-amber-400 text-white"
                                                )}>
                                                    {task.status}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-right">
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
    )
}
