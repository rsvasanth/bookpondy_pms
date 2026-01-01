"use client"

import { useState } from "react"
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
        <>
            <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">Staff & Personnel</h1>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            Manage property personnel, roles, and designations.
                        </p>
                    </div>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-10 px-4 font-bold text-[10px] uppercase tracking-widest gap-2 shadow-sm">
                        <Plus className="h-4 w-4" /> Add Staff Member
                    </Button>
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-3">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="SEARCH STAFF BY NAME OR DESIGNATION..."
                            className="pl-10 h-10 rounded-lg border-border bg-card text-[10px] font-bold uppercase tracking-widest shadow-sm focus-visible:ring-primary/20 placeholder:opacity-50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <Card className="border border-border shadow-sm rounded-lg overflow-hidden bg-card">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow className="hover:bg-transparent border-b border-border">
                                    <TableHead className="py-3 px-4 w-16"></TableHead>
                                    <TableHead className="py-3 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Staff Member</TableHead>
                                    <TableHead className="py-3 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Designation</TableHead>
                                    <TableHead className="py-3 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Property</TableHead>
                                    <TableHead className="py-3 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Contact Details</TableHead>
                                    <TableHead className="py-3 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Status</TableHead>
                                    <TableHead className="text-right py-3 pr-4 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center">
                                            <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                                        </TableCell>
                                    </TableRow>
                                ) : filteredStaff.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                            No staff members discovered
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredStaff.map((staff) => (
                                        <TableRow key={staff.name} className="hover:bg-muted/30 transition-colors border-b border-border group last:border-0">
                                            <TableCell className="py-3 px-4">
                                                <Avatar className="h-9 w-9 border border-border rounded-lg">
                                                    <AvatarFallback className="bg-muted text-primary text-[10px] font-bold rounded-lg uppercase">
                                                        <User className="h-4 w-4" />
                                                    </AvatarFallback>
                                                </Avatar>
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <span className="text-xs font-black text-foreground uppercase tracking-tight">{staff.staff_name}</span>
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <Badge variant="outline" className="text-[9px] font-black uppercase bg-muted/50 border-border text-muted-foreground rounded-md px-2 py-0.5 tracking-widest">
                                                    {staff.designation}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em]">{staff.property || "ALL PROPERTIES"}</span>
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                                                        <Mail className="h-3 w-3 opacity-50" />
                                                        {staff.email}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                                                        <Phone className="h-3 w-3 opacity-50" />
                                                        {staff.phone}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <Badge className={cn(
                                                    "text-[8px] font-black uppercase rounded-md px-2 py-0.5 border-none shadow-none tracking-widest",
                                                    staff.status === "Active" ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
                                                )}>
                                                    {staff.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right pr-4 py-3">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-md bg-card border-border hover:bg-muted text-muted-foreground shadow-sm">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 rounded-lg p-1 shadow-lg border-border bg-card">
                                                        <DropdownMenuItem className="rounded-md text-[10px] font-black uppercase tracking-widest cursor-pointer focus:bg-muted px-3 py-2.5">
                                                            <Eye className="mr-3 h-4 w-4 opacity-70" /> View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="rounded-md text-[10px] font-black uppercase tracking-widest cursor-pointer focus:bg-muted px-3 py-2.5">
                                                            <Pencil className="mr-3 h-4 w-4 opacity-70" /> Edit Profile
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
        </>
    )
}
