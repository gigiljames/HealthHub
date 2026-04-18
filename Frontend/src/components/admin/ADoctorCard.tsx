import { useEffect, useState } from "react";
import getIcon from "../../helpers/getIcon";
import { useAdminStore } from "../../zustand/adminStore";
import { getDoctor, verifyDoctor } from "../../api/admin/doctorService";
import ConfirmationModal from "../common/ConfirmationModal";
import toast from "react-hot-toast";
import { getStatusBadge } from "../../helpers/getStatusBadge";
import Avatar from "../common/Avatar";
import BannerImage from "../common/BannerImage";

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

function ADoctorCard() {
  const doctorId = useAdminStore((state) => state.doctorId);
  const toggleDoctorCard = useAdminStore((state) => state.toggleDoctorCard);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(
    null,
  );
  const [verificationSubmissions, setVerificationSubmissions] = useState<any[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState("");
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    type: "approve" | "reject" | null;
  }>({
    isOpen: false,
    type: null,
  });

  const handleApproveClick = () => {
    setConfirmationModal({ isOpen: true, type: "approve" });
  };

  const handleRejectClick = () => {
    if (!remarks.trim()) return;
    setConfirmationModal({ isOpen: true, type: "reject" });
  };

  const handleConfirmAction = async () => {
    if (!doctorId || !confirmationModal.type) return;

    try {
      const isApproved = confirmationModal.type === "approve";
      const response = await verifyDoctor(doctorId, isApproved, remarks);
      if (response && response.success) {
        const data = await getDoctor(doctorId);
        if (data.success) {
          setDoctorProfile(data.doctor);
          let submissions = [...data.doctor.verificationSubmissions].map(
            (val) => {
              return {
                ...val,
                date: new Date(val.submissionDate),
              };
            },
          );
          submissions.sort((a, b) => b.date.getTime() - a.date.getTime());
          setVerificationSubmissions(submissions);
        }
        setConfirmationModal({ isOpen: false, type: null });
        setRemarks("");
        toast.success("Doctor verification status updated successfully.");
      } else if (response.success === false) {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error verifying doctor.");
    }
  };

  useEffect(() => {
    if (!doctorId) return;

    const fetchDoctorProfile = async () => {
      try {
        setLoading(true);
        const data = await getDoctor(doctorId);
        if (data.success) {
          setDoctorProfile(data.doctor);
          let submissions = [...data.doctor.verificationSubmissions].map(
            (val) => {
              return {
                ...val,
                date: new Date(val.submissionDate),
              };
            },
          );
          submissions.sort((a, b) => b.date.getTime() - a.date.getTime());
          setVerificationSubmissions(submissions);
        }
      } catch (error) {
        console.error("Error fetching doctor profile:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchDoctorProfile();
  }, [doctorId]);

  if (loading) {
    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={(e) => {
          e.stopPropagation();
          toggleDoctorCard();
        }}
      >
        <div
          className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lightGreen"></div>
            <p className="mt-4 text-gray-600">Loading doctor profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!doctorProfile) {
    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={(e) => {
          e.stopPropagation();
          toggleDoctorCard();
        }}
      >
        <div
          className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center py-8">
            <p className="text-red-500 font-medium">
              Failed to load doctor profile
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={(e) => {
        e.stopPropagation();
        toggleDoctorCard();
      }}
    >
      <div
        className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Doctor Profile</h2>
          <button
            onClick={toggleDoctorCard}
            className="text-gray-500 hover:text-gray-700"
          >
            {getIcon("close", "24px", "#364153")}
          </button>
        </div>

        {/* Profile Header */}
        <div className="mt-6">
          {/* Banner Image */}
          <div className="relative h-38 bg-gray-200 rounded-lg">
            <BannerImage
              src={doctorProfile.bannerImageUrl}
              alt="Banner"
              className="w-full h-full object-cover rounded-lg"
            />
            {/* Profile Image */}
            <div className="absolute -bottom-12 left-6">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-white">
                {doctorProfile.profileImageUrl ? (
                  <Avatar
                    src={doctorProfile.profileImageUrl}
                    alt={doctorProfile.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-400">
                    {doctorProfile.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Doctor Info */}
          <div className="mt-14 pl-2">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {doctorProfile.name}
                </h1>
                <p className="text-gray-600">
                  {doctorProfile.specialization || ""}
                </p>
              </div>
              <div className="flex gap-2">
                <span
                  className={`px-5 py-2 rounded-full text-xs lg:text-sm font-medium ${
                    doctorProfile.isBlocked
                      ? "bg-red-100 text-red-700 border border-red-300"
                      : "bg-green-100 text-green-700 border border-green-300"
                  }`}
                >
                  {doctorProfile.isBlocked ? "Blocked" : "Active"}
                </span>
                {doctorProfile.verificationStatus && (
                  <span
                    className={`px-5 py-2 rounded-full text-xs lg:text-sm font-medium ${
                      doctorProfile.verificationStatus === "verified"
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : doctorProfile.verificationStatus === "rejected"
                          ? "bg-red-100 text-red-700 border border-red-300"
                          : doctorProfile.verificationStatus === "pending"
                            ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                            : "bg-blue-100 text-blue-700 border border-blue-300"
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

            {/* Contact Info */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{doctorProfile.email}</p>
              </div>
              {doctorProfile.phone && (
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{doctorProfile.phone}</p>
                </div>
              )}
              {doctorProfile.dob && (
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium">
                    {new Date(doctorProfile.dob).toLocaleDateString()}
                  </p>
                </div>
              )}
              {doctorProfile.gender && (
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium capitalize">
                    {doctorProfile.gender}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500">Profile Status</p>
                <p className="font-medium">
                  {doctorProfile.isNewUser ? "New User" : "Profile Completed"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Visibility</p>
                <p className="font-medium">
                  {doctorProfile.isVisible ? "Visible" : "Hidden"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        {doctorProfile.about && (
          <div className="mt-6 p-4 bg-gray-50 border-1 border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">About</h3>
            <p className="text-gray-700">{doctorProfile.about}</p>
          </div>
        )}

        {/* Education */}
        {doctorProfile.education && doctorProfile.education.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Education
            </h3>
            <div className="space-y-4">
              {doctorProfile.education.map((edu, index) => (
                <div
                  key={index}
                  className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm"
                >
                  <h4 className="font-medium text-gray-900">{edu.title}</h4>
                  <p className="text-gray-600">{edu.institution}</p>
                  <p className="text-sm text-gray-500">
                    Graduated: {edu.graduationYear}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {doctorProfile.experience && doctorProfile.experience.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Work Experience
            </h3>
            <div className="space-y-4">
              {doctorProfile.experience.map((exp, index) => (
                <div
                  key={index}
                  className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm"
                >
                  <h4 className="font-medium text-gray-900">
                    {exp.designation}
                  </h4>
                  <p className="text-gray-600">{exp.hospital}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(exp.startDate).toLocaleDateString()} -{" "}
                    {exp.endDate
                      ? new Date(exp.endDate).toLocaleDateString()
                      : "Present"}{" "}
                    - {exp.type}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents */}
        {doctorProfile.certificates && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Documents
            </h3>
            <div className="space-y-4">
              {doctorProfile.certificates.medicalLicense && (
                <div className="bg-gray-50 p-4 rounded-lg border-1 border-gray-200 flex justify-between items-center">
                  <h4 className="font-medium text-gray-900">Medical License</h4>
                  <a
                    href={doctorProfile.certificates.medicalLicense}
                    download
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Download
                  </a>
                </div>
              )}
              {doctorProfile.certificates.latestDegree && (
                <div className="bg-gray-50 p-4 rounded-lg border-1 border-gray-200 flex justify-between items-center">
                  <h4 className="font-medium text-gray-900">Latest Degree</h4>
                  <a
                    href={doctorProfile.certificates.latestDegree}
                    download
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Download
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Verification Actions */}
        {!doctorProfile.isNewUser && (
          <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Verification Actions
            </h3>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">
                Submission History
              </h3>
              {verificationSubmissions.length === 0 ? (
                <div className="text-center text-gray-500 py-8 border-dashed border-2 border-gray-200 rounded-xl">
                  No submission history available.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {verificationSubmissions.map(
                    (submission: VerificationSubmission) => (
                      <div
                        key={submission._id}
                        className="flex md:flex-row p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors gap-4"
                      >
                        <div className=" rounded-lg flex items-start justify-center text-2xl">
                          {submission.status === "verified" && (
                            <div className="text-green-500 bg-green-100 p-2 rounded-lg">
                              {getIcon("tick")}
                            </div>
                          )}
                          {submission.status === "rejected" && (
                            <div className="text-red-500 bg-red-100 p-2 rounded-lg">
                              {getIcon("cancel")}
                            </div>
                          )}
                          {submission.status === "pending" && (
                            <div className="text-yellow-500 bg-yellow-100 p-2 rounded-lg">
                              {getIcon("hour-glass")}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                              {getStatusBadge(submission.status)}
                            </div>
                          </div>
                          <div className="grid grid-cols-2">
                            <div className="flex flex-col gap-1 min-w-[150px]">
                              <span className="text-xs text-gray-400 font-medium">
                                Submitted On
                              </span>
                              <span className="text-sm text-gray-600">
                                {submission.submissionDate
                                  ? new Date(
                                      submission.submissionDate,
                                    ).toLocaleString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "-"}
                              </span>
                            </div>
                            <div className="flex flex-col gap-1 min-w-[150px]">
                              <span className="text-xs text-gray-400 font-medium">
                                Reviewed On
                              </span>
                              <span className="text-sm text-gray-600">
                                {submission.reviewDate
                                  ? new Date(
                                      submission.reviewDate,
                                    ).toLocaleString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "-"}
                              </span>
                            </div>
                          </div>
                          {submission.remarks && (
                            <div className="flex flex-col text-sm mt-1 w-full p-2 border-1 border-gray-200 bg-gray-50 rounded-lg">
                              <span className="font-medium text-gray-600 ">
                                Remarks:
                              </span>
                              <span className="text-gray-600 text-xs lg:text-sm ">
                                {submission.remarks}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
            {(doctorProfile.verificationStatus === "pending" ||
              doctorProfile.verificationStatus === "resubmitted") &&
              doctorProfile.activeSubmissionId && (
                <>
                  {/* New Remarks Input */}
                  <div className="mb-4">
                    <label
                      htmlFor="remarks"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Add Verification Remarks
                    </label>
                    <textarea
                      id="remarks"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Enter remarks for approval or rejection..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={handleRejectClick}
                      disabled={!remarks.trim()}
                      className={`px-4 py-2 rounded-md font-medium transition-colors ${
                        !remarks.trim()
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-red-100 text-red-700 hover:bg-red-200"
                      }`}
                    >
                      Reject Verification
                    </button>

                    <button
                      onClick={handleApproveClick}
                      className="px-4 py-2 rounded-md font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                    >
                      Approve Verification
                    </button>
                  </div>
                </>
              )}
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal({ isOpen: false, type: null })}
        onConfirm={handleConfirmAction}
        title={
          confirmationModal.type === "approve"
            ? "Approve Verification"
            : "Reject Verification"
        }
        message={`Do you want to ${
          confirmationModal.type === "approve" ? "approve" : "reject"
        } verification of this doctor?`}
        confirmText={
          confirmationModal.type === "approve" ? "Approve" : "Reject"
        }
        isDestructive={confirmationModal.type === "reject"}
      />
    </div>
  );
}

export default ADoctorCard;
