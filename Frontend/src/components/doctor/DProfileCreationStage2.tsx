import { useState, useEffect } from "react";
import LoadingCircle from "../common/LoadingCircle";
import toast from "react-hot-toast";
import getIcon from "../../helpers/getIcon";
import { useDoctorProfileCreationStore } from "../../zustand/doctoreStore";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import {
  setEducation,
  deleteEducation,
} from "../../state/doctor/dProfileCreationSlice";
import {
  saveDoctorProfileStage2,
  getDoctorProfileStage2,
} from "../../api/doctor/dProfileCreationService";
import DEducationModal from "./DEducationModal";

interface DProfileCreationStage1Props {
  changeStage: React.Dispatch<React.SetStateAction<number>>;
}

function DProfileCreationStage2({ changeStage }: DProfileCreationStage1Props) {
  const [loading, setLoading] = useState(false);
  const [editingEducation, setEditingEducation] = useState<any>(null);

  const toggleModal = useDoctorProfileCreationStore(
    (state) => state.toggleEducationModal
  );
  const isModalOpen = useDoctorProfileCreationStore(
    (state) => state.educationModal
  );

  const dispatch = useDispatch();
  const educationList = useSelector(
    (state: RootState) => state.dProfileCreation.education
  );
  const userInfo = useSelector((state: RootState) => state.userInfo);

  useEffect(() => {
    getDoctorProfileStage2().then((response) => {
      if (response?.success && response.data) {
        if (response.data.education) {
          // Map backend schema to frontend schema if needed, or assume they match
          // Backend: title, institution, graduationYear, description
          // Frontend: same + id
          const mappedEducation = response.data.education.map((edu: any) => ({
            ...edu,
            id: edu._id || edu.id || Date.now().toString() + Math.random(),
          }));
          dispatch(setEducation(mappedEducation));
        }
      }
    });
  }, [dispatch]);

  function handleBackClick() {
    changeStage((prev) => {
      return prev - 1;
    });
  }

  function handleAddClick() {
    setEditingEducation(null);
    toggleModal();
  }

  function handleEditClick(edu: any) {
    setEditingEducation(edu);
    toggleModal();
  }

  function handleDeleteClick(id: string) {
    dispatch(deleteEducation(id));
  }

  async function handleNextClick() {
    setLoading(true);

    const stage2Data = {
      userId: userInfo.id,
      education: educationList,
    };

    try {
      const data = await saveDoctorProfileStage2(stage2Data);
      setLoading(false);
      if (data?.success) {
        toast.success(data?.message || "Saved successfully.");
        changeStage((prev) => prev + 1);
      } else {
        throw new Error("An error occurred while saving profile.");
      }
    } catch (error) {
      setLoading(false);
      toast.error(
        (error as Error)?.message || "An error occurred while saving profile."
      );
    }
  }

  return (
    <>
      {isModalOpen && <DEducationModal existingEducation={editingEducation} />}

      <div className="bg-white rounded-lg mt-3 p-5">
        <div className="flex justify-between items-center mb-4">
          <p className="text-lg font-bold">Add Education</p>
          <button
            className="bg-pastelBlue font-bold px-5 py-2 rounded-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            onClick={handleAddClick}
          >
            Add new
          </button>
        </div>

        {educationList.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No education details added yet.
          </div>
        ) : (
          educationList.map((edu) => (
            <div key={edu.id}>
              <hr className="border-[1.5px] border-[#dddddd]" />
              <div className="flex py-2 justify-between">
                <div>
                  <p className="font-bold">{edu.title}</p>
                  <p className="font-medium">{edu.institution}</p>
                  <p className="font-medium text-inputBorder">
                    Graduation Year - {edu.graduationYear}
                  </p>
                  {edu.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {edu.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2.5 items-center justify-center">
                  <span
                    className="hover:scale-110 hover:bg-gray-400 active:scale-75 p-1 rounded-sm cursor-pointer transition-all duration-200"
                    onClick={() => handleEditClick(edu)}
                  >
                    {getIcon("edit", "20px", "black")}
                  </span>
                  <span
                    className="hover:scale-110 hover:bg-red-300 active:scale-75 p-1 rounded-sm cursor-pointer transition-all duration-200"
                    onClick={() => handleDeleteClick(edu.id)}
                  >
                    {getIcon("trash", "20px", "black")}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}

        <hr className="border-[1.5px] border-[#dddddd]" />
      </div>
      <div className="flex gap-2 lg:gap-4 justify-end">
        <button
          className={`flex justify-center items-center font-medium px-7 lg:px-10 py-2.5 mt-2 text-white rounded-xl bg-inputBorder hover:-translate-y-0.5 transition-all duration-200 cursor-pointer  h-[50px]`}
          onClick={handleBackClick}
        >
          Back
        </button>
        <button
          className={`flex justify-center items-center font-medium px-7 lg:px-10 py-2.5 mt-2 text-white rounded-xl bg-darkGreen hover:-translate-y-0.5 transition-all duration-200 cursor-pointer  h-[50px]`}
          onClick={handleNextClick}
        >
          {loading ? (
            <>
              <LoadingCircle />
              Loading...
            </>
          ) : (
            "Next"
          )}
        </button>
      </div>
    </>
  );
}

export default DProfileCreationStage2;
