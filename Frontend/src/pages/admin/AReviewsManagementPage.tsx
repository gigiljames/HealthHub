import { useEffect, useState } from "react";
import AMobileSidebar from "../../components/admin/AMobileSidebar";
import ASidebar from "../../components/admin/ASidebar";
import { adminListReviews, adminDeleteReview } from "../../api/reviewApi";
import toast from "react-hot-toast";
import { Star, Trash2, Mail, ShieldAlert, User, Clock } from "lucide-react";
import dayjs from "dayjs";
import ConfirmationModal from "../../components/common/ConfirmationModal";

interface Review {
  id: string;
  appointmentId: string;
  score: number;
  comment?: string;
  isAnonymous: boolean;
  createdAt: string;
  answers: {
    q1: string;
    q2: string;
    q3: string;
    q4: string;
    q5: string;
  };
  patient: {
    id: string;
    name: string;
    email: string;
  };
  doctor: {
    id: string;
    name: string;
  };
}

function AReviewsManagementPage() {
  document.title = "Reviews Management";

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const limit = 8;

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [patientName, setPatientName] = useState("");
  const [scoreRange, setScoreRange] = useState("all");
  const [timeRange, setTimeRange] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // Debounced search & filter state
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debouncedDoctorName, setDebouncedDoctorName] = useState("");
  const [debouncedPatientName, setDebouncedPatientName] = useState("");

  // Confirmation modal state
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setDebouncedDoctorName(doctorName);
      setDebouncedPatientName(patientName);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, doctorName, patientName]);

  const handleResetFilters = () => {
    setSearch("");
    setDoctorName("");
    setPatientName("");
    setScoreRange("all");
    setTimeRange("all");
    setCustomStartDate("");
    setCustomEndDate("");
    setPage(1);
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);

      // Score ranges
      let scoreMin: number | undefined;
      let scoreMax: number | undefined;
      if (scoreRange === "excellent") {
        scoreMin = 90;
        scoreMax = 100;
      } else if (scoreRange === "good") {
        scoreMin = 70;
        scoreMax = 89;
      } else if (scoreRange === "average") {
        scoreMin = 50;
        scoreMax = 69;
      } else if (scoreRange === "poor") {
        scoreMin = 0;
        scoreMax = 49;
      }

      // Time range
      let startDate: string | undefined;
      let endDate: string | undefined;
      const today = dayjs();
      if (timeRange === "7days") {
        startDate = today.subtract(7, "day").format("YYYY-MM-DD");
        endDate = today.format("YYYY-MM-DD");
      } else if (timeRange === "30days") {
        startDate = today.subtract(30, "day").format("YYYY-MM-DD");
        endDate = today.format("YYYY-MM-DD");
      } else if (timeRange === "custom") {
        if (customStartDate) startDate = customStartDate;
        if (customEndDate) endDate = customEndDate;
      }

      const res = await adminListReviews({
        page,
        limit,
        search: debouncedSearch || undefined,
        doctorName: debouncedDoctorName || undefined,
        patientName: debouncedPatientName || undefined,
        scoreMin,
        scoreMax,
        startDate,
        endDate,
      });

      if (res.success && res.data) {
        setReviews(res.data.reviews || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalReviews(res.data.total || 0);
      } else {
        toast.error("Failed to load reviews list.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error fetching reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page, debouncedSearch, debouncedDoctorName, debouncedPatientName, scoreRange, timeRange, customStartDate, customEndDate]);

  const handleDelete = (reviewId: string) => {
    setReviewToDelete(reviewId);
  };

  const confirmDelete = async () => {
    if (!reviewToDelete) return;
    try {
      await adminDeleteReview(reviewToDelete);
      toast.success("Review deleted successfully.");
      // Refresh list or decrement page if empty
      if (reviews.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        fetchReviews();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete review.");
    } finally {
      setReviewToDelete(null);
    }
  };

  return (
    <>
      <AMobileSidebar page="reviews" />
      <div className="flex w-full flex-col lg:flex-row min-h-screen bg-[#f3f4f6] dark:bg-[#1a1c23]">
        <ASidebar page="reviews" />
        <div className="w-screen lg:flex-1 relative">
          <div className="flex flex-col gap-4 p-4 md:p-6 h-screen overflow-y-auto min-h-screen text-gray-800 dark:text-gray-200 transition-colors duration-205 w-full pb-10">

            {/* Page Header */}
            <div className="flex justify-between items-center border-b border-gray-250 dark:border-gray-850 pb-4 mb-2">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                  <Star className="w-7 h-7 fill-amber-400 text-amber-400" />
                  <span>Reviews Management</span>
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage patient experience score ratings, comments, and commenter identities.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-4 py-2 rounded-xl shadow-sm text-center">
                <span className="text-xs font-bold text-gray-400 uppercase block tracking-wider leading-none">Total Reviews</span>
                <span className="text-xl font-black text-gray-800 dark:text-white mt-1.5 block leading-none">{totalReviews}</span>
              </div>
            </div>

            {/* Search & Filters Panel */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 p-5 rounded-3xl shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Search & Filter Controls</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {/* Search Comment Content */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Search Content</label>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search comments..."
                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-750 dark:text-gray-200 outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Filter by Doctor Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Doctor Name</label>
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="Search doctor..."
                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-755 dark:text-gray-200 outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Filter by Patient Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Patient Name</label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Search patient..."
                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-755 dark:text-gray-200 outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Filter by Experience Rating */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Experience Rating</label>
                  <select
                    value={scoreRange}
                    onChange={(e) => {
                      setScoreRange(e.target.value);
                      setPage(1);
                    }}
                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-700 dark:text-gray-200 outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="all">All Scores</option>
                    <option value="excellent">Excellent (90% - 100%)</option>
                    <option value="good">Good (70% - 89%)</option>
                    <option value="average">Average (50% - 69%)</option>
                    <option value="poor">Poor (Below 50%)</option>
                  </select>
                </div>

                {/* Time Range Filter */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Date Period</label>
                  <select
                    value={timeRange}
                    onChange={(e) => {
                      setTimeRange(e.target.value);
                      if (e.target.value !== "custom") {
                        setCustomStartDate("");
                        setCustomEndDate("");
                      }
                      setPage(1);
                    }}
                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-700 dark:text-gray-200 outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="all">All Time</option>
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                    <option value="custom">Custom Date Range</option>
                  </select>
                </div>

                {/* Reset Filters button */}
                <div className="flex flex-col justify-end">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="w-full py-2 border border-gray-250 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl font-bold text-xs text-gray-700 dark:text-gray-300 transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Reset All</span>
                  </button>
                </div>
              </div>

              {/* Custom Date Filters */}
              {timeRange === "custom" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-left duration-200 border-t border-gray-100 dark:border-gray-800 pt-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Start Date</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => {
                        setCustomStartDate(e.target.value);
                        setPage(1);
                      }}
                      className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-700 dark:text-gray-200"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">End Date</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => {
                        setCustomEndDate(e.target.value);
                        setPage(1);
                      }}
                      min={customStartDate}
                      className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-700 dark:text-gray-200"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Main Area */}
            <div className="w-full mt-2 flex-1 flex flex-col">
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20">
                  <svg className="animate-spin h-10 w-10 text-emerald-500 mb-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <p className="text-sm font-semibold text-gray-500">Loading feedback records...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 border border-dashed border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl p-6">
                  <p className="text-gray-550 dark:text-gray-400 font-semibold text-sm">
                    {search || doctorName || patientName || scoreRange !== "all" || timeRange !== "all"
                      ? "No reviews found matching the filters."
                      : "No patient reviews exist in the system."}
                  </p>
                  {(search || doctorName || patientName || scoreRange !== "all" || timeRange !== "all") && (
                    <button
                      onClick={handleResetFilters}
                      className="mt-3 px-4 py-2 bg-emerald-500 text-white dark:text-slate-955 rounded-xl font-bold text-xs hover:scale-[1.01] active:scale-95 transition-all shadow-sm cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800/80 p-6 rounded-3xl flex flex-col gap-4 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden"
                      >
                        {/* Upper Details Row */}
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="p-1 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-500 shrink-0">
                                <User className="w-3.5 h-3.5" />
                              </span>
                              <h4 className="text-sm font-bold text-gray-850 dark:text-gray-150 leading-tight">
                                {rev.patient?.name || "Unknown Patient"}
                              </h4>
                              {rev.isAnonymous && (
                                <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                  <ShieldAlert className="w-2.5 h-2.5" />
                                  <span>Anonymous to Doctor</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-gray-400 pl-7 leading-none">
                              <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="truncate max-w-[200px]" title={rev.patient?.email}>
                                {rev.patient?.email || "No email available"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 px-2.5 py-1 rounded-xl">
                              <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                                {rev.score}%
                              </span>
                            </div>
                            <button
                              onClick={() => handleDelete(rev.id)}
                              className="p-2 bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white rounded-xl transition-all cursor-pointer border border-transparent border-red-500/10"
                              title="Delete Review"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <hr className="border-t border-gray-100 dark:border-gray-800/80" />

                        {/* Middle Details (Doctor & Date) */}
                        <div className="flex flex-wrap items-center justify-between text-[11px] font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/20 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800/60">
                          <span>Doctor: <span className="text-slate-800 dark:text-white font-extrabold">Dr. {rev.doctor?.name || "Unknown"}</span></span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span>
                              {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </span>
                        </div>

                        {/* Questionnaire breakdown */}
                        <div className="grid grid-cols-5 gap-1.5 py-2 px-2.5 bg-gray-50/50 dark:bg-gray-850/10 rounded-xl border border-gray-100/60 dark:border-gray-800/40 text-center">
                          {[
                            { val: rev.answers?.q1, lbl: "Listened" },
                            { val: rev.answers?.q2, lbl: "Expl" },
                            { val: rev.answers?.q3, lbl: "Time" },
                            { val: rev.answers?.q4, lbl: "Conf" },
                            { val: rev.answers?.q5, lbl: "Prof" },
                          ].map((ans, idx) => (
                            <div key={idx}>
                              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wide leading-none mb-1">{ans.lbl}</p>
                              <span className="text-[9px] font-bold text-gray-800 dark:text-gray-300 block truncate" title={ans.val}>{ans.val || "-"}</span>
                            </div>
                          ))}
                        </div>

                        {/* Comment text */}
                        <div className="flex-1 mt-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Written Review</p>
                          {rev.comment ? (
                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 leading-relaxed italic">
                              "{rev.comment}"
                            </p>
                          ) : (
                            <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                              No comments provided.
                            </p>
                          )}
                        </div>

                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 pt-4 mt-2">
                      <span className="text-xs font-bold text-gray-500">
                        Page <span className="text-gray-800 dark:text-white font-extrabold">{page}</span> of{" "}
                        <span className="text-gray-800 dark:text-white font-extrabold">{totalPages}</span> ({totalReviews} total reviews)
                      </span>
                      <div className="flex gap-2">
                        <button
                          disabled={page === 1}
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          className="px-3.5 py-1.5 border border-gray-250 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-850 rounded-lg text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-sm bg-white dark:bg-gray-900"
                        >
                          Previous
                        </button>
                        <button
                          disabled={page === totalPages || totalPages === 0}
                          onClick={() => setPage((p) => p + 1)}
                          className="px-3.5 py-1.5 border border-gray-250 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-850 rounded-lg text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-sm bg-white dark:bg-gray-900"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!reviewToDelete}
        onClose={() => setReviewToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone and will update the doctor's average rating cached scores."
        confirmText="Delete"
        isDestructive={true}
      />
    </>
  );
}

export default AReviewsManagementPage;
