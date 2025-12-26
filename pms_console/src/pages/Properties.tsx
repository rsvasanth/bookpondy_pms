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
import { useFrappeGetDocList, useFrappeDeleteDoc } from "frappe-react-sdk"
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

  const { data: propertiesList, isLoading, mutate } = useFrappeGetDocList("Property", {
    fields: ["*"],
    limit: 100,
    orderBy: { field: "creation", order: "desc" }
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
      mutate()
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
    { label: "Total Properties", value: properties.length || 0, icon: Building2, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Active", value: properties.filter(p => p.status === "active").length || 0, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Total Units", value: properties.reduce((acc, curr) => acc + curr.units, 0), icon: Home, color: "text-primary", bg: "bg-primary/5" },
    { label: "Maintenance", value: properties.filter(p => p.status === "maintenance").length || 0, icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-50" },
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
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800">Properties</h1>
              <p className="text-sm text-slate-500 font-medium tracking-tight">
                Manage your real estate assets and inventory
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search properties..."
                  className="pl-9 h-10 rounded-xl border-slate-200 bg-white shadow-sm text-sm"
                  value={propertySearch}
                  onChange={(e) => setPropertySearch(e.target.value)}
                />
              </div>
              <Button
                onClick={handleAddNew}
                className="bg-primary hover:bg-primary/90 text-white rounded-xl h-10 px-4 font-bold text-sm gap-2 shadow-sm"
              >
                <Plus className="h-4 w-4" /> Add Property
              </Button>
            </div>
          </div>

          <Tabs defaultValue="list" className="w-full space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="bg-slate-100/50 p-1 rounded-xl h-11">
                <TabsTrigger value="list" className="rounded-lg h-9 px-4 font-bold text-xs gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-slate-500 data-[state=active]:text-slate-900">
                  <List className="h-4 w-4" /> List View
                </TabsTrigger>
                <TabsTrigger value="grid" className="rounded-lg h-9 px-4 font-bold text-xs gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-slate-500 data-[state=active]:text-slate-900">
                  <LayoutGrid className="h-4 w-4" /> Grid View
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <Card key={stat.label} className="border-none shadow-sm rounded-2xl bg-white transition-all hover:translate-y-[-2px]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                      <stat.icon className={cn("h-4 w-4", stat.color)} />
                    </div>
                    <p className="text-3xl font-black text-slate-800 tracking-tight">{stat.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <TabsContent value="list" className="mt-0">
              <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-50">
                        <th className="text-left py-4 px-6">
                          <Checkbox
                            checked={selectedProperties.length === properties.length && properties.length > 0}
                            onCheckedChange={toggleSelectAll}
                            className="border-slate-300"
                          />
                        </th>
                        <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Property</th>
                        <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Type</th>
                        <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Units</th>
                        <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                        <th className="text-right py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {isLoading ? (
                        <tr>
                          <td colSpan={6} className="h-32 text-center">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400" />
                          </td>
                        </tr>
                      ) : filteredProperties.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="h-32 text-center text-slate-400 font-medium text-sm">
                            No properties found.
                          </td>
                        </tr>
                      ) : (
                        filteredProperties.map((property) => (
                          <tr key={property.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="py-4 px-6">
                              <Checkbox
                                checked={selectedProperties.includes(property.id)}
                                onCheckedChange={() => toggleSelectProperty(property.id)}
                                className="border-slate-300"
                              />
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-4">
                                <div className="h-12 w-16 rounded-lg bg-slate-100 overflow-hidden border border-slate-100 flex-shrink-0">
                                  <img
                                    src={property.image}
                                    alt={property.name}
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                                <div>
                                  <p className="font-bold text-slate-800 text-sm mb-0.5">{property.name}</p>
                                  <p className="text-[10px] font-medium text-slate-400 tracking-tight flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {property.location}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <Badge variant="outline" className="text-[9px] font-bold text-slate-500 uppercase border-slate-200 bg-slate-50">
                                {property.type}
                              </Badge>
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-xs font-bold text-slate-700">{property.units} Units</span>
                            </td>
                            <td className="py-4 px-6">
                              <Badge className={cn(
                                "text-[10px] font-black uppercase px-2 py-0.5 rounded-md border-none shadow-none",
                                property.status === "active" ? "bg-emerald-500 text-white" :
                                  property.status === "maintenance" ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-500"
                              )}>
                                {property.status}
                              </Badge>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-400">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 rounded-xl p-1">
                                  <DropdownMenuItem className="rounded-lg text-xs font-bold cursor-pointer" onClick={() => handleViewDetails(property)}>
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="rounded-lg text-xs font-bold cursor-pointer" onClick={() => handleEdit(property)}>
                                    Edit Property
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="rounded-lg text-xs font-bold text-red-600 focus:text-red-600 cursor-pointer" onClick={() => setDeletingProperty(property.id)}>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {isLoading ? (
                  Array(4).fill(0).map((_, i) => (
                    <Card key={i} className="h-72 animate-pulse bg-slate-50 rounded-2xl border-none shadow-sm" />
                  ))
                ) : filteredProperties.length === 0 ? (
                  <div className="col-span-full h-32 flex items-center justify-center text-slate-400 font-medium text-sm">
                    No properties found.
                  </div>
                ) : (
                  filteredProperties.map((property) => (
                    <Card key={property.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all rounded-2xl group bg-white cursor-pointer" onClick={() => handleViewDetails(property)}>
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={property.image}
                          alt={property.name}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                        <div className="absolute top-3 right-3">
                          <Badge className={cn(
                            "text-[9px] font-black uppercase px-2 py-0.5 rounded-md border-none shadow-none",
                            property.status === "active" ? "bg-emerald-500 text-white" : "bg-slate-800 text-white"
                          )}>
                            {property.status}
                          </Badge>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <h3 className="font-bold text-lg leading-tight mb-0.5">{property.name}</h3>
                          <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {property.location}
                          </p>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Type</span>
                            <span className="text-xs font-bold text-slate-700">{property.type}</span>
                          </div>
                          <div className="space-y-0.5 text-right">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Inventory</span>
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
                <AlertDialogDescription className="text-sm text-slate-500 font-medium">
                  This action cannot be undone. This will permanently delete the property and remove data from the servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl border-slate-200 h-10 font-bold text-xs">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl h-10 text-xs"
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
            onSuccess={() => mutate()}
          />
        </div>
      )}
    </DashboardLayout>
  )
}
