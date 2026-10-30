'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Zap,
  Clock,
  User,
  Phone,
  Sparkles,
  Share2,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  Calendar,
  MessageCircle,
  HelpCircle,
  ChevronLeft,
  Stethoscope,
} from 'lucide-react';
import { useSlotCare } from '@/context/SlotCareContext';
import { rankWaitlistForSlot } from '@/lib/matching-engine/matcher';
import { buildWhatsAppOfferLink, GeneratedOfferLink } from '@/lib/whatsapp/link-builder';
import { Appointment, MatchCandidate } from '@/types/database.types';

export default function OpenSlotsPage() {
  const {
    clinic,
    appointments,
    waitlist,
    doctors,
    services,
    generateSlotOffer,
    slotOffers,
  } = useSlotCare();

  // Find all cancelled appointments (unrecovered)
  const cancelledAppointments = appointments.filter((a) => a.status === 'cancelled');

  // Currently selected cancelled slot for recovery
  const [selectedSlotId, setSelectedSlotId] = useState<string>(
    cancelledAppointments[0]?.id || ''
  );

  // Active Offer Modal state
  const [activeOfferData, setActiveOfferData] = useState<GeneratedOfferLink | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  const doctorMap = useMemo(() => new Map(doctors.map((d) => [d.id, d])), [doctors]);
  const serviceMap = useMemo(() => new Map(services.map((s) => [s.id, s])), [services]);

  // Selected appointment object
  const currentSlot: Appointment | undefined = useMemo(() => {
    return appointments.find((a) => a.id === selectedSlotId) || cancelledAppointments[0];
  }, [appointments, selectedSlotId, cancelledAppointments]);

  // Run deterministic matching engine whenever slot changes
  const candidates: MatchCandidate[] = useMemo(() => {
    if (!currentSlot) return [];
    return rankWaitlistForSlot({
      appointment: currentSlot,
      waitlist,
      doctors,
      services,
    });
  }, [currentSlot, waitlist, doctors, services]);

  const currentDoctor = currentSlot ? doctorMap.get(currentSlot.doctor_id) : undefined;
  const currentService = currentSlot ? serviceMap.get(currentSlot.service_id) : undefined;

  // Handle WhatsApp Offer Generation
  const handleInitiateOffer = (candidate: MatchCandidate) => {
    if (!currentSlot || !currentDoctor || !currentService) return;

    // 1. Generate Slot Offer in state
    const offer = generateSlotOffer(currentSlot.id, candidate.waitlistEntry.id);

    // 2. Build WhatsApp deep-link and preview
    const linkData = buildWhatsAppOfferLink({
      clinicName: clinic.name,
      patientName: candidate.waitlistEntry.patient_name,
      patientPhone: candidate.waitlistEntry.patient_phone,
      doctor: currentDoctor,
      service: currentService,
      appointment: currentSlot,
      token: offer.token,
      baseUrl: typeof window !== 'undefined' ? window.location.origin : '',
      expiryMinutes: 30,
    });

    setActiveOfferData(linkData);
  };

  const copyToClipboard = (text: string, type: 'link' | 'msg') => {
    navigator.clipboard.writeText(text);
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedMsg(true);
      setTimeout(() => setCopiedMsg(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <Zap className="w-5 h-5 text-rose-600 animate-pulse" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              مركز تعويض المواعيد الشاغرة (Recovery Hub)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            يقوم محرك المطابقة الحتمي بفرز مرضى قائمة الانتظار وترتيبهم حسب الأولوية وتوليد روابط واتساب آمنة
          </p>
        </div>

        {cancelledAppointments.length > 0 && (
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-900 px-3 py-1.5 rounded-xl text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>{cancelledAppointments.length} مواعيد شاغرة تتطلب استرجاعاً عاجلاً</span>
          </div>
        )}
      </div>

      {cancelledAppointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">
            رائع! لا توجد مواعيد شاغرة أو ملغاة حالياً
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            جميع مواعيد العيادة إما مجدولة أو تم تعويضها بنجاح بواسطة المنصة.
          </p>
          <div className="mt-5">
            <Link
              href="/calendar"
              className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold shadow-sm inline-flex items-center gap-1.5"
            >
              <span>الذهاب لتقويم العيادة وإلغاء موعد للتجربة</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (Slots List) - 4 cols */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 px-1">
              اختر الموعد الشاغر لتشغيل المطابقة:
            </h3>

            {cancelledAppointments.map((slot) => {
              const isSelected = (currentSlot?.id || '') === slot.id;
              const doc = doctorMap.get(slot.doctor_id);
              const srv = serviceMap.get(slot.service_id);
              const timeStr = new Date(slot.start_time).toLocaleTimeString('ar-SA', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={slot.id}
                  onClick={() => setSelectedSlotId(slot.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-rose-50 border-rose-300 shadow-md ring-2 ring-rose-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span className="font-extrabold text-sm text-slate-900 tabular-nums">
                        {timeStr} · اليوم
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                      ملغي
                    </span>
                  </div>

                  <div className="mt-2 text-xs">
                    <p className="font-bold text-slate-800">{srv?.name}</p>
                    <p className="text-slate-500 mt-1 flex items-center gap-1">
                      <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                      <span>{doc?.full_name}</span>
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>المريض السابق: {slot.patient_name}</span>
                    <span className="text-teal-700 font-bold flex items-center gap-0.5">
                      <span>عرض المرشحين</span>
                      <ChevronLeft className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column (Ranked Candidates from Deterministic Matching Engine) - 8 cols */}
          <div className="lg:col-span-8 space-y-4">
            {/* Active Slot Context Summary */}
            {currentSlot && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold bg-rose-500/30 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-md">
                        الموعد المُراد استرجاعه
                      </span>
                      <span className="text-xs text-slate-400">
                        {currentService?.duration_minutes} دقيقة · {currentService?.price} ر.س
                      </span>
                    </div>
                    <h3 className="text-base font-bold mt-1">
                      {currentService?.name} مع {currentDoctor?.full_name}
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-teal-400" />
                      <span>
                        اليوم الساعة{' '}
                        {new Date(currentSlot.start_time).toLocaleTimeString('ar-SA', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </p>
                  </div>

                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-center shrink-0">
                    <span className="text-[11px] text-slate-400 block">المرشحون المطابقون</span>
                    <span className="text-xl font-black text-teal-400 tabular-nums">
                      {candidates.length}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Candidates List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-600">
                  قائمة المرضى المرشحين (مُرتبة بحسب الأولوية ومحرك المطابقة):
                </h4>
                <span className="text-[11px] text-slate-400">
                  خوارزمية حتمية 100% · معايير: الخدمة، الوقت، ورغبة المريض
                </span>
              </div>

              {candidates.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">
                    لا يوجد مرضى في قائمة الانتظار مسجلين لنفس الخدمة ({currentService?.name})
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    يمكنك إضافة مريض لقائمة الانتظار في شاشة الانتظار
                  </p>
                </div>
              ) : (
                candidates.map((candidate, idx) => {
                  const isExact = candidate.matchType === 'EXACT';
                  const entry = candidate.waitlistEntry;

                  return (
                    <div
                      key={entry.id}
                      className={`p-5 rounded-2xl bg-white border transition-all shadow-sm hover:shadow-md ${
                        isExact
                          ? 'border-emerald-200 ring-1 ring-emerald-500/20'
                          : 'border-amber-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        {/* Candidate Details */}
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-sm">
                              {entry.patient_name}
                            </span>

                            {/* Match Type Badge */}
                            {isExact ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-emerald-600" />
                                <span>مطابق تماماً (Exact Match)</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                مطابقة جزئية (Partial Match)
                              </span>
                            )}

                            {/* Score Tag */}
                            <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md tabular-nums">
                              درجة التوافق: {candidate.score}%
                            </span>
                          </div>

                          {/* Contact Info */}
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span className="tabular-nums font-semibold">{entry.patient_phone}</span>
                            </span>
                            <span>•</span>
                            <span>
                              الأيام المفضلة: {entry.preferred_days.join('، ')}
                            </span>
                          </div>

                          {/* Matching Reasons Bullet List */}
                          <div className="mt-2.5 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-500 block mb-1">
                              أسباب الترشيح من النظام:
                            </span>
                            {candidate.reasons.map((r, rIdx) => (
                              <div
                                key={rIdx}
                                className="flex items-center gap-1.5 text-xs text-slate-700"
                              >
                                <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span>{r}</span>
                              </div>
                            ))}
                          </div>

                          {entry.notes && (
                            <p className="text-[11px] text-teal-800 bg-teal-50/80 p-2 rounded-lg border border-teal-100">
                              <strong>ملاحظة المريض:</strong> {entry.notes}
                            </p>
                          )}
                        </div>

                        {/* WhatsApp Offer CTA */}
                        <div className="shrink-0 flex flex-col items-end gap-2">
                          <button
                            onClick={() => handleInitiateOffer(candidate)}
                            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/10 flex items-center gap-2 transition-all"
                          >
                            <MessageCircle className="w-4 h-4 fill-white" />
                            <span>إرسال عرض عبر WhatsApp</span>
                          </button>
                          <span className="text-[10px] text-slate-400">
                            يُولّد رابط حجز آمن مؤقت
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Offer Link Modal */}
      {activeOfferData && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 fill-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    تم توليد رابط العرض الآمن لـ WhatsApp
                  </h3>
                  <p className="text-xs text-slate-500">
                    ينتهي العرض تلقائياً بعد 30 دقيقة إذا لم يُؤكد
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveOfferData(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {/* WhatsApp Quick Action Button */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <span className="text-xs font-semibold text-emerald-800 block mb-2">
                  1. الإرسال للمريض مباشرة:
                </span>
                <a
                  href={activeOfferData.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>فتح محادثة واتساب الآن (`wa.me/{activeOfferData.cleanPhone}`)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Direct Local Test Link */}
              <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-sky-900">
                    2. تجربة رابط المريض محلياً (محاكاة هاتف المريض):
                  </span>
                  <span className="text-[10px] bg-sky-200 text-sky-800 px-2 py-0.5 rounded font-bold">
                    للاختبار الفوري
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={activeOfferData.offerUrl}
                    className="flex-1 text-xs bg-white border border-sky-300 rounded-lg p-2 font-mono text-slate-700 select-all"
                  />
                  <button
                    onClick={() => copyToClipboard(activeOfferData.offerUrl, 'link')}
                    className="p-2 bg-white hover:bg-sky-100 border border-sky-300 rounded-lg text-sky-700 transition-colors"
                    title="نسخ الرابط"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <a
                    href={activeOfferData.offerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"
                  >
                    <span>فتح صفحة المريض</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Message Content Preview */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    معاينة نص الرسالة المُعدّة للإرسال:
                  </label>
                  <button
                    onClick={() => copyToClipboard(activeOfferData.rawMessage, 'msg')}
                    className="text-xs text-teal-600 hover:text-teal-800 font-semibold flex items-center gap-1"
                  >
                    {copiedMsg ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedMsg ? 'تم النسخ!' : 'نسخ الرسالة'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-100 rounded-xl text-xs text-slate-800 whitespace-pre-wrap font-sans border border-slate-200 leading-relaxed max-h-40 overflow-y-auto">
                  {activeOfferData.rawMessage}
                </pre>
              </div>

              {/* Close Modal Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveOfferData(null)}
                  className="px-5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  إغلاق النافذة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
