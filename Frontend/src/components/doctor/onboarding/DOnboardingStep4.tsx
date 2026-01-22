import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../state/store";
import getIcon from "../../../helpers/getIcon";
import { useDoctorProfileCreationStore } from "../../../zustand/doctoreStore";
import { useState } from "react";
import DEducationModal from "../DEducationModal";
import DExperienceModal from "../DExperienceModal";
import ConfirmationModal from "../../common/ConfirmationModal";
import {
  deleteEducation,
  deleteExperience,
} from "../../../state/doctor/dProfileCreationSlice";
import toast from "react-hot-toast";
import { saveDoctorOnboardingStage4 } from "../../../api/doctor/dProfileCreationService";
import LoadingCircle from "../../common/LoadingCircle";

interface DOnboardingStep4Props {
  setStep: (step: number) => void;
}

function DOnboardingStep4({ setStep }: DOnboardingStep4Props) {
  const dispatch = useDispatch();
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const education = useSelector(
    (state: RootState) => state.dProfileCreation.education,
  );
  const experience = useSelector(
    (state: RootState) => state.dProfileCreation.experience,
  );
  const [editingEducation, setEditingEducation] = useState<any>(null);
  const [deleteEducationConfirmOpen, setDeleteEducationConfirmOpen] =
    useState(false);
  const [deleteExperienceConfirmOpen, setDeleteExperienceConfirmOpen] =
    useState(false);
  const [educationToDelete, setEducationToDelete] = useState<string | null>(
    null,
  );
  const [experienceToDelete, setExperienceToDelete] = useState<string | null>(
    null,
  );
  const [saveLoading, setSaveLoading] = useState(false);
  const toggleEducationModal = useDoctorProfileCreationStore(
    (state) => state.toggleEducationModal,
  );
  const isEducationModalOpen = useDoctorProfileCreationStore(
    (state) => state.educationModal,
  );
  const [editingExperience, setEditingExperience] = useState<any>(null);

  const toggleExperienceModal = useDoctorProfileCreationStore(
    (state) => state.toggleExperienceModal,
  );
  const isExperienceModalOpen = useDoctorProfileCreationStore(
    (state) => state.experienceModal,
  );

  const renderDate = (dateObj: { year: number; month: number } | undefined) => {
    if (!dateObj) return "";
    const date = new Date(dateObj.year, dateObj.month - 1);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  const handleEducationDelete = (id: string) => {
    setEducationToDelete(id);
    setDeleteEducationConfirmOpen(true);
  };

  const confirmEducationDelete = () => {
    if (educationToDelete) {
      dispatch(deleteEducation(educationToDelete));
      setEducationToDelete(null);
    }
    setDeleteEducationConfirmOpen(false);
  };

  const handleExperienceDelete = (id: string) => {
    setExperienceToDelete(id);
    setDeleteExperienceConfirmOpen(true);
  };

  const confirmExperienceDelete = () => {
    if (experienceToDelete) {
      dispatch(deleteExperience(experienceToDelete));
      setExperienceToDelete(null);
    }
    setDeleteExperienceConfirmOpen(false);
  };

  const handleSaveChanges = async () => {
    setSaveLoading(true);
    const payload = {
      userId: userInfo.id,
      education: education,
      experience: experience,
    };

    try {
      const data = await saveDoctorOnboardingStage4(payload);
      if (data?.success) {
        toast.success("Education details saved successfully.");
        setStep(5);
      } else {
        throw new Error("Failed to save changes.");
      }
    } catch (error) {
      toast.error(
        (error as Error)?.message || "An error occurred while saving.",
      );
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <>
      <ConfirmationModal
        isOpen={deleteExperienceConfirmOpen}
        onClose={() => setDeleteExperienceConfirmOpen(false)}
        onConfirm={confirmExperienceDelete}
        title="Delete Experience"
        message="Are you sure you want to delete this experience entry? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />
      <ConfirmationModal
        isOpen={deleteEducationConfirmOpen}
        onClose={() => setDeleteEducationConfirmOpen(false)}
        onConfirm={confirmEducationDelete}
        title="Delete Education"
        message="Are you sure you want to delete this education entry? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />
      {isEducationModalOpen && (
        <DEducationModal existingEducation={editingEducation} />
      )}
      {isExperienceModalOpen && (
        <DExperienceModal existingExperience={editingExperience} />
      )}
      <div className="flex flex-col gap-4 max-w-3xl">
        <div className=" flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Your professional background</h1>
          <p className="text-gray-500">
            Please add your medical degrees and past work history to complete
            your profile for patients to see.
          </p>
        </div>
        <div className="flex flex-col gap-3 mb-2">
          <h2 className="text-xl font-semibold">Education</h2>
          {education.length === 0 ? (
            <div className="flex flex-col gap-3 items-center justify-center border-dashed border-2 border-gray-300 p-7 px-10 rounded-xl">
              <div className="bg-gray-200 p-3 rounded-full text-gray-500">
                {getIcon("university", "40px")}
              </div>
              <div className="flex flex-col items-center">
                <p className="font-semibold">No education added yet</p>
                <p className="text-center text-gray-500 text-xs lg:text-sm">
                  Add your medical degrees and institutions.
                </p>
              </div>
              <button
                className="flex gap-2 items-center justify-center bg-white hover:bg-gray-50 transition-colors duration-200 active:bg-gray-100 border-1 border-gray-300 px-4 py-2 rounded-md max-w-[300px] font-medium"
                onClick={() => {
                  setEditingEducation(null);
                  toggleEducationModal();
                }}
              >
                + Add education
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {education.map((edu) => {
                return (
                  <div
                    key={edu.id}
                    className="bg-white rounded-xl p-4 border-1 border-gray-300 relative flex gap-4 items-start"
                  >
                    <div
                      className="p-3 bg-lightGreen/20
                    text-darkGreen/80 rounded-full"
                    >
                      {getIcon("graduation-cap", "24px")}
                    </div>
                    <div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">
                          {edu.title}
                        </h3>
                        <p className="font-medium text-gray-600">
                          {edu.institution}
                        </p>
                        <p className="text-sm text-gray-500">
                          Graduation Year: {edu.graduationYear}
                        </p>
                        {edu.description && (
                          <p className="text-sm text-gray-500 mt-1 max-w-xl">
                            {edu.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 absolute top-2 right-2 text-gray-400">
                      <button
                        className="p-2 hover:bg-gray-100 transition-colors duration-200 rounded-md hover:text-gray-600"
                        onClick={() => {
                          setEditingEducation(edu);
                          toggleEducationModal();
                        }}
                      >
                        {getIcon("edit", "18px")}
                      </button>
                      <button
                        className="p-2 hover:bg-red-100 transition-colors duration-200 rounded-md hover:text-red-400"
                        onClick={() => {
                          handleEducationDelete(edu.id);
                        }}
                      >
                        {getIcon("trash", "18px")}
                      </button>
                    </div>
                  </div>
                );
              })}
              <div
                className="flex gap-3 items-center justify-center border-dashed border-2 border-gray-300 p-4 rounded-xl font-medium cursor-pointer text-gray-500 hover:text-gray-600 hover:bg-gray-50 transition-colors duration-200 active:bg-white"
                onClick={() => {
                  setEditingEducation(null);
                  toggleEducationModal();
                }}
              >
                {getIcon("add", "24px")}
                Add Education
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">Experience</h2>
          {experience.length === 0 ? (
            <div className="flex flex-col gap-3 items-center justify-center border-dashed border-2 border-gray-300 p-7 px-10 rounded-xl">
              <div className="bg-gray-200 p-3 rounded-full text-gray-500">
                {getIcon("doctor-management", "40px")}
              </div>
              <div className="flex flex-col items-center">
                <p className="font-semibold">No experience added yet</p>
                <p className="text-center text-gray-500 text-xs lg:text-sm">
                  Add your past work history.
                </p>
              </div>
              <button
                className="flex gap-2 items-center justify-center bg-white hover:bg-gray-50 transition-colors duration-200 active:bg-gray-100 border-1 border-gray-300 px-4 py-2 rounded-md max-w-[300px] font-medium"
                onClick={() => {
                  setEditingExperience(null);
                  toggleExperienceModal();
                }}
              >
                + Add experience
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {experience.map((exp) => {
                return (
                  <div
                    key={exp.id}
                    className="bg-white rounded-xl p-4 border-1 border-gray-300 relative flex gap-4 items-start"
                  >
                    <div
                      className="p-3 bg-lightGreen/20
                    text-darkGreen/80 rounded-full"
                    >
                      {getIcon("doctor-management", "24px")}
                    </div>
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">
                            {exp.designation}
                          </h3>
                          <p className="font-medium text-gray-700">
                            {exp.hospital}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                            <span>
                              {renderDate(exp.startDate)} -{" "}
                              {exp.present
                                ? "Present"
                                : renderDate(exp.endDate)}
                            </span>
                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            <span>{exp.location}</span>
                          </p>
                          <span className="inline-block mt-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full capitalize">
                            {exp.type.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                      {exp.description && (
                        <p className="text-gray-600 mt-3 text-sm border-t border-gray-100 pt-3">
                          {exp.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 absolute top-2 right-2 text-gray-400">
                      <button
                        className="p-2 hover:bg-gray-100 transition-colors duration-200 rounded-md hover:text-gray-600"
                        onClick={() => {
                          setEditingExperience(exp);
                          toggleExperienceModal();
                        }}
                      >
                        {getIcon("edit", "18px")}
                      </button>
                      <button
                        className="p-2 hover:bg-red-100 transition-colors duration-200 rounded-md hover:text-red-400"
                        onClick={() => {
                          handleExperienceDelete(exp.id);
                        }}
                      >
                        {getIcon("trash", "18px")}
                      </button>
                    </div>
                  </div>
                );
              })}
              <div
                className="flex gap-3 items-center justify-center border-dashed border-2 border-gray-300 p-4 rounded-xl font-medium cursor-pointer text-gray-500 hover:text-gray-600 hover:bg-gray-50 transition-colors duration-200 active:bg-white"
                onClick={() => {
                  setEditingExperience(null);
                  toggleExperienceModal();
                }}
              >
                {getIcon("add", "24px")}
                Add experience
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center mt-2">
          <p
            className="pl-2 text-gray-400 hover:text-gray-600 hover:underline font-base cursor-pointer"
            onClick={() => setStep(3)}
          >
            Back
          </p>
          <button
            className="bg-lightGreen/80 hover:bg-lightGreen/90 transition-colors duration-200 active:bg-lightGreen px-20 py-2.5 text-gray-50 hover:text-white text-lg rounded-md font-medium border-1 border-lightGreen"
            onClick={() => handleSaveChanges()}
            disabled={saveLoading}
          >
            {saveLoading && <LoadingCircle />}
            {saveLoading ? "Saving..." : "Save and Continue"}
          </button>
        </div>
      </div>
    </>
  );
}

export default DOnboardingStep4;
