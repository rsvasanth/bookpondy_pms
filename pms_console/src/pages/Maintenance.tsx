"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLocalDocList, useLocalMutation, useLocalCreate } from "@/hooks/use-local-data"
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

    const { data: properties } = useLocalDocList("Property", {
        sort: [{ property_name: 'asc' }]
    })

    const { data: units } = useLocalDocList("Unit", {
        selector: newTicket.property_link ? { property: newTicket.property_link } : {}
    })

    const { data: tickets } = useLocalDocList("Maintenance Ticket", {
        selector: {
            ...(propertyId !== "all" ? { property_link: propertyId } : {}),
            ...(priorityFilter !== "all" ? { priority: priorityFilter } : {})
        },
        sort: [{ creation: 'desc' }]
    })

    const { mutate: updateLocalDoc, isSaving: updating } = useLocalMutation()
    const { create: createLocalDoc, isCreating: creating } = useLocalCreate()

    const updateStatus = async (name: string, newStatus: string) => {
        try {
            await updateLocalDoc("Maintenance Ticket", name, { ticket_status: newStatus })
            toast.success(`Ticket status updated to ${newStatus}`)
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
            await createLocalDoc("Maintenance Ticket", {
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
            case "Critical": return "bg-rose-500/10 text-rose-500 border-rose-500/20"
            case "High": return "bg-amber-500/10 text-amber-500 border-amber-500/20"
            case "Medium": return "bg-blue-500/10 text-blue-500 border-blue-500/20"
            case "Low": return "bg-muted text-muted-foreground border-border"
            default: return "bg-muted text-muted-foreground border-border"
        }
    }

    return (
        <>
            <div className="flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">Maintenance & Engineering</h1>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            Track facility issues, repairs, and vendor assignments.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={propertyId} onValueChange={setPropertyId}>
                            <SelectTrigger className="w-[180px] h-10 rounded-lg bg-card border-border shadow-sm text-xs font-bold uppercase tracking-wider">
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
                            <SelectTrigger className="w-[150px] h-10 rounded-lg bg-card border-border shadow-sm text-xs font-bold uppercase tracking-wider">
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
                                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-10 px-4 font-bold text-[10px] uppercase tracking-widest gap-2 shadow-sm">
                                    <Plus className="h-4 w-4" /> Log Issue
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] rounded-lg border-border bg-card">
                                <DialogHeader className="space-y-2">
                                    <DialogTitle className="text-lg font-bold uppercase tracking-tight">Log Maintenance Issue</DialogTitle>
                                    <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                        Report a new maintenance issue for a property unit.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-6 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="property" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Property</Label>
                                        <Select
                                            value={newTicket.property_link}
                                            onValueChange={(v) => setNewTicket({ ...newTicket, property_link: v, unit: "" })}
                                        >
                                            <SelectTrigger className="rounded-lg border-border bg-card h-10 text-xs font-bold uppercase tracking-wider">
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
                                        <Label htmlFor="unit" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Unit</Label>
                                        <Select
                                            value={newTicket.unit}
                                            onValueChange={(v) => setNewTicket({ ...newTicket, unit: v })}
                                            disabled={!newTicket.property_link}
                                        >
                                            <SelectTrigger className="rounded-lg border-border bg-card h-10 text-xs font-bold uppercase tracking-wider">
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
                                        <Label htmlFor="title" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Issue Title</Label>
                                        <Input
                                            id="title"
                                            placeholder="E.G. AC NOT COOLING"
                                            className="rounded-lg border-border bg-card h-10 text-xs font-bold uppercase tracking-wider placeholder:opacity-50"
                                            value={newTicket.issue_title}
                                            onChange={(e) => setNewTicket({ ...newTicket, issue_title: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="priority" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Priority</Label>
                                        <Select
                                            value={newTicket.priority}
                                            onValueChange={(v) => setNewTicket({ ...newTicket, priority: v })}
                                        >
                                            <SelectTrigger className="rounded-lg border-border bg-card h-10 text-xs font-bold uppercase tracking-wider">
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
                                        <Label htmlFor="desc" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description</Label>
                                        <Textarea
                                            id="desc"
                                            placeholder="DETAILED DESCRIPTION OF THE ISSUE..."
                                            className="rounded-lg border-border bg-card min-h-[100px] text-xs font-bold uppercase tracking-wider placeholder:opacity-50"
                                            value={newTicket.description}
                                            onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        onClick={handleCreateTicket}
                                        disabled={creating}
                                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-10 font-bold text-[10px] uppercase tracking-widest shadow-sm"
                                    >
                                        {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log Maintenance Issue"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="border border-border shadow-sm rounded-lg bg-card overflow-hidden hover:scale-[1.01] transition-all">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Open Issues</span>
                                <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center border border-border">
                                    <AlertCircle className="h-4 w-4" />
                                </div>
                            </div>
                            <p className="text-3xl font-black text-foreground tracking-tight">{stats.open}</p>
                        </CardContent>
                    </Card>
                    <Card className="border border-border shadow-sm rounded-lg bg-card overflow-hidden hover:scale-[1.01] transition-all">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">High Priority</span>
                                <div className="h-8 w-8 rounded-md bg-rose-500/10 text-rose-500 flex items-center justify-center border border-border">
                                    <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                                </div>
                            </div>
                            <p className="text-3xl font-black text-foreground tracking-tight">{stats.critical}</p>
                        </CardContent>
                    </Card>
                    <Card className="border border-border shadow-sm rounded-lg bg-card overflow-hidden hover:scale-[1.01] transition-all">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">In Progress</span>
                                <div className="h-8 w-8 rounded-md bg-blue-500/10 text-blue-500 flex items-center justify-center border border-border">
                                    <Clock className="h-4 w-4" />
                                </div>
                            </div>
                            <p className="text-3xl font-black text-foreground tracking-tight">{stats.inProgress}</p>
                        </CardContent>
                    </Card>
                    <Card className="border border-border shadow-sm rounded-lg bg-card overflow-hidden hover:scale-[1.01] transition-all">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Resolved Today</span>
                                <div className="h-8 w-8 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-border">
                                    <CheckCircle2 className="h-4 w-4" />
                                </div>
                            </div>
                            <p className="text-3xl font-black text-foreground tracking-tight">{stats.resolved}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Status Lanes */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto pb-6">
                    {statuses.map((status) => (
                        <div key={status} className="flex flex-col gap-4 min-w-[280px]">
                            <div className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-lg border border-border">
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "h-2 w-2 rounded-full",
                                        status === "Open" ? "bg-primary" :
                                            status === "In Progress" ? "bg-blue-500" :
                                                status === "Resolved" ? "bg-emerald-500" : "bg-muted-foreground"
                                    )} />
                                    <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-foreground">{status}</h3>
                                </div>
                                <Badge variant="outline" className="rounded-md px-1.5 py-0 text-[10px] font-black bg-card text-muted-foreground border-border shadow-sm">
                                    {tickets?.filter(t => t.ticket_status === status).length || 0}
                                </Badge>
                            </div>

                            <div className="flex flex-col gap-4 min-h-[500px] bg-muted/20 p-2 rounded-lg border border-dashed border-border">
                                {tickets?.filter(t => t.ticket_status === status).map((ticket) => (
                                    <Card key={ticket.name} className="border border-border shadow-sm rounded-lg hover:shadow-md transition-all group bg-card overflow-hidden">
                                        <CardContent className="p-4 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <Badge variant="outline" className={cn("text-[8px] font-black uppercase rounded-md tracking-tight px-2 py-0.5 border-none shadow-none", getPriorityColor(ticket.priority))}>
                                                    {ticket.priority}
                                                </Badge>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">#{ticket.name.split("-").pop()}</span>
                                            </div>

                                            <div className="space-y-1.5">
                                                <h4 className="font-bold text-sm leading-snug text-foreground group-hover:text-primary transition-colors uppercase tracking-tight">{ticket.issue_title}</h4>
                                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                                    <MapPin className="h-3 w-3" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">{ticket.unit}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between py-2 border-t border-border">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Wrench className="h-3 w-3" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest truncate max-w-[120px]">
                                                        {ticket.assigned_vendor || "UNASSIGNED"}
                                                    </span>
                                                </div>
                                                {ticket.actual_cost > 0 && (
                                                    <span className="text-[10px] font-black text-foreground bg-muted px-2 py-0.5 rounded-md border border-border">
                                                        ₹{ticket.actual_cost}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                {status === "Open" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 text-[9px] font-black uppercase rounded-md gap-1.5 border-blue-500/20 text-blue-500 hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
                                                        onClick={() => updateStatus(ticket.name, "In Progress")}
                                                    >
                                                        Start <ArrowRight className="h-3 w-3" />
                                                    </Button>
                                                )}
                                                {status === "In Progress" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 text-[9px] font-black uppercase rounded-md gap-1.5 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors"
                                                        onClick={() => updateStatus(ticket.name, "Resolved")}
                                                    >
                                                        Resolve <CheckCircle2 className="h-3 w-3" />
                                                    </Button>
                                                )}
                                                {(status === "Resolved" || status === "Open") && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 text-[9px] font-black uppercase rounded-md hover:bg-muted text-muted-foreground border-border"
                                                    >
                                                        Details
                                                    </Button>
                                                )}
                                                {status === "Resolved" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 text-[9px] font-black uppercase rounded-md gap-1.5 border-border text-foreground hover:bg-muted"
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
                                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground/30">
                                        <Wrench className="h-10 w-10 mb-2 stroke-[1.5px]" />
                                        <p className="text-[10px] uppercase font-bold tracking-[0.3em]">All Clear</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}
