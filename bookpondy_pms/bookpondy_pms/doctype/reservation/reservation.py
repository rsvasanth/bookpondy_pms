# Copyright (c) 2025, vasanth ranganathan and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import date_diff, flt, now_datetime
from bookpondy_pms.bookpondy_pms.utils.realtime import notify


class Reservation(Document):
	def validate(self):
		self.calculate_nights()
		self.calculate_totals()
		self.check_availability()
		
	def after_insert(self):
		notify(
			message=f"New booking received from {self.source} for {self.guest_name}",
			title="New Reservation",
			type="success",
			doctype="Reservation",
			docname=self.name,
			link=f"/bookings/{self.name}"
		)
	def check_availability(self):
		if not self.allocated_unit or not self.check_in_date or not self.check_out_date:
			return
			
		# 1. Check for overlapping reservations
		filters = {
			"allocated_unit": self.allocated_unit,
			"reservation_status": ["in", ["Confirmed", "Checked-In", "Tentative"]],
			"name": ["!=", self.name],
			"check_in_date": ["<", self.check_out_date],
			"check_out_date": [">", self.check_in_date]
		}
		
		overlap = frappe.db.exists("Reservation", filters)
		if overlap:
			frappe.throw(f"Unit {self.allocated_unit} is already booked for these dates (Reservation: {overlap})")

		# 2. Check for Unit Status blocks (Maintenance, blocked, etc)
		# Assuming 'Unit Status' doctype tracks non-reservation blocks
		if frappe.db.exists("DocType", "Unit Status"):
			status_filters = {
				"unit": self.allocated_unit,
				"status": ["in", ["Maintenance", "Blocked"]],
				"start_date": ["<", self.check_out_date],
				"end_date": [">", self.check_in_date]
			}
			block = frappe.db.exists("Unit Status", status_filters)
			if block:
				frappe.throw(f"Unit {self.allocated_unit} is blocked/under maintenance for these dates")

	def on_update(self):
		if self.has_value_changed("reservation_status"):
			self.handle_status_change()
			notify(
				message=f"Reservation {self.name} status updated to {self.reservation_status}",
				title="Reservation Update",
				doctype="Reservation",
				docname=self.name,
				link=f"/bookings/{self.name}"
			)

	def handle_status_change(self):
		if self.housekeeping_task_auto_create:
			if self.reservation_status == "Checked-In":
				self.create_housekeeping_task("Cleaning", "High")
			if self.reservation_status == "Checked-Out":
				self.update_guest_stats()
				self.sync_to_erpnext()
				self.sync_to_marketplace()
				self.handle_commissions()

	def handle_commissions(self):
		"""Calculate and record channel commissions."""
		if self.source in ["BookPondy", "Marketplace", "Airbnb", "Booking.com"]:
			percentage = 15.0 # Default commission
			if self.source == "Direct": percentage = 0.0
			
			if not frappe.db.exists("Channel Commission", {"booking": self.name}):
				comm = frappe.get_doc({
					"doctype": "Channel Commission",
					"booking": self.name,
					"channel": self.source,
					"commission_percentage": percentage,
					"status": "Pending"
				})
				comm.insert(ignore_permissions=True)

	def sync_to_marketplace(self):
		"""Sync data to BookPondy marketplace."""
		frappe.enqueue(
			"bookpondy_pms.integrations.marketplace_sync.sync_availability_to_marketplace",
			property_name=self.property,
			queue="long"
		)

	def sync_to_erpnext(self):
		"""
		Sync reservation details to ERPNext and trigger operational tasks.
		"""
		frappe.enqueue(
			"bookpondy_pms.integrations.erpnext_connector.sync_reservation",
			reservation_name=self.name,
			queue="long",
		)
		
		# Trigger Housekeeping Task on Checkout
		if self.reservation_status == "Checked-Out":
			self.create_housekeeping_tasks()

	def create_housekeeping_tasks(self):
		"""Create cleaning tasks post-checkout."""
		# Check if a housekeeping task for this reservation already exists to avoid duplicates
		if not frappe.db.get_value("Housekeeping Task", {"related_reservation": self.name, "task_type": "Check-out Cleaning"}):
			task = frappe.get_doc({
				"doctype": "Housekeeping Task",
				"naming_series": "HK-.YYYY.-.#####", # Ensure naming series is set
				"related_reservation": self.name, # Use related_reservation to link
				"unit": self.allocated_unit, # Use allocated_unit as per existing code
				"property_link": self.property, # Use property_link as per existing code
				"task_type": "Check-out Cleaning",
				"status": "Pending",
				"priority": "High",
				"scheduled_time": now_datetime() # Add scheduled time
			})
			task.insert(ignore_permissions=True)
			frappe.msgprint(f"Housekeeping task created for {self.allocated_unit} for reservation {self.name}")

	def create_housekeeping_task(self, task_type, priority):
		if not self.allocated_unit:
			return

		task = frappe.get_doc({
			"doctype": "Housekeeping Task",
			"naming_series": "HK-.YYYY.-.#####",
			"property_link": self.property,
			"unit": self.allocated_unit,
			"related_reservation": self.name,
			"task_type": task_type,
			"priority": priority,
			"status": "Pending",
			"scheduled_time": now_datetime()
		})
		task.insert(ignore_permissions=True)

	def update_guest_stats(self):
		if not self.guest:
			return
		
		guest = frappe.get_doc("Guest", self.guest)
		
		# Recalculate stats
		res_stats = frappe.db.get_value("Reservation", 
			{"guest": self.guest, "reservation_status": "Checked-Out"},
			["count(name)", "sum(total_amount)", "max(check_out_date)"],
			as_dict=True
		)
		
		if res_stats:
			guest.total_visits = res_stats.get("count(name)") or 0
			guest.total_spend = res_stats.get("sum(total_amount)") or 0
			guest.last_visit_date = res_stats.get("max(check_out_date)")
			guest.return_guest = 1 if guest.total_visits > 1 else 0
			guest.save(ignore_permissions=True)

	def calculate_nights(self):
		if self.check_in_date and self.check_out_date:
			self.nights = date_diff(self.check_out_date, self.check_in_date)
			if self.nights < 0:
				frappe.throw("Check-out date must be after Check-in date")

	def calculate_totals(self):
		self.subtotal_room_charges = flt(self.room_rate_per_night) * flt(self.nights)
		self.total_amount = (
			flt(self.subtotal_room_charges)
			+ flt(self.extras_and_services)
			- flt(self.discount_amount)
		)

	@staticmethod
	def get_availability(property_name, start_date, end_date):
		"""
		Returns a list of availability data for all units in a property 
		across a date range. Used by Marketplace Sync.
		"""
		from frappe.utils import add_days, getdate
		
		units = frappe.get_all("Unit", filters={"property": property_name}, fields=["name", "base_rate_per_night", "status"])
		start = getdate(start_date)
		days = date_diff(end_date, start_date)
		
		availability_data = []

		# Pre-fetch all bookings for this property in this range to avoid N+1 queries
		bookings = frappe.get_all("Reservation", 
			filters={
				"property": property_name,
				"reservation_status": ["in", ["Confirmed", "Checked-In", "Tentative"]],
				"check_in_date": ["<", end_date],
				"check_out_date": [">", start_date]
			},
			fields=["allocated_unit", "check_in_date", "check_out_date"]
		)
		
		for unit in units:
			# Filter bookings for this specific unit
			unit_bookings = [b for b in bookings if b.allocated_unit == unit.name]
			
			for i in range(days + 1):
				current_date = add_days(start, i)
				current_date_str = str(current_date)
				
				# Check if date is booked
				is_booked = False
				for b in unit_bookings:
					if getdate(b.check_in_date) <= current_date < getdate(b.check_out_date):
						is_booked = True
						break
				
				status = "Booked" if is_booked else "Available"
				if unit.status in ["Maintenance", "Blocked"] and not is_booked:
					status = unit.status

				availability_data.append({
					"unit_id": unit.name,
					"date": current_date_str,
					"status": status,
					"rate": unit.base_rate_per_night # In future, fetch from Rate Plan
				})
				
		return availability_data
