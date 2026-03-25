import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import DProfileBasicInformation from "../../components/doctor/profile/DProfileBasicInformation";
import DProfileEducation from "../../components/doctor/profile/DProfileEducation";
import DProfileExperience from "../../components/doctor/profile/DProfileExperience";
import DProfileDocuments from "../../components/doctor/profile/DProfileDocuments";
import { Link } from "react-router";
import { getDoctor } from "../../api/admin/doctorService";
import toast from "react-hot-toast";
import {
  setActiveSubmissionId,
  setAddress,
  setBannerImageUrl,
  setCertificates,
  setDob,
  setEducation,
  setExperience,
  setGender,
  setName,
  setPhone,
  setProfileImageUrl,
  setSpecialization,
  setVerificationStatus,
  setVerificationSubmissions,
} from "../../state/doctor/dProfileCreationSlice";
import DProfileVerification from "../../components/doctor/profile/DProfileVerification";
import { uploadFileToS3 } from "../../api/s3Service";
import {
  getBannerImageAccessUrl,
  getBannerImageUploadSignedUrl,
  getProfileImageAccessUrl,
  getProfileImageUploadSignedUrl,
  updateBannerImage,
  updateProfileImage,
} from "../../api/doctor/dProfileCreationService";
import LoadingCircle from "../../components/common/LoadingCircle";
import getIcon from "../../helpers/getIcon";
import ChangePassword from "../../components/common/ChangePassword";

