# Copyright (c) 2024, Saidi Amine and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class DoctorPermission(Document):
	def before_save(self):
		user = frappe.get_doc(doctype="User", username=self.doctor_nin)
		created_by = frappe.get_doc("User", frappe.session.user)
		self.created_by = created_by.username
		frappe.share.add("Patient", self.created_by, user, read=1, write=1, submit=1, share=1, notify=1)
		bilans = frappe.db.get_list('Bilan',
					filters={
						'patient': self.created_by
					},
					fields=['name'],
					as_list=True
				)
		for bilan in bilans :
			frappe.share.add("Bilan", bilan[0], user, read=1, write=1, submit=1, share=1, notify=1)
	def on_trash(self):
		user = frappe.get_doc(doctype="User", username=self.doctor_nin)
		frappe.share.remove("Patient", self.created_by, user.username)
		bilans = frappe.db.get_list('Bilan',
					filters={
						'patient': self.created_by
					},
					fields=['name'],
					as_list=True
				)
		for bilan in bilans :
			frappe.share.remove("Bilan", bilan[0], user.username)