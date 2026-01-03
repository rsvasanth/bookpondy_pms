"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    CalendarIcon,
    Phone,
    Mail,
    Building2,
    Sparkles,
    User,
    CheckCircle2,
    Upload,
    CreditCard,
    LayoutGrid,
    ChevronLeft
} from "lucide-react"
import { format, differenceInDays } from "date-fns"
import { cn } from "@/lib/utils"
import { useFrappeFileUpload } from "frappe-react-sdk"
import { useLocalDocList, useLocalCreate } from "@/hooks/use-local-data"
import { toast } from "sonner"

const bookingSchema = z.object({
    guestName: z.string().min(2, "Name must be at least 2 characters"),
    guestEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
    guestPhone: z.string().min(10, "Phone number must be at least 10 digits"),
    guestIdNumber: z.string().optional(),
    selectedProperty: z.string().min(1, "Please select a property"),
    selectedCategory: z.string().min(1, "Please select a room category"),
    selectedUnit: z.string().optional(),
    dateRange: z.object({
        from: z.date({ required_error: "Check-in date is required" }),
        to: z.date({ required_error: "Check-out date is required" }),
    }),
    adults: z.string().default("2"),
    children: z.string().default("0"),
    bookingSource: z.string().default("Direct"),
    selectedChannel: z.string().optional(),
    otaBookingId: z.string().optional(),
    specialRequests: z.string().optional(),
})

type BookingFormValues = z.infer<typeof bookingSchema>

