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
} from "lucide-react"
import { cn } from "@/lib/utils"





import { useFrappeGetDocList } from "frappe-react-sdk"

// ... imports

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

// const guests = [] // Removed placeholder

const statusConfig = {
  active: { label: "Active", className: "bg-green-500/10 text-green-600" },
  vip: { label: "VIP", className: "bg-purple-500/10 text-purple-600" },
  return: { label: "Returning", className: "bg-blue-500/10 text-blue-600" }, // Mapped from return_guest
  new: { label: "New", className: "bg-gray-500/10 text-gray-600" },
}

import { AddGuestDialog } from "@/components/guests/add-guest-dialog"

export default function GuestsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [addGuestOpen, setAddGuestOpen] = useState(false)

  const { data: guestsList } = useFrappeGetDocList("Guest", {
    fields: ["name", "guest_name", "email", "phone", "total_visits", "total_spend", "last_visit_date", "return_guest"],
    limit: 100,
    orderBy: { field: "last_visit_date", order: "desc" }
  })

  const guests: Guest[] = guestsList?.map(g => ({
    id: g.name,
    name: g.guest_name,
    email: g.email || "",
    phone: g.phone || "",
    location: "Not specified", // Placeholder as location isn't directly on Guest yet
    totalBookings: g.total_visits || 0,
    totalSpent: g.total_spend || 0,
    lastVisit: g.last_visit_date || "",
    status: g.return_guest ? "return" : (g.total_visits > 0 ? "active" : "new"), // Improve logic potentially
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
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.new
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Guest Management</h1>
          <p className="text-muted-foreground">Manage your guest database and relationships</p>
        </div>
        <Button className="bg-[#FF3D2E] hover:bg-[#FF3D2E]/90 shadow-lg shadow-red-500/20 rounded-xl transition-all hover:scale-105" onClick={() => setAddGuestOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Guest
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-[2rem] border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all overflow-hidden group">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users className="h-24 w-24 text-blue-600 -mr-6 -mt-6" />
            </div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Total Guests</p>
                <p className="text-4xl font-black text-gray-800 tracking-tight">{guests.length || "1,248"}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-green-600 bg-green-50 w-fit px-2 py-1 rounded-full">
              <span>+12%</span>
              <span className="text-gray-400">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 transition-all overflow-hidden group">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Star className="h-24 w-24 text-purple-600 -mr-6 -mt-6" />
            </div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">VIP Guests</p>
                <p className="text-4xl font-black text-gray-800 tracking-tight">{guests.filter(g => g.status === 'vip').length || "89"}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Star className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-purple-600 bg-purple-50 w-fit px-2 py-1 rounded-full">
              <span>Top Tier</span>
              <span className="text-gray-400">customers</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-green-500/10 hover:-translate-y-1 transition-all overflow-hidden group">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <UserCheck className="h-24 w-24 text-green-600 -mr-6 -mt-6" />
            </div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Returning</p>
                <p className="text-4xl font-black text-gray-800 tracking-tight">{Math.round((guests.filter(g => g.status === 'return').length / (guests.length || 1)) * 100) || "67"}%</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <UserCheck className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-green-600 bg-green-50 w-fit px-2 py-1 rounded-full">
              <span>Loyalty Rate</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-1 transition-all overflow-hidden group">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <UserPlus className="h-24 w-24 text-orange-600 -mr-6 -mt-6" />
            </div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">New</p>
                <p className="text-4xl font-black text-gray-800 tracking-tight">{guests.filter(g => g.status === 'new').length || "34"}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                <UserPlus className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-orange-600 bg-orange-50 w-fit px-2 py-1 rounded-full">
              <span>Recent Additions</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      {/* Filters */}
      <Card className="mb-8 rounded-[2rem] border-gray-100 shadow-xl shadow-gray-200/50">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search guests..."
                className="pl-10 h-11 rounded-2xl bg-gray-50 border-gray-100 focus-visible:ring-red-500/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <Select>
                <SelectTrigger className="w-[140px] h-11 rounded-2xl border-gray-100 bg-gray-50 focus:ring-red-500/20">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[160px] h-11 rounded-2xl border-gray-100 bg-gray-50 focus:ring-red-500/20">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="spent">Highest Spent</SelectItem>
                  <SelectItem value="bookings">Most Bookings</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guests Table */}
      <Card className="rounded-[2rem] border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
              <TableHead className="py-4 font-semibold text-gray-900 pl-6">Guest</TableHead>
              <TableHead className="py-4 font-semibold text-gray-900">Contact</TableHead>
              <TableHead className="py-4 font-semibold text-gray-900">Location</TableHead>
              <TableHead className="text-center py-4 font-semibold text-gray-900">Bookings</TableHead>
              <TableHead className="text-right py-4 font-semibold text-gray-900">Total Spent</TableHead>
              <TableHead className="py-4 font-semibold text-gray-900">Last Visit</TableHead>
              <TableHead className="py-4 font-semibold text-gray-900">Status</TableHead>
              <TableHead className="text-right py-4 font-semibold text-gray-900 pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGuests.map((guest) => (
              <TableRow key={guest.id} className="hover:bg-gray-50/50 transition-colors">
                <TableCell className="pl-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-gray-100">
                      <AvatarImage src={guest.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-gradient-to-br from-gray-50 to-gray-100 text-gray-600 font-medium">
                        {guest.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900">{guest.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{guest.id}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground hover:text-gray-900 transition-colors cursor-pointer">
                      <Mail className="h-3.5 w-3.5" />
                      {guest.email}
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground hover:text-gray-900 transition-colors cursor-pointer">
                      <Phone className="h-3.5 w-3.5" />
                      {guest.phone}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                    {guest.location}
                  </div>
                </TableCell>
                <TableCell className="text-center font-semibold text-gray-900 py-4">{guest.totalBookings}</TableCell>
                <TableCell className="text-right font-mono font-medium text-gray-900 py-4">₹{guest.totalSpent.toLocaleString("en-IN")}</TableCell>
                <TableCell className="py-4 text-sm text-gray-600">{formatDate(guest.lastVisit)}</TableCell>
                <TableCell className="py-4">
                  <Badge className={cn("rounded-md px-2 py-0.5 font-medium", getStatusConfig(guest.status).className)} variant="secondary">{getStatusConfig(guest.status).label}</Badge>
                </TableCell>
                <TableCell className="text-right pr-6 py-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="hover:bg-gray-100 rounded-lg">
                        <MoreHorizontal className="h-4 w-4 text-gray-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem onClick={() => handleViewGuest(guest)} className="rounded-lg">
                        <Eye className="mr-2 h-4 w-4" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-lg">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Send Message
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-lg">
                        <Calendar className="mr-2 h-4 w-4" />
                        View Bookings
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Guest Details Sheet */}
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {selectedGuest && (
            <>
              <SheetHeader>
                <SheetTitle>Guest Profile</SheetTitle>
                <SheetDescription>View and manage guest information</SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Guest Header */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedGuest.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {selectedGuest.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedGuest.name}</h3>
                    <Badge className={getStatusConfig(selectedGuest.status).className}>
                      {getStatusConfig(selectedGuest.status).label}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Contact Info */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {selectedGuest.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {selectedGuest.phone}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {selectedGuest.location}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold text-primary">{selectedGuest.totalBookings}</p>
                    <p className="text-xs text-muted-foreground">Bookings</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold text-primary">₹{(selectedGuest.totalSpent / 1000).toFixed(0)}k</p>
                    <p className="text-xs text-muted-foreground">Total Spent</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold text-primary">4.8</p>
                    <p className="text-xs text-muted-foreground">Avg Rating</p>
                  </div>
                </div>

                {/* Recent Bookings */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Recent Bookings</h4>
                  <div className="space-y-2">
                    <div className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Ocean View Villa</span>
                        <Badge className="bg-green-500/10 text-green-600">Completed</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Dec 15-18, 2025</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Heritage Homestay</span>
                        <Badge className="bg-green-500/10 text-green-600">Completed</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Nov 20-23, 2025</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <MessageSquare className="mr-1.5 h-4 w-4" />
                    Message
                  </Button>
                  <Button className="flex-1 bg-[#E68B47] hover:bg-[#c97339]">
                    <Plus className="mr-1.5 h-4 w-4" />
                    New Booking
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      <AddGuestDialog open={addGuestOpen} onOpenChange={setAddGuestOpen} />
    </DashboardLayout>
  )
}
