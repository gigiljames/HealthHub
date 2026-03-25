export interface PatientAppointmentDetailsDTO {
  _id: string;
  status: string;
  reason?: string;
  doctor: {
    name: string;
    specialization: string;
    profileImageUrl: string | null;
    contactPhone: string;
  };
  slot: {
    start: Date;
    consultationMode: string;
    consultationFee: number;
  };
  payment: {
    amount: number;
    status: string;
  } | null;
}

export interface DoctorAppointmentDetailsDTO {
  id: string;
  start: Date;
  end: Date;
  locationName: string;
  location: string;
  mode: string;
  status: string;
  reason?: string;
  payment: any | null;
  patientName: string;
  dob?: Date;
  gender?: string;
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
  allTransactions: any[];
}
