'use client';

// ==============================================================================
// SlotCare Centralized Application State Provider
// Enhanced for Phase 2: Live Supabase Integration + Multi-Tenant Fallback
// ==============================================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Clinic,
  Doctor,
  Service,
  Appointment,
  WaitlistEntry,
  SlotOffer,
  RecoveryAuditLog,
  RecoveryStats,
  Staff,
} from '@/types/database.types';
import { isSupabaseConfigured, createClient } from '@/lib/supabase/client';
import { clinicService } from '@/lib/services/clinic-service';

export interface SlotCareContextType {
  isDemoMode: boolean;
  clinic: Clinic;
  staff: Staff;
  doctors: Doctor[];
  services: Service[];
  appointments: Appointment[];
  waitlist: WaitlistEntry[];
  slotOffers: SlotOffer[];
  auditLogs: RecoveryAuditLog[];
  stats: RecoveryStats;
  
  // Actions
  updateClinic: (updates: Partial<Clinic>) => Promise<{ success: boolean; error?: string }>;
  addDoctor: (doctor: Omit<Doctor, 'id' | 'clinic_id' | 'created_at'>) => Promise<{ success: boolean; error?: string }>;
  editDoctor: (id: string, updates: Partial<Doctor>) => Promise<{ success: boolean; error?: string }>;
  addService: (service: Omit<Service, 'id' | 'clinic_id' | 'created_at'>) => Promise<{ success: boolean; error?: string }>;
  editService: (id: string, updates: Partial<Service>) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshLiveClinicData: () => Promise<void>;

  cancelAppointment: (appointmentId: string) => void;
  createAppointment: (appointment: Omit<Appointment, 'id' | 'clinic_id' | 'created_at'>) => void;
  addToWaitlist: (entry: Omit<WaitlistEntry, 'id' | 'clinic_id' | 'created_at' | 'status'>) => void;
  generateSlotOffer: (appointmentId: string, waitlistId: string) => SlotOffer;
  claimOffer: (token: string) => { success: boolean; message: string; appointment?: Appointment };
  declineOffer: (token: string) => { success: boolean; message: string };
  getOfferByToken: (token: string) => {
    offer?: SlotOffer;
    appointment?: Appointment;
    waitlist?: WaitlistEntry;
    doctor?: Doctor;
    service?: Service;
  } | null;
  resetDemoData: () => void;
}

const SlotCareContext = createContext<SlotCareContextType | undefined>(undefined);

// ------------------------------------------------------------------------------
// Initial Realistic Dental Clinic Mock Data (عيادة سمايل لطب الأسنان)
// ------------------------------------------------------------------------------

const CLINIC_ID = 'a0000000-0000-0000-0000-000000000001';

const INITIAL_CLINIC: Clinic = {
  id: CLINIC_ID,
  name: 'عيادة سمايل لطب وجراحة الأسنان',
  phone: '0112345678',
  timezone: 'Asia/Riyadh',
  created_at: '2026-01-01T08:00:00Z',
};

const INITIAL_STAFF: Staff = {
  id: 'staff_01',
  clinic_id: CLINIC_ID,
  user_id: 'user_reception_01',
  full_name: 'ريم الدوسري',
  role: 'receptionist',
  created_at: '2026-01-01T08:00:00Z',
};

const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    clinic_id: CLINIC_ID,
    full_name: 'د. أحمد المنصور',
    specialty: 'جراحة وزراعة الأسنان',
    color_code: '#0284c7', // Sky Blue
    is_active: true,
    created_at: '2026-01-01T08:00:00Z',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    clinic_id: CLINIC_ID,
    full_name: 'د. سارة القحطاني',
    specialty: 'تقويم الأسنان وتجميل الابتسامة',
    color_code: '#0d9488', // Teal
    is_active: true,
    created_at: '2026-01-01T08:00:00Z',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    clinic_id: CLINIC_ID,
    full_name: 'د. خالد العتيبي',
    specialty: 'علاج الجذور وحشو العصب المجهري',
    color_code: '#7c3aed', // Purple
    is_active: true,
    created_at: '2026-01-01T08:00:00Z',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000004',
    clinic_id: CLINIC_ID,
    full_name: 'د. ليلى الشمري',
    specialty: 'طب أسنان الأطفال والعناية الوقائية',
    color_code: '#ea580c', // Orange
    is_active: true,
    created_at: '2026-01-01T08:00:00Z',
  },
];

