import frappe
from frappe.utils import add_days, now_datetime, getdate, flt, today
import random

def create_demo_data():
    frappe.set_user("Administrator")
    admin_user = "Administrator"
    
    # Clean up existing operational data
    print("Cleaning up existing operational data...")
    doctypes_to_clear = [
        "Transaction", "Folio Tax Summary", "Folio", "Charge",
        "Housekeeping Task Issue", "Housekeeping Task Checklist", "Housekeeping Task",
        "Maintenance Ticket Parts", "Maintenance Ticket", "Reservation",
        "Booking Inquiry", "Financial Period Summary"
    ]
    for dt in doctypes_to_clear:
        frappe.db.delete(dt)
    
    frappe.db.commit()
    print("Cleanup complete.")

    # 1. Property Portfolios
    portfolios = [
        {"portfolio_name": "Luxury Collection", "description": "Premium villas and boutique hotels."},
        {"portfolio_name": "City Stays", "description": "Convenient apartments and business hotels."}
    ]
    
    portfolio_docs = []
    for p in portfolios:
        existing = frappe.db.get_value("Property Portfolio", {"portfolio_name": p["portfolio_name"]}, "name")
        if not existing:
            doc = frappe.get_doc({
                "doctype": "Property Portfolio",
                "naming_series": "PORT-.YYYY.-.#####",
                "portfolio_name": p["portfolio_name"],
                "owner_user": admin_user,
                "description": p["description"]
            }).insert(ignore_permissions=True)
            portfolio_docs.append(doc.name)
        else:
            portfolio_docs.append(existing)

    # 2. Properties
    properties = [
        {
            "property_name": "Villa Serenity",
            "property_type": "Villa",
            "portfolio": portfolio_docs[0],
            "status": "Active",
            "location_description": "White Town, Pondicherry",
            "total_units": 5
        },
        {
            "property_name": "Azure Breeze Resort",
            "property_type": "Resort",
            "portfolio": portfolio_docs[0],
            "status": "Active",
            "location_description": "Serenity Beach, Pondicherry",
            "total_units": 10
        }
    ]

    property_docs = []
    for p in properties:
        existing = frappe.db.get_value("Property", {"property_name": p["property_name"]}, "name")
        if not existing:
            doc = frappe.get_doc({
                "doctype": "Property",
                "naming_series": "PROP-.YYYY.-.#####",
                "property_name": p["property_name"],
                "property_type": p["property_type"],
                "portfolio": p["portfolio"],
                "status": p["status"],
                "location_description": p["location_description"],
                "total_units": p["total_units"]
            }).insert(ignore_permissions=True)
            property_docs.append(doc.name)
        else:
            property_docs.append(existing)

    # 3. Staff
    designations = ["Housekeeping", "Receptionist", "Maintenance", "Manager"]
    staff_docs = []
    for prop in property_docs:
        for des in designations:
            name = f"{des} at {prop}"
            existing = frappe.db.get_value("Staff", {"staff_name": name, "property": prop}, "name")
            if not existing:
                doc = frappe.get_doc({
                    "doctype": "Staff",
                    "naming_series": "STF-.YYYY.-.#####",
                    "staff_name": name,
                    "designation": des,
                    "property": prop,
                    "status": "Active",
                    "email": f"{des.lower().replace(' ', '_')}@{prop.lower().replace(' ', '')}.com",
                    "phone": f"+91 {random.randint(7000000000, 9999999999)}"
                }).insert(ignore_permissions=True)
                staff_docs.append(doc.name)
            else:
                staff_docs.append(existing)

    # 4. Amenities (Child Table)
    amenity_list = ["Free Wi-Fi", "Swimming Pool", "Air Conditioning", "Ocean View", "Parking", "Kitchen"]
    for prop in property_docs:
        for a_name in amenity_list:
            if not frappe.db.exists("Property Amenity", {"parent": prop, "amenity": a_name}):
                frappe.get_doc({
                    "doctype": "Property Amenity",
                    "parent": prop,
                    "parenttype": "Property",
                    "parentfield": "amenities",
                    "amenity": a_name
                }).insert(ignore_permissions=True)

    # 5. Unit Categories
    categories = ["Standard", "Deluxe", "Suite"]
    cat_docs = []
    for prop in property_docs:
        for cat in categories:
            existing = frappe.db.get_value("Unit Category", {"category_name": cat, "property": prop}, "name")
            if not existing:
                doc = frappe.get_doc({
                    "doctype": "Unit Category",
                    "naming_series": "UC-.YYYY.-.#####",
                    "category_name": cat,
                    "property": prop,
                    "unit_type": "Room",
                    "base_rate_per_night": random.randint(3000, 15000),
                    "description": f"Beautiful {cat} room at {prop}"
                }).insert(ignore_permissions=True)
                cat_docs.append(doc.name)
            else:
                cat_docs.append(existing)

    # 6. Units
    unit_docs = []
    for prop in property_docs:
        prop_cats = frappe.get_all("Unit Category", filters={"property": prop}, fields=["name"])
        for i in range(1, 6):
            unit_no = f"{i:02}"
            existing = frappe.db.get_value("Unit", {"unit_no": unit_no, "property": prop}, "name")
            if not existing:
                doc = frappe.get_doc({
                    "doctype": "Unit",
                    "naming_series": "UNT-.YYYY.-.#####",
                    "unit_no": unit_no,
                    "property": prop,
                    "unit_category": random.choice(prop_cats).name,
                    "status": "Available"
                }).insert(ignore_permissions=True)
                unit_docs.append(doc.name)
            else:
                unit_docs.append(existing)

    # 7. Guests
    guests = [
        {"guest_name": "Arun Kumar", "email": "arun@example.com", "phone": "+91 9876543210"},
        {"guest_name": "Priya Sharma", "email": "priya@example.com", "phone": "+91 8765432109"}
    ]
    guest_docs = []
    for g in guests:
        existing = frappe.db.get_value("Guest", {"email": g["email"]}, "name")
        if not existing:
            doc = frappe.get_doc({
                "doctype": "Guest",
                "guest_name": g["guest_name"],
                "email": g["email"],
                "phone": g["phone"]
            }).insert(ignore_permissions=True)
            guest_docs.append(doc.name)
        else:
            guest_docs.append(existing)

    # 8. Channels
    channels = [
        {"channel_name": "Booking.com", "channel_type": "OTA"},
        {"channel_name": "Direct", "channel_type": "Direct"}
    ]
    channel_docs = []
    for c in channels:
        existing = frappe.db.get_value("Channel Config", {"channel_name": c["channel_name"]}, "name")
        if not existing:
            doc = frappe.get_doc({
                "doctype": "Channel Config",
                "channel_name": c["channel_name"],
                "channel_type": c["channel_type"],
                "is_active": 1
            }).insert(ignore_permissions=True)
            channel_docs.append(doc.name)
        else:
            channel_docs.append(existing)

    # 9. Rate Plans
    for cat in cat_docs:
        cat_doc = frappe.get_doc("Unit Category", cat)
        existing = frappe.db.get_value("Rate Plan", {"plan_name": "Standard Rate", "unit_category": cat}, "name")
        if not existing:
            frappe.get_doc({
                "doctype": "Rate Plan",
                "naming_series": "RP-.YYYY.-.#####",
                "plan_name": "Standard Rate",
                "unit_category": cat,
                "property": cat_doc.property,
                "base_rate": cat_doc.base_rate_per_night
            }).insert(ignore_permissions=True)

    # 10. Reservations & Folios & Charges & Transactions
    today_date = getdate()
    for i in range(15):
        guest_doc_name = random.choice(guest_docs)
        unit_doc_name = random.choice(unit_docs)
        unit_doc = frappe.get_doc("Unit", unit_doc_name)
        
        # Ensure we don't overlap within the script's loop by adding an offset per iteration
        start_offset = random.randint(-20, 15)
        stay_len = random.randint(1, 4)
        check_in = add_days(today_date, start_offset)
        check_out = add_days(check_in, stay_len)
        
        res_status = "Confirmed"
        if start_offset < -5: res_status = "Checked-Out"
        elif start_offset <= 0: res_status = "Checked-In"

        # Check for overlap within current iteration to be safe
        overlap = frappe.db.exists("Reservation", {
            "allocated_unit": unit_doc_name,
            "reservation_status": ["in", ["Confirmed", "Checked-In", "Tentative"]],
            "check_in_date": ["<", check_out],
            "check_out_date": [">", check_in]
        })
        if overlap: continue

        res = frappe.get_doc({
            "doctype": "Reservation",
            "naming_series": "RES-.YYYY.-.#####",
            "property": unit_doc.property,
            "guest": guest_doc_name,
            "reservation_status": res_status,
            "unit_category": unit_doc.unit_category,
            "allocated_unit": unit_doc.name,
            "check_in_date": check_in,
            "check_out_date": check_out,
            "reservation_source": "Direct",
            "source_channel": random.choice(channel_docs),
            "room_rate_per_night": random.randint(3000, 8000),
            "total_amount": random.randint(5000, 20000),
            "payment_status": "Received" if res_status == "Checked-Out" else "Pending"
        }).insert(ignore_permissions=True)

        # Create Charges linked to Reservation
        frappe.get_doc({
            "doctype": "Charge",
            "naming_series": "CHG-.YYYY.-.#####",
            "reservation": res.name,
            "charge_type": "Room",
            "unit_rate": res.total_amount,
            "quantity": 1
        }).insert(ignore_permissions=True)

        # Create Folio for each reservation
        folio = frappe.get_doc({
            "doctype": "Folio",
            "naming_series": "FOL-.YYYY.-.#####",
            "reservation": res.name,
            "guest": guest_doc_name,
            "property": unit_doc.property,
            "status": "Paid" if res_status == "Checked-Out" else "Draft",
            "subtotal": res.total_amount,
            "total_tax": res.total_amount * 0.12,
            "grand_total": res.total_amount * 1.12
        }).insert(ignore_permissions=True)

        # Add dummy tax to Folio child table
        frappe.get_doc({
            "doctype": "Folio Tax Summary",
            "parent": folio.name,
            "parenttype": "Folio",
            "parentfield": "tax_summary",
            "tax_type": "GST 12%",
            "rate": 12,
            "amount": res.total_amount * 0.12
        }).insert(ignore_permissions=True)

        # Create Transaction linked to Folio
        if res_status == "Checked-Out" or random.random() > 0.5:
            frappe.get_doc({
                "doctype": "Transaction",
                "naming_series": "TXN-.YYYY.-.#####",
                "folio": folio.name,
                "amount": res.total_amount * 1.12 if res_status == "Checked-Out" else random.randint(1000, 5000),
                "payment_mode": "UPI"
            }).insert(ignore_permissions=True)

    # 11. Housekeeping Tasks & Issues
    for unit_name in unit_docs:
        unit_doc = frappe.get_doc("Unit", unit_name)
        task = frappe.get_doc({
            "doctype": "Housekeeping Task",
            "naming_series": "HK-.YYYY.-.#####",
            "property_link": unit_doc.property,
            "unit": unit_name,
            "task_type": random.choice(["Cleaning", "Check-In Cleaning", "Deep Clean"]),
            "priority": random.choice(["Normal", "High", "Urgent"]),
            "status": random.choice(["Pending", "In Progress", "Completed"]),
            "notes": "Generated by demo script"
        }).insert(ignore_permissions=True)
        
        # Add checklist item
        frappe.get_doc({
            "doctype": "Housekeeping Task Checklist",
            "parent": task.name,
            "parenttype": "Housekeeping Task",
            "parentfield": "checklist",
            "item": "Change Linens",
            "is_completed": 1 if task.status == "Completed" else 0
        }).insert(ignore_permissions=True)

    # 12. Maintenance Tickets
    issues = ["AC Leak", "Bulb Replacement", "Tap Fix", "Door Lock Issue"]
    for i in range(8):
        unit_name = random.choice(unit_docs)
        frappe.get_doc({
            "doctype": "Maintenance Ticket",
            "naming_series": "MNT-.YYYY.-.#####",
            "unit": unit_name,
            "issue_title": random.choice(issues),
            "priority": random.choice(["High", "Critical"]),
            "ticket_status": random.choice(["Open", "In Progress", "Resolved"])
        }).insert(ignore_permissions=True)

    # 13. Financial Period Summary
    for i in range(5):
        date = add_days(today_date, -(i * 30))
        frappe.get_doc({
            "doctype": "Financial Period Summary",
            "property": random.choice(property_docs),
            "period_start_date": add_days(date, -30),
            "period_end_date": date,
            "total_revenue": random.randint(100000, 500000),
            "booking_count": random.randint(20, 50),
            "occupancy_percent": random.randint(60, 95)
        }).insert(ignore_permissions=True)

    # 14. Booking Inquiries
    inquiry_sources = ["Website", "Phone", "Email", "Walk-in"]
    for i in range(10):
        frappe.get_doc({
            "doctype": "Booking Inquiry",
            "naming_series": "BI-.YYYY.-.#####",
            "guest_name": f"Inquiry Guest {i}",
            "email": f"inquiry{i}@example.com",
            "phone": f"+91 900000000{i}",
            "property": random.choice(property_docs),
            "source": random.choice(inquiry_sources),
            "status": random.choice(["Pending", "Converted", "Lost"])
        }).insert(ignore_permissions=True)

    frappe.db.commit()
    print("Comprehensive demo data created successfully across all available DocTypes (with cleanup).")

if __name__ == "__main__":
    create_demo_data()
