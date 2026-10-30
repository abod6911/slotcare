'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Filter,
  User,
  Phone,
  Zap,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
} from 'lucide-react';
import { useSlotCare } from '@/context/SlotCareContext';
import { AppointmentStatus } from '@/types/database.types';

export default function CalendarPage() {
  const router = useRouter();
  const { doctors, services, appointments, cancelAppointment, createAppointment } = useSlotCare();

  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New appointment form state
  const [formDoctorId, setFormDoctorId] = useState<string>(doctors[0]?.id || '');
  const [formServiceId, setFormServiceId] = useState<string>(services[0]?.id || '');
  const [formPatientName, setFormPatientName] = useState<string>('');
  const [formPatientPhone, setFormPatientPhone] = useState<string>('');
  const [formTimeHour, setFormTimeHour] = useState<string>('18');
  const [formTimeMinute, setFormTimeMinute] = useState<string>('00');

  const doctorMap = new Map(doctors.map((d) => [d.id, d]));
  const serviceMap = new Map(services.map((s) => [s.id, s]));

  // Filter appointments
  const filteredAppointments = appointments.filter((appt) => {
    if (selectedDoctorId !== 'all' && appt.doctor_id !== selectedDoctorId) return false;
    if (selectedStatus !== 'all' && appt.status !== selectedStatus) return false;
    return true;
  });

  // Sort by start_time
  filteredAppointments.sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  const handleCancelAndRecover = (apptId: string) => {
    cancelAppointment(apptId);
    router.push('/open-slots');
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPatientName || !formPatientPhone) return;

    const start = new Date();
    start.setHours(parseInt(formTimeHour, 10), parseInt(formTimeMinute, 10), 0, 0);

    const srv = serviceMap.get(formServiceId);
    const duration = srv?.duration_minutes || 30;
    const end = new Date(start.getTime() + duration * 60 * 1000);

    createAppointment({
      doctor_id: formDoctorId,
      service_id: formServiceId,
      patient_name: formPatientName,
      patient_phone: formPatientPhone,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      status: 'scheduled',
      cancelled_at: null,
      recovered_from_appointment_id: null,
    });

    setShowAddModal(false);
    setFormPatientName('');
    setFormPatientPhone('');
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'scheduled':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
            مؤكد ومجدول
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            ملغي (شاغر)
          </span>
        );
      case 'recovered':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>مسترجع بنجاح</span>
          </span>
        );
      case 'completed':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
            مكتمل
          </span>
        );
      case 'no_show':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
            تخلف عن الحضور
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-teal-600" />
            <span>جدول مواعيد العيادة لليوم</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            عرض متعدد الأطباء مع إمكانية إلغاء الموعد واسترجاعه فورياً بنقرة واحدة
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Doctor Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500">الطبيب:</label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">جميع الأطباء (4)</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500">الحالة:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">كل الحالات</option>
              <option value="scheduled">مؤكد ومجدول</option>
              <option value="cancelled">ملغي (شاغر)</option>
              <option value="recovered">مسترجع</option>
              <option value="completed">مكتمل</option>
            </select>
          </div>

          {/* Add Appointment Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>حجز موعد جديد</span>
          </button>
        </div>
      </div>

      {/* Multi-Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {doctors.map((doctor) => {
          const doctorAppts = filteredAppointments.filter((a) => a.doctor_id === doctor.id);
          const hasCancelled = doctorAppts.some((a) => a.status === 'cancelled');

          return (
            <div
              key={doctor.id}
              className={`bg-white rounded-2xl border ${
                hasCancelled ? 'border-rose-300 shadow-rose-50' : 'border-slate-200'
              } shadow-sm overflow-hidden flex flex-col`}
            >
              {/* Doctor Header */}
              <div
                className="p-3.5 border-b border-slate-100 flex items-center justify-between"
                style={{ borderTop: `4px solid ${doctor.color_code}` }}
              >
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{doctor.full_name}</h3>
                  <p className="text-[11px] text-slate-500">{doctor.specialty}</p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 tabular-nums">
                  {doctorAppts.length} مواعيد
                </span>
              </div>

              {/* Appointments List for this Doctor */}
              <div className="p-3 space-y-2.5 flex-1">
                {doctorAppts.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    لا توجد مواعيد مسجلة اليوم
                  </div>
                ) : (
                  doctorAppts.map((appt) => {
                    const srv = serviceMap.get(appt.service_id);
                    const timeStr = new Date(appt.start_time).toLocaleTimeString('ar-SA', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    const isCancelled = appt.status === 'cancelled';
                    const isRecovered = appt.status === 'recovered';
                    const isScheduled = appt.status === 'scheduled';

                    return (
                      <div
                        key={appt.id}
                        className={`p-3 rounded-xl border transition-all ${
                          isCancelled
                            ? 'bg-rose-50/70 border-rose-200'
                            : isRecovered
                            ? 'bg-emerald-50/60 border-emerald-200'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-slate-900 tabular-nums flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {timeStr}
                          </span>
                          {getStatusBadge(appt.status)}
                        </div>

                        <div className="mt-2">
                          <p className="text-xs font-bold text-slate-800">{srv?.name}</p>
                          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              <strong className="text-slate-700">{appt.patient_name}</strong>
                            </span>
                            <span className="tabular-nums">{appt.patient_phone}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        {isScheduled && (
                          <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between">
                            <button
                              onClick={() => handleCancelAndRecover(appt.id)}
                              className="w-full text-center py-1.5 px-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>إلغاء الموعد واسترجاعه</span>
                            </button>
                          </div>
                        )}

                        {isCancelled && (
                          <div className="mt-2.5 pt-2 border-t border-rose-200 flex items-center justify-between">
                            <button
                              onClick={() => router.push('/open-slots')}
                              className="w-full py-1.5 px-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all animate-pulse"
                            >
                              <Zap className="w-3.5 h-3.5" />
                              <span>شاغر! ابدأ التعويض الآن</span>
                            </button>
                          </div>
                        )}

                        {isRecovered && (
                          <div className="mt-2 pt-1 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>تم استرجاعه وحجزه بنجاح</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Appointment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-teal-600" />
              <span>إضافة موعد جديد في التقويم</span>
            </h3>

            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  اسم المريض:
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: يوسف الخالدي"
                  value={formPatientName}
                  onChange={(e) => setFormPatientName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  رقم هاتف المريض:
                </label>
                <input
                  type="text"
                  required
                  placeholder="05XXXXXXXX"
                  value={formPatientPhone}
                  onChange={(e) => setFormPatientPhone(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">الطبيب:</label>
                  <select
                    value={formDoctorId}
                    onChange={(e) => setFormDoctorId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">الخدمة:</label>
                  <select
                    value={formServiceId}
                    onChange={(e) => setFormServiceId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    الساعة (نظام 24):
                  </label>
                  <select
                    value={formTimeHour}
                    onChange={(e) => setFormTimeHour(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {['14', '15', '16', '17', '18', '19', '20', '21'].map((h) => (
                      <option key={h} value={h}>
                        {h}:00
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">الدقيقة:</label>
                  <select
                    value={formTimeMinute}
                    onChange={(e) => setFormTimeMinute(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="00">00</option>
                    <option value="15">15</option>
                    <option value="30">30</option>
                    <option value="45">45</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-all"
                >
                  حفظ الموعد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
