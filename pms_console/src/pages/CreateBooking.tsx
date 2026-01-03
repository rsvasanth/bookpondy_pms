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
        <div className="flex flex-col gap-4 pb-12 px-6">
            {/* Header Area */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/50 pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 rounded-md border-border/50 bg-background/50 shadow-sm hover:bg-muted"
                            onClick={() => navigate("/bookings")}
                        >
                            <ChevronLeft className="h-3.5 w-3.5" />
                        </Button>
                        <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <h1 className="text-lg font-black tracking-tight text-foreground uppercase">
                            Terminal: Create Reservation
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 rounded-md text-[9px] font-black uppercase tracking-widest border-border/50 bg-background/50 shadow-sm hover:bg-muted transition-all"
                        onClick={() => navigate("/bookings")}
                    >
                        Abort
                    </Button>
                    <Button
                        className="h-8 px-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[9px] uppercase tracking-[0.2em] gap-2 rounded-md shadow-lg shadow-primary/10 transition-all active:scale-95"
                        onClick={handleSubmit}
                        disabled={creating || !guestName || !selectedProperty || !dateRange?.from}
                    >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {creating ? "INITIALIZING..." : "EXECUTE BOOKING"}
                    </Button>
                </div>
            </div>

            {/* 4-Column Dense Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">

                {/* Column 1: Guest Identity */}
                <div className="space-y-4">
                    <div className="bg-muted/30 p-2 rounded-t-md border-b border-border/50">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                            <User className="h-3 w-3" />
                            01. Guest Identity
                        </span>
                    </div>
                    <Card className="border-border/50 shadow-none bg-card/40 backdrop-blur-md">
                        <CardContent className="p-4 space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">Legal Name</Label>
                                <Input
                                    placeholder="Enter full name"
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                    className="h-8 bg-background/50 border-border/50 text-[10px] font-bold"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">Mobile Reference</Label>
                                <div className="relative">
                                    <Phone className="absolute left-2.5 top-2.5 h-3 w-3 text-muted-foreground/40" />
                                    <Input
                                        placeholder="+91 XXXXX XXXXX"
                                        className="h-8 pl-8 bg-background/50 border-border/50 text-[10px] font-bold"
                                        value={guestPhone}
                                        onChange={(e) => setGuestPhone(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">Email Reference</Label>
                                <div className="relative">
                                    <Mail className="absolute left-2.5 top-2.5 h-3 w-3 text-muted-foreground/40" />
                                    <Input
                                        type="email"
                                        placeholder="guest@domain.com"
                                        className="h-8 pl-8 bg-background/50 border-border/50 text-[10px] font-bold"
                                        value={guestEmail}
                                        onChange={(e) => setGuestEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5 pt-2">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">ID Validation</Label>
                                <Input
                                    placeholder="Aadhar / Passport #"
                                    className="h-8 bg-background/50 border-border/50 text-[10px] font-bold"
                                    value={guestIdNumber}
                                    onChange={(e) => setGuestIdNumber(e.target.value)}
                                />
                                <div className="mt-2">
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
                                            "h-8 w-full flex items-center justify-center gap-2 border border-border/50 bg-background/50 rounded-md cursor-pointer hover:bg-muted transition-all text-[9px] font-black uppercase tracking-widest shadow-sm",
                                            uploadLoading && "opacity-50 cursor-not-allowed",
                                            guestIdUrl && "border-emerald-500/30 bg-emerald-500/5 text-emerald-600"
                                        )}
                                    >
                                        {uploadLoading ? <Sparkles className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                                        {guestIdUrl ? "ID ATTACHED" : "UPLOAD PROOF"}
                                    </Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Column 2: Stay Control */}
                <div className="space-y-4">
                    <div className="bg-muted/30 p-2 rounded-t-md border-b border-border/50">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                            <Building2 className="h-3 w-3" />
                            02. Stay Control
                        </span>
                    </div>
                    <Card className="border-border/50 shadow-none bg-card/40 backdrop-blur-md">
                        <CardContent className="p-4 space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">Property Asset</Label>
                                <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                                    <SelectTrigger className="h-8 bg-background/50 border-border/50 text-[10px] font-black uppercase">
                                        <SelectValue placeholder="Select Property" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {propertiesList?.map(p => (
                                            <SelectItem key={p.name} value={p.name} className="text-[10px] uppercase font-bold">{p.property_name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">Room Category</Label>
                                <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={!selectedProperty}>
                                    <SelectTrigger className="h-8 bg-background/50 border-border/50 text-[10px] font-black uppercase">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {unitCategoriesList?.map(c => (
                                            <SelectItem key={c.name} value={c.name} className="text-[10px] uppercase font-bold">{c.category_name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">Unit Assignment</Label>
                                <Select value={selectedUnit} onValueChange={setSelectedUnit} disabled={!selectedCategory}>
                                    <SelectTrigger className="h-8 bg-background/50 border-border/50 text-[10px] font-black uppercase">
                                        <SelectValue placeholder="Auto" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value=" " className="text-[10px] uppercase font-bold">ANY AVAILABLE</SelectItem>
                                        {unitsList?.map(u => (
                                            <SelectItem key={u.name} value={u.name} className="text-[10px] uppercase font-bold">{u.unit_no} • {u.status}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5 pt-2">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">Period Mapping</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full h-8 justify-start text-left font-black text-[10px] uppercase tracking-wider bg-background/50 border-border/50 shadow-sm transition-all hover:bg-muted px-2.5",
                                                !dateRange && "text-muted-foreground/40 font-bold"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-3 w-3 text-primary" />
                                            {dateRange?.from ? (
                                                dateRange.to ? (
                                                    <>{format(dateRange.from, "MMM dd")} — {format(dateRange.to, "MMM dd")}</>
                                                ) : (
                                                    format(dateRange.from, "MMM dd")
                                                )
                                            ) : (
                                                <span>Pick Dates</span>
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
                        </CardContent>
                    </Card>
                </div>

                {/* Column 3: Engine Context */}
                <div className="space-y-4">
                    <div className="bg-muted/30 p-2 rounded-t-md border-b border-border/50">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                            <LayoutGrid className="h-3 w-3" />
                            03. Engine Context
                        </span>
                    </div>
                    <Card className="border-border/50 shadow-none bg-card/40 backdrop-blur-md">
                        <CardContent className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">Adults</Label>
                                    <Select value={adults} onValueChange={setAdults}>
                                        <SelectTrigger className="h-8 bg-background/50 border-border/50 text-[10px] font-black">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[1, 2, 3, 4, 5, 6].map(n => (
                                                <SelectItem key={n} value={n.toString()} className="text-[10px] font-bold">{n}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">Kids</Label>
                                    <Select value={children} onValueChange={setChildren}>
                                        <SelectTrigger className="h-8 bg-background/50 border-border/50 text-[10px] font-black">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[0, 1, 2, 3, 4].map(n => (
                                                <SelectItem key={n} value={n.toString()} className="text-[10px] font-bold">{n}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">Origin Path</Label>
                                <Select value={bookingSource} onValueChange={setBookingSource}>
                                    <SelectTrigger className="h-8 bg-background/50 border-border/50 text-[10px] font-black uppercase">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Direct" className="text-[10px] uppercase font-bold">Direct Engine</SelectItem>
                                        <SelectItem value="OTA" className="text-[10px] uppercase font-bold">Marketplace (OTA)</SelectItem>
                                        <SelectItem value="Agent" className="text-[10px] uppercase font-bold">Channel Partner</SelectItem>
                                        <SelectItem value="Walk-in" className="text-[10px] uppercase font-bold">On-site Terminal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {bookingSource === "OTA" && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-1.5">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">Source Channel</Label>
                                        <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                                            <SelectTrigger className="h-8 bg-background/50 border-border/50 text-[10px] font-black uppercase">
                                                <SelectValue placeholder="Select Channel" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {channelsList?.map(c => (
                                                    <SelectItem key={c.name} value={c.name} className="text-[10px] uppercase font-bold">{c.channel_name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">Marketplace Reference</Label>
                                        <Input
                                            placeholder="BK-XXXXXX"
                                            className="h-8 bg-background/50 border-border/50 text-[10px] font-bold"
                                            value={otaBookingId}
                                            onChange={(e) => setOtaBookingId(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="space-y-1.5 pt-2">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">Control Memos</Label>
                                <Textarea
                                    placeholder="Add operational notes..."
                                    className="min-h-[70px] bg-background/50 border-border/50 text-[10px] font-bold leading-tight resize-none focus:ring-1 focus:ring-primary/20"
                                    value={specialRequests}
                                    onChange={(e) => setSpecialRequests(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Column 4: Audit & Finalization */}
                <div className="space-y-4">
                    <div className="bg-primary/5 p-2 rounded-t-md border-b border-primary/20">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                            <CreditCard className="h-3 w-3" />
                            04. Audit & Push
                        </span>
                    </div>
                    <Card className="border-primary/20 bg-primary/[0.02] backdrop-blur-md shadow-lg shadow-primary/5">
                        <CardContent className="p-4 space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-muted-foreground">Stay Analysis</span>
                                    <span className="text-primary">{nights} Ni(s)</span>
                                </div>
                                <div className="flex justify-between items-center text-[9px] font-bold opacity-60">
                                    <span className="uppercase">Base Logistics</span>
                                    <span>₹{totalRoomParams.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-[9px] font-bold opacity-60">
                                    <span className="uppercase">Tax Engine (18%)</span>
                                    <span>₹{gstAmount.toLocaleString()}</span>
                                </div>
                                <Separator className="bg-primary/10" />
                                <div className="flex justify-between items-end pt-1">
                                    <div className="space-y-0.5">
                                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none">Total Quote</span>
                                        <div className="text-xl font-black text-primary tracking-tighter">₹{totalWithGST.toLocaleString()}</div>
                                    </div>
                                    <Badge variant="outline" className="text-[7px] font-black uppercase border-primary/20 bg-primary/5 text-primary mb-1">
                                        PROVISIONAL
                                    </Badge>
                                </div>
                            </div>

                            <Separator className="bg-primary/10" />

                            <div className="space-y-2">
                                <div className="p-2 rounded-md bg-emerald-500/5 border border-emerald-500/10 flex gap-2 items-center">
                                    <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                                    <span className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter">System Ready for Push</span>
                                </div>

                                <Button
                                    className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-[10px] uppercase tracking-[0.2em] gap-2 rounded-md shadow-lg shadow-primary/20 transition-all active:scale-95 mt-2"
                                    onClick={handleSubmit}
                                    disabled={creating || !guestName || !selectedProperty || !dateRange?.from}
                                >
                                    {creating ? "EXECUTING..." : "COMMIT RESERVATION"}
                                </Button>

                                <p className="text-[7px] font-bold text-muted-foreground uppercase text-center opacity-40 leading-tight pt-1">
                                    Clicking commit will broadcast this <br /> reservation across all linked nodes.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Meta Diagnostics */}
                    <div className="p-3 bg-muted/20 border border-border/50 rounded-md space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-[7px] font-black text-muted-foreground/50 uppercase">Session ID</span>
                            <span className="text-[7px] font-mono text-foreground/40 uppercase">BK-{Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[7px] font-black text-muted-foreground/50 uppercase">Terminal Status</span>
                            <span className="flex items-center gap-1">
                                <span className="w-1 h-1 bg-emerald-500 rounded-full" />
                                <span className="text-[7px] font-black text-emerald-600 uppercase">Online</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
