import { useState, useEffect } from "react";
import LoadingCircle from "../common/LoadingCircle";
import toast from "react-hot-toast";
import getIcon from "../../helpers/getIcon";
import { useDoctorProfileCreationStore } from "../../zustand/doctoreStore";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import {
  setExperience,
  deleteExperience,
} from "../../state/doctor/dProfileCreationSlice";
import {
  saveDoctorProfileStage3,
  getDoctorProfileStage3,
} from "../../api/doctor/dProfileCreationService";
import DExperienceModal from "./DExperienceModal";

interface DProfileCreationStage3Props {
  changeStage: React.Dispatch<React.SetStateAction<number>>;
}

function DProfileCreationStage3({ changeStage }: DProfileCreationStage3Props) {
  const [loading, setLoading] = useState(false);
  const [editingExperience, setEditingExperience] = useState<any>(null);

  const toggleModal = useDoctorProfileCreationStore(
    (state) => state.toggleExperienceModal
  );
  const isModalOpen = useDoctorProfileCreationStore(
    (state) => state.experienceModal
  );

  const dispatch = useDispatch();
  const experienceList = useSelector(
    (state: RootState) => state.dProfileCreation.experience
  );
  const userInfo = useSelector((state: RootState) => state.userInfo);

  useEffect(() => {
    getDoctorProfileStage3().then((response) => {
      if (response?.success && response.data) {
        if (response.data.experience) {
          const mappedExperience = response.data.experience.map((exp: any) => ({
            ...exp,
            id: exp._id || exp.id || Date.now().toString() + Math.random(),
          }));
          dispatch(setExperience(mappedExperience));
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
    setEditingExperience(null);
    toggleModal();
  }

  function handleEditClick(exp: any) {
    setEditingExperience(exp);
    toggleModal();
  }

  function handleDeleteClick(id: string) {
    dispatch(deleteExperience(id));
  }

  async function handleNextClick() {
    setLoading(true);

    const stage3Data = {
      userId: userInfo.id,
      experience: experienceList.map(({ id, ...rest }) => rest),
    };

    try {
      const data = await saveDoctorProfileStage3(stage3Data);
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

  function formatDuration(exp: any) {
    const start = `${exp.startDate.month}/${exp.startDate.year}`;
    const end = exp.present
      ? "Present"
      : `${exp.endDate?.month}/${exp.endDate?.year}`;

    const startMonth = exp.startDate.month;
    const startYear = exp.startDate.year;

    let endMonth, endYear;
    if (exp.present) {
      const now = new Date();
      endMonth = now.getMonth() + 1;
      endYear = now.getFullYear();
    } else {
      endMonth = exp.endDate?.month;
      endYear = exp.endDate?.year;
    }

    let totalMonths = (endYear - startYear) * 12 + (endMonth - startMonth);
    if (totalMonths < 0) totalMonths = 0;

    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    let durationString = "";
    if (years > 0) {
      durationString += `${years} year${years > 1 ? "s" : ""}`;
    }
    if (months > 0) {
      if (years > 0) durationString += " ";
      durationString += `${months} month${months > 1 ? "s" : ""}`;
    }

    if (durationString === "") {
      durationString = "Less than a month";
    }

    return `${start} - ${end} • ${durationString}`;
  }

  return (
    <>
      {isModalOpen && (
        <DExperienceModal existingExperience={editingExperience} />
      )}

      <div className="bg-white rounded-lg mt-3 p-5">
        <div className="flex justify-between items-center mb-4">
          <p className="text-lg font-bold">Add Experience</p>
          <button
            className="bg-pastelBlue font-bold px-5 py-2 rounded-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            onClick={handleAddClick}
          >
            Add new
          </button>
        </div>

        {experienceList.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No experience details added yet.
          </div>
        ) : (
          experienceList.map((exp) => (
            <div key={exp.id}>
              <hr className="border-[1.5px] border-[#dddddd]" />
              <div className="flex py-2 justify-between">
                <div>
                  <p className="font-bold">{exp.hospital}</p>
                  <p className="font-medium">{exp.designation}</p>
                  <p className="font-medium text-black/50">
                    {exp.location} - {exp.type.replace("_", " ")}
                  </p>
                  <p className="font-medium text-black/50">
                    {formatDuration(exp)}
                  </p>
                  {exp.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {exp.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2.5 items-center justify-center">
                  <span
                    className="hover:scale-110 hover:bg-gray-400 active:scale-75 p-1 rounded-sm cursor-pointer transition-all duration-200"
                    onClick={() => handleEditClick(exp)}
                  >
                    {getIcon("edit", "20px", "black")}
                  </span>
                  <span
                    className="hover:scale-110 hover:bg-red-300 active:scale-75 p-1 rounded-sm cursor-pointer transition-all duration-200"
                    onClick={() => handleDeleteClick(exp.id)}
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

export default DProfileCreationStage3;
