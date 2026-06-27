import React, { useEffect, useState, useRef } from "react";
import {
  ArrowLeft,
  PhoneOff,
  Activity,
  ShieldAlert,
} from "lucide-react";
import DisputeReportModal from "../../components/common/DisputeReportModal";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";
import {
  endConsultation,
  joinConsultation,
  createConsultationReport,
  createPrescription,
  getConsultationReportByAppointmentId,
  getPrescriptionByAppointmentId,
} from "../../api/consultationApi";
import { getDoctorAppointmentById } from "../../api/doctor/appointmentService";
import { socketService } from "../../api/socketService";
import {
  getChatHistory,
  sendMessage,
  editMessage,
  deleteMessage,
  markMessageAsRead,
} from "../../api/chatApi";
import { useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import dayjs from "dayjs";

// Import separated components
import { PatientPanel } from "./components/PatientPanel";
import { ClinicalPanel } from "./components/ClinicalPanel";
import { TelehealthPanel } from "./components/TelehealthPanel";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { SignatureModal } from "./components/SignatureModal";
import { getDoctor } from "../../api/admin/doctorService";

interface PrescriptionItem {
  id: string;
  medicine: string;
  dosage: string;
  frequency: string;
  timing: "Before Food" | "After Food";
  duration: string;
}

interface Message {
  id: string;
  consultationId: string;
  roomId: string;
  senderId: string;
  senderRole: "doctor" | "patient";
  text?: string;
  replyTo: string | null;
  replyToText: string | null;
  replyToRole: "doctor" | "patient" | null;
  isEdited: boolean;
  isDeleted: boolean;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
  file?: {
    key: string;
    name: string;
    type: "image" | "video" | "document";
    size: number;
  };
}

const DConsultationRoomPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { email: myEmail, id: doctorId } = useSelector((state: RootState) => state.userInfo);
  const [status, setStatus] = useState<string>("WAITING_FOR_PATIENT");
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState<any>(null);

  const [currentTime, setCurrentTime] = useState("");
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-IN", { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getAppointmentTimeText = () => {
    if (!appointmentDetails || !appointmentDetails.start) return "";
    const dateStr = dayjs(appointmentDetails.start).format("MMM DD, YYYY");
    const startStr = dayjs(appointmentDetails.start).format("hh:mm A");
    const endStr = dayjs(appointmentDetails.end).format("hh:mm A");
    return `${dateStr} • ${startStr} - ${endStr}`;
  };

  // Panel collapse/expand state
  const [infoTab, setInfoTab] = useState(true);
  const [reportTab, setReportTab] = useState(true);
  const [videoTab, setVideoTab] = useState(true);

  // Sub-tabs in each panel
  const [patientSubTab, setPatientSubTab] = useState<"details" | "history">("details");
  const [clinicalSubTab, setClinicalSubTab] = useState<"report" | "prescription">("report");
  const [telehealthSubTab, setTelehealthSubTab] = useState<"call" | "chat">("call");

  // Call options state
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Consultation Report Form state
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");
  const [isReportSaved, setIsReportSaved] = useState(false);

  // Inline Validation States
  const [reportErrors, setReportErrors] = useState<{ chiefComplaint?: string; diagnosis?: string; submit?: string }>({});
  const [prescriptionErrors, setPrescriptionErrors] = useState<{ medicine?: string; submit?: string; items?: string }>({});

  // Doctor profile signature states
  const [doctorSignature, setDoctorSignature] = useState<{ signatureKey: string | null; signatureUrl: string | null }>({
    signatureKey: null,
    signatureUrl: null,
  });
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isPrescriptionIssued, setIsPrescriptionIssued] = useState(false);
  const [isConfirmIssueModalOpen, setIsConfirmIssueModalOpen] = useState(false);
  const [issuingPrescription, setIssuingPrescription] = useState(false);

  // Auto-save Status States
  const [reportSaveStatus, setReportSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [reportSavedTime, setReportSavedTime] = useState<string>("");

  const [prescriptionSaveStatus, setPrescriptionSaveStatus] = useState<"idle" | "saving" | "saved" | "error" | "no_signature">("idle");
  const [prescriptionSavedTime, setPrescriptionSavedTime] = useState<string>("");

  // Refs to control initial load skipping
  const isInitialLoadReport = useRef(true);
  const isInitialLoadPrescription = useRef(true);

  // Fetch doctor profile to check signature
  useEffect(() => {
    if (!doctorId) return;
    const fetchSignature = async () => {
      try {
        const res = await getDoctor(doctorId);
        if (res?.success && res?.doctor) {
          setDoctorSignature({
            signatureKey: res.doctor.signatureKey || null,
            signatureUrl: res.doctor.signatureUrl || null,
          });
        }
      } catch (err) {
        console.error("Failed to fetch doctor signature details", err);
      }
    };
    fetchSignature();
  }, [doctorId]);

  // Prescription Form state
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);
  const [newMedicine, setNewMedicine] = useState("");
  const [newDosage, setNewDosage] = useState("1 tablet");
  const [newFrequency, setNewFrequency] = useState("Once daily");
  const [newTiming, setNewTiming] = useState<"Before Food" | "After Food">("After Food");
  const [newDuration, setNewDuration] = useState("5 days");

  // Chat Room state
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [typingStatus, setTypingStatus] = useState<string | null>(null);
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);
  const [consultationId, setConsultationId] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [messageIdToDelete, setMessageIdToDelete] = useState<string | null>(null);

  // Fetch existing report and prescription if they exist for the appointment
  useEffect(() => {
    if (!appointmentId) return;

    const fetchExistingData = async () => {
      try {
        const reportRes = await getConsultationReportByAppointmentId(appointmentId);
        if (reportRes.success && reportRes.data) {
          const r = reportRes.data;
          setChiefComplaint(r.chiefComplaint || "");
          setClinicalNotes(r.clinicalNotes || "");
          setDiagnosis(r.diagnosis || "");
          setFollowUpDate(r.followUpDate ? dayjs(r.followUpDate).format("YYYY-MM-DD") : "");
          setFollowUpNotes(r.followUpNotes || "");
          setIsReportSaved(true);
          setReportSaveStatus("saved");
          if (r.updatedAt) {
            setReportSavedTime(dayjs(r.updatedAt).format("hh:mm:ss A"));
          }
        }
      } catch (err) {
        console.log("No existing report found");
      } finally {
        setTimeout(() => {
          isInitialLoadReport.current = false;
        }, 100);
      }

      try {
        const prescriptionRes = await getPrescriptionByAppointmentId(appointmentId);
        if (prescriptionRes.success && prescriptionRes.data) {
          const p = prescriptionRes.data;
          setIsPrescriptionIssued(true);
          if (p.medicines && p.medicines.length > 0) {
            setPrescriptions(p.medicines.map((m: any, idx: number) => ({
              id: m.id || idx.toString(),
              medicine: m.medicine,
              dosage: m.dosage,
              frequency: m.frequency,
              timing: m.timing,
              duration: m.duration,
            })));
            setPrescriptionSaveStatus("saved");
            if (p.updatedAt) {
              setPrescriptionSavedTime(dayjs(p.updatedAt).format("hh:mm:ss A"));
            }
          }
        }
      } catch (err) {
        console.log("No existing prescription found");
      } finally {
        setTimeout(() => {
          isInitialLoadPrescription.current = false;
        }, 100);
      }
    };

    fetchExistingData();
  }, [appointmentId]);

  // Auto-save Consultation Report Effect
  useEffect(() => {
    if (isInitialLoadReport.current) return;
    if (status === "COMPLETED") return;

    if (!chiefComplaint.trim() || !diagnosis.trim()) {
      setReportSaveStatus("idle");
      return;
    }

    setReportSaveStatus("saving");

    const timer = setTimeout(async () => {
      try {
        await createConsultationReport({
          appointmentId: appointmentId!,
          chiefComplaint,
          clinicalNotes,
          diagnosis,
          followUpDate: followUpDate || null,
          followUpNotes,
        });
        setIsReportSaved(true);
        setReportSaveStatus("saved");
        setReportSavedTime(dayjs().format("hh:mm:ss A"));
        setReportErrors({});
      } catch (error: any) {
        setReportSaveStatus("error");
        const errMsg = error.response?.data?.message || "Failed to auto-save report.";
        setReportErrors({ submit: errMsg });
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [chiefComplaint, clinicalNotes, diagnosis, followUpDate, followUpNotes]);

  // Auto-save Prescription Effect
  useEffect(() => {
    if (isInitialLoadPrescription.current) return;
    if (status === "COMPLETED") return;
    if (!isPrescriptionIssued) {
      setPrescriptionSaveStatus("idle");
      return;
    }

    if (prescriptions.length === 0) {
      setPrescriptionSaveStatus("idle");
      return;
    }

    if (!doctorSignature.signatureKey) {
      setPrescriptionSaveStatus("no_signature");
      return;
    }

    setPrescriptionSaveStatus("saving");

    const timer = setTimeout(async () => {
      try {
        const medicines = prescriptions.map((p) => ({
          medicine: p.medicine,
          dosage: p.dosage,
          frequency: p.frequency,
          timing: p.timing,
          duration: p.duration,
        }));
        await createPrescription({
          appointmentId: appointmentId!,
          medicines,
        });
        setPrescriptionSaveStatus("saved");
        setPrescriptionSavedTime(dayjs().format("hh:mm:ss A"));
        setPrescriptionErrors({});
      } catch (error: any) {
        setPrescriptionSaveStatus("error");
        const errMsg = error.response?.data?.message || "Failed to auto-save prescription.";
        setPrescriptionErrors({ submit: errMsg });
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [prescriptions, doctorSignature.signatureKey, isPrescriptionIssued]);

  useEffect(() => {
    if (!appointmentId) return;

    const setupConsultation = async () => {
      try {
        // Fetch real appointment details FIRST
        const apptResponse = await getDoctorAppointmentById(appointmentId);
        let patientName = "Patient";
        if (apptResponse.success && apptResponse.data) {
          setAppointmentDetails(apptResponse.data);
          patientName = apptResponse.data.patientName || "Patient";
          if (apptResponse.data?.mode === "in-person") {
            setVideoTab(false);
          }
        }

        const response = await joinConsultation(appointmentId);
        const consultation = response.data;
        const consultId = consultation.id || consultation._id;
        setConsultationId(consultId);
        setRoomId(consultation.roomId);

        socketService.connect();
        socketService.joinRoom(consultation.roomId, myEmail);

        if (consultation.endedAt) {
          setStatus("COMPLETED");
        } else if (consultation.startedAt) {
          setStatus("IN_PROGRESS");
        } else if (consultation.patientJoinedAt) {
          setStatus("WAITING_FOR_START");
        }

        socketService.on("user_joined", (data: any) => {
          if (data.role === "user") {
            setStatus("IN_PROGRESS");
            toast.success(`${patientName} has joined the consultation`, { icon: "👋" });
          }
        });

        socketService.on("consultation_ended", (data: any) => {
          setStatus("COMPLETED");
          if (data && data.endedBy === "patient") {
            toast.success("Patient has ended the consultation");
            navigate("/doctor/appointments");
          }
        });

        // Load Persistent Chat History
        const chatRes = await getChatHistory(consultId);
        if (chatRes.success && chatRes.data) {
          setChatMessages(chatRes.data);

          // Mark incoming unread patient messages as read
          for (const msg of chatRes.data) {
            if (msg.senderRole === "patient" && !msg.readAt) {
              await markMessageAsRead(msg.id, consultation.roomId);
            }
          }
        }

        // Chat Socket Listeners
        socketService.on("chat_message", (msg: any) => {
          setChatMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });

          // Symmetrical auto-read receipt trigger
          if (msg.senderRole === "patient") {
            markMessageAsRead(msg.id, consultation.roomId);
          }
        });

        socketService.on("chat_message_edited", (msg: any) => {
          setChatMessages((prev) => prev.map((m) => (m.id === msg.id ? msg : m)));
        });

        socketService.on("chat_message_deleted", (msg: any) => {
          setChatMessages((prev) => prev.map((m) => (m.id === msg.id ? msg : m)));
        });

        socketService.on("chat_message_read", (msg: any) => {
          setChatMessages((prev) => prev.map((m) => (m.id === msg.id ? msg : m)));
        });

        socketService.on("chat_typing", (data: any) => {
          if (data.role === "patient") {
            setTypingStatus(data.isTyping ? `${data.name} is typing...` : null);
          }
        });
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Failed to join consultation",
        );
        navigate("/doctor/appointments");
      } finally {
        setLoading(false);
      }
    };

    setupConsultation();

    return () => {
      if (appointmentId) {
        socketService.leaveRoom(`room_${appointmentId}`);
      }
      socketService.disconnect();
    };
  }, [appointmentId, navigate]);

  // End consultation handler
  const handleEndConsultation = async () => {
    setEnding(true);
    try {
      await endConsultation(appointmentId!);
      setStatus("COMPLETED");
      toast.success("Consultation ended successfully");
      navigate("/doctor/appointments");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to end consultation");
    } finally {
      setEnding(false);
      setIsEndModalOpen(false);
    }
  };

  // Save report action
  const handleSaveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { chiefComplaint?: string; diagnosis?: string } = {};
    if (!chiefComplaint.trim()) {
      newErrors.chiefComplaint = "Chief complaint / symptoms is required.";
    }
    if (!diagnosis.trim()) {
      newErrors.diagnosis = "Primary diagnosis is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setReportErrors(newErrors);
      return;
    }

    setReportErrors({});
    try {
      await createConsultationReport({
        appointmentId: appointmentId!,
        chiefComplaint,
        clinicalNotes,
        diagnosis,
        followUpDate: followUpDate || null,
        followUpNotes,
      });
      setIsReportSaved(true);
      toast.success("Consultation report saved successfully!");
    } catch (error: any) {
      const errMsg = error.response?.data?.message || "Failed to save consultation report.";
      setReportErrors({ submit: errMsg });
    }
  };

  // Add medicine prescription
  const handleAddMedicine = () => {
    if (!newMedicine.trim()) {
      setPrescriptionErrors(prev => ({ ...prev, medicine: "Medicine name is required." }));
      return;
    }
    setPrescriptionErrors(prev => ({ ...prev, medicine: "", items: "" }));

    const item: PrescriptionItem = {
      id: Date.now().toString(),
      medicine: newMedicine,
      dosage: newDosage,
      frequency: newFrequency,
      timing: newTiming,
      duration: newDuration,
    };
    setPrescriptions([...prescriptions, item]);
    setNewMedicine("");
    setNewDosage("1 tablet");
    setNewFrequency("Once daily");
    setNewDuration("5 days");
  };

  // Remove prescription item
  const handleRemoveMedicine = (id: string) => {
    setPrescriptions(prescriptions.filter((p) => p.id !== id));
  };

  // Submit/Issue prescription
  const handleIssuePrescription = async () => {
    if (prescriptions.length === 0) {
      setPrescriptionErrors(prev => ({ ...prev, items: "Please add at least one medication before issuing." }));
      return;
    }
    setPrescriptionErrors({});
    setIsSignatureModalOpen(true);
  };

  // Send chat message with DB persistence
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim() || !consultationId) return;

    try {
      const text = currentMessage;
      setCurrentMessage("");
      const targetRoomId = roomId || `room_${appointmentId}`;
      await sendMessage(
        consultationId,
        text,
        targetRoomId,
        replyingToMessage?.id || null
      );
      setReplyingToMessage(null);
    } catch (err: any) {
      toast.error("Failed to send message");
    }
  };

  // Edit chat message
  const handleEditMessage = async (messageId: string, text: string) => {
    if (!text.trim() || !roomId) return;
    try {
      await editMessage(messageId, text, roomId);
      toast.success("Message edited");
    } catch (err: any) {
      toast.error("Failed to edit message");
    }
  };

  // Soft delete chat message
  const handleDeleteMessage = (messageId: string) => {
    setMessageIdToDelete(messageId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteMessage = async () => {
    if (!messageIdToDelete || !roomId) return;
    try {
      await deleteMessage(messageIdToDelete, roomId);
      toast.success("Message deleted");
    } catch (err: any) {
      toast.error("Failed to delete message");
    } finally {
      setIsDeleteModalOpen(false);
      setMessageIdToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-gray-955">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-emerald-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <p className="text-slate-605 dark:text-slate-400 font-medium">Entering Consultation Room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300 overflow-hidden">
      {/* Sleek Premium Header */}
      <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md px-6 flex items-center justify-between z-45 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (status !== "COMPLETED") {
                setIsExitModalOpen(true);
              } else {
                navigate("/doctor/appointments");
              }
            }}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors flex items-center justify-center text-slate-500 hover:text-slate-855 dark:hover:text-slate-202 border border-slate-202 dark:border-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white text-base">Consultation Room</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-606 dark:text-emerald-400 font-bold border border-emerald-500/20 flex items-center gap-1.5 animate-pulse">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                Live
              </span>
            </div>
            <p className="text-xs text-slate-550 dark:text-slate-400 font-medium">
              Patient: <span className="font-bold text-slate-700 dark:text-slate-300">{appointmentDetails?.patientName || "—"}</span>{appointmentDetails?.dob ? ` • Age: ${dayjs().diff(dayjs(appointmentDetails.dob), "year")} Yrs` : ""}
            </p>
          </div>
        </div>

        {/* Global Connection / Status Indicators */}
        <div className="flex items-center gap-3">
          {currentTime && (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-101 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
              {currentTime}
            </span>
          )}
          {appointmentDetails && (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-101 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hidden md:inline-block">
              {getAppointmentTimeText()}
            </span>
          )}
          <div className="hidden lg:flex items-center gap-2 bg-slate-101 dark:bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-200/50 dark:border-slate-700/50 text-xs font-bold">
            <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span className="text-slate-600 dark:text-slate-300">Room Status:</span>
            <span className="text-slate-800 dark:text-slate-100 uppercase">{status.replace(/_/g, " ")}</span>
          </div>

          {status !== "COMPLETED" && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDisputeModalOpen(true)}
                className="bg-white hover:bg-red-50 dark:bg-slate-900 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Report Issue</span>
              </button>
              <button
                onClick={() => setIsEndModalOpen(true)}
                disabled={ending}
                className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-rose-500/20 transition-all flex items-center gap-2"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Consultation</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Multi-Panel Workspace */}
      <div className="flex-1 flex gap-3 p-3 min-h-0 bg-slate-100/60 dark:bg-slate-955 overflow-hidden relative">
        <PatientPanel
          infoTab={infoTab}
          setInfoTab={setInfoTab}
          reportTab={reportTab}
          setReportTab={setReportTab}
          videoTab={videoTab}
          setVideoTab={setVideoTab}
          patientSubTab={patientSubTab}
          setPatientSubTab={setPatientSubTab}
          appointmentDetails={appointmentDetails}
          consultationStatus={status}
        />

        <ClinicalPanel
          infoTab={infoTab}
          setInfoTab={setInfoTab}
          reportTab={reportTab}
          setReportTab={setReportTab}
          videoTab={videoTab}
          setVideoTab={setVideoTab}
          clinicalSubTab={clinicalSubTab}
          setClinicalSubTab={setClinicalSubTab}

          status={status}

          chiefComplaint={chiefComplaint}
          setChiefComplaint={(val) => {
            setChiefComplaint(val);
            setIsReportSaved(false);
            setReportErrors(prev => ({ ...prev, chiefComplaint: "" }));
          }}
          clinicalNotes={clinicalNotes}
          setClinicalNotes={(val) => {
            setClinicalNotes(val);
            setIsReportSaved(false);
          }}
          diagnosis={diagnosis}
          setDiagnosis={(val) => {
            setDiagnosis(val);
            setIsReportSaved(false);
            setReportErrors(prev => ({ ...prev, diagnosis: "" }));
          }}
          followUpDate={followUpDate}
          setFollowUpDate={(val) => {
            setFollowUpDate(val);
            setIsReportSaved(false);
          }}
          followUpNotes={followUpNotes}
          setFollowUpNotes={(val) => {
            setFollowUpNotes(val);
            setIsReportSaved(false);
          }}
          isReportSaved={isReportSaved}
          handleSaveReport={handleSaveReport}
          reportSaveStatus={reportSaveStatus}
          reportSavedTime={reportSavedTime}
          prescriptionSaveStatus={prescriptionSaveStatus}
          prescriptionSavedTime={prescriptionSavedTime}
          isPrescriptionIssued={isPrescriptionIssued}

          reportErrors={reportErrors}
          prescriptionErrors={prescriptionErrors}

          prescriptions={prescriptions}
          newMedicine={newMedicine}
          setNewMedicine={(val) => {
            setNewMedicine(val);
            setPrescriptionErrors(prev => ({ ...prev, medicine: "" }));
          }}
          newDosage={newDosage}
          setNewDosage={setNewDosage}
          newFrequency={newFrequency}
          setNewFrequency={setNewFrequency}
          newTiming={newTiming}
          setNewTiming={setNewTiming}
          newDuration={newDuration}
          setNewDuration={setNewDuration}
          handleAddMedicine={handleAddMedicine}
          handleRemoveMedicine={handleRemoveMedicine}
          handleIssuePrescription={handleIssuePrescription}
        />

        {(() => {
          const rawModes = appointmentDetails?.supportedModes || [];
          const expandedModes: string[] = [];
          if (rawModes.includes("VIDEO")) {
            expandedModes.push("VIDEO", "AUDIO", "CHAT");
          } else if (rawModes.includes("AUDIO")) {
            expandedModes.push("AUDIO", "CHAT");
          } else if (rawModes.includes("CHAT")) {
            expandedModes.push("CHAT");
          }

          const hasVideo = expandedModes.includes("VIDEO");
          const hasAudio = expandedModes.includes("AUDIO");
          const hasChat = expandedModes.includes("CHAT");
          const isTelehealth = appointmentDetails?.mode !== "in-person" && (hasVideo || hasAudio || hasChat);

          return isTelehealth && (
            <TelehealthPanel
              infoTab={infoTab}
              setInfoTab={setInfoTab}
              reportTab={reportTab}
              setReportTab={setReportTab}
              videoTab={videoTab}
              setVideoTab={setVideoTab}
              telehealthSubTab={telehealthSubTab}
              setTelehealthSubTab={setTelehealthSubTab}

              status={status}
              appointmentDetails={appointmentDetails}

              isMuted={isMuted}
              setIsMuted={setIsMuted}
              isCamOff={isCamOff}
              setIsCamOff={setIsCamOff}
              isSharing={isSharing}
              setIsSharing={setIsSharing}

              chatMessages={chatMessages}
              currentMessage={currentMessage}
              setCurrentMessage={setCurrentMessage}
              handleSendChatMessage={handleSendChatMessage}
              chatBottomRef={chatBottomRef}
              toast={toast}
              typingStatus={typingStatus}
              replyingToMessage={replyingToMessage}
              setReplyingToMessage={setReplyingToMessage}
              handleEditMessage={handleEditMessage}
              handleDeleteMessage={handleDeleteMessage}
              consultationId={consultationId}
              roomId={roomId}
            />
          );
        })()}
      </div>
      <ConfirmationModal
        isOpen={isEndModalOpen}
        onClose={() => setIsEndModalOpen(false)}
        onConfirm={handleEndConsultation}
        title="End Consultation"
        message="Are you sure you want to end this consultation? This action cannot be undone."
        confirmText={ending ? "Ending..." : "End Session"}
        cancelText="Cancel"
        isDestructive={true}
      />

      {/* Delete Message Confirmation Modal overlay */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setMessageIdToDelete(null);
        }}
        onConfirm={handleConfirmDeleteMessage}
        title="Delete Message"
        message="Are you sure you want to delete this message? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />
      <ConfirmationModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirm={() => {
          setIsExitModalOpen(false);
          navigate("/doctor/appointments");
        }}
        title="Leave Consultation Room"
        message="Are you sure you want to leave the consultation room? The consultation is still in progress."
        confirmText="Leave"
        cancelText="Cancel"
        isDestructive={false}
      />
      <DisputeReportModal
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
        appointmentId={appointmentId!}
        onSuccess={() => {
          toast.success("Issue report submitted successfully.");
        }}
      />
      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        doctorId={doctorId}
        existingSignatureUrl={doctorSignature.signatureUrl}
        onConfirmSignature={async (signatureKey, signatureUrl) => {
          if (signatureKey) {
            setDoctorSignature({ signatureKey, signatureUrl });
          }
          setIsSignatureModalOpen(false);
          setIsConfirmIssueModalOpen(true);
        }}
      />
      <ConfirmationModal
        isOpen={isConfirmIssueModalOpen}
        onClose={() => setIsConfirmIssueModalOpen(false)}
        onConfirm={async () => {
          setIssuingPrescription(true);
          try {
            const medicines = prescriptions.map((p) => ({
              medicine: p.medicine,
              dosage: p.dosage,
              frequency: p.frequency,
              timing: p.timing,
              duration: p.duration,
            }));
            await createPrescription({
              appointmentId: appointmentId!,
              medicines,
            });
            setIsPrescriptionIssued(true);
            setPrescriptionSaveStatus("saved");
            setPrescriptionSavedTime(dayjs().format("hh:mm:ss A"));
            toast.success("Prescription signed and issued successfully!");
            setIsConfirmIssueModalOpen(false);
          } catch (error: any) {
            const errMsg = error.response?.data?.message || "Failed to issue prescription.";
            setPrescriptionErrors({ submit: errMsg });
            toast.error(errMsg);
          } finally {
            setIssuingPrescription(false);
          }
        }}
        title="Sign & Issue Prescription"
        message="Are you sure you want to sign and issue this prescription? Once issued, it cannot be undone, and any further changes will be saved automatically."
        confirmText={issuingPrescription ? "Signing..." : "Sign & Issue"}
        cancelText="Cancel"
        isDestructive={false}
      />
    </div>
  );
};

export default DConsultationRoomPage;
