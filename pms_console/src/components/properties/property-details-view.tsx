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
        <div className="flex flex-col h-full bg-background rounded-lg overflow-hidden shadow-sm border border-border">
            {/* Sticky Header */}
            <div className="sticky top-0 z-20 bg-background/50 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between -mx-6 mb-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="rounded-lg hover:bg-muted h-9 w-9 flex-shrink-0 text-muted-foreground border border-border/50"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <h2 className="text-xl font-semibold text-foreground tracking-tight">{property.property_name}</h2>
                            <Badge className={cn(
                                "rounded-md px-2 py-0.5 font-bold text-[10px] uppercase tracking-wider border-none shadow-none",
                                property.status === "active" ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                            )}>
                                {property.status}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-70">
                            <div className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {property.property_type}
                            </div>
                            <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {property.location_description?.split('\n')[0]}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="rounded-md gap-2 font-semibold text-xs h-9 px-4 border-border bg-background shadow-sm hover:bg-muted transition-all">
                        <Share2 className="h-3.5 w-3.5" />
                        Share Property
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-lg h-9 w-9 border border-border/50 hover:bg-muted text-muted-foreground">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar bg-muted/30">
                {/* Banner Image */}
                <div className="relative h-56 w-full bg-muted">
                    <img
                        src={property.banner_image || property.images?.[0]?.image || "/placeholder.svg"}
                        alt={property.property_name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                </div>

                <div className="max-w-7xl mx-auto p-6 space-y-6 pb-20 -mt-16 relative z-10">
                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="border border-border shadow-sm rounded-lg bg-card overflow-hidden">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Total Units</span>
                                    <span className="font-black text-2xl text-foreground">{property.total_units || property.total_rooms || 0}</span>
                                </div>
                                <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center border border-border">
                                    <Bed className="h-5 w-5" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border border-border shadow-sm rounded-lg bg-card overflow-hidden">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Rating</span>
                                    <span className="font-black text-2xl text-foreground">{property.average_rating || "New"}</span>
                                </div>
                                <div className="h-10 w-10 rounded-md bg-amber-500/10 text-amber-500 flex items-center justify-center border border-border">
                                    <Star className="h-5 w-5 fill-amber-500" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border border-border shadow-sm rounded-lg bg-card overflow-hidden">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Check-in</span>
                                    <span className="font-black text-xl text-foreground">{property.check_in_time || "12:00 PM"}</span>
                                </div>
                                <div className="h-10 w-10 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-border">
                                    <Clock className="h-5 w-5" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border border-border shadow-sm rounded-lg bg-card overflow-hidden">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Check-out</span>
                                    <span className="font-black text-xl text-foreground">{property.check_out_time || "10:00 AM"}</span>
                                </div>
                                <div className="h-10 w-10 rounded-md bg-purple-500/10 text-purple-500 flex items-center justify-center border border-border">
                                    <Clock className="h-5 w-5" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Tabs */}
                    <Tabs defaultValue="inventory" className="w-full">
                        <TabsList className="bg-muted/50 p-1 rounded-md mb-6 h-11 w-fit border border-border/50">
                            <TabsTrigger value="inventory" className="rounded-sm h-9 px-6 font-bold text-[10px] gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm text-muted-foreground data-[state=active]:text-foreground uppercase tracking-widest">
                                <LayoutGrid className="h-4 w-4" />
                                Inventory & Units
                            </TabsTrigger>
                            <TabsTrigger value="about" className="rounded-sm h-9 px-6 font-bold text-[10px] gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm text-muted-foreground data-[state=active]:text-foreground uppercase tracking-widest">
                                <Building2 className="h-4 w-4" />
                                Property Details
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="inventory" className="space-y-6 focus-visible:outline-none mt-0">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <h3 className="text-lg font-bold text-foreground tracking-tight">Unit Categories</h3>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Manage room types and inventory</p>
                                </div>
                                <Button
                                    onClick={() => { setSelectedCategory(null); setCategoryDialogOpen(true); }}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-9 px-4 font-bold text-[10px] gap-2 shadow-sm uppercase tracking-widest"
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
                                        <Card key={cat.name} className="border border-border shadow-sm rounded-lg bg-card overflow-hidden group">
                                            <div className="p-5 flex flex-col md:flex-row gap-6">
                                                {/* Category Image */}
                                                <div className="h-24 w-32 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border">
                                                    {cat.images?.[0]?.image ? (
                                                        <img src={cat.images[0].image} alt={cat.category_name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                            <ImageIcon className="h-8 w-8" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Category Info */}
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-bold text-lg text-foreground">{cat.category_name}</h4>
                                                            <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground border-border bg-muted/50 px-2 rounded-sm">
                                                                {cat.unit_type}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                onClick={() => { setSelectedCategory(cat); setCategoryDialogOpen(true); }}
                                                                variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-muted text-muted-foreground"
                                                            >
                                                                <Edit2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button
                                                                onClick={() => { setSelectedCategory(cat); setUnitDialogOpen(true); }}
                                                                variant="outline"
                                                                className="h-8 rounded-md border-border font-bold text-[10px] uppercase tracking-widest text-primary hover:bg-primary/10 hover:text-primary gap-1.5"
                                                            >
                                                                <Plus className="h-3 w-3" />
                                                                Unit
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                                        <span className="flex items-center gap-1 text-foreground">
                                                            ₹{cat.base_rate_per_night?.toLocaleString()} <span className="text-[9px] text-muted-foreground font-bold uppercase">/ night</span>
                                                        </span>
                                                        <Separator orientation="vertical" className="h-3 bg-border" />
                                                        <span className="flex items-center gap-1.5">
                                                            <LayoutGrid className="h-3.5 w-3.5" />
                                                            {units?.filter(u => u.unit_category === cat.name).length} Units
                                                        </span>
                                                    </div>

                                                    <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-tight line-clamp-1">{cat.description || "No description provided."}</p>
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
                                            <div className="bg-muted/30 p-4 border-t border-border">
                                                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                                                    {units?.filter(u => u.unit_category === cat.name).map(unit => (
                                                        <div
                                                            key={unit.name}
                                                            onClick={() => { setSelectedUnit(unit); setUnitDialogOpen(true); }}
                                                            className={cn(
                                                                "group relative flex flex-col items-center justify-center p-2 rounded-md border cursor-pointer transition-all hover:scale-105",
                                                                unit.status === "Available" ? "bg-card border-border hover:border-emerald-300 hover:shadow-sm" :
                                                                    unit.status === "Dirty" ? "bg-amber-500/10 border-amber-500/20 hover:border-amber-300" :
                                                                        "bg-primary/10 border-primary/20 hover:border-primary/30"
                                                            )}
                                                        >
                                                            <span className="text-[10px] font-black text-foreground group-hover:text-primary">{unit.unit_no}</span>
                                                            <div className={cn(
                                                                "mt-1.5 h-1.5 w-1.5 rounded-full",
                                                                unit.status === "Available" ? "bg-emerald-500" :
                                                                    unit.status === "Occupied" ? "bg-primary" :
                                                                        "bg-amber-500"
                                                            )} />
                                                        </div>
                                                    ))}
                                                    {units?.filter(u => u.unit_category === cat.name).length === 0 && (
                                                        <div className="col-span-full py-3 text-center">
                                                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">No units assigned</p>
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
                                    <Card className="border border-border/50 shadow-sm rounded-lg bg-card overflow-hidden">
                                        <div className="bg-muted/20 px-6 py-3 border-b border-border">
                                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">About Property</h3>
                                        </div>
                                        <CardContent className="p-6">
                                            <p className="text-sm leading-relaxed text-foreground font-medium whitespace-pre-wrap">
                                                {property.description || "No description provided for this property."}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">Contact Info</h3>
                                    <Card className="border border-border shadow-sm rounded-lg bg-card p-1">
                                        <div className="flex items-center gap-3 p-4 border-b border-border">
                                            <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center border border-border">
                                                <Mail className="h-5 w-5" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Email</span>
                                                <p className="text-xs font-bold text-foreground">{property.email || "N/A"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-4">
                                            <div className="h-10 w-10 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-border">
                                                <Phone className="h-5 w-5" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Phone</span>
                                                <p className="text-xs font-bold text-foreground">{property.phone || "N/A"}</p>
                                            </div>
                                        </div>
                                    </Card>

                                    <Card className="border border-border shadow-sm rounded-lg bg-muted/50 overflow-hidden h-40 flex items-center justify-center">
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <MapPin className="h-8 w-8 opacity-50" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Map View Unavailable</span>
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
