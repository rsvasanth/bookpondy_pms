"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
    ShieldCheck,
    CreditCard,
    MapPin,
    Upload,
    AlertCircle,
    Loader2,
    CheckCircle
} from "lucide-react"
import { useLocalMutation, useLocalDocList } from "@/hooks/use-local-data"
import { useFrappeFileUpload } from "frappe-react-sdk"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface CheckInDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    booking: any
    onSuccess?: () => void
}

export function CheckInDialog({ open, onOpenChange, booking, onSuccess }: CheckInDialogProps) {
    const [step, setStep] = useState(1)
    const [isIdVerified, setIsIdVerified] = useState(booking?.is_identity_verified || false)
    const [isDepositCollected, setIsDepositCollected] = useState(booking?.is_security_deposit_collected || false)
    const [selectedUnit, setSelectedUnit] = useState(booking?.allocated_unit || "")
    const [idUrl, setIdUrl] = useState<string>(booking?.guest_id_image || "")
    const [uploadProgress, setUploadProgress] = useState(0)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const { upload, loading: isUploading } = useFrappeFileUpload()
    const { mutate } = useLocalMutation()
    const { data: availableUnits } = useLocalDocList("Unit", {
        selector: {
            property: booking?.property,
            unit_category: booking?.unit_category,
            status: "Available"
        }
    })

    const handleNext = () => setStep(s => s + 1)
    const handleBack = () => setStep(s => s - 1)

    const handleCompleteCheckIn = async () => {
        try {
            // 1. Update Reservation
            await mutate("Reservation", booking.name, {
                reservation_status: "Checked-In",
                is_identity_verified: isIdVerified ? 1 : 0,
                is_security_deposit_collected: isDepositCollected ? 1 : 0,
                allocated_unit: selectedUnit,
                guest_id_image: idUrl,
                check_in_time: new Date().toISOString()
            })

            // 2. Update Unit Status if selected
            if (selectedUnit) {
                // We'd ideally find the unit record by unit_no or name
                // For now, updating the reservation is the primary goal
            }

            toast.success("Guest checked in successfully")
            onOpenChange(false)
            if (onSuccess) onSuccess()
        } catch (error) {
            console.error(error)
            toast.error("Failed to complete check-in")
        }
    }

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        try {
            setUploadProgress(10)
            const result = await upload(file, {
                isPrivate: false,
            })

            if (result && (result as any).file_url) {
                setIdUrl((result as any).file_url)
                setIsIdVerified(true)
                setUploadProgress(100)
                toast.success("Identity document uploaded successfully")
            }
        } catch (error) {
            console.error("Upload error:", error)
            toast.error("Failed to upload ID document")
            setUploadProgress(0)
        }
    }

    if (!booking) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-xl border-none shadow-2xl">
                <div className="bg-primary p-6 text-primary-foreground">
                    <DialogHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider border-primary-foreground/30 text-primary-foreground">
                                Step {step} of 3
                            </Badge>
                        </div>
                        <DialogTitle className="text-xl font-bold">
                            {step === 1 && "Guest Verification"}
                            {step === 2 && "Payment & Deposit"}
                            {step === 3 && "Unit Allocation"}
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <div className="p-8 space-y-6">
                    {/* Step 1: Verification */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="flex items-start gap-4 p-4 rounded-lg border border-border bg-muted/30">
                                <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold">Identity Verification</p>
                                    <p className="text-xs text-muted-foreground">Ensure the guest provides a valid government issued ID.</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                                <Checkbox
                                    id="id-verified"
                                    checked={isIdVerified}
                                    onCheckedChange={(val) => setIsIdVerified(!!val)}
                                />
                                <div className="flex flex-col gap-0.5">
                                    <Label htmlFor="id-verified" className="text-sm font-semibold cursor-pointer">
                                        I have verified the guest's ID
                                    </Label>
                                    <p className="text-xs text-muted-foreground">A copy has been scanned and stored.</p>
                                </div>
                            </div>

                            <div
                                className={cn(
                                    "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer",
                                    isIdVerified ? "border-success bg-success/5" : "border-border bg-muted/10 hover:bg-muted/20",
                                    isUploading && "opacity-50 pointer-events-none"
                                )}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept="image/*,.pdf"
                                    className="hidden"
                                />
                                <div className={cn(
                                    "h-10 w-10 rounded-full flex items-center justify-center border shadow-sm",
                                    isIdVerified ? "bg-success text-white border-success" : "bg-background text-muted-foreground"
                                )}>
                                    {isUploading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : isIdVerified ? (
                                        <CheckCircle className="h-5 w-5" />
                                    ) : (
                                        <Upload className="h-5 w-5" />
                                    )}
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-semibold">
                                        {isUploading ? "Uploading..." : isIdVerified ? "Document Uploaded" : "Upload ID Scan"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {isIdVerified && idUrl ? idUrl.split('/').pop() : "PNG, JPG or PDF up to 5MB"}
                                    </p>
                                </div>

                                {isUploading && (
                                    <div className="w-full max-w-[200px] mt-2">
                                        <Progress value={uploadProgress} className="h-1" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Payment */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="flex items-start gap-4 p-4 rounded-lg border border-border bg-muted/30">
                                <CreditCard className="h-5 w-5 text-primary mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold">Security Deposit</p>
                                    <p className="text-xs text-muted-foreground">Confirm that the mandatory security deposit has been received.</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                                <Checkbox
                                    id="deposit-collected"
                                    checked={isDepositCollected}
                                    onCheckedChange={(val) => setIsDepositCollected(!!val)}
                                />
                                <div className="flex flex-col gap-0.5">
                                    <Label htmlFor="deposit-collected" className="text-sm font-semibold cursor-pointer">
                                        Security Deposit Collected
                                    </Label>
                                    <p className="text-xs text-muted-foreground">Confirming receipt of ₹2,000.</p>
                                </div>
                            </div>

                            <div className="p-4 rounded-lg bg-warning/5 border border-warning/20">
                                <div className="flex items-center gap-2 text-warning mb-1">
                                    <AlertCircle className="h-4 w-4" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Pending Balance</span>
                                </div>
                                <p className="text-sm font-semibold">₹{(booking.total_amount - (booking.advance_paid || 0)).toLocaleString()} remaining</p>
                                <p className="text-[10px] text-muted-foreground mt-1 font-medium">Please ensure full payment is settled before check-in if per policy.</p>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Unit Assignment */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="flex items-start gap-4 p-4 rounded-lg border border-border bg-muted/30">
                                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold">Assign Unit</p>
                                    <p className="text-xs text-muted-foreground">Select the physical unit/room for this stay.</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground">Select Unit/Room *</Label>
                                <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                                    <SelectTrigger className="h-12 border-border shadow-none">
                                        <SelectValue placeholder="Choose an available unit" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-border shadow-xl">
                                        {availableUnits?.map((u: any) => (
                                            <SelectItem key={u.name} value={u.unit_no} className="rounded-lg py-2">
                                                {u.unit_no} - {u.unit_category}
                                            </SelectItem>
                                        ))}
                                        {(!availableUnits || availableUnits.length === 0) && (
                                            <div className="p-4 text-center text-xs text-muted-foreground italic">
                                                No units marked 'Available' in this category.
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="p-4 rounded-lg bg-muted border border-border space-y-3">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground">Property</span>
                                    <span className="font-semibold">{booking.property}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground">Category</span>
                                    <span className="font-semibold">{booking.unit_category}</span>
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

                    {step < 3 ? (
                        <Button className="h-12 flex-1 rounded-md font-semibold bg-primary hover:bg-primary/90" onClick={handleNext}>
                            Next Step
                        </Button>
                    ) : (
                        <Button
                            className="h-12 flex-1 rounded-md font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/10"
                            onClick={handleCompleteCheckIn}
                            disabled={!selectedUnit}
                        >
                            Complete Check-in
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
