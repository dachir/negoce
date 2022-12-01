import frappe
from frappe import _

@frappe.whitelist()
def on_item_row_change(item_code):
    item_group = frappe.db.get_value('Item', {'name': item_code}, ['item_group'])
    type_calcul = None
    tarif = 0
    if item_group != "Services" :
        type_calcul, tarif = frappe.db.get_value('Tarif Details', {'item': item_code}, ['type_calcul', 'tarif'])

    details = None

    details = {
        "item_group" : item_group,
        "type_calcul" : type_calcul,
        "tarif": tarif,
    }

    return details