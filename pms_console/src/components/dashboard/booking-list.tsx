"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { cn } from "@/lib/utils"

const bookings = [
    { id: "LG-B00108", guest: "Angus Copper", roomType: "Deluxe", roomNumber: "Room 101", duration: "3 nights", dates: "June 19, 2028 - June 22, 2028", status: "Checked-In" },
    { id: "LG-B00109", guest: "Catherine Lopp", roomType: "Standard", roomNumber: "Room 202", duration: "2 nights", dates: "June 19, 2028 - June 21, 2028", status: "Pending" },
    { id: "LG-B00110", guest: "Edgar Irving", roomType: "Suite", roomNumber: "Room 303", duration: "5 nights", dates: "June 19, 2028 - June 24, 2028", status: "Confirmed" },
    { id: "LG-B00111", guest: "Ice B. Holand", roomType: "Standard", roomNumber: "Room 105", duration: "4 nights", dates: "June 19, 2028 - June 23, 2028", status: "Checked-In" },
]

export function BookingList() {
    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="flex flex-row items-center justify-between px-0 pb-6">
                <CardTitle className="text-xl font-bold">Booking List</CardTitle>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search guest, status, etc"
                            className="pl-9 w-[280px] bg-white rounded-xl border-gray-200"
                        />
                    </div>
                    <Button variant="outline" className="rounded-xl border-gray-200">
                        All Status <ChevronRight className="ml-2 h-4 w-4 rotate-90" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-2xl border bg-white overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-b-gray-100">
                                <TableHead className="py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">Booking ID</TableHead>
                                <TableHead className="py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">Guest Name</TableHead>
                                <TableHead className="py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">Room Type</TableHead>
                                <TableHead className="py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">Room Number</TableHead>
                                <TableHead className="py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">Duration</TableHead>
                                <TableHead className="py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">Check-In & Check-Out</TableHead>
                                <TableHead className="py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bookings.map((booking) => (
                                <TableRow key={booking.id} className="hover:bg-slate-50 border-b-slate-100 transition-colors">
                                    <TableCell className="py-4 font-bold text-muted-foreground text-xs">{booking.id}</TableCell>
                                    <TableCell className="py-4 font-bold text-slate-800">{booking.guest}</TableCell>
                                    <TableCell className="py-4">
                                        <Badge
                                            variant="secondary"
                                            className={cn(
                                                "font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-tighter",
                                                booking.roomType === "Deluxe" && "bg-teal-50 text-teal-700",
                                                booking.roomType === "Suite" && "bg-pink-50 text-pink-700",
                                                booking.roomType === "Standard" && "bg-slate-100 text-slate-700"
                                            )}
                                        >
                                            {booking.roomType}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-4 font-bold text-slate-600 text-sm">{booking.roomNumber}</TableCell>
                                    <TableCell className="py-4 font-bold text-slate-600 text-sm">{booking.duration}</TableCell>
                                    <TableCell className="py-4 text-slate-500 font-medium text-xs">{booking.dates}</TableCell>
                                    <TableCell className="py-4 text-right">
                                        <Badge
                                            className={cn(
                                                "font-bold rounded-xl px-2.5 py-0.5 text-[10px] uppercase tracking-wider",
                                                booking.status === "Checked-In" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                                            )}
                                        >
                                            {booking.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="mt-8 flex items-center justify-between px-2">
                    <div className="text-sm font-medium text-gray-500">Page 1 of 2</div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" className="h-9 w-9 border-gray-200 rounded-lg" disabled>
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-9 w-9 border-gray-200 rounded-lg" disabled>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-9 w-9 border-gray-200 rounded-lg">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-9 w-9 border-gray-200 rounded-lg">
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
