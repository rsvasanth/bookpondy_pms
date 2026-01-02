import { appSchema, tableSchema } from '@nozbe/watermelondb'

export default appSchema({
    version: 1,
    tables: [
        tableSchema({
            name: 'reservations',
            columns: [
                { name: 'guest_name', type: 'string' },
                { name: 'reservation_status', type: 'string', isIndexed: true },
                { name: 'check_in_date', type: 'string', isIndexed: true },
                { name: 'check_out_date', type: 'string' },
                { name: 'property', type: 'string', isIndexed: true },
                { name: 'allocated_unit', type: 'string' },
                { name: 'unit_category', type: 'string' },
                { name: 'total_amount', type: 'number' },
                { name: 'modified', type: 'string', isIndexed: true },
                { name: 'creation', type: 'string' },
                { name: 'guest_email', type: 'string' },
                { name: 'guest_phone', type: 'string' },
                { name: 'guest_id_image', type: 'string' },
                { name: 'special_requests', type: 'string' },
                { name: 'is_identity_verified', type: 'number' },
                { name: 'is_rental_agreement_signed', type: 'number' },
                { name: 'is_security_deposit_collected', type: 'number' },
                { name: 'is_checkin_guide_sent', type: 'number' },
                { name: 'advance_paid', type: 'number' },
            ]
        }),
        tableSchema({
            name: 'properties',
            columns: [
                { name: 'property_name', type: 'string' },
                { name: 'property_type', type: 'string' },
                { name: 'location_description', type: 'string' },
                { name: 'total_units', type: 'number' },
                { name: 'total_rooms', type: 'number' },
                { name: 'average_rating', type: 'number' },
                { name: 'banner_image', type: 'string' },
                { name: 'status', type: 'string' },
                { name: 'modified', type: 'string', isIndexed: true },
            ]
        }),
        tableSchema({
            name: 'inquiries',
            columns: [
                { name: 'guest_name', type: 'string' },
                { name: 'inquiry_status', type: 'string', isIndexed: true },
                { name: 'property_interested', type: 'string' },
                { name: 'inquiry_date', type: 'string' },
                { name: 'guest_email', type: 'string' },
                { name: 'guest_phone', type: 'string' },
                { name: 'unit_category', type: 'string' },
                { name: 'check_in_date', type: 'string' },
                { name: 'check_out_date', type: 'string' },
                { name: 'number_of_guests', type: 'number' },
                { name: 'special_requests', type: 'string' },
                { name: 'modified', type: 'string', isIndexed: true },
            ]
        }),
        tableSchema({
            name: 'housekeeping_tasks',
            columns: [
                { name: 'unit', type: 'string', isIndexed: true },
                { name: 'task_type', type: 'string' },
                { name: 'status', type: 'string', isIndexed: true },
                { name: 'priority', type: 'string' },
                { name: 'scheduled_time', type: 'string' },
                { name: 'modified', type: 'string', isIndexed: true },
            ]
        }),
        tableSchema({
            name: 'maintenance_tickets',
            columns: [
                { name: 'issue_title', type: 'string' },
                { name: 'unit', type: 'string', isIndexed: true },
                { name: 'ticket_status', type: 'string', isIndexed: true },
                { name: 'priority', type: 'string' },
                { name: 'creation', type: 'string' },
                { name: 'modified', type: 'string', isIndexed: true },
            ]
        }),
        tableSchema({
            name: 'folios',
            columns: [
                { name: 'invoice_number', type: 'string' },
                { name: 'reservation', type: 'string', isIndexed: true },
                { name: 'grand_total', type: 'number' },
                { name: 'invoice_status', type: 'string', isIndexed: true },
                { name: 'status', type: 'string' },
                { name: 'creation', type: 'string' },
                { name: 'modified', type: 'string', isIndexed: true },
            ]
        }),
        tableSchema({
            name: 'units',
            columns: [
                { name: 'unit_no', type: 'string' },
                { name: 'property', type: 'string', isIndexed: true },
                { name: 'unit_category', type: 'string' },
                { name: 'status', type: 'string' },
                { name: 'modified', type: 'string', isIndexed: true },
            ]
        }),
        tableSchema({
            name: 'guests',
            columns: [
                { name: 'guest_name', type: 'string', isIndexed: true },
                { name: 'email', type: 'string' },
                { name: 'phone', type: 'string' },
                { name: 'total_visits', type: 'number' },
                { name: 'total_spend', type: 'number' },
                { name: 'last_visit_date', type: 'string' },
                { name: 'return_guest', type: 'number' },
                { name: 'modified', type: 'string', isIndexed: true },
            ]
        }),
        tableSchema({
            name: 'staff',
            columns: [
                { name: 'staff_name', type: 'string' },
                { name: 'designation', type: 'string' },
                { name: 'role', type: 'string' },
                { name: 'property', type: 'string', isIndexed: true },
                { name: 'status', type: 'string' },
                { name: 'email', type: 'string' },
                { name: 'phone', type: 'string' },
                { name: 'modified', type: 'string', isIndexed: true },
            ]
        }),
        tableSchema({
            name: 'communications',
            columns: [
                { name: 'guest', type: 'string', isIndexed: true },
                { name: 'communication_date', type: 'string' },
                { name: 'communication_type', type: 'string' },
                { name: 'status', type: 'string', isIndexed: true },
                { name: 'subject', type: 'string' },
                { name: 'message', type: 'string' },
                { name: 'modified', type: 'string', isIndexed: true },
            ]
        }),
        tableSchema({
            name: 'portfolios',
            columns: [
                { name: 'portfolio_name', type: 'string' },
                { name: 'modified', type: 'string', isIndexed: true },
            ]
        }),
        tableSchema({
            name: 'unit_categories',
            columns: [
                { name: 'category_name', type: 'string' },
                { name: 'property', type: 'string', isIndexed: true },
                { name: 'base_rate_per_night', type: 'number' },
                { name: 'modified', type: 'string', isIndexed: true },
            ]
        }),
        tableSchema({
            name: 'guest_queries',
            columns: [
                { name: 'guest', type: 'string', isIndexed: true },
                { name: 'reservation', type: 'string', isIndexed: true },
                { name: 'status', type: 'string', isIndexed: true },
                { name: 'query_date', type: 'string' },
                { name: 'query_text', type: 'string' },
                { name: 'modified', type: 'string', isIndexed: true },
            ]
        }),
        tableSchema({
            name: 'pms_items',
            columns: [
                { name: 'item_code', type: 'string', isIndexed: true },
                { name: 'item_name', type: 'string' },
                { name: 'category', type: 'string' },
                { name: 'unit', type: 'string' },
                { name: 'current_stock', type: 'number' },
                { name: 'reorder_level', type: 'number' },
                { name: 'valuation_rate', type: 'number' },
                { name: 'modified', type: 'string', isIndexed: true },
            ]
        }),
        tableSchema({
            name: 'pms_stock_entries',
            columns: [
                { name: 'item', type: 'string', isIndexed: true },
                { name: 'item_code', type: 'string' },
                { name: 'entry_type', type: 'string' },
                { name: 'quantity', type: 'number' },
                { name: 'date', type: 'string' },
                { name: 'reference_doctype', type: 'string' },
                { name: 'reference_name', type: 'string' },
                { name: 'notes', type: 'string' },
                { name: 'modified', type: 'string', isIndexed: true },
            ]
        }),
        tableSchema({
            name: 'pms_assets',
            columns: [
                { name: 'asset_name', type: 'string' },
                { name: 'item_link', type: 'string', isIndexed: true },
                { name: 'serial_number', type: 'string' },
                { name: 'status', type: 'string' },
                { name: 'location', type: 'string', isIndexed: true },
                { name: 'purchase_date', type: 'string' },
                { name: 'warranty_expiry', type: 'string' },
                { name: 'notes', type: 'string' },
                { name: 'modified', type: 'string', isIndexed: true },
            ]
        }),
        tableSchema({
            name: 'outbox',
            columns: [
                { name: 'doctype', type: 'string', isIndexed: true },
                { name: 'record_id', type: 'string', isIndexed: true },
                { name: 'operation', type: 'string' },
                { name: 'payload', type: 'string' }, // JSON stringified payload
                { name: 'created_at', type: 'number', isIndexed: true },
            ]
        }),
    ]
})
