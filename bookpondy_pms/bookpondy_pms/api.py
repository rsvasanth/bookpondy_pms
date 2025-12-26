# Copyright (c) 2025, vasanth ranganathan and contributors
# For license information, please see license.txt

import frappe
from frappe.utils import getdate, today, get_first_day, get_last_day, add_days, date_diff

@frappe.whitelist()
def get_property_details(property_id):
	"""Returns property details for marketplace listing"""
	doc = frappe.get_doc("Property", property_id)
	return {
		"name": doc.property_name,
		"type": doc.property_type,
		"description": doc.description,
		"amenities": [a.amenity for a in doc.amenities], # Assuming table field
		"images": [i.image for i in doc.images],
		"check_in": doc.check_in_time,
		"check_out": doc.check_out_time
	}

@frappe.whitelist()
def get_availability(property_id, check_in, check_out):
	"""Returns room type availability for given dates"""
	# Logic to check overlaps in Reservation DocType
	room_types = frappe.get_all("Room Type", filters={"property": property_id}, fields=["name", "base_rate_per_night"])
	availability = []
	
	for rt in room_types:
		# Simplified: room_count - booked_count
		total_rooms = frappe.db.count("Room", {"room_type": rt.name})
		booked_rooms = frappe.db.count("Reservation", {
			"room_type": rt.name,
			"reservation_status": ["not in", ["Cancelled", "No-Show"]],
			"check_in_date": ["<", check_out],
			"check_out_date": [">", check_in]
		})
		
		availability.append({
			"room_type": rt.name,
			"available_count": max(0, total_rooms - booked_rooms),
			"rate": rt.base_rate_per_night
		})
		
	return availability

@frappe.whitelist()
def create_marketplace_reservation(booking_data):
	"""Creates a reservation from marketplace data"""
	# Expects booking_data as a dict
	try:
		res = frappe.get_doc({
			"doctype": "Reservation",
			"property": booking_data.get("property"),
			"guest_name": booking_data.get("guest_name"),
			"guest_email": booking_data.get("guest_email"),
			"guest_phone": booking_data.get("guest_phone"),
			"check_in_date": booking_data.get("check_in"),
			"check_out_date": booking_data.get("check_out"),
			"room_type": booking_data.get("room_type"),
			"reservation_source": "BookPondi",
			"marketplace_booking_id": booking_data.get("marketplace_id"),
			"reservation_status": "Confirmed"
		})
		res.insert(ignore_permissions=True)
		return {"status": "success", "reservation_id": res.name}
	except Exception as e:
		frappe.log_error(f"Marketplace Reservation Error: {str(e)}")
		return {"status": "error", "message": str(e)}

@frappe.whitelist()
def get_console_property_details(property_id):
	"""
	Returns consolidated property details including:
	- Property Document (with child tables if any)
	- Unit Categories (with their amenities and images)
	- Units
	- Occupancy Data (Daily booked count per category for current month)
	"""
	if not property_id:
		return {}

	# 1. Fetch main property doc
	prop_doc = frappe.get_doc("Property", property_id)
	
	# 2. Fetch Unit Categories linked to this property
	categories = frappe.get_all("Unit Category", 
		filters={"property": property_id}, 
		fields=["*"]
	)
	
	for cat in categories:
		cat_doc = frappe.get_doc("Unit Category", cat.name)
		cat["images"] = [row.as_dict() for row in cat_doc.images]
		cat["amenities"] = [row.as_dict() for row in cat_doc.amenities]

	# 3. Fetch Units
	units = frappe.get_all("Unit", 
		filters={"property": property_id}, 
		fields=["*"]
	)

	# 4. Calculate Occupancy for Current Month
	current_date = getdate(today())
	month_start = get_first_day(current_date)
	month_end = get_last_day(current_date)

	reservations = frappe.get_all("Reservation",
		filters={
			"property": property_id,
			"check_in_date": ["<=", month_end],
			"check_out_date": [">=", month_start],
			"reservation_status": ["!=", "Cancelled"]
		},
		fields=["room_type", "check_in_date", "check_out_date"]
	)

	occupancy_data = {} # { "Room Type": { "YYYY-MM-DD": count } }

	for res in reservations:
		# Calculate overlap with current month
		start = max(getdate(res.check_in_date), getdate(month_start))
		end = min(getdate(res.check_out_date), getdate(month_end))
		
		# Reservation is technically for the night OF check_in_date, until check_out_date morning.
		# So if check_in=1st, check_out=2nd, night of 1st is occupied.
		delta = date_diff(end, start)
		
		if delta > 0:
			for i in range(delta):
				day = add_days(start, i)
				d_str = str(day)
				
				if res.room_type not in occupancy_data:
					occupancy_data[res.room_type] = {}
				
				occupancy_data[res.room_type][d_str] = occupancy_data[res.room_type].get(d_str, 0) + 1

	return {
		"property": prop_doc.as_dict(),
		"unit_categories": categories,
		"units": units,
		"occupancy_data": occupancy_data
	}

