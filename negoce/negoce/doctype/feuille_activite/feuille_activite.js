// Copyright (c) 2022, Richard and contributors
// For license information, please see license.txt

frappe.ui.form.on('Feuille Activite', {
	// refresh: function(frm) {

	// }
	nom: function(frm) {
		if(frm.doc.nom && frm.doc.volume ){
			frappe.db.get_list('Tarif Details', { filters: [['volume_min','<=', frm.doc.volume],['volume_max','>=', frm.doc.volume]], fields: ['code_tarif','tarif'], limit: 1, }).
				then(res => { 
					frm.set_value('tarif_code', res[0].code_tarif);
					frm.set_value('tarif', res[0].tarif);
				 });
			
		}
		else{
			frm.set_value('tarif_code', "");
			frm.set_value('tarif', "");
		}
	},
});

frappe.ui.form.on('Feuille Activite Details', {
    item(frm, cdt, cdn) {
		var row = locals[cdt][cdn]; 
        if(row.item && row.item_group && row.quantite){
			if(row.item_group === 'Services'){ 
				row.prix = frm.doc.tarif;
				row.montant = row.prix * row.quantite;
				frm.refresh();
			}
			else{
				frappe.db.get_list('Tarif Details', {filters: {'item': row.item}, fields: ['type_calcul','tarif'], limit: 1, }).
					then(res => {
						//console.log(res)
						row.type_calcul = res[0].type_calcul;
						if(row.type_calcul === 'Valeur'){
							row.prix = res[0].tarif;
							row.montant = row.prix * row.quantite;
						}
						else {
							row.prix = frm.doc.tarif * res[0].tarif / 100;
							row.montant = row.prix * row.quantite;
						}
						frm.refresh();
					});
			}
			
		}
		else{
			row.prix = 0;
			row.montant = 0;
		}
    },

	quantite(frm, cdt, cdn) {
		var row = locals[cdt][cdn]; 
        if(row.item && row.item_group && row.quantite){
			if(row.item_group === 'Services'){ 
				row.prix = frm.doc.tarif;
				row.montant = row.prix * row.quantite;
				frm.refresh();
			}
			else{
				frappe.db.get_list('Tarif Details', {filters: {'item': row.item}, fields: ['type_calcul','tarif'], limit: 1, }).
					then(res => {
						//console.log(res)
						row.type_calcul = res[0].type_calcul;
						if(row.type_calcul === 'Valeur'){
							row.prix = res[0].tarif;
							row.montant = row.prix * row.quantite;
						}
						else {
							row.prix = frm.doc.tarif * res[0].tarif / 100;
							row.montant = row.prix * row.quantite;
						}
						frm.refresh();
					});
			}
			
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
