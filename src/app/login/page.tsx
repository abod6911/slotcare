'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Lock,
  Mail,
  ArrowLeft,
  Building,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('reception@smileclinic.sa');
  const [password, setPassword] = useState('••••••••');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-white mx-auto mb-4 shadow-xl shadow-teal-500/20">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">SlotCare</h1>
          <p className="text-sm text-teal-300 font-medium mt-1">
            بوابة تسجيل دخول موظفي واستقبال العيادة
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-7 shadow-2xl border border-slate-200/50">
          <div className="mb-6 flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">تسجيل الدخول للمنظومة</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                العيادة: عيادة سمايل لطب وجراحة الأسنان
              </p>
            </div>
            <span className="p-1.5 bg-teal-50 text-teal-700 rounded-lg text-xs font-bold">
              نسخة العرض
            </span>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                البريد الإلكتروني المهني:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs pr-10 pl-3 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                كلمة المرور:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs pr-10 pl-3 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-800"
                />
              </div>
            </div>

            <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-100 text-xs text-teal-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <span>
                الحساب مهيأ تلقائياً لموظفة الاستقبال (<strong>ريم الدوسري</strong>)
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-900/10 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <span>{loading ? 'جارٍ التحقق...' : 'دخول لوحة التحكم'}</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>جاهز لربط Supabase Auth في المرحلة الثانية</span>
          </div>
        </div>
      </div>
    </div>
  );
}
