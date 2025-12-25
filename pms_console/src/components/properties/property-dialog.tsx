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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, MapPin, Settings, Loader2 } from "lucide-react"
import { useFrappeCreateDoc, useFrappeUpdateDoc, useFrappeGetDocList } from "frappe-react-sdk"
import { toast } from "sonner"
import { ImageUploader } from "@/components/ui/image-uploader"

interface PropertyDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialData?: any // Data for editing
    onSuccess?: () => void
}

const propertyTypes = ["Homestay", "Villa", "Hotel", "Hostel", "Resort", "Guesthouse", "Apartment"]

export function PropertyDialog({ open, onOpenChange, initialData, onSuccess }: PropertyDialogProps) {
    const isEditing = !!initialData
    const { createDoc, loading: creating } = useFrappeCreateDoc()
    const { updateDoc, loading: updating } = useFrappeUpdateDoc()
    const { data: portfolios } = useFrappeGetDocList("Property Portfolio", {
        fields: ["name", "portfolio_name"],
        limit: 100
    })

    const [selectedPortfolio, setSelectedPortfolio] = useState("")
    const [propertyName, setPropertyName] = useState("")
    const [propertyType, setPropertyType] = useState("")
    const [location, setLocation] = useState("")
    const [address, setAddress] = useState("")
    const [units, setUnits] = useState("")
    const [description, setDescription] = useState("")
    const [latitude, setLatitude] = useState("")
    const [longitude, setLongitude] = useState("")
    const [bannerImage, setBannerImage] = useState("")
    const [galleryImages, setGalleryImages] = useState<string[]>([])

    // Populate data when editing
    useEffect(() => {
        if (open && initialData) {
            setSelectedPortfolio(initialData.portfolio || "none")
            setPropertyName(initialData.property_name || "")
            setPropertyType(initialData.property_type || "")
            setLocation(initialData.location_description?.split('\n')[0] || "")
            setAddress(initialData.location_description?.split('\n')[1] || "")
            setUnits(initialData.total_units?.toString() || initialData.total_rooms?.toString() || "")
            setDescription(initialData.description || "")
            setLatitude(initialData.latitude?.toString() || "")
            setLongitude(initialData.longitude?.toString() || "")
            setBannerImage(initialData.banner_image || "")
            setGalleryImages(initialData.images?.map((img: any) => img.image) || [])
        } else if (open && !initialData) {
            // Reset for new property
            setSelectedPortfolio("none")
            setPropertyName("")
            setPropertyType("")
            setLocation("")
            setAddress("")
            setUnits("")
            setDescription("")
            setLatitude("")
            setLongitude("")
            setBannerImage("")
            setGalleryImages([])
        }
    }, [open, initialData])

    const handleSubmit = async () => {
        const payload = {
            property_name: propertyName,
            property_type: propertyType,
            portfolio: selectedPortfolio === "none" ? "" : selectedPortfolio,
            location_description: address ? `${location}\n${address}` : location,
            status: initialData?.status || "Active",
            banner_image: bannerImage,
            images: galleryImages.map(img => ({ image: img }))
        }

        try {
            if (isEditing) {
                await updateDoc("Property", initialData.name, payload)
                toast.success("Property updated successfully")
            } else {
                await createDoc("Property", {
                    ...payload,
                    naming_series: "PROP-.YYYY.-.#####",
                })
                toast.success("Property created successfully")
            }
            onOpenChange(false)
            if (onSuccess) onSuccess()
        } catch (e: any) {
            console.error("Failed to save property:", e)
            toast.error(e.message || "Failed to save property")
        }
    }

    const isLoading = creating || updating

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] sm:max-w-2xl bg-white p-0 flex flex-col overflow-hidden gap-0">
                <DialogHeader className="px-6 pt-6 pb-4">
                    <DialogTitle>{isEditing ? "Edit Property" : "Add New Property"}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? "Update your property details" : "Add a new property to your portfolio"}
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="basic" className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-6">
                        <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1">
                            <TabsTrigger value="basic" className="gap-1.5 text-xs sm:text-sm">
                                <Building2 className="h-4 w-4" />
                                <span className="hidden sm:inline">General</span>
                            </TabsTrigger>
                            <TabsTrigger value="location" className="gap-1.5 text-xs sm:text-sm">
                                <MapPin className="h-4 w-4" />
                                <span className="hidden sm:inline">Location</span>
                            </TabsTrigger>
                            <TabsTrigger value="media" className="gap-1.5 text-xs sm:text-sm">
                                <Settings className="h-4 w-4" />
                                <span className="hidden sm:inline">Media Gallery</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-4 pb-8">
                        <TabsContent value="basic" className="mt-4 space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="portfolio">Portfolio</Label>
                                    <Select value={selectedPortfolio} onValueChange={setSelectedPortfolio}>
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue placeholder="Select portfolio" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None / Independent</SelectItem>
                                            {portfolios?.map((p) => (
                                                <SelectItem key={p.name} value={p.name}>
                                                    {p.portfolio_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="propertyType">Property Type</Label>
                                    <Select value={propertyType} onValueChange={setPropertyType}>
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue placeholder="Select property type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {propertyTypes.map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="sm:col-span-2 space-y-2">
                                    <Label htmlFor="propertyName">Property Name</Label>
                                    <Input
                                        id="propertyName"
                                        placeholder="e.g., Ocean View Villa"
                                        className="rounded-xl"
                                        value={propertyName}
                                        onChange={(e) => setPropertyName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="units">Total Units</Label>
                                    <Input
                                        id="units"
                                        type="number"
                                        placeholder="e.g., 5"
                                        className="rounded-xl"
                                        value={units}
                                        onChange={(e) => setUnits(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Describe your property..."
                                    rows={3}
                                    className="rounded-xl resize-none"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="location" className="mt-4 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="location">City</Label>
                                <Input
                                    id="location"
                                    placeholder="e.g., Pondicherry"
                                    className="rounded-xl"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Full Address</Label>
                                <Textarea
                                    id="address"
                                    placeholder="Enter the complete address..."
                                    rows={3}
                                    className="rounded-xl resize-none"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="latitude">Latitude (Optional)</Label>
                                    <Input
                                        id="latitude"
                                        placeholder="e.g., 11.9416"
                                        className="rounded-xl"
                                        value={latitude}
                                        onChange={(e) => setLatitude(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="longitude">Longitude (Optional)</Label>
                                    <Input
                                        id="longitude"
                                        placeholder="e.g., 79.8083"
                                        className="rounded-xl"
                                        value={longitude}
                                        onChange={(e) => setLongitude(e.target.value)}
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="media" className="mt-4 space-y-6">
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Banner Image</Label>
                                    <ImageUploader
                                        maxFiles={1}
                                        existingImages={bannerImage ? [bannerImage] : []}
                                        onUploadComplete={(url) => setBannerImage(url)}
                                        onDelete={() => setBannerImage("")}
                                        className="h-32"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Portfolio Gallery</Label>
                                    <ImageUploader
                                        existingImages={galleryImages}
                                        onUploadComplete={(url) => setGalleryImages(prev => [...prev, url])}
                                        onDelete={(url) => setGalleryImages(prev => prev.filter(i => i !== url))}
                                        className="h-32"
                                    />
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>

                <DialogFooter className="px-6 py-4 border-t border-gray-100 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl w-full sm:w-auto h-11 font-bold border-gray-200"
                    >
                        Cancel
                    </Button>
                    <Button
                        className="bg-[#FF3D2E] hover:bg-[#e63225] text-white font-bold rounded-xl px-8 w-full sm:w-auto h-11"
                        onClick={handleSubmit}
                        disabled={!propertyName || isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            isEditing ? "Save Changes" : "Create Property"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
