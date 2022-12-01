# Copyright (c) 2022, Richard and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document
from erpnext.setup.utils import get_exchange_rate

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

	@frappe.whitelist()
	def on_navire_change(self):
		tarifs =frappe.db.get_list('Tarif Details', filters={'volume_min': ['<=', self.volume],'volume_max': ['>=', self.volume],},fields=['code_tarif','tarif','parent'],limit=1,)
		if len(tarifs) > 0 :
			for t in tarifs:
				self.tarif_code = t.code_tarif
				self.tarif = t.tarif

				tarif_doc = frappe.get_doc("Tarif", t.parent)
				self.tarif_currency = tarif_doc.currency
		else :
			self.tarif_code = ""
			self.tarif = ""
			self.exchange_rate = 1

		navire =frappe.db.get_list('Navire', filters={'code':  self.navire, },fields=['customer'],limit=1,)
		if len(navire) > 0 :
			for n in navire:
				self.client = n.customer
				self.on_client_change()

	@frappe.whitelist()
	def on_client_change(self):
		client =frappe.db.get_list('Customer', filters={'name':  self.client, },fields=['default_currency'],limit=1,)
		if len(client) > 0 :
			for c in client:
				self.currency = c.default_currency
				if len(self.tarif_currency) > 0 :
					self.exchange_rate = get_exchange_rate(self.currency,self.tarif_currency)
					#frappe.msgprint(str(self.currency))

	@frappe.whitelist()
	def on_item_row_change(self, item_code, quantite):
		item_group = frappe.db.get_value('Item', {'name': item_code}, ['subject', 'description'])
		type_calcul = None
		tarif = None
		if item_group != "Services" :
			type_calcul, tarif = frappe.db.get_value('Tarif Details', {'item': item_code}, ['type_calcul', 'tarif'])
		#tarifs =frappe.db.get_list('Tarif Details', filters={'item':  item_code, },fields=['type_calcul','tarif'],limit=1,)
		details = None
		#if len(tarifs) > 0 :
			#for t in tarifs:
		prix = ((tarif  if type_calcul == 'Valeur' else self.tarif * tarif / 100) if item_group != "Services" else self.tarif) / self.exchange_rate
		details = {
			"type_calcul" : type_calcul,
			"prix": prix,
			"montant": quantite * prix,
		}

		return details

	


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
