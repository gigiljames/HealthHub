import { useState, useEffect, useRef } from "react";
import ProfileCreationInput from "../common/ProfileCreationInput";
import { useDoctorProfileCreationStore } from "../../zustand/doctoreStore";
import { useDispatch } from "react-redux";
import {
  addExperience,
  updateExperience,
} from "../../state/doctor/dProfileCreationSlice";
import getIcon from "../../helpers/getIcon";
import toast from "react-hot-toast";

interface DExperienceModalProps {
  existingExperience?: any;
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

function DExperienceModal({ existingExperience }: DExperienceModalProps) {
  const toggleModal = useDoctorProfileCreationStore(
    (state) => state.toggleExperienceModal
  );
  const dispatch = useDispatch();

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
      setHospital(existingExperience.hospital);
      setDesignation(existingExperience.designation);
      setLocation(existingExperience.location);
      setDescription(existingExperience.description);
      setType(existingExperience.type);

      const start = existingExperience.startDate;
      if (start) {
        setStartDate(`${start.year}-${String(start.month).padStart(2, "0")}`);
      }

      setPresent(existingExperience.present);

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

    if (existingExperience) {
      dispatch(updateExperience(experienceData));
    } else {
      dispatch(addExperience(experienceData));
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
          className="flex flex-col bg-white p-6 rounded-xl gap-3 w-full lg:w-[600px] relative max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center">
            <h1 className="font-bold text-xl">
              {existingExperience ? "Edit Experience" : "Add Experience"}
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
                title="Name of Hospital"
                placeholder="Enter name of hospital"
                value={hospital}
                changeState={(val) => setHospital(val as string)}
              />
              <div className="error-container" ref={hospitalErrorRef}></div>
            </div>

            <div>
              <ProfileCreationInput
                title="Designation"
                placeholder="Enter designation"
                value={designation}
                changeState={(val) => setDesignation(val as string)}
              />
              <div className="error-container" ref={designationErrorRef}></div>
            </div>
            <div>
              <ProfileCreationInput
                title="Location"
                placeholder="Enter location"
                value={location}
                changeState={(val) => setLocation(val as string)}
              />
              <div className="error-container" ref={locationErrorRef}></div>
            </div>

            <div>
              <ProfileCreationInput
                title="Type"
                select={true}
                options={WORK_TYPES}
                value={type}
                changeState={(val) => setType(val as string)}
              />
              <div className="error-container" ref={typeErrorRef}></div>
            </div>

            <div>
              <ProfileCreationInput
                title="Start date"
                type="month"
                value={startDate}
                changeState={(val) => setStartDate(val as string)}
              />
              <div className="error-container" ref={startDateErrorRef}></div>
            </div>
            <div>
              <ProfileCreationInput
                title="End date"
                type="month"
                disabled={present}
                value={endDate}
                changeState={(val) => setEndDate(val as string)}
              />
              <div className="error-container" ref={endDateErrorRef}></div>
            </div>

            <div className="flex items-center gap-2 pl-1">
              <input
                type="checkbox"
                id="present"
                checked={present}
                onChange={(e) => {
                  setPresent(e.target.checked);
                  if (e.target.checked) setEndDate("");
                }}
                className="w-4 h-4 accent-darkGreen cursor-pointer"
              />
              <label
                htmlFor="present"
                className="text-sm font-medium cursor-pointer select-none"
              >
                Currently working here
              </label>
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

export default DExperienceModal;
