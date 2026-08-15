-- ============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER trg_update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_needs_updated_at
BEFORE UPDATE ON public.needs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_aid_offers_updated_at
BEFORE UPDATE ON public.aid_offers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_aid_assignments_updated_at
BEFORE UPDATE ON public.aid_assignments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_collection_centers_updated_at
BEFORE UPDATE ON public.collection_centers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRIGGER FOR AUTOMATIC NOTIFICATION ON NEED CREATION
-- ============================================
CREATE OR REPLACE FUNCTION notify_on_need_creation()
RETURNS TRIGGER AS $$
DECLARE
    admin_id UUID;
    org_ids UUID[];
BEGIN
    -- Get admin users
    SELECT ARRAY(SELECT id FROM public.users WHERE role = 'admin') INTO org_ids;
    
    -- Insert notifications for admins
    IF array_length(org_ids, 1) > 0 THEN
        INSERT INTO public.notifications (user_id, title, message, type, link)
        SELECT 
            unnest(org_ids),
            'Nueva necesidad reportada',
            'Se ha reportado una nueva necesidad: ' || NEW.product,
            'info',
            '/necesidades/' || NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notify_on_need_creation
AFTER INSERT ON public.needs
FOR EACH ROW
EXECUTE FUNCTION notify_on_need_creation();

-- ============================================
-- TRIGGER FOR AUTOMATIC NOTIFICATION ON AID OFFER
-- ============================================
CREATE OR REPLACE FUNCTION notify_on_aid_offer()
RETURNS TRIGGER AS $$
DECLARE
    need_reporter_id UUID;
BEGIN
    -- Get the reporter of the need
    IF NEW.need_id IS NOT NULL THEN
        SELECT reporter_id INTO need_reporter_id 
        FROM public.needs 
        WHERE id = NEW.need_id;
        
        IF need_reporter_id IS NOT NULL THEN
            -- Notify the person who reported the need
            INSERT INTO public.notifications (user_id, title, message, type, link)
            VALUES (
                need_reporter_id,
                'Nueva ayuda ofrecida',
                'Alguien ha ofrecido ayuda para tu necesidad: ' || NEW.product,
                'success',
                '/ayudas/' || NEW.id
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notify_on_aid_offer
AFTER INSERT ON public.aid_offers
FOR EACH ROW
EXECUTE FUNCTION notify_on_aid_offer();

-- ============================================
-- TRIGGER FOR AUTOMATIC STATUS HISTORY
-- ============================================
CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.status_history (
            need_id,
            user_id,
            action,
            previous_status,
            new_status,
            notes,
            created_at
        ) VALUES (
            NEW.id,
            auth.uid(),
            'Status changed',
            OLD.status,
            NEW.status,
            'Status updated from ' || OLD.status || ' to ' || NEW.status,
            NOW()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_need_status_change
BEFORE UPDATE OF status ON public.needs
FOR EACH ROW
EXECUTE FUNCTION log_status_change();

-- ============================================
-- TRIGGER FOR QUANTITY CHANGE HISTORY
-- ============================================
CREATE OR REPLACE FUNCTION log_quantity_change()
RETURNS TRIGGER AS $$
DECLARE
    quantity_diff INTEGER;
BEGIN
    quantity_diff := NEW.quantity_received - OLD.quantity_received;
    
    IF quantity_diff <> 0 THEN
        INSERT INTO public.status_history (
            need_id,
            user_id,
            action,
            notes,
            quantity_change,
            created_at
        ) VALUES (
            NEW.id,
            auth.uid(),
            'Quantity updated',
            'Received quantity changed by ' || quantity_diff || ' ' || NEW.unit,
            quantity_diff,
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_need_quantity_change
BEFORE UPDATE OF quantity_received ON public.needs
FOR EACH ROW
EXECUTE FUNCTION log_quantity_change();