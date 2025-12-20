"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Booking {
  id: string
  guestName: string
  property: string
  checkIn: string
  checkOut: string
  status: "confirmed" | "pending" | "cancelled"
}

const bookings: Booking[] = [
  {
    id: "1",
    guestName: "Priya Sharma",
    property: "Ocean View Villa",
    checkIn: "Dec 18",
    checkOut: "Dec 22",
    status: "confirmed",
  },
  {
    id: "2",
    guestName: "Amit Patel",
    property: "Beach House Resort",
    checkIn: "Dec 19",
    checkOut: "Dec 21",
    status: "confirmed",
  },
  {
    id: "3",
    guestName: "Sneha Reddy",
    property: "Heritage Homestay",
    checkIn: "Dec 20",
    checkOut: "Dec 25",
    status: "pending",
  },
  {
    id: "4",
    guestName: "Vikram Singh",
    property: "Ocean View Villa",
    checkIn: "Dec 23",
    checkOut: "Dec 27",
    status: "confirmed",
  },
  {
    id: "5",
    guestName: "Meera Nair",
    property: "Lakeside Cottage",
    checkIn: "Dec 24",
    checkOut: "Dec 28",
    status: "pending",
  },
]

const statusConfig = {
  confirmed: { label: "Confirmed", className: "bg-green-500/10 text-green-600" },
  pending: { label: "Pending", className: "bg-yellow-500/10 text-yellow-600" },
  cancelled: { label: "Cancelled", className: "bg-red-500/10 text-red-600" },
}

export function BookingTimeline() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Upcoming Bookings (7 Days)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {bookings.map((booking) => {
          const statusInfo = statusConfig[booking.status]
          return (
            <div
              key={booking.id}
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="space-y-1">
                <p className="font-medium">{booking.guestName}</p>
                <p className="text-sm text-muted-foreground">{booking.property}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {booking.checkIn} - {booking.checkOut}
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
