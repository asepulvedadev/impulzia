import { AlertCircle, Check } from 'lucide-react'
import { Input } from '@/components/ui'
import { cn } from '@/lib/utils/cn'

interface FormFieldProps {
  label: string
  name: string
  type?: string
  placeholder?: string
  error?: string
  isValid?: boolean
  required?: boolean
  autoComplete?: string
  defaultValue?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function FormField({
  label,
  name,
  type = 'text',
  placeholder,
  error,
  isValid,
  required,
  autoComplete,
  defaultValue,
  value,
  onChange,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={name}
        className="block text-xs font-bold uppercase tracking-wide text-slate-500"
      >
        {label}
      </label>
      <div className="relative">
        <Input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          defaultValue={value !== undefined ? undefined : defaultValue}
          value={value}
          onChange={onChange}
          className={cn(
            error && 'border-brand-error-500 focus-visible:ring-brand-error-500',
            isValid && 'border-brand-success-500 focus-visible:ring-brand-success-500',
          )}
        />
        {isValid && !error && (
          <Check className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-brand-success-500" />
        )}
      </div>
      {error && (
        <p className="flex items-center gap-1 text-xs text-brand-error-600">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  )
}
