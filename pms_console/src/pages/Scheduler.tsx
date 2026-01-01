"use client"


import { Construction } from "lucide-react"

export default function SchedulerPage() {
    return (
        <>
            <div className="flex h-[80vh] flex-col items-center justify-center gap-4 px-4 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
                    <Construction className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="max-w-md space-y-2">
                    <h1 className="text-2xl font-black tracking-tight uppercase">Scheduler Under Maintenance</h1>
                    <p className="text-sm font-medium text-muted-foreground">
                        We are currently redesigning the property scheduling interface. Please use the Bookings list for reservation management in the meantime.
                    </p>
                </div>
            </div>
        </>
    )
}
