"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  Users,
  UserCheck,
  UserPlus,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLocalDocList } from "@/hooks/use-local-data"
import { AddGuestDialog } from "@/components/guests/add-guest-dialog"

interface Guest {
  id: string
  name: string
  email: string
  phone: string
  location: string
  totalBookings: number
  totalSpent: number
  lastVisit: string
  status: "active" | "vip" | "return" | "new"
  avatar?: string
}

const statusConfig = {
  active: { label: "Active", className: "bg-emerald-50 text-emerald-600" },
  vip: { label: "VIP", className: "bg-amber-50 text-amber-600" },
  return: { label: "Returning", className: "bg-blue-50 text-blue-600" },
  new: { label: "New", className: "bg-purple-50 text-purple-600" },
}

export default function GuestsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [addGuestOpen, setAddGuestOpen] = useState(false)

  const { data: guestsList, isLoading } = useLocalDocList("Guest", {
    sort: [{ last_visit_date: 'desc' }]
  })

  const guests: Guest[] = guestsList?.map(g => ({
    id: g.name,
    name: g.guest_name,
    email: g.email || "",
    phone: g.phone || "",
    location: "Not specified",
    totalBookings: g.total_visits || 0,
    totalSpent: g.total_spend || 0,
    lastVisit: g.last_visit_date || "",
    status: g.return_guest ? "return" : (g.total_visits > 0 ? "active" : "new"),
    avatar: ""
  })) || []

  const filteredGuests = guests.filter(
    (g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.phone.includes(searchQuery),
  )

  const handleViewGuest = (guest: Guest) => {
    setSelectedGuest(guest)
    setDetailsOpen(true)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.new
  }

  const stats = [
    { label: "Total Guests", value: guests.length || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "VIP Guests", value: guests.filter(g => g.status === 'vip').length || 0, icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Returning", value: Math.round((guests.filter(g => g.status === 'return').length / (guests.length || 1)) * 100) + "%", icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "New", value: guests.filter(g => g.status === 'new').length || 0, icon: UserPlus, color: "text-purple-600", bg: "bg-purple-50" },
  ]

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Guests</h1>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              Manage guest profiles & history
            </p>
          </div>
          <Button
            onClick={() => setAddGuestOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white rounded-lg h-9 px-3 text-xs font-bold gap-1.5 shadow-sm transition-all hover:scale-105"
          >
            <Plus className="h-3.5 w-3.5" /> Add Guest
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat) => (
            <Card key={stat.label} className="border border-slate-100 shadow-sm rounded-xl bg-white transition-all hover:shadow-md">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{stat.label}</span>
                  <div className={cn("p-1.5 rounded-lg", stat.bg)}>
                    <stat.icon className={cn("h-3.5 w-3.5", stat.color)} />
                  </div>
                </div>
                <p className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search guests by name, email, phone..."
              className="pl-9 h-10 rounded-xl bg-white border-slate-200 shadow-sm text-xs font-medium focus-visible:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select>
            <SelectTrigger className="w-[140px] h-10 rounded-xl border-slate-200 bg-white shadow-sm text-xs font-bold">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
              <SelectItem value="new">New</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Data Table */}
        <Card className="border border-slate-100 shadow-sm rounded-xl overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-50">
                  <TableHead className="py-3 px-4 w-12 pl-6"></TableHead>
                  <TableHead className="py-3 font-bold text-[10px] uppercase tracking-wider text-slate-400">Guest Name</TableHead>
                  <TableHead className="py-3 font-bold text-[10px] uppercase tracking-wider text-slate-400">Contact</TableHead>
                  <TableHead className="py-3 font-bold text-[10px] uppercase tracking-wider text-slate-400 text-center">Bookings</TableHead>
                  <TableHead className="py-3 font-bold text-[10px] uppercase tracking-wider text-slate-400 text-right">Spent</TableHead>
                  <TableHead className="py-3 font-bold text-[10px] uppercase tracking-wider text-slate-400 text-right">Last Visit</TableHead>
                  <TableHead className="py-3 font-bold text-[10px] uppercase tracking-wider text-slate-400">Status</TableHead>
                  <TableHead className="py-3 font-bold text-[10px] uppercase tracking-wider text-slate-400 text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto text-slate-300" />
                    </TableCell>
                  </TableRow>
                ) : filteredGuests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-slate-400 text-xs font-medium uppercase tracking-wide">
                      No guests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGuests.map((guest) => (
                    <TableRow key={guest.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 group">
                      <TableCell className="py-2 px-4 pl-6 w-12">
                        <Avatar className="h-8 w-8 border border-slate-100">
                          <AvatarImage src={guest.avatar} />
                          <AvatarFallback className="bg-slate-100 text-slate-500 text-[10px] font-bold">
                            {guest.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="py-2 px-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800">{guest.name}</span>
                          <span className="text-[9px] text-slate-400 font-medium">ID: {guest.id}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-4">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                            <Mail className="h-3 w-3 text-slate-400" />
                            {guest.email}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                            <Phone className="h-3 w-3 text-slate-400" />
                            {guest.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-4 text-center">
                        <span className="text-xs font-bold text-slate-700">{guest.totalBookings}</span>
                      </TableCell>
                      <TableCell className="py-2 px-4 text-right">
                        <span className="text-xs font-bold text-slate-700">₹{guest.totalSpent.toLocaleString()}</span>
                      </TableCell>
                      <TableCell className="py-2 px-4 text-right">
                        <span className="text-xs font-medium text-slate-500">{formatDate(guest.lastVisit)}</span>
                      </TableCell>
                      <TableCell className="py-2 px-4">
                        <Badge className={cn("text-[9px] font-bold uppercase rounded-md px-1.5 py-0 border-none shadow-none", getStatusConfig(guest.status).className)}>
                          {getStatusConfig(guest.status).label}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 px-4 text-right pr-6">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 mr-1"
                          onClick={() => handleViewGuest(guest)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-slate-400 hover:bg-slate-100">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 rounded-xl p-1 shadow-lg border-slate-100">
                            <DropdownMenuItem className="rounded-lg text-xs font-bold cursor-pointer focus:bg-slate-50" onClick={() => handleViewGuest(guest)}>
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg text-xs font-bold cursor-pointer focus:bg-slate-50">
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg text-xs font-bold cursor-pointer focus:bg-slate-50">
                              Booking History
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Guest Details Sheet */}
        <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
          <SheetContent className="w-full sm:max-w-md p-0 gap-0 border-l border-slate-100 shadow-2xl">
            {selectedGuest && (
              <div className="flex flex-col h-full bg-slate-50/50">
                <div className="bg-[#ff3924]/5 border-b border-[#ff3924]/10 p-6 flex flex-col items-center flex-shrink-0">
                  <Avatar className="h-20 w-20 border-4 border-white shadow-sm mb-3">
                    <AvatarImage src={selectedGuest.avatar} />
                    <AvatarFallback className="bg-[#ff3924] text-white text-2xl font-bold">
                      {selectedGuest.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight mb-1">{selectedGuest.name}</h2>
                  <div className="flex gap-2 mb-4">
                    <Badge className={cn("text-[10px] font-bold uppercase border-none", getStatusConfig(selectedGuest.status).className)}>
                      {getStatusConfig(selectedGuest.status).label}
                    </Badge>
                  </div>
                  <div className="flex w-full gap-3">
                    <Button className="flex-1 bg-white hover:bg-white/80 text-slate-700 border border-slate-200 shadow-sm h-9 text-xs font-bold">
                      <MessageSquare className="mr-2 h-3.5 w-3.5" /> Message
                    </Button>
                    <Button className="flex-1 bg-[#ff3924] hover:bg-[#ff3924]/90 text-white shadow-sm h-9 text-xs font-bold">
                      <Calendar className="mr-2 h-3.5 w-3.5" /> Book Now
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <Card className="border-none shadow-sm rounded-xl overflow-hidden">
                    <div className="bg-slate-100/50 px-4 py-2 border-b border-slate-100 flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-slate-500" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Contact Info</span>
                    </div>
                    <CardContent className="p-4 space-y-3 bg-white">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                          <Mail className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Email</p>
                          <p className="text-xs font-bold text-slate-800">{selectedGuest.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                          <Phone className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Phone</p>
                          <p className="text-xs font-bold text-slate-800">{selectedGuest.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Location</p>
                          <p className="text-xs font-bold text-slate-800">{selectedGuest.location}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-sm rounded-xl overflow-hidden">
                    <div className="bg-slate-100/50 px-4 py-2 border-b border-slate-100 flex items-center gap-2">
                      <Eye className="h-3.5 w-3.5 text-slate-500" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Statistics</span>
                    </div>
                    <CardContent className="p-4 space-y-0 bg-white">
                      <div className="grid grid-cols-3 gap-0 divide-x divide-slate-100">
                        <div className="text-center px-2">
                          <span className="block text-xl font-black text-slate-800">{selectedGuest.totalBookings}</span>
                          <span className="text-[9px] font-bold uppercase text-slate-400">Bookings</span>
                        </div>
                        <div className="text-center px-2">
                          <span className="block text-xl font-black text-slate-800">₹{selectedGuest.totalSpent > 1000 ? (selectedGuest.totalSpent / 1000).toFixed(1) + 'k' : selectedGuest.totalSpent}</span>
                          <span className="text-[9px] font-bold uppercase text-slate-400">Spend</span>
                        </div>
                        <div className="text-center px-2">
                          <span className="block text-xl font-black text-slate-800">4.9</span>
                          <span className="text-[9px] font-bold uppercase text-slate-400">Rating</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
        <AddGuestDialog open={addGuestOpen} onOpenChange={setAddGuestOpen} />
      </div>
    </DashboardLayout>
  )
}
