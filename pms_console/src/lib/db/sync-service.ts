import axios from 'axios';
import { getDB } from './index';

const api = axios.create({
    baseURL: '/api/resource',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

const DOCTYPE_FIELDS: Record<string, string[]> = {
    'Reservation': ["name", "guest_name", "check_in_date", "check_out_date", "reservation_status", "total_amount", "property", "allocated_unit", "modified", "guest_email", "guest_phone", "unit_category", "special_requests"],
    'Property': ["name", "property_name", "property_type", "location_description", "total_units", "total_rooms", "average_rating", "banner_image", "status", "modified"],
    'Booking Inquiry': ["name", "guest_name", "inquiry_status", "property_interested", "inquiry_date", "modified", "guest_email", "guest_phone", "unit_category", "check_in_date", "check_out_date", "number_of_guests", "special_requests"],
    'Housekeeping Task': ["name", "unit", "task_type", "status", "priority", "scheduled_time", "modified"],
    'Maintenance Ticket': ["name", "issue_title", "unit", "ticket_status", "priority", "creation", "modified"],
    'Folio': ["name", "name", "reservation", "grand_total", "invoice_status", "status", "creation", "modified", "invoice_number"],
    'Unit': ["name", "unit_no", "property", "unit_category", "status", "modified"],
    'Guest': ["name", "guest_name", "email", "phone", "total_visits", "total_spend", "last_visit_date", "return_guest", "modified"],
    'Staff': ["name", "staff_name", "designation", "property", "status", "email", "phone", "modified"],
    'Guest Communication': ["name", "guest", "communication_date", "communication_type", "status", "subject", "message", "modified"],
    'Property Portfolio': ["name", "portfolio_name", "description", "owner_user", "modified"],
    'Unit Category': ["name", "category_name", "property", "modified"],
    'Sales Invoice': ["name", "customer_name", "status", "grand_total", "due_date", "modified"]
};

const DOCTYPE_MAP: Record<string, string> = {
    'Reservation': 'reservations',
    'Property': 'properties',
    'Booking Inquiry': 'inquiries',
    'Housekeeping Task': 'housekeeping',
    'Maintenance Ticket': 'maintenance',
    'Folio': 'folios',
    'Unit': 'units',
    'Guest': 'guests',
    'Staff': 'staff',
    'Guest Communication': 'communications',
    'Property Portfolio': 'portfolios',
    'Unit Category': 'unit_categories',
    'Sales Invoice': 'invoices'
};

export async function pullSync() {
    const db = await getDB();

    for (const [doctype, collectionName] of Object.entries(DOCTYPE_MAP)) {
        try {
            const collection = db[collectionName];

            // Get last modified record to determine the sync point
            const lastRecord = await collection.findOne()
                .sort({ modified: 'desc' })
                .exec();

            const lastModified = lastRecord ? lastRecord.get('modified') : '1900-01-01 00:00:00';

            const response = await api.get(`/${doctype}`, {
                params: {
                    filters: JSON.stringify([['modified', '>', lastModified]]),
                    fields: JSON.stringify(DOCTYPE_FIELDS[doctype] || ['*']),
                    limit: 100
                }
            });

            const records = response.data.data;
            if (records && records.length > 0) {
                // Upsert records into RxDB
                for (const record of records) {
                    await collection.upsert(record);
                }
                console.log(`Sync: Pulled ${records.length} records for ${doctype}`);
            }
        } catch (error) {
            console.error(`Sync failure for ${doctype}:`, error);
        }
    }
}

// Push local changes (Process outbox)
export async function pushSync() {
    const db = await getDB();
    const outbox = db.outbox;

    const pendingItems = await outbox.find({
        sort: [{ created_at: 'asc' }]
    }).exec();

    if (pendingItems.length === 0) return;

    console.log(`Sync: Processing ${pendingItems.length} items from outbox`);

    for (const item of pendingItems) {
        try {
            const { doctype, name, operation, payload } = item.toJSON();

            if (operation === 'INSERT') {
                await api.post(`/${doctype}`, payload);
            } else if (operation === 'UPDATE' && name) {
                await api.put(`/${doctype}/${name}`, payload);
            } else if (operation === 'DELETE' && name) {
                await api.delete(`/${doctype}/${name}`);
            }

            // Remove from outbox on success
            await item.remove();
            console.log(`Sync: Pushed ${operation} for ${doctype} ${name || ''}`);
        } catch (error: any) {
            console.error(`Sync: Failed to push outbox item ${item.id}:`, error.response?.data || error.message);
            // We might want to implement a retry limit or specific handling for 403/404
            break; // Stop processing further items to preserve order
        }
    }
}

export async function addToOutbox(doctype: string, operation: 'INSERT' | 'UPDATE' | 'DELETE', payload: any, name?: string) {
    const db = await getDB();
    await db.outbox.insert({
        id: crypto.randomUUID(),
        doctype,
        name,
        operation,
        payload,
        created_at: Date.now()
    });
    // Trigger sync if online
    if (navigator.onLine) {
        pushSync();
    }
}
