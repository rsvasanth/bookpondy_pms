"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, MoreHorizontal, Eye, Pencil, User, Mail, Phone, Loader2 } from "lucide-react"
import { useLocalDocList } from "@/hooks/use-local-data"
import { cn } from "@/lib/utils"

export default function StaffPage() {
    const [searchQuery, setSearchQuery] = useState("")

    const { data: staffList, isLoading } = useLocalDocList("Staff", {
        sort: [{ staff_name: 'asc' }]
    })

    const filteredStaff = staffList?.filter(s =>
        s.staff_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.designation.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-800">Staff Management</h1>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                            Property personnel & roles
                        </p>
                    </div>
                    <Button className="bg-primary hover:bg-primary/90 text-white rounded-lg h-9 px-3 text-xs font-bold gap-1.5 shadow-sm transition-all hover:scale-105">
                        <Plus className="h-3.5 w-3.5" />
                        Add Staff Member
                    </Button>
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-3">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search staff by name or designation..."
                            className="pl-8 h-9 rounded-lg border-slate-200 bg-white text-xs font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <Card className="border border-slate-100 shadow-sm rounded-xl overflow-hidden bg-white">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-50">
                                    <TableHead className="py-3 px-4 w-12 pl-6"></TableHead>
                                    <TableHead className="py-3 font-bold text-[10px] uppercase tracking-wider text-slate-400">Staff Member</TableHead>
                                    <TableHead className="py-3 font-bold text-[10px] uppercase tracking-wider text-slate-400">Designation</TableHead>
                                    <TableHead className="py-3 font-bold text-[10px] uppercase tracking-wider text-slate-400">Property</TableHead>
                                    <TableHead className="py-3 font-bold text-[10px] uppercase tracking-wider text-slate-400">Contact</TableHead>
                                    <TableHead className="py-3 font-bold text-[10px] uppercase tracking-wider text-slate-400">Status</TableHead>
                                    <TableHead className="text-right py-3 pr-6 font-bold text-[10px] uppercase tracking-wider text-slate-400">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center">
                                            <Loader2 className="h-5 w-5 animate-spin mx-auto text-slate-300" />
                                        </TableCell>
                                    </TableRow>
                                ) : filteredStaff.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center text-slate-400 text-xs font-medium uppercase tracking-wide">
                                            No staff members found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredStaff.map((staff) => (
                                        <TableRow key={staff.name} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 group">
                                            <TableCell className="py-2 px-4 pl-6 w-12">
                                                <Avatar className="h-8 w-8 border border-slate-100">
                                                    <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">
                                                        <User className="h-3.5 w-3.5" />
                                                    </AvatarFallback>
                                                </Avatar>
                                            </TableCell>
                                            <TableCell className="py-2 px-4">
                                                <span className="text-xs font-bold text-slate-800">{staff.staff_name}</span>
                                            </TableCell>
                                            <TableCell className="py-2 px-4">
                                                <Badge variant="outline" className="text-[9px] font-bold uppercase bg-slate-50 border-slate-200 text-slate-500 rounded-md px-1.5 py-0.5">
                                                    {staff.designation}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-2 px-4">
                                                <span className="text-xs font-medium text-slate-600">{staff.property}</span>
                                            </TableCell>
                                            <TableCell className="py-2 px-4">
                                                <div className="flex flex-col gap-0.5">
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                                                        <Mail className="h-3 w-3 text-slate-400" />
                                                        {staff.email}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                                                        <Phone className="h-3 w-3 text-slate-400" />
                                                        {staff.phone}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-2 px-4">
                                                <Badge className={cn(
                                                    "text-[9px] font-bold uppercase rounded-md px-1.5 py-0 border-none shadow-none",
                                                    staff.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                                                )}>
                                                    {staff.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right pr-6 py-2">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-slate-100 text-slate-400">
                                                            <MoreHorizontal className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-40 rounded-xl p-1 shadow-lg border-slate-100">
                                                        <DropdownMenuItem className="rounded-lg text-xs font-bold cursor-pointer focus:bg-slate-50">
                                                            <Eye className="mr-2 h-3.5 w-3.5" /> View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="rounded-lg text-xs font-bold cursor-pointer focus:bg-slate-50">
                                                            <Pencil className="mr-2 h-3.5 w-3.5" /> Edit Profile
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
            </div>
        </DashboardLayout>
    )
}
