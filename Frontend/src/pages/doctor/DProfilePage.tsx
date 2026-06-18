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
  setAbout,
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
import { motion } from "framer-motion";
import Avatar from "../../components/common/Avatar";
import BannerImage from "../../components/common/BannerImage";

function DProfilePage() {
  const dispatch = useDispatch();
  const { name, isNewUser, id, onboardingStep, authType } = useSelector(
    (state: RootState) => state.userInfo,
  );
  const { verificationStatus, profileImageUrl, bannerImageUrl } = useSelector(
    (state: RootState) => state.dProfileCreation,
  );
  const [profileImageLoading, setProfileImageLoading] = useState(false);
  const [bannerImageLoading, setBannerImageLoading] = useState(false);

  if (name) {
    document.title = name + " | HealthHub";
  } else {
    document.title = "Doctor Profile";
  }

  useEffect(() => {
    if (!isNewUser) {
      getDoctor(id)
        .then((res) => {
          const doctor = res.doctor;
          if (doctor.name) dispatch(setName(doctor.name));
          if (doctor.dob) dispatch(setDob(doctor.dob));
          if (doctor.gender) dispatch(setGender(doctor.gender));
          if (doctor.phone) dispatch(setPhone(doctor.phone));
          if (doctor.address) dispatch(setAddress(doctor.address));
          if (doctor.specialization)
            dispatch(setSpecialization(doctor.specialization));
          if (doctor.about) dispatch(setAbout(doctor.about));
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
      let profileImageKey = profileImageSignedUrlResponse.data.key;
      let profileImageSignedUrl = profileImageSignedUrlResponse.data.uploadUrl;
      const profileImageUploadResponse = await uploadFileToS3(
        profileImageSignedUrl,
        file,
        file.type,
      );
      if (profileImageUploadResponse.success) {
        const updateProfileImageResponse = await updateProfileImage({
          userId: id,
          imageKey: profileImageKey,
          action: "SET",
        });
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex justify-center w-full bg-gray-50 dark:bg-slate-950 min-h-screen pb-12"
    >
      <div className="w-[96%] lg:w-[90%] max-w-5xl pb-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 px-2">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Medical Profile
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1 text-base">
              Manage your credentials, experience, and public presence.
            </p>
          </div>
          <div className="flex items-center">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm border ${
                verificationStatus === "verified"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50"
                  : verificationStatus === "rejected"
                    ? "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50"
                    : "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50"
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  verificationStatus === "verified"
                    ? "bg-emerald-500"
                    : verificationStatus === "rejected"
                      ? "bg-red-500"
                      : "bg-amber-500"
                }`}
              />
              {verificationStatus}
            </div>
          </div>
        </div>

        {isNewUser ? (
          <motion.div
            variants={itemVariants}
            className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-12 rounded-[2.5rem] flex flex-col gap-6 items-center justify-center text-center shadow-2xl shadow-slate-200/50 dark:shadow-black/40"
          >
            <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-full text-darkGreen dark:text-lightGreen shadow-inner">
              {getIcon("profile", "64px")}
            </div>
            <div className="max-w-lg">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
                {onboardingStep === 0
                  ? "Complete Your Profile"
                  : `Onboarding Progress: ${Math.floor((onboardingStep / 6) * 100)}%`}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
                Your profile is your digital identity on HealthHub. Complete
                your onboarding to start accepting appointments and reaching
                more patients.
              </p>
            </div>
            <Link
              to="/doctor/onboarding"
              className="bg-darkGreen dark:bg-emerald-600 hover:opacity-90 text-white px-10 py-4 rounded-2xl font-black text-base transition-all active:scale-95 shadow-lg shadow-darkGreen/30 flex items-center gap-2"
            >
              {onboardingStep === 0
                ? "Start Onboarding"
                : "Continue Onboarding"}
              {getIcon("right", "20px")}
            </Link>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-8">
            {/* Banner & Profile Image Section */}
            <motion.div variants={itemVariants} className="relative">
              <div className="group relative w-full h-[220px] bg-slate-200 dark:bg-slate-800 rounded-[2rem] overflow-hidden shadow-xl">
                {bannerImageLoading ? (
                  <div className="w-full h-full flex items-center justify-center relative z-10 bg-slate-200/50 dark:bg-slate-800/50">
                    <LoadingCircle />
                  </div>
                ) : (
                  <BannerImage
                    className="w-full h-full object-cover absolute inset-0"
                    src={bannerImageUrl}
                    alt="Banner"
                  />
                )}

                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0 text-slate-900 dark:text-white">
                  <label
                    htmlFor="bannerImage"
                    className="p-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-xl cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2 font-bold text-[10px] uppercase tracking-wider"
                  >
                    {getIcon("edit", "14px")} Edit
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
                  </label>
                  {bannerImageUrl && (
                    <button
                      onClick={handleRemoveBanner}
                      className="p-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-xl hover:text-red-500 transition-all shadow-lg"
                    >
                      {getIcon("trash", "14px")}
                    </button>
                  )}
                </div>
              </div>

              {/* Profile Image */}
              <div className="absolute -bottom-12 left-8 flex items-end gap-6">
                <div className="relative group/profile">
                  <div className="w-32 h-32 rounded-[2rem] border-[6px] border-gray-50 dark:border-slate-950 bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-xl relative">
                    {profileImageLoading ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <LoadingCircle />
                      </div>
                    ) : (
                      <Avatar
                        className="w-full h-full object-cover"
                        src={profileImageUrl}
                        alt="Profile"
                      />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-[2rem] opacity-0 group-hover/profile:opacity-100 transition-all duration-300 flex items-center justify-center gap-2">
                    <label
                      htmlFor="profileImage"
                      className="p-2 bg-white rounded-lg cursor-pointer hover:bg-gray-100 shadow-xl transition-transform hover:scale-110"
                    >
                      {getIcon("edit", "16px")}
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
                    </label>
                    {profileImageUrl && (
                      <button
                        onClick={handleRemoveProfileImage}
                        className="p-2 bg-white rounded-lg hover:text-red-500 shadow-xl transition-transform hover:scale-110"
                      >
                        {getIcon("trash", "16px")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Main Content Stack */}
            <div className="mt-12 space-y-6">
              {verificationStatus === "rejected" && (
                <motion.div
                  variants={itemVariants}
                  className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-4 rounded-2xl flex items-center gap-4 shadow-sm"
                >
                  <div className="p-2.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl">
                    {getIcon("error", "24px")}
                  </div>
                  <div>
                    <h3 className="font-bold text-red-950 dark:text-red-400 text-sm tracking-tight">
                      Action Required: Profile Rejected
                    </h3>
                    <p className="text-red-800 dark:text-red-500/80 font-medium text-xs">
                      Please review feedback in the verification history and
                      update your information.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Sections with unique IDs for potential anchor linking */}
              <section id="basic-information" className="scroll-mt-20">
                <DProfileBasicInformation />
              </section>

              <section id="education-details" className="scroll-mt-20">
                <DProfileEducation />
              </section>

              <section id="experience-history" className="scroll-mt-20">
                <DProfileExperience />
              </section>

              <section id="required-documents" className="scroll-mt-20">
                <DProfileDocuments />
              </section>

              <section id="verification-status" className="scroll-mt-20">
                <DProfileVerification />
              </section>

            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default DProfilePage;
