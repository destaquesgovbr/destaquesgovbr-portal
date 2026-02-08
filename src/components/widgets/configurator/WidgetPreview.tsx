'use client'

import { encodeWidgetConfig } from '@/lib/widget-utils'
import type { WidgetConfig } from '@/types/widget'
import { useEffect, useState } from 'react'

interface WidgetPreviewProps {
  config: WidgetConfig
}

export function WidgetPreview({ config }: WidgetPreviewProps) {
  const [iframeKey, setIframeKey] = useState(0)

  // Força recarregamento do iframe quando config muda
  useEffect(() => {
    setIframeKey((prev) => prev + 1)
  }, [config])

  const encoded = encodeWidgetConfig(config)
  const iframeUrl = `/widgets/embed?c=${encoded}`

  const width =
    config.size === 'custom' && config.width ? config.width : undefined
  const height =
    config.size === 'custom' && config.height ? config.height : undefined

  return (
    <div className="border-2 border-dashed border-border rounded-lg p-4 bg-muted/20">
      <div className="flex justify-center">
        <iframe
          key={iframeKey}
          src={iframeUrl}
          width={width || '100%'}
          height={height || '600'}
          title="Widget Preview"
          className="border-0 rounded-lg shadow-lg bg-white"
          data-testid="widget-preview"
        />
      </div>
    </div>
  )
}
