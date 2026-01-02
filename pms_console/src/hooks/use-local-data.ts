import { useState, useEffect } from 'react';
import { database } from '@/lib/db';
import { Q } from '@nozbe/watermelondb';

/**
 * Maps DocType names to their WatermelonDB table names.
 */
export const getCollectionName = (doctype: string) => {
    const mapping: Record<string, string> = {
        'Reservation': 'reservations',
        'Property': 'properties',
        'Housekeeping Task': 'housekeeping_tasks',
        'Maintenance Ticket': 'maintenance_tickets',
        'Folio': 'folios',
        'Unit': 'units',
        'Guest': 'guests',
        'Staff': 'staff',
        'Guest Communication': 'communications',
        'Property Portfolio': 'portfolios',
        'Unit Category': 'unit_categories',
        'Guest Query': 'guest_queries',
        'Booking Inquiry': 'inquiries',
        'PMS Item': 'pms_items',
        'PMS Stock Entry': 'pms_stock_entries',
        'PMS Asset': 'pms_assets',
        'Channel Config': 'channel_configs'
    };
    return mapping[doctype] || doctype.toLowerCase().replace(/ /g, '_');
};

export function useLocalDocList(doctype: string, mangoQuery: any = {}) {
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const tableName = getCollectionName(doctype);
        let collection: any = null;
        try {
            collection = database.get(tableName as any);
        } catch (e) {
            console.error(`WatermelonDB: Collection ${tableName} not found`, e);
            setIsLoading(false);
            return;
        }

        if (!collection) {
            console.error(`WatermelonDB: Collection ${tableName} is null`);
            setIsLoading(false);
            return;
        }

        // Basic Mango-to-Watermelon query mapping
        const clauses: any[] = [];
        const { selector, sort, limit, skip } = mangoQuery;

        if (selector) {
            Object.entries(selector).forEach(([field, value]: [string, any]) => {
                if (field === '$or' && Array.isArray(value)) {
                    // Very basic $or support for search
                    const orClauses = value.map(v => {
                        const [f, opt]: [string, any] = Object.entries(v)[0];
                        if (opt && opt.$regex) {
                            return Q.where(f, Q.like(`%${opt.$regex}%`));
                        }
                        return Q.where(f, opt);
                    });
                    clauses.push(Q.or(...orClauses));
                } else if (value && typeof value === 'object') {
                    if (value.$in) clauses.push(Q.where(field, Q.oneOf(value.$in)));
                    if (value.$nin) clauses.push(Q.where(field, Q.notIn(value.$nin)));
                    if (value.$gt) clauses.push(Q.where(field, Q.gt(value.$gt)));
                    if (value.$gte) clauses.push(Q.where(field, Q.gte(value.$gte)));
                    if (value.$lt) clauses.push(Q.where(field, Q.lt(value.$lt)));
                    if (value.$lte) clauses.push(Q.where(field, Q.lte(value.$lte)));
                    if (value.$ne) clauses.push(Q.where(field, Q.notEq(value.$ne)));
                } else if (value !== undefined) {
                    clauses.push(Q.where(field, value));
                }
            });
        }

        if (sort && Array.isArray(sort)) {
            sort.forEach(s => {
                const [field, direction] = Object.entries(s)[0];
                clauses.push(Q.sortBy(field, direction === 'desc' ? Q.desc : Q.asc));
            });
        }

        if (limit) {
            clauses.push(Q.take(limit));
        }

        if (skip) {
            clauses.push(Q.skip(skip));
        }

        const query = collection.query(...clauses);
        const subscription = query.observe().subscribe((docs) => {
            setData(docs.map(doc => ({ ...doc._raw, id: doc.id, name: doc.id })));
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [doctype, JSON.stringify(mangoQuery)]);

    return { data, isLoading };
}

export function useLocalDoc(doctype: string, id: string) {
    const [data, setData] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!id) {
            setIsLoading(false);
            setData(null);
            return;
        }

        const tableName = getCollectionName(doctype);
        const collection = database.get(tableName as any);

        const init = async () => {
            try {
                const doc = await collection.find(id);
                const subscription = doc.observe().subscribe(updatedDoc => {
                    setData({ ...updatedDoc._raw, id: updatedDoc.id, name: updatedDoc.id });
                    setIsLoading(false);
                });
                return () => subscription.unsubscribe();
            } catch (err) {
                console.error(`WatermelonDB: Failed to fetch doc ${id} for ${doctype}`, err);
                setIsLoading(false);
            }
        };

        const cleanupPromise = init();
        return () => {
            cleanupPromise.then(cleanup => cleanup?.());
        };
    }, [doctype, id]);

    return { data, isLoading };
}

export function useLocalMutation() {
    const [isSaving, setIsSaving] = useState(false);

    const mutate = async (doctype: string, id: string, payload: any, operation: 'UPDATE' | 'DELETE' = 'UPDATE') => {
        setIsSaving(true);
        if (!id) {
            console.error(`WatermelonDB Mutation Error: No ID provided for ${doctype}`);
            setIsSaving(false);
            return;
        }
        const tableName = getCollectionName(doctype);
        try {
            const collection = database.get(tableName as any);
            const doc = await collection.find(id);

            if (operation === 'UPDATE') {
                await database.write(async () => {
                    await doc.update(record => {
                        Object.assign(record, payload);
                    });
                });
                const { addToOutbox } = await import('@/lib/db/sync-service');
                await addToOutbox(doctype, 'UPDATE', payload, id);
            } else if (operation === 'DELETE') {
                await database.write(async () => {
                    await doc.markAsDeleted();
                });
                const { addToOutbox } = await import('@/lib/db/sync-service');
                await addToOutbox(doctype, 'DELETE', {}, id);
            }
        } catch (err) {
            console.error(`WatermelonDB Mutation Error (${doctype}):`, err);
            throw err;
        } finally {
            setIsSaving(false);
        }
    };

    return { mutate, isSaving };
}

export function useLocalCreate() {
    const [isCreating, setIsCreating] = useState(false);

    const create = async (doctype: string, payload: any) => {
        setIsCreating(true);
        const tableName = getCollectionName(doctype);
        try {
            const collection = database.get(tableName as any);

            const tempId = payload.name || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const fullPayload = { ...payload, name: tempId, modified: new Date().toISOString() };

            await database.write(async () => {
                await collection.create(record => {
                    record._raw.id = tempId; // Override Watermelon ID with Frappe name/temp id
                    Object.assign(record, fullPayload);
                });
            });

            const { addToOutbox } = await import('@/lib/db/sync-service');
            await addToOutbox(doctype, 'INSERT', payload, tempId);

            return fullPayload;
        } catch (err) {
            console.error(`WatermelonDB Creation Error (${doctype}):`, err);
            throw err;
        } finally {
            setIsCreating(false);
        }
    };

    return { create, isCreating };
}
