"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import { useFrappeCreateDoc, useFrappeUpdateDoc, useFrappeGetDocList } from "frappe-react-sdk"
import { toast } from "sonner"

interface UnitDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    propertyId: string
    initialData?: any
    onSuccess?: () => void
}

const statusOptions = ["Available", "Occupied", "Dirty", "Out-of-Service", "Under-Maintenance"]

export function UnitDialog({ open, onOpenChange, propertyId, initialData, onSuccess }: UnitDialogProps) {
    const isEditing = !!initialData
    const { createDoc, loading: creating } = useFrappeCreateDoc()
    const { updateDoc, loading: updating } = useFrappeUpdateDoc()

    const { data: categories } = useFrappeGetDocList("Unit Category", {
        fields: ["name", "category_name"],
        filters: [["property", "=", propertyId]],
        limit: 100
    })

    const [unitNo, setUnitNo] = useState("")
    const [categoryId, setCategoryId] = useState("")
    const [status, setStatus] = useState("Available")
    const [floor, setFloor] = useState("")
    const [wing, setWing] = useState("")
    const [bedConfig, setBedConfig] = useState("")
    const [sqft, setSqft] = useState("")
    const [notes, setNotes] = useState("")

    useEffect(() => {
        if (open && initialData) {
            setUnitNo(initialData.unit_no || "")
            setCategoryId(initialData.unit_category || "")
            setStatus(initialData.status || "Available")
            setFloor(initialData.floor || "")
            setWing(initialData.wing || "")
            setBedConfig(initialData.bed_configuration || "")
            setSqft(initialData.total_square_feet?.toString() || "")
            setNotes(initialData.notes || "")
        } else if (open && !initialData) {
            setUnitNo("")
            setCategoryId("")
            setStatus("Available")
            setFloor("")
            setWing("")
            setBedConfig("")
            setSqft("")
            setNotes("")
        }
    }, [open, initialData])

    const handleSubmit = async () => {
        if (!unitNo || !categoryId) {
            toast.error("Please fill in unit name and category")
            return
        }

        const payload = {
            unit_no: unitNo,
            property: propertyId,
            unit_category: categoryId,
            status: status,
            floor: floor,
            wing: wing,
            bed_configuration: bedConfig,
            total_square_feet: parseFloat(sqft) || 0,
            notes: notes
        }

        try {
            if (isEditing) {
                await updateDoc("Unit", initialData.name, payload)
                toast.success("Unit updated")
            } else {
                await createDoc("Unit", {
                    ...payload,
                    naming_series: "UNT-.YYYY.-.#####"
                })
                toast.success("Unit created")
            }
            onOpenChange(false)
            if (onSuccess) onSuccess()
        } catch (e: any) {
            toast.error(e.message || "Failed to save unit")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] sm:max-w-xl bg-white border-none shadow-2xl rounded-3xl p-0 flex flex-col overflow-hidden">
                <DialogHeader className="p-8 pb-4">
                    <DialogTitle className="text-2xl font-bold">{isEditing ? "Edit Unit" : "New Physical Unit"}</DialogTitle>
                    <DialogDescription>Add a specific room or instance to your inventory</DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-8 py-4 space-y-6 custom-scrollbar">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Unit Number/Name *</Label>
                            <Input
                                placeholder="e.g. Suite 101 or Villa A"
                                value={unitNo}
                                onChange={e => setUnitNo(e.target.value)}
                                className="rounded-xl bg-gray-50/50 border-gray-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Category *</Label>
                            <Select value={categoryId} onValueChange={setCategoryId}>
                                <SelectTrigger className="rounded-xl bg-gray-50/50 border-gray-100">
                                    <SelectValue placeholder="Choose type" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                                    {categories?.map(c => <SelectItem key={c.name} value={c.name}>{c.category_name}</SelectItem>)}
                                    {categories?.length === 0 && <p className="p-4 text-xs italic text-gray-400">No categories found. Create one first.</p>}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Status</Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="rounded-xl bg-gray-50/50 border-gray-100">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                                    {statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Floor/Level</Label>
                            <Input
                                placeholder="1st"
                                value={floor}
                                onChange={e => setFloor(e.target.value)}
                                className="rounded-xl bg-gray-50/50 border-gray-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Wing/Block</Label>
                            <Input
                                placeholder="East Wing"
                                value={wing}
                                onChange={e => setWing(e.target.value)}
                                className="rounded-xl bg-gray-50/50 border-gray-100"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Bed Configuration</Label>
                            <Input
                                placeholder="1 King, 2 Twins"
                                value={bedConfig}
                                onChange={e => setBedConfig(e.target.value)}
                                className="rounded-xl bg-gray-50/50 border-gray-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Square Feet</Label>
                            <Input
                                type="number"
                                placeholder="450"
                                value={sqft}
                                onChange={e => setSqft(e.target.value)}
                                className="rounded-xl bg-gray-50/50 border-gray-100"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Internal Notes</Label>
                        <Textarea
                            placeholder="Maintenance history or specific unit quirks..."
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            className="rounded-xl bg-gray-50/50 border-gray-100"
                        />
                    </div>
                </div>

                <DialogFooter className="p-8 pt-4 border-t border-gray-50 flex gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl h-12 flex-1 font-bold">
                        Cancel
                    </Button>
                    <Button
                        className="rounded-xl h-12 flex-[2] bg-red-500 hover:bg-red-600 font-bold shadow-lg shadow-red-500/20"
                        onClick={handleSubmit}
                        disabled={creating || updating}
                    >
                        {isEditing ? "Save Unit" : "Add Unit"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