@frappe.whitelist()
def get_dashboard_stats():
	"""
	Returns consolidated stats for the dashboard:
	- Revenue (Total from Folios)
	- Occupancy %
	- Active Bookings count
	- Maintenance Tickets count
	- Arrivals & Departures today
	- Housekeeping count
	- Recent Activity (Latest 5 actions)
	- Critical Alerts
	"""
	# 1. Total Revenue (Grand Total of Paid/Finalized Folios)
	folios = frappe.get_all("Folio", 
		filters={"status": ["in", ["Posted", "Paid"]]}, 
		fields=["grand_total"]
	)
	total_revenue = sum(frappe.utils.flt(f.grand_total) for f in folios)

	# 2. Occupancy % (Units occupied today / Total units)
	total_units = frappe.db.count("Unit")
	occupied_units = frappe.db.count("Unit", {"status": "Occupied"})
	occupancy = (occupied_units / total_units * 100) if total_units > 0 else 0

	# 3. Active Bookings (Confirmed or Checked-In today)
	active_bookings = frappe.db.count("Reservation", {
		"reservation_status": ["in", ["Confirmed", "Checked-In"]],
		"check_in_date": ["<=", today()],
		"check_out_date": [">", today()]
	})

	# 4. Maintenance Tickets (Open/Pending)
	maintenance_tickets = frappe.db.count("Maintenance Ticket", {
		"ticket_status": ["in", ["Open", "Assigned", "In Progress", "On Hold"]]
	})

	# 5. Arrivals & Departures Today
	arrivals_today = frappe.db.count("Reservation", {
		"check_in_date": today(),
		"reservation_status": ["in", ["Confirmed", "Checked-In"]]
	})
	departures_today = frappe.db.count("Reservation", {
		"check_out_date": today(),
		"reservation_status": ["in", ["Checked-In", "Checked-Out"]]
	})

	# 6. Housekeeping Tasks (Pending)
	housekeeping_count = frappe.db.count("Housekeeping Task", {
		"status": ["in", ["Pending", "In Progress"]]
	})

	# 7. Recent Activity (Latest 5 reservations)
	recent_activity = frappe.get_all("Reservation",
		fields=["name", "guest_name", "property", "check_in_date", "creation"],
		limit=5,
		order_by="creation desc"
	)

	# 8. Revenue Trend (Last 7 days)
	revenue_trend = []
	for i in range(7):
		date = add_days(today(), -i)
		daily_revenue = frappe.db.get_value("Folio", 
			{"invoice_date": date, "status": ["in", ["Posted", "Paid"]]}, 
			"sum(grand_total)"
		) or 0
		revenue_trend.append({
			"day": getdate(date).strftime("%a"),
			"value": flt(daily_revenue)
		})
	revenue_trend.reverse()

	# 9. Reservation Status Breakdown (Donut)
	status_counts = frappe.db.get_all("Reservation",
		filters={"reservation_status": ["in", ["Confirmed", "Checked-In", "Checked-Out"]]},
		group_by="reservation_status",
		fields=["reservation_status as name", "count(name) as value"]
	)

	# 10. Critical Alerts
	alerts = []
	
	# Upcoming check-ins today remains 'Confirmed'
	checkins_today_alerts = frappe.get_all("Reservation",
		filters={"check_in_date": today(), "reservation_status": "Confirmed"},
		fields=["name", "guest_name", "property"]
	)
	for c in checkins_today_alerts:
		alerts.append({
			"type": "checkin",
			"id": c.name,
			"title": f"Guest Arriving: {c.guest_name}",
			"description": f"Check-in pending for {c.property}.",
			"severity": "high"
		})

	# High priority maintenance
	urgent_maintenance = frappe.get_all("Maintenance Ticket",
		filters={"priority": ["in", ["High", "Critical", "Emergency"]], "ticket_status": ["not in", ["Resolved", "Closed"]]},
		fields=["name", "issue_title", "property_link", "unit"]
	)
	for m in urgent_maintenance:
		alerts.append({
			"type": "maintenance",
			"id": m.name,
			"title": f"Priority Maint: {m.issue_title}",
			"description": f"Unit {m.unit} at {m.property_link}.",
			"severity": "critical"
		})

	return {
		"revenue": total_revenue,
		"occupancy": occupancy,
		"active_bookings": active_bookings,
		"maintenance_count": maintenance_tickets,
		"arrivals_today": arrivals_today,
		"departures_today": departures_today,
		"housekeeping_count": housekeeping_count,
		"recent_activity": recent_activity,
		"revenue_trend": revenue_trend,
		"status_counts": status_counts,
		"alerts": alerts
	}

