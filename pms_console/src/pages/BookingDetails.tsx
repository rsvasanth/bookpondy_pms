import React from "react"
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
    Activity
} from "lucide-react"

export default function BookingDetailsPage() {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const { data: booking, isLoading } = useLocalDoc("Reservation", id!)
    const { mutate } = useLocalMutation()

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
                        <h1 className="text-xl font-black tracking-tight text-foreground uppercase">
                            {booking.guest_name}
                        </h1>
                        <Badge className={cn(
                            "text-[8px] font-black uppercase px-1.5 py-0 rounded-sm border shadow-none tracking-tight",
                            booking.reservation_status === "Confirmed" ? "bg-emerald-500 text-white border-emerald-600" :
                                booking.reservation_status === "Checked-In" ? "bg-blue-600 text-white border-blue-700" :
                                    "bg-muted text-muted-foreground border-border/50"
                        )}>
                            {booking.reservation_status}
                        </Badge>
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] decoration-primary/30 underline-offset-4 decoration-2">
                        Booking Discovery & Control Panel • <span className="font-mono opacity-50">{booking.name}</span>
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 px-4 rounded-md text-[10px] font-black uppercase tracking-widest border-border/50 bg-background/50 shadow-sm hover:bg-muted transition-all"
                    >
                        <Mail className="mr-2 h-3.5 w-3.5" /> Send Confirmation
                    </Button>
                    <Button
                        className="h-9 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[10px] uppercase tracking-[0.2em] gap-2 rounded-md shadow-lg shadow-primary/10 transition-all active:scale-95"
                    >
                        {booking.reservation_status === "Confirmed" ? "CHECK-IN GUEST" : "UPDATE STATUS"}
                    </Button>
                </div>
            </div>

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
                <Card className="border-border/50 shadow-sm bg-card/40 backdrop-blur-md overflow-hidden flex flex-col h-full">
                    <CardHeader className="pb-3 border-b border-border/50 p-4 bg-muted/20">
                        <CardTitle className="text-[10px] font-black text-muted-foreground flex items-center gap-2 uppercase tracking-[0.2em]">
                            <div className="w-6 h-6 rounded-md flex items-center justify-center bg-background border border-border/50 text-foreground shadow-sm">
                                <User className="h-3.5 w-3.5" />
                            </div>
                            <span>Guest Profile</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-5">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 rounded-lg border border-border/50">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${booking.guest_name}`} />
                                <AvatarFallback className="font-black text-xs text-primary">{booking.guest_name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="font-black text-foreground text-[12px] uppercase tracking-tight">{booking.guest_name}</span>
                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">#{(booking.guest || "").split("-").pop()}</span>
                            </div>
                        </div>

                        <div className="space-y-4 pt-2">
                            <div className="flex items-center gap-3 group">
                                <div className="h-7 w-7 rounded-md bg-muted/50 flex items-center justify-center border border-border/50 shadow-sm group-hover:bg-primary/5 transition-colors">
                                    <Mail className="h-3 w-3 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                                </div>
                                <div className="flex flex-col leading-none">
                                    <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest mb-0.5">Email Address</span>
                                    <span className="text-[10px] font-bold text-foreground truncate max-w-[150px]">{booking.guest_email || "N/A"}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 group">
                                <div className="h-7 w-7 rounded-md bg-muted/50 flex items-center justify-center border border-border/50 shadow-sm group-hover:bg-primary/5 transition-colors">
                                    <Phone className="h-3 w-3 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                                </div>
                                <div className="flex flex-col leading-none">
                                    <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest mb-0.5">Contact Number</span>
                                    <span className="text-[10px] font-bold text-foreground">{booking.guest_phone || "N/A"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border/30 space-y-2">
                            <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest block mb-2">Compliance Status</span>
                            {[
                                { label: "Identity", status: booking.is_identity_verified },
                                { label: "Agreement", status: booking.is_rental_agreement_signed },
                                { label: "Deposit", status: booking.is_security_deposit_collected }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 rounded-md border border-border/30 bg-muted/10 group hover:border-primary/20 transition-all">
                                    <span className="text-[9px] font-black uppercase tracking-tight text-muted-foreground/70">{item.label}</span>
                                    {item.status ? (
                                        <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[8px] font-black p-1 h-auto">VERIFIED</Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-[8px] font-black p-1 h-auto opacity-40">PENDING</Badge>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Column 2: Stay Details */}
                <Card className="border-border/50 shadow-sm bg-card/40 backdrop-blur-md overflow-hidden flex flex-col h-full">
                    <CardHeader className="pb-3 border-b border-border/50 p-4 bg-muted/20">
                        <CardTitle className="text-[10px] font-black text-muted-foreground flex items-center gap-2 uppercase tracking-[0.2em]">
                            <div className="w-6 h-6 rounded-md flex items-center justify-center bg-background border border-border/50 text-foreground shadow-sm">
                                <Home className="h-3.5 w-3.5" />
                            </div>
                            <span>Stay Control</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-6">
                        <div className="p-3 rounded-lg border border-border/50 bg-muted/20 space-y-2">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-3 w-3 text-primary" />
                                <span className="text-[11px] font-black uppercase tracking-tight text-foreground">{booking.property}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-[8px] font-black px-1.5 py-0 rounded-sm">{booking.unit_category}</Badge>
                                <span className="text-[10px] font-bold text-muted-foreground">{booking.allocated_unit || "AUTO ALLOCATION"}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-lg border border-border/30 bg-muted/10">
                                <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest mb-1 block text-center">Arrival</span>
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-foreground">{safeFormatDate(booking.check_in_date, "MMM dd, yyyy")}</p>
                                    <p className="text-[9px] font-bold text-muted-foreground opacity-50 mt-1 uppercase tracking-tighter">12:00 PM</p>
                                </div>
                            </div>
                            <div className="p-3 rounded-lg border border-border/30 bg-muted/10">
                                <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest mb-1 block text-center">Departure</span>
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-foreground">{safeFormatDate(booking.check_out_date, "MMM dd, yyyy")}</p>
                                    <p className="text-[9px] font-bold text-muted-foreground opacity-50 mt-1 uppercase tracking-tighter">11:00 AM</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest block mb-3">Occupancy Logistics</span>
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col">
                                    <span className="text-xl font-black text-foreground tracking-tighter">{booking.nights || 1}</span>
                                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">Nights stay</span>
                                </div>
                                <div className="h-8 w-[1px] bg-border/50" />
                                <div className="flex flex-col">
                                    <span className="text-xl font-black text-foreground tracking-tighter">{booking.number_of_guests || 2}</span>
                                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">Total People</span>
                                </div>
                            </div>
                        </div>

                        {booking.special_requests && (
                            <div className="pt-4 border-t border-border/30">
                                <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest block mb-2">Guest Memo</span>
                                <p className="text-[10px] font-medium leading-relaxed bg-amber-500/5 p-2 rounded border border-amber-500/10 text-amber-700/80 italic italic">
                                    "{booking.special_requests}"
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Column 3: Financial Details */}
                <Card className="border-border/50 shadow-sm bg-card/40 backdrop-blur-md overflow-hidden flex flex-col h-full">
                    <CardHeader className="pb-3 border-b border-border/50 p-4 bg-muted/20">
                        <CardTitle className="text-[10px] font-black text-muted-foreground flex items-center gap-2 uppercase tracking-[0.2em]">
                            <div className="w-6 h-6 rounded-md flex items-center justify-center bg-background border border-border/50 text-foreground shadow-sm">
                                <Banknote className="h-3.5 w-3.5" />
                            </div>
                            <span>Folio Details</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-6">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-[11px] font-bold">
                                <span className="text-muted-foreground">Standard Rate</span>
                                <span className="text-foreground tracking-tight">₹{booking.room_rate_per_night?.toLocaleString() || 0} / night</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] font-bold">
                                <span className="text-muted-foreground">Stay Subtotal</span>
                                <span className="text-foreground tracking-tight">₹{(booking.total_amount || 0).toLocaleString()}</span>
                            </div>
                            <Separator className="bg-border/30" />
                            <div className="flex items-center justify-between text-base font-black">
                                <span className="text-foreground uppercase tracking-tighter text-[10px]">Grand Total</span>
                                <span className="text-primary tracking-tighter">₹{booking.total_amount?.toLocaleString() || 0}</span>
                            </div>
                        </div>

                        <div className="p-3 rounded-lg border border-border/30 bg-muted/10 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col leading-none">
                                    <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest mb-1">Status</span>
                                    <span className={cn("text-[10px] font-black uppercase tracking-tight", dueAmount > 0 ? "text-amber-600" : "text-emerald-600")}>
                                        {dueAmount > 0 ? "Pending Balance" : "Payment Cleared"}
                                    </span>
                                </div>
                                <div className="text-right flex flex-col leading-none">
                                    <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest mb-1">Due</span>
                                    <span className="text-sm font-black text-foreground tracking-tighter">₹{dueAmount.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Progress value={paymentProgress} className="h-1.5 bg-muted-foreground/10" />
                                <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest block text-right">
                                    {Math.round(paymentProgress)}% RECONCILED
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-4 border-t border-border/30">
                            <Button variant="outline" className="h-9 text-[9px] font-black uppercase tracking-widest border-border/50">
                                <CreditCard className="mr-1.5 h-3 w-3" /> Record
                            </Button>
                            <Button variant="outline" className="h-9 text-[9px] font-black uppercase tracking-widest border-border/50">
                                <FileText className="mr-1.5 h-3 w-3" /> Folio
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Column 4: Quick Actions & Metadata */}
                <div className="flex flex-col gap-6">
                    <Card className="border-border/50 shadow-sm bg-card/40 backdrop-blur-md overflow-hidden">
                        <CardHeader className="pb-3 border-b border-border/50 p-4 bg-muted/20">
                            <CardTitle className="text-[10px] font-black text-muted-foreground flex items-center gap-2 uppercase tracking-[0.2em]">
                                <div className="w-6 h-6 rounded-md flex items-center justify-center bg-background border border-border/50 text-foreground shadow-sm">
                                    <Activity className="h-3.5 w-3.5" />
                                </div>
                                <span>Engine Control</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 space-y-2">
                            {[
                                { label: "CHECK-IN DOCS", icon: Mail },
                                { label: "IDENTITY REQ", icon: Shield },
                                { label: "AGREEMENT GEN", icon: FileText },
                                { label: "CANCEL ORDER", icon: AlertTriangle, variant: "destructive" as const }
                            ].map((action, idx) => (
                                <Button
                                    key={idx}
                                    variant={action.variant || "outline"}
                                    className={cn(
                                        "w-full justify-start h-9 text-[9px] font-black uppercase tracking-widest border-border/50",
                                        action.variant === "destructive" ? "bg-rose-500/5 text-rose-500 hover:bg-rose-500/10 border-rose-500/20" : ""
                                    )}
                                >
                                    <action.icon className="mr-2 h-3 w-3" />
                                    {action.label}
                                </Button>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-sm bg-muted/10">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Digital Audit</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-4">
                            <div className="flex justify-between items-center group">
                                <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">Source</span>
                                <Badge variant="outline" className="text-[8px] font-black border-border/50 uppercase">{booking.reservation_source || "Direct"}</Badge>
                            </div>
                            <div className="flex justify-between items-center group">
                                <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">Created</span>
                                <span className="text-[9px] font-black text-foreground">{safeFormatDate(booking.creation, "MMM dd, yyyy")}</span>
                            </div>
                            <div className="flex justify-between items-center group">
                                <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">Updated</span>
                                <span className="text-[9px] font-black text-foreground">{safeFormatDate(booking.modified, "HH:mm, MMM dd")}</span>
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

