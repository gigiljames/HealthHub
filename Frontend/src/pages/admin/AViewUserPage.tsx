import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { getUser, getUserAnalytics } from "../../api/admin/userManagementService";
import getIcon from "../../helpers/getIcon";
import AMobileSidebar from "../../components/admin/AMobileSidebar";
import ASidebar from "../../components/admin/ASidebar";
import Avatar from "../../components/common/Avatar";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  isBlocked: boolean;
  isNewUser: boolean;
  bloodGroup: string;
  maritalStatus: string;
  dob: Date | null;
  gender: string;
  occupation: string;
  profileImageUrl: string | null;
  allergies: string[];
  bodyMetrics: {
    height: number;
    weight: number;
    lastUpdated: Date | null;
  };
  contact: {
    address: string;
    phone: string;
  };
}

interface SpecializationBreakdown {
  specialization: string;
  count: number;
}

interface DoctorBreakdown {
  doctorName: string;
  count: number;
}

interface ModeBreakdown {
  mode: string;
  count: number;
}

interface LocationBreakdown {
  locationName: string;
  count: number;
}

interface UserAnalyticsData {
  totalConsultations: number;
  completedConsultations: number;
  cancelledConsultations: number;
  noShowCount: number;
  onlineConsultations: number;
  offlineConsultations: number;
  averageDuration: number;
  breakdown: {
    bySpecialization: SpecializationBreakdown[];
    byDoctor: DoctorBreakdown[];
    byMode: ModeBreakdown[];
    byLocation: LocationBreakdown[];
  };
}

const AViewUserPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<UserAnalyticsData | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  const fetchUserProfile = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getUser(id);
      if (data.success) {
        setUserProfile(data.user);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchUserAnalytics = useCallback(async () => {
    if (!id) return;
    try {
      setLoadingAnalytics(true);
      const data = await getUserAnalytics(id);
      if (data && data.success) {
        setAnalyticsData(data.data);
      }
    } catch (error) {
      console.error("Error fetching user analytics:", error);
    } finally {
      setLoadingAnalytics(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUserProfile();
    fetchUserAnalytics();
  }, [fetchUserProfile, fetchUserAnalytics]);

  const getPercentage = (count: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  if (loading) {
    return (
      <div className="flex w-full h-screen">
        <ASidebar page="user-management" />
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-[#1a1c23]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lightGreen"></div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex w-full h-screen">
        <ASidebar page="user-management" />
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-[#1a1c23] text-gray-500">
          {getIcon("search-solid", "64px")}
          <h2 className="mt-4 text-xl">User not found</h2>
          <button
            onClick={() => navigate("/admin/user-management")}
            className="mt-4 px-4 py-2 bg-lightGreen text-white rounded-md hover:opacity-90 transition-opacity"
          >
            Back to list
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <AMobileSidebar page="user-management" />
      <div className="flex w-full flex-col lg:flex-row">
        <ASidebar page="user-management" />
        <div className="w-screen lg:flex-1 relative">
          <div className="flex flex-col gap-6 p-4 h-screen overflow-y-auto bg-[#f3f4f6] dark:bg-[#1a1c23] text-gray-800 dark:text-gray-200 animate-fade-in w-full transition-colors duration-200 pb-10">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/admin/user-management")}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                  title="Back to User Management"
                >
                  {getIcon("left", "24px")}
                </button>
                <div>
                  <h1 className="text-3xl font-bold">User Details</h1>
                  <p className="font-mono text-sm text-gray-500 mt-1">
                    User ID: {userProfile.id}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <span
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${
                    userProfile.isBlocked
                      ? "bg-red-100 text-red-700 border-red-200"
                      : "bg-green-100 text-green-700 border-green-200"
                  }`}
                >
                  {userProfile.isBlocked ? "Blocked" : "Active"}
                </span>
                <span
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${
                    userProfile.isNewUser
                      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                      : "bg-blue-100 text-blue-700 border-blue-200"
                  }`}
                >
                  {userProfile.isNewUser ? "New User" : "Profile completed"}
                </span>
              </div>
            </div>

            {/* Profile Overview Card */}
            <div className="bg-white dark:bg-[#252831] p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full border-4 border-gray-50 dark:border-gray-700 overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                {userProfile.profileImageUrl ? (
                  <Avatar
                    src={userProfile.profileImageUrl}
                    alt="User Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400">
                    {getIcon("user", "48px")}
                  </span>
                )}
              </div>
              <div className="flex-1 text-center md:text-left">
                <p className="text-xs text-blue-500 uppercase font-bold tracking-wider mb-1">
                  General Profile
                </p>
                <h2 className="text-2xl font-bold mb-1">
                  {userProfile.name || "Unknown Patient"}
                </h2>
                <p className="text-sm text-gray-500 mb-2">{userProfile.email}</p>
                <p className="font-mono text-xs text-gray-400">
                  Registered ID: {userProfile.id}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Personal Information */}
              <div className="bg-white dark:bg-[#252831] p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold mb-4 border-b border-gray-100 dark:border-gray-700 pb-2 flex items-center gap-2">
                  {getIcon("user", "20px")} Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Phone</p>
                    <p className="font-semibold">{userProfile.phone || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Gender</p>
                    <p className="font-semibold capitalize">{userProfile.gender || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Date of Birth</p>
                    <p className="font-semibold">
                      {userProfile.dob ? new Date(userProfile.dob).toLocaleDateString() : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Blood Group</p>
                    <p className="font-semibold">{userProfile.bloodGroup || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Marital Status</p>
                    <p className="font-semibold capitalize">{userProfile.maritalStatus || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Occupation</p>
                    <p className="font-semibold">{userProfile.occupation || "-"}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white dark:bg-[#252831] p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold mb-4 border-b border-gray-100 dark:border-gray-700 pb-2 flex items-center gap-2">
                  {getIcon("location", "20px")} Contact Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Contact Phone</p>
                    <p className="font-semibold">{userProfile.contact?.phone || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Address</p>
                    <p className="font-semibold whitespace-pre-wrap">{userProfile.contact?.address || "-"}</p>
                  </div>
                </div>
              </div>

              {/* Health Metrics & Allergies */}
              <div className="bg-white dark:bg-[#252831] p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4 border-b border-gray-100 dark:border-gray-700 pb-2 flex items-center gap-2">
                  {getIcon("activity", "20px")} Health & Body Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Height</p>
                    <p className="font-bold text-lg text-gray-800 dark:text-gray-100">
                      {userProfile.bodyMetrics?.height ? `${userProfile.bodyMetrics.height} cm` : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Weight</p>
                    <p className="font-bold text-lg text-gray-800 dark:text-gray-100">
                      {userProfile.bodyMetrics?.weight ? `${userProfile.bodyMetrics.weight} kg` : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Metrics Last Updated</p>
                    <p className="font-semibold">
                      {userProfile.bodyMetrics?.lastUpdated 
                        ? new Date(userProfile.bodyMetrics.lastUpdated).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                  
                  {userProfile.allergies && userProfile.allergies.length > 0 && (
                    <div className="md:col-span-3 mt-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Registered Allergies</p>
                      <div className="flex flex-wrap gap-2">
                        {userProfile.allergies.map((allergy, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800 rounded-full text-xs font-semibold"
                          >
                            {allergy}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* User Analytics Dashboard */}
            <div className="bg-white dark:bg-[#252831] p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-700 pb-3">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  {getIcon("activity", "24px")} User Analytics & Insights
                </h3>
                <span className="text-xs px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full font-medium">
                  Real-time Data
                </span>
              </div>

              {loadingAnalytics ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-lightGreen"></div>
                  <span className="ml-3 text-sm text-gray-500">Loading insights...</span>
                </div>
              ) : !analyticsData || analyticsData.totalConsultations === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <div className="inline-flex p-3 rounded-full bg-gray-100 dark:bg-gray-800 mb-3">
                    {getIcon("activity", "32px")}
                  </div>
                  <p className="text-base font-semibold">No consultations recorded yet</p>
                  <p className="text-xs text-gray-400 mt-1">Analytics will populate once the user books appointments.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* KPI Cards Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                    
                    {/* Total Consultations */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 flex flex-col justify-between min-h-[110px]">
                      <div>
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">Total Booked</span>
                        <span className="text-3xl font-extrabold text-blue-900 dark:text-blue-100 mt-1 block">{analyticsData.totalConsultations}</span>
                      </div>
                      <span className="text-[10px] text-blue-500/80 font-medium">Lifetime bookings</span>
                    </div>

                    {/* Completed */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-900/30 flex flex-col justify-between min-h-[110px]">
                      <div>
                        <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider block">Completed</span>
                        <span className="text-3xl font-extrabold text-green-900 dark:text-green-100 mt-1 block">{analyticsData.completedConsultations}</span>
                      </div>
                      <span className="text-[10px] text-green-600/80 font-medium">
                        {getPercentage(analyticsData.completedConsultations, analyticsData.totalConsultations)}% Completion
                      </span>
                    </div>

                    {/* Cancelled */}
                    <div className="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/30 flex flex-col justify-between min-h-[110px]">
                      <div>
                        <span className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider block">Cancelled</span>
                        <span className="text-3xl font-extrabold text-red-900 dark:text-red-100 mt-1 block">{analyticsData.cancelledConsultations}</span>
                      </div>
                      <span className="text-[10px] text-red-600/80 font-medium">
                        {getPercentage(analyticsData.cancelledConsultations, analyticsData.totalConsultations)}% Cancellation
                      </span>
                    </div>

                    {/* No-Shows */}
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-950/20 dark:to-yellow-900/10 p-4 rounded-xl border border-yellow-100 dark:border-yellow-900/30 flex flex-col justify-between min-h-[110px]">
                      <div>
                        <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider block">No-Shows</span>
                        <span className="text-3xl font-extrabold text-yellow-900 dark:text-yellow-100 mt-1 block">{analyticsData.noShowCount}</span>
                      </div>
                      <span className="text-[10px] text-yellow-600/80 font-medium">
                        {getPercentage(analyticsData.noShowCount, analyticsData.totalConsultations)}% No-show rate
                      </span>
                    </div>

                    {/* Avg Duration */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10 p-4 rounded-xl border border-purple-100 dark:border-purple-900/30 flex flex-col justify-between min-h-[110px]">
                      <div>
                        <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">Avg. Duration</span>
                        <span className="text-3xl font-extrabold text-purple-900 dark:text-purple-100 mt-1 block">
                          {analyticsData.averageDuration} <span className="text-sm font-normal text-purple-700 dark:text-purple-300">min</span>
                        </span>
                      </div>
                      <span className="text-[10px] text-purple-600/80 font-medium">Completed visits</span>
                    </div>

                    {/* Mode Split */}
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-900/30 flex flex-col justify-between min-h-[110px]">
                      <div>
                        <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider block">Mode Balance</span>
                        <div className="flex items-baseline mt-1">
                          <span className="text-2xl font-extrabold text-orange-900 dark:text-orange-100">
                            {getPercentage(analyticsData.onlineConsultations, analyticsData.totalConsultations)}%
                          </span>
                          <span className="text-xs text-orange-600 dark:text-orange-400 ml-1 font-semibold">Online</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-orange-600/80 font-medium">
                        {analyticsData.onlineConsultations} On / {analyticsData.offlineConsultations} Off
                      </span>
                    </div>

                  </div>

                  {/* Breakdowns Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    
                    {/* Specialization Breakdown */}
                    <div className="bg-gray-50 dark:bg-[#1f212a] p-5 rounded-xl border border-gray-100 dark:border-gray-800">
                      <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4 pb-2 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                        <span>By Specialization</span>
                        <span className="text-xs text-gray-400 font-normal">Count</span>
                      </h4>
                      <div className="space-y-4">
                        {analyticsData.breakdown.bySpecialization.map((item, idx) => {
                          const pct = getPercentage(item.count, analyticsData.totalConsultations);
                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-sm font-medium">
                                <span className="text-gray-800 dark:text-gray-200">{item.specialization}</span>
                                <span className="text-gray-500">{item.count} ({pct}%)</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                <div 
                                  className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                                  style={{ width: `${pct}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Doctor Breakdown */}
                    <div className="bg-gray-50 dark:bg-[#1f212a] p-5 rounded-xl border border-gray-100 dark:border-gray-800">
                      <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4 pb-2 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                        <span>By Doctor</span>
                        <span className="text-xs text-gray-400 font-normal">Count</span>
                      </h4>
                      <div className="space-y-4">
                        {analyticsData.breakdown.byDoctor.map((item, idx) => {
                          const pct = getPercentage(item.count, analyticsData.totalConsultations);
                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-sm font-medium">
                                <span className="text-gray-800 dark:text-gray-200">{item.doctorName}</span>
                                <span className="text-gray-500">{item.count} ({pct}%)</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                <div 
                                  className="bg-green-600 h-full rounded-full transition-all duration-500" 
                                  style={{ width: `${pct}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Location Breakdown */}
                    <div className="bg-gray-50 dark:bg-[#1f212a] p-5 rounded-xl border border-gray-100 dark:border-gray-800">
                      <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4 pb-2 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                        <span>By Location</span>
                        <span className="text-xs text-gray-400 font-normal">Count</span>
                      </h4>
                      <div className="space-y-4">
                        {analyticsData.breakdown.byLocation.map((item, idx) => {
                          const pct = getPercentage(item.count, analyticsData.totalConsultations);
                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-sm font-medium">
                                <span className="text-gray-800 dark:text-gray-200">{item.locationName}</span>
                                <span className="text-gray-500">{item.count} ({pct}%)</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                <div 
                                  className="bg-purple-600 h-full rounded-full transition-all duration-500" 
                                  style={{ width: `${pct}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Mode Breakdown */}
                    <div className="bg-gray-50 dark:bg-[#1f212a] p-5 rounded-xl border border-gray-100 dark:border-gray-800">
                      <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4 pb-2 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                        <span>By Consultation Mode</span>
                        <span className="text-xs text-gray-400 font-normal">Count</span>
                      </h4>
                      <div className="space-y-4">
                        {analyticsData.breakdown.byMode.map((item, idx) => {
                          const pct = getPercentage(item.count, analyticsData.totalConsultations);
                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-sm font-medium">
                                <span className="text-gray-800 dark:text-gray-200">{item.mode}</span>
                                <span className="text-gray-500">{item.count} ({pct}%)</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                <div 
                                  className="bg-orange-500 h-full rounded-full transition-all duration-500" 
                                  style={{ width: `${pct}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default AViewUserPage;
