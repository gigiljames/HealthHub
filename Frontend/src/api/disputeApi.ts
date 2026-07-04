import api from "./axios";

export interface SubmitDisputeData {
  appointmentId: string;
  reason: string;
  description: string;
  evidence: Array<{ key: string; name: string; type: string }>;
}

export const submitDispute = async (data: SubmitDisputeData) => {
  const response = await api.post("/disputes/submit", data);
  return response.data;
};

export const getAppointmentDispute = async (appointmentId: string) => {
  const response = await api.get(`/disputes/appointment/${appointmentId}`);
  return response.data;
};

export const getDisputeEvidenceUploadSignedUrl = async (fileName: string, contentType: string) => {
  const response = await api.post("/disputes/evidence-upload-url", { fileName, contentType });
  return response.data;
};

export const getAdminDisputes = async (params: {
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
}) => {
  const response = await api.get("/admin/disputes", { params });
  return response.data;
};

export const getDisputeDetails = async (disputeId: string) => {
  const response = await api.get(`/admin/disputes/${disputeId}`);
  return response.data;
};

export const updateDisputeStatus = async (
  disputeId: string,
  status: "OPEN" | "UNDER_REVIEW" | "RESOLVED",
  resolutionMessage?: string,
) => {
  const response = await api.patch(`/admin/disputes/${disputeId}/status`, {
    status,
    resolutionMessage,
  });
  return response.data;
};

export const enforceModerationAction = async (
  targetUserId: string,
  actionType: "disable_bookings" | "suspend" | "ban" | "restore_access" | "lift_suspension" | "lift_ban" | "restore_all_access",
  reason: string,
  suspensionDays?: number,
) => {
  const response = await api.post(`/admin/users/${targetUserId}/moderation`, {
    actionType,
    suspensionDays,
    reason,
  });
  return response.data;
};

export const getAdminFileAccessUrl = async (key: string, download = false) => {
  const response = await api.get(`/admin/disputes/file-access-url`, {
    params: { key, download },
  });
  return response.data;
};
