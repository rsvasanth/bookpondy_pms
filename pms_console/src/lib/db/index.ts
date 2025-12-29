import { createRxDatabase, addRxPlugin } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import {
    ReservationSchema,
    PropertySchema,
    InquirySchema,
    HousekeepingSchema,
    MaintenanceSchema,
    InvoiceSchema,
    UnitSchema,
    FolioSchema,
    GuestSchema,
    StaffSchema,
    CommunicationSchema,
    PropertyPortfolioSchema,
    OutboxSchema,
    UnitCategorySchema,
    GuestQuerySchema
} from './schemas';

// Register plugins
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBUpdatePlugin);

let dbPromise: Promise<any> | null = null;

const create = async () => {
    const db = await createRxDatabase({
        name: 'pms_console_db_v11',
        storage: getRxStorageDexie(),
    });

    await db.addCollections({
        reservations: { schema: ReservationSchema },
        properties: { schema: PropertySchema },
        inquiries: { schema: InquirySchema },
        housekeeping: { schema: HousekeepingSchema },
        maintenance: { schema: MaintenanceSchema },
        invoices: { schema: InvoiceSchema },
        units: { schema: UnitSchema },
        folios: { schema: FolioSchema },
        guests: { schema: GuestSchema },
        staff: { schema: StaffSchema },
        communications: { schema: CommunicationSchema },
        portfolios: { schema: PropertyPortfolioSchema },
        outbox: { schema: OutboxSchema },
        unit_categories: { schema: UnitCategorySchema },
        guest_queries: { schema: GuestQuerySchema },
    });

    console.log('RxDB: Database initialized');
    return db;
};

export const getDB = () => {
    if (!dbPromise) {
        dbPromise = create();
    }
    return dbPromise;
};
