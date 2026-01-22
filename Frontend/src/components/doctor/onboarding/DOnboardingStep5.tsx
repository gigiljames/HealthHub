import getIcon from "../../../helpers/getIcon";

interface DOnboardingStep5Props {
  setStep: (step: number) => void;
}

function DOnboardingStep5({ setStep }: DOnboardingStep5Props) {
  return (
    <>
      <div className="flex flex-col gap-4 max-w-3xl">
        <div className="max-w-3xl flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Verify your profile</h1>
          <p className="text-gray-500">
            We need to verify your credentials before you can start accepting
            appointments. Your data is processed securely.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="bg-white border-dashed border-2 border-gray-200 flex flex-col gap-2 w-full p-3 justify-center items-center rounded-xl py-12">
            <div className="p-4 bg-gray-200 text-gray-500 rounded-full">
              {getIcon("id-card", "30px")}
            </div>
            <p className="font-medium">Medical License</p>
            <div className="flex flex-col justify-center items-center">
              <p className="text-gray-500 text-xs lg:text-sm">
                Drag & drop or browse
              </p>
              <p className="text-gray-500 text-xs lg:text-sm">
                PDF or Image (max. 5MB)
              </p>
            </div>
            <button className="p-2 text-gray-500 bg-gray-200 rounded-md text-xs lg:text-sm">
              Browse Files
            </button>
          </div>
          <div className="bg-white border-dashed border-2 border-gray-200 flex flex-col gap-2 w-full p-3 justify-center items-center rounded-xl py-12">
            <div className="p-4 bg-gray-200 text-gray-500 rounded-full">
              {getIcon("certificate", "30px")}
            </div>
            <p className="font-medium">Latest degree certificate</p>
            <div className="flex flex-col justify-center items-center">
              <p className="text-gray-500 text-xs lg:text-sm">
                Drag & drop or browse
              </p>
              <p className="text-gray-500 text-xs lg:text-sm">
                PDF or Image (max. 5MB)
              </p>
            </div>
            <button className="p-2 text-gray-500 bg-gray-200 rounded-md text-xs lg:text-sm">
              Browse Files
            </button>
          </div>
        </div>
        <div className="bg-lightGreen/30 p-3 rounded-xl flex gap-2">
          <div className="text-darkGreen p-1">{getIcon("lock", "20px")}</div>
          <div className="flex flex-col gap-1">
            <p className="font-medium text-sm lg:text-base">
              Secure Verification
            </p>
            <p className="text-xs lg:text-sm text-gray-500">
              Your documents are securely stored using industry-standard
              protocols. We only use this information to verify your medical
              credentials.
            </p>
          </div>
        </div>
        <div className="flex justify-between items-center mt-2">
          <p
            className="pl-2 text-gray-400 hover:text-gray-600 hover:underline font-base cursor-pointer"
            onClick={() => setStep(4)}
          >
            Back
          </p>
          <button
            className="bg-lightGreen/80 hover:bg-lightGreen/90 transition-colors duration-200 active:bg-lightGreen px-20 py-2.5 text-gray-50 hover:text-white text-lg rounded-md font-medium border-1 border-lightGreen"
            onClick={() => setStep(6)}
          >
            Save & Continue
          </button>
        </div>
      </div>
    </>
  );
}

export default DOnboardingStep5;