const INITIAL_SERVICES: Service[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    clinic_id: CLINIC_ID,
    name: 'تنظيف وتلميع الأسنان وإزالة الجير',
    duration_minutes: 30,
    price: 250,
    is_active: true,
    created_at: '2026-01-01T08:00:00Z',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    clinic_id: CLINIC_ID,
    name: 'حشو عصب وجذور متقدم بالمجهر',
    duration_minutes: 60,
    price: 850,
    is_active: true,
    created_at: '2026-01-01T08:00:00Z',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    clinic_id: CLINIC_ID,
    name: 'فحص واستشارة تقويم الأسنان الشفاف',
    duration_minutes: 45,
    price: 350,
    is_active: true,
    created_at: '2026-01-01T08:00:00Z',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000004',
    clinic_id: CLINIC_ID,
    name: 'جلسة تبييض الأسنان بالليزر (زووم)',
    duration_minutes: 60,
    price: 1100,
    is_active: true,
    created_at: '2026-01-01T08:00:00Z',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000005',
    clinic_id: CLINIC_ID,
    name: 'حشوة تجميلية كمبوزيت للأسنان الأمامية',
    duration_minutes: 45,
    price: 400,
    is_active: true,
    created_at: '2026-01-01T08:00:00Z',
  },
];

function getTodayDateString(hours: number, minutes: number = 0): string {
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'appt_target_4pm',
    clinic_id: CLINIC_ID,
    doctor_id: 'b0000000-0000-0000-0000-000000000001',
    service_id: 'c0000000-0000-0000-0000-000000000001',
    patient_name: 'محمد العمري',
    patient_phone: '0541122334',
    start_time: getTodayDateString(16, 0),
    end_time: getTodayDateString(16, 30),
    status: 'cancelled',
    cancelled_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    recovered_from_appointment_id: null,
    created_at: '2026-10-30T10:00:00Z',
  },
  {
    id: 'appt_ahmed_1',
    clinic_id: CLINIC_ID,
    doctor_id: 'b0000000-0000-0000-0000-000000000001',
    service_id: 'c0000000-0000-0000-0000-000000000004',
    patient_name: 'سلطان القاسمي',
    patient_phone: '0501239874',
    start_time: getTodayDateString(14, 0),
    end_time: getTodayDateString(15, 0),
    status: 'completed',
    created_at: '2026-10-29T14:00:00Z',
  },
  {
    id: 'appt_sarah_1',
    clinic_id: CLINIC_ID,
    doctor_id: 'b0000000-0000-0000-0000-000000000002',
    service_id: 'c0000000-0000-0000-0000-000000000003',
    patient_name: 'ريم العبدالله',
    patient_phone: '0507744112',
    start_time: getTodayDateString(15, 0),
    end_time: getTodayDateString(15, 45),
    status: 'scheduled',
    created_at: '2026-10-28T09:00:00Z',
  },
  {
    id: 'appt_khalid_1',
    clinic_id: CLINIC_ID,
    doctor_id: 'b0000000-0000-0000-0000-000000000003',
    service_id: 'c0000000-0000-0000-0000-000000000002',
    patient_name: 'طارق الحربي',
    patient_phone: '0562211445',
    start_time: getTodayDateString(17, 0),
    end_time: getTodayDateString(18, 0),
    status: 'scheduled',
    created_at: '2026-10-28T16:00:00Z',
  },
];

const INITIAL_WAITLIST: WaitlistEntry[] = [
  {
    id: 'wl_01',
    clinic_id: CLINIC_ID,
    patient_name: 'عبدالعزيز التميمي',
    patient_phone: '0551234567',
    service_id: 'c0000000-0000-0000-0000-000000000001',
    preferred_doctor_id: 'b0000000-0000-0000-0000-000000000001',
    preferred_days: ['اليوم', 'السبت', 'الأحد'],
    preferred_time_start: '15:00',
    preferred_time_end: '19:00',
    any_today: true,
    status: 'waiting',
    notes: 'ألم خفيف ويرغب في موعد عاجل اليوم إذا توفر شاغر',
    created_at: '2026-10-31T01:10:00Z',
  },
  {
    id: 'wl_02',
    clinic_id: CLINIC_ID,
    patient_name: 'فاطمة الشهري',
    patient_phone: '0509876543',
    service_id: 'c0000000-0000-0000-0000-000000000001',
    preferred_doctor_id: null,
    preferred_days: ['السبت', 'الأحد', 'اليوم'],
    preferred_time_start: '16:00',
    preferred_time_end: '18:00',
    any_today: true,
    status: 'waiting',
    notes: 'تناسبها فترة بعد العصر وتفضل الحضور اليوم',
    created_at: '2026-10-31T01:25:00Z',
  },
  {
    id: 'wl_03',
    clinic_id: CLINIC_ID,
    patient_name: 'عمر السليمان',
    patient_phone: '0563322114',
    service_id: 'c0000000-0000-0000-0000-000000000001',
    preferred_doctor_id: 'b0000000-0000-0000-0000-000000000002',
    preferred_days: ['الاثنين', 'الثلاثاء'],
    preferred_time_start: '18:00',
    preferred_time_end: '21:00',
    any_today: false,
    status: 'waiting',
    notes: 'يفضل د. سارة في المساء، لكن مستعد للحضور إن تعذر',
    created_at: '2026-10-30T16:00:00Z',
  },
];

