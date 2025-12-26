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
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-800">Distribution & Inquiries</h1>
                        <p className="text-sm text-slate-500 font-medium">Manage your sales channels and guest inquiries.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Dialog open={isAddChannelOpen} onOpenChange={setIsAddChannelOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl h-10 font-bold text-sm gap-2 shadow-sm">
                                    <Plus className="h-4 w-4" /> Add Channel
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] rounded-2xl">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-bold">Connect New Channel</DialogTitle>
                                    <DialogDescription className="font-medium text-slate-500">
                                        Integrate a new booking source with your property.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="channel_name" className="text-xs font-bold uppercase tracking-wider text-slate-500">Channel Name</Label>
                                        <Input
                                            id="channel_name"
                                            placeholder="e.g. Booking.com, WhatsApp Direct"
                                            className="rounded-xl border-slate-200"
                                            value={newChannel.channel_name}
                                            onChange={(e) => setNewChannel({ ...newChannel, channel_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="channel_type" className="text-xs font-bold uppercase tracking-wider text-slate-500">Type</Label>
                                        <Select
                                            value={newChannel.channel_type}
                                            onValueChange={(v) => setNewChannel({ ...newChannel, channel_type: v })}
                                        >
                                            <SelectTrigger className="rounded-xl border-slate-200">
                                                <SelectValue placeholder="Select Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="OTA">OTA (Online Travel Agency)</SelectItem>
                                                <SelectItem value="Messaging">Social / Messaging</SelectItem>
                                                <SelectItem value="Website">Direct Website</SelectItem>
                                                <SelectItem value="Offline">Offline / Walk-in</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="prop" className="text-xs font-bold uppercase tracking-wider text-slate-500">Link to Property</Label>
                                        <Select
                                            value={newChannel.property}
                                            onValueChange={(v) => setNewChannel({ ...newChannel, property: v })}
                                        >
                                            <SelectTrigger className="rounded-xl border-slate-200">
                                                <SelectValue placeholder="All Properties (Global)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">All Properties (Global)</SelectItem>
                                                {properties?.map(p => (
                                                    <SelectItem key={p.name} value={p.name}>{p.property_name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="comm" className="text-xs font-bold uppercase tracking-wider text-slate-500">Commission %</Label>
                                        <Input
                                            id="comm"
                                            type="number"
                                            placeholder="15"
                                            className="rounded-xl border-slate-200"
                                            value={newChannel.commission_percentage}
                                            onChange={(e) => setNewChannel({ ...newChannel, commission_percentage: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        onClick={handleAddChannel}
                                        disabled={creating}
                                        className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-10 font-bold"
                                    >
                                        {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Connect"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="bg-white/50 backdrop-blur-sm p-1 rounded-2xl h-12 border border-slate-200 shadow-sm">
                        <TabsTrigger value="channels" className="rounded-xl px-6 font-bold text-xs uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Active Channels</TabsTrigger>
                        <TabsTrigger value="inquiries" className="rounded-xl px-6 font-bold text-xs uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Booking Inquiries</TabsTrigger>
                        <TabsTrigger value="settings" className="rounded-xl px-6 font-bold text-xs uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Integrations</TabsTrigger>
                    </TabsList>

                    <TabsContent value="channels" className="mt-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {channels?.map((channel) => (
                                <Card key={channel.name} className="border-none shadow-sm rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 group bg-white border border-slate-100">
                                    <CardHeader className="flex flex-row items-center justify-between pb-4 bg-slate-50/30 px-6 pt-6">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-slate-100 group-hover:rotate-6 transition-transform">
                                                {getChannelIcon(channel.channel_type)}
                                            </div>
                                            <div className="space-y-0.5">
                                                <CardTitle className="text-sm font-black text-slate-800">{channel.channel_name}</CardTitle>
                                                <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{channel.channel_type}</CardDescription>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={cn(
                                                "h-8 w-8 rounded-full transition-colors",
                                                channel.is_active ? "text-green-500 hover:bg-green-50" : "text-slate-300 hover:bg-slate-100"
                                            )}
                                            onClick={() => toggleChannel(channel.name, channel.is_active)}
                                        >
                                            <Power className="h-4 w-4" />
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Property</span>
                                                    <p className="text-xs font-bold text-slate-700 truncate">{channel.property || "Global Connect"}</p>
                                                </div>
                                                <div className="space-y-1 text-right">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Share</span>
                                                    <p className="text-xs font-bold text-slate-700">{channel.commission_percentage}% Fee</p>
                                                </div>
                                            </div>

                                            <div className="pt-4 flex gap-2">
                                                <Button variant="outline" size="sm" className="flex-1 text-[10px] font-black uppercase rounded-xl border-slate-200 h-9 group-hover:border-primary/50 group-hover:text-primary transition-all">
                                                    Sync Settings
                                                </Button>
                                                <Button variant="secondary" size="icon" className="h-9 w-9 rounded-xl bg-slate-100 text-slate-600 hover:bg-primary/10 hover:text-primary transition-colors">
                                                    <Settings className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                    {!channel.is_active && (
                                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                                            <Badge variant="secondary" className="bg-slate-800 text-white font-black uppercase text-[10px] px-4 py-1.5 rounded-full shadow-lg">Disconnected</Badge>
                                        </div>
                                    )}
                                </Card>
                            ))}
                            {channelsLoading && <div className="p-12 flex justify-center col-span-full"><Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" /></div>}
                        </div>
                    </TabsContent>

                    <TabsContent value="inquiries" className="mt-8">
                        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white border border-slate-100">
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader className="bg-slate-50/50">
                                        <TableRow className="hover:bg-transparent border-slate-100">
                                            <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 p-6">Guest / Channel</TableHead>
                                            <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 p-6">Booking Interest</TableHead>
                                            <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 p-6">Status</TableHead>
                                            <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 p-6 text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {inquiries?.map((iq) => (
                                            <TableRow key={iq.name} className="hover:bg-slate-50/50 transition-all border-slate-50 group">
                                                <TableCell className="p-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                                            {iq.guest_name.charAt(0)}
                                                        </div>
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="font-bold text-sm text-slate-800">{iq.guest_name}</span>
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="outline" className="text-[8px] font-black uppercase px-1.5 py-0 border-slate-200 text-slate-400 tracking-tighter shadow-none">
                                                                    {iq.source_channel}
                                                                </Badge>
                                                                <span className="text-[10px] font-bold text-slate-300">#{(iq.name || '').split('-').pop()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="p-6">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2 text-slate-600">
                                                            <Calendar className="h-3.5 w-3.5" />
                                                            <span className="text-xs font-bold">
                                                                {iq.check_in_date ? new Date(iq.check_in_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "--"}
                                                                {" → "}
                                                                {iq.check_out_date ? new Date(iq.check_out_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "--"}
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-5">
                                                            {iq.number_of_guests || 1} Guests
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="p-6">
                                                    <Badge className={cn(
                                                        "rounded-lg text-[9px] font-black uppercase tracking-widest px-2.5 py-1 border-none shadow-sm",
                                                        iq.inquiry_status === "New" ? "bg-blue-100 text-blue-600" :
                                                            iq.inquiry_status === "Booked" ? "bg-green-100 text-green-600" :
                                                                iq.inquiry_status === "Not Interested" ? "bg-slate-100 text-slate-400" : "bg-amber-100 text-amber-600"
                                                    )}>
                                                        {iq.inquiry_status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="p-6 text-right">
                                                    <div className="flex justify-end gap-2 translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                                                        <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl text-[10px] font-black uppercase border-slate-200 text-slate-600 hover:bg-primary/5 hover:text-primary hover:border-primary/30">
                                                            Process <ArrowUpRight className="ml-2 h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-green-50 hover:text-green-600">
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
                                    <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-300">Fetching Inquiries</p>
                                </div>}
                                {inquiries?.length === 0 && !inquiriesLoading && <div className="p-20 text-center flex flex-col items-center gap-3">
                                    <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                                        <Mail className="h-8 w-8 text-slate-200" />
                                    </div>
                                    <p className="text-slate-400 font-bold text-sm tracking-tight">No inquiries to process yet.</p>
                                    <p className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">Inquiries from WhatsApp and Website will appear here</p>
                                </div>}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="settings" className="mt-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card className="border-none shadow-sm rounded-[2.5rem] bg-white border border-slate-100 overflow-hidden flex flex-col">
                                <CardHeader className="p-8 pb-4">
                                    <div className="h-16 w-16 bg-green-50 rounded-[1.5rem] flex items-center justify-center mb-6">
                                        <MessageSquare className="h-8 w-8 text-green-500" />
                                    </div>
                                    <CardTitle className="text-xl font-black">WhatsApp Business (Via Raven)</CardTitle>
                                    <CardDescription className="text-sm font-medium leading-relaxed mt-2 italic text-slate-500">
                                        Enable direct booking inquiries and confirmation alerts via WhatsApp.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-8 pt-0 flex-1 flex flex-col justify-between">
                                    <ul className="space-y-4 mb-8">
                                        {["Real-time reservation status", "Automatic check-in instructions", "Guest communication dashboard"].map(f => (
                                            <li key={f} className="flex items-center gap-3 text-xs font-bold text-slate-600">
                                                <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                    <Check className="h-3 w-3" />
                                                </div>
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                    <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-2xl h-12 font-black text-xs uppercase tracking-widest shadow-lg transition-all hover:scale-[1.02]">
                                        Configure Raven <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm rounded-[2.5rem] bg-white border border-slate-100 overflow-hidden flex flex-col">
                                <CardHeader className="p-8 pb-4">
                                    <div className="h-16 w-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center mb-6">
                                        <Globe className="h-8 w-8 text-blue-500" />
                                    </div>
                                    <CardTitle className="text-xl font-black">Global OTA Sync (Channex)</CardTitle>
                                    <CardDescription className="text-sm font-medium leading-relaxed mt-2 italic text-slate-500">
                                        Push inventory and rates to 200+ channels including Booking, Expedia, and Airbnb.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-8 pt-0 flex-1 flex flex-col justify-between">
                                    <ul className="space-y-4 mb-8">
                                        {["2-way calendar synchronization", "Centralized rate management", "No more double bookings"].map(f => (
                                            <li key={f} className="flex items-center gap-3 text-xs font-bold text-slate-600">
                                                <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                    <Check className="h-3 w-3" />
                                                </div>
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                    <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-2xl h-12 font-black text-xs uppercase tracking-widest shadow-lg transition-all hover:scale-[1.02]">
                                        Connect Channex <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    )
}
