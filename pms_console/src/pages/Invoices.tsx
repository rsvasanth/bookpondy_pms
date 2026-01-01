"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useFrappeGetCall, useFrappePostCall } from "frappe-react-sdk"
import { useLocalDocList } from "@/hooks/use-local-data"
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

    const { data: folios, isLoading } = useLocalDocList("Folio", {
        sort: [{ creation: 'desc' }],
        limit: 100
    })

    const filteredInvoices = folios?.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.invoice_number && f.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'paid': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
            case 'finalized': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
            case 'sent': return 'bg-violet-500/10 text-violet-500 border-violet-500/20'
            case 'cancelled': return 'bg-rose-500/10 text-rose-500 border-rose-500/20'
            default: return 'bg-muted text-muted-foreground border-border'
        }
    }

    if (selectedInvoice) {
        return (
            <>
                <div className="flex flex-col gap-8">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedInvoice(null)} className="rounded-lg h-10 w-10 hover:bg-muted text-muted-foreground transition-colors">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <div className="space-y-1">
                            <h1 className="text-xl font-bold tracking-tight text-foreground uppercase">Invoice Details</h1>
                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">{selectedInvoice}</p>
                        </div>
                    </div>
                    <InvoiceDetailView folioName={selectedInvoice} onBack={() => setSelectedInvoice(null)} />
                </div>
            </>
        )
    }

    return (
        <>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-xl font-bold tracking-tight text-foreground uppercase">Invoices & Billing</h1>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Manage your property's financial transactions and guest folios.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative w-[300px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search invoice # or guest..."
                                className="pl-10 h-10 rounded-lg bg-card border-border shadow-sm text-xs font-bold uppercase tracking-wider focus:ring-primary/20"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <Card className="border border-border shadow-sm rounded-lg overflow-hidden bg-card">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow className="border-b border-border hover:bg-transparent transition-none">
                                <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] pl-4 h-10 text-muted-foreground">Invoice #</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] h-10 text-muted-foreground">Folio / Reservation</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] h-10 text-muted-foreground">Amount</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] h-10 text-muted-foreground">Status</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] h-10 text-muted-foreground">Date</TableHead>
                                <TableHead className="text-right font-bold text-[10px] uppercase tracking-[0.2em] pr-4 h-10 text-muted-foreground">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-border">
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-48 text-center">
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Loading folios...</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredInvoices?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-48 text-center">
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
                                            <Search className="h-8 w-8 mb-2 stroke-1" />
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em]">No invoices found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredInvoices?.map((folio) => (
                                    <TableRow key={folio.name} className="hover:bg-muted/30 group transition-all border-none">
                                        <TableCell className="pl-4 py-3 font-black text-sm text-foreground uppercase tracking-tight">
                                            {folio.invoice_number || <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-50 tracking-widest italic">Draft</span>}
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm font-bold text-foreground uppercase tracking-tight">{folio.name}</span>
                                                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-[0.1em]">{folio.reservation}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3 font-black text-sm text-foreground">₹{folio.grand_total?.toLocaleString('en-IN')}</TableCell>
                                        <TableCell className="py-3">
                                            <Badge className={cn("rounded-sm px-2 py-0 text-[9px] font-bold uppercase tracking-widest border shadow-none", getStatusColor(folio.invoice_status))}>
                                                {folio.invoice_status || folio.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-3 text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
                                            {new Date(folio.creation).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </TableCell>
                                        <TableCell className="text-right pr-4 py-3">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="rounded-md h-9 px-4 font-bold text-[10px] uppercase tracking-widest text-primary hover:text-primary hover:bg-primary/10 transition-colors"
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
        </>
    )
}

function InvoiceDetailView({ folioName }: { folioName: string, onBack: () => void }) {
    const { data: details, isLoading, mutate } = useFrappeGetCall(
        "bookpondy_pms.bookpondy_pms.doctype.folio.folio.get_invoice_details",
        { folio_name: folioName }
    )

    const { call: finalize } = useFrappePostCall("bookpondy_pms.bookpondy_pms.doctype.folio.folio.finalize_invoice")
    const { call: sendEmail } = useFrappePostCall("bookpondy_pms.bookpondy_pms.doctype.folio.folio.send_invoice_email")

    const handleDownloadPDF = () => {
        window.open(`/api/method/bookpondy_pms.bookpondy_pms.doctype.folio.folio.generate_invoice_pdf?folio=${folioName}`);
    };

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

    if (isLoading) return <div className="h-64 flex items-center justify-center"><div className="flex flex-col items-center gap-2 text-muted-foreground"><p className="text-[10px] font-bold uppercase tracking-[0.2em]">Loading invoice details...</p></div></div>

    if (!details) return <div className="h-64 flex items-center justify-center text-rose-500 font-bold uppercase text-xs tracking-widest">Invoice not found</div>

    return (
        <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
                <Card className="border border-border shadow-xl rounded-lg bg-card overflow-hidden p-0">
                    <div className="p-12 bg-white text-slate-900 shadow-inner" id="invoice-printable">
                        <div className="flex justify-between items-start mb-16">
                            <div className="space-y-4">
                                <div className="h-12 w-48 bg-slate-900 rounded-sm flex items-center justify-center text-white font-black italic tracking-tighter text-xl">
                                    BOOKPONDY
                                </div>
                                <div className="text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-widest">
                                    Pondicherry, India<br />
                                    GSTIN: 34AAAAA0000A1Z5<br />
                                    support@bookpondy.com
                                </div>
                            </div>
                            <div className="text-right">
                                <h2 className="text-5xl font-black text-slate-200 tracking-tighter mb-4 uppercase">INVOICE</h2>
                                <p className="font-black text-sm uppercase tracking-tight text-slate-900">#{details.invoice_number}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Date: {details.invoice_date || details.creation_date}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-16 mb-16 border-y border-slate-100 py-10">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-4">Invoice To</p>
                                <h3 className="font-black text-xl text-slate-900 uppercase tracking-tight">{details.guest_name}</h3>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">{details.guest_email}</p>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">{details.guest_phone}</p>
                            </div>
                            <div className="text-right space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-4">Reservation Details</p>
                                <p className="text-sm font-black text-slate-900 uppercase tracking-tight ">{details.property_name}</p>
                                <p className="text-xs font-bold text-slate-500 uppercase">{new Date(details.check_in_date).toLocaleDateString()} — {new Date(details.check_out_date).toLocaleDateString()}</p>
                                <div className="inline-block bg-slate-100 border border-slate-200 px-3 py-1 rounded-sm text-[9px] font-black uppercase text-slate-600 tracking-widest mt-2">
                                    Nights: {Math.ceil((new Date(details.check_out_date).getTime() - new Date(details.check_in_date).getTime()) / (1000 * 3600 * 24))}
                                </div>
                            </div>
                        </div>

                        <Table className="mb-16">
                            <TableHeader className="border-y-2 border-slate-900 bg-transparent">
                                <TableRow className="hover:bg-transparent transition-none border-none">
                                    <TableHead className="font-black text-slate-900 uppercase text-[10px] tracking-[0.2em] pl-0 h-14">Description</TableHead>
                                    <TableHead className="text-right font-black text-slate-900 uppercase text-[10px] tracking-[0.2em] h-14">Qty</TableHead>
                                    <TableHead className="text-right font-black text-slate-900 uppercase text-[10px] tracking-[0.2em] h-14">Price</TableHead>
                                    <TableHead className="text-right font-black text-slate-900 uppercase text-[10px] tracking-[0.2em] pr-0 h-14">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {details.charges?.map((charge: any) => (
                                    <TableRow key={charge.name} className="border-b border-slate-100 hover:bg-transparent transition-all">
                                        <TableCell className="pl-0 py-6">
                                            <p className="font-black text-sm text-slate-900 uppercase tracking-tight">{charge.charge_type}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Standard property charge</p>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-sm text-slate-600">1</TableCell>
                                        <TableCell className="text-right font-bold text-sm text-slate-600">₹{charge.amount?.toLocaleString('en-IN')}</TableCell>
                                        <TableCell className="text-right font-black text-sm text-slate-900 pr-0">₹{charge.amount?.toLocaleString('en-IN')}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <div className="flex justify-end">
                            <div className="w-full max-w-[280px] space-y-4">
                                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                                    <span className="text-slate-400 font-black tracking-[0.1em]">Subtotal</span>
                                    <span className="text-slate-900 font-black">₹{details.subtotal?.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                                    <span className="text-slate-400 font-black tracking-[0.1em]">SGST (9%)</span>
                                    <span className="text-slate-900 font-black">₹{details.sgst_amount?.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest border-b border-slate-100 pb-5">
                                    <span className="text-slate-400 font-black tracking-[0.1em]">CGST (9%)</span>
                                    <span className="text-slate-900 font-black">₹{details.cgst_amount?.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="font-black text-[10px] uppercase tracking-[0.25em] text-primary">Grand Total</span>
                                    <span className="font-black text-3xl tracking-tighter text-slate-900">₹{details.total_amount?.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-24 pt-10 border-t border-slate-100 text-center">
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">Thank you for staying with BookPondy</p>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="space-y-8">
                <Card className="border border-border shadow-sm rounded-lg bg-card overflow-hidden transition-all">
                    <div className="bg-muted/30 px-6 py-5 border-b border-border">
                        <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Invoice Actions</h3>
                    </div>
                    <div className="p-6 space-y-3">
                        {details.invoice_status === 'Draft' ? (
                            <Button className="w-full h-11 rounded-md bg-primary text-primary-foreground font-bold text-[10px] uppercase tracking-widest shadow-sm" onClick={handleFinalize}>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Finalize Invoice
                            </Button>
                        ) : (
                            <Button className="w-full h-11 rounded-md bg-emerald-500 text-white hover:bg-emerald-600 font-bold text-[10px] uppercase tracking-widest shadow-sm" onClick={handleSendEmail}>
                                <Mail className="mr-2 h-4 w-4" />
                                Email to Guest
                            </Button>
                        )}

                        <Button variant="outline" className="w-full h-11 rounded-md border-border font-bold text-[10px] uppercase tracking-widest hover:bg-muted transition-colors" onClick={() => window.print()}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print Invoice
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full h-11 rounded-md border-border font-bold text-[10px] uppercase tracking-widest text-blue-500 border-blue-500/20 hover:bg-blue-500/5 transition-colors"
                            onClick={handleDownloadPDF}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                        </Button>
                    </div>
                </Card>

                <Card className="border border-border shadow-sm rounded-lg bg-card overflow-hidden transition-all">
                    <div className="bg-muted/30 px-6 py-5 border-b border-border">
                        <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Payment Info</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-md bg-muted/20 border border-border">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-md bg-card shadow-sm flex items-center justify-center text-primary border border-border">
                                    <CreditCard className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em] mb-1">Status</p>
                                    <p className="font-black text-xs uppercase text-foreground tracking-tight">{details.status}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-md bg-muted/20 border border-border">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-md bg-card shadow-sm flex items-center justify-center text-primary border border-border">
                                    <HistoryIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em] mb-1">Method</p>
                                    <p className="font-black text-xs uppercase text-foreground tracking-tight">{details.payment_method || 'Unpaid'}</p>
                                </div>
                            </div>
                        </div>

                        {details.refund_amount > 0 && (
                            <div className="p-4 rounded-md bg-rose-500/5 border border-rose-500/20">
                                <div className="flex items-center gap-2 text-rose-500 mb-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <span className="font-black text-[10px] uppercase tracking-widest">Refund Processed</span>
                                </div>
                                <p className="font-black text-lg text-rose-600 tracking-tight">₹{details.refund_amount.toLocaleString('en-IN')}</p>
                                <p className="text-[10px] font-bold text-rose-500/60 uppercase tracking-tight mt-1">{details.refund_reason}</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div >
        </div >
    )
}
