export default function LoadingArticle() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-6"></div>
      <p className="text-muted-foreground">Carregando notícia...</p>
    </div>
  )
}
