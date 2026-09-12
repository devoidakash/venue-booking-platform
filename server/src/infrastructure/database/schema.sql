CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email CITEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO admins (email, password_hash)
VALUES (
  'akashpatel522004@gmail.com',
  '$argon2id$v=19$m=65536,t=3,p=4$wQABii2YaeRJe+/LR0S0Vg$l1cbtWWhPVsdfoQuwU0M+1WC2UbuG1uL5FMo2Q5641E'
)
ON CONFLICT (email) DO NOTHING;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email CITEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_status_check CHECK (status IN ('active', 'banned')),
  CONSTRAINT users_role_check CHECK (role IN ('customer', 'vendor'))
);

CREATE TABLE IF NOT EXISTS user_auth_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  auth_provider TEXT NOT NULL CHECK (auth_provider IN ('otp', 'google')),
  provider_identifier TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (auth_provider, provider_identifier)
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vendor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  vendor_name TEXT NOT NULL,
  is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
  suspension_reason TEXT,
  phone TEXT,
  district TEXT,
  state TEXT,
  approved_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT vendor_suspension_reason_check CHECK (
    is_suspended = FALSE OR suspension_reason IS NOT NULL
  )
);

CREATE TABLE IF NOT EXISTS vendor_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  pan_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  pincode TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  pan_number TEXT NOT NULL,
  pan_document_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES admins (id),
  CONSTRAINT vendor_status_check CHECK (status IN ('pending', 'approved', 'rejected')),
  CONSTRAINT vendor_rejection_reason_check CHECK (
    status != 'rejected' OR rejection_reason IS NOT NULL
  ),
  CONSTRAINT pan_format_check CHECK (pan_number ~ '^[A-Z]{5}[0-9]{4}[A-Z]$')
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_pending_application
  ON vendor_applications (user_id)
  WHERE status IN ('pending', 'approved');

CREATE INDEX IF NOT EXISTS idx_vendor_status
  ON vendor_applications (status);


CREATE TYPE venue_category AS ENUM('waterpark', 'amusement_park', 'turf', 'playzone');

CREATE TYPE application_status AS ENUM('pending', 'approved', 'rejected');

CREATE EXTENSION postgis WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS venue_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendor_profiles (id) ON DELETE CASCADE,
  venue_group_id UUID not null DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  venue_details TEXT NOT NULL,
  category venue_category NOT NULL,
  address TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode VARCHAR(6) NOT NULL,
  geo_loc GEOGRAPHY(Point, 4326) NOT NULL,
  images text[] NOT NULL CHECK (array_length(images, 1) = 5),
  proof_document_key TEXT NOT NULL,
  status application_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES admins (id),
  CONSTRAINT check_pincode CHECK (pincode ~ '^[0-9]{6}$'),
  CONSTRAINT venue_rejection_reason_check CHECK (
    (
      status = 'rejected'
      AND rejection_reason IS NOT NULL
    )
    OR (
      status <> 'rejected'
      AND rejection_reason IS NULL
    )
  )
);

CREATE TYPE booking_types AS ENUM('whole_day', 'time_slot');

CREATE TYPE venue_status AS ENUM('live', 'suspended', 'draft');

CREATE TABLE IF NOT EXISTS venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendor_profiles (id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES venue_applications (id),
  name TEXT NOT NULL,
  description TEXT,
  category venue_category NOT NULL,
  address TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode VARCHAR(6) NOT NULL,
  geo_loc GEOGRAPHY(Point, 4326) NOT NULL,
  has_cover_image BOOLEAN NOT NULL DEFAULT FALSE,
  images TEXT[] NOT NULL DEFAULT '{}' CHECK (cardinality(images) <= 10),
  booking_type booking_types,
  opening_time TIME,
  closing_time TIME,
  status venue_status NOT NULL DEFAULT 'draft',
  suspension_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT check_pincode CHECK (pincode ~ '^[0-9]{6}$'),
  CONSTRAINT unique_venue_application UNIQUE (application_id),
  CONSTRAINT venue_hours_check CHECK (
  (opening_time IS NULL AND closing_time IS NULL)
  OR
  (
    opening_time IS NOT NULL
    AND closing_time IS NOT NULL
    AND opening_time < closing_time
  )
  ),
  CONSTRAINT venue_suspension_check CHECK (
    (
      status = 'suspended'
      AND suspension_reason IS NOT NULL
    )
    OR (
      status <> 'suspended'
      AND suspension_reason IS NULL
    )
  )
);

create table if not exists venue_pricing (
  id UUID primary key default gen_random_uuid (),
  venue_id UUID not null references venues (id) on delete CASCADE,
  day_type TEXT not null check (day_type in ('weekday', 'weekend')),
  duration_minutes INTEGER,
  price INTEGER not null check (price >= 0),
  created_at TIMESTAMPTZ not null default NOW(),
  updated_at TIMESTAMPTZ not null default NOW(),
  constraint valid_duration check (
    duration_minutes is null
    or duration_minutes = 60
  ),
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_venue_pricing ON venue_pricing (
  venue_id,
  day_type,
  COALESCE(duration_minutes, 0)
);

CREATE TABLE IF NOT EXISTS venue_reverifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category venue_category NOT NULL,
  address TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode VARCHAR(6) NOT NULL,
  geo_loc GEOGRAPHY(point, 4326) NOT NULL,
  status application_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES admins (id),
  CONSTRAINT check_pincode CHECK (pincode ~ '^[0-9]{6}$'),
  CHECK (
    (
      status = 'rejected'
      AND rejection_reason IS NOT NULL
    )
    OR (
      status <> 'rejected'
      AND rejection_reason IS NULL
    )
  )
);
CREATE UNIQUE INDEX unique_pending_venue_reverification
ON venue_reverifications (venue_id)
WHERE status = 'pending';


CREATE TYPE booking_status AS ENUM (
  'pending_payment',
  'confirmed',
  'payment_failed',
  'cancelled',
  'expired'
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  venue_id UUID NOT NULL REFERENCES venues(id),
  booking_date DATE NOT NULL,
  booking_type booking_types NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  start_time TIME,
  end_time TIME,
  total_amount INTEGER NOT NULL CHECK (total_amount >= 0),
  status booking_status NOT NULL DEFAULT 'pending_payment',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_booking_time
    CHECK (
      (
        booking_type = 'whole_day'
        AND start_time IS NULL
        AND end_time IS NULL
      )
      OR
      (
        booking_type = 'time_slot'
        AND start_time IS NOT NULL
        AND end_time IS NOT NULL
        AND end_time > start_time
      )
    )
);

CREATE TYPE payment_status AS ENUM (
  'pending',
  'paid',
  'failed'
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  gateway TEXT NOT NULL,
  gateway_order_id TEXT NOT NULL UNIQUE,
  gateway_payment_id TEXT UNIQUE,
  amount INTEGER NOT NULL CHECK (amount >= 0),
  status payment_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);