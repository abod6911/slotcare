// ==============================================================================
// SlotCare WhatsApp Deep Link & Message Generator
// Creates pre-filled, compliant WhatsApp deep links (wa.me) with secure offer tokens
// ==============================================================================

import { Appointment, Doctor, Service, WaitlistEntry } from '@/types/database.types';

export interface GenerateOfferParams {
  clinicName: string;
  patientName: string;
  patientPhone: string;
  doctor: Doctor;
  service: Service;
  appointment: Appointment;
  token: string;
  baseUrl?: string;
  expiryMinutes?: number;
}

export interface GeneratedOfferLink {
  token: string;
  offerUrl: string;
  rawMessage: string;
  whatsappUrl: string;
  cleanPhone: string;
}

/**
 * Normalizes phone number into international WhatsApp format (e.g., 9665XXXXXXXX)
 */
export function normalizePhoneForWhatsApp(phone: string): string {
  // Strip non-numeric characters
  let clean = phone.replace(/\D/g, '');

  // If starts with 05 (Saudi local), replace 0 with 966
  if (clean.startsWith('05') && clean.length === 10) {
    clean = '966' + clean.slice(1);
  } else if (clean.startsWith('5') && clean.length === 9) {
    clean = '966' + clean;
  }

  return clean;
}

/**
 * Formats date and time in friendly Arabic representation
 */
export function formatArabicDateTime(isoString: string): { dateStr: string; timeStr: string } {
  const date = new Date(isoString);

  // Time in 12-hour format with AM/PM in Arabic
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const period = hours >= 12 ? 'مساءً' : 'صباحاً';
  hours = hours % 12 || 12;
  const timeStr = `${hours}:${minutes} ${period}`;

  // Date in friendly Arabic
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  const dateStr = date.toLocaleDateString('ar-SA', options);

  return { dateStr, timeStr };
}

/**
 * Builds the complete WhatsApp deep link and secure offer URL
 */
export function buildWhatsAppOfferLink({
  clinicName,
  patientName,
  patientPhone,
  doctor,
  service,
  appointment,
  token,
  baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
  expiryMinutes = 30,
}: GenerateOfferParams): GeneratedOfferLink {
  const cleanPhone = normalizePhoneForWhatsApp(patientPhone);
  const { dateStr, timeStr } = formatArabicDateTime(appointment.start_time);
  const offerUrl = `${baseUrl}/offer/${token}`;

  const rawMessage = `مرحباً ${patientName} 👋
معك *${clinicName}*.

توفّر لدينا موعد شاغر غير متوقع لخدمة *${service.name}* مع *${doctor.full_name}*.

📅 *التفاصيل:*
• الموعد: ${dateStr}
• الوقت: الساعة *${timeStr}*
• المدة: ${service.duration_minutes} دقيقة

لحجز الموعد وتأكيده فوراً قبل إتاحته لمريض آخر، يرجى الضغط على الرابط الآمن التالي:
🔗 ${offerUrl}

⏳ ملاحظة: هذا الرابط مخصص لك وصالح لمدة ${expiryMinutes} دقيقة فقط. نتطلع لخدمتك!`;

  const encodedMessage = encodeURIComponent(rawMessage);
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

  return {
    token,
    offerUrl,
    rawMessage,
    whatsappUrl,
    cleanPhone,
  };
}
