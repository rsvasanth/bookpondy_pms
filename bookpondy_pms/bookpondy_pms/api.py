# Copyright (c) 2025, vasanth ranganathan and contributors
# For license information, please see license.txt

import frappe

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
