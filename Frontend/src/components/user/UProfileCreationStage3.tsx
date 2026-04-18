import React, { useState, useRef } from "react";
import LoadingCircle from "../common/LoadingCircle";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import {
  setBronchialAsthma,
  setEpilepsy,
  setTb,
} from "../../state/user/uProfileCreationSlice";
import { saveUserProfileStage3, getUserProfileStage3 } from "../../api/user/uProfileCreationService";
import toast from "react-hot-toast";
import { useEffect } from "react";

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

  const tbErrorRef = useRef<HTMLDivElement | null>(null);
  const asthmaErrorRef = useRef<HTMLDivElement | null>(null);
  const epilepsyErrorRef = useRef<HTMLDivElement | null>(null);

  const showError = (
    ref: React.RefObject<HTMLDivElement | null>,
    message: string
  ) => {
    if (ref.current) ref.current.innerHTML = message;
  };

  const removeErrors = () => {
    [tbErrorRef, asthmaErrorRef, epilepsyErrorRef].forEach(
      (r) => r.current && (r.current.innerHTML = "")
    );
  };

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
    removeErrors();
    let valid = true;

    if (tb !== true && tb !== false) {
      valid = false;
      showError(tbErrorRef, "Please select an option.");
    }

    if (bronchialAsthma !== true && bronchialAsthma !== false) {
      valid = false;
      showError(asthmaErrorRef, "Please select an option.");
    }

    if (epilepsy !== true && epilepsy !== false) {
      valid = false;
      showError(epilepsyErrorRef, "Please select an option.");
    }

    if (!valid) {
      toast.error("Please answer all questions.");
      return;
    }

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

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getUserProfileStage3();
        const profileData = data?.data;
        if (profileData && Object.keys(profileData).length > 0) {
          if (profileData.tb !== undefined) dispatch(setTb(profileData.tb));
          if (profileData.bronchialAsthma !== undefined) dispatch(setBronchialAsthma(profileData.bronchialAsthma));
          if (profileData.epilepsy !== undefined) dispatch(setEpilepsy(profileData.epilepsy));
        }
      } catch (error) {
        toast.error((error as Error).message || "An error occured while fetching data.");
      }
    }
    fetchData();
  }, [dispatch]);

  return (
    <div className="p-6 bg-white border-1 flex flex-col gap-6 border-gray-200 rounded-2xl w-full max-w-5xl">
      <div className="flex flex-col gap-2 mb-2">
        <h1 className="text-2xl font-bold">Previous Illnesses</h1>
        <p className="text-gray-500 text-sm lg:text-base">
          This history allows your health professionals to be fully informed.
        </p>
      </div>

      <div className="flex flex-col gap-6 w-full">
        <div className="flex flex-col gap-3">
          <p className="font-medium text-sm md:text-base">
            Have you ever been diagnosed with <span className="font-bold">Tuberculosis</span>?
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <label
              className={`flex-1 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                tb === true
                  ? "ring-[2.5px] ring-lightGreen bg-lightGreen/5"
                  : "ring-1 ring-gray-200 bg-white hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${tb === true ? 'border-lightGreen' : 'border-gray-300'}`}>
                  {tb === true && <div className="w-2.5 h-2.5 bg-lightGreen rounded-full"></div>}
                </div>
                <span className={`font-semibold ${tb === true ? 'text-darkGreen' : 'text-gray-700'}`}>Yes</span>
              </div>
              <input
                type="radio"
                name="tb"
                value="true"
                className="hidden"
                checked={tb === true}
                onChange={handleTbInput}
              />
            </label>

            <label
              className={`flex-1 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                tb === false
                  ? "ring-[2.5px] ring-lightGreen bg-lightGreen/5"
                  : "ring-1 ring-gray-200 bg-white hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${tb === false ? 'border-lightGreen' : 'border-gray-300'}`}>
                  {tb === false && <div className="w-2.5 h-2.5 bg-lightGreen rounded-full"></div>}
                </div>
                <span className={`font-semibold ${tb === false ? 'text-darkGreen' : 'text-gray-700'}`}>No</span>
              </div>
              <input
                type="radio"
                name="tb"
                value="false"
                className="hidden"
                checked={tb === false}
                onChange={handleTbInput}
              />
            </label>
          </div>
          <div className="text-red-500 text-sm" ref={tbErrorRef}></div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="font-medium text-sm md:text-base">
            Do you have a history of <span className="font-bold">Bronchial Asthma</span>?
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <label
              className={`flex-1 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                bronchialAsthma === true
                  ? "ring-[2.5px] ring-lightGreen bg-lightGreen/5"
                  : "ring-1 ring-gray-200 bg-white hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${bronchialAsthma === true ? 'border-lightGreen' : 'border-gray-300'}`}>
                  {bronchialAsthma === true && <div className="w-2.5 h-2.5 bg-lightGreen rounded-full"></div>}
                </div>
                <span className={`font-semibold ${bronchialAsthma === true ? 'text-darkGreen' : 'text-gray-700'}`}>Yes</span>
              </div>
              <input
                type="radio"
                name="asthma"
                value="true"
                className="hidden"
                checked={bronchialAsthma === true}
                onChange={handleBronchialAsthmaInput}
              />
            </label>

            <label
              className={`flex-1 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                bronchialAsthma === false
                  ? "ring-[2.5px] ring-lightGreen bg-lightGreen/5"
                  : "ring-1 ring-gray-200 bg-white hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${bronchialAsthma === false ? 'border-lightGreen' : 'border-gray-300'}`}>
                  {bronchialAsthma === false && <div className="w-2.5 h-2.5 bg-lightGreen rounded-full"></div>}
                </div>
                <span className={`font-semibold ${bronchialAsthma === false ? 'text-darkGreen' : 'text-gray-700'}`}>No</span>
              </div>
              <input
                type="radio"
                name="asthma"
                value="false"
                className="hidden"
                checked={bronchialAsthma === false}
                onChange={handleBronchialAsthmaInput}
              />
            </label>
          </div>
          <div className="text-red-500 text-sm" ref={asthmaErrorRef}></div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="font-medium text-sm md:text-base">
            Have you ever experienced seizures or been diagnosed with <span className="font-bold">Epilepsy</span>?
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <label
              className={`flex-1 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                epilepsy === true
                  ? "ring-[2.5px] ring-lightGreen bg-lightGreen/5"
                  : "ring-1 ring-gray-200 bg-white hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${epilepsy === true ? 'border-lightGreen' : 'border-gray-300'}`}>
                  {epilepsy === true && <div className="w-2.5 h-2.5 bg-lightGreen rounded-full"></div>}
                </div>
                <span className={`font-semibold ${epilepsy === true ? 'text-darkGreen' : 'text-gray-700'}`}>Yes</span>
              </div>
              <input
                type="radio"
                name="epilepsy"
                value="true"
                className="hidden"
                checked={epilepsy === true}
                onChange={handleEpilepsyInput}
              />
            </label>

            <label
              className={`flex-1 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                epilepsy === false
                  ? "ring-[2.5px] ring-lightGreen bg-lightGreen/5"
                  : "ring-1 ring-gray-200 bg-white hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${epilepsy === false ? 'border-lightGreen' : 'border-gray-300'}`}>
                  {epilepsy === false && <div className="w-2.5 h-2.5 bg-lightGreen rounded-full"></div>}
                </div>
                <span className={`font-semibold ${epilepsy === false ? 'text-darkGreen' : 'text-gray-700'}`}>No</span>
              </div>
              <input
                type="radio"
                name="epilepsy"
                value="false"
                className="hidden"
                checked={epilepsy === false}
                onChange={handleEpilepsyInput}
              />
            </label>
          </div>
          <div className="text-red-500 text-sm" ref={epilepsyErrorRef}></div>
        </div>
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
          {loading ? "Saving..." : "Save & Continue"}
        </button>
      </div>
    </div>
  );
}

export default UProfileCreationStage3;
