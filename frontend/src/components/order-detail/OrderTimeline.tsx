import { CheckCircle2, Clock, FileText, Truck } from "lucide-react";
import type { ReactNode } from "react";
import type { TranslateFn } from "./types";

interface OrderTimelineProps {
  statusStep: number;
  reachedDate: string;
  t: TranslateFn;
}

export default function OrderTimeline({
  statusStep,
  reachedDate,
  t,
}: OrderTimelineProps) {
  return (
    <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
      <h3 className="font-bold text-lg mb-8">{t("orderDetail.timeline")}</h3>
      <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:w-0.5 before:bg-gray-100">
        <TimelineItem
          icon={<FileText size={16} />}
          title={t("orderDetail.quoteRequested")}
          date={statusStep >= 1 ? reachedDate : t("orderDetail.pending")}
          active={statusStep >= 1}
        />
        <TimelineItem
          icon={<Clock size={16} />}
          title={t("orderStatus.quoted")}
          date={statusStep >= 2 ? reachedDate : t("orderDetail.pending")}
          active={statusStep >= 2}
        />
        <TimelineItem
          icon={<CheckCircle2 size={16} />}
          title={t("orderStatus.paid")}
          date={statusStep >= 3 ? reachedDate : t("orderDetail.pending")}
          active={statusStep >= 3}
        />
        <TimelineItem
          icon={<Clock size={16} />}
          title={t("orderDetail.printing")}
          date={statusStep >= 4 ? reachedDate : t("orderDetail.pending")}
          active={statusStep >= 4}
        />
        <TimelineItem
          icon={<CheckCircle2 size={16} />}
          title={t("orderDetail.completed")}
          date={statusStep >= 5 ? reachedDate : t("orderDetail.pending")}
          active={statusStep >= 5}
        />
        <TimelineItem
          icon={<Truck size={16} />}
          title={t("orderStatus.sent")}
          date={statusStep >= 6 ? reachedDate : t("orderDetail.pending")}
          active={statusStep >= 6}
        />
      </div>
    </div>
  );
}

interface TimelineItemProps {
  icon: ReactNode;
  title: string;
  date: string;
  active: boolean;
}

function TimelineItem({ icon, title, date, active }: TimelineItemProps) {
  return (
    <div className="relative flex items-center gap-6">
      <div
        className={`z-10 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-colors ${active ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-400"}`}
      >
        {icon}
      </div>
      <div>
        <p
          className={`font-bold text-sm ${active ? "text-gray-900" : "text-gray-400"}`}
        >
          {title}
        </p>
        <p className="text-xs text-gray-400">{date}</p>
      </div>
    </div>
  );
}
