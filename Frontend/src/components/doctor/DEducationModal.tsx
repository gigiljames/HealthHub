import { useState, useEffect, useRef } from "react";
import ProfileCreationInput from "../common/ProfileCreationInput";
import { useDoctorProfileCreationStore } from "../../zustand/doctoreStore";
import { useDispatch } from "react-redux";
import {
  addEducation,
  updateEducation,
} from "../../state/doctor/dProfileCreationSlice";
import getIcon from "../../helpers/getIcon";
import toast from "react-hot-toast";

interface DEducationModalProps {
  existingEducation?: any;
}

function DEducationModal({ existingEducation }: DEducationModalProps) {
  const toggleModal = useDoctorProfileCreationStore(
    (state) => state.toggleEducationModal
  );
  const dispatch = useDispatch();

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
      setTitle(existingEducation.title);
      setInstitution(existingEducation.institution);
      setGraduationYear(existingEducation.graduationYear.toString());
      setDescription(existingEducation.description);
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

    if (existingEducation) {
      dispatch(updateEducation(educationData));
    } else {
      dispatch(addEducation(educationData));
    }
    toggleModal();
  }

  return (
    <>
      <div
        className="fixed top-0 left-0 z-50 bg-black/25 h-screen w-screen flex justify-center items-center px-2"
        onClick={() => toggleModal()}
      >
        <div
          className="flex flex-col bg-white p-6 rounded-xl gap-3 w-full lg:w-[500px] relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center">
            <h1 className="font-bold text-xl">
              {existingEducation ? "Edit Education" : "Add Education"}
            </h1>
            <span
              className="cursor-pointer hover:bg-gray-100 p-1 rounded-full"
              onClick={() => toggleModal()}
            >
              {getIcon("close", "24px", "black")}
            </span>
          </div>

          <form className="flex flex-col gap-2">
            <div>
              <ProfileCreationInput
                title="Degree"
                placeholder="Enter name of degree (e.g. MBBS)"
                value={title}
                changeState={(val) => setTitle(val as string)}
              />
              <div className="error-container" ref={titleErrorRef}></div>
            </div>

            <div>
              <ProfileCreationInput
                title="Name of college"
                placeholder="Enter name of college"
                value={institution}
                changeState={(val) => setInstitution(val as string)}
              />
              <div className="error-container" ref={institutionErrorRef}></div>
            </div>

            <div>
              <ProfileCreationInput
                title="Graduation Year"
                placeholder="Enter graduation year"
                type="number"
                value={graduationYear}
                changeState={(val) => setGraduationYear(val as string)}
              />
              <div
                className="error-container"
                ref={graduationYearErrorRef}
              ></div>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-[#717171] text-[12px] md:text-sm font-semibold pl-2">
                Description
              </p>
              <div className="flex flex-col relative w-full mb-1.5 p-1 bg-white rounded-lg border-1 border-inputBorder">
                <textarea
                  className="p-2 peer text-sm md:text-[16px] w-full bg-white min-h-[80px] outline-none resize-none"
                  onChange={(e) => setDescription(e.target.value)}
                  value={description}
                  placeholder="Enter a short description"
                ></textarea>
              </div>
              <div className="error-container" ref={descriptionErrorRef}></div>
            </div>
          </form>
          <div className="flex justify-end">
            <button
              className="py-2 px-8 rounded-lg bg-darkGreen text-white text-center font-semibold hover:-translate-y-0.5 transition-all"
              onClick={handleSaveClick}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default DEducationModal;
