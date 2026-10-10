import { APP_NAME, APP_VERSION } from '@/config/app'

export function LogoMark({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" className="fill-accent" />
      <path d="M9 9h6v6H9zM17 9h6v6h-6zM9 17h6v6H9z" className="fill-accent-fg" />
      <path d="M17 17h6v6h-6z" className="fill-accent-fg" opacity="0.45" />
    </svg>
  )
}

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark />
      <div className="leading-none">
        <span className="text-[15px] font-semibold tracking-tight">{APP_NAME}</span>
        <span className="ml-1.5 rounded bg-surface-2 px-1 py-0.5 align-middle text-[10px] font-medium text-subtle">
          {APP_VERSION}
        </span>
      </div>
    </div>
  )
}
