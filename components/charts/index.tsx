"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { axisTickStyle, chartPalette, colors } from "@/lib/theme";
import { ChartTooltip } from "@/components/charts/ChartTooltip";

export type ChartPoint = Record<string, string | number | null>;

export type Series = {
  dataKey: string;
  name: string;
  color?: string;
};

const axisProps = {
  tick: axisTickStyle,
  tickLine: false as const,
  axisLine: { stroke: colors.border },
};

function Grid() {
  return (
    <CartesianGrid stroke={chartPalette.grid} strokeDasharray="0" vertical={false} />
  );
}

export function AppLineChart({
  data,
  xKey,
  series,
  yDomain,
}: {
  data: ChartPoint[];
  xKey: string;
  series: Series[];
  yDomain?: [number | "auto", number | "auto"];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <Grid />
        <XAxis dataKey={xKey} {...axisProps} />
        <YAxis domain={yDomain} width={44} {...axisProps} />
        <Tooltip content={ChartTooltip} />
        {series.map((s, i) => (
          <Line
            key={s.dataKey}
            type="monotone"
            dataKey={s.dataKey}
            name={s.name}
            stroke={s.color ?? (i === 0 ? chartPalette.primary : chartPalette.accent)}
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3, fill: colors.ubsRed, stroke: colors.white }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function AppAreaChart({
  data,
  xKey,
  series,
}: {
  data: ChartPoint[];
  xKey: string;
  series: Series[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <Grid />
        <XAxis dataKey={xKey} {...axisProps} />
        <YAxis width={44} {...axisProps} />
        <Tooltip content={ChartTooltip} />
        {series.map((s, i) => (
          <Area
            key={s.dataKey}
            type="monotone"
            dataKey={s.dataKey}
            name={s.name}
            stroke={s.color ?? (i === 0 ? chartPalette.primary : chartPalette.accent)}
            fill={s.color ?? (i === 0 ? chartPalette.primary : chartPalette.accent)}
            fillOpacity={0.08}
            strokeWidth={1.5}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function AppBarChart({
  data,
  xKey,
  series,
  layout = "horizontal",
}: {
  data: ChartPoint[];
  xKey: string;
  series: Series[];
  layout?: "horizontal" | "vertical";
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout={layout}
        margin={{ top: 8, right: 12, left: 8, bottom: 0 }}
      >
        <Grid />
        {layout === "vertical" ? (
          <>
            <XAxis type="number" {...axisProps} />
            <YAxis type="category" dataKey={xKey} width={72} {...axisProps} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} {...axisProps} />
            <YAxis width={44} {...axisProps} />
          </>
        )}
        <Tooltip content={ChartTooltip} />
        {series.map((s, i) => (
          <Bar
            key={s.dataKey}
            dataKey={s.dataKey}
            name={s.name}
            fill={s.color ?? (i === 0 ? colors.ink : colors.ubsRed)}
            radius={[0, 0, 0, 0]}
            maxBarSize={28}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export type CandlePoint = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

export function AppCandlestickChart({ data }: { data: CandlePoint[] }) {
  if (!data.length) {
    return null;
  }

  const width = 900;
  const height = 280;
  const padding = 36;
  const min = Math.min(...data.map((point) => point.low)) * 0.99;
  const max = Math.max(...data.map((point) => point.high)) * 1.01;
  const xStep = (width - padding * 2) / data.length;
  const yTicks = 4;
  const priceToY = (value: number) => {
    const ratio = (max - value) / (max - min || 1);
    return padding + ratio * (height - padding * 2);
  };
  const tickValues = Array.from({ length: yTicks + 1 }, (_, index) => max - ((max - min) * index) / yTicks);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-80 w-full" role="img" aria-label="Candlestick chart">
      {tickValues.map((tick) => {
        const y = priceToY(tick);
        return (
          <g key={`tick-${tick}`}>
            <line x1={padding} x2={width - padding} y1={y} y2={y} stroke={chartPalette.grid} strokeWidth={1} />
            <text x={padding - 8} y={y + 4} textAnchor="end" fontSize="10" fill={colors.muted}>
              {tick.toFixed(2)}
            </text>
          </g>
        );
      })}
      {data.map((point, index) => {
        const x = padding + index * xStep + xStep / 2;
        const wickTop = priceToY(point.high);
        const wickBottom = priceToY(point.low);
        const bodyTop = priceToY(Math.max(point.open, point.close));
        const bodyBottom = priceToY(Math.min(point.open, point.close));
        const bodyHeight = Math.max(3, Math.abs(bodyBottom - bodyTop));
        const bodyWidth = Math.max(3, Math.min(9, xStep * 0.34));
        const isUp = point.close >= point.open;

        return (
          <g key={`${point.date}-${index}`}>
            <line
              x1={x}
              x2={x}
              y1={wickTop}
              y2={wickBottom}
              stroke={colors.ink}
              strokeWidth={2}
              opacity={0.7}
            />
            <rect
              x={x - bodyWidth / 2}
              y={bodyTop}
              width={bodyWidth}
              height={bodyHeight}
              rx={0}
              fill={isUp ? colors.positive : colors.ubsRed}
              opacity={0.9}
            />
          </g>
        );
      })}
    </svg>
  );
}

export type DonutSlice = { name: string; value: number };

export function AppDonutChart({
  data,
  innerRadius = "58%",
}: {
  data: DonutSlice[];
  innerRadius?: string | number;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={innerRadius}
          outerRadius="80%"
          paddingAngle={1}
          stroke={colors.white}
          strokeWidth={1}
        >
          {data.map((entry, i) => (
            <Cell
              key={entry.name}
              fill={chartPalette.slices[i % chartPalette.slices.length]}
            />
          ))}
        </Pie>
        <Tooltip content={ChartTooltip} />
        <Legend
          iconType="square"
          iconSize={8}
          formatter={(value) => (
            <span className="text-2xs uppercase tracking-label text-ink">
              {value}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
