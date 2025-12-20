"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns"
import { cn } from "@/lib/utils"

interface CalendarBooking {
  id: string
  guestName: string
  property: string
  checkIn: Date
  checkOut: Date
  status: "confirmed" | "pending" | "cancelled"
}

const bookings: CalendarBooking[] = [
  {
    id: "BK2401",
    guestName: "Priya Sharma",
    property: "Ocean View Villa",
    checkIn: new Date(2025, 11, 18),
    checkOut: new Date(2025, 11, 22),
    status: "confirmed",
  },
  {
    id: "BK2402",
    guestName: "Amit Patel",
    property: "Beach House Resort",
    checkIn: new Date(2025, 11, 19),
    checkOut: new Date(2025, 11, 21),
    status: "confirmed",
  },
  {
    id: "BK2403",
    guestName: "Sneha Reddy",
    property: "Heritage Homestay",
    checkIn: new Date(2025, 11, 20),
    checkOut: new Date(2025, 11, 25),
    status: "pending",
  },
  {
    id: "BK2404",
    guestName: "Vikram Singh",
    property: "Ocean View Villa",
    checkIn: new Date(2025, 11, 23),
    checkOut: new Date(2025, 11, 27),
    status: "confirmed",
  },
  {
    id: "BK2405",
    guestName: "Meera Nair",
    property: "Hill View Retreat",
    checkIn: new Date(2025, 11, 24),
    checkOut: new Date(2025, 11, 28),
    status: "pending",
  },
]

const statusColors = {
  confirmed: "bg-green-500",
  pending: "bg-yellow-500",
  cancelled: "bg-red-500",
}

interface CalendarViewProps {
  onAddBooking: () => void
  onSelectBooking: (booking: CalendarBooking) => void
}

export function CalendarView({ onAddBooking, onSelectBooking }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Get bookings for selected date
  const selectedDateBookings = selectedDate
    ? bookings.filter((booking) => {
        const days = eachDayOfInterval({ start: booking.checkIn, end: booking.checkOut })
        return days.some((day) => isSameDay(day, selectedDate))
      })
    : []

  // Get all days with bookings for the current month
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const bookedDays = new Map<string, CalendarBooking[]>()

  bookings.forEach((booking) => {
    const days = eachDayOfInterval({
      start: booking.checkIn < monthStart ? monthStart : booking.checkIn,
      end: booking.checkOut > monthEnd ? monthEnd : booking.checkOut,
    })
    days.forEach((day) => {
      const key = format(day, "yyyy-MM-dd")
      if (!bookedDays.has(key)) {
        bookedDays.set(key, [])
      }
      bookedDays.get(key)!.push(booking)
    })
  })

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
      {/* Calendar */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>{format(currentMonth, "MMMM yyyy")}</CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Legend */}
          <div className="mb-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span>Confirmed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span>Cancelled</span>
            </div>
          </div>

          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="w-full"
            classNames={{
              day: "relative h-12 w-full",
            }}
            components={{
              DayButton: ({ day, modifiers, ...props }) => {
                const dateKey = format(day.date, "yyyy-MM-dd")
                const dayBookings = bookedDays.get(dateKey) || []

                return (
                  <button
                    {...props}
                    className={cn(
                      "relative flex h-12 w-full flex-col items-center justify-start rounded-md p-1 text-sm hover:bg-accent",
                      modifiers.selected && "bg-primary text-primary-foreground hover:bg-primary",
                      modifiers.today && !modifiers.selected && "bg-accent",
                      modifiers.outside && "text-muted-foreground opacity-50",
                    )}
                  >
                    <span>{day.date.getDate()}</span>
                    {dayBookings.length > 0 && (
                      <div className="mt-0.5 flex gap-0.5">
                        {dayBookings.slice(0, 3).map((booking, idx) => (
                          <div key={idx} className={cn("h-1.5 w-1.5 rounded-full", statusColors[booking.status])} />
                        ))}
                        {dayBookings.length > 3 && (
                          <span className="text-[10px] text-muted-foreground">+{dayBookings.length - 3}</span>
                        )}
                      </div>
                    )}
                  </button>
                )
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            {selectedDate ? format(selectedDate, "EEEE, MMMM d") : "Select a date"}
          </CardTitle>
          <Button size="sm" className="bg-[#E68B47] hover:bg-[#c97339]" onClick={onAddBooking}>
            <Plus className="mr-1 h-4 w-4" />
            Add
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            {selectedDateBookings.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-center text-muted-foreground">
                <p>No bookings for this date</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="cursor-pointer rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    onClick={() =>
                      onSelectBooking({
                        ...booking,
                        checkIn: booking.checkIn,
                        checkOut: booking.checkOut,
                      })
                    }
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{booking.guestName}</p>
                        <p className="text-sm text-muted-foreground">{booking.property}</p>
                      </div>
                      <Badge
                        className={cn(
                          booking.status === "confirmed" && "bg-green-500/10 text-green-600",
                          booking.status === "pending" && "bg-yellow-500/10 text-yellow-600",
                          booking.status === "cancelled" && "bg-red-500/10 text-red-600",
                        )}
                      >
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {format(booking.checkIn, "MMM d")} - {format(booking.checkOut, "MMM d, yyyy")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
