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

