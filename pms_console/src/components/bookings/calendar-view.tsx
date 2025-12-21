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

// Status colors mapping
const statusColors: Record<string, string> = {
  Confirmed: "bg-green-500",
  Pending: "bg-yellow-500",
  Cancelled: "bg-red-500",
}

interface CalendarBooking {
  id: string
  guestName: string
  property: string
  checkIn: Date
  checkOut: Date
  status: "Confirmed" | "Pending" | "Cancelled"
}

interface CalendarViewProps {
  bookings?: CalendarBooking[]
  onAddBooking: () => void
  onSelectBooking: (booking: CalendarBooking) => void
}


export function CalendarView({ bookings = [], onAddBooking, onSelectBooking }: CalendarViewProps) {
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
    // Basic validation to ensure checkIn/checkOut are valid dates
    if (!booking.checkIn || !booking.checkOut) return

    const start = booking.checkIn < monthStart ? monthStart : booking.checkIn
    const end = booking.checkOut > monthEnd ? monthEnd : booking.checkOut

    // Safety check if start > end (which shouldn't happen if data is valid)
    if (start > end) return;

    const days = eachDayOfInterval({
      start,
      end,
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
                          <div key={idx} className={cn("h-1.5 w-1.5 rounded-full", statusColors[booking.status] || "bg-gray-400")} />
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
                          booking.status === "Confirmed" && "bg-green-500/10 text-green-600",
                          booking.status === "Pending" && "bg-yellow-500/10 text-yellow-600",
                          booking.status === "Cancelled" && "bg-red-500/10 text-red-600",
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
