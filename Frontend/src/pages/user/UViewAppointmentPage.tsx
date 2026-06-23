import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router";
import UNavbar from "../../components/user/UNavbar";
import {
  getAppointmentById,
  cancelAppointment,
  getCancelPreview,
} from "../../api/user/bookingService";
import {
  getConsultationReportByAppointmentId,
  getPrescriptionByAppointmentId,
} from "../../api/consultationApi";
import UAppointmentCancelModal from "../../components/user/UAppointmentCancelModal";
import toast from "react-hot-toast";
import Avatar from "../../components/common/Avatar";
import getIcon from "../../helpers/getIcon";
import {
  getReviewByAppointmentId,
  createOrUpdateReview,
  deleteReview,
} from "../../api/reviewApi";
import { Star, ShieldAlert, Image as ImageIcon, Film } from "lucide-react";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import DisputeReportModal from "../../components/common/DisputeReportModal";
import { getAppointmentDispute } from "../../api/disputeApi";

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING_PAYMENT: {
    label: "Pending Payment",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800 border-red-200",
  },
  CANCELLED_BY_USER: {
    label: "Cancelled by Patient",
    color: "bg-red-105 text-red-800 border-red-200",
  },
  CANCELLED_BY_DOCTOR: {
    label: "Cancelled by Doctor",
    color: "bg-red-100 text-red-800 border-red-200",
  },
  NO_SHOW: {
    label: "No Show",
    color: "bg-gray-100 text-gray-800 border-gray-200",
  },
};

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  INITIATED: { label: "Initiated", color: "text-yellow-600 bg-yellow-50" },
  SUCCESS: { label: "Paid", color: "text-green-600 bg-green-50" },
  FAILED: { label: "Failed", color: "text-red-600 bg-red-50" },
  REFUNDED: { label: "Refunded", color: "text-purple-600 bg-purple-50" },
};

function UViewAppointmentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [prescriptionId, setPrescriptionId] = useState<string | null>(null);

  // Review states
  const [review, setReview] = useState<any>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({
    q1: "",
    q2: "",
    q3: "",
    q4: "",
    q5: "",
  });
  const [comment, setComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Dispute states
  const [dispute, setDispute] = useState<any>(null);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await getAppointmentById(id);
        if (!res?.data) {
          navigate("/404");
          return;
        }
        setAppointment(res.data);

        // Fetch dispute details
        try {
          const dispRes = await getAppointmentDispute(id!);
          if (dispRes.success && dispRes.data) {
            setDispute(dispRes.data);
          }
        } catch (err) {
          console.log("No dispute exists for this appointment.");
        }

        if (res.data && res.data.status.toUpperCase() === "COMPLETED") {
          try {
            const repRes = await getConsultationReportByAppointmentId(id);
            if (repRes.success && repRes.data) {
              setReportId(repRes.data.id);
            }
          } catch (err) { }
          try {
            const rxRes = await getPrescriptionByAppointmentId(id);
            if (rxRes.success && rxRes.data) {
              setPrescriptionId(rxRes.data.id);
            }
          } catch (err) { }

          // Fetch review details
          try {
            setReviewLoading(true);
            const revRes = await getReviewByAppointmentId(id);
            if (revRes.success && revRes.data) {
              setReview(revRes.data);
            }
          } catch (err) {
            console.log("No review exists yet for this appointment.");
          } finally {
            setReviewLoading(false);
          }
        }
      } catch (err: any) {
        if (err.response?.status === 403) {
          navigate("/403");
        } else {
          navigate("/404");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allAnswered = Object.values(answers).every((val) => val !== "");
    if (!allAnswered) return;
    setSubmittingReview(true);
    try {
      const res = await createOrUpdateReview({
        appointmentId: id!,
        answers: {
          q1: answers.q1,
          q2: answers.q2,
          q3: answers.q3,
          q4: answers.q4,
          q5: answers.q5,
        },
        comment: comment.trim() || undefined,
        isAnonymous,
      });
      if (res.success && res.data) {
        setReview(res.data);
        setIsReviewModalOpen(false);
        toast.success(review ? "Review updated successfully!" : "Review submitted successfully!");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReviewDelete = () => {
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteReview = async () => {
    if (!review || !review.id) return;
    try {
      await deleteReview(review.id);
      setReview(null);
      toast.success("Review deleted successfully.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete review.");
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  };

  const handleCancelClick = async () => {
    setIsCancelModalOpen(true);
    setPreviewData(null);
    try {
      const res = await getCancelPreview(id!);
      setPreviewData(res.data);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Could not fetch cancellation preview.",
      );
      setIsCancelModalOpen(false);
    }
  };

  const handleConfirmCancel = async () => {
    setCancelling(true);
    try {
      await cancelAppointment(id!);
      toast.success("Appointment cancelled successfully.");
      navigate("/appointments");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Could not cancel appointment.",
      );
    } finally {
      setCancelling(false);
      setIsCancelModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-950">
        <UNavbar />
        <svg
          className="animate-spin h-10 w-10 text-darkGreen"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      </div>
    );
  }

  if (!appointment) return null;

  const doctor = appointment.doctor || {};
  const slot = appointment.slot || {};
  const payment = appointment.payment || {};
  const status = statusConfig[appointment.status] || {
    label: appointment.status,
    color: "bg-gray-100 text-gray-800",
  };
  const payStatus = paymentStatusConfig[payment.status] || {
    label: payment.status || "N/A",
    color: "text-gray-600 bg-gray-50",
  };
  const isFuture =
    appointment.status === "CONFIRMED" ||
    appointment.status === "PENDING_PAYMENT" ||
    appointment.status === "IN_PROGRESS";

  return (
    <div className="w-full min-h-screen flex flex-col bg-slate-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 font-sans transition-colors duration-300">
      {/* Page Header Area */}
      <div className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 pt-16 lg:pt-24 pb-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/appointments")}
            className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 mb-6 transition-colors w-fit"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Appointments
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Appointment Details
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm font-medium">
                Appointment ID:{" "}
                <span className="font-mono text-gray-700 dark:text-gray-300">
                  {appointment.id || id?.toUpperCase()}
                </span>
              </p>
            </div>
            <div
              className={`w-fit px-4 py-1.5 rounded-full border text-sm font-bold shadow-sm flex items-center gap-2 ${status.color}`}
            >
              <div className="w-2 h-2  rounded-full bg-current opacity-70"></div>
              {status.label}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Vertical Stack */}
      <div className="flex-1 w-full relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-15 flex flex-col gap-6">
          {/* Doctor Overview & Actions Card */}
          <div className="bg-white dark:bg-gray-900 p-6 md:p-7 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Avatar
                src={doctor?.profileImageUrl}
                alt={doctor?.name}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-gray-50 dark:border-gray-800 shadow-sm"
              />
              <div className="flex-1 text-center sm:text-left flex flex-col justify-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Dr. {doctor.name}
                </h2>
                <p className="text-base text-darkGreen dark:text-emerald-400 font-semibold mb-3">
                  {doctor.specialization}
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  {doctor.contactPhone && (
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700">
                      {getIcon("call", "16px")}
                      {doctor.contactPhone}
                    </div>
                  )}
                  <button
                    onClick={() => navigate(`/doctors/${doctor.id}`)}
                    className="text-sm font-bold text-darkGreen dark:text-emerald-400 hover:text-green-800 dark:hover:text-emerald-300 transition-colors flex items-center gap-1"
                  >
                    View Profile
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {(isFuture || appointment.status === "COMPLETED") && (
              <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto min-w-[200px] mt-2 md:mt-0">
                {isFuture && (
                  <>
                    {(appointment.status === "CONFIRMED" ||
                      appointment.status === "IN_PROGRESS") && (
                        <button
                          onClick={() => navigate(`/consultation/${id}`)}
                          className="flex-1 md:flex-none w-full bg-darkGreen text-white font-bold py-3 rounded-xl hover:opacity-90 shadow-lg shadow-darkGreen/20 transition-all flex justify-center items-center gap-2 px-4"
                        >
                          {getIcon("video", "18px") || (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                              />
                            </svg>
                          )}
                          {appointment.status === "IN_PROGRESS"
                            ? "Rejoin"
                            : "Join Consultation"}
                        </button>
                      )}
                    {appointment.status !== "IN_PROGRESS" && (
                      <button
                        onClick={handleCancelClick}
                        disabled={cancelling}
                        className="flex-1 md:flex-none w-full bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 font-bold py-3 rounded-xl border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-all px-4"
                      >
                        {cancelling ? "Processing..." : "Cancel Consultation"}
                      </button>
                    )}
                  </>
                )}
                {appointment.status === "COMPLETED" && (
                  <>
                    {reportId && (
                      <button
                        onClick={() => navigate(`/reports/${reportId}`)}
                        className="flex-1 md:flex-none w-full bg-darkGreen text-white font-bold py-3 rounded-xl hover:opacity-90 shadow-lg shadow-darkGreen/20 transition-all flex justify-center items-center gap-2 px-4 text-center text-sm"
                      >
                        View Consultation Report
                      </button>
                    )}
                    {prescriptionId && (
                      <button
                        onClick={() => navigate(`/prescriptions/${prescriptionId}`)}
                        className="flex-1 md:flex-none w-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 font-bold py-3 rounded-xl border border-emerald-500/20 hover:bg-emerald-500/20 transition-all flex justify-center items-center gap-2 px-4 text-center text-sm"
                      >
                        View Prescription
                      </button>
                    )}
                    {!review && (
                      <button
                        onClick={() => {
                          setAnswers({ q1: "", q2: "", q3: "", q4: "", q5: "" });
                          setComment("");
                          setIsAnonymous(false);
                          setIsReviewModalOpen(true);
                        }}
                        className="flex-1 md:flex-none w-full bg-amber-500 text-white font-bold py-3 rounded-xl hover:opacity-90 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 px-4 text-center text-sm cursor-pointer"
                      >
                        <Star className="w-4 h-4 fill-white text-white" />
                        Write a Review
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {appointment.status === "CANCELLED_BY_DOCTOR" && appointment.cancellationReason && (
            <div className="bg-red-500/5 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 p-5 rounded-2xl flex items-start gap-4">
              <ShieldAlert className="w-6 h-6 text-red-505 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-red-700 dark:text-red-400">Appointment Cancelled by Provider</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  The doctor cancelled this consultation and provided the following explanation:
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-305 mt-2 font-semibold italic">
                  "{appointment.cancellationReason}"
                </p>
              </div>
            </div>
          )}

          {/* Consultation Details */}
          <div className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
              Consultation Info
            </h3>

            <div className="flex flex-col gap-6">
              {/* Date, Time, Mode Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Date */}
                <div className="flex flex-col xl:flex-row items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-darkGreen dark:text-emerald-400">
                    {getIcon("calendar", "24px")}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                      Date
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {slot.start
                        ? new Date(slot.start).toLocaleDateString("en-IN", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                        : "-"}
                    </p>
                  </div>
                </div>

                {/* Time */}
                <div className="flex flex-col xl:flex-row items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-darkGreen dark:text-emerald-400">
                    {getIcon("clock", "24px")}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                      Time
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {slot.start
                        ? new Date(slot.start).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                        : "-"}
                    </p>
                  </div>
                </div>

                {/* Mode */}
                <div className="flex flex-col xl:flex-row items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-darkGreen dark:text-emerald-400">
                    {getIcon(
                      slot.consultationMode?.toLowerCase() === "online"
                        ? "laptop-medical"
                        : "clinic",
                      "24px",
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                      Mode
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                      {slot.consultationMode || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reason Row */}
              <div className="flex flex-col sm:flex-row items-start gap-4 p-5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-darkGreen dark:text-emerald-400 mt-1">
                  {getIcon("sticky-note", "24px")}
                </div>
                <div className="w-full">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Reason for Visit
                  </p>
                  <div className="font-medium text-gray-900 dark:text-gray-100 leading-relaxed break-words whitespace-pre-wrap md:pr-17">
                    {appointment.reason || "No reason provided."}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4 mb-5">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Payment Info
              </h3>
              <div
                className={`px-4 py-1.5 rounded-full text-sm font-bold border shadow-sm ${payStatus.color}`}
              >
                {payStatus.label}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400 font-medium">
                Consultation Fee
              </span>
              <span className="font-bold text-gray-900 dark:text-gray-100 text-xl">
                ₹{payment.amount || slot.consultationFee || 0}
              </span>
            </div>

            {appointment.refund && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Refund Details</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-400 border border-purple-200 dark:border-purple-900/30">
                    {appointment.refund.status || "REFUNDED"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Refunded Amount</span>
                  <span className="font-bold text-gray-900 dark:text-gray-100">₹{appointment.refund.amount}</span>
                </div>
                {appointment.refund.createdAt && (
                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                    <span>Refunded On</span>
                    <span>{dayjs(appointment.refund.createdAt).format("MMM DD, YYYY h:mm A")}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-[10px] text-gray-500 dark:text-gray-400 font-mono">
                  <span>Tx ID</span>
                  <span className="truncate max-w-[200px]">{appointment.refund.id}</span>
                </div>
              </div>
            )}
          </div>

          {/* Rating & Review Section (Only for COMPLETED appointments) */}
          {appointment.status === "COMPLETED" && (
            <div className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300 flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Star className="w-5.5 h-5.5 fill-amber-400 text-amber-400" />
                  <span>Your Consultation Feedback</span>
                </h3>
                {review && (
                  <div className="bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 px-3 py-1 rounded-xl flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{review.score}%</span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 ml-1">Score</span>
                  </div>
                )}
              </div>

              {reviewLoading ? (
                <div className="flex justify-center py-6">
                  <svg className="animate-spin h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                </div>
              ) : review ? (
                <div className="space-y-4">
                  {review.comment && (
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 text-sm font-medium text-slate-750 dark:text-slate-350 italic">
                      "{review.comment}"
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2">
                    <div className="p-3 bg-slate-50/50 dark:bg-slate-805/20 rounded-xl border border-slate-100 dark:border-slate-800/60 text-center">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Doctor Listened</p>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{review.answers?.q1}</span>
                    </div>
                    <div className="p-3 bg-slate-50/50 dark:bg-slate-805/20 rounded-xl border border-slate-100 dark:border-slate-800/60 text-center">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Explanation</p>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{review.answers?.q2}</span>
                    </div>
                    <div className="p-3 bg-slate-50/50 dark:bg-slate-805/20 rounded-xl border border-slate-100 dark:border-slate-800/60 text-center">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Time Given</p>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{review.answers?.q3}</span>
                    </div>
                    <div className="p-3 bg-slate-50/50 dark:bg-slate-805/20 rounded-xl border border-slate-100 dark:border-slate-800/60 text-center">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Confidence</p>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{review.answers?.q4}</span>
                    </div>
                    <div className="p-3 bg-slate-50/50 dark:bg-slate-805/20 rounded-xl border border-slate-100 dark:border-slate-800/60 text-center">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Professionalism</p>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{review.answers?.q5}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                    <span className="capitalize">
                      Status: {review.isAnonymous ? "Anonymous to Doctor/Public" : "Publicly Visible"}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setAnswers({
                            q1: review.answers?.q1 || "",
                            q2: review.answers?.q2 || "",
                            q3: review.answers?.q3 || "",
                            q4: review.answers?.q4 || "",
                            q5: review.answers?.q5 || "",
                          });
                          setComment(review.comment || "");
                          setIsAnonymous(review.isAnonymous || false);
                          setIsReviewModalOpen(true);
                        }}
                        className="text-darkGreen dark:text-emerald-450 hover:underline cursor-pointer"
                      >
                        Edit Review
                      </button>
                      <span className="text-slate-300 dark:text-slate-700">|</span>
                      <button
                        onClick={handleReviewDelete}
                        className="text-red-500 hover:underline cursor-pointer"
                      >
                        Delete Review
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 border border-dashed border-gray-250 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/10">
                  <div className="text-center sm:text-left">
                    <p className="text-sm font-bold text-gray-855 dark:text-gray-200">How was your consultation with Dr. {doctor.name}?</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Help others on HealthHub by sharing your experience score and feedback.</p>
                  </div>
                  <button
                    onClick={() => {
                      setAnswers({ q1: "", q2: "", q3: "", q4: "", q5: "" });
                      setComment("");
                      setIsAnonymous(false);
                      setIsReviewModalOpen(true);
                    }}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md transition-all text-xs cursor-pointer"
                  >
                    Write Review
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Dispute/Issue Report Section */}
          {dispute ? (
            <div className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-2xl border border-red-200 dark:border-red-950/40 shadow-sm transition-colors duration-300 flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-gray-105 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="text-red-500 w-6 h-6" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-905 dark:text-gray-100">
                      Dispute Report Details
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Submitted on {dayjs(dispute.createdAt).format("MMM DD, YYYY h:mm A")}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${dispute.status === "OPEN"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                    : dispute.status === "UNDER_REVIEW"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-450"
                      : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  }`}>
                  {dispute.status === "UNDER_REVIEW" ? "Under Review" : dispute.status}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Reason</h4>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800/40 px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-800 w-fit">
                    {dispute.reason}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Description</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                    {dispute.description}
                  </p>
                </div>

                {dispute.evidence && dispute.evidence.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Attached Evidence</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {dispute.evidence.map((ev: any, idx: number) => {
                        const isImg = ev.type === "image";
                        return (
                          <a
                            key={idx}
                            href={ev.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-750 hover:border-red-300 dark:hover:border-red-900/50 rounded-xl transition-all group hover:shadow-sm"
                          >
                            {isImg ? (
                              <ImageIcon className="text-blue-500 group-hover:scale-110 transition-transform shrink-0" size={20} />
                            ) : (
                              <Film className="text-purple-500 group-hover:scale-110 transition-transform shrink-0" size={20} />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate pr-1">
                                {ev.name}
                              </p>
                              <p className="text-[10px] text-gray-400 capitalize mt-0.5">{ev.type}</p>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                {dispute.status === "RESOLVED" && dispute.resolutionMessage && (
                  <div className="bg-green-500/5 dark:bg-green-950/10 border border-green-200 dark:border-green-900/30 p-4 rounded-xl mt-2">
                    <h4 className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wider mb-1">Admin Resolution</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
                      "{dispute.resolutionMessage}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 justify-center sm:justify-start">
                  <ShieldAlert className="text-gray-400 w-5 h-5" />
                  Have an issue with this consultation?
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  You can submit a formal issue report to HealthHub support if you encountered problems.
                </p>
              </div>
              <button
                onClick={() => setIsDisputeModalOpen(true)}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition-all text-xs cursor-pointer active:scale-95 shrink-0"
              >
                Report Issue
              </button>
            </div>
          )}

        </div>
      </div>

      <DisputeReportModal
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
        appointmentId={id!}
        onSuccess={async () => {
          // Re-fetch dispute info
          try {
            const dispRes = await getAppointmentDispute(id!);
            if (dispRes.success && dispRes.data) {
              setDispute(dispRes.data);
            }
          } catch (err) {
            console.error(err);
          }
        }}
      />

      <UAppointmentCancelModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        loading={cancelling}
        previewData={previewData}
      />

      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDeleteReview}
        title="Delete Review"
        message="Are you sure you want to delete your review? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
      />

      {/* Review Modal Form */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in duration-200 text-slate-800 dark:text-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-805 pb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Star className="w-5.5 h-5.5 fill-amber-400 text-amber-400" />
                <span>{review ? "Edit Your Review" : "Write a Review"}</span>
              </h3>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-450 dark:text-slate-500 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleReviewSubmit} className="space-y-5">
              {/* Questions List */}
              <div className="space-y-5 max-h-[50vh] overflow-y-auto pr-1">
                {[
                  { key: "q1", question: "Did the doctor listen carefully to your concerns?" },
                  { key: "q2", question: "How clearly did the doctor explain your condition and treatment?" },
                  { key: "q3", question: "Did you feel enough time was given to understand your problem?" },
                  { key: "q4", question: "How confident do you feel about the treatment plan after this consultation?" },
                  { key: "q5", question: "Was the consultation professional and respectful?" },
                ].map((q, idx) => (
                  <div key={q.key} className="space-y-2">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
                      <span className="text-emerald-500 font-bold mr-1">{idx + 1}.</span> {q.question}
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: "Excellent", value: "Excellent", activeBg: "bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-500 dark:text-slate-955 dark:border-emerald-500", hoverColor: "hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/20" },
                        { label: "Good", value: "Good", activeBg: "bg-blue-600 text-white border-blue-655 dark:bg-blue-500 dark:text-slate-955 dark:border-blue-500", hoverColor: "hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/20" },
                        { label: "Average", value: "Average", activeBg: "bg-amber-500 text-white border-amber-500 dark:bg-amber-550 dark:text-slate-955 dark:border-amber-500", hoverColor: "hover:bg-amber-50 hover:text-amber-750 dark:hover:bg-amber-950/20" },
                        { label: "Poor", value: "Poor", activeBg: "bg-rose-600 text-white border-rose-600 dark:bg-rose-500 dark:text-slate-955 dark:border-rose-500", hoverColor: "hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/20" },
                      ].map((opt) => {
                        const isActive = answers[q.key] === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setAnswers({ ...answers, [q.key]: opt.value })}
                            className={`py-1.5 rounded-lg border text-[11px] font-bold text-center transition-all cursor-pointer ${isActive
                                ? opt.activeBg
                                : `bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-350 border-slate-205 dark:border-slate-700 ${opt.hoverColor}`
                              }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Written Comment Textarea */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Written Review (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us more about your consultation experience..."
                  rows={2}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none transition-all text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Anonymous Option & Warning */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 rounded-xl space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-450 cursor-pointer"
                  />
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-250">
                    Submit this review anonymously
                  </span>
                </label>
                {isAnonymous && (
                  <div className="flex gap-2 text-[9.5px] leading-relaxed text-slate-500 dark:text-slate-400 bg-amber-500/10 p-2 rounded-lg border border-amber-500/15">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <p>
                      <span className="font-bold text-amber-600 dark:text-amber-400">Notice:</span> Name and photo will be hidden from public and doctor, but admins can access it to prevent abuse.
                    </p>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="flex-1 py-3 border border-slate-250 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!Object.values(answers).every((val) => val !== "") || submittingReview}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer ${Object.values(answers).every((val) => val !== "")
                      ? "bg-slate-900 text-white hover:bg-slate-850 dark:bg-emerald-500 dark:text-slate-955"
                      : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed"
                    }`}
                >
                  {submittingReview ? "Saving..." : "Save Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UViewAppointmentPage;
