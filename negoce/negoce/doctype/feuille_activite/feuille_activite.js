// Copyright (c) 2022, Richard and contributors
// For license information, please see license.txt

const on_item_row_change = (frm,row) =>{
	frappe.call({
		method: "negoce.negoce.utils.utils.on_item_row_change",
		args: {
			item_code: row.item,
		},
		callback: function (r) {
			if(r.message.item_group == "Services") row.prix = frm.doc.tarif / frm.doc.exchange_rate;
			else {
				if(r.message.type_calcul == 'Valeur') row.prix = frm.doc.tarif / frm.doc.exchange_rate;
				else row.prix = (frm.doc.tarif * r.message.tarif / 100) / frm.doc.exchange_rate;
			}
			row.montant = row.quantite * row.prix;
		}
	});
}

frappe.ui.form.on('Feuille Activite', {
	setup: function(frm) {
		frm.set_value("currency", "");
		frm.make_methods = {
			'Sales Invoice': () => {
				open_form(frm, "Sales Invoice", "Sales Invoice Item", "items");
			},
		};
	},
	navire: function(frm) {
		if(frm.doc.navire && frm.doc.volume ){
			frm.call('on_navire_change');
		}
		else{
			frm.set_value('tarif_code', "");
			frm.set_value('tarif', "");
			frm.set_value('client', "");
		}
	},
	client: function(frm) {
		if(frm.doc.client ){
			frm.call('on_client_change');
		}
		else{
			frm.set_value('currency', "");
		}
	},
	currency: function (frm) {
		frm.events.get_exchange_rate(frm);
	},

	get_exchange_rate: function(frm){
		if (frm.doc.currency && frm.doc.tarif_currency) {
			if (frm.doc.tarif_currency != frm.doc.currency) {
				frappe.call({
					method: "erpnext.setup.utils.get_exchange_rate",
					args: {
						from_currency: frm.doc.currency,
						to_currency: frm.doc.tarif_currency,
					},
					callback: function (r) {
						frm.set_value("exchange_rate", flt(r.message));
					}
				});
			} else {
				frm.set_value("exchange_rate", 1.0);
			}
		}
	},
});

frappe.ui.form.on('Feuille Activite Details', {
	
    item(frm, cdt, cdn) {
		var row = locals[cdt][cdn]; 
        if(row.item && row.quantite){
			on_item_row_change(frm, row);
		}
		else{
			row.prix = 0;
			row.montant = 0;
		}
    },

	quantite(frm, cdt, cdn) {
		//frm.events.calcul(frm); todo
		var row = locals[cdt][cdn]; 
        if(row.item && row.quantite){
			on_item_row_change(frm, row);
		}
		else{
			row.prix = 0;
			row.montant = 0;
		}
	},

	calcul(frm, row) {
		var row = locals[cdt][cdn]; 
        if(row.quantite && row.prix ){
			
		}
	}
});

function open_form(frm, doctype, child_doctype, parentfield) {
	frappe.model.with_doctype(doctype, () => {
		let new_doc = frappe.model.get_new_doc(doctype);

		// add a new row and set the project
		let new_child_doc = frappe.model.get_new_doc(child_doctype);
		new_child_doc.project = frm.doc.name;
		new_child_doc.parent = new_doc.name;
		new_child_doc.parentfield = parentfield;
		new_child_doc.parenttype = doctype;
		new_doc[parentfield] = [new_child_doc];
		new_doc.project = frm.doc.name;

		frappe.ui.form.make_quick_entry(doctype, null, null, new_doc);
	});

}
