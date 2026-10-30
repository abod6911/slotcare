'use client';

import React, { useState } from 'react';
import {
  Users,
  Plus,
  Clock,
  Calendar,
  Sparkles,
  Phone,
  User,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  Tag,
  Search,
} from 'lucide-react';
import { useSlotCare } from '@/context/SlotCareContext';
import { WaitlistStatus } from '@/types/database.types';

export default function WaitlistPage() {
  const { waitlist, doctors, services, addToWaitlist } = useSlotCare();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterService, setFilterService] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [serviceId, setServiceId] = useState(services[0]?.id || '');
  const [preferredDoctorId, setPreferredDoctorId] = useState<string>('');
  const [selectedDays, setSelectedDays] = useState<string[]>(['اليوم', 'السبت']);
  const [timeStart, setTimeStart] = useState('15:00');
  const [timeEnd, setTimeEnd] = useState('20:00');
  const [anyToday, setAnyToday] = useState(true);
  const [notes, setNotes] = useState('');

  const doctorMap = new Map(doctors.map((d) => [d.id, d]));
  const serviceMap = new Map(services.map((s) => [s.id, s]));

  const allDays = ['اليوم', 'السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !patientPhone) return;

    addToWaitlist({
      patient_name: patientName,
      patient_phone: patientPhone,
      service_id: serviceId,
      preferred_doctor_id: preferredDoctorId || null,
      preferred_days: selectedDays.length > 0 ? selectedDays : ['أي يوم'],
      preferred_time_start: timeStart,
      preferred_time_end: timeEnd,
      any_today: anyToday,
      notes: notes || null,
    });

    setShowAddModal(false);
    setPatientName('');
    setPatientPhone('');
    setNotes('');
  };

  const filteredWaitlist = waitlist.filter((entry) => {
    if (filterService !== 'all' && entry.service_id !== filterService) return false;
    if (filterStatus !== 'all' && entry.status !== filterStatus) return false;
    if (searchTerm) {
      const matchName = entry.patient_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPhone = entry.patient_phone.includes(searchTerm);
      if (!matchName && !matchPhone) return false;
    }
    return true;
  });

  const getStatusBadge = (status: WaitlistStatus) => {
    switch (status) {
      case 'waiting':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            في الانتظار
          </span>
        );
      case 'offered':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 animate-pulse">
            تم إرسال عرض
          </span>
        );
      case 'booked':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>تم التعويض والحجز</span>
          </span>
        );
      case 'archived':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
            مؤرشف
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            <span>قائمة الانتظار الذكية (Smart Waitlist)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            تسجيل تفضيلات المرضى بدقة لتمكين محرك المطابقة من ترشيحهم عند إلغاء أي موعد
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مريض لقائمة الانتظار</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="البحث باسم المريض أو رقم الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterService}
            onChange={(e) => setFilterService(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">جميع الخدمات</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">جميع الحالات</option>
            <option value="waiting">في الانتظار</option>
            <option value="offered">تم إرسال عرض</option>
            <option value="booked">تم الحجز</option>
          </select>
        </div>
      </div>

      {/* Waitlist Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
              <tr>
                <th className="py-3.5 px-4">المريض</th>
                <th className="py-3.5 px-4">الخدمة المطلوبة</th>
                <th className="py-3.5 px-4">الطبيب المفضل</th>
                <th className="py-3.5 px-4">الأيام المفضلة</th>
                <th className="py-3.5 px-4">الفترة الزمنية</th>
                <th className="py-3.5 px-4 text-center">أي موعد اليوم؟</th>
                <th className="py-3.5 px-4 text-center">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWaitlist.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    لا يوجد مرضى مطابقين لمعايير البحث
                  </td>
                </tr>
              ) : (
                filteredWaitlist.map((entry) => {
                  const srv = serviceMap.get(entry.service_id);
                  const doc = entry.preferred_doctor_id
                    ? doctorMap.get(entry.preferred_doctor_id)
                    : null;

                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {entry.patient_name}
                        </div>
                        <div className="text-slate-400 tabular-nums text-[11px] mt-0.5">
                          {entry.patient_phone}
                        </div>
                        {entry.notes && (
                          <div className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                            {entry.notes}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">{srv?.name}</span>
                        <span className="block text-[10px] text-slate-400">
                          {srv?.duration_minutes} دقيقة · {srv?.price} ر.س
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {doc ? (
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: doc.color_code }}
                            />
                            <span className="font-medium text-slate-800">{doc.full_name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">أي طبيب متاح</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {entry.preferred_days.map((day, idx) => (
                            <span
                              key={idx}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                day === 'اليوم'
                                  ? 'bg-rose-100 text-rose-800 font-bold'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {day}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 tabular-nums">
                        {entry.preferred_time_start && entry.preferred_time_end ? (
                          <span className="text-slate-700 font-medium">
                            {entry.preferred_time_start} - {entry.preferred_time_end}
                          </span>
                        ) : (
                          <span className="text-slate-400">مرن طوال اليوم</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {entry.any_today ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            <span>نعم (عاجل)</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">حسب الجدول</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">{getStatusBadge(entry.status)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add to Waitlist Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-teal-600" />
              <span>إضافة مريض جديد إلى قائمة الانتظار</span>
            </h3>

            <form onSubmit={handleAddPatient} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    اسم المريض:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: تركي السالم"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    رقم الجوال (واتساب):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="05XXXXXXXX"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  الخدمة المطلوبة:
                </label>
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.duration_minutes} دقيقة - {s.price} ر.س)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  الطبيب المفضل:
                </label>
                <select
                  value={preferredDoctorId}
                  onChange={(e) => setPreferredDoctorId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">أي طبيب متاح (فرصة استرجاع أسرع)</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.full_name} ({d.specialty})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  الأيام المناسبة للمريض:
                </label>
                <div className="flex flex-wrap gap-2">
                  {allDays.map((day) => {
                    const isSelected = selectedDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          isSelected
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    أبكر وقت مناسب:
                  </label>
                  <input
                    type="time"
                    value={timeStart}
                    onChange={(e) => setTimeStart(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    آخر وقت مناسب:
                  </label>
                  <input
                    type="time"
                    value={timeEnd}
                    onChange={(e) => setTimeEnd(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Any Today checkbox */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anyTodayCheck"
                  checked={anyToday}
                  onChange={(e) => setAnyToday(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                />
                <label
                  htmlFor="anyTodayCheck"
                  className="text-xs font-bold text-emerald-900 cursor-pointer"
                >
                  المريض مستعد للحضور فوراً اليوم إذا أُلغي أي موعد شاغر
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ملاحظات أو حالة الاستعجال:
                </label>
                <textarea
                  rows={2}
                  placeholder="ملاحظات حول الحالة أو تفضيلات إضافية..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
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
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-all"
                >
                  إضافة للقائمة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
