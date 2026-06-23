import Transaction from "../../../domain/entities/transaction";

export interface PatientAppointmentDetailsDTO {
  _id: string;
  status: string;
  reason?: string;
  doctor: {
    id: string;
    name: string;
    specialization: string;
    profileImageUrl: string | null;
    contactPhone: string;
  };
  slot: {
    start: Date;
    consultationMode: string;
    consultationFee: number;
    supportedModes?: string[];
  };
  payment: {
    amount: number;
    status: string;
  } | null;
  refund?: {
    id: string;
    amount: number;
    status: string;
    createdAt: string;
  } | null;
  cancellationReason?: string | null;
}

export interface DoctorAppointmentDetailsDTO {
  id: string;
  patientId?: string;
  start: Date;
  end: Date;
  locationName: string;
  location: any; // Can be string or LocationInfo object
  mode: string;
  status: string;
  reason?: string;
  payment: any; // Can be Transaction or payment info object
  refund?: {
    id: string;
    amount: number;
    status: string;
    createdAt: string;
  } | null;
  patientName: string;
  dob?: Date;
  gender?: string;
  supportedModes?: string[];
  cancellationReason?: string | null;
}

export interface AdminAppointmentDetailsDTO {
  _id: string;
  id: string;
  status: string;
  reason?: string;
  createdAt: Date;
  patientFields: {
    name: string;
    email: string;
    profileImageUrl: string | null;
    id: string;
  };
  doctorFields: {
    name: string;
    email: string;
    profileImageUrl: string | null;
    id: string;
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
    status: string;
  } | null;
  allTransactions: Transaction[];
  cancellationReason?: string | null;
}
