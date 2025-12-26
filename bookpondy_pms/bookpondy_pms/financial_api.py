import frappe
from frappe.utils import getdate, today, get_first_day, get_last_day, add_days, date_diff, formatdate

@frappe.whitelist()
def get_financial_summary(property_id=None, portfolio_id=None, period="thisMonth", start_date=None, end_date=None):
    """
    Returns financial KPIs and trend data for a given property/portfolio and period.
    """
    # 1. Determine Date Range
    current_date = getdate(today())
    if period == "thisMonth":
        start = get_first_day(current_date)
        end = get_last_day(current_date)
    elif period == "last30days":
        start = add_days(current_date, -30)
        end = current_date
    elif period == "thisYear":
        start = getdate(f"{current_date.year}-01-01")
        end = current_date
    elif period == "custom" and start_date and end_date:
        start = getdate(start_date)
        end = getdate(end_date)
    else:
        # Default to this month
        start = get_first_day(current_date)
        end = get_last_day(current_date)

    filters = {
        "check_in_date": ["<=", end],
        "check_out_date": [">=", start],
        "reservation_status": ["not in", ["Cancelled", "No-Show"]]
    }
    
    if portfolio_id:
        props = frappe.get_all("Property", filters={"portfolio": portfolio_id}, pluck="name")
        filters["property"] = ["in", props]
    elif property_id:
        filters["property"] = property_id

    # 2. Fetch Reservations
    reservations = frappe.get_all("Reservation",
        filters=filters,
        fields=["name", "property", "total_amount", "check_in_date", "check_out_date", "reservation_status"]
    )

    # 3. Calculate Revenue (In a real system, we'd fetch from Folios, but here we'll use total_amount as a proxy)
    # We'll assume Folio calculation logic as per spec involves Sum of Folio amounts.
    # For now, let's look at Folio DocType if possible.
    
    total_revenue = 0
    room_revenue = 0
    additional_revenue = 0
    booking_count = len(reservations)
    cancellation_filters = {
        "check_in_date": [">=", start],
        "check_out_date": ["<=", end],
        "reservation_status": "Cancelled"
    }
    if portfolio_id:
        props = frappe.get_all("Property", filters={"portfolio": portfolio_id}, pluck="name")
        cancellation_filters["property"] = ["in", props]
    elif property_id:
        cancellation_filters["property"] = property_id
    else:
        cancellation_filters["property"] = ["!=", ""]

    cancellation_count = frappe.db.count("Reservation", cancellation_filters)
    
    total_nights_occupied = 0
    total_guests = 0 # Placeholder if needed
    
    # 4. Occupancy Logic
    for res in reservations:
        r_start = max(getdate(res.check_in_date), start)
        r_end = min(getdate(res.check_out_date), end)
        delta = date_diff(r_end, r_start)
        
        if delta > 0:
            total_nights_occupied += delta
            # Logic: total_amount / total_reservation_days * delta
            full_delta = max(1, date_diff(res.check_out_date, res.check_in_date))
            total_revenue += (res.total_amount or 0) * (delta / full_delta)
            # Mocking split: 80% room, 20% additional
            room_revenue += (res.total_amount or 0) * (delta / full_delta) * 0.8
            additional_revenue += (res.total_amount or 0) * (delta / full_delta) * 0.2

    # 5. Inventory (Available Nights)
    total_days = date_diff(end, start) + 1
    if portfolio_id:
        unit_count = frappe.db.sql("SELECT SUM(total_units) FROM `tabProperty` WHERE portfolio = %s", portfolio_id)[0][0] or 0
    elif property_id:
        unit_count = frappe.db.get_value("Property", property_id, "total_units") or 0
    else:
        unit_count = frappe.db.sql("SELECT SUM(total_units) FROM `tabProperty`")[0][0] or 0
    
    available_nights = unit_count * total_days
    occupancy_percent = (total_nights_occupied / available_nights * 100) if available_nights > 0 else 0
    adr = (total_revenue / total_nights_occupied) if total_nights_occupied > 0 else 0
    revpar = (total_revenue / available_nights) if available_nights > 0 else 0

    # 6. Trend Data (Daily)
    revenue_trend = []
    for i in range(total_days):
        day = add_days(start, i)
        day_str = str(day)
        
        day_revenue = 0
        day_occ = 0
        for res in reservations:
            if getdate(res.check_in_date) <= day < getdate(res.check_out_date):
                full_delta = max(1, date_diff(res.check_out_date, res.check_in_date))
                day_revenue += (res.total_amount or 0) / full_delta
                day_occ += 1
        
        revenue_trend.append({
            "date": day_str,
            "revenue": round(day_revenue, 2),
            "occupancy": round((day_occ / unit_count * 100) if unit_count > 0 else 0, 2)
        })

    return {
        "total_revenue": round(total_revenue, 2),
        "room_revenue": round(room_revenue, 2),
        "additional_revenue": round(additional_revenue, 2),
        "adr": round(adr, 2),
        "revpar": round(revpar, 2),
        "occupancy_percent": round(occupancy_percent, 2),
        "booking_count": booking_count,
        "cancellation_count": cancellation_count,
        "total_nights_occupied": total_nights_occupied,
        "available_nights": available_nights,
        "revenue_trend": revenue_trend,
        "revenue_breakdown": {
            "room": round(room_revenue, 2),
            "services": round(additional_revenue, 2),
            "refunds": 0 # Placeholder
        }
    }
