import { useState, useCallback } from 'react';
import { z } from 'zod';

export function useFormValidation<T extends z.ZodType<any, any>>(schema: T) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback(
    (data: z.infer<T>): boolean => {
      try {
        schema.parse(data);
        setErrors({});
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const formattedErrors: Record<string, string> = {};
          error.issues.forEach((err) => {
            const path = err.path.join('.');
            formattedErrors[path] = err.message;
          });
          setErrors(formattedErrors);
        }
        return false;
      }
    },
    [schema]
  );

  const validateField = useCallback(
    (field: string, value: any): string | undefined => {
      try {
        // Create a partial schema for single field validation
        const fieldSchema = (schema as any).shape[field];
        if (fieldSchema) {
          fieldSchema.parse(value);
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
          });
          return undefined;
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errorMessage = error.issues[0]?.message;
          setErrors((prev) => ({
            ...prev,
            [field]: errorMessage,
          }));
          return errorMessage;
        }
      }
    },
    [schema]
  );

  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validate,
    validateField,
    clearError,
    clearAllErrors,
  };
}
