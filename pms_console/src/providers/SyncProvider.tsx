import React, { useEffect, useState } from 'react';
import { getDB } from '@/lib/db';
import { pullSync, pushSync } from '@/lib/db/sync-service';
import { toast } from 'sonner';

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

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
                await getDB();
                setIsInitialized(true);

                if (isOnline) {
                    await pullSync();
                    await pushSync();
                    console.log('Initial sync completed');
                }

                // Background sync loop
                timer = setInterval(async () => {
                    if (isOnline) {
                        await pullSync();
                        await pushSync();
                    }
                }, 60000); // Sync every minute

            } catch (err) {
                console.error('Failed to initialize local DB:', err);
                toast.error('Local database failed to initialize. Performance may be degraded.');
            }
        };

        initAndSync();

        return () => {
            if (timer) clearInterval(timer);
        };
    }, []);

    return (
        <>
            {!isInitialized && (
                <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        <p className="text-sm font-bold animate-pulse text-slate-600">Initializing Local Database...</p>
                    </div>
                </div>
            )}
            {children}
        </>
    );
};
