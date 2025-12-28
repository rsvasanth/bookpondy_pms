import { useNavigate, useParams } from "react-router-dom"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { useLocalDoc } from "@/hooks/use-local-data"
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

    // Derived State / Mocks for UI Demo
    const onboardingSteps = [
        { label: "Identity Verified", done: !!booking?.guest_id_image },
        { label: "Deposit Paid", done: true },
        { label: "Rental Signed", done: false },
        { label: "Security Collected", done: false },
        { label: "Guide Sent", done: true },
    ]
    const completedSteps = onboardingSteps.filter(s => s.done).length
    const progress = (completedSteps / onboardingSteps.length) * 100

    const guestQueries = [
        { id: 1, text: "Is early check-in available?", status: "Open", date: "2h ago" },
        { id: 2, text: "Do you provide a hair dryer?", status: "Resolved", date: "Yesterday" }
    ]

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

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Confirmed": return "bg-green-50 text-green-700 border-green-200"
            case "Checked-In": return "bg-blue-50 text-blue-700 border-blue-200"
            case "Checked-Out": return "bg-slate-50 text-slate-700 border-slate-200"
            case "Cancelled": return "bg-red-50 text-red-700 border-red-200"
            default: return "bg-slate-50 text-slate-700 border-slate-200"
        }
    }

    return (
        <DashboardLayout>
            {/* Added max-h-screen/overflow logic to help fitting if needed, but primarily relying on compactness */}
            <div className="flex flex-col space-y-3 pb-8 w-full max-w-screen-2xl mx-auto px-2">

                {/* Compact Header */}
                <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => navigate("/bookings")} className="h-8 w-8 -ml-2 hover:bg-slate-100 rounded-full">
                            <ArrowLeft className="h-4 w-4 text-slate-600" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg font-bold text-gray-900 leading-none">
                                    {booking.guest_name}
                                </h1>
                                <Badge variant="outline" className={`font-semibold text-[10px] px-2 py-0.5 h-5 ${getStatusColor(booking.reservation_status)}`}>
                                    {booking.reservation_status}
                                </Badge>
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide mt-0.5">
                                {booking.name} • {booking.property}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 gap-2 bg-white hidden sm:flex border-blue-200 text-blue-700 hover:bg-blue-50 font-semibold">
                                    <MessageCircle className="h-3.5 w-3.5" />
                                    Communication
                                </Button>
                            </SheetTrigger>
                            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0 gap-0">
                                <SheetHeader className="p-4 border-b border-slate-100 bg-slate-50/50">
                                    <SheetTitle className="flex items-center gap-2 text-base">
                                        <MessageSquare className="h-4 w-4 text-blue-500" />
                                        Communication Hub
                                    </SheetTitle>
                                    <SheetDescription className="text-xs">
                                        Chat with {booking.guest_name}
                                    </SheetDescription>
                                </SheetHeader>
                                {/* Chat Interface - Reused from previous widget */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                                    <div className="flex gap-3">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">SYS</div>
                                        <div className="bg-white p-3 rounded-r-xl rounded-bl-xl shadow-sm border border-slate-100 max-w-[85%]">
                                            <p className="text-[10px] font-bold text-slate-400 mb-1">System • Yesterday</p>
                                            <p className="text-sm text-slate-700">Booking confirmation #{booking.name} sent via Email.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 flex-row-reverse">
                                        <Avatar className="h-8 w-8 shrink-0">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${booking.guest_name}`} />
                                            <AvatarFallback>{booking.guest_name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="bg-blue-600 p-3 rounded-l-xl rounded-br-xl shadow-sm border border-blue-600 max-w-[85%] text-white">
                                            <p className="text-[10px] font-bold text-blue-200 mb-1">Guest • 2h ago</p>
                                            <p className="text-sm">Hi! Is it possible to check in an hour early? Our flight lands at 10 AM.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 border-t border-slate-100">
                                    <div className="relative">
                                        <Textarea placeholder="Type a message..." className="min-h-[80px] bg-slate-50 border-slate-200 resize-none pr-12 text-sm" />
                                        <Button size="icon" className="absolute bottom-2 right-2 h-8 w-8 rounded-lg bg-[#ff3924] hover:bg-[#ff3924]/90">
                                            <Send className="h-4 w-4 text-white" />
                                        </Button>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>

                        <Button variant="ghost" size="icon" className="h-8 w-8 sm:hidden">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        <Button className="bg-[#ff3924] hover:bg-[#ff3924]/90 text-white font-bold text-xs h-8 shadow-sm px-4" size="sm">
                            {(booking.reservation_status === "Confirmed") ? "Check-In" : "Manage"}
                        </Button>
                    </div>
                </div>

                {/* Dashboard-Style Layout - High Density */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

                    {/* LEFT COLUMN: Context (Guest & Stay) */}
                    <div className="lg:col-span-3 space-y-4">

                        {/* Guest Profile - Compact with RED Header */}
                        <Card className="rounded-xl shadow-sm border-slate-100 overflow-hidden group hover:border-red-200 transition-colors">
                            <CardHeader className="py-2.5 px-3 bg-red-50 border-b border-red-100">
                                <CardTitle className="text-xs font-bold flex items-center justify-between text-red-900">
                                    Guest Profile
                                    <Badge variant="secondary" className="text-[9px] h-4 bg-white text-red-600 border-red-100">Super Guest</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3">
                                <div className="flex items-center gap-3 mb-3">
                                    <Avatar className="h-10 w-10 border border-slate-100 shadow-sm">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${booking.guest_name}`} />
                                        <AvatarFallback>{booking.guest_name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-xs text-gray-900 truncate">{booking.guest_name}</h3>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            {booking.guest_id_image ? (
                                                <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-sm flex items-center gap-1 w-fit">
                                                    <Shield className="h-2.5 w-2.5" /> ID Verified
                                                </span>
                                            ) : (
                                                <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-sm">ID Unverified</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs">
                                        <div className="h-6 w-6 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                                            <Mail className="h-3 w-3 text-slate-400" />
                                        </div>
                                        <span className="text-slate-600 truncate text-[11px] font-medium">{booking.guest_email || "No Email"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <div className="h-6 w-6 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                                            <Phone className="h-3 w-3 text-slate-400" />
                                        </div>
                                        <span className="text-slate-600 text-[11px] font-medium">{booking.guest_phone || "No Phone"}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Stay Details - Compact with BLUE Header */}
                        <Card className="rounded-xl shadow-sm border-slate-100 overflow-hidden group hover:border-blue-200 transition-colors">
                            <CardHeader className="py-2.5 px-3 bg-blue-50 border-b border-blue-100">
                                <CardTitle className="text-xs font-bold flex items-center gap-2 text-blue-900">
                                    <Calendar className="h-3 w-3 text-blue-500" /> Stay Overview
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 space-y-3">
                                <div className="grid grid-cols-2 gap-2 text-center">
                                    <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Check-In</span>
                                        <span className="font-bold text-xs text-slate-800">{safeFormatDate(booking.check_in_date, "MMM dd")}</span>
                                    </div>
                                    <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Check-Out</span>
                                        <span className="font-bold text-xs text-slate-800">{safeFormatDate(booking.check_out_date, "MMM dd")}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center bg-blue-50/50 p-2 rounded-md border border-blue-50">
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded bg-white flex items-center justify-center text-blue-500 font-bold text-[10px] shadow-sm">
                                            {booking.allocated_unit?.substring(0, 2) || "NA"}
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-blue-300 uppercase leading-none">Unit</p>
                                            <p className="text-xs font-bold text-blue-900 leading-tight">{booking.allocated_unit || "Unassigned"}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="bg-white border-blue-100 text-blue-600 text-[9px] h-4">
                                        {booking.unit_category || "Std"}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                    </div>

                    {/* RIGHT COLUMN: Business (Financials, Onboarding, Queries) */}
                    <div className="lg:col-span-9 space-y-4">

                        {/* Financials Row - Ultra Compact */}
                        <div className="grid grid-cols-3 gap-3">
                            <Card className="rounded-xl shadow-sm border-slate-100 bg-slate-900 text-white overflow-hidden">
                                <CardContent className="p-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Value</p>
                                        <p className="text-lg font-bold leading-none">₹{booking.total_amount?.toLocaleString()}</p>
                                    </div>
                                    <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center">
                                        <Wallet className="h-4 w-4 text-slate-400" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="rounded-xl shadow-sm border-slate-100">
                                <CardContent className="p-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Paid</p>
                                        <p className="text-lg font-bold text-green-600 leading-none">₹0</p>
                                    </div>
                                    <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center">
                                        <CheckSquare className="h-4 w-4 text-green-500" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="rounded-xl shadow-sm border-slate-100">
                                <CardContent className="p-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Due Now</p>
                                        <p className="text-lg font-bold text-[#ff3924] leading-none">₹{booking.total_amount?.toLocaleString()}</p>
                                    </div>
                                    <div className="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center">
                                        <Clock className="h-4 w-4 text-[#ff3924]" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Guest Queries & Onboarding Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">

                            {/* Guest Queries (New Feature) - AMBER Header */}
                            <Card className="rounded-xl shadow-sm border-slate-100 h-full flex flex-col group hover:border-amber-200 transition-colors">
                                <CardHeader className="py-2.5 px-3 bg-amber-50 border-b border-amber-100 flex flex-row items-center justify-between space-y-0">
                                    <CardTitle className="text-xs font-bold flex items-center gap-2 text-amber-900">
                                        <HelpCircle className="h-3.5 w-3.5 text-amber-500" />
                                        Guest Queries
                                    </CardTitle>
                                    <Badge variant="secondary" className="bg-white text-amber-600 border-amber-100 text-[9px] h-4">2 Open</Badge>
                                </CardHeader>
                                <CardContent className="p-0 flex-1">
                                    <div className="divide-y divide-slate-50">
                                        {guestQueries.map((q) => (
                                            <div key={q.id} className="p-2.5 hover:bg-slate-50/50 transition-colors flex items-start gap-2.5">
                                                <div className="mt-1">
                                                    {q.status === "Open" ? (
                                                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_0_2px_rgba(245,158,11,0.2)]" />
                                                    ) : (
                                                        <CheckSquare className="h-3 w-3 text-green-500" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[11px] font-semibold text-slate-800 line-clamp-1">{q.text}</p>
                                                    <p className="text-[9px] text-slate-400 mt-0.5">{q.date}</p>
                                                </div>
                                                <Button size="icon" variant="ghost" className="h-5 w-5 text-slate-300">
                                                    <MoreHorizontal className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-2 border-t border-slate-50 mt-auto">
                                        <Button variant="ghost" size="sm" className="w-full text-[10px] h-7 text-slate-500 hover:bg-slate-50 hover:text-slate-800">
                                            + Log New Query
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Onboarding Monitor - EMERALD Header */}
                            <Card className="rounded-xl shadow-sm border-slate-100 h-full flex flex-col group hover:border-emerald-200 transition-colors">
                                <CardHeader className="py-2.5 px-3 bg-emerald-50 border-b border-emerald-100 flex flex-row items-center justify-between space-y-0">
                                    <CardTitle className="text-xs font-bold flex items-center gap-2 text-emerald-900">
                                        <CheckSquare className="h-3.5 w-3.5 text-emerald-500" />
                                        Onboarding Status
                                    </CardTitle>
                                    <span className="text-[9px] font-bold text-emerald-600 bg-white px-1.5 py-0.5 rounded-sm border border-emerald-100">{Math.round(progress)}%</span>
                                </CardHeader>
                                <CardContent className="p-3 flex-1">
                                    <Progress value={progress} className="h-1 mb-3 bg-slate-100" indicatorClassName="bg-emerald-500" />
                                    <div className="space-y-1.5">
                                        {onboardingSteps.map((step, idx) => (
                                            <div key={idx} className="flex items-center gap-2 group">
                                                <div className={`h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0 transition-colors ${step.done ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200 bg-white group-hover:border-slate-300"}`}>
                                                    {step.done && <CheckSquare className="h-2.5 w-2.5" />}
                                                </div>
                                                <span className={`text-[11px] font-medium leading-none ${step.done ? "text-slate-400 line-through decoration-slate-300" : "text-slate-600"}`}>
                                                    {step.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                        </div>

                        {/* Operations / Notes - Compact - SLATE Header */}
                        <Card className="rounded-xl shadow-sm border-slate-100">
                            <CardHeader className="py-2.5 px-3 bg-slate-50 border-b border-slate-100">
                                <CardTitle className="text-xs font-bold flex items-center gap-2 text-slate-700">
                                    <UserCog className="h-3.5 w-3.5 text-slate-400" /> Operations Notes
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3">
                                <div className="flex gap-2">
                                    <Textarea className="h-16 text-xs resize-none bg-yellow-50/30 border-yellow-100 text-slate-700 placeholder:text-slate-400 focus:bg-white transition-colors min-h-[64px]" placeholder="Add confidential staff notes..." />
                                    <Button size="icon" className="h-16 w-10 shrink-0 bg-slate-900 text-white hover:bg-slate-800 rounded-lg">
                                        <Send className="h-4 w-4" />
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
