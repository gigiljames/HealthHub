import ProfileCreationInput from "../common/ProfileCreationInput";
// import { useUserProfileCreationStore } from "../../zustand/userStore";
import { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  addSurgery,
  updateSurgery,
  type Surgery,
} from "../../state/user/uProfileCreationSlice";
import { useUserProfileCreationStore } from "../../zustand/userStore";
import getIcon from "../../helpers/getIcon";

interface USurgeryModalProps {
  type: "add" | "edit";
}

function USurgeryModal({ type }: USurgeryModalProps) {
  const toggleAddModal = useUserProfileCreationStore(
    (state) => state.toggleSurgeryModal
  );
  const toggleEditModal = useUserProfileCreationStore(
    (state) => state.toggleEditSurgeryModal
  );
  const dispatch = useDispatch();
  const editData = useUserProfileCreationStore((state) => state.editData);
  const [surgeryName, setSurgeryName] = useState("");
  const [year, setYear] = useState("");
  const [reason, setReason] = useState("");
  const [surgeryType, setSurgeryType] = useState<"major" | "minor" | "">("");
  const [hospital, setHospital] = useState("");
  const [doctor, setDoctor] = useState("");

  const surgeryNameErrorRef = useRef<HTMLDivElement | null>(null);
  const yearErrorRef = useRef<HTMLDivElement | null>(null);
  const reasonErrorRef = useRef<HTMLDivElement | null>(null);
  const surgeryTypeErrorRef = useRef<HTMLDivElement | null>(null);
  const hospitalErrorRef = useRef<HTMLDivElement | null>(null);
  const doctorErrorRef = useRef<HTMLDivElement | null>(null);

  const showError = (
    ref: React.RefObject<HTMLDivElement | null>,
    message: string
  ) => {
    if (ref.current) ref.current.innerHTML = message;
  };

  const removeErrors = () => {
    [
      surgeryNameErrorRef,
      yearErrorRef,
      reasonErrorRef,
      surgeryTypeErrorRef,
      hospitalErrorRef,
      doctorErrorRef,
    ].forEach((r) => r.current && (r.current.innerHTML = ""));
  };

  const validate = () => {
    removeErrors();
    let valid = true;

    if (!year || year.trim() === "") {
      valid = false;
      showError(yearErrorRef, "Please enter year.");
    } else {
      const currentYear = new Date().getFullYear();
      const yearNum = Number(year);
      if (yearNum < 1900 || yearNum > currentYear) {
        valid = false;
        showError(yearErrorRef, `Enter a valid year (1900-${currentYear})`);
      }
    }

    if (!surgeryName || surgeryName.trim() === "") {
      valid = false;
      showError(surgeryNameErrorRef, "Enter surgery name.");
    }

    if (!reason || reason.trim() === "") {
      valid = false;
      showError(reasonErrorRef, "Enter reason for surgery.");
    }

    if (!surgeryType) {
      valid = false;
      showError(surgeryTypeErrorRef, "Select surgery type.");
    }

    if (!hospital || hospital.trim() === "") {
      valid = false;
      showError(hospitalErrorRef, "Enter hospital name.");
    }

    if (!doctor || doctor.trim() === "") {
      valid = false;
      showError(doctorErrorRef, "Enter doctor name.");
    }

    return valid;
  };
  useEffect(() => {
    if (type === "edit" && editData) {
      setSurgeryName(editData.surgeryName);
      setYear(editData.year);
      setReason(editData.reason);
      setSurgeryType(editData.surgeryType);
      setHospital(editData.hospital);
      setDoctor(editData.doctor);
    }
  }, [editData, type, toggleEditModal]);
  function handleSaveClick() {
    if (!validate()) return;
    const data: Surgery = {
      surgeryName,
      year,
      reason,
      surgeryType,
      hospital,
      doctor,
    };
    dispatch(addSurgery(data));
    toggleAddModal();
  }
  function handleEditClick() {
    if (!validate()) return;
    const data: Surgery = {
      surgeryName,
      year,
      reason,
      surgeryType,
      hospital,
      doctor,
    };
    // validation here
    if (editData) dispatch(updateSurgery({ index: editData.index, data }));
    toggleEditModal();
  }
  function handleClose() {
    if (type === "add") {
      toggleAddModal();
    } else {
      toggleEditModal();
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-99 bg-black/25 h-screen w-screen flex justify-center items-center px-2"
        onClick={handleClose}
      >
        <div
          className="flex flex-col bg-white p-6 rounded-xl gap-3 w-full lg:w-fit max-h-[90vh] overflow-y-auto relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center">
            {type === "add" && (
              <h1 className="font-bold text-xl">Add Past Surgery</h1>
            )}
            {type === "edit" && (
              <h1 className="font-bold text-xl">Edit Past Surgery</h1>
            )}
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              {getIcon("close", "24px", "#000")}
            </button>
          </div>
          <form className="flex flex-col gap-2">
            <div>
              <ProfileCreationInput
                title="Year"
                type="number"
                placeholder="Enter year"
                value={year}
                changeState={function (year) {
                  setYear(year as string);
                }}
              />
              <div className="error-container" ref={yearErrorRef}></div>
            </div>
            <div>
              <ProfileCreationInput
                title="Surgery name"
                placeholder="Enter name of surgery"
                value={surgeryName}
                changeState={function (name) {
                  setSurgeryName(name as string);
                }}
              />
              <div className="error-container" ref={surgeryNameErrorRef}></div>
            </div>
            <div>
              <ProfileCreationInput
                title="Reason"
                placeholder="Enter reason for surgery"
                value={reason}
                changeState={function (reason) {
                  setReason(reason as string);
                }}
              />
              <div className="error-container" ref={reasonErrorRef}></div>
            </div>
            <div>
              <ProfileCreationInput
                title="Major/Minor"
                select={true}
                options={["major", "minor"]}
                value={surgeryType}
                changeState={function (surgeryType) {
                  setSurgeryType(surgeryType as "major" | "minor" | "");
                }}
              />
              <div className="error-container" ref={surgeryTypeErrorRef}></div>
            </div>
            <div>
              <ProfileCreationInput
                title="Hospital"
                placeholder="Enter name of hospital"
                value={hospital}
                changeState={function (hospital) {
                  setHospital(hospital as string);
                }}
              />
              <div className="error-container" ref={hospitalErrorRef}></div>
            </div>
            <div>
              <ProfileCreationInput
                title="Doctor"
                placeholder="Enter name of doctor"
                value={doctor}
                changeState={function (doctor) {
                  setDoctor(doctor as string);
                }}
              />
              <div className="error-container" ref={doctorErrorRef}></div>
            </div>
          </form>
          <div className="flex justify-end">
            <button
              className="py-2 px-8 rounded-lg bg-darkGreen text-white text-center font-semibold"
              onClick={() => {
                if (type === "add") {
                  handleSaveClick();
                } else if (type === "edit") {
                  handleEditClick();
                }
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default USurgeryModal;
