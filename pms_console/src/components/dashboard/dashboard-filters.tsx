"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DashboardFiltersProps {
    className?: string
}

export function DashboardFilters({ className }: DashboardFiltersProps) {
    return (
        <div className={cn("flex flex-col md:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm mb-4", className)}>

            <div className="flex flex-col gap-1 w-full md:w-auto">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Property</label>
                <select
                    className="h-9 w-full md:w-[200px] appearance-none rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-[#0f0f14] focus:outline-none focus:ring-2 focus:ring-[#ff3924]/20 focus:border-[#ff3924] transition-all cursor-pointer"
                >
                    <option>All Properties (4)</option>
                    <option>Silver Sands Villa</option>
                    <option>Palm Grove Residency</option>
                    <option>Ocean View Apartments</option>
                </select>
            </div>

            <div className="flex flex-col gap-1 w-full md:w-auto">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Date Range</label>
                <select
                    className="h-9 w-full md:w-[160px] appearance-none rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-[#0f0f14] focus:outline-none focus:ring-2 focus:ring-[#ff3924]/20 focus:border-[#ff3924] transition-all cursor-pointer"
                >
                    <option>Today</option>
                    <option>This Week</option>
                    <option>This Month</option>
                </select>
            </div>

            <div className="flex flex-col gap-1 w-full md:w-auto">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Status</label>
                <select
                    className="h-9 w-full md:w-[160px] appearance-none rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-[#0f0f14] focus:outline-none focus:ring-2 focus:ring-[#ff3924]/20 focus:border-[#ff3924] transition-all cursor-pointer"
                >
                    <option>All Status</option>
                    <option>Urgent</option>
                    <option>Open</option>
                    <option>In Progress</option>
                </select>
            </div>

        </div>
    )
}
