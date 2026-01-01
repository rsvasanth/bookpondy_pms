# Copyright (c) 2025, vasanth ranganathan and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import date_diff, add_days, getdate, flt

class RatePlan(Document):
    def calculate_total_price(self, check_in, check_out, guests=1):
        """
        Calculate total price for a stay based on seasonal rates and modifiers.
        """
        start_date = getdate(check_in)
        end_date = getdate(check_out)
        num_nights = date_diff(end_date, start_date)
        
        if num_nights <= 0:
            return 0.0

        daily_breakdown = []
        total_room_rate = 0.0

        # Fetch all seasonal rates for this plan overlapping the period
        seasonal_rates = frappe.get_all(
            "Seasonal Rate",
            filters={
                "rate_plan": self.name,
                "from_date": ["<", end_date],
                "to_date": [">", start_date]
            },
            fields=["from_date", "to_date", "rate_override", "name"]
        )

        for i in range(num_nights):
            current_date = add_days(start_date, i)
            night_rate = self.base_rate
            applied_rule = None

            # Check for applicable seasonal rate (Last match wins if multiple overlaps logic - or specific priority)
            # Assuming strictly non-overlapping or first found for MVP
            for sr in seasonal_rates:
                if getdate(sr.from_date) <= current_date <= getdate(sr.to_date): # Inclusive? to_date usually inclusive for season definition
                    night_rate = sr.rate_override
                    applied_rule = sr.name
                    break
            
            total_room_rate += flt(night_rate)
            daily_breakdown.append({
                "date": str(current_date),
                "rate": flt(night_rate),
                "rule": applied_rule
            })

        # Apply Modifiers
        total_modifiers = 0.0
        applied_modifiers = []
        
        if self.modifiers:
            for mod in self.modifiers:
                mod_amount = 0.0
                if mod.value_type == "Percentage":
                    mod_amount = total_room_rate * (flt(mod.amount) / 100.0)
                else: # Fixed
                    mod_amount = flt(mod.amount)
                
                # Apply Direction (Discount vs Surcharge)
                if mod.type == "Discount":
                    mod_amount = -1 * mod_amount
                
                total_modifiers += mod_amount
                applied_modifiers.append({
                    "name": mod.name1,
                    "amount": mod_amount
                })

        grand_total = total_room_rate + total_modifiers

        return {
            "total_amount": grand_total,
            "base_total": total_room_rate,
            "modifiers_total": total_modifiers,
            "daily_breakdown": daily_breakdown,
            "modifiers_breakdown": applied_modifiers
        }
