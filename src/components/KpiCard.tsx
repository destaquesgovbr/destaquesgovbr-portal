import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

type KpiCardProps = {
  title: string
  value: string
  trend?: {
    value: number
    percentage: string
  }
}

export default function KpiCard({ title, value, trend }: KpiCardProps) {
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

        {/* Trend indicator */}
        {trend && (
          <div className={`flex items-center justify-center gap-1 mt-2 text-xs font-medium ${
            trend.value > 0 ? 'text-green-600' :
            trend.value < 0 ? 'text-red-600' :
            'text-muted-foreground'
          }`}>
            {trend.value > 0 && <TrendingUp className="h-3 w-3" />}
            {trend.value < 0 && <TrendingDown className="h-3 w-3" />}
            {trend.value === 0 && <Minus className="h-3 w-3" />}
            <span>{trend.percentage} vs período anterior</span>
          </div>
        )}
      </CardContent>

      {/* Sombra suave no hover */}
      <div className="absolute inset-0 pointer-events-none rounded-lg border border-transparent group-hover:border-foreground/10 transition-all" />
    </Card>
  )
}
