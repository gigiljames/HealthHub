import { useState, useRef, useEffect } from "react";
import ProfileCreationInput from "../../common/ProfileCreationInput";
import getIcon from "../../../helpers/getIcon";
import toast from "react-hot-toast";

interface DEducationEditModalProps {
  existingEducation?: any;
  closeModal: () => void;
  onSave: (education: any) => void;
}

function DEducationEditModal({
  existingEducation,
  closeModal,
  onSave,
}: DEducationEditModalProps) {
  const [title, setTitle] = useState("");
  const [institution, setInstitution] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [description, setDescription] = useState("");
  const titleErrorRef = useRef<HTMLDivElement | null>(null);
  const institutionErrorRef = useRef<HTMLDivElement | null>(null);
  const graduationYearErrorRef = useRef<HTMLDivElement | null>(null);
  const descriptionErrorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (existingEducation) {
      setTitle(existingEducation.title || "");
      setInstitution(existingEducation.institution || "");
      setGraduationYear(
        existingEducation.graduationYear
          ? existingEducation.graduationYear.toString()
          : ""
      );
      setDescription(existingEducation.description || "");
    }
  }, [existingEducation]);

  const showError = (
    ref: React.RefObject<HTMLDivElement | null>,
    message: string
  ) => {
    if (ref.current) ref.current.innerHTML = message;
  };

  const removeErrors = () => {
    [
      titleErrorRef,
      institutionErrorRef,
      graduationYearErrorRef,
      descriptionErrorRef,
    ].forEach((r) => r.current && (r.current.innerHTML = ""));
  };

  function handleSaveClick() {
    removeErrors();
    let valid = true;

    if (!title.trim()) {
      valid = false;
      showError(titleErrorRef, "Enter degree title.");
    }

    if (!institution.trim()) {
      valid = false;
      showError(institutionErrorRef, "Enter institution name.");
    }

    const year = Number(graduationYear);
    const currentYear = new Date().getFullYear();
    if (!graduationYear) {
      valid = false;
      showError(graduationYearErrorRef, "Enter graduation year.");
    } else if (isNaN(year) || year < 1950 || year > currentYear + 10) {
      valid = false;
      showError(graduationYearErrorRef, "Enter a valid year.");
    }

    if (!description.trim()) {
      valid = false;
      showError(descriptionErrorRef, "Enter a short description.");
    }

    if (!valid) {
      toast.error("Please fix errors.");
      return;
    }

    const educationData = {
      id: existingEducation ? existingEducation.id : Date.now().toString(),
      title,
      institution,
      graduationYear: year,
      description,
    };

    onSave(educationData);
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex justify-center items-center px-4 h-screen w-screen"
      onClick={closeModal}
    >
      <div
        className="flex flex-col bg-white dark:bg-slate-900 p-8 rounded-3xl gap-6 w-full max-w-lg border border-gray-200 dark:border-slate-800 shadow-2xl shadow-black/20 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <span className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
              {getIcon("school", "24px")}
            </span>
            {existingEducation ? "Edit Education" : "Add Education"}
          </h2>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full p-2 transition-colors"
          >
            {getIcon("close", "24px")}
          </button>
        </div>

        <form className="flex flex-col gap-5">
          <div>
            <ProfileCreationInput
              title="Degree / Certification"
              placeholder="e.g. MBBS, MD, Fellowship in Cardiology"
              value={title}
              changeState={(val) => setTitle(val as string)}
            />
            <div
              className="error-container text-red-500 text-xs font-bold mt-1.5 pl-2"
              ref={titleErrorRef}
            ></div>
          </div>

          <div>
            <ProfileCreationInput
              title="Institution / College"
              placeholder="Enter name of college or university"
              value={institution}
              changeState={(val) => setInstitution(val as string)}
            />
            <div
              className="error-container text-red-500 text-xs font-bold mt-1.5 pl-2"
              ref={institutionErrorRef}
            ></div>
          </div>

          <div>
            <ProfileCreationInput
              title="Graduation Year"
              placeholder="e.g. 2018"
              type="number"
              value={graduationYear}
              changeState={(val) => setGraduationYear(val as string)}
            />
            <div
              className="error-container text-red-500 text-xs font-bold mt-1.5 pl-2"
              ref={graduationYearErrorRef}
            ></div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-slate-600 dark:text-slate-400 text-sm font-bold pl-2">
              Additional Details (Optional)
            </p>
            <div className="flex flex-col relative w-full p-1 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 focus-within:border-darkGreen dark:focus-within:border-lightGreen transition-all">
              <textarea
                className="p-3 text-slate-700 dark:text-slate-200 text-base w-full bg-transparent min-h-[100px] outline-none resize-none"
                onChange={(e) => setDescription(e.target.value)}
                value={description}
                placeholder="Mention any honors, special projects, or GPA if relevant"
              ></textarea>
            </div>
            <div
              className="error-container text-red-500 text-xs font-bold mt-1.5 pl-2"
              ref={descriptionErrorRef}
            ></div>
          </div>
        </form>

        <div className="flex justify-end gap-4 mt-4">
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
            {existingEducation ? "Update Education" : "Save Education"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DEducationEditModal;
