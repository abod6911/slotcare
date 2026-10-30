'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  RotateCcw,
  Sparkles,
  Zap,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { useSlotCare } from '@/context/SlotCareContext';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const router = useRouter();
  const { clinic, appointments, cancelAppointment, resetDemoData } = useSlotCare();

  // Find candidate for demo cancellation (e.g. 4 PM appointment with Dr. Ahmed or another scheduled one)
  const scheduledAppt = appointments.find(
    (a) => a.status === 'scheduled' && a.doctor_id === 'doc_ahmed'
  );

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
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {title || 'لوحة التحكم والمؤشرات'}
          </h1>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          {/* Reset Demo Data Button */}
          <button
            onClick={resetDemoData}
            title="إعادة ضبط بيانات المحاكاة"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة ضبط العرض</span>
          </button>

          {/* Quick Demo Trigger: Cancel & Recover */}
          <button
            onClick={handleQuickCancelDemo}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all shadow-rose-900/10 active:scale-95"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>تجربة سيناريو الإلغاء والاسترجاع الفوري</span>
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
          <span className="font-semibold">سيناريو العرض التوضيحي المباشر:</span>
          <span className="text-slate-600">
            توجد خانة ملغاة الساعة 4:00 مساءً (د. أحمد - تنظيف أسنان) جاهزة الآن للمطابقة وإرسال رابط الواتساب!
          </span>
        </div>
        <Link
          href="/open-slots"
          className="font-bold text-teal-700 hover:text-teal-900 hover:underline flex items-center gap-1"
        >
          <span>الانتقال لمركز التعويض</span>
          <span>←</span>
        </Link>
      </div>
    </header>
  );
};
