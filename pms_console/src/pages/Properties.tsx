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
import { AddPropertyDialog } from "@/components/properties/add-property-dialog"
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Filter,
  MoreHorizontal,
  Eye,
  Pencil,
  Wrench,
  BarChart2,
  Trash2,
  Star,
  MapPin,
} from "lucide-react"
import { cn } from "@/lib/utils"
// import { Image } from "react" // Not used often, maybe redundant

import { useFrappeGetDocList } from "frappe-react-sdk"

interface Property {
  id: string
  name: string
  location: string
  type: string
  rooms: number
  monthlyRevenue: number
  occupancy: number
  rating: number
  reviews: number
  status: "active" | "inactive" | "maintenance"
  image: string
}

// const properties = [] // Removed placeholder



// Status config (unchanged)
const statusConfig = {
  active: { label: "Active", className: "bg-green-500/10 text-green-600" },
  inactive: { label: "Inactive", className: "bg-gray-500/10 text-gray-600" },
  maintenance: { label: "Maintenance", className: "bg-yellow-500/10 text-yellow-600" },
}

export default function PropertiesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [selectedProperties, setSelectedProperties] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [addPropertyOpen, setAddPropertyOpen] = useState(false)

  // Fetch Properties
  const { data: propertiesList, isLoading } = useFrappeGetDocList("Property", {
    fields: ["name", "property_name", "location_description", "property_type", "total_rooms", "status", "banner_image", "average_rating"],
    limit: 100
  })

  // Map to interface
  const properties: Property[] = propertiesList?.map(p => ({
    id: p.name,
    name: p.property_name,
    location: p.location_description || "Not specified",
    type: p.property_type,
    rooms: p.total_rooms || 0,
    monthlyRevenue: 0, // Placeholder
    occupancy: 0, // Placeholder
    rating: p.average_rating || 0,
    reviews: 0, // Placeholder
    status: p.status.toLowerCase() as any, // Cast to match literla type if needed
    image: p.banner_image || "/placeholder.svg"
  })) || []

  // Ensure status is valid for config lookup
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

  const filteredProperties = properties.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()),
  )


  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Properties</h1>
          <p className="text-muted-foreground">Manage your {properties.length} properties across all locations</p>
        </div>
        <Button className="bg-[#E68B47] hover:bg-[#c97339]" onClick={() => setAddPropertyOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Property
        </Button>
      </div>

      {/* Filters and Actions Bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search and Filters */}
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search properties..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="pondicherry">Pondicherry</SelectItem>
                  <SelectItem value="chennai">Chennai</SelectItem>
                  <SelectItem value="ooty">Ooty</SelectItem>
                  <SelectItem value="mysore">Mysore</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="resort">Resort</SelectItem>
                  <SelectItem value="homestay">Homestay</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2">
              {selectedProperties.length > 0 && (
                <span className="text-sm text-muted-foreground mr-2">{selectedProperties.length} selected</span>
              )}
              <div className="flex rounded-lg border p-1">
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 px-3"
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
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedProperties.length === properties.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-center">Rooms</TableHead>
                <TableHead className="text-right">Monthly Revenue</TableHead>
                <TableHead className="text-center">Occupancy</TableHead>
                <TableHead className="text-center">Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProperties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedProperties.includes(property.id)}
                      onCheckedChange={() => toggleSelectProperty(property.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-16 overflow-hidden rounded-md">
                        <img
                          src={property.image || "/placeholder.svg"}
                          alt={property.name}

                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{property.name}</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {property.location}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{property.type}</TableCell>
                  <TableCell className="text-center">{property.rooms}</TableCell>
                  <TableCell className="text-right font-medium">
                    ₹{property.monthlyRevenue.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-2 w-16 rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            property.occupancy >= 80
                              ? "bg-green-500"
                              : property.occupancy >= 50
                                ? "bg-yellow-500"
                                : "bg-red-500",
                          )}
                          style={{ width: `${property.occupancy}%` }}
                        />
                      </div>
                      <span className="text-sm">{property.occupancy}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-4 w-4  -yellow-400 text-yellow-400" />
                      <span className="font-medium">{property.rating}</span>
                      <span className="text-muted-foreground">({property.reviews})</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusConfig(property.status).className}>
                      {getStatusConfig(property.status).label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Property
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Wrench className="mr-2 h-4 w-4" />
                          Schedule Maintenance
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <BarChart2 className="mr-2 h-4 w-4" />
                          View Analytics
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Property
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Properties Grid View */}
      {viewMode === "grid" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden">
              <div className="relative h-40">
                <img src={property.image || "/placeholder.svg"} alt={property.name} className="object-cover" />
                <Badge className={cn("absolute right-2 top-2", getStatusConfig(property.status).className)}>
                  {getStatusConfig(property.status).label}
                </Badge>
                <Checkbox
                  className="absolute left-2 top-2 bg-white"
                  checked={selectedProperties.includes(property.id)}
                  onCheckedChange={() => toggleSelectProperty(property.id)}
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold">{property.name}</h3>
                <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {property.location}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {property.type} • {property.rooms} rooms
                </p>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <p className="font-semibold text-primary">₹{(property.monthlyRevenue / 1000).toFixed(0)}k</p>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                  </div>
                  <div>
                    <p className="font-semibold">{property.occupancy}%</p>
                    <p className="text-xs text-muted-foreground">Occupancy</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-3.5 w-3.5  -yellow-400 text-yellow-400" />
                      <span className="font-semibold">{property.rating}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Eye className="mr-1.5 h-4 w-4" />
                    View
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="bg-transparent">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Wrench className="mr-2 h-4 w-4" />
                        Maintenance
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <BarChart2 className="mr-2 h-4 w-4" />
                        Analytics
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddPropertyDialog open={addPropertyOpen} onOpenChange={setAddPropertyOpen} />
    </DashboardLayout>
  )
}
