"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLocalDocList, useLocalCreate, useLocalMutation } from "@/hooks/use-local-data"
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
    Smartphone,
    Wrench,
    Tag,
    Clock,
    FileText,
    TrendingDown,
    TrendingUp,
    Table as TableIcon,
    ChevronRight,
    Eye,
    Pencil,
    Activity
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"

export default function InventoryPage() {
    const [activeTab, setActiveTab] = useState("items")
    const [searchQuery, setSearchQuery] = useState("")

    // Dialog & UI States
    const [isAddItemOpen, setIsAddItemOpen] = useState(false)
    const [isEditItemOpen, setIsEditItemOpen] = useState(false)
    const [isStockEntryOpen, setIsStockEntryOpen] = useState(false)
    const [viewingItem, setViewingItem] = useState<any | null>(null)
    const [editingItem, setEditingItem] = useState<any | null>(null)

    // Data Fetching (Use Local RxDB)
    const { data: items, isLoading: itemsLoading } = useLocalDocList("PMS Item")
    const { data: assets, isLoading: assetsLoading } = useLocalDocList("PMS Asset")
    const { data: stockEntries, isLoading: historyLoading } = useLocalDocList("PMS Stock Entry")

    const { create: createLocalDoc, isCreating } = useLocalCreate()
    const { mutate: mutateLocalDoc, isSaving } = useLocalMutation()

    // Form States
    const [itemForm, setItemForm] = useState({
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
    const handleSaveItem = async () => {
        if (!itemForm.item_code || !itemForm.item_name) {
            toast.error("Please fill in required fields")
            return
        }
        try {
            if (editingItem) {
                await mutateLocalDoc("PMS Item", editingItem.name, itemForm)
                toast.success("Item updated successfully")
                setIsEditItemOpen(false)
            } else {
                await createLocalDoc("PMS Item", itemForm)
                toast.success("Item created successfully")
                setIsAddItemOpen(false)
            }
            // Reset form
            setItemForm({ item_code: "", item_name: "", category: "Consumable", unit: "Pcs", reorder_level: 0, valuation_rate: 0 })
            setEditingItem(null)
        } catch (e) {
            toast.error("Failed to save item")
        }
    }

    const handleStockEntry = async () => {
        if (!stockEntryForm.item || !stockEntryForm.quantity) {
            toast.error("Please select item and enter quantity")
            return
        }
        try {
            await createLocalDoc("PMS Stock Entry", {
                ...stockEntryForm,
                date: new Date().toISOString().split('T')[0]
            })
            toast.success("Stock movement recorded")
            setIsStockEntryOpen(false)
            setStockEntryForm({ item: "", entry_type: "Inward", quantity: 0, notes: "" })
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

    // Dropdown Action Handlers
    const openEditDialog = (item: any) => {
        setEditingItem(item)
        setItemForm({
            item_code: item.item_code,
            item_name: item.item_name,
            category: item.category,
            unit: item.unit,
            reorder_level: item.reorder_level || 0,
            valuation_rate: item.valuation_rate || 0
        })
        setIsEditItemOpen(true)
    }

    const openAdjustStock = (item: any) => {
        setStockEntryForm({
            item: item.name,
            entry_type: "Inward",
            quantity: 0,
            notes: ""
        })
        setIsStockEntryOpen(true)
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-xl font-bold tracking-tight text-foreground uppercase">Inventory & Assets</h1>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Track supplies, maintenance parts, and fixed assets.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setEditingItem(null)
                            setItemForm({ item_code: "", item_name: "", category: "Consumable", unit: "Pcs", reorder_level: 0, valuation_rate: 0 })
                            setIsAddItemOpen(true)
                        }}
                        className="h-9 px-4 rounded-lg font-bold text-[10px] uppercase tracking-widest gap-2"
                    >
                        <Plus className="h-3.5 w-3.5" /> Define Item
                    </Button>

                    <Button
                        onClick={() => setIsStockEntryOpen(true)}
                        className="h-9 px-4 rounded-lg font-bold text-[10px] uppercase tracking-widest gap-2 bg-primary text-primary-foreground"
                    >
                        <Boxes className="h-3.5 w-3.5" /> Adjust Stock
                    </Button>
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
                                        <TableRow key={item.name} className="hover:bg-muted/20 border-border group whitespace-nowrap">
                                            <TableCell className="py-2 px-4">
                                                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter bg-muted/50 border-border rounded-sm">{item.item_code}</Badge>
                                            </TableCell>
                                            <TableCell className="py-2 px-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-bold text-foreground uppercase tracking-tight">{item.item_name}</span>
                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">{item.unit}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-2 px-4">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase">{item.category}</span>
                                            </TableCell>
                                            <TableCell className="py-2 px-4 text-right">
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
                                            <TableCell className="py-2 px-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md group-hover:bg-muted text-muted-foreground transition-colors">
                                                            <MoreHorizontal className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-40">
                                                        <DropdownMenuLabel className="text-[9px] uppercase font-black tracking-widest opacity-50">Item Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => setViewingItem(item)} className="text-[10px] font-bold uppercase tracking-tight gap-2">
                                                            <Eye className="h-3.5 w-3.5" /> View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => openEditDialog(item)} className="text-[10px] font-bold uppercase tracking-tight gap-2">
                                                            <Pencil className="h-3.5 w-3.5" /> Edit Settings
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => openAdjustStock(item)} className="text-[10px] font-bold uppercase tracking-tight gap-2">
                                                            <Activity className="h-3.5 w-3.5" /> Adjust Stock
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
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
                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center"><Package className="h-5 w-5 text-muted-foreground" /></div>
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
                                            <TableCell className="py-2 px-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    {entry.entry_type === "Inward" ? (
                                                        <TrendingUp className="h-3 w-3 text-emerald-500" />
                                                    ) : (
                                                        <TrendingDown className="h-3 w-3 text-amber-500" />
                                                    )}
                                                    <span className={cn(
                                                        "text-[9px] font-black uppercase tracking-widest",
                                                        entry.entry_type === "Inward" ? "text-emerald-500" : "text-amber-500"
                                                    )}>
                                                        {entry.entry_type}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-2 px-4 font-bold text-[10px] uppercase tracking-tight">
                                                {entry.item}
                                            </TableCell>
                                            <TableCell className="py-2 px-4 text-right font-black text-[11px]">
                                                {entry.entry_type === "Inward" ? "+" : "-"}{entry.quantity}
                                            </TableCell>
                                            <TableCell className="py-2 px-4 text-[9px] font-bold text-muted-foreground opacity-70">
                                                {entry.date}
                                            </TableCell>
                                            <TableCell className="py-2 px-4 max-w-[250px]">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-foreground truncate">
                                                        {entry.reference_name || "Manual Check"}
                                                    </span>
                                                    {entry.notes && <span className="text-[9px] font-bold text-muted-foreground uppercase truncate opacity-50">{entry.notes}</span>}
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

            {/* Dialogs & Sheets */}

            {/* Add / Edit Item Dialog */}
            <Dialog open={isAddItemOpen || isEditItemOpen} onOpenChange={(open) => {
                if (!open) {
                    setIsAddItemOpen(false)
                    setIsEditItemOpen(false)
                    setEditingItem(null)
                }
            }}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-bold uppercase tracking-tight">
                            {editingItem ? "Edit Inventory Item" : "New Inventory Item"}
                        </DialogTitle>
                        <DialogDescription className="text-[10px] uppercase tracking-widest">
                            {editingItem ? "Update item properties and reorder levels." : "Add a new consumable or part to the registry."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Item Code</Label>
                                <Input
                                    value={itemForm.item_code}
                                    onChange={e => setItemForm({ ...itemForm, item_code: e.target.value })}
                                    disabled={!!editingItem}
                                    placeholder="e.g. LNN-SQ"
                                    className="h-9 rounded-md text-xs font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Category</Label>
                                <Select value={itemForm.category} onValueChange={v => setItemForm({ ...itemForm, category: v })}>
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
                            <Input value={itemForm.item_name} onChange={e => setItemForm({ ...itemForm, item_name: e.target.value })} placeholder="e.g. Linen Bed Sheet - Queen" className="h-9 rounded-md text-xs font-bold" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Unit</Label>
                                <Select value={itemForm.unit} onValueChange={v => setItemForm({ ...itemForm, unit: v })}>
                                    <SelectTrigger className="h-9 rounded-md text-xs font-bold">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pcs">Pieces</SelectItem>
                                        <SelectItem value="Kg">Kilograms</SelectItem>
                                        <SelectItem value="Litre">Litres</SelectItem>
                                        <SelectItem value="Box">Boxes</SelectItem>
                                        <SelectItem value="Set">Sets</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reorder Level</Label>
                                <Input type="number" value={itemForm.reorder_level} onChange={e => setItemForm({ ...itemForm, reorder_level: parseFloat(e.target.value) })} className="h-9 rounded-md text-xs font-bold" />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={handleSaveItem}
                            disabled={isCreating || isSaving}
                            className="w-full h-10 font-bold text-[10px] uppercase tracking-widest"
                        >
                            {editingItem ? "Update Item" : "Save Item"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Stock Entry Dialog */}
            <Dialog open={isStockEntryOpen} onOpenChange={setIsStockEntryOpen}>
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
                        <Button onClick={handleStockEntry} disabled={isCreating} className="w-full h-10 font-bold text-[10px] uppercase tracking-widest">Submit Entry</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Item Sheet */}
            <Sheet open={!!viewingItem} onOpenChange={(open) => !open && setViewingItem(null)}>
                <SheetContent className="sm:max-w-md overflow-y-auto">
                    <SheetHeader className="space-y-1">
                        <SheetTitle className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
                            <Package className="h-4 w-4 text-primary" /> {viewingItem?.item_name}
                        </SheetTitle>
                        <SheetDescription className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                            {viewingItem?.item_code} • {viewingItem?.category}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="mt-8 space-y-8">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1 border-l-2 border-primary pl-4 py-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Current Stock</p>
                                <p className="text-xl font-black">{viewingItem?.current_stock || 0} {viewingItem?.unit}</p>
                            </div>
                            <div className="space-y-1 border-l-2 border-border pl-4 py-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Valuation</p>
                                <p className="text-xl font-black">₹{((viewingItem?.current_stock || 0) * (viewingItem?.valuation_rate || 0)).toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Recent History for this item */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                <History className="h-3.5 w-3.5" /> Recent Movements
                            </h3>
                            <div className="space-y-3">
                                {stockEntries?.filter(e => e.item === viewingItem?.name).slice(0, 10).map(entry => (
                                    <div key={entry.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                {entry.entry_type === "Inward" ? <TrendingUp className="h-3 w-3 text-emerald-500" /> : <TrendingDown className="h-3 w-3 text-amber-500" />}
                                                <span className="text-[10px] font-black uppercase tracking-tighter">{entry.entry_type}</span>
                                            </div>
                                            <span className="text-[9px] font-bold text-muted-foreground">{entry.date}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className={cn(
                                                "text-xs font-black",
                                                entry.entry_type === "Inward" ? "text-emerald-500" : "text-amber-500"
                                            )}>
                                                {entry.entry_type === "Inward" ? "+" : "-"}{entry.quantity}
                                            </p>
                                            <p className="text-[8px] font-bold uppercase text-muted-foreground truncate max-w-[120px]">{entry.notes || entry.reference_name || "Direct Entry"}</p>
                                        </div>
                                    </div>
                                ))}
                                {stockEntries?.filter(e => e.item === viewingItem?.name).length === 0 && (
                                    <p className="text-[10px] text-center py-10 uppercase font-black opacity-30 tracking-widest">No movement history</p>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border space-y-3">
                            <Button onClick={() => { setEditingItem(viewingItem); openEditDialog(viewingItem); setViewingItem(null); }} variant="outline" className="w-full text-[10px] font-bold uppercase tracking-widest h-10 gap-2">
                                <Pencil className="h-3.5 w-3.5" /> Edit Configuration
                            </Button>
                            <Button onClick={() => { openAdjustStock(viewingItem); setViewingItem(null); }} className="w-full text-[10px] font-bold uppercase tracking-widest h-10 gap-2">
                                <Activity className="h-3.5 w-3.5" /> New Stock Entry
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div >
    )
}
