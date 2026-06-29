import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import getIcon from "../../helpers/getIcon";
import DAppointmentCancelModal from "../../components/doctor/DAppointmentCancelModal";
import { ShieldAlert, Image as ImageIcon, Film } from "lucide-react";
import DisputeReportModal from "../../components/common/DisputeReportModal";
import { getAppointmentDispute } from "../../api/disputeApi";
import {
  cancelDoctorAppointment,
  getDoctorAppointmentById,
  getDoctorAppointments,
  requestReschedule,
} from "../../api/doctor/appointmentService";
import {
  getConsultationReportByAppointmentId,
  getPrescriptionByAppointmentId,
} from "../../api/consultationApi";
import DAppointmentRescheduleModal from "../../components/doctor/DAppointmentRescheduleModal";

interface LocationInfo {
  type: string;
  coordinates: number[];
  address: string;
  placeId: string;
}

interface PaymentInfo {
  _id: string;
  amount: number;
  currency: string;
  status: string;
  transactionId: string;
  createdAt: string;
}

interface AppointmentDetails {
  id: string;
  patientId: string;
  start: string;
  end: string;
  locationName: string;
  location: LocationInfo;
  mode: string;
  status: string;
  reason: string;
  patternName: string; // From the generic auth interface resolving
  patientName: string;
  dob: string;
  gender: string;
  payment: PaymentInfo | null;
  consultationFee?: number;
  refund?: {
    id: string;
    amount: number;
    status: string;
    createdAt: string;
  } | null;
  cancellationReason?: string | null;
  practiceLocationId?: string;
  rescheduleRequest?: {
    id: string;
    newSlotId: string;
    oldSlotId?: string | null;
    newStart: string;
    newEnd: string;
    oldStart?: string | null;
    oldEnd?: string | null;
    reason: string;
    customReason: string | null;
    status: string;
  } | null;
}

function DViewAppointmentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState<AppointmentDetails | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);
  const [prescriptionId, setPrescriptionId] = useState<string | null>(null);

  // Dispute states
  const [dispute, setDispute] = useState<any>(null);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);

  // Previous bookings
  const [previousAppointments, setPreviousAppointments] = useState<any[]>([]);
  const [previousLoading, setPreviousLoading] = useState(false);

  useEffect(() => {
    async function fetchAppointment() {
      try {
        if (!id) return;
        const data = await getDoctorAppointmentById(id);
        if (data.success && data.data) {
          setAppointment(data.data);

          // Fetch dispute details
          try {
            const dispRes = await getAppointmentDispute(id);
            if (dispRes.success && dispRes.data) {
              setDispute(dispRes.data);
            }
          } catch (err) {
            console.log("No dispute exists for this appointment.");
          }

          if (data.data.status.toUpperCase() === "COMPLETED") {
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
          }
        } else {
          toast.error(data.message || "Failed to fetch appointment details");
          navigate("/doctor/appointments");
        }
      } catch (error) {
        toast.error("Error fetching appointment details");
        navigate("/doctor/appointments");
      } finally {
        setLoading(false);
      }
    }

    fetchAppointment();
  }, [id, navigate]);

  useEffect(() => {
    if (!appointment?.patientId) return;
    const fetchPreviousAppointments = async () => {
      setPreviousLoading(true);
      try {
        const data = await getDoctorAppointments({
          patientId: appointment.patientId,
          tab: "",
          sort: "newest",
          limit: 20,
        });
        if (data.success) {
          // Exclude the current appointment
          setPreviousAppointments(
            (data.appointments || []).filter((a: any) => a.id !== id && String(a.id) !== String(id))
          );
        }
      } catch (err) {
        // silently fail
      } finally {
        setPreviousLoading(false);
      }
    };
    fetchPreviousAppointments();
  }, [appointment?.patientId, id]);

  const handleCancelConfirm = async (reason: string) => {
    if (!appointment) return;
    setCancelling(true);
    try {
      const res = await cancelDoctorAppointment(appointment.id, reason);
      if (res.success) {
        toast.success("Appointment cancelled successfully.");
        setAppointment({ ...appointment, status: "CANCELLED_BY_DOCTOR" });
        setIsCancelModalOpen(false);
      } else {
        toast.error(res.message || "Failed to cancel appointment.");
      }
    } catch (error) {
      toast.error("Error cancelling appointment.");
    } finally {
      setCancelling(false);
    }
  };

  const handleRescheduleConfirm = async (data: {
    newSlotId: string;
    reason: string;
    customReason?: string;
  }) => {
    if (!appointment) return;
    setRescheduling(true);
    try {
      const res = await requestReschedule(appointment.id, data);
      if (res.success) {
        toast.success("Reschedule request submitted successfully.");
        setIsRescheduleModalOpen(false);
        // Refresh appointment details
        setLoading(true);
        const freshData = await getDoctorAppointmentById(id!);
        if (freshData.success && freshData.data) {
          setAppointment(freshData.data);
        }
      } else {
        toast.error(res.message || "Failed to submit reschedule request.");
      }
    } catch (error: any) {
      toast.error("Error submitting reschedule request.");
    } finally {
      setRescheduling(false);
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toUpperCase()) {
      case "CONFIRMED":
        return "bg-green-100 text-green-700 border-green-200";
      case "RESCHEDULE_PENDING":
        return "bg-amber-100 text-amber-700 border-amber-250";
      case "COMPLETED":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "CANCELLED":
      case "CANCELLED_BY_DOCTOR":
        return "bg-red-100 text-red-700 border-red-200";
      case "NO_SHOW":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  const getPaymentBadgeClass = (status: string) => {
    switch (status.toUpperCase()) {
      case "SUCCESS":
      case "COMPLETED":
        return "bg-green-100 text-green-700 border-green-200";
      case "INITIATED":
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "FAILED":
        return "bg-red-100 text-red-700 border-red-200";
      case "REFUNDED":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center w-full h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-darkGreen"></div>
      </div>
    );
  }

  if (!appointment) return null;

  return (
    <div className="flex justify-center w-full pb-10">
      <div className="w-[95%] lg:w-[80%] max-w-[1200px] flex flex-col gap-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/doctor/appointments")}
              className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-800 transition-colors"
            >
              {getIcon("left", "25px", "currentColor", "text-gray-600")}
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                Appointment Details
              </h1>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                ID: {appointment.id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1.5 text-sm font-semibold rounded-full border ${getStatusBadgeClass(
                appointment.status,
              )}`}
            >
              {appointment.status.replace("_", " ")}
            </span>
            <span className="px-3 py-1.5 text-sm font-semibold rounded-full border bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 capitalize">
              {appointment.mode.replace("-", " ")} Mode
            </span>
            {appointment.status === "CONFIRMED" &&
              dayjs(appointment.start).isAfter(dayjs()) && (
                <div className="flex gap-2">
                  {appointment.rescheduleRequest?.status !== "PENDING" && (
                    <button
                      onClick={() => setIsRescheduleModalOpen(true)}
                      className="px-4 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 font-semibold rounded-xl hover:bg-emerald-100 transition-colors text-sm"
                    >
                      Reschedule Appointment
                    </button>
                  )}
                  <button
                    onClick={() => setIsCancelModalOpen(true)}
                    className="px-4 py-1.5 bg-red-50 text-red-600 border border-red-200 font-semibold rounded-xl hover:bg-red-100 transition-colors text-sm"
                  >
                    Cancel Appointment
                  </button>
                </div>
              )}
            {(appointment.status === "CONFIRMED" ||
              appointment.status === "IN_PROGRESS") && (
                <button
                  onClick={() => navigate(`/doctor/consultation/${id}`)}
                  className="px-4 py-1.5 bg-darkGreen text-white font-semibold rounded-xl hover:bg-darkGreen/90 transition-colors text-sm"
                >
                  {appointment.status === "IN_PROGRESS"
                    ? "Rejoin Consultation"
                    : "Join Consultation"}
                </button>
              )}
            {appointment.status.toUpperCase() === "COMPLETED" && (
              <>
                {reportId && (
                  <button
                    onClick={() => navigate(`/doctor/reports/${reportId}`)}
                    className="px-4 py-1.5 bg-darkGreen hover:bg-darkGreen/90 text-white font-semibold rounded-xl transition-colors text-sm"
                  >
                    View Report
                  </button>
                )}
                {prescriptionId && (
                  <button
                    onClick={() => navigate(`/doctor/prescriptions/${prescriptionId}`)}
                    className="px-4 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold rounded-xl transition-colors text-sm"
                  >
                    View Prescription
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {appointment.rescheduleRequest && appointment.rescheduleRequest.status === "ACCEPTED" && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl flex items-start gap-3">
            <span className="text-emerald-600 dark:text-emerald-450 mt-0.5 shrink-0">
              <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <div className="flex-1">
              <h4 className="font-bold text-emerald-900 dark:text-emerald-400 text-sm">
                Rescheduled Appointment (Accepted by Patient)
              </h4>
              <p className="text-xs text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">
                This appointment was rescheduled from its original timing of{" "}
                <span className="font-semibold text-gray-500 font-mono">
                  {dayjs(appointment.rescheduleRequest.oldStart).format("DD MMM YYYY, hh:mm A")}
                </span>.
              </p>
            </div>
          </div>
        )}

        {appointment.rescheduleRequest && appointment.rescheduleRequest.status === "PENDING" && (
          <div className="p-4 bg-amber-50 dark:bg-amber-955/20 border border-amber-250 dark:border-amber-900/50 rounded-2xl flex items-start gap-3">
            <span className="text-amber-600 dark:text-amber-500 mt-0.5">
              {getIcon("exclamation-circle", "22px")}
            </span>
            <div className="flex-1">
              <h4 className="font-bold text-amber-900 dark:text-amber-250 text-sm">
                Reschedule Request Sent (Pending Patient Response)
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
                You proposed a new slot on{" "}
                <span className="font-semibold text-amber-900 dark:text-amber-250 font-mono">
                  {dayjs(appointment.rescheduleRequest.newStart).format("DD MMM YYYY, hh:mm A")}
                </span>. Reason: "{appointment.rescheduleRequest.reason}
                {appointment.rescheduleRequest.customReason ? ` - ${appointment.rescheduleRequest.customReason}` : ""}".
                The patient must accept the request for it to take effect. If they decline, the appointment will be cancelled, both slots will be released, and a full refund will be issued to the patient's wallet.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (Main Details) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Patient Info Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
              <div className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  {getIcon("user", "20px", "currentColor", "text-darkGreen")}
                  Patient Information
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Full Name</p>
                    <p className="font-semibold text-gray-800 dark:text-white text-lg">
                      {appointment.patientName || "Unknown"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Gender</p>
                    <p className="font-medium text-gray-800 dark:text-slate-200 capitalize">
                      {appointment.gender || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Age</p>
                    <p className="font-medium text-gray-800 dark:text-slate-200">
                      {appointment.dob
                        ? `${dayjs().diff(dayjs(appointment.dob), "year")} years old`
                        : "Unknown"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Consultation Details Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
              <div className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  {getIcon(
                    "calendar",
                    "20px",
                    "currentColor",
                    "text-darkGreen",
                  )}
                  Consultation Details
                </h2>
              </div>
              <div className="p-6 flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-darkGreen">
                      {getIcon("clock", "24px", "currentColor")}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">
                        Schedule
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-white mt-1">
                        {dayjs(appointment.start).format(
                          "dddd, MMMM D, YYYY",
                        )}
                      </p>
                      <p className="text-darkGreen font-medium text-sm mt-0.5">
                        {dayjs(appointment.start).format("h:mm A")} -{" "}
                        {dayjs(appointment.end).format("h:mm A")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-blue-400">
                      {getIcon("location", "24px")}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">
                        Location
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-white mt-1">
                        {appointment.locationName || "Virtual / Online"}
                      </p>
                      {appointment.location?.address && (
                        <p className="text-gray-600 dark:text-slate-400 text-sm mt-1 line-clamp-2">
                          {appointment.location.address}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-2 font-medium">
                    Reason for Visit
                  </p>
                  <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-800 rounded-xl text-gray-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {appointment.reason ||
                      "No specific reason provided by the patient."}
                  </div>
                </div>

                {appointment.status === "CANCELLED_BY_DOCTOR" && appointment.cancellationReason && (
                  <div className="pt-4 border-t border-gray-150 dark:border-slate-800">
                    <p className="text-sm text-red-500 mb-2 font-semibold">
                      Your Cancellation Reason
                    </p>
                    <div className="p-4 bg-red-500/5 border border-red-205 dark:border-red-900/30 rounded-xl text-gray-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-medium italic">
                      "{appointment.cancellationReason}"
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Dispute/Issue Report Section */}
            {dispute ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-red-200 dark:border-red-950/40 overflow-hidden">
                <div className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="text-red-500 w-5 h-5" />
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                      Dispute Report Details
                    </h2>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border uppercase tracking-wider ${dispute.status === "OPEN"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-450 border-blue-200 dark:border-blue-900/40"
                    : dispute.status === "UNDER_REVIEW"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-450 border-yellow-250 dark:border-yellow-900/40"
                      : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900/40"
                    }`}>
                    {dispute.status === "UNDER_REVIEW" ? "Under Review" : dispute.status}
                  </span>
                </div>
                <div className="p-6 space-y-4">
                  <div className="text-xs font-semibold text-gray-400 dark:text-slate-500">
                    SUBMITTED ON {dayjs(dispute.createdAt).format("MMM DD, YYYY h:mm A")}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-1 font-medium">Reason</p>
                    <p className="font-semibold text-gray-800 dark:text-white bg-gray-50 dark:bg-slate-800/40 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-800 w-fit">
                      {dispute.reason}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-1 font-medium">Description</p>
                    <p className="text-sm text-gray-700 dark:text-slate-350 bg-gray-50 dark:bg-slate-800/40 p-4 rounded-xl border border-gray-200 dark:border-slate-800 leading-relaxed">
                      {dispute.description}
                    </p>
                  </div>

                  {dispute.evidence && dispute.evidence.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mb-2 font-medium">Attached Evidence</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {dispute.evidence.map((ev: any, idx: number) => {
                          const isImg = ev.type === "image";
                          return (
                            <a
                              key={idx}
                              href={ev.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-850 hover:border-red-300 dark:hover:border-red-900/50 rounded-xl transition-all group hover:shadow-sm"
                            >
                              {isImg ? (
                                <ImageIcon className="text-blue-500 group-hover:scale-110 transition-transform shrink-0" size={18} />
                              ) : (
                                <Film className="text-purple-500 group-hover:scale-110 transition-transform shrink-0" size={18} />
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
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 justify-center sm:justify-start">
                    <ShieldAlert className="text-gray-450 w-5 h-5" />
                    Have an issue with this consultation?
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    You can report an issue about this appointment/patient directly to support.
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
            {/* Previous Bookings Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
              <div className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 px-6 py-4 flex items-center gap-2">
                {getIcon("calendar", "20px", "currentColor", "text-darkGreen")}
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Booking History — {appointment.patientName}
                </h2>
              </div>
              <div className="overflow-x-auto">
                {previousLoading ? (
                  <div className="flex justify-center items-center py-10 gap-3 text-gray-500 dark:text-slate-400 text-sm">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-darkGreen shrink-0" />
                    Loading appointments...
                  </div>
                ) : previousAppointments.length === 0 ? (
                  <div className="py-10 text-center text-sm text-gray-400 dark:text-slate-500">
                    No other appointments found for this patient.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-slate-800/40 border-b border-gray-200 dark:border-slate-800 text-gray-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                        <th className="py-3 px-4 font-semibold">Date &amp; Time</th>
                        <th className="py-3 px-4 font-semibold">Mode</th>
                        <th className="py-3 px-4 font-semibold">Status</th>
                        <th className="py-3 px-4 font-semibold">Reason</th>
                        <th className="py-3 px-4 font-semibold"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {previousAppointments.map((apt) => (
                        <tr
                          key={apt.id}
                          className="border-b border-gray-100 dark:border-slate-800/60 hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <p className="text-sm font-medium text-gray-800 dark:text-slate-200">
                              {dayjs(apt.start).format("MMM D, YYYY")}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">
                              {dayjs(apt.start).format("h:mm A")} –{" "}
                              {dayjs(apt.end).format("h:mm A")}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <span className="capitalize text-sm font-medium text-gray-700 dark:text-slate-300">
                              {apt.mode}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeClass(apt.status)}`}
                            >
                              {apt.status.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <p
                              className="text-sm text-gray-600 dark:text-slate-400 max-w-[180px] truncate"
                              title={apt.reason}
                            >
                              {apt.reason || "—"}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() =>
                                navigate(`/doctor/appointments/${apt.id}`)
                              }
                              className="px-3 py-1.5 text-xs font-semibold bg-darkGreen/10 hover:bg-darkGreen/20 text-darkGreen border border-darkGreen/20 rounded-lg transition-colors whitespace-nowrap"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (Payment & Actions) */}
          <div className="flex flex-col gap-6">
            {/* Payment Info Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
              <div className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  {getIcon(
                    "money-bill-wave",
                    "20px",
                    "currentColor",
                    "text-darkGreen",
                  )}
                  Payment Details
                </h2>
              </div>
              <div className="p-6">
                {appointment.payment ? (
                  <div className="flex flex-col gap-5">
                    <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-slate-800">
                      <span className="text-gray-500 dark:text-slate-400 text-sm">Status</span>
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getPaymentBadgeClass(
                          appointment.payment.status,
                        )}`}
                      >
                        {appointment.payment.status}
                      </span>
                    </div>
                    {appointment.refund && (
                      <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-slate-800">
                        <span className="text-gray-500 dark:text-slate-400 text-sm font-semibold text-purple-600 dark:text-purple-400">Refund Status</span>
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full border bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/20 dark:text-purple-450 dark:border-purple-900/30">
                          Refunded
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-slate-800">
                      <span className="text-gray-500 dark:text-slate-400 text-sm">Consultation Fee</span>
                      <span className="font-bold text-gray-800 dark:text-white text-lg flex items-center gap-1">
                        {(appointment.consultationFee || appointment.payment.amount).toLocaleString("en-IN", {
                          style: "currency",
                          currency: appointment.payment.currency || "INR",
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-slate-800">
                      <span className="text-gray-500 dark:text-slate-400 text-sm">Total Paid by Patient</span>
                      <span className="font-semibold text-gray-700 dark:text-slate-300 text-base flex items-center gap-1">
                        {appointment.payment.amount.toLocaleString("en-IN", {
                          style: "currency",
                          currency: appointment.payment.currency || "INR",
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 mt-1">
                      <span className="text-gray-500 dark:text-slate-400 text-xs">Paid On</span>
                      <span className="text-sm text-gray-700 dark:text-slate-300 font-medium">
                        {dayjs(appointment.payment.createdAt).format(
                          "MMM D, YYYY at h:mm A",
                        )}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-400">
                      {getIcon("file-invoice-dollar", "24px", "currentColor")}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">
                        No Payment Info
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 max-w-[200px] mx-auto">
                        Payment details are not available or pending for this
                        appointment.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {appointment && (
        <>
          <DAppointmentCancelModal
            isOpen={isCancelModalOpen}
            onClose={() => setIsCancelModalOpen(false)}
            onConfirm={handleCancelConfirm}
            loading={cancelling}
            appointmentId={appointment.id}
          />
          <DAppointmentRescheduleModal
            isOpen={isRescheduleModalOpen}
            onClose={() => setIsRescheduleModalOpen(false)}
            onConfirm={handleRescheduleConfirm}
            loading={rescheduling}
            appointmentId={appointment.id}
            currentSlotStart={appointment.start}
            practiceLocationId={appointment.practiceLocationId || ""}
            mode={appointment.mode}
          />
        </>
      )}
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
    </div>
  );
}

export default DViewAppointmentPage;
