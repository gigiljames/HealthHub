import { useEffect, useState } from "react";
import ProfileCreationInput from "../common/ProfileCreationInput";
import LoadingCircle from "../common/LoadingCircle";

interface UProfileCreationStage2Props {
  changeStage: React.Dispatch<React.SetStateAction<number>>;
}

function UProfileCreationStage2({ changeStage }: UProfileCreationStage2Props) {
  const [height, setHeight] = useState(0);
  const [weight, setWeight] = useState(0);
  const [address, setAddress] = useState("");
  const [phno, setPhno] = useState("");
  const [bmi, setBmi] = useState(0);
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
  useEffect(() => {
    setBmi(weight / (height / 100) ** 2);
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
              setChange={setHeight}
            />
            <ProfileCreationInput
              title="Weight (in kg)"
              placeholder="Enter your weight"
              type="number"
              setChange={setWeight}
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
            />
            <ProfileCreationInput
              title="Phone number"
              placeholder="Enter your phone number"
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
