"use client"

import { useMemo } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useLocalDocList } from "@/hooks/use-local-data"
import { SchedulerProvider } from "@/providers/schedular-provider"
import SchedulerWrapper from "@/components/schedule/_components/wrapper/schedular-wrapper"
import type { Event } from "@/types/index"

export default function SchedulerPage() {
    const { data: reservations } = useLocalDocList("Reservation", {
        selector: {
            reservation_status: { $in: ["Confirmed", "Checked-In", "Tentative", "Checked-Out"] }
        },
        sort: [{ check_in_date: 'asc' }]
    })

    // Map reservations to Scheduler events
    const schedulerEvents = useMemo<Event[]>(() => {
        return reservations?.map(r => ({
            id: r.name,
            title: r.guest_name || "Guest",
            description: `${r.property} • ${r.reservation_status}`,
            startDate: new Date(r.check_in_date),
            endDate: new Date(r.check_out_date),
            variant: r.reservation_status === "Confirmed" ? "primary" :
                r.reservation_status === "Checked-In" ? "success" :
                    r.reservation_status === "Tentative" ? "warning" : "default"
        })) || []
    }, [reservations])

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8 h-full">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">Property Scheduler</h1>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            Manage reservations, unit assignments, and occupancy.
                        </p>
                    </div>
                </div>

                <div className="flex-1 min-h-0">
                    <Card className="border border-border shadow-sm rounded-lg bg-card overflow-hidden flex flex-col h-full">
                        <SchedulerProvider initialState={schedulerEvents}>
                            <div className="h-full flex-1">
                                <SchedulerWrapper />
                            </div>
                        </SchedulerProvider>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
