// ==============================================================================
// SlotCare Database & Domain TypeScript Definitions
// Strict typing for all 7 PostgreSQL tables and domain models
// ==============================================================================

export type StaffRole = 'admin' | 'receptionist';
export type AppointmentStatus = 'scheduled' | 'cancelled' | 'recovered' | 'completed' | 'no_show';
export type WaitlistStatus = 'waiting' | 'offered' | 'booked' | 'archived';
export type OfferStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface Clinic {
  id: string;
  name: string;
  phone: string;
  timezone: string;
  created_at: string;
}

export interface Staff {
  id: string;
  clinic_id: string;
  user_id: string;
  full_name: string;
  role: StaffRole;
  created_at: string;
}

export interface Doctor {
  id: string;
  clinic_id: string;
  full_name: string;
  specialty: string;
  color_code: string;
  is_active: boolean;
  created_at: string;
}

export interface Service {
  id: string;
  clinic_id: string;
  name: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  clinic_id: string;
  doctor_id: string;
  service_id: string;
  patient_name: string;
  patient_phone: string;
  start_time: string; // ISO String
  end_time: string;   // ISO String
  status: AppointmentStatus;
  cancelled_at?: string | null;
  recovered_from_appointment_id?: string | null;
  created_at: string;
}

export interface WaitlistEntry {
  id: string;
  clinic_id: string;
  patient_name: string;
  patient_phone: string;
  service_id: string;
  preferred_doctor_id?: string | null;
  preferred_days: string[]; // e.g. ["الأحد", "الاثنين", "اليوم"] or English names
  preferred_time_start?: string | null; // e.g. "14:00"
  preferred_time_end?: string | null;   // e.g. "19:00"
  any_today: boolean;
  status: WaitlistStatus;
  notes?: string | null;
  created_at: string;
}

export interface SlotOffer {
  id: string;
  clinic_id: string;
  appointment_id: string;
  waitlist_id: string;
  token: string;
  status: OfferStatus;
  sent_at: string;
  responded_at?: string | null;
  expires_at: string;
  created_at: string;
}

// Matching Engine Types
export type MatchType = 'EXACT' | 'PARTIAL' | 'NONE';

export interface MatchCandidate {
  waitlistEntry: WaitlistEntry;
  matchType: MatchType;
  score: number; // 100 for exact, 50-80 for partial
  reasons: string[];
  doctor?: Doctor;
  service?: Service;
}

// Recovery Audit Entry
export interface RecoveryAuditLog {
  id: string;
  appointmentId: string;
  originalPatientName: string;
  originalDoctorName: string;
  serviceName: string;
  appointmentTime: string;
  cancelledAt: string;
  recoveredAt: string;
  recoveredPatientName: string;
  recoveredPatientPhone: string;
  timeToRecoverMinutes: number;
  revenueSaved: number;
}

// Analytics KPI Metrics
export interface RecoveryStats {
  cancelledCount: number;
  recoveredCount: number;
  recoveryRatePercent: number;
  avgTimeToRecoverMinutes: number;
  revenueSavedTotal: number;
}
