import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const payments = [
    {
        customer: "Kenneth Thompson",
        email: "ken99@yahoo.com",
        amount: "₹116.00",
        status: "Success"
    },
    {
        customer: "Abraham Lincoln",
        email: "abe45@gmail.com",
        amount: "₹242.00",
        status: "Success"
    },
    {
        customer: "Monserrat Rodriguez",
        email: "monserrat44@gmail.com",
        amount: "₹837.00",
        status: "Processing"
    },
    {
        customer: "Silas Johnson",
        email: "silas22@gmail.com",
        amount: "₹874.00",
        status: "Success"
    }
]

export function LatestPayments() {
    return (
        <Card className="shadow-sm border-none bg-background/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-border/50">
                <div className="grid gap-0.5">
                    <CardTitle className="text-sm font-semibold tracking-tight">Latest Payments</CardTitle>
                    <CardDescription className="text-xs">See recent payments from your customers here.</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="h-8 text-[11px] font-medium px-3 rounded-lg border-muted">
                    Filter payments...
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-border/50">
                            <TableHead className="px-6 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50 h-10">Customer</TableHead>
                            <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50 h-10">Email</TableHead>
                            <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50 h-10">Amount</TableHead>
                            <TableHead className="px-6 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50 h-10">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payments.map((payment) => (
                            <TableRow key={payment.email} className="border-border/50 hover:bg-muted/30 transition-colors cursor-pointer group">
                                <TableCell className="px-6 py-4">
                                    <span className="text-sm font-medium">{payment.customer}</span>
                                </TableCell>
                                <TableCell className="py-4">
                                    <span className="text-[12px] text-muted-foreground font-mono">{payment.email}</span>
                                </TableCell>
                                <TableCell className="py-4">
                                    <span className="text-sm font-semibold tabular-nums">{payment.amount}</span>
                                </TableCell>
                                <TableCell className="px-6 py-4">
                                    <Badge
                                        variant="secondary"
                                        className={`text-[10px] font-bold uppercase tracking-tight py-0 px-2 rounded-md h-5 shadow-sm border-none ${payment.status === "Success"
                                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                            }`}>
                                        {payment.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
