import frappe
from frappe.model.document import Document

class ERNextSettings(Document):
    pass

@frappe.whitelist()
def test_connection():
    from bookpondy_pms.integrations.erpnext_connector import ERPNextConnector
    
    connector = ERPNextConnector()
    try:
        if connector.test_connection():
            return {"status": "success", "message": "Successfully connected to ERPNext!"}
        else:
            return {"status": "error", "message": "Failed to connect. Check credentials and URL."}
    except Exception as e:
        frappe.log_error(f"ERPNext Connection Test Failed: {str(e)}")
        return {"status": "error", "message": str(e)}
