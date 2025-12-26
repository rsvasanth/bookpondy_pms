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
                <div className="space-y-2">
                    <h1 className="text-2xl font-black tracking-tight text-secondary">Financial Overview & Billing</h1>
                    <p className="text-muted-foreground font-medium">Monitor revenue, process payouts, and manage all property invoices.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-xl font-bold text-xs gap-2 border-muted h-10 text-secondary">
                        <Receipt className="h-3.5 w-3.5" /> Payout History
                    </Button>
                    <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl h-10 px-6 font-bold text-xs gap-2 shadow-lg shadow-primary/20">
                        <CreditCard className="h-3.5 w-3.5" /> Bulk Invoicing
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2">
                    <RevenueTrend />
                </div>
                <div className="space-y-6">
                    <Card className="border-none shadow-sm rounded-3xl bg-secondary text-white overflow-hidden relative">
                        <CardContent className="p-8">
                            <div className="relative z-10 space-y-4">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Outstanding</span>
                                <p className="text-4xl font-black uppercase">₹2.45L</p>
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-white/20 text-white border-none text-[10px] font-black px-2 py-0.5 rounded-lg">8 Pending Invoices</Badge>
                                </div>
                            </div>
                            <IndianRupee className="absolute -right-8 -bottom-8 h-40 w-40 text-white/5 -rotate-12" />
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-4">
                        <Card className="border-none shadow-sm rounded-3xl">
                            <CardContent className="p-5">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Growth</span>
                                <div className="flex items-center gap-1 text-primary font-black">
                                    <ArrowUpRight className="h-4 w-4" />
                                    <span>+24%</span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-sm rounded-3xl border-l-4 border-l-primary">
                            <CardContent className="p-5">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Refunds</span>
                                <div className="flex items-center gap-1 text-primary font-black">
                                    <ArrowDownRight className="h-4 w-4" />
                                    <span>2.1%</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-muted shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-muted flex items-center justify-between">
                    <h2 className="font-black text-base text-secondary">Recent Invoices</h2>
                    <Button variant="ghost" size="sm" className="h-7 font-bold text-[10px] text-secondary gap-1.5 hover:bg-muted uppercase">
                        View All <History className="h-3 w-3" />
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-muted/10">
                                <th className="text-left py-2 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Invoice ID</th>
                                <th className="text-left py-2 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Guest</th>
                                <th className="text-left py-2 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Property</th>
                                <th className="text-left py-2 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount</th>
                                <th className="text-left py-2 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date</th>
                                <th className="text-left py-2 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                                <th className="text-right py-2 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-muted/10">
                            {invoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-muted/5 transition-colors">
                                    <td className="py-2 px-4 font-bold text-xs">{inv.id}</td>
                                    <td className="py-2 px-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-7 w-7 rounded-full bg-secondary/10 flex items-center justify-center text-secondary text-[9px] font-black">
                                                {inv.guest[0]}
                                            </div>
                                            <span className="text-xs font-bold">{inv.guest}</span>
                                        </div>
                                    </td>
                                    <td className="py-2 px-4 text-xs font-bold text-muted-foreground">{inv.property}</td>
                                    <td className="py-2 px-4 font-black text-sm text-secondary">{inv.amount}</td>
                                    <td className="py-2 px-4 text-xs font-bold text-muted-foreground">{inv.date}</td>
                                    <td className="py-2 px-4">
                                        <Badge className={cn(
                                            "text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider",
                                            inv.status === "Paid" ? "bg-muted text-secondary" :
                                                inv.status === "Pending" ? "bg-primary/10 text-primary" : "bg-primary text-white"
                                        )}>
                                            {inv.status}
                                        </Badge>
                                    </td>
                                    <td className="py-2 px-4 text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg group">
                                            <Download className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
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
