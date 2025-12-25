"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Bed,
  TrendingUp,
  Clock,
} from "lucide-react"
import { AddBookingSheet } from "@/components/bookings/add-booking-sheet"
import { BookingDetailsSheet } from "@/components/bookings/booking-details-sheet"
import { QuickBookDialog } from "@/components/bookings/quick-book-dialog"
import { CalendarView } from "@/components/bookings/calendar-view"
import { useFrappeGetDocList } from "frappe-react-sdk"
import { useFiltersStore, useSelectionStore } from "@/stores"
import { cn } from "@/lib/utils"

interface Booking {
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
  createdAt: string
}

const statusConfig = {
  Confirmed: { label: "Confirmed", className: "bg-green-500/10 text-green-600 border-green-200" },
  Pending: { label: "Pending", className: "bg-yellow-500/10 text-yellow-600 border-yellow-200" },
  Cancelled: { label: "Cancelled", className: "bg-red-500/10 text-red-600 border-red-200" },
  "Checked-In": { label: "Checked-In", className: "bg-blue-500/10 text-blue-600 border-blue-200" },
  "Completed": { label: "Completed", className: "bg-gray-500/10 text-gray-600 border-gray-200" },
}

const paymentStatusConfig = {
  Paid: { label: "Paid", className: "bg-green-500/10 text-green-600 border-green-200" },
  Partial: { label: "Partial", className: "bg-orange-500/10 text-orange-600 border-orange-200" },
  Pending: { label: "Pending", className: "bg-yellow-500/10 text-yellow-600 border-yellow-200" },
  Unpaid: { label: "Unpaid", className: "bg-red-500/10 text-red-600 border-red-200" }
}

