-- ==============================================================================
-- SlotCare Database Schema Migration (0001_initial_schema.sql)
-- Supabase / PostgreSQL Production Migration Script
-- Multi-Tenant RLS Isolated by clinic_id, Optimized Indexes & Atomic Slot Claim RPC
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Table: clinics
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clinics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT,
    timezone TEXT NOT NULL DEFAULT 'Asia/Riyadh',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 2. Table: staff
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- references auth.users(id)
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'receptionist' CHECK (role IN ('admin', 'receptionist')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_staff_user UNIQUE (user_id)
);

-- ------------------------------------------------------------------------------
-- 3. Table: doctors
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    color_code TEXT NOT NULL DEFAULT '#0ea5e9',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 4. Table: services
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 5. Table: appointments
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    patient_name TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'cancelled', 'recovered', 'completed', 'no_show')),
    cancelled_at TIMESTAMPTZ,
    recovered_from_appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 6. Table: waitlist
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    preferred_doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
    preferred_days TEXT[] NOT NULL DEFAULT '{}',
    preferred_time_start TIME,
    preferred_time_end TIME,
    any_today BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'offered', 'booked', 'archived')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 7. Table: slot_offers
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.slot_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    waitlist_id UUID NOT NULL REFERENCES public.waitlist(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    sent_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    responded_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- Performance Indexes
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_staff_user ON public.staff(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_clinic ON public.staff(clinic_id);
CREATE INDEX IF NOT EXISTS idx_doctors_clinic ON public.doctors(clinic_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_services_clinic ON public.services(clinic_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_time ON public.appointments(clinic_id, start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_match_lookup ON public.waitlist(clinic_id, service_id, status);
CREATE INDEX IF NOT EXISTS idx_slot_offers_token ON public.slot_offers(token);
CREATE INDEX IF NOT EXISTS idx_slot_offers_appointment ON public.slot_offers(appointment_id);

-- ------------------------------------------------------------------------------
-- Row Level Security (RLS) Configuration & Helper Functions
-- ------------------------------------------------------------------------------
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slot_offers ENABLE ROW LEVEL SECURITY;

-- Helper security function to get clinic_id of the currently authenticated staff member
CREATE OR REPLACE FUNCTION public.get_user_clinic_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT clinic_id FROM public.staff WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Grant EXECUTE on helper to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_clinic_id() TO authenticated;

-- RLS: clinics table
CREATE POLICY clinics_select_policy ON public.clinics
    FOR SELECT TO authenticated
    USING (id = (SELECT public.get_user_clinic_id()));

CREATE POLICY clinics_insert_policy ON public.clinics
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY clinics_update_policy ON public.clinics
    FOR UPDATE TO authenticated
    USING (id = (SELECT public.get_user_clinic_id()))
    WITH CHECK (id = (SELECT public.get_user_clinic_id()));

-- RLS: staff table
CREATE POLICY staff_select_policy ON public.staff
    FOR SELECT TO authenticated
    USING (
        clinic_id = (SELECT public.get_user_clinic_id()) 
        OR user_id = (SELECT auth.uid())
    );

CREATE POLICY staff_insert_policy ON public.staff
    FOR INSERT TO authenticated
    WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY staff_update_policy ON public.staff
    FOR UPDATE TO authenticated
    USING (clinic_id = (SELECT public.get_user_clinic_id()))
    WITH CHECK (clinic_id = (SELECT public.get_user_clinic_id()));

-- RLS: doctors table
CREATE POLICY doctors_all_policy ON public.doctors
    FOR ALL TO authenticated
    USING (clinic_id = (SELECT public.get_user_clinic_id()))
    WITH CHECK (clinic_id = (SELECT public.get_user_clinic_id()));

-- RLS: services table
CREATE POLICY services_all_policy ON public.services
    FOR ALL TO authenticated
    USING (clinic_id = (SELECT public.get_user_clinic_id()))
    WITH CHECK (clinic_id = (SELECT public.get_user_clinic_id()));

-- RLS: appointments table
CREATE POLICY appointments_all_policy ON public.appointments
    FOR ALL TO authenticated
    USING (clinic_id = (SELECT public.get_user_clinic_id()))
    WITH CHECK (clinic_id = (SELECT public.get_user_clinic_id()));

-- RLS: waitlist table
CREATE POLICY waitlist_all_policy ON public.waitlist
    FOR ALL TO authenticated
    USING (clinic_id = (SELECT public.get_user_clinic_id()))
    WITH CHECK (clinic_id = (SELECT public.get_user_clinic_id()));

-- RLS: slot_offers table (Staff full access)
CREATE POLICY slot_offers_staff_policy ON public.slot_offers
    FOR ALL TO authenticated
    USING (clinic_id = (SELECT public.get_user_clinic_id()))
    WITH CHECK (clinic_id = (SELECT public.get_user_clinic_id()));

-- RLS: slot_offers table (Public anonymous access for patient offer viewing by unguessable token)
CREATE POLICY slot_offers_public_select ON public.slot_offers
    FOR SELECT TO anon
    USING (status = 'pending' AND expires_at > timezone('utc'::text, now()));

-- ------------------------------------------------------------------------------
-- Atomic Slot Claiming RPC Function (Race-Condition Free)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.claim_slot_offer(offer_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_offer RECORD;
    v_appointment RECORD;
    v_waitlist RECORD;
BEGIN
    -- 1. Fetch and Lock the Offer Record
    SELECT * INTO v_offer
    FROM public.slot_offers
    WHERE token = offer_token
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'INVALID_TOKEN', 'message', 'رمز العرض غير صالح أو غير موجود.');
    END IF;

    -- 2. Verify Offer Status
    IF v_offer.status = 'accepted' THEN
        RETURN jsonb_build_object('success', false, 'error', 'ALREADY_ACCEPTED', 'message', 'تم تأكيد هذا العرض مسبقاً.');
    END IF;

    IF v_offer.status = 'expired' OR v_offer.expires_at < timezone('utc'::text, now()) THEN
        UPDATE public.slot_offers SET status = 'expired' WHERE id = v_offer.id;
        RETURN jsonb_build_object('success', false, 'error', 'EXPIRED', 'message', 'عذراً، انتهت صلاحية هذا العرض.');
    END IF;

    IF v_offer.status = 'declined' THEN
        RETURN jsonb_build_object('success', false, 'error', 'DECLINED', 'message', 'تم الاعتذار عن هذا العرض سابقاً.');
    END IF;

    -- 3. Lock and Verify the Appointment
    SELECT * INTO v_appointment
    FROM public.appointments
    WHERE id = v_offer.appointment_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'APPOINTMENT_NOT_FOUND', 'message', 'الموعد لم يعد متاحاً.');
    END IF;

    IF v_appointment.status = 'recovered' THEN
        RETURN jsonb_build_object('success', false, 'error', 'SLOT_ALREADY_TAKEN', 'message', 'عذراً، تم حجز هذا الموعد من قبل مريض آخر.');
    END IF;

    -- 4. Fetch Waitlist Patient details
    SELECT * INTO v_waitlist
    FROM public.waitlist
    WHERE id = v_offer.waitlist_id
    FOR UPDATE;

    -- 5. Atomically update Offer, Appointment, and Waitlist
    UPDATE public.slot_offers
    SET status = 'accepted', responded_at = timezone('utc'::text, now())
    WHERE id = v_offer.id;

    -- Expire any other competing offers for this appointment
    UPDATE public.slot_offers
    SET status = 'expired'
    WHERE appointment_id = v_appointment.id AND id != v_offer.id AND status = 'pending';

    -- Update appointment to recovered with new patient info
    UPDATE public.appointments
    SET 
        status = 'recovered',
        patient_name = v_waitlist.patient_name,
        patient_phone = v_waitlist.patient_phone,
        recovered_from_appointment_id = v_appointment.id
    WHERE id = v_appointment.id;

    -- Mark waitlist entry as booked
    UPDATE public.waitlist
    SET status = 'booked'
    WHERE id = v_waitlist.id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'تم تأكيد حجز الموعد بنجاح!',
        'appointment_id', v_appointment.id,
        'patient_name', v_waitlist.patient_name,
        'start_time', v_appointment.start_time
    );
END;
$$;

-- Allow anon and authenticated roles to invoke the atomic claim function
GRANT EXECUTE ON FUNCTION public.claim_slot_offer(TEXT) TO anon, authenticated;
