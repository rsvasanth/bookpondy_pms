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
import { Checkbox } from "@/components/ui/checkbox"

import { useFrappeCreateDoc, useFrappeUpdateDoc } from "frappe-react-sdk"
import { toast } from "sonner"
import { ImageUploader } from "@/components/ui/image-uploader"

interface UnitCategoryDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    propertyId: string
    initialData?: any
    onSuccess?: () => void
}

interface CategoryImage {
    image: string
    label: string
}

const unitTypes = ["Room", "Cottage", "Villa", "Apartment", "Studio", "Dormitory"]

const amenitiesList = [
    "WiFi", "Air Conditioning", "Mini Bar", "Bathtub", "Private Garden",
    "Outdoor Shower", "Sea View", "King Bed", "Shared Kitchen", "Balcony", "Private Pool"
]

export function UnitCategoryDialog({ open, onOpenChange, propertyId, initialData, onSuccess }: UnitCategoryDialogProps) {
    const isEditing = !!initialData
    const { createDoc, loading: creating } = useFrappeCreateDoc()
    const { updateDoc, loading: updating } = useFrappeUpdateDoc()

    const [categoryName, setCategoryName] = useState("")
    const [unitType, setUnitType] = useState("")
    const [maxAdults, setMaxAdults] = useState("2")
    const [maxChildren, setMaxChildren] = useState("1")
    const [baseRate, setBaseRate] = useState("")
    const [description, setDescription] = useState("")
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
    const [images, setImages] = useState<CategoryImage[]>([])

    useEffect(() => {
        if (open && initialData) {
            setCategoryName(initialData.category_name || "")
            setUnitType(initialData.unit_type || "")
            setMaxAdults(initialData.occupancy_max_adults?.toString() || "2")
            setMaxChildren(initialData.occupancy_max_children?.toString() || "1")
            setBaseRate(initialData.base_rate_per_night?.toString() || "")
            setDescription(initialData.description || "")
            const existingAmenities = initialData.amenities?.map((a: any) => a.amenity) || []
            setSelectedAmenities(existingAmenities)
            setImages(initialData.images || [])
        } else if (open && !initialData) {
            setCategoryName("")
            setUnitType("")
            setMaxAdults("2")
            setMaxChildren("1")
            setBaseRate("")
            setDescription("")
            setSelectedAmenities([])
            setImages([])
        }
    }, [open, initialData])

    const handleSubmit = async () => {
        if (!categoryName || !unitType || !baseRate) {
            toast.error("Please fill in required fields")
            return
        }

        const payload = {
            category_name: categoryName,
            property: propertyId,
            unit_type: unitType,
            occupancy_max_adults: parseInt(maxAdults),
            occupancy_max_children: parseInt(maxChildren),
            base_rate_per_night: parseFloat(baseRate),
            description: description,
            amenities: selectedAmenities.map(a => ({ amenity: a })),
            images: images
        }

        try {
            if (isEditing) {
                await updateDoc("Unit Category", initialData.name, payload)
                toast.success("Category updated")
            } else {
                await createDoc("Unit Category", {
                    ...payload,
                    naming_series: "UC-.YYYY.-.#####"
                })
                toast.success("Category created")
            }
            onOpenChange(false)
            if (onSuccess) onSuccess()
        } catch (e: any) {
            toast.error(e.message || "Failed to save category")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] sm:max-w-2xl bg-white border-none shadow-2xl rounded-3xl p-0 flex flex-col overflow-hidden">
                <DialogHeader className="p-8 pb-4">
                    <DialogTitle className="text-2xl font-bold">{isEditing ? "Edit Category" : "New Unit Category"}</DialogTitle>
                    <DialogDescription>Define a bookable room type or villa category</DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-8 py-4 space-y-6 custom-scrollbar">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-muted-foreground">Category Name *</Label>
                            <Input
                                placeholder="e.g. Deluxe Sea View Suite"
                                value={categoryName}
                                onChange={e => setCategoryName(e.target.value)}
                                className="rounded-md bg-muted/30 border-border focus-visible:ring-primary/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-muted-foreground">Unit Type *</Label>
                            <Select value={unitType} onValueChange={setUnitType}>
                                <SelectTrigger className="rounded-md bg-muted/30 border-border">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent className="rounded-md border-border shadow-md">
                                    {unitTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-muted-foreground">Base Rate (₹) *</Label>
                            <Input
                                type="number"
                                placeholder="8000"
                                value={baseRate}
                                onChange={e => setBaseRate(e.target.value)}
                                className="rounded-md bg-muted/30 border-border"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-muted-foreground">Max Adults</Label>
                            <Input
                                type="number"
                                value={maxAdults}
                                onChange={e => setMaxAdults(e.target.value)}
                                className="rounded-md bg-muted/30 border-border"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-muted-foreground">Max Children</Label>
                            <Input
                                type="number"
                                value={maxChildren}
                                onChange={e => setMaxChildren(e.target.value)}
                                className="rounded-md bg-muted/30 border-border"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Description</Label>
                        <Textarea
                            placeholder="Describe the unique features of this category..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="rounded-xl bg-gray-50/50 border-gray-100 min-h-[100px]"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold text-muted-foreground">Gallery Images</Label>
                            <span className="text-[10px] font-semibold text-error bg-error/10 px-2 py-0.5 rounded-full">Drag & Drop Enabled</span>
                        </div>

                        <ImageUploader
                            existingImages={images.map(img => img.image)}
                            onUploadComplete={(url) => {
                                setImages(prev => [...prev, { image: url, label: "" }])
                            }}
                            onDelete={(url) => {
                                setImages(prev => prev.filter(img => img.image !== url))
                            }}
                        />
                    </div>

                    <div className="space-y-3">
                        <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Common Amenities</Label>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {amenitiesList.map((amenity) => (
                                <div key={amenity} className="flex items-center space-x-2 rounded-xl border border-gray-50 bg-gray-50/30 p-2.5 transition-colors hover:bg-gray-50">
                                    <Checkbox
                                        id={`amenity-${amenity}`}
                                        checked={selectedAmenities.includes(amenity)}
                                        onCheckedChange={(checked) => {
                                            if (checked) setSelectedAmenities([...selectedAmenities, amenity])
                                            else setSelectedAmenities(selectedAmenities.filter(a => a !== amenity))
                                        }}
                                        className="rounded-md border-gray-200 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                                    />
                                    <label htmlFor={`amenity-${amenity}`} className="text-xs font-semibold cursor-pointer select-none">
                                        {amenity}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-8 pt-4 border-t border-border flex gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-md h-12 flex-1 border-border font-semibold">
                        Cancel
                    </Button>
                    <Button
                        className="rounded-md h-12 flex-[2] bg-primary hover:bg-primary/90 font-semibold shadow-lg shadow-primary/10"
                        onClick={handleSubmit}
                        disabled={creating || updating}
                    >
                        {isEditing ? "Save Changes" : "Create Category"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
