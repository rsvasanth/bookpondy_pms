import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const members = [
    {
        name: "Toby Belhome",
        email: "contact@bundui.io",
        role: "Viewer",
        avatar: "/placeholder-user.jpg",
        initials: "TB"
    },
    {
        name: "Jackson Lee",
        email: "pms@example.com",
        role: "Developer",
        avatar: "/placeholder-user.jpg",
        initials: "JL"
    },
    {
        name: "Holly Gray",
        email: "holly@site.com",
        role: "Viewer",
        avatar: "/placeholder-user.jpg",
        initials: "HG"
    }
]

export function TeamMembers() {
    return (
        <Card className="shadow-sm border-none bg-background/50 backdrop-blur-sm">
            <CardHeader className="pb-3 px-6 pt-6">
                <CardTitle className="text-sm font-semibold tracking-tight">Team Members</CardTitle>
                <CardDescription className="text-xs">Invite your team members to collaborate.</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
                <div className="space-y-5">
                    {members.map((member) => (
                        <div key={member.email} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 border border-border transition-transform group-hover:scale-105">
                                    <AvatarImage src={member.avatar} />
                                    <AvatarFallback className="text-[10px] font-bold">{member.initials}</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-0.5">
                                    <p className="text-sm font-medium leading-none">{member.name}</p>
                                    <p className="text-[11px] text-muted-foreground">{member.email}</p>
                                </div>
                            </div>
                            <Badge variant="outline" className="text-[10px] font-medium py-0 px-2 h-5 rounded-md bg-muted/50 border-none">
                                {member.role}
                            </Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
