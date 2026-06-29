import React from "react";
import {
  FileText,
  ClipboardList,
  Sparkles,
  Check,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Info,
} from "lucide-react";

interface PrescriptionItem {
  id: string;
  medicine: string;
  dosage: string;
  frequency: string;
  timing: "Before Food" | "After Food";
  duration: string;
}

interface ClinicalPanelProps {
  infoTab: boolean;
  setInfoTab: React.Dispatch<React.SetStateAction<boolean>>;
  reportTab: boolean;
  setReportTab: React.Dispatch<React.SetStateAction<boolean>>;
  videoTab: boolean;
  setVideoTab: React.Dispatch<React.SetStateAction<boolean>>;
  clinicalSubTab: "report" | "prescription";
  setClinicalSubTab: (tab: "report" | "prescription") => void;

  // Consultation Status
  status: string;

  // Report State
  chiefComplaint: string;
  setChiefComplaint: (val: string) => void;
  clinicalNotes: string;
  setClinicalNotes: (val: string) => void;
  diagnosis: string;
  setDiagnosis: (val: string) => void;
  followUpDate: string;
  setFollowUpDate: (val: string) => void;
  followUpNotes: string;
  setFollowUpNotes: (val: string) => void;
  isReportSaved: boolean;
  handleSaveReport: (e: React.FormEvent) => void;

  // Auto-save State
  reportSaveStatus: "idle" | "saving" | "saved" | "error";
  reportSavedTime: string;
  prescriptionSaveStatus: "idle" | "saving" | "saved" | "error" | "no_signature";
  prescriptionSavedTime: string;
  isPrescriptionIssued: boolean;

  // Error States
  reportErrors?: { chiefComplaint?: string; diagnosis?: string; submit?: string };
  prescriptionErrors?: { medicine?: string; submit?: string; items?: string };

  // Prescription State
  prescriptions: PrescriptionItem[];
  newMedicine: string;
  setNewMedicine: (val: string) => void;
  newDosage: string;
  setNewDosage: (val: string) => void;
  newFrequency: string;
  setNewFrequency: (val: string) => void;
  newTiming: "Before Food" | "After Food";
  setNewTiming: (val: "Before Food" | "After Food") => void;
  newDuration: string;
  setNewDuration: (val: string) => void;
  handleAddMedicine: () => void;
  handleRemoveMedicine: (id: string) => void;
  handleIssuePrescription: () => void;
  activeMobileTab?: "patient" | "clinical" | "telehealth";
}

