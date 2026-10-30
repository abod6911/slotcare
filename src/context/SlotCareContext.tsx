'use client';

// ==============================================================================
// SlotCare Centralized Application State Provider
// Realistic Dental Clinic Mock Store & In-Memory State Machine
// ==============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
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

export interface SlotCareContextType {
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

const CLINIC_ID = 'clinic_smile_01';

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
    id: 'doc_ahmed',
    clinic_id: CLINIC_ID,
    full_name: 'د. أحمد المنصور',
    specialty: 'جراحة وزراعة الأسنان',
    color_code: '#0284c7', // Sky Blue
    is_active: true,
    created_at: '2026-01-01T08:00:00Z',
  },
  {
    id: 'doc_sarah',
    clinic_id: CLINIC_ID,
    full_name: 'د. سارة القحطاني',
    specialty: 'تقويم الأسنان وتجميل الابتسامة',
    color_code: '#0d9488', // Teal
    is_active: true,
    created_at: '2026-01-01T08:00:00Z',
  },
  {
    id: 'doc_khalid',
    clinic_id: CLINIC_ID,
    full_name: 'د. خالد العتيبي',
    specialty: 'علاج الجذور وحشو العصب المجهري',
    color_code: '#7c3aed', // Purple
    is_active: true,
    created_at: '2026-01-01T08:00:00Z',
  },
  {
    id: 'doc_layla',
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
    id: 'srv_cleaning',
    clinic_id: CLINIC_ID,
    name: 'تنظيف وتلميع الأسنان وإزالة الجير',
    duration_minutes: 30,
    price: 250,
    is_active: true,
    created_at: '2026-01-01T08:00:00Z',
  },
  {
    id: 'srv_rootcanal',
    clinic_id: CLINIC_ID,
    name: 'حشو عصب وجذور متقدم بالمجهر',
    duration_minutes: 60,
    price: 850,
    is_active: true,
    created_at: '2026-01-01T08:00:00Z',
  },
  {
    id: 'srv_ortho',
    clinic_id: CLINIC_ID,
    name: 'استشارة وفحص تقويم الأسنان الشفاف',
    duration_minutes: 45,
    price: 350,
    is_active: true,
    created_at: '2026-01-01T08:00:00Z',
  },
  {
    id: 'srv_whitening',
    clinic_id: CLINIC_ID,
    name: 'جلسة تبييض الأسنان بالليزر (زووم)',
    duration_minutes: 60,
    price: 1100,
    is_active: true,
    created_at: '2026-01-01T08:00:00Z',
  },
];

