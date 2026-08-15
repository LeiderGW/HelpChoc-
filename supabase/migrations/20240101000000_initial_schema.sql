-- Enable extensions

CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'visitor' CHECK (role IN ('admin', 'organization', 'volunteer', 'visitor')),
    organization_id UUID,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ORGANIZATIONS TABLE
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    email TEXT,
    phone TEXT,
    website TEXT,
    logo_url TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- DEPARTMENTS TABLE
-- ============================================
CREATE TABLE public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    code TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- MUNICIPALITIES TABLE
-- ============================================
CREATE TABLE public.municipalities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(department_id, name)
);

-- ============================================
-- LOCATIONS TABLE
-- ============================================
CREATE TABLE public.locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES public.municipalities(id) ON DELETE CASCADE,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    place_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- NEEDS TABLE
-- ============================================
CREATE TABLE public.needs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL CHECK (category IN (
        'water', 'food', 'medicines', 'first_aid', 'clothing',
        'mattresses', 'hygiene', 'cleaning', 'housing',
        'tools', 'transport', 'energy', 'communications', 'other'
    )),
    product TEXT NOT NULL,
    description TEXT,
    quantity_needed INTEGER NOT NULL CHECK (quantity_needed > 0),
    quantity_received INTEGER DEFAULT 0 CHECK (quantity_received >= 0),
    unit TEXT NOT NULL,
    location_id UUID REFERENCES public.locations(id),
    municipality_id UUID REFERENCES public.municipalities(id),
    department_id UUID REFERENCES public.departments(id),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low', 'covered')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'insufficient_info', 'fulfilled')),
    reporter_id UUID REFERENCES public.users(id),
    affected_people INTEGER,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'insufficient_info')),
    verified_by UUID REFERENCES public.users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- AID OFFERS TABLE
-- ============================================
CREATE TABLE public.aid_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    need_id UUID REFERENCES public.needs(id),
    organization_id UUID REFERENCES public.organizations(id),
    user_id UUID REFERENCES public.users(id),
    product TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit TEXT NOT NULL,
    location_id UUID REFERENCES public.locations(id),
    availability_date TIMESTAMP WITH TIME ZONE,
    estimated_delivery_date TIMESTAMP WITH TIME ZONE,
    contact_info TEXT,
    notes TEXT,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'in_transit', 'delivered', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- AID ASSIGNMENTS TABLE
-- ============================================
CREATE TABLE public.aid_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    need_id UUID REFERENCES public.needs(id) ON DELETE CASCADE,
    offer_id UUID REFERENCES public.aid_offers(id) ON DELETE CASCADE,
    quantity_assigned INTEGER NOT NULL CHECK (quantity_assigned > 0),
    status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_transit', 'delivered', 'received', 'cancelled')),
    assigned_by UUID REFERENCES public.users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    received_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- COLLECTION CENTERS TABLE
-- ============================================
CREATE TABLE public.collection_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('collection', 'delivery', 'shelter', 'medical', 'other')),
    address TEXT NOT NULL,
    municipality_id UUID REFERENCES public.municipalities(id) ON DELETE CASCADE,
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    schedule TEXT,
    responsible_person TEXT,
    contact_phone TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'temporary')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- VERIFICATION RECORDS TABLE
-- ============================================
CREATE TABLE public.verification_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    need_id UUID REFERENCES public.needs(id) ON DELETE CASCADE,
    verified_by UUID REFERENCES public.users(id),
    status TEXT NOT NULL CHECK (status IN ('verified', 'rejected', 'insufficient_info')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STATUS HISTORY TABLE
-- ============================================
CREATE TABLE public.status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    need_id UUID REFERENCES public.needs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id),
    action TEXT NOT NULL,
    previous_status TEXT,
    new_status TEXT,
    quantity_change INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error')),
    read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
-- Needs indexes
CREATE INDEX idx_needs_category ON public.needs(category);
CREATE INDEX idx_needs_priority ON public.needs(priority);
CREATE INDEX idx_needs_status ON public.needs(status);
CREATE INDEX idx_needs_verification ON public.needs(verification_status);
CREATE INDEX idx_needs_location ON public.needs(location_id);
CREATE INDEX idx_needs_municipality ON public.needs(municipality_id);
CREATE INDEX idx_needs_department ON public.needs(department_id);
CREATE INDEX idx_needs_reporter ON public.needs(reporter_id);
CREATE INDEX idx_needs_created_at ON public.needs(created_at);

-- Aid offers indexes
CREATE INDEX idx_aid_offers_status ON public.aid_offers(status);
CREATE INDEX idx_aid_offers_need ON public.aid_offers(need_id);
CREATE INDEX idx_aid_offers_user ON public.aid_offers(user_id);
CREATE INDEX idx_aid_offers_organization ON public.aid_offers(organization_id);

-- Aid assignments indexes
CREATE INDEX idx_aid_assignments_need ON public.aid_assignments(need_id);
CREATE INDEX idx_aid_assignments_offer ON public.aid_assignments(offer_id);

-- Collection centers indexes
CREATE INDEX idx_collection_centers_status ON public.collection_centers(status);
CREATE INDEX idx_collection_centers_municipality ON public.collection_centers(municipality_id);
CREATE INDEX idx_collection_centers_department ON public.collection_centers(department_id);

-- Status history indexes
CREATE INDEX idx_status_history_need ON public.status_history(need_id);
CREATE INDEX idx_status_history_user ON public.status_history(user_id);

-- Notifications indexes
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);

-- Users indexes
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_organization ON public.users(organization_id);

-- Locations indexes
CREATE INDEX idx_locations_municipality ON public.locations(municipality_id);