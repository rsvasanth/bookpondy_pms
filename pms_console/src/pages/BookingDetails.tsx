import React, { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useLocalDoc, useLocalMutation, useLocalDocList, useLocalCreate } from "@/hooks/use-local-data"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { GuestChatPanel } from "@/components/GuestChatPanel"
import { cn, safeFormatDate } from "@/lib/utils"
import { DashboardStatsCard } from "@/components/dashboard/dashboard-stats-card"
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    CreditCard,
    Mail,
    Phone,
    Shield,
    User,
    Home,
    AlertTriangle,
    FileText,
    Building2,
    Banknote,
    Activity,
    LogOut
} from "lucide-react"
import { CheckInDialog } from "@/components/bookings/check-in-dialog"
import { CheckOutDialog } from "@/components/bookings/check-out-dialog"

export default function BookingDetailsPage() {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const { data: booking, isLoading } = useLocalDoc("Reservation", id!)
    const { mutate } = useLocalMutation()

    const [checkInOpen, setCheckInOpen] = useState(false)
    const [checkOutOpen, setCheckOutOpen] = useState(false)

    // Chat Logic
    const { data: queries } = useLocalDocList('Guest Query', { selector: { reservation: id } })
    const { create: createQuery } = useLocalCreate()

    const handleSendMessage = (msg: string) => {
        if (!msg.trim()) return

        if (!booking.guest) {
            alert("Cannot log query: Guest information is missing. Please wait for sync to complete.")
            return
        }

        createQuery('Guest Query', {
            reservation: id,
            guest: booking.guest,
            query_text: msg,
            status: 'Open',
            query_date: new Date().toISOString()
        })
    }

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!booking) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <h2 className="text-xl font-bold">Booking Not Found</h2>
                <Button onClick={() => navigate("/bookings")}>Back to Bookings</Button>
            </div>
        )
    }

    const isPaid = ["Received", "Refunded"].includes(booking?.payment_status)
    const paidAmount = isPaid ? booking?.total_amount : (booking?.advance_paid || 0)
    const dueAmount = (booking?.total_amount || 0) - (paidAmount || 0)
    const paymentProgress = booking?.total_amount > 0 ? (paidAmount / booking.total_amount) * 100 : 0

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
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        <h1 className="text-xl font-semibold tracking-tight text-foreground">
                            {booking.guest_name}
                        </h1>
                        <Badge className={cn(
                            "text-xs font-semibold px-2 py-0.5 rounded-md border shadow-none",
                            booking.reservation_status === "Confirmed" ? "bg-success text-white" :
                                booking.reservation_status === "Checked-In" ? "bg-info text-white" :
                                    "bg-muted text-muted-foreground border-border"
                        )}>
                            {booking.reservation_status}
                        </Badge>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                        Reservation Details • <span className="font-mono opacity-50">{booking.name}</span>
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 px-4 rounded-md text-xs font-semibold border-border bg-background shadow-sm hover:bg-muted transition-all"
                    >
                        <Mail className="mr-2 h-3.5 w-3.5" /> Send Confirmation
                    </Button>
                    <Button
                        className={cn(
                            "h-9 px-4 font-semibold text-xs gap-2 rounded-md shadow-lg transition-all active:scale-95",
                            booking.reservation_status === "Confirmed" ? "bg-success hover:bg-success/90 text-white shadow-success/10" :
                                booking.reservation_status === "Checked-In" ? "bg-error hover:bg-error/90 text-white shadow-error/10" : "bg-primary"
                        )}
                        onClick={() => {
                            if (booking.reservation_status === "Confirmed") setCheckInOpen(true)
                            else if (booking.reservation_status === "Checked-In") setCheckOutOpen(true)
                        }}
                    >
                        {booking.reservation_status === "Confirmed" ? (
                            <>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Check-in Guest
                            </>
                        ) : booking.reservation_status === "Checked-In" ? (
                            <>
                                <LogOut className="h-3.5 w-3.5" />
                                Check-out Guest
                            </>
                        ) : "Update Status"}
                    </Button>
                </div>
            </div>

            <CheckInDialog open={checkInOpen} onOpenChange={setCheckInOpen} booking={booking} />
            <CheckOutDialog open={checkOutOpen} onOpenChange={setCheckOutOpen} booking={booking} />

            {/* Stats row for quick financials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <DashboardStatsCard
                    title="Total Value"
                    value={`₹${booking.total_amount?.toLocaleString() || "0"}`}
                    icon={CreditCard}
                    trend="neutral"
                    trendValue="Gross"
                />
                <DashboardStatsCard
                    title="Paid Amount"
                    value={`₹${paidAmount?.toLocaleString() || "0"}`}
                    icon={CheckCircle2}
                    trend="neutral"
                    trendValue={`${Math.round(paymentProgress)}%`}
                />
                <DashboardStatsCard
                    title="Balance Due"
                    value={`₹${dueAmount?.toLocaleString() || "0"}`}
                    icon={AlertTriangle}
                    trend={dueAmount > 0 ? "down" : "up"}
                    trendValue={dueAmount > 0 ? "Pending" : "Cleared"}
                />
                <DashboardStatsCard
                    title="Stay Duration"
                    value={String(booking.nights || "1")}
                    icon={Clock}
                    trend="neutral"
                    trendValue="Nights"
                />
            </div>

            {/* Main Content: 4-Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

                {/* Column 1: Guest Information */}
                <Card className="border-border/50 shadow-sm bg-card overflow-hidden flex flex-col h-full">
                    <CardHeader className="pb-3 border-b border-border p-4 bg-muted/20">
                        <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md flex items-center justify-center bg-background border border-border text-foreground shadow-sm">
                                <User className="h-3.5 w-3.5" />
                            </div>
                            <span>Guest Profile</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-5">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 rounded-lg border border-border">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${booking.guest_name}`} />
                                <AvatarFallback className="font-semibold text-xs text-primary">{booking.guest_name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col leading-tight">
                                <span className="font-semibold text-foreground text-sm">{booking.guest_name}</span>
                                <span className="text-xs text-muted-foreground opacity-60">{booking.guest}</span>
                            </div>
                        </div>

                        <div className="space-y-4 pt-2">
                            <div className="flex items-center gap-3 group">
                                <div className="h-7 w-7 rounded-md bg-muted/50 flex items-center justify-center border border-border/50 shadow-sm group-hover:bg-primary/5 transition-colors">
                                    <Mail className="h-3 w-3 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                                </div>
                                <div className="flex flex-col leading-none">
                                    <span className="text-xs font-semibold text-muted-foreground/60 mb-0.5">Email Address</span>
                                    <span className="text-sm font-medium text-foreground truncate max-w-[150px]">{booking.guest_email || "N/A"}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 group">
                                <div className="h-7 w-7 rounded-md bg-muted/50 flex items-center justify-center border border-border shadow-sm group-hover:bg-primary/5 transition-colors">
                                    <Phone className="h-3 w-3 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                                </div>
                                <div className="flex flex-col leading-none">
                                    <span className="text-xs font-semibold text-muted-foreground/60 mb-0.5">Contact Number</span>
                                    <span className="text-sm font-medium text-foreground">{booking.guest_phone || "N/A"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border space-y-2">
                            <span className="text-xs font-semibold text-muted-foreground/60 block mb-2">Compliance Status</span>
                            {[
                                { label: "Identity", status: booking.is_identity_verified },
                                { label: "Agreement", status: booking.is_rental_agreement_signed },
                                { label: "Deposit", status: booking.is_security_deposit_collected }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 rounded-md border border-border bg-muted/10 group hover:border-primary/20 transition-all">
                                    <span className="text-xs font-medium text-muted-foreground/70">{item.label}</span>
                                    {item.status ? (
                                        <Badge className="bg-success/10 text-success border-none text-[10px] font-semibold px-2 py-0.5 h-auto">Verified</Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-[10px] font-semibold px-2 py-0.5 h-auto opacity-40">Pending</Badge>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Column 2: Stay Details */}
                <Card className="border-border/50 shadow-sm bg-card overflow-hidden flex flex-col h-full">
                    <CardHeader className="pb-3 border-b border-border p-4 bg-muted/20">
                        <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md flex items-center justify-center bg-background border border-border text-foreground shadow-sm">
                                <Home className="h-3.5 w-3.5" />
                            </div>
                            <span>Stay Details</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-6">
                        <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-2">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-3 w-3 text-primary" />
                                <span className="text-xs font-semibold text-foreground">{booking.property}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md">{booking.unit_category}</Badge>
                                <span className="text-xs font-medium text-muted-foreground">{booking.allocated_unit || "Auto Allocation"}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-lg border border-border bg-muted/10">
                                <span className="text-xs font-semibold text-muted-foreground/60 mb-1 block text-center">Arrival</span>
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-foreground">{safeFormatDate(booking.check_in_date, "MMM dd, yyyy")}</p>
                                    <p className="text-[10px] font-medium text-muted-foreground opacity-50 mt-1">12:00 PM</p>
                                </div>
                            </div>
                            <div className="p-3 rounded-lg border border-border bg-muted/10">
                                <span className="text-xs font-semibold text-muted-foreground/60 mb-1 block text-center">Departure</span>
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-foreground">{safeFormatDate(booking.check_out_date, "MMM dd, yyyy")}</p>
                                    <p className="text-[10px] font-medium text-muted-foreground opacity-50 mt-1">11:00 AM</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <span className="text-xs font-semibold text-muted-foreground/60 block mb-3">Occupancy Logistics</span>
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col">
                                    <span className="text-xl font-semibold text-foreground tracking-tight">{booking.nights || 1}</span>
                                    <span className="text-xs font-medium text-muted-foreground opacity-60">Nights stay</span>
                                </div>
                                <div className="h-8 w-[1px] bg-border" />
                                <div className="flex flex-col">
                                    <span className="text-xl font-semibold text-foreground tracking-tight">{booking.number_of_guests || 2}</span>
                                    <span className="text-xs font-medium text-muted-foreground opacity-60">Total People</span>
                                </div>
                            </div>
                        </div>

                        {booking.special_requests && (
                            <div className="pt-4 border-t border-border">
                                <span className="text-xs font-semibold text-muted-foreground/60 block mb-2">Guest Memo</span>
                                <p className="text-xs font-medium leading-relaxed bg-warning/5 p-2 rounded border border-warning/10 text-warning italic">
                                    "{booking.special_requests}"
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Column 3: Financial Details */}
                <Card className="border-border/50 shadow-sm bg-card overflow-hidden flex flex-col h-full">
                    <CardHeader className="pb-3 border-b border-border p-4 bg-muted/20">
                        <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md flex items-center justify-center bg-background border border-border text-foreground shadow-sm">
                                <Banknote className="h-3.5 w-3.5" />
                            </div>
                            <span>Financials</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-6">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs font-semibold">
                                <span className="text-muted-foreground">Standard Rate</span>
                                <span className="text-foreground">₹{booking.room_rate_per_night?.toLocaleString() || 0} / night</span>
                            </div>
                            <div className="flex items-center justify-between text-xs font-semibold">
                                <span className="text-muted-foreground">Stay Subtotal</span>
                                <span className="text-foreground">₹{(booking.total_amount || 0).toLocaleString()}</span>
                            </div>
                            <Separator className="bg-border" />
                            <div className="flex items-center justify-between text-lg font-bold">
                                <span className="text-foreground text-xs font-semibold">Grand Total</span>
                                <span className="text-primary tracking-tight">₹{booking.total_amount?.toLocaleString() || 0}</span>
                            </div>
                        </div>

                        <div className="p-3 rounded-lg border border-border bg-muted/10 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col leading-none">
                                    <span className="text-xs font-semibold text-muted-foreground/60 mb-1">Status</span>
                                    <span className={cn("text-xs font-bold", dueAmount > 0 ? "text-warning" : "text-success")}>
                                        {dueAmount > 0 ? "Pending Balance" : "Payment Cleared"}
                                    </span>
                                </div>
                                <div className="text-right flex flex-col leading-none">
                                    <span className="text-xs font-semibold text-muted-foreground/60 mb-1">Due</span>
                                    <span className="text-sm font-bold text-foreground">₹{dueAmount.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Progress value={paymentProgress} className="h-1.5 bg-muted-foreground/10" />
                                <span className="text-[10px] font-semibold text-muted-foreground/40 block text-right uppercase tracking-wider">
                                    {Math.round(paymentProgress)}% Reconciled
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-4 border-t border-border">
                            <Button variant="outline" className="h-9 text-xs font-semibold border-border">
                                <CreditCard className="mr-1.5 h-3 w-3" /> Record
                            </Button>
                            <Button variant="outline" className="h-9 text-xs font-semibold border-border">
                                <FileText className="mr-1.5 h-3 w-3" /> Folio
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Column 4: Quick Actions & Metadata */}
                <div className="flex flex-col gap-6">
                    <Card className="border-border shadow-sm bg-card overflow-hidden">
                        <CardHeader className="pb-3 border-b border-border p-4 bg-muted/20">
                            <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md flex items-center justify-center bg-background border border-border text-foreground shadow-sm">
                                    <Activity className="h-3.5 w-3.5" />
                                </div>
                                <span>Operations</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 space-y-2">
                            {[
                                { label: "Send Documents", icon: Mail },
                                { label: "Request Identity", icon: Shield },
                                { label: "Generate Agreement", icon: FileText },
                                { label: "Kill Reservation", icon: AlertTriangle, variant: "destructive" as const }
                            ].map((action, idx) => (
                                <Button
                                    key={idx}
                                    variant={action.variant || "outline"}
                                    className={cn(
                                        "w-full justify-start h-9 text-xs font-semibold border-border",
                                        action.variant === "destructive" ? "bg-error/5 text-error hover:bg-error/10 border-error/20" : ""
                                    )}
                                >
                                    <action.icon className="mr-2 h-3 w-3" />
                                    {action.label}
                                </Button>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border-border shadow-sm bg-muted/10">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-semibold text-muted-foreground">Digital Audit</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-4">
                            <div className="flex justify-between items-center group">
                                <span className="text-xs font-medium text-muted-foreground/60">Source</span>
                                <Badge variant="outline" className="text-xs font-semibold border-border">{booking.reservation_source || "Direct"}</Badge>
                            </div>
                            <div className="flex justify-between items-center group">
                                <span className="text-xs font-medium text-muted-foreground/60">Created</span>
                                <span className="text-xs font-semibold text-foreground">{safeFormatDate(booking.creation, "MMM dd, yyyy")}</span>
                            </div>
                            <div className="flex justify-between items-center group">
                                <span className="text-xs font-medium text-muted-foreground/60">Updated</span>
                                <span className="text-xs font-semibold text-foreground">{safeFormatDate(booking.modified, "HH:mm, MMM dd")}</span>
                            </div>
                            <div className="pt-2">
                                <code className="text-[8px] font-mono bg-background border border-border/50 px-2 py-1 rounded block text-center opacity-50">
                                    {booking.name}
                                </code>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>

            <GuestChatPanel queries={queries} guestName={booking.guest_name} onSend={handleSendMessage} />
        </div>
    )
}

