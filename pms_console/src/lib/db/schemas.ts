export const ReservationSchema = {
    title: 'reservation schema',
    version: 0,
    primaryKey: 'name',
    type: 'object',
    properties: {
        name: { type: 'string', maxLength: 100 },
        guest_name: { type: 'string' },
        reservation_status: { type: 'string', maxLength: 100 },
        check_in_date: { type: 'string', maxLength: 100 },
        check_out_date: { type: 'string' },
        property: { type: 'string' },
        allocated_unit: { type: 'string' },
        unit_category: { type: 'string' },
        total_amount: { type: 'number' },
        modified: { type: 'string', maxLength: 100 },
        creation: { type: 'string' },
        guest_email: { type: 'string' },
        guest_phone: { type: 'string' },
        guest_id_image: { type: 'string' },
        special_requests: { type: 'string' }
    },
    required: ['name', 'modified', 'reservation_status', 'check_in_date'],
    indexes: ['modified', 'reservation_status', 'check_in_date']
};

export const PropertySchema = {
    title: 'property schema',
    version: 0,
    primaryKey: 'name',
    type: 'object',
    properties: {
        name: { type: 'string', maxLength: 100 },
        property_name: { type: 'string' },
        property_type: { type: 'string' },
        location_description: { type: 'string' },
        total_units: { type: 'number' },
        total_rooms: { type: 'number' },
        average_rating: { type: 'number' },
        banner_image: { type: 'string' },
        status: { type: 'string' },
        modified: { type: 'string', maxLength: 100 }
    },
    required: ['name', 'modified', 'property_name'],
    indexes: ['modified']
};

export const InquirySchema = {
    title: 'inquiry schema',
    version: 0,
    primaryKey: 'name',
    type: 'object',
    properties: {
        name: { type: 'string', maxLength: 100 },
        guest_name: { type: 'string' },
        inquiry_status: { type: 'string', maxLength: 100 },
        property_interested: { type: 'string' },
        inquiry_date: { type: 'string' },
        guest_email: { type: 'string' },
        guest_phone: { type: 'string' },
        unit_category: { type: 'string' },
        check_in_date: { type: 'string' },
        check_out_date: { type: 'string' },
        number_of_guests: { type: 'number' },
        modified: { type: 'string', maxLength: 100 }
    },
    required: ['name', 'modified', 'inquiry_status'],
    indexes: ['modified', 'inquiry_status']
};

export const HousekeepingSchema = {
    title: 'housekeeping schema',
    version: 0,
    primaryKey: 'name',
    type: 'object',
    properties: {
        name: { type: 'string', maxLength: 100 },
        unit: { type: 'string' },
        task_type: { type: 'string' },
        status: { type: 'string', maxLength: 100 },
        priority: { type: 'string' },
        scheduled_time: { type: 'string' },
        modified: { type: 'string', maxLength: 100 }
    },
    required: ['name', 'modified', 'status'],
    indexes: ['modified', 'status']
};

export const MaintenanceSchema = {
    title: 'maintenance schema',
    version: 0,
    primaryKey: 'name',
    type: 'object',
    properties: {
        name: { type: 'string', maxLength: 100 },
        issue_title: { type: 'string' },
        unit: { type: 'string' },
        ticket_status: { type: 'string', maxLength: 100 },
        priority: { type: 'string' },
        creation: { type: 'string' },
        modified: { type: 'string', maxLength: 100 }
    },
    required: ['name', 'modified', 'ticket_status'],
    indexes: ['modified', 'ticket_status']
};

export const InvoiceSchema = {
    title: 'invoice schema',
    version: 0,
    primaryKey: 'name',
    type: 'object',
    properties: {
        name: { type: 'string', maxLength: 100 },
        customer_name: { type: 'string' },
        status: { type: 'string', maxLength: 100 },
        grand_total: { type: 'number' },
        due_date: { type: 'string' },
        modified: { type: 'string', maxLength: 100 }
    },
    required: ['name', 'modified', 'status'],
    indexes: ['modified', 'status']
};

