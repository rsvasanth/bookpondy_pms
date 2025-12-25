"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {
    CalendarIcon,
    Phone,
    Mail,
    Building2,
    Users,
    ChevronRight,
    ChevronLeft,
    Check,
    Sparkles,
    User,
    ArrowRight,
    Zap,
} from "lucide-react"
import { format, differenceInDays } from "date-fns"
import { cn } from "@/lib/utils"
import type { DateRange } from "react-day-picker"
import { useFrappeCreateDoc, useFrappeGetDocList } from "frappe-react-sdk"
import { toast } from "sonner"

interface QuickBookDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

type Step = 1 | 2 | 3

export function QuickBookDialog({ open, onOpenChange, onSuccess }: QuickBookDialogProps) {
    const { createDoc, loading: creating } = useFrappeCreateDoc()

    const [step, setStep] = useState<Step>(1)
    const [dateRange, setDateRange] = useState<DateRange | undefined>()
    const [selectedProperty, setSelectedProperty] = useState<string>("")
    const [selectedCategory, setSelectedCategory] = useState<string>("")
    const [selectedUnit, setSelectedUnit] = useState<string>("")
    const [guests, setGuests] = useState("2")
    const [guestName, setGuestName] = useState("")
    const [guestEmail, setGuestEmail] = useState("")
    const [guestPhone, setGuestPhone] = useState("")

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

    // Fetch units for selected property and category
    const { data: unitsList } = useFrappeGetDocList("Unit", {
        fields: ["name", "unit_number", "unit_status"],
        filters: selectedCategory ? [["unit_category", "=", selectedCategory]] : undefined,
        limit: 100
    })

    const nights = dateRange?.from && dateRange?.to ? differenceInDays(dateRange.to, dateRange.from) : 0
    const selectedCategoryData = unitCategoriesList?.find(uc => uc.name === selectedCategory)
    const baseRate = selectedCategoryData?.base_rate_per_night || 0
    const totalAmount = nights * baseRate
    const totalWithGST = Math.round(totalAmount * 1.18)

    const canProceedStep1 = guestName.trim().length > 0
    const canProceedStep2 = selectedProperty && dateRange?.from && dateRange?.to
    const canSubmit = canProceedStep1 && canProceedStep2

    const handleNext = () => {
        if (step < 3) setStep((step + 1) as Step)
    }

    const handleBack = () => {
        if (step > 1) setStep((step - 1) as Step)
    }

    const handleSubmit = async () => {
        if (!canSubmit || !dateRange?.from || !dateRange?.to) return

        try {
            await createDoc("Reservation", {
                naming_series: "RES-.YYYY.-.#####",
                property: selectedProperty,
                guest_name: guestName,
                guest_email: guestEmail,
                guest_phone: guestPhone,
                unit_category: selectedCategory,
                allocated_unit: selectedUnit === " " ? null : selectedUnit,
                check_in_date: format(dateRange.from, "yyyy-MM-dd"),
                check_out_date: format(dateRange.to, "yyyy-MM-dd"),
                nights: nights,
                number_of_guests: parseInt(guests) || 1,
                room_rate_per_night: baseRate,
                total_amount: totalWithGST,
                reservation_status: "Confirmed",
                reservation_source: "Direct"
            })

            toast.success("Booking created successfully!")
            onOpenChange(false)
            if (onSuccess) onSuccess()

            // Reset
            setStep(1)
            setGuestName("")
            setGuestEmail("")
            setGuestPhone("")
            setSelectedProperty("")
            setSelectedCategory("")
            setSelectedUnit("")
            setDateRange(undefined)
        } catch (e: any) {
            console.error("Failed to create booking:", e)
            toast.error(e.message || "Failed to create booking")
        }
    }

    const resetAndClose = () => {
        setStep(1)
        setGuestName("")
        setGuestEmail("")
        setGuestPhone("")
        setSelectedProperty("")
        setSelectedCategory("")
        setSelectedUnit("")
        setDateRange(undefined)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={resetAndClose}>
            <DialogContent className="sm:max-w-[540px] p-0 overflow-hidden rounded-3xl border-0 shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-br from-[#FF3D2E] to-[#FF6B5B] p-6 text-white">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Zap className="h-5 w-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold text-white">Quick Book</DialogTitle>
                                <DialogDescription className="text-white/80 text-sm font-medium">
                                    Create a booking in seconds
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Step Indicator */}
                    <div className="flex items-center justify-between mt-6">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center">
                                <div className={cn(
                                    "h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm transition-all",
                                    step >= s
                                        ? "bg-white text-[#FF3D2E]"
                                        : "bg-white/20 text-white/60"
                                )}>
                                    {step > s ? <Check className="h-4 w-4" /> : s}
                                </div>
                                {s < 3 && (
                                    <div className={cn(
                                        "w-16 sm:w-24 h-0.5 mx-2 rounded-full transition-all",
                                        step > s ? "bg-white" : "bg-white/20"
                                    )} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] font-bold uppercase tracking-widest text-white/60">
                        <span className={step >= 1 ? "text-white" : ""}>Guest</span>
                        <span className={step >= 2 ? "text-white" : ""}>Stay</span>
                        <span className={step >= 3 ? "text-white" : ""}>Confirm</span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 min-h-[320px]">
                    {/* Step 1: Guest */}
                    {step === 1 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Full Name *</Label>
                                <Input
                                    placeholder="e.g. Rahul Sharma"
                                    className="rounded-xl h-12 bg-gray-50/50 border-gray-100 focus-visible:ring-[#FF3D2E]/20 font-medium"
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <Input
                                            type="email"
                                            placeholder="email@example.com"
                                            className="pl-11 rounded-xl h-12 bg-gray-50/50 border-gray-100 focus-visible:ring-[#FF3D2E]/20 font-medium"
                                            value={guestEmail}
                                            onChange={(e) => setGuestEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Phone</Label>
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

                            {/* Quick Guest Suggestion */}
                            <div className="pt-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Recent Guests</p>
                                <div className="flex flex-wrap gap-2">
                                    {["Rahul Sharma", "Priya Patel", "Vikram Singh"].map((name) => (
                                        <button
                                            key={name}
                                            onClick={() => setGuestName(name)}
                                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 hover:bg-red-50 hover:text-[#FF3D2E] transition-colors text-sm font-medium border border-gray-100"
                                        >
                                            <User className="h-3.5 w-3.5" />
                                            {name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Stay Details */}
                    {step === 2 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Property *</Label>
                                <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                                    <SelectTrigger className="rounded-xl h-12 bg-gray-50/50 border-gray-100 focus:ring-[#FF3D2E]/20 font-medium">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-gray-400" />
                                            <SelectValue placeholder="Select property" />
                                        </div>
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

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-4 grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Unit Type</Label>
                                        <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={!selectedProperty}>
                                            <SelectTrigger className="rounded-xl h-12 bg-gray-50/50 border-gray-100 focus:ring-[#FF3D2E]/20 font-medium">
                                                <SelectValue placeholder="Choose type" />
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
                                        <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Unit (Opt)</Label>
                                        <Select value={selectedUnit} onValueChange={setSelectedUnit} disabled={!selectedCategory}>
                                            <SelectTrigger className="rounded-xl h-12 bg-gray-50/50 border-gray-100 focus:ring-[#FF3D2E]/20 font-medium">
                                                <SelectValue placeholder="Unit" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-gray-100 shadow-xl p-2">
                                                <SelectItem value=" " className="rounded-xl py-3 cursor-pointer font-medium italic text-gray-400">Any Unit</SelectItem>
                                                {unitsList?.map((unit) => (
                                                    <SelectItem key={unit.name} value={unit.name} className="rounded-xl py-3 cursor-pointer font-medium">
                                                        {unit.unit_number}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Guests</Label>
                                    <Select value={guests} onValueChange={setGuests}>
                                        <SelectTrigger className="rounded-xl h-12 bg-gray-50/50 border-gray-100 focus:ring-[#FF3D2E]/20 font-medium">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-gray-400" />
                                                <SelectValue />
                                            </div>
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
                                                    <span className="font-bold">
                                                        {format(dateRange.from, "dd MMM")} <ArrowRight className="inline h-3 w-3 mx-1" /> {format(dateRange.to, "dd MMM yyyy")}
                                                    </span>
                                                ) : (
                                                    format(dateRange.from, "dd MMM yyyy")
                                                )
                                            ) : (
                                                "Select check-in & check-out"
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
                                {nights > 0 && (
                                    <p className="text-[11px] font-bold text-[#FF3D2E] uppercase tracking-wider px-1">
                                        {nights} night(s) • ₹{baseRate.toLocaleString("en-IN")}/night
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Confirm */}
                    {step === 3 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Summary Card */}
                            <div className="rounded-2xl border border-gray-100 overflow-hidden">
                                <div className="bg-gray-50/50 p-4 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-xl bg-red-50 text-[#FF3D2E] flex items-center justify-center font-bold">
                                            {guestName.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#0A0A0A]">{guestName}</p>
                                            <p className="text-sm text-muted-foreground font-medium">{guestPhone || guestEmail || "No contact info"}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 font-medium">Property</span>
                                        <span className="font-bold text-[#0A0A0A]">
                                            {propertiesList?.find(p => p.name === selectedProperty)?.property_name || selectedProperty}
                                        </span>
                                    </div>
                                    {selectedCategory && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500 font-medium">Unit Type</span>
                                            <span className="font-bold text-[#0A0A0A]">
                                                {unitCategoriesList?.find(c => c.name === selectedCategory)?.category_name || selectedCategory}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 font-medium">Stay</span>
                                        <span className="font-bold text-[#0A0A0A]">
                                            {dateRange?.from && format(dateRange.from, "dd MMM")} → {dateRange?.to && format(dateRange.to, "dd MMM")} ({nights} nights)
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 font-medium">Guests</span>
                                        <span className="font-bold text-[#0A0A0A]">{guests}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Price Summary */}
                            <div className="rounded-2xl border border-gray-100 p-4 bg-gradient-to-br from-gray-50/50 to-white">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Amount</p>
                                        <p className="text-[10px] text-gray-400 font-medium">Incl. 18% GST</p>
                                    </div>
                                    <p className="text-3xl font-bold text-[#FF3D2E]">
                                        ₹{totalWithGST.toLocaleString("en-IN")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 flex gap-3 bg-gray-50/50">
                    {step > 1 ? (
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            className="flex-1 rounded-xl h-12 font-bold border-gray-200 hover:bg-white"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            onClick={resetAndClose}
                            className="flex-1 rounded-xl h-12 font-bold border-gray-200 hover:bg-white"
                        >
                            Cancel
                        </Button>
                    )}

                    {step < 3 ? (
                        <Button
                            onClick={handleNext}
                            disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
                            className="flex-[2] bg-[#FF3D2E] hover:bg-[#e63225] text-white rounded-xl h-12 font-bold shadow-xl shadow-red-500/20 disabled:opacity-50"
                        >
                            Continue
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={!canSubmit || creating}
                            className="flex-[2] bg-[#FF3D2E] hover:bg-[#e63225] text-white rounded-xl h-12 font-bold shadow-xl shadow-red-500/20 gap-2 disabled:opacity-50"
                        >
                            <Sparkles className="h-4 w-4" />
                            {creating ? "Creating..." : "Confirm Booking"}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
