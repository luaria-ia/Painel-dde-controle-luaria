import type { LucideIcon } from 'lucide-react'
import { Link, type LinkProps } from 'react-router-dom'
import { buttonClass } from './buttonStyles'

interface ButtonLinkProps extends LinkProps {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md'
  icon?: LucideIcon
}

/** Link de navegação com a aparência do Button. */
export function ButtonLink({ variant = 'secondary', size = 'md', icon: Icon, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={buttonClass(variant, size, className)} {...rest}>
      {Icon && <Icon className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} strokeWidth={2} />}
      {children}
    </Link>
  )
}
