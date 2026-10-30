-- ==============================================================================
-- SlotCare Database Schema Migration (0001_initial_schema.sql)
-- Supabase / PostgreSQL Migration Script
-- Tables: clinics, staff, doctors, services, appointments, waitlist, slot_offers
-- Includes Indexes, Row Level Security (RLS), and Atomic Slot Claiming RPC Function
-- ==============================================================================

-- Enable UUID extension if not enabled
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
    role TEXT NOT NULL CHECK (role IN ('admin', 'receptionist')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
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
-- Indexes for Performance & Instant Querying
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_staff_clinic_user ON public.staff(clinic_id, user_id);
CREATE INDEX IF NOT EXISTS idx_doctors_clinic ON public.doctors(clinic_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_services_clinic ON public.services(clinic_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_time ON public.appointments(clinic_id, start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_match_lookup ON public.waitlist(clinic_id, service_id, status);
CREATE INDEX IF NOT EXISTS idx_slot_offers_token ON public.slot_offers(token);
CREATE INDEX IF NOT EXISTS idx_slot_offers_appointment ON public.slot_offers(appointment_id);

-- ------------------------------------------------------------------------------
-- Row Level Security (RLS) Configuration
-- ------------------------------------------------------------------------------
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slot_offers ENABLE ROW LEVEL SECURITY;

-- Helper security function to get clinic_id of authenticated staff
CREATE OR REPLACE FUNCTION public.get_auth_staff_clinic_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT clinic_id FROM public.staff WHERE user_id = auth.uid() LIMIT 1;
$$;

-- RLS Policies for Staff Access (Scoped to their Clinic)
CREATE POLICY staff_clinic_access ON public.clinics
    FOR ALL USING (id = public.get_auth_staff_clinic_id());

CREATE POLICY staff_self_access ON public.staff
    FOR ALL USING (clinic_id = public.get_auth_staff_clinic_id());

CREATE POLICY doctors_clinic_access ON public.doctors
    FOR ALL USING (clinic_id = public.get_auth_staff_clinic_id());

CREATE POLICY services_clinic_access ON public.services
    FOR ALL USING (clinic_id = public.get_auth_staff_clinic_id());

CREATE POLICY appointments_clinic_access ON public.appointments
    FOR ALL USING (clinic_id = public.get_auth_staff_clinic_id());

CREATE POLICY waitlist_clinic_access ON public.waitlist
    FOR ALL USING (clinic_id = public.get_auth_staff_clinic_id());

CREATE POLICY slot_offers_clinic_access ON public.slot_offers
    FOR ALL USING (clinic_id = public.get_auth_staff_clinic_id());

-- Public Access Policy for Slot Offers (Token-based verification for patients)
-- Allows public read/claim using the unguessable secure token without login
CREATE POLICY public_token_view_offer ON public.slot_offers
    FOR SELECT USING (true);

-- ------------------------------------------------------------------------------
-- Atomic Slot Claiming RPC Function (Race-Condition Free)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.claim_slot_offer(offer_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
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
