"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CalendarIcon,
  User,
  Phone,
  Mail,
  Building2,
  IndianRupee,
  Clock,
  MessageSquare,
  Pencil,
  Printer,
  CreditCard,
  Check,
  ArrowRight,
  Copy,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface BookingDetailsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking: {
    id: string
    guestName: string
    guestEmail: string
    guestPhone: string
    property: string
    unitCategory: string
    checkIn: string
    checkOut: string
    nights: number
    guests: number
    totalAmount: number
    status: "Confirmed" | "Pending" | "Cancelled" | "Completed" | "Checked-In"
    paymentStatus: "Paid" | "Partial" | "Pending" | "Unpaid"
  } | null
}

const statusConfig: Record<string, { label: string; className: string; bgColor: string }> = {
  Confirmed: { label: "Confirmed", className: "bg-green-500/10 text-green-600 border-green-200", bgColor: "bg-green-500" },
  Pending: { label: "Pending", className: "bg-yellow-500/10 text-yellow-600 border-yellow-200", bgColor: "bg-yellow-500" },
  Cancelled: { label: "Cancelled", className: "bg-red-500/10 text-red-600 border-red-200", bgColor: "bg-red-500" },
  Completed: { label: "Completed", className: "bg-gray-500/10 text-gray-600 border-gray-200", bgColor: "bg-gray-500" },
  "Checked-In": { label: "Checked-In", className: "bg-blue-500/10 text-blue-600 border-blue-200", bgColor: "bg-blue-500" },
}

const paymentStatusConfig: Record<string, { label: string; className: string }> = {
  Paid: { label: "Paid", className: "bg-green-500/10 text-green-600 border-green-200" },
  Partial: { label: "Partial", className: "bg-orange-500/10 text-orange-600 border-orange-200" },
  Pending: { label: "Pending", className: "bg-yellow-500/10 text-yellow-600 border-yellow-200" },
  Unpaid: { label: "Unpaid", className: "bg-red-500/10 text-red-600 border-red-200" },
}

