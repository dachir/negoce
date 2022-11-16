// Copyright (c) 2022, Richard and contributors
// For license information, please see license.txt

frappe.ui.form.on('Feuille Activite', {
	setup: function(frm) {
		/*var company_currency;
		if (!frm.doc.company) {
			company_currency = erpnext.get_currency(frappe.defaults.get_default("Company"));
		} else {
			company_currency = erpnext.get_currency(frm.doc.company);
		}
		if (frm.doc.currency) {
			if (company_currency != frm.doc.currency) {
				frappe.call({
					method: "erpnext.setup.utils.get_exchange_rate",
					args: {
						from_currency: frm.doc.currency,
						to_currency: company_currency,
					},
					callback: function (r) {
						frm.set_value("exchange_rate", flt(r.message));
					}
				});
			} else {
				frm.set_value("exchange_rate", 1.0);
			}
		}*/
		frm.set_value("currency", "");
		frm.make_methods = {
			'Sales Invoice': () => {
				open_form(frm, "Sales Invoice", "Sales Invoice Item", "items");
			},
		};
	},
	navire: function(frm) {
		if(frm.doc.navire && frm.doc.volume ){
			frappe.db.get_list('Tarif Details', { filters: [['volume_min','<=', frm.doc.volume],['volume_max','>=', frm.doc.volume]], fields: ['code_tarif','tarif','parent'], limit: 1, }).
				then(res => { 
					frm.set_value('tarif_code', res[0].code_tarif);
					frm.set_value('tarif', res[0].tarif);

					frappe.db.get_list('Tarif', { filters: [['name','=', res[0].parent]], fields: ['currency'], limit: 1, }).
					then(res => { 
						frm.set_value('tarif_currency', res[0].currency);
						frm.events.get_exchange_rate(frm);
					});
				 });
			
			frappe.db.get_list('Navire', {filters:[['code', '=', frm.doc.navire]], fields: ['customer'], limit: 1}).
			then(res => {
				frm.set_value('client', res[0].customer);
			});
		}
		else{
			frm.set_value('tarif_code', "");
			frm.set_value('tarif', "");
			frm.set_value('client', "");
		}
	},
	client: function(frm) {
		if(frm.doc.client ){
			frappe.db.get_list('Customer', { filters: { 'name': frm.doc.client }, fields: ['default_currency'], limit: 1, }).
				then(res => { 
					frm.set_value('currency', res[0].default_currency);
				 });
			
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
	}
});

frappe.ui.form.on('Feuille Activite Details', {
    item(frm, cdt, cdn) {
		var row = locals[cdt][cdn]; 
		/*frappe.call({
					method: "erpnext.setup.utils.get_exchange_rate",
					args: {
						from_currency: frm.doc.currency,
						to_currency: company_currency,
					},
					callback: function (r) {
						frm.set_value("exchange_rate", flt(r.message));
					}
				})*/
        if(row.item && row.quantite){
			frappe.db.get_list('Item', {filters: {'name': row.item}, fields: ['item_group'], limit: 1, }).
			then(res => {
				if(res[0].item_group === 'Services'){ 
					row.prix = frm.doc.tarif / (frm.doc.tarif_currency === frm.doc.currency ? 1 : frm.doc.exchange_rate);
					row.montant = row.prix * row.quantite;
					frm.refresh();
				}
				else{
					frappe.db.get_list('Tarif Details', {filters: {'item': row.item}, fields: ['type_calcul','tarif'], limit: 1, }).
						then(res => {
							//console.log(res)
							row.type_calcul = res[0].type_calcul;
							if(row.type_calcul === 'Valeur'){
								row.prix = res[0].tarif / (frm.doc.tarif_currency === frm.doc.currency ? 1 : frm.doc.exchange_rate);
								row.montant = row.prix * row.quantite;
							}
							else {
								row.prix = frm.doc.tarif * res[0].tarif / 100 / (frm.doc.tarif_currency === frm.doc.currency ? 1 : frm.doc.exchange_rate);
								row.montant = row.prix * row.quantite;
							}
							frm.refresh();
						});
				}
			})
		
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
			frappe.db.get_list('Item', {filters: {'name': row.item}, fields: ['item_group'], limit: 1, }).
			then(res => {
				if(res[0].item_group === 'Services'){ 
					row.prix = frm.doc.tarif / (frm.doc.tarif_currency === frm.doc.currency ? 1 : frm.doc.exchange_rate);
					row.montant = row.prix * row.quantite;
					frm.refresh();
				}
				else{
					frappe.db.get_list('Tarif Details', {filters: {'item': row.item}, fields: ['type_calcul','tarif'], limit: 1, }).
						then(res => {
							//console.log(res)
							row.type_calcul = res[0].type_calcul;
							if(row.type_calcul === 'Valeur'){
								row.prix = res[0].tarif / (frm.doc.tarif_currency === frm.doc.currency ? 1 : frm.doc.exchange_rate);
								row.montant = row.prix * row.quantite;
							}
							else {
								row.prix = frm.doc.tarif * res[0].tarif / 100 / (frm.doc.tarif_currency === frm.doc.currency ? 1 : frm.doc.exchange_rate);
								row.montant = row.prix * row.quantite;
							}
							frm.refresh();
						});
				}
			});
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
