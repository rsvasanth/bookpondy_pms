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
  status: "confirmed" | "pending" | "cancelled" | "completed"
  paymentStatus: "paid" | "partial" | "pending"
  createdAt: string
}

const bookings: Booking[] = [
  {
    id: "BK2401",
    guestName: "Priya Sharma",
    guestEmail: "priya.sharma@email.com",
    guestPhone: "+91 98765 43210",
    property: "Ocean View Villa",
    roomType: "Deluxe Suite",
    checkIn: "2025-12-18",
    checkOut: "2025-12-22",
    nights: 4,
    guests: 2,
    totalAmount: 32000,
    status: "confirmed",
    paymentStatus: "paid",
    createdAt: "2025-12-10",
  },
  {
    id: "BK2402",
    guestName: "Amit Patel",
    guestEmail: "amit.patel@email.com",
    guestPhone: "+91 87654 32109",
    property: "Beach House Resort",
    roomType: "Ocean View Room",
    checkIn: "2025-12-19",
    checkOut: "2025-12-21",
    nights: 2,
    guests: 3,
    totalAmount: 18500,
    status: "confirmed",
    paymentStatus: "partial",
    createdAt: "2025-12-12",
  },
  {
    id: "BK2403",
    guestName: "Sneha Reddy",
    guestEmail: "sneha.r@email.com",
    guestPhone: "+91 76543 21098",
    property: "Heritage Homestay",
    roomType: "Heritage Room",
    checkIn: "2025-12-20",
    checkOut: "2025-12-25",
    nights: 5,
    guests: 4,
    totalAmount: 45000,
    status: "pending",
    paymentStatus: "pending",
    createdAt: "2025-12-15",
  },
  {
    id: "BK2404",
    guestName: "Vikram Singh",
    guestEmail: "vikram.s@email.com",
    guestPhone: "+91 65432 10987",
    property: "Ocean View Villa",
    roomType: "Presidential Suite",
    checkIn: "2025-12-23",
    checkOut: "2025-12-27",
    nights: 4,
    guests: 2,
    totalAmount: 56000,
    status: "confirmed",
    paymentStatus: "paid",
    createdAt: "2025-12-14",
  },
  {
    id: "BK2405",
    guestName: "Meera Nair",
    guestEmail: "meera.nair@email.com",
    guestPhone: "+91 54321 09876",
    property: "Hill View Retreat",
    roomType: "Mountain Suite",
    checkIn: "2025-12-24",
    checkOut: "2025-12-28",
    nights: 4,
    guests: 2,
    totalAmount: 38000,
    status: "pending",
    paymentStatus: "pending",
    createdAt: "2025-12-16",
  },
  {
    id: "BK2406",
    guestName: "Rahul Verma",
    guestEmail: "rahul.v@email.com",
    guestPhone: "+91 43210 98765",
    property: "Royal Heritage Palace",
    roomType: "Royal Chamber",
    checkIn: "2025-12-15",
    checkOut: "2025-12-17",
    nights: 2,
    guests: 2,
    totalAmount: 28000,
    status: "completed",
    paymentStatus: "paid",
    createdAt: "2025-12-08",
  },
  {
    id: "BK2407",
    guestName: "Anita Desai",
    guestEmail: "anita.d@email.com",
    guestPhone: "+91 32109 87654",
    property: "Backwater Houseboat",
    roomType: "Houseboat Suite",
    checkIn: "2025-12-22",
    checkOut: "2025-12-24",
    nights: 2,
    guests: 4,
    totalAmount: 25000,
    status: "cancelled",
    paymentStatus: "pending",
    createdAt: "2025-12-11",
  },
]

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

export default function BookingsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [addBookingOpen, setAddBookingOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const filteredBookings = bookings.filter(
    (b) =>
      b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking)
    setDetailsOpen(true)
  }

  const handleCalendarBookingSelect = (calendarBooking: {
    id: string
    guestName: string
    property: string
    checkIn: Date
    checkOut: Date
    status: "confirmed" | "pending" | "cancelled"
  }) => {
    // Find matching booking from our data
    const booking = bookings.find((b) => b.id === calendarBooking.id)
    if (booking) {
      handleViewBooking(booking)
    }
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
                <p className="text-2xl font-bold">156</p>
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
                <p className="text-2xl font-bold text-green-600">98</p>
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
                <p className="text-2xl font-bold text-yellow-600">24</p>
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
                <p className="text-2xl font-bold">₹5.2L</p>
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select>
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
            <Select>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
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
                      <Badge className={statusConfig[booking.status].className}>
                        {statusConfig[booking.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={paymentStatusConfig[booking.paymentStatus].className}>
                        {paymentStatusConfig[booking.paymentStatus].label}
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
          <CalendarView onAddBooking={() => setAddBookingOpen(true)} onSelectBooking={handleCalendarBookingSelect} />
        </TabsContent>
      </Tabs>

      <AddBookingSheet open={addBookingOpen} onOpenChange={setAddBookingOpen} />

      <BookingDetailsSheet open={detailsOpen} onOpenChange={setDetailsOpen} booking={selectedBooking} />
    </DashboardLayout>
  )
}
