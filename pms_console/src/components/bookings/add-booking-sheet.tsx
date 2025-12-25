"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Calendar } from "../ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import {
  CalendarIcon,
  Phone,
  Mail,
  Building2,
  Users,
  CreditCard,
  User,
  Sparkles,
  ArrowRight
} from "lucide-react"
import { format, differenceInDays } from "date-fns"
import { cn } from "../../lib/utils"
import type { DateRange } from "react-day-picker"
import { useFrappeCreateDoc, useFrappeGetDocList } from "frappe-react-sdk"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"

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
  const totalWithGST = Math.round(totalAmount * 1.18)

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
        total_amount: totalWithGST,
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] p-0 gap-0 overflow-hidden rounded-3xl border-0 shadow-2xl bg-[#F8F9FA]">
        <div className="flex flex-col h-full w-full">
          {/* Header */}
          <div className="bg-white px-8 py-5 border-b border-gray-100 flex items-center justify-between z-10">
            <div>
              <DialogTitle className="text-2xl font-bold text-[#0A0A0A]">New Reservation</DialogTitle>
              <DialogDescription className="text-sm font-medium text-gray-500">Create a comprehensive booking record</DialogDescription>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl h-11 px-6 font-bold border-gray-200 hover:bg-gray-50">
                Cancel
              </Button>
              <Button
                className="bg-[#FF3D2E] hover:bg-[#e63225] text-white font-bold rounded-xl h-11 px-6 shadow-lg shadow-red-500/20 gap-2"
                onClick={handleSubmit}
                disabled={!guestName || !selectedProperty || !dateRange?.from || !dateRange?.to || creating}
              >
                {creating ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Confirm Booking
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Main Content Areas */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Form Area */}
            <div className="flex-1 overflow-y-auto w-2/3">
              <div className="p-8 space-y-8 max-w-3xl mx-auto">

                {/* Section 1: Guest Details */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
                  <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                    <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#0A0A0A]">Guest Information</h3>
                      <p className="text-xs text-gray-400 font-medium">Primary contact details</p>
                    </div>
                  </div>

                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Full Name *</Label>
                      <Input
                        placeholder="e.g. Vikram Malhotra"
                        className="rounded-xl h-12 bg-gray-50/50 border-gray-100 focus-visible:ring-[#FF3D2E]/20 font-semibold text-base"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <Input
                            type="email"
                            placeholder="vikram@example.com"
                            className="pl-11 rounded-xl h-12 bg-gray-50/50 border-gray-100 focus-visible:ring-[#FF3D2E]/20 font-medium"
                            value={guestEmail}
                            onChange={(e) => setGuestEmail(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <Input
                            placeholder="+91 98765 43210"
                            className="pl-11 rounded-xl h-12 bg-gray-50/50 border-gray-100 focus-visible:ring-[#FF3D2E]/20 font-medium"
                            value={guestPhone}
                            onChange={(e) => setGuestPhone(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Stay Details */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
                  <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                    <div className="h-10 w-10 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#0A0A0A]">Stay Details</h3>
                      <p className="text-xs text-gray-400 font-medium">Property and dates</p>
                    </div>
                  </div>

                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Select Property *</Label>
                      <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                        <SelectTrigger className="rounded-xl h-12 bg-gray-50/50 border-gray-100 focus:ring-[#FF3D2E]/20 font-medium">
                          <SelectValue placeholder="Choose a property" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-gray-100 shadow-xl p-2">
                          {propertiesList?.map((property) => (
                            <SelectItem key={property.name} value={property.name} className="rounded-xl py-3 cursor-pointer font-medium">
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
                          <SelectTrigger className="rounded-xl h-12 bg-gray-50/50 border-gray-100 focus:ring-[#FF3D2E]/20 font-medium">
                            <SelectValue placeholder="Unit Type" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-gray-100 shadow-xl p-2">
                            {unitCategoriesList?.map((category) => (
                              <SelectItem key={category.name} value={category.name} className="rounded-xl py-3 cursor-pointer font-medium">
                                {category.category_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Guests</Label>
                        <Select value={guests} onValueChange={setGuests}>
                          <SelectTrigger className="rounded-xl h-12 bg-gray-50/50 border-gray-100 focus:ring-[#FF3D2E]/20 font-medium">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-gray-100 shadow-xl p-2">
                            {[1, 2, 3, 4, 5, 6].map((num) => (
                              <SelectItem key={num} value={num.toString()} className="rounded-xl py-3 cursor-pointer font-medium">
                                {num} {num === 1 ? "Guest" : "Guests"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Dates *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-medium rounded-xl h-12 bg-gray-50/50 border-gray-100 focus:ring-[#FF3D2E]/20 px-4",
                              !dateRange && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-3 h-4 w-4 text-[#FF3D2E]" />
                            {dateRange?.from ? (
                              dateRange.to ? (
                                <span className="font-bold text-[#0A0A0A]">
                                  {format(dateRange.from, "dd MMM yyyy")} <span className="mx-2 text-gray-300">→</span> {format(dateRange.to, "dd MMM yyyy")}
                                </span>
                              ) : (
                                format(dateRange.from, "dd MMM yyyy")
                              )
                            ) : (
                              "Select check-in & check-out dates"
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
                    </div>
                  </div>
                </div>

                {/* Section 3: Extras */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                    <div className="h-10 w-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#0A0A0A]">Special Requests</h3>
                      <p className="text-xs text-gray-400 font-medium">Notes for the front desk</p>
                    </div>
                  </div>
                  <Textarea
                    placeholder="E.g. Early check-in requested, allergy information..."
                    className="rounded-xl bg-gray-50/50 border-gray-100 focus-visible:ring-[#FF3D2E]/20 min-h-[100px] font-medium"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Right: Summary Area */}
            <div className="w-1/3 bg-white border-l border-gray-100 p-8 overflow-y-auto">
              <div className="sticky top-0 space-y-6">
                <h3 className="text-lg font-bold text-[#0A0A0A] flex items-center gap-2">
                  Booking Summary
                </h3>

                {/* Ticket Card */}
                <div className="border border-gray-200 rounded-3xl overflow-hidden relative shadow-sm">
                  {/* Top Part */}
                  <div className="bg-[#FF3D2E] p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Building2 className="h-24 w-24 transform translate-x-4 -translate-y-4" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Property</p>
                    <p className="text-xl font-bold truncate pr-4">
                      {propertiesList?.find(p => p.name === selectedProperty)?.property_name || "Select Property"}
                    </p>
                    <p className="text-sm font-medium opacity-80 mt-1">
                      {unitCategoriesList?.find(c => c.name === selectedCategory)?.category_name || "Select Unit Type"}
                    </p>
                  </div>

                  {/* Jagged Line (Visual Trick) */}
                  <div className="h-4 bg-white relative -mt-2">
                    <div className="absolute top-0 left-0 w-full h-2 bg-[#FF3D2E] rounded-b-xl"></div>
                  </div>

                  {/* Middle Part */}
                  <div className="p-6 bg-white space-y-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Check-in</p>
                        <p className="font-bold text-lg text-[#0A0A0A]">
                          {dateRange?.from ? format(dateRange.from, "dd MMM") : "--"}
                        </p>
                        <p className="text-xs text-gray-400 font-medium">
                          {dateRange?.from ? format(dateRange.from, "EEEE") : ""}
                        </p>
                      </div>
                      <div className="flex flex-col items-center pt-2">
                        <span className="text-[10px] font-bold text-gray-300 bg-gray-50 px-2 py-1 rounded-full">{nights} Nights</span>
                        <div className="w-16 border-b-2 border-dashed border-gray-200 my-2"></div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Check-out</p>
                        <p className="font-bold text-lg text-[#0A0A0A]">
                          {dateRange?.to ? format(dateRange.to, "dd MMM") : "--"}
                        </p>
                        <p className="text-xs text-gray-400 font-medium">
                          {dateRange?.to ? format(dateRange.to, "EEEE") : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-[#0A0A0A]">{guestName || "Guest Name"}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{guests} Guests</p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Part (Totals) */}
                  <div className="border-t border-dashed border-gray-200 p-6 bg-gray-50/30">
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-xs font-medium text-gray-500">
                        <span>Rate x {nights} nights</span>
                        <span>₹{(baseRate * nights).toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between text-xs font-medium text-gray-500">
                        <span>Taxes & Fees (18%)</span>
                        <span>₹{Math.round(baseRate * nights * 0.18).toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-sm font-bold text-[#0A0A0A]">Total Due</span>
                      <span className="text-2xl font-bold text-[#FF3D2E]">₹{totalWithGST.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>

                {/* Help Text */}
                <div className="p-4 rounded-xl bg-blue-50 text-blue-700 text-xs font-medium leading-relaxed">
                  <span className="font-bold block mb-1">Note:</span>
                  Payment link will be automatically sent to the guest upon confirmation.
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
