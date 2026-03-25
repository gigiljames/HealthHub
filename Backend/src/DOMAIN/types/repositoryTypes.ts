export type RepositorySession = any; // Opaque type for database session/transaction

export interface WalletWithUserAgg {
  _id: any;
  user: {
    _id: any;
    name: string;
    email: string;
    role: string;
  };
  balance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionWithUserAgg {
  _id: any;
  direction: string;
  type: string;
  source: string;
  amount: number;
  currency: string;
  status: string;
  balanceAfter: number | null;
  walletId?: any;
  appointmentId?: any;
  payoutId?: any;
  userId?: any;
  gatewayRef?: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    _id: any;
    name: string;
    email: string;
    role: string;
    profileImage?: string;
    profileImageUrl?: string;
    profileId?: any;
  } | null;
}

export interface PayoutAggregateDetailsAgg {
  _id: any;
  amount: number;
  grossAmount: number;
  platformCommissions: number;
  currency: string;
  status: string;
  createdAt: Date;
  doctor: {
    id: any;
    name: string;
    email: string;
    phone: string;
    specialization: string;
  } | null;
  transaction: {
    id: any;
    amount: number;
    status: string;
    createdAt: Date;
  } | null;
  appointments: Array<{
    _id: any;
    doctorId: any;
    patientId: any;
    slotId: any;
    status: string;
    patient: {
      _id: any;
      name: string;
    };
  }>;
}

export interface PatientAppointmentAggregateAgg {
  _id: any;
  status: string;
  reason?: string;
  doctor: {
    name: string;
    specialization: string;
    profileImageUrl?: string | null;
    contactPhone: string;
  };
  slot: {
    start: Date;
    consultationMode: string;
    consultationFee: number;
  };
  payment: {
    amount: number;
    currency: string;
    status: string;
  } | null;
}

export interface DoctorAppointmentAggregateAgg {
  id: any;
  start: Date;
  end: Date;
  locationName: string;
  location: string;
  mode: string;
  status: string;
  payment: any | null;
  patientName: string;
  dob?: Date;
  gender?: string;
}

export interface AdminAppointmentAggregateAgg {
  _id: any;
  status: string;
  reason?: string;
  createdAt: Date;
  patientFields: {
    id: any;
    name: string;
    email: string;
    profileImageUrl: string | null;
  };
  doctorFields: {
    id: any;
    name: string;
    email: string;
    profileImageUrl: string | null;
  };
  slot: {
    start: Date;
    end: Date;
    consultationMode: string;
    consultationFee?: number;
    locationName?: string;
    location?: string;
  };
  payment: {
    amount: number;
    currency: string;
    status: string;
  } | null;
  allTransactions: any[];
}
