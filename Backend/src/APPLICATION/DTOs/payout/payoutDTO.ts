export interface ProcessPayoutResponseDTO {
  status: "NO_PAYOUT_NEEDED" | "SUCCESS" | "FAILED";
  message?: string;
  payoutId?: string;
}

export interface PayoutDetailsDTO {
  _id: string;
  amount: number;
  grossAmount: number;
  platformCommissions: number;
  currency: string;
  status: string;
  createdAt: Date;
  doctor: {
    id: string;
    name: string;
    email: string;
    phone: string;
    specialization: string;
  } | null;
  transaction: {
    id: string;
    amount: number;
    status: string;
    createdAt: Date;
  } | null;
  appointments: any[];
}
