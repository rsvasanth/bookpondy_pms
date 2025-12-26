"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, MoreHorizontal, Eye, Pencil, User } from "lucide-react"
import { useFrappeGetDocList } from "frappe-react-sdk"
import { cn } from "@/lib/utils"

export default function StaffPage() {
    const [searchQuery, setSearchQuery] = useState("")

    const { data: staffList } = useFrappeGetDocList("Staff", {
        fields: ["name", "staff_name", "designation", "property", "status", "email", "phone"],
        limit: 100
    })

    const filteredStaff = staffList?.filter(s =>
        s.staff_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.designation.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []

    return (
        <DashboardLayout>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Staff Management</h1>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Property personnel and roles</p>
                </div>
                <Button className="bg-primary hover:bg-primary/90 shadow-sm rounded-lg h-8 px-4 transition-all hover:scale-105 font-bold text-xs">
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Add Staff Member
                </Button>
            </div>

            <Card className="mb-3 rounded-xl border-gray-100 shadow-sm">
                <CardContent className="p-3">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Search staff..."
                            className="pl-10 h-11 rounded-2xl bg-muted/20 border-muted focus-visible:ring-primary/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-xl border-gray-100 shadow-sm overflow-hidden bg-white">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                            <TableHead className="py-2.5 font-bold text-[10px] uppercase tracking-wider text-gray-400 pl-4">Staff Member</TableHead>
                            <TableHead className="py-2.5 font-bold text-[10px] uppercase tracking-wider text-gray-400">Designation</TableHead>
                            <TableHead className="py-2.5 font-bold text-[10px] uppercase tracking-wider text-gray-400">Property</TableHead>
                            <TableHead className="py-2.5 font-bold text-[10px] uppercase tracking-wider text-gray-400">Contact</TableHead>
                            <TableHead className="py-2.5 font-bold text-[10px] uppercase tracking-wider text-gray-400">Status</TableHead>
                            <TableHead className="text-right py-2.5 font-bold text-[10px] uppercase tracking-wider text-gray-400 pr-4">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredStaff.map((staff) => (
                            <TableRow key={staff.name} className="hover:bg-gray-50/50 transition-colors">
                                <TableCell className="pl-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border border-muted">
                                            <AvatarFallback className="bg-muted text-secondary"><User className="h-4 w-4" /></AvatarFallback>
                                        </Avatar>
                                        <span className="font-semibold text-gray-900">{staff.staff_name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4 font-medium text-gray-600">{staff.designation}</TableCell>
                                <TableCell className="py-4 text-gray-600">{staff.property}</TableCell>
                                <TableCell className="py-4">
                                    <div className="space-y-1 text-sm">
                                        <p className="font-medium text-gray-900 text-xs">{staff.email}</p>
                                        <p className="text-muted-foreground text-xs">{staff.phone}</p>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4">
                                    <Badge variant="secondary" className={cn(
                                        "rounded-md px-2 py-0.5 font-bold uppercase text-[9px]",
                                        staff.status === "Active" ? "bg-muted text-secondary" : "bg-primary/10 text-primary"
                                    )}>
                                        {staff.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right pr-6 py-4">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="hover:bg-gray-100 rounded-lg">
                                                <MoreHorizontal className="h-4 w-4 text-gray-400" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-xl">
                                            <DropdownMenuItem className="rounded-lg"><Eye className="mr-2 h-4 w-4" /> View Details</DropdownMenuItem>
                                            <DropdownMenuItem className="rounded-lg"><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </DashboardLayout>
    )
}
