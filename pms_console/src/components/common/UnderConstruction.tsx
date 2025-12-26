
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Construction } from "lucide-react"

interface UnderConstructionProps {
    title: string
    description?: string
}

export function UnderConstruction({ title, description = "This module is currently under development." }: UnderConstructionProps) {
    return (
        <DashboardLayout>
            <div className="flex flex-col h-[70vh] items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
                <div className="bg-primary/10 p-5 rounded-full mb-4 ring-6 ring-primary/5">
                    <Construction className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-2xl font-black tracking-tight text-secondary mb-1">{title}</h1>
                <p className="text-muted-foreground max-w-sm text-base font-medium">{description}</p>
                <p className="mt-6 text-[10px] text-gray-400 font-mono uppercase tracking-widest">BookPondy PMS v1.0</p>
            </div>
        </DashboardLayout>
    )
}
