import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center h-[60vh] border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50/50">
        <div className="p-10 text-center space-y-4">
          <h1 className="text-4xl font-black text-slate-200 uppercase tracking-[0.2em]">Dashboard</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Ready for new patterns</p>
        </div>
      </div>
    </DashboardLayout>
  )
}
