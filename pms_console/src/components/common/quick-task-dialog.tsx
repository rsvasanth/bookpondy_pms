"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLocalDocList, useLocalCreate } from "@/hooks/use-local-data"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface QuickTaskDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function QuickTaskDialog({ open, onOpenChange }: QuickTaskDialogProps) {
    const [property, setProperty] = useState("")
    const [unit, setUnit] = useState("")
    const [type, setType] = useState("Cleaning")
    const [priority, setPriority] = useState("Medium")

    const { data: properties } = useLocalDocList("Property")
    const { data: units } = useLocalDocList("Unit", {
        selector: property ? { property } : {}
    })
    const { create, isCreating } = useLocalCreate()

    const handleSubmit = async () => {
        if (!unit) {
            toast.error("Please select a unit")
            return
        }

        try {
            await create("Housekeeping Task", {
                unit,
                property_link: property,
                task_type: type,
                priority,
                status: "Pending"
            })
            toast.success("Task assigned successfully")
            onOpenChange(false)
            // Reset
            setUnit("")
        } catch (e) {
            toast.error("Failed to create task")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] rounded-lg border border-border bg-card shadow-2xl p-0 overflow-hidden gap-0">
                <DialogHeader className="p-6 bg-muted/20 border-b border-border">
                    <DialogTitle className="text-xl font-black text-foreground tracking-tight uppercase">Quick Assign Task</DialogTitle>
                    <DialogDescription className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                        Create a housekeeping task for a specific unit.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 p-6">
                    <div className="grid gap-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Property</Label>
                        <Select value={property} onValueChange={setProperty}>
                            <SelectTrigger className="h-11 rounded-lg bg-muted/20 border-border font-bold text-sm uppercase">
                                <SelectValue placeholder="Select Property" />
                            </SelectTrigger>
                            <SelectContent>
                                {properties?.map(p => (
                                    <SelectItem key={p.name} value={p.name}>{p.property_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Unit</Label>
                        <Select value={unit} onValueChange={setUnit} disabled={!property}>
                            <SelectTrigger className="h-11 rounded-lg bg-muted/20 border-border font-bold text-sm uppercase">
                                <SelectValue placeholder={property ? "Select Unit" : "Select property first"} />
                            </SelectTrigger>
                            <SelectContent>
                                {units?.map(u => (
                                    <SelectItem key={u.name} value={u.name}>Unit {u.unit_no}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Task Type</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger className="h-11 rounded-lg bg-muted/20 border-border font-bold text-sm uppercase">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Cleaning">Cleaning</SelectItem>
                                    <SelectItem value="Laundry">Laundry</SelectItem>
                                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                                    <SelectItem value="Check-out Inspection">Inspection</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Priority</Label>
                            <Select value={priority} onValueChange={setPriority}>
                                <SelectTrigger className="h-11 rounded-lg bg-muted/20 border-border font-bold text-sm uppercase">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Urgent">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <DialogFooter className="p-6 bg-muted/20 border-t border-border flex sm:justify-between items-center gap-4">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-lg h-11 font-bold text-[10px] uppercase tracking-widest text-muted-foreground hover:bg-muted">
                        Cancel
                    </Button>
                    <Button
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg h-11 px-8 shadow-sm text-[10px] uppercase tracking-widest"
                        onClick={handleSubmit}
                        disabled={!unit || isCreating}
                    >
                        {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Assign Task"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
