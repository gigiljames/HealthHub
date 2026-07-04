import React, { useState, useEffect } from "react";
import { MdEdit } from "react-icons/md";
import { RiDeleteBinFill } from "react-icons/ri";
import LoadingCircle from "../common/LoadingCircle";
import ConfirmationModal from "../common/ConfirmationModal";
import { useNavigate } from "react-router";
import { useUserProfileCreationStore } from "../../zustand/userStore";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import {
  removeSurgery,
  setSurgeries,
  type Surgery,
} from "../../state/user/uProfileCreationSlice";
import toast from "react-hot-toast";
import {
  saveUserProfileStage4,
  getUserProfileStage4,
} from "../../api/user/uProfileCreationService";
import { setIsNewUser } from "../../state/auth/userInfoSlice";

interface UProfileCreationStage4Props {
  changeStage: React.Dispatch<React.SetStateAction<number>>;
}

function UProfileCreationStage4({ changeStage }: UProfileCreationStage4Props) {
  const surgeries = useSelector(
    (state: RootState) => state.uProfileCreation.pastSurgeries,
  );
  const toggleEditModal = useUserProfileCreationStore(
    (state) => state.toggleEditSurgeryModal,
  );
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const setEditData = useUserProfileCreationStore((state) => state.setEditData);
  const [loading, setLoading] = useState<boolean>(false);
  const toggle = useUserProfileCreationStore(
    (state) => state.toggleSurgeryModal,
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [surgeryToDelete, setSurgeryToDelete] = useState<number | null>(null);

  const handleDeleteSurgery = (index: number) => {
    setSurgeryToDelete(index);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (surgeryToDelete !== null) {
      const newSurgeries = [...surgeries];
      newSurgeries.splice(surgeryToDelete, 1);

      try {
        const response = await saveUserProfileStage4({
          userId: userInfo.id,
          surgeries: newSurgeries,
        });

        if (response?.success) {
          dispatch(removeSurgery(surgeryToDelete));
          toast.success("Surgery record removed successfully.");
        } else {
          throw new Error(response?.message || "Failed to remove surgery");
        }
      } catch (error) {
        console.error(error);
        toast.error("An error occurred while deleting surgery.");
      } finally {
        setSurgeryToDelete(null);
        setDeleteConfirmOpen(false);
      }
    } else {
      setDeleteConfirmOpen(false);
    }
  };

  function handleBackClick() {
    changeStage((prev) => {
      return prev - 1;
    });
  }
  async function handleNextClick() {
    const stage4Data = {
      userId: userInfo.id,
      surgeries,
    };
    setLoading(true);
    setLoading(false);
    try {
      const data = await saveUserProfileStage4(stage4Data);
      setLoading(false);
      if (data.success) {
        toast.success(data?.message || "Saved successfully.");
      } else {
        throw new Error("An error occured while saving profile.");
      }
      dispatch(setIsNewUser(false));
      navigate("/profile");
    } catch (error) {
      toast.error(
        (error as Error)?.message || "An error occured while saving profile.",
      );
    }
  }
  function handleEditClick(data: Surgery & { index: number }) {
    setEditData(data);
    toggleEditModal();
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getUserProfileStage4();
        const profileData = data?.data;
        if (
          profileData &&
          profileData.surgeries &&
          profileData.surgeries.length > 0
        ) {
          dispatch(setSurgeries(profileData.surgeries));
        }
      } catch (error) {
        toast.error(
          (error as Error).message || "An error occured while fetching data.",
        );
      }
    }
    fetchData();
  }, [dispatch]);

  return (
    <>
      <ConfirmationModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Surgery"
        message="Are you sure you want to delete this surgery entry? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />
      <div className="p-6 bg-white border-1 flex flex-col gap-6 border-gray-200 rounded-2xl w-full max-w-5xl">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Past Surgeries</h1>
          <p className="text-gray-500 text-sm lg:text-base">
            Please list any past surgeries you have undergone.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Surgeries</h2>
            <button
              className="flex gap-2 items-center justify-center bg-white hover:bg-gray-50 transition-colors duration-200 active:bg-gray-100 border-1 border-gray-300 px-4 py-2 rounded-md font-medium text-sm text-gray-700"
              onClick={() => toggle()}
            >
              + Add past surgery
            </button>
          </div>

          {surgeries.length === 0 ? (
            <div className="flex flex-col gap-3 items-center justify-center border-dashed border-2 border-gray-300 p-7 px-10 rounded-xl relative">
              <p className="font-semibold text-gray-600">
                No surgeries added yet
              </p>
              <p className="text-center text-gray-500 text-xs lg:text-sm">
                If you have any past surgeries, please add them here.
              </p>
            </div>
          ) : (
            <div className="overflow-auto border-1 border-gray-200 rounded-lg">
              <table
                id="pc-surgery-table"
                className="w-full text-sm md:text-[16px] text-left"
              >
                <thead className="bg-gray-50 border-b-1 border-gray-200">
                  <tr>
                    <th className="p-3 font-semibold text-gray-700">Year</th>
                    <th className="p-3 font-semibold text-gray-700">
                      Surgery name
                    </th>
                    <th className="p-3 font-semibold text-gray-700">Reason</th>
                    <th className="p-3 font-semibold text-gray-700">
                      Major/Minor
                    </th>
                    <th className="p-3 font-semibold text-gray-700">
                      Hospital
                    </th>
                    <th className="p-3 font-semibold text-gray-700">Doctor</th>
                    <th className="p-3 font-semibold text-gray-700"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {surgeries.map((surgery, index) => {
                    return (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="p-3">{surgery.year}</td>
                        <td className="p-3 font-medium text-gray-900">
                          {surgery.surgeryName}
                        </td>
                        <td className="p-3">{surgery.reason}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${surgery.surgeryType === "major" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}
                          >
                            {surgery.surgeryType}
                          </span>
                        </td>
                        <td className="p-3">{surgery.hospital}</td>
                        <td className="p-3">{surgery.doctor}</td>
                        <td className="p-3">
                          <div className="flex gap-2 items-center justify-end">
                            <button
                              className="p-1.5 hover:bg-gray-200 rounded-md transition-colors text-gray-500 hover:text-gray-700"
                              onClick={() =>
                                handleEditClick({ ...surgery, index })
                              }
                            >
                              <MdEdit size={"18px"} />
                            </button>
                            <button
                              className="p-1.5 hover:bg-red-100 rounded-md transition-colors text-gray-500 hover:text-red-500"
                              onClick={() => handleDeleteSurgery(index)}
                            >
                              <RiDeleteBinFill size={"18px"} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="h-[1px] bg-gray-200 mt-4"></div>
        <div className="flex justify-between items-center mt-2">
          <p
            className="pl-2 text-gray-400 hover:text-gray-600 hover:underline font-base cursor-pointer"
            onClick={handleBackClick}
          >
            Back
          </p>

          <button
            className="bg-lightGreen/80 hover:bg-lightGreen/90 transition-colors duration-200 active:bg-lightGreen px-14 py-2.5 text-gray-50 hover:text-white text-lg rounded-md font-medium border-1 border-lightGreen flex items-center gap-2 h-[50px]"
            onClick={handleNextClick}
            disabled={loading}
          >
            {loading && <LoadingCircle />}
            {loading ? "Saving..." : "Get Started"}
          </button>
        </div>
      </div>
    </>
  );
}

export default UProfileCreationStage4;
