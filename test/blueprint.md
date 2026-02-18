# Blueprint: Registration System

## Overview

A simple web-based registration system for students and administrators. Students can view their payment status and history, while administrators can manage student data and payment information.

## Features & Design

### General
- Responsive design for both mobile and web.
- Uses the Sarabun font.

### Student View (`index.html`)
- Students can search for their information using their student ID.
- Displays student's name, ID, department, and class.
- Shows the total amount due (tuition + insurance) and the amount paid.
- A clear status indicator shows whether the student has "Paid", "Partial Payment", or "Unpaid".
- Provides a payment history table with date, amount, and a button to view the payment slip.
- Includes a QR code and bank account details for payment.

### Admin View (`admin.html`)
- Secure section for administrators.
- **Dashboard Tab:**
    - Summary cards showing total students, number of paid students, and number of students with pending payments.
    - A searchable and filterable list of all students.
    - For each student, it displays their name, ID, department, class, total due, amount paid, and payment status.
    - Actions per student:
        - **Edit Amount:** Allows changing the amount paid.
        - **Edit Fees:** Allows modifying the tuition and insurance fees.
        - **View History:** Shows the student's payment history and allows viewing payment slips.
- **Manage Student Information Tab:**
    - A table listing all students with their ID, name, and department/class.
    - **Add Student:** A button to open a modal to add a new student with all necessary details (ID, name, faculty, year, fees).
    - **Edit Student:** An "Edit" button for each student to modify their information in a modal.
    - **Delete Student:** A "Delete" button to remove a student from the system (with a confirmation prompt).
- **Settings Tab:**
    - Configure bank account details (bank name, account number, account name).
    - Upload a QR code for payments.

### Modals
- **Edit Fee Modal:** To adjust tuition and insurance fees.
- **Edit Paid Amount Modal:** To update the total amount paid by a student.
- **History Modal:** To display a student's payment history.
- **Slip Viewer Modal:** To show the uploaded payment slip image.
- **Student Modal:** A unified modal for both adding a new student and editing an existing one.

## Current Plan

**Task: Implement Add/Edit Functionality for Student Data in the Admin Panel**

1.  **Modify `Registration/admin.html`:**
    *   **DONE:** Add a new tab named "จัดการข้อมูลนักเรียน" (Manage Student Information).
    *   **DONE:** Create a new content section for this tab.
    *   **DONE:** Add an "Add Student" button.
    *   **DONE:** Create a table to list students with "Edit" and "Delete" buttons.
    *   **DONE:** Add a modal (`student-modal`) with a form for adding and editing student details (ID, name, faculty, year, tuition, insurance).

2.  **Modify `Registration/admin.js`:**
    *   **DONE:** Add event listener for the new "Manage Student Information" tab.
    *   **DONE:** Implement the `renderManageStudentTable` function to populate the new student list.
    *   **DONE:** Create an event listener for the "Add Student" button to open the `student-modal`.
    *   **DONE:** Add event listeners to the "Edit" and "Delete" buttons on the management table.
    *   **DONE:** Implement the logic in `openModal` to handle both adding (empty form) and editing (pre-filled form).
    *   **DONE:** Create the `handleStudentFormSubmit` function to process the form submission, either adding a new student or updating an existing one in local storage.
    *   **DONE:** Implement the delete functionality with a confirmation dialog.
    *   **DONE:** Ensure all tables and summary cards update automatically after any add, edit, or delete operation.
