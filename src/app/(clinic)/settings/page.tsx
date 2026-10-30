'use client';

// ==============================================================================
// SlotCare Clinic Settings & Resource Management
// Live CRUD for Clinic Profile, Doctors, and Services
// ==============================================================================

import React, { useState } from 'react';
import {
  Settings,
  Building,
  Stethoscope,
  Scissors,
  Check,
  Save,
  Plus,
  Clock,
  DollarSign,
  Palette,
  Edit2,
  CheckCircle2,
  AlertCircle,
  X,
  Power,
} from 'lucide-react';
import { useSlotCare } from '@/context/SlotCareContext';
import { Doctor, Service } from '@/types/database.types';

const COLOR_PRESETS = [
  '#0284c7', // Sky Blue
  '#0d9488', // Teal
  '#7c3aed', // Purple
  '#ea580c', // Orange
  '#e11d48', // Rose
  '#059669', // Emerald
  '#d97706', // Amber
  '#4f46e5', // Indigo
];

export default function SettingsPage() {
  const {
    clinic,
    doctors,
    services,
    updateClinic,
    addDoctor,
    editDoctor,
    addService,
    editService,
    isDemoMode,
  } = useSlotCare();

  const [activeTab, setActiveTab] = useState<'clinic' | 'doctors' | 'services'>('clinic');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Clinic profile form state
  const [clinicName, setClinicName] = useState(clinic.name);
  const [clinicPhone, setClinicPhone] = useState(clinic.phone);
  const [savingClinic, setSavingClinic] = useState(false);

  // Doctor Modal state
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [docName, setDocName] = useState('');
  const [docSpecialty, setDocSpecialty] = useState('');
  const [docColor, setDocColor] = useState(COLOR_PRESETS[0]);
  const [docActive, setDocActive] = useState(true);

  // Service Modal state
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [srvName, setSrvName] = useState('');
  const [srvDuration, setSrvDuration] = useState<number>(30);
  const [srvPrice, setSrvPrice] = useState<number>(250);
  const [srvActive, setSrvActive] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Save Clinic Profile
  const handleSaveClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingClinic(true);
    const res = await updateClinic({
      name: clinicName,
      phone: clinicPhone,
    });
    setSavingClinic(false);
    if (res.success) {
      showToast('تم حفظ بيانات العيادة بنجاح!');
    } else {
      showToast(res.error || 'حدث خطأ أثناء الحفظ');
    }
  };

  // 2. Doctor Actions
  const openDoctorModal = (doctor?: Doctor) => {
    if (doctor) {
      setEditingDoctor(doctor);
      setDocName(doctor.full_name);
      setDocSpecialty(doctor.specialty);
      setDocColor(doctor.color_code);
      setDocActive(doctor.is_active);
    } else {
      setEditingDoctor(null);
      setDocName('');
      setDocSpecialty('');
      setDocColor(COLOR_PRESETS[doctors.length % COLOR_PRESETS.length]);
      setDocActive(true);
    }
    setShowDoctorModal(true);
  };

  const handleSaveDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName || !docSpecialty) return;

    if (editingDoctor) {
      const res = await editDoctor(editingDoctor.id, {
        full_name: docName,
        specialty: docSpecialty,
        color_code: docColor,
        is_active: docActive,
      });
      if (res.success) {
        showToast('تم تحديث بيانات الطبيب بنجاح');
      }
    } else {
      const res = await addDoctor({
        full_name: docName,
        specialty: docSpecialty,
        color_code: docColor,
        is_active: docActive,
      });
      if (res.success) {
        showToast('تمت إضافة الطبيب بنجاح إلى جدول العيادة!');
      }
    }
    setShowDoctorModal(false);
  };

  const toggleDoctorActive = async (doctor: Doctor) => {
    const res = await editDoctor(doctor.id, { is_active: !doctor.is_active });
    if (res.success) {
      showToast(
        !doctor.is_active
          ? `تم تفعيل حساب ${doctor.full_name}`
          : `تم تعطيل حساب ${doctor.full_name}`
      );
    }
  };

  // 3. Service Actions
  const openServiceModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setSrvName(service.name);
      setSrvDuration(service.duration_minutes);
      setSrvPrice(service.price);
      setSrvActive(service.is_active);
    } else {
      setEditingService(null);
      setSrvName('');
      setSrvDuration(30);
      setSrvPrice(300);
      setSrvActive(true);
    }
    setShowServiceModal(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!srvName) return;

    if (editingService) {
      const res = await editService(editingService.id, {
        name: srvName,
        duration_minutes: Number(srvDuration),
        price: Number(srvPrice),
        is_active: srvActive,
      });
      if (res.success) {
        showToast('تم تحديث بيانات الخدمة بنجاح');
      }
    } else {
      const res = await addService({
        name: srvName,
        duration_minutes: Number(srvDuration),
        price: Number(srvPrice),
        is_active: srvActive,
      });
      if (res.success) {
        showToast('تمت إضافة الخدمة بنجاح إلى قائمة خدمات العيادة!');
      }
    }
    setShowServiceModal(false);
  };

  const toggleServiceActive = async (service: Service) => {
    const res = await editService(service.id, { is_active: !service.is_active });
    if (res.success) {
      showToast(
        !service.is_active
          ? `تم تفعيل خدمة ${service.name}`
          : `تم إيقاف خدمة ${service.name}`
      );
    }
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
            <h2 className="text-lg font-bold text-slate-900">إعدادات العيادة والموارد الطبية</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            إدارة بيانات العيادة وكادر الأطباء وقائمة الخدمات والأسعار مع المزامنة الفورية للتقويم
          </p>
        </div>

        {toastMessage && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-1.5 rounded-xl text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
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
          <form onSubmit={handleSaveClinic} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                اسم العيادة أو المركز الطبي:
              </label>
              <input
                type="text"
                required
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                رقم هاتف الاستقبال (يظهر في رسائل واتساب):
              </label>
              <input
                type="text"
                required
                value={clinicPhone}
                onChange={(e) => setClinicPhone(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 tabular-nums"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  المنطقة الزمنية المعتمدة:
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
                  defaultValue="30"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="15">15 دقيقة (استرجاع فائق السرعة)</option>
                  <option value="30">30 دقيقة (موصى به)</option>
                  <option value="45">45 دقيقة</option>
                  <option value="60">60 دقيقة</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {isDemoMode
                  ? 'يتم الحفظ في مخزن المعاينة المحلي'
                  : 'يتم الحفظ مباشرة في PostgreSQL تحت حماية RLS'}
              </span>
              <button
                type="submit"
                disabled={savingClinic}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingClinic ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Doctors Management */}
      {activeTab === 'doctors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              قائمة أطباء العيادة. تظهر التعديلات فورياً في فلاتر التقويم وقائمة الانتظار.
            </p>
            <button
              onClick={() => openDoctorModal()}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة طبيب جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className={`bg-white rounded-2xl border ${
                  doctor.is_active ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50'
                } p-5 shadow-sm flex items-center justify-between transition-all`}
                style={{ borderInlineStart: `6px solid ${doctor.color_code}` }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{doctor.full_name}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        doctor.is_active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {doctor.is_active ? 'نشط ومتاح' : 'معطل مؤقتاً'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{doctor.specialty}</p>
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                    <span
                      className="w-3 h-3 rounded-full inline-block"
                      style={{ backgroundColor: doctor.color_code }}
                    />
                    <span>كود لون التقويم: {doctor.color_code}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleDoctorActive(doctor)}
                    title={doctor.is_active ? 'تعطيل الطبيب' : 'تفعيل الطبيب'}
                    className={`p-2 rounded-xl transition-colors ${
                      doctor.is_active
                        ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                        : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => openDoctorModal(doctor)}
                    title="تعديل بيانات الطبيب"
                    className="p-2 rounded-xl text-slate-500 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Services Management */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              قائمة الخدمات الطبية المعتمدة ومدد المواعيد بالدقائق والأسعار.
            </p>
            <button
              onClick={() => openServiceModal()}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة خدمة جديدة</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="py-3.5 px-4">اسم الخدمة</th>
                  <th className="py-3.5 px-4">المدة المحددة</th>
                  <th className="py-3.5 px-4">السعر التقديري</th>
                  <th className="py-3.5 px-4 text-center">الحالة</th>
                  <th className="py-3.5 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map((service) => (
                  <tr
                    key={service.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      !service.is_active ? 'opacity-60 bg-slate-50/40' : ''
                    }`}
                  >
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
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          service.is_active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {service.is_active ? 'متاحة للحجز' : 'معطلة'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => toggleServiceActive(service)}
                          title={service.is_active ? 'إيقاف الخدمة' : 'تفعيل الخدمة'}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openServiceModal(service)}
                          title="تعديل الخدمة"
                          className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Doctor Create/Edit Modal */}
      {showDoctorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-600" />
                <span>{editingDoctor ? 'تعديل بيانات الطبيب' : 'إضافة طبيب جديد'}</span>
              </h3>
              <button
                onClick={() => setShowDoctorModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDoctor} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  اسم الطبيب كاملاً:
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: د. فيصل السبيعي"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">التخصص:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: زراعة وتجميل الأسنان"
                  value={docSpecialty}
                  onChange={(e) => setDocSpecialty(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  لون تمييز الطبيب في التقويم:
                </label>
                <div className="flex items-center gap-2">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => setDocColor(color)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        docColor === color ? 'scale-125 ring-2 ring-slate-900 ring-offset-2' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">حالة الطبيب</span>
                  <span className="text-[11px] text-slate-500">
                    هل يستقبل مواعيد جديدة في جدول العيادة؟
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={docActive}
                  onChange={(e) => setDocActive(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDoctorModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-all"
                >
                  {editingDoctor ? 'حفظ التعديلات' : 'إضافة الطبيب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Service Create/Edit Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Scissors className="w-5 h-5 text-teal-600" />
                <span>{editingService ? 'تعديل بيانات الخدمة' : 'إضافة خدمة علاجية جديدة'}</span>
              </h3>
              <button
                onClick={() => setShowServiceModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  اسم الخدمة:
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: حشوة كمبوزيت تجميلية"
                  value={srvName}
                  onChange={(e) => setSrvName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    المدة بالدقائق:
                  </label>
                  <select
                    value={srvDuration}
                    onChange={(e) => setSrvDuration(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 tabular-nums font-semibold"
                  >
                    <option value={15}>15 دقيقة</option>
                    <option value={30}>30 دقيقة</option>
                    <option value={45}>45 دقيقة</option>
                    <option value={60}>60 دقيقة</option>
                    <option value={90}>90 دقيقة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    السعر التقديري (ر.س):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    required
                    value={srvPrice}
                    onChange={(e) => setSrvPrice(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 tabular-nums font-semibold"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">حالة الخدمة</span>
                  <span className="text-[11px] text-slate-500">
                    إتاحة الخدمة في حجز المواعيد وقائمة الانتظار
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={srvActive}
                  onChange={(e) => setSrvActive(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-all"
                >
                  {editingService ? 'حفظ التعديلات' : 'إضافة الخدمة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
