/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetDashboardStatsQuery } from "@/redux/api/adminDashboardStats/adminDashboardStatsApi";
import { useAppSelector } from "@/redux/hook";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

type ShiftPoint = { month: string; shifts: number };

const MONTHS: string[] = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const Gradient = ({ id = "shiftGradient" }: { id?: string }) => (
  <defs>
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#4F46E54D" stopOpacity={1} />

      <stop offset="95%" stopColor="#4F46E500" stopOpacity={0.9} />
    </linearGradient>
  </defs>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const value = payload[0].value as number;
  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur p-2 shadow-lg border text-sm">
      <div className="font-medium">{label}</div>
      <div className="opacity-70">
        Shifts: <span className="font-semibold">{value}</span>
      </div>
    </div>
  );
};

export default function AdminDashboardSmoothAreaChart() {
  const token = useAppSelector((state) => state?.auth?.accessToken);

  const { data, isLoading, isError, error } = useGetDashboardStatsQuery(
    undefined,
    {
      skip: !token,
    }
  );

  // default dropdown to the current month
  const currentMonth = useMemo<string>(() => MONTHS[new Date().getMonth()], []);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);

  // build chart data for months up to the selected one
  const chartData: ShiftPoint[] = useMemo(() => {
    const base = data?.data?.chartData ?? [];
    const ordered = MONTHS.map(
      (m) => base.find((d) => d.month === m) || { month: m, shifts: 0 }
    );
    const lastIndex = MONTHS.indexOf(selectedMonth);
    return lastIndex >= 0 ? ordered.slice(0, lastIndex + 1) : ordered;
  }, [data, selectedMonth]);

  return (
    <Card className="w-full border-0 shadow-none p-4 mt-6">
      <CardContent className="p-0">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Shifts this year
            </h2>
            <p className="text-sm text-muted-foreground">
              Cumulative view up to selected month
            </p>
          </div>

          <Select
            value={selectedMonth}
            onValueChange={(v) => setSelectedMonth(v)}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="h-64 w-full"
        >
          {(!token || isLoading) && (
            <div className="h-full w-full animate-pulse rounded-2xl bg-linear-to-b from-gray-100 to-gray-50" />
          )}
          {token && isError && (
            <div className="h-full grid place-items-center text-sm text-red-500">
              Failed to load stats. {String((error as any)?.status || "")}
            </div>
          )}
          {token && !isLoading && !isError && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 0, left: 0, bottom: 22 }}
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  className="opacity-40"
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  tickMargin={10}
                  padding={{ left: 16, right: 16 }}
                  tickFormatter={(m: string) => m.slice(0, 3)}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ strokeOpacity: 0.2 }}
                />
                <Gradient />
                <Area
                  type="monotone"
                  dataKey="shifts"
                  stroke="#0066FF"
                  strokeWidth={2}
                  activeDot={{ r: 5 }}
                  fill="url(#shiftGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </CardContent>
    </Card>
  );
}
