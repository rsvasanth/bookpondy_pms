"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  CalendarPlus,
  Building2,
  UserPlus,
  Receipt,
  ClipboardList,
  Wrench,
  MessageSquarePlus,
  FileText,
  ChevronDown,
  BedDouble,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from "lucide-react"
import { AddBookingSheet } from "@/components/bookings/add-booking-sheet"
import { PropertyDialog } from "@/components/properties/property-dialog"

interface QuickActionsProps {
  onSuccess?: () => void
}

export function QuickActions({ onSuccess }: QuickActionsProps) {
  const [bookingSheetOpen, setBookingSheetOpen] = useState(false)
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false)

  return (
    <>
      <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
        <CardHeader className="pb-3 px-6 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Quick Actions</CardTitle>
              <CardDescription className="text-xs font-medium">Frequently used operations</CardDescription>
            </div>
            <Sparkles className="h-5 w-5 text-amber-500" />
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-2">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {/* Primary Actions */}
            <Button
              onClick={() => setBookingSheetOpen(true)}
              className="h-auto flex-col gap-2 bg-[#FF3D2E] py-4 hover:bg-[#e63225] rounded-2xl shadow-lg shadow-red-500/20 text-white font-bold"
            >
              <CalendarPlus className="h-6 w-6" />
              <span className="text-[11px] uppercase tracking-wider">New Booking</span>
            </Button>

            <Button
              onClick={() => setPropertyDialogOpen(true)}
              variant="outline"
              className="h-auto flex-col gap-2 border-gray-100 border-dashed py-4 rounded-2xl bg-white hover:bg-gray-50 text-gray-600 font-bold"
            >
              <Building2 className="h-6 w-6 text-gray-400" />
              <span className="text-[11px] uppercase tracking-wider">Add Property</span>
            </Button>

            <Button variant="outline" className="h-auto flex-col gap-2 border-gray-100 py-4 rounded-2xl bg-white hover:bg-gray-50 text-gray-600 font-bold">
              <UserPlus className="h-6 w-6 text-gray-400" />
              <span className="text-[11px] uppercase tracking-wider">Add Guest</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-auto flex-col gap-2 border-gray-100 py-4 rounded-2xl bg-white hover:bg-gray-50 text-gray-600 font-bold">
                  <Plus className="h-6 w-6 text-gray-400" />
                  <span className="flex items-center gap-0.5 text-[11px] uppercase tracking-wider">
                    More <ChevronDown className="h-3 w-3" />
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-gray-100 shadow-xl">
                <DropdownMenuItem className="rounded-xl py-2.5 cursor-pointer">
                  <Receipt className="mr-3 h-4 w-4 text-muted-foreground" />
                  Create Invoice
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl py-2.5 cursor-pointer">
                  <ClipboardList className="mr-3 h-4 w-4 text-muted-foreground" />
                  Assign Task
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl py-2.5 cursor-pointer">
                  <Wrench className="mr-3 h-4 w-4 text-muted-foreground" />
                  Log Maintenance
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="rounded-xl py-2.5 cursor-pointer">
                  <MessageSquarePlus className="mr-3 h-4 w-4 text-muted-foreground" />
                  Send Message
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl py-2.5 cursor-pointer">
                  <FileText className="mr-3 h-4 w-4 text-muted-foreground" />
                  Generate Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Today's Summary */}
          <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl border border-gray-50 bg-gray-50/50 p-4 sm:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 p-2 text-blue-600">
                <BedDouble className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Check-ins</p>
                <p className="text-sm font-bold">4 today</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-orange-100 p-2 text-orange-600">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Check-outs</p>
                <p className="text-sm font-bold">3 today</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-green-100 p-2 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Completed</p>
                <p className="text-sm font-bold">12 tasks</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-red-100 p-2 text-red-600">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Urgent</p>
                <p className="text-sm font-bold">2 tasks</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AddBookingSheet open={bookingSheetOpen} onOpenChange={setBookingSheetOpen} onSuccess={onSuccess} />
      <PropertyDialog open={propertyDialogOpen} onOpenChange={setPropertyDialogOpen} onSuccess={onSuccess} />
    </>
  )
}
