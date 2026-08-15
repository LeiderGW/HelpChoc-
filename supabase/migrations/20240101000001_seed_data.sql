-- ============================================
-- SEED DATA FOR DEPARTMENTS (COLOMBIA)
-- ============================================
INSERT INTO public.departments (id, name, code) VALUES
    (gen_random_uuid(), 'Amazonas', 'AMA'),
    (gen_random_uuid(), 'Antioquia', 'ANT'),
    (gen_random_uuid(), 'Arauca', 'ARA'),
    (gen_random_uuid(), 'Atlántico', 'ATL'),
    (gen_random_uuid(), 'Bolívar', 'BOL'),
    (gen_random_uuid(), 'Boyacá', 'BOY'),
    (gen_random_uuid(), 'Caldas', 'CAL'),
    (gen_random_uuid(), 'Caquetá', 'CAQ'),
    (gen_random_uuid(), 'Casanare', 'CAS'),
    (gen_random_uuid(), 'Cauca', 'CAU'),
    (gen_random_uuid(), 'Cesar', 'CES'),
    (gen_random_uuid(), 'Chocó', 'CHO'),
    (gen_random_uuid(), 'Córdoba', 'COR'),
    (gen_random_uuid(), 'Cundinamarca', 'CUN'),
    (gen_random_uuid(), 'Guainía', 'GUA'),
    (gen_random_uuid(), 'Guaviare', 'GUV'),
    (gen_random_uuid(), 'Huila', 'HUI'),
    (gen_random_uuid(), 'La Guajira', 'LAG'),
    (gen_random_uuid(), 'Magdalena', 'MAG'),
    (gen_random_uuid(), 'Meta', 'MET'),
    (gen_random_uuid(), 'Nariño', 'NAR'),
    (gen_random_uuid(), 'Norte de Santander', 'NDS'),
    (gen_random_uuid(), 'Putumayo', 'PUT'),
    (gen_random_uuid(), 'Quindío', 'QUI'),
    (gen_random_uuid(), 'Risaralda', 'RIS'),
    (gen_random_uuid(), 'San Andrés y Providencia', 'SAP'),
    (gen_random_uuid(), 'Santander', 'SAN'),
    (gen_random_uuid(), 'Sucre', 'SUC'),
    (gen_random_uuid(), 'Tolima', 'TOL'),
    (gen_random_uuid(), 'Valle del Cauca', 'VAC'),
    (gen_random_uuid(), 'Vaupés', 'VAU'),
    (gen_random_uuid(), 'Vichada', 'VIC');

-- ============================================
-- SEED DATA FOR MUNICIPALITIES (EXAMPLE)
-- ============================================
-- Get department IDs
DO $$
DECLARE
    ant_id UUID;
    cun_id UUID;
    vac_id UUID;
    atl_id UUID;
    bol_id UUID;
BEGIN
    SELECT id INTO ant_id FROM public.departments WHERE code = 'ANT';
    SELECT id INTO cun_id FROM public.departments WHERE code = 'CUN';
    SELECT id INTO vac_id FROM public.departments WHERE code = 'VAC';
    SELECT id INTO atl_id FROM public.departments WHERE code = 'ATL';
    SELECT id INTO bol_id FROM public.departments WHERE code = 'BOL';

    -- Antioquia
    INSERT INTO public.municipalities (department_id, name) VALUES
        (ant_id, 'Medellín'),
        (ant_id, 'Envigado'),
        (ant_id, 'Itagüí'),
        (ant_id, 'Bello'),
        (ant_id, 'Rionegro');

    -- Cundinamarca
    INSERT INTO public.municipalities (department_id, name) VALUES
        (cun_id, 'Bogotá D.C.'),
        (cun_id, 'Soacha'),
        (cun_id, 'Zipaquirá'),
        (cun_id, 'Facatativá'),
        (cun_id, 'Chía');

    -- Valle del Cauca
    INSERT INTO public.municipalities (department_id, name) VALUES
        (vac_id, 'Cali'),
        (vac_id, 'Palmira'),
        (vac_id, 'Buenaventura'),
        (vac_id, 'Yumbo'),
        (vac_id, 'Tuluá');

    -- Atlántico
    INSERT INTO public.municipalities (department_id, name) VALUES
        (atl_id, 'Barranquilla'),
        (atl_id, 'Soledad'),
        (atl_id, 'Malambo'),
        (atl_id, 'Puerto Colombia');

    -- Bolívar
    INSERT INTO public.municipalities (department_id, name) VALUES
        (bol_id, 'Cartagena'),
        (bol_id, 'Magangué'),
        (bol_id, 'Turbaco'),
        (bol_id, 'Arjona');
END $$;

