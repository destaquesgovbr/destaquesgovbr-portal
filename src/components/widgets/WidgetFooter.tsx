import { ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface WidgetFooterProps {
  showLink: boolean
}

export function WidgetFooter({ showLink }: WidgetFooterProps) {
  if (!showLink) return null

  return (
    <div className="widget-footer px-4 py-3 border-t border-border bg-muted/30">
      <Link
        href="https://destaques.gov.br"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors group"
      >
        <span className="font-medium">Ver mais notícias no DGB</span>
        <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </Link>
    </div>
  )
}
