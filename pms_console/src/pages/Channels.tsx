import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useFrappeGetDocList, useFrappeUpdateDoc, useFrappeCreateDoc } from "frappe-react-sdk"
import {
    MessageSquare,
    Globe,
    Smartphone,
    Plus,
    Settings,
    Zap,
    Phone,
    ArrowUpRight,
    Loader2,
    Calendar,
    Mail,
    ChevronRight,
    Power,
    Check
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ChannelsPage() {
    const [activeTab, setActiveTab] = useState("channels")
    const [isAddChannelOpen, setIsAddChannelOpen] = useState(false)
    const [newChannel, setNewChannel] = useState({
        channel_name: "",
        channel_type: "OTA",
        property: "",
        commission_percentage: 0
    })

    const { data: properties } = useFrappeGetDocList("Property", {
        fields: ["name", "property_name"]
    })

    const { data: channels, isLoading: channelsLoading, mutate: mutateChannels } = useFrappeGetDocList("Channel Config", {
        fields: ["name", "channel_name", "channel_type", "is_active", "property", "commission_percentage"]
    })

    const { data: inquiries, isLoading: inquiriesLoading } = useFrappeGetDocList("Booking Inquiry", {
        fields: ["name", "guest_name", "inquiry_status", "inquiry_date", "source_channel", "guest_phone", "guest_email", "conversion_status", "check_in_date", "check_out_date", "number_of_guests"],
        orderBy: { field: "creation", order: "desc" }
    })

    const { updateDoc } = useFrappeUpdateDoc()
    const { createDoc, loading: creating } = useFrappeCreateDoc()

    const toggleChannel = async (name: string, currentStatus: number) => {
        try {
            await updateDoc("Channel Config", name, { is_active: currentStatus ? 0 : 1 })
            toast.success(`Channel ${currentStatus ? 'deactivated' : 'activated'}`)
            mutateChannels()
        } catch (e) {
            toast.error("Failed to update channel status")
        }
    }

    const handleAddChannel = async () => {
        if (!newChannel.channel_name || !newChannel.channel_type) {
            toast.error("Please fill in required fields")
            return
        }

        try {
            await createDoc("Channel Config", {
                ...newChannel,
                is_active: 1
            })
            toast.success("Channel added successfully")
            setIsAddChannelOpen(false)
            setNewChannel({
                channel_name: "",
                channel_type: "OTA",
                property: "",
                commission_percentage: 0
            })
            mutateChannels()
        } catch (e) {
            toast.error("Failed to add channel")
        }
    }

    const getChannelIcon = (type: string) => {
        switch (type) {
            case "Messaging": return <MessageSquare className="h-5 w-5 text-green-500" />
            case "OTA": return <Globe className="h-5 w-5 text-blue-500" />
            case "Website": return <Zap className="h-5 w-5 text-amber-500" />
            default: return <Smartphone className="h-5 w-5 text-slate-500" />
        }
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">Distribution & Inquiries</h1>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Manage your sales channels and guest inquiries.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Dialog open={isAddChannelOpen} onOpenChange={setIsAddChannelOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-10 px-6 font-bold text-[10px] uppercase tracking-widest gap-2 shadow-sm">
                                    <Plus className="h-4 w-4" /> Add Channel
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] rounded-lg border-border">
                                <DialogHeader>
                                    <DialogTitle className="text-lg font-bold uppercase tracking-tight">Connect New Channel</DialogTitle>
                                    <DialogDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                        Integrate a new booking source with your property.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="channel_name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Channel Name</Label>
                                        <Input
                                            id="channel_name"
                                            placeholder="e.g. Booking.com"
                                            className="rounded-lg border-border bg-muted/30 focus-visible:ring-primary"
                                            value={newChannel.channel_name}
                                            onChange={(e) => setNewChannel({ ...newChannel, channel_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="channel_type" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Type</Label>
                                        <Select
                                            value={newChannel.channel_type}
                                            onValueChange={(v) => setNewChannel({ ...newChannel, channel_type: v })}
                                        >
                                            <SelectTrigger className="rounded-lg border-border bg-muted/30 focus:ring-primary">
                                                <SelectValue placeholder="Select Type" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-lg border-border">
                                                <SelectItem value="OTA">OTA (Online Travel Agency)</SelectItem>
                                                <SelectItem value="Messaging">Social / Messaging</SelectItem>
                                                <SelectItem value="Website">Direct Website</SelectItem>
                                                <SelectItem value="Offline">Offline / Walk-in</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="prop" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Link to Property</Label>
                                        <Select
                                            value={newChannel.property}
                                            onValueChange={(v) => setNewChannel({ ...newChannel, property: v })}
                                        >
                                            <SelectTrigger className="rounded-lg border-border bg-muted/30 focus:ring-primary">
                                                <SelectValue placeholder="All Properties (Global)" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-lg border-border">
                                                <SelectItem value="">All Properties (Global)</SelectItem>
                                                {properties?.map(p => (
                                                    <SelectItem key={p.name} value={p.name}>{p.property_name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="comm" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Commission %</Label>
                                        <Input
                                            id="comm"
                                            type="number"
                                            placeholder="15"
                                            className="rounded-lg border-border bg-muted/30 focus-visible:ring-primary"
                                            value={newChannel.commission_percentage}
                                            onChange={(e) => setNewChannel({ ...newChannel, commission_percentage: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        onClick={handleAddChannel}
                                        disabled={creating}
                                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-11 font-bold text-[10px] uppercase tracking-widest"
                                    >
                                        {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Connect Channel"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="bg-muted/50 p-1.5 rounded-lg h-12 border border-border shadow-none">
                        <TabsTrigger value="channels" className="rounded-md px-6 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Active Channels</TabsTrigger>
                        <TabsTrigger value="inquiries" className="rounded-md px-6 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Booking Inquiries</TabsTrigger>
                        <TabsTrigger value="settings" className="rounded-md px-6 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Integrations</TabsTrigger>
                    </TabsList>

                    <TabsContent value="channels" className="mt-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {channels?.map((channel) => (
                                <Card key={channel.name} className="border border-border shadow-sm rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 group bg-card relative">
                                    <CardHeader className="flex flex-row items-center justify-between pb-4 bg-muted/30 px-6 pt-6">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-card p-3 rounded-lg shadow-sm border border-border group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                {getChannelIcon(channel.channel_type)}
                                            </div>
                                            <div className="space-y-1">
                                                <CardTitle className="text-sm font-bold text-foreground uppercase tracking-tight">{channel.channel_name}</CardTitle>
                                                <CardDescription className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{channel.channel_type}</CardDescription>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={cn(
                                                "h-9 w-9 rounded-lg transition-colors",
                                                channel.is_active ? "text-emerald-500 hover:bg-emerald-50" : "text-muted-foreground hover:bg-muted"
                                            )}
                                            onClick={() => toggleChannel(channel.name, channel.is_active)}
                                        >
                                            <Power className="h-4 w-4" />
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Property</span>
                                                    <p className="text-xs font-bold text-foreground truncate uppercase">{channel.property || "Global Connect"}</p>
                                                </div>
                                                <div className="space-y-1 text-right">
                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Fee</span>
                                                    <p className="text-xs font-bold text-foreground uppercase">{channel.commission_percentage}% Share</p>
                                                </div>
                                            </div>

                                            <div className="pt-2 flex gap-3">
                                                <Button variant="outline" size="sm" className="flex-1 text-[10px] font-bold uppercase tracking-widest rounded-lg border-border h-10 hover:bg-muted">
                                                    Sync Settings
                                                </Button>
                                                <Button variant="secondary" size="icon" className="h-10 w-10 rounded-lg bg-muted text-foreground hover:bg-primary/10 hover:text-primary transition-colors border border-border">
                                                    <Settings className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                    {!channel.is_active && (
                                        <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] z-10 flex items-center justify-center p-6 text-center">
                                            <Badge variant="secondary" className="bg-foreground text-background font-bold uppercase text-[10px] px-5 py-2 rounded-sm shadow-md tracking-widest">Channel Disconnected</Badge>
                                        </div>
                                    )}
                                </Card>
                            ))}
                            {channelsLoading && <div className="p-12 flex justify-center col-span-full"><Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" /></div>}
                        </div>
                    </TabsContent>

                    <TabsContent value="inquiries" className="mt-8">
                        <Card className="border border-border shadow-sm rounded-lg overflow-hidden bg-card">
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow className="hover:bg-transparent border-border">
                                            <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground p-6 border-b border-border">Guest / Channel</TableHead>
                                            <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground p-6 border-b border-border">Interest</TableHead>
                                            <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground p-6 border-b border-border">Status</TableHead>
                                            <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground p-6 border-b border-border text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-border">
                                        {inquiries?.map((iq) => (
                                            <TableRow key={iq.name} className="hover:bg-muted/30 transition-all border-none group">
                                                <TableCell className="p-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center font-bold text-muted-foreground transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                                                            {iq.guest_name.charAt(0)}
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <span className="font-bold text-sm text-foreground uppercase tracking-tight">{iq.guest_name}</span>
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="outline" className="text-[8px] font-bold uppercase px-2 py-0 border-border text-muted-foreground tracking-widest shadow-none bg-muted/50">
                                                                    {iq.source_channel}
                                                                </Badge>
                                                                <span className="text-[9px] font-bold text-muted-foreground uppercase">ID: {(iq.name || '').split('-').pop()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="p-6">
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="flex items-center gap-2 text-foreground font-bold">
                                                            <Calendar className="h-3.5 w-3.5 text-primary" />
                                                            <span className="text-xs uppercase tracking-widest">
                                                                {iq.check_in_date ? new Date(iq.check_in_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "TBD"}
                                                                {" - "}
                                                                {iq.check_out_date ? new Date(iq.check_out_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "TBD"}
                                                            </span>
                                                        </div>
                                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                                            {iq.number_of_guests || 1} Guests Traveling
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="p-6">
                                                    <Badge className={cn(
                                                        "rounded-sm text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 border-none shadow-none",
                                                        iq.inquiry_status === "New" ? "bg-blue-500/10 text-blue-500" :
                                                            iq.inquiry_status === "Booked" ? "bg-emerald-500/10 text-emerald-500" :
                                                                iq.inquiry_status === "Not Interested" ? "bg-muted text-muted-foreground" : "bg-amber-500/10 text-amber-500"
                                                    )}>
                                                        {iq.inquiry_status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="p-6 text-right">
                                                    <div className="flex justify-end gap-2 transition-all">
                                                        <Button variant="outline" size="sm" className="h-9 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest border-border text-foreground hover:bg-muted">
                                                            Process <ArrowUpRight className="ml-2 h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-emerald-50 hover:text-emerald-500 border border-transparent">
                                                            <Phone className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {inquiriesLoading && <div className="p-20 flex flex-col items-center gap-4">
                                    <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
                                    <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground">Fetching Inquiries</p>
                                </div>}
                                {inquiries?.length === 0 && !inquiriesLoading && <div className="p-20 text-center flex flex-col items-center gap-3">
                                    <div className="h-16 w-16 bg-muted rounded-lg flex items-center justify-center mb-2">
                                        <Mail className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <p className="text-foreground font-bold text-sm tracking-tight">No inquiries to process yet.</p>
                                    <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Inquiries from WhatsApp and Website will appear here</p>
                                </div>}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="settings" className="mt-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card className="border border-border shadow-sm rounded-lg bg-card overflow-hidden flex flex-col">
                                <CardHeader className="p-8 pb-4">
                                    <div className="h-16 w-16 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-6 border border-emerald-500/20">
                                        <MessageSquare className="h-8 w-8 text-emerald-500" />
                                    </div>
                                    <CardTitle className="text-xl font-bold uppercase tracking-tight">WhatsApp Business</CardTitle>
                                    <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-2">
                                        Direct inquiries via Raven Integration
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-8 pt-6 flex-1 flex flex-col justify-between">
                                    <ul className="space-y-4 mb-10">
                                        {["Real-time reservation status", "Automatic check-in instructions", "Guest communication dashboard"].map(f => (
                                            <li key={f} className="flex items-center gap-3 text-xs font-bold text-foreground uppercase tracking-tight">
                                                <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                    <Check className="h-3 w-3" />
                                                </div>
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-12 font-bold text-xs uppercase tracking-[0.2em] shadow-sm transition-all">
                                        Configure Raven <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="border border-border shadow-sm rounded-lg bg-card overflow-hidden flex flex-col">
                                <CardHeader className="p-8 pb-4">
                                    <div className="h-16 w-16 bg-primary/10 rounded-lg flex items-center justify-center mb-6 border border-primary/20">
                                        <Globe className="h-8 w-8 text-primary" />
                                    </div>
                                    <CardTitle className="text-xl font-bold uppercase tracking-tight">BookPondy Marketplace</CardTitle>
                                    <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-2">
                                        Inventory & Bookings Sync Engine
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-8 pt-6 flex-1 flex flex-col justify-between">
                                    <div className="space-y-6 mb-8">
                                        <div className="p-4 bg-muted/30 rounded-lg border border-border">
                                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Active Connection</span>
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span className="text-xs font-black uppercase tracking-tight">Connected to bp-market-v1</span>
                                                </div>
                                                <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-2 py-0 text-[8px] font-bold uppercase tracking-widest">Live</Badge>
                                            </div>
                                        </div>
                                        <ul className="space-y-4">
                                            {["2-way calendar synchronization", "Centralized rate management", "Automated review ingestion"].map(f => (
                                                <li key={f} className="flex items-center gap-3 text-xs font-bold text-foreground uppercase tracking-tight">
                                                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                        <Check className="h-3 w-3" />
                                                    </div>
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-12 font-bold text-[10px] uppercase tracking-[0.2em] shadow-sm transition-all"
                                            onClick={() => {
                                                toast.promise(
                                                    new Promise((resolve) => setTimeout(resolve, 2000)),
                                                    {
                                                        loading: 'Syncing Marketplace Availability...',
                                                        success: 'Inventory updated successfully!',
                                                        error: 'Failed to sync with marketplace.',
                                                    }
                                                );
                                            }}
                                        >
                                            <Zap className="mr-2 h-4 w-4" /> Force Sync Now
                                        </Button>
                                        <Button variant="outline" size="icon" className="h-12 w-12 rounded-lg border-border bg-card">
                                            <Settings className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    )
}
