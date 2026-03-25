export interface TransactionDetailsDTO {
  _id: string;
  direction: string;
  type: string;
  source: string;
  amount: number;
  currency: string;
  status: string;
  walletId?: string;
  appointmentId?: string;
  payoutId?: string;
  gatewayRef?: string;
  createdAt: Date;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    profileImageUrl: string | null;
  } | null;
}
