import ProfileCreationInput from "../common/ProfileCreationInput";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import {
  addSurgery,
  updateSurgery,
  type Surgery,
} from "../../state/user/uProfileCreationSlice";
import { useUserProfileCreationStore } from "../../zustand/userStore";
import getIcon from "../../helpers/getIcon";
import { saveUserProfileStage4 } from "../../api/user/uProfileCreationService";
import toast from "react-hot-toast";

interface USurgeryModalProps {
  type: "add" | "edit";
}

function USurgeryModal({ type }: USurgeryModalProps) {
  const toggleAddModal = useUserProfileCreationStore(
    (state) => state.toggleSurgeryModal,
  );
  const toggleEditModal = useUserProfileCreationStore(
    (state) => state.toggleEditSurgeryModal,
  );
  const dispatch = useDispatch();
  const surgeries = useSelector(
    (state: RootState) => state.uProfileCreation.pastSurgeries,
  );
  const userId = useSelector((state: RootState) => state.userInfo.id);
  const editData = useUserProfileCreationStore((state) => state.editData);

  const [surgeryName, setSurgeryName] = useState("");
  const [year, setYear] = useState("");
  const [reason, setReason] = useState("");
  const [surgeryType, setSurgeryType] = useState<"major" | "minor" | "">("");
  const [hospital, setHospital] = useState("");
  const [doctor, setDoctor] = useState("");
  const [loading, setLoading] = useState(false);

  const surgeryNameErrorRef = useRef<HTMLDivElement | null>(null);
  const yearErrorRef = useRef<HTMLDivElement | null>(null);
  const reasonErrorRef = useRef<HTMLDivElement | null>(null);
  const surgeryTypeErrorRef = useRef<HTMLDivElement | null>(null);
  const hospitalErrorRef = useRef<HTMLDivElement | null>(null);
  const doctorErrorRef = useRef<HTMLDivElement | null>(null);

  const showError = (
    ref: React.RefObject<HTMLDivElement | null>,
    message: string,
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

  async function handleSaveClick() {
    if (!validate()) return;
    setLoading(true);

    const data: Surgery = {
      surgeryName,
      year,
      reason,
      surgeryType,
      hospital,
      doctor,
    };

    const newSurgeries = [...surgeries, data];

    try {
      const response = await saveUserProfileStage4({
        userId,
        surgeries: newSurgeries,
      });
      if (response?.success) {
        dispatch(addSurgery(data));
        toggleAddModal();
        toast.success("Surgery added successfully!");
      } else {
        throw new Error(response?.message || "Failed to save surgery");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred while saving surgery.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEditClick() {
    if (!validate()) return;
    if (!editData) return;
    setLoading(true);

    const data: Surgery = {
      surgeryName,
      year,
      reason,
      surgeryType,
      hospital,
      doctor,
    };

    const newSurgeries = [...surgeries];
    newSurgeries[editData.index] = data;

    try {
      const response = await saveUserProfileStage4({
        userId,
        surgeries: newSurgeries,
      });
      if (response?.success) {
        dispatch(updateSurgery({ index: editData.index, data }));
        toggleEditModal();
        toast.success("Surgery updated successfully!");
      } else {
        throw new Error(response?.message || "Failed to update surgery");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred while updating surgery.");
    } finally {
      setLoading(false);
    }
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
        className="fixed inset-0 z-50 bg-black/50 h-screen w-screen flex justify-center items-center px-2"
        onClick={handleClose}
      >
        <div
          className="flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl gap-3 w-full  max-w-xl max-h-[90vh] overflow-y-auto relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-2">
            {type === "add" && (
              <h1 className="font-bold text-xl text-gray-900 dark:text-gray-100">
                Add Past Surgery
              </h1>
            )}
            {type === "edit" && (
              <h1 className="font-bold text-xl text-gray-900 dark:text-gray-100">
                Edit Past Surgery
              </h1>
            )}
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 dark:text-gray-400"
            >
              {getIcon("close", "24px", "#666666")}
            </button>
          </div>
          <form className="flex flex-col gap-3">
            <div>
              <ProfileCreationInput
                title="Year"
                type="number"
                placeholder="Enter year"
                value={year}
                changeState={function (year) {
                  setYear(String(year));
                }}
              />
              <div
                className="text-red-500 text-xs mt-1"
                ref={yearErrorRef}
              ></div>
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
              <div
                className="text-red-500 text-xs mt-1"
                ref={surgeryNameErrorRef}
              ></div>
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
              <div
                className="text-red-500 text-xs mt-1"
                ref={reasonErrorRef}
              ></div>
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
              <div
                className="text-red-500 text-xs mt-1"
                ref={surgeryTypeErrorRef}
              ></div>
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
              <div
                className="text-red-500 text-xs mt-1"
                ref={hospitalErrorRef}
              ></div>
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
              <div
                className="text-red-500 text-xs mt-1"
                ref={doctorErrorRef}
              ></div>
            </div>
          </form>
          <div className="flex justify-end pt-4 mt-2 border-t border-gray-100 dark:border-gray-800">
            <button
              disabled={loading}
              className="py-2.5 px-8 rounded-lg  bg-lightGreen/80 hover:bg-lightGreen/90 transition-colors duration-200 active:bg-lightGreen font-medium border-1 border-lightGreen text-center text-white disabled:opacity-50"
              onClick={() => {
                if (type === "add") {
                  handleSaveClick();
                } else if (type === "edit") {
                  handleEditClick();
                }
              }}
            >
              {loading ? "Saving..." : "Save Surgery"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default USurgeryModal;
