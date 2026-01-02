import axios from 'axios';
import { database, DOCTYPES } from './index';
import { getCollectionName } from '@/hooks/use-local-data';
import { Q } from '@nozbe/watermelondb';

const api = axios.create({
    baseURL: '/api/resource',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

export async function pullDocType(doctype: string) {
    try {
        const tableName = getCollectionName(doctype);
        const collection = database.get(tableName as any);

        // Get last modified record to determine the sync point
        const lastRecords = await collection.query(
            Q.sortBy('modified', Q.desc),
            Q.take(1)
        ).fetch();

        const lastModified = lastRecords.length > 0 ? (lastRecords[0]._raw as any).modified : '1900-01-01 00:00:00';

        const response = await api.get(`/${doctype}`, {
            params: {
                filters: JSON.stringify([['modified', '>', lastModified]]),
                fields: JSON.stringify(['*']),
                limit: 100
            }
        });

        const records = response.data.data;
        if (records && records.length > 0) {
            await database.write(async () => {
                for (const record of records) {
                    const existing = await collection.query(Q.where('id', record.name)).fetch();
                    if (existing.length > 0) {
                        await existing[0].update(r => {
                            Object.assign(r._raw, record);
                        });
                    } else {
                        await collection.create(r => {
                            r._raw.id = record.name;
                            Object.assign(r._raw, record);
                        });
                    }
                }
            });
            console.log(`Sync (Realtime): Pulled ${records.length} records for ${doctype}`);
        }
    } catch (error) {
        console.error(`Sync failure for ${doctype}:`, error);
    }
}

export async function pullSync() {
    console.log("Sync Service: WatermelonDB Pull Started");
    for (const doctype of DOCTYPES) {
        await pullDocType(doctype);
    }
}

export async function pushSync() {
    const outboxCollection = database.get('outbox' as any);

    const pendingItems = await outboxCollection.query(
        Q.sortBy('created_at', Q.asc)
    ).fetch();

    if (pendingItems.length === 0) return;

    console.log(`Sync: Processing ${pendingItems.length} items from outbox`);

    for (const item of pendingItems) {
        try {
            const { doctype, record_id, operation, payload: payloadStr } = item._raw as any;
            const payload = JSON.parse(payloadStr);

            if (operation === 'INSERT') {
                await api.post(`/${doctype}`, payload);
            } else if (operation === 'UPDATE' && record_id) {
                await api.put(`/${doctype}/${record_id}`, payload);
            } else if (operation === 'DELETE' && record_id) {
                await api.delete(`/${doctype}/${record_id}`);
            }

            // Remove from outbox on success
            await database.write(async () => {
                await item.destroyPermanently();
            });
            console.log(`Sync: Pushed ${operation} for ${doctype} ${record_id || ''}`);
        } catch (error: any) {
            console.error(`Sync: Failed to push outbox item ${item.id}:`, error.response?.data || error.message);

            // Critical fix: Remove invalid items that will never succeed
            const isMandatoryError = JSON.stringify(error.response?.data || "").includes("MandatoryError");
            if (error.response?.status === 417 || isMandatoryError) {
                console.warn(`Sync: Removing invalid item ${item.id} from outbox to unblock queue.`);
                await database.write(async () => {
                    await item.destroyPermanently();
                });
            } else {
                break;
            }
        }
    }
}

export async function addToOutbox(doctype: string, operation: 'INSERT' | 'UPDATE' | 'DELETE', payload: any, record_id?: string) {
    const outboxCollection = database.get('outbox' as any);
    await database.write(async () => {
        await outboxCollection.create((item: any) => {
            item._raw.id = Math.random().toString(36).substr(2, 9);
            item._raw.doctype = doctype;
            item._raw.record_id = record_id;
            item._raw.operation = operation;
            item._raw.payload = JSON.stringify(payload);
            item._raw.created_at = Date.now();
        });
    });

    if (navigator.onLine) {
        pushSync();
    }
}
