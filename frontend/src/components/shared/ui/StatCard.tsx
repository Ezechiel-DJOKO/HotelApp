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
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  yellow: "bg-yellow-50 text-yellow-600",
  red: "bg-red-50 text-red-600",
  purple: "bg-purple-50 text-purple-600",
  gray: "bg-gray-50 text-gray-600",
};

export default function StatCard({
  label,
  value,
  icon,
  color = "blue",
  trend,
}: StatCardProps) {
  return (
    <Card hover>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900">
            {value}
          </p>
          {trend && (
            <p
              className={`text-xs mt-2 font-medium ${
                trend.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%{" "}
              <span className="text-gray-500 font-normal">{trend.label}</span>
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-lg ${colorStyles[color]}`}>{icon}</div>
        )}
      </div>
    </Card>
  );
}