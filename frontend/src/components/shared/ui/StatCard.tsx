import { ReactNode } from "react";
import Card from "./Card";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  color?: "blue" | "green" | "yellow" | "red" | "purple" | "gray";
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
}

const colorStyles = {
  blue: {
    iconBg: "bg-blue-50 dark:bg-blue-500/20",
    iconText: "text-blue-600",
  },
  green: {
    iconBg: "bg-green-50 dark:bg-green-500/20",
    iconText: "text-green-600",
  },
  yellow: {
    iconBg: "bg-yellow-50 dark:bg-yellow-500/20",
    iconText: "text-yellow-600",
  },
  red: {
    iconBg: "bg-red-50 dark:bg-red-500/20",
    iconText: "text-red-600",
  },
  purple: {
    iconBg: "bg-purple-50 dark:bg-purple-500/20",
    iconText: "text-purple-600",
  },
  gray: {
    iconBg: "bg-gray-50 dark:bg-gray-500/20",
    iconText: "text-gray-600",
  },
};

export default function StatCard({
  label,
  value,
  icon,
  color = "blue",
  trend,
}: StatCardProps) {
  const styles = colorStyles[color];

  return (
    <Card hover>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
            {label}
          </p>
          <p className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
            {value}
          </p>
          {trend && (
            <p
              className={`text-xs mt-2 font-medium ${
                trend.isPositive
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%{" "}
              <span className="text-slate-500 dark:text-slate-400 font-normal">
                {trend.label}
              </span>
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-lg ${styles.iconBg} ${styles.iconText}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}