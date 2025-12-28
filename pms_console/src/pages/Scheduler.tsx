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
            <div className="flex flex-col h-[calc(100vh-100px)]">
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-3 flex-1 overflow-hidden flex flex-col">
                    <SchedulerProvider initialState={schedulerEvents}>
                        <div className="h-full flex-1 min-h-0">
                            <SchedulerWrapper />
                        </div>
                    </SchedulerProvider>
                </div>
            </div>
        </DashboardLayout>
    )
}
