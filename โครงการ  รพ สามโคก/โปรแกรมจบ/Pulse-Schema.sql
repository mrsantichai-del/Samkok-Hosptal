--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4 (Debian 16.4-1.pgdg110+2)
-- Dumped by pg_dump version 16.4 (Debian 16.4-1.pgdg110+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: absence_request_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.absence_request_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'cancelled'
);


--
-- Name: calculation_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.calculation_status AS ENUM (
    'draft',
    'submitted',
    'approved',
    'paid'
);


--
-- Name: degree_level; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.degree_level AS ENUM (
    'below_secondary',
    'secondary',
    'high_school',
    'vocational',
    'high_vocational',
    'diploma',
    'bachelors',
    'masters',
    'doctorate',
    'postdoctoral',
    'certificate',
    'other'
);


--
-- Name: document_reference_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.document_reference_type AS ENUM (
    'employee_profile',
    'education_record',
    'certification',
    'professional_license',
    'absence_request'
);


--
-- Name: employment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.employment_status AS ENUM (
    'active',
    'probation',
    'resigned',
    'terminated',
    'retired',
    'seconded',
    'suspended',
    'on_study_leave'
);


--
-- Name: employment_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.employment_type AS ENUM (
    'civil_servant',
    'government_employee',
    'permanent_worker',
    'temporary_worker',
    'moph_employee',
    'temporary_worker_monthly',
    'temporary_worker_daily'
);


--
-- Name: gender_restriction; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.gender_restriction AS ENUM (
    'any',
    'male',
    'female'
);


--
-- Name: gender_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.gender_type AS ENUM (
    'male',
    'female',
    'other'
);


--
-- Name: leave_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.leave_category AS ENUM (
    'sick',
    'personal',
    'annual',
    'maternity',
    'paternity',
    'religious',
    'military',
    'study',
    'family',
    'rehabilitation',
    'compensatory'
);


--
-- Name: leave_counting_method; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.leave_counting_method AS ENUM (
    'working_days',
    'calendar_days'
);


--
-- Name: license_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.license_status AS ENUM (
    'active',
    'expired',
    'suspended',
    'revoked'
);


--
-- Name: marital_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.marital_status AS ENUM (
    'single',
    'married',
    'divorced',
    'widowed',
    'separated'
);


--
-- Name: org_unit_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.org_unit_type AS ENUM (
    'mission_group',
    'work_group',
    'division',
    'section',
    'unit',
    'ward'
);


--
-- Name: roster_assignment_source; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.roster_assignment_source AS ENUM (
    'manual',
    'auto_generated',
    'imported',
    'absence_request'
);


--
-- Name: roster_generation_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.roster_generation_status AS ENUM (
    'pending',
    'in_progress',
    'completed',
    'failed',
    'cancelled'
);


--
-- Name: schedule_preference_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.schedule_preference_type AS ENUM (
    'request_off',
    'request_work',
    'preferred_shift',
    'avoid_shift'
);


--
-- Name: shift_swap_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.shift_swap_status AS ENUM (
    'pending_colleague',
    'pending_manager',
    'approved',
    'rejected',
    'cancelled'
);


--
-- Name: shift_type_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.shift_type_category AS ENUM (
    'morning',
    'afternoon',
    'night',
    'long_day',
    'on_call',
    'other'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'super_admin',
    'nursing_admin',
    'hr_admin',
    'ward_manager',
    'staff'
);


--
-- Name: work_rule_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.work_rule_type AS ENUM (
    'max_consecutive_work_days',
    'min_rest_between_shifts',
    'max_hours_per_week',
    'max_consecutive_shifts_of_type',
    'max_consecutive_days_with_long_shifts',
    'max_shifts_per_day',
    'max_consecutive_multi_shift_days',
    'max_consecutive_shift_instances',
    'forbidden_shift_sequence'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _sqlx_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._sqlx_migrations (
    version bigint NOT NULL,
    description text NOT NULL,
    installed_on timestamp with time zone DEFAULT now() NOT NULL,
    success boolean NOT NULL,
    checksum bytea NOT NULL,
    execution_time bigint NOT NULL
);


--
-- Name: absence_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.absence_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    absence_type_id uuid NOT NULL,
    date_from date NOT NULL,
    date_to date NOT NULL,
    reason text,
    status public.absence_request_status DEFAULT 'pending'::public.absence_request_status,
    approved_by uuid,
    approved_at timestamp with time zone,
    rejection_reason text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    working_days numeric(5,1),
    medical_certificate_required boolean DEFAULT false,
    medical_certificate_submitted boolean DEFAULT false,
    medical_certificate_doc_id uuid,
    fiscal_year integer,
    CONSTRAINT absence_requests_check CHECK ((date_to >= date_from))
);


--
-- Name: absence_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.absence_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(10) NOT NULL,
    name character varying(50) NOT NULL,
    is_paid boolean DEFAULT true,
    requires_approval boolean DEFAULT true,
    default_balance numeric(5,2) DEFAULT 0,
    color character varying(7) DEFAULT '#f59e0b'::character varying,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    name_th character varying(100),
    category public.leave_category,
    counting_method public.leave_counting_method DEFAULT 'working_days'::public.leave_counting_method,
    max_days_paid numeric(5,1),
    max_days_half_pay numeric(5,1),
    max_days_total numeric(5,1),
    gender_restriction public.gender_restriction DEFAULT 'any'::public.gender_restriction,
    requires_certificate_after_days integer,
    is_once_per_career boolean DEFAULT false,
    description text
);


