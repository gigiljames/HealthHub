import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  UserX,
  CreditCard,
  Building,
  Filter,
} from "lucide-react";
import axiosInstance from "../../api/axios";
import { ROUTES } from "../../constants/routes";
import { getDoctorAnalysis } from "../../api/doctor/analysisService";
import type { DoctorAnalysisStats } from "../../types/doctorAnalysis";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function DAnalysis() {
  document.title = "HealthHub | Analysis";

  const [stats, setStats] = useState<DoctorAnalysisStats | null>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("global");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("monthly");
  const [selectedDuration, setSelectedDuration] = useState<number>(12); // Default for monthly
  const [loading, setLoading] = useState<boolean>(true);

  const durationOptions: Record<string, number[]> = {
    daily: [7, 14, 30, 60],
    weekly: [4, 8, 12, 24],
    monthly: [3, 6, 12, 24],
    yearly: [2, 3, 5, 10],
  };

  const durationDefaults: Record<string, number> = {
    daily: 7,
    weekly: 12,
    monthly: 12,
    yearly: 5,
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    setSelectedDuration(durationDefaults[period]);
  };

  // Fetch practice locations for the dropdown
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axiosInstance.get(ROUTES.DOCTOR.GET_PRACTICE_LOCATIONS);
        if (response.data && response.data.data) {
          setLocations(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch practice locations:", error);
      }
    };
    fetchLocations();
  }, []);

  // Fetch analysis data when filters change
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const locationId = selectedLocation === "global" ? null : selectedLocation;
        const data = await getDoctorAnalysis(selectedPeriod, locationId, selectedDuration);
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch analysis stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [selectedLocation, selectedPeriod, selectedDuration]);

  // Determine if the selected location belongs to an organization to hide revenue
  const isOrganizationLocation = () => {
    if (selectedLocation === "global") return false;
    const loc = locations.find((l) => l._id === selectedLocation);
    // Assuming practice location type indicates if it's an organization or if it has organizationId
    return loc?.type === "ORGANISATION" || !!loc?.organizationId;
  };

  const hideRevenue = isOrganizationLocation();

  if (loading && !stats) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-darkGreen"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 pt-0 flex flex-col gap-8 pb-32">
      {/* Header and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Performance Analysis</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            Track your consultation metrics and revenue insights.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building className="h-4 w-4 text-gray-400" />
            </div>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-darkGreen outline-none appearance-none cursor-pointer shadow-sm"
            >
              <option value="global">Global (All Locations)</option>
              {locations.map((loc) => (
                <option key={loc._id} value={loc._id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <select
              value={selectedPeriod}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-darkGreen outline-none appearance-none cursor-pointer shadow-sm capitalize"
            >
              {["daily", "weekly", "monthly", "yearly"].map((period) => (
                <option key={period} value={period}>
                  {period}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Clock className="h-4 w-4 text-gray-400" />
            </div>
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(parseInt(e.target.value, 10))}
              className="pl-10 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-darkGreen outline-none appearance-none cursor-pointer shadow-sm"
            >
              {durationOptions[selectedPeriod]?.map((opt) => (
                <option key={opt} value={opt}>
                  Last {opt} {selectedPeriod === "daily" ? "Days" : selectedPeriod === "weekly" ? "Weeks" : selectedPeriod === "monthly" ? "Months" : "Years"}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading && stats && (
        <div className="w-full h-1 bg-gray-100 rounded overflow-hidden">
          <div className="h-full bg-darkGreen animate-pulse"></div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Appointments"
          value={stats?.totalAppointments || 0}
          icon={<Calendar className="w-5 h-5" />}
          colorClass="text-blue-600 bg-blue-50 dark:bg-blue-900/30"
        />
        <MetricCard
          title="Completed"
          value={stats?.totalCompleted || 0}
          icon={<CheckCircle className="w-5 h-5" />}
          colorClass="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30"
        />
        <MetricCard
          title="Total Patients"
          value={stats?.totalPatients || 0}
          icon={<Users className="w-5 h-5" />}
          colorClass="text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30"
        />
        <MetricCard
          title="Consultation Hours"
          value={`${stats?.totalHours || 0} hrs`}
          icon={<Clock className="w-5 h-5" />}
          colorClass="text-amber-600 bg-amber-50 dark:bg-amber-900/30"
        />

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 dark:text-slate-400 font-medium text-sm">Cancel Rate</span>
            <div className="p-2 rounded-lg text-red-600 bg-red-50 dark:bg-red-900/30">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-gray-800 dark:text-white">
              {stats?.cancellationRate?.toFixed(1) || 0}%
            </span>
            <div className="text-xs text-gray-500 mt-1 flex gap-2">
              <span>Patient: {stats?.cancelledByUser || 0}</span>
              <span>Doctor: {stats?.cancelledByDoctor || 0}</span>
            </div>
          </div>
        </div>

        <MetricCard
          title="No-Show Rate"
          value={`${stats?.noShowRate?.toFixed(1) || 0}%`}
          subtitle={`${stats?.totalNoShow || 0} patients`}
          icon={<UserX className="w-5 h-5" />}
          colorClass="text-orange-600 bg-orange-50 dark:bg-orange-900/30"
        />

        {!hideRevenue && (
          <>
            <MetricCard
              title="Total Revenue"
              value={`₹${stats?.totalRevenue || 0}`}
              subtitle="After commission"
              icon={<CreditCard className="w-5 h-5" />}
              colorClass="text-green-600 bg-green-50 dark:bg-green-900/30"
            />
            <MetricCard
              title="Payment Received"
              value={`₹${stats?.paymentReceived || 0}`}
              subtitle="Settled to wallet"
              icon={<CreditCard className="w-5 h-5" />}
              colorClass="text-teal-600 bg-teal-50 dark:bg-teal-900/30"
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Line Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Appointments Trend</h3>
          <div className="h-80">
            {stats?.appointmentTrend && stats.appointmentTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.appointmentTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dx={-10} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelStyle={{ fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}
                  />
                  <Line type="monotone" dataKey="total" name="Appointments" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">No trend data available for this period.</div>
            )}
          </div>
        </div>

        {/* Mode Pie Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Consultation Modes</h3>
          <div className="h-64 flex-1">
            {stats?.modeDistribution && stats.modeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.modeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="label"
                  >
                    {stats.modeDistribution.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">No mode data available.</div>
            )}
          </div>
        </div>
      </div>

      {/* Global Location Distribution Chart */}
      {selectedLocation === "global" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Appointments by Location</h3>
          <div className="h-80">
            {stats?.locationDistribution && stats.locationDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.locationDistribution} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 500 }} width={120} />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" name="Appointments" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={24}>
                    {stats.locationDistribution.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">No location data available.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Component
function MetricCard({
  title,
  value,
  subtitle,
  icon,
  colorClass,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  colorClass: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-500 dark:text-slate-400 font-medium text-sm">{title}</span>
        <div className={`p-2 rounded-lg ${colorClass}`}>{icon}</div>
      </div>
      <div>
        <span className="text-2xl font-bold text-gray-800 dark:text-white">{value}</span>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
