import React, { useEffect, useState } from "react";

import { ArrowLeft, Video, VideoOff, PhoneOff, UserCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";
import { endConsultation, joinConsultation } from "../../api/consultationApi";
import { socketService } from "../../api/socketService";

const DConsultationRoomPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>("WAITING_FOR_PATIENT");
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    if (!appointmentId) return;

    const setupConsultation = async () => {
      try {
        const response = await joinConsultation(appointmentId);
        const consultation = response.data;

        socketService.connect();
        socketService.joinRoom(consultation.roomId);

        // Adjust local status based on DB response
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

  const handleEndConsultation = async () => {
    if (!appointmentId || status === "COMPLETED") return;
    setEnding(true);
    try {
      await endConsultation(appointmentId);
      setStatus("COMPLETED");
      toast.success("Consultation ended successfully");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to end consultation",
      );
    } finally {
      setEnding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 flex flex-col items-center pt-24 px-4 overflow-hidden">
      {/* Header Bar */}
      <div className="absolute top-0 w-full bg-white dark:bg-gray-800 shadow-sm px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="font-medium hidden sm:inline">Back</span>
        </button>
        <div className="flex items-center space-x-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              status === "IN_PROGRESS"
                ? "bg-green-500 animate-pulse"
                : status.includes("WAITING")
                  ? "bg-yellow-500"
                  : "bg-gray-500"
            }`}
          ></div>
          <span className="text-sm font-semibold tracking-wide uppercase">
            {status.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-5xl mt-10 bg-white dark:bg-gray-800 shadow-2xl rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700">
        {/* Placeholder Video Area */}
        <div className="relative aspect-video bg-gray-900 flex items-center justify-center border-b border-gray-800">
          {status === "WAITING_FOR_PATIENT" && (
            <div className="text-center animate-pulse">
              <UserCheck className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl text-gray-400 font-medium">
                Waiting for Patient to connect...
              </h3>
            </div>
          )}
          {status === "IN_PROGRESS" && (
            <div className="text-center">
              <Video className="w-16 h-16 text-green-500 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl text-gray-300 font-medium">
                Consultation Active
              </h3>
            </div>
          )}
          {status === "COMPLETED" && (
            <div className="text-center">
              <VideoOff className="w-16 h-16 text-red-500 mx-auto mb-4 opacity-70" />
              <h3 className="text-xl text-gray-300 font-medium">
                Session Complete
              </h3>
            </div>
          )}

          {/* Controls overlay */}
          {status === "IN_PROGRESS" && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-6 backdrop-blur-md bg-white/10 dark:bg-black/20 p-4 rounded-full border border-white/10">
              {/* <div className="w-12 h-12 rounded-full bg-gray-700/50 flex items-center justify-center cursor-not-allowed">
                <VideoOff className="w-5 h-5 text-gray-300" />
              </div> */}
              <button
                onClick={handleEndConsultation}
                disabled={ending}
                className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-transform hover:scale-105 shadow-lg shadow-red-500/30 disabled:opacity-50"
                title="End Consultation"
              >
                <PhoneOff className="w-6 h-6 text-white" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DConsultationRoomPage;
