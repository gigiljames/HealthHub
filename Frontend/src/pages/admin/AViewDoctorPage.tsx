import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import getIcon from "../../helpers/getIcon";
import { getDoctor, verifyDoctor, getDoctorAnalytics } from "../../api/admin/doctorService";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import toast from "react-hot-toast";
import { getStatusBadge } from "../../helpers/getStatusBadge";
import Avatar from "../../components/common/Avatar";
import BannerImage from "../../components/common/BannerImage";
import AMobileSidebar from "../../components/admin/AMobileSidebar";
import ASidebar from "../../components/admin/ASidebar";

interface VerificationSubmission {
  _id: string;
  status: "pending" | "verified" | "rejected" | "resubmitted";
  remarks: string;
  submissionDate: string;
  reviewDate: string | null;
}

interface DoctorProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isBlocked: boolean;
  isNewUser: boolean;
  profileImageUrl?: string;
  bannerImageUrl?: string;
  gender?: string;
  dob?: Date | null;
  specialization?: string;
  about?: string;
  verificationStatus?: "pending" | "verified" | "rejected" | "resubmitted";
  verificationSubmissions: VerificationSubmission[];
  activeSubmissionId: string | null;
  certificates?: {
    medicalLicense: string | null;
    latestDegree: string | null;
  };
  education?: Array<{
    title: string;
    institution: string;
    graduationYear: number;
  }>;
  experience?: Array<{
    designation: string;
    hospital: string;
    startDate: Date;
    endDate?: Date;
    type: string;
  }>;
  isVisible?: boolean;
  lastUpdated?: Date;
}

const AViewDoctorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [verificationSubmissions, setVerificationSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState("");

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [combinedData, setCombinedData] = useState<any | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    type: "approve" | "reject" | null;
  }>({
    isOpen: false,
    type: null,
  });

  const fetchDoctorProfileDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getDoctor(id);
      if (data.success) {
        setDoctorProfile(data.doctor);
        const submissions = [...data.doctor.verificationSubmissions].map((val) => {
          return {
            ...val,
            date: new Date(val.submissionDate),
          };
        });
        submissions.sort((a, b) => b.date.getTime() - a.date.getTime());
        setVerificationSubmissions(submissions);
      }
    } catch (error) {
      console.error("Error fetching doctor profile:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchDoctorAnalytics = useCallback(async () => {
    if (!id) return;
    try {
      setLoadingAnalytics(true);
      const res = await getDoctorAnalytics(id);
      if (res && res.success) {
        setAnalyticsData(res.data.analytics || []);
        setCombinedData(res.data.combined || null);
      }
    } catch (error) {
      console.error("Error fetching doctor analytics:", error);
    } finally {
      setLoadingAnalytics(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDoctorProfileDetails();
    fetchDoctorAnalytics();
  }, [fetchDoctorProfileDetails, fetchDoctorAnalytics]);

  const handleApproveClick = () => {
    setConfirmationModal({ isOpen: true, type: "approve" });
  };

  const handleRejectClick = () => {
    if (!remarks.trim()) return;
    setConfirmationModal({ isOpen: true, type: "reject" });
  };

  const handleConfirmAction = async () => {
    if (!id || !confirmationModal.type) return;

    try {
      const isApproved = confirmationModal.type === "approve";
      const response = await verifyDoctor(id, isApproved, remarks);
      if (response && response.success) {
        toast.success("Doctor verification status updated successfully.");
        setConfirmationModal({ isOpen: false, type: null });
        setRemarks("");
        fetchDoctorProfileDetails();
      } else if (response.success === false) {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error verifying doctor.");
    }
  };

  if (loading) {
    return (
      <div className="flex w-full h-screen">
        <ASidebar page="doctor-management" />
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-[#1a1c23]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lightGreen"></div>
        </div>
      </div>
    );
  }

  if (!doctorProfile) {
    return (
      <div className="flex w-full h-screen">
        <ASidebar page="doctor-management" />
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-[#1a1c23] text-gray-500">
          {getIcon("search-solid", "64px")}
          <h2 className="mt-4 text-xl">Doctor not found</h2>
          <button
            onClick={() => navigate("/admin/doctor-management")}
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
      <AMobileSidebar page="doctor-management" />
      <div className="flex w-full flex-col lg:flex-row">
        <ASidebar page="doctor-management" />
        <div className="w-screen lg:flex-1 relative">
          <div className="flex flex-col gap-6 p-4 h-screen overflow-y-auto bg-[#f3f4f6] dark:bg-[#1a1c23] text-gray-800 dark:text-gray-200 animate-fade-in w-full transition-colors duration-200 pb-10">

            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/admin/doctor-management")}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                  title="Back to Doctor Management"
                >
                  {getIcon("left", "24px")}
                </button>
                <div>
                  <h1 className="text-3xl font-bold">Doctor Details</h1>
                  <p className="font-mono text-sm text-gray-500 mt-1">
                    Doctor ID: {doctorProfile.id}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <span
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${doctorProfile.isBlocked
                    ? "bg-red-100 text-red-700 border-red-300"
                    : "bg-green-100 text-green-700 border-green-200"
                    }`}
                >
                  {doctorProfile.isBlocked ? "Blocked" : "Active"}
                </span>
                {doctorProfile.verificationStatus && (
                  <span
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${doctorProfile.verificationStatus === "verified"
                      ? "bg-green-100 text-green-700 border-green-300"
                      : doctorProfile.verificationStatus === "rejected"
                        ? "bg-red-100 text-red-700 border-red-300"
                        : doctorProfile.verificationStatus === "pending"
                          ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                          : "bg-blue-100 text-blue-700 border-blue-200"
                      }`}
                  >
                    {doctorProfile.verificationStatus === "verified"
                      ? "Verified"
                      : doctorProfile.verificationStatus === "rejected"
                        ? "Rejected"
                        : doctorProfile.verificationStatus === "pending"
                          ? "Pending"
                          : "Resubmitted"}
                  </span>
                )}
              </div>
            </div>

            {/* Profile banner & Avatar section */}
            <div className="bg-white dark:bg-[#252831] rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="relative h-44 bg-gray-100 dark:bg-gray-800">
                <BannerImage
                  src={doctorProfile.bannerImageUrl}
                  alt="Doctor Professional Banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute -bottom-10 left-6">
                  <div className="w-24 h-24 rounded-full border-4 border-white dark:border-[#252831] overflow-hidden bg-white dark:bg-gray-800">
                    {doctorProfile.profileImageUrl ? (
                      <Avatar
                        src={doctorProfile.profileImageUrl}
                        alt={doctorProfile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl font-bold bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 uppercase">
                        {doctorProfile.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-12 p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {doctorProfile.name}
                </h2>
                <p className="text-blue-500 font-semibold mt-0.5">
                  {doctorProfile.specialization || "General Medicine"}
                </p>
                {doctorProfile.about && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-4 leading-relaxed whitespace-pre-wrap">
                    {doctorProfile.about}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Doctor General Info */}
              <div className="bg-white dark:bg-[#252831] p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold mb-4 border-b border-gray-100 dark:border-gray-700 pb-2 flex items-center gap-2">
                  {getIcon("user", "20px")} Professional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Email</p>
                    <p className="font-semibold">{doctorProfile.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Phone</p>
                    <p className="font-semibold">{doctorProfile.phone || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Date of Birth</p>
                    <p className="font-semibold">
                      {doctorProfile.dob ? new Date(doctorProfile.dob).toLocaleDateString() : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Gender</p>
                    <p className="font-semibold capitalize">{doctorProfile.gender || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Profile Stage Status</p>
                    <p className="font-semibold">
                      {doctorProfile.isNewUser ? "New User" : "Profile Completed"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Visibility Status</p>
                    <p className="font-semibold">
                      {doctorProfile.isVisible ? "🏢 Publicly Visible" : "🚫 Hidden"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Verification & Documents Card */}
              <div className="bg-white dark:bg-[#252831] p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold mb-4 border-b border-gray-100 dark:border-gray-700 pb-2 flex items-center gap-2">
                  📂 Verification Certificates
                </h3>
                {doctorProfile.certificates ? (
                  <div className="space-y-3">
                    {doctorProfile.certificates.medicalLicense && (
                      <div className="p-3 bg-gray-50 dark:bg-[#1f2128] rounded border border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Medical License Certificate</span>
                        <a
                          href={doctorProfile.certificates.medicalLicense}
                          download
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-lightGreen text-white text-xs font-semibold rounded hover:opacity-90 transition-opacity"
                        >
                          Download
                        </a>
                      </div>
                    )}
                    {doctorProfile.certificates.latestDegree && (
                      <div className="p-3 bg-gray-50 dark:bg-[#1f2128] rounded border border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Latest Degree Certificate</span>
                        <a
                          href={doctorProfile.certificates.latestDegree}
                          download
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-lightGreen text-white text-xs font-semibold rounded hover:opacity-90 transition-opacity"
                        >
                          Download
                        </a>
                      </div>
                    )}
                    {!doctorProfile.certificates.medicalLicense && !doctorProfile.certificates.latestDegree && (
                      <p className="text-sm text-gray-400 text-center py-6">No clinical certificates found.</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-6">No clinical certificates found.</p>
                )}
              </div>

              {/* Education Cards */}
              <div className="bg-white dark:bg-[#252831] p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold mb-4 border-b border-gray-100 dark:border-gray-700 pb-2 flex items-center gap-2">
                  🎓 Academic Credentials
                </h3>
                {doctorProfile.education && doctorProfile.education.length > 0 ? (
                  <div className="space-y-3">
                    {doctorProfile.education.map((edu, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 dark:bg-[#1f2128] rounded border border-gray-100 dark:border-gray-700">
                        <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{edu.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{edu.institution}</p>
                        <p className="text-xs font-mono text-gray-400 mt-1">Graduation Year: {edu.graduationYear}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-6">No educational credentials uploaded.</p>
                )}
              </div>

              {/* Work Experience Timeline */}
              <div className="bg-white dark:bg-[#252831] p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold mb-4 border-b border-gray-100 dark:border-gray-700 pb-2 flex items-center gap-2">
                  💼 Clinical Experience
                </h3>
                {doctorProfile.experience && doctorProfile.experience.length > 0 ? (
                  <div className="space-y-3">
                    {doctorProfile.experience.map((exp, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 dark:bg-[#1f2128] rounded border border-gray-100 dark:border-gray-700">
                        <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{exp.designation}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{exp.hospital} ({exp.type})</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(exp.startDate).toLocaleDateString()} -{" "}
                          {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : "Present"}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-6">No experience logs provided.</p>
                )}
              </div>



              {!doctorProfile.isNewUser && (
                <div className="bg-white dark:bg-[#252831] p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 lg:col-span-2">
                  <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-700 pb-3">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      {getIcon("activity", "24px")} Practice Location Analytics & Performance
                    </h3>
                    <span className="text-xs px-2.5 py-1 bg-lightGreen/10 text-lightGreen dark:text-green-400 rounded-full font-medium">
                      Real-time Audit
                    </span>
                  </div>

                  {loadingAnalytics ? (
                    <div className="flex justify-center items-center py-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lightGreen"></div>
                    </div>
                  ) : analyticsData.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8">No practice location analytics data available.</p>
                  ) : (
                    <div className="space-y-8">

                      {/* Combined Metrics Section */}
                      {combinedData && (
                        <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/30 dark:from-blue-950/10 dark:to-indigo-950/5 p-6 rounded-xl border border-blue-100 dark:border-blue-900/30 shadow-sm animate-fade-in">
                          {/* Combined Header */}
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-blue-200/50 dark:border-blue-900/40 pb-3">
                            <div>
                              <h4 className="text-lg font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2">
                                🌟 Combined Metrics (All Locations)
                              </h4>
                              <p className="text-xs text-gray-400 mt-0.5">Aggregated metrics across all consultation spots</p>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {combinedData.consultationModes.map((mode: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 bg-blue-100/70 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-[10px] font-bold uppercase tracking-wider"
                                >
                                  {mode}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Combined Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">

                            <div className="bg-white dark:bg-[#252831] p-3 rounded-lg border border-gray-150 dark:border-gray-800 shadow-sm flex flex-col justify-between min-h-[85px]">
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Total Bookings</p>
                              <p className="text-2xl font-black mt-1 text-gray-800 dark:text-gray-100">{combinedData.totalConsultations}</p>
                              <span className="text-[9px] text-gray-400 font-medium">All sessions booked</span>
                            </div>

                            <div className="bg-white dark:bg-[#252831] p-3 rounded-lg border border-gray-150 dark:border-gray-800 shadow-sm flex flex-col justify-between min-h-[85px]">
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Completed Visits</p>
                              <p className="text-2xl font-black mt-1 text-green-600 dark:text-green-400">
                                {combinedData.completedConsultations}
                              </p>
                              <span className="text-[9px] text-green-600/80 font-semibold">{combinedData.completionRate}% Completion Rate</span>
                            </div>

                            <div className="bg-white dark:bg-[#252831] p-3 rounded-lg border border-gray-150 dark:border-gray-800 shadow-sm flex flex-col justify-between min-h-[85px]">
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Cancellation Rate</p>
                              <p className="text-2xl font-black mt-1 text-red-500">{combinedData.cancellationRate}%</p>
                              <span className="text-[9px] text-red-500/80 font-medium">Total cancellation ratio</span>
                            </div>

                            <div className="bg-white dark:bg-[#252831] p-3 rounded-lg border border-gray-150 dark:border-gray-800 shadow-sm flex flex-col justify-between min-h-[85px]">
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Revenue & Refunded</p>
                              <div>
                                <p className="text-base font-black mt-1 text-emerald-600 dark:text-emerald-400">₹{combinedData.revenueGenerated.toFixed(2)}</p>
                                <p className="text-[10px] font-bold text-rose-500 mt-0.5">Refunded: ₹{combinedData.refundedAmount.toFixed(2)}</p>
                              </div>
                            </div>

                            <div className="bg-white dark:bg-[#252831] p-3 rounded-lg border border-gray-150 dark:border-gray-800 shadow-sm flex flex-col justify-between min-h-[85px]">
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Consultation Modes</p>
                              <p className="text-lg font-bold mt-1 text-indigo-600 dark:text-indigo-400">
                                {combinedData.onlineConsultations} <span className="text-xs text-gray-505 font-normal">On</span> / {combinedData.offlineConsultations} <span className="text-xs text-gray-505 font-normal">Off</span>
                              </p>
                              <span className="text-[9px] text-indigo-500/80 font-medium">Online vs In-person</span>
                            </div>

                            <div className="bg-white dark:bg-[#252831] p-3 rounded-lg border border-gray-150 dark:border-gray-800 shadow-sm flex flex-col justify-between min-h-[85px]">
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Caseload Averages</p>
                              <div>
                                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Day: <span className="font-extrabold text-blue-600">{combinedData.averageConsultationsPerDay}</span></p>
                                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Month: <span className="font-extrabold text-blue-600">{combinedData.averageConsultationsPerMonth}</span></p>
                              </div>
                              <span className="text-[9px] text-gray-400 font-medium">Per active days/months</span>
                            </div>

                            <div className="bg-white dark:bg-[#252831] p-3 rounded-lg border border-gray-150 dark:border-gray-800 shadow-sm flex flex-col justify-between min-h-[85px]">
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Monthly Revenue</p>
                              <p className="text-base font-black mt-1 text-blue-800 dark:text-blue-400">₹{combinedData.averageMonthlyRevenue.toFixed(2)}</p>
                              <span className="text-[9px] text-blue-500/80 font-medium">Avg revenue per active month</span>
                            </div>

                            <div className="bg-white dark:bg-[#252831] p-3 rounded-lg border border-gray-150 dark:border-gray-800 shadow-sm flex flex-col justify-between min-h-[85px]">
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Avg Duration</p>
                              <p className="text-2xl font-black mt-1 text-gray-800 dark:text-gray-100">{combinedData.averageDuration} <span className="text-xs font-normal text-gray-500">min</span></p>
                              <span className="text-[9px] text-gray-400 font-medium">Completed visits length</span>
                            </div>

                            <div className="bg-white dark:bg-[#252831] p-3 rounded-lg border border-gray-150 dark:border-gray-800 shadow-sm flex flex-col justify-between min-h-[85px]">
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Active Patients</p>
                              <p className="text-2xl font-black mt-1 text-violet-600 dark:text-violet-400">{combinedData.activePatients}</p>
                              <span className="text-[9px] text-violet-500/80 font-medium">Unique patient directory</span>
                            </div>

                            <div className="bg-white dark:bg-[#252831] p-3 rounded-lg border border-gray-150 dark:border-gray-800 shadow-sm flex flex-col justify-between min-h-[85px]">
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Peak Demand</p>
                              <div className="text-[11px] font-semibold text-gray-800 dark:text-gray-100 mt-1">
                                <p>🕒 {combinedData.peakConsultationHour}</p>
                                <p>📅 {combinedData.peakBookingDay}</p>
                              </div>
                            </div>

                          </div>
                        </div>
                      )}

                      {/* Individual Locations Section */}
                      <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Individual Locations Breakdown</h4>

                        <div className="space-y-6">
                          {analyticsData.map((loc) => (
                            <div
                              key={loc.locationId}
                              className="bg-gray-50 dark:bg-[#1f2128] p-5 rounded-xl border border-gray-200/60 dark:border-gray-800"
                            >
                              {/* Location Header */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                                <div className="flex items-baseline gap-2 flex-wrap">
                                  <span className="text-base font-bold text-gray-900 dark:text-gray-100">
                                    🏢 {loc.locationName}
                                  </span>
                                  <span className="text-[10px] text-gray-400 font-mono">
                                    (ID: {loc.locationId})
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="flex gap-1">
                                    {loc.consultationModes.map((mode: string, idx: number) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-[9px] font-bold uppercase tracking-wider"
                                      >
                                        {mode}
                                      </span>
                                    ))}
                                  </div>
                                  {loc.googleMapsUrl && (
                                    <a
                                      href={loc.googleMapsUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-3 py-1 bg-lightGreen/10 text-lightGreen dark:text-green-400 hover:bg-lightGreen hover:text-white dark:hover:bg-green-950/40 text-xs font-bold rounded-lg border border-lightGreen/20 transition-all flex items-center gap-1 shrink-0"
                                    >
                                      🗺️ View on Maps
                                    </a>
                                  )}
                                </div>
                              </div>

                              {/* Metrics Grid */}
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">

                                <div className="bg-white dark:bg-[#252831] p-3 rounded border border-gray-100 dark:border-gray-800">
                                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Total Bookings</p>
                                  <p className="text-xl font-bold mt-1 text-gray-800 dark:text-gray-100">{loc.totalConsultations}</p>
                                </div>

                                <div className="bg-white dark:bg-[#252831] p-3 rounded border border-gray-100 dark:border-gray-800">
                                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Completed Visits</p>
                                  <p className="text-xl font-bold mt-1 text-green-600 dark:text-green-400">
                                    {loc.completedConsultations} <span className="text-xs font-normal text-gray-500">({loc.completionRate}%)</span>
                                  </p>
                                </div>

                                <div className="bg-white dark:bg-[#252831] p-3 rounded border border-gray-100 dark:border-gray-800">
                                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Cancellation Rate</p>
                                  <p className="text-xl font-bold mt-1 text-red-600 dark:text-red-400">{loc.cancellationRate}%</p>
                                </div>

                                <div className="bg-white dark:bg-[#252831] p-3 rounded border border-gray-100 dark:border-gray-800">
                                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Revenue & Refunded</p>
                                  <p className="text-base font-bold mt-1 text-emerald-600 dark:text-emerald-400">₹{loc.revenueGenerated.toFixed(2)}</p>
                                  <p className="text-[9px] font-bold text-rose-500">Refunded: ₹{loc.refundedAmount.toFixed(2)}</p>
                                </div>

                                <div className="bg-white dark:bg-[#252831] p-3 rounded border border-gray-100 dark:border-gray-800">
                                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Consultation Modes</p>
                                  <p className="text-sm font-bold mt-2 text-indigo-600 dark:text-indigo-400">
                                    {loc.onlineConsultations} Online / {loc.offlineConsultations} In-Person
                                  </p>
                                </div>

                                <div className="bg-white dark:bg-[#252831] p-3 rounded border border-gray-100 dark:border-gray-800">
                                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Caseload Averages</p>
                                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-1">Day: <span className="text-blue-600 font-extrabold">{loc.averageConsultationsPerDay}</span></p>
                                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-0.5">Month: <span className="text-blue-600 font-extrabold">{loc.averageConsultationsPerMonth}</span></p>
                                </div>

                                <div className="bg-white dark:bg-[#252831] p-3 rounded border border-gray-100 dark:border-gray-800">
                                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Monthly Revenue</p>
                                  <p className="text-base font-bold mt-1 text-blue-800 dark:text-blue-400 font-black">₹{loc.averageMonthlyRevenue.toFixed(2)}</p>
                                </div>

                                <div className="bg-white dark:bg-[#252831] p-3 rounded border border-gray-100 dark:border-gray-800">
                                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Avg Duration</p>
                                  <p className="text-xl font-bold mt-1 text-gray-800 dark:text-gray-100">{loc.averageDuration} min</p>
                                </div>

                                <div className="bg-white dark:bg-[#252831] p-3 rounded border border-gray-100 dark:border-gray-800">
                                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Active Patients</p>
                                  <p className="text-xl font-bold mt-1 text-purple-600 dark:text-purple-400">{loc.activePatients}</p>
                                </div>

                                <div className="bg-white dark:bg-[#252831] p-3 rounded border border-gray-100 dark:border-gray-800">
                                  <p className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">Schedule & Demand</p>
                                  <p className="text-[11px] font-semibold text-gray-800 dark:text-gray-100 mt-1">🕒 {loc.peakConsultationHour}</p>
                                  <p className="text-[11px] font-semibold text-gray-800 dark:text-gray-100">📅 {loc.peakBookingDay}</p>
                                </div>

                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              )}

              {/* Submission History Feed */}
              <div className="bg-white dark:bg-[#252831] p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4 border-b border-gray-100 dark:border-gray-700 pb-2 flex items-center gap-2">
                  ⏰ Verification Submission History
                </h3>
                {verificationSubmissions.length === 0 ? (
                  <div className="text-center text-gray-500 py-8 border-dashed border-2 border-gray-200 dark:border-gray-800 rounded-lg text-sm">
                    No verification submission history available.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {verificationSubmissions.map((submission: VerificationSubmission) => (
                      <div
                        key={submission._id}
                        className="flex md:flex-row p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-[#1f2128]/50 hover:bg-gray-100 dark:hover:bg-[#1f2128] transition gap-4"
                      >
                        <div className="rounded-lg flex items-start justify-center text-xl mt-1">
                          {submission.status === "verified" && (
                            <div className="text-green-500 bg-green-100 dark:bg-green-950 p-2 rounded-lg">
                              {getIcon("tick", "20px")}
                            </div>
                          )}
                          {submission.status === "rejected" && (
                            <div className="text-red-500 bg-red-100 dark:bg-red-950 p-2 rounded-lg">
                              {getIcon("cancel", "20px")}
                            </div>
                          )}
                          {submission.status === "pending" && (
                            <div className="text-yellow-500 bg-yellow-100 dark:bg-yellow-950 p-2 rounded-lg">
                              {getIcon("hour-glass", "20px")}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                          <div className="flex justify-between items-center flex-wrap gap-2">
                            {getStatusBadge(submission.status)}
                            <div className="text-xs text-gray-400 font-mono">ID: {submission._id}</div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-400 font-semibold">Submitted On</span>
                              <span className="text-sm font-semibold">
                                {submission.submissionDate ? new Date(submission.submissionDate).toLocaleString() : "-"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-400 font-semibold">Reviewed On</span>
                              <span className="text-sm font-semibold">
                                {submission.reviewDate ? new Date(submission.reviewDate).toLocaleString() : "-"}
                              </span>
                            </div>
                          </div>
                          {submission.remarks && (
                            <div className="flex flex-col mt-2 p-3 border border-gray-100 dark:border-gray-700 bg-white dark:bg-[#1a1c23] rounded">
                              <span className="text-xs text-gray-500 font-bold uppercase mb-1">Remarks:</span>
                              <p className="text-sm font-medium">{submission.remarks}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Admin Actions Panel */}
                {!doctorProfile.isNewUser && (
                  <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold mb-4">Verification Terminal</h3>
                    {(doctorProfile.verificationStatus === "pending" ||
                      doctorProfile.verificationStatus === "resubmitted") &&
                      doctorProfile.activeSubmissionId ? (
                      <>
                        <div className="mb-4">
                          <label htmlFor="remarks" className="block text-sm font-semibold text-gray-500 uppercase mb-2">
                            Verification Comments / Remarks
                          </label>
                          <textarea
                            id="remarks"
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-lightGreen bg-gray-50 dark:bg-[#1a1c23] resize-none text-sm"
                            placeholder="Enter audit comments for approval or rejection reasons..."
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                          />
                        </div>

                        <div className="flex justify-end gap-3">
                          <button
                            onClick={handleRejectClick}
                            disabled={!remarks.trim()}
                            className={`px-4 py-2 rounded font-semibold text-sm transition-all ${!remarks.trim()
                              ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                              : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/60"
                              }`}
                          >
                            Reject Verification
                          </button>

                          <button
                            onClick={handleApproveClick}
                            className="px-4 py-2 rounded font-semibold text-sm bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/60 transition-all"
                          >
                            Approve Verification
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="bg-gray-50 dark:bg-[#1f2128] border border-gray-100 dark:border-gray-700 p-4 rounded text-center text-sm font-semibold text-gray-500">
                        {doctorProfile.verificationStatus === "verified"
                          ? "✅ Doctor is verified. No further action needed."
                          : "⚠️ Profile is in onboarding. Waiting for document submission."}
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal({ isOpen: false, type: null })}
        onConfirm={handleConfirmAction}
        title={confirmationModal.type === "approve" ? "Approve Verification" : "Reject Verification"}
        message={`Are you sure you want to ${confirmationModal.type === "approve" ? "APPROVE" : "REJECT"
          } the professional verification of Dr. ${doctorProfile.name}?`}
        confirmText={confirmationModal.type === "approve" ? "Approve" : "Reject"}
        isDestructive={confirmationModal.type === "reject"}
      />
    </>
  );
};

export default AViewDoctorPage;
