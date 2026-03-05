export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      admissions: {
        Row: {
          admit_date: string
          attending_doctor_id: string | null
          bed_id: string | null
          created_at: string
          created_by: string | null
          discharge_date: string | null
          discharge_summary: string | null
          id: string
          patient_id: string
          reason: string | null
          status: Database["public"]["Enums"]["admission_status"]
          updated_at: string
          ward_id: string | null
        }
        Insert: {
          admit_date?: string
          attending_doctor_id?: string | null
          bed_id?: string | null
          created_at?: string
          created_by?: string | null
          discharge_date?: string | null
          discharge_summary?: string | null
          id?: string
          patient_id: string
          reason?: string | null
          status?: Database["public"]["Enums"]["admission_status"]
          updated_at?: string
          ward_id?: string | null
        }
        Update: {
          admit_date?: string
          attending_doctor_id?: string | null
          bed_id?: string | null
          created_at?: string
          created_by?: string | null
          discharge_date?: string | null
          discharge_summary?: string | null
          id?: string
          patient_id?: string
          reason?: string | null
          status?: Database["public"]["Enums"]["admission_status"]
          updated_at?: string
          ward_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admissions_attending_doctor_id_fkey"
            columns: ["attending_doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admissions_bed_id_fkey"
            columns: ["bed_id"]
            isOneToOne: false
            referencedRelation: "beds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admissions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admissions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admissions_ward_id_fkey"
            columns: ["ward_id"]
            isOneToOne: false
            referencedRelation: "wards"
            referencedColumns: ["id"]
          },
        ]
      }
      allergies: {
        Row: {
          allergen: string
          created_at: string
          id: string
          patient_id: string
          reaction: string | null
          recorded_by: string | null
          severity: string | null
        }
        Insert: {
          allergen: string
          created_at?: string
          id?: string
          patient_id: string
          reaction?: string | null
          recorded_by?: string | null
          severity?: string | null
        }
        Update: {
          allergen?: string
          created_at?: string
          id?: string
          patient_id?: string
          reaction?: string | null
          recorded_by?: string | null
          severity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "allergies_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "allergies_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          created_at: string
          created_by: string | null
          department_id: string | null
          doctor_id: string | null
          duration_minutes: number | null
          id: string
          notes: string | null
          patient_id: string
          reason: string | null
          scheduled_at: string
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          doctor_id?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          patient_id: string
          reason?: string | null
          scheduled_at: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          doctor_id?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          patient_id?: string
          reason?: string | null
          scheduled_at?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          created_at: string
          description: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          module: string
          new_values: Json | null
          old_values: Json | null
          user_id: string | null
          user_name: string | null
          user_role: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          created_at?: string
          description: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          module: string
          new_values?: Json | null
          old_values?: Json | null
          user_id?: string | null
          user_name?: string | null
          user_role?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          created_at?: string
          description?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          module?: string
          new_values?: Json | null
          old_values?: Json | null
          user_id?: string | null
          user_name?: string | null
          user_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      beds: {
        Row: {
          bed_number: string
          created_at: string
          id: string
          is_occupied: boolean | null
          ward_id: string
        }
        Insert: {
          bed_number: string
          created_at?: string
          id?: string
          is_occupied?: boolean | null
          ward_id: string
        }
        Update: {
          bed_number?: string
          created_at?: string
          id?: string
          is_occupied?: boolean | null
          ward_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beds_ward_id_fkey"
            columns: ["ward_id"]
            isOneToOne: false
            referencedRelation: "wards"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_notes: {
        Row: {
          assessment: string | null
          created_at: string
          created_by: string | null
          diagnosis_code: string | null
          diagnosis_description: string | null
          encounter_id: string
          id: string
          is_signed: boolean | null
          objective: string | null
          patient_id: string
          plan: string | null
          signed_at: string | null
          signed_by: string | null
          subjective: string | null
          updated_at: string
        }
        Insert: {
          assessment?: string | null
          created_at?: string
          created_by?: string | null
          diagnosis_code?: string | null
          diagnosis_description?: string | null
          encounter_id: string
          id?: string
          is_signed?: boolean | null
          objective?: string | null
          patient_id: string
          plan?: string | null
          signed_at?: string | null
          signed_by?: string | null
          subjective?: string | null
          updated_at?: string
        }
        Update: {
          assessment?: string | null
          created_at?: string
          created_by?: string | null
          diagnosis_code?: string | null
          diagnosis_description?: string | null
          encounter_id?: string
          id?: string
          is_signed?: boolean | null
          objective?: string | null
          patient_id?: string
          plan?: string | null
          signed_at?: string | null
          signed_by?: string | null
          subjective?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinical_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_notes_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_notes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_notes_signed_by_fkey"
            columns: ["signed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string | null
          created_at: string
          head_id: string | null
          id: string
          is_active: boolean
          location: string | null
          name: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          head_id?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          name: string
        }
        Update: {
          code?: string | null
          created_at?: string
          head_id?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_head_id_fkey"
            columns: ["head_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      drugs: {
        Row: {
          barcode: string | null
          category: string | null
          created_at: string
          form: string | null
          generic_name: string | null
          id: string
          is_active: boolean | null
          manufacturer: string | null
          name: string
          price: number | null
          strength: string | null
          updated_at: string
        }
        Insert: {
          barcode?: string | null
          category?: string | null
          created_at?: string
          form?: string | null
          generic_name?: string | null
          id?: string
          is_active?: boolean | null
          manufacturer?: string | null
          name: string
          price?: number | null
          strength?: string | null
          updated_at?: string
        }
        Update: {
          barcode?: string | null
          category?: string | null
          created_at?: string
          form?: string | null
          generic_name?: string | null
          id?: string
          is_active?: boolean | null
          manufacturer?: string | null
          name?: string
          price?: number | null
          strength?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      encounters: {
        Row: {
          appointment_id: string | null
          chief_complaint: string | null
          created_at: string
          created_by: string | null
          department_id: string | null
          doctor_id: string | null
          encounter_date: string
          id: string
          patient_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          chief_complaint?: string | null
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          doctor_id?: string | null
          encounter_date?: string
          id?: string
          patient_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          chief_complaint?: string | null
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          doctor_id?: string | null
          encounter_date?: string
          id?: string
          patient_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "encounters_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "encounters_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "encounters_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "encounters_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "encounters_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_claims: {
        Row: {
          approved_amount: number | null
          claim_amount: number
          claim_number: string
          created_at: string
          created_by: string | null
          decision_date: string | null
          id: string
          insurance_provider: string
          invoice_id: string
          notes: string | null
          patient_id: string
          policy_number: string | null
          rejection_reason: string | null
          status: Database["public"]["Enums"]["claim_status"]
          submission_date: string | null
          updated_at: string
        }
        Insert: {
          approved_amount?: number | null
          claim_amount: number
          claim_number?: string
          created_at?: string
          created_by?: string | null
          decision_date?: string | null
          id?: string
          insurance_provider: string
          invoice_id: string
          notes?: string | null
          patient_id: string
          policy_number?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["claim_status"]
          submission_date?: string | null
          updated_at?: string
        }
        Update: {
          approved_amount?: number | null
          claim_amount?: number
          claim_number?: string
          created_at?: string
          created_by?: string | null
          decision_date?: string | null
          id?: string
          insurance_provider?: string
          invoice_id?: string
          notes?: string | null
          patient_id?: string
          policy_number?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["claim_status"]
          submission_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "insurance_claims_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_claims_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_claims_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          category: string | null
          created_at: string
          current_stock: number | null
          expiry_date: string | null
          id: string
          location: string | null
          maximum_stock: number | null
          minimum_stock: number | null
          name: string
          sku: string | null
          status: Database["public"]["Enums"]["stock_status"] | null
          supplier_id: string | null
          unit: string | null
          unit_cost: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          current_stock?: number | null
          expiry_date?: string | null
          id?: string
          location?: string | null
          maximum_stock?: number | null
          minimum_stock?: number | null
          name: string
          sku?: string | null
          status?: Database["public"]["Enums"]["stock_status"] | null
          supplier_id?: string | null
          unit?: string | null
          unit_cost?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          current_stock?: number | null
          expiry_date?: string | null
          id?: string
          location?: string | null
          maximum_stock?: number | null
          minimum_stock?: number | null
          name?: string
          sku?: string | null
          status?: Database["public"]["Enums"]["stock_status"] | null
          supplier_id?: string | null
          unit?: string | null
          unit_cost?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          category: string | null
          created_at: string
          description: string
          id: string
          invoice_id: string
          quantity: number | null
          reference_id: string | null
          reference_type: string | null
          total: number
          unit_price: number
        }
        Insert: {
          category?: string | null
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          quantity?: number | null
          reference_id?: string | null
          reference_type?: string | null
          total: number
          unit_price: number
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number | null
          reference_id?: string | null
          reference_type?: string | null
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          admission_id: string | null
          amount_paid: number | null
          balance_due: number | null
          created_at: string
          created_by: string | null
          discount: number | null
          due_date: string | null
          encounter_id: string | null
          id: string
          invoice_number: string
          notes: string | null
          patient_id: string
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal: number | null
          tax: number | null
          total: number | null
          updated_at: string
          void_reason: string | null
        }
        Insert: {
          admission_id?: string | null
          amount_paid?: number | null
          balance_due?: number | null
          created_at?: string
          created_by?: string | null
          discount?: number | null
          due_date?: string | null
          encounter_id?: string | null
          id?: string
          invoice_number?: string
          notes?: string | null
          patient_id: string
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number | null
          tax?: number | null
          total?: number | null
          updated_at?: string
          void_reason?: string | null
        }
        Update: {
          admission_id?: string | null
          amount_paid?: number | null
          balance_due?: number | null
          created_at?: string
          created_by?: string | null
          discount?: number | null
          due_date?: string | null
          encounter_id?: string | null
          id?: string
          invoice_number?: string
          notes?: string | null
          patient_id?: string
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number | null
          tax?: number | null
          total?: number | null
          updated_at?: string
          void_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_orders: {
        Row: {
          collected_at: string | null
          collected_by: string | null
          created_at: string
          id: string
          is_abnormal: boolean | null
          lab_test_id: string | null
          normal_range: string | null
          notes: string | null
          order_id: string | null
          patient_id: string
          reported_at: string | null
          reported_by: string | null
          result_unit: string | null
          result_value: string | null
          status: Database["public"]["Enums"]["order_status"]
          test_name: string
          updated_at: string
        }
        Insert: {
          collected_at?: string | null
          collected_by?: string | null
          created_at?: string
          id?: string
          is_abnormal?: boolean | null
          lab_test_id?: string | null
          normal_range?: string | null
          notes?: string | null
          order_id?: string | null
          patient_id: string
          reported_at?: string | null
          reported_by?: string | null
          result_unit?: string | null
          result_value?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          test_name: string
          updated_at?: string
        }
        Update: {
          collected_at?: string | null
          collected_by?: string | null
          created_at?: string
          id?: string
          is_abnormal?: boolean | null
          lab_test_id?: string | null
          normal_range?: string | null
          notes?: string | null
          order_id?: string | null
          patient_id?: string
          reported_at?: string | null
          reported_by?: string | null
          result_unit?: string | null
          result_value?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          test_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_orders_collected_by_fkey"
            columns: ["collected_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_orders_lab_test_id_fkey"
            columns: ["lab_test_id"]
            isOneToOne: false
            referencedRelation: "lab_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_orders_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_orders_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_tests: {
        Row: {
          category: string | null
          code: string
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          normal_range: string | null
          price: number | null
          unit: string | null
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          normal_range?: string | null
          price?: number | null
          unit?: string | null
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          normal_range?: string | null
          price?: number | null
          unit?: string | null
        }
        Relationships: []
      }
      medical_history: {
        Row: {
          condition: string
          created_at: string
          diagnosis_date: string | null
          id: string
          notes: string | null
          patient_id: string
          recorded_by: string | null
          status: string | null
        }
        Insert: {
          condition: string
          created_at?: string
          diagnosis_date?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          recorded_by?: string | null
          status?: string | null
        }
        Update: {
          condition?: string
          created_at?: string
          diagnosis_date?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          recorded_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_history_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_history_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          reference_id: string | null
          reference_type: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          reference_id?: string | null
          reference_type?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nursing_tasks: {
        Row: {
          admission_id: string | null
          assigned_to: string | null
          completed_at: string | null
          completed_by: string | null
          completion_notes: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_at: string | null
          encounter_id: string | null
          id: string
          patient_id: string
          status: Database["public"]["Enums"]["task_status"]
          task_type: string
          updated_at: string
        }
        Insert: {
          admission_id?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          completed_by?: string | null
          completion_notes?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          encounter_id?: string | null
          id?: string
          patient_id: string
          status?: Database["public"]["Enums"]["task_status"]
          task_type: string
          updated_at?: string
        }
        Update: {
          admission_id?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          completed_by?: string | null
          completion_notes?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          encounter_id?: string | null
          id?: string
          patient_id?: string
          status?: Database["public"]["Enums"]["task_status"]
          task_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nursing_tasks_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nursing_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nursing_tasks_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nursing_tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nursing_tasks_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nursing_tasks_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          department_id: string | null
          description: string
          encounter_id: string | null
          id: string
          instructions: string | null
          order_number: string
          order_type: Database["public"]["Enums"]["order_type"]
          ordered_by: string | null
          patient_id: string
          priority: Database["public"]["Enums"]["order_priority"]
          rejection_reason: string | null
          scheduled_for: string | null
          status: Database["public"]["Enums"]["order_status"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          department_id?: string | null
          description: string
          encounter_id?: string | null
          id?: string
          instructions?: string | null
          order_number?: string
          order_type: Database["public"]["Enums"]["order_type"]
          ordered_by?: string | null
          patient_id: string
          priority?: Database["public"]["Enums"]["order_priority"]
          rejection_reason?: string | null
          scheduled_for?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          department_id?: string | null
          description?: string
          encounter_id?: string | null
          id?: string
          instructions?: string | null
          order_number?: string
          order_type?: Database["public"]["Enums"]["order_type"]
          ordered_by?: string | null
          patient_id?: string
          priority?: Database["public"]["Enums"]["order_priority"]
          rejection_reason?: string | null
          scheduled_for?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_ordered_by_fkey"
            columns: ["ordered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          blood_type: Database["public"]["Enums"]["blood_type"] | null
          city: string | null
          created_at: string
          created_by: string | null
          date_of_birth: string
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relation: string | null
          first_name: string
          gender: Database["public"]["Enums"]["gender_type"]
          id: string
          insurance_policy_number: string | null
          insurance_provider: string | null
          is_active: boolean
          last_name: string
          mrn: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          blood_type?: Database["public"]["Enums"]["blood_type"] | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth: string
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          first_name: string
          gender: Database["public"]["Enums"]["gender_type"]
          id?: string
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          is_active?: boolean
          last_name: string
          mrn?: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          blood_type?: Database["public"]["Enums"]["blood_type"] | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          first_name?: string
          gender?: Database["public"]["Enums"]["gender_type"]
          id?: string
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          is_active?: boolean
          last_name?: string
          mrn?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_id: string
          notes: string | null
          patient_id: string | null
          payment_method: string
          recorded_by: string | null
          reference_number: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          invoice_id: string
          notes?: string | null
          patient_id?: string | null
          payment_method?: string
          recorded_by?: string | null
          reference_number?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string
          notes?: string | null
          patient_id?: string | null
          payment_method?: string
          recorded_by?: string | null
          reference_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacy_stock: {
        Row: {
          batch_number: string | null
          current_stock: number | null
          drug_id: string
          expiry_date: string | null
          id: string
          minimum_stock: number | null
          updated_at: string
        }
        Insert: {
          batch_number?: string | null
          current_stock?: number | null
          drug_id: string
          expiry_date?: string | null
          id?: string
          minimum_stock?: number | null
          updated_at?: string
        }
        Update: {
          batch_number?: string | null
          current_stock?: number | null
          drug_id?: string
          expiry_date?: string | null
          id?: string
          minimum_stock?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_stock_drug_id_fkey"
            columns: ["drug_id"]
            isOneToOne: false
            referencedRelation: "drugs"
            referencedColumns: ["id"]
          },
        ]
      }
      po_items: {
        Row: {
          created_at: string
          id: string
          item_id: string | null
          item_name: string
          po_id: string
          quantity: number
          received_quantity: number | null
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          item_id?: string | null
          item_name: string
          po_id: string
          quantity: number
          received_quantity?: number | null
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string | null
          item_name?: string
          po_id?: string
          quantity?: number
          received_quantity?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "po_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "po_items_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          created_at: string
          dispensed_at: string | null
          dispensed_by: string | null
          dosage: string
          drug_id: string | null
          drug_name: string
          duration: string | null
          encounter_id: string | null
          frequency: string
          id: string
          instructions: string | null
          patient_id: string
          prescribed_by: string | null
          prescription_number: string
          quantity: number | null
          status: Database["public"]["Enums"]["prescription_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          dispensed_at?: string | null
          dispensed_by?: string | null
          dosage: string
          drug_id?: string | null
          drug_name: string
          duration?: string | null
          encounter_id?: string | null
          frequency: string
          id?: string
          instructions?: string | null
          patient_id: string
          prescribed_by?: string | null
          prescription_number?: string
          quantity?: number | null
          status?: Database["public"]["Enums"]["prescription_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          dispensed_at?: string | null
          dispensed_by?: string | null
          dosage?: string
          drug_id?: string | null
          drug_name?: string
          duration?: string | null
          encounter_id?: string | null
          frequency?: string
          id?: string
          instructions?: string | null
          patient_id?: string
          prescribed_by?: string | null
          prescription_number?: string
          quantity?: number | null
          status?: Database["public"]["Enums"]["prescription_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_dispensed_by_fkey"
            columns: ["dispensed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_drug_id_fkey"
            columns: ["drug_id"]
            isOneToOne: false
            referencedRelation: "drugs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_prescribed_by_fkey"
            columns: ["prescribed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          email: string | null
          employee_id: string | null
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          employee_id?: string | null
          full_name?: string
          id: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          employee_id?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      purchase_orders: {
        Row: {
          created_at: string
          created_by: string | null
          expected_delivery: string | null
          id: string
          notes: string | null
          order_date: string
          po_number: string
          status: Database["public"]["Enums"]["po_status"]
          supplier_id: string | null
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expected_delivery?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          po_number: string
          status?: Database["public"]["Enums"]["po_status"]
          supplier_id?: string | null
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expected_delivery?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          po_number?: string
          status?: Database["public"]["Enums"]["po_status"]
          supplier_id?: string | null
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          item_id: string
          movement_type: string
          notes: string | null
          quantity: number
          reference_id: string | null
          reference_type: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          item_id: string
          movement_type: string
          notes?: string | null
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          item_id?: string
          movement_type?: string
          notes?: string | null
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      transfers: {
        Row: {
          admission_id: string
          created_at: string
          from_bed_id: string | null
          from_ward_id: string | null
          id: string
          patient_id: string
          reason: string | null
          to_bed_id: string | null
          to_ward_id: string | null
          transfer_time: string
          transferred_by: string | null
        }
        Insert: {
          admission_id: string
          created_at?: string
          from_bed_id?: string | null
          from_ward_id?: string | null
          id?: string
          patient_id: string
          reason?: string | null
          to_bed_id?: string | null
          to_ward_id?: string | null
          transfer_time?: string
          transferred_by?: string | null
        }
        Update: {
          admission_id?: string
          created_at?: string
          from_bed_id?: string | null
          from_ward_id?: string | null
          id?: string
          patient_id?: string
          reason?: string | null
          to_bed_id?: string | null
          to_ward_id?: string | null
          transfer_time?: string
          transferred_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transfers_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_from_bed_id_fkey"
            columns: ["from_bed_id"]
            isOneToOne: false
            referencedRelation: "beds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_from_ward_id_fkey"
            columns: ["from_ward_id"]
            isOneToOne: false
            referencedRelation: "wards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_to_bed_id_fkey"
            columns: ["to_bed_id"]
            isOneToOne: false
            referencedRelation: "beds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_to_ward_id_fkey"
            columns: ["to_ward_id"]
            isOneToOne: false
            referencedRelation: "wards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_transferred_by_fkey"
            columns: ["transferred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wards: {
        Row: {
          created_at: string
          department_id: string | null
          id: string
          is_active: boolean | null
          name: string
          total_beds: number | null
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          total_beds?: number | null
        }
        Update: {
          created_at?: string
          department_id?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          total_beds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "wards_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_claim_number: { Args: never; Returns: string }
      generate_invoice_number: { Args: never; Returns: string }
      generate_mrn: { Args: never; Returns: string }
      generate_order_number: { Args: never; Returns: string }
      generate_prescription_number: { Args: never; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      admission_status: "admitted" | "transferred" | "discharged"
      app_role:
        | "admin"
        | "reception"
        | "doctor"
        | "nurse"
        | "lab_tech"
        | "pharmacist"
        | "billing"
        | "inventory_manager"
      appointment_status:
        | "scheduled"
        | "checked_in"
        | "completed"
        | "no_show"
        | "cancelled"
      audit_action:
        | "create"
        | "update"
        | "delete"
        | "login"
        | "logout"
        | "view"
        | "approve"
        | "reject"
        | "dispense"
        | "void"
      blood_type:
        | "A+"
        | "A-"
        | "B+"
        | "B-"
        | "AB+"
        | "AB-"
        | "O+"
        | "O-"
        | "unknown"
      claim_status:
        | "draft"
        | "submitted"
        | "pending"
        | "approved"
        | "rejected"
        | "paid"
      gender_type: "male" | "female" | "other"
      invoice_status:
        | "draft"
        | "pending"
        | "paid"
        | "partial"
        | "voided"
        | "cancelled"
      order_priority: "routine" | "urgent" | "stat"
      order_status:
        | "pending"
        | "accepted"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "rejected"
      order_type: "lab" | "medication" | "procedure" | "imaging"
      po_status: "draft" | "submitted" | "approved" | "received" | "cancelled"
      prescription_status: "pending" | "dispensed" | "cancelled" | "on_hold"
      stock_status: "active" | "inactive" | "discontinued"
      task_status: "pending" | "in_progress" | "completed" | "skipped"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admission_status: ["admitted", "transferred", "discharged"],
      app_role: [
        "admin",
        "reception",
        "doctor",
        "nurse",
        "lab_tech",
        "pharmacist",
        "billing",
        "inventory_manager",
      ],
      appointment_status: [
        "scheduled",
        "checked_in",
        "completed",
        "no_show",
        "cancelled",
      ],
      audit_action: [
        "create",
        "update",
        "delete",
        "login",
        "logout",
        "view",
        "approve",
        "reject",
        "dispense",
        "void",
      ],
      blood_type: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown"],
      claim_status: [
        "draft",
        "submitted",
        "pending",
        "approved",
        "rejected",
        "paid",
      ],
      gender_type: ["male", "female", "other"],
      invoice_status: [
        "draft",
        "pending",
        "paid",
        "partial",
        "voided",
        "cancelled",
      ],
      order_priority: ["routine", "urgent", "stat"],
      order_status: [
        "pending",
        "accepted",
        "in_progress",
        "completed",
        "cancelled",
        "rejected",
      ],
      order_type: ["lab", "medication", "procedure", "imaging"],
      po_status: ["draft", "submitted", "approved", "received", "cancelled"],
      prescription_status: ["pending", "dispensed", "cancelled", "on_hold"],
      stock_status: ["active", "inactive", "discontinued"],
      task_status: ["pending", "in_progress", "completed", "skipped"],
    },
  },
} as const
