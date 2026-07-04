import { useState, useEffect, useRef } from "react";
import getIcon from "../../../helpers/getIcon";
import toast from "react-hot-toast";

interface DExperienceEditModalProps {
  existingExperience?: any;
  closeModal: () => void;
  onSave: (experience: any) => void;
}

const WORK_TYPES = [
  "full_time",
  "part_time",
  "internship",
  "residency",
  "fellowship",
  "consultant",
  "visiting",
  "locum",
  "on_call",
  "research",
  "teaching",
  "private_practice",
  "contract",
  "telemedicine",
];

function DExperienceEditModal({
  existingExperience,
  closeModal,
  onSave,
}: DExperienceEditModalProps) {
  const [hospital, setHospital] = useState("");
  const [designation, setDesignation] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [present, setPresent] = useState(false);

  const hospitalErrorRef = useRef<HTMLDivElement | null>(null);
  const designationErrorRef = useRef<HTMLDivElement | null>(null);
  const locationErrorRef = useRef<HTMLDivElement | null>(null);
  const descriptionErrorRef = useRef<HTMLDivElement | null>(null);
  const typeErrorRef = useRef<HTMLDivElement | null>(null);
  const startDateErrorRef = useRef<HTMLDivElement | null>(null);
  const endDateErrorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (existingExperience) {
      setHospital(existingExperience.hospital || "");
      setDesignation(existingExperience.designation || "");
      setLocation(existingExperience.location || "");
      setDescription(existingExperience.description || "");
      setType(existingExperience.type || "");
      setPresent(existingExperience.present || false);

      const start = existingExperience.startDate;
      if (start) {
        setStartDate(`${start.year}-${String(start.month).padStart(2, "0")}`);
      }

      const end = existingExperience.endDate;
      if (end && !existingExperience.present) {
        setEndDate(`${end.year}-${String(end.month).padStart(2, "0")}`);
      }
    }
  }, [existingExperience]);

  const showError = (
    ref: React.RefObject<HTMLDivElement | null>,
    message: string
  ) => {
    if (ref.current) ref.current.innerHTML = message;
  };

  const removeErrors = () => {
    [
      hospitalErrorRef,
      designationErrorRef,
      locationErrorRef,
      descriptionErrorRef,
      typeErrorRef,
      startDateErrorRef,
      endDateErrorRef,
    ].forEach((r) => r.current && (r.current.innerHTML = ""));
  };

  function handleSaveClick() {
    removeErrors();
    let valid = true;

    if (!hospital.trim()) {
      valid = false;
      showError(hospitalErrorRef, "Enter hospital name.");
    }

    if (!designation.trim()) {
      valid = false;
      showError(designationErrorRef, "Enter designation.");
    }

    if (!location.trim()) {
      valid = false;
      showError(locationErrorRef, "Enter location.");
    }

    if (!type) {
      valid = false;
      showError(typeErrorRef, "Select work type.");
    }

    if (!startDate) {
      valid = false;
      showError(startDateErrorRef, "Select start date.");
    }

    if (!present && !endDate) {
      valid = false;
      showError(endDateErrorRef, "Select end date.");
    }

    if (startDate && endDate && !present) {
      if (new Date(startDate) > new Date(endDate)) {
        valid = false;
        showError(endDateErrorRef, "End date cannot be before start date.");
      }
    }

    if (!description.trim()) {
      valid = false;
      showError(descriptionErrorRef, "Enter a short description.");
    }

    if (!valid) {
      toast.error("Please fix errors.");
      return;
    }

    const startParts = startDate.split("-");
    const endParts = endDate ? endDate.split("-") : [];

    const experienceData = {
      id: existingExperience ? existingExperience.id : Date.now().toString(),
      hospital,
      designation,
      location,
      description,
      type,
      present,
      startDate: {
        year: parseInt(startParts[0]),
        month: parseInt(startParts[1]),
      },
      endDate:
        !present && endParts.length === 2
          ? {
              year: parseInt(endParts[0]),
              month: parseInt(endParts[1]),
            }
          : undefined,
    };

    onSave(experienceData);
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex justify-center items-center px-4 h-screen w-screen"
      onClick={closeModal}
    >
      <div
        className="flex flex-col bg-white dark:bg-slate-900 p-8 rounded-3xl gap-6 w-full max-w-2xl border border-gray-200 dark:border-slate-800 shadow-2xl shadow-black/20 max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <span className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
              {getIcon("experience", "24px")}
            </span>
            {existingExperience ? "Edit Experience" : "Add Experience"}
          </h2>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full p-2 transition-colors"
          >
            {getIcon("close", "24px")}
          </button>
        </div>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-slate-600 dark:text-slate-400 text-sm font-bold pl-2 mb-1.5">
              Hospital / Clinic Name
            </label>
            <input
              type="text"
              placeholder="e.g. City General Hospital"
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
              className="w-full h-[50px] px-4 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-800 dark:text-white outline-none focus:border-darkGreen dark:focus:border-lightGreen transition-all text-sm md:text-base shadow-sm"
            />
            <div
              className="error-container text-red-500 text-xs font-bold mt-1.5 pl-2"
              ref={hospitalErrorRef}
            ></div>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 text-sm font-bold pl-2 mb-1.5">
              Designation
            </label>
            <input
              type="text"
              placeholder="e.g. Senior Resident, Consultant"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full h-[50px] px-4 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-800 dark:text-white outline-none focus:border-darkGreen dark:focus:border-lightGreen transition-all text-sm md:text-base shadow-sm"
            />
            <div
              className="error-container text-red-500 text-xs font-bold mt-1.5 pl-2"
              ref={designationErrorRef}
            ></div>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 text-sm font-bold pl-2 mb-1.5">
              Location
            </label>
            <input
              type="text"
              placeholder="e.g. Mumbai, Maharashtra"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full h-[50px] px-4 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-800 dark:text-white outline-none focus:border-darkGreen dark:focus:border-lightGreen transition-all text-sm md:text-base shadow-sm"
            />
            <div
              className="error-container text-red-500 text-xs font-bold mt-1.5 pl-2"
              ref={locationErrorRef}
            ></div>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 text-sm font-bold pl-2 mb-1.5">
              Employment Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full h-[50px] px-4 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-800 dark:text-white outline-none focus:border-darkGreen dark:focus:border-lightGreen transition-all text-sm md:text-base shadow-sm cursor-pointer capitalize"
            >
              <option value="" disabled className="dark:bg-slate-900 text-gray-400">Select Employment Type</option>
              {WORK_TYPES.map((t) => (
                <option key={t} value={t} className="dark:bg-slate-900">
                  {t.replace("_", " ")}
                </option>
              ))}
            </select>
            <div
              className="error-container text-red-500 text-xs font-bold mt-1.5 pl-2"
              ref={typeErrorRef}
            ></div>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 text-sm font-bold pl-2 mb-1.5">
              Start Date
            </label>
            <input
              type="month"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full h-[50px] px-4 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-800 dark:text-white outline-none focus:border-darkGreen dark:focus:border-lightGreen transition-all text-sm md:text-base shadow-sm"
            />
            <div
              className="error-container text-red-500 text-xs font-bold mt-1.5 pl-2"
              ref={startDateErrorRef}
            ></div>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 text-sm font-bold pl-2 mb-1.5">
              End Date
            </label>
            <input
              type="month"
              disabled={present}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full h-[50px] px-4 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-800 dark:text-white outline-none focus:border-darkGreen dark:focus:border-lightGreen transition-all text-sm md:text-base shadow-sm disabled:opacity-50 disabled:bg-[#DFDFDF] dark:disabled:bg-slate-700 text-slate-800 dark:text-white"
            />
            <div
              className="error-container text-red-500 text-xs font-bold mt-1.5 pl-2"
              ref={endDateErrorRef}
            ></div>
          </div>

          <div className="md:col-span-2 flex items-center gap-3 pl-2 py-2">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                id="present"
                checked={present}
                onChange={(e) => {
                  setPresent(e.target.checked);
                  if (e.target.checked) setEndDate("");
                }}
                className="w-5 h-5 accent-darkGreen dark:accent-emerald-500 cursor-pointer rounded-md border-gray-300 dark:border-slate-700"
              />
            </div>
            <label
              htmlFor="present"
              className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none"
            >
              I am currently working in this role
            </label>
          </div>

          <div className="md:col-span-2 flex flex-col gap-2">
            <p className="text-slate-600 dark:text-slate-400 text-sm font-bold pl-2">
              Work Description (Optional)
            </p>
            <div className="flex flex-col relative w-full p-1 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 focus-within:border-darkGreen dark:focus-within:border-lightGreen transition-all">
              <textarea
                className="p-3 text-slate-700 dark:text-slate-200 text-base w-full bg-transparent min-h-[100px] outline-none resize-none"
                onChange={(e) => setDescription(e.target.value)}
                value={description}
                placeholder="Briefly describe your responsibilities and achievements"
              ></textarea>
            </div>
            <div
              className="error-container text-red-500 text-xs font-bold mt-1.5 pl-2"
              ref={descriptionErrorRef}
            ></div>
          </div>
        </form>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={closeModal}
            className="px-8 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveClick}
            className="px-10 py-3 bg-darkGreen dark:bg-emerald-600 text-white rounded-2xl font-bold hover:opacity-90 shadow-lg shadow-darkGreen/20 dark:shadow-emerald-900/40 transition-all active:scale-95"
          >
            {existingExperience ? "Update Experience" : "Save Experience"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DExperienceEditModal;
