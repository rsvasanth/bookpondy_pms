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

interface Guest {
  id: string
  name: string
  email: string
  phone: string
  location: string
  totalBookings: number
  totalSpent: number
  lastVisit: string
  status: "active" | "vip" | "new"
  avatar?: string
}

const guests: Guest[] = [
  {
    id: "G001",
    name: "Priya Sharma",
    email: "priya.sharma@email.com",
    phone: "+91 98765 43210",
    location: "Mumbai, Maharashtra",
    totalBookings: 12,
    totalSpent: 245000,
    lastVisit: "2025-12-15",
    status: "vip",
  },
  {
    id: "G002",
    name: "Amit Patel",
    email: "amit.patel@email.com",
    phone: "+91 87654 32109",
    location: "Ahmedabad, Gujarat",
    totalBookings: 5,
    totalSpent: 89000,
    lastVisit: "2025-12-10",
    status: "active",
  },
  {
    id: "G003",
    name: "Sneha Reddy",
    email: "sneha.r@email.com",
    phone: "+91 76543 21098",
    location: "Hyderabad, Telangana",
    totalBookings: 8,
    totalSpent: 156000,
    lastVisit: "2025-12-08",
    status: "active",
  },
  {
    id: "G004",
    name: "Vikram Singh",
    email: "vikram.s@email.com",
    phone: "+91 65432 10987",
    location: "Delhi, NCR",
    totalBookings: 15,
    totalSpent: 320000,
    lastVisit: "2025-12-12",
    status: "vip",
  },
  {
    id: "G005",
    name: "Meera Nair",
    email: "meera.nair@email.com",
    phone: "+91 54321 09876",
    location: "Kochi, Kerala",
    totalBookings: 1,
    totalSpent: 38000,
    lastVisit: "2025-12-16",
    status: "new",
  },
  {
    id: "G006",
    name: "Rahul Verma",
    email: "rahul.v@email.com",
    phone: "+91 43210 98765",
    location: "Bangalore, Karnataka",
    totalBookings: 6,
    totalSpent: 112000,
    lastVisit: "2025-11-28",
    status: "active",
  },
]

const statusConfig = {
  active: { label: "Active", className: "bg-green-500/10 text-green-600" },
  vip: { label: "VIP", className: "bg-purple-500/10 text-purple-600" },
  new: { label: "New", className: "bg-blue-500/10 text-blue-600" },
}

export default function GuestsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

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

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Guest Management</h1>
          <p className="text-muted-foreground">Manage your guest database and relationships</p>
        </div>
        <Button className="bg-[#E68B47] hover:bg-[#c97339]">
          <Plus className="mr-2 h-4 w-4" />
          Add Guest
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Guests</p>
                <p className="text-2xl font-bold">1,248</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">VIP Guests</p>
                <p className="text-2xl font-bold text-purple-600">89</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <Star className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Returning Guests</p>
                <p className="text-2xl font-bold text-green-600">67%</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New This Month</p>
                <p className="text-2xl font-bold text-blue-600">34</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <UserPlus className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search guests..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select>
              <SelectTrigger className="w-[140px]">
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
              <SelectTrigger className="w-[160px]">
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
        </CardContent>
      </Card>

      {/* Guests Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guest</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-center">Bookings</TableHead>
              <TableHead className="text-right">Total Spent</TableHead>
              <TableHead>Last Visit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGuests.map((guest) => (
              <TableRow key={guest.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={guest.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {guest.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{guest.name}</p>
                      <p className="text-xs text-muted-foreground">{guest.id}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      {guest.email}
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      {guest.phone}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    {guest.location}
                  </div>
                </TableCell>
                <TableCell className="text-center font-medium">{guest.totalBookings}</TableCell>
                <TableCell className="text-right font-medium">₹{guest.totalSpent.toLocaleString("en-IN")}</TableCell>
                <TableCell>{formatDate(guest.lastVisit)}</TableCell>
                <TableCell>
                  <Badge className={statusConfig[guest.status].className}>{statusConfig[guest.status].label}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewGuest(guest)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Send Message
                      </DropdownMenuItem>
                      <DropdownMenuItem>
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
                    <Badge className={statusConfig[selectedGuest.status].className}>
                      {statusConfig[selectedGuest.status].label}
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
    </DashboardLayout>
  )
}
