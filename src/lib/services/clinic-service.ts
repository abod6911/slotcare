// ==============================================================================
// SlotCare Unified Clinic Data Service
// Handles Database Queries with Automatic Supabase / Hybrid Preview Switching
// ==============================================================================

import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Clinic, Doctor, Service, Staff } from '@/types/database.types';

export const clinicService = {
  /**
   * Fetches the clinic profile
   */
  async getClinicProfile(clinicId?: string): Promise<Clinic | null> {
    const supabase = createClient();
    if (!supabase) return null;

    let query = supabase.from('clinics').select('*');
    if (clinicId) {
      query = query.eq('id', clinicId);
    }
    const { data, error } = await query.single();
    if (error) {
      console.warn('Error fetching clinic profile:', error.message);
      return null;
    }
    return data as Clinic;
  },

  /**
   * Updates clinic profile details
   */
  async updateClinicProfile(id: string, updates: Partial<Pick<Clinic, 'name' | 'phone' | 'timezone'>>): Promise<{ success: boolean; data?: Clinic; error?: string }> {
    const supabase = createClient();
    if (!supabase) {
      return { success: true }; // Handled by context fallback
    }

    const { data, error } = await supabase
      .from('clinics')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data: data as Clinic };
  },

  /**
   * Fetches all doctors for the clinic
   */
  async getDoctors(clinicId?: string): Promise<Doctor[]> {
    const supabase = createClient();
    if (!supabase) return [];

    let query = supabase.from('doctors').select('*').order('created_at', { ascending: true });
    if (clinicId) {
      query = query.eq('clinic_id', clinicId);
    }
    const { data, error } = await query;
    if (error) {
      console.warn('Error fetching doctors from Supabase:', error.message);
      return [];
    }
    return (data || []) as Doctor[];
  },

  /**
   * Inserts a new doctor record
   */
  async createDoctor(doctor: Omit<Doctor, 'id' | 'created_at'>): Promise<{ success: boolean; data?: Doctor; error?: string }> {
    const supabase = createClient();
    if (!supabase) {
      return { success: true };
    }

    const { data, error } = await supabase
      .from('doctors')
      .insert(doctor)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data: data as Doctor };
  },

  /**
   * Updates an existing doctor record
   */
  async updateDoctor(id: string, updates: Partial<Doctor>): Promise<{ success: boolean; data?: Doctor; error?: string }> {
    const supabase = createClient();
    if (!supabase) {
      return { success: true };
    }

    const { data, error } = await supabase
      .from('doctors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data: data as Doctor };
  },

  /**
   * Fetches all active services for the clinic
   */
  async getServices(clinicId?: string): Promise<Service[]> {
    const supabase = createClient();
    if (!supabase) return [];

    let query = supabase.from('services').select('*').order('created_at', { ascending: true });
    if (clinicId) {
      query = query.eq('clinic_id', clinicId);
    }
    const { data, error } = await query;
    if (error) {
      console.warn('Error fetching services from Supabase:', error.message);
      return [];
    }
    return (data || []) as Service[];
  },

  /**
   * Inserts a new service record
   */
  async createService(service: Omit<Service, 'id' | 'created_at'>): Promise<{ success: boolean; data?: Service; error?: string }> {
    const supabase = createClient();
    if (!supabase) {
      return { success: true };
    }

    const { data, error } = await supabase
      .from('services')
      .insert(service)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data: data as Service };
  },

  /**
   * Updates an existing service record
   */
  async updateService(id: string, updates: Partial<Service>): Promise<{ success: boolean; data?: Service; error?: string }> {
    const supabase = createClient();
    if (!supabase) {
      return { success: true };
    }

    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data: data as Service };
  },

  /**
   * Fetches staff member details by authenticated user ID
   */
  async getStaffByUserId(userId: string): Promise<(Staff & { clinic?: Clinic }) | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('staff')
      .select('*, clinic:clinics(*)')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }
    return data;
  },

  /**
   * Onboards a brand-new clinic with its initial admin staff and seed services
   */
  async onboardClinic({
    userId,
    clinicName,
    staffFullName,
    phone,
  }: {
    userId: string;
    clinicName: string;
    staffFullName: string;
    phone: string;
  }): Promise<{ success: boolean; clinic?: Clinic; staff?: Staff; error?: string }> {
    const supabase = createClient();
    if (!supabase) {
      return { success: true };
    }

    try {
      // 1. Create Clinic
      const { data: clinic, error: clinicErr } = await supabase
        .from('clinics')
        .insert({
          name: clinicName,
          phone,
          timezone: 'Asia/Riyadh',
        })
        .select()
        .single();

      if (clinicErr || !clinic) {
        throw new Error(clinicErr?.message || 'فشل في إنشاء سجل العيادة');
      }

      // 2. Link Staff as Admin
      const { data: staff, error: staffErr } = await supabase
        .from('staff')
        .insert({
          clinic_id: clinic.id,
          user_id: userId,
          full_name: staffFullName,
          role: 'admin',
        })
        .select()
        .single();

      if (staffErr || !staff) {
        throw new Error(staffErr?.message || 'فشل في تسجيل حساب الموظف');
      }

      // 3. Seed Default Dental Services
      await supabase.from('services').insert([
        {
          clinic_id: clinic.id,
          name: 'تنظيف وتلميع الأسنان وإزالة الجير',
          duration_minutes: 30,
          price: 250,
          is_active: true,
        },
        {
          clinic_id: clinic.id,
          name: 'علاج وحشو العصب وجذور الأسنان',
          duration_minutes: 60,
          price: 800,
          is_active: true,
        },
        {
          clinic_id: clinic.id,
          name: 'استشارة وفحص عام وطوارئ',
          duration_minutes: 30,
          price: 150,
          is_active: true,
        },
      ]);

      // 4. Seed First Doctor (Staff member)
      await supabase.from('doctors').insert({
        clinic_id: clinic.id,
        full_name: staffFullName.startsWith('د.') ? staffFullName : `د. ${staffFullName}`,
        specialty: 'طب وجراحة الفم والأسنان',
        color_code: '#0284c7',
        is_active: true,
      });

      return { success: true, clinic, staff };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'حدث خطأ أثناء إعداد العيادة',
      };
    }
  },
};
