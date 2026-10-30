'use client';

import React, { useState } from 'react';
import {
  Settings,
  Building,
  Stethoscope,
  Scissors,
  Check,
  Save,
  Clock,
  DollarSign,
  Palette,
  ShieldAlert,
} from 'lucide-react';
import { useSlotCare } from '@/context/SlotCareContext';

export default function SettingsPage() {
  const { clinic, doctors, services } = useSlotCare();

  const [activeTab, setActiveTab] = useState<'clinic' | 'doctors' | 'services'>('clinic');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states
  const [clinicName, setClinicName] = useState(clinic.name);
  const [clinicPhone, setClinicPhone] = useState(clinic.phone);
  const [expiryMinutes, setExpiryMinutes] = useState(30);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
              <Settings className="w-5 h-5 text-slate-700" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">إعدادات العيادة والنظام</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            إدارة بيانات العيادة، كادر الأطباء، وقائمة الخدمات والأسعار
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-1.5 rounded-xl text-xs font-bold animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>تم حفظ التغييرات بنجاح!</span>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 space-x-reverse space-x-2">
        <button
          onClick={() => setActiveTab('clinic')}
          className={`flex items-center gap-2 pb-3 px-4 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'clinic'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>بيانات العيادة وسياسة الاسترجاع</span>
        </button>

        <button
          onClick={() => setActiveTab('doctors')}
          className={`flex items-center gap-2 pb-3 px-4 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'doctors'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>كادر الأطباء ({doctors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`flex items-center gap-2 pb-3 px-4 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'services'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scissors className="w-4 h-4" />
          <span>الخدمات والمدد والأسعار ({services.length})</span>
        </button>
      </div>

      {/* Tab 1: Clinic Info */}
      {activeTab === 'clinic' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm max-w-2xl">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                اسم العيادة / المركز الطبي:
              </label>
              <input
                type="text"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                رقم هاتف الاستقبال الرئيسي:
              </label>
              <input
                type="text"
                value={clinicPhone}
                onChange={(e) => setClinicPhone(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 tabular-nums"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  المنطقة الزمنية:
                </label>
                <input
                  type="text"
                  disabled
                  value={clinic.timezone}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  مدة صلاحية رابط العرض للمريض:
                </label>
                <select
                  value={expiryMinutes}
                  onChange={(e) => setExpiryMinutes(parseInt(e.target.value, 10))}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value={15}>15 دقيقة (استرجاع فائق السرعة)</option>
                  <option value={30}>30 دقيقة (موصى به)</option>
                  <option value={45}>45 دقيقة</option>
                  <option value={60}>60 دقيقة</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
              >
                <Save className="w-4 h-4" />
                <span>حفظ التعديلات</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Doctors Management */}
      {activeTab === 'doctors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between"
              style={{ borderInlineStart: `6px solid ${doctor.color_code}` }}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">{doctor.full_name}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    نشط
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{doctor.specialty}</p>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                  <Palette className="w-3.5 h-3.5" style={{ color: doctor.color_code }} />
                  <span>كود اللون: {doctor.color_code}</span>
                </div>
              </div>

              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs">
                {doctor.full_name.split(' ')[1]?.slice(0, 1) || 'ط'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Services Management */}
      {activeTab === 'services' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
              <tr>
                <th className="py-3.5 px-4">اسم الخدمة</th>
                <th className="py-3.5 px-4">المدة المحددة</th>
                <th className="py-3.5 px-4">السعر التقديري</th>
                <th className="py-3.5 px-4 text-center">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                    {service.name}
                  </td>
                  <td className="py-3.5 px-4 tabular-nums">
                    <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      <span>{service.duration_minutes} دقيقة</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 tabular-nums font-bold text-slate-800">
                    {service.price} ر.س
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      متاحة للحجز
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
