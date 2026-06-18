import { useSelector } from "react-redux";
import type { RootState } from "../../../state/store";
import {
  setVerificationStatus,
  type VerificationSubmission,
} from "../../../state/doctor/dProfileCreationSlice";
import { resubmitDoctorProfile } from "../../../api/doctor/dProfileCreationService";
import toast from "react-hot-toast";
import getIcon from "../../../helpers/getIcon";
import { getStatusBadge } from "../../../helpers/getStatusBadge";
import ConfirmationModal from "../../common/ConfirmationModal";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";

function DProfileVerification() {
  const dispatch = useDispatch();
  const { verificationSubmissions, verificationStatus } = useSelector(
    (state: RootState) => state.dProfileCreation,
  );
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [isResubmitting, setIsResubmitting] = useState(false);

  let submissions = [...verificationSubmissions].map((val) => {
    return {
      ...val,
      date: new Date(val.submissionDate),
    };
  });
  submissions.sort((a, b) => b.date.getTime() - a.date.getTime());

  async function handleResubmit() {
    setIsResubmitting(true);
    try {
      const data = await resubmitDoctorProfile();
      if (data?.success) {
        dispatch(setVerificationStatus("resubmitted"));
        toast.success("Profile resubmitted successfully.");
      } else {
        throw new Error("Failed to resubmit profile.");
      }
    } catch (error) {
      toast.error(
        (error as Error)?.message || "An error occurred while resubmitting.",
      );
    } finally {
      setIsResubmitting(false);
      setConfirmationModal(false);
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "verified":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-900/10",
          border: "border-emerald-200 dark:border-emerald-800/30",
          text: "text-emerald-700 dark:text-emerald-400",
          desc: "Congratulations! Your profile is verified and visible to patients.",
          icon: "tick",
        };
      case "rejected":
        return {
          bg: "bg-red-50 dark:bg-red-900/10",
          border: "border-red-200 dark:border-red-800/30",
          text: "text-red-700 dark:text-red-400",
          desc: "Verification was rejected. Please review the remarks below and resubmit.",
          icon: "close",
        };
      case "pending":
        return {
          bg: "bg-amber-50 dark:bg-amber-900/10",
          border: "border-amber-200 dark:border-amber-800/30",
          text: "text-amber-700 dark:text-amber-400",
          desc: "Your profile is under review by our team. This usually takes 24-48 hours.",
          icon: "hour-glass",
        };
      default:
        return {
          bg: "bg-blue-50 dark:bg-blue-900/10",
          border: "border-blue-200 dark:border-blue-800/30",
          text: "text-blue-700 dark:text-blue-400",
          desc: "Your profile has been resubmitted and is awaiting fresh review.",
          icon: "refresh",
        };
    }
  };

  const currentStatus = getStatusConfig(verificationStatus || "pending");

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm p-6"
    >
      <ConfirmationModal
        isOpen={confirmationModal}
        onClose={() => setConfirmationModal(false)}
        onConfirm={handleResubmit}
        title="Resubmit Verification"
        message="Do you confirm that you have updated all necessary details and wish to resubmit your profile for review?"
        confirmText="Yes, Resubmit"
        isDestructive={false}
      />

      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {/* <span className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {getIcon("shield", "16px")}
            </span> */}
            Profile Verification
          </h2>
          {verificationStatus === "rejected" && (
            <button
              onClick={() => setConfirmationModal(true)}
              disabled={isResubmitting}
              className="flex items-center gap-1.5 bg-darkGreen dark:bg-emerald-600 hover:opacity-90 text-white px-4 py-1.5 rounded-lg font-bold transition-all active:scale-95 shadow-md shadow-darkGreen/10 disabled:opacity-50 text-xs"
            >
              {isResubmitting
                ? getIcon("loading", "16px")
                : getIcon("refresh", "16px", "white")}
              Resubmit Profile
            </button>
          )}
        </div>

        {/* Status Card */}
        <div
          className={`${currentStatus.bg} ${currentStatus.border} border rounded-2xl p-4 flex items-start gap-3.5`}
        >
          <div
            className={`${currentStatus.text} p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border ${currentStatus.border} flex-shrink-0`}
          >
            {getIcon(currentStatus.icon, "24px")}
          </div>
          <div>
            <h3
              className={`text-base font-bold ${currentStatus.text} capitalize flex items-center gap-2 mb-0.5`}
            >
              {verificationStatus}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 font-medium text-xs leading-relaxed">
              {currentStatus.desc}
            </p>
          </div>
        </div>

        {/* Timeline History */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            Submission History
          </h3>
          {verificationSubmissions.length === 0 ? (
            <div className="text-center text-slate-400 py-8 bg-slate-50 dark:bg-slate-800/10 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <div className="mb-2 opacity-20 flex justify-center">
                {getIcon("history", "32px")}
              </div>
              <p className="text-xs font-bold uppercase tracking-widest">
                No history available
              </p>
            </div>
          ) : (
            <div className="space-y-4 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
              {submissions.map((submission: VerificationSubmission) => (
                <div key={submission._id} className="relative pl-10">
                  <div
                    className={`absolute left-0 top-0 w-10 h-10 rounded-full border-[3px] border-white dark:border-slate-900 flex items-center justify-center z-10 
                    ${submission.status === "verified"
                        ? "bg-emerald-100 text-emerald-600"
                        : submission.status === "rejected"
                          ? "bg-red-100 text-red-600"
                          : submission.status === "resubmitted"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-amber-100 text-amber-600"
                      }`}
                  >
                    {getIcon(
                      submission.status === "verified"
                        ? "tick"
                        : submission.status === "rejected"
                          ? "close"
                          : "refresh",
                      "16px",
                    )}
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl p-4 hover:border-lightGreen dark:hover:border-lightGreen/30 transition-all group">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 mb-3">
                      <div>
                        {getStatusBadge(submission.status)}
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-1">
                          {getIcon("calendar", "12px")}
                          {new Date(submission.submissionDate).toLocaleString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                      </div>
                      {submission.reviewDate && (
                        <div className="text-left md:text-right">
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                            Reviewed On
                          </p>
                          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                            {new Date(submission.reviewDate).toLocaleString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                      )}
                    </div>

                    {submission.remarks && (
                      <div className="mt-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                          Reviewer Remarks
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed font-medium italic">
                          "{submission.remarks}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default DProfileVerification;
