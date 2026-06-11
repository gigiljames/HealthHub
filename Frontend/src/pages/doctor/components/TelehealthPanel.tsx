import React, { useState, useRef } from "react";
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
} from "lucide-react";
import { socketService } from "../../../api/socketService";
import dayjs from "dayjs";

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

interface TelehealthPanelProps {
  infoTab: boolean;
  setInfoTab: React.Dispatch<React.SetStateAction<boolean>>;
  reportTab: boolean;
  setReportTab: React.Dispatch<React.SetStateAction<boolean>>;
  videoTab: boolean;
  setVideoTab: React.Dispatch<React.SetStateAction<boolean>>;
  telehealthSubTab: "call" | "chat";
  setTelehealthSubTab: (tab: "call" | "chat") => void;

  status: string;
  patientData: any;

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
  chatBottomRef: React.RefObject<HTMLDivElement>;
  toast: any;

  // Real-time enhancements
  typingStatus: string | null;
  replyingToMessage: Message | null;
  setReplyingToMessage: (msg: Message | null) => void;
  handleEditMessage: (messageId: string, text: string) => void;
  handleDeleteMessage: (messageId: string) => void;
  consultationId: string;
  roomId: string;
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

  status,
  patientData,

  isMuted,
  setIsMuted,
  isCamOff,
  setIsCamOff,

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
}) => {
  // Inline edit state
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  // Debounced typing timeout
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle typing input and broadcast
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

  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md rounded-2xl flex flex-col min-w-[70px] h-full overflow-hidden transition-all duration-300 cursor-pointer ${
        videoTab ? "flex-1 min-w-[280px]" : "w-[70px]"
      }`}
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
              <button
                onClick={() => setTelehealthSubTab("call")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  telehealthSubTab === "call"
                    ? "bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-955"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400"
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video Consultation</span>
              </button>
              <button
                onClick={() => setTelehealthSubTab("chat")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  telehealthSubTab === "chat"
                    ? "bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-955"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat Room</span>
              </button>
            </div>

            <button
              onClick={() => setVideoTab(false)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
                  <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-880/80 text-[10px] font-bold">
                    <div className={`w-1.5 h-1.5 rounded-full ${status === "IN_PROGRESS" ? "bg-green-500" : "bg-yellow-500 animate-pulse"}`}></div>
                    <span className="text-slate-355 tracking-wider">
                      {status === "IN_PROGRESS" ? "SECURE LINE: ACTIVE" : "WAITING FOR CONNECTION..."}
                    </span>
                  </div>

                  {/* Video Stream Preview Display */}
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    {status === "WAITING_FOR_PATIENT" && (
                      <div className="text-center p-4">
                        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-3 shadow-lg animate-pulse">
                          <UserCheck className="w-8 h-8 text-slate-550" />
                        </div>
                        <h5 className="text-slate-200 font-bold text-sm">Connecting patient...</h5>
                        <p className="text-[11px] text-slate-500 mt-1 max-w-[200px]">Secure P2P WebRTC handshake in progress</p>
                      </div>
                    )}
                    {status === "IN_PROGRESS" && (
                      <div className="w-full h-full relative">
                        <div className="w-full h-full relative">
                          <img
                            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=640&h=480"
                            alt="Patient feed"
                            className="w-full h-full object-cover rounded-xl"
                          />
                          <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-900 text-xs font-bold text-white z-20">
                            {patientData.name}
                          </div>
                        </div>

                        {/* PIP Self-Video View Overlay */}
                        <div className="absolute bottom-4 right-4 w-[110px] h-[80px] sm:w-[130px] sm:h-[95px] bg-slate-900 border border-slate-800/80 rounded-xl overflow-hidden shadow-2xl z-30">
                          <img
                            src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=240&h=180"
                            alt="Doctor Feed"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-1 left-1.5 bg-slate-950/70 backdrop-blur px-1.5 py-0.5 rounded text-[9px] font-bold text-emerald-400 z-20 flex items-center gap-1">
                            <div className="w-1 h-1 rounded-full bg-emerald-500"></div> You
                          </div>
                        </div>
                      </div>
                    )}
                    {status === "COMPLETED" && (
                      <div className="text-center p-4">
                        <div className="w-16 h-16 rounded-full bg-rose-950/20 border border-rose-900/30 flex items-center justify-center mx-auto mb-3 shadow-lg">
                          <VideoOff className="w-8 h-8 text-rose-500" />
                        </div>
                        <h5 className="text-slate-200 font-bold text-sm">Consultation Ended</h5>
                        <p className="text-[11px] text-slate-500 mt-1">This medical video session has been securely shut down</p>
                      </div>
                    )}
                  </div>

                  {/* Video call controls overlays */}
                  {status === "IN_PROGRESS" && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3.5 z-40 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-800">
                      <button
                        onClick={() => {
                          setIsMuted(!isMuted);
                          toast(isMuted ? "Microphone active" : "Microphone muted");
                        }}
                        className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                          isMuted
                            ? "bg-rose-500 border-rose-500/20 text-white shadow-lg shadow-rose-500/10"
                            : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                        }`}
                        title={isMuted ? "Unmute" : "Mute"}
                      >
                        {isMuted ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
                      </button>

                      <button
                        onClick={() => {
                          setIsCamOff(!isCamOff);
                          toast(isCamOff ? "Camera stream active" : "Camera stream disabled");
                        }}
                        className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                          isCamOff
                            ? "bg-rose-500 border-rose-500/20 text-white shadow-lg shadow-rose-500/10"
                            : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                        }`}
                        title={isCamOff ? "Turn Cam On" : "Turn Cam Off"}
                      >
                        {isCamOff ? <VideoOff className="w-4.5 h-4.5" /> : <Video className="w-4.5 h-4.5" />}
                      </button>
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
                        className={`flex flex-col max-w-[80%] group relative ${
                          isSelf ? "align-self-end items-end ml-auto" : "align-self-start items-start mr-auto"
                        }`}
                      >
                        {/* Quoted reply card */}
                        {msg.replyTo && msg.replyToText && (
                          <div className="mb-1 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg p-1.5 px-2 border-l-2 border-emerald-500 font-medium">
                            <span className="font-bold block text-[9px] text-emerald-600 dark:text-emerald-450">
                              Replying to {msg.replyToRole === "doctor" ? "Doctor" : patientData.name}:
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
                                      setEditingText(msg.text);
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
                          ) : (
                            <div
                              className={`p-3 rounded-2xl text-xs leading-normal shadow-sm ${
                                msg.isDeleted
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
                            {isSelf ? "Doctor" : patientData.name} • {dayjs(msg.createdAt).format("hh:mm A")}
                            {msg.isEdited && !msg.isDeleted && <span className="text-[8px] opacity-70 italic font-normal">(edited)</span>}
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
                      <span className="font-bold text-[9px] text-emerald-600 dark:text-emerald-400">
                        Quoting {replyingToMessage.senderRole === "doctor" ? "Doctor" : patientData.name}:
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

                {/* Chat Text Input field */}
                <form
                  onSubmit={handleSendChatMessage}
                  className="p-3 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2 shrink-0 items-center"
                >
                  <input
                    type="text"
                    value={currentMessage}
                    onChange={handleInputChange}
                    placeholder="Type clinical advice or ask about symptoms..."
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
          </div>
        </div>
      ) : (
        /* Minimized Icon Bar */
        <div className="h-full flex flex-col items-center justify-between py-6">
          <div className="flex flex-col items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
              <Video className="w-4 h-4" />
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
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
