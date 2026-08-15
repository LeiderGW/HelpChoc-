import { useState, useEffect, useCallback } from 'react';
import { needsService } from '../services/needsService';
import { Need, NeedFilters } from '../types';

export const useNeeds = (initialFilters?: NeedFilters) => {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<NeedFilters>(initialFilters || {});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchNeeds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await needsService.getNeeds(filters);
      if (response.error) {
        setError(response.error);
      } else {
        setNeeds(response.data);
        if (response.pagination) {
          setPagination({
            page: response.pagination.page,
            limit: response.pagination.limit,
            total: response.pagination.total,
            totalPages: response.pagination.totalPages,
          });
        }
      }
    } catch (err) {
      setError('Error al cargar las necesidades');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchNeeds();
  }, [fetchNeeds]);

  const updateFilters = useCallback((newFilters: Partial<NeedFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset page when filters change
    }));
  }, []);

  const goToPage = useCallback((page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  }, []);

  const refresh = useCallback(() => {
    fetchNeeds();
  }, [fetchNeeds]);

  return {
    needs,
    loading,
    error,
    filters,
    pagination,
    updateFilters,
    goToPage,
    refresh,
  };
};