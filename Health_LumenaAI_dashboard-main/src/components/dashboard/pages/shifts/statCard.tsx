import type { ComponentType, SVGProps } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  iconColor?: string;
  iconBg?: string;
}

export const StatCard = ({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBg,
}: StatCardProps) => (
  <div className="bg-white rounded-lg p-5 sm:p-6 shadow-sm border border-gray-200">
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-gray-600 text-sm">{title}</span>
      <span className={`p-2 rounded-lg ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </span>
    </div>
    <div className="text-xl sm:text-2xl font-bold text-gray-900">{value}</div>
  </div>
);