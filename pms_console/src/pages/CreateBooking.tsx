"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    CalendarIcon,
    Phone,
    Mail,
    Building2,
    Sparkles,
    ArrowRight,
    ArrowLeft,
    User,
    MapPin
} from "lucide-react"
import { format, differenceInDays } from "date-fns"
import { cn } from "@/lib/utils"
import type { DateRange } from "react-day-picker"
import { useFrappeFileUpload } from "frappe-react-sdk"
import { useLocalDocList, useLocalCreate } from "@/hooks/use-local-data"
import { toast } from "sonner"

export default function CreateBookingPage() {
    const navigate = useNavigate()
    const { create: createLocalDoc, isCreating: creating } = useLocalCreate()
    const { upload, loading: uploadLoading } = useFrappeFileUpload() // Upload hook

    const [dateRange, setDateRange] = useState<DateRange | undefined>()
    const [selectedProperty, setSelectedProperty] = useState<string>("")
    const [selectedCategory, setSelectedCategory] = useState<string>("")
    const [selectedUnit, setSelectedUnit] = useState<string>("")
    const [guests] = useState("2")
    const [guestName, setGuestName] = useState("")
    const [guestEmail, setGuestEmail] = useState("")
    const [guestPhone, setGuestPhone] = useState("")
    const [guestIdNumber, setGuestIdNumber] = useState("")
    const [guestIdUrl, setGuestIdUrl] = useState("") // Store uploaded file URL
    const [specialRequests, setSpecialRequests] = useState("")

    // Fetch real properties
    const { data: propertiesList } = useLocalDocList("Property")

    // Fetch unit categories for selected property
    const { data: unitCategoriesList } = useLocalDocList("Unit Category", {
        selector: selectedProperty ? { property: selectedProperty } : {}
    })

    // Fetch units
    const { data: unitsList } = useLocalDocList("Unit", {
        selector: selectedCategory ? { unit_category: selectedCategory } : {}
    })

    const nights = dateRange?.from && dateRange?.to ? differenceInDays(dateRange.to, dateRange.from) : 0
    const selectedCategoryData = unitCategoriesList?.find(uc => uc.name === selectedCategory)
    const baseRate = selectedCategoryData?.base_rate_per_night || 0
    const totalAmount = nights * baseRate
    const totalWithGST = Math.round(totalAmount * 1.18)

    const handleIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            // Upload immediately to get URL
            const result = await upload(file, {
                isPrivate: false,
                folder: "Home/Guest IDs"
            })

            if (result && (result as any).file_url) {
                setGuestIdUrl((result as any).file_url)
                toast.success("ID Proof uploaded")
            }
        } catch (error) {
            console.error("Upload failed", error)
            toast.error("Failed to upload ID proof")
        }
    }

    const handleSubmit = async () => {
        if (!guestName || !selectedProperty || !dateRange?.from || !dateRange?.to) {
            toast.error("Please fill in all required fields")
            return
        }

        try {
            await createLocalDoc("Reservation", {
                naming_series: "RES-.YYYY.-.#####",
                property: selectedProperty,
                guest_name: guestName,
                guest_email: guestEmail,
                guest_phone: guestPhone,
                guest_id_number: guestIdNumber,
                guest_id_image: guestIdUrl,
                unit_category: selectedCategory,
                allocated_unit: selectedUnit,
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
            navigate("/bookings")
        } catch (e: any) {
            console.error("Failed to create booking:", e)
            toast.error(e.message || "Failed to create booking")
        }
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col h-[calc(100vh-2rem)]">
                {/* Header */}
                <div className="mb-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => navigate("/bookings")} className="rounded-full h-8 w-8 border border-gray-200 hover:bg-white hover:shadow-sm">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-foreground">Create Booking</h1>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">New reservation entry</p>
                        </div>
                    </div>
                </div>

                {/* 3-Column Grid Layout */}
                <div className="flex-1 overflow-y-auto min-h-0 pb-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">

                        {/* COLUMN 1: GUEST DETAILS */}
                        <div className="flex flex-col gap-4">
                            <div className="bg-white border border-muted border-b-4 border-b-primary rounded-2xl overflow-hidden shadow-xl shadow-gray-200/50 flex flex-col h-full hover:shadow-2xl hover:shadow-primary/5 transition-all">
                                {/* Header */}
                                <div className="bg-primary p-4 text-white relative shrink-0">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <User className="h-16 w-16 transform translate-x-4 -translate-y-4" />
                                    </div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest opacity-80 mb-1">Step 1</p>
                                    <h2 className="text-lg font-bold truncate pr-4 leading-tight">Guest Information</h2>
                                    <p className="text-[10px] font-medium opacity-80">Primary contact details</p>
                                </div>
                                {/* Jagged Divider */}
                                <div className="h-3 bg-white relative -mt-1.5 shrink-0">
                                    <div className="absolute top-0 left-0 w-full h-1.5 bg-[#FF3D2E] opacity-90 rounded-b-xl"></div>
                                </div>

                                <div className="p-4 space-y-4 flex-1">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Full Name *</Label>
                                        <Input
                                            placeholder="Vikram Malhotra"
                                            className="rounded-lg h-10 bg-muted/20 border-muted focus-visible:ring-primary/20 font-semibold px-3 text-sm"
                                            value={guestName}
                                            onChange={(e) => setGuestName(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                                            <Input
                                                type="email"
                                                placeholder="vikram@example.com"
                                                className="pl-9 rounded-lg h-10 bg-muted/20 border-muted focus-visible:ring-primary/20 font-medium text-sm"
                                                value={guestEmail}
                                                onChange={(e) => setGuestEmail(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone Number</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                                            <Input
                                                placeholder="+91 98765 43210"
                                                className="pl-9 rounded-lg h-10 bg-muted/20 border-muted focus-visible:ring-primary/20 font-medium text-sm"
                                                value={guestPhone}
                                                onChange={(e) => setGuestPhone(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-gray-50 space-y-3">
                                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Identity Proof (Govt. ID)</Label>
                                        <div className="space-y-3">
                                            <Input
                                                placeholder="ID Number (Aadhar / Passport)"
                                                className="rounded-lg h-9 bg-muted/20 border-muted focus-visible:ring-primary/20 font-medium text-xs"
                                                value={guestIdNumber}
                                                onChange={(e) => setGuestIdNumber(e.target.value)}
                                            />
                                            <div className="relative border border-dashed border-gray-200 rounded-lg p-3 flex flex-col items-center justify-center text-center gap-1.5 bg-gray-50/30 hover:bg-gray-50 transition-colors cursor-pointer group">
                                                {/* Preview or Upload UI */}
                                                {guestIdUrl ? (
                                                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-100">
                                                        <img src={guestIdUrl} alt="ID Proof" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <p className="text-white text-xs font-bold">Change</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="h-8 w-8 rounded-full bg-muted text-secondary flex items-center justify-center">
                                                            {uploadLoading ? <Sparkles className="h-4 w-4 animate-spin text-primary" /> : <User className="h-4 w-4" />}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-gray-600">{uploadLoading ? "Uploading..." : "Upload ID Photo"}</p>
                                                            <p className="text-[10px] text-gray-400">JPG, PNG or PDF</p>
                                                        </div>
                                                    </>
                                                )}

                                                <Input
                                                    type="file"
                                                    className="hidden"
                                                    id="id-proof-upload"
                                                    accept="image/*,application/pdf"
                                                    onChange={handleIdUpload}
                                                    disabled={uploadLoading}
                                                />
                                                <Label htmlFor="id-proof-upload" className="absolute inset-0 cursor-pointer" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* COLUMN 2: STAY DETAILS */}
                        <div className="flex flex-col gap-4">
                            <div className="bg-white border border-muted border-b-4 border-b-primary/20 rounded-2xl overflow-hidden shadow-xl shadow-gray-200/50 flex flex-col h-full hover:shadow-2xl hover:shadow-primary/5 transition-all">
                                {/* Header */}
                                <div className="bg-primary p-4 text-white relative shrink-0">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <MapPin className="h-16 w-16 transform translate-x-4 -translate-y-4" />
                                    </div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest opacity-80 mb-1">Step 2</p>
                                    <h2 className="text-lg font-bold truncate pr-4 leading-tight">Stay Details</h2>
                                    <p className="text-[10px] font-medium opacity-80 mt-1">Property & Dates</p>
                                </div>
                                {/* Jagged Divider */}
                                <div className="h-3 bg-white relative -mt-1.5 shrink-0">
                                    <div className="absolute top-0 left-0 w-full h-1.5 bg-[#FF3D2E] opacity-90 rounded-b-xl"></div>
                                </div>

                                <div className="p-4 space-y-4 flex-1">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Property *</Label>
                                        <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                                            <SelectTrigger className="rounded-lg h-10 bg-muted/20 border-muted focus:ring-primary/20 font-medium px-3 text-sm">
                                                <SelectValue placeholder="Select Property" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-gray-100 shadow-xl p-1">
                                                {propertiesList?.map((property) => (
                                                    <SelectItem key={property.name} value={property.name} className="rounded-lg py-2.5 cursor-pointer font-medium">
                                                        {property.property_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Type</Label>
                                            <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={!selectedProperty}>
                                                <SelectTrigger className="rounded-xl h-10 bg-muted/20 border-muted focus:ring-primary/20 font-medium px-3">
                                                    <SelectValue placeholder="Category" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-gray-100 shadow-xl p-1">
                                                    {unitCategoriesList?.map((category) => (
                                                        <SelectItem key={category.name} value={category.name} className="rounded-lg py-2.5 cursor-pointer font-medium">
                                                            {category.category_name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Unit</Label>
                                            <Select value={selectedUnit} onValueChange={setSelectedUnit} disabled={!selectedProperty}>
                                                <SelectTrigger className="rounded-xl h-10 bg-muted/20 border-muted focus:ring-primary/20 font-medium px-3">
                                                    <SelectValue placeholder="Unit #" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-gray-100 shadow-xl p-1">
                                                    <SelectItem value=" " className="italic text-gray-400">Any Unit</SelectItem>
                                                    {unitsList?.map((unit) => (
                                                        <SelectItem key={unit.name} value={unit.name} className="rounded-lg py-2.5 cursor-pointer font-medium">
                                                            {unit.unit_number} {unit.unit_status !== "Clean" && `(${unit.unit_status})`}
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
                                                        "w-full justify-start text-left font-medium rounded-xl h-10 bg-muted/20 border-muted focus:ring-primary/20 px-4",
                                                        !dateRange && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-3 h-4 w-4 text-gray-400" />
                                                    {dateRange?.from ? (
                                                        dateRange.to ? (
                                                            <span className="font-bold text-foreground">
                                                                {format(dateRange.from, "dd MMM")} - {format(dateRange.to, "dd MMM")}
                                                            </span>
                                                        ) : (
                                                            format(dateRange.from, "dd MMM")
                                                        )
                                                    ) : (
                                                        "Check-in - Check-out"
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-4 rounded-2xl border-gray-100 shadow-2xl bg-white" align="start">
                                                <Calendar
                                                    mode="range"
                                                    selected={dateRange}
                                                    onSelect={setDateRange}
                                                    numberOfMonths={1}
                                                    disabled={{ before: new Date() }}
                                                    className="rounded-2xl"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div className="pt-4 border-t border-gray-50">
                                        <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Special Requests</Label>
                                        <Textarea
                                            placeholder="Requests..."
                                            className="rounded-xl bg-muted/20 border-muted focus-visible:ring-primary/20 min-h-[80px] font-medium resize-none"
                                            value={specialRequests}
                                            onChange={(e) => setSpecialRequests(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* COLUMN 3: SUMMARY & CONFIRM */}
                        <div className="flex flex-col gap-6">
                            <div className="bg-white border border-muted border-b-4 border-b-primary/20 rounded-2xl overflow-hidden shadow-xl shadow-gray-200/50 flex flex-col h-full sticky top-4 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 transition-all">
                                {/* Ticket Header */}
                                <div className="bg-primary p-5 text-white relative shrink-0">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Building2 className="h-24 w-24 transform translate-x-4 -translate-y-4" />
                                    </div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-2">Step 3</p>
                                    <h2 className="text-xl font-bold truncate pr-4 leading-tight">
                                        {propertiesList?.find(p => p.name === selectedProperty)?.property_name || "Booking Preview"}
                                    </h2>
                                    <div className="flex flex-wrap gap-2 mt-3 min-h-[24px]">
                                        {selectedCategory && (
                                            <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-bold">
                                                {unitCategoriesList?.find(c => c.name === selectedCategory)?.category_name}
                                            </span>
                                        )}
                                        {selectedUnit && (
                                            <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-bold">
                                                Unit {unitsList?.find(u => u.name === selectedUnit)?.unit_number || selectedUnit}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Jagged Divider */}
                                <div className="h-3 bg-white relative -mt-1.5 shrink-0">
                                    <div className="absolute top-0 left-0 w-full h-1.5 bg-[#FF3D2E] opacity-90 rounded-b-xl"></div>
                                </div>

                                {/* Ticket Body */}
                                <div className="p-5 space-y-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-center text-center">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase text-gray-400">In</p>
                                            <p className="font-bold text-lg text-foreground">{dateRange?.from ? format(dateRange.from, "dd MMM") : "--"}</p>
                                        </div>
                                        <div className="flex-1 px-4 flex flex-col items-center">
                                            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-full">{nights} Nts</span>
                                            <div className="w-full border-t border-dashed border-gray-300 mt-2"></div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase text-gray-400">Out</p>
                                            <p className="font-bold text-lg text-foreground">{dateRange?.to ? format(dateRange.to, "dd MMM") : "--"}</p>
                                        </div>
                                    </div>

                                    <div className="bg-muted/20 rounded-xl p-4 flex items-center gap-3">
                                        <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center text-muted-foreground shadow-sm"><User className="h-4 w-4" /></div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground">{guestName || "Guest"}</p>
                                            <p className="text-xs text-gray-400 font-medium">{guests} Guests</p>
                                        </div>
                                    </div>

                                    <div className="mt-auto space-y-3 pt-6 border-t border-dashed border-gray-200">
                                        <div className="flex justify-between text-sm font-medium text-gray-500">
                                            <span>Rate</span>
                                            <span>₹{(baseRate * nights).toLocaleString("en-IN")}</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-medium text-gray-500">
                                            <span>Taxes</span>
                                            <span>₹{Math.round(baseRate * nights * 0.18).toLocaleString("en-IN")}</span>
                                        </div>
                                        <div className="flex justify-between items-end pt-2">
                                            <span className="text-sm font-bold text-foreground uppercase tracking-wider">Total</span>
                                            <span className="text-3xl font-bold text-primary">₹{totalWithGST.toLocaleString("en-IN")}</span>
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold rounded-xl h-10 shadow-lg shadow-primary/20 mt-4"
                                        onClick={handleSubmit}
                                        disabled={!guestName || !selectedProperty || !dateRange?.from || !dateRange?.to || creating}
                                    >
                                        {creating ? (
                                            <>Processing...</>
                                        ) : (
                                            <>
                                                Confirm Booking <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
