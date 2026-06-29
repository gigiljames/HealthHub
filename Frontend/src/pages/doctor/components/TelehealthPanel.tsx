import React, { useState, useRef, useEffect } from "react";
import {
  Video,
  VideoOff,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  MicOff,
  Mic,
  Send,
  CornerUpLeft,
  Edit3,
  Trash2,
  Check,
  X,
  Phone,
  Paperclip,
  Download,
  FileText,
  Image as ImageIcon,
  Eye,
  Loader2,
  MoreVertical,
} from "lucide-react";
import { getChatAccessUrl, getChatUploadUrl, uploadFileToS3, sendMessage } from "../../../api/chatApi";
import { socketService } from "../../../api/socketService";
import { useDispatch, useSelector } from "react-redux";
import { useWebRTC } from "../../../hooks/useWebRTC";
import { AudioOnlyConsultation } from "./AudioOnlyConsultation";
import {
  toggleSwapped,
  setSupportedModes,
  setStatus,
  setRoomId,
  resetCall,
} from "../../../state/call/callSlice";
import dayjs from "dayjs";
import type { RootState } from "../../../state/store";

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

interface TelehealthPanelProps {
  infoTab: boolean;
  setInfoTab: React.Dispatch<React.SetStateAction<boolean>>;
  reportTab: boolean;
  setReportTab: React.Dispatch<React.SetStateAction<boolean>>;
  videoTab: boolean;
  setVideoTab: React.Dispatch<React.SetStateAction<boolean>>;
  telehealthSubTab: "call" | "chat";
  setTelehealthSubTab: (tab: "call" | "chat") => void;

  status: string; // consultation status

  // Call Settings
  isMuted: boolean;
  setIsMuted: (val: boolean) => void;
  isCamOff: boolean;
  setIsCamOff: (val: boolean) => void;
  isSharing: boolean;
  setIsSharing: (val: boolean) => void;

  // Chat State
  chatMessages: Message[];
  currentMessage: string;
  setCurrentMessage: (val: string) => void;
  handleSendChatMessage: (e: React.FormEvent) => void;
  chatBottomRef: React.RefObject<HTMLDivElement | null>;
  toast: any;

  // Real-time enhancements
  typingStatus: string | null;
  replyingToMessage: Message | null;
  setReplyingToMessage: (msg: Message | null) => void;
  handleEditMessage: (messageId: string, text: string) => void;
  handleDeleteMessage: (messageId: string) => void;
  consultationId: string;
  roomId: string;
  appointmentDetails?: any;
  activeMobileTab?: "patient" | "clinical" | "telehealth";
}

