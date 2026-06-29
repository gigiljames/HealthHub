import React, { useEffect, useState, useRef } from "react";
import {
  Send,
  CornerUpLeft,
  Edit3,
  Trash2,
  Check,
  X,
  Paperclip,
  Download,
  FileText,
  Image as ImageIcon,
  Video,
  Loader2,
  Search,
  MoreVertical,
  Lock,
  ArrowLeft,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import {
  getChats,
  getChatHistory,
  sendMessage,
  getChatUploadUrl,
  uploadFileToS3,
  getChatAccessUrl,
  editMessage,
  deleteMessage,
  markMessageAsRead,
} from "../../api/chatApi";
import { socketService } from "../../api/socketService";
import { useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router";
import Avatar from "../../components/common/Avatar";
import ConfirmationModal from "../../components/common/ConfirmationModal";

interface ChatItem {
  consultationId: string;
  roomId: string;
  recipientId: string;
  recipientName: string;
  recipientEmail: string;
  recipientImageUrl: string | null;
  recipientSpecialization?: string | null;
  endedAt: string | null;
  slotStart: string | null;
  isClosed: boolean;
  unreadCount: number;
  createdAt: string;
  latestMessage?: {
    text?: string;
    file?: {
      key: string;
      name: string;
      type: "image" | "video" | "document";
      size: number;
    };
    senderRole: "doctor" | "patient";
    createdAt: string;
  } | null;
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

interface ChatStatus {
  endedAt: string | null;
  isClosed: boolean;
  closeReason: "7_DAYS_PASSED" | "MESSAGE_LIMIT_REACHED" | null;
  patientMessagesLeft: number;
  slotMode: "online" | "in-person";
}

const UChatsPage: React.FC = () => {
  const { consultationId: urlConsultId } = useParams<{ consultationId?: string }>();
  const navigate = useNavigate();
  const { email: myEmail } = useSelector((state: RootState) => state.userInfo);

  // States
  const [chatsList, setChatsList] = useState<ChatItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "closed">("active");
  const [loadingChats, setLoadingChats] = useState(true);

  const [activeChat, setActiveChat] = useState<ChatItem | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatStatus, setChatStatus] = useState<ChatStatus | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Form states
  const [currentMessage, setCurrentMessage] = useState("");
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Typing & UI states
  const [typingStatus, setTypingStatus] = useState<string | null>(null);
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [activeDropdownMessageId, setActiveDropdownMessageId] = useState<string | null>(null);
  const [showMobileChatWindow, setShowMobileChatWindow] = useState(false);

  // S3 Preview/Download states
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

  // Modals
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [messageIdToDelete, setMessageIdToDelete] = useState<string | null>(null);

  // Fetch Chats list
  const fetchChats = async (selectId?: string) => {
    try {
      const res = await getChats();
      if (res.success && res.data) {
        setChatsList(res.data);
        if (selectId) {
          const selected = res.data.find((c: ChatItem) => c.consultationId === selectId);
          if (selected) {
            setActiveChat(selected);
            setShowMobileChatWindow(true);
          }
        }
      }
    } catch (err) {
      toast.error("Failed to load chats");
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    fetchChats(urlConsultId);
  }, [urlConsultId]);

  // Debounce search query by 300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load message history when active chat changes
  useEffect(() => {
    if (!activeChat) return;

    const loadChatHistory = async () => {
      setLoadingMessages(true);
      try {
        const res = await getChatHistory(activeChat.consultationId);
        if (res.success && res.data) {
          setMessages(res.data.messages || []);
          setChatStatus(res.data.chatStatus || null);

          // Connect Socket & Join Room
          socketService.connect();
          socketService.joinRoom(activeChat.roomId, myEmail);

          // Mark incoming unread doctor messages as read
          for (const msg of (res.data.messages || [])) {
            if (msg.senderRole === "doctor" && !msg.readAt) {
              await markMessageAsRead(msg.id, activeChat.roomId);
            }
          }
        }
      } catch (err) {
        toast.error("Failed to load message history");
      } finally {
        setLoadingMessages(false);
      }
    };

    loadChatHistory();

    // Listen to real-time events
    socketService.on("chat_message", (msg: any) => {
      if (msg.consultationId !== activeChat.consultationId) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });

      // Mark as read if from doctor
      if (msg.senderRole === "doctor") {
        markMessageAsRead(msg.id, activeChat.roomId);
      }

      // Re-fetch chatStatus (to update remaining messages count)
      getChatHistory(activeChat.consultationId).then((res) => {
        if (res.success && res.data) setChatStatus(res.data.chatStatus || null);
      });
    });

    socketService.on("chat_message_edited", (msg: any) => {
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? msg : m)));
    });

    socketService.on("chat_message_deleted", (msg: any) => {
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? msg : m)));
    });

    socketService.on("chat_message_read", (msg: any) => {
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? msg : m)));
    });

    socketService.on("chat_typing", (data: any) => {
      if (data.roomId === activeChat.roomId && data.role === "doctor") {
        setTypingStatus(data.isTyping ? `Dr. ${activeChat.recipientName} is typing...` : null);
      }
    });

    return () => {
      socketService.leaveRoom(activeChat.roomId);
      socketService.disconnect();
      setMessages([]);
      setChatStatus(null);
      setTypingStatus(null);
      setReplyingToMessage(null);
      setEditingMessageId(null);
    };
  }, [activeChat, myEmail]);

  // Scroll to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingStatus]);

  // Fetch URLs for self-images/videos preview
  useEffect(() => {
    messages.forEach((msg) => {
      if (msg.file && (msg.file.type === "image" || msg.file.type === "video")) {
        const isSelf = msg.senderRole === "patient";
        const key = `${msg.id}-preview`;
        if (isSelf && !fileUrls[msg.id] && !fetchingUrls[key]) {
          fetchFileUrl(msg.id, false);
        }
      }
    });
  }, [messages, fileUrls, fetchingUrls]);

  // Click outside to close actions dropdown
  useEffect(() => {
    const handleDocumentClick = () => {
      setActiveDropdownMessageId(null);
    };
    window.addEventListener("click", handleDocumentClick);
    return () => window.removeEventListener("click", handleDocumentClick);
  }, []);

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
    setFetchingUrls((prev) => ({ ...prev, [fetchKey]: true }));
    try {
      const res = await getChatAccessUrl(msgId, download);
      if (res.success && res.data?.accessUrl) {
        if (!download) {
          setFileUrls((prev) => ({ ...prev, [msgId]: res.data.accessUrl }));
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
      toast.error("Failed to retrieve file");
    } finally {
      setFetchingUrls((prev) => ({ ...prev, [fetchKey]: false }));
    }
  };

  const markAsDownloaded = (msgId: string) => {
    const updated = [...downloadedFileMessageIds, msgId];
    setDownloadedFileMessageIds(updated);
    localStorage.setItem("downloadedFileMessageIds", JSON.stringify(updated));
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim() || !activeChat) return;

    try {
      const text = currentMessage;
      setCurrentMessage("");
      await sendMessage(
        activeChat.consultationId,
        text,
        activeChat.roomId,
        replyingToMessage?.id || null
      );
      setReplyingToMessage(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send message");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChat) return;

    const EXECUTABLE_EXTENSIONS = [
      "exe", "bat", "cmd", "sh", "bin", "msi", "jar", "com", "apk", "app", 
      "scr", "vbs", "wsf", "run", "ps1", "vbe", "jse"
    ];
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (EXECUTABLE_EXTENSIONS.includes(ext) || file.type === "application/x-msdownload") {
      toast.error("Executable files are strictly not accepted.");
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
      sizeLimit = 10 * 1024 * 1024;
    } else if (type === "video") {
      sizeLimit = 100 * 1024 * 1024;
    } else {
      sizeLimit = 20 * 1024 * 1024;
    }

    if (file.size > sizeLimit) {
      toast.error(`File size exceeds limit of ${sizeLimit / (1024 * 1024)}MB.`);
      return;
    }

    setIsUploadingFile(true);
    const loadingToastId = toast.loading("Uploading file to secure storage...");

    try {
      const res = await getChatUploadUrl(activeChat.consultationId, file.name, file.type, file.size);
      if (res.success && res.data?.uploadUrl) {
        const { uploadUrl, key } = res.data;
        await uploadFileToS3(uploadUrl, file);
        
        await sendMessage(
          activeChat.consultationId,
          undefined,
          activeChat.roomId,
          replyingToMessage?.id || null,
          { key, name: file.name, type, size: file.size }
        );

        setReplyingToMessage(null);
        toast.success("File shared successfully!", { id: loadingToastId });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to upload file", { id: loadingToastId });
    } finally {
      setIsUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleEditMessageClick = async (messageId: string, text: string) => {
    if (!text.trim() || !activeChat) return;
    try {
      await editMessage(messageId, text, activeChat.roomId);
      toast.success("Message edited");
    } catch (err) {
      toast.error("Failed to edit message");
    }
  };

  const handleDeleteMessageClick = (messageId: string) => {
    setMessageIdToDelete(messageId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteMessage = async () => {
    if (!messageIdToDelete || !activeChat) return;
    try {
      await deleteMessage(messageIdToDelete, activeChat.roomId);
      toast.success("Message deleted");
    } catch (err) {
      toast.error("Failed to delete message");
    } finally {
      setIsDeleteModalOpen(false);
      setMessageIdToDelete(null);
    }
  };

  const typingTimeoutRef = useRef<any | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCurrentMessage(val);

    if (socketService.getSocket() && activeChat) {
      socketService.emit("chat_typing", {
        roomId: activeChat.roomId,
        userId: "patient",
        name: "Patient",
        role: "patient",
        isTyping: val.length > 0,
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketService.emit("chat_typing", {
          roomId: activeChat.roomId,
          userId: "patient",
          name: "Patient",
          role: "patient",
          isTyping: false,
        });
      }, 2000);
    }
  };

  // Notify when a new chat message arrives while sidebar is not the active chat
  useEffect(() => {
    const handleIncomingChatMsg = (msg: any) => {
      if (activeChat?.consultationId === msg.consultationId) return; // already reading it
      if (msg.senderRole !== "doctor") return;
      const sender = chatsList.find((c) => c.consultationId === msg.consultationId);
      toast(`💬 Dr. ${sender?.recipientName || "Doctor"}: ${msg.text?.slice(0, 50) || "Attachment"}`, {
        duration: 4000,
        style: { background: "#0f766e", color: "#fff", fontSize: "13px" },
      });
    };
    socketService.on("chat_message", handleIncomingChatMsg);
    return () => socketService.off("chat_message", handleIncomingChatMsg);
  }, [activeChat, chatsList]);

  const filteredChats = chatsList
    .filter((c) => c.recipientName.toLowerCase().includes(debouncedSearch.toLowerCase()))
    .filter((c) => (activeTab === "active" ? !c.isClosed : c.isClosed));

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

    const isSelf = msg.senderRole === "patient";

    if (file.type === "image") {
      const isPreviewLoaded = !!fileUrls[id];
      return (
        <div className="flex flex-col gap-2 min-w-[200px]">
          {isPreviewLoaded ? (
            <div className="flex flex-col gap-1.5">
              <img
                src={fileUrls[id]}
                alt={file.name}
                className="max-w-full max-h-[160px] object-cover rounded-lg shadow-sm cursor-zoom-in border border-slate-200/20"
                onClick={() => window.open(fileUrls[id], "_blank")}
              />
              <p className={`text-[10px] truncate max-w-[200px] ${isSelf ? "text-slate-200" : "text-slate-500"}`}>
                {file.name} ({formatFileSize(file.size)})
              </p>
              <button
                type="button"
                onClick={() => {
                  markAsDownloaded(id);
                  fetchFileUrl(id, true);
                }}
                className="w-full flex items-center justify-center gap-1 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded font-bold text-[10px] shadow"
              >
                <Download className="w-3 h-3" />
                <span>Download</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <ImageIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-xs truncate ${isSelf ? "text-white" : "text-slate-900"}`} title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-[10px] text-slate-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => fetchFileUrl(id, false)}
                  className="flex items-center justify-center gap-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold text-[10px]"
                >
                  <ImageIcon className="w-3 h-3" />
                  <span>Preview</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    markAsDownloaded(id);
                    fetchFileUrl(id, true);
                  }}
                  className="flex items-center justify-center gap-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded font-bold text-[10px]"
                >
                  <Download className="w-3 h-3" />
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
        <div className="flex flex-col gap-2 min-w-[200px]">
          {isPreviewLoaded ? (
            <div className="flex flex-col gap-1.5">
              <video
                src={fileUrls[id]}
                controls
                className="max-w-full rounded-lg bg-black"
              />
              <p className={`text-[10px] truncate max-w-[200px] ${isSelf ? "text-slate-200" : "text-slate-500"}`}>
                {file.name} ({formatFileSize(file.size)})
              </p>
              <button
                type="button"
                onClick={() => {
                  markAsDownloaded(id);
                  fetchFileUrl(id, true);
                }}
                className="w-full flex items-center justify-center gap-1 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded font-bold text-[10px]"
              >
                <Download className="w-3 h-3" />
                <span>Download</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <Video className="w-5 h-5 text-emerald-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-xs truncate ${isSelf ? "text-white" : "text-slate-900"}`} title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-[10px] text-slate-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => fetchFileUrl(id, false)}
                  className="flex items-center justify-center gap-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold text-[10px]"
                >
                  <Video className="w-3 h-3" />
                  <span>Preview</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    markAsDownloaded(id);
                    fetchFileUrl(id, true);
                  }}
                  className="flex items-center justify-center gap-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded font-bold text-[10px]"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2 min-w-[200px]">
        <div className="flex items-start gap-2.5">
          {fileIcon()}
          <div className="flex-1 min-w-0">
            <p className={`font-bold text-xs truncate ${isSelf ? "text-white" : "text-slate-950"}`} title={file.name}>
              {file.name}
            </p>
            <p className="text-[10px] text-slate-500">
              {file.type.toUpperCase()} • {formatFileSize(file.size)}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            markAsDownloaded(id);
            fetchFileUrl(id, true);
          }}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded font-bold text-[11px] shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download</span>
        </button>
      </div>
    );
  };

  return (
    <div className="h-screen w-full flex bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans pt-[70px] overflow-hidden">
      {/* Chats Sidebar List */}
      <div
        className={`w-full md:w-[360px] lg:w-[400px] border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 bg-white dark:bg-slate-900 ${
          showMobileChatWindow ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Search header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-3">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Conversations</h1>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by doctor name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          {/* Tabs */}
          <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
            {(["active", "closed"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1.5 text-xs font-bold capitalize transition-all ${
                  activeTab === tab
                    ? "bg-emerald-500 text-white"
                    : "bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                {tab === "active" ? "Active" : "Closed"}
              </button>
            ))}
          </div>
        </div>

        {/* List items */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40 p-2 space-y-1">
          {loadingChats ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <MessageSquare className="w-8 h-8 opacity-40 mb-2" />
              <p className="text-xs">
                {activeTab === "active" ? "No active chats found." : "No closed chats found."}
              </p>
            </div>
          ) : (
            filteredChats.map((chat) => {
              const isActive = activeChat?.consultationId === chat.consultationId;
              const hasNew = chat.latestMessage;

              return (
                <div
                  key={chat.consultationId}
                  onClick={() => {
                    setActiveChat(chat);
                    setShowMobileChatWindow(true);
                    navigate(`/chats/${chat.consultationId}`);
                  }}
                  className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-150 ${
                    isActive
                      ? "bg-emerald-500/10 border-l-4 border-emerald-500 dark:bg-emerald-500/20"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <Avatar
                    src={chat.recipientImageUrl || undefined}
                    className="w-11 h-11 rounded-full object-cover shrink-0"
                    alt={chat.recipientName}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5 gap-2">
                      <p className="font-bold text-sm text-slate-900 dark:text-white truncate flex-1">
                        Dr. {chat.recipientName}
                      </p>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {chat.latestMessage && (
                          <span className="text-[10px] text-slate-400">
                            {dayjs(chat.latestMessage.createdAt).format("hh:mm A")}
                          </span>
                        )}
                        {!isActive && chat.unreadCount > 0 && (
                          <span className="min-w-[16px] h-4 px-1 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                    {chat.recipientSpecialization && (
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold truncate mb-0.5">
                        {chat.recipientSpecialization}
                      </p>
                    )}
                    {chat.slotStart && (
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-0.5">
                        📅 {dayjs(chat.slotStart).format("MMM D, YYYY • hh:mm A")}
                      </p>
                    )}
                    {chat.isClosed && (
                      <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-500 mb-0.5">Closed</span>
                    )}
                    {chat.latestMessage ? (
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate pr-2">
                        <span className="font-semibold">
                          {chat.latestMessage.senderRole === "patient" ? "You: " : ""}
                        </span>
                        {chat.latestMessage.text || "Shared an attachment"}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No messages yet</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Window Box on Right */}
      <div className={`flex-1 flex flex-col min-w-0 bg-slate-100/40 dark:bg-slate-950 ${
        showMobileChatWindow ? "flex" : "hidden md:flex"
      }`}>
        {activeChat ? (
          <>
            {/* Active Header */}
            <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 md:px-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => {
                    setShowMobileChatWindow(false);
                    setActiveChat(null);
                    navigate("/chats");
                  }}
                  className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <Avatar
                  src={activeChat.recipientImageUrl || undefined}
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                  alt={activeChat.recipientName}
                />
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 dark:text-white truncate text-sm md:text-base">
                    Dr. {activeChat.recipientName}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium truncate">
                    {activeChat.recipientSpecialization || "Doctor"}
                    {activeChat.slotStart && (
                      <> • 📅 {dayjs(activeChat.slotStart).format("MMM D, YYYY")}</>
                    )}
                  </p>
                </div>
              </div>

              {/* Status info bar */}
              {chatStatus && (
                <div className="hidden lg:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full text-xs font-semibold">
                  <div className={`w-1.5 h-1.5 rounded-full ${chatStatus.isClosed ? "bg-red-500" : "bg-green-500"}`}></div>
                  <span className="text-slate-600 dark:text-slate-300">
                    {chatStatus.isClosed
                      ? "Chat Closed"
                      : `Limit: ${chatStatus.patientMessagesLeft}/30 messages left`}
                  </span>
                </div>
              )}
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 flex flex-col justify-start">
              {loadingMessages ? (
                <div className="flex-1 flex justify-center items-center">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                  <MessageSquare className="w-10 h-10 opacity-30 mb-2" />
                  <p className="text-xs">Send a message to start conversation.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isSelf = msg.senderRole === "patient";
                  const isEditing = editingMessageId === msg.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[80%] group relative ${
                        isSelf ? "align-self-end items-end ml-auto" : "align-self-start items-start mr-auto"
                      }`}
                    >
                      {msg.replyTo && msg.replyToText && (
                        <div className="mb-1 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg p-1.5 px-2 border-l-2 border-emerald-500 font-medium">
                          <span className="font-bold block text-[9px] text-emerald-600 dark:text-emerald-400">
                            Replying to {msg.replyToRole === "doctor" ? `Dr. ${activeChat.recipientName}` : "You"}:
                          </span>
                          {msg.replyToText}
                        </div>
                      )}

                      <div className="flex items-center gap-2 max-w-full">
                        {/* Dropdown options */}
                        {!chatStatus?.isClosed && !msg.isDeleted && (
                          <div className={`relative shrink-0 ${isSelf ? "order-first" : "order-last"}`}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdownMessageId((prev) => (prev === msg.id ? null : msg.id));
                              }}
                              className={`p-1 hover:bg-slate-150 dark:hover:bg-slate-800 text-slate-500 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 ${
                                activeDropdownMessageId === msg.id ? "flex" : "hidden group-hover:flex"
                              }`}
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
                                        handleDeleteMessageClick(msg.id);
                                        setActiveDropdownMessageId(null);
                                      }}
                                      className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-rose-500 rounded-lg text-left text-xs font-semibold"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                                      <span>Delete</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        {isEditing ? (
                          <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-2 flex gap-1.5 items-center w-full min-w-[200px]">
                            <input
                              type="text"
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="flex-1 bg-white dark:bg-slate-700 text-xs rounded border p-1 focus:outline-none text-slate-800 dark:text-slate-100"
                            />
                            <button
                              onClick={async () => {
                                await handleEditMessageClick(msg.id, editingText);
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
                        ) : msg.isDeleted ? (
                          <div
                            className="p-3 rounded-2xl text-xs leading-normal shadow-sm bg-slate-100 text-slate-400 dark:bg-slate-800/40 dark:text-slate-500 italic border border-slate-205 dark:border-slate-700"
                          >
                            This message was deleted
                          </div>
                        ) : msg.file ? (
                          <div
                            className={`p-3 rounded-2xl text-xs leading-normal shadow-sm ${
                              isSelf
                                ? "bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-955 rounded-tr-none font-medium border border-transparent"
                                : "bg-white text-slate-850 dark:bg-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/50 dark:border-slate-700"
                            }`}
                          >
                            {renderFileBubbleContent(msg)}
                          </div>
                        ) : (
                          <div
                            className={`p-3 rounded-2xl text-xs leading-normal shadow-sm ${
                              isSelf
                                ? "bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-955 rounded-tr-none font-medium"
                                : "bg-white text-slate-850 dark:bg-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/50 dark:border-slate-700"
                            }`}
                          >
                            {msg.text}
                          </div>
                        )}
                      </div>

                      {/* Timestamp & receipts */}
                      <div className="text-[9px] text-slate-400 mt-1 font-medium px-1 flex flex-col items-end w-full">
                        <span className="flex items-center gap-1 text-[8.5px]">
                          {isSelf ? "You" : `Dr. ${activeChat.recipientName}`} •{" "}
                          {dayjs(msg.createdAt).format("hh:mm A")}
                          {msg.isEdited && !msg.isDeleted && (
                            <span className="text-[8px] opacity-70 italic font-normal">(edited)</span>
                          )}
                        </span>
                        {isSelf && !msg.isDeleted && (
                          <span className="text-[8px] text-slate-400 dark:text-slate-500 font-normal italic mt-0.5">
                            {msg.readAt
                              ? `Read by Doctor at ${dayjs(msg.readAt).format("hh:mm A")}`
                              : "Delivered"}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Doctor Typing Indicator */}
            {typingStatus && (
              <div className="px-4 py-1.5 text-[10px] text-slate-500 italic shrink-0 animate-pulse bg-white/70 dark:bg-slate-900/70 border-t flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-ping"></div>
                {typingStatus}
              </div>
            )}

            {/* Quoted quote bar preview */}
            {replyingToMessage && (
              <div className="p-2 border-t border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex justify-between items-center shrink-0">
                <div className="text-[10px] text-slate-500 flex flex-col truncate pr-2">
                  <span className="font-bold text-[9px] text-emerald-600 dark:text-emerald-400">
                    Quoting {replyingToMessage.senderRole === "doctor" ? `Dr. ${activeChat.recipientName}` : "You"}:
                  </span>
                  <span className="truncate">{replyingToMessage.text}</span>
                </div>
                <button
                  onClick={() => setReplyingToMessage(null)}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Footer Input Bar / Lock Alert */}
            {chatStatus?.isClosed ? (
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-3 shrink-0">
                <div className="p-2 bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400 rounded-xl shrink-0 mt-0.5">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-800 dark:text-red-400">This conversation is closed</p>
                  <p className="text-xs text-slate-550 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {chatStatus.closeReason === "7_DAYS_PASSED"
                      ? "It has been more than 7 days since this consultation ended. Post-consultation chats are limited to a 7-day follow-up window. Please schedule a new appointment if you need further medical advice."
                      : "You have reached the maximum limit of 30 post-consultation messages for this session. This limit prevents abuse and protects doctor schedules. Please schedule a new session for further discussions."}
                  </p>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSendChatMessage}
                className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2 shrink-0 items-center"
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
                  placeholder="Ask a follow-up question or share updates..."
                  className="flex-1 bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-3 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-101"
                />
                <button
                  type="submit"
                  className="p-3 bg-slate-900 hover:bg-slate-850 dark:bg-emerald-500 text-white dark:text-slate-955 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
            <MessageSquare className="w-16 h-16 opacity-20 mb-3 animate-bounce" />
            <h3 className="font-bold text-slate-800 dark:text-white text-base">Select a Chat</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[280px] leading-relaxed">
              Pick a previous online consultation from the sidebar list to view medical chat history and ask follow-up questions.
            </p>
          </div>
        )}
      </div>

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

export default UChatsPage;
