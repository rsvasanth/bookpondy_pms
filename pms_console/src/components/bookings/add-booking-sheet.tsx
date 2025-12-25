"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Calendar } from "../ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "../ui/sheet"
import { CalendarIcon, Phone, Mail, Building2, Users } from "lucide-react"
import { format, differenceInDays } from "date-fns"
import { cn } from "../../lib/utils"
import type { DateRange } from "react-day-picker"
import { useFrappeCreateDoc, useFrappeGetDocList } from "frappe-react-sdk"
import { toast } from "sonner"

interface AddBookingSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddBookingSheet({ open, onOpenChange, onSuccess }: AddBookingSheetProps) {
  const { createDoc, loading: creating } = useFrappeCreateDoc()

  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [selectedProperty, setSelectedProperty] = useState<string>("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [guests, setGuests] = useState("2")
  const [guestName, setGuestName] = useState("")
  const [guestEmail, setGuestEmail] = useState("")
  const [guestPhone, setGuestPhone] = useState("")
  const [specialRequests, setSpecialRequests] = useState("")

  // Fetch real properties
  const { data: propertiesList } = useFrappeGetDocList("Property", {
    fields: ["name", "property_name"],
    limit: 100
  })

  // Fetch unit categories for selected property
  const { data: unitCategoriesList } = useFrappeGetDocList("Unit Category", {
    fields: ["name", "category_name", "base_rate_per_night"],
    filters: selectedProperty ? [["property", "=", selectedProperty]] : undefined,
    limit: 100
  })

  const nights = dateRange?.from && dateRange?.to ? differenceInDays(dateRange.to, dateRange.from) : 0
  const selectedCategoryData = unitCategoriesList?.find(uc => uc.name === selectedCategory)
  const baseRate = selectedCategoryData?.base_rate_per_night || 0
  const totalAmount = nights * baseRate

  const handleSubmit = async () => {
    if (!guestName || !selectedProperty || !dateRange?.from || !dateRange?.to) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      await createDoc("Reservation", {
        naming_series: "RES-.YYYY.-.#####",
        property: selectedProperty,
        guest_name: guestName,
        guest_email: guestEmail,
        guest_phone: guestPhone,
        unit_category: selectedCategory,
        check_in_date: format(dateRange.from, "yyyy-MM-dd"),
        check_out_date: format(dateRange.to, "yyyy-MM-dd"),
        nights: nights,
        number_of_guests: parseInt(guests) || 1,
        special_requests: specialRequests,
        room_rate_per_night: baseRate,
        total_amount: totalAmount * 1.18, // Total with estimated GST
        reservation_status: "Confirmed",
        reservation_source: "Direct"
      })

      toast.success("Booking created successfully!")
      onOpenChange(false)
      if (onSuccess) onSuccess()

      // Reset
      setGuestName("")
      setGuestEmail("")
      setGuestPhone("")
      setSelectedProperty("")
      setSelectedCategory("")
      setDateRange(undefined)
      setSpecialRequests("")
    } catch (e: any) {
      console.error("Failed to create booking:", e)
      toast.error(e.message || "Failed to create booking")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl bg-white border-l-0 shadow-2xl">
        <SheetHeader className="pb-6 border-b border-gray-100">
          <SheetTitle className="text-2xl font-bold text-[#0A0A0A]">Create New Booking</SheetTitle>
          <SheetDescription className="text-sm font-medium text-muted-foreground">Add a new reservation to your property portfolio</SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-8 pb-32">
          {/* Guest Information */}
          <div className="space-y-5">
            <h3 className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF3D2E]">
              <div className="h-1.5 w-1.5 rounded-full bg-[#FF3D2E]" />
              Guest Information
            </h3>

            <div className="grid gap-5">
              <div className="space-y-2">
                <Label htmlFor="guestName" className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Full Name *</Label>
                <Input
                  id="guestName"
                  placeholder="e.g. Vikram Malhotra"
                  className="rounded-xl h-12 bg-gray-50/50 border-gray-100 focus-visible:ring-[#FF3D2E]/20"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="guestEmail" className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="guestEmail"
                      type="email"
                      placeholder="vikram@example.com"
                      className="pl-11 rounded-xl h-12 bg-gray-50/50 border-gray-100 focus-visible:ring-[#FF3D2E]/20"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guestPhone" className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="guestPhone"
                      placeholder="+91 98765 43210"
                      className="pl-11 rounded-xl h-12 bg-gray-50/50 border-gray-100 focus-visible:ring-[#FF3D2E]/20"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Property & Room Selection */}
          <div className="space-y-5">
            <h3 className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF3D2E]">
              <div className="h-1.5 w-1.5 rounded-full bg-[#FF3D2E]" />
              Stay Details
            </h3>

            <div className="grid gap-5">
              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Select Property *</Label>
                <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                  <SelectTrigger className="rounded-xl h-12 bg-gray-50/50 border-gray-100 focus:ring-[#FF3D2E]/20">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <SelectValue placeholder="Which property?" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-gray-100 shadow-xl p-2">
                    {propertiesList?.map((property) => (
                      <SelectItem key={property.name} value={property.name} className="rounded-xl py-3 cursor-pointer">
                        {property.property_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Unit Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={!selectedProperty}>
                    <SelectTrigger className="rounded-xl h-12 bg-gray-50/50 border-gray-100 focus:ring-[#FF3D2E]/20">
                      <SelectValue placeholder="Choose unit type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-100 shadow-xl p-2">
                      {unitCategoriesList?.map((category) => (
                        <SelectItem key={category.name} value={category.name} className="rounded-xl py-3 cursor-pointer">
                          {category.category_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">No. of Guests</Label>
                  <Select value={guests} onValueChange={setGuests}>
                    <SelectTrigger className="rounded-xl h-12 bg-gray-50/50 border-gray-100 focus:ring-[#FF3D2E]/20">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-100 shadow-xl p-2">
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <SelectItem key={num} value={num.toString()} className="rounded-xl py-3 cursor-pointer">
                          {num} {num === 1 ? "Guest" : "Guests"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF3D2E]">
              <div className="h-1.5 w-1.5 rounded-full bg-[#FF3D2E]" />
              Schedule
            </h3>

            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Check-in & Check-out *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-bold rounded-xl h-12 bg-gray-50/50 border-gray-100 focus:ring-[#FF3D2E]/20 px-4",
                      !dateRange && "text-muted-foreground font-medium"
                    )}
                  >
                    <CalendarIcon className="mr-3 h-4 w-4 text-[#FF3D2E]" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd MMM yyyy")} — {format(dateRange.to, "dd MMM yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "dd MMM yyyy")
                      )
                    ) : (
                      "Select your stay dates"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4 rounded-3xl border-gray-100 shadow-2xl bg-white" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    disabled={{ before: new Date() }}
                    className="rounded-2xl"
                  />
                </PopoverContent>
              </Popover>
              {nights > 0 && <p className="text-[10px] font-bold text-[#FF3D2E] uppercase tracking-wider px-1">{nights} night(s) stay</p>}
            </div>
          </div>

          {/* Price Summary */}
          {nights > 0 && selectedCategory && (
            <div className="rounded-2xl border border-gray-50 bg-gray-50/50 p-6 space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Financial Overview</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-gray-500">Accommodation ({nights} nts)</span>
                  <span className="text-[#0A0A0A]">₹{(baseRate * nights).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-gray-400 uppercase tracking-wider">GST (18%)</span>
                  <span className="text-gray-500">₹{Math.round(baseRate * nights * 0.18).toLocaleString("en-IN")}</span>
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm font-bold text-[#0A0A0A]">Total Amount</span>
                  <span className="text-2xl font-bold text-[#FF3D2E]">
                    ₹{Math.round(baseRate * nights * 1.18).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Special Requests */}
          <div className="space-y-2">
            <Label htmlFor="specialRequests" className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Special Requests</Label>
            <Textarea
              id="specialRequests"
              placeholder="Any dietary needs or late check-in?"
              className="rounded-xl bg-gray-50/50 border-gray-100 focus-visible:ring-[#FF3D2E]/20 min-h-[100px]"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
            />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8 bg-white border-t border-gray-100 flex gap-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 rounded-xl h-14 font-bold border-gray-100 hover:bg-gray-50">
            Cancel
          </Button>
          <Button
            className="flex-[2] bg-[#FF3D2E] hover:bg-[#e63225] text-white font-bold rounded-xl h-14 shadow-xl shadow-red-500/20"
            onClick={handleSubmit}
            disabled={!guestName || !selectedProperty || !dateRange?.from || !dateRange?.to || creating}
          >
            {creating ? "Processing..." : "Confirm Booking"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
