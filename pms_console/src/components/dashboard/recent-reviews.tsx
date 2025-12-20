import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

interface Review {
  id: string
  guestName: string
  property: string
  rating: number
  comment: string
  date: string
}

const reviews: Review[] = [
  {
    id: "1",
    guestName: "Ananya Gupta",
    property: "Ocean View Villa",
    rating: 5,
    comment: "Amazing property with stunning views! The host was very helpful.",
    date: "Dec 15, 2025",
  },
  {
    id: "2",
    guestName: "Rohan Mehta",
    property: "Beach House Resort",
    rating: 4,
    comment: "Great location and amenities. Would definitely visit again.",
    date: "Dec 14, 2025",
  },
  {
    id: "3",
    guestName: "Kavitha Rajan",
    property: "Heritage Homestay",
    rating: 5,
    comment: "Authentic experience with excellent hospitality. Loved every moment!",
    date: "Dec 12, 2025",
  },
]

export function RecentReviews() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Reviews</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="space-y-2 border-b pb-4 last:border-0 last:pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={`/.jpg?height=32&width=32&query=${review.guestName} portrait`}
                  />
                  <AvatarFallback>
                    {review.guestName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{review.guestName}</p>
                  <p className="text-xs text-muted-foreground">{review.property}</p>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{review.comment}</p>
            <p className="text-xs text-muted-foreground">{review.date}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
