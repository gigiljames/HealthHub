import React, { useState } from "react";
import { MdEdit } from "react-icons/md";
import { RiDeleteBinFill } from "react-icons/ri";
import LoadingCircle from "../common/LoadingCircle";
import { useNavigate } from "react-router";
import { useUserProfileCreationStore } from "../../zustand/userStore";

interface UProfileCreationStage4Props {
  changeStage: React.Dispatch<React.SetStateAction<number>>;
}

interface Surgery {
  year: string;
  name: string;
  reason: string;
  severity: string;
  hospital: string;
  doctor: string;
}

function UProfileCreationStage4({ changeStage }: UProfileCreationStage4Props) {
  const [surgeries, setSurgeries] = useState<Surgery[]>([
    {
      year: "2020",
      name: "Appendectomy",
      reason: "Acute appendicitis",
      severity: "Minor",
      hospital: "Fortis Hospital, Bangalore",
      doctor: "Dr. Meena Kulkarni",
    },
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  const toggle = useUserProfileCreationStore(
    (state) => state.toggleSurgeryModal
  );
  const navigate = useNavigate();
  function handleBackClick() {
    changeStage((prev) => {
      return prev - 1;
    });
  }
  function handleNextClick() {
    setLoading(true);
    //submission code here
    setLoading(false);
    navigate("/home");
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
              <th>Year</th>
              <th>Surgery name</th>
              <th>Reason</th>
              <th>Major/Minor</th>
              <th>Hospital</th>
              <th>Doctor</th>
              <th></th>
            </thead>
            <tbody>
              {surgeries.map((surgery, index) => {
                return (
                  <tr key={index}>
                    <td>{surgery.year}</td>
                    <td>{surgery.name}</td>
                    <td>{surgery.reason}</td>
                    <td>{surgery.severity}</td>
                    <td>{surgery.hospital}</td>
                    <td>{surgery.doctor}</td>
                    <td>
                      <div className="flex gap-2.5 items-center justify-center">
                        <span className="hover:scale-110 hover:bg-gray-400 active:scale-75 p-1 rounded-sm cursor-pointer transition-all duration-200">
                          <MdEdit size={"20px"} />
                        </span>
                        <span className="hover:scale-110 hover:bg-red-300 active:scale-75 p-1 rounded-sm cursor-pointer transition-all duration-200">
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
