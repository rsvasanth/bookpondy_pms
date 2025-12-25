"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    MapPin,
    Bed,
    Star,
    Building2,
    Mail,
    Phone,
    Clock,
    Image as ImageIcon,
    Plus,
    Edit2,
    LayoutGrid,
    ArrowLeft,
    Share2,
    MoreVertical,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UnitCategoryDialog } from "./unit-category-dialog"
import { UnitDialog } from "./unit-dialog"
import { UnitCategoryCalendar } from "./unit-category-calendar"

import { Button } from "@/components/ui/button"

interface PropertyDetailsViewProps {
    property: any
    onClose: () => void
}

const statusConfig = {
    active: { label: "Active", className: "bg-green-500/10 text-green-600 border-green-200" },
    inactive: { label: "Inactive", className: "bg-gray-500/10 text-gray-600 border-gray-200" },
    maintenance: { label: "Maintenance", className: "bg-yellow-500/10 text-yellow-600 border-yellow-200" },
}

import { PropertyProvider, useProperty } from "@/context/property-context"

function PropertyDetailsContent({ onClose, initialProperty }: { onClose: () => void, initialProperty: any }) {
    const { property: contextProperty, unitCategories, units, occupancy, refresh, isLoading } = useProperty()

    // Use context property if available (has more data), otherwise fall back to initial property
    const property = contextProperty || initialProperty

    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
    const [unitDialogOpen, setUnitDialogOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<any>(null)
    const [selectedUnit, setSelectedUnit] = useState<any>(null)

    if (!property) return null

    const getStatusConfig = (status: string) => {
        const s = status?.toLowerCase() || "inactive"
        return statusConfig[s as keyof typeof statusConfig] || statusConfig.inactive
    }

    return (
        <div className="flex flex-col h-full bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
            {/* Sticky Header */}
            <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="rounded-xl hover:bg-gray-100 h-9 w-9 flex-shrink-0"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <h2 className="text-lg font-bold text-[#0A0A0A]">{property.property_name}</h2>
                            <Badge className={cn("rounded-lg border px-2 py-0.5 font-bold text-[10px] uppercase tracking-wider", getStatusConfig(property.status).className)}>
                                {getStatusConfig(property.status).label}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                            <div className="flex items-center gap-1">
                                <Building2 className="h-3 w-3 text-[#FF3D2E]" />
                                {property.property_type}
                            </div>
                            <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-[#FF3D2E]" />
                                {property.location_description?.split('\n')[0]}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl gap-2 font-bold text-[11px] h-9 px-3.5 border-gray-100">
                        <Share2 className="h-4 w-4" />
                        SHARE
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 border border-transparent hover:border-gray-100">
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Banner Image */}
                <div className="relative h-44 w-full bg-gray-100">
                    <img
                        src={property.banner_image || property.images?.[0]?.image || "/placeholder.svg"}
                        alt={property.property_name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                <div className="max-w-6xl mx-auto px-6 py-6 space-y-6 pb-20">
                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-50 transition-all hover:border-[#FF3D2E]/20 hover:bg-white hover:shadow-sm group">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 block">Total Units</span>
                            <div className="flex items-center gap-2.5">
                                <div className="h-9 w-9 rounded-xl bg-red-50 text-[#FF3D2E] flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Bed className="h-4 w-4" />
                                </div>
                                <span className="font-bold text-xl">{property.total_units || property.total_rooms || 0}</span>
                            </div>
                        </div>
                        <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-50 transition-all hover:border-yellow-200 hover:bg-white hover:shadow-sm group">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 block">Average Rating</span>
                            <div className="flex items-center gap-2.5">
                                <div className="h-9 w-9 rounded-xl bg-yellow-50 text-yellow-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Star className="h-4 w-4 fill-yellow-500" />
                                </div>
                                <span className="font-bold text-xl">{property.average_rating || "New"}</span>
                            </div>
                        </div>
                        <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-50 transition-all hover:border-blue-200 hover:bg-white hover:shadow-sm group">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 block">Check-in</span>
                            <div className="flex items-center gap-2.5">
                                <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Clock className="h-4 w-4" />
                                </div>
                                <span className="font-bold text-lg">{property.check_in_time || "12:00 PM"}</span>
                            </div>
                        </div>
                        <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-50 transition-all hover:border-violet-200 hover:bg-white hover:shadow-sm group">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 block">Check-out</span>
                            <div className="flex items-center gap-2.5">
                                <div className="h-9 w-9 rounded-xl bg-violet-50 text-violet-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Clock className="h-4 w-4" />
                                </div>
                                <span className="font-bold text-lg">{property.check_out_time || "10:00 AM"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Tabs */}
                    <Tabs defaultValue="inventory" className="w-full">
                        <TabsList className="bg-gray-100/50 p-1 rounded-2xl mb-6 w-fit h-10">
                            <TabsTrigger value="inventory" className="rounded-xl px-6 h-8 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wider">Inventory & Units</TabsTrigger>
                            <TabsTrigger value="about" className="rounded-xl px-6 h-8 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wider">Property Details</TabsTrigger>
                        </TabsList>

                        <TabsContent value="inventory" className="space-y-6 focus-visible:outline-none">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <h3 className="text-base font-bold text-[#0A0A0A]">Unit Categories</h3>
                                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-tight">Manage your room types and inventory</p>
                                </div>
                                <Button
                                    onClick={() => { setSelectedCategory(null); setCategoryDialogOpen(true); }}
                                    className="bg-[#FF3D2E] hover:bg-[#e63225] text-white rounded-xl h-9 px-4 font-bold text-[11px] gap-2 shadow-lg shadow-red-500/10"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    ADD CATEGORY
                                </Button>
                            </div>

                            {isLoading && !unitCategories.length ? (
                                <div className="text-center py-10 text-gray-400">Loading categories...</div>
                            ) : (
                                <div className="grid gap-4">
                                    {unitCategories?.map((cat) => (
                                        <div key={cat.name} className="rounded-3xl border border-gray-100 bg-white p-5 space-y-5 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex gap-5 flex-1">
                                                    <div className="h-20 w-28 rounded-2xl overflow-hidden border border-gray-50 flex-shrink-0 bg-gray-50">
                                                        {cat.images?.[0]?.image ? (
                                                            <img src={cat.images[0].image} alt={cat.category_name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-200">
                                                                <ImageIcon className="h-7 w-7" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="space-y-1.5 py-0.5">
                                                        <div className="flex items-center gap-2.5">
                                                            <h4 className="font-bold text-lg text-[#0A0A0A]">{cat.category_name}</h4>
                                                            <Badge variant="outline" className="text-[9px] py-0 px-1.5 font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50">{cat.unit_type}</Badge>
                                                        </div>
                                                        <div className="flex items-center gap-3.5 text-xs font-bold">
                                                            <span className="text-[#FF3D2E]">₹{cat.base_rate_per_night?.toLocaleString()} <span className="text-[9px] text-muted-foreground uppercase">/ night</span></span>
                                                            <Separator orientation="vertical" className="h-3.5" />
                                                            <span className="text-gray-600 flex items-center gap-1">
                                                                <LayoutGrid className="h-3 w-3" />
                                                                {units?.filter(u => u.unit_category === cat.name).length} Units
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-muted-foreground font-medium max-w-md line-clamp-1 leading-normal">{cat.description || "No description provided."}</p>
                                                    </div>
                                                </div>

                                                <div className="hidden lg:block px-2">
                                                    <UnitCategoryCalendar
                                                        categoryId={cat.name}
                                                        totalUnits={units?.filter(u => u.unit_category === cat.name).length || 0}
                                                        occupancyData={occupancy?.[cat.name] || {}}
                                                    />
                                                </div>

                                                <div className="flex gap-1.5">
                                                    <Button
                                                        onClick={() => { setSelectedCategory(cat); setCategoryDialogOpen(true); }}
                                                        variant="outline" className="h-9 w-9 p-0 rounded-xl text-gray-400 hover:text-blue-500 hover:bg-blue-50 border-gray-100"
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        onClick={() => { setSelectedCategory(cat); setUnitDialogOpen(true); }}
                                                        variant="outline"
                                                        className="h-9 border-gray-100 bg-gray-50/50 hover:bg-red-50 text-gray-600 hover:text-red-500 rounded-xl px-3 text-[11px] font-bold gap-1.5"
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                        UNIT
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
                                                {units?.filter(u => u.unit_category === cat.name).map(unit => (
                                                    <div
                                                        key={unit.name}
                                                        onClick={() => { setSelectedUnit(unit); setUnitDialogOpen(true); }}
                                                        className={cn(
                                                            "group relative flex flex-col items-center justify-center p-2.5 rounded-2xl border cursor-pointer transition-all hover:scale-105",
                                                            unit.status === "Available" ? "bg-green-50/20 border-green-100 hover:bg-green-50 hover:border-green-200" :
                                                                unit.status === "Dirty" ? "bg-orange-50/20 border-orange-100 hover:bg-orange-50 hover:border-orange-200" :
                                                                    "bg-gray-50/20 border-gray-100 hover:bg-gray-100"
                                                        )}
                                                    >
                                                        <span className="text-[11px] font-bold text-gray-700">{unit.unit_no}</span>
                                                        <div className={cn(
                                                            "mt-1.5 h-1.5 w-1.5 rounded-full shadow-sm",
                                                            unit.status === "Available" ? "bg-green-500" :
                                                                unit.status === "Occupied" ? "bg-blue-500" :
                                                                    "bg-red-500"
                                                        )} />
                                                    </div>
                                                ))}
                                                {units?.filter(u => u.unit_category === cat.name).length === 0 && (
                                                    <div className="col-span-full py-4 px-2 border border-dashed border-gray-100 rounded-2xl text-center">
                                                        <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">No units assigned</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {unitCategories?.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-gray-100 rounded-[2.5rem] space-y-4 bg-gray-50/20">
                                            <div className="h-20 w-20 rounded-3xl bg-white shadow-sm flex items-center justify-center text-gray-200">
                                                <LayoutGrid className="h-10 w-10" />
                                            </div>
                                            <div className="text-center space-y-1">
                                                <p className="text-sm font-bold text-gray-600">No inventory defined yet</p>
                                                <p className="text-xs text-muted-foreground max-w-xs">Start by creating unit categories (room types) to manage your property inventory.</p>
                                            </div>
                                            <Button
                                                onClick={() => { setSelectedCategory(null); setCategoryDialogOpen(true); }}
                                                className="rounded-2xl font-bold h-12 px-8 bg-white border border-gray-200 text-[#0A0A0A] hover:bg-gray-50 shadow-sm"
                                            >
                                                Create First Category
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="about" className="space-y-6 focus-visible:outline-none">
                            <div className="grid lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#FF3D2E]">About this property</h3>
                                        <p className="text-sm leading-relaxed text-gray-600 font-medium whitespace-pre-wrap antialiased">
                                            {property.description || "No description provided for this property."}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#FF3D2E]">Contact & Support</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 bg-white shadow-sm">
                                            <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
                                                <Mail className="h-5 w-5" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Email Address</span>
                                                <p className="text-xs font-bold">{property.email || "N/A"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 bg-white shadow-sm">
                                            <div className="h-10 w-10 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center">
                                                <Phone className="h-5 w-5" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</span>
                                                <p className="text-xs font-bold">{property.phone || "N/A"}</p>
                                            </div>
                                        </div>
                                        <div className="h-40 rounded-3xl overflow-hidden bg-gray-100 border border-gray-100">
                                            {/* Mock Map */}
                                            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-gray-50 gap-2">
                                                <MapPin className="h-6 w-6 text-[#FF3D2E]/40" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Map View Unavailable</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            <UnitCategoryDialog
                open={categoryDialogOpen}
                onOpenChange={setCategoryDialogOpen}
                propertyId={property.name}
                initialData={selectedCategory}
                onSuccess={() => { refresh() }}
            />
            <UnitDialog
                open={unitDialogOpen}
                onOpenChange={setUnitDialogOpen}
                propertyId={property.name}
                initialData={selectedUnit}
                onSuccess={() => { refresh() }}
            />
        </div>
    )
}

export function PropertyDetailsView({ property, onClose }: PropertyDetailsViewProps) {
    return (
        <PropertyProvider propertyId={property?.name}>
            <PropertyDetailsContent onClose={onClose} initialProperty={property} />
        </PropertyProvider>
    )
}
