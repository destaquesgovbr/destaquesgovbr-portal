import { Card, CardContent } from "@/components/ui/card"

export default function KpiCard({ title, value }: { title: string; value: string }) {
  return (
    <Card className="relative overflow-hidden border bg-card transition-all hover:shadow-md hover:border-foreground/10 group">
      {/* Barra vertical geométrica */}
      <img
        src="/kpi-ribbon.svg"
        alt="decorativo"
        className="absolute left-0 top-0 bottom-0 h-full"
      />

      {/* Conteúdo */}
      <CardContent className="pl-4 py-5">
        <p className="text-xs uppercase tracking-wide font-medium text-muted-foreground mb-1">
          {title}
        </p>
        <p className="text-3xl font-semibold leading-tight text-foreground mx-auto text-center">
          {value}
        </p>
      </CardContent>

      {/* Sombra suave no hover */}
      <div className="absolute inset-0 pointer-events-none rounded-lg border border-transparent group-hover:border-foreground/10 transition-all" />
    </Card>
  )
}
