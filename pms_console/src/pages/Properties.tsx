"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PropertyDialog } from "@/components/properties/property-dialog"
import { PropertyDetailsView } from "@/components/properties/property-details-view"
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Filter,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Star,
  MapPin,
  Loader2,
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

const statusConfig = {
  active: { label: "Active", className: "bg-green-500/10 text-green-600 border-green-200" },
  inactive: { label: "Inactive", className: "bg-gray-500/10 text-gray-600 border-gray-200" },
  maintenance: { label: "Maintenance", className: "bg-yellow-500/10 text-yellow-600 border-yellow-200" },
}

export default function PropertiesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [selectedProperties, setSelectedProperties] = useState<string[]>([])
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState<any>(null)
  const [deletingProperty, setDeletingProperty] = useState<string | null>(null)
  const [viewingProperty, setViewingProperty] = useState<any>(null)
  const [propertyDetailsOpen, setPropertyDetailsOpen] = useState(false)

  const {
    propertySearch, setPropertySearch,
    propertyStatus, setPropertyStatus,
    propertyType, setPropertyType
  } = useFiltersStore()

  // Fetch Properties
  const { data: propertiesList, isLoading, mutate } = useFrappeGetDocList("Property", {
    fields: ["*"], // Fetch all fields for editing
    limit: 100,
    orderBy: { field: "creation", order: "desc" }
  })

  const { deleteDoc, loading: isDeleting } = useFrappeDeleteDoc()

  // Map to interface
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

  const getStatusConfig = (status: string) => {
    const s = status.toLowerCase()
    return statusConfig[s as keyof typeof statusConfig] || statusConfig.inactive
  }

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
    const matchesStatus = propertyStatus === "all" || p.status === propertyStatus.toLowerCase()
    const matchesType = propertyType === "all" || p.type.toLowerCase() === propertyType.toLowerCase()
    return matchesSearch && matchesStatus && matchesType
  })

  return (
    <DashboardLayout>
      {/* Page Header - Only show if not viewing details */}
      {!propertyDetailsOpen && (
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Properties</h1>
            <p className="text-xs text-muted-foreground font-medium">Manage your {filteredProperties.length} properties across all locations</p>
          </div>
          <Button className="bg-[#FF3D2E] hover:bg-[#e63225] text-white font-bold rounded-xl h-9 px-5 shadow-lg shadow-red-500/10" onClick={handleAddNew}>
            <Plus className="mr-2 h-3.5 w-3.5" />
            Add New Property
          </Button>
        </div>
      )}

      {propertyDetailsOpen && viewingProperty ? (
        <div className="flex-1 min-h-[calc(100vh-180px)]">
          <PropertyDetailsView
            property={viewingProperty}
            onClose={() => setPropertyDetailsOpen(false)}
          />
        </div>
      ) : (
        <>
          {/* Filters and Actions Bar */}
          <Card className="mb-4 border-none shadow-sm bg-white/50 backdrop-blur-sm rounded-2xl overflow-hidden">
            <CardContent className="p-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search properties..."
                      className="pl-9 bg-white border-gray-100 rounded-xl h-10 text-sm focus-visible:ring-[#FF3D2E]/20"
                      value={propertySearch}
                      onChange={(e) => setPropertySearch(e.target.value)}
                    />
                  </div>

                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger className="w-[130px] bg-white border-gray-100 rounded-xl h-10 text-xs font-bold uppercase tracking-wider">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Homestay">Homestay</SelectItem>
                      <SelectItem value="Villa">Villa</SelectItem>
                      <SelectItem value="Hotel">Hotel</SelectItem>
                      <SelectItem value="Hostel">Hostel</SelectItem>
                      <SelectItem value="Resort">Resort</SelectItem>
                      <SelectItem value="Guesthouse">Guesthouse</SelectItem>
                      <SelectItem value="Apartment">Apartment</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={propertyStatus} onValueChange={setPropertyStatus}>
                    <SelectTrigger className="w-[130px] bg-white border-gray-100 rounded-xl h-10 text-xs font-bold uppercase tracking-wider">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-gray-100 bg-white shadow-sm">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex rounded-xl border border-gray-100 p-1 bg-white">
                    <Button
                      variant={viewMode === "list" ? "secondary" : "ghost"}
                      size="sm"
                      className={cn("h-9 rounded-lg px-4", viewMode === "list" && "bg-gray-100 shadow-none")}
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "grid" ? "secondary" : "ghost"}
                      size="sm"
                      className={cn("h-9 rounded-lg px-4", viewMode === "grid" && "bg-gray-100 shadow-none")}
                      onClick={() => setViewMode("grid")}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Properties Table View */}
          {viewMode === "list" && (
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50/50">
                    <TableRow className="border-gray-100 hover:bg-transparent">
                      <TableHead className="w-12 pl-6">
                        <Checkbox
                          checked={selectedProperties.length === properties.length && properties.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-wider">Property</TableHead>
                      <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-wider">Type</TableHead>
                      <TableHead className="text-center font-bold text-gray-400 uppercase text-[10px] tracking-wider">Units</TableHead>
                      <TableHead className="text-center font-bold text-gray-400 uppercase text-[10px] tracking-wider">Rating</TableHead>
                      <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-wider">Status</TableHead>
                      <TableHead className="text-right pr-6 font-bold text-gray-400 uppercase text-[10px] tracking-wider">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-32 text-center">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ) : filteredProperties.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                          No properties found matching your filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProperties.map((property) => (
                        <TableRow key={property.id} className="border-gray-50 hover:bg-gray-50/30 transition-colors group">
                          <TableCell className="pl-6">
                            <Checkbox
                              checked={selectedProperties.includes(property.id)}
                              onCheckedChange={() => toggleSelectProperty(property.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3 py-0.5">
                              <div className="relative h-11 w-16 overflow-hidden rounded-lg border border-gray-100 bg-gray-50 flex-shrink-0">
                                <img
                                  src={property.image}
                                  alt={property.name}
                                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              <div>
                                <p className="font-bold text-sm text-[#0A0A0A] leading-tight">{property.name}</p>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground mt-0.5 uppercase tracking-wide">
                                  <MapPin className="h-2.5 w-2.5" />
                                  {property.location}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{property.type}</span>
                          </TableCell>
                          <TableCell className="text-center font-bold text-sm">{property.units}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                              <span className="font-bold text-xs">{property.rating}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border", getStatusConfig(property.status).className)}>
                              {getStatusConfig(property.status).label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 hover:bg-gray-100">
                                  <MoreHorizontal className="h-5 w-5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 border-gray-100 shadow-xl overflow-hidden">
                                <DropdownMenuItem className="rounded-xl py-2.5 cursor-pointer" onClick={() => handleViewDetails(property)}>
                                  <Eye className="mr-3 h-4 w-4 text-muted-foreground" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-xl py-2.5 cursor-pointer" onClick={() => handleEdit(property)}>
                                  <Pencil className="mr-3 h-4 w-4 text-muted-foreground" />
                                  Edit Property
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-xl py-2.5 cursor-pointer text-destructive focus:text-destructive focus:bg-red-50" onClick={() => setDeletingProperty(property.id)}>
                                  <Trash2 className="mr-3 h-4 w-4" />
                                  Delete Property
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}

          {/* Properties Grid View */}
          {viewMode === "grid" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {isLoading ? (
                Array(8).fill(0).map((_, i) => (
                  <Card key={i} className="h-72 animate-pulse bg-gray-50 rounded-2xl border-none shadow-sm" />
                ))
              ) : filteredProperties.length === 0 ? (
                <div className="col-span-full text-center text-muted-foreground py-12">
                  No properties found matching your filters.
                </div>
              ) : (
                filteredProperties.map((property) => (
                  <Card key={property.id} className="overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl group flex flex-col bg-white">
                    <div className="relative h-40 overflow-hidden">
                      <img src={property.image} alt={property.name} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
                      <Badge className={cn("absolute right-3 top-3 rounded-xl border backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold", getStatusConfig(property.status).className)}>
                        {getStatusConfig(property.status).label}
                      </Badge>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                        <div className="flex gap-1.5 w-full">
                          <Button variant="secondary" size="sm" className="h-8 px-2 rounded-xl font-bold bg-white/95 border-none" onClick={() => handleViewDetails(property)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="secondary" size="sm" className="flex-1 h-8 rounded-xl font-bold bg-white/95 border-none text-xs" onClick={() => handleEdit(property)}>
                            <Pencil className="mr-1 h-3 w-3" />
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm" className="h-8 px-2 rounded-xl shadow-lg shadow-red-500/20" onClick={() => setDeletingProperty(property.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4 flex-1 flex flex-col">
                      <div className="flex-1">
                        <h3 className="font-bold text-base text-[#0A0A0A] leading-tight mb-1">{property.name}</h3>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                          <MapPin className="h-3 w-3 text-[#FF3D2E]" />
                          {property.location}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block mb-0.5">Type</span>
                          <span className="text-xs font-bold">{property.type}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block mb-0.5">Units</span>
                          <span className="text-xs font-bold">{property.units}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Confirmation Dialog for Deletion */}
          <AlertDialog open={!!deletingProperty} onOpenChange={() => setDeletingProperty(null)}>
            <AlertDialogContent className="rounded-3xl bg-white border-none shadow-2xl p-8 max-w-sm mx-auto">
              <AlertDialogHeader className="space-y-4">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto">
                  <Trash2 className="h-8 w-8" />
                </div>
                <AlertDialogTitle className="text-xl font-bold text-center">Delete Property?</AlertDialogTitle>
                <AlertDialogDescription className="text-center text-muted-foreground leading-relaxed">
                  Are you sure you want to delete this property? This action cannot be undone and all data will be lost.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-8 flex gap-3 flex-col sm:flex-row">
                <AlertDialogCancel className="rounded-xl border-gray-100 h-12 sm:flex-1 mt-0">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl h-12 sm:flex-1"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Now"}
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
        </>
      )}
    </DashboardLayout>
  )
}