export const ClinicalPanel: React.FC<ClinicalPanelProps> = ({
  infoTab,
  setInfoTab,
  reportTab,
  setReportTab,
  videoTab,
  setVideoTab,
  clinicalSubTab,
  setClinicalSubTab,

  status,

  chiefComplaint,
  setChiefComplaint,
  clinicalNotes,
  setClinicalNotes,
  diagnosis,
  setDiagnosis,
  followUpDate,
  setFollowUpDate,
  followUpNotes,
  setFollowUpNotes,
  isReportSaved,
  handleSaveReport,
  reportSaveStatus,
  reportSavedTime,
  prescriptionSaveStatus,
  prescriptionSavedTime,
  isPrescriptionIssued,

  reportErrors,
  prescriptionErrors,

  prescriptions,
  newMedicine,
  setNewMedicine,
  newDosage,
  setNewDosage,
  newFrequency,
  setNewFrequency,
  newTiming,
  setNewTiming,
  newDuration,
  setNewDuration,
  handleAddMedicine,
  handleRemoveMedicine,
  handleIssuePrescription,
  activeMobileTab = "clinical",
}) => {
  const isCompleted = status === "COMPLETED";

  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  React.useEffect(() => {
    if (!newMedicine.trim() || newMedicine.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const cleanQuery = newMedicine.trim();
        const queryTerm = cleanQuery.includes(" ") ? cleanQuery : `${cleanQuery}*`;
        const response = await fetch(
          `https://www.ebi.ac.uk/ebisearch/ws/rest/chebi?query=${encodeURIComponent(queryTerm)}&format=json&size=15&fields=name`
        );
        const data = await response.json();
        const entries = data.entries || [];
        const medicineNames = Array.from(
          new Set(
            entries
              .map((entry: any) => entry.fields?.name?.[0])
              .filter(Boolean)
          )
        ) as string[];
        setSuggestions(medicineNames);
      } catch (error) {
        console.error("Error fetching medicines:", error);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [newMedicine]);

  const handleSelectSuggestion = (med: string) => {
    setNewMedicine(med);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md rounded-2xl flex-col h-full overflow-hidden transition-all duration-300 cursor-pointer ${
        activeMobileTab === "clinical" ? "flex" : "hidden lg:flex"
      } w-full ${reportTab ? "lg:flex-1 lg:min-w-[280px]" : "lg:w-[70px] lg:min-w-[70px]"}`}
      onClick={() => {
        if (reportTab && !infoTab && !videoTab) {
          setInfoTab(true);
        }
        setReportTab((prev) => !prev);
      }}
    >
      {reportTab ? (
        <div className="flex flex-col h-full min-h-0 cursor-default" onClick={(e) => e.stopPropagation()}>
          {/* Header with Sub-tabs */}
          <div className="p-3 border-b border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between shrink-0">
            <div className="flex gap-2.5">
              <button
                onClick={() => setClinicalSubTab("report")}
                className={`flex items-center justify-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${clinicalSubTab === "report"
                    ? "bg-slate-800 text-white dark:bg-emerald-500 dark:text-slate-955"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400"
                  }`}
              >
                <span>Consultation Report</span>
              </button>
              <button
                onClick={() => setClinicalSubTab("prescription")}
                className={`flex items-center justify-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${clinicalSubTab === "prescription"
                    ? "bg-slate-800 text-white dark:bg-emerald-500 dark:text-slate-955"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400"
                  }`}
              >
                <span>Prescription Creator</span>
              </button>
            </div>

            <button
              onClick={() => setReportTab(false)}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Panel Area */}
          <div className="flex-1 overflow-y-auto p-4">
            {clinicalSubTab === "report" ? (
              <form onSubmit={handleSaveReport} className="space-y-4">
                {/* Auto-save Status Indicator */}
                {reportSaveStatus === "saving" && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850/50 animate-pulse">
                    <svg className="animate-spin h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Saving changes...</span>
                  </div>
                )}
                {reportSaveStatus === "saved" && (
                  <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-100/50 dark:border-emerald-900/30">
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved changes at {reportSavedTime}</span>
                  </div>
                )}
                {reportSaveStatus === "error" && (
                  <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-455 bg-rose-50 dark:bg-rose-950/20 p-2.5 rounded-xl border border-rose-100/50 dark:border-rose-900/30">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Auto-save failed. Check details below.</span>
                  </div>
                )}

                {/* Chief Complaint */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Chief Complaint / Patient Symptoms *
                  </label>
                  <textarea
                    value={chiefComplaint}
                    onChange={(e) => setChiefComplaint(e.target.value)}
                    disabled={isCompleted}
                    placeholder="Describe patient's primary symptoms, severity, and duration..."
                    className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-emerald-500/50 resize-y min-h-[80px] h-20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  {reportErrors?.chiefComplaint && (
                    <p className="text-rose-500 text-xs font-semibold mt-0.5">{reportErrors.chiefComplaint}</p>
                  )}
                </div>

                {/* Clinical Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Clinical Examination Findings
                  </label>
                  <textarea
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    disabled={isCompleted}
                    placeholder="Vitals updates, clinical observations, physical exam details..."
                    className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-emerald-500/50 resize-y min-h-[80px] h-20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Diagnosis input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Primary Diagnosis / ICD-10 Coding *
                  </label>
                  <textarea
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    disabled={isCompleted}
                    placeholder="e.g. Essential hypertension (I10) or Influenza"
                    className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-emerald-500/50 resize-y min-h-[80px] h-20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  {reportErrors?.diagnosis && (
                    <p className="text-rose-500 text-xs font-semibold mt-0.5">{reportErrors.diagnosis}</p>
                  )}
                </div>

                {/* Follow Up */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Follow Up Date
                    </label>
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      disabled={isCompleted}
                      className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-emerald-500/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Follow Up Notes
                    </label>
                    <textarea
                      value={followUpNotes}
                      onChange={(e) => setFollowUpNotes(e.target.value)}
                      disabled={isCompleted}
                      placeholder="Instructions for next visit"
                      className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-emerald-500/50 resize-y min-h-[80px] h-20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Submission Errors */}
                {reportErrors?.submit && (
                  <p className="text-rose-500 text-xs text-center font-bold">{reportErrors.submit}</p>
                )}

                {/* Action Button */}
                <button
                  type="submit"
                  disabled={isReportSaved || isCompleted || reportSaveStatus === "saving"}
                  className={`w-full py-4 rounded-xl text-base font-bold flex justify-center items-center gap-2 transition-all shadow-md ${isReportSaved || isCompleted || reportSaveStatus === "saving"
                      ? "bg-slate-100 text-slate-500 border border-slate-200/55 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 cursor-not-allowed"
                      : "bg-slate-800 text-white hover:bg-slate-700 dark:bg-emerald-500 dark:text-slate-955 dark:hover:bg-emerald-450"
                    }`}
                >
                  {reportSaveStatus === "saving" ? (
                    "Saving Consultation Report..."
                  ) : isReportSaved ? (
                    "Consultation Report Saved"
                  ) : isCompleted ? (
                    "Consultation Ended (Read-only)"
                  ) : (
                    "Save Consultation Report"
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-5">
                {/* Auto-save Status Indicator */}
                {prescriptionSaveStatus === "saving" && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850/50 animate-pulse">
                    <svg className="animate-spin h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Saving changes...</span>
                  </div>
                )}
                {prescriptionSaveStatus === "saved" && (
                  <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-100/50 dark:border-emerald-900/30">
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved changes at {prescriptionSavedTime}</span>
                  </div>
                )}
                {prescriptionSaveStatus === "no_signature" && (
                  <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-100/50 dark:border-amber-900/30">
                    <Info className="w-3.5 h-3.5" />
                    <span>Auto-save paused: No signature configured yet.</span>
                  </div>
                )}
                {prescriptionSaveStatus === "error" && (
                  <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-455 bg-rose-50 dark:bg-rose-950/20 p-2.5 rounded-xl border border-rose-100/50 dark:border-rose-900/30">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Auto-save failed.</span>
                  </div>
                )}

                {/* Add Drug Row Form */}
                {isCompleted ? (
                  <div className="p-4 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-500/20 text-xs font-semibold">
                    Consultation has ended. Prescription is read-only.
                  </div>
                ) : (
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/30 dark:border-slate-800 space-y-3">
                    <h5 className="text-xs font-bold text-slate-700 dark:text-slate-355 flex items-center justify-start">
                      Add New Medication to Prescription
                    </h5>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="col-span-2 space-y-1 relative">
                        <label className="text-xs font-bold text-slate-400 uppercase">Medicine Name *</label>
                        <input
                          type="text"
                          value={newMedicine}
                          onChange={(e) => {
                            setNewMedicine(e.target.value);
                            setShowSuggestions(true);
                          }}
                          onFocus={() => setShowSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                          placeholder="e.g. Amoxicillin 500mg"
                          className="w-full text-sm bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-700/60 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-emerald-500"
                        />
                        {showSuggestions && suggestions.length > 0 && (
                          <ul className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg divide-y divide-slate-100 dark:divide-slate-700">
                            {suggestions.map((med, index) => (
                              <li
                                key={index}
                                onClick={() => handleSelectSuggestion(med)}
                                className="px-4 py-2.5 text-sm text-slate-750 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                              >
                                {med}
                              </li>
                            ))}
                          </ul>
                        )}
                        {prescriptionErrors?.medicine && (
                          <p className="text-rose-500 text-xs font-semibold mt-0.5">{prescriptionErrors.medicine}</p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase">Dosage</label>
                        <input
                          type="text"
                          value={newDosage}
                          onChange={(e) => setNewDosage(e.target.value)}
                          placeholder="e.g. 1 tablet"
                          className="w-full text-sm bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-700/60 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-emerald-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase">Frequency</label>
                        <select
                          value={newFrequency}
                          onChange={(e) => setNewFrequency(e.target.value)}
                          className="w-full text-sm bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-700/60 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-emerald-500"
                        >
                          <option value="Once daily">Once daily</option>
                          <option value="Twice daily">Twice daily</option>
                          <option value="Three times daily">Three times daily</option>
                          <option value="Four times daily">Four times daily</option>
                          <option value="Before bed">Before bed</option>
                          <option value="As needed">As needed (PRN)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase">Timing</label>
                        <div className="flex gap-2.5 h-10 items-center">
                          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-350 cursor-pointer">
                            <input
                              type="radio"
                              checked={newTiming === "After Food"}
                              onChange={() => setNewTiming("After Food")}
                              className="accent-emerald-500 w-3.5 h-3.5"
                            />{" "}
                            After Food
                          </label>
                          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-350 cursor-pointer">
                            <input
                              type="radio"
                              checked={newTiming === "Before Food"}
                              onChange={() => setNewTiming("Before Food")}
                              className="accent-emerald-500 w-3.5 h-3.5"
                            />{" "}
                            Before Food
                          </label>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase">Duration</label>
                        <input
                          type="text"
                          value={newDuration}
                          onChange={(e) => setNewDuration(e.target.value)}
                          placeholder="e.g. 5 days"
                          className="w-full text-sm bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-700/60 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleAddMedicine}
                      className="w-full bg-slate-800 text-white dark:bg-slate-855 dark:hover:bg-slate-700 text-sm py-2.5 rounded-lg font-bold flex items-center justify-center gap-1 hover:opacity-90 active:scale-95 transition-transform"
                    >
                      Add Drug Row
                    </button>
                  </div>
                )}

                {/* Prescription Table view */}
                <div className="space-y-2">
                  <h6 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Active Prescription Items ({prescriptions.length})
                  </h6>
                  {prescriptionErrors?.items && (
                    <p className="text-rose-500 text-xs font-semibold mt-1 mb-2">{prescriptionErrors.items}</p>
                  )}
                  {prescriptions.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                      <p className="text-xs text-slate-400 font-medium">No medications added yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {prescriptions.map((p) => (
                        <div
                          key={p.id}
                          className="p-3 bg-white dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800/80 rounded-xl flex items-center justify-between gap-3 text-xs shadow-sm hover:border-slate-300 dark:hover:border-slate-700"
                        >
                          <div className="space-y-1">
                            <p className="font-bold text-slate-900 dark:text-white text-sm">{p.medicine}</p>
                            <div className="flex flex-wrap gap-2 text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                              <span>{p.dosage}</span>
                              <span>•</span>
                              <span>{p.frequency}</span>
                              <span>•</span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-455">{p.timing}</span>
                              <span>•</span>
                              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold text-slate-700 dark:text-slate-350">
                                {p.duration}
                              </span>
                            </div>
                          </div>
                          {!isCompleted && (
                            <button
                              onClick={() => handleRemoveMedicine(p.id)}
                              className="p-2 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 rounded-lg transition-colors border border-transparent hover:border-rose-500/20"
                              title="Remove Medicine"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}

                      {prescriptionErrors?.submit && (
                        <p className="text-rose-500 text-xs text-center font-bold mt-2">{prescriptionErrors.submit}</p>
                      )}

                      {!isCompleted && (
                        <button
                          onClick={handleIssuePrescription}
                          disabled={isPrescriptionIssued}
                          className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-base mt-4 transition-all duration-100 ${
                            isPrescriptionIssued
                              ? "bg-slate-100 text-slate-500 border border-slate-200/55 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 cursor-not-allowed shadow-none hover:scale-100"
                              : "bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/20 hover:scale-[1.01]"
                          }`}
                        >
                          {isPrescriptionIssued ? "Prescription Signed & Issued" : "Sign & Issue Prescription"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Minimized Icon Bar */
        <div className="h-full flex flex-col items-center justify-between py-6">
          <div className="flex flex-col items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="font-bold text-slate-400 uppercase text-[10px] tracking-[0.2em] [writing-mode:vertical-lr] select-none flex items-center gap-1 rotate-180">
            <span>Clinical Notes</span>
            <ChevronRight className="w-3.5 h-3.5 rotate-90" />
          </div>
        </div>
      )}
    </div>
  );
};
