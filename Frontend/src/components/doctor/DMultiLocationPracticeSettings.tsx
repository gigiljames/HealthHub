import { useState } from "react";
import getIcon from "../../helpers/getIcon";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import DPracticeLocationModal from "./DPracticeLocationModal";
import toast from "react-hot-toast";
import { deletePracticeLocation } from "../../state/doctor/dProfileCreationSlice";
import { setupPractice } from "../../api/doctor/dProfileCreationService";
import ConfirmationModal from "../common/ConfirmationModal";

function DMultiLocationPracticeSettings() {
  const dispatch = useDispatch();
  const { practiceType, practiceLocations } = useSelector(
    (state: RootState) => state.dProfileCreation,
  );
  const [practiceLocationModal, setPracticeLocationModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [locationIdToDelete, setLocationIdToDelete] = useState<string>("");

  const handleAddNew = () => {
    setEditingLocation(null);
    setPracticeLocationModal(true);
  };

  const handleEdit = (location: any) => {
    setEditingLocation(location);
    setPracticeLocationModal(true);
  };

  const handleDelete = () => {
    dispatch(deletePracticeLocation(locationIdToDelete));
    toast.success("Practice location deleted successfully.");
    setConfirmationModal(false);
    setLocationIdToDelete("");
  };

  async function handleSaveClick() {
    //api call here
    const setPracticeData = {
      practiceLocations,
      practiceType,
    };
    console.log(setPracticeData);
    const response = await setupPractice(setPracticeData);
    console.log(response);
    if (response.success) {
      toast.success("Practice location saved successfully.");
    } else {
      toast.error(response.message);
    }
  }

  return (
    <>
      <ConfirmationModal
        isOpen={confirmationModal}
        onClose={() => setConfirmationModal(false)}
        onConfirm={handleDelete}
        title={"Delete Practice Location?"}
        message={`Are you sure that you want to delete this practice location?`}
        confirmText={"Delete"}
        isDestructive={true}
      />
      {practiceLocationModal && (
        <DPracticeLocationModal
          existingPracticeLocation={editingLocation}
          setPracticeLocationModal={setPracticeLocationModal}
        />
      )}
      {practiceLocations.length > 0 && (
        <div className="flex flex-col gap-2 ">
          <h3 className="text-lg font-semibold">
            My Locations ({practiceLocations.length})
          </h3>
          <div className="flex flex-col gap-2 mb-4">
            {practiceLocations.map((location) => (
              <div
                key={location._id}
                className="border-1 border-gray-300 bg-white rounded-lg p-4 flex flex-col gap-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-lg">{location.name}</p>
                    <div className="p-1 border-1 rounded-md border-darkGreen/70 bg-lightGreen/60 text-darkGreen/70 w-fit text-xs lg:text-sm font-semibold">
                      {location.type}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div
                      className="text-gray-400 hover:text-blue-500 hover:bg-blue-100 p-1.5 rounded-md cursor-pointer"
                      onClick={() => handleEdit(location)}
                    >
                      {getIcon("edit", "18px")}
                    </div>
                    <div
                      className="text-gray-400 hover:text-red-400 hover:bg-red-100 p-1.5 rounded-md cursor-pointer"
                      onClick={() => {
                        setLocationIdToDelete(location._id);
                        setConfirmationModal(true);
                      }}
                    >
                      {getIcon("trash", "18px")}
                    </div>
                  </div>
                </div>
                <p className="text-sm lg:text-base text-gray-700">
                  Consultation fee: ₹{location.consultationFee}
                </p>
                {location.consultationModes &&
                  location.consultationModes.length > 0 && (
                    <p className="text-sm lg:text-base text-gray-700">
                      Modes:{" "}
                      {location.consultationModes
                        .map((m) => m.replace("_", " "))
                        .join(", ")}
                    </p>
                  )}
                {location.location && (
                  <p className="text-sm lg:text-base text-gray-700">
                    Location: {location.location.address}
                  </p>
                )}
                <div className="flex gap-2">
                  {location.isPrimary && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md w-fit">
                      Primary
                    </span>
                  )}
                  {location.isActive ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-md w-fit">
                      Active
                    </span>
                  ) : (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-md w-fit">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 items-center justify-center border-dashed border-2 border-gray-300 p-7 px-10 rounded-xl">
        <div className="bg-gray-200 p-3 rounded-full text-gray-500">
          {getIcon("add-location", "40px")}
        </div>
        <p className="font-semibold">Add practice location</p>
        <p className="text-center text-gray-500 text-sm lg:text-base">
          Include online consultations, hospitals, private clinics, or any other
          physical location where patients can visit you.
        </p>
        <button
          className="flex gap-2 items-center justify-center bg-white hover:bg-gray-50 transition-colors duration-200 active:bg-gray-100 border-1 border-gray-300 px-4 py-2 rounded-md max-w-[300px] font-medium"
          onClick={handleAddNew}
        >
          + Add practice location
        </button>
      </div>
      <div className="flex items-center justify-end py-3">
        <button
          className="bg-lightGreen/80 hover:bg-lightGreen/90 transition-colors duration-200 active:bg-lightGreen px-20 py-2.5 text-gray-50 hover:text-white text-lg rounded-md font-medium border-1 border-lightGreen"
          onClick={() => handleSaveClick()}
        >
          Save Changes
        </button>
      </div>
    </>
  );
}

export default DMultiLocationPracticeSettings;
