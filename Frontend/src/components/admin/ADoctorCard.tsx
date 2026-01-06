import { useEffect, useState } from "react";
import getIcon from "../../helpers/getIcon";
import { useAdminStore } from "../../zustand/adminStore";
import { getDoctor, verifyDoctor } from "../../api/admin/doctorService";
import ConfirmationModal from "../common/ConfirmationModal";
import toast from "react-hot-toast";

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
  verificationStatus?: string;
  verificationRemarks?: string;
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
  independentFee?: number;
  isVisible?: boolean;
  lastUpdated?: Date;
}

function ADoctorCard() {
  const doctorId = useAdminStore((state) => state.doctorId);
  const toggleDoctorCard = useAdminStore((state) => state.toggleDoctorCard);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(
    null
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
        }
        setConfirmationModal({ isOpen: false, type: null });
        setRemarks("");
        toast.success("Doctor verification status updated successfully.");
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
          <div className="relative h-32 bg-gray-200 rounded-lg">
            {doctorProfile.bannerImageUrl ? (
              <img
                src={doctorProfile.bannerImageUrl}
                alt="Banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500/60 font-medium">
                No banner image
              </div>
            )}
            {/* Profile Image */}
            <div className="absolute -bottom-12 left-6">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-white">
                {doctorProfile.profileImageUrl ? (
                  <img
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
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    doctorProfile.isBlocked
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {doctorProfile.isBlocked ? "Blocked" : "Active"}
                </span>
                {doctorProfile.verificationStatus && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      doctorProfile.verificationStatus === "verified"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {doctorProfile.verificationStatus === "verified"
                      ? "Verified"
                      : doctorProfile.verificationStatus === "rejected"
                        ? "Rejected"
                        : "Pending Verification"}
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
                <p className="text-sm text-gray-500">
                  Independent Consultation Fee
                </p>
                <p className="font-medium">
                  Rs. {doctorProfile.independentFee}
                </p>
              </div>
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
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">About</h3>
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

        {/* Verification Actions */}
        {!doctorProfile.isNewUser && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Verification Actions
            </h3>

            {/* Existing Remarks */}
            {doctorProfile.verificationRemarks && (
              <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                <p className="text-sm font-medium text-yellow-800 mb-1">
                  Previous Verification Remarks
                </p>
                <p className="text-gray-700">
                  {doctorProfile.verificationRemarks}
                </p>
              </div>
            )}

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

            {/* Action Buttons */}
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

              {(doctorProfile.verificationStatus === "pending" ||
                doctorProfile.verificationStatus === "rejected") && (
                <button
                  onClick={handleApproveClick}
                  className="px-4 py-2 rounded-md font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                >
                  Approve Verification
                </button>
              )}
            </div>
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
