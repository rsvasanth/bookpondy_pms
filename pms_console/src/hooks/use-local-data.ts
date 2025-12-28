import { useState, useEffect } from 'react';
import { getDB } from '@/lib/db';

const DOCTYPE_TO_COLLECTION: Record<string, string> = {
    'Reservation': 'reservations',
    'Property': 'properties',
    'Booking Inquiry': 'inquiries',
    'Inquiry': 'inquiries',
    'Staff': 'staff',
    'Property Portfolio': 'portfolios',
    'Unit Category': 'unit_categories',
    'Unit': 'units',
    'Folio': 'folios',
    'Invoice': 'folios',
    'Guest': 'guests',
    'Housekeeping Task': 'housekeeping',
    'Maintenance Ticket': 'maintenance',
    'Guest Communication': 'communications',
    'Sales Invoice': 'invoices'
};

export function useLocalDocList(collectionName: string, mangoQuery: any = {}) {
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let subscription: any;

        const init = async () => {
            try {
                const db = await getDB();
                const internalName = DOCTYPE_TO_COLLECTION[collectionName] || (collectionName.toLowerCase().replace(' ', '_') + 's');
                const collection = db[internalName];

                if (!collection) {
                    console.error(`RxDB: Collection ${internalName} not found`);
                    setIsLoading(false);
                    return;
                }

                const query = collection.find(mangoQuery);
                subscription = query.$.subscribe((docs: any[]) => {
                    setData(docs.map(doc => doc.toJSON()));
                    setIsLoading(false);
                });
            } catch (err) {
                console.error(`RxDB: Failed to fetch ${collectionName}`, err);
                setIsLoading(false);
            }
        };

        init();

        return () => {
            if (subscription) subscription.unsubscribe();
        };
    }, [collectionName, JSON.stringify(mangoQuery)]);

    return { data, isLoading };
}

export function useLocalDoc(collectionName: string, name: string) {
    const [data, setData] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let subscription: any;

        const init = async () => {
            try {
                const db = await getDB();
                const internalName = DOCTYPE_TO_COLLECTION[collectionName] || (collectionName.toLowerCase().replace(' ', '_') + 's');
                const collection = db[internalName];

                if (!collection) {
                    setIsLoading(false);
                    return;
                }

                const query = collection.findOne(name);
                subscription = query.$.subscribe((doc: any) => {
                    setData(doc ? doc.toJSON() : null);
                    setIsLoading(false);
                });
            } catch (err) {
                console.error(`RxDB: Failed to fetch doc ${name}`, err);
                setIsLoading(false);
            }
        };

        init();

        return () => {
            if (subscription) subscription.unsubscribe();
        };
    }, [collectionName, name]);

    return { data, isLoading };
}

export function useLocalMutation() {
    const [isSaving, setIsSaving] = useState(false);

    const mutate = async (collectionName: string, name: string, payload: any, operation: 'UPDATE' | 'DELETE' = 'UPDATE') => {
        setIsSaving(true);
        try {
            const db = await getDB();
            const internalName = DOCTYPE_TO_COLLECTION[collectionName] || (collectionName.toLowerCase().replace(' ', '_') + 's');
            const collection = db[internalName];

            if (operation === 'UPDATE') {
                const doc = await collection.findOne(name).exec();
                if (doc) {
                    await doc.patch(payload);
                    const { addToOutbox } = await import('@/lib/db/sync-service');
                    await addToOutbox(collectionName, 'UPDATE', payload, name);
                }
            } else if (operation === 'DELETE') {
                const doc = await collection.findOne(name).exec();
                if (doc) {
                    await doc.remove();
                    const { addToOutbox } = await import('@/lib/db/sync-service');
                    await addToOutbox(collectionName, 'DELETE', {}, name);
                }
            }
        } catch (err) {
            console.error(`RxDB Mutation Error:`, err);
            throw err;
        } finally {
            setIsSaving(false);
        }
    };

    return { mutate, isSaving };
}

export function useLocalCreate() {
    const [isCreating, setIsCreating] = useState(false);

    const create = async (collectionName: string, payload: any) => {
        setIsCreating(true);
        try {
            const db = await getDB();
            const internalName = DOCTYPE_TO_COLLECTION[collectionName] || (collectionName.toLowerCase().replace(' ', '_') + 's');
            const collection = db[internalName];

            const tempName = payload.name || `local_${crypto.randomUUID()}`;
            const fullPayload = { ...payload, name: tempName, modified: new Date().toISOString() };

            await collection.insert(fullPayload);

            const { addToOutbox } = await import('@/lib/db/sync-service');
            await addToOutbox(collectionName, 'INSERT', payload, tempName);

            return fullPayload;
        } catch (err) {
            console.error(`RxDB Creation Error:`, err);
            throw err;
        } finally {
            setIsCreating(false);
        }
    };

    return { create, isCreating };
}
