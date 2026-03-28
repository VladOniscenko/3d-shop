import type { OrderCommunication, OrderStatusHistoryEntry } from "./types";

interface OrderHistoryPanelProps {
  t: (key: string) => string;
  statusHistory: OrderStatusHistoryEntry[];
  communications: OrderCommunication[];
}

export default function OrderHistoryPanel({
  t,
  statusHistory,
  communications,
}: OrderHistoryPanelProps) {
  return (
    <>
      <article className="admin-panel p-4">
        <h3 className="font-bold mb-2 text-[#1b2b25]">
          {t("admin.orderDetail.statusHistoryTitle")}
        </h3>
        {statusHistory.length === 0 ? (
          <p className="admin-note">
            {t("admin.orderDetail.noStatusChangesMessage")}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-[#5f736d] border-b border-[#d9e4df]">
                  <th className="py-2 pr-3">
                    {t("admin.orderDetail.changedAtColumn")}
                  </th>
                  <th className="py-2 pr-3">
                    {t("admin.orderDetail.fromColumn")}
                  </th>
                  <th className="py-2 pr-3">
                    {t("admin.orderDetail.toColumn")}
                  </th>
                  <th className="py-2 pr-3">
                    {t("admin.orderDetail.byColumn")}
                  </th>
                  <th className="py-2">{t("admin.orderDetail.noteColumn")}</th>
                </tr>
              </thead>
              <tbody>
                {statusHistory.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-[#eef4f1] text-[#304843]"
                  >
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {new Date(entry.changedAt).toLocaleString()}
                    </td>
                    <td className="py-2 pr-3">{entry.previousStatus || "-"}</td>
                    <td className="py-2 pr-3 font-semibold">
                      {entry.newStatus}
                    </td>
                    <td className="py-2 pr-3">{entry.changedBy || "-"}</td>
                    <td className="py-2">{entry.note || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>

      <article className="admin-panel p-4">
        <h3 className="font-bold mb-2 text-[#1b2b25]">
          {t("admin.orderDetail.communicationHistoryTitle")}
        </h3>
        {communications.length === 0 ? (
          <p className="admin-note">
            {t("admin.orderDetail.noCommunicationMessage")}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-[#5f736d] border-b border-[#d9e4df]">
                  <th className="py-2 pr-3">
                    {t("admin.orderDetail.sentAtColumn")}
                  </th>
                  <th className="py-2 pr-3">
                    {t("admin.orderDetail.typeColumn")}
                  </th>
                  <th className="py-2 pr-3">
                    {t("admin.orderDetail.channelColumn")}
                  </th>
                  <th className="py-2 pr-3">
                    {t("admin.orderDetail.recipientColumn")}
                  </th>
                  <th className="py-2">
                    {t("admin.orderDetail.subjectColumn")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {communications.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-[#eef4f1] text-[#304843]"
                  >
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {new Date(entry.sentAt).toLocaleString()}
                    </td>
                    <td className="py-2 pr-3">{entry.communicationType}</td>
                    <td className="py-2 pr-3">{entry.channel}</td>
                    <td className="py-2 pr-3">{entry.recipientEmail}</td>
                    <td className="py-2">{entry.subject}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </>
  );
}
