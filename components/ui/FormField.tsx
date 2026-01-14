interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}

export default function FormField({
  label,
  error,
  required = false,
  children,
  hint,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {children}
      
      {hint && !error && (
        <p className="text-xs text-gray-500 font-medium">{hint}</p>
      )}
      
      {error && (
        <p className="text-xs text-red-600 font-bold flex items-center gap-1">
          <span>⚠️</span> {error}
        </p>
      )}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ error, className = '', ...props }: InputProps) {
  return (
    <input
      className={`w-full px-4 py-3 rounded-2xl border-2 ${
        error
          ? 'border-red-300 focus:border-red-500'
          : 'border-gray-100 focus:border-brand-yellow'
      } outline-none transition-all text-sm font-medium ${className}`}
      {...props}
    />
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function TextArea({ error, className = '', ...props }: TextAreaProps) {
  return (
    <textarea
      className={`w-full px-4 py-3 rounded-2xl border-2 ${
        error
          ? 'border-red-300 focus:border-red-500'
          : 'border-gray-100 focus:border-brand-yellow'
      } outline-none transition-all text-sm font-medium resize-none ${className}`}
      {...props}
    />
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export function Select({ error, className = '', children, ...props }: SelectProps) {
  return (
    <select
      className={`w-full px-4 py-3 rounded-2xl border-2 ${
        error
          ? 'border-red-300 focus:border-red-500'
          : 'border-gray-100 focus:border-brand-yellow'
      } outline-none transition-all text-sm font-bold bg-white cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
