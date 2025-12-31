import React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { useLocalDoc, useLocalMutation, useLocalDocList, useLocalCreate } from "@/hooks/use-local-data"
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    CreditCard,
    Mail,
    MessageSquare,
    Phone,
    Send,
    Shield,
    User,
    Home,
    AlertTriangle,
    FileText,
    MapPin,
    Users,
    Bed
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress";
import { GuestChatPanel } from "@/components/GuestChatPanel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { format, isValid } from "date-fns"
import { cn, safeFormatDate } from "@/lib/utils"



export default function BookingDetailsPage() {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const { data: booking, isLoading } = useLocalDoc("Reservation", id!)
    const { mutate } = useLocalMutation()

    // Chat Logic
    const { data: queries } = useLocalDocList('Guest Query', { selector: { reservation: id } })
    const { create: createQuery } = useLocalCreate()
    const [messageInput, setMessageInput] = React.useState("")

    const handleSendMessage = () => {
        if (!messageInput.trim()) return

        if (!booking.guest) {
            alert("Cannot log query: Guest information is missing. Please wait for sync to complete.")
            return
        }

        createQuery('Guest Query', {
            reservation: id,
            guest: booking.guest,
            query_text: messageInput,
            status: 'Open',
            query_date: new Date().toISOString()
        })
        setMessageInput("")
    }

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex h-full items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </DashboardLayout>
        )
    }

    if (!booking) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                    <h2 className="text-xl font-bold">Booking Not Found</h2>
                    <Button onClick={() => navigate("/bookings")}>Back to Bookings</Button>
                </div>
            </DashboardLayout>
        )
    }

    const isPaid = ["Received", "Refunded"].includes(booking?.payment_status)
    const paidAmount = isPaid ? booking?.total_amount : (booking?.advance_paid || 0)
    const dueAmount = (booking?.total_amount || 0) - (paidAmount || 0)
    const paymentProgress = booking?.total_amount > 0 ? (paidAmount / booking.total_amount) * 100 : 0

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "Confirmed": return "default"
            case "Checked-In": return "secondary"
            case "Cancelled": return "destructive"
            default: return "outline"
        }
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col space-y-6 p-6 max-w-7xl mx-auto w-full min-h-screen">

                {/* Header */}
                <div className="flex items-center justify-between col-span-3">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => navigate("/bookings")}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold">{booking.guest_name}</h1>
                                <Badge variant={getStatusVariant(booking.reservation_status)}>
                                    {booking.reservation_status}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground font-mono">{booking.name}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Mail className="mr-2 h-4 w-4" />
                            Email
                        </Button>
                        <Button size="sm">
                            {booking.reservation_status === "Confirmed" ? "Check-In Guest" : "Update Status"}
                        </Button>
                    </div>
                </div>

                {/* Outstanding Balance Alert */}
                {dueAmount > 0 && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Payment Pending</AlertTitle>
                        <AlertDescription>
                            ₹{dueAmount.toLocaleString()} balance due. Please collect before check-in.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Primary Information - Guest & Stay Details (2 Column) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 col-span-3 max-h-[calc(100vh-200px)] overflow-y-auto">

                    {/* Guest Information Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Guest Information</CardTitle>
                            <CardDescription>Contact details and verification status</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Guest Profile */}
                            <div className="flex items-start gap-4">
                                <Avatar className="h-16 w-16 border">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${booking.guest_name}`} />
                                    <AvatarFallback className="text-lg">{booking.guest_name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-lg">{booking.guest_name}</p>
                                    <p className="text-sm text-muted-foreground">Guest ID: {booking.guest || "N/A"}</p>
                                </div>
                            </div>

                            <Separator />

                            {/* Contact Details */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-muted-foreground">Email Address</p>
                                        <p className="text-sm font-medium truncate">{booking.guest_email || "Not provided"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Phone Number</p>
                                        <p className="text-sm font-medium">{booking.guest_phone || "Not provided"}</p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Verification Checklist */}
                            <div className="space-y-2">
                                <p className="text-sm font-semibold mb-3">Verification Checklist</p>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between py-1.5">
                                        <span className="text-sm">Identity Verification</span>
                                        {booking.is_identity_verified ? (
                                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                                Verified
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-muted-foreground">Pending</Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between py-1.5">
                                        <span className="text-sm">Rental Agreement</span>
                                        {booking.is_rental_agreement_signed ? (
                                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                                Signed
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-muted-foreground">Pending</Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between py-1.5">
                                        <span className="text-sm">Security Deposit</span>
                                        {booking.is_security_deposit_collected ? (
                                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                                Collected
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-muted-foreground">Pending</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stay Details Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Stay Details</CardTitle>
                            <CardDescription>Check-in dates and accommodation</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Property & Unit */}
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Home className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-muted-foreground">Property</p>
                                        <p className="font-semibold">{booking.property}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                                        <Bed className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-muted-foreground">Unit Assignment</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="secondary">{booking.unit_category}</Badge>
                                            <span className="text-sm font-medium">{booking.allocated_unit || "Not assigned"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Calendar className="h-3.5 w-3.5" />
                                        Check-in
                                    </div>
                                    <p className="font-semibold">{safeFormatDate(booking.check_in_date, "MMM dd, yyyy")}</p>
                                    <p className="text-xs text-muted-foreground">12:00 PM</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Calendar className="h-3.5 w-3.5" />
                                        Check-out
                                    </div>
                                    <p className="font-semibold">{safeFormatDate(booking.check_out_date, "MMM dd, yyyy")}</p>
                                    <p className="text-xs text-muted-foreground">11:00 AM</p>
                                </div>
                            </div>

                            <Separator />

                            {/* Summary Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Clock className="h-3.5 w-3.5" />
                                        Duration
                                    </div>
                                    <p className="text-2xl font-bold">{booking.nights || 1}</p>
                                    <p className="text-xs text-muted-foreground">Nights</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Users className="h-3.5 w-3.5" />
                                        Guests
                                    </div>
                                    <p className="text-2xl font-bold">{booking.number_of_guests || 2}</p>
                                    <p className="text-xs text-muted-foreground">People</p>
                                </div>
                            </div>

                            <Separator />

                            {/* Special Requests */}
                            {booking.special_requests && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-semibold">
                                        <FileText className="h-4 w-4" />
                                        Special Requests
                                    </div>
                                    <div className="bg-muted/50 rounded-lg p-3 text-sm">
                                        {booking.special_requests}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Financial Overview (Full Width) */}
                <Card className="border-primary/20 col-span-3">
                    <CardHeader>
                        <CardTitle className="text-lg">Financial Summary</CardTitle>
                        <CardDescription>Payment status and breakdown</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Total Amount */}
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Total Amount</p>
                                <p className="text-3xl font-bold">₹{booking.total_amount?.toLocaleString() || 0}</p>
                                <p className="text-xs text-muted-foreground">
                                    {booking.nights} nights × ₹{booking.room_rate_per_night?.toLocaleString() || 0}
                                </p>
                            </div>

                            {/* Payment Progress */}
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Amount Paid</span>
                                        <span className="font-semibold text-emerald-600">₹{paidAmount?.toLocaleString() || 0}</span>
                                    </div>
                                    <Progress value={paymentProgress} className="h-2" />
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Balance Due</span>
                                    <span className={cn("font-semibold", dueAmount > 0 ? "text-destructive" : "text-muted-foreground")}>
                                        ₹{dueAmount?.toLocaleString() || 0}
                                    </span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {Math.round(paymentProgress)}% paid
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2">
                                <Button variant="outline" size="sm" className="w-full">
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Record Payment
                                </Button>
                                <Button variant="outline" size="sm" className="w-full">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Generate Invoice
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>







                {/* Quick Actions & Metadata */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full justify-start">
                                <Mail className="mr-2 h-4 w-4" />
                                Send Check-in Instructions
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <Shield className="mr-2 h-4 w-4" />
                                Request ID Verification
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <FileText className="mr-2 h-4 w-4" />
                                Generate Rental Agreement
                            </Button>
                            <Separator className="my-2" />
                            <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                Cancel Reservation
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Booking Metadata */}
                    <Card className="bg-muted/30">
                        <CardHeader>
                            <CardTitle className="text-base">Booking Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Source</span>
                                <Badge variant="outline">{booking.reservation_source || "Direct"}</Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Created On</span>
                                <span>{safeFormatDate(booking.creation, "MMM dd, yyyy")}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Last Updated</span>
                                <span>{safeFormatDate(booking.modified, "MMM dd 'at' HH:mm")}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Booking ID</span>
                                <code className="text-xs bg-background px-2 py-1 rounded">{booking.name}</code>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <GuestChatPanel queries={queries} guestName={booking.guest_name} onSend={createQuery} />
        </DashboardLayout>
    )
}
