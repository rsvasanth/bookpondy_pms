"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useFrappeGetDocList, useFrappeUpdateDoc } from "frappe-react-sdk"
import {
    Plus,
    Search,
    Filter,
    Calendar as CalendarIcon,
    User as UserIcon,
    Clock,
    MoreVertical,
    CheckCircle2,
    AlertCircle,
    Play,
    Pause
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const STATUS_COLUMNS = [
    { id: 'Pending', label: 'Pending', color: 'bg-gray-100/50' },
    { id: 'In Progress', label: 'In Progress', color: 'bg-blue-50/50' },
    { id: 'Completed', label: 'Completed', color: 'bg-green-50/50' },
    { id: 'On Hold', label: 'On Hold', color: 'bg-orange-50/50' }
]

const PRIORITY_THEMES: Record<string, { color: string, icon: any }> = {
    'Urgent': { color: 'text-red-600 bg-red-50 border-red-100', icon: AlertCircle },
    'High': { color: 'text-orange-600 bg-orange-50 border-orange-100', icon: AlertCircle },
    'Normal': { color: 'text-green-600 bg-green-50 border-green-100', icon: CheckCircle2 },
    'Low': { color: 'text-blue-600 bg-blue-50 border-blue-100', icon: Clock }
}

export default function TasksPage() {
    const [propertyFilter, setPropertyFilter] = useState<string>("all")
    const [searchQuery, setSearchQuery] = useState("")

    const { data: properties } = useFrappeGetDocList("Property", {
        fields: ["name", "property_name"]
    })

    const { data: tasks, isLoading, mutate } = useFrappeGetDocList("Housekeeping Task", {
        fields: [
            "name", "status", "task_type", "priority", "unit", "property_link",
            "assigned_to_staff", "scheduled_time", "started_time", "completed_time"
        ],
        orderBy: { field: "creation", order: "desc" },
        limit: 100
    })

    const { updateDoc } = useFrappeUpdateDoc()

    const handleStatusChange = async (taskId: string, newStatus: string) => {
        try {
            await updateDoc("Housekeeping Task", taskId, { status: newStatus })
            toast.success(`Task status updated to ${newStatus}`)
            mutate()
        } catch (e: any) {
            toast.error(e.message || "Failed to update status")
        }
    }

    const filteredTasks = tasks?.filter(t => {
        const matchesProperty = propertyFilter === "all" || t.property_link === propertyFilter
        const matchesSearch = t.unit?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.name.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesProperty && matchesSearch
    })

    const onDragStart = (e: React.DragEvent, taskId: string) => {
        e.dataTransfer.setData("taskId", taskId)
    }

    const onDrop = (e: React.DragEvent, status: string) => {
        const taskId = e.dataTransfer.getData("taskId")
        handleStatusChange(taskId, status)
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6 h-full">
                {/* Header Section */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Operational Tasks</h1>
                        <p className="text-sm text-muted-foreground">Manage housekeeping and maintenance workflows across properties.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative w-[240px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search tasks..."
                                className="pl-9 h-10 rounded-xl bg-white border-muted shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                            <SelectTrigger className="w-[180px] h-10 rounded-xl bg-white border-muted shadow-sm">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                                    <SelectValue placeholder="All Properties" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Properties</SelectItem>
                                {properties?.map(p => (
                                    <SelectItem key={p.name} value={p.name}>{p.property_name || p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button className="rounded-xl h-10 px-4 bg-primary font-bold shadow-lg shadow-primary/20">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Task
                        </Button>
                    </div>
                </div>

                {/* Kanban Board Container */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 flex-1 overflow-hidden min-h-[600px]">
                    {STATUS_COLUMNS.map((column) => (
                        <div
                            key={column.id}
                            className={cn("flex flex-col rounded-2xl p-4 transition-colors", column.color)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => onDrop(e, column.id)}
                        >
                            <div className="flex items-center justify-between mb-4 px-2">
                                <div className="flex items-center gap-2">
                                    <div className={cn("h-2 w-2 rounded-full",
                                        column.id === 'Pending' ? 'bg-gray-400' :
                                            column.id === 'In Progress' ? 'bg-blue-500' :
                                                column.id === 'Completed' ? 'bg-green-500' : 'bg-orange-500'
                                    )} />
                                    <h3 className="font-bold text-sm tracking-tight">{column.label}</h3>
                                </div>
                                <Badge variant="secondary" className="rounded-full px-2 py-0 text-[10px] bg-white/50 border-none font-bold">
                                    {filteredTasks?.filter(t => t.status === column.id).length || 0}
                                </Badge>
                            </div>

                            <div className="flex flex-col gap-3 overflow-y-auto pr-1 custom-scrollbar">
                                {isLoading ? (
                                    <div className="h-32 rounded-xl border border-dashed border-muted/50 flex items-center justify-center text-xs text-muted-foreground animate-pulse">
                                        Loading...
                                    </div>
                                ) : (
                                    filteredTasks?.filter(t => t.status === column.id).map((task) => (
                                        <TaskCard
                                            key={task.name}
                                            task={task}
                                            onDragStart={(e) => onDragStart(e, task.name)}
                                            onStatusChange={handleStatusChange}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    )
}

function TaskCard({ task, onDragStart, onStatusChange }: {
    task: any,
    onDragStart: (e: React.DragEvent) => void,
    onStatusChange: (taskId: string, status: string) => void
}) {
    const pTheme = PRIORITY_THEMES[task.priority] || PRIORITY_THEMES['Normal']
    const PriorityIcon = pTheme.icon

    return (
        <Card
            className="border-none shadow-sm rounded-xl bg-white hover:shadow-md transition-all cursor-grab active:cursor-grabbing group overflow-hidden"
            draggable
            onDragStart={onDragStart}
        >
            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                    <Badge className={cn("rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border", pTheme.color)}>
                        <PriorityIcon className="h-3 w-3 mr-1" />
                        {task.priority}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                </div>

                <h4 className="font-bold text-sm mb-1 line-clamp-2">{task.task_type}</h4>
                <div className="flex items-center gap-1.5 text-muted-foreground mb-4">
                    <div className="h-4 w-4 rounded bg-primary/5 flex items-center justify-center">
                        <Plus className="h-2.5 w-2.5 text-primary" strokeWidth={3} />
                    </div>
                    <span className="text-xs font-bold text-primary">{task.unit}</span>
                </div>

                <div className="space-y-2 mb-4">
                    <div className="flex items-center text-[10px] text-muted-foreground">
                        <CalendarIcon className="h-3 w-3 mr-1.5" />
                        <span className="font-medium">Due: {task.scheduled_time ? new Date(task.scheduled_time).toLocaleDateString() : 'Today'}</span>
                    </div>
                    <div className="flex items-center text-[10px] text-muted-foreground">
                        <UserIcon className="h-3 w-3 mr-1.5" />
                        <span className="font-medium truncate">{task.assigned_to_staff || 'Unassigned'}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
                    {task.status === 'Pending' && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1 rounded-lg h-7 text-[10px] font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 border-none"
                            onClick={() => onStatusChange(task.name, 'In Progress')}
                        >
                            <Play className="h-3 w-3 mr-1 fill-current" />
                            START
                        </Button>
                    )}
                    {task.status === 'In Progress' && (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex-1 rounded-lg h-7 text-[10px] font-bold bg-green-50 text-green-600 hover:bg-green-100 border-none"
                                onClick={() => onStatusChange(task.name, 'Completed')}
                            >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                DONE
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex-1 rounded-lg h-7 text-[10px] font-bold bg-orange-50 text-orange-600 hover:bg-orange-100 border-none"
                                onClick={() => onStatusChange(task.name, 'On Hold')}
                            >
                                <Pause className="h-3 w-3 mr-1 fill-current" />
                                HOLD
                            </Button>
                        </>
                    )}
                    {task.status === 'On Hold' && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1 rounded-lg h-7 text-[10px] font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 border-none"
                            onClick={() => onStatusChange(task.name, 'In Progress')}
                        >
                            <Play className="h-3 w-3 mr-1 fill-current" />
                            RESUME
                        </Button>
                    )}
                    {task.status === 'Completed' && (
                        <div className="flex items-center gap-1.5 text-green-600 py-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Finished</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
