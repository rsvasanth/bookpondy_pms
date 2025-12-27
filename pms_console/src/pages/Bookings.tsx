"use client"


import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DashboardListWidget, type DashboardListItem } from "@/components/dashboard/dashboard-list-widget"
import { DashboardStatsCard } from "@/components/dashboard/dashboard-stats-card"
import { DashboardFilters } from "@/components/dashboard/dashboard-filters"
import { useFrappeGetDocList } from "frappe-react-sdk"
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
        <div className="flex items-center gap-3 py-1">
          <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs border border-slate-200 shadow-sm">
            {initials}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[#0f0f14] text-sm leading-tight">{b.guest_name}</span>
            <span className="text-[10px] font-medium text-slate-400 tracking-tight">{b.name}</span>
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
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Building2 className="h-3 w-3 text-slate-400" />
            <span className="text-xs font-bold">{b.property}</span>
          </div>
          <Badge variant="outline" className="w-fit text-[9px] font-black uppercase text-slate-500 border-slate-200 bg-slate-50 px-1.5 py-0">
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
          case "Confirmed":
            return "bg-[#ff3924] text-white"
          case "Checked-In":
            return "bg-blue-500 text-white"
          case "Checked-Out":
            return "bg-slate-500 text-white"
          case "Cancelled":
            return "bg-slate-200 text-slate-500"
          default:
            return "bg-primary text-white"
        }
      }
      return (
        <Badge className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-md border-none shadow-none tracking-wider", getStatusStyles(status))}>
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
        <div className="flex flex-col gap-0.5 mt-0.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0f0f14]">
            {b.check_in_date}
            <ArrowRight className="h-3 w-3 text-slate-300" />
            {b.check_out_date}
          </div>
          <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400">
            <CalendarDays className="h-2.5 w-2.5" />
            <span>Standard Stay</span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "amount",
    header: "Total Amount",
    cell: ({ row }) => {
      const b = row.original
      return (
        <div className="flex items-center gap-1.5">
          <CreditCard className="h-3 w-3 text-slate-400" />
          <span className="font-black text-[#0f0f14] text-sm">₹{b.total_amount?.toLocaleString() || "0"}</span>
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: () => (
      <div className="flex justify-end">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-[#ff3924] hover:bg-slate-50">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
]

export default function BookingsPage() {
  // --- Data Fetching ---
  const { data: reservations, isLoading: reservationsLoading } = useFrappeGetDocList("Reservation", {
    fields: ["name", "guest_name", "reservation_status", "check_in_date", "check_out_date", "total_amount", "property"],
    filters: [["reservation_status", "in", ["Confirmed", "Checked-In", "Tentative", "Checked-Out"]]],
    limit: 50,
    orderBy: { field: "check_in_date", order: "asc" }
  })

  const { data: enquiries, isLoading: enquiryLoading } = useFrappeGetDocList("Booking Inquiry", {
    fields: ["name", "guest_name", "inquiry_status", "property_interested"],
    filters: [["inquiry_status", "=", "New"]],
    limit: 10,
    orderBy: { field: "creation", order: "desc" }
  })

  // Table Setup
  const table = useReactTable({
    data: reservations || [],
    columns,
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
    <DashboardLayout>
      <div className="flex flex-col space-y-6 pb-12">
        <div className="w-full space-y-6 px-2">

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardStatsCard
              title="Today Arrivals"
              value={String(reservations?.filter((r: any) => r.reservation_status === "Confirmed").length || "0")}
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

          <DashboardFilters />

          {/* Unified Layout: 3/4 Table + 1/4 Enquiries */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            <div className="lg:col-span-3">
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-white border border-slate-100 shadow-sm flex items-center justify-center">
                      <CalendarDays className="h-4 w-4 text-[#ff3924]" />
                    </div>
                    <div>
                      <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800">Reservation Management</h2>
                      <p className="text-[10px] text-slate-400 font-medium tracking-tight mt-0.5">Unified view of all active property bookings</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs font-bold border-slate-200">
                      Export CSV
                    </Button>
                  </div>
                </div>

                <div className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="hover:bg-transparent border-slate-50">
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-6 py-4 h-auto">
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
                            className="hover:bg-slate-50/50 transition-colors border-slate-50 group"
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
                          <TableCell colSpan={columns.length} className="h-24 text-center text-slate-500 font-medium">
                            No reservations found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
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
                renderItemActions={() => <Button size="sm" variant="ghost" className="h-7 text-xs font-bold hover:text-[#ff3924]">Reply</Button>}
              />
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

