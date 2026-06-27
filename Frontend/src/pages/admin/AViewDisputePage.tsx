import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import AMobileSidebar from "../../components/admin/AMobileSidebar";
import ASidebar from "../../components/admin/ASidebar";
import { getDisputeDetails, updateDisputeStatus, enforceModerationAction, getAdminFileAccessUrl } from "../../api/disputeApi";
import toast from "react-hot-toast";
import { ShieldAlert, User, Clock, AlertTriangle, ArrowLeft, Send, CheckCircle, FileText, Lock, Shield, Ban, Image as ImageIcon, Film, Trash2, Video, Download, Eye, X } from "lucide-react";
import dayjs from "dayjs";
import ConfirmationModal from "../../components/common/ConfirmationModal";

interface DisputeDetailsData {
  dispute: {
    id: string;
    appointmentId: string;
    reporterId: string;
    reportedUserId: string;
    reason: string;
    description: string;
    evidence: Array<{ key: string; name: string; type: string; url: string }>;
    status: "OPEN" | "UNDER_REVIEW" | "RESOLVED";
    resolutionMessage: string | null;
    resolvedBy: string | null;
    resolvedAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
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

function AViewDisputePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  document.title = "Dispute Investigation";

  const [data, setData] = useState<DisputeDetailsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Status transitions state
  const [resolutionMessage, setResolutionMessage] = useState("");
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  // Moderation form state
  const [moderationAction, setModerationAction] = useState<"disable_bookings" | "suspend" | "ban" | "restore_access" | "lift_suspension" | "lift_ban" | "restore_all_access" | "">("");
  const [moderationReason, setModerationReason] = useState("");
  const [suspensionDays, setSuspensionDays] = useState<number>(7);
  const [moderationSubmitting, setModerationSubmitting] = useState(false);

  // Confirmation modal state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<"UNDER_REVIEW" | "RESOLVED" | null>(null);

  // Modal for file previewing on the same page
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string; type: string } | null>(null);

