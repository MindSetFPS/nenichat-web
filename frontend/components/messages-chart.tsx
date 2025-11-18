"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { IMessagesReport } from "@/repository/IMessagesReport";

interface MessagesChartProps {
  data: IMessagesReport[];
}

export function MessagesChart({ data }: MessagesChartProps) {
  const chartConfig = {
    messages: {
      label: "Messages",
      color: "hsl(220, 98%, 61%)",
    },
  };

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Bar dataKey="count" fill="var(--color-messages)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