-- ============================================
-- SEED DATA FOR SAMPLE ORGANIZATIONS
-- ============================================
INSERT INTO public.organizations (id, name, description, email, phone, verified) VALUES
    (gen_random_uuid(), 'Cruz Roja Colombiana', 'Organización humanitaria de ayuda en emergencias', 'cruzroja@example.com', '300 123 4567', true),
    (gen_random_uuid(), 'Defensa Civil Colombia', 'Atención de emergencias y desastres', 'defensacivil@example.com', '300 234 5678', true),
    (gen_random_uuid(), 'Fundación Solidaridad', 'Ayuda humanitaria y desarrollo social', 'solidaridad@example.com', '300 345 6789', true),
    (gen_random_uuid(), 'Banco de Alimentos', 'Distribución de alimentos a comunidades vulnerables', 'bancodealimentos@example.com', '300 456 7890', false);

-- ============================================
-- SEED DATA FOR SAMPLE NEEDS
-- ============================================
DO $$
DECLARE
    medellin_id UUID;
    bogota_id UUID;
    cali_id UUID;
    barranquilla_id UUID;
    cartagena_id UUID;
    ant_id UUID;
    cun_id UUID;
    vac_id UUID;
    atl_id UUID;
    bol_id UUID;
    user_id UUID;
BEGIN
    -- Get municipality IDs
    SELECT id INTO medellin_id FROM public.municipalities WHERE name = 'Medellín';
    SELECT id INTO bogota_id FROM public.municipalities WHERE name = 'Bogotá D.C.';
    SELECT id INTO cali_id FROM public.municipalities WHERE name = 'Cali';
    SELECT id INTO barranquilla_id FROM public.municipalities WHERE name = 'Barranquilla';
    SELECT id INTO cartagena_id FROM public.municipalities WHERE name = 'Cartagena';

    -- Get department IDs
    SELECT id INTO ant_id FROM public.departments WHERE code = 'ANT';
    SELECT id INTO cun_id FROM public.departments WHERE code = 'CUN';
    SELECT id INTO vac_id FROM public.departments WHERE code = 'VAC';
    SELECT id INTO atl_id FROM public.departments WHERE code = 'ATL';
    SELECT id INTO bol_id FROM public.departments WHERE code = 'BOL';

    -- -- Create a sample user if not exists
    -- INSERT INTO public.users (id, email, full_name, role)
    -- VALUES (
    --     gen_random_uuid(),
    --     'sample@ayudamapa.com',
    --     'Usuario Muestra',
    --     'volunteer'
    -- ) ON CONFLICT (email) DO NOTHING;

-- No crear usuario de prueba.
-- Las necesidades de demostración no tendrán reporter asociado.
user_id := NULL;



    -- Get user ID
    SELECT id INTO user_id FROM public.users WHERE email = 'sample@ayudamapa.com';

    -- Sample needs
    INSERT INTO public.needs (
        category, product, description, quantity_needed, quantity_received, 
        unit, municipality_id, department_id, priority, status, reporter_id, 
        affected_people, verification_status, created_at
    ) VALUES
        (
            'water', 'Agua potable en botellas', 'Se necesita agua potable para 500 familias afectadas por inundación',
            5000, 1500, 'litros', medellin_id, ant_id, 'critical', 'verified', user_id,
            2500, 'verified', NOW() - INTERVAL '2 days'
        ),
        (
            'food', 'Paquetes de alimentos no perecederos', 'Alimentos para comunidades aisladas por deslizamiento',
            3000, 800, 'unidades', bogota_id, cun_id, 'high', 'verified', user_id,
            1500, 'verified', NOW() - INTERVAL '3 days'
        ),
        (
            'medicines', 'Medicamentos básicos', 'Antibióticos y analgésicos para centro de salud comunitario',
            1000, 200, 'unidades', cali_id, vac_id, 'critical', 'pending', user_id,
            800, 'pending', NOW() - INTERVAL '1 day'
        ),
        (
            'mattresses', 'Colchonetas', 'Colchonetas para albergue temporal',
            200, 50, 'unidades', barranquilla_id, atl_id, 'high', 'pending', user_id,
            400, 'pending', NOW() - INTERVAL '5 days'
        ),
        (
            'hygiene', 'Kits de higiene', 'Kits de higiene personal para damnificados',
            500, 100, 'kits', cartagena_id, bol_id, 'medium', 'pending', user_id,
            500, 'pending', NOW() - INTERVAL '7 days'
        );
END $$;

-- ============================================
-- SEED DATA FOR SAMPLE AID OFFERS
-- ============================================
DO $$
DECLARE
    water_need_id UUID;
    food_need_id UUID;
    org_id UUID;
