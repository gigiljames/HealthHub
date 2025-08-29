import ProfileCreationInput from "../common/ProfileCreationInput";
import {
  maritalStatusOptions,
  genderOptions,
  bloodGroupOptions,
} from "../../constants/inputOptions";
import { useRef, useState } from "react";
import LoadingCircle from "../common/LoadingCircle";
import getIcon from "../../helpers/getIcon";

interface UProfileCreationStage1Props {
  changeStage: React.Dispatch<React.SetStateAction<number>>;
}

function UProfileCreationStage1({ changeStage }: UProfileCreationStage1Props) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const allergyRef = useRef<HTMLInputElement>(null);
  const [allergies, setAllergies] = useState<string[]>([]);
  function handleAddAllergy() {
    if (allergyRef.current) {
      const allergy = allergyRef.current.value;
      if (allergy) {
        setAllergies([...allergies, allergy]);
      }
      allergyRef.current.value = "";
    }
  }
  function handleRemoveAllergy(index: number) {
    const temp = allergies;
    temp.splice(index, 1);
    setAllergies([...temp]);
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
      <div className="  mt-5 overflow-auto h-full">
        <div className="grid grid-flow-row grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pb-3">
          <ProfileCreationInput
            title="Name"
            placeholder="Enter your name"
            type="text"
            setChange={setName}
          />
          <ProfileCreationInput
            title="Registered email"
            disabled={true}
            value="example@gmail.com"
            type="text"
          />
          <ProfileCreationInput
            title="Marital status"
            select={true}
            options={maritalStatusOptions}
            placeholder="Select marital status"
          />
          <ProfileCreationInput
            title="Gender"
            select={true}
            options={genderOptions}
            placeholder="Select your gender"
          />
          <ProfileCreationInput title="Date of birth" type="date" />
          <ProfileCreationInput
            title="Blood group"
            select={true}
            options={bloodGroupOptions}
          />
          <div className="flex flex-col gap-1">
            <p className="text-[#717171] text-[12px] md:text-sm font-semibold pl-2">
              Allergies
            </p>
            <div className="flex flex-col relative w-full mb-1.5 items-center justify-center">
              <input
                className={`no-spinners border-1 border-inputBorder p-3 pr-18 rounded-lg peer text-sm md:text-[16px] w-full md:min-w-[200px] lg:min-w-[400px] bg-white   h-[50px]`}
                ref={allergyRef}
                // onChange={(e) => setChange(e.target.value)}
                placeholder="Enter allergy"
              />
              <button
                className="absolute right-5 font-semibold text-blue-400 cursor-pointer"
                onClick={handleAddAllergy}
              >
                ADD
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {allergies.map((val, index) => {
                return (
                  <div
                    className="bg-blue-300 p-1 pl-2 rounded-md flex justify-between items-center"
                    key={index}
                  >
                    <span className="font-medium break-all">{val}</span>
                    <span
                      className="p-0.5 hover:bg-white hover:scale-105 active:scale-95 rounded-sm h-fit"
                      onClick={() => handleRemoveAllergy(index)}
                    >
                      {getIcon("close", "20px", "black")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <ProfileCreationInput
            title="Occupation"
            placeholder="Enter your occupation"
          />
        </div>
      </div>
      <div className="flex gap-2 lg:gap-4 justify-end">
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

export default UProfileCreationStage1;
