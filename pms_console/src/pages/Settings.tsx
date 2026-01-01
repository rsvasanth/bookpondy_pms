"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Building2,
    Link2,
    Settings2,
    Globe,
    ShieldCheck,
    Database,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Package
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useFrappeGetDoc, useFrappeUpdateDoc, useFrappePostCall } from "frappe-react-sdk"
import { toast } from "sonner"

export default function SettingsPage() {
    const { data: settings, mutate: refreshSettings, isLoading: loadingSettings } = useFrappeGetDoc("ERPNext Settings", "ERPNext Settings")
    const { updateDoc, loading: isSaving } = useFrappeUpdateDoc()
    const { call: testConnection, loading: isTesting } = useFrappePostCall("bookpondy_pms.bookpondy_pms.doctype.erpnext_settings.erpnext_settings.test_connection")

    const [form, setForm] = useState({
        erpnext_url: "",
        api_key: "",
        api_secret: "",
        is_enabled: false,
        default_company: "",
        cgst_account: "",
        sgst_account: "",
        igst_account: ""
    })

    useEffect(() => {
        if (settings) {
            setForm({
                erpnext_url: settings.erpnext_url || "",
                api_key: settings.api_key || "",
                api_secret: "", // Password field, keep blank for security
                is_enabled: !!settings.is_enabled,
                default_company: settings.default_company || "",
                cgst_account: settings.cgst_account || "",
                sgst_account: settings.sgst_account || "",
                igst_account: settings.igst_account || ""
            })
        }
    }, [settings])

    const handleSave = async () => {
        try {
            const payload: any = { ...form }
            if (!payload.api_secret) delete payload.api_secret // Don't overwrite if blank

            await updateDoc("ERPNext Settings", "ERPNext Settings", payload)
            toast.success("Settings updated successfully")
            refreshSettings()
        } catch (e) {
            toast.error("Failed to update settings")
        }
    }

    const handleTest = async () => {
        try {
            const res = await testConnection()
            if (res.status === "success") {
                toast.success(res.message)
            } else {
                toast.error(res.message || "Connection failed")
            }
        } catch (e) {
            toast.error("An error occurred during testing")
        }
    }

    return (
        <>
            <div className="flex flex-col gap-8 pb-12">
                <div className="space-y-1.5 px-2">
                    <h1 className="text-2xl font-black tracking-tight text-foreground uppercase flex items-center gap-3">
                        <Settings2 className="h-6 w-6 text-primary" />
                        System Settings
                    </h1>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Configure your property management system and external integrations.
                    </p>
                </div>

                <Tabs defaultValue="erpnext" className="px-2">
                    <TabsList className="bg-muted/50 p-1 mb-8 h-11">
                        <TabsTrigger value="general" className="px-6 h-9 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-card shadow-none">
                            <Building2 className="h-3.5 w-3.5 mr-2" /> General
                        </TabsTrigger>
                        <TabsTrigger value="erpnext" className="px-6 h-9 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-card shadow-none">
                            <Link2 className="h-3.5 w-3.5 mr-2" /> ERPNext Integration
                        </TabsTrigger>
                        <TabsTrigger value="marketplace" className="px-6 h-9 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-card shadow-none">
                            <Globe className="h-3.5 w-3.5 mr-2" /> Marketplace Sync
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="space-y-6">
                        <Card className="border-border/50 shadow-sm">
                            <CardHeader className="bg-muted/10">
                                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-primary" /> Property Identity
                                </CardTitle>
                                <CardDescription className="text-xs">Basic information about your property profile.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="text-center py-12 text-muted-foreground/40 text-[10px] font-bold uppercase tracking-[0.3em]">
                                    CONFIGURATION PANEL UNDER DEVELOPMENT
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="erpnext" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <Card className="border-border/50 shadow-sm">
                                    <CardHeader className="bg-muted/10 border-b border-border/50">
                                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                            <ShieldCheck className="h-4 w-4 text-primary" /> API Connection
                                        </CardTitle>
                                        <CardDescription className="text-xs">Establish a secure link between BookPondy and ERPNext.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid gap-6 pt-6">
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">ERPNext URL</Label>
                                                <div className="relative">
                                                    <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
                                                    <Input
                                                        placeholder="https://erp.yourdomain.com"
                                                        className="pl-9 h-10 rounded-lg font-medium text-sm border-border bg-muted/5 focus:bg-card transition-all"
                                                        value={form.erpnext_url}
                                                        onChange={e => setForm({ ...form, erpnext_url: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3 pt-6 px-2">
                                                <Checkbox
                                                    id="enabled"
                                                    checked={form.is_enabled}
                                                    onCheckedChange={(val) => setForm({ ...form, is_enabled: !!val })}
                                                    className="w-5 h-5 rounded-md border-border data-[state=checked]:bg-primary"
                                                />
                                                <Label htmlFor="enabled" className="text-sm font-bold text-foreground cursor-pointer">
                                                    Enable Connector
                                                </Label>
                                            </div>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">API Key</Label>
                                                <Input
                                                    placeholder="admin_key"
                                                    className="h-10 rounded-lg font-mono text-xs border-border bg-muted/5"
                                                    value={form.api_key}
                                                    onChange={e => setForm({ ...form, api_key: e.target.value })}
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">API Secret</Label>
                                                <Input
                                                    type="password"
                                                    placeholder="••••••••••••"
                                                    className="h-10 rounded-lg font-mono text-xs border-border bg-muted/5"
                                                    value={form.api_secret}
                                                    onChange={e => setForm({ ...form, api_secret: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="bg-muted/20 p-4 flex justify-between">
                                        <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1.5">
                                            <AlertCircle className="h-3 w-3" /> API credentials are encrypted at rest.
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest bg-card shadow-sm border-border"
                                            onClick={handleTest}
                                            disabled={isTesting || !form.erpnext_url}
                                        >
                                            {isTesting ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : "Test Connection"}
                                        </Button>
                                    </CardFooter>
                                </Card>

                                <Card className="border-border/50 shadow-sm">
                                    <CardHeader className="bg-muted/10 border-b border-border/50">
                                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                            <Database className="h-4 w-4 text-primary" /> Tax Mapping
                                        </CardTitle>
                                        <CardDescription className="text-xs">Map internal tax categories to ERPNext Ledger Accounts.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid gap-4 pt-6">
                                        <div className="grid gap-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Default Company</Label>
                                            <Input
                                                placeholder="e.g., BookPondy Properties Pvt Ltd"
                                                className="h-10 rounded-lg font-medium text-sm border-border bg-muted/5"
                                                value={form.default_company}
                                                onChange={e => setForm({ ...form, default_company: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid gap-4 sm:grid-cols-3">
                                            <div className="grid gap-2">
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">CGST Account</Label>
                                                <Input
                                                    placeholder="Output GST - CGST"
                                                    className="h-9 rounded-lg text-xs border-border bg-muted/5"
                                                    value={form.cgst_account}
                                                    onChange={e => setForm({ ...form, cgst_account: e.target.value })}
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">SGST Account</Label>
                                                <Input
                                                    placeholder="Output GST - SGST"
                                                    className="h-9 rounded-lg text-xs border-border bg-muted/5"
                                                    value={form.sgst_account}
                                                    onChange={e => setForm({ ...form, sgst_account: e.target.value })}
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">IGST Account</Label>
                                                <Input
                                                    placeholder="Output GST - IGST"
                                                    className="h-9 rounded-lg text-xs border-border bg-muted/5"
                                                    value={form.igst_account}
                                                    onChange={e => setForm({ ...form, igst_account: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="bg-muted/20 p-4 border-t border-border/50 flex justify-end">
                                        <Button
                                            className="h-9 px-8 rounded-lg text-[10px] font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                                            onClick={handleSave}
                                            disabled={isSaving || loadingSettings}
                                        >
                                            {isSaving ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : "Save Changes"}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>

                            <div className="space-y-6">
                                <Card className="border-border/50 shadow-sm bg-muted/5">
                                    <CardHeader>
                                        <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Hub Status</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("h-2.5 w-2.5 rounded-full", form.is_enabled ? "bg-emerald-500 animate-pulse" : "bg-muted")} />
                                                <span className="text-xs font-bold uppercase tracking-tight">Real-time Sync</span>
                                            </div>
                                            <span className="text-[10px] font-black text-muted-foreground uppercase">{form.is_enabled ? "Active" : "Disabled"}</span>
                                        </div>

                                        <div className="p-4 rounded-xl bg-card border border-border space-y-3">
                                            <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                <Database className="h-3.5 w-3.5" /> Data Ledger
                                            </h5>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center text-[11px]">
                                                    <span className="font-bold text-muted-foreground">Last Sync</span>
                                                    <span className="font-mono text-foreground">{settings?.modified?.split(' ')[1] || "Never"}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[11px]">
                                                    <span className="font-bold text-muted-foreground">Pending Queue</span>
                                                    <span className="font-mono text-foreground">0 items</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-amber-600">
                                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                            <p className="text-[10px] font-bold leading-relaxed uppercase tracking-wide">
                                                Enabling ERPNext sync will automatically post invoices and payments to your remote ledger. Ensure account mapping is accurate.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="marketplace" className="space-y-6">
                        <Card className="border-border/50 shadow-sm">
                            <CardHeader className="bg-muted/10">
                                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                    <Package className="h-4 w-4 text-primary" /> Channel Performance
                                </CardTitle>
                                <CardDescription className="text-xs">Monitor data synchronization with OTAs and Marketplaces.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="text-center py-12 text-muted-foreground/40 text-[10px] font-bold uppercase tracking-[0.3em]">
                                    MARKETPLACE DASHBOARD UNDER DEVELOPMENT
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    )
}
