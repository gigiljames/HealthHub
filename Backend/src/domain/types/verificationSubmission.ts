import { VerificationStatus } from "../enums/verificationStatus";

export type VerificationSubmission = {
  _id: string;
  status: VerificationStatus;
  remarks: string;
  submissionDate: Date;
  reviewDate: Date | null;
};
