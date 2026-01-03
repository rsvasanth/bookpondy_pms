"use client"

import { useState } from "react"
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
import { CheckInDialog } from "./check-in-dialog"
import { CheckOutDialog } from "./check-out-dialog"

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
  Confirmed: { label: "Confirmed", className: "bg-success/10 text-success border-success/20", bgColor: "bg-success" },
  Pending: { label: "Pending", className: "bg-warning/10 text-warning border-warning/20", bgColor: "bg-warning" },
  Cancelled: { label: "Cancelled", className: "bg-error/10 text-error border-error/20", bgColor: "bg-error" },
  Completed: { label: "Completed", className: "bg-muted text-muted-foreground border-border", bgColor: "bg-muted-foreground" },
  "Checked-In": { label: "Checked-In", className: "bg-info/10 text-info border-info/20", bgColor: "bg-info" },
}

const paymentStatusConfig: Record<string, { label: string; className: string }> = {
  Paid: { label: "Paid", className: "bg-success/10 text-success border-success/20" },
  Partial: { label: "Partial", className: "bg-warning/10 text-warning border-warning/20" },
  Pending: { label: "Pending", className: "bg-warning/10 text-warning border-warning/20" },
  Unpaid: { label: "Unpaid", className: "bg-error/10 text-error border-error/20" },
}

