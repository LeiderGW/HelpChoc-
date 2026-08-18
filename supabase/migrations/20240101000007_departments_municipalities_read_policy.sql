-- ============================================
-- LECTURA PÚBLICA DE DEPARTAMENTOS Y MUNICIPIOS
-- ============================================
-- Ambas tablas quedaron con RLS activado desde la migración inicial pero sin
-- ninguna política: con RLS encendido y cero políticas, Postgres deniega todo
-- por defecto, así que nadie —ni anónimo ni autenticado— podía leerlas. Son
-- datos de referencia geográfica pública (nombres de departamento y
-- municipio), sin ningún dato sensible, así que el mismo patrón de lectura
-- abierta que ya usan needs, aid_offers, locations, etc. aplica igual aquí.
--
-- Sin esto, cualquier formulario que dependa de estos selects (reportar
-- necesidad, ofrecer ayuda) queda con las listas de Departamento/Municipio
-- vacías y, al ser campos obligatorios, es imposible de enviar.

DROP POLICY IF EXISTS "Anyone can view departments" ON public.departments;
CREATE POLICY "Anyone can view departments" ON public.departments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view municipalities" ON public.municipalities;
CREATE POLICY "Anyone can view municipalities" ON public.municipalities
    FOR SELECT USING (true);
