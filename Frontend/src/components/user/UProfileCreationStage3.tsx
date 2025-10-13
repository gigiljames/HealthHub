import React, { useState } from "react";
import LoadingCircle from "../common/LoadingCircle";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import {
  setBronchialAsthma,
  setEpilepsy,
  setTb,
} from "../../state/user/uProfileCreationSlice";
import { saveUserProfileStage3 } from "../../api/user/uProfileCreationService";
import toast from "react-hot-toast";

interface UProfileCreationStage3Props {
  changeStage: React.Dispatch<React.SetStateAction<number>>;
}

function UProfileCreationStage3({ changeStage }: UProfileCreationStage3Props) {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const tb = useSelector((state: RootState) => state.uProfileCreation.tb);
  const bronchialAsthma = useSelector(
    (state: RootState) => state.uProfileCreation.bronchialAsthma
  );
  const epilepsy = useSelector(
    (state: RootState) => state.uProfileCreation.epilepsy
  );

  function handleTbInput(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target.value;
    const value = input === "true" ? true : false;
    dispatch(setTb(value));
  }
  function handleBronchialAsthmaInput(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target.value;
    const value = input === "true" ? true : false;
    dispatch(setBronchialAsthma(value));
  }
  function handleEpilepsyInput(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target.value;
    const value = input === "true" ? true : false;
    dispatch(setEpilepsy(value));
  }
  function handleBackClick() {
    changeStage((prev) => {
      return prev - 1;
    });
  }
  async function handleNextClick() {
    const stage3Data = {
      userId: userInfo.id,
      tb,
      bronchialAsthma,
      epilepsy,
    };
    // console.log(data);

    setLoading(true);
    // api service call here
    try {
      const data = await saveUserProfileStage3(stage3Data);
      setLoading(false);
      if (data.success) {
        toast.success(data?.message || "Saved successfully.");
      } else {
        throw new Error("An error occured while saving profile.");
      }
      changeStage((prev) => {
        return prev + 1;
      });
    } catch (error) {
      toast.error(
        (error as Error)?.message || "An error occured while saving profile."
      );
    }
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
                value="true"
                id="tb-yes"
                className="hidden"
                checked={tb === true}
                onChange={(e) => handleTbInput(e)}
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
                value="false"
                id="tb-no"
                checked={tb === false}
                className="hidden"
                onChange={(e) => handleTbInput(e)}
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
                value="true"
                id="asthma-yes"
                className="hidden"
                onChange={(e) => handleBronchialAsthmaInput(e)}
                checked={bronchialAsthma === true}
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
                value="false"
                id="asthma-no"
                className="hidden"
                onChange={(e) => handleBronchialAsthmaInput(e)}
                checked={bronchialAsthma === false}
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
                value="true"
                id="epilepsy-yes"
                className="hidden"
                checked={epilepsy === true}
                onChange={(e) => handleEpilepsyInput(e)}
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
                value="false"
                id="epilepsy-no"
                className="hidden"
                checked={epilepsy === false}
                onChange={(e) => handleEpilepsyInput(e)}
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
