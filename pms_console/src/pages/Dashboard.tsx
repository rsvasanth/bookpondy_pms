"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DashboardListWidget, type DashboardListItem } from "@/components/dashboard/dashboard-list-widget"
import { DashboardStatsCard } from "@/components/dashboard/dashboard-stats-card"
import { DashboardFilters } from "@/components/dashboard/dashboard-filters"
import { useFrappeGetDocList } from "frappe-react-sdk"

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
  Activity
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {

  // --- Data Fetching (Reusing logic) ---
  // 1. Bookings
  const { data: bookings, isLoading: bookingsLoading } = useFrappeGetDocList("Reservation", {
    fields: ["name", "guest_name", "reservation_status", "check_in_date", "check_out_date", "total_amount", "property"],
    filters: [["reservation_status", "in", ["Confirmed", "Checked-In", "Tentative", "Checked-Out"]]],
    limit: 10,
    orderBy: { field: "check_in_date", order: "asc" }
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
  const { data: housekeeping, isLoading: hkLoading } = useFrappeGetDocList("Housekeeping Task", {
    fields: ["name", "unit", "task_type", "status", "priority", "scheduled_time"],
    filters: [["status", "!=", "Completed"]],
    limit: 10,
    orderBy: { field: "priority", order: "desc" }
  })
  const hkItems: DashboardListItem[] = housekeeping?.map(h => ({
    id: h.name,
    title: `${h.task_type}`,
    subtitle: `${h.unit} • ${h.scheduled_time ? h.scheduled_time.split(' ')[1]?.substring(0, 5) : "Anytime"}`,
    status: h.priority, // Using Priority for Badge color mapping
    raw: h
  })) || []

  // 3. Maintenance
  const { data: maintenance, isLoading: maintLoading } = useFrappeGetDocList("Maintenance Ticket", {
    fields: ["name", "issue_title", "unit", "ticket_status", "priority", "creation"],
    filters: [["ticket_status", "not in", ["Resolved", "Closed"]]],
    limit: 10,
    orderBy: { field: "creation", order: "desc" }
  })
  const maintItems: DashboardListItem[] = maintenance?.map(m => ({
    id: m.name,
    title: m.issue_title,
    subtitle: `${m.unit} • ${m.creation?.split(' ')[0]}`,
    status: m.ticket_status, // Status for badge
    raw: m
  })) || []

  // 4. Enquiries (Simple List)
  const { data: enquiries, isLoading: enquiryLoading } = useFrappeGetDocList("Booking Inquiry", {
    fields: ["name", "guest_name", "inquiry_status", "inquiry_date", "property_interested"],
    filters: [["inquiry_status", "=", "New"]],
    limit: 5,
    orderBy: { field: "inquiry_date", order: "desc" }
  })
  const enquiryItems: DashboardListItem[] = enquiries?.map(e => ({
    id: e.name,
    title: e.guest_name,
    subtitle: e.property_interested,
    status: "New",
    raw: e
  })) || []
  // 5. Invoices
  const { data: invoices, isLoading: invoiceLoading } = useFrappeGetDocList("Sales Invoice", {
    fields: ["name", "customer_name", "status", "grand_total", "due_date"],
    filters: [["status", "in", ["Draft", "Unpaid", "Overdue"]]],
    limit: 5,
    orderBy: { field: "due_date", order: "asc" }
  })
  const invoiceItems: DashboardListItem[] = invoices?.map(i => ({
    id: i.name,
    title: i.name,
    subtitle: `${i.customer_name}`,
    status: i.status === "Overdue" ? "Urgent" : "Open",
    value: i.grand_total ? `₹${i.grand_total.toLocaleString()}` : "₹0",
    raw: i
  })) || []

  // --- Render Helpers ---
  const renderBookingActions = (item: any) => (
    <div className="flex gap-1">
      <Button variant="outline" size="icon" className="h-7 w-7 rounded-lg hover:bg-[#ff3924] hover:text-white border-slate-200 transition-colors">
        <ArrowRightCircle className="h-3.5 w-3.5" />
      </Button>
    </div>
  )

  const renderTaskActions = (item: any) => (
    <div className="flex gap-1">
      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-slate-400 hover:bg-slate-50 transition-colors">
        <CheckCircle2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  )

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6 pb-12">

        {/* Header Section from HTML */}
        {/* Header Removed - Moved to DashboardLayout */}

        {/* Main Content Container - Fluid Layout */}
        <div className="w-full space-y-6 px-2">




          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardStatsCard
              title="Total Bookings"
              value="24"
              trend="up"
              trendValue="3 new today"
              icon={CalendarDays}
            />
            <DashboardStatsCard
              title="Active Guests"
              value="18"
              trend="up"
              trendValue="2 check-ins"
              icon={Users}
            />
            <DashboardStatsCard
              title="Pending Tasks"
              value="12"
              trend="down"
              trendValue="4 completed"
              icon={Activity}
            />
            <DashboardStatsCard
              title="Revenue Today"
              value="₹12.4k"
              trend="up"
              trendValue="8% avg"
              icon={Banknote}
            />
          </div>

          <DashboardFilters />

          {/* Main Widget Grid - Masonry-lite layout */}
          {/* Main Widget Grid - optimized for density */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

            <DashboardListWidget
              title="Upcoming Bookings"
              icon={<CalendarDays className="h-4 w-4" />}
              items={bookingItems.slice(0, 10)}
              isLoading={bookingsLoading}
              renderItemActions={renderBookingActions}
              className="xl:col-span-1"
            />

            <DashboardListWidget
              title="Housekeeping Tasks"
              icon={<Brush className="h-4 w-4" />}
              items={hkItems.slice(0, 10)}
              isLoading={hkLoading}
              renderItemActions={renderTaskActions}
              className="xl:col-span-1"
            />

            <DashboardListWidget
              title="Maintenance Issues"
              icon={<Wrench className="h-4 w-4" />}
              items={maintItems.slice(0, 10)}
              isLoading={maintLoading}
              renderItemActions={renderTaskActions}
              className="xl:col-span-1"
            />

            <div className="flex flex-col gap-6 xl:col-span-1">
              <DashboardListWidget
                title="Booking Enquiries"
                icon={<MessageSquareMore className="h-4 w-4" />}
                items={enquiryItems.slice(0, 5)}
                isLoading={enquiryLoading}
                renderItemActions={() => <Button size="sm" variant="ghost" className="h-7 text-xs">Reply</Button>}
              />
              <DashboardListWidget
                title="Invoices to Process"
                icon={<FileText className="h-4 w-4" />}
                items={invoiceItems.slice(0, 5)}
                isLoading={invoiceLoading}
                renderItemActions={() => <Button size="sm" variant="ghost" className="h-7 text-xs">View</Button>}
              />
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
