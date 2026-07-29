import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function PageHeader({
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 lg:mb-8">
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1">
          {title}
        </h1>
        {description && (
          <p className="text-sm lg:text-base text-slate-600">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}