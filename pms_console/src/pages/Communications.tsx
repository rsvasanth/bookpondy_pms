"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
    MessageSquare,
    Search,
    MoreHorizontal,
    Phone,
    Send,
    AlertCircle,
    CheckCheck
} from "lucide-react"
import { useFrappeGetDocList } from "frappe-react-sdk"
import { cn } from "@/lib/utils"

export default function CommunicationsPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedThread, setSelectedThread] = useState<any>(null)

    const { data: commsList } = useFrappeGetDocList("Guest Communication", {
        fields: ["name", "guest", "communication_date", "communication_type", "status", "subject", "message"],
        limit: 100,
        orderBy: { field: "communication_date", order: "desc" }
    })

    const threads = commsList?.map(c => ({
        id: c.name,
        guest: c.guest,
        preview: c.subject || c.message,
        time: c.communication_date,
        type: c.communication_type,
        status: c.status,
        unread: c.status === "Received"
    })) || []

    return (
        <DashboardLayout>
            <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-0.5">
                    <h1 className="text-xl font-black tracking-tight text-secondary">Guest Communications</h1>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">WhatsApp, Email, and SMS inquiries</p>
                </div>
                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-muted">
                    <div className="flex items-center gap-3 px-3 border-r">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-muted-foreground uppercase leading-tight">Response</span>
                            <span className="text-xs font-black text-secondary">14m</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-3">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-muted-foreground uppercase leading-tight">Unread</span>
                            <span className="text-xs font-black text-primary">08</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[600px]">
                <Card className="lg:col-span-4 rounded-2xl border-muted shadow-sm overflow-hidden flex flex-col">
                    <div className="p-3 border-b space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                placeholder="Search..."
                                className="pl-9 h-9 rounded-lg bg-muted/30 border-none text-xs font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-1.5">
                            <Button variant="ghost" size="sm" className="h-7 px-3 rounded-md font-bold text-[9px] uppercase bg-secondary text-white">All</Button>
                            <Button variant="ghost" size="sm" className="h-7 px-3 rounded-md font-bold text-[9px] uppercase bg-muted/50 text-secondary">Unread</Button>
                            <Button variant="ghost" size="sm" className="h-7 px-3 rounded-md font-bold text-[9px] uppercase bg-muted/50 text-secondary">Starred</Button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-muted/30">
                        {threads.map((thread) => (
                            <div
                                key={thread.id}
                                className={cn(
                                    "p-4 hover:bg-muted/10 cursor-pointer transition-colors relative",
                                    selectedThread?.id === thread.id && "bg-secondary/5"
                                )}
                                onClick={() => setSelectedThread(thread)}
                            >
                                {thread.unread && <div className="absolute left-1 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />}
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-black text-sm text-secondary truncate">{thread.guest}</span>
                                    <span className="text-[10px] font-bold text-muted-foreground">{thread.time.split(' ')[1] || thread.time}</span>
                                </div>
                                <p className="text-xs font-medium text-muted-foreground line-clamp-1">{thread.preview}</p>
                                <div className="mt-2 flex items-center justify-between">
                                    <Badge variant="outline" className="text-[9px] font-bold px-2 py-0 border-muted text-secondary uppercase">
                                        {thread.type}
                                    </Badge>
                                    {thread.status === "Sent" && <CheckCheck className="h-3 w-3 text-primary" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="lg:col-span-8 rounded-2xl border-muted shadow-sm overflow-hidden flex flex-col bg-slate-50/50">
                    {selectedThread ? (
                        <>
                            <div className="p-3 bg-white border-b flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary font-black border border-secondary/5 text-xs">
                                        {selectedThread.guest[0]}
                                    </div>
                                    <div className="space-y-0.5">
                                        <h3 className="font-black text-secondary leading-none text-sm">{selectedThread.guest}</h3>
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase">Status: Active Guest • Room 204</p>
                                    </div>
                                </div>
                                <div className="flex gap-1.5">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg border border-muted/50 text-secondary"><Phone className="h-3.5 w-3.5" /></Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg border border-muted/50 text-primary"><AlertCircle className="h-3.5 w-3.5" /></Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg border border-muted/50 text-secondary"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
                                </div>
                            </div>
                            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                                <div className="flex flex-col gap-1 max-w-[80%]">
                                    <div className="bg-white p-3 rounded-xl rounded-tl-none shadow-sm border border-muted/30 text-xs font-medium text-secondary/80">
                                        Hi, I wanted to confirm if early check-in is possible for tomorrow? My flight lands at 9 AM.
                                    </div>
                                    <span className="text-[8px] font-bold text-muted-foreground uppercase ml-1">Guest • 10:24 AM</span>
                                </div>

                                <div className="flex flex-col items-end gap-1 ml-auto max-w-[80%]">
                                    <div className="bg-secondary p-3 rounded-xl rounded-tr-none shadow-sm text-xs font-bold text-white shadow-lg shadow-secondary/10">
                                        Hello {selectedThread.guest}! Let me check the availability for your room category. One moment please.
                                    </div>
                                    <span className="text-[8px] font-bold text-muted-foreground uppercase mr-1 flex items-center gap-1">
                                        You • 10:26 AM • <CheckCheck className="h-2 w-2 text-primary" />
                                    </span>
                                </div>
                            </div>
                            <div className="p-3 bg-white border-t border-muted/30">
                                <div className="flex items-center gap-2 bg-muted/20 rounded-xl p-1.5 border border-muted focus-within:border-primary/30 transition-colors">
                                    <Input
                                        placeholder="Type your reply here..."
                                        className="h-8 border-none bg-transparent shadow-none focus-visible:ring-0 font-medium text-secondary text-xs"
                                    />
                                    <Button className="bg-primary hover:bg-primary/90 text-white rounded-lg h-8 px-3 font-bold text-[10px] gap-1.5 shadow-sm uppercase">
                                        Send <Send className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="h-20 w-20 rounded-[2rem] bg-muted/20 flex items-center justify-center text-secondary/20">
                                <MessageSquare className="h-10 w-10" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-black text-secondary">Select a conversation</p>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Click on a thread to start chatting</p>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </DashboardLayout>
    )
}
