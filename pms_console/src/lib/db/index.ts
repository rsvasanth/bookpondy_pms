import { Database } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';
import schema from './schema';
import * as Models from './models';

const adapter = new LokiJSAdapter({
    schema,
    useWebWorker: false,
    useIncrementalIndexedDB: true,
    onQuotaExceeded: (error) => {
        console.error('Database quota exceeded:', error);
    },
});

export const database = new Database({
    adapter,
    modelClasses: Models.models,
});

export const getDB = async () => {
    return database;
};

export const DOCTYPES = [
    'Reservation',
    'Property',
    'Housekeeping Task',
    'Maintenance Ticket',
    'Folio',
    'Unit',
    'Guest',
    'Staff',
    'Guest Communication',
    'Property Portfolio',
    'Unit Category',
    'Guest Query',
    'Booking Inquiry',
    'PMS Item',
    'PMS Stock Entry',
    'PMS Asset',
    'Channel Config'
];

console.log('WatermelonDB: Initialized');
