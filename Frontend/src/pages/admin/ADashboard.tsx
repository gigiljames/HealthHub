import { useEffect, useState } from "react";
import ASidebar from "../../components/admin/ASidebar";
import {
  Users,
  Stethoscope,
  Building2,
  Calendar,
  CreditCard,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  Target,
  Clock,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { motion } from "framer-motion";
import { getDashboardStats } from "../../api/admin/adminDashboardService";
import { type AdminDashboardDTO, TimePeriod } from "../../types/adminDashboard";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router";

const COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

function ADashboard() {
  document.title = "Admin Dashboard | HealthHub";
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminDashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<TimePeriod>(TimePeriod.DAILY);
  const [page, setPage] = useState(1);

  const fetchStats = async (period: TimePeriod, page: number) => {
    setLoading(true);
    try {
      const data = await getDashboardStats(period, page);
      setStats(data);
    } catch (error: any) {
      toast.error("Failed to fetch dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(period, page);
  }, [period, page]);

  const handlePeriodChange = (newPeriod: TimePeriod) => {
    setPeriod(newPeriod);
    setPage(1);
  };

  const handleOlderData = () => {
    if (stats?.pagination.hasNextPage) {
      setPage((prev) => prev + 1);
    }
  };

  const handleNewerData = () => {
    if (stats?.pagination.hasPrevPage) {
      setPage((prev) => Math.max(1, prev - 1));
    }
  };

  if (!stats && loading) {
    return (
      <div className="flex w-full min-h-screen bg-gray-50 dark:bg-slate-900">
        <ASidebar page="dashboard" />
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <RefreshCcw className="w-10 h-10 text-emerald-500" />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <ASidebar page="dashboard" />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Admin Analytics
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {stats?.pagination.startDate
                ? new Date(stats.pagination.startDate).toLocaleDateString()
                : ""}{" "}
              -{" "}
              {stats?.pagination.endDate
                ? new Date(stats.pagination.endDate).toLocaleDateString()
                : ""}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              {Object.values(TimePeriod).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePeriodChange(p)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    period === p
                      ? "bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center gap-2">
              <button
                disabled={!stats?.pagination.hasNextPage}
                onClick={handleOlderData}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 disabled:opacity-50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium min-w-[60px] text-center">
                Page {page}
              </span>
              <button
                disabled={!stats?.pagination.hasPrevPage}
                onClick={handleNewerData}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 disabled:opacity-50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => fetchStats(period, page)}
              className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800/40 transition-colors"
            >
              <RefreshCcw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </header>

        {/* scrollable content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-8 pb-20 scroll-smooth">
          {/* USER SECTION */}
          <section id="users" className="space-y-6">
            <div className="flex items-center gap-2 border-l-4 border-emerald-500 pl-4">
              <Users className="w-6 h-6 text-emerald-500" />
              <h2 className="text-xl font-bold">User Ecosystem</h2>
            </div>

            {/* Primary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Total Patients"
                value={stats?.users.totalPatients}
                icon={<Target className="w-5 h-5 text-emerald-600" />}
                color="emerald"
                onManage={() => navigate("/admin/users")}
              />
              <StatCard
                title="Total Doctors"
                value={stats?.users.totalDoctors}
                icon={<Stethoscope className="w-5 h-5 text-blue-600" />}
                color="blue"
                onManage={() => navigate("/admin/doctors")}
              />
              <StatCard
                title="Total Organizations"
                value={stats?.users.totalOrganizations}
                icon={<Building2 className="w-5 h-5 text-amber-600" />}
                color="amber"
                onManage={() => navigate("/admin/organizations")}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Registration Trend Chart */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    New Registrations
                  </h3>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats?.users.registrationTrend}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e2e8f0"
                      />
                      <XAxis
                        dataKey="label"
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "none",
                          borderRadius: "12px",
                          color: "#fff",
                        }}
                        itemStyle={{ color: "#fff" }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="patients"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="doctors"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="organizations"
                        stroke="#f59e0b"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Specialization Distribution */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-blue-500" />
                    Specializations
                  </h3>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats?.users.specializationStats.slice(0, 5)}
                      layout="vertical"
                    >
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        stroke="#94a3b8"
                        fontSize={12}
                        width={100}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip />
                      <Bar
                        dataKey="count"
                        fill="#3b82f6"
                        radius={[0, 4, 4, 0]}
                        barSize={20}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Demographics row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DemographicBox
                title="Patient Gender"
                data={stats?.users.patientGenderDemographics}
              />
              <DemographicBox
                title="Doctor Gender"
                data={stats?.users.doctorGenderDemographics}
              />
              <DemographicBox
                title="Patient Age Groups"
                data={stats?.users.patientAgeDemographics}
              />
              <DemographicBox
                title="Doctor Age Groups"
                data={stats?.users.doctorAgeDemographics}
              />
            </div>
          </section>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* APPOINTMENT SECTION */}
          <section id="appointments" className="space-y-6">
            <div className="flex items-center gap-2 border-l-4 border-indigo-500 pl-4">
              <Calendar className="w-6 h-6 text-indigo-500" />
              <h2 className="text-xl font-bold">Appointment Workflow</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Appointments"
                value={stats?.appointments.totalBooked}
                sub={stats?.pagination.startDate ? "In current period" : ""}
                color="indigo"
              />
              <MetricCard
                title="Completion Rate"
                value={`${stats?.appointments.completionRate.toFixed(1)}%`}
                sub={`${stats?.appointments.totalCompleted} Completed`}
                color="emerald"
              />
              <MetricCard
                title="Cancellation Rate"
                value={`${stats?.appointments.cancellationRate.toFixed(1)}%`}
                sub={`${stats?.appointments.totalCancelled} Cancelled`}
                color="rose"
              />
              <MetricCard
                icon={<Clock className="w-4 h-4" />}
                title="Avg Duration"
                value={`${stats?.appointments.averageDuration.toFixed(0)} min`}
                sub="Consultation time"
                color="blue"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-500" />
                  Appointment volume
                </h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats?.appointments.appointmentTrend}>
                      <defs>
                        <linearGradient
                          id="colorTotal"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#6366f1"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#6366f1"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e2e8f0"
                      />
                      <XAxis
                        dataKey="label"
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#6366f1"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorTotal)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold mb-6">Consultation Mode</h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats?.appointments.modeDistribution}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="label"
                      >
                        {stats?.appointments.modeDistribution.map(
                          (entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ),
                        )}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" align="center" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {stats?.appointments.modeDistribution.map((m, i) => (
                    <div key={m.label} className="flex justify-between text-sm">
                      <span className="text-slate-500">{m.label}</span>
                      <span className="font-bold">
                        {m.count} ({m.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* FINANCE SECTION */}
          <section id="finance" className="space-y-6">
            <div className="flex items-center gap-2 border-l-4 border-amber-500 pl-4">
              <CreditCard className="w-6 h-6 text-amber-500" />
              <h2 className="text-xl font-bold">Financial Performance</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Revenue"
                value={`₹${stats?.finance.totalRevenue.toLocaleString()}`}
                sub="Gross earnings"
                color="amber"
              />
              <MetricCard
                title="Avg Rev / User"
                value={`₹${stats?.finance.averageRevenuePerUser.toFixed(0)}`}
                sub="Lifetime Value"
                color="emerald"
              />
              <MetricCard
                title="Paid to Doctors"
                value={`₹${stats?.finance.doctorPayoutsAmount.toLocaleString()}`}
                sub={`${stats?.finance.doctorPayoutsCount} Transfers`}
                color="blue"
              />
              <MetricCard
                title="Pending Payouts"
                value={`₹${stats?.finance.pendingPayoutsAmount.toLocaleString()}`}
                sub={`${stats?.finance.pendingPayoutsCount} Batches`}
                color="rose"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-500" />
                  Revenue Growth
                </h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats?.finance.revenueTrend}>
                      <defs>
                        <linearGradient
                          id="colorRevenue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#f59e0b"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#f59e0b"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e2e8f0"
                      />
                      <XAxis
                        dataKey="label"
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        formatter={(value: any) => `₹${value.toLocaleString()}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#f59e0b"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-2xl shadow-lg text-white flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-white/80 uppercase text-xs tracking-wider mb-1">
                    Company Wallet
                  </h3>
                  <div className="text-4xl font-black mb-2">
                    ₹{stats?.finance.adminWalletBalance.toLocaleString()}
                  </div>
                  <p className="text-white/60 text-sm">
                    Available balance for operations
                  </p>
                </div>

                <div className="space-y-4 mt-8">
                  <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10">
                    <div className="text-xs text-white/70">Efficiency</div>
                    <div className="flex justify-between items-end">
                      <div className="text-xl font-bold">92.4%</div>
                      <div className="text-xs flex items-center text-emerald-300">
                        <TrendingUp className="w-3 h-3 mr-1" /> +2.4%
                      </div>
                    </div>
                  </div>
                  <button className="w-full bg-white text-orange-600 font-bold py-3 rounded-xl hover:bg-orange-50 transition-all shadow-lg active:scale-95">
                    Withdraw Funds
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, onManage }: any) {
  const colorMap: any = {
    emerald:
      "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-100 dark:border-emerald-800",
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-100 dark:border-blue-800",
    amber:
      "bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-100 dark:border-amber-800",
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`p-6 rounded-2xl border shadow-sm ${colorMap[color]} flex flex-col gap-4 relative overflow-hidden group`}
    >
      <div className="flex justify-between items-start">
        <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-current opacity-70">
          {icon}
        </div>
        <button
          onClick={onManage}
          className="text-xs font-bold uppercase tracking-widest hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Manage
        </button>
      </div>
      <div>
        <p className="text-xs font-bold opacity-60 uppercase tracking-wider">
          {title}
        </p>
        <p className="text-3xl font-black">{value || 0}</p>
      </div>
    </motion.div>
  );
}

function MetricCard({ title, value, sub, color, icon }: any) {
  const c: any = {
    indigo: "text-indigo-600 dark:text-indigo-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    rose: "text-rose-600 dark:text-rose-400",
    blue: "text-blue-600 dark:text-blue-400",
    amber: "text-amber-600 dark:text-amber-400",
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
        {icon}
        {title}
      </p>
      <p className={`text-2xl font-black ${c[color]}`}>{value}</p>
      <p className="text-xs text-slate-400 mt-1">{sub}</p>
    </div>
  );
}

function DemographicBox({ title, data }: any) {
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
        {title}
      </p>
      <div className="space-y-3">
        {data?.slice(0, 3).map((item: any, i: number) => (
          <div key={item.label} className="space-y-1">
            <div className="flex justify-between text-[11px] font-medium">
              <span>{item.label}</span>
              <span>{item.count}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                className="h-full rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ADashboard;
