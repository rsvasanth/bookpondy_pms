"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Search,
  CalendarIcon,
  List,
  Filter,
  MoreHorizontal,
  Eye,
  MessageSquare,
  Pencil,
  X,
  User,
  Building2,
  IndianRupee,
} from "lucide-react"
import { AddBookingSheet } from "@/components/bookings/add-booking-sheet"
import { BookingDetailsSheet } from "@/components/bookings/booking-details-sheet"
import { CalendarView } from "@/components/bookings/calendar-view"
import { useFrappeGetDocList } from "frappe-react-sdk"
import { useFiltersStore, useSelectionStore } from "@/stores"

// .. (Imports remain the same)

// Interface (make sure it matches mapping)
interface Booking {
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
  status: "Confirmed" | "Pending" | "Cancelled" | "Completed" | "Checked-In"
  paymentStatus: "Paid" | "Partial" | "Pending" | "Unpaid"
  createdAt: string
}

// const bookings = [] // Removed placeholder

const statusConfig = {
  Confirmed: { label: "Confirmed", className: "bg-green-500/10 text-green-600" },
  Pending: { label: "Pending", className: "bg-yellow-500/10 text-yellow-600" },
  Cancelled: { label: "Cancelled", className: "bg-red-500/10 text-red-600" },
  "Checked-In": { label: "Checked-In", className: "bg-blue-500/10 text-blue-600" },
  "Completed": { label: "Completed", className: "bg-gray-500/10 text-gray-600" },
}

const paymentStatusConfig = {
  Paid: { label: "Paid", className: "bg-green-500/10 text-green-600" },
  Partial: { label: "Partial", className: "bg-orange-500/10 text-orange-600" },
  Pending: { label: "Pending", className: "bg-yellow-500/10 text-yellow-600" },
  Unpaid: { label: "Unpaid", className: "bg-red-500/10 text-red-600" }
}

