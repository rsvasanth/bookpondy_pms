import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';

/**
 * Hook to listen for real-time notifications from Frappe.
 */
export const useRealtime = () => {
    useEffect(() => {
        // Construct socket connection
        // VITE_SOCKET_PORT is usually 9000
        const socketPort = import.meta.env.VITE_SOCKET_PORT || '9000';
        const siteName = import.meta.env.VITE_SITE_NAME;

        // In development, we use the proxy configured in vite.config.ts
        // By omitting the host/port, socket.io-client will use the current host/port.
        const socket = io({
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        socket.on('connect', () => {
            console.log('Connected to Frappe Realtime');
            // Subscribe to site-specific events if needed
            if (siteName) {
                // Frappe expects this for site-isolated sockets
                socket.emit('subscribe_site', siteName);
            }
        });

        // Listen for generic DocType updates from Frappe
        socket.on('doc_update', async (data: any) => {
            const { doctype } = data;
            if (doctype) {
                console.log(`Real-time update for ${doctype}, triggering sync...`);
                const { pullDocType } = await import('@/lib/db/sync-service');
                await pullDocType(doctype);
            }
        });

        // Listen for our custom notification event
        socket.on('bookpondy_pms.notification', (data: any) => {
            console.log('Real-time notification received:', data);

            const { title, message, type, link } = data;

            const toastFn = type === 'success' ? toast.success :
                type === 'error' ? toast.error :
                    type === 'warning' ? toast.warning : toast.info;

            toastFn(title, {
                description: message,
                action: link ? {
                    label: 'View',
                    onClick: () => window.location.href = link
                } : undefined,
                duration: 5000,
            });
        });

        return () => {
            socket.disconnect();
        };
    }, []);
};
