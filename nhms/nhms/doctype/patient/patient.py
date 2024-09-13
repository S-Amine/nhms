# Copyright (c) 2024, Saidi Amine and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document
import subprocess
import frappe

class Patient(Document):
    def on_submit(self):
        cmd = f"export PATH=$PATH:/usr/local/go/bin && nhms-client -action=publish -patient-id={self.nin} -first-name={self.first_name} -last-name={self.last_name} -dob={self.date_of_birth} -sex={self.sex} -mother-nin={self.mother_nin} -father-nin={self.father_nin} -family-history={self.family_medical_history} -allergies={self.allergy} -chronic-illnesses={self.chronic_illnesses} -amended-from={self.amended_from}"
        process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, shell=True, encoding='utf-8', errors='replace')
        
        failed = False  # To track if any failure occurs
        error_message = ""  # To collect error messages

        while True:
            realtime_output = process.stdout.readline()

            if realtime_output:
                print(realtime_output)

                # Check if "Failed" appears in the output, indicating a failure
                if "Failed" in realtime_output:
                    error_message += realtime_output  # Collect error message
                    failed = True  # Set failure flag

            if realtime_output == '' and process.poll() is not None:
                break

        # Stop the submission and show an error message if failure occurred
        if failed:
            frappe.throw(_("Submission aborted due to failure in publishing: {0}").format(error_message))