export default function BookingsPage() {
  // Global state from Zustand stores
  const {
    bookingSearch,
    bookingStatus,
    bookingProperty,
    setBookingSearch,
    setBookingStatus,
    setBookingProperty
  } = useFiltersStore()

  const {
    activeBookingId,
    setActiveBookingId,
  } = useSelectionStore()

  // Local UI state (modals, sheets)
  const [addBookingOpen, setAddBookingOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const { data: reservationsList } = useFrappeGetDocList("Reservation", {
    fields: ["name", "guest_name", "guest_email", "guest_phone", "property", "room_type", "check_in_date", "check_out_date", "nights", "number_of_guests", "total_amount", "reservation_status", "payment_status", "creation"],
    limit: 100,
    orderBy: { field: "creation", order: "desc" }
  })

  const bookings: Booking[] = reservationsList?.map(r => ({
    id: r.name,
    guestName: r.guest_name,
    guestEmail: r.guest_email || "",
    guestPhone: r.guest_phone || "",
    property: r.property,
    roomType: r.room_type,
    checkIn: r.check_in_date,
    checkOut: r.check_out_date,
    nights: r.nights || 0,
    guests: r.number_of_guests || 1,
    totalAmount: r.total_amount || 0,
    // Cast appropriately or handle case sensitivity if backend returns "Confirmed" vs "confirmed"
    status: r.reservation_status as any,
    paymentStatus: r.payment_status as any,
    createdAt: r.creation
  })) || []


  // Apply filters from global state
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      !bookingSearch ||
      b.guestName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.property.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.id.toLowerCase().includes(bookingSearch.toLowerCase())

    const matchesStatus = bookingStatus === 'all' || b.status === bookingStatus
    const matchesProperty = bookingProperty === 'all' || b.property === bookingProperty

    return matchesSearch && matchesStatus && matchesProperty
  })

  // Find selected booking from global state
  const selectedBooking = activeBookingId
    ? bookings.find(b => b.id === activeBookingId) || null
    : null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const handleViewBooking = (booking: Booking) => {
    setActiveBookingId(booking.id)
    setDetailsOpen(true)
  }

  const handleCalendarBookingSelect = (calendarBooking: {
    id: string
    guestName: string
    property: string
    checkIn: Date
    checkOut: Date
    status: "Confirmed" | "Pending" | "Cancelled"
  }) => {
    // Find matching booking from our data
    const booking = bookings.find((b) => b.id === calendarBooking.id)
    if (booking) {
      handleViewBooking(booking)
    }
  }

  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.Pending
  }

  const getPaymentStatusConfig = (status: string) => {
    return paymentStatusConfig[status as keyof typeof paymentStatusConfig] || paymentStatusConfig.Pending
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bookings & Reservations</h1>
          <p className="text-muted-foreground">Manage all your property bookings in one place</p>
        </div>
        <Button className="bg-[#E68B47] hover:bg-[#c97339]" onClick={() => setAddBookingOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Booking
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{bookings.length}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <CalendarIcon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">{bookings.filter(b => b.status === "Confirmed").length}</p>
              </div>
              <Badge className="bg-green-500/10 text-green-600">63%</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{bookings.filter(b => b.status === "Pending").length}</p>
              </div>
              <Badge className="bg-yellow-500/10 text-yellow-600">15%</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month Revenue</p>
                <p className="text-2xl font-bold">₹{bookings.reduce((acc, b) => acc + b.totalAmount, 0).toLocaleString("en-IN")}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <IndianRupee className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Calendar/List View */}
      <Tabs defaultValue="list" className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="list" className="gap-2">
              <List className="h-4 w-4" />
              List View
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              Calendar
            </TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search bookings..."
                className="pl-9"
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
              />
            </div>
            <Select value={bookingProperty} onValueChange={setBookingProperty}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                <SelectItem value="ocean">Ocean View Villa</SelectItem>
                <SelectItem value="beach">Beach House Resort</SelectItem>
                <SelectItem value="heritage">Heritage Homestay</SelectItem>
              </SelectContent>
            </Select>
            <Select value={bookingStatus} onValueChange={setBookingStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* List View */}
        <TabsContent value="list">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Check-in / Check-out</TableHead>
                  <TableHead className="text-center">Nights</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id} className="cursor-pointer" onClick={() => handleViewBooking(booking)}>
                    <TableCell className="font-medium">{booking.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{booking.guestName}</p>
                          <p className="text-xs text-muted-foreground">{booking.guestPhone}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{booking.property}</p>
                          <p className="text-xs text-muted-foreground">{booking.roomType}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{formatDate(booking.checkIn)}</p>
                        <p className="text-muted-foreground">{formatDate(booking.checkOut)}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{booking.nights}</TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{booking.totalAmount.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusConfig(booking.status).className}>
                        {getStatusConfig(booking.status).label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPaymentStatusConfig(booking.paymentStatus).className}>
                        {getPaymentStatusConfig(booking.paymentStatus).label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewBooking(booking)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Message Guest
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Pencil className="mr-2 h-4 w-4" />
                            Modify Booking
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <X className="mr-2 h-4 w-4" />
                            Cancel Booking
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <CalendarView
            bookings={bookings.map(b => ({
              ...b,
              checkIn: new Date(b.checkIn),
              checkOut: new Date(b.checkOut),
              // Filter out Checked-In or Completed if CalendarView only supports specific statuses, 
              // or ensure CalendarView supports all. 
              // CalendarView interface currently supports: "Confirmed" | "Pending" | "Cancelled"
              // We might need to map others or leave them if CalendarView handles extra strings gracefully (it does via 'status' prop but type might complain).
              // Let's cast status to any if needed or map Checked-In to Confirmed for calendar visualization purposes if strictly typed.
              status: b.status as any
            }))}
            onAddBooking={() => setAddBookingOpen(true)}
            onSelectBooking={handleCalendarBookingSelect}
          />
        </TabsContent>
      </Tabs>

      <AddBookingSheet open={addBookingOpen} onOpenChange={setAddBookingOpen} />

      <BookingDetailsSheet open={detailsOpen} onOpenChange={setDetailsOpen} booking={selectedBooking} />
    </DashboardLayout>
  )
}
