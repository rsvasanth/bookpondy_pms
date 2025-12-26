"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFrappeGetDocList, useFrappeUpdateDoc, useFrappeCreateDoc } from "frappe-react-sdk"
import {
    AlertCircle,
    Clock,
    CheckCircle2,
    Plus,
    Wrench,
    MapPin,
    ArrowRight,
    Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function MaintenancePage() {
    const [propertyId, setPropertyId] = useState<string>("all")
    const [priorityFilter, setPriorityFilter] = useState<string>("all")
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [newTicket, setNewTicket] = useState({
        property_link: "",
        unit: "",
        issue_title: "",
        description: "",
        priority: "Medium"
    })

    const { data: properties } = useFrappeGetDocList("Property", {
        fields: ["name", "property_name"]
    })

    const { data: units } = useFrappeGetDocList("Unit", {
        fields: ["name", "unit_no", "property"],
        filters: newTicket.property_link ? [["property", "=", newTicket.property_link]] : []
    })

    const { data: tickets, mutate } = useFrappeGetDocList("Maintenance Ticket", {
        fields: ["name", "issue_title", "unit", "priority", "ticket_status", "property_link", "assigned_vendor", "scheduled_time", "actual_cost"],
        filters: [
            propertyId !== "all" ? ["property_link", "=", propertyId] : null,
            priorityFilter !== "all" ? ["priority", "=", priorityFilter] : null
        ].filter(Boolean) as any,
        orderBy: { field: "creation", order: "desc" }
    })

    const { updateDoc } = useFrappeUpdateDoc()
    const { createDoc, loading: creating } = useFrappeCreateDoc()

    const updateStatus = async (name: string, newStatus: string) => {
        try {
            await updateDoc("Maintenance Ticket", name, { ticket_status: newStatus })
            toast.success(`Ticket status updated to ${newStatus}`)
            mutate()
        } catch (e) {
            toast.error("Failed to update ticket status")
        }
    }

    const handleCreateTicket = async () => {
        if (!newTicket.property_link || !newTicket.unit || !newTicket.issue_title) {
            toast.error("Please fill in all required fields")
            return
        }

        try {
            await createDoc("Maintenance Ticket", {
                ...newTicket,
                ticket_status: "Open"
            })
            toast.success("Maintenance ticket logged successfully")
            setIsCreateOpen(false)
            setNewTicket({
                property_link: "",
                unit: "",
                issue_title: "",
                description: "",
                priority: "Medium"
            })
            mutate()
        } catch (e) {
            toast.error("Failed to create maintenance ticket")
        }
    }

    const statuses = ["Open", "In Progress", "Resolved", "Closed"]

    const stats = {
        open: tickets?.filter(t => t.ticket_status === "Open").length || 0,
        critical: tickets?.filter(t => ["Critical", "Emergency", "High"].includes(t.priority)).length || 0,
        inProgress: tickets?.filter(t => t.ticket_status === "In Progress").length || 0,
        resolved: tickets?.filter(t => t.ticket_status === "Resolved").length || 0,
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "Critical": return "bg-red-500 text-white"
            case "High": return "bg-orange-500 text-white"
            case "Medium": return "bg-blue-500 text-white"
            case "Low": return "bg-slate-500 text-white"
            default: return "bg-slate-500 text-white"
        }
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Maintenance & Engineering</h1>
                        <p className="text-sm text-slate-500 font-medium tracking-tight">
                            Track facility issues and vendor assignments
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={propertyId} onValueChange={setPropertyId}>
                            <SelectTrigger className="w-[180px] h-10 rounded-xl bg-white border-muted shadow-sm">
                                <SelectValue placeholder="All Properties" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Properties</SelectItem>
                                {properties?.map(p => (
                                    <SelectItem key={p.name} value={p.name}>{p.property_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                            <SelectTrigger className="w-[150px] h-10 rounded-xl bg-white border-muted shadow-sm">
                                <SelectValue placeholder="All Priorities" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Priorities</SelectItem>
                                <SelectItem value="Critical">Critical</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="Low">Low</SelectItem>
                            </SelectContent>
                        </Select>

                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl h-10 px-4 font-bold text-sm gap-2 shadow-sm">
                                    <Plus className="h-4 w-4" /> Log Issue
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] rounded-2xl">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-bold">Log Maintenance Issue</DialogTitle>
                                    <DialogDescription className="font-medium">
                                        Report a new maintenance issue for a property unit.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="property" className="text-xs font-bold uppercase tracking-wider text-slate-500">Property</Label>
                                        <Select
                                            value={newTicket.property_link}
                                            onValueChange={(v) => setNewTicket({ ...newTicket, property_link: v, unit: "" })}
                                        >
                                            <SelectTrigger className="rounded-xl border-slate-200">
                                                <SelectValue placeholder="Select Property" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {properties?.map(p => (
                                                    <SelectItem key={p.name} value={p.name}>{p.property_name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="unit" className="text-xs font-bold uppercase tracking-wider text-slate-500">Unit</Label>
                                        <Select
                                            value={newTicket.unit}
                                            onValueChange={(v) => setNewTicket({ ...newTicket, unit: v })}
                                            disabled={!newTicket.property_link}
                                        >
                                            <SelectTrigger className="rounded-xl border-slate-200">
                                                <SelectValue placeholder={newTicket.property_link ? "Select Unit" : "First select a property"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {units?.map(u => (
                                                    <SelectItem key={u.name} value={u.name}>Unit {u.unit_no}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-slate-500">Issue Title</Label>
                                        <Input
                                            id="title"
                                            placeholder="e.g. AC not cooling"
                                            className="rounded-xl border-slate-200"
                                            value={newTicket.issue_title}
                                            onChange={(e) => setNewTicket({ ...newTicket, issue_title: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="priority" className="text-xs font-bold uppercase tracking-wider text-slate-500">Priority</Label>
                                        <Select
                                            value={newTicket.priority}
                                            onValueChange={(v) => setNewTicket({ ...newTicket, priority: v })}
                                        >
                                            <SelectTrigger className="rounded-xl border-slate-200">
                                                <SelectValue placeholder="Select Priority" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Low">Low</SelectItem>
                                                <SelectItem value="Medium">Medium</SelectItem>
                                                <SelectItem value="High">High</SelectItem>
                                                <SelectItem value="Critical">Critical</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="desc" className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</Label>
                                        <Textarea
                                            id="desc"
                                            placeholder="Detailed description of the issue..."
                                            className="rounded-xl border-slate-200 min-h-[100px]"
                                            value={newTicket.description}
                                            onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        onClick={handleCreateTicket}
                                        disabled={creating}
                                        className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-10 font-bold"
                                    >
                                        {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log Maintenance Issue"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-none shadow-sm rounded-2xl bg-white transition-all hover:translate-y-[-2px]">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Open Issues</span>
                                <AlertCircle className="h-4 w-4 text-primary" />
                            </div>
                            <p className="text-3xl font-black text-primary tracking-tight">{stats.open}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm rounded-2xl bg-white transition-all hover:translate-y-[-2px]">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">High Priority</span>
                                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                            </div>
                            <p className="text-3xl font-black text-slate-800 tracking-tight">{stats.critical}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm rounded-2xl bg-white transition-all hover:translate-y-[-2px]">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">In Progress</span>
                                <Clock className="h-4 w-4 text-blue-500" />
                            </div>
                            <p className="text-3xl font-black text-blue-500 tracking-tight">{stats.inProgress}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm rounded-2xl bg-white transition-all hover:translate-y-[-2px]">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Resolved Today</span>
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                            </div>
                            <p className="text-3xl font-black text-green-500 tracking-tight">{stats.resolved}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Status Lanes */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto pb-6">
                    {statuses.map((status) => (
                        <div key={status} className="flex flex-col gap-4 min-w-[280px]">
                            <div className="flex items-center justify-between px-2 py-1 bg-slate-100/50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "h-2.5 w-2.5 rounded-full",
                                        status === "Open" ? "bg-primary" :
                                            status === "In Progress" ? "bg-blue-500" :
                                                status === "Resolved" ? "bg-green-500" : "bg-slate-400"
                                    )} />
                                    <h3 className="font-bold text-[10px] uppercase tracking-[0.1em] text-slate-500">{status}</h3>
                                </div>
                                <Badge variant="secondary" className="rounded-md px-1.5 py-0 text-[10px] font-black bg-white text-slate-500 shadow-sm">
                                    {tickets?.filter(t => t.ticket_status === status).length || 0}
                                </Badge>
                            </div>

                            <div className="flex flex-col gap-4 min-h-[500px] bg-slate-50/30 p-2 rounded-2xl border border-dashed border-slate-200">
                                {tickets?.filter(t => t.ticket_status === status).map((ticket) => (
                                    <Card key={ticket.name} className="border-none shadow-sm rounded-xl hover:shadow-md transition-all group bg-white border border-slate-100">
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <Badge className={cn("text-[8px] font-black uppercase rounded-md tracking-tight border-none shadow-none", getPriorityColor(ticket.priority))}>
                                                    {ticket.priority}
                                                </Badge>
                                                <span className="text-[10px] font-bold text-slate-400">#{ticket.name.split("-").pop()}</span>
                                            </div>

                                            <div className="space-y-1">
                                                <h4 className="font-bold text-sm leading-snug text-slate-800 group-hover:text-primary transition-colors">{ticket.issue_title}</h4>
                                                <div className="flex items-center gap-1 text-slate-400">
                                                    <MapPin className="h-3 w-3" />
                                                    <span className="text-[10px] font-black uppercase tracking-tight">{ticket.unit}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between py-2 border-t border-slate-100/50">
                                                <div className="flex items-center gap-1.5 text-slate-600">
                                                    <Wrench className="h-3 w-3" />
                                                    <span className="text-[10px] font-bold text-slate-500 truncate max-w-[120px]">
                                                        {ticket.assigned_vendor || "UNASSIGNED"}
                                                    </span>
                                                </div>
                                                {ticket.actual_cost > 0 && (
                                                    <span className="text-[10px] font-black text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                                                        ₹{ticket.actual_cost}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                                {status === "Open" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 text-[10px] font-black uppercase rounded-lg gap-1 border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                                                        onClick={() => updateStatus(ticket.name, "In Progress")}
                                                    >
                                                        Start <ArrowRight className="h-3 w-3" />
                                                    </Button>
                                                )}
                                                {status === "In Progress" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 text-[10px] font-black uppercase rounded-lg gap-1 border-green-200 text-green-600 hover:bg-green-50 transition-colors"
                                                        onClick={() => updateStatus(ticket.name, "Resolved")}
                                                    >
                                                        Resolve <CheckCircle2 className="h-3 w-3" />
                                                    </Button>
                                                )}
                                                {(status === "Resolved" || status === "Open") && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 text-[10px] font-black uppercase rounded-lg hover:bg-slate-100 text-slate-400"
                                                    >
                                                        Details
                                                    </Button>
                                                )}
                                                {status === "Resolved" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 text-[10px] font-black uppercase rounded-lg gap-1 border-slate-200 text-slate-600 hover:bg-slate-50"
                                                        onClick={() => updateStatus(ticket.name, "Closed")}
                                                    >
                                                        Archive
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {tickets?.filter(t => t.ticket_status === status).length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-200">
                                        <Wrench className="h-8 w-8 mb-2 stroke-1 opacity-20" />
                                        <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-30">All Clear</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    )
}
