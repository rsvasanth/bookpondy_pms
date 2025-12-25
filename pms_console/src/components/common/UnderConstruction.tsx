
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Construction } from "lucide-react"

interface UnderConstructionProps {
    title: string
    description?: string
}

export function UnderConstruction({ title, description = "This module is currently under development." }: UnderConstructionProps) {
    return (
        <DashboardLayout>
            <div className="flex flex-col h-[80vh] items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
                <div className="bg-orange-50 p-6 rounded-full mb-6 ring-8 ring-orange-50/50">
                    <Construction className="h-12 w-12 text-orange-500" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">{title}</h1>
                <p className="text-muted-foreground max-w-md text-lg">{description}</p>
                <p className="mt-8 text-xs text-gray-400 font-mono">BookPondy PMS v1.0</p>
            </div>
        </DashboardLayout>
    )
}
