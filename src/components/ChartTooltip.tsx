type ChartPayload = {
  payload: Record<string, string | number>
}

type ChartTooltipProps = {
  active?: boolean
  payload?: ChartPayload[]
  dataKey: string
  itemName?: string | null
  formatLabel?: (label: string) => string
}

export const ChartTooltip = ({
  active,
  payload,
  dataKey,
  itemName,
  formatLabel,
}: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const value = String(data[dataKey])

    return (
      <div className="bg-white border border-gray-200 rounded-md shadow-sm px-3 py-2 text-sm">
        <p className="font-medium">
          {formatLabel ? formatLabel(value) : value}
        </p>
        <p className="text-gray-600">{`${data.count} ${itemName}`}</p>
      </div>
    )
  }
  return null
}
