import { useState, useCallback } from 'react';

export function useBatchMode() {
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const enterBatchMode = useCallback(() => {
    setIsBatchMode(true);
    setSelectedIds(new Set());
  }, []);

  const exitBatchMode = useCallback(() => {
    setIsBatchMode(false);
    setSelectedIds(new Set());
  }, []);

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback((ids: number[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback(
    (id: number) => {
      return selectedIds.has(id);
    },
    [selectedIds]
  );

  return {
    isBatchMode,
    selectedIds,
    selectedCount: selectedIds.size,
    enterBatchMode,
    exitBatchMode,
    toggleSelect,
    selectAll,
    clearSelection,
    isSelected,
  };
}
