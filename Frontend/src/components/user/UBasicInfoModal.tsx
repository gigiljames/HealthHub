import getIcon from "../../helpers/getIcon";
import { useUserProfileCreationStore } from "../../zustand/userStore";

function UBasicInfoModal() {
  const { toggleEditBasicInfoModal } = useUserProfileCreationStore();
  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={(e) => {
          e.stopPropagation();
          toggleEditBasicInfoModal();
        }}
      >
        <div
          className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Edit Basic Information</h2>
            <button
              onClick={toggleEditBasicInfoModal}
              className="text-gray-500 hover:text-gray-700"
            >
              {getIcon("close", "24px", "black")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default UBasicInfoModal;
