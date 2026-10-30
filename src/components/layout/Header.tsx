'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  RotateCcw,
  Zap,
  ArrowUpRight,
  Database,
  CloudCheck,
  AlertCircle,
  Stethoscope,
} from 'lucide-react';
import { useSlotCare } from '@/context/SlotCareContext';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const router = useRouter();
  const {
    clinic,
    appointments,
    cancelAppointment,
    resetDemoData,
    isDemoMode,
    doctors,
  } = useSlotCare();

  // Find candidate for demo cancellation (e.g. 4 PM appointment with Dr. Ahmed or another scheduled one)
  const scheduledAppt = appointments.find(
    (a) => a.status === 'scheduled' && a.doctor_id.includes('000000000001')
  ) || appointments.find((a) => a.status === 'scheduled');

  const handleQuickCancelDemo = () => {
    if (scheduledAppt) {
      cancelAppointment(scheduledAppt.id);
      router.push('/open-slots');
    } else {
      router.push('/open-slots');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
      {/* Top Bar */}
      <div className="px-6 py-3.5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {title || 'لوحة التحكم والمؤشرات'}
            </h1>

            {/* Supabase Connection State Badge */}
            {isDemoMode ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>وضع المعاينة التجريبي (In-Memory / LocalStorage)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>متصل بقاعدة Supabase Live (RLS مفعّل)</span>
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          {/* Reset Demo Data Button */}
          {isDemoMode && (
            <button
              onClick={resetDemoData}
              title="إعادة ضبط بيانات المحاكاة"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة ضبط العرض</span>
            </button>
          )}

          {/* Quick Demo Trigger: Cancel & Recover */}
          <button
            onClick={handleQuickCancelDemo}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all shadow-rose-900/10 active:scale-95"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>تجربة سيناريو الإلغاء والاسترجاع</span>
            <ArrowUpRight className="w-3 h-3 opacity-80" />
          </button>
        </div>
      </div>

      {/* Demo Context Banner */}
      <div className="bg-gradient-to-r from-teal-50 via-sky-50 to-emerald-50 border-t border-teal-100/60 px-6 py-2 flex items-center justify-between text-xs text-teal-900">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
          </span>
          <span className="font-semibold">سيناريو الاسترجاع الذكي:</span>
          <span className="text-slate-600">
            {isDemoMode
              ? 'وضع المعاينة التجريبي مفعّل. عند إضافة مفاتيح Supabase في .env.local سيتم التحويل لقاعدة البيانات تلقائياً.'
              : 'النظام متصل بالسحابة ويتم عزل البيانات تلقائياً حسب العيادة (RLS Tenant Isolation).'}
          </span>
        </div>
        <Link
          href="/open-slots"
          className="font-bold text-teal-700 hover:text-teal-900 hover:underline flex items-center gap-1"
        >
          <span>المواعيد الشاغرة</span>
          <span>←</span>
        </Link>
      </div>
    </header>
  );
};
