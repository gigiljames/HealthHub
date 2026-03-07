import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import DNavbar from "../../components/doctor/DNavbar";
import { getDoctorAppointmentById } from "../../api/doctor/appointmentService";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import getIcon from "../../helpers/getIcon";

interface LocationInfo {
  type: string;
  coordinates: number[];
  address: string;
  placeId: string;
}

interface PaymentInfo {
  _id: string;
  amount: number;
  currency: string;
  status: string;
  transactionId: string;
  createdAt: string;
}

interface AppointmentDetails {
  id: string;
  start: string;
  end: string;
  locationName: string;
  location: LocationInfo;
  mode: string;
  status: string;
  reason: string;
  patternName: string; // From the generic auth interface resolving
  patientName: string;
  dob: string;
  gender: string;
  payment: PaymentInfo | null;
}

function DViewAppointmentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState<AppointmentDetails | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAppointment() {
      try {
        if (!id) return;
        const data = await getDoctorAppointmentById(id);
        if (data.success && data.data) {
          setAppointment(data.data);
        } else {
          toast.error(data.message || "Failed to fetch appointment details");
          navigate("/doctor/appointments");
        }
      } catch (error) {
        toast.error("Error fetching appointment details");
        navigate("/doctor/appointments");
      } finally {
        setLoading(false);
      }
    }

    fetchAppointment();
  }, [id, navigate]);

  const getStatusBadgeClass = (status: string) => {
    switch (status.toUpperCase()) {
      case "CONFIRMED":
        return "bg-green-100 text-green-700 border-green-200";
      case "COMPLETED":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "CANCELLED":
        return "bg-red-100 text-red-700 border-red-200";
      case "NO_SHOW":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  const getPaymentBadgeClass = (status: string) => {
    switch (status.toUpperCase()) {
      case "SUCCESS":
      case "COMPLETED":
        return "bg-green-100 text-green-700 border-green-200";
      case "INITIATED":
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "FAILED":
        return "bg-red-100 text-red-700 border-red-200";
      case "REFUNDED":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <>
        <DNavbar />
        <div className="bg-[#F5F7FA] min-h-screen pt-[70px] flex justify-center items-center w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-darkGreen"></div>
        </div>
      </>
    );
  }

  if (!appointment) return null;

  return (
    <>
      <DNavbar />
      <div className="bg-[#F5F7FA] min-h-screen pt-[70px] flex justify-center w-full pb-10">
        <div className="w-[95%] lg:w-[80%] max-w-[1200px] flex flex-col gap-6 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/doctor/appointments")}
                className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 border border-gray-200 transition-colors"
              >
                {getIcon("left", "25px", "currentColor", "text-gray-600")}
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Appointment Details
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  ID: {appointment.id}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1.5 text-sm font-semibold rounded-full border ${getStatusBadgeClass(
                  appointment.status,
                )}`}
              >
                {appointment.status.replace("_", " ")}
              </span>
              <span className="px-3 py-1.5 text-sm font-semibold rounded-full border bg-gray-100 text-gray-700 border-gray-200 capitalize">
                {appointment.mode.replace("-", " ")} Mode
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (Main Details) */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Patient Info Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    {getIcon("user", "20px", "currentColor", "text-darkGreen")}
                    Patient Information
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Full Name</p>
                      <p className="font-semibold text-gray-800 text-lg">
                        {appointment.patientName || "Unknown"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Gender</p>
                      <p className="font-medium text-gray-800 capitalize">
                        {appointment.gender || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Age</p>
                      <p className="font-medium text-gray-800">
                        {appointment.dob
                          ? `${dayjs().diff(dayjs(appointment.dob), "year")} years old`
                          : "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Consultation Details Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    {getIcon(
                      "calendar",
                      "20px",
                      "currentColor",
                      "text-darkGreen",
                    )}
                    Consultation Details
                  </h2>
                </div>
                <div className="p-6 flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-green-50/50 border border-green-100">
                      <div className="p-3 bg-white rounded-lg shadow-sm text-darkGreen">
                        {getIcon("clock", "24px", "currentColor")}
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">
                          Schedule
                        </p>
                        <p className="font-semibold text-gray-800 mt-1">
                          {dayjs(appointment.start).format(
                            "dddd, MMMM D, YYYY",
                          )}
                        </p>
                        <p className="text-darkGreen font-medium text-sm mt-0.5">
                          {dayjs(appointment.start).format("h:mm A")} -{" "}
                          {dayjs(appointment.end).format("h:mm A")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                      <div className="p-3 bg-white rounded-lg shadow-sm text-blue-400">
                        {getIcon("location", "24px")}
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">
                          Location
                        </p>
                        <p className="font-semibold text-gray-800 mt-1">
                          {appointment.locationName || "Virtual / Online"}
                        </p>
                        {appointment.location?.address && (
                          <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                            {appointment.location.address}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-sm text-gray-500 mb-2 font-medium">
                      Reason for Visit
                    </p>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {appointment.reason ||
                        "No specific reason provided by the patient."}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (Payment & Actions) */}
            <div className="flex flex-col gap-6">
              {/* Payment Info Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    {getIcon(
                      "money-bill-wave",
                      "20px",
                      "currentColor",
                      "text-darkGreen",
                    )}
                    Payment Details
                  </h2>
                </div>
                <div className="p-6">
                  {appointment.payment ? (
                    <div className="flex flex-col gap-5">
                      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                        <span className="text-gray-500 text-sm">Status</span>
                        <span
                          className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getPaymentBadgeClass(
                            appointment.payment.status,
                          )}`}
                        >
                          {appointment.payment.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                        <span className="text-gray-500 text-sm">Amount</span>
                        <span className="font-bold text-gray-800 text-lg flex items-center gap-1">
                          {appointment.payment.amount.toLocaleString("en-IN", {
                            style: "currency",
                            currency: appointment.payment.currency || "INR",
                            maximumFractionDigits: 0,
                          })}
                        </span>
                      </div>
                      {/* <div className="flex flex-col gap-1">
                        <span className="text-gray-500 text-xs">
                          Transaction ID
                        </span>
                        <span className="font-mono text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-200 truncate">
                          {appointment.payment.transactionId || "N/A"}
                        </span>
                      </div> */}
                      <div className="flex flex-col gap-1 mt-1">
                        <span className="text-gray-500 text-xs">Paid On</span>
                        <span className="text-sm text-gray-700 font-medium">
                          {dayjs(appointment.payment.createdAt).format(
                            "MMM D, YYYY at h:mm A",
                          )}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                        {getIcon("file-invoice-dollar", "24px", "currentColor")}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          No Payment Info
                        </p>
                        <p className="text-xs text-gray-500 mt-1 max-w-[200px] mx-auto">
                          Payment details are not available or pending for this
                          appointment.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DViewAppointmentPage;
