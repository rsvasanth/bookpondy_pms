"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
    Receipt,
    CreditCard,
    Sparkles,
    ArrowRightCircle,
    AlertCircle,
    FileText,
    CheckCircle2
} from "lucide-react"
import { useLocalMutation } from "@/hooks/use-local-data"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

interface CheckOutDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    booking: any
    onSuccess?: () => void
}

export function CheckOutDialog({ open, onOpenChange, booking, onSuccess }: CheckOutDialogProps) {
    const [step, setStep] = useState(1)
    const [isPaymentSettled, setIsPaymentSettled] = useState(false)
    const [markUnitDirty, setMarkUnitDirty] = useState(true)

    const { mutate } = useLocalMutation()

    const paidAmount = ["Received", "Refunded"].includes(booking?.payment_status)
        ? booking?.total_amount
        : (booking?.advance_paid || 0)
    const dueAmount = (booking?.total_amount || 0) - (paidAmount || 0)

    const handleNext = () => setStep(s => s + 1)
    const handleBack = () => setStep(s => s - 1)

    const handleCompleteCheckOut = async () => {
        try {
            // 1. Update Reservation
            await mutate("Reservation", booking.name, {
                reservation_status: "Checked-Out",
                payment_status: dueAmount === 0 || isPaymentSettled ? "Received" : booking.payment_status,
                check_out_time: new Date().toISOString()
            })

            // 2. We skip complex housekeeping logic for now, but in reality 
            // we would create a Task or update Unit status here.

            toast.success("Guest checked out successfully")
            onOpenChange(false)
            if (onSuccess) onSuccess()
        } catch (error) {
            console.error(error)
            toast.error("Failed to complete check-out")
        }
    }

    if (!booking) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-xl border-none shadow-2xl">
                <div className="bg-error p-6 text-white">
                    <DialogHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider border-white/30 text-white">
                                Step {step} of 2
                            </Badge>
                        </div>
                        <DialogTitle className="text-xl font-bold">
                            {step === 1 && "Final Settlement"}
                            {step === 2 && "Handover & Cleaning"}
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <div className="p-8 space-y-6">
                    {/* Step 1: Settlement */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="flex items-start gap-4 p-4 rounded-lg border border-border bg-muted/30">
                                <Receipt className="h-5 w-5 text-error mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold">Billing Summary</p>
                                    <p className="text-xs text-muted-foreground">Review final charges and outstanding balance.</p>
                                </div>
                            </div>

                            <div className="rounded-xl border border-border p-5 space-y-3 bg-muted/10">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground font-medium">Total Stay Value</span>
                                    <span className="font-semibold">₹{booking.total_amount?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground font-medium">Amount Received</span>
                                    <span className="font-semibold text-success">₹{paidAmount?.toLocaleString()}</span>
                                </div>
                                <Separator className="bg-border" />
                                <div className="flex justify-between items-center pt-1">
                                    <span className="text-sm font-bold">Outstanding Balance</span>
                                    <span className={cn("text-xl font-bold", dueAmount > 0 ? "text-error" : "text-success")}>
                                        ₹{dueAmount.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {dueAmount > 0 ? (
                                <div className="flex items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-error/5 border-error/20">
                                    <Checkbox
                                        id="settle-payment"
                                        checked={isPaymentSettled}
                                        onCheckedChange={(val) => setIsPaymentSettled(!!val)}
                                    />
                                    <div className="flex flex-col gap-0.5">
                                        <Label htmlFor="settle-payment" className="text-sm font-semibold cursor-pointer">
                                            Payment Settled in Full
                                        </Label>
                                        <p className="text-xs text-muted-foreground">Guest has paid the remaining balance.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 p-4 rounded-lg bg-success/5 border border-success/20">
                                    <CheckCircle2 className="h-5 w-5 text-success" />
                                    <p className="text-sm font-semibold text-success">Account is fully settled.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Cleaning & Housekeeping */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="flex items-start gap-4 p-4 rounded-lg border border-border bg-muted/30">
                                <Sparkles className="h-5 w-5 text-error mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold">Room Status</p>
                                    <p className="text-xs text-muted-foreground">Update the unit status for housekeeping.</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                                <Checkbox
                                    id="mark-dirty"
                                    checked={markUnitDirty}
                                    onCheckedChange={(val) => setMarkUnitDirty(!!val)}
                                />
                                <div className="flex flex-col gap-0.5">
                                    <Label htmlFor="mark-dirty" className="text-sm font-semibold cursor-pointer">
                                        Flag for Housekeeping
                                    </Label>
                                    <p className="text-xs text-muted-foreground">Mark unit as 'Dirty' for immediate cleaning.</p>
                                </div>
                            </div>

                            <div className="p-4 rounded-lg bg-muted border border-border flex items-center gap-3">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <div className="flex-1">
                                    <p className="text-xs font-semibold">Generate Receipt</p>
                                    <p className="text-[10px] text-muted-foreground">A final invoice will be emailed to {booking.guest_email || "the guest"}.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-8 pt-0 flex gap-3">
                    {step > 1 ? (
                        <Button variant="outline" className="h-12 flex-1 rounded-md font-semibold" onClick={handleBack}>
                            Previous
                        </Button>
                    ) : (
                        <Button variant="outline" className="h-12 flex-1 rounded-md font-semibold" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                    )}

                    {step < 2 ? (
                        <Button
                            className="h-12 flex-1 rounded-md font-semibold bg-error hover:bg-error/90 text-white"
                            onClick={handleNext}
                            disabled={dueAmount > 0 && !isPaymentSettled}
                        >
                            Next Step
                        </Button>
                    ) : (
                        <Button
                            className="h-12 flex-1 rounded-md font-semibold bg-error hover:bg-error/90 text-white shadow-lg shadow-error/10"
                            onClick={handleCompleteCheckOut}
                        >
                            Complete Check-out
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
