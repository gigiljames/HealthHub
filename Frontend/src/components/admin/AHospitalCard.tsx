import { useEffect, useState } from "react";
import { getHospital, verifyHospital } from "../../api/admin/hospitalService";
import { useAdminStore } from "../../zustand/adminStore";
import getIcon from "../../helpers/getIcon";
import ConfirmationModal from "../common/ConfirmationModal";
import toast from "react-hot-toast";

interface HospitalProfile {
  id: string;
  name: string;
  email: string;
  isBlocked: boolean;
  isNewUser: boolean;
  profile?: {
    type?: string;
    establishedYear?: number;
    about?: string;
    location?: number[];
    profileImageUrl?: string;
    bannerImageUrl?: string;
    certificates?: {
      hospitalRegistration: string;
      gstCertificate: string;
    };
    features?: string[];
    contact?: {
      address?: string;
      phone?: string;
      email?: string;
      website?: string;
    };
    verificationStatus?: string;
    verificationRemarks?: string;
    lastUpdated?: Date;
    acceptedTerms?: boolean;
    submissionDate?: Date;
  };
}

function AHospitalCard() {
  const hospitalId = useAdminStore((state) => state.hospitalId);
  const toggleHospitalCard = useAdminStore((state) => state.toggleHospitalCard);
  const [hospitalProfile, setHospitalProfile] =
    useState<HospitalProfile | null>(null);
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
    if (!hospitalId || !confirmationModal.type) return;

    try {
      const isApproved = confirmationModal.type === "approve";
      const response = await verifyHospital(hospitalId, isApproved, remarks);
      if (response && response.success) {
        const data = await getHospital(hospitalId);
        if (data.success) {
          setHospitalProfile(data.hospital);
        }
        setConfirmationModal({ isOpen: false, type: null });
        setRemarks("");
        toast.success("Hospital verification status updated successfully.");
      } else {
        toast.error(response?.message || "Error verifying hospital.");
      }
    } catch (error) {
      toast.error("Error verifying hospital.");
    }
  };

  useEffect(() => {
    if (!hospitalId) return;

    const fetchHospitalProfile = async () => {
      try {
        setLoading(true);
        const data = await getHospital(hospitalId);
        if (data.success) {
          setHospitalProfile(data.hospital);
        }
      } catch (error) {
        console.error("Error fetching hospital profile:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchHospitalProfile();
  }, [hospitalId]);

  if (loading) {
    return (
      <div
        className="absolute top-0 h-screen w-full flex justify-center items-center bg-black/50 z-50 px-2"
        onClick={(e) => {
          e.stopPropagation();
          toggleHospitalCard();
        }}
      >
        <div
          className="relative flex flex-col justify-center items-center bg-white p-6 rounded-xl gap-3 w-full lg:w-fit min-w-[350px] max-w-[500px]"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lightGreen"></div>
            <p className="text-gray-600 font-medium">
              Loading hospital profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!hospitalProfile) {
    return (
      <div
        className="absolute top-0 h-screen w-full flex justify-center items-center bg-black/50 z-50 px-2"
        onClick={(e) => {
          e.stopPropagation();
          toggleHospitalCard();
        }}
      >
        <div
          className="relative flex flex-col justify-center items-center bg-white p-6 rounded-xl gap-3 w-full lg:w-fit min-w-[350px] max-w-[500px]"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="flex flex-col items-center gap-4 w-full">
            <p className="text-red-500 font-medium">
              Failed to load hospital profile
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute top-0 h-screen w-full flex justify-center items-center bg-black/50 z-50 px-2"
      onClick={(e) => {
        e.stopPropagation();
        toggleHospitalCard();
      }}
    >
      <div
        className="relative flex flex-col bg-white p-6 rounded-xl gap-4 w-full lg:w-fit min-w-[400px] max-w-[600px] max-h-[80vh] overflow-y-auto"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b-1 border-b-gray-200 pb-3">
          <h1 className="font-bold text-xl text-black">Hospital Profile</h1>
          <button
            onClick={() => toggleHospitalCard()}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors duration-200"
          >
            {getIcon("close", "24px", "#000000")}
          </button>
        </div>

        {/* Profile Content */}
        <div className="flex flex-col gap-4">
          {/* Profile Header with Banner and Avatar */}
          <div className="relative rounded-lg overflow-hidden">
            {hospitalProfile.profile?.bannerImageUrl ? (
              <img
                src={hospitalProfile.profile.bannerImageUrl}
                alt="Banner"
                className="w-full h-32 object-cover"
              />
            ) : (
              <div className="w-full h-32 bg-gray-200"></div>
            )}
            <div className="absolute -bottom-12 left-4">
              <div className="w-24 h-24 rounded-full bg-white border-4 border-white flex items-center justify-center">
                {hospitalProfile.profile?.profileImageUrl ? (
                  <img
                    src={hospitalProfile.profile.profileImageUrl}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="text-2xl font-bold text-gray-600">
                    {hospitalProfile.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-12">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-semibold text-xl text-black">
                  {hospitalProfile.name}
                </h2>
                <p className="text-sm text-gray-600">{hospitalProfile.email}</p>
              </div>
              <div className="flex gap-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    hospitalProfile.isBlocked
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {hospitalProfile.isBlocked ? "Blocked" : "Active"}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    hospitalProfile.profile?.verificationStatus === "verified"
                      ? "bg-blue-100 text-blue-700"
                      : hospitalProfile.profile?.verificationStatus ===
                          "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {hospitalProfile.profile?.verificationStatus?.toUpperCase() ||
                    "PENDING"}
                </span>
              </div>
            </div>
          </div>

          {/* Hospital Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-sm text-gray-700 mb-3 uppercase tracking-wider">
              Hospital Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 font-medium">Type</p>
                <p className="text-sm text-black font-medium">
                  {hospitalProfile.profile?.type || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">
                  Established Year
                </p>
                <p className="text-sm text-black font-medium">
                  {hospitalProfile.profile?.establishedYear || "-"}
                </p>
              </div>
              {hospitalProfile.profile?.contact?.phone && (
                <div>
                  <p className="text-xs text-gray-500 font-medium">Phone</p>
                  <p className="text-sm text-black font-medium">
                    {hospitalProfile.profile.contact.phone}
                  </p>
                </div>
              )}
              {hospitalProfile.profile?.contact?.website && (
                <div>
                  <p className="text-xs text-gray-500 font-medium">Website</p>
                  <a
                    href={
                      hospitalProfile.profile.contact.website.startsWith("http")
                        ? hospitalProfile.profile.contact.website
                        : `https://${hospitalProfile.profile.contact.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline font-medium"
                  >
                    {hospitalProfile.profile.contact.website}
                  </a>
                </div>
              )}
              {hospitalProfile.profile?.contact?.address && (
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500 font-medium">Address</p>
                  <p className="text-sm text-black font-medium">
                    {hospitalProfile.profile.contact.address}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* About Section */}
          {hospitalProfile.profile?.about && (
            <div className="bg-white rounded-lg p-4 border-1 border-gray-200">
              <h3 className="font-semibold text-sm text-gray-700 mb-2 uppercase tracking-wider">
                About
              </h3>
              <p className="text-sm text-gray-700">
                {hospitalProfile.profile.about}
              </p>
            </div>
          )}

          {/* Features */}
          {hospitalProfile.profile?.features &&
            hospitalProfile.profile.features.length > 0 && (
              <div className="bg-white rounded-lg p-4 border-1 border-gray-200">
                <h3 className="font-semibold text-sm text-gray-700 mb-2 uppercase tracking-wider">
                  Features
                </h3>
                <div className="flex flex-wrap gap-2">
                  {hospitalProfile.profile.features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {/* Verification Details */}
          <div className="bg-white rounded-lg p-4 border-1 border-gray-200">
            <h3 className="font-semibold text-sm text-gray-700 mb-2 uppercase tracking-wider">
              Verification Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 font-medium">
                  Profile Status
                </p>
                <p className="text-sm text-black font-medium">
                  {hospitalProfile.isNewUser ? "New User" : "Profile Completed"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">
                  Submission Date
                </p>
                <p className="text-sm text-black font-medium">
                  {hospitalProfile.profile?.submissionDate
                    ? new Date(
                        hospitalProfile.profile.submissionDate
                      ).toLocaleDateString()
                    : "-"}
                </p>
              </div>
              {hospitalProfile.profile?.verificationRemarks && (
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500 font-medium">Remarks</p>
                  <p className="text-sm text-black font-medium">
                    {hospitalProfile.profile.verificationRemarks}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Verification Actions */}
        {!hospitalProfile.isNewUser && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Verification Actions
            </h3>

            {/* Existing Remarks */}
            {hospitalProfile.profile?.verificationRemarks && (
              <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                <p className="text-sm font-medium text-yellow-800 mb-1">
                  Previous Verification Remarks
                </p>
                <p className="text-gray-700">
                  {hospitalProfile.profile.verificationRemarks}
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

              {(hospitalProfile.profile?.verificationStatus === "pending" ||
                hospitalProfile.profile?.verificationStatus === "rejected") && (
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
        } verification of this hospital?`}
        confirmText={
          confirmationModal.type === "approve" ? "Approve" : "Reject"
        }
        isDestructive={confirmationModal.type === "reject"}
      />
    </div>
    // </div>
  );
}

export default AHospitalCard;
