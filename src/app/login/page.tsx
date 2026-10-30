'use client';

// ==============================================================================
// SlotCare Clinic Staff Login & Onboarding Portal
// Supports Live Supabase Auth + Instant One-Click Demo Mode Fallback
// ==============================================================================

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Lock,
  Mail,
  ArrowLeft,
  Building,
  User,
  Phone,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';
import { isSupabaseConfigured, createClient } from '@/lib/supabase/client';
import { clinicService } from '@/lib/services/clinic-service';
import { useSlotCare } from '@/context/SlotCareContext';

export default function LoginPage() {
  const router = useRouter();
  const { isDemoMode, refreshLiveClinicData } = useSlotCare();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('reception@smileclinic.sa');
  const [password, setPassword] = useState('password123');

  // Register New Clinic Form State
  const [clinicName, setClinicName] = useState('');
  const [staffName, setStaffName] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // One-click demo login bypass
  const handleDemoBypass = () => {
    router.push('/dashboard');
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    // If in demo mode, authenticate in-memory
    if (isDemoMode) {
      setTimeout(() => {
        router.push('/dashboard');
      }, 400);
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      router.push('/dashboard');
      return;
    }

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          await refreshLiveClinicData();
          router.push('/dashboard');
        }
      } else {
        // Register New Clinic Flow
        if (!clinicName || !staffName || !phone) {
          throw new Error('يرجى تعبئة كافة بيانات العيادة والموظف المسؤول');
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          const onboardRes = await clinicService.onboardClinic({
            userId: data.user.id,
            clinicName,
            staffFullName: staffName,
            phone,
          });

          if (!onboardRes.success) {
            throw new Error(onboardRes.error || 'فشل في ربط بيانات العيادة');
          }

          setSuccessMessage('تم إنشاء حساب العيادة بنجاح! جارٍ توجيهك...');
          await refreshLiveClinicData();
          setTimeout(() => {
            router.push('/dashboard');
          }, 1000);
        }
      }
    } catch (err: unknown) {
      console.error('Auth error:', err);
      const msg = err instanceof Error ? err.message : 'حدث خطأ أثناء المصادقة';
      if (msg.includes('Invalid login credentials')) {
        setErrorMessage('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      } else if (msg.includes('User already registered')) {
        setErrorMessage('هذا البريد مسجل مسبقاً، يرجى تسجيل الدخول');
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-white mx-auto mb-3 shadow-xl shadow-teal-500/20">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">SlotCare</h1>
          <p className="text-sm text-teal-300 font-medium mt-1">
            بوابة تسجيل دخول وإدارة عيادات المواعيد الذكية
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/50">
          {/* Header Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              تسجيل عيادة جديدة
            </button>
          </div>

          {/* Alerts */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium flex items-center gap-2 mb-4 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2 mb-4 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    اسم العيادة أو المركز الطبي:
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="مثال: عيادة النخبة لطب الأسنان"
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      className="w-full text-xs pr-10 pl-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    اسم المسؤول / الطبيب المدير:
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="مثال: د. ناصر الغامدي"
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      className="w-full text-xs pr-10 pl-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    رقم هاتف العيادة (للواتساب):
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="011XXXXXXXX أو 05XXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs pr-10 pl-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                البريد الإلكتروني المهني:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@clinic.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs pr-10 pl-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                كلمة المرور:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs pr-10 pl-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-900/10 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <span>
                {loading
                  ? 'جارٍ المعالجة...'
                  : mode === 'login'
                  ? 'تسجيل الدخول للنظام'
                  : 'تأكيد وإنشاء العيادة'}
              </span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Bypass Button */}
          <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
            <button
              type="button"
              onClick={handleDemoBypass}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-slate-100 to-teal-50 hover:from-slate-200 hover:to-teal-100 text-teal-900 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-teal-200/60"
            >
              <KeyRound className="w-3.5 h-3.5 text-teal-600" />
              <span>دخول تجريبي فوري بنقرة واحدة (عيادة سمايل)</span>
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>
                {isDemoMode
                  ? 'وضع المعاينة المحلي نشط (بدون حاجة لخادم خارجي)'
                  : 'المصادقة السحابية عبر Supabase Auth مفعّلة'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
