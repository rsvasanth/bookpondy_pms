import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, CreditCard, Wrench } from "lucide-react"

// Re-using the interface or defining it if not exported
export interface Alert {
  id: string
  type: "maintenance" | "payment" | "booking" | "urgent"
  title: string
  description: string
  time: string
}

const alertConfig = {
  urgent: {
    icon: AlertTriangle,
    className: "text-red-500",
    badge: "bg-red-500/10 text-red-600",
  },
  payment: {
    icon: CreditCard,
    className: "text-orange-500",
    badge: "bg-orange-500/10 text-orange-600",
  },
  maintenance: {
    icon: Wrench,
    className: "text-yellow-500",
    badge: "bg-yellow-500/10 text-yellow-600",
  },
  booking: {
    icon: Clock,
    className: "text-blue-500",
    badge: "bg-blue-500/10 text-blue-600",
  },
}

export function AlertsPanel({ alerts = [] }: { alerts?: Alert[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          Alerts & Tasks
          <Badge variant="secondary">{alerts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => {
          const config = alertConfig[alert.type]
          const Icon = config.icon
          return (
            <div
              key={alert.id}
              className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div className={`mt-0.5 ${config.className}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">{alert.title}</p>
                <p className="text-xs text-muted-foreground">{alert.description}</p>
                <p className="text-xs text-muted-foreground">{alert.time}</p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
