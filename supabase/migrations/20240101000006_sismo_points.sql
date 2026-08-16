-- ============================================
-- PUNTOS DEL SISMO DEL CHOCÓ
-- ============================================
-- Sube a la base los puntos que hasta ahora vivían como constantes en el
-- frontend (frontend/src/config/puntosSismo.ts): los acopios oficiales, el
-- hospital de referencia, el albergue, el epicentro y sus réplicas.
--
-- Todo es idempotente: se puede correr dos veces sin duplicar nada. La clave
-- es `external_id`, un identificador estable escrito a mano que sobrevive a
-- que la fila se borre y se vuelva a crear, y que le permite al frontend saber
-- cuál de sus puntos empaquetados ya está en la base para no pintarlo dos
-- veces mientras esta migración no se haya corrido.
--
-- Las columnas nuevas son todas nullable: ninguna fila existente se rompe.

-- ============================================
-- 1. PROCEDENCIA DE CADA PUNTO
-- ============================================
-- Estos puntos no salen de un formulario: salen de la ficha de coordinación de
-- la Gobernación, de la Defensoría y de prensa verificada, y casi ninguno
-- tiene coordenada levantada en terreno. Guardar de dónde viene cada uno y con
-- qué precisión no es metadato de lujo — es lo que evita mandar a alguien con
-- un camión a una puerta equivocada.

ALTER TABLE public.collection_centers
    ADD COLUMN IF NOT EXISTS external_id TEXT,
    ADD COLUMN IF NOT EXISTS source TEXT,
    ADD COLUMN IF NOT EXISTS location_note TEXT,
    ADD COLUMN IF NOT EXISTS location_precision TEXT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'collection_centers_external_id_key'
    ) THEN
        ALTER TABLE public.collection_centers
            ADD CONSTRAINT collection_centers_external_id_key UNIQUE (external_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'collection_centers_location_precision_check'
    ) THEN
        ALTER TABLE public.collection_centers
            ADD CONSTRAINT collection_centers_location_precision_check
            CHECK (location_precision IS NULL OR location_precision IN ('confirmada', 'aproximada'));
    END IF;
END $$;

-- ============================================
-- 2. EVENTOS SÍSMICOS
-- ============================================
-- El epicentro y las réplicas no son "centros de acopio": no se les lleva nada
-- ni se les visita. Van en su propia tabla en vez de forzarlos dentro de
-- collection_centers con un type inventado.

CREATE TABLE IF NOT EXISTS public.seismic_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('principal', 'replica')),
    magnitude DECIMAL(3, 1) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    occurred_on DATE NOT NULL,
    local_time TEXT,
    depth_km INTEGER,
    location_precision TEXT NOT NULL CHECK (location_precision IN ('confirmada', 'aproximada')),
    location_note TEXT,
    source TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.seismic_events ENABLE ROW LEVEL SECURITY;

-- Lectura pública, igual que las necesidades y los centros: es información de
-- emergencia y quien la necesita no va a crearse una cuenta primero.
DROP POLICY IF EXISTS "Anyone can view seismic events" ON public.seismic_events;
CREATE POLICY "Anyone can view seismic events" ON public.seismic_events
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage seismic events" ON public.seismic_events;
CREATE POLICY "Admins can manage seismic events" ON public.seismic_events
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE INDEX IF NOT EXISTS idx_seismic_events_type ON public.seismic_events(event_type);

-- ============================================
-- 3. TERRITORIO
-- ============================================
-- Los puntos necesitan municipio para que el mapa pueda agruparlos y filtrarlos
-- por área. Se crean solo si faltan.

INSERT INTO public.departments (name, code)
VALUES ('Chocó', 'CHO')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.municipalities (department_id, name, code)
SELECT d.id, m.name, m.code
FROM public.departments d
CROSS JOIN (VALUES
    ('Quibdó', '27001'),
    ('San José del Palmar', '27660')
) AS m(name, code)
WHERE d.name = 'Chocó'
ON CONFLICT (department_id, name) DO NOTHING;

-- ============================================
-- 4. PUNTOS OFICIALES DE AYUDA
-- ============================================

INSERT INTO public.collection_centers (
    external_id, name, type, address, municipality_id, department_id,
    latitude, longitude, contact_phone, schedule, status,
    source, location_note, location_precision
)
SELECT
    p.external_id, p.name, p.type, p.address, mun.id, dep.id,
    p.latitude, p.longitude, p.contact_phone, p.schedule, 'active',
    p.source, p.location_note, p.location_precision
