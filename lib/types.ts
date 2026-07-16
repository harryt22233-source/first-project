export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";
export type JobStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

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
  client_id: string;
  date: string;
  description: string | null;
  hours: number | null;
  crew_size: number | null;
  source_photo_url: string | null;
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