--
-- Name: attendance_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attendance_records (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    work_date date NOT NULL,
    clock_in_at timestamp with time zone,
    clock_out_at timestamp with time zone,
    clock_in_note character varying(255),
    clock_out_note character varying(255),
    status character varying(20) DEFAULT 'present'::character varying NOT NULL,
    source character varying(20) DEFAULT 'web'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: certifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.certifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    employee_profile_id uuid NOT NULL,
    name character varying(300) NOT NULL,
    issuing_organization character varying(300),
    credential_id character varying(100),
    issue_date date,
    expiry_date date,
    is_active boolean DEFAULT true NOT NULL,
    category character varying(100),
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reference_type public.document_reference_type NOT NULL,
    reference_id uuid NOT NULL,
    file_name character varying(500) NOT NULL,
    original_name character varying(500) NOT NULL,
    content_type character varying(200) NOT NULL,
    file_size bigint NOT NULL,
    storage_path character varying(1000) NOT NULL,
    uploaded_by uuid NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: education_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.education_records (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    employee_profile_id uuid NOT NULL,
    degree_level public.degree_level NOT NULL,
    degree_name character varying(200) NOT NULL,
    field_of_study character varying(200),
    institution character varying(300) NOT NULL,
    country character varying(100) DEFAULT 'ไทย'::character varying,
    start_date date,
    end_date date,
    gpa numeric(3,2),
    is_highest_degree boolean DEFAULT false NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: employee_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title_prefix character varying(50),
    date_of_birth date,
    gender public.gender_type,
    nationality character varying(100),
    religion character varying(100),
    blood_type character varying(5),
    national_id character varying(20),
    passport_number character varying(20),
    profile_photo_url text,
    address text,
    emergency_contact_name character varying(200),
    emergency_contact_phone character varying(20),
    emergency_contact_relation character varying(100),
    employment_status public.employment_status DEFAULT 'active'::public.employment_status NOT NULL,
    employment_type public.employment_type DEFAULT 'civil_servant'::public.employment_type NOT NULL,
    hire_date date,
    end_date date,
    probation_end_date date,
    position_id uuid,
    org_unit_id uuid,
    supervisor_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    government_id character varying(20),
    marital_status public.marital_status,
    appointment_date date,
    domicile_address text,
    staff_type_id uuid,
    status_date date,
    status_reason text,
    nationality_id uuid,
    ethnicity_id uuid,
    CONSTRAINT chk_national_id_format CHECK (((national_id IS NULL) OR ((national_id)::text ~ '^\d{13}$'::text)))
);


--
-- Name: employment_status_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employment_status_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    employee_profile_id uuid NOT NULL,
    from_status public.employment_status,
    to_status public.employment_status NOT NULL,
    effective_date date DEFAULT CURRENT_DATE NOT NULL,
    reason text,
    changed_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ethnicities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ethnicities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(10) NOT NULL,
    name_th character varying(100) NOT NULL,
    name_en character varying(100) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 100 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: hospital_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hospital_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    singleton boolean DEFAULT true NOT NULL,
    name_th character varying(200) NOT NULL,
    name_en character varying(200),
    address text,
    phone character varying(50),
    fax character varying(50),
    email character varying(200),
    website character varying(200),
    tax_id character varying(30),
    hospital_level character varying(30),
    hospital_type character varying(30),
    bed_count integer,
    founding_date date,
    logo_file_name character varying(255),
    logo_original_name character varying(255),
    logo_content_type character varying(100),
    logo_storage_path text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT hospital_settings_singleton_check CHECK ((singleton = true))
);


--
-- Name: job_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(20) NOT NULL,
    name character varying(100) NOT NULL,
    name_th character varying(100),
    description text,
    color character varying(7) DEFAULT '#6366f1'::character varying,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    can_be_in_charge boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_schedulable boolean DEFAULT false NOT NULL
);


--
-- Name: leave_balances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leave_balances (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    absence_type_id uuid NOT NULL,
    fiscal_year integer NOT NULL,
    entitled_days numeric(5,1) DEFAULT 0,
    carried_over_days numeric(5,1) DEFAULT 0,
    used_days numeric(5,1) DEFAULT 0,
    pending_days numeric(5,1) DEFAULT 0,
    remaining_days numeric(5,1) GENERATED ALWAYS AS ((((entitled_days + carried_over_days) - used_days) - pending_days)) STORED,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: leave_entitlement_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leave_entitlement_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    absence_type_id uuid NOT NULL,
    employment_type public.employment_type NOT NULL,
    max_days_per_year numeric(5,1),
    max_days_paid numeric(5,1),
    max_days_half_pay numeric(5,1),
    carry_over_max numeric(5,1),
    carry_over_max_senior numeric(5,1),
    senior_threshold_years integer DEFAULT 10,
    min_service_months integer DEFAULT 0,
    is_eligible boolean DEFAULT true,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: nationalities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nationalities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(10) NOT NULL,
    name_th character varying(100) NOT NULL,
    name_en character varying(100) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 100 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: org_units; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.org_units (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parent_id uuid,
    code character varying(20) NOT NULL,
    name character varying(200) NOT NULL,
    name_th character varying(200),
    unit_type public.org_unit_type NOT NULL,
    head_user_id uuid,
    ward_id uuid,
    description text,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    is_schedulable boolean DEFAULT false NOT NULL
);


--
-- Name: positions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.positions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(20) NOT NULL,
    title character varying(200) NOT NULL,
    title_th character varying(200),
    description text,
    org_unit_id uuid,
    job_profile_id uuid,
    budgeted_count integer DEFAULT 1 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    reports_to_id uuid,
    color character varying(7) DEFAULT '#6366f1'::character varying,
    can_be_in_charge boolean DEFAULT false,
    is_schedulable boolean DEFAULT true,
    sort_order integer DEFAULT 0
);


--
-- Name: professional_licenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.professional_licenses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    employee_profile_id uuid NOT NULL,
    license_type character varying(100) NOT NULL,
    license_number character varying(100) NOT NULL,
    council_name character varying(200),
    issued_date date,
    expiry_date date,
    status public.license_status DEFAULT 'active'::public.license_status NOT NULL,
    cpd_credits_required integer,
    cpd_credits_earned integer DEFAULT 0,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: public_holidays; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.public_holidays (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    date date NOT NULL,
    name_th character varying(200) NOT NULL,
    name_en character varying(200),
    year integer NOT NULL,
    is_recurring boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: roster_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roster_assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    ward_id uuid NOT NULL,
    date date NOT NULL,
    shift_type_id uuid,
    absence_type_id uuid,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    source public.roster_assignment_source DEFAULT 'manual'::public.roster_assignment_source,
    generation_id uuid,
    is_locked boolean DEFAULT false,
    preference_id uuid,
    absence_request_id uuid,
    CONSTRAINT roster_assignments_check CHECK (((shift_type_id IS NOT NULL) OR (absence_type_id IS NOT NULL)))
);


--
-- Name: roster_generations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roster_generations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ward_id uuid NOT NULL,
    year integer NOT NULL,
    month integer NOT NULL,
    status public.roster_generation_status DEFAULT 'pending'::public.roster_generation_status NOT NULL,
    config_snapshot jsonb DEFAULT '{}'::jsonb NOT NULL,
    total_slots integer DEFAULT 0,
    filled_slots integer DEFAULT 0,
    unfilled_slots integer DEFAULT 0,
    rule_violations integer DEFAULT 0,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    duration_ms integer,
    error_message text,
    error_details jsonb,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT roster_generations_month_check CHECK (((month >= 1) AND (month <= 12)))
);


