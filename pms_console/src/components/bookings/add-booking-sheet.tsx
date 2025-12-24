"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon, User, Phone, Mail, Building2, Users, IndianRupee } from "lucide-react"
import { format, differenceInDays } from "date-fns"
import { cn } from "@/lib/utils"
import type { DateRange } from "react-day-picker"

interface AddBookingSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const properties = [
  { id: "1", name: "Ocean View Villa", roomTypes: ["Deluxe Suite", "Presidential Suite", "Standard Room"] },
  { id: "2", name: "Beach House Resort", roomTypes: ["Ocean View Room", "Garden Room", "Pool Access Room"] },
  { id: "3", name: "Heritage Homestay", roomTypes: ["Heritage Room", "Colonial Suite"] },
  { id: "4", name: "Hill View Retreat", roomTypes: ["Mountain Suite", "Valley View Room", "Cottage"] },
  { id: "5", name: "Royal Heritage Palace", roomTypes: ["Royal Chamber", "Maharaja Suite", "Standard Room"] },
]

import { useFrappeCreateDoc, useFrappeGetDocList } from "frappe-react-sdk"

export function AddBookingSheet({ open, onOpenChange }: AddBookingSheetProps) {
  const { createDoc, loading: creating } = useFrappeCreateDoc()

  // Fetch real properties
  const { data: propertiesList } = useFrappeGetDocList("Property", {
    fields: ["name", "property_name"],
    limit: 100
  })

  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [selectedProperty, setSelectedProperty] = useState<string>("")
  const [selectedRoom, setSelectedRoom] = useState<string>("")

  // Fetch room types for selected property
  const { data: roomTypesList } = useFrappeGetDocList("Room Type", {
    fields: ["name", "room_type_name", "base_rate_per_night"],
    filters: [["property", "=", selectedProperty]],
    limit: 100
  }, selectedProperty ? undefined : null)

  const [guests, setGuests] = useState("2")
  const [guestName, setGuestName] = useState("")
  const [guestEmail, setGuestEmail] = useState("")
  const [guestPhone, setGuestPhone] = useState("")
  const [specialRequests, setSpecialRequests] = useState("")

  const nights = dateRange?.from && dateRange?.to ? differenceInDays(dateRange.to, dateRange.from) : 0

  // Find selected room type details
  const selectedRoomType = roomTypesList?.find(rt => rt.name === selectedRoom)
  const baseRate = selectedRoomType?.base_rate_per_night || 0
  const totalAmount = nights * baseRate

  const handleSubmit = async () => {
    try {
      // 1. Create/Find Guest (Simplified: always create or link by email if possible)
      // For now, let's assume we create a reservation and the backend might handle guest creation 
      // or we do it here. The spec says guest is a Link field.

      await createDoc("Reservation", {
        naming_series: "RES-.YYYY.-.#####",
        property: selectedProperty,
        guest_name: guestName,
        guest_email: guestEmail,
        guest_phone: guestPhone,
        room_type: selectedRoom,
        check_in_date: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "",
        check_out_date: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "",
        number_of_guests: parseInt(guests) || 1,
        special_requests: specialRequests,
        room_rate_per_night: baseRate,
        reservation_status: "Confirmed"
      })

      onOpenChange(false)
      // Reset
      setGuestName("")
      setGuestEmail("")
      setGuestPhone("")
      setSelectedProperty("")
      setSelectedRoom("")
      setDateRange(undefined)
    } catch (e) {
      console.error("Failed to create booking:", e)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Create New Booking</SheetTitle>
          <SheetDescription>Add a new reservation to your property</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Guest Information */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-medium">
              <User className="h-4 w-4" />
              Guest Information
            </h3>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="guestName">Full Name</Label>
                <Input
                  id="guestName"
                  placeholder="Enter guest name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="guestEmail">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="guestEmail"
                      type="email"
                      placeholder="email@example.com"
                      className="pl-9"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guestPhone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="guestPhone"
                      placeholder="+91 98765 43210"
                      className="pl-9"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Property & Room Selection */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-medium">
              <Building2 className="h-4 w-4" />
              Property Details
            </h3>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Property</Label>
                <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertiesList?.map((property) => (
                      <SelectItem key={property.name} value={property.name}>
                        {property.property_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Room Type</Label>
                <Select value={selectedRoom} onValueChange={setSelectedRoom} disabled={!selectedProperty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypesList?.map((room) => (
                      <SelectItem key={room.name} value={room.name}>
                        {room.room_type_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Number of Guests</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Select value={guests} onValueChange={setGuests}>
                    <SelectTrigger className="pl-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? "Guest" : "Guests"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Date Selection */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-medium">
              <CalendarIcon className="h-4 w-4" />
              Stay Dates
            </h3>

            <div className="space-y-2">
              <Label>Check-in / Check-out</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd MMM yyyy")} - {format(dateRange.to, "dd MMM yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "dd MMM yyyy")
                      )
                    ) : (
                      "Select dates"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    disabled={{ before: new Date() }}
                  />
                </PopoverContent>
              </Popover>
              {nights > 0 && <p className="text-sm text-muted-foreground">{nights} night(s)</p>}
            </div>
          </div>

          <Separator />

          {/* Special Requests */}
          <div className="space-y-2">
            <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
            <Textarea
              id="specialRequests"
              placeholder="Any special requirements or notes..."
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              rows={3}
            />
          </div>

          {/* Price Summary */}
          {nights > 0 && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <h4 className="mb-3 font-medium">Price Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Room Rate x {nights} night(s)</span>
                  <span>₹{(baseRate * nights).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GST (18%)</span>
                  <span>₹{Math.round(baseRate * nights * 0.18).toLocaleString("en-IN")}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Total Amount</span>
                  <span className="flex items-center text-lg text-primary">
                    <IndianRupee className="h-4 w-4" />
                    {Math.round(baseRate * nights * 1.18).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-[#E68B47] hover:bg-[#c97339]"
            onClick={handleSubmit}
            disabled={!guestName || !selectedProperty || !dateRange?.from || !dateRange?.to || creating}
          >
            {creating ? "Creating..." : "Create Booking"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
