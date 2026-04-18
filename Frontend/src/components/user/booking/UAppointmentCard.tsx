import React from "react";
import { Link } from "react-router";
import getIcon from "../../../helpers/getIcon";
import Avatar from "../../common/Avatar";

interface UAppointmentCardProps {
  appointment: any;
}

const statusColors: Record<string, string> = {
  PENDING_PAYMENT:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  CONFIRMED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  COMPLETED:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
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
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-sm shadow-sm transition-all duration-200 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
      {/* Date Box */}
      <div className="flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:min-w-[80px] sm:pr-6 sm:border-r border-gray-200 dark:border-gray-800">
        <div className="flex sm:flex-col items-center justify-center gap-3 sm:gap-0 flex-row-reverse">
          <span className="uppercase text-sm font-bold lg:text-base">
            {month}
          </span>
          <span className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white leading-none">
            {dayOfMonth}
          </span>
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest sm:mt-1">
            {dayOfWeek}
          </span>
        </div>
      </div>

      <div>
        <Avatar
          src={doctor?.profileImageUrl}
          alt="Doctor avatar"
          className="h-15 w-15 sm:h-30 sm:w-30 rounded-full object-cover border border-gray-200 dark:border-gray-700 shadow-sm"
        />
      </div>

      <div className="flex-1 flex flex-col gap-3 py-1 border-t sm:border-none border-gray-100 dark:border-gray-800 pt-3 sm:pt-0">
        <p className="text-base font-semibold text-gray-900 dark:text-white truncate">
          Consultation with
          <span className="font-bold text-lg"> Dr.{doctor.name ?? "-"}</span>
          {doctor.specialization ? ` (${doctor.specialization})` : ""}
        </p>
        {/* Time & Mode Box */}
        <div className="flex flex-col gap-1.5 sm:min-w-[150px]">
          <div className="flex flex-row items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <span className="text-gray-400">{getIcon("clock", "16px")}</span>
            {formattedTimeStart} - {formattedTimeEnd}
          </div>
          <div className="flex flex-row items-center gap-2 text-sm text-gray-500 font-medium">
            <span className="text-gray-400">{getIcon("location", "16px")}</span>
            {slot.mode ? slot.mode.replace("_", " ") : "Online"}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {appointment.status && (
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${statusColor}`}
            >
              {appointment.status.replace(/_/g, " ")}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center pt-2 sm:pt-0 sm:min-w-[120px] justify-end">
        <Link
          to={`/appointments/${appointment._id}`}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all w-full sm:w-auto shadow-sm"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default UAppointmentCard;
