import { Component, type ReactNode } from 'react'

type Props = { children: ReactNode; fallback?: ReactNode }
type State = { hasError: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="rounded-3xl border border-rose-100 bg-rose-50 p-6 text-sm text-rose-700">
            לא ניתן להציג את המסך כרגע. נסי לרענן את העמוד.
          </div>
        )
      )
    }
    return this.props.children
  }
}
