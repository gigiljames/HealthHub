import { useState } from "react";
import getIcon from "../../helpers/getIcon";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import DPracticeLocationModal from "./DPracticeLocationModal";
import toast from "react-hot-toast";
import { setPracticeLocations } from "../../state/doctor/dProfileCreationSlice";
import { setupPractice, getPracticeDetails } from "../../api/doctor/dProfileCreationService";
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

  const handleDelete = async () => {
    const updatedLocations = practiceLocations.filter(
      (loc) => loc._id !== locationIdToDelete
    );
    const setPracticeData = {
      practiceLocations: updatedLocations,
      practiceType,
    };
    const response = await setupPractice(setPracticeData);
    if (response.success) {
      toast.success("Practice location deleted successfully.");
      if (response.data?.practiceLocations) {
        dispatch(setPracticeLocations(response.data.practiceLocations));
      }
    } else {
      toast.error(response.message || "Failed to delete practice location.");
    }
    setConfirmationModal(false);
    setLocationIdToDelete("");
  };

  const handleSaveLocation = async (locationData: any) => {
    let updatedLocations;
    if (editingLocation) {
      updatedLocations = practiceLocations.map((loc) =>
        loc._id === editingLocation._id ? locationData : loc
      );
    } else {
      updatedLocations = [...practiceLocations, locationData];
    }

    const setPracticeData = {
      practiceLocations: updatedLocations,
      practiceType,
    };

    const response = await setupPractice(setPracticeData);
    if (response.success) {
      toast.success(
        editingLocation
          ? "Practice location updated successfully."
          : "Practice location added successfully."
      );
      if (response.data?.practiceLocations) {
        dispatch(setPracticeLocations(response.data.practiceLocations));
      }
      return true;
    } else {
      toast.error(response.message || "Failed to save practice location.");
      return false;
    }
  };

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
          onSave={handleSaveLocation}
        />
      )}
      {practiceLocations.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center gap-4">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              My Locations ({practiceLocations.length})
            </h3>
            <button
              onClick={handleAddNew}
              className="flex gap-2 items-center justify-center bg-darkGreen text-white px-2 md:px-4 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-opacity-95 transition-all active:scale-95 cursor-pointer"
            >
              + Add practice location
            </button>
          </div>
          <div className="flex flex-col gap-3 mb-4">
            {practiceLocations.map((location) => (
              <div
                key={location._id}
                className="border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-5 flex flex-col gap-2 transition-colors duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <p className="font-bold text-lg text-gray-950 dark:text-white">{location.name}</p>
                    <div className="px-2.5 py-0.5 border border-darkGreen/50 dark:border-lightGreen/50 bg-lightGreen/10 text-darkGreen dark:text-lightGreen rounded-lg text-xs font-bold capitalize">
                      {location.type.toLowerCase()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 p-2 rounded-xl cursor-pointer transition-all active:scale-95"
                      onClick={() => handleEdit(location)}
                    >
                      {getIcon("edit", "18px")}
                    </button>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 p-2 rounded-xl cursor-pointer transition-all active:scale-95"
                      onClick={() => {
                        setLocationIdToDelete(location._id);
                        setConfirmationModal(true);
                      }}
                    >
                      {getIcon("trash", "18px")}
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-slate-300">
                  Consultation fee: <span className="font-bold text-gray-900 dark:text-white">₹{location.consultationFee}</span>
                </p>
                {location.consultationModes &&
                  location.consultationModes.length > 0 && (
                    <p className="text-sm text-gray-600 dark:text-slate-300">
                      Modes:{" "}
                      <span className="font-semibold text-gray-800 dark:text-slate-200">
                        {location.consultationModes
                          .map((m) => m.replace("_", " "))
                          .join(", ")}
                      </span>
                    </p>
                  )}
                {location.location && (
                  <p className="text-sm text-gray-600 dark:text-slate-300">
                    Location: <span className="font-medium text-gray-800 dark:text-slate-200">{location.location.address}</span>
                  </p>
                )}
                <div className="flex gap-2 mt-1">
                  {location.isPrimary && (
                    <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 px-2.5 py-1 rounded-lg font-bold">
                      Primary
                    </span>
                  )}
                  {location.isActive ? (
                    <span className="text-xs bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 px-2.5 py-1 rounded-lg font-bold">
                      Active
                    </span>
                  ) : (
                    <span className="text-xs bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 px-2.5 py-1 rounded-lg font-bold">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {practiceLocations.length === 0 && (
        <div className="flex flex-col gap-3 items-center justify-center border-dashed border-2 border-gray-300 p-8 px-10 rounded-2xl bg-gray-50/50 dark:bg-slate-800/10">
          <div className="bg-gray-100 dark:bg-slate-800 p-4 rounded-full text-gray-500">
            {getIcon("add-location", "40px")}
          </div>
          <p className="font-bold text-gray-800 dark:text-white">Add practice location</p>
          <p className="text-center text-gray-500 text-sm max-w-md">
            Include online consultations, hospitals, private clinics, or any other
            physical location where patients can visit you.
          </p>
          <button
            className="flex gap-2 items-center justify-center bg-darkGreen text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-opacity-95 transition-all active:scale-95 cursor-pointer mt-2"
            onClick={handleAddNew}
          >
            + Add practice location
          </button>
        </div>
      )}

    </>
  );
}

export default DMultiLocationPracticeSettings;
