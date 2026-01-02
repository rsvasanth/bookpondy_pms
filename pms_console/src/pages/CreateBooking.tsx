"use client"

import React, { useState } from "react"
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
    Upload,
    Globe,
    CreditCard,
    AlertCircle,
    Users2,
    Clock,
    LayoutGrid,
    ChevronLeft
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
    // Fallback logic for rate if not strictly defined in category
    const baseRate = selectedCategoryData?.base_rate_per_night || 0
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
                guest_name: guestName,
                guest_email: guestEmail,
                guest_phone: guestPhone,
                unit_category: selectedCategory,
                allocated_unit: selectedUnit,
                check_in_date: format(dateRange.from, "yyyy-MM-dd"),
                check_out_date: format(dateRange.to, "yyyy-MM-dd"),
                nights: nights,
                adults: parseInt(adults) || 1,
                children: parseInt(children) || 0,
                number_of_guests: (parseInt(adults) || 0) + (parseInt(children) || 0),
                guest_id_number: guestIdNumber,
                guest_id_image: guestIdUrl,
                special_requests: specialRequests,
                room_rate_per_night: baseRate,
                total_amount: totalWithGST,
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
        <div className="flex flex-col gap-6 pb-12 px-6">
            {/* Header Area */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-lg border-border/50 bg-background/50 shadow-sm hover:bg-muted"
                            onClick={() => navigate("/bookings")}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Sparkles className="h-4 w-4 text-primary" />
                        </div>
                        <h1 className="text-xl font-black tracking-tight text-foreground uppercase">
                            New Reservation
                        </h1>
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] decoration-primary/30 underline-offset-4 decoration-2">
                        Booking Engine • Creation Terminal • <span className="font-mono opacity-50">v2.1.0</span>
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 px-4 rounded-md text-[10px] font-black uppercase tracking-widest border-border/50 bg-background/50 shadow-sm hover:bg-muted transition-all"
                        onClick={() => navigate("/bookings")}
                    >
                        Discard Changes
                    </Button>
                    <Button
                        className="h-9 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[10px] uppercase tracking-[0.2em] gap-2 rounded-md shadow-lg shadow-primary/10 transition-all active:scale-95"
                        onClick={handleSubmit}
                        disabled={creating || !guestName || !selectedProperty || !dateRange?.from}
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        {creating ? "PROCESSING..." : "FINALIZE RESERVATION"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Form Sections */}
                <div className="lg:col-span-8 flex flex-col gap-6">

                    {/* Component 1: Guest Master Profile */}
                    <Card className="border-border/50 shadow-sm bg-card/40 backdrop-blur-md overflow-hidden">
                        <CardHeader className="pb-3 border-b border-border/50 p-4 bg-muted/20">
                            <CardTitle className="text-[10px] font-black text-muted-foreground flex items-center gap-2 uppercase tracking-[0.2em]">
                                <div className="w-6 h-6 rounded-md flex items-center justify-center bg-background border border-border/50 text-foreground shadow-sm">
                                    <User className="h-3.5 w-3.5" />
                                </div>
                                <span>Guest Master Profile</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">Legal Guest Name <span className="text-destructive">*</span></Label>
                                    <Input
                                        placeholder="Enter full name"
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                        className="h-10 bg-background/50 border-border/50 focus:border-primary/50 text-[11px] font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">Booking Source</Label>
                                    <Select value={bookingSource} onValueChange={setBookingSource}>
                                        <SelectTrigger className="h-10 bg-background/50 border-border/50 text-[11px] font-bold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Direct">DIRECT BOOKING</SelectItem>
                                            <SelectItem value="OTA">MARKETPLACE (OTA)</SelectItem>
                                            <SelectItem value="Agent">TRAVEL AGENT</SelectItem>
                                            <SelectItem value="Walk-in">WALK-IN GUEST</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">Email Communication</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/40" />
                                        <Input
                                            type="email"
                                            placeholder="guest@domain.com"
                                            className="h-10 pl-10 bg-background/50 border-border/50 text-[11px] font-bold"
                                            value={guestEmail}
                                            onChange={(e) => setGuestEmail(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">Contact Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/40" />
                                        <Input
                                            placeholder="+91 XXXXX XXXXX"
                                            className="h-10 pl-10 bg-background/50 border-border/50 text-[11px] font-bold"
                                            value={guestPhone}
                                            onChange={(e) => setGuestPhone(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {bookingSource === "OTA" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">Channel Name</Label>
                                        <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                                            <SelectTrigger className="h-10 bg-background/50 border-border/50 text-[11px] font-bold">
                                                <SelectValue placeholder="Select OTA" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {channelsList?.map(c => (
                                                    <SelectItem key={c.name} value={c.name}>{c.channel_name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">Marketplace ID</Label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/40" />
                                            <Input
                                                placeholder="e.g. BK-987123"
                                                className="h-10 pl-10 bg-background/50 border-border/50 text-[11px] font-bold"
                                                value={otaBookingId}
                                                onChange={(e) => setOtaBookingId(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 border-t border-border/30">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70 block mb-3">Identity Validation</Label>
                                <div className="flex flex-col md:flex-row gap-4 items-start">
                                    <Input
                                        placeholder="Aadhar / Passport / Voter ID Number"
                                        className="h-10 bg-background/50 border-border/50 text-[11px] font-bold flex-1"
                                        value={guestIdNumber}
                                        onChange={(e) => setGuestIdNumber(e.target.value)}
                                    />
                                    <div className="shrink-0 w-full md:w-auto">
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
                                                "h-10 px-6 flex items-center justify-center gap-2 border border-border/50 bg-background/50 rounded-md cursor-pointer hover:bg-muted transition-all text-[10px] font-black uppercase tracking-widest shadow-sm",
                                                uploadLoading && "opacity-50 cursor-not-allowed",
                                                guestIdUrl && "border-emerald-500/30 bg-emerald-500/5 text-emerald-600"
                                            )}
                                        >
                                            {uploadLoading ? <Sparkles className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                                            {guestIdUrl ? "ID ATTACHED" : "UPLOAD PROOF"}
                                        </Label>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Component 2: Logic Control & Logistics */}
                    <Card className="border-border/50 shadow-sm bg-card/40 backdrop-blur-md overflow-hidden">
                        <CardHeader className="pb-3 border-b border-border/50 p-4 bg-muted/20">
                            <CardTitle className="text-[10px] font-black text-muted-foreground flex items-center gap-2 uppercase tracking-[0.2em]">
                                <div className="w-6 h-6 rounded-md flex items-center justify-center bg-background border border-border/50 text-foreground shadow-sm">
                                    <Building2 className="h-3.5 w-3.5" />
                                </div>
                                <span>Stay Logic Controls</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-8">

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">Property & Asset Mapping</Label>
                                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tight opacity-50">Manual Override</Badge>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/50">Property</Label>
                                        <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                                            <SelectTrigger className="h-9 bg-background/50 border-border/50 text-[10px] font-black">
                                                <SelectValue placeholder="Target" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {propertiesList?.map(p => (
                                                    <SelectItem key={p.name} value={p.name} className="text-[10px] font-bold">{p.property_name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/50">Category</Label>
                                        <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={!selectedProperty}>
                                            <SelectTrigger className="h-9 bg-background/50 border-border/50 text-[10px] font-black">
                                                <SelectValue placeholder="Layout" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {unitCategoriesList?.map(c => (
                                                    <SelectItem key={c.name} value={c.name} className="text-[10px] font-bold">{c.category_name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/50">Specific Unit</Label>
                                        <Select value={selectedUnit} onValueChange={setSelectedUnit} disabled={!selectedCategory}>
                                            <SelectTrigger className="h-9 bg-background/50 border-border/50 text-[10px] font-black">
                                                <SelectValue placeholder="Auto" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value=" " className="text-[10px] font-bold">ANY AVAILABLE</SelectItem>
                                                {unitsList?.map(u => (
                                                    <SelectItem key={u.name} value={u.name} className="text-[10px] font-bold">{u.unit_no} ({u.status})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-border/30" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70 block">Stay Schedule</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full h-11 justify-start text-left font-black text-[11px] uppercase tracking-wider bg-background/50 border-border/50 shadow-sm transition-all hover:bg-muted",
                                                    !dateRange && "text-muted-foreground/40 font-bold"
                                                )}
                                            >
                                                <CalendarIcon className="mr-3 h-4 w-4 text-primary" />
                                                {dateRange?.from ? (
                                                    dateRange.to ? (
                                                        <>
                                                            {format(dateRange.from, "MMM dd, yy")} — {format(dateRange.to, "MMM dd, yy")}
                                                        </>
                                                    ) : (
                                                        format(dateRange.from, "MMM dd, yyyy")
                                                    )
                                                ) : (
                                                    <span>Sync Dates</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 border-border/50 shadow-2xl" align="start">
                                            <Calendar
                                                initialFocus
                                                mode="range"
                                                defaultMonth={dateRange?.from || new Date()}
                                                selected={dateRange}
                                                onSelect={setDateRange}
                                                numberOfMonths={2}
                                                disabled={{ before: new Date() }}
                                                className="rounded-md border-none"
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70 block">Occupancy Load</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Select value={adults} onValueChange={setAdults}>
                                            <SelectTrigger className="h-11 bg-background/50 border-border/50 text-[11px] font-black uppercase tracking-widest">
                                                <div className="flex items-center gap-2">
                                                    <Users2 className="h-3.5 w-3.5 opacity-40" />
                                                    <SelectValue />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                                                    <SelectItem key={n} value={n.toString()} className="text-[10px] font-bold">{n} ADULTS</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Select value={children} onValueChange={setChildren}>
                                            <SelectTrigger className="h-11 bg-background/50 border-border/50 text-[11px] font-black uppercase tracking-widest">
                                                <div className="flex items-center gap-2">
                                                    <Sparkles className="h-3.5 w-3.5 opacity-40" />
                                                    <SelectValue />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[0, 1, 2, 3, 4, 5].map(n => (
                                                    <SelectItem key={n} value={n.toString()} className="text-[10px] font-bold">{n} KIDS</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-border/30" />

                            <div className="space-y-4">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70 block">Internal Operations Memo</Label>
                                <Textarea
                                    placeholder="Add housekeeping notes or special requests..."
                                    className="min-h-[100px] bg-background/50 border-border/50 text-[11px] font-medium leading-relaxed resize-none focus:ring-1 focus:ring-primary/20"
                                    value={specialRequests}
                                    onChange={(e) => setSpecialRequests(e.target.value)}
                                />
                            </div>

                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar: Stay Summary */}
                <div className="lg:col-span-4 flex flex-col gap-6 sticky top-6">
                    <Card className="border-primary/20 shadow-xl bg-primary/[0.02] backdrop-blur-sm overflow-hidden border-2">
                        <CardHeader className="bg-primary/5 pb-4 border-b border-primary/10">
                            <CardTitle className="text-[10px] font-black text-primary flex items-center gap-2 uppercase tracking-[0.2em]">
                                <LayoutGrid className="h-4 w-4" />
                                Stay Engine Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">

                            {/* Visual Timeline */}
                            <div className="flex border rounded-lg overflow-hidden bg-background/40">
                                <div className="flex-1 p-3 border-r border-border/50 flex flex-col items-center">
                                    <span className="text-[8px] font-black text-muted-foreground opacity-50 uppercase mb-1">CHECK-IN</span>
                                    <span className="text-[10px] font-black">{dateRange?.from ? format(dateRange.from, "MMM dd") : "—"}</span>
                                </div>
                                <div className="w-12 flex flex-col items-center justify-center bg-muted/30">
                                    <Clock className="h-3 w-3 text-muted-foreground opacity-30" />
                                    <span className="text-[9px] font-black text-primary">{nights}N</span>
                                </div>
                                <div className="flex-1 p-3 flex flex-col items-center">
                                    <span className="text-[8px] font-black text-muted-foreground opacity-50 uppercase mb-1">CHECK-OUT</span>
                                    <span className="text-[10px] font-black">{dateRange?.to ? format(dateRange.to, "MMM dd") : "—"}</span>
                                </div>
                            </div>

                            {/* Detailed Stats */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-[11px] font-bold group">
                                    <span className="text-muted-foreground uppercase tracking-widest text-[9px]">Rate Tier</span>
                                    <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[9px] font-black py-0 h-5">
                                        {selectedCategoryData?.category_name || "NOT SELECTED"}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-bold">
                                    <span className="text-muted-foreground/60 uppercase tracking-widest text-[9px]">Base Tariff</span>
                                    <span className="tracking-tight text-foreground font-black">₹{baseRate.toLocaleString()} <span className="text-[8px] opacity-40">/ NIGHT</span></span>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-bold">
                                    <span className="text-muted-foreground/60 uppercase tracking-widest text-[9px]">Subtotal ({nights}N)</span>
                                    <span className="tracking-tight text-foreground font-black">₹{totalRoomParams.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-bold">
                                    <span className="text-muted-foreground/60 uppercase tracking-widest text-[9px]">Tax Analysis (18%)</span>
                                    <span className="tracking-tight text-foreground font-black">₹{gstAmount.toLocaleString()}</span>
                                </div>

                                <Separator className="bg-primary/10" />

                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Total Quote</span>
                                        <span className="text-2xl font-black text-primary tracking-tighter">
                                            ₹{totalWithGST.toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-[8px] font-bold text-muted-foreground uppercase text-right opacity-50 tracking-widest">
                                        Includes taxes and marketplace fees
                                    </p>
                                </div>
                            </div>

                            {/* Warnings / Tips */}
                            {!selectedProperty && (
                                <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 flex gap-3 items-start">
                                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                                    <p className="text-[10px] font-bold text-amber-700/80 leading-relaxed uppercase tracking-tighter">
                                        Select a property and unit category to calculate stay quote.
                                    </p>
                                </div>
                            )}

                        </CardContent>
                        <CardFooter className="p-4 bg-primary/5 pt-0">
                            <Button
                                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-[10px] uppercase tracking-[0.2em] gap-3 rounded-md shadow-lg shadow-primary/20 transition-all active:scale-95"
                                onClick={handleSubmit}
                                disabled={creating || !guestName || !selectedProperty || !dateRange?.from}
                            >
                                <CreditCard className="h-4 w-4" />
                                {creating ? "INITIALIZING..." : "CONFIRM & CREATE"}
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Metadata Card */}
                    <Card className="border-border/50 shadow-sm bg-muted/10">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">System Diagnostics</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[8px] font-bold text-muted-foreground/50 uppercase">Timestamp</span>
                                <span className="text-[8px] font-black text-foreground uppercase">{format(new Date(), "HH:mm, MMM dd")}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[8px] font-bold text-muted-foreground/50 uppercase">Engine Status</span>
                                <Badge variant="outline" className="text-[7px] font-black text-emerald-600 border-emerald-500/20 bg-emerald-500/5 h-4 px-1.5 uppercase">Operational</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
