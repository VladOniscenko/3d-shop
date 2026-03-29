export interface Order {
  id: string;
  userId: string;
  status:
    | "pending_quote"
    | "quoted"
    | "expired_quote"
    | "pending_payment"
    | "printing"
    | "completed"
    | "shipped"
    | "sent"
    | "delivered"
    | "paid"
    | "failed"
    | "cancelled";
  orderType: "quote" | "online";
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  phoneNumber: string;
  deliveryPrice?: number;
  orderDiscountAmount?: number;
  subtotalAmount?: number;
  discountAmount?: number;
  finalTotalAmount?: number;
  quotedPrice?: number;
  quoteMessage?: string;
  quoteConfirmedAt?: string;
  quoteExpiresAt?: string;
  trackingCode?: string;
  trackingUrl?: string;
  internalNotes?: string;
  customerNotes?: string;
  isPaid?: boolean;
  updatedAt?: string;
  createdAt: string;
  items: OrderItem[];
  payments?: PaymentAttempt[];
}

export interface PaymentAttempt {
  id: string;
  orderId: string;
  provider: string;
  reference: string;
  providerPaymentId?: string;
  currency: string;
  amount: number;
  status: string;
  checkoutUrl?: string;
  method?: string;
  failureReason?: string;
  paidAt?: string;
  canceledAt?: string;
  expiredAt?: string;
  failedAt?: string;
  lastWebhookAt?: string;
  webhookAttemptCount?: number;
  lastWebhookPayloadHash?: string;
  lastWebhookError?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OrderItem {
  id?: string;
  orderId?: string;
  productId?: string;
  imageUrl: string;
  fileUrl?: string;
  fileName: string;
  notes?: string;
  material: string;
  color: string;
  price: number;
  count: number;
}
