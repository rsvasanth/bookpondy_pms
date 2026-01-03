"use client"


import { DashboardListWidget, type DashboardListItem } from "@/components/dashboard/dashboard-list-widget"
import { DashboardStatsCard } from "@/components/dashboard/dashboard-stats-card"
import { DashboardFilters } from "@/components/dashboard/dashboard-filters"
import { } from "frappe-react-sdk"
import { useLocalDocList } from "@/hooks/use-local-data"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Users,
  LogIn,
  AlertCircle,
  ArrowRight,
  MessageSquareMore,
  Building2,
  CalendarDays,
  CreditCard,
  ChevronRight,
  Plus,
  Table2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import type { ColumnDef } from "@tanstack/react-table"
import { cn } from "@/lib/utils"

// --- Column Definitions ---
const columns: ColumnDef<any>[] = [
  {
    accessorKey: "guest",
    header: "Guest Detail",
    cell: ({ row }) => {
      const b = row.original
      const initials = b.guest_name ? b.guest_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : "G"
      return (
        <div className="flex items-center gap-3 py-1">
          <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-primary font-semibold text-xs border border-border">
            {initials}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-foreground text-sm leading-none">{b.guest_name}</span>
            <span className="text-xs font-medium text-muted-foreground mt-0.5 leading-none">#{(b.name || b.id || "").split("-").pop()}</span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "property",
    header: "Property / Unit",
    cell: ({ row }) => {
      const b = row.original
      return (
        <div className="flex flex-col gap-1 leading-tight">
          <div className="flex items-center gap-1.5 font-semibold text-foreground text-sm">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="truncate max-w-[120px]">{b.property}</span>
          </div>
          <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <span className="px-1.5 py-0.5 bg-muted rounded border border-border">{b.unit || "Standard Unit"}</span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.reservation_status
      return (
        <Badge className={cn(
          "text-[10px] font-bold px-2 py-0.5 rounded-md border-none shadow-none uppercase tracking-wider",
          status === "Confirmed" ? "bg-success text-white" :
            status === "Checked-In" ? "bg-info text-white" :
              status === "Checked-Out" ? "bg-muted text-muted-foreground" :
                status === "Cancelled" ? "bg-error text-white" :
                  "bg-muted text-muted-foreground"
        )}>
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "dates",
    header: "Stay Period",
    cell: ({ row }) => {
      const b = row.original
      return (
        <div className="flex flex-col gap-0.5 leading-none">
          <div className="flex items-center gap-1 text-xs font-semibold text-foreground">
            {b.check_in_date}
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            {b.check_out_date}
          </div>
          <span className="text-[10px] font-medium text-muted-foreground">Standard Stay</span>
        </div>
      )
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const b = row.original
      return (
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-foreground text-sm">₹{b.total_amount?.toLocaleString() || "0"}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "payment_status",
    header: "Payment",
    cell: ({ row }) => {
      const status = row.original.payment_status || "Pending"
      return (
        <Badge variant="outline" className={cn(
          "text-[10px] font-bold px-2 py-0.5 rounded-md border shadow-none uppercase tracking-tighter",
          status === "Received" ? "bg-success/10 text-success border-success/20" :
            status === "Refunded" ? "bg-muted text-muted-foreground border-border" :
              "bg-warning/10 text-warning border-warning/20"
        )}>
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "reservation_source",
    header: "Source",
    cell: ({ row }) => {
      const source = row.original.reservation_source || "Direct"
      return (
        <Badge variant="outline" className="text-[10px] font-medium text-muted-foreground border-border bg-card px-2 py-0.5 rounded-md">
          {source}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: () => (
      <div className="flex justify-end">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
]

const downloadCSV = (data: any[]) => {
  const headers = ["Guest", "Property", "Unit", "Check In", "Check Out", "Status", "Amount"]
  const rows = data.map(r => [
    r.guest_name,
    r.property,
    r.allocated_unit || "N/A",
    r.check_in_date,
    r.check_out_date,
    r.reservation_status,
    r.total_amount
  ])

  const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n")
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", "bookings_export.csv")
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export default function BookingsPage() {
  const navigate = useNavigate()

  // --- Filter & Pagination State ---
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [selectedProperty, setSelectedProperty] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("All Status")
  const [selectedDateRange, setSelectedDateRange] = useState("This Month")

  // --- Data Fetching ---
  const { data: properties } = useLocalDocList("Property")

  // Build RxDB Selector (Mango query)
  const selector: any = {}

  // Search Logic
  if (searchTerm) {
    selector.$or = [
      { guest_name: { $regex: searchTerm, $options: 'i' } },
      { name: { $regex: searchTerm, $options: 'i' } }
    ]
  }

  if (selectedStatus && selectedStatus !== "All Status") {
    selector.reservation_status = selectedStatus
  } else {
    selector.reservation_status = { $in: ["Confirmed", "Checked-In", "Tentative", "Checked-Out", "Cancelled"] }
  }

  if (selectedProperty) {
    selector.property = selectedProperty
  }

  // Date Range Logic (RxDB compatible)
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  if (selectedDateRange === "Today") {
    selector.check_in_date = todayStr
  } else if (selectedDateRange === "This Week") {
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    selector.check_in_date = { $gte: oneWeekAgo.toISOString().split('T')[0] }
  } else if (selectedDateRange === "This Month") {
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    selector.check_in_date = { $gte: firstDay.toISOString().split('T')[0] }
  }

  const { data: reservations, isLoading: reservationsLoading } = useLocalDocList("Reservation", {
    selector: selector,
    sort: [{ check_in_date: 'desc' }],
    limit: pageSize,
    skip: (currentPage - 1) * pageSize
  })

  // Get total count for pagination (ignore limit/skip)
  const { data: allMatchingReservations } = useLocalDocList("Reservation", {
    selector: selector
  })
  const totalItems = allMatchingReservations?.length || 0
  const totalPages = Math.ceil(totalItems / pageSize)

  const { data: enquiries, isLoading: enquiryLoading } = useLocalDocList("Booking Inquiry", {
    selector: { inquiry_status: 'New' },
    sort: [{ modified: 'desc' }]
  })

  // Table Setup with Action Handling via Link
  const columnsWithActions: ColumnDef<any>[] = [
    ...columns.filter(c => c.id !== "actions"),
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted"
            onClick={() => navigate(`/bookings/${row.original.name}`)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      ),
    }
  ]

  const table = useReactTable({
    data: reservations || [],
    columns: columnsWithActions,
    getCoreRowModel: getCoreRowModel(),
  })

  const enquiryItems: DashboardListItem[] = enquiries?.map(e => ({
    id: e.name,
    title: e.guest_name,
    subtitle: e.property_interested,
    status: "New",
    raw: e
  })) || []

  return (
    <>
      <div className="flex flex-col gap-6 pb-12 px-6">
        {/* Header Area */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-4 -mx-6 px-6 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                <CalendarDays className="h-4 w-4 text-primary" />
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground">Property Ledger</h1>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Manage stays, arrivals, and guest enquiries
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4 rounded-md text-xs font-semibold border-border bg-background shadow-sm hover:bg-muted transition-all"
              onClick={() => downloadCSV(reservations || [])}
            >
              Export Records
            </Button>
            <Button
              onClick={() => navigate("/bookings/new")}
              className="h-9 px-4 font-semibold text-xs gap-2 rounded-md shadow-lg transition-all active:scale-95 bg-primary text-white"
            >
              <Plus className="h-4 w-4" /> New Reservation
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
          <DashboardStatsCard
            title="Today Arrivals"
            value={String(reservations?.filter((r: any) => r.reservation_status === "Confirmed" && r.check_in_date === today.toISOString().split('T')[0]).length || "0")}
            icon={LogIn}
            trend="neutral"
            trendValue="Arrivals"
          />
          <DashboardStatsCard
            title="Active Guests"
            value={String(reservations?.filter((r: any) => r.reservation_status === "Checked-In").length || "0")}
            icon={Users}
            trend="neutral"
            trendValue="In-House"
          />
          <DashboardStatsCard
            title="Total Stays"
            value={String(totalItems || "0")}
            icon={CalendarDays}
            trend="neutral"
            trendValue="Ledger"
          />
          <DashboardStatsCard
            title="New Enquiries"
            value={String(enquiries?.length || "0")}
            icon={MessageSquareMore}
            trend="neutral"
            trendValue="Leads"
          />
        </div>

        <div className="px-0">
          <DashboardFilters
            properties={properties}
            selectedProperty={selectedProperty}
            onPropertyChange={(val) => { setSelectedProperty(val); setCurrentPage(1); }}
            selectedStatus={selectedStatus}
            onStatusChange={(val) => { setSelectedStatus(val); setCurrentPage(1); }}
            selectedDateRange={selectedDateRange}
            onDateRangeChange={(val) => { setSelectedDateRange(val); setCurrentPage(1); }}
            searchTerm={searchTerm}
            onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
          />
        </div>

        {/* Unified Layout: 3/4 Table + 1/4 Enquiries */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 px-2">

          <div className="lg:col-span-3">
            <Card className="border border-border/50 shadow-sm bg-card/40 backdrop-blur-md overflow-hidden flex flex-col h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border p-4 bg-muted/20">
                <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center bg-background border border-border text-foreground shadow-sm">
                    <Table2 className="h-3.5 w-3.5" />
                  </div>
                  <span>Reservation Discovery</span>
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px] font-bold bg-muted/50 text-muted-foreground border-none">
                    {totalItems} RECORDS
                  </Badge>
                </CardTitle>
              </CardHeader>

              <div className="p-0 overflow-auto">
                <Table>
                  <TableHeader className="bg-muted/10">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-border/50">
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id} className="text-xs font-semibold text-muted-foreground px-4 py-2.5 h-auto">
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {reservationsLoading ? (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="h-32 text-center py-10">
                          <div className="flex flex-col items-center gap-2">
                            <div className="h-5 w-5 animate-spin border-2 border-primary border-t-transparent rounded-full" />
                            <span className="text-xs font-medium text-muted-foreground/60">Loading Ledger...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          className="hover:bg-primary/[0.02] transition-colors border-b border-border/30 group cursor-pointer"
                          onClick={() => navigate(`/bookings/${row.original.name}`)}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className="px-4 py-2 border-none">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground/40 text-xs italic">
                          No reservations found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              <div className="mt-auto p-3 border-t border-border/50 bg-muted/10 flex items-center justify-between">
                <p className="text-xs text-muted-foreground font-medium">
                  Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)} - {Math.min(currentPage * pageSize, totalItems)} of {totalItems}
                </p>
                <div className="flex items-center gap-1.5 focus-visible:ring-primary/20">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-3 rounded-md text-xs font-semibold hover:bg-primary/5 hover:text-primary transition-all disabled:opacity-30"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </Button>
                  {totalPages <= 5 ? (
                    Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "ghost"}
                        size="sm"
                        className={cn(
                          "h-7 w-7 rounded-md text-xs font-semibold shadow-none transition-all",
                          currentPage === page ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-primary/5"
                        )}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))
                  ) : (
                    <span className="text-xs font-semibold text-primary px-2">Page {currentPage} of {totalPages}</span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-3 rounded-md text-xs font-semibold hover:bg-primary/5 hover:text-primary transition-all disabled:opacity-30"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Booking Enquiries */}
          <div className="lg:col-span-1">
            <DashboardListWidget
              title="Recent Enquiries"
              icon={<MessageSquareMore className="h-4 w-4" />}
              items={enquiryItems}
              isLoading={enquiryLoading}
              renderItemActions={() => (
                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-md hover:bg-primary/5 hover:text-primary transition-all">
                  <ArrowRight className="h-3 w-3" />
                </Button>
              )}
              onViewAll={() => navigate('/communications')}
            />
          </div>

        </div>
      </div>
    </>
  )
}
