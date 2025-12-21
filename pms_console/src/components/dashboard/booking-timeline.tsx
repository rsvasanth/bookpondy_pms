"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Booking {
  name: string
  guest_name: string
  property: string
  check_in_date: string
  check_out_date: string
  reservation_status: string
}

const statusConfig = {
  Confirmed: { label: "Confirmed", className: "bg-green-500/10 text-green-600" },
  Pending: { label: "Pending", className: "bg-yellow-500/10 text-yellow-600" },
  Cancelled: { label: "Cancelled", className: "bg-red-500/10 text-red-600" },
  "Checked-In": { label: "Checked-In", className: "bg-blue-500/10 text-blue-600" },
  "Enquiry": { label: "Enquiry", className: "bg-gray-500/10 text-gray-600" }
}

export function BookingTimeline({ bookings = [] }: { bookings?: Booking[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Upcoming Bookings (7 Days)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {bookings.map((booking) => {
          // Default to pending style if status not found
          const statusInfo = statusConfig[booking.reservation_status as keyof typeof statusConfig] || statusConfig["Pending"] // Fallback
          return (
            <div
              key={booking.name}
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="space-y-1">
                <p className="font-medium">{booking.guest_name}</p>
                <p className="text-sm text-muted-foreground">{booking.property}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {booking.check_in_date} - {booking.check_out_date}
                </p>
                <Badge className={cn("mt-1", statusInfo.className)}>{statusInfo.label}</Badge>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
