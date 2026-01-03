"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
    MoreVertical
} from "lucide-react"
import { cn } from "@/lib/utils"
import { PropertyProvider, useProperty } from "@/context/property-context"
import { UnitCategoryDialog } from "./unit-category-dialog"
import { UnitDialog } from "./unit-dialog"
import { UnitCategoryCalendar } from "./unit-category-calendar"

interface PropertyDetailsViewProps {
    property: any
    onClose: () => void
}

function PropertyDetailsContent({ onClose, initialProperty }: { onClose: () => void, initialProperty: any }) {
    const { property: contextProperty, unitCategories, units, occupancy, refresh, isLoading } = useProperty()

    // Safety fallback
    const property = contextProperty || initialProperty
    if (!property) return (
        <div className="flex items-center justify-center h-full p-20">
            <p className="text-muted-foreground animate-pulse">Loading property details...</p>
        </div>
    )

    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
    const [unitDialogOpen, setUnitDialogOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<any>(null)
    const [selectedUnit, setSelectedUnit] = useState<any>(null)

    return (
        <div className="flex flex-col h-full bg-background min-h-[calc(100vh-180px)]">
            {/* Header section - Sticky with backdrop blur */}
            <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border py-4 px-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-9 w-9 border border-border/50 rounded-lg text-muted-foreground hover:bg-muted"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <h2 className="text-xl font-semibold tracking-tight text-foreground">{property.property_name}</h2>
                            <Badge className={cn(
                                "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border-none shadow-none rounded-md",
                                property.status === "active" ? "bg-success text-white" : "bg-muted text-muted-foreground"
                            )}>
                                {property.status}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-70">
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
                    <Button variant="outline" size="sm" className="hidden sm:flex h-9 px-4 gap-2 font-semibold text-xs border-border bg-background shadow-sm hover:bg-muted">
                        <Share2 className="h-3.5 w-3.5" />
                        Share
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 border border-border/50 rounded-lg text-muted-foreground">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Scrollable area */}
            <div className="flex-1 overflow-y-auto">
                {/* Banner */}
                <div className="relative h-48 w-full bg-muted overflow-hidden">
                    <img
                        src={property.banner_image || property.images?.[0]?.image || "/placeholder.svg"}
                        alt={property.property_name}
                        className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                </div>

                <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 -mt-20 relative z-10">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Total Units", value: property.total_units || property.total_rooms || 0, icon: Bed, color: "text-primary", bg: "bg-primary/10" },
                            { label: "Guest Rating", value: property.average_rating || "New", icon: Star, color: "text-warning", bg: "bg-warning/10" },
                            { label: "Check-in", value: property.check_in_time || "12:00 PM", icon: Clock, color: "text-success", bg: "bg-success/10" },
                            { label: "Check-out", value: property.check_out_time || "10:00 AM", icon: Clock, color: "text-info", bg: "bg-info/10" },
                        ].map((stat, i) => (
                            <Card key={i} className="border border-border/50 shadow-sm bg-card/80 backdrop-blur-sm">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
                                        <p className="text-xl font-bold tracking-tight text-foreground">{stat.value}</p>
                                    </div>
                                    <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center border border-border/50", stat.bg)}>
                                        <stat.icon className={cn("h-4 w-4", stat.color)} />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Content Tabs */}
                    <Tabs defaultValue="inventory" className="w-full">
                        <TabsList className="bg-muted/50 p-1 border border-border/50 mb-6 h-11">
                            <TabsTrigger value="inventory" className="gap-2 px-6 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                <LayoutGrid className="h-3.5 w-3.5" />
                                Inventory
                            </TabsTrigger>
                            <TabsTrigger value="about" className="gap-2 px-6 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                <Building2 className="h-3.5 w-3.5" />
                                Property Info
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="inventory" className="space-y-6 focus-visible:outline-none">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold tracking-tight text-foreground">Unit Categories</h3>
                                    <p className="text-xs text-muted-foreground font-medium">Manage your room types and physical inventory</p>
                                </div>
                                <Button
                                    onClick={() => { setSelectedCategory(null); setCategoryDialogOpen(true); }}
                                    className="gap-2 font-bold text-[10px] uppercase tracking-widest px-4 h-9 shadow-lg bg-primary text-white"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Add Category
                                </Button>
                            </div>

                            <div className="grid gap-4">
                                {unitCategories?.map((cat) => (
                                    <Card key={cat.name} className="border border-border/50 group overflow-hidden">
                                        <div className="p-5 flex flex-col md:flex-row gap-6">
                                            <div className="h-24 w-32 rounded-lg bg-muted border border-border/50 flex-shrink-0 relative overflow-hidden">
                                                {cat.images?.[0]?.image ? (
                                                    <img src={cat.images[0].image} alt={cat.category_name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                        <ImageIcon className="h-6 w-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-semibold text-lg">{cat.category_name}</h4>
                                                        <Badge variant="secondary" className="text-[10px] font-bold bg-muted/50 border-none uppercase tracking-widest">
                                                            {cat.unit_type}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground"
                                                            onClick={() => { setSelectedCategory(cat); setCategoryDialogOpen(true); }}
                                                        >
                                                            <Edit2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            className="h-8 gap-2 font-bold text-[10px] uppercase tracking-widest text-primary border-primary/20 hover:bg-primary/5"
                                                            onClick={() => { setSelectedCategory(cat); setUnitDialogOpen(true); }}
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                            Add Unit
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                                    <span className="text-foreground">₹{cat.base_rate_per_night?.toLocaleString() || 0} / night</span>
                                                    <Separator orientation="vertical" className="h-3" />
                                                    <span className="flex items-center gap-1.5">
                                                        <LayoutGrid className="h-3 w-3" />
                                                        {units?.filter(u => u.unit_category === cat.name).length || 0} Total Units
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground font-medium line-clamp-2 uppercase tracking-tight opacity-70">
                                                    {cat.description || "No description provided."}
                                                </p>
                                            </div>
                                            <div className="hidden lg:block w-1/3 pl-6 border-l border-border/30">
                                                <UnitCategoryCalendar
                                                    categoryId={cat.name}
                                                    totalUnits={units?.filter(u => u.unit_category === cat.name).length || 0}
                                                    occupancyData={occupancy?.[cat.name] || {}}
                                                />
                                            </div>
                                        </div>
                                        <div className="bg-muted/20 p-4 border-t border-border/30">
                                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                                                {units?.filter(u => u.unit_category === cat.name).map(unit => (
                                                    <div
                                                        key={unit.name}
                                                        className={cn(
                                                            "group flex flex-col items-center justify-center p-2 rounded-md border cursor-pointer transition-all hover:scale-105 active:scale-95",
                                                            unit.status === "Available" ? "bg-card border-border hover:border-success/30" :
                                                                unit.status === "Dirty" ? "bg-warning/10 border-warning/20 hover:border-warning/40" :
                                                                    "bg-primary/10 border-primary/20"
                                                        )}
                                                        onClick={() => { setSelectedUnit(unit); setUnitDialogOpen(true); }}
                                                    >
                                                        <span className="text-[10px] font-bold text-foreground group-hover:text-primary transition-colors">{unit.unit_no}</span>
                                                        <div className={cn(
                                                            "mt-1.5 h-1.5 w-1.5 rounded-full ring-1 ring-offset-1 ring-offset-background",
                                                            unit.status === "Available" ? "bg-success ring-success/20" :
                                                                unit.status === "Occupied" ? "bg-primary ring-primary/20" :
                                                                    "bg-warning ring-warning/20"
                                                        )} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                                {(!isLoading && unitCategories?.length === 0) && (
                                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-xl space-y-4 bg-muted/10">
                                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                            <LayoutGrid className="h-6 w-6" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-semibold text-sm">No unit categories found</p>
                                            <p className="text-xs text-muted-foreground max-w-xs mx-auto">Start by adding your first unit category.</p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={() => { setSelectedCategory(null); setCategoryDialogOpen(true); }}
                                            className="h-9 px-6 font-bold text-[10px] uppercase tracking-widest border-border"
                                        >
                                            Create First Category
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="about" className="focus-visible:outline-none">
                            <div className="grid lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-6">
                                    <Card className="border border-border/50">
                                        <CardHeader className="bg-muted/20 border-b border-border/30 py-3 px-6">
                                            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Property Description</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6">
                                            <p className="text-sm leading-relaxed font-medium text-foreground whitespace-pre-wrap">
                                                {property.description || "No description provided for this property."}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                                <div className="space-y-6">
                                    <Card className="border border-border/50">
                                        <CardHeader className="bg-muted/20 border-b border-border/30 py-3 px-6">
                                            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Contact Details</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <div className="flex items-center gap-4 p-4 border-b border-border/30">
                                                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
                                                    <Mail className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email</p>
                                                    <p className="text-sm font-semibold truncate">{property.email || "N/A"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 p-4">
                                                <div className="h-9 w-9 rounded-lg bg-success/10 flex items-center justify-center text-success border border-success/10">
                                                    <Phone className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Phone</p>
                                                    <p className="text-sm font-semibold truncate">{property.phone || "N/A"}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card className="h-40 bg-muted/20 border border-border/50 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground gap-2">
                                        <MapPin className="h-6 w-6 opacity-30" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Maps Integration Pending</span>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Dialogs */}
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
    if (!property?.name) return null;
    return (
        <PropertyProvider propertyId={property.name}>
            <PropertyDetailsContent onClose={onClose} initialProperty={property} />
        </PropertyProvider>
    )
}