export const TelehealthPanel: React.FC<TelehealthPanelProps> = ({
  infoTab,
  setInfoTab,
  reportTab,
  setReportTab,
  videoTab,
  setVideoTab,
  telehealthSubTab,
  setTelehealthSubTab,

  status: consultationStatus,
  appointmentDetails,

  chatMessages,
  currentMessage,
  setCurrentMessage,
  handleSendChatMessage,
  chatBottomRef,
  toast,

  typingStatus,
  replyingToMessage,
  setReplyingToMessage,
  handleEditMessage,
  handleDeleteMessage,
  consultationId,
  roomId,
  activeMobileTab = "telehealth",
}) => {
  const dispatch = useDispatch();

  // Redux Call state selector
  const {
    audioMuted,
    videoMuted,
    remoteAudioMuted,
    isSwapped,
    status: callStatus,
    supportedModes,
  } = useSelector((state: RootState) => state.call);

  // Check supported modes
  const hasVideo = supportedModes.includes("VIDEO");
  const hasAudio = supportedModes.includes("AUDIO");
  const hasChat = supportedModes.includes("CHAT");

  const { email: myEmail } = useSelector((state: RootState) => state.userInfo);

  const patientNameVal = appointmentDetails?.patientName || "Patient";

  // Initialize WebRTC Hook
  const { myStream, remoteStream, toggleAudio, toggleVideo } = useWebRTC(
    roomId,
    myEmail,
    toast,
    consultationStatus !== "COMPLETED",
    patientNameVal,
    appointmentDetails?.supportedModes
  );

  // Reset call state on mount
  useEffect(() => {
    dispatch(resetCall());
  }, [dispatch]);

  // Sync rooms and status from consultation
  useEffect(() => {
    if (roomId) {
      dispatch(setRoomId(roomId));
    }
  }, [roomId, dispatch]);

  useEffect(() => {
    if (consultationStatus === "COMPLETED") {
      dispatch(setStatus("COMPLETED"));
    }
  }, [consultationStatus, dispatch]);

  // Sync supportedModes from appointmentDetails
  // In doctor side, appointmentDetails can hold supportedModes. Let's make sure it parses it.
  const rawModes = appointmentDetails?.supportedModes || [];
  const expandedModes: string[] = [];
  if (rawModes.includes("VIDEO")) {
    expandedModes.push("VIDEO", "AUDIO", "CHAT");
  } else if (rawModes.includes("AUDIO")) {
    expandedModes.push("AUDIO", "CHAT");
  } else if (rawModes.includes("CHAT")) {
    expandedModes.push("CHAT");
  }
  const supportedModesStr = JSON.stringify(expandedModes);
  useEffect(() => {
    // If appointmentDetails has supportedModes, populate it in Redux
    dispatch(setSupportedModes(expandedModes));
  }, [supportedModesStr, dispatch]);

  // Video element references
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  // Bind video streams
  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = myStream;
    }
  }, [myStream, isSwapped, telehealthSubTab]);

  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, isSwapped, telehealthSubTab]);

  useEffect(() => {
    if (!hasVideo && remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, hasVideo]);

  // Inline edit state
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  // Actions dropdown state
  const [activeDropdownMessageId, setActiveDropdownMessageId] = useState<string | null>(null);

  // Close active dropdown on clicking outside
  useEffect(() => {
    const handleDocumentClick = () => {
      setActiveDropdownMessageId(null);
    };
    window.addEventListener("click", handleDocumentClick);
    return () => window.removeEventListener("click", handleDocumentClick);
  }, []);

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

  // Automatically fetch URLs for sender's own images and videos
  useEffect(() => {
    chatMessages.forEach((msg) => {
      if (msg.file && (msg.file.type === "image" || msg.file.type === "video")) {
        const isSelf = msg.senderRole === "doctor";
        const key = `${msg.id}-preview`;
        if (isSelf && !fileUrls[msg.id] && !fetchingUrls[key]) {
          fetchFileUrl(msg.id, false);
        }
      }
    });
  }, [chatMessages, fileUrls, fetchingUrls]);

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

    const isSelf = msg.senderRole === "doctor";

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
              <p className={`text-[10px] mt-2 ${isSelf ? "text-slate-300 dark:text-slate-850" : "text-slate-500"}`}>Loading image preview...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2.5">
                <ImageIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-xs truncate ${isSelf ? "text-white dark:text-slate-955" : "text-slate-900 dark:text-white"}`} title={file.name}>
                    {file.name}
                  </p>
                  <p className={`text-[10px] font-medium ${isSelf ? "text-slate-300 dark:text-slate-800" : "text-slate-500 dark:text-slate-400"}`}>
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
              <p className={`text-[10px] mt-2 ${isSelf ? "text-slate-300 dark:text-slate-850" : "text-slate-500"}`}>Loading video preview...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2.5">
                <Video className="w-5 h-5 text-emerald-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-xs truncate ${isSelf ? "text-white dark:text-slate-955" : "text-slate-900 dark:text-white"}`} title={file.name}>
                    {file.name}
                  </p>
                  <p className={`text-[10px] font-medium ${isSelf ? "text-slate-300 dark:text-slate-800" : "text-slate-500 dark:text-slate-400"}`}>
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

  // Debounced typing timeout
  const typingTimeoutRef = useRef<any | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCurrentMessage(val);

    if (socketService.getSocket() && roomId) {
      socketService.emit("chat_typing", {
        roomId,
        userId: "doctor",
        name: "Doctor",
        role: "doctor",
        isTyping: val.length > 0,
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketService.emit("chat_typing", {
          roomId,
          userId: "doctor",
          name: "Doctor",
          role: "doctor",
          isTyping: false,
        });
      }, 2000);
    }
  };



  // Auto fallback tabs if a choice is missing
  useEffect(() => {
    if (!hasVideo && !hasAudio && hasChat) {
      setTelehealthSubTab("chat");
    } else if ((hasVideo || hasAudio) && !hasChat && telehealthSubTab === "chat") {
      setTelehealthSubTab("call");
    }
  }, [hasVideo, hasAudio, hasChat, telehealthSubTab, setTelehealthSubTab]);

  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md rounded-2xl flex-col h-full overflow-hidden transition-all duration-300 cursor-pointer ${
        activeMobileTab === "telehealth" ? "flex" : "hidden lg:flex"
      } w-full ${videoTab ? "lg:flex-1 lg:min-w-[280px]" : "lg:w-[70px] lg:min-w-[70px]"}`}
      onClick={() => {
        if (videoTab && !reportTab && !infoTab) {
          setReportTab(true);
        }
        setVideoTab((prev) => !prev);
      }}
    >
      {videoTab ? (
        <div className="flex flex-col h-full min-h-0 cursor-default" onClick={(e) => e.stopPropagation()}>
          {/* Header with Sub-tabs */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between shrink-0">
            <div className="flex gap-2.5">
              {(hasVideo || hasAudio) && (
                <button
                  onClick={() => setTelehealthSubTab("call")}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${telehealthSubTab === "call"
                      ? "bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-955"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400"
                    }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>{hasVideo ? "Video Consultation" : "Voice Consultation"}</span>
                </button>
              )}
              {hasChat && (
                <button
                  onClick={() => setTelehealthSubTab("chat")}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${telehealthSubTab === "chat"
                      ? "bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-955"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400"
                    }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat Room</span>
                </button>
              )}
            </div>

            <button
              onClick={() => setVideoTab(false)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-655 dark:hover:text-slate-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Component Area */}
          <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
            {telehealthSubTab === "call" ? (
              <div className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden relative">
                {/* Call Container Box */}
                <div className="flex-1 bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden relative shadow-inner flex flex-col justify-between p-4">
                  {/* Status indicator Overlay top left */}
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

                  {/* Video Stream Preview Display */}
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    {callStatus === "WAITING_FOR_PEER" && (
                      <div className="text-center p-4">
                        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-3 shadow-lg animate-pulse">
                          <UserCheck className="w-8 h-8 text-slate-500" />
                        </div>
                        <h5 className="text-slate-205 font-bold text-sm">Connecting patient...</h5>
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
                              {isSwapped ? "You (Local)" : appointmentDetails?.patientName || "Patient"}
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
                                {isSwapped ? appointmentDetails?.patientName || "Patient" : "You"}
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Audio Call Only View */
                          <>
                            <AudioOnlyConsultation
                              peerName={patientNameVal}
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
                          This medical call session has been securely ended.
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
            ) : (
              <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-900 overflow-hidden">
                {/* Chat Messages Logs */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 min-h-0 flex flex-col justify-start">
                  {chatMessages.map((msg) => {
                    const isSelf = msg.senderRole === "doctor";
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
                              Replying to {msg.replyToRole === "doctor" ? "Doctor" : appointmentDetails?.patientName || "Patient"}:
                            </span>
                            {msg.replyToText}
                          </div>
                        )}

                        <div className="flex items-center gap-2 max-w-full">
                          {/* Bubble Actions Dropdown */}
                          {callStatus === "IN_PROGRESS" && !msg.isDeleted && (
                            <div className={`relative shrink-0 ${isSelf ? "order-first" : "order-last"}`}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveDropdownMessageId(prev => prev === msg.id ? null : msg.id);
                                }}
                                className={`p-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 rounded-lg transition-all border border-slate-200/50 dark:border-slate-700 bg-white dark:bg-slate-800 ${
                                  activeDropdownMessageId === msg.id ? "flex" : "hidden group-hover:flex"
                                }`}
                                title="Actions"
                              >
                                <MoreVertical className="w-3.5 h-3.5" />
                              </button>

                              {activeDropdownMessageId === msg.id && (
                                <div className={`absolute bottom-full mb-1 ${isSelf ? "right-0" : "left-0"} bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-1 z-35 min-w-[100px] flex flex-col gap-0.5`}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setReplyingToMessage(msg);
                                      setActiveDropdownMessageId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-left text-xs font-semibold"
                                  >
                                    <CornerUpLeft className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Reply</span>
                                  </button>
                                  {isSelf && (
                                    <>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingMessageId(msg.id);
                                          setEditingText(msg.text || "");
                                          setActiveDropdownMessageId(null);
                                        }}
                                        className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-left text-xs font-semibold"
                                      >
                                        <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                                        <span>Edit</span>
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteMessage(msg.id);
                                          setActiveDropdownMessageId(null);
                                        }}
                                        className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-rose-500 rounded-lg text-left text-xs font-semibold"
                                      >
                                        <Trash2 className="w-3.5 h-3.5 text-rose-455" />
                                        <span>Delete</span>
                                      </button>
                                    </>
                                  )}
                                </div>
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
                              className={`p-3 rounded-2xl text-xs leading-normal shadow-sm ${
                                isSelf
                                  ? "bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-955 rounded-tr-none font-medium border border-transparent dark:border-emerald-500/20"
                                  : "bg-white text-slate-850 dark:bg-slate-800 dark:text-slate-101 rounded-tl-none border border-slate-200/50 dark:border-slate-700"
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
                            {isSelf ? "Doctor" : appointmentDetails?.patientName || "Patient"} •{" "}
                            {dayjs(msg.createdAt).format("hh:mm A")}
                            {msg.isEdited && !msg.isDeleted && (
                              <span className="text-[8px] opacity-70 italic font-normal">(edited)</span>
                            )}
                          </span>
                          {isSelf && !msg.isDeleted && (
                            <span className="text-[8px] text-slate-450 dark:text-slate-500 font-normal italic mt-0.5">
                              {msg.readAt
                                ? `Read by Patient at ${dayjs(msg.readAt).format("hh:mm A")}`
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
                  <div className="p-2 border-t border-slate-200 dark:border-slate-850 bg-slate-100/70 dark:bg-slate-950/40 flex justify-between items-center shrink-0">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 flex flex-col truncate pr-2">
                      <span className="font-bold text-[9px] text-emerald-600 dark:text-emerald-405">
                        Quoting {replyingToMessage.senderRole === "doctor" ? "Doctor" : appointmentDetails?.patientName || "Patient"}:
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
                )}                {/* Chat Text Input field */}
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
                    placeholder="Type clinical advice or ask about symptoms..."
                    className="flex-1 bg-slate-50 dark:bg-slate-805 text-xs border border-slate-200 dark:border-slate-750 rounded-xl px-3.5 py-3 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-101"
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
          </div>
        </div>
      ) : (
        /* Minimized Icon Bar */
        <div className="h-full flex flex-col items-center justify-between py-6">
          <div className="flex flex-col items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-slate-101 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
              <Video className="w-4 h-4" />
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-101 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="font-bold text-slate-400 uppercase text-[10px] tracking-[0.2em] [writing-mode:vertical-lr] select-none flex items-center gap-1 rotate-180">
            <span>Telehealth Console</span>
            <ChevronRight className="w-3.5 h-3.5 rotate-90" />
          </div>
        </div>
      )}
    </div>
  );
};
