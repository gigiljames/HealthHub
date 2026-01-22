import getIcon from "../../../helpers/getIcon";

interface DOnboardingStep2BProps {
  setStep: (step: number) => void;
}
function DOnboardingStep2B({ setStep }: DOnboardingStep2BProps) {
  const locations = [
    {
      name: "Online",
      type: "ONLINE",
      location: "Online",
      consultationFee: 500,
    },
    {
      name: "P S Mission Hospital",
      type: "HOSPITAL",
      location: "P S Mission Hospital, Maradu, Kochi",
      consultationFee: 1000,
    },
  ];
  return (
    <>
      <div className="max-w-3xl flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Where do you see patients?</h1>
          <p className="text-gray-500">
            Add the physical locations where patients can visit you for
            consultations or procedures.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold">My Locations (1)</h3>
          <div className="flex flex-col gap-2 mb-4">
            {locations.map((location) => (
              <div
                key={location.name}
                className="border-1 border-gray-300 bg-white rounded-lg p-4 flex flex-col gap-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-lg">{location.name}</p>
                    <div className="p-1 border-1 rounded-md border-darkGreen/70 bg-lightGreen/60 text-darkGreen/70 w-fit text-xs lg:text-sm font-semibold">
                      {location.type}
                    </div>
                  </div>
                  <div className="text-gray-400 hover:text-red-400 hover:underline hover:bg-red-100 p-1.5 rounded-md cursor-pointer">
                    {getIcon("trash", "18px")}
                  </div>
                </div>
                <p className="text-sm lg:text-base text-gray-700">
                  Consultation fee: ₹{location.consultationFee}
                </p>
                <p className="text-sm lg:text-base text-gray-700">
                  Location: {location.location}
                </p>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2 items-center justify-center border-dashed border-2 border-gray-300 p-7 px-10 rounded-xl">
            <div className="bg-gray-200 p-3 rounded-full text-gray-500">
              {getIcon("add-location", "40px")}
            </div>
            <p className="font-semibold">Add another practice location</p>
            <p className="text-center text-gray-500 text-sm lg:text-base">
              Include hospitals, private clinics, or any other physical location
              where patients can visit you.
            </p>
            <button className="flex gap-2 items-center justify-center bg-white hover:bg-gray-50 transition-colors duration-200 active:bg-gray-100 border-1 border-gray-300 px-4 py-2 rounded-md max-w-[300px] font-medium">
              + Add practice location
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center mt-2">
          <p
            className="pl-2 text-gray-400 hover:text-gray-600 hover:underline font-base cursor-pointer"
            onClick={() => setStep(1)}
          >
            Back
          </p>
          <button
            className="bg-lightGreen/80 hover:bg-lightGreen/90 transition-colors duration-200 active:bg-lightGreen px-20 py-2.5 text-gray-50 hover:text-white text-lg rounded-md font-medium border-1 border-lightGreen"
            onClick={() => setStep(3)}
          >
            Save & Continue
          </button>
        </div>
      </div>
    </>
  );
}

export default DOnboardingStep2B;
