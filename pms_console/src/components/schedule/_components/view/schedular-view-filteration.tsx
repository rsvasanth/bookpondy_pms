"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, CalendarDaysIcon } from "lucide-react";
import { CalendarDays as BsCalendarMonth, CalendarRange as BsCalendarWeek } from "lucide-react";


import DailyView from "./day/daily-view";
import MonthView from "./month/month-view";
import WeeklyView from "./week/week-view";
import { cn } from "@/lib/utils";
import CustomModal from "@/components/ui/custom-modal";
import { useModal } from "@/providers/modal-context";
import AddEventModal from "../../_modals/add-event-modal";
import type { ClassNames, CustomComponents, Views } from "@/types/index";

// Animation settings for Framer Motion
const animationConfig = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.2, type: "spring" as const, stiffness: 250 },
};

export default function SchedulerViewFilteration({
  views = {
    views: ["day", "week", "month"],
    mobileViews: ["week"],
  },
  stopDayEventSummary = false,
  CustomComponents,
  classNames,
}: {
  views?: Views;
  stopDayEventSummary?: boolean;
  CustomComponents?: CustomComponents;
  classNames?: ClassNames;
}) {
  const { setOpen } = useModal();
  const [activeView, setActiveView] = useState<string>("day");
  const [clientSide, setClientSide] = useState(false);

  useEffect(() => {
    setClientSide(true);
  }, []);

  const [isMobile, setIsMobile] = useState(
    clientSide ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    if (!clientSide) return;
    setIsMobile(window.innerWidth <= 768);
    function handleResize() {
      if (window && window.innerWidth <= 768) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    }

    window && window.addEventListener("resize", handleResize);

    return () => window && window.removeEventListener("resize", handleResize);
  }, [clientSide]);

  function handleAddEvent() {
    setOpen(
      <CustomModal title="Add Event">
        <AddEventModal
          CustomAddEventModal={
            CustomComponents?.CustomEventModal?.CustomAddEventModal?.CustomForm
          }
        />
      </CustomModal>
    );
  }

  const viewsSelector = isMobile ? views?.mobileViews : views?.views;

  // Set initial active view
  useEffect(() => {
    if (viewsSelector?.length) {
      setActiveView(viewsSelector[0]);
    }
  }, []);

  return (
    <div className="flex w-full flex-col h-full">
      <div className="flex w-full">
        <div className="dayly-weekly-monthly-selection relative w-full">
          <Tabs
            value={activeView}
            onValueChange={setActiveView}
            className={cn("w-full h-full flex flex-col", classNames?.tabs)}
          >
            <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <h1 className="tracking-tighter font-bold text-xl text-slate-900 whitespace-nowrap">Event Schedule</h1>
                <TabsList className="grid grid-cols-3 h-8 p-1 bg-slate-100/80 rounded-lg">
                  {viewsSelector?.includes("day") && (
                    <TabsTrigger value="day" className="text-[11px] px-3 h-7">
                      {CustomComponents?.customTabs?.CustomDayTab ? (
                        CustomComponents.customTabs.CustomDayTab
                      ) : (
                        <div className="flex items-center space-x-1">
                          <CalendarDaysIcon size={12} />
                          <span>Day</span>
                        </div>
                      )}
                    </TabsTrigger>
                  )}

                  {viewsSelector?.includes("week") && (
                    <TabsTrigger value="week" className="text-[11px] px-3 h-7">
                      {CustomComponents?.customTabs?.CustomWeekTab ? (
                        CustomComponents.customTabs.CustomWeekTab
                      ) : (
                        <div className="flex items-center space-x-1">
                          <BsCalendarWeek size={12} />
                          <span>Week</span>
                        </div>
                      )}
                    </TabsTrigger>
                  )}

                  {viewsSelector?.includes("month") && (
                    <TabsTrigger value="month" className="text-[11px] px-3 h-7">
                      {CustomComponents?.customTabs?.CustomMonthTab ? (
                        CustomComponents.customTabs.CustomMonthTab
                      ) : (
                        <div className="flex items-center space-x-1">
                          <BsCalendarMonth size={12} />
                          <span>Month</span>
                        </div>
                      )}
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>

              {/* Add Event Button */}
              {CustomComponents?.customButtons?.CustomAddEventButton ? (
                <div onClick={() => handleAddEvent()}>
                  {CustomComponents?.customButtons.CustomAddEventButton}
                </div>
              ) : (
                <Button
                  onClick={() => handleAddEvent()}
                  className={cn("h-8 text-[11px] px-3 font-bold uppercase tracking-wider", classNames?.buttons?.addEvent)}
                  variant="default"
                >
                  <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                  Add Event
                </Button>
              )}
            </div>

            {viewsSelector?.includes("day") && (
              <TabsContent value="day" className="mt-0 flex-1 min-h-0 flex flex-col">
                <AnimatePresence mode="wait">
                  <motion.div {...animationConfig} className="h-full">
                    <DailyView
                      stopDayEventSummary={stopDayEventSummary}
                      classNames={classNames?.buttons}
                      prevButton={
                        CustomComponents?.customButtons?.CustomPrevButton
                      }
                      nextButton={
                        CustomComponents?.customButtons?.CustomNextButton
                      }
                      CustomEventComponent={
                        CustomComponents?.CustomEventComponent
                      }
                      CustomEventModal={CustomComponents?.CustomEventModal}
                    />
                  </motion.div>
                </AnimatePresence>
              </TabsContent>
            )}

            {viewsSelector?.includes("week") && (
              <TabsContent value="week" className="mt-0 flex-1 min-h-0 flex flex-col">
                <AnimatePresence mode="wait">
                  <motion.div {...animationConfig} className="h-full">
                    <WeeklyView
                      classNames={classNames?.buttons}
                      prevButton={
                        CustomComponents?.customButtons?.CustomPrevButton
                      }
                      nextButton={
                        CustomComponents?.customButtons?.CustomNextButton
                      }
                      CustomEventComponent={
                        CustomComponents?.CustomEventComponent
                      }
                      CustomEventModal={CustomComponents?.CustomEventModal}
                    />
                  </motion.div>
                </AnimatePresence>
              </TabsContent>
            )}

            {viewsSelector?.includes("month") && (
              <TabsContent value="month" className="mt-0 flex-1 overflow-y-auto min-h-0">
                <AnimatePresence mode="wait">
                  <motion.div {...animationConfig}>
                    <MonthView
                      classNames={classNames?.buttons}
                      prevButton={
                        CustomComponents?.customButtons?.CustomPrevButton
                      }
                      nextButton={
                        CustomComponents?.customButtons?.CustomNextButton
                      }
                      CustomEventComponent={
                        CustomComponents?.CustomEventComponent
                      }
                      CustomEventModal={CustomComponents?.CustomEventModal}
                    />
                  </motion.div>
                </AnimatePresence>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
