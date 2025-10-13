import React, { useState } from "react";
import { MdEdit } from "react-icons/md";
import { RiDeleteBinFill } from "react-icons/ri";
import LoadingCircle from "../common/LoadingCircle";
import { useNavigate } from "react-router";
import { useUserProfileCreationStore } from "../../zustand/userStore";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import {
  removeSurgery,
  type Surgery,
} from "../../state/user/uProfileCreationSlice";
import toast from "react-hot-toast";
import { saveUserProfileStage4 } from "../../api/user/uProfileCreationService";
import { setIsNewUser } from "../../state/auth/userInfoSlice";

interface UProfileCreationStage4Props {
  changeStage: React.Dispatch<React.SetStateAction<number>>;
}

function UProfileCreationStage4({ changeStage }: UProfileCreationStage4Props) {
  // const [surgeries, setSurgeries] = useState<Surgery[]>([
  //   {
  //     year: "2020",
  //     name: "Appendectomy",
  //     reason: "Acute appendicitis",
  //     severity: "Minor",
  //     hospital: "Fortis Hospital, Bangalore",
  //     doctor: "Dr. Meena Kulkarni",
  //   },
  // ]);
  const surgeries = useSelector(
    (state: RootState) => state.uProfileCreation.pastSurgeries
  );
  const toggleEditModal = useUserProfileCreationStore(
    (state) => state.toggleEditSurgeryModal
  );
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const setEditData = useUserProfileCreationStore((state) => state.setEditData);
  const [loading, setLoading] = useState<boolean>(false);
  const toggle = useUserProfileCreationStore(
    (state) => state.toggleSurgeryModal
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
    // console.log(surgeries);
    setLoading(true);
    // api service call here
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
      navigate("/home");
    } catch (error) {
      toast.error(
        (error as Error)?.message || "An error occured while saving profile."
      );
    }
  }
  function handleEditClick(data: Surgery & { index: number }) {
    setEditData(data);
    toggleEditModal();
  }
  return (
    <>
      <div className="bg-white rounded-lg mt-3 p-5 mb-2 h-full overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm lg:text-lg font-bold pl-3.5">
            Add Past Surgeries
          </p>
          <button
            className="bg-pastelBlue font-bold px-3 lg:px-5 py-2 rounded-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer text-sm md:text-[16px]"
            onClick={() => toggle()}
          >
            Add new
          </button>
        </div>
        <div className="overflow-auto">
          <table
            id="pc-surgery-table"
            className="w-full h-full text-sm md:text-[16px]"
          >
            <thead>
              <tr>
                <th>Year</th>
                <th>Surgery name</th>
                <th>Reason</th>
                <th>Major/Minor</th>
                <th>Hospital</th>
                <th>Doctor</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {surgeries.map((surgery, index) => {
                return (
                  <tr key={index}>
                    <td>{surgery.year}</td>
                    <td>{surgery.surgeryName}</td>
                    <td>{surgery.reason}</td>
                    <td>{surgery.surgeryType}</td>
                    <td>{surgery.hospital}</td>
                    <td>{surgery.doctor}</td>
                    <td>
                      <div className="flex gap-2.5 items-center justify-center">
                        <span
                          className="hover:scale-110 hover:bg-gray-400 active:scale-75 p-1 rounded-sm cursor-pointer transition-all duration-200"
                          onClick={() => handleEditClick({ ...surgery, index })}
                        >
                          <MdEdit size={"20px"} />
                        </span>
                        <span
                          className="hover:scale-110 hover:bg-red-300 active:scale-75 p-1 rounded-sm cursor-pointer transition-all duration-200"
                          onClick={() => dispatch(removeSurgery(index))}
                        >
                          <RiDeleteBinFill size={"20px"} />
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
              Saving...
            </>
          ) : (
            "Get Started"
          )}
        </button>
      </div>
    </>
  );
}

export default UProfileCreationStage4;
