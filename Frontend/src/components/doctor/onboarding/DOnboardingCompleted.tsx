import { Link } from "react-router";
import getIcon from "../../../helpers/getIcon";

interface DOnboardingCompletedProps {
  name: string;
}
function DOnboardingCompleted({ name }: DOnboardingCompletedProps) {
  return (
    <>
      <div className="p-6 bg-white border-1 flex flex-col gap-4 border-gray-200 rounded-2xl max-w-2xl px-14 py-10">
        <div className="flex flex-col gap-4 items-center justify-center">
          <div className="text-4xl p-4 rounded-full bg-lightGreen/30 text-darkGreen">
            {getIcon("tick")}
          </div>
          <h1 className="text-2xl font-bold">Profile Submitted Successfully</h1>
          <p className="text-gray-500 text-sm lg:text-base text-center">
            Thank you, Dr. {name}. Your credentials have been sent to our
            credentaiting team, Reviews typically take{" "}
            <span className="font-semibold">24-48 hours</span>. You will receive
            an email update regarding your verification status.
          </p>
        </div>
        <div className="flex flex-col  sm:flex-row gap-4 bg-lightGreen/10 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="p-3 text-darkGreen bg-lightGreen/30 rounded-full">
              {getIcon("calendar")}
            </div>
            <div>
              <p className="text-sm lg:text-base font-medium">
                Get a head start
              </p>
              <p className="text-gray-600 text-xs lg:text-sm">
                While you wait, you can start setting up your clinic hours and
                availability.
              </p>
            </div>
          </div>
          <Link
            to="/doctor/slots"
            className="flex gap-2 w-full sm:w-auto items-center justify-center bg-white hover:bg-gray-50 transition-colors duration-200 active:bg-gray-100 border-1 border-gray-300 px-4 py-2 rounded-md font-medium text-center text-sm"
          >
            Set up availability
          </Link>
        </div>
        <div className="flex flex-col items-center mt-2 gap-3">
          <Link
            className="bg-lightGreen/80 hover:bg-lightGreen/90 transition-colors duration-200 active:bg-lightGreen px-20 py-2.5 text-gray-50 hover:text-white text-lg rounded-md font-medium border-1 border-lightGreen"
            to="/doctor/home"
          >
            Go to Dashboard
          </Link>
          <Link
            to="/doctor/profile"
            className="text-gray-500 hover:text-gray-600 hover:underline"
          >
            Preview my profile
          </Link>
        </div>
      </div>
    </>
  );
}

export default DOnboardingCompleted;
