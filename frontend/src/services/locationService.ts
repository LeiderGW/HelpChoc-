import { supabase } from './supabase';

export const locationService = {
  async getDepartments() {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching departments:', error);
      return [];
    }
  },

  async getMunicipalities(departmentId?: string) {
    try {
      let query = supabase
        .from('municipalities')
        .select('*')
        .order('name');

      if (departmentId) {
        query = query.eq('department_id', departmentId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching municipalities:', error);
      return [];
    }
  },

  async getMunicipalityByName(name: string, departmentId?: string) {
    try {
      let query = supabase
        .from('municipalities')
        .select('*')
        .eq('name', name);

      if (departmentId) {
        query = query.eq('department_id', departmentId);
      }

      const { data, error } = await query.single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching municipality:', error);
      return null;
    }
  },

  async createLocation(data: {
    municipality_id: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    place_name?: string;
  }) {
    try {
      const { data: location, error } = await supabase
        .from('locations')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return location;
    } catch (error) {
      console.error('Error creating location:', error);
      return null;
    }
  },

  async updateLocation(id: string, updates: Partial<{
    address: string;
    latitude: number;
    longitude: number;
    place_name: string;
  }>) {
    try {
      const { data, error } = await supabase
        .from('locations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating location:', error);
      return null;
    }
  },

  async deleteLocation(id: string) {
    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting location:', error);
      return false;
    }
  },

  async getLocationsByMunicipality(municipalityId: string) {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('municipality_id', municipalityId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching locations:', error);
      return [];
    }
  },

  async getColombiaDepartments(): Promise<{ id: string; name: string }[]> {
    // Lista de departamentos de Colombia
    const departments = [
      'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar',
      'Boyacá', 'Caldas', 'Caquetá', 'Casanare', 'Cauca',
      'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca', 'Guainía',
      'Guaviare', 'Huila', 'La Guajira', 'Magdalena', 'Meta',
      'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío',
      'Risaralda', 'San Andrés y Providencia', 'Santander',
      'Sucre', 'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada',
    ];

    try {
      // Check if departments exist in DB
      const { data: existingDepartments } = await supabase
        .from('departments')
        .select('id, name');

      if (existingDepartments && existingDepartments.length > 0) {
        return existingDepartments;
      }

      // If not, create them
      const departmentData = departments.map(name => ({ name }));
      const { data, error } = await supabase
        .from('departments')
        .insert(departmentData)
        .select('id, name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting departments:', error);
      return [];
    }
  },

  async getColombiaMunicipalities(departmentName: string): Promise<string[]> {
    // Lista de municipios por departamento (ejemplo)
    const municipalitiesMap: Record<string, string[]> = {
      'Antioquia': ['Medellín', 'Envigado', 'Itagüí', 'Bello', 'Rionegro', 'La Estrella', 'Sabaneta'],
      'Cundinamarca': ['Bogotá', 'Soacha', 'Zipaquirá', 'Facatativá', 'Chía', 'Cajicá'],
      'Valle del Cauca': ['Cali', 'Palmira', 'Buenaventura', 'Yumbo', 'Tuluá', 'Cartago'],
      'Atlántico': ['Barranquilla', 'Soledad', 'Malambo', 'Puerto Colombia', 'Sabanalarga'],
      'Bolívar': ['Cartagena', 'Magangué', 'Turbaco', 'Arjona', 'El Carmen de Bolívar'],
      // ... más departamentos
    };

    return municipalitiesMap[departmentName] || [];
  },
};