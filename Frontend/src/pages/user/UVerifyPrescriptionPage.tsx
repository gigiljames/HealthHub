import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { verifyPrescription } from "../../api/consultationApi";
import { CheckCircle, AlertTriangle, ShieldAlert, Award, User, Clock, Pill, ShieldCheck, HeartPulse } from "lucide-react";
import dayjs from "dayjs";

export const UVerifyPrescriptionPage: React.FC = () => {
  const { verificationToken } = useParams<{ verificationToken: string }>();
  const [prescription, setPrescription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const performVerification = async () => {
      try {
        if (!verificationToken) {
          setError("Invalid verification link.");
          setLoading(false);
          return;
        }
        const res = await verifyPrescription(verificationToken);
        if (res.success && res.data) {
          setPrescription(res.data);
        } else {
          setError("Prescription could not be verified. It may be invalid or does not exist.");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Verification failed. The prescription token is invalid or has been tampered with.");
      } finally {
        setLoading(false);
      }
    };

    performVerification();
  }, [verificationToken]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-darkGreen"></div>
        <p className="mt-4 font-bold text-sm text-slate-400">Verifying prescription authenticity...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      {/* Brand Header */}
      <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800/40 py-4 px-6 sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 shadow-sm shadow-slate-100/10">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-8 h-8 text-darkGreen dark:text-emerald-500" />
            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Health<span className="text-darkGreen dark:text-emerald-500">Hub</span>
            </span>
          </div>
          <span className="text-xs font-bold text-slate-400 dark:text-slate-555 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200/50 dark:border-slate-800/30">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-450" />
            Public Verification Portal
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-[95%] lg:w-[80%] max-w-[800px] mx-auto py-10 space-y-8">
        {error ? (
          /* Error Screen */
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/40 shadow-xl shadow-slate-200/10 rounded-3xl p-8 md:p-12 text-center space-y-6 max-w-md mx-auto my-12">
            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-100 dark:border-rose-900/30">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                Verification Failed
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                {error}
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-900/50 text-xs text-slate-400 text-left font-medium leading-relaxed">
              <strong>Security Alert:</strong> HealthHub prescriptions are cryptographically signed. If this error persists, the paper slip or digital link might have been modified. Please request a new verification code from the clinic.
            </div>
          </div>
        ) : (
          /* Verification Details Screen */
          <div className="space-y-8">
            {/* Verification Status Banner */}
            <div className={`p-6 md:p-8 rounded-3xl border shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${
              prescription.status === "Revoked"
                ? "bg-rose-50/40 dark:bg-rose-950/10 border-rose-200/50 dark:border-rose-900/25 text-rose-800 dark:text-rose-300"
                : prescription.status === "Expired"
                ? "bg-amber-50/40 dark:bg-amber-955/10 border-amber-200/50 dark:border-amber-900/25 text-amber-800 dark:text-amber-300"
                : "bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-250/30 dark:border-emerald-900/20 text-emerald-850 dark:text-emerald-350"
            }`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 md:p-4 rounded-2xl border ${
                  prescription.status === "Revoked"
                    ? "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                    : prescription.status === "Expired"
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                    : "bg-emerald-500/10 border-emerald-550/20 text-emerald-600 dark:text-emerald-450"
                }`}>
                  {prescription.status === "Revoked" ? (
                    <ShieldAlert className="w-8 h-8" />
                  ) : prescription.status === "Expired" ? (
                    <Clock className="w-8 h-8" />
                  ) : (
                    <CheckCircle className="w-8 h-8" />
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">Verification Status</span>
                  <h2 className="text-xl md:text-2xl font-black tracking-tight leading-none">
                    {prescription.status === "Revoked" ? (
                      "Prescription Revoked"
                    ) : prescription.status === "Expired" ? (
                      "Prescription Expired"
                    ) : (
                      "✓ Prescription Verified"
                    )}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-normal max-w-md font-medium">
                    {prescription.status === "Revoked" ? (
                      "This prescription was manually revoked by the issuing clinician and is no longer valid for dispensing."
                    ) : prescription.status === "Expired" ? (
                      "This prescription has exceeded its 30-day validity period and cannot be filled."
                    ) : (
                      "This is a genuine clinical prescription issued by a certified HealthHub practitioner."
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Prescription Detailed Slip */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/40 shadow-xl shadow-slate-200/10 rounded-3xl overflow-hidden">
              {/* Slip Header Banner */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-850 dark:to-slate-800 px-8 py-6 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/50">
                <div>
                  <div className="flex items-center gap-2">
                    <Pill className="w-7 h-7 text-emerald-450" />
                    <span className="text-2xl font-bold tracking-tight">Rx Prescribed Plan</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">
                    No: {prescription.prescriptionNumber}
                  </p>
                </div>
                <div className="text-left sm:text-right text-slate-350 space-y-0.5 mt-1 sm:mt-0">
                  <p className="text-[10px] uppercase font-bold tracking-wider">Date of Issue</p>
                  <p className="font-bold text-sm text-white">
                    {dayjs(prescription.issueDate).format("DD MMM YYYY")}
                  </p>
                </div>
              </div>

              {/* Patient and Doctor Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-slate-50/30 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-800/80">
                {/* Doctor details */}
                <div className="flex gap-4">
                  <div className="p-3 bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 rounded-2xl h-fit border border-emerald-500/5">
                    <Award className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      Prescribing Doctor
                    </h4>
                    <p className="font-black text-slate-800 dark:text-white text-base">
                      Dr. {prescription.doctor.name}
                    </p>
                    <p className="text-xs font-semibold text-slate-550 dark:text-slate-400">
                      {prescription.doctor.qualifications}
                    </p>
                    <div className="pt-1.5 flex flex-col gap-1 text-[11px] text-slate-500 font-semibold">
                      <p>Reg No: {prescription.doctor.medicalRegistrationNumber}</p>
                      {prescription.doctor.phone && <p>Contact: {prescription.doctor.phone}</p>}
                    </div>
                  </div>
                </div>

                {/* Patient details */}
                <div className="flex gap-4 md:border-l md:border-slate-100 dark:md:border-slate-800 md:pl-6">
                  <div className="p-3 bg-indigo-500/5 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-455 rounded-2xl h-fit border border-indigo-500/5">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      Recipient Patient
                    </h4>
                    <p className="font-black text-slate-800 dark:text-white text-base">
                      {prescription.patient.name}
                    </p>
                    <div className="pt-2 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                        Age: {prescription.patient.age ?? "N/A"} Yrs
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded capitalize">
                        Gender: {prescription.patient.gender}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medication Table */}
              <div className="p-8 space-y-6">
                <h3 className="text-sm font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider flex items-center gap-2">
                  <Pill className="w-4 h-4 text-emerald-500" /> Prescribed Medications
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <th className="pb-3 pl-2">Medicine / Strength</th>
                        <th className="pb-3">Dosage</th>
                        <th className="pb-3">Frequency</th>
                        <th className="pb-3">Timing</th>
                        <th className="pb-3 pr-2">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                      {prescription.medicines.map((med: any, index: number) => (
                        <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                          <td className="py-4 pl-2 font-bold text-slate-850 dark:text-white">
                            {med.medicine}
                          </td>
                          <td className="py-4 text-slate-655 dark:text-slate-350">
                            {med.dosage}
                          </td>
                          <td className="py-4 text-slate-655 dark:text-slate-350">
                            {med.frequency}
                          </td>
                          <td className="py-4">
                            <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${med.timing === "After Food"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                            }`}>
                              {med.timing}
                            </span>
                          </td>
                          <td className="py-4 pr-2 font-bold text-slate-800 dark:text-slate-205">
                            {med.duration}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer Disclaimers and Signatures */}
                <div className="pt-8 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div className="text-xs text-slate-450 space-y-1.5 max-w-[420px]">
                    <p className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Security Disclaimer</p>
                    <p className="leading-relaxed">
                      Dispensing pharmacy must cross-reference this electronic record with the patient's ID proof. Do not dispense if verification status shows Revoked or Expired.
                    </p>
                  </div>

                  {/* Doctor Signature Image */}
                  <div className="flex items-center gap-4 bg-slate-50/30 dark:bg-slate-955/40 border border-slate-100/30 dark:border-slate-900/25 p-4 rounded-2xl shrink-0 min-w-[240px]">
                    {prescription.doctor.signatureUrl ? (
                      <div className="bg-white p-1.5 rounded-lg border border-slate-200 max-w-[100px] shadow-sm">
                        <img
                          src={prescription.doctor.signatureUrl}
                          alt="Doctor Signature"
                          className="max-h-12 object-contain"
                        />
                      </div>
                    ) : (
                      <CheckCircle className="w-8 h-8 text-emerald-500 shrink-0" />
                    )}
                    <div>
                      <p className="font-extrabold text-slate-800 dark:text-white text-sm">
                        Dr. {prescription.doctor.name}
                      </p>
                      <p className="text-[9px] text-slate-450 uppercase font-bold tracking-widest mt-0.5">
                        Digitally Signed
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="w-full bg-slate-100 dark:bg-slate-950 border-t border-slate-200/50 dark:border-slate-900/40 py-6 text-center text-xs text-slate-400 dark:text-slate-550">
        <p>© {new Date().getFullYear()} HealthHub Digital Verification Service. All rights reserved.</p>
        <p className="mt-1">Securing healthcare credentials through cryptographic verification.</p>
      </footer>
    </div>
  );
};

export default UVerifyPrescriptionPage;
