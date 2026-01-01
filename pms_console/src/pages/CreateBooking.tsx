"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
    CalendarIcon,
    Phone,
    Mail,
    Building2,
    Sparkles,
    ArrowLeft,
    User,
    CheckCircle2,
    Upload
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
    const { upload, loading: uploadLoading } = useFrappeFileUpload()

    const [dateRange, setDateRange] = useState<DateRange | undefined>()
    const [selectedProperty, setSelectedProperty] = useState<string>("")
    const [selectedCategory, setSelectedCategory] = useState<string>("")
    const [selectedUnit, setSelectedUnit] = useState<string>("")
    const [adults, setAdults] = useState("2")
    const [children, setChildren] = useState("0")
    const [guestName, setGuestName] = useState("")
    const [guestEmail, setGuestEmail] = useState("")
    const [guestPhone, setGuestPhone] = useState("")
    const [guestIdNumber, setGuestIdNumber] = useState("")
    const [guestIdUrl, setGuestIdUrl] = useState("")
    const [specialRequests, setSpecialRequests] = useState("")
    const [bookingSource, setBookingSource] = useState("Direct")
    const [selectedChannel, setSelectedChannel] = useState("")
    const [otaBookingId, setOtaBookingId] = useState("")

    // Data Fetching
    const { data: propertiesList } = useLocalDocList("Property")
    const { data: unitCategoriesList } = useLocalDocList("Unit Category", {
        selector: selectedProperty ? { property: selectedProperty } : {}
    })
    const { data: unitsList } = useLocalDocList("Unit", {
        selector: selectedCategory ? { unit_category: selectedCategory } : {}
    })
    const { data: guestsList } = useLocalDocList("Guest", {
        selector: guestPhone ? { phone: guestPhone } : (guestEmail ? { email: guestEmail } : { _id: 'none' })
    })
    const { data: channelsList } = useLocalDocList("Channel Config", {
        selector: { channel_type: "OTA", is_active: 1 }
    })

    // Calculations
    const nights = dateRange?.from && dateRange?.to ? differenceInDays(dateRange.to, dateRange.from) : 0
    const selectedCategoryData = unitCategoriesList?.find(uc => uc.name === selectedCategory)
    // Fallback logic for rate if not strictly defined in category, using arbitrary default if missing
    const baseRate = selectedCategoryData?.base_rate_per_night || 2500
    const totalRoomParams = nights * baseRate
    const gstAmount = Math.round(totalRoomParams * 0.18)
    const totalWithGST = totalRoomParams + gstAmount

    const handleIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
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
            let guestId = guestsList?.[0]?.name

            // 1. Upsert Guest locally
            if (!guestId) {
                const newGuest = await createLocalDoc("Guest", {
                    guest_name: guestName,
                    email: guestEmail,
                    phone: guestPhone,
                    naming_series: "GST-.YYYY.-.#####"
                })
                guestId = newGuest.name
            }

            // 2. Create Reservation locally
            await createLocalDoc("Reservation", {
                naming_series: "RES-.YYYY.-.#####",
                property: selectedProperty,
                guest: guestId,
                guest_name: guestName, // For instant local UI
                guest_email: guestEmail,
                guest_phone: guestPhone,
                unit_category: selectedCategory,
                allocated_unit: selectedUnit,
                check_in_date: format(dateRange.from, "yyyy-MM-dd"),
                check_out_date: format(dateRange.to, "yyyy-MM-dd"),
                adults: parseInt(adults) || 1,
                children: parseInt(children) || 0,
                number_of_guests: (parseInt(adults) || 0) + (parseInt(children) || 0),
                guest_id_number: guestIdNumber,
                guest_id_image: guestIdUrl,
                special_requests: specialRequests,
                room_rate_per_night: baseRate,
                reservation_status: "Confirmed",
                reservation_source: bookingSource,
                source_channel: bookingSource === "OTA" ? selectedChannel : undefined,
                marketplace_booking_id: bookingSource === "OTA" ? otaBookingId : undefined
            })

            toast.success("Booking created successfully!")
            navigate("/bookings")
        } catch (e: any) {
            console.error("Failed to create booking:", e)
            toast.error(e.message || "Failed to create booking")
        }
    }

    return (
        <>
            <div className="flex flex-col h-full space-y-6 p-6 w-full">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate("/bookings")} className="h-9 w-9">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Create Booking</h1>
                        <p className="text-muted-foreground">New direct reservation</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* Left Column: Forms */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Guest Information Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <User className="h-4 w-4 text-primary" />
                                    Guest Information
                                </CardTitle>
                                <CardDescription>Primary contact details for the reservation.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Full Name <span className="text-destructive">*</span></Label>
                                    <Input
                                        placeholder="e.g. Vikram Malhotra"
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                        className="h-10"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="email"
                                                placeholder="guest@example.com"
                                                className="pl-9"
                                                value={guestEmail}
                                                onChange={(e) => setGuestEmail(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Phone Number</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="+91 98765 43210"
                                                className="pl-9"
                                                value={guestPhone}
                                                onChange={(e) => setGuestPhone(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Separator className="my-2" />

                                <div className="space-y-4">
                                    <Label>Identity Proof</Label>
                                    <div className="flex gap-4 items-start">
                                        <Input
                                            placeholder="ID Number (Aadhar / Passport)"
                                            className="flex-1"
                                            value={guestIdNumber}
                                            onChange={(e) => setGuestIdNumber(e.target.value)}
                                        />
                                        <div className="shrink-0">
                                            <Input
                                                type="file"
                                                id="id-proof-upload"
                                                className="hidden"
                                                accept="image/*,application/pdf"
                                                onChange={handleIdUpload}
                                                disabled={uploadLoading}
                                            />
                                            <Label
                                                htmlFor="id-proof-upload"
                                                className={cn(
                                                    "h-10 px-4 flex items-center gap-2 border rounded-md cursor-pointer hover:bg-muted transition-colors text-sm font-medium",
                                                    uploadLoading && "opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                {uploadLoading ? <Sparkles className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                                {guestIdUrl ? "Change ID" : "Upload ID"}
                                            </Label>
                                        </div>
                                    </div>
                                    {guestIdUrl && (
                                        <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-md border border-emerald-100">
                                            <CheckCircle2 className="h-4 w-4" />
                                            ID Proof Uploaded
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Stay Details Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-primary" />
                                    Stay Details
                                </CardTitle>
                                <CardDescription>Select property, dates, and unit.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Property <span className="text-destructive">*</span></Label>
                                    <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Property" />
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Unit Category <span className="text-destructive">*</span></Label>
                                        <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={!selectedProperty}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {unitCategoriesList?.map((category) => (
                                                    <SelectItem key={category.name} value={category.name}>
                                                        {category.category_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Specific Unit (Optional)</Label>
                                        <Select value={selectedUnit} onValueChange={setSelectedUnit} disabled={!selectedProperty}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Assign Unit" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value=" ">Any Unit</SelectItem>
                                                {unitsList?.map((unit) => (
                                                    <SelectItem key={unit.name} value={unit.name}>
                                                        {unit.unit_number} {unit.unit_status !== "Clean" && `(${unit.unit_status})`}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Separator className="my-2" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Adults</Label>
                                        <Select value={adults} onValueChange={setAdults}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[1, 2, 3, 4, 5, 6].map((num) => (
                                                    <SelectItem key={num} value={num.toString()}>
                                                        {num} {num === 1 ? "Adult" : "Adults"}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Children</Label>
                                        <Select value={children} onValueChange={setChildren}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[0, 1, 2, 3, 4, 5].map((num) => (
                                                    <SelectItem key={num} value={num.toString()}>
                                                        {num} {num === 1 ? "Child" : "Children"}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Separator className="my-2" />

                                <div className="space-y-2">
                                    <Label>Check-in - Check-out <span className="text-destructive">*</span></Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !dateRange && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {dateRange?.from ? (
                                                    dateRange.to ? (
                                                        <>
                                                            {format(dateRange.from, "LLL dd, y")} -{" "}
                                                            {format(dateRange.to, "LLL dd, y")}
                                                        </>
                                                    ) : (
                                                        format(dateRange.from, "LLL dd, y")
                                                    )
                                                ) : (
                                                    <span>Pick a date range</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                initialFocus
                                                mode="range"
                                                defaultMonth={dateRange?.from}
                                                selected={dateRange}
                                                onSelect={setDateRange}
                                                numberOfMonths={2}
                                                disabled={{ before: new Date() }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-2">
                                    <Label>Special Requests</Label>
                                    <Textarea
                                        placeholder="E.g. Early check-in, Extra mattress..."
                                        value={specialRequests}
                                        onChange={(e) => setSpecialRequests(e.target.value)}
                                        className="resize-none"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Calculations & Confirmation */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-6 border-2 border-primary/20 shadow-lg">
                            <CardHeader className="bg-muted/40 pb-4">
                                <CardTitle className="text-lg">Stay Summary</CardTitle>
                                <CardDescription>
                                    {nights > 0 ? `${nights} Night(s) Stay • ${adults}A, ${children}C` : "Select dates to calculate"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                {selectedProperty ? (
                                    <div className="space-y-1">
                                        <p className="font-medium text-sm">Property</p>
                                        <p className="text-muted-foreground text-sm">
                                            {propertiesList?.find(p => p.name === selectedProperty)?.property_name}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="p-3 border border-dashed rounded text-sm text-center text-muted-foreground">
                                        Select a property to view details
                                    </div>
                                )}

                                <Separator />

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Room Rate (x{nights})</span>
                                        <span>₹{totalRoomParams.toLocaleString("en-IN")}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Taxes & Fees (18%)</span>
                                        <span>₹{gstAmount.toLocaleString("en-IN")}</span>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span className="text-primary">₹{totalWithGST.toLocaleString("en-IN")}</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-muted/40 pt-6">
                                <Button
                                    className="w-full h-11 text-base"
                                    onClick={handleSubmit}
                                    disabled={!guestName || !selectedProperty || !dateRange?.from || !dateRange?.to || creating}
                                >
                                    {creating ? "Processing..." : "Confirm Booking"}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    )
}
