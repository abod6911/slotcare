-- ==============================================================================
-- SlotCare Realistic Arabic Seed Data (seed.sql)
-- "عيادة سمايل لطب وجراحة الأسنان" — 4 الأطباء، 5 خدمات، مواعيد شاغرة وقائمة انتظار
-- ==============================================================================
-- INSTRUCTIONS TO LINK YOUR AUTHENTICATED USER TO THIS CLINIC:
-- 1. Sign up a new user via Supabase Auth (or through the app's /login page).
-- 2. Run the following SQL query in the Supabase SQL Editor:
--
--    INSERT INTO public.staff (clinic_id, user_id, full_name, role)
--    VALUES (
--        'a0000000-0000-0000-0000-000000000001',
--        '<YOUR_AUTH_USER_UUID_FROM_AUTH_USERS>',
--        'د. ناصر الغامدي',
--        'admin'
--    )
--    ON CONFLICT (user_id) DO UPDATE 
--    SET clinic_id = 'a0000000-0000-0000-0000-000000000001', role = 'admin';
-- ==============================================================================

-- 1. Seed Clinic
INSERT INTO public.clinics (id, name, phone, timezone, created_at)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'عيادة سمايل لطب وجراحة الأسنان',
    '0112345678',
    'Asia/Riyadh',
    now()
)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, phone = EXCLUDED.phone;

-- 2. Seed 4 Doctors
INSERT INTO public.doctors (id, clinic_id, full_name, specialty, color_code, is_active, created_at)
VALUES 
    (
        'b0000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000001',
        'د. أحمد المنصور',
        'جراحة وزراعة الأسنان',
        '#0284c7',
        true,
        now()
    ),
    (
        'b0000000-0000-0000-0000-000000000002',
        'a0000000-0000-0000-0000-000000000001',
        'د. سارة القحطاني',
        'تقويم الأسنان وتجميل الابتسامة',
        '#0d9488',
        true,
        now()
    ),
    (
        'b0000000-0000-0000-0000-000000000003',
        'a0000000-0000-0000-0000-000000000001',
        'د. خالد العتيبي',
        'علاج الجذور وحشو العصب المجهري',
        '#7c3aed',
        true,
        now()
    ),
    (
        'b0000000-0000-0000-0000-000000000004',
        'a0000000-0000-0000-0000-000000000001',
        'د. ليلى الشمري',
        'طب أسنان الأطفال والعناية الوقائية',
        '#ea580c',
        true,
        now()
    )
ON CONFLICT (id) DO UPDATE
SET full_name = EXCLUDED.full_name, specialty = EXCLUDED.specialty, color_code = EXCLUDED.color_code;

-- 3. Seed 5 Dental Services
INSERT INTO public.services (id, clinic_id, name, duration_minutes, price, is_active, created_at)
VALUES 
    (
        'c0000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000001',
        'تنظيف وتلميع الأسنان وإزالة الجير',
        30,
        250.00,
        true,
        now()
    ),
    (
        'c0000000-0000-0000-0000-000000000002',
        'a0000000-0000-0000-0000-000000000001',
        'حشو عصب وجذور متقدم بالمجهر',
        60,
        850.00,
        true,
        now()
    ),
    (
        'c0000000-0000-0000-0000-000000000003',
        'a0000000-0000-0000-0000-000000000001',
        'فحص واستشارة تقويم الأسنان الشفاف',
        45,
        350.00,
        true,
        now()
    ),
    (
        'c0000000-0000-0000-0000-000000000004',
        'a0000000-0000-0000-0000-000000000001',
        'جلسة تبييض الأسنان بالليزر زووم',
        60,
        1100.00,
        true,
        now()
    ),
    (
        'c0000000-0000-0000-0000-000000000005',
        'a0000000-0000-0000-0000-000000000001',
        'حشوة تجميلية كمبوزيت للأسنان الأمامية',
        45,
        400.00,
        true,
        now()
    )
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, duration_minutes = EXCLUDED.duration_minutes, price = EXCLUDED.price;

-- 4. Seed Showcase Appointments
INSERT INTO public.appointments (
    id, clinic_id, doctor_id, service_id, patient_name, patient_phone, start_time, end_time, status, cancelled_at
)
VALUES
    -- The Primary Showcase Cancelled Slot (4:00 PM today with Dr. Ahmed)
    (
        'd0000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000001',
        'محمد العمري',
        '0541122334',
        date_trunc('day', now()) + interval '16 hours',
        date_trunc('day', now()) + interval '16 hours 30 minutes',
        'cancelled',
        now() - interval '25 minutes'
    ),
    -- Scheduled slot with Dr. Sarah
    (
        'd0000000-0000-0000-0000-000000000002',
        'a0000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000002',
        'c0000000-0000-0000-0000-000000000003',
        'ريم العبدالله',
        '0507744112',
        date_trunc('day', now()) + interval '15 hours',
        date_trunc('day', now()) + interval '15 hours 45 minutes',
        'scheduled',
        null
    ),
    -- Scheduled slot with Dr. Khalid
    (
        'd0000000-0000-0000-0000-000000000003',
        'a0000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000003',
        'c0000000-0000-0000-0000-000000000002',
        'طارق الحربي',
        '0562211445',
        date_trunc('day', now()) + interval '17 hours',
        date_trunc('day', now()) + interval '18 hours',
        'scheduled',
        null
    )
ON CONFLICT (id) DO NOTHING;

-- 5. Seed Smart Waitlist Entries
INSERT INTO public.waitlist (
    id, clinic_id, patient_name, patient_phone, service_id, preferred_doctor_id, 
    preferred_days, preferred_time_start, preferred_time_end, any_today, status, notes
)
VALUES
    -- Candidate 1: Exact Match for Dr. Ahmed, Cleaning, wants today after 3 PM
    (
        'e0000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000001',
        'عبدالعزيز التميمي',
        '0551234567',
        'c0000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000001',
        ARRAY['اليوم', 'السبت', 'الأحد'],
        '15:00:00',
        '19:00:00',
        true,
        'waiting',
        'ألم خفيف ويرغب في موعد عاجل اليوم إذا توفر شاغر'
    ),
    -- Candidate 2: High Match (Flexible doctor, prefers afternoon)
    (
        'e0000000-0000-0000-0000-000000000002',
        'a0000000-0000-0000-0000-000000000001',
        'فاطمة الشهري',
        '0509876543',
        'c0000000-0000-0000-0000-000000000001',
        null,
        ARRAY['السبت', 'الأحد', 'اليوم'],
        '16:00:00',
        '18:00:00',
        true,
        'waiting',
        'تناسبها فترة بعد العصر وتفضل الحضور اليوم'
    ),
    -- Candidate 3: Partial Match (Diff doctor, diff time)
    (
        'e0000000-0000-0000-0000-000000000003',
        'a0000000-0000-0000-0000-000000000001',
        'عمر السليمان',
        '0563322114',
        'c0000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000002',
        ARRAY['الاثنين', 'الثلاثاء'],
        '18:00:00',
        '21:00:00',
        false,
        'waiting',
        'يفضل د. سارة في المساء، لكن مستعد للحضور إن تعذر'
    )
ON CONFLICT (id) DO NOTHING;
