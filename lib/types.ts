export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";
export type JobStatus = "draft" | "scheduled" | "in_progress" | "completed" | "cancelled";

export interface Client {
  id: string;
  name: string;
  property_address: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
}

export interface Job {
  id: string;
  client_id: string | null;
  client_name_raw: string | null;
  timesheet_id: string | null;
  date: string;
  description: string | null;
  hours: number | null;
  crew_size: number | null;
  source_photo_url: string | null;
  materials: { material: string; quantity: string }[];
  suggested_amount: number | null;
  field_confidence: Record<string, "high" | "low">;
  status: JobStatus;
  created_at: string;
}

export interface LineItem {
  description: string;
  qty: number;
  rate: number;
}

export interface Invoice {
  id: string;
  client_id: string;
  invoice_number: string;
  line_items: LineItem[];
  total: number;
  status: InvoiceStatus;
  sent_date: string | null;
  paid_date: string | null;
  created_at: string;
}

export interface Settings {
  id: number;
  business_name: string;
  business_address: string;
  business_phone: string;
  hourly_rate: number;
  next_invoice_number: number;
}

export interface Timesheet {
  id: string;
  photo_path: string;
  status: string;
  error_message: string | null;
  created_at: string;
}
