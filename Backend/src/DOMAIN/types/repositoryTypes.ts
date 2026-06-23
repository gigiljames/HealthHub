import Transaction from "../entities/transaction";
import { AppointmentStatus } from "../enums/appointmentStatus";

export interface WalletWithUserAgg {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    profileImageUrl: string | null;
  };
  balance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionWithUserAgg {
  _id: string;
  direction: string;
  type: string;
  source: string;
  amount: number;
  currency: string;
  status: string;
  balanceAfter: number | null;
  walletId?: string;
  appointmentId?: string;
  payoutId?: string;
  userId?: string;
  gatewayRef?: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    profileImage?: string;
    profileImageUrl?: string;
    profileId?: string;
  } | null;
}

export interface PayoutAggregateDetailsAgg {
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
  appointments: Array<{
    _id: string;
    doctorId: string;
    patientId: string;
    slotId: string;
    status: AppointmentStatus;
    reason: string;
    paymentId: string;
    payoutId: string;
    cancellationReason: string;
    createdAt: string;
    updatedAt: string;
    patient: {
      _id: string;
      name: string;
      email: string;
    };
  }>;
}

export interface PatientAppointmentAggregateAgg {
  _id: string;
  status: string;
  reason?: string;
  doctor: {
    id: string;
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
  id: string;
  patientId?: string;
  start: Date;
  end: Date;
  locationName: string;
  location: string;
  mode: string;
  status: string;
  payment: Transaction | null;
  patientName: string;
  dob?: Date;
  gender?: string;
}

export interface AdminAppointmentAggregateAgg {
  _id: string;
  status: string;
  reason?: string;
  createdAt: Date;
  patientFields: {
    id: string;
    name: string;
    email: string;
    profileImageUrl: string | null;
  };
  doctorFields: {
    id: string;
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
    consultationModes?: string[];
  };
  payment: {
    amount: number;
    currency: string;
    status: string;
  } | null;
  allTransactions: Transaction[];
}

export interface DoctorAnalysisRawAgg {
  totals: Array<{
    totalAppointments: number;
    totalCompleted: number;
    cancelledByUser: number;
    cancelledByDoctor: number;
    totalNoShow: number;
    totalRevenue: number;
    paymentReceived: number;
    totalDurationMinutes: number;
    uniquePatients: string[];
  }>;
  appointmentTrend: Array<{
    _id: string;
    total: number;
  }>;
  modeDistribution: Array<{
    _id: string;
    count: number;
  }>;
  locationDistribution: Array<{
    _id: string;
    count: number;
  }>;
}

export interface DoctorDayExecutionAppointmentAgg {
  id: string;
  start: Date;
  end: Date;
  mode: string;
  status: AppointmentStatus;
  reason: string;
  patientName: string;
  dob: Date | null;
  gender: string | null;
  bloodGroup: string | null;
  profileImageUrl: string | null;
}
