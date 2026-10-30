'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Stethoscope,
  Building,
  Phone,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { useSlotCare } from '@/context/SlotCareContext';
import { formatArabicDateTime } from '@/lib/whatsapp/link-builder';

export default function PatientOfferPage() {
  const params = useParams();
  const token = params?.token as string;

  const { getOfferByToken, claimOffer, declineOffer } = useSlotCare();

  const [loading, setLoading] = useState(true);
  const [offerDetails, setOfferDetails] = useState<ReturnType<typeof getOfferByToken>>(null);
  const [actionStatus, setActionStatus] = useState<
    'idle' | 'claiming' | 'success' | 'declined' | 'error'
  >('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');

  useEffect(() => {
    if (token) {
      const data = getOfferByToken(token);
      setOfferDetails(data);
      setLoading(false);
    }
  }, [token, getOfferByToken]);

  const handleAccept = () => {
    setActionStatus('claiming');
    setTimeout(() => {
      const res = claimOffer(token);
      if (res.success) {
        setActionStatus('success');
        setStatusMessage(res.message);
        // refresh data
        setOfferDetails(getOfferByToken(token));
      } else {
        setActionStatus('error');
        setStatusMessage(res.message);
      }
    }, 600);
  };

  const handleDecline = () => {
    setActionStatus('claiming');
    setTimeout(() => {
      const res = declineOffer(token);
      setActionStatus('declined');
      setStatusMessage(res.message);
      // refresh data
      setOfferDetails(getOfferByToken(token));
    }, 400);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // Token Not Found or Invalid
  if (!offerDetails || !offerDetails.offer || !offerDetails.appointment) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 text-center shadow-lg border border-slate-200">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">رابط العرض غير صالح أو منتهي</h2>
          <p className="text-xs text-slate-500 leading-relaxed mb-6">
            عذراً، لم نتمكن من العثور على الموعد المرتبط بهذا الرمز، أو قد انتهت صلاحية الرابط المخصصة للحجز.
          </p>
          <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-200">
            للاستفسار، يرجى التواصل مع استقبال العيادة هاتفياً على الرقم:{' '}
            <strong className="text-slate-900 tabular-nums">0112345678</strong>
          </div>
        </div>
      </div>
    );
  }

  const { offer, appointment, waitlist, doctor, service } = offerDetails;
  const isAlreadyAccepted = offer.status === 'accepted' || actionStatus === 'success';
  const isDeclined = offer.status === 'declined' || actionStatus === 'declined';
  const isExpired =
    offer.status === 'expired' ||
    (!isAlreadyAccepted && !isDeclined && new Date(offer.expires_at) < new Date());

  const { dateStr, timeStr } = formatArabicDateTime(appointment.start_time);

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/60 via-slate-50 to-slate-100 flex flex-col justify-between py-6 px-4">
      {/* Clinic Header Brand */}
      <div className="max-w-md w-full mx-auto text-center mb-4">
        <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full shadow-sm border border-slate-200 mb-3">
          <Building className="w-3.5 h-3.5 text-teal-600" />
          <span className="text-xs font-bold text-slate-800">
            عيادة سمايل لطب وجراحة الأسنان
          </span>
        </div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">
          تأكيد حجز موعد عاجل
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          مرحباً {waitlist?.patient_name}، توفر موعد استثنائي مناسب لطلبك!
        </p>
      </div>

      {/* Main Card */}
      <div className="max-w-md w-full mx-auto bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-200/80 overflow-hidden relative">
        {/* State 1: Already Accepted / Success */}
        {isAlreadyAccepted ? (
          <div className="text-center py-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
              تم تأكيد الحجز بنجاح
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-3 mb-1">
              موعدك مؤكد ومحجوز باسمك!
            </h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              تم تحديث جدول العيادة فورياً وحجز الخانة لك. نتطلع لاستقبالك في الوقت المحدد.
            </p>

            {/* Confirmed Details Card */}
            <div className="mt-5 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-right space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-500">
                <span>الخدمة:</span>
                <strong className="text-slate-800">{service?.name}</strong>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>الطبيب:</span>
                <strong className="text-slate-800">{doctor?.full_name}</strong>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>الموعد:</span>
                <strong className="text-teal-700 font-bold">{dateStr}</strong>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>الوقت:</span>
                <strong className="text-teal-700 font-bold tabular-nums">الساعة {timeStr}</strong>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
              رقم تواصل الاستقبال: 0112345678 · الموقع: الرياض
            </div>
          </div>
        ) : isDeclined ? (
          /* State 2: Declined */
          <div className="text-center py-6">
            <div className="w-14 h-14 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <XCircle className="w-8 h-8" />
            </div>
            <h2 className="text-base font-bold text-slate-900 mb-1">شكراً لتجاوبك</h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              تم تسجيل اعتذارك وإبقاء بياناتك في قائمة الانتظار لعرض مواعيد مستقبلية تناسبك.
            </p>
          </div>
        ) : isExpired ? (
          /* State 3: Expired */
          <div className="text-center py-6">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Clock className="w-8 h-8" />
            </div>
            <h2 className="text-base font-bold text-slate-900 mb-1">انتهت صلاحية العرض</h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
              نظراً لأن العرض صالح لمدة 30 دقيقة فقط، فقد تم تمرير الفرصة لمريض آخر على قائمة الانتظار.
            </p>
            <p className="text-[11px] text-teal-700 font-medium">
              سنقوم بإشعارك فور توفر أي موعد بديل قادم!
            </p>
          </div>
        ) : (
          /* State 4: Active Offer (Ready to accept or decline) */
          <div>
            {/* Offer Notice Banner */}
            <div className="p-3 bg-gradient-to-r from-teal-50 to-sky-50 rounded-2xl border border-teal-100 mb-5 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-teal-600 shrink-0" />
              <div className="text-xs text-teal-900">
                <span className="font-bold">شاغر غير متوقع:</span> احجز الآن لتثبيت الموعد مباشرة
                قبل إتاحته لمريض آخر.
              </div>
            </div>

            {/* Appointment Highlights */}
            <div className="space-y-3.5 mb-6">
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">الخدمة والطبيب المعالج:</span>
                  <span className="text-sm font-bold text-slate-900">{service?.name}</span>
                  <span className="text-xs text-slate-600 block">
                    {doctor?.full_name} ({doctor?.specialty})
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    <span>تاريخ الموعد:</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">{dateStr}</span>
                </div>

                <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-200">
                  <div className="flex items-center gap-1.5 text-teal-700 text-[11px] mb-1">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    <span>توقيت الحضور:</span>
                  </div>
                  <span className="text-xs font-black text-teal-900 tabular-nums">
                    الساعة {timeStr}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">مدة الجلسة:</span>
                <span className="font-bold text-slate-800">{service?.duration_minutes} دقيقة</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                onClick={handleAccept}
                disabled={actionStatus === 'claiming'}
                className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white rounded-2xl text-sm font-black shadow-lg shadow-teal-700/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {actionStatus === 'claiming' ? 'جارٍ تأكيد الحجز...' : 'تأكيد وحجز الموعد الآن'}
                </span>
              </button>

              <button
                onClick={handleDecline}
                disabled={actionStatus === 'claiming'}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-xs font-semibold transition-colors"
              >
                اعتذار، الوقت لا يناسبني
              </button>
            </div>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>تأكيد آمن ومشفر من خلال منصة SlotCare</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="max-w-md w-full mx-auto text-center mt-6 text-slate-400 text-xs">
        <p>مدعوم بواسطة منصة SlotCare للأتمتة الذكية للمواعيد الطبية</p>
      </div>
    </div>
  );
}