export function BookingDetailsSheet({ open, onOpenChange, booking }: BookingDetailsSheetProps) {
  const [checkInOpen, setCheckInOpen] = useState(false)
  const [checkOutOpen, setCheckOutOpen] = useState(false)

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
                  <SheetTitle className="text-xl font-bold text-foreground">Booking Details</SheetTitle>
                  <SheetDescription className="sr-only">Detailed view of booking information</SheetDescription>
                </div>
                <button className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-error transition-colors">
                  <span className="font-mono">{booking.id}</span>
                  <Copy className="h-3 w-3" />
                </button>
              </div>
              <Badge className={cn("rounded-md border px-3 py-1.5 font-semibold text-xs", getStatus(booking.status).className)}>
                {getStatus(booking.status).label}
              </Badge>
            </div>
          </SheetHeader>

          {/* Stay Summary Card */}
          <div className="px-6 pb-5">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border">
              <div className="flex-1 text-center">
                <p className="text-xs font-semibold text-muted-foreground mb-1">Check-in</p>
                <p className="text-lg font-bold text-foreground">{formatShortDate(booking.checkIn)}</p>
                <p className="text-xs text-muted-foreground font-medium">2:00 PM</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5 text-error">
                  <div className="h-0.5 w-6 bg-error/30 rounded-full" />
                  <ArrowRight className="h-4 w-4" />
                  <div className="h-0.5 w-6 bg-error/30 rounded-full" />
                </div>
                <span className="text-xs font-bold text-error">{booking.nights} NIGHTS</span>
              </div>
              <div className="flex-1 text-center">
                <p className="text-xs font-semibold text-muted-foreground mb-1">Check-out</p>
                <p className="text-lg font-bold text-foreground">{formatShortDate(booking.checkOut)}</p>
                <p className="text-xs text-muted-foreground font-medium">11:00 AM</p>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="details" className="flex-1">
          <div className="px-6 border-b border-gray-100">
            <TabsList className="bg-transparent p-0 h-12 w-full justify-start gap-6">
              <TabsTrigger value="details" className="px-0 h-12 data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-error font-semibold text-xs text-muted-foreground data-[state=active]:text-foreground transition-all">
                Details
              </TabsTrigger>
              <TabsTrigger value="payment" className="px-0 h-12 data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-error font-semibold text-xs text-muted-foreground data-[state=active]:text-foreground transition-all">
                Payment
              </TabsTrigger>
              <TabsTrigger value="activity" className="px-0 h-12 data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-error font-semibold text-xs text-muted-foreground data-[state=active]:text-foreground transition-all">
                Activity
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="details" className="p-6 space-y-6 focus-visible:outline-none pb-32">
            {/* Guest Info */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2.5 text-xs font-bold text-error">
                <div className="h-1.5 w-1.5 rounded-full bg-error" />
                Guest Information
              </h3>
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-xl bg-error/10 text-error flex items-center justify-center font-bold text-lg">
                  {booking.guestName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-bold text-lg text-foreground">{booking.guestName}</h4>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground font-medium">
                      <Mail className="h-4 w-4 text-muted-foreground/60" />
                      {booking.guestEmail || "N/A"}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground font-medium">
                      <Phone className="h-4 w-4 text-muted-foreground/60" />
                      {booking.guestPhone || "N/A"}
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-md font-semibold text-xs gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Message
                </Button>
              </div>
            </div>

            <Separator className="bg-border" />

            {/* Property Info */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2.5 text-xs font-bold text-primary">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Property Details
              </h3>
              <div className="rounded-2xl border border-gray-100 p-4 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{booking.property}</p>
                    <p className="text-sm text-muted-foreground font-medium">{booking.unitCategory}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
                      <User className="h-4 w-4 text-muted-foreground/60" />
                      {booking.guests} Guest(s)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              {booking.status === "Confirmed" ? (
                <Button
                  className="h-12 rounded-md font-semibold text-sm gap-2 bg-success hover:bg-success/90 text-white"
                  onClick={() => setCheckInOpen(true)}
                >
                  <Check className="h-4 w-4" />
                  Check-in Guest
                </Button>
              ) : booking.status === "Checked-In" ? (
                <Button
                  className="h-12 rounded-md font-semibold text-sm gap-2 bg-error hover:bg-error/90 text-white"
                  onClick={() => setCheckOutOpen(true)}
                >
                  <ArrowRight className="h-4 w-4" />
                  Check-out Guest
                </Button>
              ) : (
                <Button variant="outline" className="h-12 rounded-md font-semibold text-sm gap-2 border-border hover:bg-muted" disabled>
                  <Check className="h-4 w-4" />
                  Stay Completed
                </Button>
              )}
              <Button variant="outline" className="h-12 rounded-md font-semibold text-sm gap-2 border-border hover:bg-muted">
                <Printer className="h-4 w-4" />
                Print Invoice
              </Button>
            </div>
          </TabsContent>

          <CheckInDialog
            open={checkInOpen}
            onOpenChange={setCheckInOpen}
            booking={{ ...booking, name: booking.id }}
            onSuccess={() => onOpenChange(false)}
          />
          <CheckOutDialog
            open={checkOutOpen}
            onOpenChange={setCheckOutOpen}
            booking={{ ...booking, name: booking.id }}
            onSuccess={() => onOpenChange(false)}
          />

          <TabsContent value="payment" className="p-6 space-y-6 focus-visible:outline-none pb-32">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Payment Status</span>
              <Badge className={cn("rounded-lg border px-3 py-1.5 font-bold text-[10px] uppercase tracking-wider", getPaymentStatus(booking.paymentStatus).className)}>
                {getPaymentStatus(booking.paymentStatus).label}
              </Badge>
            </div>

            <div className="rounded-xl border border-border p-5 space-y-4 bg-muted/30">
              <h4 className="text-xs font-bold text-muted-foreground">Financial Breakdown</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Accommodation ({booking.nights} nights)</span>
                  <span className="font-semibold text-foreground">₹{baseAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">CGST (9%)</span>
                  <span className="font-medium text-muted-foreground">₹{Math.round(gstAmount / 2).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">SGST (9%)</span>
                  <span className="font-medium text-muted-foreground">₹{Math.round(gstAmount / 2).toLocaleString("en-IN")}</span>
                </div>
                <Separator className="my-2 bg-border" />
                <div className="flex justify-between items-center">
                  <span className="font-bold text-foreground">Total Amount</span>
                  <span className="text-2xl font-bold text-error">
                    ₹{booking.totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {booking.paymentStatus !== "Paid" && (
              <Button className="w-full h-14 bg-error hover:bg-error/90 text-white rounded-md font-bold text-sm gap-2 shadow-lg shadow-error/20">
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
              <div className="relative pl-8 pb-8 border-l-2 border-primary/20 last:border-transparent last:pb-0">
                <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full bg-info flex items-center justify-center">
                  <Mail className="h-3 w-3 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">Confirmation Email Sent</p>
                  <p className="text-xs text-muted-foreground font-medium">Dec 10, 2025 at 10:31 AM</p>
                </div>
              </div>
              <div className="relative pl-8 pb-0 border-l-2 border-transparent">
                <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full bg-error flex items-center justify-center">
                  <CreditCard className="h-3 w-3 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">Payment Received</p>
                  <p className="text-xs text-muted-foreground font-medium">Dec 10, 2025 at 10:45 AM via UPI</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
