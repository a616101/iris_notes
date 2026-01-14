import { useState, useCallback, useRef } from 'react';

export function useFormState<T extends Record<string, any>>(initialState: T) {
  const [formData, setFormData] = useState<T>(initialState);
  const [isDirty, setIsDirty] = useState(false);
  const initialStateRef = useRef(initialState);

  const updateField = useCallback((field: keyof T, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setIsDirty(true);
  }, []);

  const updateFields = useCallback((fields: Partial<T>) => {
    setFormData((prev) => ({
      ...prev,
      ...fields,
    }));
    setIsDirty(true);
  }, []);

  const reset = useCallback((newState?: T) => {
    setFormData(newState || initialStateRef.current);
    setIsDirty(false);
  }, []);

  return {
    formData,
    isDirty,
    updateField,
    updateFields,
    reset,
    setFormData,
  };
}
