export interface PaymentDetail {
  statusDetail?: string;
  [key: string]: unknown;
}

export interface TransactionData {
  userId: string;
  itemId: string;
  itemName: string;
  amount: number;
  paymentMethod: string;
  status: string;
  createdAt: Date | string | unknown;
  updatedAt: Date | string | unknown;
  paymentDetail?: PaymentDetail;
}