// Helper to get formatted timestamps for "today"
function getTodayDateString(hours: number, minutes: number = 0): string {
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

const INITIAL_APPOINTMENTS: Appointment[] = [
  // Primary Showcase Slot: 4:00 PM cancelled slot with Dr. Ahmed for Cleaning
  {
    id: 'appt_target_4pm',
    clinic_id: CLINIC_ID,
    doctor_id: 'doc_ahmed',
    service_id: 'srv_cleaning',
    patient_name: 'محمد العمري',
    patient_phone: '0541122334',
    start_time: getTodayDateString(16, 0), // 4:00 PM today
    end_time: getTodayDateString(16, 30),   // 4:30 PM today
    status: 'cancelled',
    cancelled_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25 mins ago
    recovered_from_appointment_id: null,
    created_at: '2026-10-30T10:00:00Z',
  },
  // Active Schedule for Doctor Ahmed
  {
    id: 'appt_ahmed_1',
    clinic_id: CLINIC_ID,
    doctor_id: 'doc_ahmed',
    service_id: 'srv_whitening',
    patient_name: 'سلطان القاسمي',
    patient_phone: '0501239874',
    start_time: getTodayDateString(14, 0),
    end_time: getTodayDateString(15, 0),
    status: 'completed',
    created_at: '2026-10-29T14:00:00Z',
  },
  {
    id: 'appt_ahmed_3',
    clinic_id: CLINIC_ID,
    doctor_id: 'doc_ahmed',
    service_id: 'srv_rootcanal',
    patient_name: 'بندر الشريف',
    patient_phone: '0559988771',
    start_time: getTodayDateString(17, 30),
    end_time: getTodayDateString(18, 30),
    status: 'scheduled',
    created_at: '2026-10-30T11:00:00Z',
  },
  // Dr. Sarah appointments
  {
    id: 'appt_sarah_1',
    clinic_id: CLINIC_ID,
    doctor_id: 'doc_sarah',
    service_id: 'srv_ortho',
    patient_name: 'ريم العبدالله',
    patient_phone: '0507744112',
    start_time: getTodayDateString(15, 0),
    end_time: getTodayDateString(15, 45),
    status: 'scheduled',
    created_at: '2026-10-28T09:00:00Z',
  },
  {
    id: 'appt_sarah_2',
    clinic_id: CLINIC_ID,
    doctor_id: 'doc_sarah',
    service_id: 'srv_ortho',
    patient_name: 'منى الشهري',
    patient_phone: '0543322119',
    start_time: getTodayDateString(16, 30),
    end_time: getTodayDateString(17, 15),
    status: 'scheduled',
    created_at: '2026-10-29T12:00:00Z',
  },
  // Dr. Khalid appointments
  {
    id: 'appt_khalid_1',
    clinic_id: CLINIC_ID,
    doctor_id: 'doc_khalid',
    service_id: 'srv_rootcanal',
    patient_name: 'طارق الحربي',
    patient_phone: '0562211445',
    start_time: getTodayDateString(16, 0),
    end_time: getTodayDateString(17, 0),
    status: 'scheduled',
    created_at: '2026-10-28T16:00:00Z',
  },
  // Dr. Layla appointments
  {
    id: 'appt_layla_1',
    clinic_id: CLINIC_ID,
    doctor_id: 'doc_layla',
    service_id: 'srv_cleaning',
    patient_name: 'الطفل سعود الناصر',
    patient_phone: '0556677889',
    start_time: getTodayDateString(17, 0),
    end_time: getTodayDateString(17, 30),
    status: 'scheduled',
    created_at: '2026-10-29T10:00:00Z',
  },
];

const INITIAL_WAITLIST: WaitlistEntry[] = [
  // Candidate 1: Exact Match (Wants today, after 3 PM, Dr. Ahmed or any)
  {
    id: 'wl_01',
    clinic_id: CLINIC_ID,
    patient_name: 'عبدالعزيز التميمي',
    patient_phone: '0551234567',
    service_id: 'srv_cleaning',
    preferred_doctor_id: 'doc_ahmed',
    preferred_days: ['اليوم', 'السبت', 'الأحد'],
    preferred_time_start: '15:00',
    preferred_time_end: '19:00',
    any_today: true,
    status: 'waiting',
    notes: 'ألم خفيف ويرغب في موعد عاجل اليوم إذا توفر شاغر',
    created_at: '2026-10-31T01:10:00Z',
  },
  // Candidate 2: Exact/High Match (Flexible doctor, prefers afternoon)
  {
    id: 'wl_02',
    clinic_id: CLINIC_ID,
    patient_name: 'فاطمة الشهري',
    patient_phone: '0509876543',
    service_id: 'srv_cleaning',
    preferred_doctor_id: null, // Any doctor
    preferred_days: ['السبت', 'الأحد', 'اليوم'],
    preferred_time_start: '16:00',
    preferred_time_end: '18:00',
    any_today: true,
    status: 'waiting',
    notes: 'تناسبها فترة بعد العصر وتفضل الحضور اليوم',
    created_at: '2026-10-31T01:25:00Z',
  },
  // Candidate 3: Partial Match (Prefers Dr. Sarah, evening)
  {
    id: 'wl_03',
    clinic_id: CLINIC_ID,
    patient_name: 'عمر السليمان',
    patient_phone: '0563322114',
    service_id: 'srv_cleaning',
    preferred_doctor_id: 'doc_sarah', // Different doctor
    preferred_days: ['الاثنين', 'الثلاثاء'],
    preferred_time_start: '18:00',
    preferred_time_end: '21:00',
    any_today: false,
    status: 'waiting',
    notes: 'يفضل د. سارة في المساء، لكن مستعد للحضور إن تعذر',
    created_at: '2026-10-30T16:00:00Z',
  },
  // Candidate 4: Other service waitlist entry (Root canal)
  {
    id: 'wl_04',
    clinic_id: CLINIC_ID,
    patient_name: 'نورة الهذلي',
    patient_phone: '0538844221',
    service_id: 'srv_rootcanal',
    preferred_doctor_id: 'doc_khalid',
    preferred_days: ['الأحد', 'الاثنين'],
    preferred_time_start: '16:00',
    preferred_time_end: '20:00',
    any_today: true,
    status: 'waiting',
    notes: 'حالة عصب طارئة',
    created_at: '2026-10-31T00:30:00Z',
  },
];

const INITIAL_OFFERS: SlotOffer[] = [];

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
  {
    id: 'log_02',
    appointmentId: 'appt_rec_02',
    originalPatientName: 'ريم الرشيدي',
    originalDoctorName: 'د. خالد العتيبي',
    serviceName: 'حشو عصب وجذور متقدم',
    appointmentTime: 'أمس 04:30 م',
    cancelledAt: 'أمس 03:45 م',
    recoveredAt: 'أمس 04:02 م',
    recoveredPatientName: 'خالد المطيري',
    recoveredPatientPhone: '0501199884',
    timeToRecoverMinutes: 17,
    revenueSaved: 850,
  },
  {
    id: 'log_03',
    appointmentId: 'appt_rec_03',
    originalPatientName: 'عبدالله السعد',
    originalDoctorName: 'د. سارة القحطاني',
    serviceName: 'استشارة وفحص تقويم',
    appointmentTime: '29 أكتوبر 05:00 م',
    cancelledAt: '29 أكتوبر 04:10 م',
    recoveredAt: '29 أكتوبر 04:22 م',
    recoveredPatientName: 'مشاعل السبيعي',
    recoveredPatientPhone: '0547788990',
    timeToRecoverMinutes: 12,
    revenueSaved: 350,
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
  const [clinic] = useState<Clinic>(INITIAL_CLINIC);
  const [staff] = useState<Staff>(INITIAL_STAFF);
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>(INITIAL_WAITLIST);
  const [slotOffers, setSlotOffers] = useState<SlotOffer[]>(INITIAL_OFFERS);
  const [auditLogs, setAuditLogs] = useState<RecoveryAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [stats, setStats] = useState<RecoveryStats>(INITIAL_STATS);

  // Synchronize state with LocalStorage for persistence across tab refreshes during testing
  useEffect(() => {
    try {
      const saved = localStorage.getItem('slotcare_state_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.appointments) setAppointments(parsed.appointments);
        if (parsed.waitlist) setWaitlist(parsed.waitlist);
        if (parsed.slotOffers) setSlotOffers(parsed.slotOffers);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
        if (parsed.stats) setStats(parsed.stats);
      }
    } catch {
      // LocalStorage error fallback
    }
  }, []);

  const saveToStorage = (
    newAppointments: Appointment[],
    newWaitlist: WaitlistEntry[],
    newOffers: SlotOffer[],
    newAuditLogs: RecoveryAuditLog[],
    newStats: RecoveryStats
  ) => {
    try {
      localStorage.setItem(
        'slotcare_state_v1',
        JSON.stringify({
          appointments: newAppointments,
          waitlist: newWaitlist,
          slotOffers: newOffers,
          auditLogs: newAuditLogs,
          stats: newStats,
        })
      );
    } catch {
      // ignore
    }
  };

  // Cancel an active appointment and trigger recovery workflow
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
    saveToStorage(updatedAppointments, waitlist, slotOffers, auditLogs, updatedStats);
  };

  // Create new appointment
  const createAppointment = (
    data: Omit<Appointment, 'id' | 'clinic_id' | 'created_at'>
  ) => {
    const newAppt: Appointment = {
      ...data,
      id: `appt_${Date.now()}`,
      clinic_id: CLINIC_ID,
      created_at: new Date().toISOString(),
    };
    const updated = [newAppt, ...appointments];
    setAppointments(updated);
    saveToStorage(updated, waitlist, slotOffers, auditLogs, stats);
  };

  // Add patient to smart waitlist
  const addToWaitlist = (
    data: Omit<WaitlistEntry, 'id' | 'clinic_id' | 'created_at' | 'status'>
  ) => {
    const newEntry: WaitlistEntry = {
      ...data,
      id: `wl_${Date.now()}`,
      clinic_id: CLINIC_ID,
      status: 'waiting',
      created_at: new Date().toISOString(),
    };
    const updated = [newEntry, ...waitlist];
    setWaitlist(updated);
    saveToStorage(appointments, updated, slotOffers, auditLogs, stats);
  };

  // Generate a secure one-time offer token and slot offer
  const generateSlotOffer = (appointmentId: string, waitlistId: string): SlotOffer => {
    // Generate secure randomized token
    const randomHex = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    const token = `sc_${randomHex}`;

    const newOffer: SlotOffer = {
      id: `offer_${Date.now()}`,
      clinic_id: CLINIC_ID,
      appointment_id: appointmentId,
      waitlist_id: waitlistId,
      token,
      status: 'pending',
      sent_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min expiry
      created_at: new Date().toISOString(),
    };

    // Update waitlist entry status to 'offered'
    const updatedWaitlist = waitlist.map((w) =>
      w.id === waitlistId ? { ...w, status: 'offered' as const } : w
    );

    const updatedOffers = [newOffer, ...slotOffers];

    setSlotOffers(updatedOffers);
    setWaitlist(updatedWaitlist);
    saveToStorage(appointments, updatedWaitlist, updatedOffers, auditLogs, stats);

    return newOffer;
  };

  // Claim offer via patient mobile confirmation (Atomic simulation)
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

    // 1. Mark this offer as accepted and expire competing offers
    const updatedOffers = slotOffers.map((o) => {
      if (o.token === token) {
        return { ...o, status: 'accepted' as const, responded_at: new Date().toISOString() };
      }
      if (o.appointment_id === offer.appointment_id && o.status === 'pending') {
        return { ...o, status: 'expired' as const };
      }
      return o;
    });

    // 2. Mark appointment as recovered with replacement patient
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

    // 3. Mark waitlist entry as booked
    const updatedWaitlist = waitlist.map((w) => {
      if (w.id === offer.waitlist_id) {
        return { ...w, status: 'booked' as const };
      }
      return w;
    });

    // 4. Calculate recovery audit log entry
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

    // 5. Update stats
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

  // Decline offer
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

    // Revert waitlist patient back to 'waiting'
    const updatedWaitlist = waitlist.map((w) =>
      w.id === offer.waitlist_id ? { ...w, status: 'waiting' as const } : w
    );

    setSlotOffers(updatedOffers);
    setWaitlist(updatedWaitlist);
    saveToStorage(appointments, updatedWaitlist, updatedOffers, auditLogs, stats);

    return { success: true, message: 'تم تسجيل اعتذارك، شكراً لتجاوبك.' };
  };

  // Query offer by token
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

  // Reset demo data to default state
  const resetDemoData = () => {
    try {
      localStorage.removeItem('slotcare_state_v1');
    } catch {
      // ignore
    }
    setAppointments(INITIAL_APPOINTMENTS);
    setWaitlist(INITIAL_WAITLIST);
    setSlotOffers(INITIAL_OFFERS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setStats(INITIAL_STATS);
  };

  return (
    <SlotCareContext.Provider
      value={{
        clinic,
        staff,
        doctors,
        services,
        appointments,
        waitlist,
        slotOffers,
        auditLogs,
        stats,
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