BEGIN
    -- Get organization ID
    SELECT id INTO org_id FROM public.organizations WHERE name = 'Cruz Roja Colombiana' LIMIT 1;

    -- Get need IDs
    SELECT id INTO water_need_id FROM public.needs WHERE product = 'Agua potable en botellas' LIMIT 1;
    SELECT id INTO food_need_id FROM public.needs WHERE product = 'Paquetes de alimentos no perecederos' LIMIT 1;

    -- Sample aid offers
    INSERT INTO public.aid_offers (
        need_id, organization_id, product, quantity, unit, status, contact_info, notes, created_at
    ) VALUES
        (
            water_need_id, org_id, 'Agua potable en botellas', 2000, 'litros', 'available', 
            'contacto@cruzroja.org', 'Disponibles para entrega inmediata', NOW() - INTERVAL '1 day'
        ),
        (
            food_need_id, org_id, 'Paquetes de alimentos no perecederos', 1000, 'unidades', 'available',
            'contacto@cruzroja.org', 'Paquetes con arroz, frijoles y enlatados', NOW() - INTERVAL '2 days'
        );
END $$;

-- ============================================
-- SEED DATA FOR SAMPLE COLLECTION CENTERS
-- ============================================
DO $$
DECLARE
    medellin_id UUID;
    bogota_id UUID;
    cali_id UUID;
    ant_id UUID;
    cun_id UUID;
    vac_id UUID;
BEGIN
    -- Get municipality IDs
    SELECT id INTO medellin_id FROM public.municipalities WHERE name = 'Medellín';
    SELECT id INTO bogota_id FROM public.municipalities WHERE name = 'Bogotá D.C.';
    SELECT id INTO cali_id FROM public.municipalities WHERE name = 'Cali';

    -- Get department IDs
    SELECT id INTO ant_id FROM public.departments WHERE code = 'ANT';
    SELECT id INTO cun_id FROM public.departments WHERE code = 'CUN';
    SELECT id INTO vac_id FROM public.departments WHERE code = 'VAC';

    -- Sample collection centers
    INSERT INTO public.collection_centers (
        name, type, address, municipality_id, department_id, 
        latitude, longitude, schedule, responsible_person, contact_phone, status
    ) VALUES
        (
            'Centro de Acopio Central', 'collection', 'Calle 50 # 45-67', 
            medellin_id, ant_id, 6.2442, -75.5812, 
            'Lun-Vie 8:00 AM - 6:00 PM', 'Juan Pérez', '300 111 2233', 'active'
        ),
        (
            'Punto de Entrega Norte', 'delivery', 'Carrera 7 # 85-23', 
            bogota_id, cun_id, 4.7110, -74.0721, 
            'Lun-Sab 7:00 AM - 8:00 PM', 'María Rodríguez', '300 222 3344', 'active'
        ),
        (
            'Refugio Temporal Sur', 'shelter', 'Calle 15 # 30-45', 
            cali_id, vac_id, 3.4516, -76.5320, 
            '24 horas', 'Carlos López', '300 333 4455', 'temporary'
        );
END $$;

-- ============================================
-- SEED DATA FOR SAMPLE STATUS HISTORY
-- ============================================
DO $$
DECLARE
    need_id UUID;
    user_id UUID;
BEGIN
    -- Get need ID
    SELECT id INTO need_id FROM public.needs WHERE product = 'Agua potable en botellas' LIMIT 1;
    
    -- Get user ID
    SELECT id INTO user_id FROM public.users WHERE email = 'sample@ayudamapa.com' LIMIT 1;

    -- Sample status history
    INSERT INTO public.status_history (
        need_id, user_id, action, previous_status, new_status, notes, created_at
    ) VALUES
        (
            need_id, user_id, 'Reporte inicial', NULL, 'pending', 
            'Necesidad reportada por comunidad afectada', NOW() - INTERVAL '2 days'
        ),
        (
            need_id, user_id, 'Verificación', 'pending', 'verified', 
            'Verificado por equipo de campo', NOW() - INTERVAL '1 day'
        );
END $$;

-- ============================================
-- SAMPLE NOTIFICATIONS
-- ============================================
DO $$
DECLARE
    user_id UUID;
BEGIN
    -- Get user ID
    SELECT id INTO user_id FROM public.users WHERE email = 'sample@ayudamapa.com' LIMIT 1;

    INSERT INTO public.notifications (
        user_id, title, message, type, read, created_at
    ) VALUES
        (
            user_id, 'Bienvenido a AyudaMapa', 
            'Gracias por unirte a la plataforma de ayuda humanitaria.', 
            'success', false, NOW() - INTERVAL '10 minutes'
        ),
        (
            user_id, 'Nueva necesidad crítica', 
            'Se ha reportado una necesidad crítica de agua en Medellín.', 
            'warning', false, NOW() - INTERVAL '5 minutes'
        );
END $$;