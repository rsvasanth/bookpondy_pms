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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Guest</DialogTitle>
                    <DialogDescription>
                        Create a new guest profile in the database.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            placeholder="John Doe"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            placeholder="+91 98765 43210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        className="bg-[#E68B47] hover:bg-[#c97339]"
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
