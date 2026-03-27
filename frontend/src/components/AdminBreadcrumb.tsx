import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

type BreadcrumbItem = {
  label: string;
  to?: string;
};

type AdminBreadcrumbProps = {
  title: string;
  items: BreadcrumbItem[];
  rightSlot?: ReactNode;
};

const adminNavLinks = [
  { label: "Dashboard", to: "/admin" },
  { label: "Orders", to: "/admin/orders" },
  { label: "Users", to: "/admin/users" },
  { label: "Products", to: "/admin/products" },
  { label: "Filaments", to: "/admin/filaments" },
];

export default function AdminBreadcrumb({
  title,
  items,
  rightSlot,
}: AdminBreadcrumbProps) {
  const { pathname } = useLocation();

  const isActive = (to: string) => {
    if (to === "/admin") return pathname === "/admin";
    return pathname === to || pathname.startsWith(`${to}/`);
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <nav className="text-xs uppercase tracking-wide text-gray-500">
            <ol className="flex flex-wrap items-center gap-2">
              {items.map((item, index) => {
                const isLast = index === items.length - 1;

                return (
                  <li
                    key={`${item.label}-${index}`}
                    className="flex items-center gap-2"
                  >
                    {item.to && !isLast ? (
                      <Link
                        to={item.to}
                        className="hover:text-emerald-700 hover:underline"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span
                        className={isLast ? "font-semibold text-gray-700" : ""}
                      >
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

      <nav className="bg-white border border-gray-200 rounded-2xl p-2 shadow-sm">
        <ul className="flex flex-wrap gap-2">
          {adminNavLinks.map((link) => {
            const active = isActive(link.to);

            return (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`inline-flex items-center rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-emerald-600 text-white shadow"
                      : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
