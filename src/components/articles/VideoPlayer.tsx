'use client'

import { AlertCircle, ExternalLink } from 'lucide-react'
import { useState } from 'react'

interface VideoPlayerProps {
  videoUrl: string
  title?: string | null
}

function isDirectVideoUrl(url: string): boolean {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov']
  return videoExtensions.some((ext) => url.toLowerCase().includes(ext))
}

export function VideoPlayer({ videoUrl, title }: VideoPlayerProps) {
  const [hasError, setHasError] = useState(false)

  const isDirect = isDirectVideoUrl(videoUrl)

  if (hasError) {
    return (
      <div className="mb-12 aspect-video bg-muted rounded-lg flex items-center justify-center shadow-md">
        <div className="text-center text-muted-foreground p-6">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-primary/40" />
          <p className="mb-2">Não foi possível carregar o vídeo</p>
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
          >
            Assistir no site original
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    )
  }

  if (isDirect) {
    return (
      <div className="mb-12">
        <video
          src={videoUrl}
          controls
          className="w-full aspect-video rounded-lg shadow-md bg-black"
          title={title || 'Vídeo da notícia'}
          onError={() => setHasError(true)}
          preload="metadata"
        >
          <track kind="captions" />
          Seu navegador não suporta a reprodução de vídeos.
        </video>
      </div>
    )
  }

  return (
    <div className="mb-12">
      <iframe
        src={videoUrl}
        title={title || 'Vídeo da notícia'}
        className="w-full aspect-video rounded-lg shadow-md"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        onError={() => setHasError(true)}
      />
    </div>
  )
}
