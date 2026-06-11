import { useState, useEffect } from "react";
import { Link } from "react-router";
import LocationPicker from "../../components/common/LocationPicker";
import { sendStatusOtp, checkStatus, resubmitEnrolment } from "../../api/organization/organizationService";
import toast from "react-hot-toast";

interface LocationData {
  coordinates: number[];
  address: string;
  placeId: string;
}

function UOrganizationStatusPage() {
  const [step, setStep] = useState<"EMAIL" | "OTP" | "STATUS">("EMAIL");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // Retrieved organization details
  const [orgData, setOrgData] = useState<any>(null);

  // Edit / Resubmit form state (used if status is REJECTED)
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<string>("");
  const [editLocation, setEditLocation] = useState<LocationData | null>(null);
  const [editHolderName, setEditHolderName] = useState("");
  const [editBankName, setEditBankName] = useState("");
  const [editAccountNumber, setEditAccountNumber] = useState("");
  const [editIfscCode, setEditIfscCode] = useState("");
  const [editUpiId, setEditUpiId] = useState("");

  // Resubmission OTP modal states
  const [showResubmitOtpModal, setShowResubmitOtpModal] = useState(false);
  const [resubmitOtpVal, setResubmitOtpVal] = useState("");
  const [isSubmittingResubmit, setIsSubmittingResubmit] = useState(false);

  // Populate edit form when orgData changes and status is REJECTED
  useEffect(() => {
    if (orgData && orgData.verificationStatus === "REJECTED") {
      setEditName(orgData.name || "");
      setEditType(orgData.organizationType || "");
      setEditHolderName(orgData.accountHolderName || "");
      setEditBankName(orgData.bankName || "");
      setEditAccountNumber(orgData.accountNumber || "");
      setEditIfscCode(orgData.ifscCode || "");
      setEditUpiId(orgData.upiId || "");
      if (orgData.location) {
        setEditLocation({
          coordinates: orgData.location.coordinates,
          address: orgData.location.address,
          placeId: orgData.location.placeId,
        });
      }
    }
  }, [orgData]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await sendStatusOtp(email);
      if (response?.success) {
        toast.success("OTP sent to your email!");
        setStep("OTP");
      } else {
        toast.error(response?.message || "Failed to send OTP.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error sending OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const response = await checkStatus(email, otp);
      if (response?.success && response.organization) {
        setOrgData(response.organization);
        setStep("STATUS");
        toast.success("Verification successful!");
      } else {
        toast.error(response?.message || "Invalid OTP.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const [resubmitErrors, setResubmitErrors] = useState<Record<string, string>>({});

  const validateResubmit = () => {
    const tempErrors: Record<string, string> = {};
    if (!editName.trim()) tempErrors.name = "Organization name is required.";
    if (!editType) tempErrors.organizationType = "Organization type is required.";
    if (!editLocation) tempErrors.location = "Location is required.";
    if (!editHolderName.trim()) tempErrors.accountHolderName = "Account holder name is required.";
    if (!editBankName.trim()) tempErrors.bankName = "Bank name is required.";

    if (!editAccountNumber.trim()) {
      tempErrors.accountNumber = "Account number is required.";
    } else if (!/^\d{9,18}$/.test(editAccountNumber.trim())) {
      tempErrors.accountNumber = "Please enter a valid bank account number.";
    }

    if (!editIfscCode.trim()) {
      tempErrors.ifscCode = "IFSC code is required.";
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(editIfscCode.trim().toUpperCase())) {
      tempErrors.ifscCode = "Please enter a valid 11-digit IFSC code.";
    }

    if (editUpiId.trim() && !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(editUpiId.trim())) {
      tempErrors.upiId = "Please enter a valid UPI ID.";
    }

    setResubmitErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleResubmitInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateResubmit()) {
      toast.error("Please resolve form errors.");
      return;
    }

    setLoading(true);
    try {
      const response = await sendStatusOtp(email);
      if (response?.success) {
        toast.success("Resubmission OTP sent to your email!");
        setShowResubmitOtpModal(true);
      } else {
        toast.error(response?.message || "Failed to generate OTP.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error triggering resubmission OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResubmitConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resubmitOtpVal || resubmitOtpVal.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }

    setIsSubmittingResubmit(true);
    const enrolData = {
      name: editName,
      organizationType: editType,
      email,
      location: editLocation ? {
        coordinates: editLocation.coordinates,
        address: editLocation.address,
        placeId: editLocation.placeId
      } : undefined,
      accountHolderName: editHolderName,
      bankName: editBankName,
      accountNumber: editAccountNumber,
      ifscCode: editIfscCode.toUpperCase(),
      upiId: editUpiId.trim() || undefined,
    };

    try {
      const response = await resubmitEnrolment({
        email,
        otp: resubmitOtpVal,
        enrolData
      });

      if (response?.success) {
        toast.success("Enrolment details resubmitted successfully!");
        setShowResubmitOtpModal(false);
        // Refresh details status page by reloading checking status (with the same OTP if caching valid, or just resetting status back to pending locally)
        setOrgData((prev: any) => ({
          ...prev,
          ...enrolData,
          verificationStatus: "PENDING",
          rejectionReason: undefined
        }));
      } else {
        toast.error(response?.message || "OTP verification failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred during resubmission.");
    } finally {
      setIsSubmittingResubmit(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Code copied!");
  };

  return (
    <div className="min-h-screen pt-[70px] bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto pt-5">

        {step === "EMAIL" && (
          <div className="max-w-lg mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="text-center space-y-3">
              <h1 className="text-3xl font-extrabold text-gray-800">Check Registration Status</h1>
              <p className="text-gray-400 text-sm leading-relaxed">
                Enter the email address used during enrolment to receive a verification OTP and check your application status.
              </p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Registered Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. admin@organization.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg outline-none text-sm transition-all focus:border-darkGreen"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-darkGreen text-white font-semibold rounded-lg hover:bg-darkGreen/90 text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending OTP...
                  </>
                ) : (
                  "Send Status Verification OTP"
                )}
              </button>
            </form>
            <div className="text-center text-sm text-gray-500 ">
              <Link to="/organizations/enrol" className="text-darkGreen hover:underline font-semibold">
                Register a new organization instead
              </Link>
            </div>
          </div>
        )}

        {step === "OTP" && (
          <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col gap-6 text-center animate-in fade-in duration-300">
            <div className="mx-auto w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5" />
              </svg>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-gray-800">Verify Status OTP</h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                An OTP has been sent to <strong className="text-gray-700">{email}</strong>. Enter it below to access your organization details.
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full p-3 border border-gray-200 rounded-lg outline-none text-center text-xl font-bold tracking-widest focus:border-darkGreen"
              />

              <div className="flex gap-3 justify-end pt-3 border-t">
                <button
                  type="button"
                  className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-sm transition-all"
                  onClick={() => setStep("EMAIL")}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="py-2.5 px-6 bg-darkGreen text-white font-semibold rounded-lg hover:bg-darkGreen/90 text-sm transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    "Verify Status"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === "STATUS" && orgData && (
          <div className="space-y-8 animate-in fade-in duration-300">

            {/* Status Header Cards */}
            {orgData.verificationStatus === "PENDING" && (
              <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-800">Pending Verification</h2>
                    <p className="text-gray-500 text-xs mt-0.5">Our admins are currently checking your credentials. We will email you soon.</p>
                  </div>
                </div>
                <span className="px-3.5 py-1.5 bg-amber-150 text-amber-800 rounded-full text-xs font-semibold uppercase tracking-wider shrink-0">
                  Moderation
                </span>
              </div>
            )}

            {orgData.verificationStatus === "VERIFIED" && (
              <div className="bg-emerald-50 border border-emerald-250 p-6 rounded-2xl flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-800">Verification Approved!</h2>
                    <p className="text-gray-500 text-xs mt-0.5">Your organization is fully verified. Provide the code below to your practitioners.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white border border-emerald-300 p-2.5 rounded-xl shadow-sm shrink-0">
                  <div className="flex flex-col pl-1.5 pr-3">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Organization Code</span>
                    <span className="font-mono font-extrabold text-lg text-emerald-800 tracking-widest">{orgData.organizationCode}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(orgData.organizationCode)}
                    className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all"
                    title="Copy Code"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-5 4h5m-5 4h5m-9 1h1" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {orgData.verificationStatus === "REJECTED" && (
              <div className="bg-red-50 border border-red-200 p-6 rounded-2xl flex flex-col gap-4">
                <div className="flex gap-3 items-center border-b border-red-150 pb-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-800">Registration Rejected</h2>
                    <p className="text-gray-500 text-xs mt-0.5">Please review the reason below, update your details, and resubmit.</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-red-800 uppercase tracking-wide">Reason for Rejection:</h4>
                  <p className="text-sm text-red-700 mt-1 font-medium bg-red-100/50 p-3 rounded-lg border border-red-100">
                    {orgData.rejectionReason}
                  </p>
                </div>
              </div>
            )}

            {/* Read-Only Details View (For Pending/Verified) */}
            {orgData.verificationStatus !== "REJECTED" ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800">Submitted Registration Details</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">Organization Name</p>
                      <p className="font-semibold text-gray-800">{orgData.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">Organization Type</p>
                      <p className="font-semibold text-gray-800">{orgData.organizationType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">Contact Email</p>
                      <p className="font-semibold text-gray-800">{orgData.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">Address</p>
                      <p className="font-semibold text-gray-800">{orgData.location?.address || "N/A"}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">Account Holder Name</p>
                      <p className="font-semibold text-gray-800">{orgData.accountHolderName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">Bank Name</p>
                      <p className="font-semibold text-gray-800">{orgData.bankName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">Account Number</p>
                      <p className="font-semibold text-gray-800 font-mono">••••••••{orgData.accountNumber?.slice(-4)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">IFSC Code</p>
                      <p className="font-semibold text-gray-800 font-mono">{orgData.ifscCode}</p>
                    </div>
                    {orgData.upiId && (
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">UPI ID</p>
                        <p className="font-semibold text-gray-800">{orgData.upiId}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 flex justify-end">
                  <button
                    onClick={() => setStep("EMAIL")}
                    className="py-2 px-5 bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-300 transition-all"
                  >
                    Back to Status Check
                  </button>
                </div>
              </div>
            ) : (
              /* Editable Resubmission Form (For Rejected Status) */
              <form onSubmit={handleResubmitInitiate} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800">Edit and Resubmit Application</h3>
                  <p className="text-gray-400 text-xs mt-0.5">Please update the incorrect details and click submit to trigger a verification code.</p>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-5">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 border-b pb-1">General Details</h4>

                    <div>
                      <label className="block text-gray-700 text-xs font-semibold mb-1.5">Organization Name *</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className={`w-full p-2.5 border rounded-lg text-sm outline-none focus:border-darkGreen ${resubmitErrors.name ? "border-red-500" : "border-gray-200"}`}
                      />
                      {resubmitErrors.name && <p className="text-red-500 text-xs mt-0.5">{resubmitErrors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-gray-700 text-xs font-semibold mb-1.5">Organization Type *</label>
                      <select
                        value={editType}
                        onChange={(e) => setEditType(e.target.value)}
                        className={`w-full p-2.5 border rounded-lg text-sm outline-none focus:border-darkGreen ${resubmitErrors.organizationType ? "border-red-500" : "border-gray-200"}`}
                      >
                        <option value="">Select type</option>
                        <option value="HOSPITAL">Hospital</option>
                        <option value="CLINIC">Clinic</option>
                        <option value="DIAGNOSTIC_CENTER">Diagnostic Center</option>
                        <option value="PHARMACY">Pharmacy</option>
                      </select>
                      {resubmitErrors.organizationType && <p className="text-red-500 text-xs mt-0.5">{resubmitErrors.organizationType}</p>}
                    </div>

                    <div className="pt-1">
                      <LocationPicker
                        onLocationSelect={(loc) => setEditLocation(loc)}
                        initialLocation={editLocation || undefined}
                      />
                      {resubmitErrors.location && <p className="text-red-500 text-xs mt-0.5">{resubmitErrors.location}</p>}
                    </div>
                  </div>

                  <div className="space-y-5">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 border-b pb-1">Bank Details</h4>

                    <div>
                      <label className="block text-gray-700 text-xs font-semibold mb-1.5">Account Holder Name *</label>
                      <input
                        type="text"
                        value={editHolderName}
                        onChange={(e) => setEditHolderName(e.target.value)}
                        className={`w-full p-2.5 border rounded-lg text-sm outline-none focus:border-darkGreen ${resubmitErrors.accountHolderName ? "border-red-500" : "border-gray-200"}`}
                      />
                      {resubmitErrors.accountHolderName && <p className="text-red-500 text-xs mt-0.5">{resubmitErrors.accountHolderName}</p>}
                    </div>

                    <div>
                      <label className="block text-gray-700 text-xs font-semibold mb-1.5">Bank Name *</label>
                      <input
                        type="text"
                        value={editBankName}
                        onChange={(e) => setEditBankName(e.target.value)}
                        className={`w-full p-2.5 border rounded-lg text-sm outline-none focus:border-darkGreen ${resubmitErrors.bankName ? "border-red-500" : "border-gray-200"}`}
                      />
                      {resubmitErrors.bankName && <p className="text-red-500 text-xs mt-0.5">{resubmitErrors.bankName}</p>}
                    </div>

                    <div>
                      <label className="block text-gray-700 text-xs font-semibold mb-1.5">Account Number *</label>
                      <input
                        type="text"
                        value={editAccountNumber}
                        onChange={(e) => setEditAccountNumber(e.target.value)}
                        className={`w-full p-2.5 border rounded-lg text-sm outline-none focus:border-darkGreen ${resubmitErrors.accountNumber ? "border-red-500" : "border-gray-200"}`}
                      />
                      {resubmitErrors.accountNumber && <p className="text-red-500 text-xs mt-0.5">{resubmitErrors.accountNumber}</p>}
                    </div>

                    <div>
                      <label className="block text-gray-700 text-xs font-semibold mb-1.5">IFSC Code *</label>
                      <input
                        type="text"
                        value={editIfscCode}
                        onChange={(e) => setEditIfscCode(e.target.value)}
                        className={`w-full p-2.5 border rounded-lg text-sm outline-none focus:border-darkGreen uppercase font-mono ${resubmitErrors.ifscCode ? "border-red-500" : "border-gray-200"}`}
                      />
                      {resubmitErrors.ifscCode && <p className="text-red-500 text-xs mt-0.5">{resubmitErrors.ifscCode}</p>}
                    </div>

                    <div>
                      <label className="block text-gray-700 text-xs font-semibold mb-1.5">UPI ID (Optional)</label>
                      <input
                        type="text"
                        value={editUpiId}
                        onChange={(e) => setEditUpiId(e.target.value)}
                        className={`w-full p-2.5 border rounded-lg text-sm outline-none focus:border-darkGreen ${resubmitErrors.upiId ? "border-red-500" : "border-gray-200"}`}
                      />
                      {resubmitErrors.upiId && <p className="text-red-500 text-xs mt-0.5">{resubmitErrors.upiId}</p>}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-150">
                  <button
                    type="button"
                    onClick={() => setStep("EMAIL")}
                    className="py-2 px-5 bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-300 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="py-2 px-8 bg-darkGreen text-white text-sm font-semibold rounded-lg hover:bg-darkGreen/90 transition-all shadow-md flex items-center gap-2"
                  >
                    {loading ? "Sending OTP..." : "Verify & Resubmit Application"}
                  </button>
                </div>
              </form>
            )}

            {/* Submission History Section */}
            {orgData.submissionHistory && orgData.submissionHistory.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mt-6 space-y-4">
                <h3 className="font-bold text-gray-800 border-b pb-2 text-sm uppercase tracking-wider text-slate-500">Submission & Review History</h3>
                <div className="relative pl-6 border-l border-gray-200 space-y-6">
                  {orgData.submissionHistory.map((item: any, idx: number) => (
                    <div key={idx} className="relative">
                      {/* Timeline dot */}
                      <span className={`absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                        item.status === 'VERIFIED' ? 'bg-green-500' :
                        item.status === 'REJECTED' ? 'bg-red-500' :
                        'bg-yellow-500'
                      }`} />
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800">
                            {item.status === 'VERIFIED' ? 'Enrolment Approved' :
                             item.status === 'REJECTED' ? 'Enrolment Rejected' :
                             'Enrolment Submitted'}
                          </p>
                          {item.status === 'REJECTED' && item.rejectionReason && (
                            <p className="text-xs text-red-650 mt-1.5 bg-red-50/50 p-2.5 rounded-lg border border-red-100 font-mono italic">
                              Reason: {item.rejectionReason}
                            </p>
                          )}
                        </div>
                        <span className="text-[11px] text-gray-400 font-mono shrink-0">{new Date(item.submittedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* Resubmit OTP Modal */}
      {showResubmitOtpModal && (
        <div className="fixed top-0 left-0 z-50 bg-black/40 h-screen w-screen flex justify-center items-center px-4 animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 flex flex-col gap-6 text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5" />
              </svg>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-gray-800">Confirm Resubmission</h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                An OTP has been sent to <strong className="text-gray-700">{email}</strong>. Enter it below to confirm your updated application.
              </p>
            </div>

            <form onSubmit={handleResubmitConfirm} className="space-y-4">
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                value={resubmitOtpVal}
                onChange={(e) => setResubmitOtpVal(e.target.value.replace(/\D/g, ""))}
                className="w-full p-3 border border-gray-200 rounded-lg outline-none text-center text-xl font-bold tracking-widest focus:border-darkGreen"
              />

              <div className="flex gap-3 justify-end pt-3 border-t">
                <button
                  type="button"
                  className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-sm transition-all"
                  onClick={() => setShowResubmitOtpModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingResubmit}
                  className="py-2.5 px-6 bg-darkGreen text-white font-semibold rounded-lg hover:bg-darkGreen/90 text-sm transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {isSubmittingResubmit ? "Resubmitting..." : "Confirm & Resubmit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default UOrganizationStatusPage;
