import type { ReactNode } from 'react'
import type { WidgetLayout } from '@/types/widget'

interface WidgetContentProps {
  layout: WidgetLayout
  children: ReactNode
}

export function WidgetContent({ layout, children }: WidgetContentProps) {
  const getLayoutClasses = () => {
    switch (layout) {
      case 'list':
        return 'flex flex-col gap-3'
      case 'grid-2':
        return 'grid grid-cols-1 sm:grid-cols-2 gap-4'
      case 'grid-3':
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
      case 'carousel':
        return 'flex overflow-x-auto gap-4 snap-x snap-mandatory scrollbar-hide'
      default:
        return 'flex flex-col gap-3'
    }
  }

  return (
    <div className="widget-content flex-1 p-4 overflow-auto">
      <div className={getLayoutClasses()} data-layout={layout}>
        {children}
      </div>
    </div>
  )
}
