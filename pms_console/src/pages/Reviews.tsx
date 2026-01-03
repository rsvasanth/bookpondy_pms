import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useLocalDocList } from "@/hooks/use-local-data"
import {
    Star,
    MessageCircle,
    Calendar,
    User,
    ArrowUpRight,
    Search,
    Filter,
    TrendingUp
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

export default function ReviewsPage() {
    const { data: reviews, isLoading } = useLocalDocList("Review", {
        sort: [{ sync_date: 'desc' }]
    })

    const avgRating = useMemo(() => {
        if (!reviews?.length) return 0
        return reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
    }, [reviews])

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                        key={s}
                        className={cn(
                            "h-3 w-3",
                            s <= rating ? "fill-amber-400 text-amber-400" : "text-muted border-muted"
                        )}
                    />
                ))}
            </div>
        )
    }

    return (
        <>
            <div className="flex flex-col gap-8 pb-12">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">Guest Feedback</h1>
                        <p className="text-sm text-muted-foreground">
                            Monitor and respond to marketplace reviews and guest experience.
                        </p>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border border-border shadow-sm rounded-lg bg-card">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground">Total Reviews</span>
                                <p className="text-2xl font-bold">{reviews?.length || 0}</p>
                            </div>
                            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary border border-primary/20">
                                <MessageCircle className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border border-border shadow-sm rounded-lg bg-card">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground">Average Rating</span>
                                <div className="flex items-center gap-3">
                                    <p className="text-2xl font-bold">{avgRating.toFixed(1)}</p>
                                    <div className="flex flex-col gap-0.5">
                                        {renderStars(Math.round(avgRating))}
                                        <span className="text-xs font-medium text-success">Top 5% Property</span>
                                    </div>
                                </div>
                            </div>
                            <div className="h-12 w-12 bg-warning/10 rounded-lg flex items-center justify-center text-warning border border-warning/20">
                                <Star className="h-6 w-6 fill-warning" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border border-border shadow-sm rounded-lg bg-card">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground">Sentiment Score</span>
                                <p className="text-2xl font-bold">92%</p>
                            </div>
                            <div className="h-12 w-12 bg-success/10 rounded-lg flex items-center justify-center text-success border border-success/20">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 px-2">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search in reviews..."
                            className="pl-10 h-10"
                        />
                    </div>
                    <Button variant="outline" size="sm" className="h-10 gap-2">
                        <Filter className="h-4 w-4" /> Filter
                    </Button>
                </div>

                {/* Reviews List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reviews?.map((review) => (
                        <Card key={review.name} className="border border-border shadow-sm rounded-lg overflow-hidden flex flex-col transition-all hover:shadow-md bg-card">
                            <CardHeader className="bg-muted/30 px-6 py-4 flex flex-row items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-muted border border-border rounded-lg flex items-center justify-center shadow-sm">
                                        <User className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-sm">{review.guest}</span>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                            <Calendar className="h-3 w-3" /> {review.sync_date}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-sm font-semibold">{review.rating.toFixed(1)}</span>
                                        {renderStars(review.rating)}
                                    </div>
                                    <Badge variant="secondary" className="text-[10px] font-medium">
                                        Marketplace
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <p className="text-xs font-medium text-foreground italic leading-relaxed">
                                    "{review.comment}"
                                </p>
                                <div className="pt-4 border-t flex items-center justify-between">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[10px] font-medium text-muted-foreground">Stay Item</span>
                                        <span className="text-xs font-medium">{review.reservation || "Verified Stay"}</span>
                                    </div>
                                    <Button size="sm" variant="ghost" className="text-xs font-medium gap-1.5">
                                        Response <ArrowUpRight className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {(!reviews || reviews.length === 0) && (
                        <div className="col-span-full py-24 flex flex-col items-center justify-center text-center space-y-4 bg-muted/20 border border-dashed border-border rounded-2xl">
                            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center text-muted-foreground/30 border border-border">
                                <MessageCircle className="h-8 w-8" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-semibold text-foreground">No reviews yet</p>
                                <p className="text-xs text-muted-foreground font-medium max-w-[200px]">
                                    Marketplace reviews will automatically appear here once guests check out.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