  const handleViewFile = async (key: string, name: string, type: string) => {
    const loadingToast = toast.loading("Generating secure preview link...");
    try {
      const res = await getAdminFileAccessUrl(key, false);
      if (res.success && res.accessUrl) {
        toast.dismiss(loadingToast);
        setPreviewFile({ url: res.accessUrl, name, type });
      } else {
        toast.error("Failed to generate preview URL");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to generate preview URL");
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const handleDownloadFile = async (key: string) => {
    const loadingToast = toast.loading("Generating secure download link...");
    try {
      const res = await getAdminFileAccessUrl(key, true);
      if (res.success && res.accessUrl) {
        toast.dismiss(loadingToast);
        const link = document.createElement("a");
        link.href = res.accessUrl;
        link.setAttribute("download", "");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        toast.error("Failed to generate download URL");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to generate download URL");
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const fetchDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await getDisputeDetails(id);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        toast.error("Failed to load dispute details.");
        navigate("/admin/disputes");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error fetching dispute details.");
      navigate("/admin/disputes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleStatusChangeSubmit = async () => {
    if (!id || !data || !pendingStatusChange) return;

    if (pendingStatusChange === "RESOLVED" && !resolutionMessage.trim()) {
      toast.error("Resolution explanation is required to resolve a dispute.");
      return;
    }

    try {
      setStatusSubmitting(true);
      const res = await updateDisputeStatus(
        id,
        pendingStatusChange,
        pendingStatusChange === "RESOLVED" ? resolutionMessage.trim() : undefined
      );

      if (res.success) {
        toast.success("Dispute status updated successfully.");
        setResolutionMessage("");
        setPendingStatusChange(null);
        await fetchDetails();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update dispute status.");
    } finally {
      setStatusSubmitting(false);
      setIsConfirmModalOpen(false);
    }
  };

  const handleModerationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !moderationAction || !moderationReason.trim()) return;

    if (moderationAction === "suspend" && (!suspensionDays || suspensionDays <= 0)) {
      toast.error("Please enter a valid positive number of suspension days.");
      return;
    }

    try {
      setModerationSubmitting(true);
      const res = await enforceModerationAction(
        data.dispute.reportedUserId,
        moderationAction,
        moderationReason.trim(),
        moderationAction === "suspend" ? suspensionDays : undefined
      );

      if (res.success) {
        toast.success("Moderation action applied and notifications sent.");
        setModerationAction("");
        setModerationReason("");
        await fetchDetails();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to enforce moderation action.");
    } finally {
      setModerationSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-gray-950">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Loading dispute files...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { dispute, reporter, reportedUser, medicalReports, chatHistory } = data;
  const appointment = data.appointment as any;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">Open</span>;
      case "UNDER_REVIEW":
        return <span className="bg-yellow-100 text-yellow-805 dark:bg-yellow-900/30 dark:text-yellow-450 border border-yellow-250 dark:border-yellow-900/40 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">Under Review</span>;
      case "RESOLVED":
        return <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-900/40 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">Resolved</span>;
      default:
        return null;
    }
  };

  const handleStartReview = () => {
    setPendingStatusChange("UNDER_REVIEW");
    setIsConfirmModalOpen(true);
  };

  const handleResolveDispute = () => {
    setPendingStatusChange("RESOLVED");
    setIsConfirmModalOpen(true);
  };

  return (
    <>
      <AMobileSidebar page="disputes" />
      <div className="flex w-full flex-col lg:flex-row min-h-screen bg-[#f3f4f6] dark:bg-[#1a1c23]">
        <ASidebar page="disputes" />

        <div className="w-screen lg:flex-1 relative">
          <div className="flex flex-col gap-6 p-4 md:p-6 h-screen overflow-y-auto min-h-screen text-gray-800 dark:text-gray-200 transition-colors duration-205 w-full pb-16">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-250 dark:border-gray-850 pb-4 mb-2">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/admin/disputes")}
                  className="p-2 bg-white dark:bg-gray-900 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 transition-all active:scale-95"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                    <ShieldAlert className="text-red-500 shrink-0" />
                    <span>Dispute Investigation</span>
                  </h1>
                  <p className="text-xs text-gray-500 mt-1.5">
                    Dispute ID: <span className="font-mono text-[10px]">{dispute.id}</span> • Created {dayjs(dispute.createdAt).format("MMM DD, YYYY h:mm A")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(dispute.status)}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Left Column (Investigation & Evidence) */}
              <div className="lg:col-span-2 flex flex-col gap-6">

                {/* Dispute Details */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                  <div className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center gap-2">
                    <ShieldAlert size={18} className="text-red-500" />
                    <h2 className="font-semibold text-gray-900 dark:text-white text-base">Issue Details</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <p className="text-xs text-gray-400 dark:text-slate-500 mb-1 font-bold uppercase tracking-wider">Report Reason</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white bg-red-500/5 px-4 py-2 border border-red-500/10 rounded-xl w-fit">
                        {dispute.reason}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 dark:text-slate-500 mb-1 font-bold uppercase tracking-wider">Description / Explanation</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800/40 p-4 border border-gray-200 dark:border-gray-800 rounded-xl whitespace-pre-wrap">
                        {dispute.description}
                      </p>
                    </div>                    {dispute.evidence && dispute.evidence.length > 0 ? (
                      <div>
                        <p className="text-xs text-gray-400 dark:text-slate-500 mb-2 font-bold uppercase tracking-wider">Evidence Attachments ({dispute.evidence.length})</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {dispute.evidence.map((ev, idx) => {
                            const isImg = ev.type === "image";
                            return (
                              <div
                                key={idx}
                                className="flex flex-col gap-2 p-3 bg-white dark:bg-gray-855 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm hover:border-red-305 dark:hover:border-red-900/40 transition-all"
                              >
                                <div className="flex items-start gap-2.5">
                                  {isImg ? (
                                    <ImageIcon className="text-blue-500 shrink-0 mt-0.5" size={18} />
                                  ) : (
                                    <Film className="text-purple-505 shrink-0 mt-0.5" size={18} />
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-gray-800 dark:text-gray-250 truncate pr-1" title={ev.name}>
                                      {ev.name}
                                    </p>
                                    <p className="text-[10px] text-gray-400 capitalize mt-0.5">{ev.type}</p>
                                  </div>
                                </div>
                                <div className="flex gap-2 w-full mt-1">
                                  <button
                                    type="button"
                                    onClick={() => handleViewFile(ev.key, ev.name, ev.type)}
                                    className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-emerald-500/25 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-605 dark:text-emerald-455 rounded-lg transition-all font-bold text-[10px]"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>View</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadFile(ev.key)}
                                    className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-emerald-500 text-white dark:text-slate-955 rounded-lg hover:bg-emerald-600 dark:hover:bg-emerald-400 transition-all font-bold text-[10px] shadow-sm"
                                  >
                                    <Download className="w-3 h-3" />
                                    <span>Download</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No attachments submitted for this dispute report.</p>
                    )}
                  </div>
                </div>

                {/* Consultation Chat History */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                  <div className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center gap-2">
                    <Send size={18} className="text-emerald-500" />
                    <h2 className="font-semibold text-gray-900 dark:text-white text-base">Consultation Chat History</h2>
                  </div>
                  <div className="p-6 max-h-[450px] overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/20 custom-scrollbar">
                    {chatHistory.length === 0 ? (
                      <div className="text-center py-10">
                        <p className="text-sm text-gray-400 dark:text-slate-500 italic">No chat messages were exchanged during this consultation room session.</p>
                      </div>
                    ) : (
                      chatHistory.map((msg, index) => {
                        const isReporter = msg.senderId === dispute.reporterId;
                        const isDeleted = msg.isDeleted;
                        const isPatient = msg.senderRole === "user" || msg.senderRole === "patient";
                        return (
                          <div
                            key={index}
                            className={`flex flex-col max-w-[85%] ${isReporter ? "ml-auto items-end" : "mr-auto items-start"}`}
                          >
                            <span className="text-[10px] font-bold text-gray-400 mb-1">
                              {msg.senderName} ({isPatient ? "Patient" : "Doctor"})
                            </span>

                            <div className={`p-3.5 rounded-2xl text-sm border shadow-sm ${isReporter
                              ? "bg-red-500 text-white border-red-500 dark:bg-red-600"
                              : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700"
                              }`}>
                              {isDeleted ? (
                                <div className="flex items-center gap-1.5 opacity-75 italic text-xs">
                                  <Trash2 size={14} />
                                  <span>[Deleted Message] {msg.text}</span>
                                </div>
                              ) : (
                                <div>
                                  {msg.text && <p className="leading-relaxed">{msg.text}</p>}
                                  {msg.file && (
                                    <div className="mt-2 text-slate-800 dark:text-slate-100">
                                      <div className="flex flex-col gap-2 min-w-[200px]">
                                        <div className="flex items-start gap-2.5">
                                          {msg.file.type === "image" ? (
                                            <ImageIcon className="text-blue-500 shrink-0 mt-0.5" size={18} />
                                          ) : msg.file.type === "video" ? (
                                            <Video className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                                          ) : (
                                            <FileText className="text-purple-505 shrink-0 mt-0.5" size={18} />
                                          )}
                                          <div className="min-w-0 flex-1">
                                            <p className={`font-bold text-xs truncate ${isReporter ? "text-white" : "text-slate-905 dark:text-white"}`} title={msg.file.name}>
                                              {msg.file.name}
                                            </p>
                                            <p className={`text-[10px] font-medium ${isReporter ? "text-red-100" : "text-slate-500 dark:text-slate-400"}`}>
                                              {msg.file.type.charAt(0).toUpperCase() + msg.file.type.slice(1)} • {formatFileSize(msg.file.size)}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex gap-2 w-full mt-1">
                                          <button
                                            type="button"
                                            onClick={() => handleViewFile(msg.file!.key, msg.file!.name, msg.file!.type)}
                                            className={`flex-1 flex items-center justify-center gap-1 py-1.5 border rounded-lg transition-all font-bold text-[10px] ${isReporter
                                              ? "bg-white/10 hover:bg-white/20 text-white border-white/20"
                                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-455 border-emerald-500/25 hover:bg-emerald-500/20"
                                              }`}
                                          >
                                            <Eye className="w-3 h-3" />
                                            <span>View</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDownloadFile(msg.file!.key)}
                                            className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-emerald-500 text-white dark:text-slate-955 rounded-lg hover:bg-emerald-600 dark:hover:bg-emerald-400 transition-all font-bold text-[10px] shadow-sm"
                                          >
                                            <Download className="w-3 h-3" />
                                            <span>Download</span>
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            <span className="text-[9px] text-gray-400 mt-1 leading-none">
                              {dayjs(msg.timestamp).format("hh:mm A")}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Medical & Consultation Reports */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                  <div className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center gap-2">
                    <FileText size={18} className="text-indigo-500" />
                    <h2 className="font-semibold text-gray-900 dark:text-white text-base">Associated Medical Reports</h2>
                  </div>
                  <div className="p-6">
                    {medicalReports.length === 0 ? (
                      <p className="text-sm text-gray-400 italic text-center py-4">No consultation report or diagnoses were written for this appointment.</p>
                    ) : (
                      medicalReports.map((rep) => (
                        <div key={rep.id} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                            <div>
                              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Chief Complaint</p>
                              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{rep.chiefComplaint}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Primary Diagnosis</p>
                              <p className="text-sm text-red-500 dark:text-red-400 font-bold">{rep.diagnosis}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Clinical Notes</p>
                            <p className="text-sm text-gray-600 dark:text-gray-350 leading-relaxed bg-slate-50 dark:bg-slate-850 p-4 border border-gray-200 dark:border-slate-800 rounded-xl whitespace-pre-wrap">
                              {rep.clinicalNotes || "No clinical details provided."}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Right Column (Moderation Action & Resolution Panels) */}
              <div className="flex flex-col gap-6">

                {/* Parties Involved Panel */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                  <div className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
                    <h2 className="font-semibold text-gray-900 dark:text-white text-base flex items-center gap-2">
                      <User size={18} className="text-indigo-500" />
                      Parties Involved
                    </h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="pb-4 border-b border-gray-100 dark:border-gray-800/80">
                      <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Reporter ({reporter.role === "user" ? "Patient" : "Doctor"})</span>
                      <p className="font-bold text-gray-800 dark:text-white text-sm">{reporter.name}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{reporter.email}</p>
                      <p className="text-[10px] text-gray-400 font-mono mt-1">ID: {reporter.id}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Reported User ({reportedUser.role === "user" ? "Patient" : "Doctor"})</span>
                      <p className="font-bold text-gray-800 dark:text-white text-sm">{reportedUser.name}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{reportedUser.email}</p>
                      <p className="text-[10px] text-gray-400 font-mono mt-1 mb-2">ID: {reportedUser.id}</p>
                      <span className="text-xs text-gray-500 dark:text-slate-400 mt-1 block">
                        Status: <span className="font-bold text-red-500">{reportedUser.currentAccountStatus}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Transitions Panel */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                  <div className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
                    <h2 className="font-semibold text-gray-900 dark:text-white text-base flex items-center gap-2">
                      <CheckCircle size={18} className="text-darkGreen" />
                      Status Workflow
                    </h2>
                  </div>
                  <div className="p-6 space-y-5">
                    {dispute.status === "OPEN" && (
                      <div className="space-y-3">
                        <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                          This issue is currently in the queue. You must mark it as Under Review to start investigating.
                        </p>
                        <button
                          onClick={handleStartReview}
                          disabled={statusSubmitting}
                          className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-605 text-slate-900 rounded-xl font-bold text-xs shadow transition-all active:scale-98 flex items-center justify-center gap-1.5"
                        >
                          {statusSubmitting ? (
                            <>
                              <svg className="animate-spin h-3.5 w-3.5 text-slate-900 shrink-0" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                              </svg>
                              <span>Processing...</span>
                            </>
                          ) : (
                            "Start Investigation"
                          )}
                        </button>
                      </div>
                    )}

                    {dispute.status === "UNDER_REVIEW" && (
                      <div className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Resolution Explanation</label>
                          <textarea
                            value={resolutionMessage}
                            onChange={(e) => setResolutionMessage(e.target.value)}
                            placeholder="Write an explanation to show in email notifications to both parties..."
                            rows={3}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-gray-250 dark:border-gray-750 p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-500 resize-none transition-all shadow-sm"
                          />
                        </div>
                        <button
                          onClick={handleResolveDispute}
                          disabled={statusSubmitting || !resolutionMessage.trim()}
                          className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xs shadow-lg transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-1.5"
                        >
                          {statusSubmitting ? (
                            <>
                              <svg className="animate-spin h-3.5 w-3.5 text-white shrink-0" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                              </svg>
                              <span>Resolving...</span>
                            </>
                          ) : (
                            "Resolve Dispute"
                          )}
                        </button>
                      </div>
                    )}

                    {dispute.status === "RESOLVED" && (
                      <div className="space-y-3">
                        <div className="p-3.5 bg-green-500/5 dark:bg-green-500/10 border border-green-500/20 rounded-xl">
                          <p className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-widest leading-none mb-1.5">Issue Status</p>
                          <span className="text-sm font-bold text-green-700 dark:text-green-455 flex items-center gap-1.5">
                            <CheckCircle size={16} /> Closed & Resolved
                          </span>
                        </div>
                        {dispute.resolutionMessage && (
                          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-gray-150 dark:border-gray-800/80 text-xs">
                            <p className="font-bold text-gray-400 mb-1.5">Resolution Explanation</p>
                            <p className="text-gray-700 dark:text-gray-300 italic">"{dispute.resolutionMessage}"</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Moderation Actions Panel */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                  <div className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
                    <h2 className="font-semibold text-gray-900 dark:text-white text-base flex items-center gap-2">
                      <Lock size={18} className="text-red-500" />
                      Moderation Actions
                    </h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <form onSubmit={handleModerationSubmit} className="space-y-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Action Type</label>
                        <select
                          value={moderationAction}
                          onChange={(e: any) => setModerationAction(e.target.value)}
                          className="bg-gray-50 dark:bg-gray-850 border border-gray-250 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-755 dark:text-gray-200 outline-none focus:ring-1 focus:ring-red-500"
                        >
                          <option value="">Select moderation action</option>
                          {reportedUser.currentAccountStatus === "New Bookings Blocked" ? (
                            <option value="restore_access">Restore Access</option>
                          ) : (
                            <option value="disable_bookings">Disable Bookings</option>
                          )}
                          {reportedUser.currentAccountStatus.startsWith("Suspended") ? (
                            <option value="lift_suspension">Lift Suspension</option>
                          ) : (
                            <option value="suspend">Temporary Suspension</option>
                          )}
                          {reportedUser.currentAccountStatus === "Permanently Banned" ? (
                            <option value="lift_ban">Lift Permanent Ban</option>
                          ) : (
                            <option value="ban">Permanent Ban</option>
                          )}
                          {reportedUser.currentAccountStatus !== "Active" && (
                            <option value="restore_all_access">Restore All Access</option>
                          )}
                        </select>
                      </div>

                      {moderationAction === "suspend" && (
                        <div className="flex flex-col gap-1.5 animate-in slide-in-from-left duration-200">
                          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Suspension Length (Days)</label>
                          <input
                            type="number"
                            value={suspensionDays}
                            onChange={(e) => setSuspensionDays(parseInt(e.target.value, 10))}
                            min={1}
                            className="bg-gray-50 dark:bg-gray-850 border border-gray-250 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-700 dark:text-gray-200 outline-none focus:ring-1 focus:ring-red-500"
                          />
                        </div>
                      )}

                      {moderationAction && (
                        <>
                          <div className="flex flex-col gap-1.5 animate-in slide-in-from-left duration-200">
                            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Violation Reason</label>
                            <textarea
                              value={moderationReason}
                              onChange={(e) => setModerationReason(e.target.value)}
                              placeholder="Describe the violation reason in detail (sent in email warning notice)..."
                              rows={3}
                              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-gray-250 dark:border-gray-750 p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-500 resize-none transition-all shadow-sm"
                            />
                          </div>

                          {moderationAction === "suspend" && (
                            <div className="flex gap-2 text-[10px] leading-relaxed text-yellow-800 dark:text-yellow-400 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                              <ShieldAlert className="w-4 h-4 text-yellow-500 shrink-0" />
                              <p>
                                <span className="font-bold">Notice:</span> A temporary suspension cancels and refunds all future appointments, releases locked slots, blocks logins, and triggers automated email reminders before auto-reactivation.
                              </p>
                            </div>
                          )}

                          {moderationAction === "ban" && (
                            <div className="flex gap-2 text-[10px] leading-relaxed text-red-800 dark:text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20 animate-pulse">
                              <Ban className="w-4 h-4 text-red-500 shrink-0" />
                              <p>
                                <span className="font-bold">Notice:</span> A permanent ban completely cancels all booking actions, locks the account indefinitely, and kicks the user off the platform immediately.
                              </p>
                            </div>
                          )}

                          {moderationAction === "restore_access" && (
                            <div className="flex gap-2 text-[10px] leading-relaxed text-green-805 dark:text-green-400 bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                              <CheckCircle className="w-4 h-4 text-green-505 shrink-0" />
                              <p>
                                <span className="font-bold">Notice:</span> This will restore booking privileges for this user.
                              </p>
                            </div>
                          )}

                          {moderationAction === "restore_all_access" && (
                            <div className="flex gap-2 text-[10px] leading-relaxed text-green-805 dark:text-green-400 bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                              <CheckCircle className="w-4 h-4 text-green-505 shrink-0" />
                              <p>
                                <span className="font-bold">Notice:</span> This will lift all block, suspension, or ban restrictions and fully restore booking privileges for this user.
                              </p>
                            </div>
                          )}

                          {(moderationAction === "lift_suspension" || moderationAction === "lift_ban") && (
                            <div className="flex gap-2 text-[10px] leading-relaxed text-green-805 dark:text-green-400 bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                              <CheckCircle className="w-4 h-4 text-green-505 shrink-0" />
                              <p>
                                <span className="font-bold">Notice:</span> This will lift the block restriction, allowing the user to log in and use the platform normally.
                              </p>
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={moderationSubmitting || !moderationReason.trim()}
                            className={`w-full py-2.5 text-white rounded-xl font-bold text-xs shadow-lg transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-1.5 ${moderationAction.startsWith("lift_") || moderationAction === "restore_access" || moderationAction === "restore_all_access"
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-red-600 hover:bg-red-700"
                              }`}
                          >
                            {moderationSubmitting ? (
                              <>
                                <svg className="animate-spin h-3.5 w-3.5 text-white shrink-0" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                                <span>Processing...</span>
                              </>
                            ) : moderationAction.startsWith("lift_") || moderationAction === "restore_access" || moderationAction === "restore_all_access" ? (
                              "Apply Action"
                            ) : (
                              "Enforce Moderation"
                            )}
                          </button>
                        </>
                      )}
                    </form>
                  </div>
                </div>

                {/* Appointment Detail Summary */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                  <div className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
                    <h2 className="font-semibold text-gray-900 dark:text-white text-base flex items-center gap-2">
                      <Clock size={18} className="text-blue-500" />
                      Appointment Info
                    </h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Appointment ID</span>
                      <span className="font-mono text-[10px] text-gray-800 dark:text-white font-bold">
                        {appointment.id}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Scheduled Date</span>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {dayjs(appointment.start).format("MMM DD, YYYY")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Scheduled Time</span>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {dayjs(appointment.start).format("hh:mm A")} - {dayjs(appointment.end).format("hh:mm A")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Consultation Mode</span>
                      <span className="font-semibold text-gray-800 dark:text-white capitalize">
                        {appointment.consultationMode.replace("-", " ")}
                      </span>
                    </div>
                    {appointment.practiceLocation && (
                      <div className="flex flex-col gap-1 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <span className="text-gray-500 text-xs font-semibold">Practice Location</span>
                        <span className="text-xs font-bold text-gray-855 dark:text-white">
                          {appointment.practiceLocation.name}
                        </span>
                        {appointment.practiceLocation.address && (
                          <span className="text-[10px] text-gray-400 leading-normal">
                            {appointment.practiceLocation.address}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex justify-between items-center text-xs pt-2 border-t border-gray-100 dark:border-gray-800">
                      <span className="text-gray-500">Booking Status</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        appointment.status === "RESCHEDULE_PENDING" 
                          ? "bg-amber-100 text-amber-700 border border-amber-200"
                          : appointment.status === "CONFIRMED"
                            ? "bg-blue-100 text-blue-700 border border-blue-200"
                            : appointment.status === "COMPLETED"
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : appointment.status.startsWith("CANCELLED")
                                ? "bg-red-100 text-red-700 border border-red-200"
                                : "text-gray-800 dark:text-white"
                      }`}>
                        {appointment.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-2 border-t border-gray-100 dark:border-gray-800">
                      <span className="text-gray-500">Refunded?</span>
                      <span className={`font-bold text-xs uppercase ${appointment.isRefunded ? "text-purple-600 dark:text-purple-400" : "text-gray-400"}`}>
                        {appointment.isRefunded ? "Yes" : "No"}
                      </span>
                    </div>

                    {appointment.status === "CANCELLED_BY_DOCTOR" && appointment.cancellationReason && (
                      <div className="flex flex-col gap-1 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <span className="text-red-500 text-xs font-semibold">Doctor's Cancellation Reason</span>
                        <span className="text-xs italic text-gray-750 dark:text-gray-300 font-medium">
                          "{appointment.cancellationReason}"
                        </span>
                      </div>
                    )}

                    {appointment.isRefunded && appointment.refundDetails && (
                      <div className="p-3 bg-purple-500/5 dark:bg-purple-950/10 border border-purple-250 dark:border-purple-900/30 rounded-xl space-y-1.5 text-[11px] animate-in slide-in-from-bottom duration-250">
                        <p className="font-bold text-purple-700 dark:text-purple-405 text-xs">Refund Details</p>
                        <div className="flex justify-between">
                          <span className="text-gray-505 dark:text-slate-400">Amount</span>
                          <span className="font-bold text-gray-800 dark:text-white">₹{appointment.refundDetails.amount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-505 dark:text-slate-400">Status</span>
                          <span className="font-bold text-gray-800 dark:text-white uppercase">{appointment.refundDetails.status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-550 dark:text-slate-400">Refunded On</span>
                          <span className="text-gray-800 dark:text-white">{dayjs(appointment.refundDetails.createdAt).format("MMM DD, YYYY h:mm A")}</span>
                        </div>
                        <div className="flex flex-col gap-0.5 pt-1 border-t border-purple-200/35 font-mono text-[9px] text-gray-450 dark:text-gray-500">
                          <span>Tx ID</span>
                          <span className="truncate">{appointment.refundDetails.transactionId}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setPendingStatusChange(null);
        }}
        onConfirm={handleStatusChangeSubmit}
        title={pendingStatusChange === "RESOLVED" ? "Resolve Dispute Report" : "Begin Investigation"}
        message={
          pendingStatusChange === "RESOLVED"
            ? "Are you sure you want to close this dispute as RESOLVED? This will send email notifications to the reporter explaining the resolution."
            : "Are you sure you want to mark this dispute status as UNDER_REVIEW? This transitions the issue from the open queue to investigation stage."
        }
        confirmText={pendingStatusChange === "RESOLVED" ? "Resolve" : "Begin"}
        isDestructive={false}
      />

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-150 dark:border-gray-800">
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white truncate text-base">
                  {previewFile.name}
                </h3>
                <p className="text-[10px] text-gray-500 capitalize mt-0.5">{previewFile.type}</p>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-gray-505 hover:text-gray-700 dark:hover:text-gray-200 transition-all font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Content Body */}
            <div className="flex-1 overflow-auto bg-slate-950/20 p-6 flex items-center justify-center min-h-[300px]">
              {previewFile.type === "image" ? (
                <img
                  src={previewFile.url}
                  alt={previewFile.name}
                  className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-md animate-in fade-in duration-300"
                />
              ) : previewFile.type === "video" ? (
                <video
                  src={previewFile.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-[60vh] rounded-lg shadow-md bg-black"
                />
              ) : (
                <div className="text-center p-8 bg-white dark:bg-gray-950/80 rounded-xl border border-gray-200 dark:border-gray-800 max-w-md animate-in fade-in duration-300">
                  <FileText className="w-12 h-12 text-blue-505 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-905 dark:text-white mb-1">Preview not available inline</p>
                  <p className="text-xs text-gray-500 mb-4">This file type is not previewable directly. Please download the file to view it.</p>
                  <button
                    type="button"
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = previewFile.url;
                      link.setAttribute("download", previewFile.name);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-sm transition-all"
                  >
                    Download File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AViewDisputePage;
