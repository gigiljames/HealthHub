import { MdEdit } from "react-icons/md";
import { RiDeleteBinFill } from "react-icons/ri";
import { useDoctorProfileCreationStore } from "../../zustand/doctoreStore";

function DProfileCreationStage4() {
  const toggleModal = useDoctorProfileCreationStore(
    (state) => state.toggleExperienceModal
  );
  return (
    <>
      <div className="bg-white rounded-lg mt-3 p-5">
        <div className="flex justify-between items-center mb-4">
          <p className="text-lg font-bold">Add Experience</p>
          <button
            className="bg-pastelBlue font-bold px-5 py-2 rounded-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            onClick={() => toggleModal()}
          >
            Add new
          </button>
        </div>
        <hr className="border-[1.5px] border-[#dddddd]" />
        <div className="flex py-2 justify-between">
          <div>
            <p className="font-bold">Kottayam Medical College</p>
            <p className="font-medium">Consultant Cardiologist - Full-time</p>
            <p className="font-medium text-inputBorder">
              Number of years - 4 mo. ( July 2025 - present )
            </p>
          </div>
          <div className="flex gap-2.5 items-center justify-center">
            <span className="hover:scale-110 hover:bg-gray-400 active:scale-75 p-1 rounded-sm cursor-pointer transition-all duration-200">
              <MdEdit size={"20px"} />
            </span>
            <span className="hover:scale-110 hover:bg-red-300 active:scale-75 p-1 rounded-sm cursor-pointer transition-all duration-200">
              <RiDeleteBinFill size={"20px"} />
            </span>
          </div>
        </div>
        <hr className="border-[1.5px] border-[#dddddd]" />
      </div>
    </>
  );
}

export default DProfileCreationStage4;
