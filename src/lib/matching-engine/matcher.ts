// ==============================================================================
// SlotCare Deterministic Slot Matching Engine
// Pure rule-based, deterministic algorithm (No LLMs, 100% predictable & fast)
// ==============================================================================

import { Appointment, WaitlistEntry, Doctor, Service, MatchCandidate, MatchType } from '@/types/database.types';

// Arabic day names mapping
const ARABIC_DAYS = [
  'الأحد',
  'الاثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
];

interface MatchOptions {
  appointment: Appointment;
  waitlist: WaitlistEntry[];
  doctors: Doctor[];
  services: Service[];
}

export function rankWaitlistForSlot({
  appointment,
  waitlist,
  doctors,
  services,
}: MatchOptions): MatchCandidate[] {
  const apptDate = new Date(appointment.start_time);
  const apptDayName = ARABIC_DAYS[apptDate.getDay()];
  
  // Format appointment time as HH:MM
  const apptHours = apptDate.getHours().toString().padStart(2, '0');
  const apptMinutes = apptDate.getMinutes().toString().padStart(2, '0');
  const apptTimeString = `${apptHours}:${apptMinutes}`;

  const today = new Date();
  const isToday =
    apptDate.getFullYear() === today.getFullYear() &&
    apptDate.getMonth() === today.getMonth() &&
    apptDate.getDate() === today.getDate();

  const doctorMap = new Map<string, Doctor>(doctors.map((d) => [d.id, d]));
  const serviceMap = new Map<string, Service>(services.map((s) => [s.id, s]));

  const apptDoctor = doctorMap.get(appointment.doctor_id);
  const apptService = serviceMap.get(appointment.service_id);

  const candidates: MatchCandidate[] = [];

  for (const entry of waitlist) {
    // Only match patients currently waiting in the queue
    if (entry.status !== 'waiting') continue;

    // Hard constraint: Service must strictly match
    if (entry.service_id !== appointment.service_id) {
      continue;
    }

    let score = 0;
    const reasons: string[] = [];
    let isDoctorExact = false;
    let isTimeExact = false;

    // 1. Service match reason
    reasons.push(`الخدمة المطلوبة متطابقة (${apptService?.name || 'الخدمة'})`);
    score += 30;

    // 2. Doctor preference check
    if (!entry.preferred_doctor_id) {
      score += 25;
      isDoctorExact = true;
      reasons.push('المريض يقبل أي طبيب متوفر في العيادة');
    } else if (entry.preferred_doctor_id === appointment.doctor_id) {
      score += 35;
      isDoctorExact = true;
      reasons.push(`طبيب الموعد مطابق تماماً لطلب المريض (${apptDoctor?.full_name || 'الطبيب'})`);
    } else {
      score += 5;
      const prefDoc = doctorMap.get(entry.preferred_doctor_id);
      reasons.push(`يفضل ${prefDoc?.full_name || 'طبيباً آخر'}، لكن يمكن عرض الموعد كبديل`);
    }

    // 3. Date & Time preference check
    const prefersAnyToday = entry.any_today;
    const dayMatches =
      entry.preferred_days.includes('أي يوم') ||
      entry.preferred_days.includes('اليوم') ||
      entry.preferred_days.includes(apptDayName);

    let timeInWindow = false;
    if (entry.preferred_time_start && entry.preferred_time_end) {
      if (
        apptTimeString >= entry.preferred_time_start &&
        apptTimeString <= entry.preferred_time_end
      ) {
        timeInWindow = true;
      }
    } else {
      // No specific time window specified means flexible
      timeInWindow = true;
    }

    if (isToday && prefersAnyToday) {
      score += 40;
      isTimeExact = true;
      reasons.push('مسجل خيار "أي موعد متاح اليوم" — رغبة عالية بالحضور العاجل');
    } else if (dayMatches && timeInWindow) {
      score += 35;
      isTimeExact = true;
      reasons.push(`الوقت (${apptTimeString}) واليوم (${apptDayName}) يقعان ضمن التفضيلات المسجلة`);
    } else if (dayMatches && !timeInWindow) {
      score += 15;
      reasons.push(`اليوم مناسب (${apptDayName}) مع اختلاف طفيف في الفترة الزمنية المفضلة`);
    } else if (!dayMatches && isToday) {
      score += 10;
      reasons.push('موعد اليوم شاغر وقد يناسب المريض في حال تعجيل موعده');
    } else {
      score += 5;
      reasons.push('عرض استثنائي لموعد قريب خارج جدول التفضيلات المعتاد');
    }

    // Determine Final Classification
    let matchType: MatchType = 'PARTIAL';
    if (isDoctorExact && (isTimeExact || (isToday && prefersAnyToday)) && score >= 85) {
      matchType = 'EXACT';
    } else if (score >= 45) {
      matchType = 'PARTIAL';
    } else {
      matchType = 'NONE';
    }

    if (matchType !== 'NONE') {
      candidates.push({
        waitlistEntry: entry,
        matchType,
        score,
        reasons,
        doctor: apptDoctor,
        service: apptService,
      });
    }
  }

  // Rank by score descending, then FIFO by waitlist creation date
  candidates.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return new Date(a.waitlistEntry.created_at).getTime() - new Date(b.waitlistEntry.created_at).getTime();
  });

  return candidates;
}
