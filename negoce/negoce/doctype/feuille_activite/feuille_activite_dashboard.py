from frappe import _


def get_data():
	return {
		"heatmap": True,
		"heatmap_message": _("This is based on the Time Sheets created against this project"),
		"fieldname": "feuille_activite",
		"transactions": [
			{
				"label": _("Feuille d'activités"),
				"items": ["Sales Invoice"],
			},
		],
	}
