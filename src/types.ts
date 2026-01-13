export type RegistrationStatus = "not_sent" | "sent" | "received" | "incomplete" | "confirmed";
export type PaymentStatus = "not_paid" | "deposit_paid" | "paid_in_full";
export type AttendanceStatus = "interested" | "confirmed" | "withdrawn" | "declined";

export interface Participant {
  id: string;
  retreat_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  source?: string;
  registration_status: RegistrationStatus;
  payment_status: PaymentStatus;
  attendance_status: AttendanceStatus;
  dietary_requirements?: string;
  notes?: string;
  tags?: string[];
  last_contacted?: Date;
  added_by?: string;
  created_at: Date;
  user_id?: string;
}

export interface Retreat {
  id: string;
  user_id: string;
  name: string;
  dates: string;
  location: string;
  capacity: number;
  whatsapp_link?: string;
  status: "open" | "closed" | "archived";
  created_at: string;
}