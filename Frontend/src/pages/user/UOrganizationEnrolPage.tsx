import { useState } from "react";
import { Link } from "react-router";
import LocationPicker from "../../components/common/LocationPicker";
import { enrolOrganization, confirmEnrolment } from "../../api/organization/organizationService";
import toast from "react-hot-toast";

interface LocationData {
  coordinates: number[];
  address: string;
  placeId: string;
}

function UOrganizationEnrolPage() {
  // Form fields state
  const [name, setName] = useState("");
  const [organizationType, setOrganizationType] = useState<string>("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState<LocationData | null>(null);
  const [accountHolderName, setAccountHolderName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [upiId, setUpiId] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [isSubmittingOtp, setIsSubmittingOtp] = useState(false);
  const [enrolledSuccessfully, setEnrolledSuccessfully] = useState(false);

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const tempErrors: Record<string, string> = {};
    if (!name.trim()) tempErrors.name = "Organization name is required.";
    if (!organizationType) tempErrors.organizationType = "Organization type is required.";

    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      tempErrors.email = "Contact email is required.";
    } else if (!emailRegex.test(email)) {
      tempErrors.email = "Please enter a valid email address.";
    }

    if (!location) {
      tempErrors.location = "Please select your location on the map.";
    }

    if (!accountHolderName.trim()) tempErrors.accountHolderName = "Account holder name is required.";
    if (!bankName.trim()) tempErrors.bankName = "Bank name is required.";

    // Account number validation (numeric, min 9 chars)
    if (!accountNumber.trim()) {
      tempErrors.accountNumber = "Account number is required.";
    } else if (!/^\d{9,18}$/.test(accountNumber.trim())) {
      tempErrors.accountNumber = "Please enter a valid bank account number.";
    }

    // IFSC Code validation (standard 11 char alphanumeric)
    if (!ifscCode.trim()) {
      tempErrors.ifscCode = "IFSC code is required.";
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode.trim().toUpperCase())) {
      tempErrors.ifscCode = "Please enter a valid 11-digit IFSC code (e.g. SBIN0001234).";
    }

    // Optional UPI ID validation
    if (upiId.trim() && !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiId.trim())) {
      tempErrors.upiId = "Please enter a valid UPI ID (e.g. name@bank).";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    setLoading(true);
    const data = {
      name,
      organizationType,
      email,
      location: location ? {
        coordinates: location.coordinates,
        address: location.address,
        placeId: location.placeId
      } : undefined,
      accountHolderName,
      bankName,
      accountNumber,
      ifscCode: ifscCode.toUpperCase(),
      upiId: upiId.trim() || undefined,
    };

    try {
      const response = await enrolOrganization(data);
      if (response?.success) {
        toast.success("Verification OTP sent to your email!");
        setShowOtpModal(true);
      } else {
        toast.error(response?.message || "Failed to initiate enrolment.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }

    setIsSubmittingOtp(true);
    const enrolData = {
      name,
      organizationType,
      email,
      location: location ? {
        coordinates: location.coordinates,
        address: location.address,
        placeId: location.placeId
      } : undefined,
      accountHolderName,
      bankName,
      accountNumber,
      ifscCode: ifscCode.toUpperCase(),
      upiId: upiId.trim() || undefined,
    };

    try {
      const response = await confirmEnrolment({
        email,
        otp,
        enrolData
      });

      if (response?.success) {
        toast.success("Organization details submitted successfully!");
        setShowOtpModal(false);
        setEnrolledSuccessfully(true);
      } else {
        toast.error(response?.message || "OTP verification failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred during verification.");
    } finally {
      setIsSubmittingOtp(false);
    }
  };

  if (enrolledSuccessfully) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-800">Application Submitted!</h2>
            <p className="text-gray-500 text-sm">
              Your organization registration request has been successfully submitted and is now pending verification.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-500 text-left space-y-2 w-full">
            <p className="font-bold text-gray-700">What happens next?</p>
            <ol className="list-decimal list-inside space-y-3">
              <li>Our administration team reviews your bank details and location credentials.</li>
              <li>Upon approval, a unique 6-character code is sent to <strong className="text-gray-700">{email}</strong>.</li>
              <li>Provide that code to doctors practicing at your location so they can add it to their profiles.</li>
            </ol>
          </div>

          <div className="flex flex-col gap-2 w-full mt-2">
            <Link
              to="/organizations/status"
              className="py-2.5 px-4 bg-darkGreen text-white font-semibold rounded-lg hover:bg-darkGreen/90 text-sm transition-all shadow-md text-center"
            >
              Check Application Status
            </Link>
            <Link
              to="/"
              className="py-2.5 px-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 text-sm transition-all text-center"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-[70px] bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8 pt-5">

        {/* Banner Hero */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-8 md:p-12 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="space-y-3 z-10 max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Register Your Hospital or Clinic
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Enrol your healthcare organization on HealthHub to enable practice management, schedule configuration, and direct digital booking for your practitioner teams.
            </p>
          </div>
          <div className="z-10 bg-white/10 backdrop-blur-md px-4 py-3 rounded-lg border border-white/15">
            <Link to="/organizations/status" className="text-sm font-semibold hover:underline flex items-center gap-1">
              Check Status
              <span>&rarr;</span>
            </Link>
          </div>
        </div>

        {/* Enrolment Form */}
        <form onSubmit={handleFormSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">Organization Registration Form</h2>
            <p className="text-gray-400 text-xs mt-0.5">Please fill out all the details accurately. Fields marked with * are required.</p>
          </div>

          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Left side: Basic info and Location */}
            <div className="space-y-6">
              <h3 className="font-bold text-gray-800 border-b pb-2 text-sm uppercase tracking-wider text-slate-500">General Information</h3>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Organization Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Apollo Hospital, City Clinic"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full p-3 border rounded-lg outline-none text-sm transition-all focus:border-darkGreen ${errors.name ? "border-red-500" : "border-gray-200"}`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Organization Type *</label>
                <select
                  value={organizationType}
                  onChange={(e) => setOrganizationType(e.target.value)}
                  className={`w-full p-3 border rounded-lg outline-none text-sm transition-all focus:border-darkGreen ${errors.organizationType ? "border-red-500" : "border-gray-200"}`}
                >
                  <option value="">Select organization type</option>
                  <option value="HOSPITAL">Hospital</option>
                  <option value="CLINIC">Clinic</option>
                  <option value="DIAGNOSTIC_CENTER">Diagnostic Center</option>
                  <option value="PHARMACY">Pharmacy</option>
                </select>
                {errors.organizationType && <p className="text-red-500 text-xs mt-1">{errors.organizationType}</p>}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Contact Email *</label>
                <input
                  type="email"
                  placeholder="e.g. admin@organization.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full p-3 border rounded-lg outline-none text-sm transition-all focus:border-darkGreen ${errors.email ? "border-red-500" : "border-gray-200"}`}
                />
                <p className="text-xs text-gray-400 mt-1 pl-1">This email will receive status updates and your unique organization code.</p>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div className="pt-2">
                <LocationPicker
                  onLocationSelect={(loc) => setLocation(loc)}
                  initialLocation={location || undefined}
                />
                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
              </div>
            </div>

            {/* Right side: Bank Details */}
            <div className="space-y-6">
              <h3 className="font-bold text-gray-800 border-b pb-2 text-sm uppercase tracking-wider text-slate-500">Bank Details (For Payouts)</h3>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Account Holder Name *</label>
                <input
                  type="text"
                  placeholder="Enter name exactly as in bank account"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  className={`w-full p-3 border rounded-lg outline-none text-sm transition-all focus:border-darkGreen ${errors.accountHolderName ? "border-red-500" : "border-gray-200"}`}
                />
                {errors.accountHolderName && <p className="text-red-500 text-xs mt-1">{errors.accountHolderName}</p>}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Bank Name *</label>
                <input
                  type="text"
                  placeholder="e.g. State Bank of India, HDFC Bank"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className={`w-full p-3 border rounded-lg outline-none text-sm transition-all focus:border-darkGreen ${errors.bankName ? "border-red-500" : "border-gray-200"}`}
                />
                {errors.bankName && <p className="text-red-500 text-xs mt-1">{errors.bankName}</p>}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Account Number *</label>
                <input
                  type="text"
                  placeholder="Enter bank account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className={`w-full p-3 border rounded-lg outline-none text-sm transition-all focus:border-darkGreen ${errors.accountNumber ? "border-red-500" : "border-gray-200"}`}
                />
                {errors.accountNumber && <p className="text-red-500 text-xs mt-1">{errors.accountNumber}</p>}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">IFSC Code *</label>
                <input
                  type="text"
                  placeholder="e.g. SBIN0001234"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value)}
                  className={`w-full p-3 border rounded-lg outline-none text-sm transition-all focus:border-darkGreen uppercase font-mono ${errors.ifscCode ? "border-red-500" : "border-gray-200"}`}
                />
                {errors.ifscCode && <p className="text-red-500 text-xs mt-1">{errors.ifscCode}</p>}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">UPI ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. name@okhdfcbank"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className={`w-full p-3 border rounded-lg outline-none text-sm transition-all focus:border-darkGreen ${errors.upiId ? "border-red-500" : "border-gray-200"}`}
                />
                {errors.upiId && <p className="text-red-500 text-xs mt-1">{errors.upiId}</p>}
              </div>
            </div>

          </div>

          {/* Form Actions */}
          <div className="bg-gray-50 px-6 py-4 md:px-8 flex justify-end gap-3 border-t border-gray-100">
            <Link
              to="/"
              className="py-2.5 px-6 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-all text-sm"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-8 rounded-lg bg-darkGreen text-white font-semibold hover:-translate-y-0.5 transition-all text-sm shadow-md flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                "Verify and Submit"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed top-0 left-0 z-50 bg-black/40 h-screen w-screen flex justify-center items-center px-4 animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 flex flex-col gap-6 text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5" />
              </svg>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-gray-800">Email Verification Required</h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                An OTP has been sent to <strong className="text-gray-700">{email}</strong>. Please enter the OTP below to finalize your registration.
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-4">
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
                  onClick={() => setShowOtpModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOtp}
                  className="py-2.5 px-6 bg-darkGreen text-white font-semibold rounded-lg hover:bg-darkGreen/90 text-sm transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {isSubmittingOtp ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    "Confirm"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UOrganizationEnrolPage;