function DProfilePage() {
  const dispatch = useDispatch();
  const { name, isNewUser, id, onboardingStep, authType } = useSelector(
    (state: RootState) => state.userInfo,
  );
  const { verificationStatus, profileImageUrl, bannerImageUrl } = useSelector(
    (state: RootState) => state.dProfileCreation,
  );
  const [activeTab, setActiveTab] = useState(0);
  const [profileImageLoading, setProfileImageLoading] = useState(false);
  const [bannerImageLoading, setBannerImageLoading] = useState(false);

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

  if (authType === "LOCAL") {
    tabs.push("Change Password");
  }

  useEffect(() => {
    if (!isNewUser) {
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
            dispatch(
              setVerificationSubmissions(doctor.verificationSubmissions),
            );
          }
          if (doctor.activeSubmissionId) {
            dispatch(setActiveSubmissionId(doctor.activeSubmissionId));
          }
          if (doctor.profileImageUrl) {
            dispatch(setProfileImageUrl(doctor.profileImageUrl));
          }
          if (doctor.bannerImageUrl) {
            dispatch(setBannerImageUrl(doctor.bannerImageUrl));
          }
        })
        .catch(() => {
          toast.error("Failed to fetch data.");
        });
    }
  }, []);

  async function handleFile(file: File, type: "profile" | "banner") {
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB");
      return;
    }
    if (type === "profile") {
      setProfileImageLoading(true);
      const profileImageSignedUrlResponse =
        await getProfileImageUploadSignedUrl({
          doctorId: id,
          filename: file.name,
          contentType: file.type,
        });
      console.log(profileImageSignedUrlResponse);
      let profileImageKey = profileImageSignedUrlResponse.data.key;
      let profileImageSignedUrl = profileImageSignedUrlResponse.data.uploadUrl;
      const profileImageUploadResponse = await uploadFileToS3(
        profileImageSignedUrl,
        file,
        file.type,
      );
      console.log(profileImageUploadResponse);
      if (profileImageUploadResponse.success) {
        const updateProfileImageResponse = await updateProfileImage({
          userId: id,
          imageKey: profileImageKey,
          action: "SET",
        });
        console.log(updateProfileImageResponse);
        if (updateProfileImageResponse.success) {
          const profileImageAccessUrlResponse =
            await getProfileImageAccessUrl();
          dispatch(setProfileImageUrl(profileImageAccessUrlResponse.data));
          setProfileImageLoading(false);
          toast.success("Profile image updated successfully");
        }
      }
    } else if (type === "banner") {
      setBannerImageLoading(true);
      let bannerImageSignedUrlResponse = await getBannerImageUploadSignedUrl({
        doctorId: id,
        filename: file.name,
        contentType: file.type,
      });
      let bannerImageKey = bannerImageSignedUrlResponse.data.key;
      let bannerImageSignedUrl = bannerImageSignedUrlResponse.data.uploadUrl;
      const bannerImageUploadResponse = await uploadFileToS3(
        bannerImageSignedUrl,
        file,
        file.type,
      );
      if (bannerImageUploadResponse.success) {
        const updateBannerImageResponse = await updateBannerImage({
          userId: id,
          imageKey: bannerImageKey,
          action: "SET",
        });
        if (updateBannerImageResponse.success) {
          const bannerImageAccessUrlResponse = await getBannerImageAccessUrl();
          dispatch(setBannerImageUrl(bannerImageAccessUrlResponse.data));
          setBannerImageLoading(false);
          toast.success("Banner image updated successfully");
        }
      }
    }
  }

  async function handleRemoveBanner() {
    setBannerImageLoading(true);
    const removeBannerImageResponse = await updateBannerImage({
      userId: id,
      action: "REMOVE",
    });
    if (removeBannerImageResponse.success) {
      setBannerImageLoading(false);
      dispatch(setBannerImageUrl(""));
      toast.success("Banner image removed successfully");
    }
  }

  async function handleRemoveProfileImage() {
    setProfileImageLoading(true);
    const removeProfileImageResponse = await updateProfileImage({
      userId: id,
      action: "REMOVE",
    });
    if (removeProfileImageResponse.success) {
      setProfileImageLoading(false);
      dispatch(setProfileImageUrl(""));
      toast.success("Profile image removed successfully");
    }
  }

  return (
    <div className="flex justify-center w-full">
        <div className="w-[90%] lg:w-[80%] py-6">
          <div className="text-3xl font-bold ml-4 mb-6">Doctor Profile</div>
          {isNewUser ? (
            <div className="w-full bg-white border-1 border-gray-200 p-6 rounded-2xl flex flex-col gap-2 items-center justify-center py-15">
              {onboardingStep === 0 && (
                <p className="font-semibold text-xl lg:text-2xl">
                  Your professional profile is not set up yet.
                </p>
              )}
              {onboardingStep > 0 && (
                <p className="font-semibold text-xl lg:text-2xl">
                  Your onboarding is {Math.floor((onboardingStep / 6) * 100)}%
                  complete.
                </p>
              )}
              <p className="text-center text-sm lg:text-base text-gray-500 max-w-[800px]">
                Patients can only view verified and complete doctor profiles.
                Complete onboarding to add your qualifications, specialization,
                and practice details.
              </p>
              <Link
                to="/doctor/onboarding"
                className="bg-lightGreen/50 hover:bg-lightGreen/70 p-3 rounded-lg cursor-pointer border-1 border-slate-300 mt-4"
              >
                {onboardingStep === 0 && (
                  <p className="text-sm lg:text-base font-semibold text-center">
                    Start Onboarding
                  </p>
                )}
                {onboardingStep > 0 && (
                  <p className="text-sm lg:text-base font-semibold text-center">
                    Complete Onboarding
                  </p>
                )}
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
                    <div className="w-full relative h-fit mb-10 ">
                      {bannerImageLoading ? (
                        <div className="w-full h-56 bg-slate-200 rounded-xl flex flex-col items-center justify-center">
                          <div className="flex items-center justify-center pl-3">
                            <LoadingCircle />
                          </div>
                        </div>
                      ) : bannerImageUrl === "" ? (
                        <div className="w-full h-56 bg-slate-200 rounded-xl flex flex-col items-center justify-center">
                          <p className="text-gray-500">No Banner Image</p>
                          <label
                            className="font-medium text-sm text-darkGreen/80 hover:text-darkGreen hover:underline cursor-pointer"
                            htmlFor="bannerImage"
                          >
                            Add new
                          </label>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            id="bannerImage"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFile(file, "banner");
                            }}
                          />
                        </div>
                      ) : (
                        <div className="relative">
                          <img
                            className="w-full h-56 object-cover bg-slate-200 rounded-xl"
                            src={bannerImageUrl}
                            alt=""
                          />
                          <div className="absolute top-2 right-2 bg-white p-1 rounded-lg flex gap-1 items-center">
                            <div className="hover:bg-gray-200 rounded-md p-1.5">
                              <label
                                className="font-medium text-xl text-darkGreen/80 hover:text-darkGreen hover:underline cursor-pointer"
                                htmlFor="bannerImage"
                              >
                                {getIcon("edit")}
                              </label>
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                id="bannerImage"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFile(file, "banner");
                                }}
                              />
                            </div>
                            <button
                              className="font-medium text-xl text-darkGreen/80 hover:text-red-400 hover:underline cursor-pointer p-1.5 hover:bg-gray-200 rounded-md"
                              onClick={handleRemoveBanner}
                            >
                              {getIcon("trash")}
                            </button>
                          </div>
                        </div>
                      )}
                      {profileImageLoading ? (
                        <div className="w-44 h-44 bg-slate-300 rounded-full flex flex-col items-center justify-center absolute -bottom-12 left-8">
                          <div className="flex items-center justify-center pl-3">
                            <LoadingCircle />
                          </div>
                        </div>
                      ) : profileImageUrl === "" ? (
                        <div className="w-44 h-44 bg-slate-300 rounded-full flex flex-col items-center justify-center absolute -bottom-12 left-8 border-4 border-gray-100">
                          <p className="text-gray-500">No Profile Image</p>
                          <label
                            className="font-medium text-sm text-darkGreen/80 hover:text-darkGreen hover:underline cursor-pointer"
                            htmlFor="profileImage"
                          >
                            Add new
                          </label>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            id="profileImage"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFile(file, "profile");
                            }}
                          />
                        </div>
                      ) : (
                        <div className="absolute -bottom-14 left-8">
                          <img
                            className="w-42 h-42 object-cover bg-slate-300 rounded-full border-4 border-gray-100 "
                            src={profileImageUrl}
                            alt=""
                          />
                          <div className="absolute top-2 -right-2 bg-white p-1 rounded-lg flex gap-1 items-center shadow-sm">
                            <div className="hover:bg-gray-200 rounded-md p-1.5">
                              <label
                                className="font-medium text-xl text-darkGreen/80 hover:text-darkGreen hover:underline cursor-pointer"
                                htmlFor="profileImage"
                              >
                                {getIcon("edit")}
                              </label>
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                id="profileImage"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFile(file, "profile");
                                }}
                              />
                            </div>
                            <button
                              className="font-medium text-xl text-darkGreen/80 hover:text-red-400 hover:underline cursor-pointer p-1.5 hover:bg-gray-200 rounded-md"
                              onClick={handleRemoveProfileImage}
                            >
                              {getIcon("trash")}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
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
                {authType === "LOCAL" && activeTab === 6 && <ChangePassword />}
              </div>
            </div>
          )}
        </div>
    </div>
  );
}

export default DProfilePage;
