"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useFrappeGetDocList, useFrappeGetCall, useFrappePostCall } from "frappe-react-sdk"
import {
    Search,
    Download,
    Mail,
    CheckCircle2,
    ChevronLeft,
    Printer,
    History as HistoryIcon,
    CreditCard,
    AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function InvoicesPage() {
    const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")

    const { data: folios, isLoading } = useFrappeGetDocList("Folio", {
        fields: ["name", "invoice_number", "reservation", "grand_total", "invoice_status", "status", "creation"],
        orderBy: { field: "creation", order: "desc" },
        limit: 100
    })

    const filteredInvoices = folios?.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.invoice_number && f.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'paid': return 'bg-green-100 text-green-700 border-green-200'
            case 'finalized': return 'bg-blue-100 text-blue-700 border-blue-200'
            case 'sent': return 'bg-purple-100 text-purple-700 border-purple-200'
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200'
            default: return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    if (selectedInvoice) {
        return (
            <DashboardLayout>
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedInvoice(null)} className="rounded-xl">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Invoice Details</h1>
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">{selectedInvoice}</p>
                        </div>
                    </div>
                    <InvoiceDetailView folioName={selectedInvoice} onBack={() => setSelectedInvoice(null)} />
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Invoices & Billing</h1>
                        <p className="text-sm text-muted-foreground">Manage your property's financial transactions and guest folios.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative w-[300px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search invoice # or guest..."
                                className="pl-9 h-10 rounded-xl bg-white border-muted shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow className="border-muted hover:bg-transparent">
                                <TableHead className="font-bold text-[10px] uppercase tracking-wider pl-6">Invoice #</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase tracking-wider">Folio / Reservation</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase tracking-wider">Amount</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase tracking-wider">Status</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase tracking-wider">Date</TableHead>
                                <TableHead className="text-right font-bold text-[10px] uppercase tracking-wider pr-6">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">Loading folios...</TableCell>
                                </TableRow>
                            ) : filteredInvoices?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">No invoices found.</TableCell>
                                </TableRow>
                            ) : (
                                filteredInvoices?.map((folio) => (
                                    <TableRow key={folio.name} className="border-muted/50 hover:bg-gray-50/50 group transition-colors">
                                        <TableCell className="pl-6 font-bold text-sm">
                                            {folio.invoice_number || <span className="text-muted-foreground text-xs font-normal italic">Draft</span>}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{folio.name}</span>
                                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{folio.reservation}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-bold">₹{folio.grand_total?.toLocaleString('en-IN')}</TableCell>
                                        <TableCell>
                                            <Badge className={cn("rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase border", getStatusColor(folio.invoice_status))}>
                                                {folio.invoice_status || folio.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground font-medium">
                                            {new Date(folio.creation).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="rounded-xl h-8 px-3 font-bold text-xs text-primary hover:text-primary hover:bg-primary/5"
                                                onClick={() => setSelectedInvoice(folio.name)}
                                            >
                                                View Invoice
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </DashboardLayout>
    )
}

function InvoiceDetailView({ folioName, onBack }: { folioName: string, onBack: () => void }) {
    const { data: details, isLoading, mutate } = useFrappeGetCall(
        "bookpondy_pms.bookpondy_pms.doctype.folio.folio.get_invoice_details",
        { folio_name: folioName }
    )

    const { call: finalize } = useFrappePostCall("bookpondy_pms.bookpondy_pms.doctype.folio.folio.finalize_invoice")
    const { call: sendEmail } = useFrappePostCall("bookpondy_pms.bookpondy_pms.doctype.folio.folio.send_invoice_email")

    const handleFinalize = async () => {
        try {
            await finalize({ folio_name: folioName })
            toast.success("Invoice finalized successfully")
            mutate()
        } catch (e: any) {
            toast.error(e.message || "Failed to finalize invoice")
        }
    }

    const handleSendEmail = async () => {
        try {
            await sendEmail({ folio_name: folioName })
            toast.success("Invoice sent to guest email")
            mutate()
        } catch (e: any) {
            toast.error(e.message || "Failed to send email")
        }
    }

    if (isLoading) return <div className="h-64 flex items-center justify-center text-muted-foreground">Loading invoice details...</div>

    if (!details) return <div className="h-64 flex items-center justify-center text-red-500">Invoice not found.</div>

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
                <Card className="border-none shadow-xl rounded-2xl bg-white overflow-hidden p-0">
                    <div className="p-12" id="invoice-printable">
                        <div className="flex justify-between items-start mb-12">
                            <div className="space-y-2">
                                <div className="h-10 w-40 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-black italic">
                                    BOOKPONDY
                                </div>
                                <div className="text-sm text-muted-foreground leading-relaxed">
                                    Pondicherry, India<br />
                                    GSTIN: 34AAAAA0000A1Z5<br />
                                    support@bookpondy.com
                                </div>
                            </div>
                            <div className="text-right">
                                <h2 className="text-4xl font-black text-primary/20 tracking-tighter mb-2">INVOICE</h2>
                                <p className="font-bold text-sm">#{details.invoice_number}</p>
                                <p className="text-xs text-muted-foreground font-medium">Date: {details.invoice_date || details.creation_date}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-12 mb-12">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Invoice To</p>
                                <h3 className="font-bold text-lg mb-1">{details.guest_name}</h3>
                                <p className="text-sm text-muted-foreground">{details.guest_email}</p>
                                <p className="text-sm text-muted-foreground">{details.guest_phone}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Reservation Details</p>
                                <p className="text-sm font-bold">{details.property_name}</p>
                                <p className="text-sm text-muted-foreground">{new Date(details.check_in_date).toLocaleDateString()} - {new Date(details.check_out_date).toLocaleDateString()}</p>
                                <p className="text-xs font-bold text-primary mt-1">Nights: {Math.ceil((new Date(details.check_out_date).getTime() - new Date(details.check_in_date).getTime()) / (1000 * 3600 * 24))}</p>
                            </div>
                        </div>

                        <Table className="mb-12">
                            <TableHeader className="border-t-2 border-b-2 border-[#0A0A0A] bg-transparent">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="font-black text-[#0A0A0A] uppercase text-xs pl-0">Description</TableHead>
                                    <TableHead className="text-right font-black text-[#0A0A0A] uppercase text-xs">Qty</TableHead>
                                    <TableHead className="text-right font-black text-[#0A0A0A] uppercase text-xs">Price</TableHead>
                                    <TableHead className="text-right font-black text-[#0A0A0A] uppercase text-xs pr-0">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {details.charges?.map((charge: any) => (
                                    <TableRow key={charge.name} className="border-muted/50 hover:bg-transparent">
                                        <TableCell className="pl-0 py-4">
                                            <p className="font-bold text-sm">{charge.charge_type}</p>
                                            <p className="text-xs text-muted-foreground">Standard property charge</p>
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-sm">1</TableCell>
                                        <TableCell className="text-right font-medium text-sm">₹{charge.amount?.toLocaleString('en-IN')}</TableCell>
                                        <TableCell className="text-right font-bold text-sm pr-0">₹{charge.amount?.toLocaleString('en-IN')}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <div className="flex justify-end">
                            <div className="w-full max-w-[240px] space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-muted-foreground">Subtotal</span>
                                    <span className="font-bold">₹{details.subtotal?.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-muted-foreground">SGST (9%)</span>
                                    <span className="font-bold">₹{details.sgst_amount?.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-sm border-b pb-3">
                                    <span className="font-medium text-muted-foreground">CGST (9%)</span>
                                    <span className="font-bold">₹{details.cgst_amount?.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between items-center pt-1">
                                    <span className="font-black text-xs uppercase tracking-widest text-primary">Grand Total</span>
                                    <span className="font-black text-2xl tracking-tighter">₹{details.total_amount?.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-20 pt-8 border-t border-muted/50 text-center">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Thank you for staying with BookPondy</p>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="space-y-6">
                <Card className="border-none shadow-sm rounded-2xl bg-white p-6">
                    <h3 className="font-bold text-lg mb-4">Invoice Actions</h3>
                    <div className="flex flex-col gap-3">
                        {details.invoice_status === 'Draft' ? (
                            <Button className="w-full h-11 rounded-xl bg-primary text-white font-bold" onClick={handleFinalize}>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Finalize Invoice
                            </Button>
                        ) : (
                            <Button className="w-full h-11 rounded-xl bg-primary text-white font-bold" onClick={handleSendEmail}>
                                <Mail className="mr-2 h-4 w-4" />
                                Email to Guest
                            </Button>
                        )}

                        <Button variant="outline" className="w-full h-11 rounded-xl border-muted font-bold" onClick={() => window.print()}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print Invoice
                        </Button>

                        <Button variant="outline" className="w-full h-11 rounded-xl border-muted font-bold text-blue-600 border-blue-100 hover:bg-blue-50">
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                        </Button>
                    </div>
                </Card>

                <Card className="border-none shadow-sm rounded-2xl bg-white p-6">
                    <h3 className="font-bold text-lg mb-4">Payment Info</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary">
                                    <CreditCard className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Status</p>
                                    <p className="font-bold text-sm uppercase">{details.status}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary">
                                    <HistoryIcon className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Method</p>
                                    <p className="font-bold text-sm uppercase">{details.payment_method || 'Unpaid'}</p>
                                </div>
                            </div>
                        </div>

                        {details.refund_amount > 0 && (
                            <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                                <div className="flex items-center gap-2 text-red-700 mb-1">
                                    <AlertCircle className="h-4 w-4" />
                                    <span className="font-bold text-xs uppercase tracking-widest">Refund Processed</span>
                                </div>
                                <p className="font-bold text-red-900">₹{details.refund_amount.toLocaleString('en-IN')}</p>
                                <p className="text-[10px] text-red-600 mt-1">{details.refund_reason}</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    )
}
