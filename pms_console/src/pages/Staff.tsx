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
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Staff Management</h1>
                    <p className="text-muted-foreground">Manage property personnel and roles</p>
                </div>
                <Button className="bg-[#FF3D2E] hover:bg-[#FF3D2E]/90 shadow-lg shadow-red-500/20 rounded-xl transition-all hover:scale-105">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Staff member
                </Button>
            </div>

            <Card className="mb-6 rounded-[2rem] border-gray-100 shadow-xl shadow-gray-200/50">
                <CardContent className="p-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Search staff..."
                            className="pl-10 h-11 rounded-2xl bg-gray-50 border-gray-100 focus-visible:ring-red-500/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                            <TableHead className="py-4 font-semibold text-gray-900 pl-6">Staff Member</TableHead>
                            <TableHead className="py-4 font-semibold text-gray-900">Designation</TableHead>
                            <TableHead className="py-4 font-semibold text-gray-900">Property</TableHead>
                            <TableHead className="py-4 font-semibold text-gray-900">Contact</TableHead>
                            <TableHead className="py-4 font-semibold text-gray-900">Status</TableHead>
                            <TableHead className="text-right py-4 font-semibold text-gray-900 pr-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredStaff.map((staff) => (
                            <TableRow key={staff.name} className="hover:bg-gray-50/50 transition-colors">
                                <TableCell className="pl-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border border-gray-100">
                                            <AvatarFallback className="bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600"><User className="h-4 w-4" /></AvatarFallback>
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
                                    <Badge variant="secondary" className={`rounded-md px-2 py-0.5 font-medium ${staff.status === "Active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
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
