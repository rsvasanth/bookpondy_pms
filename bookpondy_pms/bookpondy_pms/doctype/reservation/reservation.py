# Copyright (c) 2025, vasanth ranganathan and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import date_diff, flt


class Reservation(Document):
	def validate(self):
		self.calculate_nights()
		self.calculate_totals()

	def on_update(self):
		if self.has_value_changed("reservation_status"):
			self.handle_status_change()

	def handle_status_change(self):
		if self.housekeeping_task_auto_create:
			if self.reservation_status == "Checked-In":
				self.create_housekeeping_task("Stayover", "High")
			elif self.reservation_status == "Checked-Out":
				self.create_housekeeping_task("Checkout Cleaning", "Urgent")
		
		if self.reservation_status == "Checked-Out":
			self.update_guest_stats()

	def create_housekeeping_task(self, task_type, priority):
		if not self.allocated_room:
			return

		task = frappe.get_doc({
			"doctype": "Housekeeping Task",
			"property": self.property,
			"room": self.allocated_room,
			"reservation": self.name,
			"task_type": task_type,
			"priority": priority,
			"status": "Pending",
			"scheduled_date": frappe.utils.today()
		})
		task.insert(ignore_permissions=True)
		frappe.msgprint(f"Housekeeping Task created for room {self.allocated_room}")

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
