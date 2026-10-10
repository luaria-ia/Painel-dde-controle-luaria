import { useCallback, useEffect, useState } from 'react'

/**
 * Estado simples de formulário com erros por campo.
 * Reinicia os valores sempre que `resetKey` muda (ex.: ao abrir o modal).
 */
export function useFormState<T extends Record<string, unknown>>(initial: () => T, resetKey: unknown) {
  const [values, setValues] = useState<T>(initial)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setValues(initial())
    setErrors({})
    setSubmitting(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey])

  const set = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValues((v) => ({ ...v, [key]: value }))
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e))
  }, [])

  return { values, set, setValues, errors, setErrors, submitting, setSubmitting }
}
