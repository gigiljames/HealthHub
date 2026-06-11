import React, { useEffect, useState, useRef } from "react";
import {
  ArrowLeft,
  PhoneOff,
  Activity,
} from "lucide-react";
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
import dayjs from "dayjs";

// Import separated components
import { PatientPanel } from "./components/PatientPanel";
import { ClinicalPanel } from "./components/ClinicalPanel";
import { TelehealthPanel } from "./components/TelehealthPanel";
import ConfirmationModal from "../../components/common/ConfirmationModal";

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
  text: string;
  replyTo: string | null;
  replyToText: string | null;
  replyToRole: "doctor" | "patient" | null;
  isEdited: boolean;
  isDeleted: boolean;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const DConsultationRoomPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>("WAITING_FOR_PATIENT");
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState<any>(null);

  const [currentTime, setCurrentTime] = useState("");
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);

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

  // Mock Patient details
  const patientData = {
    name: "Sarah Connor",
    age: 34,
    gender: "Female",
    bloodGroup: "O+",
    phone: "+1 (555) 019-2834",
    email: "sarah.connor@example.com",
    allergies: ["Penicillin", "Peanuts", "Sulfonamides"],
    chronicConditions: ["Hypertension (mild)", "Seasonal Asthma"],
    vitals: {
      bp: "124/82 mmHg",
      heartRate: "76 bpm",
      temp: "98.9 °F",
      weight: "64 kg",
      spo2: "99%",
    },
    pastConsultations: [
      { date: "2026-03-12", doctor: "Dr. John Smith", reason: "Annual Wellness Check", diagnosis: "Healthy, recommended exercise" },
      { date: "2025-11-05", doctor: "Dr. Jane Doe", reason: "Persistent Dry Cough", diagnosis: "Mild Bronchitis (Resolved)" },
    ],
    labReports: [
      { date: "2026-04-10", name: "Complete Blood Count (CBC)", status: "Normal" },
      { date: "2026-04-10", name: "Lipid Profile & Glucose Panel", status: "Borderline LDL" },
    ],
    vaccines: [
      { name: "COVID-19 Booster", date: "2025-10-15" },
      { name: "Tdap Vaccine", date: "2024-05-12" },
      { name: "Annual Flu Shot", date: "2025-11-01" },
    ],
  };

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
        }
      } catch (err) {
        console.log("No existing report found");
      }

      try {
        const prescriptionRes = await getPrescriptionByAppointmentId(appointmentId);
        if (prescriptionRes.success && prescriptionRes.data) {
          const p = prescriptionRes.data;
          if (p.medicines && p.medicines.length > 0) {
            setPrescriptions(p.medicines.map((m: any, idx: number) => ({
              id: m.id || idx.toString(),
              medicine: m.medicine,
              dosage: m.dosage,
              frequency: m.frequency,
              timing: m.timing,
              duration: m.duration,
            })));
          }
        }
      } catch (err) {
        console.log("No existing prescription found");
      }
    };

    fetchExistingData();
  }, [appointmentId]);

  useEffect(() => {
    if (!appointmentId) return;

    const setupConsultation = async () => {
      try {
        const response = await joinConsultation(appointmentId);
        const consultation = response.data;
        const consultId = consultation.id || consultation._id;
        setConsultationId(consultId);
        setRoomId(consultation.roomId);

        socketService.connect();
        socketService.joinRoom(consultation.roomId);

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
            toast.success("Patient has joined the consultation");
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

        // Fetch real appointment details
        const apptResponse = await getDoctorAppointmentById(appointmentId);
        if (apptResponse.success) {
          setAppointmentDetails(apptResponse.data);
        }
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
    if (!chiefComplaint || !diagnosis) {
      toast.error("Please fill out Chief Complaint and Diagnosis fields.");
      return;
    }
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
      toast.error(error.response?.data?.message || "Failed to save consultation report.");
    }
  };

  // Add medicine prescription
  const handleAddMedicine = () => {
    if (!newMedicine.trim()) {
      toast.error("Medicine name is required.");
      return;
    }
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
    toast.success("Medication added to prescription list");
  };

  // Remove prescription item
  const handleRemoveMedicine = (id: string) => {
    setPrescriptions(prescriptions.filter((p) => p.id !== id));
    toast.success("Medication removed");
  };

  // Submit/Issue prescription
  const handleIssuePrescription = async () => {
    if (prescriptions.length === 0) {
      toast.error("Please add at least one medication.");
      return;
    }
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
      toast.success("Prescription signed and issued successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to issue prescription.");
    }
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
          <p className="text-slate-600 dark:text-slate-400 font-medium">Entering Consultation Room...</p>
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
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white text-base">Consultation Room</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 flex items-center gap-1.5 animate-pulse">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                Live
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
             Patient: <span className="font-bold text-slate-700 dark:text-slate-300">{appointmentDetails?.patientName || patientData.name}</span> • Age: {appointmentDetails?.dob ? `${dayjs().diff(dayjs(appointmentDetails.dob), "year")} Years` : `${patientData.age} Years`}
          </p>
          </div>
        </div>

        {/* Global Connection / Status Indicators */}
        <div className="flex items-center gap-3">
          {currentTime && (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
              {currentTime}
            </span>
          )}
          {appointmentDetails && (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hidden md:inline-block">
              {getAppointmentTimeText()}
            </span>
          )}
          <div className="hidden lg:flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-200/50 dark:border-slate-700/50 text-xs font-bold">
            <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span className="text-slate-600 dark:text-slate-300">Room Status:</span>
            <span className="text-slate-800 dark:text-slate-100 uppercase">{status.replace(/_/g, " ")}</span>
          </div>

          {status !== "COMPLETED" && (
            <button
              onClick={() => setIsEndModalOpen(true)}
              disabled={ending}
              className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-rose-500/20 transition-all flex items-center gap-2"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End Consultation</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Multi-Panel Workspace */}
      <div className="flex-1 flex gap-3 p-3 min-h-0 bg-slate-100/60 dark:bg-slate-950 overflow-hidden relative">
        <PatientPanel
          infoTab={infoTab}
          setInfoTab={setInfoTab}
          reportTab={reportTab}
          setReportTab={setReportTab}
          videoTab={videoTab}
          setVideoTab={setVideoTab}
          patientSubTab={patientSubTab}
          setPatientSubTab={setPatientSubTab}
          patientData={patientData}
          appointmentDetails={appointmentDetails}
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

          prescriptions={prescriptions}
          newMedicine={newMedicine}
          setNewMedicine={setNewMedicine}
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
          patientData={patientData}

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
    </div>
  );
};

export default DConsultationRoomPage;
