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
