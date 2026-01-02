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
        <div className="flex flex-col gap-6">
            {/* Header Area */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                            <Wrench className="h-4 w-4 text-orange-500" />
                        </div>
                        <h1 className="text-xl font-black tracking-tight text-foreground uppercase">Maintenance</h1>
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                        Facilities, Engineering & ticket management
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-card rounded-md border border-border shadow-sm p-0.5">
                        <Select value={propertyId} onValueChange={setPropertyId}>
                            <SelectTrigger className="w-[160px] h-8 border-none bg-transparent shadow-none text-[9px] font-bold uppercase tracking-wider focus:ring-0">
                                <SelectValue placeholder="ALL PROPERTIES" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="text-[9px] font-bold uppercase">ALL PROPERTIES</SelectItem>
                                {properties?.map(p => (
                                    <SelectItem key={p.name} value={p.name} className="text-[9px] font-bold uppercase">{p.property_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="w-[1px] h-4 bg-border/50" />
                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                            <SelectTrigger className="w-[140px] h-8 border-none bg-transparent shadow-none text-[9px] font-bold uppercase tracking-wider focus:ring-0">
                                <SelectValue placeholder="ALL PRIORITIES" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="text-[9px] font-bold uppercase">ALL PRIORITIES</SelectItem>
                                <SelectItem value="Critical" className="text-[9px] font-bold uppercase">CRITICAL</SelectItem>
                                <SelectItem value="High" className="text-[9px] font-bold uppercase">HIGH PRIORITY</SelectItem>
                                <SelectItem value="Medium" className="text-[9px] font-bold uppercase">MEDIUM</SelectItem>
                                <SelectItem value="Low" className="text-[9px] font-bold uppercase">LOW</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-9 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[10px] uppercase tracking-[0.2em] gap-2 rounded-md shadow-lg shadow-primary/10 transition-all active:scale-95">
                                <Plus className="h-3.5 w-3.5" /> Log Ticket
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

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Active Tickets", value: stats.open + stats.inProgress, icon: AlertCircle, color: "text-orange-500", bg: "bg-orange-500/10" },
                    { label: "Critical Issues", value: stats.critical, icon: Wrench, color: "text-rose-500", bg: "bg-rose-500/10" },
                    { label: "Resolved Today", value: stats.resolved, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                    { label: "In Progress", value: stats.inProgress, icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
                ].map((stat) => (
                    <Card key={stat.label} className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm group hover:border-primary/30 transition-all">
                        <CardContent className="p-4 relative overflow-hidden">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground group-hover:text-primary transition-colors">{stat.label}</span>
                                <div className={cn("h-7 w-7 rounded-md flex items-center justify-center border border-border/50", stat.bg, stat.color)}>
                                    <stat.icon className="h-3.5 w-3.5" />
                                </div>
                            </div>
                            <p className="text-2xl font-black text-foreground tracking-tight">{stat.value}</p>
                            <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary group-hover:w-full transition-all duration-500" />
                        </CardContent>
                    </Card>
                ))}
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

                        <div className="flex flex-col gap-3 min-h-[500px] bg-muted/5 p-2 rounded-lg border border-dashed border-border/80">
                            {tickets?.filter(t => t.ticket_status === status).map((ticket) => (
                                <Card key={ticket.name} className="border-border shadow-sm rounded-md hover:shadow-lg hover:border-primary/20 transition-all group bg-card overflow-hidden cursor-pointer active:scale-[0.98]">
                                    <CardContent className="p-4 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <Badge className={cn("text-[8px] font-black uppercase rounded-sm tracking-[0.15em] px-2 py-0.5 border-none shadow-none", getPriorityColor(ticket.priority))}>
                                                {ticket.priority}
                                            </Badge>
                                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">#{(ticket.name || ticket.id || "").split("-").pop()}</span>
                                        </div>

                                        <div className="space-y-1.5">
                                            <h4 className="font-black text-xs leading-snug text-foreground group-hover:text-primary transition-colors uppercase tracking-tight line-clamp-2">{ticket.issue_title}</h4>
                                            <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/30 px-2 py-1 rounded-sm w-fit border border-border/30">
                                                <MapPin className="h-2.5 w-2.5" />
                                                <span className="text-[8px] font-bold uppercase tracking-widest">{ticket.unit}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between py-3 border-t border-border/50">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <div className="h-6 w-6 rounded-full bg-muted/50 flex items-center justify-center border border-border">
                                                    <Wrench className="h-3 w-3" />
                                                </div>
                                                <span className="text-[9px] font-bold uppercase tracking-widest truncate max-w-[100px]">
                                                    {ticket.assigned_vendor || "UNASSIGNED"}
                                                </span>
                                            </div>
                                            {ticket.actual_cost > 0 && (
                                                <span className="text-[9px] font-black text-foreground bg-primary/5 px-2 py-0.5 rounded-sm border border-primary/10">
                                                    ₹{ticket.actual_cost}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            {status === "Open" && (
                                                <Button
                                                    onClick={() => updateStatus(ticket.name, "In Progress")}
                                                    className="flex-1 h-8 bg-muted hover:bg-primary hover:text-white border border-border text-muted-foreground font-black text-[9px] uppercase tracking-[0.2em] transition-all gap-1.5"
                                                >
                                                    Start <ArrowRight className="h-3 w-3" />
                                                </Button>
                                            )}
                                            {status === "In Progress" && (
                                                <Button
                                                    onClick={() => updateStatus(ticket.name, "Resolved")}
                                                    className="flex-1 h-8 bg-muted hover:bg-emerald-500 hover:text-white border border-border text-muted-foreground font-black text-[9px] uppercase tracking-[0.2em] transition-all gap-1.5"
                                                >
                                                    Resolve <CheckCircle2 className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {tickets?.filter(t => t.ticket_status === status).length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground/20">
                                    <Wrench className="h-10 w-10 mb-2 stroke-[1px]" />
                                    <p className="text-[9px] uppercase font-black tracking-[0.4em]">Clear</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
