"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
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
} from "lucide-react"

interface BookingDetailsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking: {
    id: string
    guestName: string
    guestEmail: string
    guestPhone: string
    property: string
    roomType: string
    checkIn: string
    checkOut: string
    nights: number
    guests: number
    totalAmount: number
    status: "confirmed" | "pending" | "cancelled" | "completed"
    paymentStatus: "paid" | "partial" | "pending"
  } | null
}

const statusConfig = {
  confirmed: { label: "Confirmed", className: "bg-green-500/10 text-green-600" },
  pending: { label: "Pending", className: "bg-yellow-500/10 text-yellow-600" },
  cancelled: { label: "Cancelled", className: "bg-red-500/10 text-red-600" },
  completed: { label: "Completed", className: "bg-blue-500/10 text-blue-600" },
}

const paymentStatusConfig = {
  paid: { label: "Paid", className: "bg-green-500/10 text-green-600" },
  partial: { label: "Partial", className: "bg-orange-500/10 text-orange-600" },
  pending: { label: "Pending", className: "bg-yellow-500/10 text-yellow-600" },
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Booking #{booking.id}</SheetTitle>
            <Badge className={statusConfig[booking.status].className}>{statusConfig[booking.status].label}</Badge>
          </div>
        </SheetHeader>

        <Tabs defaultValue="details" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4 space-y-6">
            {/* Guest Info */}
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {booking.guestName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">{booking.guestName}</h3>
                <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" />
                    {booking.guestEmail}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" />
                    {booking.guestPhone}
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <MessageSquare className="mr-1.5 h-4 w-4" />
                Message
              </Button>
            </div>

            <Separator />

            {/* Property Info */}
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 text-sm font-medium">
                <Building2 className="h-4 w-4" />
                Property Details
              </h4>
              <div className="rounded-lg border p-3">
                <p className="font-medium">{booking.property}</p>
                <p className="text-sm text-muted-foreground">{booking.roomType}</p>
                <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  {booking.guests} Guest(s)
                </div>
              </div>
            </div>

            {/* Stay Dates */}
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 text-sm font-medium">
                <CalendarIcon className="h-4 w-4" />
                Stay Duration
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Check-in</p>
                  <p className="font-medium">{formatDate(booking.checkIn)}</p>
                  <p className="text-sm text-muted-foreground">2:00 PM</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Check-out</p>
                  <p className="font-medium">{formatDate(booking.checkOut)}</p>
                  <p className="text-sm text-muted-foreground">11:00 AM</p>
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground">{booking.nights} night(s)</p>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent">
                <Pencil className="mr-1.5 h-4 w-4" />
                Modify
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                <Printer className="mr-1.5 h-4 w-4" />
                Invoice
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="payment" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Payment Status</span>
              <Badge className={paymentStatusConfig[booking.paymentStatus].className}>
                {paymentStatusConfig[booking.paymentStatus].label}
              </Badge>
            </div>

            <div className="rounded-lg border p-4">
              <h4 className="mb-3 font-medium">Payment Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Room Charges</span>
                  <span>₹{Math.round(booking.totalAmount / 1.18).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CGST (9%)</span>
                  <span>₹{Math.round((booking.totalAmount / 1.18) * 0.09).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SGST (9%)</span>
                  <span>₹{Math.round((booking.totalAmount / 1.18) * 0.09).toLocaleString("en-IN")}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span className="flex items-center text-primary">
                    <IndianRupee className="h-4 w-4" />
                    {booking.totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {booking.paymentStatus !== "paid" && (
              <Button className="w-full bg-[#E68B47] hover:bg-[#c97339]">
                <CreditCard className="mr-2 h-4 w-4" />
                Record Payment
              </Button>
            )}
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/10">
                  <Clock className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Booking Created</p>
                  <p className="text-xs text-muted-foreground">Dec 10, 2025 at 10:30 AM</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Confirmation Email Sent</p>
                  <p className="text-xs text-muted-foreground">Dec 10, 2025 at 10:31 AM</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <CreditCard className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Payment Received</p>
                  <p className="text-xs text-muted-foreground">Dec 10, 2025 at 10:45 AM via UPI</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