const INITIAL_AUDIT_LOGS: RecoveryAuditLog[] = [
  {
    id: 'log_01',
    appointmentId: 'appt_rec_01',
    originalPatientName: 'سامي البلوي',
    originalDoctorName: 'د. أحمد المنصور',
    serviceName: 'تنظيف وتلميع الأسنان',
    appointmentTime: 'أمس 02:00 م',
    cancelledAt: 'أمس 01:15 م',
    recoveredAt: 'أمس 01:28 م',
    recoveredPatientName: 'هشام الغامدي',
    recoveredPatientPhone: '0554433221',
    timeToRecoverMinutes: 13,
    revenueSaved: 250,
  },
];

const INITIAL_STATS: RecoveryStats = {
  cancelledCount: 40,
  recoveredCount: 24,
  recoveryRatePercent: 60,
  avgTimeToRecoverMinutes: 14,
  revenueSavedTotal: 9600,
};

// ------------------------------------------------------------------------------
// Provider Implementation
// ------------------------------------------------------------------------------

export const SlotCareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isDemoMode = !isSupabaseConfigured();

  const [clinic, setClinic] = useState<Clinic>(INITIAL_CLINIC);
  const [staff, setStaff] = useState<Staff>(INITIAL_STAFF);
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>(INITIAL_WAITLIST);
  const [slotOffers, setSlotOffers] = useState<SlotOffer[]>([]);
  const [auditLogs, setAuditLogs] = useState<RecoveryAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [stats, setStats] = useState<RecoveryStats>(INITIAL_STATS);

  // Refresh live data from Supabase if connected
  const refreshLiveClinicData = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    if (!supabase) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const staffData = await clinicService.getStaffByUserId(user.id);
      if (staffData) {
        setStaff(staffData);
        if (staffData.clinic) {
          setClinic(staffData.clinic);
        }
        // Load doctors and services for this clinic
        const [liveDoctors, liveServices] = await Promise.all([
          clinicService.getDoctors(staffData.clinic_id),
          clinicService.getServices(staffData.clinic_id),
        ]);

        if (liveDoctors.length > 0) setDoctors(liveDoctors);
        if (liveServices.length > 0) setServices(liveServices);
      }
    } catch (err) {
      console.warn('Error syncing with live Supabase:', err);
    }
  }, []);

  // Sync state with LocalStorage for demo fallback and live initialization
  useEffect(() => {
    if (isDemoMode) {
      try {
        const saved = localStorage.getItem('slotcare_state_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.clinic) setClinic(parsed.clinic);
          if (parsed.staff) setStaff(parsed.staff);
          if (parsed.doctors) setDoctors(parsed.doctors);
          if (parsed.services) setServices(parsed.services);
          if (parsed.appointments) setAppointments(parsed.appointments);
          if (parsed.waitlist) setWaitlist(parsed.waitlist);
          if (parsed.slotOffers) setSlotOffers(parsed.slotOffers);
          if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
          if (parsed.stats) setStats(parsed.stats);
        }
      } catch {
        // ignore
      }
    } else {
      refreshLiveClinicData();
    }
  }, [isDemoMode, refreshLiveClinicData]);

  const saveToStorage = (
    c: Clinic,
    d: Doctor[],
    s: Service[],
    appts: Appointment[],
    wl: WaitlistEntry[],
    offers: SlotOffer[],
    logs: RecoveryAuditLog[],
    st: RecoveryStats
  ) => {
    if (isDemoMode) {
      try {
        localStorage.setItem(
          'slotcare_state_v1',
          JSON.stringify({
            clinic: c,
            doctors: d,
            services: s,
            appointments: appts,
            waitlist: wl,
            slotOffers: offers,
            auditLogs: logs,
            stats: st,
          })
        );
      } catch {
        // ignore
      }
    }
  };

  // Update Clinic Profile
  const updateClinic = async (updates: Partial<Clinic>): Promise<{ success: boolean; error?: string }> => {
    const updatedClinic = { ...clinic, ...updates };
    setClinic(updatedClinic);

    if (!isDemoMode) {
      const res = await clinicService.updateClinicProfile(clinic.id, updates);
      if (!res.success) return res;
    }

    saveToStorage(updatedClinic, doctors, services, appointments, waitlist, slotOffers, auditLogs, stats);
    return { success: true };
  };

  // Doctor CRUD
  const addDoctor = async (
    doctorData: Omit<Doctor, 'id' | 'clinic_id' | 'created_at'>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isDemoMode) {
      const res = await clinicService.createDoctor({
        ...doctorData,
        clinic_id: clinic.id,
      });
      if (!res.success || !res.data) {
        return { success: false, error: res.error || 'فشل في إضافة الطبيب' };
      }
      const updated = [...doctors, res.data];
      setDoctors(updated);
      return { success: true };
    }

    const newDoc: Doctor = {
      ...doctorData,
      id: `doc_${Date.now()}`,
      clinic_id: clinic.id,
      created_at: new Date().toISOString(),
    };
    const updated = [...doctors, newDoc];
    setDoctors(updated);
    saveToStorage(clinic, updated, services, appointments, waitlist, slotOffers, auditLogs, stats);
    return { success: true };
  };

  const editDoctor = async (
    id: string,
    updates: Partial<Doctor>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isDemoMode) {
      const res = await clinicService.updateDoctor(id, updates);
      if (!res.success) return res;
    }

    const updated = doctors.map((d) => (d.id === id ? { ...d, ...updates } : d));
    setDoctors(updated);
    saveToStorage(clinic, updated, services, appointments, waitlist, slotOffers, auditLogs, stats);
    return { success: true };
  };

  // Service CRUD
  const addService = async (
    serviceData: Omit<Service, 'id' | 'clinic_id' | 'created_at'>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isDemoMode) {
      const res = await clinicService.createService({
        ...serviceData,
        clinic_id: clinic.id,
      });
      if (!res.success || !res.data) {
        return { success: false, error: res.error || 'فشل في إضافة الخدمة' };
      }
      const updated = [...services, res.data];
      setServices(updated);
      return { success: true };
    }

    const newSrv: Service = {
      ...serviceData,
      id: `srv_${Date.now()}`,
      clinic_id: clinic.id,
      created_at: new Date().toISOString(),
    };
    const updated = [...services, newSrv];
    setServices(updated);
    saveToStorage(clinic, doctors, updated, appointments, waitlist, slotOffers, auditLogs, stats);
    return { success: true };
  };

  const editService = async (
    id: string,
    updates: Partial<Service>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isDemoMode) {
      const res = await clinicService.updateService(id, updates);
      if (!res.success) return res;
    }

    const updated = services.map((s) => (s.id === id ? { ...s, ...updates } : s));
    setServices(updated);
    saveToStorage(clinic, doctors, updated, appointments, waitlist, slotOffers, auditLogs, stats);
    return { success: true };
  };

  // Sign Out Handler
  const signOut = async () => {
    if (!isDemoMode) {
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    }
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  // Appointments & Recovery workflows (Preserved from Phase 1)
  const cancelAppointment = (appointmentId: string) => {
    const updatedAppointments = appointments.map((a) => {
      if (a.id === appointmentId) {
        return {
          ...a,
          status: 'cancelled' as const,
          cancelled_at: new Date().toISOString(),
        };
      }
      return a;
    });

    const updatedStats: RecoveryStats = {
      ...stats,
      cancelledCount: stats.cancelledCount + 1,
      recoveryRatePercent: Math.round(
        (stats.recoveredCount / (stats.cancelledCount + 1)) * 100
      ),
    };

    setAppointments(updatedAppointments);
    setStats(updatedStats);
    saveToStorage(clinic, doctors, services, updatedAppointments, waitlist, slotOffers, auditLogs, updatedStats);
  };

  const createAppointment = (
    data: Omit<Appointment, 'id' | 'clinic_id' | 'created_at'>
  ) => {
    const newAppt: Appointment = {
      ...data,
      id: `appt_${Date.now()}`,
      clinic_id: clinic.id,
      created_at: new Date().toISOString(),
    };
    const updated = [newAppt, ...appointments];
    setAppointments(updated);
    saveToStorage(clinic, doctors, services, updated, waitlist, slotOffers, auditLogs, stats);
  };

  const addToWaitlist = (
    data: Omit<WaitlistEntry, 'id' | 'clinic_id' | 'created_at' | 'status'>
  ) => {
    const newEntry: WaitlistEntry = {
      ...data,
      id: `wl_${Date.now()}`,
      clinic_id: clinic.id,
      status: 'waiting',
      created_at: new Date().toISOString(),
    };
    const updated = [newEntry, ...waitlist];
    setWaitlist(updated);
    saveToStorage(clinic, doctors, services, appointments, updated, slotOffers, auditLogs, stats);
  };

  const generateSlotOffer = (appointmentId: string, waitlistId: string): SlotOffer => {
    const randomHex = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    const token = `sc_${randomHex}`;

    const newOffer: SlotOffer = {
      id: `offer_${Date.now()}`,
      clinic_id: clinic.id,
      appointment_id: appointmentId,
      waitlist_id: waitlistId,
      token,
      status: 'pending',
      sent_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    };

    const updatedWaitlist = waitlist.map((w) =>
      w.id === waitlistId ? { ...w, status: 'offered' as const } : w
    );

    const updatedOffers = [newOffer, ...slotOffers];

    setSlotOffers(updatedOffers);
    setWaitlist(updatedWaitlist);
    saveToStorage(clinic, doctors, services, appointments, updatedWaitlist, updatedOffers, auditLogs, stats);

    return newOffer;
  };

  const claimOffer = (token: string) => {
    const offer = slotOffers.find((o) => o.token === token);
    if (!offer) {
      return { success: false, message: 'رمز العرض غير صالح أو غير موجود.' };
    }

    if (offer.status === 'accepted') {
      return { success: false, message: 'تم تأكيد هذا الموعد مسبقاً.' };
    }

    if (offer.status === 'expired' || new Date(offer.expires_at) < new Date()) {
      return { success: false, message: 'عذراً، انتهت صلاحية هذا الرابط.' };
    }

    if (offer.status === 'declined') {
      return { success: false, message: 'تم الاعتذار عن هذا الموعد سابقاً.' };
    }

    const appt = appointments.find((a) => a.id === offer.appointment_id);
    const patient = waitlist.find((w) => w.id === offer.waitlist_id);

    if (!appt || !patient) {
      return { success: false, message: 'بيانات الموعد غير متوفرة.' };
    }

    if (appt.status === 'recovered') {
      return { success: false, message: 'عذراً، تم حجز هذا الموعد بالفعل من قبل مريض آخر.' };
    }

    const updatedOffers = slotOffers.map((o) => {
      if (o.token === token) {
        return { ...o, status: 'accepted' as const, responded_at: new Date().toISOString() };
      }
      if (o.appointment_id === offer.appointment_id && o.status === 'pending') {
        return { ...o, status: 'expired' as const };
      }
      return o;
    });

    const updatedAppointments = appointments.map((a) => {
      if (a.id === offer.appointment_id) {
        return {
          ...a,
          status: 'recovered' as const,
          patient_name: patient.patient_name,
          patient_phone: patient.patient_phone,
          recovered_from_appointment_id: a.id,
        };
      }
      return a;
    });

    const updatedWaitlist = waitlist.map((w) => {
      if (w.id === offer.waitlist_id) {
        return { ...w, status: 'booked' as const };
      }
      return w;
    });

    const doctor = doctors.find((d) => d.id === appt.doctor_id);
    const service = services.find((s) => s.id === appt.service_id);
    const timeToRecover = appt.cancelled_at
      ? Math.max(1, Math.round((Date.now() - new Date(appt.cancelled_at).getTime()) / (60 * 1000)))
      : 12;

    const newLog: RecoveryAuditLog = {
      id: `log_${Date.now()}`,
      appointmentId: appt.id,
      originalPatientName: appt.patient_name,
      originalDoctorName: doctor?.full_name || 'طبيب العيادة',
      serviceName: service?.name || 'خدمة أسنان',
      appointmentTime: new Date(appt.start_time).toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      cancelledAt: 'اليوم',
      recoveredAt: 'الآن',
      recoveredPatientName: patient.patient_name,
      recoveredPatientPhone: patient.patient_phone,
      timeToRecoverMinutes: timeToRecover,
      revenueSaved: service?.price || 250,
    };

    const updatedAuditLogs = [newLog, ...auditLogs];

    const newRecoveredCount = stats.recoveredCount + 1;
    const updatedStats: RecoveryStats = {
      cancelledCount: stats.cancelledCount,
      recoveredCount: newRecoveredCount,
      recoveryRatePercent: Math.round((newRecoveredCount / stats.cancelledCount) * 100),
      avgTimeToRecoverMinutes: Math.round(
        (stats.avgTimeToRecoverMinutes * stats.recoveredCount + timeToRecover) /
          newRecoveredCount
      ),
      revenueSavedTotal: stats.revenueSavedTotal + (service?.price || 250),
    };

    setSlotOffers(updatedOffers);
    setAppointments(updatedAppointments);
    setWaitlist(updatedWaitlist);
    setAuditLogs(updatedAuditLogs);
    setStats(updatedStats);

    saveToStorage(
      clinic,
      doctors,
      services,
      updatedAppointments,
      updatedWaitlist,
      updatedOffers,
      updatedAuditLogs,
      updatedStats
    );

    const recoveredAppt = updatedAppointments.find((a) => a.id === offer.appointment_id);
    return {
      success: true,
      message: 'تم تأكيد حجز الموعد بنجاح! نتطلع لاستقبالك في العيادة.',
      appointment: recoveredAppt,
    };
  };

  const declineOffer = (token: string) => {
    const offer = slotOffers.find((o) => o.token === token);
    if (!offer) {
      return { success: false, message: 'رمز العرض غير صالح.' };
    }

    const updatedOffers = slotOffers.map((o) =>
      o.token === token
        ? { ...o, status: 'declined' as const, responded_at: new Date().toISOString() }
        : o
    );

    const updatedWaitlist = waitlist.map((w) =>
      w.id === offer.waitlist_id ? { ...w, status: 'waiting' as const } : w
    );

    setSlotOffers(updatedOffers);
    setWaitlist(updatedWaitlist);
    saveToStorage(clinic, doctors, services, appointments, updatedWaitlist, updatedOffers, auditLogs, stats);

    return { success: true, message: 'تم تسجيل اعتذارك، شكراً لتجاوبك.' };
  };

  const getOfferByToken = (token: string) => {
    const offer = slotOffers.find((o) => o.token === token);
    if (!offer) return null;

    const appointment = appointments.find((a) => a.id === offer.appointment_id);
    const waitlistEntry = waitlist.find((w) => w.id === offer.waitlist_id);
    const doctor = appointment ? doctors.find((d) => d.id === appointment.doctor_id) : undefined;
    const service = appointment ? services.find((s) => s.id === appointment.service_id) : undefined;

    return {
      offer,
      appointment,
      waitlist: waitlistEntry,
      doctor,
      service,
    };
  };

  const resetDemoData = () => {
    try {
      localStorage.removeItem('slotcare_state_v1');
    } catch {
      // ignore
    }
    setClinic(INITIAL_CLINIC);
    setStaff(INITIAL_STAFF);
    setDoctors(INITIAL_DOCTORS);
    setServices(INITIAL_SERVICES);
    setAppointments(INITIAL_APPOINTMENTS);
    setWaitlist(INITIAL_WAITLIST);
    setSlotOffers([]);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setStats(INITIAL_STATS);
  };

  return (
    <SlotCareContext.Provider
      value={{
        isDemoMode,
        clinic,
        staff,
        doctors,
        services,
        appointments,
        waitlist,
        slotOffers,
        auditLogs,
        stats,
        updateClinic,
        addDoctor,
        editDoctor,
        addService,
        editService,
        signOut,
        refreshLiveClinicData,
        cancelAppointment,
        createAppointment,
        addToWaitlist,
        generateSlotOffer,
        claimOffer,
        declineOffer,
        getOfferByToken,
        resetDemoData,
      }}
    >
      {children}
    </SlotCareContext.Provider>
  );
};

export const useSlotCare = (): SlotCareContextType => {
  const context = useContext(SlotCareContext);
  if (!context) {
    throw new Error('useSlotCare must be used within a SlotCareProvider');
  }
  return context;
};
