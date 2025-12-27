import SchedulerView from "../view/schedular-view";

export default function SchedulerWrapper() {
  return (
    <div className="w-full">
      <h1 className="tracking-tighter font-bold text-xl mb-2">Event Schedule</h1>
      <SchedulerView />
    </div>
  );
}
