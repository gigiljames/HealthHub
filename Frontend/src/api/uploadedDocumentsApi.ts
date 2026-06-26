import api from "./axios";
import { ROUTES } from "../constants/routes";

export const getPatientDocumentUploadSignedUrl = async (fileName: string, contentType: string) => {
  const response = await api.post(ROUTES.S3.GET_PATIENT_DOCUMENT_UPLOAD_SIGNED_URL, {
    fileName,
    contentType,
  });
  return response.data;
};

export const createUploadedDocument = async (data: {
  title: string;
  category: string;
  customCategory?: string;
  specializationId?: string;
  customSpecialization?: string;
  fileKey: string;
  thumbnailKey: string;
  reportDate: string;
}) => {
  const response = await api.post(ROUTES.USER.CREATE_UPLOADED_DOCUMENT, data);
  return response.data;
};

export const listUploadedDocuments = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  specialization?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: string;
  patientId?: string;
}) => {
  const response = await api.get(ROUTES.USER.GET_UPLOADED_DOCUMENTS, { params });
  return response.data;
};

export const getUploadedDocument = async (id: string) => {
  const response = await api.get(ROUTES.USER.GET_UPLOADED_DOCUMENT.replace(":id", id));
  return response.data;
};

export const updateUploadedDocument = async (
  id: string,
  data: {
    title?: string;
    category?: string;
    customCategory?: string;
    specializationId?: string;
    customSpecialization?: string;
    reportDate?: string;
  }
) => {
  const response = await api.patch(
    ROUTES.USER.UPDATE_UPLOADED_DOCUMENT.replace(":id", id),
    data
  );
  return response.data;
};

export const deleteUploadedDocument = async (id: string) => {
  const response = await api.delete(
    ROUTES.USER.DELETE_UPLOADED_DOCUMENT.replace(":id", id)
  );
  return response.data;
};
