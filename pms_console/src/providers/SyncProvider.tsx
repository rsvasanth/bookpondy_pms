import React, { useEffect, useState } from 'react';
import { getDB } from '@/lib/db';
import { pullSync, pushSync } from '@/lib/db/sync-service';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, CloudSync, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [syncStatus, setSyncStatus] = useState<string>('Initializing...');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        let timer: any;

        const initAndSync = async () => {
            try {
                setError(null);

                // WatermelonDB initializes synchronously/quickly
                await getDB();
                setSyncStatus('DATABASE LOADED');

                setSyncStatus('ALMOST READY...');
                setIsInitialized(true);

                if (isOnline) {
                    await pullSync();
                    await pushSync();
                }

                // Background sync loop
                timer = setInterval(async () => {
                    if (isOnline) {
                        await pullSync();
                        await pushSync();
                    }
                }, 60000);

            } catch (err: any) {
                console.error('Failed to initialize local DB:', err);
                setError(err.message || 'Unknown database error');
                toast.error('Local database failed to initialize.');
            }
        };

        if (!isInitialized) {
            initAndSync();
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [isOnline]);

    return (
        <>
            <AnimatePresence>
                {!isInitialized && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 flex flex-col items-center justify-center bg-background z-[9999] p-6 text-center"
                    >
                        <div className="relative mb-8">
                            <motion.div
                                animate={{
                                    scale: [1, 1.1, 1],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-2xl shadow-primary/20"
                            >
                                <Database className="h-10 w-10" />
                            </motion.div>
                            <motion.div
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute -top-1 -right-1"
                            >
                                <CloudSync className="h-6 w-6 text-primary" />
                            </motion.div>
                        </div>

                        <div className="max-w-xs w-full space-y-6">
                            <div className="space-y-2">
                                <h1 className="text-lg font-black tracking-tighter uppercase text-foreground">BookPondy <span className="text-primary">PMS</span></h1>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Advanced Property Console</p>
                            </div>

                            {error ? (
                                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 space-y-3">
                                    <div className="flex items-center gap-2 text-destructive justify-center">
                                        <AlertCircle className="h-4 w-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Initialization Failed</span>
                                    </div>
                                    <p className="text-[11px] font-medium text-destructive/80 leading-relaxed">{error}</p>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="w-full py-2 bg-destructive text-destructive-foreground rounded-lg text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
                                    >
                                        Reload Console
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="relative h-1.5 w-full bg-muted rounded-full overflow-hidden border border-border/50">
                                        <motion.div
                                            initial={{ x: "-100%" }}
                                            animate={{ x: "100%" }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: "linear"
                                            }}
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent w-1/2"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2 items-center">
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                            <span className="text-[10px] font-black text-foreground uppercase tracking-widest">{syncStatus}</span>
                                        </div>
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter opacity-60">Preparing your offline-first workspace...</p>
                                    </div>
                                </div>
                            )}

                            <div className="pt-8 border-t border-border/50 flex items-center justify-center gap-6">
                                <div className="flex items-center gap-1.5 opacity-50">
                                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                    <span className="text-[8px] font-black uppercase tracking-tighter">Secure Link</span>
                                </div>
                                <div className="flex items-center gap-1.5 opacity-50">
                                    <Database className="h-3 w-3 text-blue-500" />
                                    <span className="text-[8px] font-black uppercase tracking-tighter">Local Cache</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {children}
        </>
    );
};