--
-- Name: schedule_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schedule_preferences (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    ward_id uuid,
    preference_type public.schedule_preference_type NOT NULL,
    shift_type_id uuid,
    date date,
    day_of_week smallint,
    start_date date,
    end_date date,
    priority integer DEFAULT 1,
    reason text,
    status character varying(20) DEFAULT 'pending'::character varying,
    approved_by uuid,
    approved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT schedule_preferences_check CHECK (((preference_type = 'request_off'::public.schedule_preference_type) OR ((preference_type = ANY (ARRAY['request_work'::public.schedule_preference_type, 'preferred_shift'::public.schedule_preference_type, 'avoid_shift'::public.schedule_preference_type])) AND (shift_type_id IS NOT NULL)))),
    CONSTRAINT schedule_preferences_check1 CHECK (((date IS NOT NULL) OR (day_of_week IS NOT NULL) OR ((start_date IS NOT NULL) AND (end_date IS NOT NULL)))),
    CONSTRAINT schedule_preferences_day_of_week_check CHECK (((day_of_week >= 0) AND (day_of_week <= 6))),
    CONSTRAINT schedule_preferences_priority_check CHECK (((priority >= 1) AND (priority <= 5))),
    CONSTRAINT schedule_preferences_status_check CHECK (((status)::text = ANY (ARRAY[('pending'::character varying)::text, ('approved'::character varying)::text, ('rejected'::character varying)::text])))
);


--
-- Name: shift_premium_calculations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shift_premium_calculations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    period_start date NOT NULL,
    period_end date NOT NULL,
    total_shifts integer DEFAULT 0 NOT NULL,
    normal_shifts_count integer DEFAULT 0 NOT NULL,
    extra_shifts_count integer DEFAULT 0 NOT NULL,
    normal_morning_count integer DEFAULT 0 NOT NULL,
    normal_afternoon_count integer DEFAULT 0 NOT NULL,
    normal_night_count integer DEFAULT 0 NOT NULL,
    normal_long_day_count integer DEFAULT 0 NOT NULL,
    extra_morning_count integer DEFAULT 0 NOT NULL,
    extra_afternoon_count integer DEFAULT 0 NOT NULL,
    extra_night_count integer DEFAULT 0 NOT NULL,
    extra_long_day_count integer DEFAULT 0 NOT NULL,
    normal_shift_premium numeric(10,2) DEFAULT 0.00 NOT NULL,
    extra_shift_premium numeric(10,2) DEFAULT 0.00 NOT NULL,
    total_premium numeric(10,2) DEFAULT 0.00 NOT NULL,
    on_call_shifts_count integer DEFAULT 0 NOT NULL,
    on_call_premium numeric(10,2) DEFAULT 0.00 NOT NULL,
    calculation_date timestamp with time zone DEFAULT now(),
    rule_version_id uuid NOT NULL,
    status public.calculation_status DEFAULT 'draft'::public.calculation_status NOT NULL,
    notes text,
    submitted_at timestamp with time zone,
    submitted_by uuid,
    approved_at timestamp with time zone,
    approved_by uuid,
    paid_at timestamp with time zone,
    paid_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT valid_amounts CHECK (((normal_shift_premium >= (0)::numeric) AND (extra_shift_premium >= (0)::numeric) AND (total_premium >= (0)::numeric))),
    CONSTRAINT valid_counts CHECK (((total_shifts >= normal_shifts_count) AND (total_shifts >= extra_shifts_count))),
    CONSTRAINT valid_extra_breakdown CHECK (((extra_shifts_count >= extra_morning_count) AND (extra_shifts_count >= extra_afternoon_count) AND (extra_shifts_count >= extra_night_count) AND (extra_shifts_count >= extra_long_day_count))),
    CONSTRAINT valid_normal_breakdown CHECK (((normal_shifts_count >= normal_morning_count) AND (normal_shifts_count >= normal_afternoon_count) AND (normal_shifts_count >= normal_night_count) AND (normal_shifts_count >= normal_long_day_count))),
    CONSTRAINT valid_period CHECK ((period_end >= period_start))
);


--
-- Name: shift_premium_details; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shift_premium_details (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    calculation_id uuid NOT NULL,
    assignment_id uuid NOT NULL,
    date date NOT NULL,
    shift_type_id uuid NOT NULL,
    shift_type_name character varying(100) NOT NULL,
    category character varying(20) NOT NULL,
    is_normal boolean NOT NULL,
    premium_amount numeric(10,2) DEFAULT 0 NOT NULL,
    reason character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: shift_premium_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shift_premium_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_profile_id uuid NOT NULL,
    effective_date date NOT NULL,
    expiry_date date,
    normal_shift_quota integer DEFAULT 20 NOT NULL,
    morning_premium numeric(10,2) DEFAULT 0.00,
    afternoon_premium numeric(10,2) DEFAULT 200.00 NOT NULL,
    night_premium numeric(10,2) DEFAULT 250.00 NOT NULL,
    long_day_premium numeric(10,2),
    extra_shift_rate numeric(10,2) DEFAULT 750.00 NOT NULL,
    on_call_rate numeric(10,2),
    count_long_day_as integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    position_id uuid,
    CONSTRAINT valid_date_range CHECK (((expiry_date IS NULL) OR (expiry_date > effective_date))),
    CONSTRAINT valid_extra_rate CHECK ((extra_shift_rate > (0)::numeric)),
    CONSTRAINT valid_long_day_count CHECK (((count_long_day_as IS NULL) OR (count_long_day_as = ANY (ARRAY[1, 2])))),
    CONSTRAINT valid_normal_quota CHECK ((normal_shift_quota > 0)),
    CONSTRAINT valid_premiums CHECK (((morning_premium >= (0)::numeric) AND (afternoon_premium >= (0)::numeric) AND (night_premium >= (0)::numeric)))
);


--
-- Name: shift_swap_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shift_swap_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    requester_id uuid NOT NULL,
    requester_assignment_id uuid NOT NULL,
    target_user_id uuid NOT NULL,
    target_assignment_id uuid,
    status public.shift_swap_status DEFAULT 'pending_colleague'::public.shift_swap_status NOT NULL,
    reason text,
    rejection_reason text,
    colleague_responded_at timestamp with time zone,
    actioned_by uuid,
    actioned_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT shift_swap_requests_check CHECK ((requester_id <> target_user_id))
);


--
-- Name: shift_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shift_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(10) NOT NULL,
    name character varying(50) NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    hours numeric(4,2) NOT NULL,
    color character varying(7) DEFAULT '#22c55e'::character varying,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    category public.shift_type_category DEFAULT 'other'::public.shift_type_category,
    is_overnight boolean DEFAULT false,
    counts_as_work_day boolean DEFAULT true
);


