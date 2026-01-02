import { Model } from '@nozbe/watermelondb'
import { field, text, date, json, readonly } from '@nozbe/watermelondb/decorators'

export class Reservation extends Model {
    static table = 'reservations'

    @text('guest_name') guest_name!: string
    @text('reservation_status') reservation_status!: string
    @text('check_in_date') check_in_date!: string
    @text('check_out_date') check_out_date!: string
    @text('property') property!: string
    @text('allocated_unit') allocated_unit!: string
    @text('unit_category') unit_category!: string
    @field('total_amount') total_amount!: number
    @text('modified') modified!: string
    @text('creation') creation!: string
    @text('guest_email') guest_email!: string
    @text('guest_phone') guest_phone!: string
    @text('guest_id_image') guest_id_image!: string
    @text('special_requests') special_requests!: string
    @field('is_identity_verified') is_identity_verified!: number
    @field('is_rental_agreement_signed') is_rental_agreement_signed!: number
    @field('is_security_deposit_collected') is_security_deposit_collected!: number
    @field('is_checkin_guide_sent') is_checkin_guide_sent!: number
    @field('advance_paid') advance_paid!: number
}

export class Property extends Model {
    static table = 'properties'

    @text('property_name') property_name!: string
    @text('property_type') property_type!: string
    @text('location_description') location_description!: string
    @field('total_units') total_units!: number
    @field('total_rooms') total_rooms!: number
    @field('average_rating') average_rating!: number
    @text('banner_image') banner_image!: string
    @text('status') status!: string
    @text('modified') modified!: string
}

export class Inquiry extends Model {
    static table = 'inquiries'

    @text('guest_name') guest_name!: string
    @text('inquiry_status') inquiry_status!: string
    @text('property_interested') property_interested!: string
    @text('inquiry_date') inquiry_date!: string
    @text('guest_email') guest_email!: string
    @text('guest_phone') guest_phone!: string
    @text('unit_category') unit_category!: string
    @text('check_in_date') check_in_date!: string
    @text('check_out_date') check_out_date!: string
    @field('number_of_guests') number_of_guests!: number
    @text('special_requests') special_requests!: string
    @text('modified') modified!: string
}

export class HousekeepingTask extends Model {
    static table = 'housekeeping_tasks'

    @text('unit') unit!: string
    @text('task_type') task_type!: string
    @text('status') status!: string
    @text('priority') priority!: string
    @text('scheduled_time') scheduled_time!: string
    @text('modified') modified!: string
}

export class MaintenanceTicket extends Model {
    static table = 'maintenance_tickets'

    @text('issue_title') issue_title!: string
    @text('unit') unit!: string
    @text('ticket_status') ticket_status!: string
    @text('priority') priority!: string
    @text('creation') creation!: string
    @text('modified') modified!: string
}

export class Folio extends Model {
    static table = 'folios'

    @text('invoice_number') invoice_number!: string
    @text('reservation') reservation!: string
    @field('grand_total') grand_total!: number
    @text('invoice_status') invoice_status!: string
    @text('status') status!: string
    @text('creation') creation!: string
    @text('modified') modified!: string
}

export class Unit extends Model {
    static table = 'units'

    @text('unit_no') unit_no!: string
    @text('property') property!: string
    @text('unit_category') unit_category!: string
    @text('status') status!: string
    @text('modified') modified!: string
}

export class Guest extends Model {
    static table = 'guests'

    @text('guest_name') guest_name!: string
    @text('email') email!: string
    @text('phone') phone!: string
    @field('total_visits') total_visits!: number
    @field('total_spend') total_spend!: number
    @text('last_visit_date') last_visit_date!: string
    @field('return_guest') return_guest!: number
    @text('modified') modified!: string
}

export class Staff extends Model {
    static table = 'staff'

    @text('staff_name') staff_name!: string
    @text('designation') designation!: string
    @text('role') role!: string
    @text('property') property!: string
    @text('status') status!: string
    @text('email') email!: string
    @text('phone') phone!: string
    @text('modified') modified!: string
}

export class Communication extends Model {
    static table = 'communications'

    @text('guest') guest!: string
    @text('communication_date') communication_date!: string
    @text('communication_type') communication_type!: string
    @text('status') status!: string
    @text('subject') subject!: string
    @text('message') message!: string
    @text('modified') modified!: string
}

export class Portfolio extends Model {
    static table = 'portfolios'

    @text('portfolio_name') portfolio_name!: string
    @text('modified') modified!: string
}

export class UnitCategory extends Model {
    static table = 'unit_categories'

    @text('category_name') category_name!: string
    @text('property') property!: string
    @field('base_rate_per_night') base_rate_per_night!: number
    @text('modified') modified!: string
}

export class GuestQuery extends Model {
    static table = 'guest_queries'

    @text('guest') guest!: string
    @text('reservation') reservation!: string
    @text('status') status!: string
    @text('query_date') query_date!: string
    @text('query_text') query_text!: string
    @text('modified') modified!: string
}

export class PMSItem extends Model {
    static table = 'pms_items'

    @text('item_code') item_code!: string
    @text('item_name') item_name!: string
    @text('category') category!: string
    @text('unit') unit!: string
    @field('current_stock') current_stock!: number
    @field('reorder_level') reorder_level!: number
    @field('valuation_rate') valuation_rate!: number
    @text('modified') modified!: string
}

export class PMSStockEntry extends Model {
    static table = 'pms_stock_entries'

    @text('item') item!: string
    @text('item_code') item_code!: string
    @text('entry_type') entry_type!: string
    @field('quantity') quantity!: number
    @text('date') date!: string
    @text('reference_doctype') reference_doctype!: string
    @text('reference_name') reference_name!: string
    @text('notes') notes!: string
    @text('modified') modified!: string
}

export class PMSAsset extends Model {
    static table = 'pms_assets'

    @text('asset_name') asset_name!: string
    @text('item_link') item_link!: string
    @text('serial_number') serial_number!: string
    @text('status') status!: string
    @text('location') location!: string
    @text('purchase_date') purchase_date!: string
    @text('warranty_expiry') warranty_expiry!: string
    @text('notes') notes!: string
    @text('modified') modified!: string
}

export class Outbox extends Model {
    static table = 'outbox'

    @text('doctype') doctype!: string
    @text('record_id') record_id!: string
    @text('operation') operation!: string
    @text('payload') payload!: string
    @field('created_at') created_at!: number
}

export class ChannelConfig extends Model {
    static table = 'channel_configs'

    @text('channel_name') channel_name!: string
    @text('channel_type') channel_type!: string
    @field('is_active') is_active!: number
    @text('modified') modified!: string
}

export const models = [
    Reservation,
    Property,
    Inquiry,
    HousekeepingTask,
    MaintenanceTicket,
    Folio,
    Unit,
    Guest,
    Staff,
    Communication,
    Portfolio,
    UnitCategory,
    GuestQuery,
    PMSItem,
    PMSStockEntry,
    PMSAsset,
    Outbox,
    ChannelConfig
]
