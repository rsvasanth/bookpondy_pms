"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    IndianRupee,
    ArrowUpRight,
    ArrowDownRight,
    Receipt,
    CreditCard,
    History,
    Download
} from "lucide-react"
import { RevenueTrend } from "@/components/dashboard/revenue-trend"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { cn } from "@/lib/utils"

const invoices = [
    { id: "INV-2045", guest: "John Doe", property: "Beach House", amount: "₹12,500", date: "24 Dec", status: "Paid" },
    { id: "INV-2046", guest: "Sarah Smith", property: "Villa Pondy", amount: "₹45,000", date: "22 Dec", status: "Pending" },
    { id: "INV-2047", guest: "Rajesh Kumar", property: "Ocean Suite", amount: "₹8,200", date: "21 Dec", status: "Overdue" },
    { id: "INV-2048", guest: "Emma Wilson", property: "Garden Villa", amount: "₹15,000", date: "20 Dec", status: "Paid" },
]

export default function BillingPage() {
    return (
        <DashboardLayout>
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">Financial Overview</h1>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Monitor revenue, process payouts, and manage all property invoices.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-lg font-bold text-[10px] uppercase tracking-widest gap-2 border-border h-10 text-foreground hover:bg-muted">
                        <Receipt className="h-3.5 w-3.5" /> Payout History
                    </Button>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-10 px-6 font-bold text-[10px] uppercase tracking-widest gap-2 shadow-sm">
                        <CreditCard className="h-3.5 w-3.5" /> Bulk Invoicing
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                <div className="lg:col-span-2">
                    <RevenueTrend />
                </div>
                <div className="space-y-6">
                    <Card className="border border-border shadow-sm rounded-lg bg-primary text-primary-foreground overflow-hidden relative">
                        <CardContent className="p-8 relative z-10">
                            <div className="space-y-4">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Total Outstanding</span>
                                <p className="text-4xl font-black tracking-tight">₹2.45L</p>
                                <div className="flex items-center">
                                    <Badge className="bg-primary-foreground/20 text-primary-foreground border-none text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest">8 Pending Invoices</Badge>
                                </div>
                            </div>
                            <IndianRupee className="absolute -right-10 -bottom-10 h-44 w-44 text-primary-foreground/5 -rotate-12" />
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-4">
                        <Card className="border border-border shadow-sm rounded-lg bg-card">
                            <CardContent className="p-5">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Growth</span>
                                <div className="flex items-center gap-1.5 text-emerald-500 font-bold">
                                    <ArrowUpRight className="h-4 w-4" />
                                    <span className="text-lg tracking-tight">+24%</span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border border-border shadow-sm rounded-lg bg-card">
                            <CardContent className="p-5">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Refunds</span>
                                <div className="flex items-center gap-1.5 text-primary font-bold">
                                    <ArrowDownRight className="h-4 w-4" />
                                    <span className="text-lg tracking-tight">2.1%</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden mb-10">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
                    <h2 className="font-bold text-base text-foreground uppercase tracking-tight">Recent Invoices</h2>
                    <Button variant="ghost" size="sm" className="h-8 px-4 font-bold text-[10px] text-muted-foreground gap-2 hover:bg-muted uppercase tracking-widest transition-all">
                        View All <History className="h-3.5 w-3.5" />
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-muted/50">
                                <th className="text-left py-3 px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground border-b border-border">Invoice ID</th>
                                <th className="text-left py-3 px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground border-b border-border">Guest</th>
                                <th className="text-left py-3 px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground border-b border-border">Property</th>
                                <th className="text-left py-3 px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground border-b border-border">Amount</th>
                                <th className="text-left py-3 px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground border-b border-border">Date</th>
                                <th className="text-left py-3 px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground border-b border-border">Status</th>
                                <th className="text-right py-3 px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground border-b border-border">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {invoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-muted/30 transition-colors group">
                                    <td className="py-4 px-6 font-bold text-xs text-foreground">{inv.id}</td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold border border-primary/20 transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                                                {inv.guest[0]}
                                            </div>
                                            <span className="text-xs font-bold text-foreground">{inv.guest}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-widest">{inv.property}</td>
                                    <td className="py-4 px-6 font-bold text-sm text-foreground">{inv.amount}</td>
                                    <td className="py-4 px-6 text-xs font-bold text-muted-foreground">{inv.date}</td>
                                    <td className="py-4 px-6">
                                        <Badge className={cn(
                                            "text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest border-none shadow-none",
                                            inv.status === "Paid" ? "bg-emerald-500/10 text-emerald-500" :
                                                inv.status === "Pending" ? "bg-amber-500/10 text-amber-500" : "bg-primary/10 text-primary"
                                        )}>
                                            {inv.status}
                                        </Badge>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted">
                                            <Download className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    )
}
