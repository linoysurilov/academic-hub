import type { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  className?: string
  title?: string
  action?: ReactNode
}

export function Card({ children, className = '', title, action }: CardProps) {
  return (
    <section
      className={`rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/5 ${className}`}
    >
      {(title || action) && (
        <header className="mb-4 flex items-center justify-between gap-3">
          {title ? (
            <h2 className="font-display text-sm font-semibold tracking-wide text-slate-700 uppercase dark:text-slate-200">
              {title}
            </h2>
          ) : (
            <span />
          )}
          {action}
        </header>
      )}
      {children}
    </section>
  )
}
