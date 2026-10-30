'use client';

import React from 'react';
import {
  History,
  TrendingUp,
  CheckCircle2,
  Clock,
  DollarSign,
  UserCheck,
  Stethoscope,
  ShieldCheck,
  CalendarCheck,
} from 'lucide-react';
import { useSlotCare } from '@/context/SlotCareContext';

export default function RecoveryHistoryPage() {
  const { auditLogs, stats } = useSlotCare();

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <History className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              سجل تدقيق المواعيد المسترجعة (Audit Trail)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            سجل تاريخي يوضح جميع المواعيد التي تم استرجاعها بنجاح مع قياس سرعة التعويض والإيرادات المحمية
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>تأكيد ذري ومنع التعارضات 100%</span>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>إجمالي المواعيد المسترجعة</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 tabular-nums">
            {stats.recoveredCount} <span className="text-xs font-semibold text-slate-500">موعد</span>
          </div>
          <p className="text-[11px] text-emerald-600 mt-1 font-semibold">
            نسبة استرجاع عامة: {stats.recoveryRatePercent}%
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>متوسط زمن تعويض الموعد</span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 tabular-nums">
            {stats.avgTimeToRecoverMinutes}{' '}
            <span className="text-xs font-semibold text-slate-500">دقيقة</span>
          </div>
          <p className="text-[11px] text-sky-600 mt-1 font-semibold">
            مقارنة بـ 4 ساعات بالطرق التقليدية
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>إجمالي الإيرادات المحمية</span>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 tabular-nums">
            {stats.revenueSavedTotal.toLocaleString()}{' '}
            <span className="text-xs font-semibold text-slate-500">ر.س</span>
          </div>
          <p className="text-[11px] text-teal-600 mt-1 font-semibold">
            تم إنقاذها من الإلغاءات المفاجئة
          </p>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800">
            العمليات المسجلة في النظام:
          </h3>
          <span className="text-[11px] text-slate-400">
            يتم التحديث تلقائياً عند تأكيد المريض عبر رابط الواتساب
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
              <tr>
                <th className="py-3.5 px-4">الخدمة والطبيب</th>
                <th className="py-3.5 px-4">المريض المسترجع (البديل)</th>
                <th className="py-3.5 px-4">المريض الأصلي (الملغي)</th>
                <th className="py-3.5 px-4">توقيت الموعد</th>
                <th className="py-3.5 px-4 text-center">سرعة الاسترجاع</th>
                <th className="py-3.5 px-4 text-center">الإيراد المحمي</th>
                <th className="py-3.5 px-4 text-center">حالة العملية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">{log.serviceName}</span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Stethoscope className="w-3 h-3 text-teal-600" />
                      <span>{log.originalDoctorName}</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{log.recoveredPatientName}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 tabular-nums">
                      {log.recoveredPatientPhone}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-500">
                    <span>{log.originalPatientName}</span>
                    <span className="block text-[10px] text-rose-500">أُلغي سابقاً</span>
                  </td>

                  <td className="py-3.5 px-4 tabular-nums text-slate-700 font-medium">
                    {log.appointmentTime}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 tabular-nums">
                      <Clock className="w-3 h-3" />
                      <span>{log.timeToRecoverMinutes} دقيقة</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center font-bold text-slate-800 tabular-nums">
                    +{log.revenueSaved} ر.س
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                      مؤكد ذرياً
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
