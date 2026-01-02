import frappe
from frappe.model.document import Document

class PMSStockEntry(Document):
    def on_submit(self):
        self.update_item_stock()

    def on_cancel(self):
        self.update_item_stock(reverse=True)

    def update_item_stock(self, reverse=False):
        """Update the current_stock in PMS Item based on the entry type and quantity."""
        qty = self.quantity
        if reverse:
            qty = -qty

        # Factor based on entry type
        if self.entry_type == "Outward":
            qty = -qty
        
        # Update the item
        item = frappe.get_doc("PMS Item", self.item)
        item.current_stock = (item.current_stock or 0) + qty
        item.save()
        
        # Force a refresh of the item to ensure UI updates
        frappe.msgprint(f"Stock updated for {item.item_name}. New Balance: {item.current_stock}")
