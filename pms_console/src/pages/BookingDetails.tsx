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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
    LogOut,
    Eye,
    History,
    ClipboardList
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
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-4 -mx-6 px-6 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-lg border-border/50 bg-background shadow-sm hover:bg-muted"
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
                            "text-[10px] font-bold px-2 py-0.5 rounded-md border-none shadow-none uppercase tracking-wider",
                            booking.reservation_status === "Confirmed" ? "bg-success text-white" :
                                booking.reservation_status === "Checked-In" ? "bg-info text-white" :
                                    "bg-muted text-muted-foreground"
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
                                booking.reservation_status === "Checked-In" ? "bg-error hover:bg-error/90 text-white shadow-error/10" : "bg-primary text-white"
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

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="bg-muted/50 p-1 mb-4">
                    <TabsTrigger value="overview" className="gap-2">
                        <Eye className="h-3.5 w-3.5" /> Overview
                    </TabsTrigger>
                    <TabsTrigger value="identity" className="gap-2">
                        <Shield className="h-3.5 w-3.5" /> Identity
                    </TabsTrigger>
                    <TabsTrigger value="financials" className="gap-2">
                        <Banknote className="h-3.5 w-3.5" /> Financials
                    </TabsTrigger>
                    <TabsTrigger value="ops" className="gap-2">
                        <History className="h-3.5 w-3.5" /> Logs & History
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    {/* Stats for quick financials - Keep in Overview */}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Guest Quick Profile */}
                        <Card className="border-border/50 shadow-sm">
                            <CardHeader className="pb-3 border-b border-border p-4 bg-muted/20">
                                <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                                    <User className="h-3.5 w-3.5" /> Guest Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12 rounded-lg border border-border">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${booking.guest_name}`} />
                                        <AvatarFallback className="font-semibold text-xs text-primary">{booking.guest_name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col leading-tight">
                                        <span className="font-semibold text-foreground text-sm">{booking.guest_name}</span>
                                        <span className="text-xs text-muted-foreground">{booking.guest_phone || "No phone"}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div className="space-y-1">
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground opacity-50">Property</span>
                                        <p className="text-sm font-medium">{booking.property}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground opacity-50">Room Category</span>
                                        <p className="text-sm font-medium">{booking.unit_category}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Stay Recap */}
                        <Card className="border-border/50 shadow-sm">
                            <CardHeader className="pb-3 border-b border-border p-4 bg-muted/20">
                                <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                                    <Home className="h-3.5 w-3.5" /> Stay Control
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground opacity-50">Check-in</span>
                                        <p className="text-sm font-medium">{safeFormatDate(booking.check_in_date, "MMM dd, yyyy")}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground opacity-50">Check-out</span>
                                        <p className="text-sm font-medium">{safeFormatDate(booking.check_out_date, "MMM dd, yyyy")}</p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="text-sm font-medium">{booking.nights || 1} Nights</span>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] font-bold border-primary/20 bg-primary/5 text-primary">
                                        {booking.allocated_unit || "AUTO ALLOCATION"}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {booking.special_requests && (
                        <Card className="border-warning/20 bg-warning/[0.02]">
                            <CardContent className="p-4 flex gap-3">
                                <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-warning uppercase">Special Instructions</span>
                                    <p className="text-sm font-medium text-warning/80">"{booking.special_requests}"</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="identity" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-border/50 shadow-sm h-fit">
                            <CardHeader className="pb-3 border-b border-border p-4 bg-muted/20">
                                <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                                    <Shield className="h-3.5 w-3.5" /> Compliance Verification
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-5">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 group">
                                        <div className="h-7 w-7 rounded-md bg-muted/50 flex items-center justify-center border border-border/50 shadow-sm group-hover:bg-primary/5 transition-colors">
                                            <Mail className="h-3 w-3 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                                        </div>
                                        <div className="flex flex-col leading-none">
                                            <span className="text-[10px] font-bold text-muted-foreground/60 mb-0.5 uppercase">Email Address</span>
                                            <span className="text-sm font-medium text-foreground">{booking.guest_email || "N/A"}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 group">
                                        <div className="h-7 w-7 rounded-md bg-muted/50 flex items-center justify-center border border-border shadow-sm group-hover:bg-primary/5 transition-colors">
                                            <Phone className="h-3 w-3 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                                        </div>
                                        <div className="flex flex-col leading-none">
                                            <span className="text-[10px] font-bold text-muted-foreground/60 mb-0.5 uppercase">Contact Number</span>
                                            <span className="text-sm font-medium text-foreground">{booking.guest_phone || "N/A"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-border space-y-2">
                                    <span className="text-[10px] font-bold text-muted-foreground/60 block mb-2 uppercase">Checkpoint Status</span>
                                    {[
                                        { label: "Identity Verified", status: booking.is_identity_verified },
                                        { label: "Rental Agreement", status: booking.is_rental_agreement_signed },
                                        { label: "Security Deposit", status: booking.is_security_deposit_collected }
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2.5 rounded-md border border-border bg-muted/10">
                                            <span className="text-xs font-medium text-muted-foreground/70">{item.label}</span>
                                            {item.status ? (
                                                <Badge className="bg-success/10 text-success border-none text-[10px] font-bold px-2 py-0.5 h-auto">COMPLETE</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5 h-auto opacity-40">PENDING</Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <Button variant="outline" className="w-full text-xs font-semibold gap-2 border-primary/20 text-primary hover:bg-primary/5">
                                    <Mail className="h-3.5 w-3.5" /> Request Re-Verification
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border-border/50 shadow-sm overflow-hidden min-h-[400px]">
                            <CardHeader className="pb-3 border-b border-border p-4 bg-muted/20">
                                <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-3.5 w-3.5" /> Identity Proof Preview
                                    </div>
                                    {booking.guest_id_image && (
                                        <Badge variant="outline" className="text-[8px] uppercase tracking-tighter">Document Attached</Badge>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 h-full bg-muted/5 flex items-center justify-center relative group">
                                {booking.guest_id_image ? (
                                    <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center">
                                        <img
                                            src={booking.guest_id_image}
                                            alt="Guest ID"
                                            className="max-w-full max-h-[500px] object-contain shadow-2xl rounded-md transition-transform group-hover:scale-[1.02]"
                                        />
                                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-center gap-2">
                                            <Button variant="secondary" size="sm" className="h-8 text-[10px] font-bold" onClick={() => window.open(booking.guest_id_image, '_blank')}>
                                                OPEN FULLSIZE
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-4 opacity-40 py-20 text-center px-8">
                                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border">
                                            <Shield className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold uppercase tracking-tight">No ID Snapshot</p>
                                            <p className="text-xs font-medium">Please attach ID scan during check-in or via the Ops panel.</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="financials" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Summary Card */}
                        <Card className="md:col-span-1 border-border/50 shadow-sm">
                            <CardHeader className="pb-3 border-b border-border p-4 bg-muted/20">
                                <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                                    <Banknote className="h-3.5 w-3.5" /> Billing Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs font-medium">
                                        <span className="text-muted-foreground">Standard Rate</span>
                                        <span className="font-semibold text-foreground">₹{booking.room_rate_per_night?.toLocaleString() || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-medium">
                                        <span className="text-muted-foreground">Stay Total ({booking.nights || 1} nights)</span>
                                        <span className="font-semibold text-foreground">₹{(booking.total_amount || 0).toLocaleString()}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between items-end pt-1">
                                        <div className="space-y-0.5">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-50">Grand Total</span>
                                            <div className="text-2xl font-bold text-primary tracking-tight">₹{booking.total_amount?.toLocaleString() || 0}</div>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] font-bold border-success/20 bg-success/5 text-success mb-1">
                                            Provisional
                                        </Badge>
                                    </div>
                                </div>

                                <div className="p-3 rounded-lg border border-border bg-muted/10 space-y-3 pt-4">
                                    <div className="flex justify-between items-center text-xs font-bold uppercase">
                                        <span className="text-muted-foreground opacity-60">Status</span>
                                        <span className={dueAmount > 0 ? "text-warning" : "text-success"}>
                                            {dueAmount > 0 ? "Pending Balance" : "Fully Paid"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-40">Due</span>
                                        <span className="text-lg font-bold text-foreground">₹{dueAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Progress value={paymentProgress} className="h-1.5" />
                                        <span className="text-[10px] font-bold text-muted-foreground/40 block text-right uppercase tracking-wider">
                                            {Math.round(paymentProgress)}% Reconciled
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Transaction List Placeholder */}
                        <Card className="md:col-span-2 border-border/50 shadow-sm">
                            <CardHeader className="pb-3 border-b border-border p-4 bg-muted/20 flex flex-row items-center justify-between">
                                <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                                    <CreditCard className="h-3.5 w-3.5" /> Transaction Ledger
                                </CardTitle>
                                <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold uppercase border-border">
                                    Export Ledger
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr className="border-b border-border bg-muted/5">
                                                <th className="p-4 font-bold text-muted-foreground uppercase tracking-tight">Date</th>
                                                <th className="p-4 font-bold text-muted-foreground uppercase tracking-tight">Description</th>
                                                <th className="p-4 font-bold text-muted-foreground uppercase tracking-tight text-right">Debit</th>
                                                <th className="p-4 font-bold text-muted-foreground uppercase tracking-tight text-right">Credit</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            <tr className="hover:bg-muted/5 transition-colors">
                                                <td className="p-4 text-muted-foreground font-medium">{safeFormatDate(booking.creation, "MMM dd")}</td>
                                                <td className="p-4 font-semibold text-foreground">System: Room Charges</td>
                                                <td className="p-4 text-right font-bold text-foreground">₹{(booking.total_amount || 0).toLocaleString()}</td>
                                                <td className="p-4 text-right font-bold text-muted-foreground opacity-30">—</td>
                                            </tr>
                                            {booking.advance_paid > 0 && (
                                                <tr className="hover:bg-muted/5 transition-colors">
                                                    <td className="p-4 text-muted-foreground font-medium">{safeFormatDate(booking.creation, "MMM dd")}</td>
                                                    <td className="p-4 font-semibold text-foreground">Payment: Advance Received</td>
                                                    <td className="p-4 text-right font-bold text-muted-foreground opacity-30">—</td>
                                                    <td className="p-4 text-right font-bold text-success">₹{(booking.advance_paid || 0).toLocaleString()}</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="p-12 text-center opacity-40 flex flex-col items-center gap-2">
                                    <Banknote className="h-8 w-8" />
                                    <p className="text-xs font-bold uppercase tracking-wider">Additional transactions will appear here</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="ops" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* History / Timeline */}
                        <Card className="md:col-span-2 border-border/50 shadow-sm">
                            <CardHeader className="pb-3 border-b border-border p-4 bg-muted/20">
                                <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                                    <History className="h-3.5 w-3.5" /> Operational History
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-8 relative before:absolute before:inset-0 before:left-[11px] before:w-[2px] before:bg-muted before:h-full pb-4">
                                    {/* History Item 1 */}
                                    <div className="relative pl-8">
                                        <div className="absolute left-0 top-1 h-[24px] w-[24px] rounded-full border-4 border-background bg-primary shadow-sm z-10" />
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-foreground uppercase tracking-tight">Reservation Created</p>
                                                <p className="text-xs font-medium text-muted-foreground">Direct booking via PMS Dashboard</p>
                                                <Badge variant="outline" className="text-[9px] font-bold mt-2 border-border opacity-70">SYSTEM</Badge>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-foreground">{safeFormatDate(booking.creation, "HH:mm")}</p>
                                                <p className="text-[10px] font-semibold text-muted-foreground opacity-50">{safeFormatDate(booking.creation, "MMM dd")}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* History Item 2 (Status Change example) */}
                                    {booking.reservation_status !== 'Confirmed' && (
                                        <div className="relative pl-8">
                                            <div className="absolute left-0 top-1 h-[24px] w-[24px] rounded-full border-4 border-background bg-success shadow-sm z-10" />
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-bold text-foreground uppercase tracking-tight">Guest Checked In</p>
                                                    <p className="text-xs font-medium text-muted-foreground">ID Verified & Unit {booking.allocated_unit} Handover</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Badge variant="outline" className="text-[9px] font-bold border-success/20 bg-success/5 text-success">STAFF-ADMIN</Badge>
                                                        <span className="text-[10px] font-medium text-muted-foreground opacity-50">#FO-872-CK</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-bold text-foreground">{safeFormatDate(booking.modified, "HH:mm")}</p>
                                                    <p className="text-[10px] font-semibold text-muted-foreground opacity-50">{safeFormatDate(booking.modified, "MMM dd")}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-4 rounded-lg bg-muted/10 border border-dashed border-border text-center">
                                        <p className="text-xs font-bold text-muted-foreground/40 uppercase tracking-widest">End of Recent Activity</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Housekeeping/Unit Status */}
                        <div className="space-y-6">
                            <Card className="border-border/50 shadow-sm overflow-hidden">
                                <CardHeader className="pb-3 border-b border-border p-4 bg-muted/20">
                                    <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                                        <ClipboardList className="h-3.5 w-3.5" /> Unit Operations
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-4">
                                    <div className="p-3 rounded-lg border border-border bg-muted/10">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Status</span>
                                            <Badge className="bg-success text-white text-[10px] uppercase font-bold px-2 py-0.5">Ready</Badge>
                                        </div>
                                        <p className="text-sm font-bold text-foreground">{booking.allocated_unit || "NOT ASSIGNED"}</p>
                                        <p className="text-[10px] font-medium text-muted-foreground mt-1">Verified by Housekeeping Admin</p>
                                    </div>

                                    <Separator />

                                    <div className="space-y-3">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-40 block">Tasks Queue</span>
                                        <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer group">
                                            <div className="h-8 w-8 rounded bg-muted flex items-center justify-center font-bold text-[10px] text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">HK</div>
                                            <div className="flex flex-col leading-tight">
                                                <span className="text-xs font-semibold text-foreground">Turnover Service</span>
                                                <span className="text-[10px] text-muted-foreground italic">Scheduled: Post-Checkout</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-border/50 shadow-sm bg-muted/10">
                                <CardContent className="p-4 space-y-3">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-50 text-center mb-4">Quick Actions</p>
                                    <Button variant="outline" className="w-full h-9 text-xs font-bold border-border shadow-none">
                                        <FileText className="mr-2 h-3.5 w-3.5" /> PRINT FOLIO
                                    </Button>
                                    <Button variant="outline" className="w-full h-9 text-xs font-bold border-border shadow-none">
                                        <Shield className="mr-2 h-3.5 w-3.5" /> VIEW AUDIT LOG
                                    </Button>
                                    <Button variant="destructive" className="w-full h-9 text-xs font-bold bg-error/10 text-error border-error/20 hover:bg-error/20 shadow-none">
                                        <AlertTriangle className="mr-2 h-3.5 w-3.5" /> CANCEL ORDER
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            <GuestChatPanel queries={queries} guestName={booking.guest_name} onSend={handleSendMessage} />
        </div>
    )
}