export const FolioSchema = {
    title: 'folio schema',
    version: 0,
    primaryKey: 'name',
    type: 'object',
    properties: {
        name: { type: 'string', maxLength: 100 },
        invoice_number: { type: 'string', maxLength: 100 },
        reservation: { type: 'string', maxLength: 100 },
        grand_total: { type: 'number' },
        invoice_status: { type: 'string', maxLength: 100 },
        status: { type: 'string' },
        creation: { type: 'string' },
        modified: { type: 'string', maxLength: 100 }
    },
    required: ['name', 'modified', 'reservation', 'invoice_status'],
    indexes: ['modified', 'reservation', 'invoice_status']
};

export const UnitSchema = {
    title: 'unit schema',
    version: 0,
    primaryKey: 'name',
    type: 'object',
    properties: {
        name: { type: 'string', maxLength: 100 },
        unit_no: { type: 'string' },
        property: { type: 'string', maxLength: 100 },
        unit_category: { type: 'string' },
        status: { type: 'string' },
        modified: { type: 'string', maxLength: 100 }
    },
    required: ['name', 'modified', 'property'],
    indexes: ['modified', 'property']
};

export const GuestSchema = {
    title: 'guest schema',
    version: 0,
    primaryKey: 'name',
    type: 'object',
    properties: {
        name: { type: 'string', maxLength: 100 },
        guest_name: { type: 'string', maxLength: 100 },
        email: { type: 'string' },
        phone: { type: 'string' },
        total_visits: { type: 'number' },
        total_spend: { type: 'number' },
        last_visit_date: { type: 'string' },
        return_guest: { type: 'number' },
        modified: { type: 'string', maxLength: 100 }
    },
    required: ['name', 'modified', 'guest_name'],
    indexes: ['modified', 'guest_name']
};

export const StaffSchema = {
    title: 'staff schema',
    version: 0,
    primaryKey: 'name',
    type: 'object',
    properties: {
        name: { type: 'string', maxLength: 100 },
        staff_name: { type: 'string', maxLength: 100 },
        designation: { type: 'string', maxLength: 100 },
        property: { type: 'string' },
        status: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        modified: { type: 'string', maxLength: 100 }
    },
    required: ['name', 'modified', 'staff_name', 'designation'],
    indexes: ['modified', 'staff_name', 'designation']
};

export const CommunicationSchema = {
    title: 'communication schema',
    version: 0,
    primaryKey: 'name',
    type: 'object',
    properties: {
        name: { type: 'string', maxLength: 100 },
        guest: { type: 'string', maxLength: 100 },
        communication_date: { type: 'string' },
        communication_type: { type: 'string' },
        status: { type: 'string', maxLength: 100 },
        subject: { type: 'string' },
        message: { type: 'string' },
        modified: { type: 'string', maxLength: 100 }
    },
    required: ['name', 'modified', 'guest', 'status'],
    indexes: ['modified', 'guest', 'status']
};

export const PropertyPortfolioSchema = {
    title: 'property portfolio schema',
    version: 0,
    primaryKey: 'name',
    type: 'object',
    properties: {
        name: { type: 'string', maxLength: 100 },
        portfolio_name: { type: 'string' },
        modified: { type: 'string', maxLength: 100 }
    },
    required: ['name', 'modified'],
    indexes: ['modified']
};

export const OutboxSchema = {
    title: 'outbox schema',
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 100 },
        doctype: { type: 'string' },
        name: { type: 'string' }, // The name of the record if it exists, or temp id
        operation: { type: 'string' }, // 'INSERT' | 'UPDATE' | 'DELETE'
        payload: { type: 'object' },
        created_at: { type: 'number' }
    },
    required: ['id', 'doctype', 'operation', 'payload', 'created_at'],
    indexes: ['created_at']
};

export const UnitCategorySchema = {
    title: 'unit category schema',
    version: 0,
    primaryKey: 'name',
    type: 'object',
    properties: {
        name: { type: 'string', maxLength: 100 },
        category_name: { type: 'string' },
        property: { type: 'string' },
        base_rate_per_night: { type: 'number' },
        modified: { type: 'string', maxLength: 100 }
    },
    required: ['name', 'category_name', 'modified'],
    indexes: ['modified']
};
