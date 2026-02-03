import { useSelector } from "react-redux";
import DNavbar from "../../components/doctor/DNavbar";
import DSidebar from "../../components/doctor/DSidebar";
import type { RootState } from "../../state/store";
import { Link } from "react-router";

function DHomePage() {
  document.title = "HealthHub Home";
  const { name, isNewUser, onboardingStep } = useSelector(
    (state: RootState) => state.userInfo,
  );

  function getGreeting() {
    const currTime = new Date().getHours();
    if (currTime < 12) {
      return "Good Morning";
    } else if (currTime < 18) {
      return "Good Afternoon";
    } else {
      return "Good Evening";
    }
  }

  return (
    <>
      <DNavbar />
      <div className="pt-[70px] h-screen">
        <div className="flex p-2 gap-2 h-full">
          <div className="w-full h-full flex flex-col gap-2">
            <div className="w-full h-[90px] bg-gray-400 rounded-xl p-2">
              <p className="text-xl font-bold">
                {getGreeting()}, {name}
              </p>
            </div>
            <div className="w-full h-full bg-gray-400 rounded-xl flex justify-center items-start pt-10">
              {isNewUser && (
                <div className=" bg-white border-1 border-gray-200 p-6 rounded-2xl flex flex-col gap-2 items-center justify-center py-15">
                  {onboardingStep === 0 && (
                    <p className="font-semibold text-xl lg:text-2xl">
                      Your professional profile is not set up yet.
                    </p>
                  )}
                  {onboardingStep > 0 && (
                    <p className="font-semibold text-xl lg:text-2xl">
                      Your onboarding is{" "}
                      {Math.floor((onboardingStep / 6) * 100)}% complete.
                    </p>
                  )}
                  <p className="text-center text-sm lg:text-base text-gray-500 max-w-[800px]">
                    Patients can only view verified and complete doctor
                    profiles. Complete onboarding to add your qualifications,
                    specialization, and practice details.
                  </p>
                  <Link
                    to="/doctor/onboarding"
                    className="bg-lightGreen/50 hover:bg-lightGreen/70 p-3 rounded-lg cursor-pointer border-1 border-slate-300 mt-4"
                  >
                    {onboardingStep === 0 && (
                      <p className="text-sm lg:text-base font-semibold">
                        Start Onboarding
                      </p>
                    )}
                    {onboardingStep > 0 && (
                      <p className="text-sm lg:text-base font-semibold">
                        Continue Onboarding
                      </p>
                    )}
                  </Link>
                </div>
              )}
            </div>
          </div>
          <DSidebar />
        </div>
      </div>
    </>
  );
}

export default DHomePage;
