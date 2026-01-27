import { useSelector } from "react-redux";
import type { RootState } from "../../../state/store";
import type { VerificationSubmission } from "../../../state/doctor/dProfileCreationSlice";
import { resubmitDoctorProfile } from "../../../api/doctor/dProfileCreationService";
import toast from "react-hot-toast";

function DProfileVerification() {
  const { verificationSubmissions, verificationStatus } = useSelector(
    (state: RootState) => state.dProfileCreation,
  );

  async function handleResubmit() {
    try {
      const data = await resubmitDoctorProfile();
      if (data?.success) {
        toast.success("Profile resubmitted successfully.");
      } else {
        throw new Error("Failed to resubmit profile.");
      }
    } catch (error) {
      toast.error(
        (error as Error)?.message || "An error occurred while resubmitting.",
      );
    }
  }
  return (
    <div className="bg-white rounded-2xl border-1 border-gray-200 p-8">
      <span className="uppercase font-semibold text-lg">Verification</span>
      <p>Current Status</p>
      {verificationStatus === "pending" && (
        <p>Your profile is pending for verification</p>
      )}
      {verificationStatus === "resubmitted" && (
        <p>Your profile is resubmitted for verification</p>
      )}
      {verificationStatus === "approved" && <p>Your profile is approved</p>}
      {verificationStatus === "rejected" && <p>Your profile is rejected</p>}
      <p>Verification Submissions</p>
      {verificationSubmissions.map((submission: VerificationSubmission) => (
        <div
          key={submission._id}
          className="border-1 border-gray-200 p-4 rounded-lg"
        >
          <p>Status: {submission.status}</p>
          <p>Remarks: {submission.remarks || "-"}</p>
          <p>
            Submission Date:{" "}
            {new Date(submission.submissionDate).toLocaleString("en-IN")}
          </p>
          <p>
            Review Date:{" "}
            {submission?.reviewDate
              ? new Date(submission?.reviewDate).toLocaleString("en-IN")
              : "Not Reviewed Yet"}
          </p>
        </div>
      ))}
      {verificationStatus === "rejected" && (
        <button
          className="bg-lightGreen text-white px-4 py-2 rounded-lg"
          onClick={handleResubmit}
        >
          Resubmit Profile for Verification
        </button>
      )}
    </div>
  );
}

export default DProfileVerification;
