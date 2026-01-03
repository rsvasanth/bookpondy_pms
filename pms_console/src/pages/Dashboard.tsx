"use client"

import { DashboardListWidget, type DashboardListItem } from "@/components/dashboard/dashboard-list-widget"
import { DashboardStatsCard } from "@/components/dashboard/dashboard-stats-card"
import { DashboardFilters } from "@/components/dashboard/dashboard-filters"
import { useLocalDocList } from "@/hooks/use-local-data"
import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"

import {
  CalendarDays,
  Brush,
  Wrench,
  MessageSquareMore,
  CheckCircle2,
  ArrowRightCircle,
  FileText,
  Banknote,
  Users,
  Activity,
  Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const navigate = useNavigate()

  // --- Filter State ---
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProperty, setSelectedProperty] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("All Status")
  const [selectedDateRange, setSelectedDateRange] = useState("This Month")

  const { data: properties } = useLocalDocList("Property")

  // --- Dynamic Selectors ---
  const reservationSelector = useMemo(() => {
    const sel: any = {
      reservation_status: { $in: ["Confirmed", "Checked-In", "Tentative", "Checked-Out"] }
    }
    if (selectedProperty) sel.property = selectedProperty
    if (selectedStatus !== "All Status") sel.reservation_status = selectedStatus
    if (searchTerm) {
      sel.$or = [
        { guest_name: { $regex: searchTerm, $options: 'i' } },
        { name: { $regex: searchTerm, $options: 'i' } }
      ]
    }
    return sel
  }, [selectedProperty, selectedStatus, searchTerm])

  const hkSelector = useMemo(() => {
    const sel: any = { status: { $ne: "Completed" } }
    if (selectedProperty) sel.property_link = selectedProperty
    return sel
  }, [selectedProperty])

  const maintSelector = useMemo(() => {
    const sel: any = { ticket_status: { $nin: ["Resolved", "Closed"] } }
    if (selectedProperty) sel.property = selectedProperty
    return sel
  }, [selectedProperty])

  // --- Data Fetching ---
  // 1. Bookings
  const { data: bookings, isLoading: bookingsLoading } = useLocalDocList("Reservation", {
    selector: reservationSelector,
    sort: [{ check_in_date: 'asc' }],
    limit: 10
  })
  const bookingItems: DashboardListItem[] = bookings?.map(b => ({
    id: b.name,
    title: b.guest_name || "Unknown Guest",
    subtitle: `${b.property} • ${b.check_in_date}`,
    status: b.reservation_status,
    value: b.total_amount ? `₹${b.total_amount.toLocaleString()}` : undefined,
    raw: b
  })) || []

  // 2. Housekeeping
  const { data: housekeeping, isLoading: hkLoading } = useLocalDocList("Housekeeping Task", {
    selector: hkSelector,
    sort: [{ priority: 'desc' }],
    limit: 10
  })
  const hkItems: DashboardListItem[] = housekeeping?.map(h => ({
    id: h.name,
    title: `${h.task_type}`,
    subtitle: `${h.unit} • ${h.scheduled_time ? h.scheduled_time.split(' ')[1]?.substring(0, 5) : "Anytime"}`,
    status: h.priority, // Using Priority for Badge color mapping
    raw: h
  })) || []

  // 3. Maintenance
  const { data: maintenance, isLoading: maintLoading } = useLocalDocList("Maintenance Ticket", {
    selector: maintSelector,
    sort: [{ creation: 'desc' }],
    limit: 10
  })
  const maintItems: DashboardListItem[] = maintenance?.map(m => ({
    id: m.name,
    title: m.issue_title,
    subtitle: `${m.unit} • ${m.creation?.split(' ')[0]}`,
    status: m.ticket_status, // Status for badge
    raw: m
  })) || []

  // 4. Enquiries (Simple List)
  const { data: enquiries, isLoading: enquiryLoading } = useLocalDocList("Booking Inquiry", {
    selector: {
      inquiry_status: "New"
    },
    sort: [{ inquiry_date: 'desc' }],
    limit: 5
  })
  const enquiryItems: DashboardListItem[] = enquiries?.map(e => ({
    id: e.name,
    title: e.guest_name,
    subtitle: e.property_interested,
    status: "New",
    raw: e
  })) || []
  // 5. Invoices
  const { data: invoices, isLoading: invoiceLoading } = useLocalDocList("Folio", {
    selector: {
      status: { $in: ["Draft", "Unpaid", "Overdue"] }
    },
    sort: [{ due_date: 'asc' }],
    limit: 5
  })
  const invoiceItems: DashboardListItem[] = invoices?.map(i => ({
    id: i.name,
    title: i.name,
    subtitle: `${i.customer_name}`,
    status: i.status === "Overdue" ? "Urgent" : "Open",
    value: i.grand_total ? `₹${i.grand_total.toLocaleString()}` : "₹0",
    raw: i
  })) || []

  // --- Stats Calculation ---
  const totalBookings = bookings?.length || 0
  const activeGuests = bookings?.filter(b => b.reservation_status === "Checked-In").length || 0
  const pendingTasks = (housekeeping?.length || 0) + (maintenance?.length || 0)
  const revenueToday = bookings?.reduce((acc, curr) => acc + (curr.total_amount || 0), 0) || 0

  // --- Render Helpers ---
  const renderBookingActions = (item: DashboardListItem) => (
    <div className="flex gap-1">
      <Button
        variant="outline"
        size="icon"
        className="h-7 w-7 rounded-lg hover:bg-muted border-border transition-colors"
        onClick={() => navigate(`/bookings/${item.id}`)}
      >
        <ArrowRightCircle className="h-3.5 w-3.5" />
      </Button>
    </div>
  )

  const renderTaskActions = (item: DashboardListItem) => (
    <div className="flex gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
        onClick={() => navigate(item.raw?.task_type ? '/housekeeping' : '/maintenance')}
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  )

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header Area */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground">Property Insights</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Live overview of property performance & operations
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button className="h-9 px-4 gap-2 rounded-md">
              <Plus className="h-4 w-4" /> New Reservation
            </Button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="px-2">
          <DashboardFilters
            properties={properties}
            selectedProperty={selectedProperty}
            onPropertyChange={setSelectedProperty}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            selectedDateRange={selectedDateRange}
            onDateRangeChange={setSelectedDateRange}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStatsCard
          title="Total Bookings"
          value={String(totalBookings)}
          trend="neutral"
          trendValue="In Filter"
          icon={CalendarDays}
        />
        <DashboardStatsCard
          title="Active Guests"
          value={String(activeGuests)}
          trend="neutral"
          trendValue="Stayed"
          icon={Users}
        />
        <DashboardStatsCard
          title="Pending Tasks"
          value={String(pendingTasks)}
          trend="neutral"
          trendValue="Operations"
          icon={Activity}
        />
        <DashboardStatsCard
          title="Revenue Total"
          value={`₹${(revenueToday / 1000).toFixed(1)}k`}
          trend="neutral"
          trendValue="Booked"
          icon={Banknote}
        />
      </div>



      {/* Main Widget Grid - optimized for density */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        <DashboardListWidget
          title="Upcoming Bookings"
          icon={<CalendarDays className="h-4 w-4" />}
          items={bookingItems.slice(0, 10)}
          isLoading={bookingsLoading}
          renderItemActions={renderBookingActions}
          onViewAll={() => navigate('/bookings')}
          className="xl:col-span-1"
        />

        <DashboardListWidget
          title="Housekeeping Tasks"
          icon={<Brush className="h-4 w-4" />}
          items={hkItems.slice(0, 10)}
          isLoading={hkLoading}
          renderItemActions={renderTaskActions}
          onViewAll={() => navigate('/housekeeping')}
          className="xl:col-span-1"
        />

        <DashboardListWidget
          title="Maintenance Issues"
          icon={<Wrench className="h-4 w-4" />}
          items={maintItems.slice(0, 10)}
          isLoading={maintLoading}
          renderItemActions={renderTaskActions}
          onViewAll={() => navigate('/maintenance')}
          className="xl:col-span-1"
        />

        <div className="flex flex-col gap-6 xl:col-span-1">
          <DashboardListWidget
            title="Booking Enquiries"
            icon={<MessageSquareMore className="h-4 w-4" />}
            items={enquiryItems.slice(0, 5)}
            isLoading={enquiryLoading}
            renderItemActions={() => <Button size="sm" variant="ghost" className="h-7 text-xs font-medium">Reply</Button>}
            onViewAll={() => navigate('/communications')}
          />
          <DashboardListWidget
            title="Invoices to Process"
            icon={<FileText className="h-4 w-4" />}
            items={invoiceItems.slice(0, 5)}
            isLoading={invoiceLoading}
            renderItemActions={() => <Button size="sm" variant="ghost" className="h-7 text-xs font-medium">View</Button>}
            onViewAll={() => navigate('/invoices')}
          />
        </div>

      </div>
    </div>
  )
}
