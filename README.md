Hospital Internal Management System (HIMS)

A modern, role-based Hospital Internal Management System designed to unify patient care, clinical workflows, operations, billing, and administration into one secure, scalable platform.

🚀 Overview

The Hospital Internal Management System (HIMS) is a comprehensive web application built for mid-sized hospitals to streamline:

Patient registration & scheduling

Electronic Medical Records (EMR)

Clinical workflows (orders, nursing tasks)

Lab & pharmacy operations

Inventory management

Billing & insurance claims

Administrative & security controls

The system centralizes hospital operations, reduces manual coordination, and improves visibility across departments.

🎯 Key Features
👥 Patient Management (ADT + Scheduling)

Patient registration with unique MRN

Appointment scheduling (calendar + list view)

Admission, transfer, and discharge (ADT)

Real-time inpatient tracking

Search, filters, and status management

📁 Electronic Medical Records (EMR)

Encounter creation and management

SOAP clinical notes

Allergies & medication tracking

Lab report integration

Prescription management

Patient timeline view

🩺 Clinical Workflows

Order entry (lab, medication, procedures)

Nursing task management

Priority-based order queues

Clinical decision support alerts

Status tracking and audit logging

🧪 Lab Module

Lab order queue

Result entry & publishing

Automatic EMR integration

Billing linkage

💊 Pharmacy

Prescription queue

Drug inventory tracking

Dispensing workflow

Stock alerts

Billing synchronization

📦 Inventory Management

Item & supplier management

Purchase orders & stock receiving

Low-stock alerts

Stock movement logs

💳 Billing & Insurance

Invoice generation

Line item auto-population from services

Payment recording

Insurance claim submission & tracking

Revenue dashboards

🛠 Administrative Panel

Staff management

Role-based access control (RBAC)

Permission matrix

Audit logs

System analytics dashboard

🔐 Role-Based Access Control

The system enforces permissions by role:

Admin/IT

Reception

Doctor

Nurse

Lab Technician

Pharmacist

Billing/Finance

Inventory Manager

Each role has scoped access to relevant modules and actions.

🎨 Design System

The UI follows a consistent design system:

Primary Color

#1D4ED8 (Blue)

Status Colors

Success: #16A34A

Warning: #F59E0B

Danger: #DC2626

Info: #0284C7

Button Types

Primary (Save / Create / Confirm)

Secondary (Cancel / Back)

Ghost (Edit / View)

Danger (Delete / Void)

All buttons maintain consistent height, spacing, and interaction states.

🗂 System Architecture (High-Level)
Patient (Core Entity)
 ├── Appointments
 ├── Admissions (ADT)
 ├── Encounters
 │    ├── Clinical Notes
 │    ├── Orders
 │    │     ├── Lab
 │    │     ├── Pharmacy
 │    │     └── Procedures
 ├── Lab Results
 ├── Prescriptions
 └── Billing Records

All modules connect back to the Patient (MRN) as the central entity.

🧩 Core Modules Structure

Each module includes:

Dashboard View

List + Detail Pages

Create / Edit Forms

Scheduling View (Calendar + List)

Filters & Search

Audit Logging

📊 Dashboards

Each module dashboard includes:

KPI summary cards

Status-based widgets

Alerts panel

Quick action buttons

Real-time data updates

📅 Scheduling Features

Calendar (Day / Week / Month)

List view

Status-based color tagging

Reschedule / Cancel functionality

Filter by staff, department, status

🔎 Global Features

Global patient search (Name / MRN / Phone)

Export to CSV

Activity logs

Confirmation modals for destructive actions

Form validation & error handling

Pagination & sorting

Secure authentication

🛡 Security & Compliance

Role-based access control (RBAC)

Audit trail logging

Secure authentication

Controlled edit permissions for signed records

Action-level tracking (billing edits, prescriptions, admissions)

🏗 Installation
# Clone repository
git clone https://github.com/your-org/hospital-internal-management-system.git

# Navigate to project
cd hospital-internal-management-system

# Install dependencies
npm install

# Start development server
npm run dev
🌱 Environment Variables

Create a .env file:

DATABASE_URL=
AUTH_SECRET=
API_BASE_URL=
📦 Production Build
npm run build
npm start
🧪 Sample Seed Data

The system includes sample data for:

Patients

Staff roles

Appointments

Orders

Prescriptions

Inventory

Billing records

This allows full end-to-end demo flows.

📈 Roadmap

Future enhancements may include:

HL7/FHIR interoperability

Advanced clinical decision support

Multi-branch hospital support

Advanced analytics & BI dashboard

Mobile companion app

Insurance provider API integrations

🤝 Contributing

Fork the repository

Create feature branch

Commit changes

Submit Pull Request

📄 License

MIT License (or your chosen license)

👨‍⚕️ Built For

Healthcare institutions seeking a modern, unified, secure internal management platform.
