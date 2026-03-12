import React from "react";
import { Link } from "react-router";

interface UAppointmentCardProps {
  appointment: any;
}

const statusColors: Record<string, string> = {
  PENDING_PAYMENT: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  NO_SHOW: "bg-gray-100 text-gray-800",
};

const UAppointmentCard: React.FC<UAppointmentCardProps> = ({ appointment }) => {
  // Field paths from the MongoDB aggregation ($lookup) response
  const doctor = appointment.doctorProfile || {};
  const slot = appointment.slot || {};
  const statusColor =
    statusColors[appointment.status] || "bg-gray-100 text-gray-800";

  const slotStart = slot.start ? new Date(slot.start) : null;
  const formattedDate = slotStart
    ? slotStart.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";
  const formattedTime = slotStart
    ? slotStart.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "—";

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        {/* Doctor Avatar */}
        <div className="flex-shrink-0">
          <img
            src={
              doctor.profileImageUrl ||
              "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
            }
            alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
            className="h-16 w-16 rounded-full object-cover border border-gray-200"
          />
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-gray-900 dark:text-white truncate">
            Dr. {doctor.name || "—"}
          </p>
          <p className="text-sm text-gray-500 truncate">
            {doctor.specialization || "General Physician"}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {formattedDate} at {formattedTime}
            {slot.mode ? (
              <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full px-2 py-0.5">
                {slot.mode.replace("_", " ")}
              </span>
            ) : null}
          </p>
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}
            >
              {appointment.status.replace(/_/g, " ")}
            </span>
            {appointment.reason && (
              <span
                className="text-xs text-gray-500 truncate max-w-xs"
                title={appointment.reason}
              >
                • {appointment.reason}
              </span>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="flex-shrink-0">
          <Link
            to={`/appointments/${appointment._id}`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-darkGreen hover:bg-darkGreen/90 transition-all"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UAppointmentCard;
