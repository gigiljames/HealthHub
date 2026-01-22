import { useEffect, useState } from "react";
import { getSpecializationList } from "../../../api/doctor/dProfileCreationService";

interface DOnboardingStep3Props {
  setStep: (step: number) => void;
}

function DOnboardingStep3({ setStep }: DOnboardingStep3Props) {
  const [specializationList, setSpecializationList] = useState<any[]>([]);

  useEffect(() => {
    getSpecializationList().then((response) => {
      if (response?.success) {
        setSpecializationList(response.specializations);
      }
    });
  }, []);
  return (
    <>
      <div className="p-6 bg-white border-1 flex flex-col gap-4 border-gray-200 rounded-2xl max-w-3xl">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">
            Tell patients a bit about yourself
          </h1>
          <p className="text-gray-500 text-sm lg:text-base">
            This information helps patients understand your expertise and find
            the right care.
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-1.5 w-full">
            <label htmlFor="specialization" className="font-medium">
              Specialization
            </label>
            <select
              name="specialization"
              id="specialization"
              className="h-[50px] p-2 border-1 border-gray-300 rounded-md"
            >
              <option value="">Select Specialization</option>
              {specializationList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <div></div>
          </div>
          <div className="flex flex-col md:flex-row md:gap-4 gap-2 w-full">
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="gender" className="font-medium">
                Gender
              </label>
              <select
                name="gender"
                id="gender"
                className="h-[50px] p-2 border-1 border-gray-300 rounded-md"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <div></div>
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="dob" className="font-medium">
                Date of birth
              </label>
              <input
                type="date"
                id="dob"
                className="h-[50px] p-2 border-1 border-gray-300 rounded-md"
              />
              <div></div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:gap-4 gap-2 w-full">
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="gender" className="font-medium">
                Phone number
              </label>
              <input
                type="number"
                id="gender"
                className="h-[50px] p-2 border-1 border-gray-300 rounded-md no-spinners"
              />
              <div></div>
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="dob" className="font-medium">
                Address
              </label>
              <input
                type="text"
                id="dob"
                className="h-[50px] p-2 border-1 border-gray-300 rounded-md"
              />
              <div></div>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 w-full">
            <label htmlFor="dob" className="font-medium">
              About Me
            </label>
            <textarea
              name=""
              id=""
              className="min-h-[150px] border-1 border-gray-300 rounded-md"
            ></textarea>
            <div></div>
            <p className="text-gray-500 text-sm lg:text-base mb-1">
              Briefly describe your medical background, specializations and
              philosophy of care.
            </p>
          </div>
        </div>
        <div className="h-[1px] bg-gray-200"></div>
        <div className="flex justify-between items-center mt-2">
          <p
            className="pl-2 text-gray-400 hover:text-gray-600 hover:underline font-base cursor-pointer"
            onClick={() => setStep(2)}
          >
            Back
          </p>
          <button
            className="bg-lightGreen/80 hover:bg-lightGreen/90 transition-colors duration-200 active:bg-lightGreen px-20 py-2.5 text-gray-50 hover:text-white text-lg rounded-md font-medium border-1 border-lightGreen"
            onClick={() => setStep(4)}
          >
            Save & Continue
          </button>
        </div>
      </div>
    </>
  );
}

export default DOnboardingStep3;
