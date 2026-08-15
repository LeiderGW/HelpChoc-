-- ============================================
-- ADDITIONAL FUNCTIONS
-- ============================================

-- Function to get needs statistics
CREATE OR REPLACE FUNCTION get_needs_statistics()
RETURNS TABLE(
    total_needs BIGINT,
    critical_needs BIGINT,
    high_needs BIGINT,
    medium_needs BIGINT,
    low_needs BIGINT,
    covered_needs BIGINT,
    pending_needs BIGINT,
    verified_needs BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) AS total_needs,
        COUNT(*) FILTER (WHERE priority = 'critical') AS critical_needs,
        COUNT(*) FILTER (WHERE priority = 'high') AS high_needs,
        COUNT(*) FILTER (WHERE priority = 'medium') AS medium_needs,
        COUNT(*) FILTER (WHERE priority = 'low') AS low_needs,
        COUNT(*) FILTER (WHERE status = 'fulfilled') AS covered_needs,
        COUNT(*) FILTER (WHERE status = 'pending') AS pending_needs,
        COUNT(*) FILTER (WHERE verification_status = 'verified') AS verified_needs
    FROM public.needs;
END;
$$ LANGUAGE plpgsql;

-- Function to get needs by category
CREATE OR REPLACE FUNCTION get_needs_by_category()
RETURNS TABLE(
    category_name TEXT,
    total BIGINT,
    critical BIGINT,
    fulfilled BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.category,
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE n.priority = 'critical') AS critical,
        COUNT(*) FILTER (WHERE n.status = 'fulfilled') AS fulfilled
    FROM public.needs n
    GROUP BY n.category
    ORDER BY total DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get needs by department
CREATE OR REPLACE FUNCTION get_needs_by_department()
RETURNS TABLE(
    department_name TEXT,
    total BIGINT,
    critical BIGINT,
    fulfilled BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.name,
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE n.priority = 'critical') AS critical,
        COUNT(*) FILTER (WHERE n.status = 'fulfilled') AS fulfilled
    FROM public.needs n
    JOIN public.departments d ON n.department_id = d.id
    GROUP BY d.name
    ORDER BY total DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get aid offers statistics
CREATE OR REPLACE FUNCTION get_aid_offers_statistics()
RETURNS TABLE(
    total_offers BIGINT,
    available BIGINT,
    assigned BIGINT,
    in_transit BIGINT,
    delivered BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) AS total_offers,
        COUNT(*) FILTER (WHERE status = 'available') AS available,
        COUNT(*) FILTER (WHERE status = 'assigned') AS assigned,
        COUNT(*) FILTER (WHERE status = 'in_transit') AS in_transit,
        COUNT(*) FILTER (WHERE status = 'delivered') AS delivered
    FROM public.aid_offers;
END;
$$ LANGUAGE plpgsql;

-- Function to get top needs by pending quantity
CREATE OR REPLACE FUNCTION get_top_needs(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
    id UUID,
    product TEXT,
    category TEXT,
    pending BIGINT,
    unit TEXT,
    priority TEXT,
    municipality_name TEXT,
    department_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.id,
        n.product,
        n.category,
        (n.quantity_needed - n.quantity_received) AS pending,
        n.unit,
        n.priority,
        m.name AS municipality_name,
        d.name AS department_name
    FROM public.needs n
    LEFT JOIN public.municipalities m ON n.municipality_id = m.id
    LEFT JOIN public.departments d ON n.department_id = d.id
    WHERE n.status != 'fulfilled'
    ORDER BY pending DESC, n.priority = 'critical' DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to search needs
CREATE OR REPLACE FUNCTION search_needs(search_query TEXT)
RETURNS TABLE(
    id UUID,
    product TEXT,
    category TEXT,
    description TEXT,
    priority TEXT,
    status TEXT,
    municipality_name TEXT,
    department_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.id,
        n.product,
        n.category,
        n.description,
        n.priority,
        n.status,
        m.name AS municipality_name,
        d.name AS department_name,
        n.created_at
    FROM public.needs n
    LEFT JOIN public.municipalities m ON n.municipality_id = m.id
    LEFT JOIN public.departments d ON n.department_id = d.id
    WHERE 
        n.product ILIKE '%' || search_query || '%'
        OR n.category ILIKE '%' || search_query || '%'
        OR n.description ILIKE '%' || search_query || '%'
        OR m.name ILIKE '%' || search_query || '%'
        OR d.name ILIKE '%' || search_query || '%'
    ORDER BY 
        CASE WHEN n.priority = 'critical' THEN 1 ELSE 2 END,
        n.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get user activity
CREATE OR REPLACE FUNCTION get_user_activity(user_id UUID)
RETURNS TABLE(
    activity_type TEXT,
    count BIGINT,
    last_activity TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'needs' AS activity_type,
        COUNT(*) AS count,
        MAX(created_at) AS last_activity
    FROM public.needs
    WHERE reporter_id = user_id
    UNION ALL
    SELECT 
        'offers' AS activity_type,
        COUNT(*) AS count,
        MAX(created_at) AS last_activity
    FROM public.aid_offers
    WHERE user_id = user_id;
END;
$$ LANGUAGE plpgsql;