export function BookingDetailsSheet({ open, onOpenChange, booking }: BookingDetailsSheetProps) {
  if (!booking) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    })
  }

  const getStatus = (status: string) => statusConfig[status] || statusConfig.Pending
  const getPaymentStatus = (status: string) => paymentStatusConfig[status] || paymentStatusConfig.Pending

  const baseAmount = Math.round(booking.totalAmount / 1.18)
  const gstAmount = Math.round(baseAmount * 0.18)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl bg-white border-l-0 shadow-2xl p-0">
        {/* Premium Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
          <SheetHeader className="p-6 pb-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <SheetTitle className="text-xl font-bold text-[#0A0A0A]">Booking Details</SheetTitle>
                  <SheetDescription className="sr-only">Detailed view of booking information</SheetDescription>
                </div>
                <button className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 hover:text-[#FF3D2E] transition-colors">
                  <span className="font-mono">{booking.id}</span>
                  <Copy className="h-3 w-3" />
                </button>
              </div>
              <Badge className={cn("rounded-lg border px-3 py-1.5 font-bold text-[10px] uppercase tracking-wider", getStatus(booking.status).className)}>
                {getStatus(booking.status).label}
              </Badge>
            </div>
          </SheetHeader>

          {/* Stay Summary Card */}
          <div className="px-6 pb-5">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
              <div className="flex-1 text-center">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">Check-in</p>
                <p className="text-lg font-bold text-[#0A0A0A]">{formatShortDate(booking.checkIn)}</p>
                <p className="text-[10px] text-gray-400 font-medium">2:00 PM</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5 text-[#FF3D2E]">
                  <div className="h-0.5 w-6 bg-[#FF3D2E]/30 rounded-full" />
                  <ArrowRight className="h-4 w-4" />
                  <div className="h-0.5 w-6 bg-[#FF3D2E]/30 rounded-full" />
                </div>
                <span className="text-[10px] font-bold text-[#FF3D2E]">{booking.nights} NIGHTS</span>
              </div>
              <div className="flex-1 text-center">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">Check-out</p>
                <p className="text-lg font-bold text-[#0A0A0A]">{formatShortDate(booking.checkOut)}</p>
                <p className="text-[10px] text-gray-400 font-medium">11:00 AM</p>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="details" className="flex-1">
          <div className="px-6 border-b border-gray-100">
            <TabsList className="bg-transparent p-0 h-12 w-full justify-start gap-6">
              <TabsTrigger value="details" className="px-0 h-12 data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF3D2E] font-bold text-xs uppercase tracking-wider text-gray-400 data-[state=active]:text-[#0A0A0A]">
                Details
              </TabsTrigger>
              <TabsTrigger value="payment" className="px-0 h-12 data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF3D2E] font-bold text-xs uppercase tracking-wider text-gray-400 data-[state=active]:text-[#0A0A0A]">
                Payment
              </TabsTrigger>
              <TabsTrigger value="activity" className="px-0 h-12 data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF3D2E] font-bold text-xs uppercase tracking-wider text-gray-400 data-[state=active]:text-[#0A0A0A]">
                Activity
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="details" className="p-6 space-y-6 focus-visible:outline-none pb-32">
            {/* Guest Info */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF3D2E]">
                <div className="h-1.5 w-1.5 rounded-full bg-[#FF3D2E]" />
                Guest Information
              </h3>
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-2xl bg-red-50 text-[#FF3D2E] flex items-center justify-center font-bold text-lg">
                  {booking.guestName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 space-y-2">
                  <h4 className="font-bold text-lg text-[#0A0A0A]">{booking.guestName}</h4>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-500 font-medium">
                      <Mail className="h-4 w-4 text-gray-400" />
                      {booking.guestEmail || "N/A"}
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 font-medium">
                      <Phone className="h-4 w-4 text-gray-400" />
                      {booking.guestPhone || "N/A"}
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-xl font-bold text-[11px] gap-1.5 border-gray-100 hover:bg-red-50 hover:text-[#FF3D2E] hover:border-red-200">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Message
                </Button>
              </div>
            </div>

            <Separator className="bg-gray-100" />

            {/* Property Info */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF3D2E]">
                <div className="h-1.5 w-1.5 rounded-full bg-[#FF3D2E]" />
                Property Details
              </h3>
              <div className="rounded-2xl border border-gray-100 p-4 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[#0A0A0A]">{booking.property}</p>
                    <p className="text-sm text-muted-foreground font-medium">{booking.unitCategory}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-gray-600">
                      <User className="h-4 w-4 text-gray-400" />
                      {booking.guests} Guest(s)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-12 rounded-xl font-bold text-sm gap-2 border-gray-100 hover:bg-gray-50">
                <Pencil className="h-4 w-4" />
                Modify Booking
              </Button>
              <Button variant="outline" className="h-12 rounded-xl font-bold text-sm gap-2 border-gray-100 hover:bg-gray-50">
                <Printer className="h-4 w-4" />
                Print Invoice
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="payment" className="p-6 space-y-6 focus-visible:outline-none pb-32">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Payment Status</span>
              <Badge className={cn("rounded-lg border px-3 py-1.5 font-bold text-[10px] uppercase tracking-wider", getPaymentStatus(booking.paymentStatus).className)}>
                {getPaymentStatus(booking.paymentStatus).label}
              </Badge>
            </div>

            <div className="rounded-2xl border border-gray-100 p-5 space-y-4 bg-gray-50/50">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Financial Breakdown</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Accommodation ({booking.nights} nights)</span>
                  <span className="font-bold text-[#0A0A0A]">₹{baseAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">CGST (9%)</span>
                  <span className="font-medium text-gray-600">₹{Math.round(gstAmount / 2).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">SGST (9%)</span>
                  <span className="font-medium text-gray-600">₹{Math.round(gstAmount / 2).toLocaleString("en-IN")}</span>
                </div>
                <Separator className="my-2 bg-gray-200" />
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#0A0A0A]">Total Amount</span>
                  <span className="text-2xl font-bold text-[#FF3D2E]">
                    ₹{booking.totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {booking.paymentStatus !== "Paid" && (
              <Button className="w-full h-14 bg-[#FF3D2E] hover:bg-[#e63225] text-white rounded-xl font-bold text-sm gap-2 shadow-xl shadow-red-500/20">
                <CreditCard className="h-5 w-5" />
                Record Payment
              </Button>
            )}
          </TabsContent>

          <TabsContent value="activity" className="p-6 focus-visible:outline-none pb-32">
            <div className="space-y-1">
              {/* Timeline */}
              <div className="relative pl-8 pb-8 border-l-2 border-green-200 last:border-transparent last:pb-0">
                <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm text-[#0A0A0A]">Booking Created</p>
                  <p className="text-[11px] text-muted-foreground font-medium">Dec 10, 2025 at 10:30 AM</p>
                </div>
              </div>
              <div className="relative pl-8 pb-8 border-l-2 border-blue-200 last:border-transparent last:pb-0">
                <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
                  <Mail className="h-3 w-3 text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm text-[#0A0A0A]">Confirmation Email Sent</p>
                  <p className="text-[11px] text-muted-foreground font-medium">Dec 10, 2025 at 10:31 AM</p>
                </div>
              </div>
              <div className="relative pl-8 pb-0 border-l-2 border-transparent">
                <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full bg-[#FF3D2E] flex items-center justify-center">
                  <CreditCard className="h-3 w-3 text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm text-[#0A0A0A]">Payment Received</p>
                  <p className="text-[11px] text-muted-foreground font-medium">Dec 10, 2025 at 10:45 AM via UPI</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
