import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useFrappeGetDocList, useFrappeCreateDoc } from "frappe-react-sdk"
import {
    Package,
    Boxes,
    History,
    Plus,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter,
    MoreHorizontal,
    Monitor,
    Smartphone,
    Tool,
    Wrench,
    Tag,
    Clock,
    FileText,
    TrendingDown,
    TrendingUp,
    Table as TableIcon
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

export default function InventoryPage() {
    const [activeTab, setActiveTab] = useState("items")
    const [searchQuery, setSearchQuery] = useState("")

    // Dialog States
    const [isAddItemOpen, setIsAddItemOpen] = useState(false)
    const [isStockEntryOpen, setIsStockEntryOpen] = useState(false)
    const [selectedItemForStock, setSelectedItemForStock] = useState<string | null>(null)

    // Data Fetching
    const { data: items, isLoading: itemsLoading, mutate: mutateItems } = useFrappeGetDocList("PMS Item", {
        fields: ["name", "item_code", "item_name", "category", "unit", "current_stock", "reorder_level", "valuation_rate"],
        orderBy: { field: "item_name", order: "asc" }
    })

    const { data: assets, isLoading: assetsLoading } = useFrappeGetDocList("PMS Asset", {
        fields: ["name", "asset_name", "item_link", "serial_number", "status", "location", "purchase_date"],
        orderBy: { field: "creation", order: "desc" }
    })

    const { data: stockEntries, isLoading: historyLoading, mutate: mutateHistory } = useFrappeGetDocList("PMS Stock Entry", {
        fields: ["name", "item", "item_code", "entry_type", "quantity", "date", "reference_name", "notes"],
        orderBy: { field: "creation", order: "desc" },
        limit: 50
    })

    const { createDoc: createStockEntry, loading: entryLoading } = useFrappeCreateDoc()
    const { createDoc: createItem, loading: itemCreating } = useFrappeCreateDoc()

    // Form States
    const [newItem, setNewItem] = useState({
        item_code: "",
        item_name: "",
        category: "Consumable",
        unit: "Pcs",
        reorder_level: 0,
        valuation_rate: 0
    })

    const [stockEntryForm, setStockEntryForm] = useState({
        item: "",
        entry_type: "Inward",
        quantity: 0,
        notes: ""
    })

    // Handlers
    const handleAddItem = async () => {
        if (!newItem.item_code || !newItem.item_name) {
            toast.error("Please fill in required fields")
            return
        }
        try {
            await createItem("PMS Item", newItem)
            toast.success("Item created successfully")
            setIsAddItemOpen(false)
            mutateItems()
        } catch (e) {
            toast.error("Failed to create item")
        }
    }

    const handleStockEntry = async () => {
        if (!stockEntryForm.item || !stockEntryForm.quantity) {
            toast.error("Please select item and enter quantity")
            return
        }
        try {
            await createStockEntry("PMS Stock Entry", {
                ...stockEntryForm,
                date: new Date().toISOString().split('T')[0]
            })
            toast.success("Stock updated successfully")
            setIsStockEntryOpen(false)
            mutateItems()
            mutateHistory()
        } catch (e) {
            toast.error("Failed to update stock")
        }
    }

    // Stats
    const totalItems = items?.length || 0
    const lowStockItems = items?.filter(i => (i.current_stock || 0) <= (i.reorder_level || 0)).length || 0
    const totalAssetValue = items?.reduce((acc, i) => acc + ((i.current_stock || 0) * (i.valuation_rate || 0)), 0) || 0

    const filteredItems = items?.filter(i =>
        i.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.item_code.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-xl font-bold tracking-tight text-foreground uppercase">Inventory & Assets</h1>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Track supplies, maintenance parts, and fixed assets.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="h-9 px-4 rounded-lg font-bold text-[10px] uppercase tracking-widest gap-2">
                                <Plus className="h-3.5 w-3.5" /> Define Item
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle className="text-sm font-bold uppercase tracking-tight">New Inventory Item</DialogTitle>
                                <DialogDescription className="text-[10px] uppercase tracking-widest">Add a new consumable or part to the registry.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Item Code</Label>
                                        <Input value={newItem.item_code} onChange={e => setNewItem({ ...newItem, item_code: e.target.value })} placeholder="e.g. LNN-SQ" className="h-9 rounded-md text-xs font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Category</Label>
                                        <Select value={newItem.category} onValueChange={v => setNewItem({ ...newItem, category: v })}>
                                            <SelectTrigger className="h-9 rounded-md text-xs font-bold">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Consumable">Consumable</SelectItem>
                                                <SelectItem value="Part">Maintenance Part</SelectItem>
                                                <SelectItem value="Asset">Fixed Asset</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Item Name</Label>
                                    <Input value={newItem.item_name} onChange={e => setNewItem({ ...newItem, item_name: e.target.value })} placeholder="e.g. Linen Bed Sheet - Queen" className="h-9 rounded-md text-xs font-bold" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Unit</Label>
                                        <Select value={newItem.unit} onValueChange={v => setNewItem({ ...newItem, unit: v })}>
                                            <SelectTrigger className="h-9 rounded-md text-xs font-bold">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Pcs">Pieces</SelectItem>
                                                <SelectItem value="Kg">Kilograms</SelectItem>
                                                <SelectItem value="Litre">Litres</SelectItem>
                                                <SelectItem value="Box">Boxes</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reorder Level</Label>
                                        <Input type="number" value={newItem.reorder_level} onChange={e => setNewItem({ ...newItem, reorder_level: parseFloat(e.target.value) })} className="h-9 rounded-md text-xs font-bold" />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleAddItem} disabled={itemCreating} className="w-full h-10 font-bold text-[10px] uppercase tracking-widest">Save Item</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isStockEntryOpen} onOpenChange={setIsStockEntryOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-9 px-4 rounded-lg font-bold text-[10px] uppercase tracking-widest gap-2 bg-primary text-primary-foreground">
                                <Boxes className="h-3.5 w-3.5" /> Adjust Stock
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle className="text-sm font-bold uppercase tracking-tight">Stock Movement</DialogTitle>
                                <DialogDescription className="text-[10px] uppercase tracking-widest">Record an inward or outward stock movement.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Select Item</Label>
                                    <Select value={stockEntryForm.item} onValueChange={v => setStockEntryForm({ ...stockEntryForm, item: v })}>
                                        <SelectTrigger className="h-9 rounded-md text-xs font-bold">
                                            <SelectValue placeholder="Search Item..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {items?.map(i => (
                                                <SelectItem key={i.name} value={i.name}>{i.item_name} ({i.item_code})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Type</Label>
                                        <Select value={stockEntryForm.entry_type} onValueChange={v => setStockEntryForm({ ...stockEntryForm, entry_type: v })}>
                                            <SelectTrigger className="h-9 rounded-md text-xs font-bold">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Inward">Stock In (Purchase/Return)</SelectItem>
                                                <SelectItem value="Outward">Stock Out (Usage/Waste)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Quantity</Label>
                                        <Input type="number" value={stockEntryForm.quantity} onChange={e => setStockEntryForm({ ...stockEntryForm, quantity: parseFloat(e.target.value) })} className="h-9 rounded-md text-xs font-bold" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Notes</Label>
                                    <Input value={stockEntryForm.notes} onChange={e => setStockEntryForm({ ...stockEntryForm, notes: e.target.value })} placeholder="Reason for adjustment" className="h-9 rounded-md text-xs font-bold" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleStockEntry} disabled={entryLoading} className="w-full h-10 font-bold text-[10px] uppercase tracking-widest">Submit Entry</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-border shadow-none bg-card">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tracked Items</p>
                            <p className="text-2xl font-black text-foreground">{totalItems}</p>
                        </div>
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <Package className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border shadow-none bg-card">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Low Stock Alerts</p>
                            <p className="text-2xl font-black text-amber-500">{lowStockItems}</p>
                        </div>
                        <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border shadow-none bg-card">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Inventory Valuation</p>
                            <p className="text-2xl font-black text-foreground">₹{totalAssetValue.toLocaleString()}</p>
                        </div>
                        <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-muted/50 p-1 rounded-md h-10 border border-border">
                    <TabsTrigger value="items" className="text-[10px] font-bold uppercase tracking-widest px-6 h-8 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Stock Registry</TabsTrigger>
                    <TabsTrigger value="assets" className="text-[10px] font-bold uppercase tracking-widest px-6 h-8 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Fixed Assets</TabsTrigger>
                    <TabsTrigger value="history" className="text-[10px] font-bold uppercase tracking-widest px-6 h-8 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Movement History</TabsTrigger>
                </TabsList>

                <TabsContent value="items" className="space-y-4">
                    <Card className="border-border shadow-none bg-card overflow-hidden">
                        <CardHeader className="px-4 py-3 bg-muted/30 border-b border-border space-y-0 flex flex-row items-center justify-between">
                            <div className="relative w-full max-w-sm">
                                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground/50" />
                                <Input
                                    placeholder="Search by name or code..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="pl-8 h-8 rounded-md text-[10px] font-bold uppercase border-border bg-card/50"
                                />
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted">
                                <Filter className="h-3.5 w-3.5" />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="h-10 py-0 px-4 font-black text-[9px] uppercase tracking-widest text-muted-foreground w-[120px]">Item Code</TableHead>
                                        <TableHead className="h-10 py-0 px-4 font-black text-[9px] uppercase tracking-widest text-muted-foreground">Item Name</TableHead>
                                        <TableHead className="h-10 py-0 px-4 font-black text-[9px] uppercase tracking-widest text-muted-foreground">Category</TableHead>
                                        <TableHead className="h-10 py-0 px-4 font-black text-[9px] uppercase tracking-widest text-muted-foreground text-right">In Stock</TableHead>
                                        <TableHead className="h-10 py-0 px-4 font-black text-[9px] uppercase tracking-widest text-muted-foreground text-right w-[100px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {itemsLoading ? (
                                        <TableRow><TableCell colSpan={5} className="py-20 text-center text-[10px] uppercase font-bold text-muted-foreground animate-pulse">Loading stock registry...</TableCell></TableRow>
                                    ) : filteredItems?.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} className="py-20 text-center text-[10px] uppercase font-bold text-muted-foreground">No items found</TableCell></TableRow>
                                    ) : filteredItems?.map(item => (
                                        <TableRow key={item.name} className="hover:bg-muted/20 border-border group">
                                            <TableCell className="py-3 px-4">
                                                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter bg-muted/50 border-border rounded-sm">{item.item_code}</Badge>
                                            </TableCell>
                                            <TableCell className="py-3 px-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-bold text-foreground uppercase tracking-tight">{item.item_name}</span>
                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase">{item.unit}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3 px-4">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase">{item.category}</span>
                                            </TableCell>
                                            <TableCell className="py-3 px-4 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className={cn(
                                                        "text-xs font-black",
                                                        (item.current_stock || 0) <= (item.reorder_level || 0) ? "text-amber-500" : "text-foreground"
                                                    )}>
                                                        {item.current_stock || 0}
                                                    </span>
                                                    {(item.current_stock || 0) <= (item.reorder_level || 0) && (
                                                        <span className="text-[8px] font-black text-amber-500/70 border border-amber-500/20 px-1 rounded uppercase tracking-tighter bg-amber-500/5">Low Stock</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3 px-4 text-right">
                                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md group-hover:bg-muted text-muted-foreground transition-colors">
                                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="assets" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {assetsLoading ? (
                            Array(3).fill(0).map((_, i) => <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />)
                        ) : assets?.length === 0 ? (
                            <div className="col-span-full py-20 text-center card border-dashed border-2 flex flex-col items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center"><Monitor className="h-5 w-5 text-muted-foreground" /></div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No assets registered yet</p>
                            </div>
                        ) : assets?.map(asset => (
                            <Card key={asset.name} className="border-border shadow-none bg-card hover:border-primary/50 transition-colors group">
                                <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xs font-bold uppercase tracking-tight text-foreground">{asset.asset_name}</CardTitle>
                                        <CardDescription className="text-[9px] font-bold uppercase tracking-widest">{asset.serial_number || "No Serial"}</CardDescription>
                                    </div>
                                    <Badge className={cn(
                                        "text-[8px] font-black uppercase tracking-tighter px-1.5 py-0 rounded-sm",
                                        asset.status === "Operational" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                                    )}>
                                        {asset.status}
                                    </Badge>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <div className="space-y-3 mt-2">
                                        <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest">
                                            <span className="text-muted-foreground">Location</span>
                                            <span className="text-foreground">{asset.location || "Central Store"}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest">
                                            <span className="text-muted-foreground">Installed</span>
                                            <span className="text-foreground">{asset.purchase_date || "N/A"}</span>
                                        </div>
                                        <Button variant="outline" size="sm" className="w-full h-8 text-[9px] font-bold uppercase tracking-widest gap-2 bg-muted/30 border-border group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                                            <Wrench className="h-3 w-3" /> View Service Log
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                    <Card className="border-border shadow-none bg-card overflow-hidden">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="h-10 py-0 px-4 font-black text-[9px] uppercase tracking-widest text-muted-foreground">Type</TableHead>
                                        <TableHead className="h-10 py-0 px-4 font-black text-[9px] uppercase tracking-widest text-muted-foreground">Item</TableHead>
                                        <TableHead className="h-10 py-0 px-4 font-black text-[9px] uppercase tracking-widest text-muted-foreground text-right">Qty</TableHead>
                                        <TableHead className="h-10 py-0 px-4 font-black text-[9px] uppercase tracking-widest text-muted-foreground">Date</TableHead>
                                        <TableHead className="h-10 py-0 px-4 font-black text-[9px] uppercase tracking-widest text-muted-foreground">Ref / Notes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {historyLoading ? (
                                        <TableRow><TableCell colSpan={5} className="py-20 text-center animate-pulse">...</TableCell></TableRow>
                                    ) : stockEntries?.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} className="py-20 text-center text-[10px] uppercase font-bold text-muted-foreground">No movements recorded</TableCell></TableRow>
                                    ) : stockEntries?.map(entry => (
                                        <TableRow key={entry.name} className="hover:bg-muted/20 border-border">
                                            <TableCell className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    {entry.entry_type === "Inward" ? (
                                                        <TrendingUp className="h-3 w-3 text-emerald-500" />
                                                    ) : (
                                                        <TrendingDown className="h-3 w-3 text-amber-500" />
                                                    )}
                                                    <span className={cn(
                                                        "text-[10px] font-bold uppercase tracking-widest",
                                                        entry.entry_type === "Inward" ? "text-emerald-500" : "text-amber-500"
                                                    )}>
                                                        {entry.entry_type}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3 px-4 font-bold text-[10px] uppercase tracking-tight">
                                                {entry.item}
                                            </TableCell>
                                            <TableCell className="py-3 px-4 text-right font-black text-xs">
                                                {entry.entry_type === "Inward" ? "+" : "-"}{entry.quantity}
                                            </TableCell>
                                            <TableCell className="py-3 px-4 text-[10px] font-bold text-muted-foreground">
                                                {entry.date}
                                            </TableCell>
                                            <TableCell className="py-3 px-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-foreground">
                                                        {entry.reference_name || "Direct Entry"}
                                                    </span>
                                                    {entry.notes && <span className="text-[9px] text-muted-foreground uppercase truncate max-w-[200px]">{entry.notes}</span>}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
