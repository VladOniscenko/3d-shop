export interface OrderCommunication {
  id: string;
  channel: string;
  communicationType: string;
  subject: string;
  recipientEmail: string;
  sentAt: string;
}

export interface OrderStatusHistoryEntry {
  id: string;
  previousStatus?: string | null;
  newStatus: string;
  changedAt: string;
  changedBy?: string | null;
  note?: string | null;
}
