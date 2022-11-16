# Copyright (c) 2022, Richard and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class FeuilleActiviteDetails(Document):
	
	def before_save(self):
		frappe.msgprint("ok")
		if not self.user_creation:
			self.user_creation = frappe.session.user
			self.date_creation = frappe.utils.now()
		else :
			self.user_modification = frappe.session.user
			self.date_modification = frappe.utils.now()

	
