"use client"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { KPICard } from "@/components/dashboard/kpi-card"
import { PropertyCard } from "@/components/dashboard/property-card"
import { BookingTimeline } from "@/components/dashboard/booking-timeline"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { RecentReviews } from "@/components/dashboard/recent-reviews"
import { AlertsPanel } from "@/components/dashboard/alerts-panel"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  IndianRupee,
  Percent,
  CalendarCheck,
  AlertCircle,
  ArrowRight,
  Clock,
  CheckCircle2,
  BedDouble,
  Plus,
} from "lucide-react"
import { Link } from "react-router-dom"

import { useFrappeGetDocList, useFrappeAuth } from "frappe-react-sdk"
import { PropertyDialog } from "@/components/properties/property-dialog"
import { useState } from "react"

export default function DashboardPage() {
  const { currentUser } = useFrappeAuth()
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false)

  const { data: propertiesList, mutate: mutateProperties } = useFrappeGetDocList("Property", {
    fields: ["name", "property_name", "location_description", "banner_image", "status", "average_rating", "total_units", "total_rooms"],
    limit: 4
  })

  // We would ideally fetch occupancy and next booking via a custom API call or a complex query.
  // For now, we'll derive what we can or use placeholders.
  const properties = propertiesList?.map(p => ({
    name: p.property_name,
    location: p.location_description || "Not specified",
    image: p.banner_image || "/placeholder.svg", // Ensure you have a placeholder or handle null
    status: p.status.toLowerCase(),
    occupancy: 0, // Placeholder: needs calculation backend side
    rating: p.average_rating || 0,
    nextBooking: "None" // Placeholder
  })) || []

  // Fetch KPI Data & Timeline Data
  const { data: reservations } = useFrappeGetDocList("Reservation", {
    fields: ["name", "total_amount", "reservation_status", "guest_name", "property", "check_in_date", "check_out_date"],
    limit: 1000
  })

  const totalRevenue = reservations?.reduce((acc, curr) => acc + (curr.total_amount || 0), 0) || 0
  const activeBookings = reservations?.filter(r => ["Confirmed", "Checked-In"].includes(r.reservation_status)).length || 0

  // Fetch Maintenance Tasks
  const { data: maintenanceTasks } = useFrappeGetDocList("Maintenance Ticket", {
    fields: ["name", "issue_title", "unit", "priority", "creation"],
    filters: [["ticket_status", "!=", "Closed"]],
    limit: 5
  })

  // Combine into alerts (Simple mapping)
  const alerts = [
    ...(maintenanceTasks?.map(t => ({
      id: t.name,
      type: "maintenance",
      title: t.issue_title,
      description: `Unit ${t.unit} - Priority: ${t.priority}`,
      time: t.creation?.split(" ")[0] || "Today"
    })) || []),
    // Add payment alerts based on reservations if needed, e.g. pending ones
    ...(reservations?.filter(r => r.total_amount > 0 && r.reservation_status === "Confirmed").slice(0, 2).map(r => ({
      id: r.name,
      type: "payment",
      title: "Payment Follow-up",
      description: `Rs ${r.total_amount} - ${r.guest_name}`,
      time: r.check_in_date
    })) || [])
  ] as any[]

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {currentUser}! Here&apos;s your property overview.</p>
        </div>
        <Button
          className="bg-[#FF3D2E] hover:bg-[#e63225] text-white font-bold rounded-xl shadow-lg shadow-red-500/20"
          onClick={() => setPropertyDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Property
        </Button>
      </div>

      {propertyDialogOpen && (
        <PropertyDialog
          open={propertyDialogOpen}
          onOpenChange={setPropertyDialogOpen}
          onSuccess={() => mutateProperties()}
        />
      )}

      {/* Quick Actions section */}
      <div className="mb-6">
        <QuickActions onSuccess={() => mutateProperties()} />
      </div>

      {/* KPI Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Revenue (Dec)"
          value={`₹${totalRevenue.toLocaleString('en-IN')}`}
          change={12.5}
          changeLabel="vs last month"
          trend="up"
          icon={<IndianRupee className="h-6 w-6 text-primary" />}
        />
        <KPICard
          title="Occupancy Rate"
          value="78%"
          change={5.2}
          changeLabel="vs last month"
          trend="up"
          icon={<Percent className="h-6 w-6 text-primary" />}
        />
        <KPICard
          title="Active Bookings"
          value={activeBookings.toString()}
          change={-2}
          changeLabel="vs last week"
          trend="down"
          icon={<CalendarCheck className="h-6 w-6 text-primary" />}
        />
        <KPICard
          title="Pending Tasks"
          value="7"
          change={3}
          changeLabel="new today"
          trend="neutral"
          icon={<AlertCircle className="h-6 w-6 text-primary" />}
        />
      </div>

      {/* Today's Operations Summary */}
      <div className="mb-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Today&apos;s Operations</CardTitle>
                <CardDescription>Guest movements and task overview for today</CardDescription>
              </div>
              <Link to="/tasks">
                <Button variant="outline" size="sm">
                  View All Tasks <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Check-ins Today */}
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
                      <BedDouble className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm font-medium">Check-ins</span>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  >
                    4 today
                  </Badge>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Vikram Malhotra</span>
                    <span>2:00 PM</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Neha Kapoor</span>
                    <span>3:30 PM</span>
                  </div>
                </div>
              </div>

              {/* Check-outs Today */}
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-orange-100 p-2 dark:bg-orange-900/30">
                      <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <span className="text-sm font-medium">Check-outs</span>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                  >
                    3 today
                  </Badge>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Deepak Verma</span>
                    <span>11:00 AM</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Priya Sharma</span>
                    <span>12:00 PM</span>
                  </div>
                </div>
              </div>

              {/* Urgent Tasks */}
              <div className="rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-900 dark:bg-red-950/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/30">
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="text-sm font-medium">Urgent Tasks</span>
                  </div>
                  <Badge variant="destructive">2</Badge>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">AC repair - Unit #204</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">VIP unit prep - Unit #201</span>
                  </div>
                </div>
              </div>

              {/* Completed Today */}
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium">Completed</span>
                  </div>
                  <Badge variant="secondary">12</Badge>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Task completion rate</span>
                    <span className="font-medium text-green-600 dark:text-green-400">85%</span>
                  </div>
                  <Progress value={85} className="mt-2 h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Properties Section */}
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your Properties</h2>
          <Link to="/properties">
            <Button variant="link" className="text-primary">
              View All Properties
            </Button>
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {properties.map((property) => (
            <PropertyCard key={property.name} {...property} />
          ))}
        </div>
      </div>

      {/* Charts and Timeline */}
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <RevenueChart />
        <BookingTimeline bookings={reservations as any} />
      </div>

      {/* Reviews and Alerts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentReviews />
        <AlertsPanel alerts={alerts} />
      </div>
    </DashboardLayout>
  )
}
