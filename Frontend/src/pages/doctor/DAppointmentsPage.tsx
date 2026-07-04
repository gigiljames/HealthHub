import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { getDoctorAppointments } from "../../api/doctor/appointmentService";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { debounce } from "lodash";
import getIcon from "../../helpers/getIcon";

interface LocationInfo {
  type: string;
  coordinates: number[];
  address: string;
  placeId: string;
}

interface Appointment {
  id: string;
  start: string;
  end: string;
  locationName: string;
  location: LocationInfo;
  mode: string;
  status: string;
  patientName: string;
  dob: string;
  gender: string;
  reason: string;
}

function DAppointmentsPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination State
  const [tab, setTab] = useState("UPCOMING");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [mode, setMode] = useState(""); // "" | "online" | "in-person"
  const [timeRange, setTimeRange] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  // Debounced Search Handler
  const debouncedSearchHandler = useCallback(
    debounce((query: string) => setDebouncedSearch(query), 500),
    [],
  );

  useEffect(() => {
    debouncedSearchHandler(search);
    return () => debouncedSearchHandler.cancel();
  }, [search, debouncedSearchHandler]);

  // Fetch Appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = {
        tab,
        search: debouncedSearch,
        mode,
        timeRange,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sort,
        page,
        limit,
      };

      const data = await getDoctorAppointments(params);
      // console.log(data.appointments);
      if (data.success) {
        setAppointments(data.appointments);
        setTotalPages(data.totalPages);
      } else {
        toast.error(data.message || "Failed to fetch appointments");
      }
    } catch (error: any) {
      toast.error("Error fetching appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, debouncedSearch, mode, timeRange, startDate, endDate, sort, page]);

  // Handlers
  const handleTabChange = (newTab: string) => {
    setTab(newTab);
    setPage(1);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toUpperCase()) {
      case "CONFIRMED":
        return "bg-green-105 text-green-700 border-green-200";
      case "RESCHEDULE_PENDING":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "COMPLETED":
        return "bg-blue-105 text-blue-700 border-blue-200";
      case "CANCELLED":
      case "CANCELLED_BY_DOCTOR":
      case "CANCELLED_BY_USER":
        return "bg-red-100 text-red-700 border-red-200";
      case "NO_SHOW":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-yellow-105 text-yellow-700 border-yellow-200";
    }
  };

  return (
    <div className="flex justify-center w-full">
        <div className="w-[95%] lg:w-[90%] max-w-[1600px] flex flex-col gap-6 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800 ml-1">
              Appointments
            </h1>
          </div>

          <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col gap-6">
            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200 pb-2 overflow-x-auto nice-scroll">
              {["UPCOMING", "COMPLETED", "CANCELLED", "ALL"].map((t) => (
                <button
                  key={t}
                  onClick={() => handleTabChange(t === "ALL" ? "" : t)}
                  className={`px-4 py-2 font-medium text-sm rounded-t-md transition-colors ${
                    (tab === t && t !== "ALL") || (tab === "" && t === "ALL")
                      ? "text-darkGreen border-b-2 border-darkGreen"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg px-3 py-2">
                <span className="text-gray-400 mr-2">
                  {getIcon("search", "16px", "currentColor")}
                </span>
                <input
                  type="text"
                  placeholder="Search patient name..."
                  className="bg-transparent border-none outline-none w-full text-sm text-gray-700"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              <select
                className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-darkGreen"
                value={mode}
                onChange={(e) => {
                  setMode(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Modes</option>
                <option value="online">Online</option>
                <option value="in-person">In-Person</option>
              </select>

              <select
                className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-darkGreen"
                value={sort}
                onChange={(e) => setSort(e.target.value as "newest" | "oldest")}
              >
                <option value="newest">Sort: By Date (Desc)</option>
                <option value="oldest">Sort: By Date (Asc)</option>
              </select>

              <select
                className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-darkGreen"
                value={timeRange}
                onChange={(e) => {
                  setTimeRange(e.target.value);
                  setStartDate("");
                  setEndDate("");
                  setPage(1);
                }}
              >
                <option value="">Any Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="custom">Custom Date Range</option>
              </select>
            </div>

            {/* Custom Date Filters */}
            {timeRange === "custom" && (
              <div className="flex flex-col md:flex-row gap-4 items-center bg-gray-50 border border-gray-200 p-4 rounded-lg">
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <span className="text-sm font-medium text-gray-600">
                    From:
                  </span>
                  <input
                    type="date"
                    className="border border-gray-300 rounded p-1.5 text-sm flex-1 outline-none"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <span className="text-sm font-medium text-gray-600">To:</span>
                  <input
                    type="date"
                    className="border border-gray-300 rounded p-1.5 text-sm flex-1 outline-none"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setPage(1);
                    }}
                    min={startDate}
                  />
                </div>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-y border-gray-200 text-gray-600 text-sm">
                    <th className="py-3 px-4 font-semibold">Patient</th>
                    <th className="py-3 px-4 font-semibold">Date & Time</th>
                    <th className="py-3 px-4 font-semibold">Location</th>
                    <th className="py-3 px-4 font-semibold">Mode</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-8 text-center text-gray-500"
                      >
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-darkGreen mx-auto mb-2"></div>
                        Loading appointments...
                      </td>
                    </tr>
                  ) : appointments.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-8 text-center text-gray-500"
                      >
                        No appointments found.
                      </td>
                    </tr>
                  ) : (
                    appointments.map((apt) => (
                      <tr
                        key={apt.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() =>
                          navigate(`/doctor/appointments/${apt.id}`)
                        }
                      >
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-800">
                            {apt.patientName || "Unknown"}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {apt.gender} •{" "}
                            {apt.dob
                              ? dayjs().diff(dayjs(apt.dob), "year") + " yrs"
                              : "N/A"}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-gray-800">
                            {dayjs(apt.start).format("MMM D, YYYY")}
                          </p>
                          <p className="text-xs text-gray-500">
                            {dayjs(apt.start).format("h:mm A")} -{" "}
                            {dayjs(apt.end).format("h:mm A")}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {apt.locationName || "N/A"}
                        </td>
                        <td className="py-3 px-4">
                          <span className="capitalize text-sm font-medium text-gray-700">
                            {apt.mode}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeClass(
                              apt.status,
                            )}`}
                          >
                            {apt.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <p
                            className="text-sm text-gray-600 max-w-[200px] truncate"
                            title={apt.reason}
                          >
                            {apt.reason || "-"}
                          </p>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && appointments.length > 0 && (
              <div className="flex items-center justify-between border-t border-gray-200 pt-4 mt-2">
                <span className="text-sm text-gray-500">
                  Page{" "}
                  <span className="font-semibold text-gray-800">{page}</span> of{" "}
                  <span className="font-semibold text-gray-800">
                    {totalPages}
                  </span>
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page === totalPages || totalPages === 0}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
    </div>
  );
}

export default DAppointmentsPage;
