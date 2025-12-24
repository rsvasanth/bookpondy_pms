"use client"

import { useState } from "react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Building2, MapPin, Bed, ImageIcon, Settings } from "lucide-react"

interface AddPropertyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const propertyTypes = ["Villa", "Resort", "Homestay", "Cottage", "Apartment", "Heritage Hotel", "Houseboat"]

const amenities = [
  "WiFi",
  "Air Conditioning",
  "Swimming Pool",
  "Parking",
  "Kitchen",
  "TV",
  "Hot Water",
  "Room Service",
  "Laundry",
  "Garden",
  "Balcony",
  "Sea View",
]

import { useFrappeCreateDoc } from "frappe-react-sdk"

export function AddPropertyDialog({ open, onOpenChange }: AddPropertyDialogProps) {
  const { createDoc, loading, error } = useFrappeCreateDoc()
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [propertyName, setPropertyName] = useState("")
  const [propertyType, setPropertyType] = useState("")
  const [location, setLocation] = useState("")
  const [address, setAddress] = useState("")
  const [rooms, setRooms] = useState("")
  const [description, setDescription] = useState("")
  const [basePrice, setBasePrice] = useState("")

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) => (prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]))
  }

  const handleSubmit = async () => {
    try {
      await createDoc("Property", {
        naming_series: "PROP-.YYYY.-.#####", // Assuming default series
        property_name: propertyName,
        property_type: propertyType.charAt(0).toUpperCase() + propertyType.slice(1), // Map to Title Case if needed
        location_description: `${location}\n${address}`,
        description: description,
        total_units: parseInt(rooms) || 0,
        status: "Active",
        amenities: selectedAmenities.map(a => ({
          doctype: "Property Amenity",
          amenity: a
        }))
      })
      onOpenChange(false)
      // Reset fields
      setPropertyName("")
      setPropertyType("")
      setLocation("")
      setAddress("")
      setRooms("")
      setDescription("")
      setSelectedAmenities([])
    } catch (e) {
      console.error("Failed to create property:", e)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Property</DialogTitle>
          <DialogDescription>Add a new property to your portfolio</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" className="gap-1.5 text-xs sm:text-sm">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Basic</span>
            </TabsTrigger>
            <TabsTrigger value="location" className="gap-1.5 text-xs sm:text-sm">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Location</span>
            </TabsTrigger>
            <TabsTrigger value="rooms" className="gap-1.5 text-xs sm:text-sm">
              <Bed className="h-4 w-4" />
              <span className="hidden sm:inline">Rooms</span>
            </TabsTrigger>
            <TabsTrigger value="amenities" className="gap-1.5 text-xs sm:text-sm">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Amenities</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="propertyName">Property Name</Label>
              <Input
                id="propertyName"
                placeholder="e.g., Ocean View Villa"
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="propertyType">Property Type</Label>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type} value={type.toLowerCase()}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your property..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Property Images</Label>
              <div className="flex h-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-colors hover:border-primary hover:bg-muted/50">
                <div className="text-center">
                  <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Click to upload images</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="location" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">City</Label>
              <Input
                id="location"
                placeholder="e.g., Pondicherry"
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
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude (Optional)</Label>
                <Input id="latitude" placeholder="e.g., 11.9416" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude (Optional)</Label>
                <Input id="longitude" placeholder="e.g., 79.8083" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rooms" className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="rooms">Total Rooms</Label>
                <Input
                  id="rooms"
                  type="number"
                  placeholder="e.g., 5"
                  value={rooms}
                  onChange={(e) => setRooms(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price per Night (INR)</Label>
                <Input
                  id="basePrice"
                  type="number"
                  placeholder="e.g., 5000"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h4 className="mb-3 font-medium">Room Types</h4>
              <p className="text-sm text-muted-foreground">
                You can add room types and their rates after creating the property.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="amenities" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label>Select Amenities</Label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity}
                      checked={selectedAmenities.includes(amenity)}
                      onCheckedChange={() => toggleAmenity(amenity)}
                    />
                    <label htmlFor={amenity} className="text-sm font-medium leading-none cursor-pointer">
                      {amenity}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border bg-muted/50 p-4">
              <h4 className="font-medium">Selected Amenities</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedAmenities.length > 0 ? selectedAmenities.join(", ") : "No amenities selected"}
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="bg-[#E68B47] hover:bg-[#c97339]" onClick={handleSubmit} disabled={!propertyName || loading}>
            {loading ? "Creating..." : "Create Property"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
