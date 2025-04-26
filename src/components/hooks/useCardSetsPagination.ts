import { useState, useCallback } from "react";

interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

interface UseCardSetsPaginationReturn {
  pagination: PaginationState;
  totalPages: number;
  handlePreviousPage: () => void;
  handleNextPage: () => void;
  setTotal: (total: number) => void;
}

export const useCardSetsPagination = (initialLimit = 10): UseCardSetsPaginationReturn => {
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: initialLimit,
    total: 0,
  });

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  const handlePreviousPage = useCallback(() => {
    setPagination((prev) => ({
      ...prev,
      page: Math.max(1, prev.page - 1),
    }));
  }, []);

  const handleNextPage = useCallback(() => {
    setPagination((prev) => ({
      ...prev,
      page: Math.min(totalPages, prev.page + 1),
    }));
  }, [totalPages]);

  const setTotal = useCallback((total: number) => {
    setPagination((prev) => ({
      ...prev,
      total,
    }));
  }, []);

  return {
    pagination,
    totalPages,
    handlePreviousPage,
    handleNextPage,
    setTotal,
  };
};
