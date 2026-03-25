import { useSelector } from "react-redux";
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
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800 transition-colors flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          {getGreeting()}, {name}
        </h1>
        <p className="text-gray-500 dark:text-slate-400">Here's what's happening today.</p>
      </div>
      
      <div className="w-full flex justify-center items-start">
        {isNewUser && (
          <div className="w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-10 rounded-3xl flex flex-col gap-4 items-center justify-center shadow-sm">
            {onboardingStep === 0 && (
              <p className="font-bold text-2xl text-gray-800 dark:text-white text-center">
                Your professional profile is not set up yet.
              </p>
            )}
            {onboardingStep > 0 && (
              <p className="font-bold text-2xl text-gray-800 dark:text-white text-center">
                Your onboarding is{" "}
                {Math.floor((onboardingStep / 6) * 100)}% complete.
              </p>
            )}
            <p className="text-center text-gray-500 dark:text-slate-400 max-w-[600px] leading-relaxed">
              Patients can only view verified and complete doctor
              profiles. Complete onboarding to add your qualifications,
              specialization, and practice details.
            </p>
            <Link
              to="/doctor/onboarding"
              className="bg-darkGreen hover:bg-darkGreen/90 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-md mt-4"
            >
              {onboardingStep === 0 ? "Start Onboarding" : "Continue Onboarding"}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default DHomePage;
