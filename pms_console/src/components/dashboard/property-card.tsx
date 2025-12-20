import Image from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Star, MapPin, Eye, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

interface PropertyCardProps {
  name: string
  location: string
  image: string
  status: "active" | "inactive" | "maintenance"
  occupancy: number
  rating: number
  nextBooking?: string
}

const statusConfig = {
  active: { label: "Active", className: "bg-green-500/10 text-green-600" },
  inactive: { label: "Inactive", className: "bg-gray-500/10 text-gray-600" },
  maintenance: {
    label: "Maintenance",
    className: "bg-yellow-500/10 text-yellow-600",
  },
}

export function PropertyCard({ name, location, image, status, occupancy, rating, nextBooking }: PropertyCardProps) {
  const statusInfo = statusConfig[status]

  return (
    <Card className="overflow-hidden">
      <div className="relative h-40">
        <img src={image || "/placeholder.svg"} alt={name}  className="object-cover" />
        <Badge className={cn("absolute right-2 top-2", statusInfo.className)}>{statusInfo.label}</Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold">{name}</h3>
        <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {location}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
          <div>
            <p className="font-semibold text-primary">{occupancy}%</p>
            <p className="text-xs text-muted-foreground">Occupancy</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{rating}</span>
            </div>
            <p className="text-xs text-muted-foreground">Rating</p>
          </div>
          <div>
            <p className="font-semibold text-green-600">{nextBooking || "None"}</p>
            <p className="text-xs text-muted-foreground">Next</p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
            <Eye className="mr-1.5 h-4 w-4" />
            View
          </Button>
          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
            <Settings className="mr-1.5 h-4 w-4" />
            Manage
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
