export interface SubmitDisputeDTO {
  appointmentId: string;
  reason: string;
  description: string;
  evidence: Array<{
    key: string;
    name: string;
    type: string;
  }>;
}

export interface DisputeResponseDTO {
  id: string;
  appointmentId: string;
  reporterId: string;
  reportedUserId: string;
  reason: string;
  description: string;
  evidence: Array<{
    key: string;
    name: string;
    type: string;
  }>;
  status: "OPEN" | "UNDER_REVIEW" | "RESOLVED";
  resolutionMessage: string | null;
  resolvedBy: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DisputeListItemDTO {
  id: string;
  createdAt: string;
  reporterId: string;
  reporterName: string;
  reporterRole: string;
  reportedUserId: string;
  reportedUserName: string;
  reportedUserRole: string;
  reason: string;
  status: string;
}

export interface GetAdminDisputesRequestDTO {
  search?: string;
  reporterRole?: string;
  reportedUserRole?: string;
  status?: string;
  timeRange?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface GetAdminDisputesResponseDTO {
  disputes: DisputeListItemDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DisputeDetailsDTO {
  dispute: DisputeResponseDTO;
  reporter: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  reportedUser: {
    id: string;
    name: string;
    email: string;
    role: string;
    currentAccountStatus: string;
  };
  appointment: {
    id: string;
    start: string;
    end: string;
    consultationMode: string;
    status: string;
    practiceLocation?: {
      name: string;
      address: string;
    } | null;
    isRefunded?: boolean;
    refundDetails?: {
      transactionId: string;
      amount: number;
      status: string;
      createdAt: string;
    } | null;
    cancellationReason?: string | null;
  };
  medicalReports: Array<{
    id: string;
    chiefComplaint: string;
    diagnosis: string;
    clinicalNotes: string;
    createdAt: string;
  }>;
  chatHistory: Array<{
    id?: string;
    senderId: string;
    senderRole: string;
    senderName: string;
    timestamp: string;
    text: string | null;
    isDeleted: boolean;
    file?: {
      key: string;
      name: string;
      type: string;
      size: number;
      url?: string;
      downloadUrl?: string;
    };
  }>;
}

export interface ResolveDisputeDTO {
  disputeId: string;
  resolutionMessage: string;
  resolvedBy: string;
}

export interface EnforceModerationActionDTO {
  targetUserId: string;
  actionType: "disable_bookings" | "suspend" | "ban" | "restore_access" | "lift_suspension" | "lift_ban" | "restore_all_access";
  suspensionDays?: number;
  reason: string;
  adminId: string;
}
