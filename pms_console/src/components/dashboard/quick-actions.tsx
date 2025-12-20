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
import { AddPropertyDialog } from "@/components/properties/add-property-dialog"

export function QuickActions() {
  const [bookingSheetOpen, setBookingSheetOpen] = useState(false)
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false)

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
              <CardDescription>Frequently used operations</CardDescription>
            </div>
            <Sparkles className="h-5 w-5 text-amber-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {/* Primary Actions */}
            <Button
              onClick={() => setBookingSheetOpen(true)}
              className="h-auto flex-col gap-1.5 bg-primary py-3 hover:bg-primary/90"
            >
              <CalendarPlus className="h-5 w-5" />
              <span className="text-xs">New Booking</span>
            </Button>

            <Button
              onClick={() => setPropertyDialogOpen(true)}
              variant="outline"
              className="h-auto flex-col gap-1.5 border-dashed py-3"
            >
              <Building2 className="h-5 w-5" />
              <span className="text-xs">Add Property</span>
            </Button>

            <Button variant="outline" className="h-auto flex-col gap-1.5 py-3 bg-transparent">
              <UserPlus className="h-5 w-5" />
              <span className="text-xs">Add Guest</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-auto flex-col gap-1.5 py-3 bg-transparent">
                  <Plus className="h-5 w-5" />
                  <span className="flex items-center gap-0.5 text-xs">
                    More <ChevronDown className="h-3 w-3" />
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <Receipt className="mr-2 h-4 w-4" />
                  Create Invoice
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Assign Task
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Wrench className="mr-2 h-4 w-4" />
                  Log Maintenance
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <MessageSquarePlus className="mr-2 h-4 w-4" />
                  Send Message
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Today's Summary */}
          <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg border bg-muted/30 p-3 sm:grid-cols-4">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-blue-100 p-1.5 dark:bg-blue-900/30">
                <BedDouble className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Check-ins</p>
                <p className="text-sm font-semibold">4 today</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-orange-100 p-1.5 dark:bg-orange-900/30">
                <Clock className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Check-outs</p>
                <p className="text-sm font-semibold">3 today</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-green-100 p-1.5 dark:bg-green-900/30">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-sm font-semibold">12 tasks</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-red-100 p-1.5 dark:bg-red-900/30">
                <AlertTriangle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Urgent</p>
                <p className="text-sm font-semibold">2 tasks</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AddBookingSheet open={bookingSheetOpen} onOpenChange={setBookingSheetOpen} />
      <AddPropertyDialog open={propertyDialogOpen} onOpenChange={setPropertyDialogOpen} />
    </>
  )
}
