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
import { useFrappeGetDocList, useFrappeUpdateDoc } from "frappe-react-sdk"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"

export default function HousekeepingPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const { data: tasks, isLoading, mutate } = useFrappeGetDocList("Housekeeping Task", {
        fields: ["name", "unit", "task_type", "status", "assigned_to", "priority", "creation"],
        orderBy: { field: "creation", order: "desc" }
    })

    const { updateDoc } = useFrappeUpdateDoc()

    const handleMarkReady = async (name: string) => {
        try {
            await updateDoc("Housekeeping Task", name, { status: "Completed" })
            toast.success("Task marked as completed")
            mutate()
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
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Housekeeping</h1>
                        <p className="text-sm text-slate-500 font-medium tracking-tight">
                            Monitor and manage unit cleanliness and maintenance tasks.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search unit or type..."
                                className="pl-10 rounded-xl border-slate-200 w-64 h-10 bg-white shadow-sm focus:ring-primary/20 text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl h-10 px-4 font-bold text-sm gap-2 shadow-sm">
                            <Plus className="h-4 w-4" /> Assign Task
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat) => (
                        <Card key={stat.label} className="border-none shadow-sm rounded-2xl bg-white transition-all hover:translate-y-[-2px]">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                                    <stat.icon className={cn("h-4 w-4", stat.color)} />
                                </div>
                                <p className="text-3xl font-black text-slate-800 tracking-tight">{stat.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Tabs defaultValue="kanban" className="w-full space-y-6">
                    <div className="flex items-center justify-between">
                        <TabsList className="bg-slate-100/50 p-1 rounded-xl h-11">
                            <TabsTrigger value="kanban" className="rounded-lg h-9 px-4 font-bold text-xs gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-slate-500 data-[state=active]:text-slate-900">
                                <LayoutGrid className="h-4 w-4" /> Board
                            </TabsTrigger>
                            <TabsTrigger value="list" className="rounded-lg h-9 px-4 font-bold text-xs gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-slate-500 data-[state=active]:text-slate-900">
                                <List className="h-4 w-4" /> List
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="kanban" className="m-0 pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {["Pending", "In Progress", "Completed"].map((column) => (
                                <div key={column} className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between px-2 py-1 bg-slate-100/50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "h-2.5 w-2.5 rounded-full",
                                                column === "Pending" ? "bg-amber-400" :
                                                    column === "In Progress" ? "bg-primary" : "bg-green-500"
                                            )} />
                                            <h3 className="font-bold text-[10px] uppercase tracking-[0.1em] text-slate-500">{column}</h3>
                                        </div>
                                        <Badge variant="secondary" className="rounded-md px-1.5 py-0 text-[10px] font-black bg-white text-slate-500 shadow-sm">
                                            {filteredTasks?.filter(t => t.status === column).length || 0}
                                        </Badge>
                                    </div>
                                    <div className="flex flex-col gap-4 min-h-[500px] bg-slate-50/30 p-2 rounded-2xl border border-dashed border-slate-200">
                                        {filteredTasks?.filter(t => t.status === column).map((task) => (
                                            <Card key={task.name} className="border-none shadow-sm rounded-xl hover:shadow-md transition-all group bg-white border border-slate-100">
                                                <CardContent className="p-4 space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-100 group-hover:bg-primary/5 transition-colors">
                                                                <Home className="h-3.5 w-3.5 text-slate-400 group-hover:text-primary" />
                                                            </div>
                                                            <span className="font-bold text-sm text-slate-800">{task.unit}</span>
                                                        </div>
                                                        <Badge className={cn(
                                                            "text-[8px] font-black uppercase rounded-md tracking-tight border-none shadow-none",
                                                            task.priority === "Urgent" || task.priority === "High" ? "bg-rose-500 text-white" : "bg-slate-100 text-slate-500"
                                                        )}>
                                                            {task.priority || "Normal"}
                                                        </Badge>
                                                    </div>

                                                    <div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{task.task_type}</span>
                                                    </div>

                                                    <div className="pt-3 border-t border-slate-100/50 flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-7 w-7 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                                                                <User className="h-3 w-3" />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">Assigned To</span>
                                                                <span className="text-[10px] font-bold text-slate-600">{task.assigned_to || "Unassigned"}</span>
                                                            </div>
                                                        </div>
                                                        {task.status !== "Completed" && (
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-8 w-8 rounded-lg hover:bg-green-50 hover:text-green-600 border-slate-100 transition-all"
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
                                            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-200">
                                                <CheckCircle2 className="h-8 w-8 mb-2 stroke-1 opacity-20" />
                                                <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-30">All Clean</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="list" className="m-0 pt-0">
                        <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                            <div className="p-0 overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-50">
                                            <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Unit / Task</th>
                                            <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Assigned To</th>
                                            <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Priority</th>
                                            <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                                            <th className="text-right py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredTasks?.map((task) => (
                                            <tr key={task.name} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-bold text-sm text-slate-800">{task.unit}</span>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{task.task_type}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                                                            <User className="h-4 w-4" />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-700">{task.assigned_to || "Unassigned"}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <Badge className={cn(
                                                        "text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tight border-none shadow-none",
                                                        task.priority === "Urgent" || task.priority === "High" ? "bg-rose-500 text-white" : "bg-slate-100 text-slate-500"
                                                    )}>
                                                        {task.priority || "Normal"}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <Badge className={cn(
                                                        "text-[10px] font-black px-3 py-1 rounded-md uppercase tracking-widest border-none",
                                                        task.status === "Completed" ? "bg-green-500 text-white" :
                                                            task.status === "In Progress" ? "bg-primary text-white" : "bg-amber-400 text-white"
                                                    )}>
                                                        {task.status}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[10px] font-black uppercase text-slate-400 hover:bg-slate-100">
                                                            Details
                                                        </Button>
                                                        {task.status !== "Completed" && (
                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                className="h-8 w-8 rounded-lg border-slate-200 text-green-600 hover:bg-green-50"
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
                                    <div className="py-12 text-center flex flex-col items-center gap-2">
                                        <Search className="h-8 w-8 text-slate-100 mb-2" />
                                        <h3 className="text-slate-400 font-bold text-sm">No tasks found</h3>
                                        <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">Adjust filters or search</p>
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
