import React from "react";
import { Link } from "react-router";
import getIcon from "../../../helpers/getIcon";
import Avatar from "../../common/Avatar";

interface UAppointmentCardProps {
  appointment: any;
}

const statusColors: Record<string, string> = {
  PENDING_PAYMENT:
    "bg-yellow-105 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  CONFIRMED: "bg-blue-105 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  IN_PROGRESS: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 animate-pulse font-bold",
  RESCHEDULE_PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  COMPLETED:
    "bg-green-105 text-green-808 dark:bg-green-905/30 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  CANCELLED_BY_USER: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  CANCELLED_BY_DOCTOR: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  NO_SHOW: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
};

const UAppointmentCard: React.FC<UAppointmentCardProps> = ({ appointment }) => {
  const doctor = appointment.doctorProfile || {};
  const slot = appointment.slot || {};
  const statusColor =
    statusColors[appointment.status] ||
    "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";

  const slotStart = slot.start ? new Date(slot.start) : null;
  const slotEnd = slot.end
    ? new Date(slot.end)
    : slotStart
      ? new Date(slotStart.getTime() + 30 * 60000)
      : null;

  const dayOfWeek = slotStart
    ? slotStart.toLocaleDateString("en-US", { weekday: "short" })
    : "—";
  const dayOfMonth = slotStart
    ? slotStart.toLocaleDateString("en-US", { day: "2-digit" })
    : "—";
  const month = slotStart
    ? slotStart.toLocaleDateString("en-US", { month: "short" })
    : "-";

  const formattedTimeStart = slotStart
    ? slotStart.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "—";

  const formattedTimeEnd = slotEnd
    ? slotEnd.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "—";

  return (
    <div className="bg-white dark:bg-gray-900 rounded-none sm:rounded-2xl border-y sm:border border-gray-100 dark:border-gray-800 p-4 sm:p-5 hover:shadow-sm shadow-sm transition-all duration-200 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
      {/* Date Box */}
      <div className="flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:min-w-[85px] sm:pr-6 sm:border-r border-gray-200 dark:border-gray-800 w-full sm:w-auto">
        <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-2 sm:gap-0 flex-row w-full sm:w-auto">
          <span className="uppercase text-xs sm:text-sm font-bold lg:text-base">
            {month}
          </span>
          <span className="text-xl sm:text-4xl font-extrabold text-gray-900 dark:text-white leading-none ml-2 sm:ml-0">
            {dayOfMonth}
          </span>
          <span className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest sm:mt-1 ml-auto sm:ml-0">
            {dayOfWeek}
          </span>
        </div>
      </div>

      {/* Avatar and Info Block */}
      <div className="flex items-center gap-4 flex-1 min-w-0 border-t sm:border-none border-gray-100 dark:border-gray-800/80 pt-3 sm:pt-0">
        <Avatar
          src={doctor?.profileImageUrl}
          alt="Doctor avatar"
          className="h-14 w-14 sm:h-16 sm:w-16 rounded-full object-cover border border-gray-250 dark:border-gray-700 shadow-sm flex-shrink-0"
        />
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-[11px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400">
            Consultation with
          </p>
          <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate">
            Dr. {doctor.name ?? "-"}
            {doctor.specialization ? <span className="font-semibold text-xs text-emerald-600 dark:text-emerald-400 ml-1.5">({doctor.specialization})</span> : ""}
          </h3>

          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-0.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
              <span className="text-gray-400">{getIcon("clock", "14px")}</span>
              <span>{formattedTimeStart} - {formattedTimeEnd}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <span className="text-gray-400">{getIcon("location", "14px")}</span>
              <span className="capitalize">{slot.mode ? slot.mode.replace("_", " ") : "Online"}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            {appointment.status && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${statusColor}`}
              >
                {appointment.status.replace(/_/g, " ")}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center pt-1.5 sm:pt-0 sm:min-w-[120px] justify-end w-full sm:w-auto">
        <Link
          to={`/appointments/${appointment._id}`}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all w-full sm:w-auto shadow-sm cursor-pointer"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default UAppointmentCard;
