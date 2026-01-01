import frappe

def notify(message, title="Notification", type="info", link=None, doctype=None, docname=None):
	"""
	Publish a real-time notification to all logged-in users.
	"""
	frappe.publish_realtime(
		event="bookpondy_pms.notification",
		message={
			"title": title,
			"message": message,
			"type": type,
			"link": link,
			"doctype": doctype,
			"docname": docname
		}
	)
