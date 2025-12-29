import { useNavigate, useParams } from "react-router-dom"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { useLocalDoc, useLocalMutation, useLocalDocList, useLocalCreate } from "@/hooks/use-local-data"
import {
    ArrowLeft,
    Mail,
    Phone,
    Calendar,
    CreditCard,
    Printer,
    MessageSquare,
    CheckSquare,
    Shield,
    Sparkles,
    UserCog,
    Send,
    MessageCircle,
    HelpCircle,
    MoreHorizontal,
    Clock,
    Wallet
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format, isValid } from "date-fns"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

const safeFormatDate = (date: any, formatStr: string) => {
    try {
        const d = new Date(date)
        if (!isValid(d)) return "N/A"
        return format(d, formatStr)
    } catch (e) {
        return "N/A"
    }
}

export default function BookingDetailsPage() {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()

    const { data: booking, isLoading } = useLocalDoc("Reservation", id!)
    const { mutate } = useLocalMutation()

    // --- Derived Payment Logic ---
    const isPaid = ["Received", "Refunded"].includes(booking?.payment_status)
    // Fallback to advance_paid if not fully paid
    const paidAmount = isPaid ? booking?.total_amount : (booking?.advance_paid || 0)
    const dueAmount = (booking?.total_amount || 0) - (paidAmount || 0)

    // --- Notes Logic ---
    const handleSaveNotes = (e: React.FocusEvent<HTMLTextAreaElement>) => {
        const newNotes = e.target.value
        if (newNotes !== booking.notes) {
            mutate('Reservation', booking.name, { notes: newNotes })
        }
    }

    // --- Onboarding Logic ---
    const onboardingSteps = [
        { key: 'is_identity_verified', label: "Identity Verified", done: !!booking?.is_identity_verified },
        { key: 'is_rental_agreement_signed', label: "Rental Agreement Signed", done: !!booking?.is_rental_agreement_signed },
        { key: 'is_security_deposit_collected', label: "Security Collected", done: !!booking?.is_security_deposit_collected },
        { key: 'is_checkin_guide_sent', label: "Guide Sent", done: !!booking?.is_checkin_guide_sent },
    ]
    const completedSteps = onboardingSteps.filter(s => s.done).length
    const progress = (completedSteps / onboardingSteps.length) * 100

    const handleToggleOnboarding = (key: string, currentVal: boolean) => {
        mutate('Reservation', booking.name, { [key]: !currentVal ? 1 : 0 })
    }

    // --- Guest Queries Logic ---
    const { data: queries } = useLocalDocList('Guest Query', { selector: { reservation: id } })
    const { create: createQuery } = useLocalCreate()

    const handleLogQuery = () => {
        const text = prompt("Enter guest query:")
        if (text) {
            createQuery('Guest Query', {
                reservation: id,
                guest: booking.guest,
                query_text: text,
                status: 'Open',
                query_date: new Date().toISOString()
            })
        }
    }

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex h-full items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <p className="text-xs font-medium text-slate-500 animate-pulse">Loading...</p>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    if (!booking) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                    <h2 className="text-xl font-bold text-gray-800">Booking Not Found</h2>
                    <Button onClick={() => navigate("/bookings")}>Back to Bookings</Button>
                </div>
            </DashboardLayout>
        )
    }

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "Confirmed": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            case "Checked-In": return "bg-blue-500/10 text-blue-500 border-blue-500/20"
            case "Checked-Out": return "bg-muted text-muted-foreground border-border"
            case "Cancelled": return "bg-rose-500/10 text-rose-500 border-rose-500/20"
            default: return "bg-muted text-muted-foreground border-border"
        }
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col space-y-3 pb-8 w-full max-w-screen-2xl mx-auto px-2">

                {/* Compact Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-2">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => navigate("/bookings")} className="h-10 w-10 border-border bg-card hover:bg-muted rounded-lg shadow-sm">
                            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-black text-foreground uppercase tracking-tight leading-none">
                                    {booking.guest_name}
                                </h1>
                                <Badge variant="outline" className={cn("text-[10px] font-black uppercase px-3 py-1 rounded-md border shadow-none tracking-tight", getStatusStyles(booking.reservation_status))}>
                                    {booking.reservation_status}
                                </Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-1.5 opacity-60">
                                {booking.name} <span className="mx-2 opacity-30">•</span> {booking.property}
                            </p>
                        </div>
                    </div>
                    {/* ... (Header Actions same as before) ... */}
                    <div className="flex items-center gap-2">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 gap-2 bg-card hidden sm:flex border-border text-foreground hover:bg-muted font-bold">
                                    <MessageCircle className="h-3.5 w-3.5" />
                                    Communication
                                </Button>
                            </SheetTrigger>
                            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0 gap-0">
                                <SheetHeader className="p-4 border-b border-border bg-muted/50">
                                    <SheetTitle className="flex items-center gap-2 text-base">
                                        <MessageSquare className="h-4 w-4 text-primary" />
                                        Communication Hub
                                    </SheetTitle>
                                    <SheetDescription className="text-xs">
                                        Chat with {booking.guest_name}
                                    </SheetDescription>
                                </SheetHeader>
                                {/* Chat Interface */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
                                    <div className="flex gap-3">
                                        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold text-xs shrink-0">SYS</div>
                                        <div className="bg-card p-3 rounded-lg shadow-sm border border-border max-w-[85%]">
                                            <p className="text-[10px] font-bold text-muted-foreground mb-1">System • Yesterday</p>
                                            <p className="text-sm text-foreground">Booking confirmation #{booking.name} sent via Email.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 flex-row-reverse">
                                        <Avatar className="h-8 w-8 shrink-0">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${booking.guest_name}`} />
                                            <AvatarFallback>{booking.guest_name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="bg-primary p-3 rounded-lg shadow-sm border border-primary max-w-[85%] text-primary-foreground">
                                            <p className="text-[10px] font-bold text-primary-foreground/70 mb-1">Guest • 2h ago</p>
                                            <p className="text-sm">Hi! Is it possible to check in an hour early? Our flight lands at 10 AM.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 border-t border-border">
                                    <div className="relative">
                                        <Textarea placeholder="Type a message..." className="min-h-[80px] bg-muted/50 border-border resize-none pr-12 text-sm" />
                                        <Button size="icon" className="absolute bottom-2 right-2 h-8 w-8 rounded-lg bg-primary hover:bg-primary/90">
                                            <Send className="h-4 w-4 text-primary-foreground" />
                                        </Button>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>

                        <Button variant="ghost" size="icon" className="h-8 w-8 sm:hidden">
                            <MoreHorizontal className="h-4 w-4 text-foreground" />
                        </Button>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-8 shadow-sm px-4 rounded-lg" size="sm">
                            {(booking.reservation_status === "Confirmed") ? "Check-In" : "Manage"}
                        </Button>
                    </div>
                </div>

                {/* Dashboard-Style Layout - High Density */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

                    {/* LEFT COLUMN: Context (Guest & Stay) */}
                    <div className="lg:col-span-3 space-y-4">

                        {/* Guest Profile */}
                        <Card className="rounded-lg shadow-sm border-border overflow-hidden transition-all hover:shadow-md bg-card">
                            <CardHeader className="py-3 px-4 border-b border-border bg-muted/30">
                                <CardTitle className="text-[10px] font-black flex items-center justify-between text-muted-foreground uppercase tracking-[0.2em]">
                                    Guest Discover
                                    <Badge variant="outline" className="text-[8px] font-black uppercase bg-primary/10 text-primary border-none rounded-md px-1.5 py-0">Elite Guest</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3">
                                <div className="flex items-center gap-3 mb-3">
                                    <Avatar className="h-10 w-10 border border-border shadow-sm">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${booking.guest_name}`} />
                                        <AvatarFallback className="bg-muted text-muted-foreground">{booking.guest_name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-xs text-foreground truncate">{booking.guest_name}</h3>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            {booking.guest_id_image ? (
                                                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100/50 px-1.5 py-0.5 rounded-sm flex items-center gap-1 w-fit">
                                                    <Shield className="h-2.5 w-2.5" /> ID Verified
                                                </span>
                                            ) : (
                                                <span className="text-[9px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded-sm">ID Unverified</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs">
                                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                                            <Mail className="h-3 w-3 text-muted-foreground" />
                                        </div>
                                        <span className="text-muted-foreground truncate text-[11px] font-medium">{booking.guest_email || "No Email"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                                            <Phone className="h-3 w-3 text-muted-foreground" />
                                        </div>
                                        <span className="text-muted-foreground text-[11px] font-medium">{booking.guest_phone || "No Phone"}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Stay Details */}
                        <Card className="rounded-lg shadow-sm border-border overflow-hidden transition-all hover:shadow-md bg-card">
                            <CardHeader className="py-3 px-4 border-b border-border bg-muted/30">
                                <CardTitle className="text-[10px] font-black flex items-center gap-2 text-muted-foreground uppercase tracking-[0.2em]">
                                    <Calendar className="h-4 w-4 text-foreground opacity-50" /> Stay Discovery
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div className="grid grid-cols-2 gap-3 text-center">
                                    <div className="bg-muted/50 p-2 rounded-lg border border-border">
                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Check-In</span>
                                        <span className="font-black text-xs text-foreground uppercase tracking-tight">{safeFormatDate(booking.check_in_date, "MMM dd")}</span>
                                    </div>
                                    <div className="bg-muted/50 p-2 rounded-lg border border-border">
                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Check-Out</span>
                                        <span className="font-black text-xs text-foreground uppercase tracking-tight">{safeFormatDate(booking.check_out_date, "MMM dd")}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg border border-border">
                                    <div className="flex items-center gap-3">
                                        <div className="h-7 w-7 rounded-lg bg-card border border-border flex items-center justify-center text-primary font-black text-[10px] shadow-sm uppercase">
                                            {booking.allocated_unit?.substring(0, 2) || "NA"}
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.1em] leading-none">Unit</p>
                                            <p className="text-xs font-black text-foreground leading-tight uppercase tracking-tight mt-0.5">{booking.allocated_unit || "Unassigned"}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="bg-background border-border text-muted-foreground text-[8px] font-black uppercase rounded-md tracking-tighter h-5 px-2">
                                        {booking.unit_category || "Standard"}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                    </div>

                    {/* RIGHT COLUMN: Business (Financials, Onboarding, Queries) */}
                    <div className="lg:col-span-9 space-y-4">

                        {/* Financials Row */}
                        <div className="grid grid-cols-3 gap-4">
                            <Card className="rounded-lg shadow-sm border-border bg-primary text-primary-foreground overflow-hidden">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] font-black text-primary-foreground/70 uppercase tracking-[0.2em] mb-1">Total Value</p>
                                        <p className="text-2xl font-black leading-none tracking-tighter">₹{booking.total_amount?.toLocaleString()}</p>
                                    </div>
                                    <div className="h-10 w-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center border border-primary-foreground/10">
                                        <Wallet className="h-5 w-5 text-primary-foreground" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="rounded-lg shadow-sm border-border bg-card">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Settled</p>
                                        <p className="text-2xl font-black text-emerald-600 leading-none tracking-tighter">₹{paidAmount?.toLocaleString()}</p>
                                    </div>
                                    <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10">
                                        <CheckSquare className="h-5 w-5 text-emerald-600" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="rounded-lg shadow-sm border-border bg-card">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Outstanding</p>
                                        <p className="text-2xl font-black text-rose-600 leading-none tracking-tighter">₹{dueAmount?.toLocaleString()}</p>
                                    </div>
                                    <div className="h-10 w-10 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/10">
                                        <Clock className="h-5 w-5 text-rose-600" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Guest Queries & Onboarding Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">

                            {/* Guest Queries */}
                            <Card className="rounded-lg shadow-sm border-border h-full flex flex-col transition-all hover:shadow-md bg-card">
                                <CardHeader className="py-3 px-4 border-b border-border bg-muted/30 flex flex-row items-center justify-between space-y-0">
                                    <CardTitle className="text-[10px] font-black flex items-center gap-2 text-muted-foreground uppercase tracking-[0.2em]">
                                        <HelpCircle className="h-4 w-4 text-foreground opacity-50" />
                                        Inbound Queries
                                    </CardTitle>
                                    <Badge variant="outline" className="bg-card text-foreground border-border text-[9px] font-black rounded-md h-5 px-2">{queries.length}</Badge>
                                </CardHeader>
                                <CardContent className="p-0 flex-1 flex flex-col">
                                    <div className="divide-y divide-border/50 flex-1 overflow-y-auto max-h-[220px]">
                                        {queries.length === 0 && (
                                            <div className="p-12 text-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">NO QUERIES DISCOVERED.</div>
                                        )}
                                        {queries.map((q) => (
                                            <div key={q.name} className="p-4 hover:bg-muted/30 transition-colors flex items-start gap-4 group">
                                                <div className="mt-1">
                                                    {q.status === "Open" ? (
                                                        <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_0_2px_rgba(245,158,11,0.2)]" />
                                                    ) : (
                                                        <CheckSquare className="h-4 w-4 text-emerald-500" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[11px] font-black text-foreground line-clamp-2 uppercase tracking-tight group-hover:text-primary transition-colors">{q.query_text}</p>
                                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-50">{safeFormatDate(q.query_date, "MMM dd, HH:mm")}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-3 border-t border-border mt-auto bg-muted/20">
                                        <Button onClick={handleLogQuery} variant="outline" size="sm" className="w-full text-[10px] h-9 text-muted-foreground hover:bg-muted hover:text-foreground font-black uppercase tracking-widest rounded-lg border-border bg-card shadow-sm">
                                            + Log New Guest Query
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Onboarding Monitor */}
                            <Card className="rounded-lg shadow-sm border-border h-full flex flex-col transition-all hover:shadow-md bg-card">
                                <CardHeader className="py-3 px-4 border-b border-border bg-muted/30 flex flex-row items-center justify-between space-y-0">
                                    <CardTitle className="text-[10px] font-black flex items-center gap-2 text-muted-foreground uppercase tracking-[0.2em]">
                                        <Shield className="h-4 w-4 text-foreground opacity-50" />
                                        Compliance Tracker
                                    </CardTitle>
                                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/10 uppercase tracking-tighter">{Math.round(progress)}% COMPLETED</span>
                                </CardHeader>
                                <CardContent className="p-4 flex-1">
                                    <Progress value={progress} className="h-1.5 mb-4 bg-muted border border-border" />
                                    <div className="space-y-3">
                                        {onboardingSteps.map((step, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-3 group cursor-pointer"
                                                onClick={() => handleToggleOnboarding(step.key, step.done)}
                                            >
                                                <div className={`h-4 w-4 rounded-md border flex items-center justify-center shrink-0 transition-all ${step.done ? "bg-emerald-500 border-emerald-500 text-white shadow-sm" : "border-border bg-card group-hover:border-primary/50"}`}>
                                                    {step.done && <CheckSquare className="h-3 w-3" />}
                                                </div>
                                                <span className={`text-[11px] font-black uppercase tracking-tight transition-all leading-none ${step.done ? "text-muted-foreground/40 line-through decoration-muted" : "text-foreground group-hover:text-primary"}`}>
                                                    {step.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                        </div>

                        {/* Operations / Notes */}
                        <Card className="rounded-lg shadow-sm border-border bg-card overflow-hidden transition-all hover:shadow-md">
                            <CardHeader className="py-3 px-4 border-b border-border bg-muted/30">
                                <CardTitle className="text-[10px] font-black flex items-center gap-2 text-muted-foreground uppercase tracking-[0.2em]">
                                    <UserCog className="h-4 w-4 text-foreground opacity-50" /> Strategic Intelligence
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="flex gap-3">
                                    <Textarea
                                        className="h-20 text-xs font-bold uppercase tracking-tight resize-none bg-muted/20 border-border text-foreground placeholder:text-muted-foreground/40 focus:bg-background transition-colors min-h-[80px] rounded-lg p-3"
                                        placeholder="INPUT OPERATIONAL INTELLIGENCE OR STAFF NOTES..."
                                        defaultValue={booking.notes}
                                        onBlur={handleSaveNotes}
                                    />
                                    <Button size="icon" className="h-20 w-12 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-md transition-all active:scale-95">
                                        <Send className="h-5 w-5" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                    </div>

                </div>
            </div>
        </DashboardLayout>
    )
}
