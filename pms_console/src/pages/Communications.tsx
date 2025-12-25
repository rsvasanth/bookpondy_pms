"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MessageSquare, Search, MoreHorizontal, Eye, Mail, Phone } from "lucide-react"
import { useFrappeGetDocList } from "frappe-react-sdk"

export default function CommunicationsPage() {
    const [searchQuery, setSearchQuery] = useState("")

    const { data: commsList } = useFrappeGetDocList("Guest Communication", {
        fields: ["name", "guest", "communication_date", "communication_type", "status", "subject"],
        limit: 100,
        orderBy: { field: "communication_date", order: "desc" }
    })

    const filteredComms = commsList?.filter(c =>
        c.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.guest.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []

    return (
        <DashboardLayout>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Communications</h1>
                    <p className="text-muted-foreground">Log of all guest interactions (Email, SMS, WhatsApp)</p>
                </div>
                <Button className="bg-[#FF3D2E] hover:bg-[#FF3D2E]/90 shadow-lg shadow-red-500/20 rounded-xl transition-all hover:scale-105">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    New Communication
                </Button>
            </div>

            <Card className="mb-6 rounded-[2rem] border-gray-100 shadow-xl shadow-gray-200/50">
                <CardContent className="p-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Search logs..."
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
                            <TableHead className="py-4 font-semibold text-gray-900 pl-6">Guest</TableHead>
                            <TableHead className="py-4 font-semibold text-gray-900">Type</TableHead>
                            <TableHead className="py-4 font-semibold text-gray-900">Subject</TableHead>
                            <TableHead className="py-4 font-semibold text-gray-900">Date</TableHead>
                            <TableHead className="py-4 font-semibold text-gray-900">Status</TableHead>
                            <TableHead className="text-right py-4 font-semibold text-gray-900 pr-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredComms.map((comm) => (
                            <TableRow key={comm.name} className="hover:bg-gray-50/50 transition-colors">
                                <TableCell className="pl-6 py-4 font-semibold text-gray-900">{comm.guest}</TableCell>
                                <TableCell className="py-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        {comm.communication_type === "Email" ? <Mail className="h-4 w-4 text-gray-400" /> : <Phone className="h-4 w-4 text-gray-400" />}
                                        {comm.communication_type}
                                    </div>
                                </TableCell>
                                <TableCell className="py-4 max-w-xs truncate text-gray-600 font-medium">{comm.subject}</TableCell>
                                <TableCell className="py-4 text-sm text-gray-500">{comm.communication_date}</TableCell>
                                <TableCell className="py-4">
                                    <Badge variant="secondary" className={`rounded-md px-2 py-0.5 font-medium ${comm.status === "Sent" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                                        {comm.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right pr-6 py-4">
                                    <Button variant="ghost" size="icon" className="hover:bg-gray-100 rounded-lg">
                                        <Eye className="h-4 w-4 text-gray-400" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </DashboardLayout>
    )
}
