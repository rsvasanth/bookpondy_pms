"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useFrappeCreateDoc } from "frappe-react-sdk"

interface AddGuestDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AddGuestDialog({ open, onOpenChange }: AddGuestDialogProps) {
    const { createDoc, loading, error } = useFrappeCreateDoc()
    const [guestName, setGuestName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")

    const handleSubmit = async () => {
        try {
            await createDoc("Guest", {
                guest_name: guestName,
                email: email,
                phone: phone,
            })
            onOpenChange(false)
            // Reset
            setGuestName("")
            setEmail("")
            setPhone("")
        } catch (e) {
            console.error("Failed to create guest:", e)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] rounded-lg border border-border bg-card shadow-2xl p-0 overflow-hidden gap-0">
                <DialogHeader className="p-6 bg-muted/20 border-b border-border">
                    <DialogTitle className="text-xl font-black text-foreground tracking-tight">Add New Guest</DialogTitle>
                    <DialogDescription className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                        Create a new guest profile in the database.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 p-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Full Name *</Label>
                        <Input
                            id="name"
                            placeholder="John Doe"
                            className="h-11 rounded-lg bg-muted/20 border-border focus-visible:ring-primary/20 font-bold text-sm"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            className="h-11 rounded-lg bg-muted/20 border-border focus-visible:ring-primary/20 font-bold text-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Phone Number</Label>
                        <Input
                            id="phone"
                            placeholder="+91 98765 43210"
                            className="h-11 rounded-lg bg-muted/20 border-border focus-visible:ring-primary/20 font-bold text-sm"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter className="p-6 bg-muted/20 border-t border-border flex sm:justify-between items-center gap-4">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-lg h-11 font-bold text-[10px] uppercase tracking-widest text-muted-foreground hover:bg-muted">
                        Cancel
                    </Button>
                    <Button
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg h-11 px-8 shadow-sm text-[10px] uppercase tracking-widest"
                        onClick={handleSubmit}
                        disabled={!guestName || loading}
                    >
                        {loading ? "Adding..." : "Add Guest"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
