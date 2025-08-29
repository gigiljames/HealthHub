import React from "react";
import ProfileCreationInput from "../common/ProfileCreationInput";
import { useUserProfileCreationStore } from "../../zustand/userStore";

function USurgeryModal() {
  const toggleModal = useUserProfileCreationStore(
    (state) => state.toggleSurgeryModal
  );
  function handleSaveClick() {
    toggleModal();
  }
  return (
    <>
      <div className="fixed top-0 z-99 bg-black/25 h-full w-screen flex justify-center items-center px-2">
        <div className="flex flex-col bg-white p-6 rounded-xl gap-3 w-full lg:w-fit">
          <h1 className="font-bold text-xl">Add Past Surgery</h1>
          <form className="flex flex-col gap-2">
            <ProfileCreationInput
              title="Year"
              type="number"
              placeholder="Enter year"
            />
            <ProfileCreationInput
              title="Surgery name"
              placeholder="Enter name of surgery"
            />
            <ProfileCreationInput
              title="Reason"
              placeholder="Enter reason for surgery"
            />
            <ProfileCreationInput
              title="Major/Minor"
              select={true}
              options={["major", "minor"]}
            />
            <ProfileCreationInput
              title="Hospital"
              placeholder="Enter name of hospital"
            />
            <ProfileCreationInput
              title="Doctor"
              placeholder="Enter name of doctor"
            />
          </form>
          <div className="flex justify-end">
            <button
              className="py-2 px-8 rounded-lg bg-darkGreen text-white text-center font-semibold"
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

export default USurgeryModal;
