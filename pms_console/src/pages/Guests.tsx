"use client"

import { useState } from "react"
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
  active: { label: "Active", className: "bg-emerald-500/10 text-emerald-500" },
  vip: { label: "VIP", className: "bg-amber-500/10 text-amber-500" },
  return: { label: "Returning", className: "bg-blue-500/10 text-blue-500" },
  new: { label: "New", className: "bg-purple-500/10 text-purple-500" },
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
    { label: "Total Guests", value: guests.length || 0, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "VIP Guests", value: guests.filter(g => g.status === 'vip').length || 0, icon: Star, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Returning", value: Math.round((guests.filter(g => g.status === 'return').length / (guests.length || 1)) * 100) + "%", icon: UserCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "New", value: guests.filter(g => g.status === 'new').length || 0, icon: UserPlus, color: "text-purple-500", bg: "bg-purple-500/10" },
  ]

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Guests</h1>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
              Manage guest profiles & history
            </p>
          </div>
          <Button
            onClick={() => setAddGuestOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-9 px-4 text-[10px] font-bold gap-1.5 shadow-sm uppercase tracking-widest"
          >
            <Plus className="h-3.5 w-3.5" /> Add Guest
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat) => (
            <Card key={stat.label} className="border border-border shadow-sm rounded-lg bg-card overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                  <div className={cn("p-1.5 rounded-md border border-border", stat.bg)}>
                    <stat.icon className={cn("h-3.5 w-3.5", stat.color)} />
                  </div>
                </div>
                <p className="text-2xl font-black text-foreground tracking-tight">{stat.value}</p>
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
              className="pl-9 h-10 rounded-lg bg-muted/20 border-border shadow-sm text-xs font-bold focus-visible:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select>
            <SelectTrigger className="w-[140px] h-10 rounded-lg border-border bg-muted/20 shadow-sm text-[10px] font-bold uppercase tracking-widest">
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
        <Card className="border border-border shadow-sm rounded-lg overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                  <TableHead className="py-2.5 px-3 w-12 pl-4"></TableHead>
                  <TableHead className="py-2.5 font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Guest Name</TableHead>
                  <TableHead className="py-2.5 font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Contact</TableHead>
                  <TableHead className="py-2.5 font-bold text-[10px] uppercase tracking-widest text-muted-foreground text-center">Bookings</TableHead>
                  <TableHead className="py-2.5 font-bold text-[10px] uppercase tracking-widest text-muted-foreground text-right">Spent</TableHead>
                  <TableHead className="py-2.5 font-bold text-[10px] uppercase tracking-widest text-muted-foreground text-right">Last Visit</TableHead>
                  <TableHead className="py-2.5 font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Status</TableHead>
                  <TableHead className="py-2.5 font-bold text-[10px] uppercase tracking-widest text-muted-foreground text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : filteredGuests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                      No guests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGuests.map((guest) => (
                    <TableRow key={guest.id} className="hover:bg-muted/30 transition-colors border-b border-border group">
                      <TableCell className="py-2.5 px-3 pl-4 w-12">
                        <Avatar className="h-8 w-8 border border-border">
                          <AvatarImage src={guest.avatar} />
                          <AvatarFallback className="bg-muted text-muted-foreground text-[10px] font-bold">
                            {guest.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="py-2.5 px-3">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-foreground">{guest.name}</span>
                          <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">ID: {guest.id}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5 px-3">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                            <Mail className="h-3 w-3" />
                            {guest.email}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                            <Phone className="h-3 w-3" />
                            {guest.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5 px-3 text-center">
                        <span className="text-xs font-bold text-foreground">{guest.totalBookings}</span>
                      </TableCell>
                      <TableCell className="py-2.5 px-3 text-right">
                        <span className="text-xs font-black text-foreground">₹{guest.totalSpent.toLocaleString()}</span>
                      </TableCell>
                      <TableCell className="py-2.5 px-3 text-right">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{formatDate(guest.lastVisit)}</span>
                      </TableCell>
                      <TableCell className="py-2.5 px-3">
                        <Badge className={cn("text-[8px] font-bold uppercase rounded-sm px-1.5 py-0 border-none shadow-none tracking-widest", getStatusConfig(guest.status).className)}>
                          {getStatusConfig(guest.status).label}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2.5 px-3 text-right pr-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 mr-1"
                          onClick={() => handleViewGuest(guest)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-muted-foreground hover:bg-muted">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 rounded-lg p-1 shadow-lg border-border bg-card">
                            <DropdownMenuItem className="rounded-md text-[10px] font-bold uppercase tracking-widest cursor-pointer focus:bg-muted px-3 py-2" onClick={() => handleViewGuest(guest)}>
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-md text-[10px] font-bold uppercase tracking-widest cursor-pointer focus:bg-muted px-3 py-2">
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-md text-[10px] font-bold uppercase tracking-widest cursor-pointer focus:bg-muted px-3 py-2">
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
          <SheetContent className="w-full sm:max-w-md p-0 gap-0 border-l border-border shadow-2xl bg-background outline-none">
            {selectedGuest && (
              <div className="flex flex-col h-full bg-muted/20">
                <div className="bg-primary/5 border-b border-border p-8 flex flex-col items-center flex-shrink-0">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-md mb-4">
                    <AvatarImage src={selectedGuest.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-black">
                      {selectedGuest.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-black text-foreground tracking-tight mb-1">{selectedGuest.name}</h2>
                  <div className="flex gap-2 mb-6">
                    <Badge className={cn("text-[9px] font-black uppercase tracking-widest border-none shadow-none rounded-sm", getStatusConfig(selectedGuest.status).className)}>
                      {getStatusConfig(selectedGuest.status).label}
                    </Badge>
                  </div>
                  <div className="flex w-full gap-3">
                    <Button variant="outline" className="flex-1 rounded-lg border-border hover:bg-muted h-10 text-[10px] font-bold uppercase tracking-widest">
                      <MessageSquare className="mr-2 h-4 w-4" /> Message
                    </Button>
                    <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-sm h-10 text-[10px] font-bold uppercase tracking-widest">
                      <Calendar className="mr-2 h-4 w-4" /> Book Now
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <Card className="border border-border shadow-sm rounded-lg overflow-hidden bg-card">
                    <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Contact Info</span>
                    </div>
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center text-muted-foreground border border-border">
                          <Mail className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Email</p>
                          <p className="text-xs font-bold text-foreground">{selectedGuest.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center text-muted-foreground border border-border">
                          <Phone className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Phone</p>
                          <p className="text-xs font-bold text-foreground">{selectedGuest.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center text-muted-foreground border border-border">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Location</p>
                          <p className="text-xs font-bold text-foreground uppercase tracking-tight">{selectedGuest.location}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-border shadow-sm rounded-lg overflow-hidden bg-card">
                    <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center gap-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Statistics</span>
                    </div>
                    <CardContent className="p-6 space-y-0">
                      <div className="grid grid-cols-3 gap-0 divide-x divide-border">
                        <div className="text-center px-2">
                          <span className="block text-2xl font-black text-foreground">{selectedGuest.totalBookings}</span>
                          <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Bookings</span>
                        </div>
                        <div className="text-center px-2">
                          <span className="block text-2xl font-black text-foreground">₹{selectedGuest.totalSpent > 1000 ? (selectedGuest.totalSpent / 1000).toFixed(1) + 'k' : selectedGuest.totalSpent}</span>
                          <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Spend</span>
                        </div>
                        <div className="text-center px-2">
                          <span className="block text-2xl font-black text-foreground">4.9</span>
                          <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Rating</span>
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
    </>
  )
}
