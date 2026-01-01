frappe.ui.form.on('ERPNext Settings', {
    test_connection_btn: function (frm) {
        frappe.call({
            method: "bookpondy_pms.bookpondy_pms.doctype.erpnext_settings.erpnext_settings.test_connection",
            callback: function (r) {
                if (r.message.status === "success") {
                    frappe.msgprint({
                        title: __('Success'),
                        indicator: 'green',
                        message: r.message.message
                    });
                } else {
                    frappe.msgprint({
                        title: __('Error'),
                        indicator: 'red',
                        message: r.message.message
                    });
                }
            }
        });
    }
});
