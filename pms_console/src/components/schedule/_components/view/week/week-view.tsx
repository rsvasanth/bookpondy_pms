"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { useScheduler } from "@/providers/schedular-provider";
import { Badge } from "@/components/ui/badge";
import { AnimatePresence, motion } from "framer-motion";
import { useModal } from "@/providers/modal-context";
import AddEventModal from "@/components/schedule/_modals/add-event-modal";
import EventStyled from "../event-component/event-styled";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, ChevronLeft, Maximize } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Event, CustomEventModal } from "@/types/index";
import CustomModal from "@/components/ui/custom-modal";

const hours = Array.from({ length: 24 }, (_, i) => {
  const hour = i % 12 || 12;
  const ampm = i < 12 ? "AM" : "PM";
  return `${hour}:00 ${ampm}`;
});

// Animation Variants
const itemVariants = {
  hidden: { opacity: 0, y: 5 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.12 } },
};

const pageTransitionVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export default function WeeklyView({
  prevButton,
  nextButton,
  CustomEventComponent,
  CustomEventModal,
  classNames,
}: {
  prevButton?: React.ReactNode;
  nextButton?: React.ReactNode;
  CustomEventComponent?: React.FC<Event>;
  CustomEventModal?: CustomEventModal;
  classNames?: { prev?: string; next?: string; addEvent?: string };
}) {
  const { getters, handlers } = useScheduler();
  const hoursColumnRef = useRef<HTMLDivElement>(null);
  const [detailedHour, setDetailedHour] = useState<string | null>(null);
  const [timelinePosition, setTimelinePosition] = useState<number>(0);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [colWidth] = useState<number[]>(Array(7).fill(1));
  const [direction, setDirection] = useState<number>(0);
  const { setOpen } = useModal();

  const daysOfWeek = getters?.getDaysInWeek(
    getters?.getWeekNumber(currentDate),
    currentDate.getFullYear()
  );

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!hoursColumnRef.current) return;
    const rect = hoursColumnRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const hourHeight = rect.height / 24;
    const hour = Math.max(0, Math.min(23, Math.floor(y / hourHeight)));
    const minuteFraction = (y % hourHeight) / hourHeight;
    const minutes = Math.floor(minuteFraction * 60);

    const hour12 = hour % 12 || 12;
    const ampm = hour < 12 ? "AM" : "PM";
    setDetailedHour(
      `${hour12}:${minutes.toString().padStart(2, "0")} ${ampm}`
    );

    const headerOffset = 83;
    const position = Math.max(0, Math.min(rect.height, Math.round(y))) + headerOffset;
    setTimelinePosition(position);
  }, []);

  function handleAddEvent(event?: Event) {
    const startDate = event?.startDate || new Date();
    const endDate = event?.endDate || new Date();

    setOpen(
      <CustomModal title="Add Event">
        <AddEventModal
          CustomAddEventModal={
            CustomEventModal?.CustomAddEventModal?.CustomForm
          }
        />
      </CustomModal>,
      async () => {
        return {
          ...event,
          startDate,
          endDate,
        };
      }
    );
  }

  const handleNextWeek = useCallback(() => {
    setDirection(1);
    const nextWeek = new Date(currentDate);
    nextWeek.setDate(currentDate.getDate() + 7);
    setCurrentDate(nextWeek);
  }, [currentDate]);

  const handlePrevWeek = useCallback(() => {
    setDirection(-1);
    const prevWeek = new Date(currentDate);
    prevWeek.setDate(currentDate.getDate() - 7);
    setCurrentDate(prevWeek);
  }, [currentDate]);

  function handleAddEventWeek(dayIndex: number, detailedHour: string) {
    if (!detailedHour) return;

    const [timePart, ampm] = detailedHour.split(" ");
    const [hourStr, minuteStr] = timePart.split(":");
    let hours = parseInt(hourStr);
    const minutes = parseInt(minuteStr);

    if (ampm === "PM" && hours < 12) hours += 12;
    else if (ampm === "AM" && hours === 12) hours = 0;

    const chosenDay = daysOfWeek[dayIndex % 7].getDate();
    if (chosenDay < 1 || chosenDay > 31) return;

    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      chosenDay,
      hours,
      minutes
    );

    handleAddEvent({
      startDate: date,
      endDate: new Date(date.getTime() + 60 * 60 * 1000),
      title: "",
      id: String(Date.now()),
      variant: "primary",
    });
  }

  const groupEventsByTimePeriod = (events: Event[] | undefined) => {
    if (!events || events.length === 0) return [];

    const sortedEvents = [...events].sort((a, b) =>
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    const eventsOverlap = (event1: Event, event2: Event) => {
      const start1 = new Date(event1.startDate).getTime();
      const end1 = new Date(event1.endDate).getTime();
      const start2 = new Date(event2.startDate).getTime();
      const end2 = new Date(event2.endDate).getTime();
      return (start1 < end2 && start2 < end1);
    };

    const graph: Record<string, Set<string>> = {};
    for (const event of sortedEvents) graph[event.id] = new Set<string>();

    for (let i = 0; i < sortedEvents.length; i++) {
      for (let j = i + 1; j < sortedEvents.length; j++) {
        if (eventsOverlap(sortedEvents[i], sortedEvents[j])) {
          graph[sortedEvents[i].id].add(sortedEvents[j].id);
          graph[sortedEvents[j].id].add(sortedEvents[i].id);
        }
      }
    }

    const visited = new Set<string>();
    const groups: Event[][] = [];

    for (const event of sortedEvents) {
      if (!visited.has(event.id)) {
        const group: Event[] = [];
        const stack: Event[] = [event];
        visited.add(event.id);

        while (stack.length > 0) {
          const current = stack.pop()!;
          group.push(current);
          for (const neighborId of graph[current.id]) {
            if (!visited.has(neighborId)) {
              const neighbor = sortedEvents.find(e => e.id === neighborId);
              if (neighbor) {
                stack.push(neighbor);
                visited.add(neighborId);
              }
            }
          }
        }
        group.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        groups.push(group);
      }
    }
    return groups;
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex justify-between items-center mb-2">
        <div className="flex ml-auto gap-3">
          {prevButton ? <div onClick={handlePrevWeek}>{prevButton}</div> : (
            <Button variant="outline" className={cn("h-8 rounded-lg", classNames?.prev)} onClick={handlePrevWeek}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Prev
            </Button>
          )}
          {nextButton ? <div onClick={handleNextWeek}>{nextButton}</div> : (
            <Button variant="outline" className={cn("h-8 rounded-lg", classNames?.next)} onClick={handleNextWeek}>
              Next <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto pb-4 -mx-1 px-1 min-h-0">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentDate.toISOString()}
            variants={pageTransitionVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className={cn(
              "grid grid-cols-8 gap-0 border border-slate-200 rounded-xl shadow-sm bg-white",
              "min-w-[850px] md:min-w-full"
            )}
          >
            <div className="sticky top-0 left-0 z-30 bg-slate-50 h-full border-r border-slate-200 flex items-center justify-center">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-widest px-4 py-8 [writing-mode:vertical-lr] rotate-180">
                Week {getters.getWeekNumber(currentDate)}
              </span>
            </div>

            <div className="col-span-7 flex flex-col relative">
              <div
                className="grid gap-0 flex-grow"
                style={{ gridTemplateColumns: colWidth.map(w => `${w}fr`).join(' ') }}
              >
                {daysOfWeek.map((day, idx) => (
                  <div key={idx} className="relative group flex flex-col border-r border-slate-100 last:border-r-0">
                    <div className="sticky bg-slate-50/80 backdrop-blur-sm top-0 z-20 flex-grow flex items-center justify-center py-4 border-b border-slate-100">
                      <div className="text-center">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          {getters.getDayName(day.getDay()).substring(0, 3)}
                        </div>
                        <div className={cn(
                          "text-xl font-black rounded-lg w-10 h-10 flex items-center justify-center mx-auto transition-all",
                          new Date().getDate() === day.getDate() &&
                            new Date().getMonth() === currentDate.getMonth() ?
                            "bg-primary text-white shadow-md shadow-primary/20" : "text-slate-700"
                        )}>
                          {day.getDate()}
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1.5 hover:bg-slate-200 rounded-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            const selectedDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), day.getDate());
                            const dayEvents = getters.getEventsForDay(day.getDate(), currentDate);
                            setOpen(
                              <CustomModal title={`${getters.getDayName(day.getDay())} ${day.getDate()}, ${selectedDay.getFullYear()}`}>
                                <div className="flex flex-col space-y-4 p-4">
                                  <div className="flex items-center mb-4"><ChevronLeft className="cursor-pointer mr-2" onClick={() => setOpen(null)} /><h2 className="text-2xl font-bold">{selectedDay.toDateString()}</h2></div>
                                  {dayEvents && dayEvents.length > 0 ? (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-1 gap-3">
                                        {dayEvents.map(event => (
                                          <EventStyled key={event.id} event={{ ...event, CustomEventComponent, minmized: false }} CustomEventModal={CustomEventModal} />
                                        ))}
                                      </div>
                                    </div>
                                  ) : <div className="text-center py-10 text-muted-foreground"><p>No events scheduled</p></div>}
                                </div>
                              </CustomModal>
                            );
                          }}>
                          <Maximize size={12} className="text-slate-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {detailedHour && (
                <div className="absolute flex z-50 left-0 w-full h-[2px] bg-primary/30 rounded-full pointer-events-none"
                  style={{ top: `${timelinePosition}px` }}>
                  <Badge variant="outline" className="absolute -translate-y-1/2 bg-white z-50 left-[5px] text-[10px] font-bold shadow-sm">
                    {detailedHour}
                  </Badge>
                </div>
              )}

              <div ref={hoursColumnRef} onMouseMove={handleMouseMove} onMouseLeave={() => setDetailedHour(null)} className="relative grid grid-cols-8 col-span-8">
                <div className="col-span-1 bg-slate-50/30 border-r border-slate-100">
                  {hours.map((hour, index) => (
                    <motion.div key={`hour-${index}`} variants={itemVariants} className="border-b border-slate-100 p-2 h-20 flex items-start justify-center text-[10px] font-bold text-slate-400">
                      {hour}
                    </motion.div>
                  ))}
                </div>

                <div className="col-span-7 grid h-full" style={{ gridTemplateColumns: colWidth.map(w => `${w}fr`).join(' ') }}>
                  {daysOfWeek.map((day, dayIndex) => {
                    const dayEvents = getters.getEventsForDay(day.getDate(), currentDate);
                    const timeGroups = groupEventsByTimePeriod(dayEvents);
                    return (
                      <div key={`day-grid-${dayIndex}`} className="relative border-r border-slate-100 last:border-r-0"
                        onClick={() => handleAddEventWeek(dayIndex, detailedHour || "12:00 PM")}>
                        <AnimatePresence>
                          {dayEvents?.map((event) => {
                            let eventsInSamePeriod = 1, periodIndex = 0;
                            for (let i = 0; i < timeGroups.length; i++) {
                              const idx = timeGroups[i].findIndex(e => e.id === event.id);
                              if (idx !== -1) { eventsInSamePeriod = timeGroups[i].length; periodIndex = idx; break; }
                            }
                            const { height, left, maxWidth, minWidth, top } = handlers.handleEventStyling(event, dayEvents, { eventsInSamePeriod, periodIndex, adjustForPeriod: true });
                            return (
                              <motion.div key={event.id} style={{ height, top, left, maxWidth, minWidth, padding: '0 2px', boxSizing: 'border-box' }}
                                className="absolute z-10 flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <EventStyled event={{ ...event, CustomEventComponent, minmized: true }} CustomEventModal={CustomEventModal} />
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                        {Array.from({ length: 24 }).map((_, hIdx) => (
                          <div key={`h-slot-${hIdx}`} className="h-20 border-b border-slate-50 hover:bg-slate-50/50 transition-colors" />
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
