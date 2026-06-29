import React, { useEffect, useState, useRef } from "react";
import {
  ArrowLeft,
  PhoneOff,
  Activity,
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageSquare,
  Send,
  UserCheck,
  CornerUpLeft,
  Edit3,
  Trash2,
  Check,
  X,
  Star,
  ShieldAlert,
  CheckCircle2,
  ChevronRight,
  Phone,
  Paperclip,
  Download,
  FileText,
  Image as ImageIcon,
  Eye,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useWebRTC } from "../../hooks/useWebRTC";
import { AudioOnlyConsultation } from "../doctor/components/AudioOnlyConsultation";
import {
  toggleSwapped,
  setSupportedModes,
  setStatus as setCallStatus,
  setRoomId,
} from "../../state/call/callSlice";
import { joinConsultation, endConsultation } from "../../api/consultationApi";
import { getAppointmentById } from "../../api/user/bookingService";
import { socketService } from "../../api/socketService";
import {
  getChatHistory,
  sendMessage,
  editMessage,
  deleteMessage,
  markMessageAsRead,
  getChatAccessUrl,
  getChatUploadUrl,
  uploadFileToS3,
} from "../../api/chatApi";
import dayjs from "dayjs";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import type { RootState } from "../../state/store";
import DisputeReportModal from "../../components/common/DisputeReportModal";

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

const UConsultationRoomPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();

  // Status & loading states
  const [status, setStatus] = useState<string>("WAITING_FOR_DOCTOR");
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState<any>(null);

  // Active view for mobile (Call vs Chat)
  const [activeMobileTab, setActiveMobileTab] = useState<"call" | "chat">("call");

  // Time & Clock states
  const [currentTime, setCurrentTime] = useState("");
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);

  // Redux & WebRTC state
  const dispatch = useDispatch();
  const {
    audioMuted,
    videoMuted,
    remoteAudioMuted,
    isSwapped,
    status: callStatus,
    supportedModes,
  } = useSelector((state: RootState) => state.call);

  const { email: myEmail } = useSelector((state: RootState) => state.userInfo);

  const isOnline = appointmentDetails?.slot?.consultationMode === "online";
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  const rawModes = appointmentDetails?.slot?.supportedModes || [];
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
  const isTelehealth = isOnline && (hasVideo || hasAudio || hasChat);

  const doctorNameVal = appointmentDetails?.doctor?.name || "Doctor";

  const { myStream, remoteStream, toggleAudio, toggleVideo } = useWebRTC(
    appointmentDetails?.roomId || `room_${appointmentId}`,
    myEmail,
    toast,
    !!appointmentDetails && isOnline && status !== "COMPLETED",
    `Dr. ${doctorNameVal}`,
    expandedModes
  );

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  // Bind video streams
  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = myStream;
    }
  }, [myStream, isSwapped, activeMobileTab]);

  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, isSwapped, activeMobileTab]);

  const supportedModesStr = JSON.stringify(expandedModes);
  const roomIdVal = appointmentDetails?.roomId || `room_${appointmentId}`;
  const hasAppDetails = !!appointmentDetails;

  useEffect(() => {
    if (hasAppDetails) {
      dispatch(setSupportedModes(expandedModes));
      dispatch(setRoomId(roomIdVal));
    }
  }, [supportedModesStr, roomIdVal, hasAppDetails, dispatch]);

  useEffect(() => {
    if (status === "COMPLETED") {
      dispatch(setCallStatus("COMPLETED"));
    } else if (status === "IN_PROGRESS") {
      dispatch(setCallStatus("IN_PROGRESS"));
    } else if (status === "WAITING_FOR_DOCTOR") {
      dispatch(setCallStatus("WAITING_FOR_PEER"));
    }
  }, [status, dispatch]);

  useEffect(() => {
    if (!hasVideo && remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, hasVideo]);

  useEffect(() => {
    if (!hasVideo && !hasAudio && hasChat) {
      setActiveMobileTab("chat");
    } else if ((hasVideo || hasAudio) && !hasChat) {
      setActiveMobileTab("call");
    }
  }, [hasVideo, hasAudio, hasChat]);

  const [isSharing, setIsSharing] = useState(false);

  // Interactive smart Chat room state
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [typingStatus, setTypingStatus] = useState<string | null>(null);
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);
  const [consultationId, setConsultationId] = useState<string>("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [messageIdToDelete, setMessageIdToDelete] = useState<string | null>(null);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const typingTimeoutRef = useRef<any | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // File sharing state
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileUrls, setFileUrls] = useState<Record<string, string>>({});
  const [fetchingUrls, setFetchingUrls] = useState<Record<string, boolean>>({});
  const [downloadedFileMessageIds, setDownloadedFileMessageIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("downloadedFileMessageIds");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const markAsDownloaded = (msgId: string) => {
    const updated = [...downloadedFileMessageIds, msgId];
    setDownloadedFileMessageIds(updated);
    localStorage.setItem("downloadedFileMessageIds", JSON.stringify(updated));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const fetchFileUrl = async (msgId: string, download = false): Promise<string | undefined> => {
    const fetchKey = download ? `${msgId}-download` : `${msgId}-preview`;
    if (fetchingUrls[fetchKey]) return;
    setFetchingUrls(prev => ({ ...prev, [fetchKey]: true }));
    try {
      const res = await getChatAccessUrl(msgId, download);
      if (res.success && res.data?.accessUrl) {
        if (!download) {
          setFileUrls(prev => ({ ...prev, [msgId]: res.data.accessUrl }));
          return res.data.accessUrl;
        } else {
          const link = document.createElement("a");
          link.href = res.data.accessUrl;
          link.setAttribute("download", "");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          return res.data.accessUrl;
        }
      }
    } catch (err) {
      console.error("Failed to fetch file access url", err);
      toast.error("Failed to retrieve file access link");
    } finally {
      setFetchingUrls(prev => ({ ...prev, [fetchKey]: false }));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const EXECUTABLE_EXTENSIONS = [
      "exe", "bat", "cmd", "sh", "bin", "msi", "jar", "com", "apk", "app",
      "scr", "vbs", "wsf", "run", "ps1", "vbe", "jse"
    ];
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (EXECUTABLE_EXTENSIONS.includes(ext) || file.type === "application/x-msdownload") {
      toast.error("Executable files are strictly not accepted.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    let type: "image" | "video" | "document" = "document";
    if (file.type.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "tiff"].includes(ext)) {
      type = "image";
    } else if (file.type.startsWith("video/") || ["mp4", "webm", "ogg", "mov", "avi", "mkv", "flv", "wmv"].includes(ext)) {
      type = "video";
    }

    let sizeLimit = 0;
    if (type === "image") {
      sizeLimit = 10 * 1024 * 1024; // 10MB
    } else if (type === "video") {
      sizeLimit = 100 * 1024 * 1024; // 100MB
    } else {
      sizeLimit = 20 * 1024 * 1024; // 20MB
    }

    if (file.size > sizeLimit) {
      toast.error(`File size exceeds the limit of ${sizeLimit / (1024 * 1024)}MB for ${type}s.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploadingFile(true);
    const loadingToastId = toast.loading("Uploading file to secure storage...");

    try {
      const roomId = appointmentDetails?.slot?.roomId || appointmentDetails?.roomId || `room_${appointmentId}`;
      const res = await getChatUploadUrl(consultationId, file.name, file.type, file.size);
      if (res.success && res.data?.uploadUrl) {
        const { uploadUrl, key } = res.data;
        await uploadFileToS3(uploadUrl, file);

        await sendMessage(
          consultationId,
          undefined,
          roomId,
          replyingToMessage?.id || null,
          { key, name: file.name, type, size: file.size }
        );

        setReplyingToMessage(null);
        toast.success("File uploaded and shared successfully!", { id: loadingToastId });
      } else {
        throw new Error("Failed to retrieve upload URL");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to upload and share file", { id: loadingToastId });
    } finally {
      setIsUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const renderFileBubbleContent = (msg: Message) => {
    if (!msg.file) return null;
    const { id, file } = msg;
    const isDownloaded = downloadedFileMessageIds.includes(id);

    const fileIcon = () => {
      switch (file.type) {
        case "image":
          return <ImageIcon className="w-5 h-5 text-emerald-500 shrink-0" />;
        case "video":
          return <Video className="w-5 h-5 text-emerald-500 shrink-0" />;
        default:
          return <FileText className="w-5 h-5 text-emerald-500 shrink-0" />;
      }
    };

    const formattedType = file.type.charAt(0).toUpperCase() + file.type.slice(1);

    const isSelf = msg.senderRole === "patient";

    if (file.type === "image") {
      const isPreviewLoaded = !!fileUrls[id];
      return (
        <div className="flex flex-col gap-2 min-w-[200px] text-slate-800 dark:text-slate-100">
          {isPreviewLoaded ? (
            <div className="flex flex-col gap-1.5">
              <img
                src={fileUrls[id]}
                alt={file.name}
                className="max-w-full max-h-[160px] object-cover rounded-lg shadow-sm border border-slate-200/20 dark:border-slate-800 cursor-zoom-in"
                onClick={() => window.open(fileUrls[id], "_blank")}
              />
              <p className={`text-[10px] font-medium truncate max-w-[200px] ${isSelf ? "text-slate-300 dark:text-slate-800" : "text-slate-500 dark:text-slate-400"}`}>
                {file.name} ({formatFileSize(file.size)})
              </p>
              <button
                type="button"
                disabled={fetchingUrls[`${id}-download`]}
                onClick={() => {
                  markAsDownloaded(id);
                  fetchFileUrl(id, true);
                }}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-emerald-500 text-white dark:text-slate-955 rounded-lg hover:bg-emerald-600 dark:hover:bg-emerald-400 transition-all font-bold text-[11px] shadow-sm disabled:opacity-50"
              >
                {fetchingUrls[`${id}-download`] ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Download className="w-3 h-3" />
                )}
                <span>Download</span>
              </button>
            </div>
          ) : isSelf ? (
            <div className="flex flex-col items-center justify-center border border-dashed border-slate-200/50 dark:border-slate-750 rounded-lg p-4 bg-slate-50/50 dark:bg-slate-900/40 min-h-[120px]">
              <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
              <p className={`text-[10px] mt-2 ${isSelf ? "text-slate-300 dark:text-slate-855" : "text-slate-500"}`}>Loading image preview...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2.5">
                <ImageIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-xs truncate ${isSelf ? "text-white dark:text-slate-955" : "text-slate-900 dark:text-white"}`} title={file.name}>
                    {file.name}
                  </p>
                  <p className={`text-[10px] font-medium ${isSelf ? "text-slate-300 dark:text-slate-805" : "text-slate-500 dark:text-slate-400"}`}>
                    Image • {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  disabled={fetchingUrls[`${id}-preview`]}
                  onClick={() => fetchFileUrl(id, false)}
                  className="flex items-center justify-center gap-1 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-all font-bold text-[10px] disabled:opacity-50"
                >
                  {fetchingUrls[`${id}-preview`] ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                  <span>Load Preview</span>
                </button>
                <button
                  type="button"
                  disabled={fetchingUrls[`${id}-download`]}
                  onClick={() => {
                    markAsDownloaded(id);
                    fetchFileUrl(id, true);
                  }}
                  className="flex items-center justify-center gap-1 py-1.5 bg-emerald-500 text-white dark:text-slate-955 rounded-lg hover:bg-emerald-600 dark:hover:bg-emerald-400 transition-all font-bold text-[10px] shadow-sm disabled:opacity-50"
                >
                  {fetchingUrls[`${id}-download`] ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Download className="w-3 h-3" />
                  )}
                  <span>Download</span>
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (file.type === "video") {
      const isPreviewLoaded = !!fileUrls[id];
      return (
        <div className="flex flex-col gap-2 min-w-[200px] text-slate-800 dark:text-slate-100">
          {isPreviewLoaded ? (
            <div className="flex flex-col gap-1.5">
              <video
                src={fileUrls[id]}
                controls
                className="max-w-full rounded-lg shadow-sm bg-black border border-slate-200/20 dark:border-slate-800"
              />
              <p className={`text-[10px] font-medium truncate max-w-[200px] ${isSelf ? "text-slate-300 dark:text-slate-800" : "text-slate-500 dark:text-slate-400"}`}>
                {file.name} ({formatFileSize(file.size)})
              </p>
              <button
                type="button"
                disabled={fetchingUrls[`${id}-download`]}
                onClick={() => {
                  markAsDownloaded(id);
                  fetchFileUrl(id, true);
                }}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-emerald-500 text-white dark:text-slate-955 rounded-lg hover:bg-emerald-600 dark:hover:bg-emerald-400 transition-all font-bold text-[11px] shadow-sm disabled:opacity-50"
              >
                {fetchingUrls[`${id}-download`] ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Download className="w-3 h-3" />
                )}
                <span>Download</span>
              </button>
            </div>
          ) : isSelf ? (
            <div className="flex flex-col items-center justify-center border border-dashed border-slate-200/50 dark:border-slate-750 rounded-lg p-4 bg-slate-50/50 dark:bg-slate-900/40 min-h-[120px]">
              <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
              <p className={`text-[10px] mt-2 ${isSelf ? "text-slate-300 dark:text-slate-855" : "text-slate-500"}`}>Loading video preview...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2.5">
                <Video className="w-5 h-5 text-emerald-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-xs truncate ${isSelf ? "text-white dark:text-slate-955" : "text-slate-900 dark:text-white"}`} title={file.name}>
                    {file.name}
                  </p>
                  <p className={`text-[10px] font-medium ${isSelf ? "text-slate-300 dark:text-slate-805" : "text-slate-500 dark:text-slate-400"}`}>
                    Video • {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  disabled={fetchingUrls[`${id}-preview`]}
                  onClick={() => fetchFileUrl(id, false)}
                  className="flex items-center justify-center gap-1 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-all font-bold text-[10px] disabled:opacity-50"
                >
                  {fetchingUrls[`${id}-preview`] ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                  <span>Load Preview</span>
                </button>
                <button
                  type="button"
                  disabled={fetchingUrls[`${id}-download`]}
                  onClick={() => {
                    markAsDownloaded(id);
                    fetchFileUrl(id, true);
                  }}
                  className="flex items-center justify-center gap-1 py-1.5 bg-emerald-500 text-white dark:text-slate-955 rounded-lg hover:bg-emerald-600 dark:hover:bg-emerald-400 transition-all font-bold text-[10px] shadow-sm disabled:opacity-50"
                >
                  {fetchingUrls[`${id}-download`] ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Download className="w-3 h-3" />
                  )}
                  <span>Download</span>
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (!isDownloaded) {
      return (
        <div className="flex flex-col gap-2 min-w-[200px] text-slate-800 dark:text-slate-100">
          <div className="flex items-start gap-2.5">
            {fileIcon()}
            <div className="flex-1 min-w-0">
              <p className={`font-bold text-xs truncate ${isSelf ? "text-white dark:text-slate-955" : "text-slate-900 dark:text-white"}`} title={file.name}>
                {file.name}
              </p>
              <p className={`text-[10px] font-medium ${isSelf ? "text-slate-300 dark:text-slate-800" : "text-slate-500 dark:text-slate-400"}`}>
                {formattedType} • {formatFileSize(file.size)}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={fetchingUrls[`${id}-download`]}
            onClick={() => {
              markAsDownloaded(id);
              fetchFileUrl(id, true);
            }}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-emerald-500 text-white dark:text-slate-955 rounded-lg hover:bg-emerald-600 dark:hover:bg-emerald-450 transition-all font-bold text-[11px] shadow-sm disabled:opacity-50"
          >
            {fetchingUrls[`${id}-download`] ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Download className="w-3 h-3" />
            )}
            <span>Download</span>
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2 min-w-[200px]">
        <div className="flex flex-col gap-1.5 text-slate-800 dark:text-slate-100">
          <div className="flex items-start gap-2.5">
            {fileIcon()}
            <div className="flex-1 min-w-0">
              <p className={`font-bold text-xs truncate ${isSelf ? "text-white dark:text-slate-955" : "text-slate-900 dark:text-white"}`} title={file.name}>
                {file.name}
              </p>
              <p className={`text-[10px] font-medium ${isSelf ? "text-slate-300 dark:text-slate-800" : "text-slate-500 dark:text-slate-400"}`}>
                {formattedType} • {formatFileSize(file.size)}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={fetchingUrls[`${id}-preview`]}
            onClick={() => {
              if (fileUrls[id]) {
                window.open(fileUrls[id], "_blank");
              } else {
                fetchFileUrl(id, false).then((url) => {
                  if (url) window.open(url, "_blank");
                });
              }
            }}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-455 border border-emerald-500/25 rounded-lg hover:bg-emerald-500/20 transition-all font-bold text-[11px] disabled:opacity-50"
          >
            {fetchingUrls[`${id}-preview`] ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Eye className="w-3 h-3" />
            )}
            <span>View / Open</span>
          </button>
        </div>
      </div>
    );
  };

  // Review form states
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
  const [hasSubmittedReview, setHasSubmittedReview] = useState(false);
  const [submittedReviewScore, setSubmittedReviewScore] = useState<number | null>(null);
  const [checkingReview, setCheckingReview] = useState(true);

  // Check if review already exists for this completed consultation
  useEffect(() => {
    if (status !== "COMPLETED" || !appointmentId) {
      setCheckingReview(false);
      return;
    }
    const checkExistingReview = async () => {
      try {
        const { getReviewByAppointmentId } = await import("../../api/reviewApi");
        const res = await getReviewByAppointmentId(appointmentId);
        if (res.success && res.data) {
          setSubmittedReviewScore(res.data.score);
          setHasSubmittedReview(true);
        }
      } catch (err) {
        console.log("No existing review found for this appointment.");
      } finally {
        setCheckingReview(false);
      }
    };
    checkExistingReview();
  }, [status, appointmentId]);

  // Clock tick interval
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-IN", { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format appointment slot timing for the header
  const getAppointmentTimeText = () => {
    if (!appointmentDetails || !appointmentDetails.slot) return "";
    const startSlot = appointmentDetails.slot.start;
    const endSlot = appointmentDetails.slot.end;
    const dateStr = dayjs(startSlot).format("MMM DD, YYYY");
    const startStr = dayjs(startSlot).format("hh:mm A");
    const endStr = dayjs(endSlot).format("hh:mm A");
    return `${dateStr} • ${startStr} - ${endStr}`;
  };

  // Scroll to bottom on chat update
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, activeMobileTab]);

  // Automatically fetch URLs for sender's own images and videos
  useEffect(() => {
    chatMessages.forEach((msg) => {
      if (msg.file && (msg.file.type === "image" || msg.file.type === "video")) {
        const isSelf = msg.senderRole === "patient";
        const key = `${msg.id}-preview`;
        if (isSelf && !fileUrls[msg.id] && !fetchingUrls[key]) {
          fetchFileUrl(msg.id, false);
        }
      }
    });
  }, [chatMessages, fileUrls, fetchingUrls]);

  // Consultation setup & Socket callbacks
  useEffect(() => {
    if (!appointmentId) return;

    const setupConsultation = async () => {
      try {
        // Fetch user appointment details FIRST
        const apptResponse = await getAppointmentById(appointmentId);
        let online = true;
        let doctorName = "Doctor";
        if (apptResponse.success && apptResponse.data) {
          setAppointmentDetails(apptResponse.data);
          doctorName = apptResponse.data.doctor?.name || "Doctor";
          online = apptResponse.data.slot?.consultationMode === "online";
        }

        const response = await joinConsultation(appointmentId);
        const consultation = response.data;
        const consultId = consultation.id || consultation._id;
        setConsultationId(consultId);

        if (online) {
          socketService.connect();
          socketService.joinRoom(consultation.roomId, myEmail);
        }

        if (consultation.endedAt) {
          setStatus("COMPLETED");
        } else if (consultation.startedAt) {
          setStatus("IN_PROGRESS");
        }

        if (online) {
          socketService.on("user_joined", (data: any) => {
            if (data.role === "doctor") {
              setStatus("IN_PROGRESS");
              toast.success(`Dr. ${doctorName} has joined the consultation`, { icon: "🩺" });
            }
          });

          socketService.on("consultation_ended", (data: any) => {
            setStatus("COMPLETED");
            if (data && data.endedBy === "doctor") {
              toast.success("Doctor has ended the consultation");
            } else {
              toast.success("Consultation has ended");
            }
          });

          // Load Persistent Chat History
          const chatRes = await getChatHistory(consultId);
          if (chatRes.success && chatRes.data) {
            setChatMessages(chatRes.data.messages || []);

            // Mark incoming unread doctor messages as read
            for (const msg of (chatRes.data.messages || [])) {
              if (msg.senderRole === "doctor" && !msg.readAt) {
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
            if (msg.senderRole === "doctor") {
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
            if (data.role === "doctor") {
              setTypingStatus(data.isTyping ? `${data.name} is typing...` : null);
            }
          });
        }
      } catch (error: any) {
        const status = error.response?.status;
        if (status === 403) {
          navigate("/403");
        } else {
          navigate("/404");
        }
      } finally {
        setLoading(false);
      }
    };

    setupConsultation();

    return () => {
      if (socketService.getSocket()) {
        if (appointmentId) {
          socketService.leaveRoom(`room_${appointmentId}`);
        }
        socketService.disconnect();
      }
    };
  }, [appointmentId, navigate]);

  // Handle ending consultation
  const handleEndConsultation = async () => {
    setEnding(true);
    try {
      await endConsultation(appointmentId!);
      setStatus("COMPLETED");
      toast.success("Consultation ended successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to end consultation");
    } finally {
      setEnding(false);
      setIsEndModalOpen(false);
    }
  };

  // Handle typing input and broadcast
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCurrentMessage(val);

    const roomId = appointmentDetails?.slot?.roomId || appointmentDetails?.roomId || `room_${appointmentId}`;
    if (socketService.getSocket() && roomId) {
      socketService.emit("chat_typing", {
        roomId,
        userId: "patient",
        name: appointmentDetails?.user?.name || "Patient",
        role: "patient",
        isTyping: val.length > 0,
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketService.emit("chat_typing", {
          roomId,
          userId: "patient",
          name: appointmentDetails?.user?.name || "Patient",
          role: "patient",
          isTyping: false,
        });
      }, 2000);
    }
  };

  // Send chat message with DB persistence
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim() || !consultationId) return;

    try {
      const text = currentMessage;
      setCurrentMessage("");
      const roomId = appointmentDetails?.slot?.roomId || appointmentDetails?.roomId || `room_${appointmentId}`;
      await sendMessage(
        consultationId,
        text,
        roomId,
        replyingToMessage?.id || null
      );
      setReplyingToMessage(null);
    } catch (err: any) {
      toast.error("Failed to send message");
    }
  };

  // Edit chat message
  const handleEditMessage = async (messageId: string, text: string) => {
    if (!text.trim() || !consultationId) return;
    try {
      const roomId = appointmentDetails?.slot?.roomId || appointmentDetails?.roomId || `room_${appointmentId}`;
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
    if (!messageIdToDelete) return;
    try {
      const roomId = appointmentDetails?.slot?.roomId || appointmentDetails?.roomId || `room_${appointmentId}`;
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
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
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

  const doctorName = appointmentDetails?.doctor?.name || "Doctor";
  const doctorSpecialization = appointmentDetails?.doctor?.specialization || "General Medicine";
  const practiceLocation = appointmentDetails?.slot?.consultationMode === "online" ? "Virtual (Online)" : "Main Clinic (In-person)";



  if (status === "COMPLETED") {
    if (checkingReview) {
      return (
        <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="text-center">
            <svg className="animate-spin h-10 w-10 text-emerald-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <p className="text-slate-600 dark:text-slate-400 font-medium">Checking feedback status...</p>
          </div>
        </div>
      );
    }

    if (hasSubmittedReview) {
      return (
        <div className="min-h-screen w-screen bg-[#F8FAFC] dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shadow-lg shadow-emerald-500/10 animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Thank You for Your Feedback!</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Your review helps us maintain high-quality healthcare consultations on HealthHub.</p>
            </div>
            <div className="py-6 px-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 inline-block w-full">
              <p className="text-xs font-bold text-slate-455 dark:text-slate-400 uppercase tracking-widest mb-1.5">Calculated Score</p>
              <div className="flex items-center justify-center gap-1.5 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                <span>{submittedReviewScore}%</span>
                <span className="text-xs font-bold text-slate-400 px-2 py-0.5 rounded-full bg-slate-200/50 dark:bg-slate-800">Experience Score</span>
              </div>
            </div>
            <div>
              <button
                onClick={() => navigate("/appointments")}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-850 dark:bg-emerald-500 text-white dark:text-slate-955 rounded-xl font-bold text-sm shadow-md hover:scale-[1.01] active:scale-95 transition-all duration-100 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Go to Appointments</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    const reviewQuestions = [
      {
        key: "q1",
        question: "Did the doctor listen carefully to your concerns?",
      },
      {
        key: "q2",
        question: "How clearly did the doctor explain your condition and treatment?",
      },
      {
        key: "q3",
        question: "Did you feel enough time was given to understand your problem?",
      },
      {
        key: "q4",
        question: "How confident do you feel about the treatment plan after this consultation?",
      },
      {
        key: "q5",
        question: "Was the consultation professional and respectful?",
      },
    ];

    const ratingOptions = [
      { label: "Excellent", value: "Excellent", color: "hover:bg-emerald-50 hover:text-emerald-700 active:bg-emerald-100 dark:hover:bg-emerald-950/20 dark:hover:text-emerald-400 border-emerald-250", activeBg: "bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-500 dark:text-slate-955 dark:border-emerald-500" },
      { label: "Good", value: "Good", color: "hover:bg-blue-50 hover:text-blue-700 active:bg-blue-100 dark:hover:bg-blue-950/20 dark:hover:text-blue-400 border-blue-250", activeBg: "bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:text-slate-955 dark:border-blue-500" },
      { label: "Average", value: "Average", color: "hover:bg-amber-50 hover:text-amber-700 active:bg-amber-100 dark:hover:bg-amber-950/20 dark:hover:text-amber-400 border-amber-250", activeBg: "bg-amber-500 text-white border-amber-500 dark:bg-amber-555 dark:text-slate-955 dark:border-amber-500" },
      { label: "Poor", value: "Poor", color: "hover:bg-rose-50 hover:text-rose-700 active:bg-rose-100 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 border-rose-250", activeBg: "bg-rose-600 text-white border-rose-600 dark:bg-rose-500 dark:text-slate-955 dark:border-rose-500" },
    ];

    const allAnswered = Object.values(answers).every((val) => val !== "");

    const handleSubmitReview = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!allAnswered) return;
      setSubmittingReview(true);
      try {
        const { createOrUpdateReview } = await import("../../api/reviewApi");
        const res = await createOrUpdateReview({
          appointmentId: appointmentId!,
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
          setSubmittedReviewScore(res.data.score);
          setHasSubmittedReview(true);
          toast.success("Feedback submitted successfully!");
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to submit feedback.");
      } finally {
        setSubmittingReview(false);
      }
    };

    return (
      <div className="min-h-screen w-screen bg-[#F8FAFC] dark:bg-slate-950 overflow-y-auto py-12 px-4 transition-colors duration-300">
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-6 sm:p-8 space-y-8">

          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-2">
              <Star className="w-7 h-7 text-amber-400 fill-amber-400 animate-pulse" />
              <span>Share Your Experience</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              How was your consultation with <span className="font-bold text-slate-800 dark:text-slate-200">Dr. {doctorName}</span>?
            </p>
          </div>

          <form onSubmit={handleSubmitReview} className="space-y-6">
            {/* Questions List */}
            <div className="space-y-6 divide-y divide-slate-100 dark:divide-slate-800/80">
              {reviewQuestions.map((q, idx) => (
                <div key={q.key} className={`space-y-3 ${idx > 0 ? "pt-5" : ""}`}>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                    <span className="text-emerald-500 font-bold mr-1">{idx + 1}.</span> {q.question}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {ratingOptions.map((opt) => {
                      const isActive = answers[q.key] === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setAnswers({ ...answers, [q.key]: opt.value })}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all duration-150 cursor-pointer ${isActive
                            ? opt.activeBg
                            : `bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-350 border-slate-200 dark:border-slate-800 ${opt.color}`
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
            <div className="space-y-1.5 pt-4">
              <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider block">
                Written Review (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us more about your consultation experience, what went well, or what could be improved..."
                rows={3}
                className="w-full text-sm bg-slate-50 dark:bg-slate-800/40 border border-slate-205 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none transition-all"
              />
            </div>

            {/* Anonymous Consent Option & Warning Alert */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/20 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl space-y-2">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-450 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Submit this review anonymously
                </span>
              </label>
              {isAnonymous && (
                <div className="flex gap-2 text-[10.5px] leading-relaxed text-slate-500 dark:text-slate-400 bg-amber-500/10 dark:bg-amber-500/5 p-3 rounded-lg border border-amber-500/20">
                  <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p>
                    <span className="font-bold text-amber-600 dark:text-amber-400">Notice:</span> When submitted anonymously, your name and photo will be hidden from the doctor and the public, but the administration will be able to see your identity to prevent spam and abuse.
                  </p>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex flex-col gap-3 pt-4">
              <button
                type="submit"
                disabled={!allAnswered || submittingReview}
                className={`w-full py-4 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${allAnswered
                  ? "bg-slate-900 text-white hover:bg-slate-850 dark:bg-emerald-500 dark:text-slate-955 dark:hover:bg-emerald-400"
                  : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed border border-slate-200/40 dark:border-slate-800"
                  }`}
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate("/appointments")}
                  className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-350 transition-colors text-xs font-bold underline py-2 cursor-pointer"
                >
                  Skip Feedback
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
    );
  }
  return (
    <div className="h-screen w-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300 overflow-hidden">

      {/* Premium Header/Navbar */}
      <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md px-6 flex items-center justify-between z-40 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (status !== "COMPLETED") {
                setIsExitModalOpen(true);
              } else {
                navigate("/appointments");
              }
            }}
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
              Doctor: <span className="font-bold text-slate-700 dark:text-slate-300">Dr. {doctorName}</span> • Specialization: <span className="font-bold text-slate-700 dark:text-slate-300">{doctorSpecialization}</span> • Location: <span className="font-bold text-slate-700 dark:text-slate-300">{practiceLocation}</span>
            </p>
          </div>
        </div>

        {/* Global connection/time & End action triggers */}
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
            <span className="text-slate-600 dark:text-slate-300">Line:</span>
            <span className="text-slate-800 dark:text-slate-100 uppercase">{status.replace(/_/g, " ")}</span>
          </div>

          {status !== "COMPLETED" && (
            <button
              onClick={() => setIsDisputeModalOpen(true)}
              className="bg-white hover:bg-red-50 dark:bg-slate-900 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" />
              <span className="hidden sm:inline">Report Issue</span>
            </button>
          )}
          {status !== "COMPLETED" ? (
            <button
              onClick={() => setIsEndModalOpen(true)}
              disabled={ending}
              className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-rose-500/20 transition-all flex items-center gap-2"
            >
              <PhoneOff className="w-4 h-4" />
              <span className="hidden sm:inline">End Consultation</span>
            </button>
          ) : (
            <button
              onClick={() => navigate("/appointments")}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Leave Room</span>
            </button>
          )}
        </div>
      </div>
      {isTelehealth && hasChat && (hasVideo || hasAudio) && (
        <div className="lg:hidden flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <button
            onClick={() => setActiveMobileTab("call")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold border-b-2 transition-all ${activeMobileTab === "call"
              ? "border-emerald-500 text-slate-900 dark:text-emerald-400 bg-slate-50 dark:bg-slate-800/30"
              : "border-transparent text-slate-500 dark:text-slate-400"
              }`}
          >
            <Video className="w-4 h-4" />
            <span>{hasVideo ? "Video Consultation" : "Voice Consultation"}</span>
          </button>
          <button
            onClick={() => setActiveMobileTab("chat")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold border-b-2 transition-all ${activeMobileTab === "chat"
              ? "border-emerald-500 text-slate-900 dark:text-emerald-400 bg-slate-50 dark:bg-slate-800/30"
              : "border-transparent text-slate-500 dark:text-slate-400"
              }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat Room</span>
          </button>
        </div>
      )}

      {/* Main Multi-Panel Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3 p-3 min-h-0 bg-slate-100/60 dark:bg-slate-955 overflow-hidden relative">
        {!isTelehealth ? (
          /* Clinic In-Person Check-in Details Card */
          <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-6 max-w-2xl mx-auto my-auto transition-all duration-300">
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-955/30 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/50 shadow-lg shadow-emerald-500/10">
              <UserCheck className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">In-Person Consultation</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                This is a physical, in-person consultation scheduled at the clinic. Please visit the practice location.
              </p>
            </div>

            <div className="w-full bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 text-left space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200/50 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Practice Location</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {appointmentDetails?.slot?.practiceLocation?.name || "Main Clinic"}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-200/50 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Address</span>
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-350 max-w-[280px] text-right">
                  {appointmentDetails?.slot?.practiceLocation?.address || "123 Health Ave, Medical District"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scheduled Time</span>
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-350">
                  {getAppointmentTimeText()}
                </span>
              </div>
            </div>

            <div className="p-4 bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 rounded-2xl text-xs text-amber-700 dark:text-amber-400 text-left flex gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <p>
                <span className="font-bold">Patient Note:</span> Please arrive at the clinic 10-15 minutes prior to your scheduled slot for vitals check-in. Bring any relevant health records or test reports.
              </p>
            </div>

            <button
              onClick={() => navigate("/appointments")}
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-855 dark:bg-emerald-500 text-white dark:text-slate-955 rounded-xl font-bold text-sm shadow-md hover:scale-[1.01] active:scale-95 transition-all duration-100 flex items-center gap-2 cursor-pointer"
            >
              <span>Back to Appointments</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Panel 1: Video/Audio Consultation Streams */}
            {isOnline && (hasVideo || hasAudio) && (
              <div
                className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md rounded-2xl flex-1 flex flex-col min-h-0 overflow-hidden transition-all duration-300 ${activeMobileTab === "call" ? "flex" : "hidden lg:flex"
                  }`}
              >
                {/* Header */}
                <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center gap-2 shrink-0">
                  <Video className="w-4 h-4 text-slate-400 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-355">
                    {hasVideo ? "Secure Video Console" : "Secure Voice Console"}
                  </span>
                </div>

                {/* Call display area */}
                <div className="flex-1 flex flex-col p-4 min-h-0 overflow-hidden relative">
                  <div className="flex-1 bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden relative shadow-inner flex flex-col justify-between p-4 min-h-[300px]">

                    {/* Overlay status marker */}
                    <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800/80 text-[10px] font-bold">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${callStatus === "IN_PROGRESS" ? "bg-green-500" : "bg-yellow-500 animate-pulse"
                          }`}
                      ></div>
                      <span className="text-slate-300 tracking-wider">
                        {callStatus === "IN_PROGRESS"
                          ? `SECURE LINE: ${hasVideo ? "VIDEO" : "AUDIO"}`
                          : "WAITING FOR CONNECTION..."}
                      </span>
                    </div>

                    {/* Central stream handler */}
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      {callStatus === "WAITING_FOR_PEER" && (
                        <div className="text-center p-4">
                          <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-3 shadow-lg animate-pulse">
                            <UserCheck className="w-8 h-8 text-slate-500" />
                          </div>
                          <h5 className="text-slate-205 font-bold text-sm">Connecting doctor...</h5>
                          <p className="text-[11px] text-slate-500 mt-1 max-w-[200px]">
                            Secure P2P WebRTC connection handshake...
                          </p>
                        </div>
                      )}

                      {callStatus === "IN_PROGRESS" && (
                        <div className="w-full h-full relative">
                          {hasVideo ? (
                            /* Video Call View */
                            <div className="w-full h-full relative">
                              {/* Swappable main video frame */}
                              <video
                                ref={isSwapped ? localVideoRef : remoteVideoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover rounded-xl scale-x-[-1]"
                              />

                              <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-900 text-xs font-bold text-white z-20">
                                {isSwapped ? "You (Local)" : `Dr. ${doctorName}`}
                              </div>

                              {/* PIP Local User Video Overlay */}
                              <div
                                onClick={() => dispatch(toggleSwapped())}
                                className="absolute bottom-4 right-4 w-[110px] h-[80px] sm:w-[130px] sm:h-[95px] bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-30 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300"
                              >
                                <video
                                  ref={isSwapped ? remoteVideoRef : localVideoRef}
                                  autoPlay
                                  playsInline
                                  muted={!isSwapped}
                                  className="w-full h-full object-cover scale-x-[-1]"
                                />
                                <div className="absolute bottom-1 left-1.5 bg-slate-950/70 backdrop-blur px-1.5 py-0.5 rounded text-[9px] font-bold text-emerald-450 z-20 flex items-center gap-1">
                                  <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                                  {isSwapped ? `Dr. ${doctorName}` : "You"}
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* Audio Call Only View */
                            <>
                              <AudioOnlyConsultation
                                peerName={`Dr. ${doctorName}`}
                                callStatus={callStatus}
                                remoteAudioMuted={remoteAudioMuted}
                              />
                              {!hasVideo && <audio ref={remoteAudioRef} autoPlay />}
                            </>
                          )}

                          {/* Remote Audio Muted Indicator */}
                          {remoteAudioMuted && (
                            <div className="absolute top-4 right-4 bg-red-600/80 p-2.5 rounded-2xl border border-red-500/30 text-white shadow-lg backdrop-blur-sm z-30 animate-pulse">
                              <MicOff className="w-4.5 h-4.5" />
                            </div>
                          )}
                        </div>
                      )}

                      {callStatus === "COMPLETED" && (
                        <div className="text-center p-4">
                          <div className="w-16 h-16 rounded-full bg-rose-950/20 border border-rose-900/30 flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <VideoOff className="w-8 h-8 text-rose-500" />
                          </div>
                          <h5 className="text-slate-205 font-bold text-sm">Consultation Ended</h5>
                          <p className="text-[11px] text-slate-500 mt-1">
                            This medical consultation session has been securely ended.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Video call controls overlays */}
                    {callStatus === "IN_PROGRESS" && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3.5 z-40 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-800">
                        <button
                          onClick={toggleAudio}
                          className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${audioMuted
                            ? "bg-rose-500 border-rose-500/20 text-white shadow-lg shadow-rose-500/10"
                            : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                            }`}
                          title={audioMuted ? "Unmute" : "Mute"}
                        >
                          {audioMuted ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
                        </button>

                        {hasVideo && (
                          <button
                            onClick={toggleVideo}
                            className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${videoMuted
                              ? "bg-rose-500 border-rose-500/20 text-white shadow-lg shadow-rose-500/10"
                              : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                              }`}
                            title={videoMuted ? "Turn Cam On" : "Turn Cam Off"}
                          >
                            {videoMuted ? <VideoOff className="w-4.5 h-4.5" /> : <Video className="w-4.5 h-4.5" />}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Panel 2: Live Chat Room Panel */}
            {hasChat && (
              <div
                className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md rounded-2xl flex-1 ${(hasVideo || hasAudio) ? "lg:flex-[0.4]" : ""} flex flex-col min-h-0 overflow-hidden transition-all duration-300 ${activeMobileTab === "chat" ? "flex" : "hidden lg:flex"
                  }`}
              >
                {/* Header */}
                <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center gap-2 shrink-0">
                  <MessageSquare className="w-4 h-4 text-slate-400 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-350">Secure Chat Room</span>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 min-h-0 flex flex-col justify-start bg-slate-50/30 dark:bg-slate-900/10">
                  {chatMessages.map((msg) => {
                    const isSelf = msg.senderRole === "patient";
                    const isEditing = editingMessageId === msg.id;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[80%] group relative ${isSelf ? "align-self-end items-end ml-auto" : "align-self-start items-start mr-auto"
                          }`}
                      >
                        {/* Quoted reply card */}
                        {msg.replyTo && msg.replyToText && (
                          <div className="mb-1 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg p-1.5 px-2 border-l-2 border-emerald-500 font-medium">
                            <span className="font-bold block text-[9px] text-emerald-600 dark:text-emerald-450">
                              Replying to {msg.replyToRole === "patient" ? "You" : `Dr. ${doctorName}`}:
                            </span>
                            {msg.replyToText}
                          </div>
                        )}

                        <div className="flex items-center gap-2 max-w-full">
                          {/* Bubble Actions */}
                          {status === "IN_PROGRESS" && !msg.isDeleted && (
                            <div className={`hidden group-hover:flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-lg p-0.5 z-20 shrink-0 ${isSelf ? "order-first" : "order-last"}`}>
                              <button
                                onClick={() => setReplyingToMessage(msg)}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 rounded"
                                title="Reply"
                              >
                                <CornerUpLeft className="w-3.5 h-3.5" />
                              </button>
                              {isSelf && (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingMessageId(msg.id);
                                      setEditingText(msg.text || "");
                                    }}
                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 rounded"
                                    title="Edit"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMessage(msg.id)}
                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-rose-500 rounded"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          )}

                          {isEditing ? (
                            <div className="bg-slate-100 dark:bg-slate-850 rounded-xl p-2 flex gap-1.5 items-center w-full min-w-[200px]">
                              <input
                                type="text"
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className="flex-1 bg-white dark:bg-slate-700 text-xs rounded border p-1 focus:outline-none text-slate-800 dark:text-slate-100"
                              />
                              <button
                                onClick={async () => {
                                  await handleEditMessage(msg.id, editingText);
                                  setEditingMessageId(null);
                                }}
                                className="p-1 text-emerald-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingMessageId(null)}
                                className="p-1 text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : msg.file ? (
                            <div
                              className={`p-3 rounded-2xl text-xs leading-normal shadow-sm ${isSelf
                                  ? "bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-955 rounded-tr-none font-medium border border-transparent dark:border-emerald-500/20"
                                  : "bg-white text-slate-855 dark:bg-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/50 dark:border-slate-700"
                                }`}
                            >
                              {renderFileBubbleContent(msg)}
                            </div>
                          ) : (
                            <div
                              className={`p-3 rounded-2xl text-xs leading-normal shadow-sm ${msg.isDeleted
                                ? "bg-slate-100 text-slate-400 dark:bg-slate-800/40 dark:text-slate-500 italic rounded-tl-none rounded-tr-none border border-slate-250/20"
                                : isSelf
                                  ? "bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-955 rounded-tr-none font-medium"
                                  : "bg-white text-slate-850 dark:bg-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/50 dark:border-slate-700"
                                }`}
                            >
                              {msg.text}
                            </div>
                          )}
                        </div>

                        {/* Timestamp & readReceipt */}
                        <div className="text-[9px] text-slate-400 mt-1 font-medium px-1 flex flex-col items-end w-full">
                          <span className="flex items-center gap-1 text-[8.5px]">
                            {isSelf ? "You" : `Dr. ${doctorName}`} • {dayjs(msg.createdAt).format("hh:mm A")}
                            {msg.isEdited && !msg.isDeleted && <span className="text-[8px] opacity-70 italic font-normal">(edited)</span>}
                          </span>
                          {isSelf && !msg.isDeleted && (
                            <span className="text-[8px] text-slate-450 dark:text-slate-500 font-normal italic mt-0.5">
                              {msg.readAt
                                ? `Read by Doctor at ${dayjs(msg.readAt).format("hh:mm A")}`
                                : "Delivered"}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatBottomRef} />
                </div>

                {/* Active Typing Display overlay */}
                {typingStatus && (
                  <div className="px-4 py-1.5 text-[10px] text-slate-500 dark:text-emerald-450 italic font-medium shrink-0 animate-pulse bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-emerald-500 animate-ping"></div>
                    {typingStatus}
                  </div>
                )}

                {/* Reply quoting preview box */}
                {replyingToMessage && (
                  <div className="p-2 border-t border-slate-200 dark:border-slate-850 bg-slate-100/70 dark:bg-slate-955/40 flex justify-between items-center shrink-0">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 flex flex-col truncate pr-2">
                      <span className="font-bold text-[9px] text-emerald-600 dark:text-emerald-450">
                        Quoting {replyingToMessage.senderRole === "patient" ? "You" : `Dr. ${doctorName}`}:
                      </span>
                      <span className="truncate">{replyingToMessage.text}</span>
                    </div>
                    <button
                      onClick={() => setReplyingToMessage(null)}
                      className="p-1 hover:bg-slate-250 dark:hover:bg-slate-800 rounded-full text-slate-450 dark:text-slate-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Interactive Chat Input */}
                <form
                  onSubmit={handleSendChatMessage}
                  className="p-3 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2 shrink-0 items-center"
                >
                  <button
                    type="button"
                    disabled={isUploadingFile}
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all active:scale-95 flex items-center justify-center shrink-0"
                    title="Attach File"
                  >
                    {isUploadingFile ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                    ) : (
                      <Paperclip className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <input
                    type="text"
                    value={currentMessage}
                    onChange={handleInputChange}
                    placeholder="Ask the doctor about your symptoms..."
                    className="flex-1 bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-750 rounded-xl px-3.5 py-3 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                  />
                  <button
                    type="submit"
                    className="p-3 bg-slate-900 hover:bg-slate-850 dark:bg-emerald-500 text-white dark:text-slate-955 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center shrink-0 border border-transparent dark:border-emerald-500/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </div>

      {/* Symmetrical Exit Confirmation Modal overlay */}
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
          navigate("/appointments");
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
    </div>
  );
};

export default UConsultationRoomPage;
