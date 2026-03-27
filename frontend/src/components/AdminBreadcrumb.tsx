import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type BreadcrumbItem = {
  label: string;
  to?: string;
};

type AdminBreadcrumbProps = {
  title: string;
  items: BreadcrumbItem[];
  rightSlot?: ReactNode;
};

export default function AdminBreadcrumb({
  title,
  items,
  rightSlot,
}: AdminBreadcrumbProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <nav className="text-xs uppercase tracking-wide text-gray-500">
          <ol className="flex flex-wrap items-center gap-2">
            {items.map((item, index) => {
              const isLast = index === items.length - 1;

              return (
                <li key={`${item.label}-${index}`} className="flex items-center gap-2">
                  {item.to && !isLast ? (
                    <Link to={item.to} className="hover:text-emerald-700 hover:underline">
                      {item.label}
                    </Link>
                  ) : (
                    <span className={isLast ? "font-semibold text-gray-700" : ""}>
                      {item.label}
                    </span>
                  )}
                  {!isLast && <span className="text-gray-400">/</span>}
                </li>
              );
            })}
          </ol>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      </div>

      {rightSlot ? <div>{rightSlot}</div> : null}
    </div>
  );
}
