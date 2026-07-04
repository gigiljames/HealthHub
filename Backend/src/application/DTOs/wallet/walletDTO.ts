export interface WalletDetailsDTO {
  _id: string;
  balance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    profileImageUrl: string | null;
  };
}
