import { useEffect, useState } from "react";
import { doctorListReviews } from "../../api/reviewApi";
import toast from "react-hot-toast";
import getIcon from "../../helpers/getIcon";
import Avatar from "../../components/common/Avatar";
import { Star, Calendar, Filter, RefreshCw } from "lucide-react";
import dayjs from "dayjs";

interface Review {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  answers: {
    q1: string;
    q2: string;
    q3: string;
    q4: string;
    q5: string;
  };
  score: number;
  comment?: string;
  isAnonymous: boolean;
  createdAt: string;
  patientName?: string;
  patientProfileImage?: string;
}

function DReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [scoreRange, setScoreRange] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("all");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const limit = 6;

  const fetchReviews = async () => {
    try {
      setLoading(true);

      // Determine scoreMin & scoreMax
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

      // Determine startDate & endDate
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

      const res = await doctorListReviews({
        page,
        limit,
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
        toast.error("Failed to load reviews.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error loading reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page, scoreRange, timeRange, customStartDate, customEndDate]);

  const handleResetFilters = () => {
    setScoreRange("all");
    setTimeRange("all");
    setCustomStartDate("");
    setCustomEndDate("");
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-12 space-y-6 w-full font-sans">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Ratings & Reviews</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
            View and filter feedback submitted by your patients.
          </p>
        </div>
        {/* <button
          onClick={fetchReviews}
          className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 rounded-xl transition-all border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm cursor-pointer"
          title="Refresh list"
        >
          <RefreshCw className="w-4 h-4" />
        </button> */}
      </div>

      {/* Dashboard Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 dark:bg-amber-500/5 rounded-xl border border-amber-500/20 text-amber-500">
            <Star className="w-6 h-6 fill-amber-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Total Submissions</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1.5 leading-none">{totalReviews}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-xl border border-emerald-500/20 text-emerald-500">
            <Star className="w-6 h-6 fill-emerald-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">High Ratings (&gt;=70%)</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1.5 leading-none">
              {reviews.filter((r) => r.score >= 70).length} reviews
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 dark:bg-rose-500/5 rounded-xl border border-rose-500/20 text-rose-500">
            <Star className="w-6 h-6 fill-rose-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Attention Needed (&lt;50%)</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1.5 leading-none">
              {reviews.filter((r) => r.score < 50).length} reviews
            </h3>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800/80 p-6 flex flex-col gap-6">

        {/* Filters Area */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <Filter className="w-4 h-4 text-slate-455" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Search & Filter</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Rating filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Experience Rating</label>
              <select
                value={scoreRange}
                onChange={(e) => {
                  setScoreRange(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500"
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
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date Period</label>
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
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="all">All Time</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="custom">Custom Date Range</option>
              </select>
            </div>

            {/* Custom Date Filters */}
            {timeRange === "custom" && (
              <>
                <div className="flex flex-col gap-1.5 animate-in slide-in-from-left duration-200">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start Date</label>
                  <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
                    <Calendar className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => {
                        setCustomStartDate(e.target.value);
                        setPage(1);
                      }}
                      className="bg-transparent border-none outline-none w-full text-sm text-slate-700 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 animate-in slide-in-from-left duration-200">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">End Date</label>
                  <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
                    <Calendar className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => {
                        setCustomEndDate(e.target.value);
                        setPage(1);
                      }}
                      min={customStartDate}
                      className="bg-transparent border-none outline-none w-full text-sm text-slate-700 dark:text-slate-200"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Reset Filters button */}
            <div className="flex flex-col justify-end">
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full py-2.5 border border-slate-250 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-bold text-xs text-slate-705 dark:text-slate-300 transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset All</span>
              </button>
            </div>

          </div>
        </div>

        {/* Reviews Grid List */}
        <div className="min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <svg className="animate-spin h-10 w-10 text-emerald-500 mb-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <p className="text-slate-550 dark:text-slate-400 text-sm font-semibold">Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-250 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/10">
              <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm">No reviews found matching filters.</p>
              <button
                onClick={handleResetFilters}
                className="mt-3 px-4 py-2 bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-955 rounded-xl font-bold text-xs hover:scale-[1.01] active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-slate-50/30 dark:bg-slate-805/10 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl flex flex-col gap-4 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={rev.patientProfileImage}
                        alt={rev.patientName || "Patient"}
                        className="w-11 h-11 rounded-full border border-slate-200 dark:border-slate-750 object-cover shadow-sm"
                      />
                      <div>
                        <h4 className="text-sm font-black text-slate-800 dark:text-slate-200">
                          {rev.patientName}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
                          {dayjs(rev.createdAt).format("MMM DD, YYYY")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 px-2.5 py-1 rounded-xl">
                      <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                        {rev.score}%
                      </span>
                    </div>
                  </div>

                  {/* Question Answers Details Box */}
                  <div className="grid grid-cols-5 gap-1.5 py-2.5 px-3 bg-slate-100/50 dark:bg-slate-800/30 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                    {[
                      { val: rev.answers.q1, lbl: "Listened" },
                      { val: rev.answers.q2, lbl: "Expl" },
                      { val: rev.answers.q3, lbl: "Time" },
                      { val: rev.answers.q4, lbl: "Conf" },
                      { val: rev.answers.q5, lbl: "Prof" },
                    ].map((ans, i) => (
                      <div key={i} className="text-center">
                        <p className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">{ans.lbl}</p>
                        <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300 block truncate" title={ans.val}>{ans.val}</span>
                      </div>
                    ))}
                  </div>

                  {rev.comment ? (
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-350 leading-relaxed italic flex-1">
                      "{rev.comment}"
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 dark:text-slate-500 italic flex-1">
                      No written comments provided.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {!loading && reviews.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
            <span className="text-xs font-bold text-slate-455 dark:text-slate-400">
              Showing page <span className="text-slate-800 dark:text-white font-extrabold">{page}</span> of{" "}
              <span className="text-slate-800 dark:text-white font-extrabold">{totalPages}</span> ({totalReviews} total reviews)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3.5 py-1.5 border border-slate-250 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-sm"
              >
                Previous
              </button>
              <button
                disabled={page === totalPages || totalPages === 0}
                onClick={() => setPage((p) => p + 1)}
                className="px-3.5 py-1.5 border border-slate-250 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>
    </div>

  );
}

export default DReviewsPage;
