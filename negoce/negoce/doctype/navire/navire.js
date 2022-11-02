// Copyright (c) 2022, Richard and contributors
// For license information, please see license.txt

frappe.ui.form.on('Navire', {
	// refresh: function(frm) {

	// }
	longueur: function(frm) {
		if(frm.doc.longueur && frm.doc.largeur && frm.doc.tirant_eau){
			var volume = frm.doc.longueur * frm.doc.largeur * frm.doc.tirant_eau;
			frm.set_value('volume', Math.round(volume));
		}
	},
	largeur: function(frm) {
		if(frm.doc.longueur && frm.doc.largeur && frm.doc.tirant_eau){
			var volume = frm.doc.longueur * frm.doc.largeur * frm.doc.tirant_eau;
			frm.set_value('volume', Math.round(volume));
		}
	},
	tirant_eau: function(frm) {
		if(frm.doc.longueur && frm.doc.largeur && frm.doc.tirant_eau){
			var volume = frm.doc.longueur * frm.doc.largeur * frm.doc.tirant_eau;
			frm.set_value('volume', Math.round(volume));
		}
	},
});
