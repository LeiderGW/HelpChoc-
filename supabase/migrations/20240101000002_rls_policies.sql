-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.municipalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.needs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aid_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aid_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS POLICIES
-- ============================================
-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    ));

-- Admins can update any user
CREATE POLICY "Admins can update any user" ON public.users
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    ));

-- ============================================
-- ORGANIZATIONS POLICIES
-- ============================================
-- Anyone can view organizations
CREATE POLICY "Anyone can view organizations" ON public.organizations
    FOR SELECT USING (true);

-- Authenticated users can create organizations
CREATE POLICY "Authenticated users can create organizations" ON public.organizations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can update their own organization
CREATE POLICY "Users can update their organization" ON public.organizations
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND organization_id = organizations.id
    ));

-- Admins can update any organization
CREATE POLICY "Admins can update any organization" ON public.organizations
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    ));

-- ============================================
-- NEEDS POLICIES
-- ============================================
-- Anyone can view needs
CREATE POLICY "Anyone can view needs" ON public.needs
    FOR SELECT USING (true);

-- Authenticated users can create needs
CREATE POLICY "Authenticated users can create needs" ON public.needs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can update their own needs
CREATE POLICY "Users can update their own needs" ON public.needs
    FOR UPDATE USING (auth.uid() = reporter_id);

-- Admins can update any need
CREATE POLICY "Admins can update any need" ON public.needs
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    ));

-- Organizations can update needs in their area
CREATE POLICY "Organizations can update needs" ON public.needs
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role = 'organization'
    ));

-- ============================================
-- AID OFFERS POLICIES
-- ============================================
-- Anyone can view aid offers
CREATE POLICY "Anyone can view aid offers" ON public.aid_offers
    FOR SELECT USING (true);

-- Authenticated users can create aid offers
CREATE POLICY "Authenticated users can create aid offers" ON public.aid_offers
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can update their own aid offers
CREATE POLICY "Users can update their own aid offers" ON public.aid_offers
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can update any aid offer
CREATE POLICY "Admins can update any aid offer" ON public.aid_offers
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    ));

-- ============================================
-- COLLECTION CENTERS POLICIES
-- ============================================
-- Anyone can view collection centers
CREATE POLICY "Anyone can view collection centers" ON public.collection_centers
    FOR SELECT USING (true);

-- Admins and organizations can create centers
CREATE POLICY "Admins and organizations can create centers" ON public.collection_centers
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'organization')
    ));

-- Admins can update any center
CREATE POLICY "Admins can update any center" ON public.collection_centers
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    ));

-- Organizations can update centers
CREATE POLICY "Organizations can update centers" ON public.collection_centers
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role = 'organization'
    ));

-- ============================================
-- AID ASSIGNMENTS POLICIES
-- ============================================
-- Anyone can view assignments
CREATE POLICY "Anyone can view assignments" ON public.aid_assignments
    FOR SELECT USING (true);

-- Authenticated users can create assignments
CREATE POLICY "Authenticated users can create assignments" ON public.aid_assignments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can update their own assignments
CREATE POLICY "Users can update their own assignments"
ON public.aid_assignments
FOR UPDATE
USING (
    assigned_by = auth.uid()
);




-- Admins can update any assignment
CREATE POLICY "Admins can update any assignment" ON public.aid_assignments
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    ));

-- ============================================
-- VERIFICATION RECORDS POLICIES
-- ============================================
-- Anyone can view verification records
CREATE POLICY "Anyone can view verification records" ON public.verification_records
    FOR SELECT USING (true);

-- Admins can create verification records
CREATE POLICY "Admins can create verification records" ON public.verification_records
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    ));

-- Admins can update verification records
CREATE POLICY "Admins can update verification records" ON public.verification_records
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    ));

-- ============================================
-- STATUS HISTORY POLICIES
-- ============================================
-- Anyone can view status history
CREATE POLICY "Anyone can view status history" ON public.status_history
    FOR SELECT USING (true);

-- Authenticated users can create status history
CREATE POLICY "Authenticated users can create status history" ON public.status_history
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================
-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications
CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications" ON public.notifications
    FOR DELETE USING (auth.uid() = user_id);

-- Admins can view all notifications
CREATE POLICY "Admins can view all notifications" ON public.notifications
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    ));

-- ============================================
-- LOCATIONS POLICIES
-- ============================================
-- Anyone can view locations
CREATE POLICY "Anyone can view locations" ON public.locations
    FOR SELECT USING (true);

-- Authenticated users can create locations
CREATE POLICY "Authenticated users can create locations" ON public.locations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Admins can update locations
CREATE POLICY "Admins can update locations" ON public.locations
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    ));

-- ============================================
-- FUNCTIONS
-- ============================================
-- Function to update need priority automatically
CREATE OR REPLACE FUNCTION update_need_priority()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate priority based on coverage and other factors
    IF NEW.quantity_received >= NEW.quantity_needed THEN
        NEW.priority := 'covered';
    ELSIF NEW.quantity_received < NEW.quantity_needed * 0.2 THEN
        NEW.priority := 'critical';
    ELSIF NEW.quantity_received < NEW.quantity_needed * 0.4 THEN
        NEW.priority := 'high';
    ELSIF NEW.quantity_received < NEW.quantity_needed * 0.6 THEN
        NEW.priority := 'medium';
    ELSE
        NEW.priority := 'low';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update priority on insert/update
CREATE TRIGGER trg_update_need_priority
BEFORE INSERT OR UPDATE OF quantity_needed, quantity_received ON public.needs
FOR EACH ROW
EXECUTE FUNCTION update_need_priority();

-- Function to update need status
CREATE OR REPLACE FUNCTION update_need_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.quantity_received >= NEW.quantity_needed THEN
        NEW.status := 'fulfilled';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update status on insert/update
CREATE TRIGGER trg_update_need_status
BEFORE INSERT OR UPDATE OF quantity_needed, quantity_received ON public.needs
FOR EACH ROW
EXECUTE FUNCTION update_need_status();