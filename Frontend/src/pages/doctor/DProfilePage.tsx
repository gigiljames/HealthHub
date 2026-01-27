import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import DProfileBasicInformation from "../../components/doctor/profile/DProfileBasicInformation";
import DProfileEducation from "../../components/doctor/profile/DProfileEducation";
import DProfileExperience from "../../components/doctor/profile/DProfileExperience";
import DProfileDocuments from "../../components/doctor/profile/DProfileDocuments";
import DNavbar from "../../components/doctor/DNavbar";
import { Link } from "react-router";
import { getDoctor } from "../../api/admin/doctorService";
import toast from "react-hot-toast";
import {
  setActiveSubmissionId,
  setAddress,
  setCertificates,
  setDob,
  setEducation,
  setExperience,
  setGender,
  setName,
  setPhone,
  setSpecialization,
  setVerificationStatus,
  setVerificationSubmissions,
} from "../../state/doctor/dProfileCreationSlice";
import DProfileVerification from "../../components/doctor/profile/DProfileVerification";

function DProfilePage() {
  const dispatch = useDispatch();
  const { name, isNewUser, id } = useSelector(
    (state: RootState) => state.userInfo,
  );
  const { verificationStatus } = useSelector(
    (state: RootState) => state.dProfileCreation,
  );
  const [activeTab, setActiveTab] = useState(0);

  if (name) {
    document.title = name + " | HealthHub";
  } else {
    document.title = "Doctor Profile";
  }

  const tabs = [
    "Overview",
    "Basic Information",
    "Education",
    "Experience",
    "Documents",
    "Verification",
  ];

  useEffect(() => {
    getDoctor(id)
      .then((res) => {
        const doctor = res.doctor;
        console.log(doctor);
        if (doctor.name) dispatch(setName(doctor.name));
        if (doctor.dob) dispatch(setDob(doctor.dob));
        if (doctor.gender) dispatch(setGender(doctor.gender));
        if (doctor.phone) dispatch(setPhone(doctor.phone));
        if (doctor.address) dispatch(setAddress(doctor.address));
        if (doctor.specialization)
          dispatch(setSpecialization(doctor.specialization));
        const mappedEducation = doctor.education.map((edu: any) => ({
          ...edu,
          id: edu._id || edu.id || Date.now().toString() + Math.random(),
        }));
        dispatch(setEducation(mappedEducation));
        const mappedExperience = doctor.experience.map((exp: any) => ({
          ...exp,
          id: exp._id || exp.id || Date.now().toString() + Math.random(),
        }));
        dispatch(setExperience(mappedExperience));
        if (doctor.certificates) {
          dispatch(setCertificates(doctor.certificates));
        }
        if (doctor.verificationStatus) {
          dispatch(setVerificationStatus(doctor.verificationStatus));
        }
        if (doctor.verificationSubmissions) {
          dispatch(setVerificationSubmissions(doctor.verificationSubmissions));
        }
        if (doctor.activeSubmissionId) {
          dispatch(setActiveSubmissionId(doctor.activeSubmissionId));
        }
      })
      .catch((err) => {
        toast.error("Failed to fetch data.");
      });
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      <DNavbar />
      <div className="flex justify-center w-full pt-[70px]">
        <div className="w-[90%] lg:w-[80%] py-6">
          <div className="text-3xl font-bold ml-4 mb-6">Doctor Profile</div>
          {isNewUser ? (
            <div className="w-full bg-white border-1 border-gray-200 p-6 rounded-2xl flex flex-col gap-2 items-center justify-center py-15">
              <p className="font-semibold text-xl lg:text-2xl text-center">
                Your professional profile is not set up yet.
              </p>
              <p className="text-center text-sm lg:text-base text-gray-500 max-w-[800px]">
                Patients can only view verified and complete doctor profiles.
                Complete onboarding to add your qualifications, specialization,
                and practice details.
              </p>
              <Link
                to="/doctor/onboarding"
                className="bg-lightGreen/50 hover:bg-lightGreen/70 p-3 rounded-lg cursor-pointer border-1 border-slate-300 mt-4"
              >
                <p className="text-sm lg:text-base font-semibold">
                  Start Onboarding
                </p>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row w-full gap-6">
              <div className="lg:w-1/4">
                <ul className="p-5 bg-white border-1 border-gray-200 rounded-2xl font-semibold sticky top-24">
                  {tabs.map((tab, index) => (
                    <li
                      key={index}
                      className={`mb-2 p-3 px-4 rounded-md cursor-pointer transition-all duration-200 ${
                        activeTab === index
                          ? "bg-lightGreen"
                          : "bg-white hover:bg-gray-100"
                      }`}
                      onClick={() => setActiveTab(index)}
                    >
                      {tab}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex-1 pb-10">
                {activeTab === 0 && (
                  <div className="flex flex-col gap-6">
                    {verificationStatus === "rejected" && (
                      <div className="bg-red-100 border-1 border-red-200 p-6 rounded-2xl flex gap-2 justify-between items-center">
                        <div>
                          <p className="font-semibold text-base lg:text-lg">
                            Your profile has been rejected.
                          </p>
                          <p className="text-xs lg:text-sm text-gray-500 max-w-[800px]">
                            Please update your profile and submit it again.
                          </p>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-2">
                          <button
                            className="bg-white hover:bg-gray-100 active:bg-gray-200 p-3 rounded-lg cursor-pointer border-1 border-gray-300 transition-all duration-200"
                            onClick={() => setActiveTab(5)}
                          >
                            <p className="text-sm lg:text-base font-semibold">
                              View Details
                            </p>
                          </button>
                        </div>
                      </div>
                    )}
                    <DProfileBasicInformation />
                    <DProfileEducation />
                    <DProfileExperience />
                    <DProfileDocuments />
                    <DProfileVerification />
                  </div>
                )}
                {activeTab === 1 && <DProfileBasicInformation />}
                {activeTab === 2 && <DProfileEducation />}
                {activeTab === 3 && <DProfileExperience />}
                {activeTab === 4 && <DProfileDocuments />}
                {activeTab === 5 && <DProfileVerification />}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DProfilePage;
