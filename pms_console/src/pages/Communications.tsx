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
                <Button className="bg-[#E68B47] hover:bg-[#c97339]">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    New Communication
                </Button>
            </div>

            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search logs..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Guest</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredComms.map((comm) => (
                            <TableRow key={comm.name}>
                                <TableCell className="font-medium">{comm.guest}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        {comm.communication_type === "Email" ? <Mail className="h-3 w-3" /> : <Phone className="h-3 w-3" />}
                                        {comm.communication_type}
                                    </div>
                                </TableCell>
                                <TableCell className="max-w-xs truncate">{comm.subject}</TableCell>
                                <TableCell>{comm.communication_date}</TableCell>
                                <TableCell>
                                    <Badge variant={comm.status === "Sent" ? "default" : "secondary"}>
                                        {comm.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon">
                                        <Eye className="h-4 w-4" />
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
