// Copyright (c) 2025, vasanth ranganathan and contributors
// For license information, please see license.txt

frappe.ui.form.on("Reservation", {
    refresh(frm) {
        // Standard refresh logic
    },
    check_in_date(frm) {
        frm.trigger("calculate_nights");
    },
    check_out_date(frm) {
        frm.trigger("calculate_nights");
    },
    room_rate_per_night(frm) {
        frm.trigger("calculate_totals");
    },
    discount_amount(frm) {
        frm.trigger("calculate_totals");
    },
    calculate_nights(frm) {
        if (frm.doc.check_in_date && frm.doc.check_out_date) {
            const nights = frappe.datetime.get_diff(frm.doc.check_out_date, frm.doc.check_in_date);
            if (nights >= 0) {
                frm.set_value("nights", nights);
                frm.trigger("calculate_totals");
            } else {
                frappe.msgprint(__("Check-out date must be after Check-in date"));
                frm.set_value("check_out_date", "");
            }
        }
    },
    calculate_totals(frm) {
        const subtotal = flt(frm.doc.room_rate_per_night) * flt(frm.doc.nights);
        frm.set_value("subtotal_room_charges", subtotal);

        const total = subtotal + flt(frm.doc.extras_and_services) - flt(frm.doc.discount_amount);
        frm.set_value("total_amount", total);
    }
});
