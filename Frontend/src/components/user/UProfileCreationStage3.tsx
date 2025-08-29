import React, { useState } from "react";
import LoadingCircle from "../common/LoadingCircle";

interface UProfileCreationStage3Props {
  changeStage: React.Dispatch<React.SetStateAction<number>>;
}

function UProfileCreationStage3({ changeStage }: UProfileCreationStage3Props) {
  const [loading, setLoading] = useState(false);
  function handleBackClick() {
    changeStage((prev) => {
      return prev - 1;
    });
  }
  function handleNextClick() {
    changeStage((prev) => {
      return prev + 1;
    });
    setLoading(true);
    //submission code here
    setLoading(false);
  }
  return (
    <>
      <div className="mt-10 flex flex-col gap-7 overflow-auto h-full pl-3 lg:pl-5 pb-5">
        <div className="flex flex-col gap-2 ">
          <p className="font-medium text-sm md:text-[16px]">
            Have you ever been diagnosed with{" "}
            <span className="font-bold">Tuberculosis</span>?
          </p>
          <div className="flex gap-3">
            <label
              htmlFor=""
              className="user-profile-radio"
              onClick={() => document.getElementById("tb-yes")?.click()}
            >
              Yes
              <input
                type="radio"
                name="tb"
                value="yes"
                id="tb-yes"
                className="hidden"
              />
            </label>

            <label
              htmlFor=""
              className="user-profile-radio"
              onClick={() => document.getElementById("tb-no")?.click()}
            >
              No
              <input
                type="radio"
                name="tb"
                value="no"
                id="tb-no"
                className="hidden"
              />
            </label>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="font-medium text-sm md:text-[16px]">
            Do you have a history of{" "}
            <span className="font-bold">Bronchial Asthma</span>?
          </p>
          <div className="flex gap-3">
            <label
              htmlFor=""
              className="user-profile-radio"
              onClick={() => document.getElementById("asthma-yes")?.click()}
            >
              Yes
              <input
                type="radio"
                name="asthma"
                value="yes"
                id="asthma-yes"
                className="hidden"
              />
            </label>

            <label
              htmlFor=""
              className="user-profile-radio"
              onClick={() => document.getElementById("asthma-no")?.click()}
            >
              No
              <input
                type="radio"
                name="asthma"
                value="no"
                id="asthma-no"
                className="hidden"
              />
            </label>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="font-medium text-sm md:text-[16px]">
            Have you ever experienced seizures or been diagnosed with{" "}
            <span className="font-bold">Epilepsy</span>?
          </p>
          <div className="flex gap-3">
            <label
              htmlFor=""
              className="user-profile-radio"
              onClick={() => document.getElementById("epilepsy-yes")?.click()}
            >
              Yes
              <input
                type="radio"
                name="epilepsy"
                value="yes"
                id="epilepsy-yes"
                className="hidden"
              />
            </label>

            <label
              htmlFor=""
              className="user-profile-radio"
              onClick={() => document.getElementById("epilepsy-no")?.click()}
            >
              No
              <input
                type="radio"
                name="epilepsy"
                value="no"
                id="epilepsy-no"
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
      <div className="flex gap-2 lg:gap-4 justify-end">
        <button
          className={`flex justify-center items-center font-medium px-7 lg:px-10 lg:py-2.5 mt-2 text-white rounded-xl bg-inputBorder hover:-translate-y-0.5 transition-all duration-200 cursor-pointer  h-[50px]`}
          onClick={handleBackClick}
        >
          Back
        </button>
        <button
          className={`flex justify-center items-center font-medium px-7 lg:px-10 lg:py-2.5 mt-2 text-white rounded-xl bg-darkGreen hover:-translate-y-0.5 transition-all duration-200 cursor-pointer  h-[50px]`}
          onClick={handleNextClick}
        >
          {loading ? (
            <>
              <LoadingCircle />
              Saving...
            </>
          ) : (
            "Next"
          )}
        </button>
      </div>
    </>
  );
}

export default UProfileCreationStage3;
