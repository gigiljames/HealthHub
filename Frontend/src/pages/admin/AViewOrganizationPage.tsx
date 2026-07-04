import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import ASidebar from "../../components/admin/ASidebar";
import AMobileSidebar from "../../components/admin/AMobileSidebar";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { adminGetOrganizationById, adminUpdateOrganizationStatus } from "../../api/organization/organizationService";
import getIcon from "../../helpers/getIcon";
import toast from "react-hot-toast";

function AViewOrganizationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  document.title = "Review Organization - Admin";

  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Rejection modal states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Dynamic confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => { },
  });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    adminGetOrganizationById(id)
      .then((response) => {
        if (response?.success && response.organization) {
          setOrg(response.organization);
        } else {
          toast.error(response?.message || "Failed to load organization details.");
          navigate("/admin/hospital-management");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error loading organization details.");
        navigate("/admin/hospital-management");
      })
      .finally(() => setLoading(false));
  }, [id, refreshTrigger, navigate]);

  const handleApprove = () => {
    setConfirmModal({
      isOpen: true,
      title: "Approve Organization",
      message: `Are you sure you want to approve "${org.name}"? This will generate a unique 6-character code and email it to them.`,
      confirmText: "Approve",
      isDestructive: false,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setIsSubmittingAction(true);
        try {
          const response = await adminUpdateOrganizationStatus(id!, "approve");
          if (response?.success) {
            toast.success("Organization approved successfully!");
            setRefreshTrigger((prev) => prev + 1);
          } else {
            toast.error(response?.message || "Failed to approve organization.");
          }
        } catch (err) {
          console.error(err);
          toast.error("An error occurred during approval.");
        } finally {
          setIsSubmittingAction(false);
        }
      },
    });
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      toast.error("Please enter a rejection reason.");
      return;
    }

    setIsSubmittingAction(true);
    try {
      const response = await adminUpdateOrganizationStatus(id!, "reject", rejectionReason.trim());
      if (response?.success) {
        toast.success("Organization registration rejected.");
        setShowRejectModal(false);
        setRejectionReason("");
        setRefreshTrigger((prev) => prev + 1);
      } else {
        toast.error(response?.message || "Failed to reject organization.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during rejection.");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleBlockToggle = () => {
    const action = org.isBlocked ? "unblock" : "block";
    const confirmMsg = org.isBlocked
      ? `Are you sure you want to unblock "${org.name}"? This will restore all associated doctor practice locations.`
      : `Are you sure you want to block "${org.name}"? This will disable all associated doctor practice locations and prevent bookings.`;

    setConfirmModal({
      isOpen: true,
      title: org.isBlocked ? "Unblock Organization" : "Block Organization",
      message: confirmMsg,
      confirmText: org.isBlocked ? "Unblock" : "Block",
      isDestructive: !org.isBlocked,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setIsSubmittingAction(true);
        try {
          const response = await adminUpdateOrganizationStatus(id!, action);
          if (response?.success) {
            toast.success(`Organization ${action}ed successfully!`);
            setRefreshTrigger((prev) => prev + 1);
          } else {
            toast.error(response?.message || `Failed to ${action} organization.`);
          }
        } catch (err) {
          console.error(err);
          toast.error(`An error occurred during ${action} operation.`);
        } finally {
          setIsSubmittingAction(false);
        }
      },
    });
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "VERIFIED":
        return "text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
      case "PENDING":
        return "text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
      case "REJECTED":
        return "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
      default:
        return "text-gray-600 bg-gray-100 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600";
    }
  };

  // Google Maps link constructor using coordinates [longitude, latitude]
  const mapsLink = org?.location?.coordinates
    ? `https://www.google.com/maps/search/?api=1&query=${org.location.coordinates[1]},${org.location.coordinates[0]}`
    : null;

  return (
    <>
      <AMobileSidebar page="hospital-management" />
      <div className="flex w-full flex-col lg:flex-row">
        <ASidebar page="hospital-management" />
        <div className="w-screen lg:flex-1 relative">
          <div className="flex flex-col gap-4 p-4 h-screen overflow-y-auto bg-[#f3f4f6] dark:bg-[#1a1c23] text-gray-800 dark:text-gray-200 transition-colors duration-200 animate-fade-in pb-10">

            {/* Header */}
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <button
                onClick={() => navigate("/admin/hospital-management")}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-800 dark:text-gray-200"
              >
                {getIcon("left", "20px", "currentColor")}
              </button>
              {org && (
                <>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold">{org.name}</h1>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${org.organizationType === "HOSPITAL" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" : "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"}`}>
                        {org.organizationType}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">Registered Email: <strong className="text-gray-600 dark:text-gray-300 font-semibold">{org.email}</strong></p>
                  </div>
                  <div className="ml-auto flex items-center gap-2 flex-wrap">
                    {org.verificationStatus === "VERIFIED" && (
                      <span className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-[#252831] font-mono tracking-wider font-extrabold text-emerald-800 dark:text-emerald-400 shadow-sm">
                        Code: {org.organizationCode}
                      </span>
                    )}
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(org.verificationStatus)}`}
                    >
                      {org.verificationStatus}
                    </span>
                  </div>
                </>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-lightGreen"></div>
              </div>
            ) : org ? (
              <>
                {/* Action Ribbon & Block Banner */}
                {org.isBlocked && (
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-4 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400 text-sm font-semibold">
                    <svg className="w-5 h-5 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <span>This organization is currently BLOCKED.</span>
                      <p className="text-xs font-normal text-red-500 mt-0.5">All linked doctor practice locations are set to inactive and slots cannot be booked.</p>
                    </div>
                  </div>
                )}

                {/* Rejected Status Reason Info Box */}
                {org.verificationStatus === "REJECTED" && (
                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 p-5 rounded-lg">
                    <h2 className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-2">Rejection History</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">The application registration was rejected for the following reason:</p>
                    <blockquote className="mt-3 p-3 bg-white dark:bg-[#1a1c23] border-l-4 border-amber-500 rounded text-sm text-gray-700 dark:text-gray-300 italic border-amber-400">
                      {org.rejectionReason}
                    </blockquote>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Address & Geolocation Card */}
                  <div className="bg-white dark:bg-[#252831] p-5 rounded-lg border border-gray-100 dark:border-gray-800">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Address &amp; Location
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="sm:col-span-2">
                        <p className="text-xs text-gray-400 mb-1">Physical Address</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-100">
                          {org.location?.address || "No address submitted"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Coordinates (Longitude, Latitude)</p>
                        <p className="text-gray-700 dark:text-gray-300 font-mono">
                          [{org.location?.coordinates?.[0] || "-"}, {org.location?.coordinates?.[1] || "-"}]
                        </p>
                      </div>
                      {mapsLink && (
                        <div className="flex items-end">
                          <a
                            href={mapsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-semibold hover:underline bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 py-2 px-4 rounded-lg shadow-sm"
                          >
                            🗺️ Open in Google Maps
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bank payout Details Card */}
                  <div className="bg-white dark:bg-[#252831] p-5 rounded-lg border border-gray-100 dark:border-gray-800">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Bank Details
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Account Holder</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-100">
                          {org.accountHolderName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Bank Name</p>
                        <p className="text-gray-700 dark:text-gray-300">
                          {org.bankName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Account Number</p>
                        <p className="text-gray-700 dark:text-gray-300 font-mono">
                          {org.accountNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">IFSC Code</p>
                        <p className="text-gray-700 dark:text-gray-300 font-mono">
                          {org.ifscCode}
                        </p>
                      </div>
                    </div>
                    {org.upiId && (
                      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-xs text-gray-400 mb-1">UPI ID</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-100">
                          {org.upiId}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Moderation Panel Cards */}
                <div className="bg-white dark:bg-[#252831] p-5 rounded-lg border border-gray-100 dark:border-gray-800 space-y-4">
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 dark:border-gray-800 pb-2 mb-3">
                    Moderation Actions
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {org.verificationStatus === "PENDING" && (
                      <>
                        <button
                          onClick={handleApprove}
                          disabled={isSubmittingAction}
                          className="py-2.5 px-6 bg-darkGreen text-white text-xs font-bold rounded-md hover:bg-darkGreen/90 transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                        >
                          Approve Registration
                        </button>
                        <button
                          onClick={() => setShowRejectModal(true)}
                          disabled={isSubmittingAction}
                          className="py-2.5 px-6 bg-red-50 text-red-655 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900/30 text-xs font-bold rounded-md hover:bg-red-100/50 transition-all disabled:opacity-50"
                        >
                          Reject Request
                        </button>
                      </>
                    )}
                    <button
                      onClick={handleBlockToggle}
                      disabled={isSubmittingAction}
                      className={`py-2.5 px-6 text-xs font-bold rounded-md border transition-all disabled:opacity-50 ${org.isBlocked
                          ? "bg-emerald-50 text-emerald-700 border-emerald-250 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-800"
                          : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800"
                        }`}
                    >
                      {org.isBlocked ? "Unblock Account" : "Block Account"}
                    </button>
                  </div>
                </div>

                {/* Submission History Card */}
                {org.submissionHistory && org.submissionHistory.length > 0 && (
                  <div className="bg-white dark:bg-[#252831] p-5 rounded-lg border border-gray-100 dark:border-gray-800 space-y-4">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 dark:border-gray-800 pb-2 mb-3">
                      Submission & Review History Logs
                    </h2>
                    <div className="relative pl-6 border-l border-gray-200 dark:border-gray-700 space-y-6 ml-2">
                      {org.submissionHistory.map((item: any, idx: number) => (
                        <div key={idx} className="relative">
                          {/* Timeline dot */}
                          <span className={`absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#252831] ${item.status === 'VERIFIED' ? 'bg-green-500' :
                              item.status === 'REJECTED' ? 'bg-red-500' :
                                'bg-yellow-500'
                            }`} />
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-850 dark:text-gray-200">
                                {item.status === 'VERIFIED' ? 'Enrolment Approved' :
                                  item.status === 'REJECTED' ? 'Enrolment Rejected' :
                                    'Enrolment Submitted'}
                              </p>
                              {item.status === 'REJECTED' && item.rejectionReason && (
                                <p className="text-xs text-red-600 dark:text-red-400 mt-1.5 bg-red-50/50 dark:bg-red-950/20 p-2.5 rounded-lg border border-red-100 dark:border-red-900/30 font-mono italic">
                                  Reason: {item.rejectionReason}
                                </p>
                              )}
                            </div>
                            <span className="text-[11px] text-gray-400 dark:text-gray-500 font-mono shrink-0">{new Date(item.submittedAt).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Audit Metadata Card */}
                <div className="bg-white dark:bg-[#252831] p-5 rounded-lg border border-gray-100 dark:border-gray-800">
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Audit Metadata
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium">
                    <div>
                      <span className="text-gray-400 block mb-0.5">Registration ID</span>
                      <span className="font-mono text-gray-700 dark:text-gray-300">{org.id}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-0.5">Registered At</span>
                      <span className="text-gray-700 dark:text-gray-300">{new Date(org.createdAt).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-0.5">Last Updated</span>
                      <span className="text-gray-700 dark:text-gray-300">{new Date(org.updatedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500">Organization profile not found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div className="fixed top-0 left-0 z-50 bg-black/40 h-screen w-screen flex justify-center items-center px-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#252831] rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-150 dark:border-gray-800">
              <h3 className="font-bold text-gray-800 dark:text-gray-200">Reject Registration Application</h3>
              <p className="text-gray-400 text-xs mt-0.5">Provide a clear, detailed reason explaining why this request is being rejected.</p>
            </div>

            <form onSubmit={handleRejectSubmit}>
              <div className="p-6">
                <textarea
                  required
                  placeholder="e.g. Invalid bank credentials or location address doesn't match the coordinates. Please resubmit with matching details."
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-3 border border-gray-200 dark:border-gray-750 bg-white dark:bg-[#1a1c23] rounded-lg outline-none text-sm transition-all focus:border-darkGreen focus:ring-1 focus:ring-darkGreen text-gray-800 dark:text-gray-200"
                />
              </div>

              <div className="bg-gray-50 dark:bg-[#1f2128] px-6 py-4 flex justify-end gap-3 border-t border-gray-150 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason("");
                  }}
                  className="py-2.5 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAction}
                  className="py-2.5 px-6 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  {isSubmittingAction ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        isDestructive={confirmModal.isDestructive}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
      />
    </>
  );
}

export default AViewOrganizationPage;