export default function CreateBookingPage() {
    const navigate = useNavigate()
    const { create: createLocalDoc, isCreating: creating } = useLocalCreate()
    const { upload, loading: uploadLoading } = useFrappeFileUpload()
    const [guestIdUrl, setGuestIdUrl] = useState("")

    const form = useForm<BookingFormValues>({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            guestName: "",
            guestEmail: "",
            guestPhone: "",
            guestIdNumber: "",
            selectedProperty: "",
            selectedCategory: "",
            selectedUnit: " ",
            adults: "2",
            children: "0",
            bookingSource: "Direct",
            specialRequests: "",
        },
    })

    const { watch, setValue } = form
    const selectedProperty = watch("selectedProperty")
    const selectedCategory = watch("selectedCategory")
    const bookingSource = watch("bookingSource")
    const dateRange = watch("dateRange")
    const guestPhone = watch("guestPhone")
    const guestEmail = watch("guestEmail")

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

    // Reset downstream selections when upstream changes
    useEffect(() => {
        setValue("selectedCategory", "")
        setValue("selectedUnit", " ")
    }, [selectedProperty, setValue])

    useEffect(() => {
        setValue("selectedUnit", " ")
    }, [selectedCategory, setValue])

    // Calculations
    const nights = dateRange?.from && dateRange?.to ? differenceInDays(dateRange.to, dateRange.from) : 0
    const selectedCategoryData = unitCategoriesList?.find(uc => uc.name === selectedCategory)
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

    const onSubmit = async (values: BookingFormValues) => {
        try {
            let guestId = guestsList?.[0]?.name

            // 1. Upsert Guest locally
            if (!guestId) {
                const newGuest = await createLocalDoc("Guest", {
                    guest_name: values.guestName,
                    email: values.guestEmail,
                    phone: values.guestPhone,
                    naming_series: "GST-.YYYY.-.#####"
                })
                guestId = newGuest.name
            }

            // 2. Create Reservation locally
            await createLocalDoc("Reservation", {
                naming_series: "RES-.YYYY.-.#####",
                property: values.selectedProperty,
                guest: guestId,
                guest_name: values.guestName,
                guest_email: values.guestEmail,
                guest_phone: values.guestPhone,
                unit_category: values.selectedCategory,
                allocated_unit: values.selectedUnit === " " ? undefined : values.selectedUnit,
                check_in_date: format(values.dateRange.from, "yyyy-MM-dd"),
                check_out_date: format(values.dateRange.to, "yyyy-MM-dd"),
                nights: nights,
                adults: parseInt(values.adults) || 1,
                children: parseInt(values.children) || 0,
                number_of_guests: (parseInt(values.adults) || 0) + (parseInt(values.children) || 0),
                guest_id_number: values.guestIdNumber,
                guest_id_image: guestIdUrl,
                special_requests: values.specialRequests,
                room_rate_per_night: baseRate,
                total_amount: totalWithGST,
                reservation_status: "Confirmed",
                reservation_source: values.bookingSource,
                source_channel: values.bookingSource === "OTA" ? values.selectedChannel : undefined,
                marketplace_booking_id: values.bookingSource === "OTA" ? values.otaBookingId : undefined
            })

            toast.success("Booking created successfully!")
            navigate("/bookings")
        } catch (e: any) {
            console.error("Failed to create booking:", e)
            toast.error(e.message || "Failed to create booking")
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 pb-12 px-6">
                {/* Header Area */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/50 pb-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
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
                            <h1 className="text-xl font-semibold tracking-tight text-foreground">
                                Create New Reservation
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-9 px-4 rounded-md text-sm font-medium border-border/50 bg-background hover:bg-muted transition-all"
                            onClick={() => navigate("/bookings")}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="h-9 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm gap-2 rounded-md shadow-lg shadow-primary/10 transition-all active:scale-95"
                            disabled={creating}
                        >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {creating ? "Saving..." : "Create Booking"}
                        </Button>
                    </div>
                </div>

                {/* 4-Column Dense Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">

                    {/* Column 1: Guest Information */}
                    <div className="space-y-4">
                        <div className="bg-muted/30 p-2.5 rounded-t-lg border-b border-border/50">
                            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Guest Information
                            </span>
                        </div>
                        <Card className="border-border/50 shadow-sm bg-card overflow-hidden">
                            <CardContent className="p-4 space-y-4">
                                <FormField
                                    control={form.control}
                                    name="guestName"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-xs font-semibold text-muted-foreground/70">Legal Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter full name" className="h-9 bg-background border-border text-sm" {...field} />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="guestPhone"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-xs font-semibold text-muted-foreground/70">Mobile Number</FormLabel>
                                            <div className="relative">
                                                <Phone className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground/40" />
                                                <FormControl>
                                                    <Input placeholder="+91 XXXXX XXXXX" className="h-9 pl-9 bg-background border-border text-sm" {...field} />
                                                </FormControl>
                                            </div>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="guestEmail"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-xs font-semibold text-muted-foreground/70">Email Address</FormLabel>
                                            <div className="relative">
                                                <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground/40" />
                                                <FormControl>
                                                    <Input type="email" placeholder="guest@domain.com" className="h-9 pl-9 bg-background border-border text-sm" {...field} />
                                                </FormControl>
                                            </div>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="guestIdNumber"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5 pt-2">
                                            <FormLabel className="text-xs font-semibold text-muted-foreground/70">ID Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Aadhar / Passport #" className="h-9 bg-background border-border text-sm" {...field} />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
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
                                                        "h-9 w-full flex items-center justify-center gap-2 border border-border bg-background rounded-md cursor-pointer hover:bg-muted transition-all text-xs font-semibold shadow-sm",
                                                        uploadLoading && "opacity-50 cursor-not-allowed",
                                                        guestIdUrl && "border-success/30 bg-success/5 text-success"
                                                    )}
                                                >
                                                    {uploadLoading ? <Sparkles className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                                                    {guestIdUrl ? "ID Attached" : "Upload Proof"}
                                                </Label>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Column 2: Stay Control */}
                    <div className="space-y-4">
                        <div className="bg-muted/30 p-2.5 rounded-t-lg border-b border-border/50">
                            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                Stay Details
                            </span>
                        </div>
                        <Card className="border-border/50 shadow-sm bg-card overflow-hidden">
                            <CardContent className="p-4 space-y-4">
                                <FormField
                                    control={form.control}
                                    name="selectedProperty"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-xs font-semibold text-muted-foreground/70">Property</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-9 bg-background border-border text-sm">
                                                        <SelectValue placeholder="Select Property" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {propertiesList?.map(p => (
                                                        <SelectItem key={p.name} value={p.name} className="text-sm font-medium">{p.property_name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="selectedCategory"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-xs font-semibold text-muted-foreground/70">Room Category</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={!selectedProperty}>
                                                <FormControl>
                                                    <SelectTrigger className="h-9 bg-background border-border text-sm">
                                                        <SelectValue placeholder="Select Category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {unitCategoriesList?.map(c => (
                                                        <SelectItem key={c.name} value={c.name} className="text-sm font-medium">{c.category_name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="selectedUnit"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-xs font-semibold text-muted-foreground/70">Unit Assignment</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={!selectedCategory}>
                                                <FormControl>
                                                    <SelectTrigger className="h-9 bg-background border-border text-sm">
                                                        <SelectValue placeholder="Automatic Allocation" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value=" " className="text-sm font-medium">Any Available</SelectItem>
                                                    {unitsList?.map(u => (
                                                        <SelectItem key={u.name} value={u.name} className="text-sm font-medium">{u.unit_no} • {u.status}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="dateRange"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5 pt-2">
                                            <FormLabel className="text-xs font-semibold text-muted-foreground/70">Stay Dates</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                "w-full h-9 justify-start text-left font-medium text-sm bg-background border-border shadow-sm transition-all hover:bg-muted px-3",
                                                                !field.value && "text-muted-foreground/40"
                                                            )}
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                                                            {field.value?.from ? (
                                                                field.value.to ? (
                                                                    <>{format(field.value.from, "MMM dd")} — {format(field.value.to, "MMM dd")}</>
                                                                ) : (
                                                                    format(field.value.from, "MMM dd")
                                                                )
                                                            ) : (
                                                                <span>Pick Dates</span>
                                                            )}
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0 border-border/50 shadow-2xl" align="start">
                                                    <Calendar
                                                        initialFocus
                                                        mode="range"
                                                        defaultMonth={field.value?.from || new Date()}
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        numberOfMonths={2}
                                                        disabled={{ before: new Date() }}
                                                        className="rounded-md border-none"
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Column 3: Engine Context */}
                    <div className="space-y-4">
                        <div className="bg-muted/30 p-2.5 rounded-t-lg border-b border-border/50">
                            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                                <LayoutGrid className="h-4 w-4" />
                                Engine Settings
                            </span>
                        </div>
                        <Card className="border-border/50 shadow-sm bg-card overflow-hidden">
                            <CardContent className="p-4 space-y-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <FormField
                                        control={form.control}
                                        name="adults"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5 focus-within:z-10">
                                                <FormLabel className="text-xs font-semibold text-muted-foreground/70">Adults</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-9 bg-background border-border text-sm">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {[1, 2, 3, 4, 5, 6].map(n => (
                                                            <SelectItem key={n} value={n.toString()} className="text-sm font-medium">{n}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="children"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5 focus-within:z-10">
                                                <FormLabel className="text-xs font-semibold text-muted-foreground/70">Kids</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-9 bg-background border-border text-sm">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {[0, 1, 2, 3, 4].map(n => (
                                                            <SelectItem key={n} value={n.toString()} className="text-sm font-medium">{n}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="bookingSource"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-xs font-semibold text-muted-foreground/70">Booking Source</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-9 bg-background border-border text-sm">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Direct" className="text-sm font-medium">Direct Booking</SelectItem>
                                                    <SelectItem value="OTA" className="text-sm font-medium">Marketplace (OTA)</SelectItem>
                                                    <SelectItem value="Agent" className="text-sm font-medium">Travel Agent</SelectItem>
                                                    <SelectItem value="Walk-in" className="text-sm font-medium">Walk-in</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                                {bookingSource === "OTA" && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <FormField
                                            control={form.control}
                                            name="selectedChannel"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1.5">
                                                    <FormLabel className="text-xs font-semibold text-muted-foreground/70">Source Channel</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-9 bg-background border-border text-sm">
                                                                <SelectValue placeholder="Select Channel" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {channelsList?.map(c => (
                                                                <SelectItem key={c.name} value={c.name} className="text-sm font-medium">{c.channel_name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="otaBookingId"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1.5">
                                                    <FormLabel className="text-xs font-semibold text-muted-foreground/70">OTA Booking ID</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="BK-XXXXXX" className="h-9 bg-background border-border text-sm" {...field} />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}
                                <FormField
                                    control={form.control}
                                    name="specialRequests"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5 pt-2">
                                            <FormLabel className="text-xs font-semibold text-muted-foreground/70">Special Requests</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Add any guest requirements..."
                                                    className="min-h-[80px] bg-background border-border text-sm leading-relaxed resize-none focus:ring-1 focus:ring-primary/20"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Column 4: Audit & Finalization */}
                    <div className="space-y-4">
                        <div className="bg-primary/5 p-2.5 rounded-t-lg border-b border-primary/20">
                            <span className="text-xs font-semibold text-primary flex items-center gap-2">
                                <CreditCard className="h-3.5 w-3.5" />
                                Summary & Push
                            </span>
                        </div>
                        <Card className="border-primary/20 bg-primary/[0.02] shadow-sm">
                            <CardContent className="p-4 space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs font-semibold">
                                        <span className="text-muted-foreground">Stay Analysis</span>
                                        <span className="text-primary">{nights} Night(s)</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-medium opacity-80">
                                        <span>Base Amount</span>
                                        <span>₹{totalRoomParams.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-medium opacity-80">
                                        <span>Tax (GST 18%)</span>
                                        <span>₹{gstAmount.toLocaleString()}</span>
                                    </div>
                                    <Separator className="bg-primary/10" />
                                    <div className="flex justify-between items-end pt-1">
                                        <div className="space-y-0.5">
                                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Total Quote</span>
                                            <div className="text-2xl font-bold text-primary tracking-tight">₹{totalWithGST.toLocaleString()}</div>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] font-semibold uppercase border-primary/20 bg-primary/5 text-primary mb-1">
                                            Provisional
                                        </Badge>
                                    </div>
                                </div>

                                <Separator className="bg-primary/10" />

                                <div className="space-y-2">
                                    <div className="p-2.5 rounded-md bg-success/5 border border-success/10 flex gap-2 items-center">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                                        <span className="text-xs font-semibold text-success tracking-tight">Ready for review</span>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm gap-2 rounded-md shadow-lg shadow-primary/20 transition-all active:scale-95 mt-2"
                                        disabled={creating}
                                    >
                                        {creating ? "Processing..." : "Confirm Reservation"}
                                    </Button>

                                    <p className="text-[7px] font-bold text-muted-foreground uppercase text-center opacity-40 leading-tight pt-1">
                                        Clicking commit will broadcast this <br /> reservation across all linked nodes.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Meta Diagnostics */}
                        <div className="p-3 bg-muted/20 border border-border/50 rounded-md space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-medium text-muted-foreground">
                                <span>SESSION ID</span>
                                <span className="font-mono">{Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-medium text-muted-foreground">
                                <span>STATUS</span>
                                <span className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                                    <span className="text-success font-semibold">CONNECTED</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </Form>
    )
}
