import ProfileCreationInput from "../common/ProfileCreationInput";
import { useDoctorProfileCreationStore } from "../../zustand/doctoreStore";

function DExperienceModal() {
  const toggleModal = useDoctorProfileCreationStore(
    (state) => state.toggleExperienceModal
  );
  function handleSaveClick() {
    toggleModal();
  }
  return (
    <>
      <div className=" fixed top-0 z-99 bg-black/25 h-screen w-screen flex justify-center items-center px-2">
        <div className="flex flex-col bg-white p-6 rounded-xl gap-3 w-full lg:w-fit">
          <h1 className="font-bold text-xl">Add Education</h1>
          <form className="flex flex-col gap-2">
            <ProfileCreationInput
              title="Name of Hospital"
              placeholder="Enter name of hospital"
            />
            <ProfileCreationInput
              title="Designation"
              placeholder="Enter designation"
            />
            <ProfileCreationInput title="Start date" type="date" />
            <ProfileCreationInput
              title="End date (Leave blank if currently working here)"
              type="date"
            />
            <ProfileCreationInput
              title="Type"
              select={true}
              options={["Full-time", "Part-time"]}
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

export default DExperienceModal;
