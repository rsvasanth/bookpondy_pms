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
    CheckCircle2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UnitCategoryDialog } from "./unit-category-dialog"
import { UnitDialog } from "./unit-dialog"
import { UnitCategoryCalendar } from "./unit-category-calendar"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface PropertyDetailsViewProps {
    property: any
    onClose: () => void
}

import { PropertyProvider, useProperty } from "@/context/property-context"

function PropertyDetailsContent({ onClose, initialProperty }: { onClose: () => void, initialProperty: any }) {
    const { property: contextProperty, unitCategories, units, occupancy, refresh, isLoading } = useProperty()

    // Use context property if available (has more data), otherwise fall back to initial property
    const property = contextProperty || initialProperty

    // Safety check if property is null
    if (!property) return null

    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
    const [unitDialogOpen, setUnitDialogOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<any>(null)
    const [selectedUnit, setSelectedUnit] = useState<any>(null)

    return (
        <div className="flex flex-col h-full bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
            {/* Sticky Header */}
            <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="rounded-xl hover:bg-slate-100 h-9 w-9 flex-shrink-0 text-slate-500"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <h2 className="text-lg font-bold text-slate-800 tracking-tight">{property.property_name}</h2>
                            <Badge className={cn(
                                "rounded-md px-2 py-0.5 font-black text-[10px] uppercase tracking-widest border-none shadow-none",
                                property.status === "active" ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                            )}>
                                {property.status}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-bold tracking-wide">
                            <div className="flex items-center gap-1">
                                <Building2 className="h-3 w-3 text-slate-400" />
                                {property.property_type}
                            </div>
                            <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-slate-400" />
                                {property.location_description?.split('\n')[0]}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl gap-2 font-bold text-[10px] h-9 px-4 border-slate-200 text-slate-600 uppercase tracking-wider">
                        <Share2 className="h-3.5 w-3.5" />
                        Share
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 border border-transparent hover:bg-slate-100 text-slate-400">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
                {/* Banner Image */}
                <div className="relative h-48 w-full bg-slate-200">
                    <img
                        src={property.banner_image || property.images?.[0]?.image || "/placeholder.svg"}
                        alt={property.property_name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                </div>

                <div className="max-w-7xl mx-auto p-6 space-y-6 pb-20 -mt-12 relative z-10">
                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="border-none shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Total Units</span>
                                    <span className="font-black text-2xl text-slate-800">{property.total_units || property.total_rooms || 0}</span>
                                </div>
                                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                                    <Bed className="h-5 w-5" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Rating</span>
                                    <span className="font-black text-2xl text-slate-800">{property.average_rating || "New"}</span>
                                </div>
                                <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                                    <Star className="h-5 w-5 fill-amber-500" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Check-in</span>
                                    <span className="font-black text-xl text-slate-800">{property.check_in_time || "12:00 PM"}</span>
                                </div>
                                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                                    <Clock className="h-5 w-5" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Check-out</span>
                                    <span className="font-black text-xl text-slate-800">{property.check_out_time || "10:00 AM"}</span>
                                </div>
                                <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
                                    <Clock className="h-5 w-5" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Tabs */}
                    <Tabs defaultValue="inventory" className="w-full">
                        <TabsList className="bg-slate-100/50 p-1 rounded-xl mb-6 h-11 w-fit">
                            <TabsTrigger value="inventory" className="rounded-lg h-9 px-6 font-bold text-xs gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-slate-500 data-[state=active]:text-slate-900 uppercase tracking-wider">
                                Inventory & Units
                            </TabsTrigger>
                            <TabsTrigger value="about" className="rounded-lg h-9 px-6 font-bold text-xs gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-slate-500 data-[state=active]:text-slate-900 uppercase tracking-wider">
                                Property Details
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="inventory" className="space-y-6 focus-visible:outline-none mt-0">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <h3 className="text-lg font-bold text-slate-800 tracking-tight">Unit Categories</h3>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Manage room types and inventory</p>
                                </div>
                                <Button
                                    onClick={() => { setSelectedCategory(null); setCategoryDialogOpen(true); }}
                                    className="bg-primary hover:bg-primary/90 text-white rounded-xl h-9 px-4 font-bold text-xs gap-2 shadow-sm uppercase tracking-wide"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Add Category
                                </Button>
                            </div>

                            {isLoading && !unitCategories.length ? (
                                <div className="text-center py-10 text-slate-400">Loading categories...</div>
                            ) : (
                                <div className="grid gap-4">
                                    {unitCategories?.map((cat) => (
                                        <Card key={cat.name} className="border-none shadow-sm rounded-2xl bg-white overflow-hidden group">
                                            <div className="p-5 flex flex-col md:flex-row gap-6">
                                                {/* Category Image */}
                                                <div className="h-24 w-32 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
                                                    {cat.images?.[0]?.image ? (
                                                        <img src={cat.images[0].image} alt={cat.category_name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                            <ImageIcon className="h-8 w-8" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Category Info */}
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-bold text-lg text-slate-800">{cat.category_name}</h4>
                                                            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest text-slate-500 border-slate-200 bg-slate-50 px-2">
                                                                {cat.unit_type}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                onClick={() => { setSelectedCategory(cat); setCategoryDialogOpen(true); }}
                                                                variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-400"
                                                            >
                                                                <Edit2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button
                                                                onClick={() => { setSelectedCategory(cat); setUnitDialogOpen(true); }}
                                                                variant="outline"
                                                                className="h-8 rounded-lg border-slate-200 font-bold text-[10px] uppercase tracking-wider text-primary hover:bg-primary/5 hover:text-primary gap-1.5"
                                                            >
                                                                <Plus className="h-3 w-3" />
                                                                Unit
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                                                        <span className="flex items-center gap-1 font-bold text-slate-700">
                                                            ₹{cat.base_rate_per_night?.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal uppercase">/ night</span>
                                                        </span>
                                                        <Separator orientation="vertical" className="h-3 bg-slate-200" />
                                                        <span className="flex items-center gap-1.5 font-bold">
                                                            <LayoutGrid className="h-3.5 w-3.5 text-slate-400" />
                                                            {units?.filter(u => u.unit_category === cat.name).length} Units
                                                        </span>
                                                    </div>

                                                    <p className="text-sm text-slate-500 font-medium line-clamp-1">{cat.description || "No description provided."}</p>
                                                </div>

                                                {/* Calendar Preview - Hidden on small screens */}
                                                <div className="hidden lg:block w-1/3 pl-6 border-l border-slate-50">
                                                    <UnitCategoryCalendar
                                                        categoryId={cat.name}
                                                        totalUnits={units?.filter(u => u.unit_category === cat.name).length || 0}
                                                        occupancyData={occupancy?.[cat.name] || {}}
                                                    />
                                                </div>
                                            </div>

                                            {/* Units Grid */}
                                            <div className="bg-slate-50/50 p-4 border-t border-slate-50">
                                                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                                                    {units?.filter(u => u.unit_category === cat.name).map(unit => (
                                                        <div
                                                            key={unit.name}
                                                            onClick={() => { setSelectedUnit(unit); setUnitDialogOpen(true); }}
                                                            className={cn(
                                                                "group relative flex flex-col items-center justify-center p-2 rounded-xl border cursor-pointer transition-all hover:scale-105",
                                                                unit.status === "Available" ? "bg-white border-slate-200 hover:border-emerald-300 hover:shadow-sm" :
                                                                    unit.status === "Dirty" ? "bg-amber-50 border-amber-100 hover:border-amber-300" :
                                                                        "bg-blue-50 border-blue-100 hover:border-blue-300"
                                                            )}
                                                        >
                                                            <span className="text-[10px] font-black text-slate-600 group-hover:text-slate-900">{unit.unit_no}</span>
                                                            <div className={cn(
                                                                "mt-1.5 h-1.5 w-1.5 rounded-full",
                                                                unit.status === "Available" ? "bg-emerald-500" :
                                                                    unit.status === "Occupied" ? "bg-blue-500" :
                                                                        "bg-amber-500"
                                                            )} />
                                                        </div>
                                                    ))}
                                                    {units?.filter(u => u.unit_category === cat.name).length === 0 && (
                                                        <div className="col-span-full py-3 text-center">
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No units assigned</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    ))}

                                    {unitCategories?.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-200 rounded-3xl space-y-4 bg-slate-50/50">
                                            <div className="h-16 w-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-300 border border-slate-100">
                                                <LayoutGrid className="h-8 w-8" />
                                            </div>
                                            <div className="text-center space-y-1">
                                                <p className="text-sm font-bold text-slate-600">No inventory defined</p>
                                                <p className="text-xs text-slate-400 max-w-xs mx-auto">Create unit categories to start managing inventory.</p>
                                            </div>
                                            <Button
                                                onClick={() => { setSelectedCategory(null); setCategoryDialogOpen(true); }}
                                                className="rounded-xl font-bold h-9 px-6 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm text-xs uppercase tracking-wide"
                                            >
                                                Create Category
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="about" className="space-y-6 focus-visible:outline-none mt-0">
                            <div className="grid lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-6">
                                    <Card className="border-none shadow-sm rounded-2xl bg-white p-6">
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4">About Property</h3>
                                        <p className="text-sm leading-relaxed text-slate-600 font-medium whitespace-pre-wrap">
                                            {property.description || "No description provided for this property."}
                                        </p>
                                    </Card>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 pl-1">Contact Info</h3>
                                    <Card className="border-none shadow-sm rounded-2xl bg-white p-1">
                                        <div className="flex items-center gap-3 p-4 border-b border-slate-50">
                                            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                                                <Mail className="h-5 w-5" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Email</span>
                                                <p className="text-xs font-bold text-slate-700">{property.email || "N/A"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-4">
                                            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                                                <Phone className="h-5 w-5" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Phone</span>
                                                <p className="text-xs font-bold text-slate-700">{property.phone || "N/A"}</p>
                                            </div>
                                        </div>
                                    </Card>

                                    <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden h-40 flex items-center justify-center bg-slate-50">
                                        <div className="flex flex-col items-center gap-2 text-slate-300">
                                            <MapPin className="h-8 w-8 opacity-50" />
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Map View Unavailable</span>
                                        </div>
                                    </Card>
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
