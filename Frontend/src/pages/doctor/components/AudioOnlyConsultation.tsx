import React from "react";
import { Phone, MicOff, UserCheck, VideoOff } from "lucide-react";

interface AudioOnlyConsultationProps {
  peerName: string;
  callStatus: string;
  remoteAudioMuted: boolean;
}

export const AudioOnlyConsultation: React.FC<AudioOnlyConsultationProps> = ({
  peerName,
  callStatus,
  remoteAudioMuted,
}) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-955 dark:bg-slate-950 text-white relative p-6">
      {/* Dynamic line status tag */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800/80 text-[10px] font-bold">
        <div
          className={`w-1.5 h-1.5 rounded-full ${
            callStatus === "IN_PROGRESS" ? "bg-green-500" : "bg-yellow-500 animate-pulse"
          }`}
        ></div>
        <span className="text-slate-350 tracking-wider">
          {callStatus === "IN_PROGRESS"
            ? "SECURE LINE: AUDIO CALL ACTIVE"
            : "WAITING FOR CONNECTION..."}
        </span>
      </div>

      {callStatus === "WAITING_FOR_PEER" && (
        <div className="text-center p-4">
          <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-3 shadow-lg animate-pulse">
            <UserCheck className="w-8 h-8 text-slate-500" />
          </div>
          <h5 className="text-slate-200 font-bold text-sm">Connecting {peerName}...</h5>
          <p className="text-[11px] text-slate-500 mt-1 max-w-[200px]">
            Secure P2P WebRTC connection handshake...
          </p>
        </div>
      )}

      {callStatus === "IN_PROGRESS" && (
        <div className="flex flex-col items-center justify-center relative">
          <div className="relative mb-8 mt-4">
            {/* Ripple rings */}
            <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping duration-1000 scale-150"></div>
            <div className="absolute inset-0 rounded-full bg-emerald-500/5 animate-ping duration-1500 scale-110"></div>
            <div className="w-28 h-28 rounded-full bg-slate-900 border border-slate-800/80 flex items-center justify-center text-emerald-400 shadow-xl relative z-10">
              <Phone className="w-12 h-12 animate-pulse" />
            </div>
          </div>
          <h4 className="font-bold text-lg text-slate-100 mt-2">
            {peerName}
          </h4>
          <p className="text-xs text-slate-400 mt-2 font-medium tracking-wide">
            Voice Call Active
          </p>

          {/* Remote Audio Muted Indicator */}
          {remoteAudioMuted && (
            <div className="mt-6 flex items-center gap-2 px-3.5 py-1.5 bg-rose-500/10 rounded-full border border-rose-500/20 text-rose-400 text-xs font-semibold animate-pulse">
              <MicOff className="w-3.5 h-3.5" />
              <span>{peerName} has muted their microphone</span>
            </div>
          )}
        </div>
      )}

      {callStatus === "COMPLETED" && (
        <div className="text-center p-4">
          <div className="w-16 h-16 rounded-full bg-rose-950/20 border border-rose-900/30 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <VideoOff className="w-8 h-8 text-rose-500" />
          </div>
          <h5 className="text-slate-200 font-bold text-sm">Consultation Ended</h5>
          <p className="text-[11px] text-slate-500 mt-1">
            This medical call session has been securely ended.
          </p>
        </div>
      )}
    </div>
  );
};
