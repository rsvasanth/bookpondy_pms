"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PropertyDialog } from "@/components/properties/property-dialog"
import { PropertyDetailsView } from "@/components/properties/property-details-view"
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  MoreHorizontal,
  MapPin,
  Loader2,
  Building2,
  Home,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLocalDocList } from "@/hooks/use-local-data"
import { useFrappeDeleteDoc } from "frappe-react-sdk"
import { useFiltersStore } from "@/stores/filtersStore"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Property {
  id: string
  name: string
  location: string
  type: string
  units: number
  monthlyRevenue: number
  occupancy: number
  rating: number
  reviews: number
  status: "active" | "inactive" | "maintenance"
  image: string
  raw?: any
}

export default function PropertiesPage() {
  const [selectedProperties, setSelectedProperties] = useState<string[]>([])
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState<any>(null)
  const [deletingProperty, setDeletingProperty] = useState<string | null>(null)
  const [viewingProperty, setViewingProperty] = useState<any>(null)
  const [propertyDetailsOpen, setPropertyDetailsOpen] = useState(false)

  const {
    propertySearch, setPropertySearch,
    propertyType, setPropertyType
  } = useFiltersStore()

  const { data: propertiesList, isLoading } = useLocalDocList("Property", {
    sort: [{ property_name: 'asc' }]
  })

  const { deleteDoc, loading: isDeleting } = useFrappeDeleteDoc()

  const properties: Property[] = propertiesList?.map(p => ({
    id: p.name,
    name: p.property_name,
    location: p.location_description?.split('\n')[0] || "Not specified",
    type: p.property_type,
    units: p.total_units || p.total_rooms || 0,
    monthlyRevenue: 0,
    occupancy: 0,
    rating: p.average_rating || 0,
    reviews: 0,
    status: (p.status?.toLowerCase() || "inactive") as any,
    image: p.banner_image || p.images?.[0]?.image || "/placeholder.svg",
    raw: p
  })) || []

  const toggleSelectAll = () => {
    if (selectedProperties.length === properties.length) {
      setSelectedProperties([])
    } else {
      setSelectedProperties(properties.map((p) => p.id))
    }
  }

  const toggleSelectProperty = (id: string) => {
    setSelectedProperties((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  const handleDelete = async () => {
    if (!deletingProperty) return
    try {
      await deleteDoc("Property", deletingProperty)
      toast.success("Property deleted successfully")
      setDeletingProperty(null)
    } catch (e: any) {
      toast.error(e.message || "Failed to delete property")
    }
  }

  const handleEdit = (property: any) => {
    setEditingProperty(property.raw)
    setPropertyDialogOpen(true)
  }

  const handleAddNew = () => {
    setEditingProperty(null)
    setPropertyDialogOpen(true)
  }

  const handleViewDetails = (property: any) => {
    setViewingProperty(property.raw)
    setPropertyDetailsOpen(true)
  }

  const filteredProperties = properties.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(propertySearch.toLowerCase()) ||
      p.location.toLowerCase().includes(propertySearch.toLowerCase())
    const matchesType = propertyType === "all" || p.type.toLowerCase() === propertyType.toLowerCase()
    return matchesSearch && matchesType
  })

  const stats = [
    { label: "Total Properties", value: properties.length || 0, icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active", value: properties.filter(p => p.status === "active").length || 0, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Total Units", value: properties.reduce((acc, curr) => acc + curr.units, 0), icon: Home, color: "text-primary", bg: "bg-primary/10" },
    { label: "Maintenance", value: properties.filter(p => p.status === "maintenance").length || 0, icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
  ]

  return (
    <DashboardLayout>
      {propertyDetailsOpen && viewingProperty ? (
        <div className="flex-1 min-h-[calc(100vh-180px)]">
          <PropertyDetailsView
            property={viewingProperty}
            onClose={() => setPropertyDetailsOpen(false)}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800">Properties</h1>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                Manage your real estate assets
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-56">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search properties..."
                  className="pl-8 h-9 rounded-lg border-slate-200 bg-white text-xs font-medium"
                  value={propertySearch}
                  onChange={(e) => setPropertySearch(e.target.value)}
                />
              </div>
              <Button
                onClick={handleAddNew}
                className="bg-primary hover:bg-primary/90 text-white rounded-lg h-9 px-3 text-xs font-bold gap-1.5 shadow-sm transition-all hover:scale-105"
              >
                <Plus className="h-3.5 w-3.5" /> Add Property
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.map((stat) => (
              <Card key={stat.label} className="border border-slate-100 shadow-sm rounded-xl bg-white transition-all hover:shadow-md">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{stat.label}</span>
                    <div className={cn("p-1.5 rounded-lg", stat.bg)}>
                      <stat.icon className={cn("h-3.5 w-3.5", stat.color)} />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="grid" className="w-full space-y-4">
            <div className="flex items-center justify-between">
              <TabsList className="bg-slate-100/50 p-1 rounded-lg h-9">
                <TabsTrigger value="grid" className="rounded-md h-7 px-3 text-[10px] font-bold uppercase tracking-wider gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-800">
                  <LayoutGrid className="h-3 w-3" /> Grid
                </TabsTrigger>
                <TabsTrigger value="list" className="rounded-md h-7 px-3 text-[10px] font-bold uppercase tracking-wider gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-800">
                  <List className="h-3 w-3" /> List
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="list" className="mt-0">
              <Card className="border border-slate-100 shadow-sm rounded-xl overflow-hidden bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-50 bg-slate-50/50">
                        <th className="text-left py-3 px-4 w-10">
                          <Checkbox
                            checked={selectedProperties.length === properties.length && properties.length > 0}
                            onCheckedChange={toggleSelectAll}
                            className="border-slate-300 h-4 w-4 rounded-[4px]"
                          />
                        </th>
                        <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Property</th>
                        <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Type</th>
                        <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Inventory</th>
                        <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                        <th className="text-right py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {isLoading ? (
                        <tr>
                          <td colSpan={6} className="h-32 text-center">
                            <Loader2 className="h-5 w-5 animate-spin mx-auto text-slate-300" />
                          </td>
                        </tr>
                      ) : filteredProperties.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="h-32 text-center text-slate-400 text-xs font-medium uppercase tracking-wide">
                            No properties found
                          </td>
                        </tr>
                      ) : (
                        filteredProperties.map((property) => (
                          <tr key={property.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="py-2.5 px-4">
                              <Checkbox
                                checked={selectedProperties.includes(property.id)}
                                onCheckedChange={() => toggleSelectProperty(property.id)}
                                className="border-slate-300 h-4 w-4 rounded-[4px]"
                              />
                            </td>
                            <td className="py-2.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-14 rounded-md bg-slate-100 overflow-hidden relative border border-slate-100">
                                  <img
                                    src={property.image}
                                    alt={property.name}
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-slate-800">{property.name}</span>
                                  <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                                    <MapPin className="h-2.5 w-2.5" />
                                    {property.location}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-4">
                              <Badge variant="outline" className="text-[9px] font-bold uppercase bg-slate-50 border-slate-200 text-slate-500 rounded-md px-1.5 py-0.5">
                                {property.type}
                              </Badge>
                            </td>
                            <td className="py-2.5 px-4">
                              <span className="text-xs font-bold text-slate-700">{property.units} Units</span>
                            </td>
                            <td className="py-2.5 px-4">
                              <Badge className={cn(
                                "text-[9px] font-bold uppercase px-1.5 py-0 border-none shadow-none rounded-[4px]",
                                property.status === "active" ? "bg-emerald-50 text-emerald-600" :
                                  property.status === "maintenance" ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-500"
                              )}>
                                {property.status}
                              </Badge>
                            </td>
                            <td className="py-2.5 px-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-slate-100 text-slate-400">
                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40 rounded-xl p-1 shadow-lg border-slate-100">
                                  <DropdownMenuItem className="rounded-lg text-xs font-bold cursor-pointer focus:bg-slate-50" onClick={() => handleViewDetails(property)}>
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="rounded-lg text-xs font-bold cursor-pointer focus:bg-slate-50" onClick={() => handleEdit(property)}>
                                    Edit Property
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="rounded-lg text-xs font-bold text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer" onClick={() => setDeletingProperty(property.id)}>
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="grid" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {isLoading ? (
                  Array(4).fill(0).map((_, i) => (
                    <Card key={i} className="h-64 animate-pulse bg-slate-50 rounded-xl border border-slate-100 shadow-none" />
                  ))
                ) : filteredProperties.length === 0 ? (
                  <div className="col-span-full h-32 flex items-center justify-center text-slate-400 text-xs font-medium uppercase tracking-wide">
                    No properties found
                  </div>
                ) : (
                  filteredProperties.map((property) => (
                    <Card key={property.id} className="overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all rounded-xl group bg-white cursor-pointer hover:border-[#ff3924]/20" onClick={() => handleViewDetails(property)}>
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={property.image}
                          alt={property.name}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                        <div className="absolute top-2 right-2">
                          <Badge className={cn(
                            "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-[4px] border-none shadow-sm backdrop-blur-md",
                            property.status === "active" ? "bg-emerald-500/90 text-white" :
                              property.status === "maintenance" ? "bg-amber-500/90 text-white" : "bg-slate-800/80 text-white"
                          )}>
                            {property.status}
                          </Badge>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <h3 className="font-bold text-base leading-tight mb-0.5 text-white/95">{property.name}</h3>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-white/70 flex items-center gap-1">
                            <MapPin className="h-2.5 w-2.5" />
                            {property.location}
                          </p>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block">Type</span>
                            <span className="text-xs font-bold text-slate-700">{property.type}</span>
                          </div>
                          <div className="space-y-0.5 text-right">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block">Inventory</span>
                            <span className="text-xs font-bold text-slate-700">{property.units} Units</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>

          <AlertDialog open={!!deletingProperty} onOpenChange={() => setDeletingProperty(null)}>
            <AlertDialogContent className="rounded-2xl border-none shadow-lg bg-white p-6 max-w-sm">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-lg font-bold text-slate-800">Delete Property?</AlertDialogTitle>
                <AlertDialogDescription className="text-xs text-slate-500 font-medium">
                  This action cannot be undone. This will permanently delete the property.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl border-slate-200 h-9 font-bold text-xs">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl h-9 text-xs"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <PropertyDialog
            open={propertyDialogOpen}
            onOpenChange={setPropertyDialogOpen}
            initialData={editingProperty}
            onSuccess={() => { }}
          />
        </div>
      )}
    </DashboardLayout>
  )
}
