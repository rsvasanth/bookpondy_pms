"use client"

import { useMemo } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useFrappeGetDocList } from "frappe-react-sdk"
import { SchedulerProvider } from "@/providers/schedular-provider"
import SchedulerWrapper from "@/components/schedule/_components/wrapper/schedular-wrapper"
import type { Event } from "@/types/index"

export default function SchedulerPage() {
    const { data: reservations } = useFrappeGetDocList("Reservation", {
        fields: ["name", "guest_name", "reservation_status", "check_in_date", "check_out_date", "property"],
        filters: [["reservation_status", "in", ["Confirmed", "Checked-In", "Tentative", "Checked-Out"]]],
        limit: 100,
        orderBy: { field: "check_in_date", order: "asc" }
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
            <div className="flex flex-col space-y-6 pb-12 h-[calc(100vh-120px)]">
                <div className="flex items-center justify-between px-2">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-[#0f0f14]">Reservation Scheduler</h1>
                        <p className="text-sm text-slate-500 font-medium mt-1">Visual timeline of all property bookings and availability</p>
                    </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-3 flex-1 overflow-hidden">
                    <SchedulerProvider initialState={schedulerEvents}>
                        <div className="h-full">
                            <SchedulerWrapper />
                        </div>
                    </SchedulerProvider>
                </div>
            </div>
        </DashboardLayout>
    )
}
