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
      <Card className="shadow-sm">
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
              variant="default"
              className="h-auto flex-col gap-2 py-4"
            >
              <CalendarPlus className="h-5 w-5" />
              <span className="text-[10px] uppercase tracking-wider">New Booking</span>
            </Button>

            <Button
              onClick={() => setPropertyDialogOpen(true)}
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
            >
              <Building2 className="h-5 w-5" />
              <span className="text-[10px] uppercase tracking-wider">Add Property</span>
            </Button>

            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <UserPlus className="h-5 w-5" />
              <span className="text-[10px] uppercase tracking-wider">Add Guest</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-auto flex-col gap-2 py-4">
                  <Plus className="h-5 w-5" />
                  <span className="flex items-center gap-0.5 text-[10px] uppercase tracking-wider">
                    More <ChevronDown className="h-3 w-3" />
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-gray-100 shadow-xl">
                <DropdownMenuItem className="rounded-xl py-2 cursor-pointer">
                  <Receipt className="mr-3 h-4 w-4 text-muted-foreground" />
                  Create Invoice
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl py-2 cursor-pointer">
                  <ClipboardList className="mr-3 h-4 w-4 text-muted-foreground" />
                  Assign Task
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl py-2 cursor-pointer">
                  <Wrench className="mr-3 h-4 w-4 text-muted-foreground" />
                  Log Maintenance
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="rounded-xl py-2 cursor-pointer">
                  <MessageSquarePlus className="mr-3 h-4 w-4 text-muted-foreground" />
                  Send Message
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl py-2 cursor-pointer">
                  <FileText className="mr-3 h-4 w-4 text-muted-foreground" />
                  Generate Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Today's Summary */}
          <div className="mt-6 grid grid-cols-2 gap-4 border-t pt-6 sm:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2">
                <BedDouble className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Check-ins</p>
                <p className="text-sm font-bold">4 today</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Check-outs</p>
                <p className="text-sm font-bold">3 today</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Completed</p>
                <p className="text-sm font-bold">12 tasks</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Urgent</p>
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
