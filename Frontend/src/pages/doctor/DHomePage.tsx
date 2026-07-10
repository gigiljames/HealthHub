import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import { Link, useNavigate } from "react-router";
import axiosInstance from "../../api/axios";
import { ROUTES } from "../../constants/routes";
import type {
  DoctorDaySchedule,
  TodayAppointment,
} from "../../types/doctorDashboard";
import {
  Clock,
  Calendar,
  Users,
  Activity,
  Video,
  Play,
  Phone,
} from "lucide-react";
import Avatar from "../../components/common/Avatar";
import getIcon from "../../helpers/getIcon";
import { getPracticeLocations } from "../../api/doctor/dProfileCreationService";
import { setPracticeLocations } from "../../state/doctor/dProfileCreationSlice";

function DHomePage() {
  document.title = "HealthHub | Day Execution Console";
  const { name, isNewUser, onboardingStep } = useSelector(
    (state: RootState) => state.userInfo,
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const practiceLocations = useSelector(
    (state: RootState) => state.dProfileCreation.practiceLocations,
  );

  const [schedule, setSchedule] = useState<DoctorDaySchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const [expandedReasons, setExpandedReasons] = useState<string[]>([]);

  const toggleReason = (id: string) => {
    setExpandedReasons((prev) =>
      prev.includes(id) ? prev.filter((rId) => rId !== id) : [...prev, id],
    );
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axiosInstance.get(
          ROUTES.DOCTOR.GET_DASHBOARD_TODAY,
        );
        if (response.data && response.data.data) {
          setSchedule(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard schedule", error);
      } finally {
        setLoading(false);
      }
    };
    if (!isNewUser) {
      fetchDashboard();
    } else {
      setLoading(false);
    }
  }, [isNewUser]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        if (practiceLocations.length === 0) {
          const response = await getPracticeLocations();
          if (response.data) {
            dispatch(setPracticeLocations(response.data));
          }
        }
      } catch (error) {
        console.error("Failed to fetch practice locations", error);
      }
    };
    if (!isNewUser) {
      fetchLocations();
    }
  }, [isNewUser, practiceLocations.length, dispatch]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  function getGreeting() {
    const currTime = now.getHours();
    if (currTime < 12) return "Good Morning";
    if (currTime < 18) return "Good Afternoon";
    return "Good Evening";
  }

  function calculateAge(dob: string | null) {
    if (!dob) return "N/A";
    const diff = Date.now() - new Date(dob).getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  function canStartConsultation(appointment: TodayAppointment) {
    if (
      appointment.status === "COMPLETED" ||
      appointment.status === "CANCELLED" ||
      appointment.status === "NO_SHOW"
    ) {
      return false;
    }
    const start = new Date(appointment.start).getTime();
    const fiveMins = 5 * 60 * 1000;
    return now.getTime() >= start - fiveMins;
  }

  function formatTimeLeft(targetDate: string | null) {
    if (!targetDate) return "None";
    const diff = new Date(targetDate).getTime() - now.getTime();
    if (diff <= 0) return "Now";
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    if (hours > 0) return `${hours}h ${mins % 60}m`;
    return `${mins}m`;
  }

  if (isNewUser) {
    return (
      <div className="max-w-5xl mx-auto flex flex-col gap-6 px-4 lg:px-0">
        <div className="w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 sm:p-10 rounded-3xl flex flex-col gap-4 items-center justify-center shadow-sm">
          {onboardingStep === 0 && (
            <p className="font-bold text-xl sm:text-2xl text-gray-800 dark:text-white text-center">
              Your professional profile is not set up yet.
            </p>
          )}
          {onboardingStep > 0 && (
            <p className="font-bold text-xl sm:text-2xl text-gray-800 dark:text-white text-center">
              Your onboarding is {Math.floor((onboardingStep / 6) * 100)}%
              complete.
            </p>
          )}
          <p className="text-center text-sm sm:text-base text-gray-500 dark:text-slate-400 max-w-[600px] leading-relaxed">
            Patients can only view verified and complete doctor profiles.
            Complete onboarding to add your qualifications, specialization, and
            practice details.
          </p>
          <Link
            to="/doctor/onboarding"
            className="bg-darkGreen hover:bg-darkGreen/90 text-white px-6 py-2.5 sm:px-8 sm:py-3 rounded-xl font-semibold transition-all shadow-md mt-4 text-sm sm:text-base"
          >
            {onboardingStep === 0 ? "Start Onboarding" : "Continue Onboarding"}
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-darkGreen"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-4 md:gap-6 h-auto lg:h-[calc(100vh-80px)] lg:overflow-hidden p-4 sm:p-6 lg:p-0">
      {/* Header */}
      <div className="flex-shrink-0 w-full bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
            {getGreeting()}, Dr. {name}
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-slate-400 mt-0.5 sm:mt-1">
            Day Execution Console
          </p>
        </div>
        <div className="text-left sm:text-right">
          <div className="text-2xl sm:text-3xl font-mono font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-darkGreen" />
            {now.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-0.5 sm:mt-1">
            {now.toLocaleDateString([], {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-gray-500 dark:text-slate-400 text-xs sm:text-sm font-medium">
              Total Appointments
            </p>
            <p className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
              {schedule?.totalAppointments || 0}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-gray-500 dark:text-slate-400 text-xs sm:text-sm font-medium">
              Pending Today
            </p>
            <p className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
              {schedule?.pendingAppointments || 0}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex-shrink-0">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-gray-500 dark:text-slate-400 text-xs sm:text-sm font-medium truncate">
              Next Appointment In
            </p>
            <p className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white truncate">
              {formatTimeLeft(schedule?.nextAppointment || null)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:flex-1 lg:min-h-0 pb-4 lg:pb-2">
        {/* Left Column: Appointments */}
        <div className="lg:col-span-2 flex flex-col gap-4 lg:h-full lg:min-h-0">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white px-1 flex-shrink-0">
            Today's Queue
          </h2>
          {schedule?.appointments.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-gray-100 dark:border-slate-800 text-center text-gray-500 dark:text-slate-400 shadow-sm flex-1 min-h-[200px] flex items-center justify-center">
              No appointments scheduled for today.
            </div>
          ) : (
            <div className="flex-1 lg:overflow-y-auto flex flex-col gap-4 lg:min-h-0 pr-0 lg:pr-1 custom-scrollbar">
              {schedule?.appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-4 sm:gap-5 items-start hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3 sm:gap-4 flex-1 w-full">
                    <Avatar
                      src={apt.profileImageUrl}
                      alt={apt.patientName}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border border-gray-200 dark:border-slate-700 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-base sm:text-lg text-gray-800 dark:text-white truncate">
                        {apt.patientName}
                      </h3>
                      <div className="flex flex-wrap text-xs sm:text-sm text-gray-500 dark:text-slate-400 gap-x-2 sm:gap-x-3 gap-y-1 mt-1">
                        <span>{calculateAge(apt.dob)} yrs</span>
                        {apt.gender && (
                          <span className="capitalize">• {apt.gender}</span>
                        )}
                        {apt.bloodGroup && <span>• {apt.bloodGroup}</span>}
                        <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] sm:text-xs">
                          {new Date(apt.start).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm mt-2 text-gray-600 dark:text-slate-300 flex flex-col">
                        <span className="font-medium text-gray-700 dark:text-slate-200">Reason:</span>{" "}
                        <span
                          className={
                            expandedReasons.includes(apt.id)
                              ? ""
                              : "line-clamp-2"
                          }
                        >
                          {apt.reason}
                        </span>
                        {apt.reason.length > 40 && (
                          <button
                            onClick={() => toggleReason(apt.id)}
                            className="text-darkGreen dark:text-emerald-400 font-semibold text-xs hover:underline mt-0.5 self-end pr-2"
                          >
                            {expandedReasons.includes(apt.id)
                              ? "Show Less"
                              : "Show More"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-slate-800">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${apt.status === "COMPLETED"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : apt.status === "CANCELLED"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : apt.status === "IN_PROGRESS"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}
                    >
                      {apt.status}
                    </span>

                    {apt.mode === "online" ? (
                      <button
                        disabled={!canStartConsultation(apt)}
                        onClick={() =>
                          navigate(`/doctor/consultation/${apt.id}`)
                        }
                        className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-semibold transition-all w-auto sm:w-auto justify-center text-sm sm:text-base ${canStartConsultation(apt)
                          ? "bg-darkGreen text-white hover:bg-darkGreen/90 shadow-md hover:shadow-lg"
                          : "bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-slate-500 cursor-default"
                          }`}
                      >
                        {apt.status === "IN_PROGRESS" ? (
                          <>
                            <Play className="w-4 h-4" /> Rejoin
                          </>
                        ) : (
                          <>
                            <Video className="w-4 h-4" /> Start
                          </>
                        )}
                      </button>
                    ) : (
                      <button className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-semibold bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-400 w-auto sm:w-auto justify-center cursor-default text-sm sm:text-base">
                        {getIcon("clinic", "20px")} In-person
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Slots Timeline */}
        <div className="flex flex-col gap-4 lg:h-full lg:min-h-0">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white px-1 flex-shrink-0">
            Slots Timeline
          </h2>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-4 flex-1 lg:overflow-y-auto custom-scrollbar lg:min-h-0">
            {schedule?.slots.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-slate-400 text-center">
                No slots generated for today.
              </div>
            ) : (
              <div className="relative border-l-2 border-gray-100 dark:border-slate-800 ml-3 pl-4 space-y-4">
                {schedule?.slots
                  .sort(
                    (a, b) =>
                      new Date(a.start).getTime() - new Date(b.start).getTime(),
                  )
                  .map((slot) => {
                    const isPast = new Date(slot.end) < now;
                    return (
                      <div key={slot.id} className="relative">
                        {/* Timeline dot */}
                        <div
                          className={`absolute -left-[21px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${slot.isBooked ? "bg-amber-500" : "bg-green-500"
                            } ${isPast ? "opacity-50" : ""}`}
                        />

                        <div
                          className={`p-3 rounded-xl border ${slot.isBooked
                            ? "border-amber-100 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-900/10"
                            : "border-green-100 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10"
                            } ${isPast ? "opacity-50" : ""}`}
                        >
                          <div className="flex justify-between items-center">
                            <span
                              className={`font-mono text-sm font-semibold ${slot.isBooked
                                ? "text-amber-700 dark:text-amber-500"
                                : "text-green-700 dark:text-green-500"
                                }`}
                            >
                              {new Date(slot.start).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}{" "}
                              -{" "}
                              {new Date(slot.end).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${slot.isBooked
                                ? "bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200"
                                : "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200"
                                }`}
                            >
                              {slot.isBooked ? "Booked" : "Free"}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500 dark:text-slate-400">
                            {getIcon("clinic", "14px")}
                            <span className="truncate font-medium">
                              {practiceLocations.find(
                                (loc) => loc._id === slot.practiceLocationId
                              )?.name || "Unknown Location"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DHomePage;
