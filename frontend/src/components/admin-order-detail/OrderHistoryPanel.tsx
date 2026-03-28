import type {
  OrderCommunication,
  OrderStatusHistoryEntry,
} from "./types";

interface OrderHistoryPanelProps {
  statusHistory: OrderStatusHistoryEntry[];
  communications: OrderCommunication[];
}

export default function OrderHistoryPanel({
  statusHistory,
  communications,
}: OrderHistoryPanelProps) {
  return (
    <>
      <article className="admin-panel p-4">
        <h3 className="font-bold mb-2 text-[#1b2b25]">Status History</h3>
        {statusHistory.length === 0 ? (
          <p className="admin-note">No status changes recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-[#5f736d] border-b border-[#d9e4df]">
                  <th className="py-2 pr-3">Changed At</th>
                  <th className="py-2 pr-3">From</th>
                  <th className="py-2 pr-3">To</th>
                  <th className="py-2 pr-3">By</th>
                  <th className="py-2">Note</th>
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
                    <td className="py-2 pr-3 font-semibold">{entry.newStatus}</td>
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
        <h3 className="font-bold mb-2 text-[#1b2b25]">Communication History</h3>
        {communications.length === 0 ? (
          <p className="admin-note">No communication has been sent yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-[#5f736d] border-b border-[#d9e4df]">
                  <th className="py-2 pr-3">Sent At</th>
                  <th className="py-2 pr-3">Type</th>
                  <th className="py-2 pr-3">Channel</th>
                  <th className="py-2 pr-3">Recipient</th>
                  <th className="py-2">Subject</th>
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
