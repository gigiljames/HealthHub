import { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setAudioMuted,
  setVideoMuted,
  setRemoteAudioMuted,
  setRemoteEmail,
  setStatus,
} from "../state/call/callSlice";
import { socketService } from "../api/socketService";
import type { RootState } from "../state/store";

export const useWebRTC = (
  roomId: string,
  myEmail: string,
  toast: any,
  enabled: boolean = true,
  peerName: string = "Participant",
  supportedModes: string[] = ["VIDEO", "AUDIO", "CHAT"]
) => {
  const dispatch = useDispatch();
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const hasVideo = supportedModes.includes("VIDEO");
  const hasAudio = supportedModes.includes("AUDIO");

  const { audioMuted, remoteEmail } = useSelector(
    (state: RootState) => state.call
  );

  const peerRef = useRef<RTCPeerConnection | null>(null);
  const myStreamRef = useRef<MediaStream | null>(null);
  const remoteEmailRef = useRef<string>("");

  remoteEmailRef.current = remoteEmail;

  // Initialize peer connection
  const initPeerConnection = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.close();
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:global.stun.twilio.com:3478",
          ],
        },
      ],
    });

    pc.addEventListener("track", (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    });

    pc.addEventListener("negotiationneeded", async () => {
      try {
        if (!remoteEmailRef.current) return;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socketService.emit("peer-negotiation-needed", {
          email: remoteEmailRef.current,
          offer,
        });
      } catch (err) {
        console.error("Error in negotiation needed handler:", err);
      }
    });

    pc.addEventListener("icecandidate", (event) => {
      if (event.candidate && remoteEmailRef.current) {
        socketService.emit("ice-candidate", {
          email: remoteEmailRef.current,
          candidate: event.candidate,
        });
      }
    });

    peerRef.current = pc;
    return pc;
  }, []);

  const createOffer = useCallback(async () => {
    if (!peerRef.current) return null;
    const offer = await peerRef.current.createOffer();
    await peerRef.current.setLocalDescription(offer);
    return offer;
  }, []);

  const createAnswer = useCallback(async (offer: RTCSessionDescriptionInit) => {
    if (!peerRef.current) return null;
    await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerRef.current.createAnswer();
    await peerRef.current.setLocalDescription(answer);
    return answer;
  }, []);

  const setRemoteAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    if (!peerRef.current) return;
    await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
  }, []);

  const sendStream = useCallback((stream: MediaStream) => {
    if (!peerRef.current) return;
    const senders = peerRef.current.getSenders();
    stream.getTracks().forEach((track) => {
      const alreadyAdded = senders.some((s) => s.track?.id === track.id);
      if (!alreadyAdded) {
        peerRef.current?.addTrack(track, stream);
      }
    });
  }, []);

  // Negotiation is handled automatically in initPeerConnection on negotiationneeded event.

  // Socket event handlers
  const handleNewUserJoined = useCallback(
    async (data: { email: string }) => {
      const { email } = data;
      if (email === myEmail) return;

      dispatch(setRemoteEmail(email));
      dispatch(setStatus("IN_PROGRESS"));

      const pc = initPeerConnection();
      if (myStreamRef.current) {
        myStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, myStreamRef.current!);
        });
      }

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketService.emit("call-user", { email, offer });
    },
    [myEmail, dispatch, initPeerConnection]
  );

  const handleIncomingCall = useCallback(
    async (data: { from: string; offer: RTCSessionDescriptionInit }) => {
      if (data.from === myEmail) return;

      dispatch(setRemoteEmail(data.from));
      dispatch(setStatus("IN_PROGRESS"));

      const pc = initPeerConnection();
      if (myStreamRef.current) {
        myStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, myStreamRef.current!);
        });
      }

      const answer = await createAnswer(data.offer);
      if (answer) {
        socketService.emit("call-accepted", { email: data.from, answer });
      }
    },
    [myEmail, dispatch, initPeerConnection, createAnswer]
  );

  const handleCallAccepted = useCallback(
    async (data: { answer: RTCSessionDescriptionInit }) => {
      await setRemoteAnswer(data.answer);
    },
    [setRemoteAnswer]
  );

  const handleIncomingNegotiation = useCallback(
    async (data: { from: string; offer: RTCSessionDescriptionInit }) => {
      if (data.from === myEmail) return;
      const answer = await createAnswer(data.offer);
      if (answer) {
        socketService.emit("peer-negotiation-done", { email: data.from, answer });
      }
    },
    [myEmail, createAnswer]
  );

  const handlePeerNegotiationDone = useCallback(
    async (data: { answer: RTCSessionDescriptionInit }) => {
      await setRemoteAnswer(data.answer);
    },
    [setRemoteAnswer]
  );

  const handleIncomingIceCandidate = useCallback(
    async (data: { candidate: RTCIceCandidateInit }) => {
      try {
        if (peerRef.current) {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      } catch (err) {
        console.error("Error adding incoming ICE candidate:", err);
      }
    },
    []
  );

  const handleUserLeft = useCallback(
    (data: { fromEmail: string }) => {
      const { fromEmail } = data;
      if (fromEmail === myEmail) return;

      dispatch(setRemoteEmail(""));
      setRemoteStream(null);
      dispatch(setStatus("WAITING_FOR_PEER"));

      if (peerRef.current) {
        peerRef.current.close();
      }
      initPeerConnection();

      toast.success(`${peerName} has left the call.`, {
        icon: "🚪",
      });
    },
    [myEmail, dispatch, initPeerConnection, toast, peerName]
  );

  const handlePeerAudioToggled = useCallback(
    (data: { muted: boolean }) => {
      dispatch(setRemoteAudioMuted(data.muted));
    },
    [dispatch]
  );

  // Sync mute state when connected or state changes
  useEffect(() => {
    if (!enabled) return;
    if (remoteEmail) {
      socketService.emit("toggle-audio", { email: remoteEmail, muted: audioMuted });
    }
  }, [remoteEmail, audioMuted, enabled]);

  // Toggle Audio
  const toggleAudio = useCallback(() => {
    if (myStreamRef.current) {
      const audioTrack = myStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        dispatch(setAudioMuted(!audioTrack.enabled));
        socketService.emit("toggle-audio", { email: remoteEmail, muted: !audioTrack.enabled });
      }
    }
  }, [remoteEmail, dispatch]);

  // Toggle Video
  const toggleVideo = useCallback(() => {
    if (myStreamRef.current) {
      const videoTrack = myStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        dispatch(setVideoMuted(!videoTrack.enabled));
      }
    }
  }, [dispatch]);

  // Leave Call
  const leaveCall = useCallback(() => {
    socketService.emit("leave-call", { remoteEmail });
    if (peerRef.current) {
      peerRef.current.close();
    }
    if (myStreamRef.current) {
      myStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    setMyStream(null);
    setRemoteStream(null);
    dispatch(setRemoteEmail(""));
    dispatch(setStatus("COMPLETED"));
  }, [remoteEmail, dispatch]);

  // Setup getUserMedia
  useEffect(() => {
    if (!enabled) return;
    let isMounted = true;
    let localStream: MediaStream | null = null;

    const startMedia = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error(
            "navigator.mediaDevices.getUserMedia is not supported. WebRTC calls require a secure context (HTTPS or localhost)."
          );
        }

        const constraints: MediaStreamConstraints = {
          audio: hasAudio,
          video: hasVideo,
        };

        if (!constraints.audio && !constraints.video) {
          // No media required
          return;
        }

        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (initialErr: any) {
          console.warn("Initial getUserMedia failed, trying fallback:", initialErr);
          
          // Case 1: Video + Audio requested, but camera might be missing/blocked
          if (hasVideo && hasAudio) {
            try {
              toast.error("Camera access failed. Trying audio-only connection...", {
                id: "media-fallback-toast",
              });
              stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
              if (isMounted) {
                dispatch(setVideoMuted(true));
              }
            } catch (fallbackErr: any) {
              console.error("Audio fallback also failed:", fallbackErr);
              throw fallbackErr;
            }
          } else {
            throw initialErr;
          }
        }

        localStream = stream;
        myStreamRef.current = stream;
        if (isMounted) {
          setMyStream(stream);
          initPeerConnection();
        } else {
          stream.getTracks().forEach((t) => t.stop());
        }
      } catch (err: any) {
        console.error("Error accessing camera/mic:", err);
        if (isMounted) {
          const isSecureContextError = err.message && err.message.includes("secure context");
          if (isSecureContextError) {
            toast.error(err.message, { duration: 6000 });
          } else if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
            toast.error("Camera/Mic permission denied. Please allow permission in your browser settings.");
          } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
            toast.error("No camera/microphone found on your device.");
          } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
            toast.error("Camera or microphone is already in use by another application.");
          } else {
            toast.error("Failed to access camera/mic. Please check permissions and hardware.");
          }
        }
      }
    };

    startMedia();

    return () => {
      isMounted = false;
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop());
      }
      if (peerRef.current) {
        peerRef.current.close();
      }
    };
  }, [initPeerConnection, toast, enabled, hasAudio, hasVideo, dispatch]);

  // Send tracks when stream or peer changes
  useEffect(() => {
    if (!enabled) return;
    if (myStream && peerRef.current) {
      sendStream(myStream);
    }
  }, [myStream, sendStream, enabled]);

  // Register socket listeners
  useEffect(() => {
    if (!enabled) return;
    socketService.on("user-joined", handleNewUserJoined);
    socketService.on("incoming-call", handleIncomingCall);
    socketService.on("call-accepted", handleCallAccepted);
    socketService.on("incoming-negotiation", handleIncomingNegotiation);
    socketService.on("peer-negotiation-done", handlePeerNegotiationDone);
    socketService.on("user-left", handleUserLeft);
    socketService.on("peer-audio-toggled", handlePeerAudioToggled);
    socketService.on("ice-candidate", handleIncomingIceCandidate);

    return () => {
      const socket = socketService.getSocket();
      if (socket) {
        socket.off("user-joined", handleNewUserJoined);
        socket.off("incoming-call", handleIncomingCall);
        socket.off("call-accepted", handleCallAccepted);
        socket.off("incoming-negotiation", handleIncomingNegotiation);
        socket.off("peer-negotiation-done", handlePeerNegotiationDone);
        socket.off("user-left", handleUserLeft);
        socket.off("peer-audio-toggled", handlePeerAudioToggled);
        socket.off("ice-candidate", handleIncomingIceCandidate);
      }
    };
  }, [
    handleNewUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleIncomingNegotiation,
    handlePeerNegotiationDone,
    handleUserLeft,
    handlePeerAudioToggled,
    handleIncomingIceCandidate,
    enabled,
  ]);

  return {
    myStream,
    remoteStream,
    toggleAudio,
    toggleVideo,
    leaveCall,
  };
};
