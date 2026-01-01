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
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
        <div className="flex items-center gap-4 py-2">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-primary font-black text-xs border border-border shadow-sm">
            {initials}
          </div>
          <div className="flex flex-col">
            <span className="font-black text-foreground text-xs uppercase tracking-tight">{b.guest_name}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">#{b.name.split("-").pop()}</span>
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
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground opacity-50" />
            <span className="text-[11px] font-black text-foreground uppercase tracking-tight">{b.property}</span>
          </div>
          <Badge variant="outline" className="w-fit text-[9px] font-black uppercase text-muted-foreground border-border bg-muted/50 px-2 py-0.5 rounded-md tracking-widest">
            {b.unit || "Room 204"}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.reservation_status
      const getStatusStyles = (s: string) => {
        switch (s) {
          case "Confirmed": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
          case "Checked-In": return "bg-blue-500/10 text-blue-500 border-blue-500/20"
          case "Checked-Out": return "bg-muted text-muted-foreground border-border"
          case "Cancelled": return "bg-rose-500/10 text-rose-500 border-rose-500/20"
          default: return "bg-muted text-muted-foreground border-border"
        }
      }
      return (
        <Badge variant="outline" className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-md border shadow-none tracking-tight", getStatusStyles(status))}>
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
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[11px] font-black text-foreground uppercase tracking-tighter">
            {b.check_in_date}
            <ArrowRight className="h-3 w-3 text-muted-foreground opacity-30" />
            {b.check_out_date}
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
            <CalendarDays className="h-3 w-3" />
            <span>Standard Stay</span>
          </div>
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
          <span className="font-black text-foreground text-sm tracking-tighter">₹{b.total_amount?.toLocaleString() || "0"}</span>
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
          "text-[9px] font-black uppercase px-2 py-0.5 rounded-md border shadow-none tracking-tight",
          status === "Received" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
            status === "Refunded" ? "bg-muted text-muted-foreground border-border" :
              "bg-amber-500/10 text-amber-500 border-amber-500/20"
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
        <Badge variant="outline" className="text-[9px] font-bold text-muted-foreground border-border bg-card uppercase tracking-[0.1em] px-2 py-0.5 rounded-md">
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
            className="h-8 w-8 rounded-lg text-slate-400 hover:text-[#ff3924] hover:bg-slate-50"
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
      <div className="flex flex-col gap-8 pb-12">
        <div className="w-full space-y-8 px-2">

          {/* Header Row with Add Booking */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">Property Reservations</h1>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Manage stays, arrivals, and guest enquiries across your properties.
              </p>
            </div>
            <Button onClick={() => navigate("/bookings/new")} className="bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-lg h-10 px-6 text-[10px] uppercase tracking-widest gap-2 shadow-sm">
              <LogIn className="h-4 w-4" /> Add Booking
            </Button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardStatsCard
              title="Today Arrivals"
              value={String(reservations?.filter((r: any) => r.reservation_status === "Confirmed" && r.check_in_date === today.toISOString().split('T')[0]).length || "0")}
              icon={LogIn}
            />
            <DashboardStatsCard
              title="Active Guests"
              value={String(reservations?.filter((r: any) => r.reservation_status === "Checked-In").length || "0")}
              icon={Users}
            />
            <DashboardStatsCard
              title="Total Stays"
              value={String(reservations?.length || "0")}
              icon={CalendarDays}
            />
            <DashboardStatsCard
              title="New Enquiries"
              value={String(enquiries?.length || "0")}
              icon={AlertCircle}
            />
          </div>

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

          {/* Unified Layout: 3/4 Table + 1/4 Enquiries */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            <div className="lg:col-span-3">
              <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-card border border-border shadow-sm flex items-center justify-center">
                      <CalendarDays className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Reservation Discovery</h2>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60 mt-0.5">Unified ledger of property occupancy</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest border-border bg-card shadow-sm"
                      onClick={() => downloadCSV(reservations || [])}
                    >
                      Export Data
                    </Button>
                  </div>
                </div>

                <div className="p-0">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-border">
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id} className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground px-6 py-5 h-auto">
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
                          <TableCell colSpan={columns.length} className="h-24 text-center">
                            Loading reservations...
                          </TableCell>
                        </TableRow>
                      ) : table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                          <TableRow
                            key={row.id}
                            className="hover:bg-muted/50 transition-colors border-border group cursor-pointer"
                            onClick={() => navigate(`/bookings/${row.original.name}`)}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id} className="px-6 py-3 border-none">
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
                          <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground font-medium">
                            No reservations found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination Controls */}
                <div className="p-4 border-t border-border bg-muted/30 flex items-center justify-between">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                    Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} results
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-lg text-xs font-bold border-border disabled:opacity-50"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "h-8 w-8 rounded-lg text-xs font-bold",
                          currentPage === page ? "bg-primary hover:bg-primary/90 text-primary-foreground border-none shadow-sm" : "border-border"
                        )}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-lg text-xs font-bold border-border disabled:opacity-50"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages || totalPages === 0}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Enquiries */}
            <div className="lg:col-span-1">
              <DashboardListWidget
                title="Booking Enquiries"
                icon={<MessageSquareMore className="h-4 w-4" />}
                items={enquiryItems}
                isLoading={enquiryLoading}
                renderItemActions={() => <Button size="sm" variant="ghost" className="h-7 text-xs font-bold hover:text-foreground">Reply</Button>}
              />
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