--
-- Name: staff_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staff_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(20) NOT NULL,
    name character varying(100) NOT NULL,
    name_th character varying(100),
    description text,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: staffing_requirements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staffing_requirements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ward_id uuid NOT NULL,
    shift_type_id uuid NOT NULL,
    day_of_week smallint NOT NULL,
    required_staff integer DEFAULT 1 NOT NULL,
    require_in_charge boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    job_profile_id uuid,
    position_id uuid,
    CONSTRAINT staffing_requirements_day_of_week_check CHECK (((day_of_week >= 0) AND (day_of_week <= 6)))
);


--
-- Name: user_ward_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_ward_assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    ward_id uuid NOT NULL,
    is_primary boolean DEFAULT false,
    can_be_in_charge boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    is_roster_member boolean DEFAULT true NOT NULL
);


--
-- Name: user_wards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_wards (
    user_id uuid NOT NULL,
    ward_id uuid NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    employee_code character varying(50),
    phone character varying(20),
    role public.user_role DEFAULT 'staff'::public.user_role NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    job_profile_id uuid,
    line_user_id character varying(50),
    line_display_name character varying(100),
    line_picture_url text,
    line_linked_at timestamp with time zone,
    linking_code character varying(20),
    linking_code_expires_at timestamp with time zone,
    position_id uuid
);