export default function BookingsPage() {
  const navigate = useNavigate()
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

  const [addBookingOpen, setAddBookingOpen] = useState(false)
  const [quickBookOpen, setQuickBookOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const { data: reservationsList, mutate: reservationsMutate } = useFrappeGetDocList("Reservation", {
    fields: ["name", "guest_name", "guest_email", "guest_phone", "property", "unit_category", "check_in_date", "check_out_date", "nights", "number_of_guests", "total_amount", "reservation_status", "payment_status", "creation"],
    limit: 100,
    orderBy: { field: "creation", order: "desc" }
  })

  const bookings: Booking[] = reservationsList?.map(r => ({
    id: r.name,
    guestName: r.guest_name,
    guestEmail: r.guest_email || "",
    guestPhone: r.guest_phone || "",
    property: r.property,
    unitCategory: r.unit_category,
    checkIn: r.check_in_date,
    checkOut: r.check_out_date,
    nights: r.nights || 0,
    guests: r.number_of_guests || 1,
    totalAmount: r.total_amount || 0,
    status: r.reservation_status as any,
    paymentStatus: r.payment_status as any,
    createdAt: r.creation
  })) || []

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

  const selectedBooking = activeBookingId
    ? bookings.find(b => b.id === activeBookingId) || null
    : null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    })
  }

  const handleViewBooking = (booking: Booking) => {
    setActiveBookingId(booking.id)
    setDetailsOpen(true)
  }

  const handleCalendarBookingSelect = (calendarBooking: any) => {
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

  // Calculate Stats
  const confirmedCount = bookings.filter(b => b.status === "Confirmed").length
  const pendingCount = bookings.filter(b => b.status === "Pending").length
  const totalRevenue = bookings.reduce((acc, b) => acc + b.totalAmount, 0)
  const occupancyRate = bookings.length > 0 ? Math.round((confirmedCount / bookings.length) * 100) : 0

  return (
    <DashboardLayout>
      {/* Premium Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-[#0A0A0A]">Reservations</h1>
            <p className="text-sm text-muted-foreground font-medium">
              Manage and track all your property bookings with real-time updates
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="rounded-xl h-12 px-6 font-bold text-sm border-gray-200 hover:bg-gray-50"
              onClick={() => navigate("/bookings/new")}
            >
              New Booking
            </Button>
            <Button
              className="bg-[#FF3D2E] hover:bg-[#e63225] text-white rounded-xl h-12 px-6 font-bold text-sm gap-2 shadow-xl shadow-red-500/20"
              onClick={() => setQuickBookOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Quick Book
            </Button>
          </div>
        </div>
      </div>

      {/* Premium Stats Grid */}
      <div className="mb-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total Bookings</span>
            <div className="h-10 w-10 rounded-2xl bg-red-50 text-[#FF3D2E] flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarIcon className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#0A0A0A]">{bookings.length}</p>
          <p className="text-[10px] font-bold text-green-500 mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> +12% this month
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Confirmed</span>
            <div className="h-10 w-10 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bed className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-600">{confirmedCount}</p>
          <p className="text-[10px] font-bold text-gray-400 mt-1">{occupancyRate}% confirmation rate</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Pending</span>
            <div className="h-10 w-10 rounded-2xl bg-yellow-50 text-yellow-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
          <p className="text-[10px] font-bold text-gray-400 mt-1">Awaiting confirmation</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Revenue</span>
            <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <IndianRupee className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#0A0A0A]">₹{(totalRevenue / 1000).toFixed(1)}K</p>
          <p className="text-[10px] font-bold text-green-500 mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> +8% vs last month
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <Tabs defaultValue="list" className="w-full">
          {/* Tabs Header with Filters */}
          <div className="px-6 py-4 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <TabsList className="bg-gray-100/50 p-1 rounded-2xl w-fit h-11">
              <TabsTrigger value="list" className="rounded-xl px-5 h-9 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wider gap-2">
                <List className="h-4 w-4" />
                List View
              </TabsTrigger>
              <TabsTrigger value="calendar" className="rounded-xl px-5 h-9 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wider gap-2">
                <CalendarIcon className="h-4 w-4" />
                Calendar
              </TabsTrigger>
            </TabsList>

            {/* Search & Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search bookings..."
                  className="pl-11 w-64 rounded-xl h-11 bg-gray-50/50 border-gray-100 focus-visible:ring-[#FF3D2E]/20 font-medium"
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                />
              </div>
              <Select value={bookingProperty} onValueChange={setBookingProperty}>
                <SelectTrigger className="w-[160px] rounded-xl h-11 bg-gray-50/50 border-gray-100 font-bold text-xs">
                  <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                  <SelectValue placeholder="Property" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-gray-100 shadow-xl p-2">
                  <SelectItem value="all" className="rounded-xl py-2.5 cursor-pointer font-medium">All Properties</SelectItem>
                </SelectContent>
              </Select>
              <Select value={bookingStatus} onValueChange={setBookingStatus}>
                <SelectTrigger className="w-[140px] rounded-xl h-11 bg-gray-50/50 border-gray-100 font-bold text-xs">
                  <Filter className="h-4 w-4 text-gray-400 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-gray-100 shadow-xl p-2">
                  <SelectItem value="all" className="rounded-xl py-2.5 cursor-pointer font-medium">All Status</SelectItem>
                  <SelectItem value="Confirmed" className="rounded-xl py-2.5 cursor-pointer font-medium">Confirmed</SelectItem>
                  <SelectItem value="Pending" className="rounded-xl py-2.5 cursor-pointer font-medium">Pending</SelectItem>
                  <SelectItem value="Cancelled" className="rounded-xl py-2.5 cursor-pointer font-medium">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* List View Content */}
          <TabsContent value="list" className="m-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Guest</th>
                    <th className="text-left px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Property</th>
                    <th className="text-left px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Dates</th>
                    <th className="text-center px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Nights</th>
                    <th className="text-right px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Amount</th>
                    <th className="text-center px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</th>
                    <th className="text-center px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Payment</th>
                    <th className="text-right px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking, index) => (
                    <tr
                      key={booking.id}
                      className={cn(
                        "cursor-pointer transition-all hover:bg-gray-50/50",
                        index !== filteredBookings.length - 1 && "border-b border-gray-50"
                      )}
                      onClick={() => handleViewBooking(booking)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-2xl bg-red-50 text-[#FF3D2E] flex items-center justify-center font-bold text-sm">
                            {booking.guestName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-[#0A0A0A]">{booking.guestName}</p>
                            <p className="text-[11px] text-muted-foreground font-medium">{booking.guestPhone || booking.guestEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-bold text-sm text-[#0A0A0A]">{booking.property}</p>
                          <p className="text-[11px] text-muted-foreground font-medium">{booking.unitCategory}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{formatDate(booking.checkIn)}</span>
                          <span className="text-gray-300">→</span>
                          <span className="font-bold text-sm">{formatDate(booking.checkOut)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-gray-100 font-bold text-xs">{booking.nights}</span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="font-bold text-[#FF3D2E]">₹{booking.totalAmount.toLocaleString("en-IN")}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Badge className={cn("rounded-lg border px-2.5 py-1 font-bold text-[10px] uppercase tracking-wider", getStatusConfig(booking.status).className)}>
                          {getStatusConfig(booking.status).label}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Badge className={cn("rounded-lg border px-2.5 py-1 font-bold text-[10px] uppercase tracking-wider", getPaymentStatusConfig(booking.paymentStatus).className)}>
                          {getPaymentStatusConfig(booking.paymentStatus).label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-gray-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-2xl border-gray-100 shadow-xl p-2 w-48">
                            <DropdownMenuItem onClick={() => handleViewBooking(booking)} className="rounded-xl py-2.5 cursor-pointer font-medium gap-2">
                              <Eye className="h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl py-2.5 cursor-pointer font-medium gap-2">
                              <MessageSquare className="h-4 w-4" />
                              Message Guest
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl py-2.5 cursor-pointer font-medium gap-2">
                              <Pencil className="h-4 w-4" />
                              Modify Booking
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl py-2.5 cursor-pointer font-medium gap-2 text-red-500">
                              <X className="h-4 w-4" />
                              Cancel Booking
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredBookings.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                  <div className="h-20 w-20 rounded-3xl bg-gray-100 flex items-center justify-center text-gray-300">
                    <CalendarIcon className="h-10 w-10" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-bold text-gray-600">No bookings found</p>
                    <p className="text-xs text-muted-foreground max-w-xs">Create a new booking or adjust your filters.</p>
                  </div>
                  <Button
                    onClick={() => setAddBookingOpen(true)}
                    className="rounded-2xl font-bold h-12 px-8 bg-white border border-gray-200 text-[#0A0A0A] hover:bg-gray-50 shadow-sm"
                  >
                    Create First Booking
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="m-0 p-6">
            <CalendarView
              bookings={bookings.map(b => ({
                ...b,
                checkIn: new Date(b.checkIn),
                checkOut: new Date(b.checkOut),
                status: b.status as any
              }))}
              onAddBooking={() => setAddBookingOpen(true)}
              onSelectBooking={handleCalendarBookingSelect}
            />
          </TabsContent>
        </Tabs>
      </div>

      <AddBookingSheet
        open={addBookingOpen}
        onOpenChange={setAddBookingOpen}
        onSuccess={() => reservationsMutate()}
      />

      <QuickBookDialog
        open={quickBookOpen}
        onOpenChange={setQuickBookOpen}
        onSuccess={() => reservationsMutate()}
      />

      <BookingDetailsSheet open={detailsOpen} onOpenChange={setDetailsOpen} booking={selectedBooking} />
    </DashboardLayout>
  )
}
