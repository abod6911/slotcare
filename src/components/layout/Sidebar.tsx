'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Zap,
  History,
  Settings,
  Sparkles,
  LogOut,
  ChevronLeft,
  Stethoscope,
} from 'lucide-react';
import { useSlotCare } from '@/context/SlotCareContext';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { clinic, staff, appointments } = useSlotCare();

  // Count active cancelled slots ready for recovery
  const cancelledSlotsCount = appointments.filter((a) => a.status === 'cancelled').length;

  const navItems = [
    {
      title: 'لوحة التحكم',
      href: '/dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      title: 'تقويم العيادة',
      href: '/calendar',
      icon: Calendar,
      badge: null,
    },
    {
      title: 'قائمة الانتظار الذكية',
      href: '/waitlist',
      icon: Users,
      badge: null,
    },
    {
      title: 'المواعيد الشاغرة والملغاة',
      href: '/open-slots',
      icon: Zap,
      badge: cancelledSlotsCount > 0 ? `${cancelledSlotsCount} متاح` : null,
      badgeColor: 'bg-rose-500 text-white animate-pulse',
    },
    {
      title: 'سجل الاسترجاع',
      href: '/recovery-history',
      icon: History,
      badge: null,
    },
    {
      title: 'إعدادات العيادة',
      href: '/settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 min-h-screen flex flex-col border-s border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-white tracking-tight">SlotCare</span>
              <span className="text-[10px] font-medium bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded border border-teal-500/30">
                MVP v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400">استرجاع المواعيد الذكي</p>
          </div>
        </div>

        {/* Current Active Clinic Badge */}
        <div className="mt-4 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-100 truncate">{clinic.name}</p>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <Stethoscope className="w-3 h-3 text-teal-400" />
              <span>4 أطباء أسنان متاحين</span>
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-900/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.title}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {isActive && !item.badge && (
                <ChevronLeft className="w-4 h-4 text-teal-200" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Staff Profile & Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-teal-400">
              {staff.full_name.slice(0, 1)}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">{staff.full_name}</p>
              <p className="text-[10px] text-teal-400">موظفة استقبال معتمدة</p>
            </div>
          </div>
          <Link
            href="/login"
            title="تسجيل الخروج"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
};
