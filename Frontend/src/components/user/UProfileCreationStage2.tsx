import { useEffect, useState } from "react";
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
import { saveUserProfileStage2 } from "../../api/user/uProfileCreationService";

interface UProfileCreationStage2Props {
  changeStage: React.Dispatch<React.SetStateAction<number>>;
}

function UProfileCreationStage2({ changeStage }: UProfileCreationStage2Props) {
  const dispatch = useDispatch();
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const height = useSelector(
    (state: RootState) => state.uProfileCreation.height
  );
  const weight = useSelector(
    (state: RootState) => state.uProfileCreation.weight
  );
  const address = useSelector(
    (state: RootState) => state.uProfileCreation.address
  );
  const phoneNumber = useSelector(
    (state: RootState) => state.uProfileCreation.phoneNumber
  );
  const [bmi, setBmi] = useState(0);
  const [loading, setLoading] = useState(false);
  function handleBackClick() {
    changeStage((prev) => {
      return prev - 1;
    });
  }
  async function handleNextClick() {
    // validation here
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
        (error as Error)?.message || "An error occured while saving profile."
      );
    }
  }
  useEffect(() => {
    let bmi = weight / (height / 100) ** 2;
    if (isNaN(bmi)) bmi = 0;
    setBmi(bmi);
  }, [height, weight]);
  return (
    <>
      <div className="mt-4 overflow-auto h-full">
        <div className="flex flex-col">
          <p className="font-semibold text-sm pl-2">Body metrics</p>
          <div className="grid grid-flow-row grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 pt-2 pb-3">
            <ProfileCreationInput
              title="Height (in cm)"
              placeholder="Enter your height"
              type="number"
              value={height}
              changeState={function (height) {
                dispatch(setHeight(height as number));
              }}
            />
            <ProfileCreationInput
              title="Weight (in kg)"
              placeholder="Enter your weight"
              type="number"
              value={weight}
              changeState={function (weight) {
                dispatch(setWeight(weight as number));
              }}
            />
            <ProfileCreationInput
              title="BMI"
              disabled={true}
              type="number"
              value={bmi.toFixed(2)}
            />
          </div>
        </div>
        <div className="flex flex-col">
          <p className="font-semibold text-sm pl-2">Contact Information</p>
          <div className="grid grid-flow-row grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 pt-2 pb-3">
            <ProfileCreationInput
              title="Address"
              placeholder="Enter your address"
              value={address}
              changeState={function (address) {
                dispatch(setAddress(address as string));
              }}
            />
            <ProfileCreationInput
              title="Phone number"
              placeholder="Enter your phone number"
              value={phoneNumber}
              changeState={function (phoneNumber) {
                dispatch(setPhoneNumber(phoneNumber as string));
              }}
            />
          </div>
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

export default UProfileCreationStage2;
