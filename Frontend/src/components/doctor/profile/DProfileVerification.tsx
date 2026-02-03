import { useSelector } from "react-redux";
import type { RootState } from "../../../state/store";
import type { VerificationSubmission } from "../../../state/doctor/dProfileCreationSlice";
import { resubmitDoctorProfile } from "../../../api/doctor/dProfileCreationService";
import toast from "react-hot-toast";
import getIcon from "../../../helpers/getIcon";
import { getStatusBadge } from "../../../helpers/getStatusBadge";

function DProfileVerification() {
  const { verificationSubmissions, verificationStatus } = useSelector(
    (state: RootState) => state.dProfileCreation,
  );
  let submissions = [...verificationSubmissions].map((val) => {
    return {
      ...val,
      date: new Date(val.submissionDate),
    };
  });
  submissions.sort((a, b) => b.date.getTime() - a.date.getTime());

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
      <div className="flex justify-between items-center mb-6">
        <span className="uppercase font-semibold text-lg">Verification</span>
        {verificationStatus === "rejected" && (
          <button
            onClick={handleResubmit}
            className="flex items-center gap-2 bg-darkGreen text-white px-4 py-2 rounded-lg font-medium hover:-translate-y-0.5 transition-all duration-200"
          >
            {getIcon("refresh", "20px", "white")}
            Resubmit Profile
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {/* Current Status Section */}
        <div className="mb-2">
          <h3 className="font-semibold text-gray-700 mb-2">Current Status</h3>
          <div
            className={`p-4 rounded-xl ${
              verificationStatus === "verified"
                ? "bg-green-100 border-1 border-green-300"
                : verificationStatus === "rejected"
                  ? "bg-red-100 border-1 border-red-300"
                  : verificationStatus === "pending"
                    ? "bg-yellow-100 border-1 border-yellow-300"
                    : "bg-blue-100 border-1 border-blue-300"
            }`}
          >
            <div className="flex items-center">
              <div className="flex flex-col gap-1">
                {verificationStatus === "verified" && (
                  <p className="text-green-600 font-semibold text-xl">
                    Your profile has been verified
                  </p>
                )}
                {verificationStatus === "rejected" && (
                  <p className="text-red-600 font-semibold text-xl">
                    Your profile has been rejected
                  </p>
                )}
                {verificationStatus === "pending" && (
                  <p className="text-yellow-600 font-semibold text-xl">
                    Pending
                  </p>
                )}
                {verificationStatus === "resubmitted" && (
                  <p className="text-blue-600 font-semibold text-xl">
                    Your profile has been resubmitted
                  </p>
                )}
                <p className="text-sm text-gray-500 ">
                  {verificationStatus === "pending" &&
                    "Your profile is currently under review by our administrators."}
                  {verificationStatus === "resubmitted" &&
                    "Your profile has been resubmitted and is awaiting review."}
                  {verificationStatus === "verified" &&
                    "Congratulations! Your profile has been verified and is now visible to patients."}
                  {verificationStatus === "rejected" &&
                    "Your profile verification was rejected. Please review the remarks and resubmit."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Verification History Section */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">
            Submission History
          </h3>
          {verificationSubmissions.length === 0 ? (
            <div className="text-center text-gray-500 py-8 border-dashed border-2 border-gray-200 rounded-xl">
              No submission history available.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {submissions.map((submission: VerificationSubmission) => (
                <div
                  key={submission._id}
                  className="flex md:flex-row p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors gap-4"
                >
                  <div className=" rounded-lg flex items-start justify-center text-2xl">
                    {submission.status === "verified" && (
                      <div className="text-green-400 bg-green-100 p-2 rounded-lg">
                        {getIcon("tick")}
                      </div>
                    )}
                    {submission.status === "rejected" && (
                      <div className="text-red-500 bg-red-100 p-2 rounded-lg">
                        {getIcon("cancel")}
                      </div>
                    )}
                    {submission.status === "resubmitted" && (
                      <div className="text-blue-500 bg-blue-100 p-2 rounded-lg">
                        {getIcon("refresh")}
                      </div>
                    )}
                    {submission.status === "pending" && (
                      <div className="text-yellow-500 bg-yellow-100 p-2 rounded-lg">
                        {getIcon("hour-glass")}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        {getStatusBadge(submission.status)}
                      </div>
                    </div>
                    <div className="grid grid-cols-2">
                      <div className="flex flex-col gap-1 min-w-[150px]">
                        <span className="text-xs text-gray-400 font-medium">
                          Submitted On
                        </span>
                        <span className="text-sm text-gray-600">
                          {submission.submissionDate
                            ? new Date(
                                submission.submissionDate,
                              ).toLocaleString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 min-w-[150px]">
                        <span className="text-xs text-gray-400 font-medium">
                          Reviewed On
                        </span>
                        <span className="text-sm text-gray-600">
                          {submission.reviewDate
                            ? new Date(submission.reviewDate).toLocaleString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )
                            : "-"}
                        </span>
                      </div>
                    </div>
                    {submission.remarks && (
                      <div className="flex flex-col text-sm mt-1 w-full p-2 border-1 border-gray-200 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-600 ">
                          Remarks:
                        </span>
                        <span className="text-gray-600 text-xs lg:text-sm ">
                          {submission.remarks}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DProfileVerification;
