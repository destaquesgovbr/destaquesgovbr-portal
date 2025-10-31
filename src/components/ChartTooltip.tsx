type ChartTooltipProps = {
  active?: any
  payload?: any
  dataKey: string
  itemName?: string | null
  formatLabel?: (label: string) => any
}

export const ChartTooltip = ({ active, payload, dataKey, itemName, formatLabel }: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div className="bg-white border border-gray-200 rounded-md shadow-sm px-3 py-2 text-sm">
        <p className="font-medium">
          {formatLabel ? formatLabel(data[dataKey]) : data[dataKey]}
        </p>
        <p className="text-gray-600">{`${data.count} ${itemName}`}</p>
      </div>
    );
  }
  return null;
};
