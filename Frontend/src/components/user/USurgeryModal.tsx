import ProfileCreationInput from "../common/ProfileCreationInput";
// import { useUserProfileCreationStore } from "../../zustand/userStore";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  addSurgery,
  updateSurgery,
  type Surgery,
} from "../../state/user/uProfileCreationSlice";
import { useUserProfileCreationStore } from "../../zustand/userStore";

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
    const data: Surgery = {
      surgeryName,
      year,
      reason,
      surgeryType,
      hospital,
      doctor,
    };
    // validation here
    dispatch(addSurgery(data));
    toggleAddModal();
  }
  function handleEditClick() {
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
  return (
    <>
      <div className="fixed top-0 z-99 bg-black/25 h-full w-screen flex justify-center items-center px-2">
        <div className="flex flex-col bg-white p-6 rounded-xl gap-3 w-full lg:w-fit">
          {type === "add" && (
            <h1 className="font-bold text-xl">Add Past Surgery</h1>
          )}
          {type === "edit" && (
            <h1 className="font-bold text-xl">Edit Past Surgery</h1>
          )}
          <form className="flex flex-col gap-2">
            <ProfileCreationInput
              title="Year"
              type="number"
              placeholder="Enter year"
              value={year}
              changeState={function (year) {
                setYear(year as string);
              }}
            />
            <ProfileCreationInput
              title="Surgery name"
              placeholder="Enter name of surgery"
              value={surgeryName}
              changeState={function (name) {
                setSurgeryName(name as string);
              }}
            />
            <ProfileCreationInput
              title="Reason"
              placeholder="Enter reason for surgery"
              value={reason}
              changeState={function (reason) {
                setReason(reason as string);
              }}
            />
            <ProfileCreationInput
              title="Major/Minor"
              select={true}
              options={["major", "minor"]}
              value={surgeryType}
              changeState={function (surgeryType) {
                setSurgeryType(surgeryType as "major" | "minor" | "");
              }}
            />
            <ProfileCreationInput
              title="Hospital"
              placeholder="Enter name of hospital"
              value={hospital}
              changeState={function (hospital) {
                setHospital(hospital as string);
              }}
            />
            <ProfileCreationInput
              title="Doctor"
              placeholder="Enter name of doctor"
              value={doctor}
              changeState={function (doctor) {
                setDoctor(doctor as string);
              }}
            />
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
