import { useEffect, useState, useRef } from "react";
import ProfileCreationInput from "../common/ProfileCreationInput";
import LoadingCircle from "../common/LoadingCircle";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import {
  setAddress,
  setHeight,
  setPhoneNumber,
  setWeight,
} from "../../state/user/uProfileCreationSlice";
import toast from "react-hot-toast";
import { saveUserProfileStage2, getUserProfileStage2 } from "../../api/user/uProfileCreationService";

interface UProfileCreationStage2Props {
  changeStage: React.Dispatch<React.SetStateAction<number>>;
}

function UProfileCreationStage2({ changeStage }: UProfileCreationStage2Props) {
  const dispatch = useDispatch();
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const height = useSelector(
    (state: RootState) => state.uProfileCreation.height,
  );
  const weight = useSelector(
    (state: RootState) => state.uProfileCreation.weight,
  );
  const address = useSelector(
    (state: RootState) => state.uProfileCreation.address,
  );
  const phoneNumber = useSelector(
    (state: RootState) => state.uProfileCreation.phoneNumber,
  );

  const heightErrorRef = useRef<HTMLDivElement | null>(null);
  const weightErrorRef = useRef<HTMLDivElement | null>(null);
  const addressErrorRef = useRef<HTMLDivElement | null>(null);
  const phoneNumberErrorRef = useRef<HTMLDivElement | null>(null);

  const showError = (
    ref: React.RefObject<HTMLDivElement | null>,
    message: string,
  ) => {
    if (ref.current) ref.current.innerHTML = message;
  };

  const removeErrors = () => {
    [
      heightErrorRef,
      weightErrorRef,
      addressErrorRef,
      phoneNumberErrorRef,
    ].forEach((r) => r.current && (r.current.innerHTML = ""));
  };

  const [bmi, setBmi] = useState(0);
  const [loading, setLoading] = useState(false);
  function handleBackClick() {
    changeStage((prev) => {
      return prev - 1;
    });
  }
  async function handleNextClick() {
    removeErrors();
    let valid = true;

    if (!height || height <= 0) {
      valid = false;
      showError(heightErrorRef, "Enter your height.");
    } else if (height > 300) {
      valid = false;
      showError(heightErrorRef, "Enter a valid height (cm).");
    }

    if (!weight || weight <= 0) {
      valid = false;
      showError(weightErrorRef, "Enter your weight.");
    } else if (weight > 500) {
      valid = false;
      showError(weightErrorRef, "Enter a valid weight (kg).");
    }

    if (!address || address.trim() === "") {
      valid = false;
      showError(addressErrorRef, "Enter your address.");
    }

    if (!phoneNumber || phoneNumber.trim() === "") {
      valid = false;
      showError(phoneNumberErrorRef, "Enter your phone number.");
    } else if (!/^\d{10}$/.test(phoneNumber)) {
      valid = false;
      showError(phoneNumberErrorRef, "Enter a valid 10-digit phone number.");
    }

    if (!valid) {
      toast.error("Please fix the errors in the form.");
      return;
    }
    const stage2Data = {
      userId: userInfo.id,
      height,
      weight,
      address,
      phoneNumber,
    };
    // console.log(data);
    setLoading(true);
    // api service call here
    try {
      const data = await saveUserProfileStage2(stage2Data);
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
        (error as Error)?.message || "An error occured while saving profile.",
      );
    }
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getUserProfileStage2();
        const profileData = data?.data;
        if (profileData && Object.keys(profileData).length > 0) {
          if (profileData.height) dispatch(setHeight(profileData.height));
          if (profileData.weight) dispatch(setWeight(profileData.weight));
          if (profileData.address) dispatch(setAddress(profileData.address));
          if (profileData.phoneNumber) dispatch(setPhoneNumber(profileData.phoneNumber));
        }
      } catch (error) {
        toast.error(
          (error as Error).message || "An error occured while fetching data.",
        );
      }
    }
    fetchData();
  }, [dispatch]);

  useEffect(() => {
    let bmi = weight / (height / 100) ** 2;
    if (isNaN(bmi)) bmi = 0;
    setBmi(bmi);
  }, [height, weight]);
  return (
    <div className="p-6 bg-white border-1 flex flex-col gap-4 border-gray-200 rounded-2xl w-full max-w-5xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Body metrics & Contact info</h1>
        <p className="text-gray-500 text-sm lg:text-base">
          This helps us personalize your health recommendations.
        </p>
      </div>

      <div className="flex flex-col gap-2 w-full">
        <h2 className="text-lg font-semibold mt-2">Body Metrics</h2>
        <div className="flex flex-col md:flex-row md:gap-4 gap-2 w-full">
          <div className="flex flex-col gap-1.5 w-full">
            <label className="font-medium">Height (in cm)</label>
            <input
              type="number"
              placeholder="Enter your height"
              className="h-[50px] p-2 border-1 border-gray-300 rounded-md no-spinners"
              value={height || ""}
              onChange={(e) => dispatch(setHeight(Number(e.target.value)))}
            />
            <div className="text-red-500 text-sm" ref={heightErrorRef}></div>
          </div>
          <div className="flex flex-col gap-1.5 w-full">
            <label className="font-medium">Weight (in kg)</label>
            <input
              type="number"
              placeholder="Enter your weight"
              className="h-[50px] p-2 border-1 border-gray-300 rounded-md no-spinners"
              value={weight || ""}
              onChange={(e) => dispatch(setWeight(Number(e.target.value)))}
            />
            <div className="text-red-500 text-sm" ref={weightErrorRef}></div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 w-full md:w-[calc(50%-0.5rem)]">
          <label className="font-medium">BMI</label>
          <input
            type="number"
            disabled
            className="h-[50px] p-2 border-1 border-gray-300 rounded-md bg-gray-50 text-gray-500"
            value={bmi.toFixed(2)}
          />
        </div>

        <h2 className="text-lg font-semibold mt-4">Contact Information</h2>
        <div className="flex flex-col md:flex-row md:gap-4 gap-2 w-full">
          <div className="flex flex-col gap-1.5 w-full">
            <label className="font-medium">Phone number</label>
            <input
              type="number"
              placeholder="Enter your phone number"
              className="h-[50px] p-2 border-1 border-gray-300 rounded-md no-spinners"
              value={phoneNumber}
              onChange={(e) => dispatch(setPhoneNumber(e.target.value))}
            />
            <div
              className="text-red-500 text-sm"
              ref={phoneNumberErrorRef}
            ></div>
          </div>
          <div className="flex flex-col gap-1.5 w-full">
            <label className="font-medium">Address</label>
            <input
              type="text"
              placeholder="Enter your address"
              className="h-[50px] p-2 border-1 border-gray-300 rounded-md"
              value={address}
              onChange={(e) => dispatch(setAddress(e.target.value))}
            />
            <div className="text-red-500 text-sm" ref={addressErrorRef}></div>
          </div>
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

export default UProfileCreationStage2;
