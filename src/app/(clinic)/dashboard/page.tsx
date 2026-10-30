'use client';

import React from 'react';
import Link from 'next/link';
import {
  CalendarX2,
  CheckCircle2,
  Percent,
  Clock,
  DollarSign,
  Zap,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  UserCheck,
  Stethoscope,
} from 'lucide-react';
import { useSlotCare } from '@/context/SlotCareContext';

export default function DashboardPage() {
  const { stats, appointments, doctors, services, auditLogs } = useSlotCare();

  const doctorMap = new Map(doctors.map((d) => [d.id, d]));
  const serviceMap = new Map(services.map((s) => [s.id, s]));

  // Active cancelled appointments requiring immediate recovery
  const urgentCancelledSlots = appointments.filter((a) => a.status === 'cancelled');

  const kpis = [
    {
      title: 'المواعيد الملغاة',
      value: stats.cancelledCount,
      unit: 'موعد',
      change: '+3 اليوم',
      icon: CalendarX2,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-100',
    },
    {
      title: 'المواعيد المسترجعة',
      value: stats.recoveredCount,
      unit: 'موعد',
      change: 'تم إنقاذها بنجاح',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
    },
    {
      title: 'نسبة الاسترجاع',
      value: `${stats.recoveryRatePercent}%`,
      unit: '',
      change: '+5% عن الشهر الماضي',
      icon: Percent,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-100',
    },
    {
      title: 'متوسط وقت التعويض',
      value: stats.avgTimeToRecoverMinutes,
      unit: 'دقيقة',
      change: 'سرعة قياسية عبر WhatsApp',
      icon: Clock,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-100',
    },
    {
      title: 'الإيرادات المحمية',
      value: stats.revenueSavedTotal.toLocaleString(),
      unit: 'ر.س',
      change: 'عوائد عيادة تم إنقاذها',
      icon: DollarSign,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome & Live Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <h2 className="text-lg font-bold text-slate-900">
              مرحباً بك في مركز استرجاع المواعيد
            </h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            يراقب النظام تقويم العيادة تلقائياً. عند حدوث أي إلغاء، يتم ربط الموعد الشاغر فوراً مع المرضى الأنسب في قائمة الانتظار.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/open-slots"
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
          >
            <Zap className="w-4 h-4" />
            <span>عرض الفرص المتاحة الآن</span>
            {urgentCancelledSlots.length > 0 && (
              <span className="px-2 py-0.5 text-xs bg-teal-800 text-teal-100 rounded-full font-bold">
                {urgentCancelledSlots.length}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl bg-white border ${kpi.borderColor} shadow-sm transition-all hover:shadow-md`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">{kpi.title}</span>
                <div className={`p-2 rounded-xl ${kpi.bgColor} ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                  {kpi.value}
                </span>
                {kpi.unit && (
                  <span className="text-xs font-semibold text-slate-500">{kpi.unit}</span>
                )}
              </div>
              <p className="mt-2 text-[11px] font-medium text-slate-400">{kpi.change}</p>
            </div>
          );
        })}
      </div>

      {/* Urgent Slots Section & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Urgent Cancelled Slots (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  مواعيد شاغرة بحاجة للتعويض الفوري
                </h3>
                <p className="text-xs text-slate-500">
                  مواعيد أُلغيت اليوم وتحتاج إلى إرسال عروض لمرضى الانتظار
                </p>
              </div>
            </div>
            <Link
              href="/open-slots"
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              <span>مركز التعويض الكامل</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-4 space-y-3 flex-1">
            {urgentCancelledSlots.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                <p className="text-sm font-medium">رائع! لا توجد مواعيد ملغاة حالياً دون تعويض</p>
                <p className="text-xs mt-1">جميع الخانات مشغولة أو تم تعويضها بنجاح</p>
              </div>
            ) : (
              urgentCancelledSlots.map((slot) => {
                const doc = doctorMap.get(slot.doctor_id);
                const srv = serviceMap.get(slot.service_id);
                const timeStr = new Date(slot.start_time).toLocaleTimeString('ar-SA', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={slot.id}
                    className="p-4 rounded-xl border border-rose-100 bg-rose-50/40 hover:bg-rose-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex flex-col items-center justify-center font-bold text-xs shrink-0">
                        <span>اليوم</span>
                        <span className="tabular-nums text-sm font-extrabold">{timeStr}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{srv?.name}</span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-200/60 text-rose-800 font-semibold">
                            أُلغي قبل قليل
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                          <span>{doc?.full_name}</span>
                          <span className="text-slate-300">•</span>
                          <span>المريض السابق: {slot.patient_name}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Link
                        href="/open-slots"
                        className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>مطابقة وتعويض الآن</span>
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Live Recovery Activity Log */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">سجل التعويض الأخير</h3>
            </div>
            <Link
              href="/recovery-history"
              className="text-xs font-semibold text-teal-600 hover:text-teal-700"
            >
              عرض الكل
            </Link>
          </div>

          <div className="mt-4 space-y-3 divide-y divide-slate-100 flex-1">
            {auditLogs.slice(0, 4).map((log) => (
              <div key={log.id} className="pt-3 first:pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800">
                      {log.recoveredPatientName}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full tabular-nums">
                    خلال {log.timeToRecoverMinutes} دقيقة
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                  <span>{log.serviceName}</span>
                  <span className="font-semibold text-slate-700 tabular-nums">
                    +{log.revenueSaved} ر.س
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  مع {log.originalDoctorName} · موعد {log.appointmentTime}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
