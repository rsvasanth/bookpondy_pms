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
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-0.5">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">Guest Communications</h1>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">WhatsApp, Email, and SMS inquiries</p>
                </div>
                <div className="flex bg-card p-1 rounded-lg shadow-sm border border-border">
                    <div className="flex items-center gap-4 px-4 border-r border-border">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-tight">Response</span>
                            <span className="text-xs font-black text-foreground">14m</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 px-4">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-tight">Unread</span>
                            <span className="text-xs font-black text-primary">08</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[700px]">
                <Card className="lg:col-span-4 rounded-lg border-border shadow-sm overflow-hidden flex flex-col bg-card">
                    <div className="p-4 border-b border-border space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search conversations..."
                                className="pl-10 h-10 rounded-lg bg-muted/50 border-border text-xs font-bold uppercase tracking-wider focus-visible:ring-1 focus-visible:ring-primary"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="secondary" size="sm" className="h-7 px-4 rounded-md font-bold text-[9px] uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90">All</Button>
                            <Button variant="ghost" size="sm" className="h-7 px-4 rounded-md font-bold text-[9px] uppercase tracking-widest hover:bg-muted text-muted-foreground">Unread</Button>
                            <Button variant="ghost" size="sm" className="h-7 px-4 rounded-md font-bold text-[9px] uppercase tracking-widest hover:bg-muted text-muted-foreground">Starred</Button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-border">
                        {threads.map((thread) => (
                            <div
                                key={thread.id}
                                className={cn(
                                    "p-4 hover:bg-muted/50 cursor-pointer transition-colors relative",
                                    selectedThread?.id === thread.id && "bg-muted"
                                )}
                                onClick={() => setSelectedThread(thread)}
                            >
                                {thread.unread && <div className="absolute left-1.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />}
                                <div className="flex justify-between items-start mb-1.5">
                                    <span className="font-bold text-sm text-foreground truncate">{thread.guest}</span>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{thread.time.split(' ')[1] || thread.time}</span>
                                </div>
                                <p className="text-xs font-medium text-muted-foreground line-clamp-1">{thread.preview}</p>
                                <div className="mt-2.5 flex items-center justify-between">
                                    <Badge variant="outline" className="text-[9px] font-bold px-2 py-0.5 border-border text-muted-foreground uppercase tracking-widest">
                                        {thread.type}
                                    </Badge>
                                    {thread.status === "Sent" && <CheckCheck className="h-3.5 w-3.5 text-primary" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="lg:col-span-8 rounded-lg border-border shadow-sm overflow-hidden flex flex-col bg-muted/30">
                    {selectedThread ? (
                        <>
                            <div className="p-4 bg-card border-b border-border flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20 text-sm">
                                        {selectedThread.guest[0]}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-foreground leading-none text-base uppercase tracking-tight">{selectedThread.guest}</h3>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Guest • Room 204</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg border-border text-foreground hover:bg-muted"><Phone className="h-4 w-4" /></Button>
                                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg border-border text-primary hover:bg-primary/10"><AlertCircle className="h-4 w-4" /></Button>
                                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg border-border text-foreground hover:bg-muted"><MoreHorizontal className="h-4 w-4" /></Button>
                                </div>
                            </div>
                            <div className="flex-1 p-6 overflow-y-auto space-y-6">
                                <div className="flex flex-col gap-2 max-w-[80%]">
                                    <div className="bg-card p-4 rounded-lg rounded-tl-none shadow-sm border border-border text-xs font-medium text-foreground">
                                        Hi, I wanted to confirm if early check-in is possible for tomorrow? My flight lands at 9 AM.
                                    </div>
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Guest • 10:24 AM</span>
                                </div>

                                <div className="flex flex-col items-end gap-2 ml-auto max-w-[80%]">
                                    <div className="bg-primary p-4 rounded-lg rounded-tr-none shadow-md text-xs font-bold text-primary-foreground">
                                        Hello {selectedThread.guest}! Let me check the availability for your room category. One moment please.
                                    </div>
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mr-1 flex items-center gap-1.5">
                                        You • 10:26 AM • <CheckCheck className="h-3 w-3 text-primary" />
                                    </span>
                                </div>
                            </div>
                            <div className="p-4 bg-card border-t border-border">
                                <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-2 border border-border focus-within:border-primary/50 transition-all">
                                    <Input
                                        placeholder="Type your message..."
                                        className="h-9 border-none bg-transparent shadow-none focus-visible:ring-0 font-medium text-foreground text-xs"
                                    />
                                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-9 px-4 font-bold text-[10px] gap-2 shadow-sm uppercase tracking-widest">
                                        Send <Send className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                            <div className="h-24 w-24 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground/30 border border-border">
                                <MessageSquare className="h-12 w-12" />
                            </div>
                            <div className="space-y-2">
                                <p className="font-bold text-foreground text-lg uppercase tracking-tight">Select a conversation</p>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Click on a thread to start chatting</p>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </DashboardLayout>
    )
}