--
-- Name: ward_shift_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ward_shift_types (
    ward_id uuid NOT NULL,
    shift_type_id uuid NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: wards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wards (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(20) NOT NULL,
    name character varying(100) NOT NULL,
    color character varying(7) DEFAULT '#6366f1'::character varying,
    min_staff_per_shift integer DEFAULT 1,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: work_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ward_id uuid,
    rule_type public.work_rule_type NOT NULL,
    rule_name character varying(100) NOT NULL,
    description text,
    parameters_json jsonb DEFAULT '{}'::jsonb NOT NULL,
    is_active boolean DEFAULT true,
    priority integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: _sqlx_migrations _sqlx_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._sqlx_migrations
    ADD CONSTRAINT _sqlx_migrations_pkey PRIMARY KEY (version);


--
-- Name: absence_requests absence_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.absence_requests
    ADD CONSTRAINT absence_requests_pkey PRIMARY KEY (id);


--
-- Name: absence_types absence_types_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.absence_types
    ADD CONSTRAINT absence_types_code_key UNIQUE (code);


--
-- Name: absence_types absence_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.absence_types
    ADD CONSTRAINT absence_types_pkey PRIMARY KEY (id);


--
-- Name: attendance_records attendance_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT attendance_records_pkey PRIMARY KEY (id);


--
-- Name: certifications certifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certifications
    ADD CONSTRAINT certifications_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: education_records education_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.education_records
    ADD CONSTRAINT education_records_pkey PRIMARY KEY (id);


--
-- Name: employee_profiles employee_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_profiles
    ADD CONSTRAINT employee_profiles_pkey PRIMARY KEY (id);


--
-- Name: employee_profiles employee_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_profiles
    ADD CONSTRAINT employee_profiles_user_id_key UNIQUE (user_id);


--
-- Name: employment_status_history employment_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employment_status_history
    ADD CONSTRAINT employment_status_history_pkey PRIMARY KEY (id);


--
-- Name: ethnicities ethnicities_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ethnicities
    ADD CONSTRAINT ethnicities_code_key UNIQUE (code);


--
-- Name: ethnicities ethnicities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ethnicities
    ADD CONSTRAINT ethnicities_pkey PRIMARY KEY (id);


--
-- Name: hospital_settings hospital_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hospital_settings
    ADD CONSTRAINT hospital_settings_pkey PRIMARY KEY (id);


--
-- Name: hospital_settings hospital_settings_singleton_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hospital_settings
    ADD CONSTRAINT hospital_settings_singleton_key UNIQUE (singleton);


--
-- Name: job_profiles job_profiles_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_profiles
    ADD CONSTRAINT job_profiles_code_key UNIQUE (code);


--
-- Name: job_profiles job_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_profiles
    ADD CONSTRAINT job_profiles_pkey PRIMARY KEY (id);


--
-- Name: leave_balances leave_balances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT leave_balances_pkey PRIMARY KEY (id);


--
-- Name: leave_balances leave_balances_user_id_absence_type_id_fiscal_year_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT leave_balances_user_id_absence_type_id_fiscal_year_key UNIQUE (user_id, absence_type_id, fiscal_year);


--
-- Name: leave_entitlement_rules leave_entitlement_rules_absence_type_id_employment_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_entitlement_rules
    ADD CONSTRAINT leave_entitlement_rules_absence_type_id_employment_type_key UNIQUE (absence_type_id, employment_type);


--
-- Name: leave_entitlement_rules leave_entitlement_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_entitlement_rules
    ADD CONSTRAINT leave_entitlement_rules_pkey PRIMARY KEY (id);


--
-- Name: nationalities nationalities_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nationalities
    ADD CONSTRAINT nationalities_code_key UNIQUE (code);


--
-- Name: nationalities nationalities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nationalities
    ADD CONSTRAINT nationalities_pkey PRIMARY KEY (id);


--
-- Name: org_units org_units_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.org_units
    ADD CONSTRAINT org_units_code_key UNIQUE (code);


--
-- Name: org_units org_units_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.org_units
    ADD CONSTRAINT org_units_pkey PRIMARY KEY (id);


--
-- Name: positions positions_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_code_key UNIQUE (code);


--
-- Name: positions positions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_pkey PRIMARY KEY (id);


--
-- Name: professional_licenses professional_licenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_licenses
    ADD CONSTRAINT professional_licenses_pkey PRIMARY KEY (id);


--
-- Name: public_holidays public_holidays_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.public_holidays
    ADD CONSTRAINT public_holidays_pkey PRIMARY KEY (id);


--
-- Name: roster_assignments roster_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roster_assignments
    ADD CONSTRAINT roster_assignments_pkey PRIMARY KEY (id);


--
-- Name: roster_generations roster_generations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roster_generations
    ADD CONSTRAINT roster_generations_pkey PRIMARY KEY (id);


--
-- Name: roster_generations roster_generations_ward_id_year_month_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roster_generations
    ADD CONSTRAINT roster_generations_ward_id_year_month_key UNIQUE (ward_id, year, month);


--
-- Name: schedule_preferences schedule_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_preferences
    ADD CONSTRAINT schedule_preferences_pkey PRIMARY KEY (id);


--
-- Name: shift_premium_calculations shift_premium_calculations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_premium_calculations
    ADD CONSTRAINT shift_premium_calculations_pkey PRIMARY KEY (id);


--
-- Name: shift_premium_calculations shift_premium_calculations_user_id_period_start_period_end_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_premium_calculations
    ADD CONSTRAINT shift_premium_calculations_user_id_period_start_period_end_key UNIQUE (user_id, period_start, period_end);


--
-- Name: shift_premium_details shift_premium_details_calculation_id_assignment_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_premium_details
    ADD CONSTRAINT shift_premium_details_calculation_id_assignment_id_key UNIQUE (calculation_id, assignment_id);


--
-- Name: shift_premium_details shift_premium_details_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_premium_details
    ADD CONSTRAINT shift_premium_details_pkey PRIMARY KEY (id);


--
-- Name: shift_premium_rules shift_premium_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_premium_rules
    ADD CONSTRAINT shift_premium_rules_pkey PRIMARY KEY (id);


--
-- Name: shift_swap_requests shift_swap_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_swap_requests
    ADD CONSTRAINT shift_swap_requests_pkey PRIMARY KEY (id);


--
-- Name: shift_types shift_types_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_types
    ADD CONSTRAINT shift_types_code_key UNIQUE (code);


--
-- Name: shift_types shift_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_types
    ADD CONSTRAINT shift_types_pkey PRIMARY KEY (id);


--
-- Name: staff_types staff_types_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_types
    ADD CONSTRAINT staff_types_code_key UNIQUE (code);


--
-- Name: staff_types staff_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_types
    ADD CONSTRAINT staff_types_pkey PRIMARY KEY (id);


--
-- Name: staffing_requirements staffing_requirements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staffing_requirements
    ADD CONSTRAINT staffing_requirements_pkey PRIMARY KEY (id);


--
-- Name: user_ward_assignments user_ward_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_ward_assignments
    ADD CONSTRAINT user_ward_assignments_pkey PRIMARY KEY (id);


--
-- Name: user_ward_assignments user_ward_assignments_user_id_ward_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_ward_assignments
    ADD CONSTRAINT user_ward_assignments_user_id_ward_id_key UNIQUE (user_id, ward_id);


--
-- Name: user_wards user_wards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_wards
    ADD CONSTRAINT user_wards_pkey PRIMARY KEY (user_id, ward_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_employee_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_employee_code_key UNIQUE (employee_code);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: ward_shift_types ward_shift_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ward_shift_types
    ADD CONSTRAINT ward_shift_types_pkey PRIMARY KEY (ward_id, shift_type_id);


--
-- Name: wards wards_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wards
    ADD CONSTRAINT wards_code_key UNIQUE (code);


--
-- Name: wards wards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wards
    ADD CONSTRAINT wards_pkey PRIMARY KEY (id);


--
-- Name: work_rules work_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_rules
    ADD CONSTRAINT work_rules_pkey PRIMARY KEY (id);


--
-- Name: idx_absence_requests_dates; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_absence_requests_dates ON public.absence_requests USING btree (date_from, date_to);


--
-- Name: idx_absence_requests_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_absence_requests_status ON public.absence_requests USING btree (status);


--
-- Name: idx_absence_requests_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_absence_requests_user_id ON public.absence_requests USING btree (user_id);


--
-- Name: idx_attendance_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_attendance_user_date ON public.attendance_records USING btree (user_id, work_date);


--
-- Name: idx_attendance_work_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_attendance_work_date ON public.attendance_records USING btree (work_date);


--
-- Name: idx_certifications_employee; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_certifications_employee ON public.certifications USING btree (employee_profile_id);


--
-- Name: idx_certifications_expiry; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_certifications_expiry ON public.certifications USING btree (expiry_date) WHERE (expiry_date IS NOT NULL);


--
-- Name: idx_documents_reference; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_reference ON public.documents USING btree (reference_type, reference_id);


--
-- Name: idx_documents_uploaded_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_uploaded_by ON public.documents USING btree (uploaded_by);


--
-- Name: idx_education_employee; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_education_employee ON public.education_records USING btree (employee_profile_id);


--
-- Name: idx_emp_status_history_profile; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_emp_status_history_profile ON public.employment_status_history USING btree (employee_profile_id);


--
-- Name: idx_employee_profiles_ethnicity_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_profiles_ethnicity_id ON public.employee_profiles USING btree (ethnicity_id);


--
-- Name: idx_employee_profiles_government_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_employee_profiles_government_id ON public.employee_profiles USING btree (government_id) WHERE (government_id IS NOT NULL);


--
-- Name: idx_employee_profiles_national_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_employee_profiles_national_id ON public.employee_profiles USING btree (national_id) WHERE (national_id IS NOT NULL);


--
-- Name: idx_employee_profiles_nationality_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_profiles_nationality_id ON public.employee_profiles USING btree (nationality_id);


--
-- Name: idx_employee_profiles_org_unit; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_profiles_org_unit ON public.employee_profiles USING btree (org_unit_id);


--
-- Name: idx_employee_profiles_position; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_profiles_position ON public.employee_profiles USING btree (position_id);


--
-- Name: idx_employee_profiles_staff_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_profiles_staff_type ON public.employee_profiles USING btree (staff_type_id);


--
-- Name: idx_employee_profiles_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_profiles_status ON public.employee_profiles USING btree (employment_status);


--
-- Name: idx_employee_profiles_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_profiles_user ON public.employee_profiles USING btree (user_id);


--
-- Name: idx_ethnicities_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ethnicities_active ON public.ethnicities USING btree (is_active, sort_order);


--
-- Name: idx_job_profiles_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_job_profiles_active ON public.job_profiles USING btree (is_active);


--
-- Name: idx_leave_balances_user_year; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_leave_balances_user_year ON public.leave_balances USING btree (user_id, fiscal_year);


--
-- Name: idx_nationalities_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nationalities_active ON public.nationalities USING btree (is_active, sort_order);


--
-- Name: idx_org_units_parent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_org_units_parent ON public.org_units USING btree (parent_id);


--
-- Name: idx_org_units_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_org_units_type ON public.org_units USING btree (unit_type);


--
-- Name: idx_org_units_ward; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_org_units_ward ON public.org_units USING btree (ward_id);


--
-- Name: idx_positions_job_profile; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_positions_job_profile ON public.positions USING btree (job_profile_id);


--
-- Name: idx_positions_org_unit; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_positions_org_unit ON public.positions USING btree (org_unit_id);


--
-- Name: idx_positions_reports_to; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_positions_reports_to ON public.positions USING btree (reports_to_id);


--
-- Name: idx_premium_calc_rule; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_premium_calc_rule ON public.shift_premium_calculations USING btree (rule_version_id);


--
-- Name: idx_premium_calc_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_premium_calc_status ON public.shift_premium_calculations USING btree (status);


--
-- Name: idx_premium_calc_user_period; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_premium_calc_user_period ON public.shift_premium_calculations USING btree (user_id, period_start, period_end);


--
-- Name: idx_prof_licenses_employee; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_prof_licenses_employee ON public.professional_licenses USING btree (employee_profile_id);


--
-- Name: idx_prof_licenses_expiry; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_prof_licenses_expiry ON public.professional_licenses USING btree (expiry_date) WHERE (expiry_date IS NOT NULL);


--
-- Name: idx_prof_licenses_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_prof_licenses_status ON public.professional_licenses USING btree (status);


--
-- Name: idx_prof_licenses_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_prof_licenses_unique ON public.professional_licenses USING btree (employee_profile_id, license_type, license_number);


--
-- Name: idx_public_holidays_date; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_public_holidays_date ON public.public_holidays USING btree (date);


--
-- Name: idx_public_holidays_date_range; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_public_holidays_date_range ON public.public_holidays USING btree (date);


--
-- Name: idx_public_holidays_year; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_public_holidays_year ON public.public_holidays USING btree (year);


--
-- Name: idx_roster_assignments_absence_request_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_roster_assignments_absence_request_id ON public.roster_assignments USING btree (absence_request_id);


--
-- Name: idx_roster_assignments_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_roster_assignments_date ON public.roster_assignments USING btree (date);


--
-- Name: idx_roster_assignments_generation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_roster_assignments_generation ON public.roster_assignments USING btree (generation_id) WHERE (generation_id IS NOT NULL);


--
-- Name: idx_roster_assignments_locked; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_roster_assignments_locked ON public.roster_assignments USING btree (ward_id, date) WHERE (is_locked = true);


--
-- Name: idx_roster_assignments_source; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_roster_assignments_source ON public.roster_assignments USING btree (source);


--
-- Name: idx_roster_assignments_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_roster_assignments_user_date ON public.roster_assignments USING btree (user_id, date);


--
-- Name: idx_roster_assignments_ward_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_roster_assignments_ward_date ON public.roster_assignments USING btree (ward_id, date);


--
-- Name: idx_roster_generations_period; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_roster_generations_period ON public.roster_generations USING btree (year, month);


--
-- Name: idx_roster_generations_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_roster_generations_status ON public.roster_generations USING btree (status) WHERE (status = ANY (ARRAY['pending'::public.roster_generation_status, 'in_progress'::public.roster_generation_status]));


--
-- Name: idx_roster_generations_ward; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_roster_generations_ward ON public.roster_generations USING btree (ward_id);


--
-- Name: idx_roster_unique_absence; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_roster_unique_absence ON public.roster_assignments USING btree (user_id, ward_id, date, absence_type_id) WHERE (absence_type_id IS NOT NULL);


--
-- Name: idx_roster_unique_shift; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_roster_unique_shift ON public.roster_assignments USING btree (user_id, ward_id, date, shift_type_id) WHERE (shift_type_id IS NOT NULL);


--
-- Name: idx_schedule_preferences_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_schedule_preferences_date ON public.schedule_preferences USING btree (date) WHERE (date IS NOT NULL);


--
-- Name: idx_schedule_preferences_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_schedule_preferences_status ON public.schedule_preferences USING btree (status) WHERE ((status)::text = 'pending'::text);


--
-- Name: idx_schedule_preferences_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_schedule_preferences_user ON public.schedule_preferences USING btree (user_id);


--
-- Name: idx_schedule_preferences_ward; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_schedule_preferences_ward ON public.schedule_preferences USING btree (ward_id) WHERE (ward_id IS NOT NULL);


--
-- Name: idx_shift_premium_details_assignment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shift_premium_details_assignment_id ON public.shift_premium_details USING btree (assignment_id);


--
-- Name: idx_shift_premium_details_calculation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shift_premium_details_calculation_id ON public.shift_premium_details USING btree (calculation_id);


--
-- Name: idx_shift_premium_rules_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shift_premium_rules_active ON public.shift_premium_rules USING btree (job_profile_id) WHERE (expiry_date IS NULL);


--
-- Name: idx_shift_premium_rules_job_profile; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shift_premium_rules_job_profile ON public.shift_premium_rules USING btree (job_profile_id, effective_date);


--
-- Name: idx_shift_premium_rules_position_date; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_shift_premium_rules_position_date ON public.shift_premium_rules USING btree (COALESCE(position_id, job_profile_id), effective_date);


--
-- Name: idx_shift_premium_rules_position_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shift_premium_rules_position_id ON public.shift_premium_rules USING btree (position_id);


--
-- Name: idx_shift_swap_requests_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shift_swap_requests_created ON public.shift_swap_requests USING btree (created_at DESC);


--
-- Name: idx_shift_swap_requests_requester; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shift_swap_requests_requester ON public.shift_swap_requests USING btree (requester_id);


--
-- Name: idx_shift_swap_requests_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shift_swap_requests_status ON public.shift_swap_requests USING btree (status);


--
-- Name: idx_shift_swap_requests_target; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shift_swap_requests_target ON public.shift_swap_requests USING btree (target_user_id);


--
-- Name: idx_shift_types_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shift_types_category ON public.shift_types USING btree (category);


--
-- Name: idx_staff_types_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_staff_types_active ON public.staff_types USING btree (is_active);


--
-- Name: idx_staff_types_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_staff_types_code ON public.staff_types USING btree (code);


--
-- Name: idx_staffing_requirements_position_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_staffing_requirements_position_id ON public.staffing_requirements USING btree (position_id);


--
-- Name: idx_staffing_requirements_ward; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_staffing_requirements_ward ON public.staffing_requirements USING btree (ward_id);


--
-- Name: idx_staffing_requirements_ward_day; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_staffing_requirements_ward_day ON public.staffing_requirements USING btree (ward_id, day_of_week);


--
-- Name: idx_user_ward_assignments_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_ward_assignments_user ON public.user_ward_assignments USING btree (user_id);


--
-- Name: idx_user_ward_assignments_ward; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_ward_assignments_ward ON public.user_ward_assignments USING btree (ward_id);


--
-- Name: idx_user_wards_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_wards_user_id ON public.user_wards USING btree (user_id);


--
-- Name: idx_user_wards_ward_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_wards_ward_id ON public.user_wards USING btree (ward_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_job_profile; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_job_profile ON public.users USING btree (job_profile_id);


--
-- Name: idx_users_line_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_users_line_user_id ON public.users USING btree (line_user_id) WHERE (line_user_id IS NOT NULL);


--
-- Name: idx_users_linking_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_linking_code ON public.users USING btree (linking_code) WHERE (linking_code IS NOT NULL);


--
-- Name: idx_users_position_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_position_id ON public.users USING btree (position_id);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: idx_ward_shift_types_ward; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ward_shift_types_ward ON public.ward_shift_types USING btree (ward_id);


--
-- Name: idx_work_rules_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_rules_type ON public.work_rules USING btree (rule_type);


--
-- Name: idx_work_rules_ward; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_rules_ward ON public.work_rules USING btree (ward_id) WHERE (ward_id IS NOT NULL);


--
-- Name: staffing_requirements_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX staffing_requirements_unique ON public.staffing_requirements USING btree (ward_id, shift_type_id, day_of_week, position_id) NULLS NOT DISTINCT;


--
-- Name: absence_requests absence_requests_absence_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.absence_requests
    ADD CONSTRAINT absence_requests_absence_type_id_fkey FOREIGN KEY (absence_type_id) REFERENCES public.absence_types(id) ON DELETE RESTRICT;


--
-- Name: absence_requests absence_requests_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.absence_requests
    ADD CONSTRAINT absence_requests_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: absence_requests absence_requests_medical_certificate_doc_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.absence_requests
    ADD CONSTRAINT absence_requests_medical_certificate_doc_id_fkey FOREIGN KEY (medical_certificate_doc_id) REFERENCES public.documents(id);


--
-- Name: absence_requests absence_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.absence_requests
    ADD CONSTRAINT absence_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: attendance_records attendance_records_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT attendance_records_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: certifications certifications_employee_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certifications
    ADD CONSTRAINT certifications_employee_profile_id_fkey FOREIGN KEY (employee_profile_id) REFERENCES public.employee_profiles(id) ON DELETE CASCADE;


--
-- Name: documents documents_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: education_records education_records_employee_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.education_records
    ADD CONSTRAINT education_records_employee_profile_id_fkey FOREIGN KEY (employee_profile_id) REFERENCES public.employee_profiles(id) ON DELETE CASCADE;


--
-- Name: employee_profiles employee_profiles_ethnicity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_profiles
    ADD CONSTRAINT employee_profiles_ethnicity_id_fkey FOREIGN KEY (ethnicity_id) REFERENCES public.ethnicities(id);


--
-- Name: employee_profiles employee_profiles_nationality_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_profiles
    ADD CONSTRAINT employee_profiles_nationality_id_fkey FOREIGN KEY (nationality_id) REFERENCES public.nationalities(id);


--
-- Name: employee_profiles employee_profiles_org_unit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_profiles
    ADD CONSTRAINT employee_profiles_org_unit_id_fkey FOREIGN KEY (org_unit_id) REFERENCES public.org_units(id);


--
-- Name: employee_profiles employee_profiles_position_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_profiles
    ADD CONSTRAINT employee_profiles_position_id_fkey FOREIGN KEY (position_id) REFERENCES public.positions(id);


--
-- Name: employee_profiles employee_profiles_staff_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_profiles
    ADD CONSTRAINT employee_profiles_staff_type_id_fkey FOREIGN KEY (staff_type_id) REFERENCES public.staff_types(id);


--
-- Name: employee_profiles employee_profiles_supervisor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_profiles
    ADD CONSTRAINT employee_profiles_supervisor_id_fkey FOREIGN KEY (supervisor_id) REFERENCES public.users(id);


--
-- Name: employee_profiles employee_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_profiles
    ADD CONSTRAINT employee_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: employment_status_history employment_status_history_employee_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employment_status_history
    ADD CONSTRAINT employment_status_history_employee_profile_id_fkey FOREIGN KEY (employee_profile_id) REFERENCES public.employee_profiles(id);


--
-- Name: leave_balances leave_balances_absence_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT leave_balances_absence_type_id_fkey FOREIGN KEY (absence_type_id) REFERENCES public.absence_types(id) ON DELETE CASCADE;


--
-- Name: leave_balances leave_balances_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT leave_balances_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: leave_entitlement_rules leave_entitlement_rules_absence_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_entitlement_rules
    ADD CONSTRAINT leave_entitlement_rules_absence_type_id_fkey FOREIGN KEY (absence_type_id) REFERENCES public.absence_types(id) ON DELETE CASCADE;


--
-- Name: org_units org_units_head_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.org_units
    ADD CONSTRAINT org_units_head_user_id_fkey FOREIGN KEY (head_user_id) REFERENCES public.users(id);


--
-- Name: org_units org_units_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.org_units
    ADD CONSTRAINT org_units_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.org_units(id);


--
-- Name: org_units org_units_ward_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.org_units
    ADD CONSTRAINT org_units_ward_id_fkey FOREIGN KEY (ward_id) REFERENCES public.wards(id);


--
-- Name: positions positions_job_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_job_profile_id_fkey FOREIGN KEY (job_profile_id) REFERENCES public.job_profiles(id);


--
-- Name: positions positions_org_unit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_org_unit_id_fkey FOREIGN KEY (org_unit_id) REFERENCES public.org_units(id);


--
-- Name: positions positions_reports_to_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_reports_to_id_fkey FOREIGN KEY (reports_to_id) REFERENCES public.positions(id);


--
-- Name: professional_licenses professional_licenses_employee_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_licenses
    ADD CONSTRAINT professional_licenses_employee_profile_id_fkey FOREIGN KEY (employee_profile_id) REFERENCES public.employee_profiles(id) ON DELETE CASCADE;


--
-- Name: roster_assignments roster_assignments_absence_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roster_assignments
    ADD CONSTRAINT roster_assignments_absence_request_id_fkey FOREIGN KEY (absence_request_id) REFERENCES public.absence_requests(id) ON DELETE SET NULL;


--
-- Name: roster_assignments roster_assignments_absence_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roster_assignments
    ADD CONSTRAINT roster_assignments_absence_type_id_fkey FOREIGN KEY (absence_type_id) REFERENCES public.absence_types(id) ON DELETE SET NULL;


--
-- Name: roster_assignments roster_assignments_generation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roster_assignments
    ADD CONSTRAINT roster_assignments_generation_id_fkey FOREIGN KEY (generation_id) REFERENCES public.roster_generations(id) ON DELETE SET NULL;


--
-- Name: roster_assignments roster_assignments_preference_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roster_assignments
    ADD CONSTRAINT roster_assignments_preference_id_fkey FOREIGN KEY (preference_id) REFERENCES public.schedule_preferences(id) ON DELETE SET NULL;


--
-- Name: roster_assignments roster_assignments_shift_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roster_assignments
    ADD CONSTRAINT roster_assignments_shift_type_id_fkey FOREIGN KEY (shift_type_id) REFERENCES public.shift_types(id) ON DELETE SET NULL;


--
-- Name: roster_assignments roster_assignments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roster_assignments
    ADD CONSTRAINT roster_assignments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: roster_assignments roster_assignments_ward_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roster_assignments
    ADD CONSTRAINT roster_assignments_ward_id_fkey FOREIGN KEY (ward_id) REFERENCES public.wards(id) ON DELETE CASCADE;


--
-- Name: roster_generations roster_generations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roster_generations
    ADD CONSTRAINT roster_generations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: roster_generations roster_generations_ward_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roster_generations
    ADD CONSTRAINT roster_generations_ward_id_fkey FOREIGN KEY (ward_id) REFERENCES public.wards(id) ON DELETE CASCADE;


--
-- Name: schedule_preferences schedule_preferences_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_preferences
    ADD CONSTRAINT schedule_preferences_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: schedule_preferences schedule_preferences_shift_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_preferences
    ADD CONSTRAINT schedule_preferences_shift_type_id_fkey FOREIGN KEY (shift_type_id) REFERENCES public.shift_types(id) ON DELETE CASCADE;


--
-- Name: schedule_preferences schedule_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_preferences
    ADD CONSTRAINT schedule_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: schedule_preferences schedule_preferences_ward_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_preferences
    ADD CONSTRAINT schedule_preferences_ward_id_fkey FOREIGN KEY (ward_id) REFERENCES public.wards(id) ON DELETE CASCADE;


--
-- Name: shift_premium_calculations shift_premium_calculations_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_premium_calculations
    ADD CONSTRAINT shift_premium_calculations_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: shift_premium_calculations shift_premium_calculations_paid_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_premium_calculations
    ADD CONSTRAINT shift_premium_calculations_paid_by_fkey FOREIGN KEY (paid_by) REFERENCES public.users(id);


--
-- Name: shift_premium_calculations shift_premium_calculations_rule_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_premium_calculations
    ADD CONSTRAINT shift_premium_calculations_rule_version_id_fkey FOREIGN KEY (rule_version_id) REFERENCES public.shift_premium_rules(id) ON DELETE CASCADE;


--
-- Name: shift_premium_calculations shift_premium_calculations_submitted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_premium_calculations
    ADD CONSTRAINT shift_premium_calculations_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES public.users(id);


--
-- Name: shift_premium_calculations shift_premium_calculations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_premium_calculations
    ADD CONSTRAINT shift_premium_calculations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: shift_premium_details shift_premium_details_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_premium_details
    ADD CONSTRAINT shift_premium_details_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.roster_assignments(id) ON DELETE CASCADE;


--
-- Name: shift_premium_details shift_premium_details_calculation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_premium_details
    ADD CONSTRAINT shift_premium_details_calculation_id_fkey FOREIGN KEY (calculation_id) REFERENCES public.shift_premium_calculations(id) ON DELETE CASCADE;


--
-- Name: shift_premium_details shift_premium_details_shift_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_premium_details
    ADD CONSTRAINT shift_premium_details_shift_type_id_fkey FOREIGN KEY (shift_type_id) REFERENCES public.shift_types(id);


--
-- Name: shift_premium_rules shift_premium_rules_position_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_premium_rules
    ADD CONSTRAINT shift_premium_rules_position_id_fkey FOREIGN KEY (position_id) REFERENCES public.positions(id);


--
-- Name: shift_swap_requests shift_swap_requests_actioned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_swap_requests
    ADD CONSTRAINT shift_swap_requests_actioned_by_fkey FOREIGN KEY (actioned_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: shift_swap_requests shift_swap_requests_requester_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_swap_requests
    ADD CONSTRAINT shift_swap_requests_requester_assignment_id_fkey FOREIGN KEY (requester_assignment_id) REFERENCES public.roster_assignments(id) ON DELETE CASCADE;


--
-- Name: shift_swap_requests shift_swap_requests_requester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_swap_requests
    ADD CONSTRAINT shift_swap_requests_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: shift_swap_requests shift_swap_requests_target_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_swap_requests
    ADD CONSTRAINT shift_swap_requests_target_assignment_id_fkey FOREIGN KEY (target_assignment_id) REFERENCES public.roster_assignments(id) ON DELETE SET NULL;


--
-- Name: shift_swap_requests shift_swap_requests_target_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_swap_requests
    ADD CONSTRAINT shift_swap_requests_target_user_id_fkey FOREIGN KEY (target_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: staffing_requirements staffing_requirements_job_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staffing_requirements
    ADD CONSTRAINT staffing_requirements_job_profile_id_fkey FOREIGN KEY (job_profile_id) REFERENCES public.job_profiles(id) ON DELETE SET NULL;


--
-- Name: staffing_requirements staffing_requirements_position_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staffing_requirements
    ADD CONSTRAINT staffing_requirements_position_id_fkey FOREIGN KEY (position_id) REFERENCES public.positions(id);


--
-- Name: staffing_requirements staffing_requirements_shift_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staffing_requirements
    ADD CONSTRAINT staffing_requirements_shift_type_id_fkey FOREIGN KEY (shift_type_id) REFERENCES public.shift_types(id) ON DELETE CASCADE;


--
-- Name: staffing_requirements staffing_requirements_ward_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staffing_requirements
    ADD CONSTRAINT staffing_requirements_ward_id_fkey FOREIGN KEY (ward_id) REFERENCES public.wards(id) ON DELETE CASCADE;


--
-- Name: user_ward_assignments user_ward_assignments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_ward_assignments
    ADD CONSTRAINT user_ward_assignments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_ward_assignments user_ward_assignments_ward_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_ward_assignments
    ADD CONSTRAINT user_ward_assignments_ward_id_fkey FOREIGN KEY (ward_id) REFERENCES public.wards(id) ON DELETE CASCADE;


--
-- Name: user_wards user_wards_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_wards
    ADD CONSTRAINT user_wards_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_wards user_wards_ward_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_wards
    ADD CONSTRAINT user_wards_ward_id_fkey FOREIGN KEY (ward_id) REFERENCES public.wards(id) ON DELETE CASCADE;


--
-- Name: users users_job_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_job_profile_id_fkey FOREIGN KEY (job_profile_id) REFERENCES public.job_profiles(id);


--
-- Name: users users_position_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_position_id_fkey FOREIGN KEY (position_id) REFERENCES public.positions(id);


--
-- Name: ward_shift_types ward_shift_types_shift_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ward_shift_types
    ADD CONSTRAINT ward_shift_types_shift_type_id_fkey FOREIGN KEY (shift_type_id) REFERENCES public.shift_types(id) ON DELETE CASCADE;


--
-- Name: ward_shift_types ward_shift_types_ward_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ward_shift_types
    ADD CONSTRAINT ward_shift_types_ward_id_fkey FOREIGN KEY (ward_id) REFERENCES public.wards(id) ON DELETE CASCADE;


--
-- Name: work_rules work_rules_ward_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_rules
    ADD CONSTRAINT work_rules_ward_id_fkey FOREIGN KEY (ward_id) REFERENCES public.wards(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

