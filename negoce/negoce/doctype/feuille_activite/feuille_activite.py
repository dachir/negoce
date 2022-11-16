# Copyright (c) 2022, Richard and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document

class FeuilleActivite(Document):

	def before_save(self):
		for c in self.feuille_activite_details :
			c.before_save()
		

	def on_submit(self):
		items = frappe.get_list('Feuille Activite Details', filters={'parent': self.name}, fields=["item","warehouse","machine","quantite","date_action","prix"])
		#frappe.msgprint(str(items))
		invoice_details = []
		
		for item in items:
			warehouse = ""
			machine = ""
			if item.warehouse:
				warehouse = " " + item.warehouse
			if item.machine:
				machine = " - " + item.machine
			details = frappe._dict({
				"item_code": item.item,
				"description": item.item + warehouse + machine,
				"qty": item.quantite,
				"rate": item.prix,
				"doctype": "Sales Invoice Item",
				"date_action": item.date_action,
			})
			invoice_details.append(details)
			
		args = frappe._dict(
                {
                    "customer": self.client,
                    "posting_date": self.posting_date,
                    "currency": self.currency,
                    "doctype": "Sales Invoice",
                    "docstatus": 0,
					"feuille_activite":self.name,
					"items":invoice_details,
                }
            )
		#frappe.msgprint(str(args))
		frappe.get_doc(args).insert()
		
# for heatmap
def get_timeline_data(doctype, name):
	"""Return timeline for attendance"""
	return dict(
		frappe.db.sql(
			"""select unix_timestamp(date_action), count(*)
		from `tabFeuille Activite Details` where date_action > date_sub(curdate(), interval 1 year)
			and docstatus < 2
			group by date(date_action)"""
		)
	)