FROM (VALUES
    (
        'acopio-gobernacion',
        'Gobernación del Chocó',
        'collection',
        'Calle 31, edificio La Confianza, Quibdó',
        'Quibdó',
        5.69190000, -76.65830000,
        NULL::TEXT,
        NULL::TEXT,
        'Gobernación del Chocó — ficha de coordinación de ayudas, 12 ago 2026',
        'Dirección publicada por la Gobernación; las coordenadas son una aproximación al centro administrativo de Quibdó.',
        'aproximada'
    ),
    (
        'acopio-centro-logistico',
        'Centro Logístico Humanitario del Chocó',
        'collection',
        'Antigua bodega Postobón, km 4 vía Quibdó–Yuto',
        'Quibdó',
        5.65120000, -76.62620000,
        NULL,
        NULL,
        'Gobernación del Chocó — ficha de coordinación de ayudas, 12 ago 2026',
        'Ubicación estimada sobre la vía Quibdó–Yuto a la altura del km 4; conviene confirmar antes de desplazarse.',
        'aproximada'
    ),
    (
        'acopio-quibdo-comunitario',
        'Acopio comunitario — Barrio Los Ángeles',
        'collection',
        'Calle 27A #23-44, Barrio Los Ángeles, Sector San Gabriel',
        'Quibdó',
        5.69450000, -76.66050000,
        '310 805 0535',
        NULL,
        'Reporte comunitario, corte 12 ago 2026',
        'Iniciativa comunitaria, no oficial. Conviene llamar antes de llevar donaciones.',
        'aproximada'
    ),
    (
        'atencion-hsfa-quibdo',
        'Hospital San Francisco de Asís',
        'medical',
        'Quibdó, Chocó',
        'Quibdó',
        5.69750000, -76.65950000,
        NULL,
        'Llegó a operar al 300% de su capacidad tras el sismo',
        'El Tiempo, 12 ago 2026',
        'Reportó necesidad urgente de insumos médicos, equipo quirúrgico y recursos de cuidado crítico.',
        'aproximada'
    ),
    (
        'albergue-coliseo-quibdo',
        'Coliseo de Boxeo de Quibdó',
        'shelter',
        'Quibdó, Chocó',
        'Quibdó',
        5.69120000, -76.65310000,
        NULL,
        'Operativo · 300 carpas asignadas',
        'Defensoría del Pueblo y UNGRD, 13 ago 2026',
        'La Defensoría reporta que faltan colchonetas, no hay separación entre grupos familiares y la capacidad es insuficiente para la cantidad de damnificados.',
        'aproximada'
    )
) AS p(
    external_id, name, type, address, municipio,
    latitude, longitude, contact_phone, schedule,
    source, location_note, location_precision
)
JOIN public.departments dep ON dep.name = 'Chocó'
JOIN public.municipalities mun ON mun.name = p.municipio AND mun.department_id = dep.id
ON CONFLICT (external_id) DO NOTHING;

-- ============================================
-- 5. EPICENTRO Y RÉPLICAS
-- ============================================
-- Las coordenadas del principal son las del boletín del SGC (4.99, −76.29). El
-- USGS publica otra solución (4.903, −76.189): es normal, usan redes de
-- estaciones distintas. Se guarda la del SGC por ser la autoridad nacional.

INSERT INTO public.seismic_events (
    external_id, name, event_type, magnitude, latitude, longitude,
    occurred_on, local_time, depth_km, location_precision, location_note, source
)
VALUES
    ('sismo-principal', 'Sismo principal M7.4', 'principal', 7.4, 4.99000000, -76.29000000,
     '2026-08-10', '07:34', 103, 'confirmada', NULL,
     'Servicio Geológico Colombiano (SGC)'),

    ('replica-42', 'Réplica M4.2', 'replica', 4.2, 4.98000000, -76.28000000,
     '2026-08-13', '09:42', 95, 'aproximada',
     'La más fuerte desde el sismo principal, con el mismo epicentro en San José del Palmar. Se sintió en Bogotá, Manizales y Pereira. Las autoridades no reportaron daños ni heridos.',
     'SGC'),

    ('replica-50', 'Réplica M5.0', 'replica', 5.0, 4.95000000, -76.25000000,
     '2026-08-10', NULL, NULL, 'aproximada',
     'Magnitud reportada por el USGS. Ubicación estimada en el entorno del epicentro; las coordenadas exactas no fueron publicadas.',
     'USGS'),

    ('replica-48', 'Réplica M4.8', 'replica', 4.8, 5.02000000, -76.32000000,
     '2026-08-10', '08:18', NULL, 'aproximada',
     'Magnitud y hora confirmadas por el SGC. Ubicación estimada en el entorno del epicentro.',
     'SGC'),

    ('replica-38', 'Réplica M3.8', 'replica', 3.8, 4.94000000, -76.34000000,
     '2026-08-10', '10:01', NULL, 'aproximada',
     'Magnitud y hora confirmadas por el SGC. Ubicación estimada en el entorno del epicentro.',
     'SGC')
ON CONFLICT (external_id) DO NOTHING;
